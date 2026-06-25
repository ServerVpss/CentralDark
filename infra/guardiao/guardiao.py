"""
Guardião da Consciência — daemon de integridade de docs/CONSCIENCIA/.

Modo inicial: 'propor' (NUNCA move arquivos automaticamente).
Trava de segurança: modo 'auto' fisicamente bloqueado até 08/07/2026.
"""
import hashlib
import logging
import os
import time
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler
from pathlib import Path
from threading import Lock, Thread

import yaml
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from classificador import classificar
from detectores.docker_watcher import loop_docker
from detectores.pm2_watcher import loop_pm2
from fila.event_queue import publicar
from heartbeat import enviar_heartbeat, registrar_evento_painel
from notifier import notificar_telegram

# ─── Constantes travadas ──────────────────────────────────────────
RAIZ = Path("/root/CentralDark")
WATCH_DIR = RAIZ / "docs" / "CONSCIENCIA"
REGRAS = Path(__file__).parent / "guardiao_rules.yaml"
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Trava de segurança: modo 'auto' proibido até esta data (10 dias a partir de 25/06/2026)
DATA_LIBERACAO_AUTO = datetime(2026, 7, 8, tzinfo=timezone.utc)
MODO_SOLICITADO = os.environ.get("GUARDIAO_MODO", "propor").lower()


# ─── Logging estruturado com rotação ──────────────────────────────
def configurar_logs(nivel: str = "INFO") -> None:
    """50MB máximo de logs (10MB × 5 arquivos rotativos)."""
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    fh = RotatingFileHandler(
        LOG_DIR / "guardiao.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    fh.setFormatter(formatter)
    sh = logging.StreamHandler()
    sh.setFormatter(formatter)
    root = logging.getLogger("guardiao")
    root.setLevel(getattr(logging, nivel.upper(), logging.INFO))
    root.addHandler(fh)
    root.addHandler(sh)
    root.propagate = False


configurar_logs(os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("guardiao.core")


# ─── Resolve modo com trava de segurança ──────────────────────────
def resolver_modo() -> str:
    agora = datetime.now(timezone.utc)
    if MODO_SOLICITADO == "auto" and agora < DATA_LIBERACAO_AUTO:
        log.warning(
            "Tentativa de iniciar em modo='auto' BLOQUEADA. "
            "Liberação só após %s. Forçando modo='propor'.",
            DATA_LIBERACAO_AUTO.isoformat(),
        )
        return "propor"
    if MODO_SOLICITADO == "auto":
        log.error(
            "Modo 'auto' solicitado mas NÃO está implementado nesta versão. "
            "Aguardando aprovação humana explícita. Forçando modo='propor'."
        )
        return "propor"
    return "propor"


MODO = resolver_modo()

# ─── Carrega regras ───────────────────────────────────────────────
with open(REGRAS, encoding="utf-8") as f:
    RULES = yaml.safe_load(f)

# ─── Estado (fila de debounce + hashes) ───────────────────────────
fila: dict[str, float] = {}
hashes: dict[str, str] = {}
lock = Lock()
DEBOUNCE_S = 0.2


def sha1(path: Path) -> str | None:
    try:
        h = hashlib.sha1()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except (OSError, PermissionError):
        return None


# ─── Avaliação central ────────────────────────────────────────────
def avaliar(path: Path) -> None:
    if not path.exists() or not path.is_file():
        return
    try:
        rel = path.relative_to(RAIZ)
    except ValueError:
        return
    log.debug("Avaliando: %s", rel)

    veredito = classificar(str(rel), RULES)
    if veredito is None:
        return

    destino_rel = f"{veredito['pasta_correta']}/{path.name}"
    confianca = veredito["confianca"]

    # MODO == 'propor' (único modo permitido nesta versão)
    log.info(
        "PROPOSTA: %s → %s (confiança=%.0f%%, motivo=%s)",
        rel, destino_rel, confianca * 100, veredito["motivo"],
    )
    # publica na fila — Analista decide quando/como notificar
    publicar(
        source="consciencia",
        severity="aviso",
        key=f"consciencia.proposta.{path.name}",
        title="Guardião propõe mover arquivo",
        body=(
            f"📄 `{rel}`\n"
            f"➡️ Sugestão: `{destino_rel}`\n"
            f"🎯 Confiança: {confianca:.0%}\n"
            f"💡 Motivo: {veredito['motivo']}"
        ),
        dedup_window_s=600,
        payload={"arquivo": str(rel), "destino": destino_rel, "confianca": confianca},
    )
    registrar_evento_painel("proposta", str(rel), destino_rel)


# ─── Loops em thread ──────────────────────────────────────────────
def loop_debounce() -> None:
    while True:
        time.sleep(0.1)
        agora = time.time()
        with lock:
            prontos = [p for p, t in fila.items() if agora - t >= DEBOUNCE_S]
            for p in prontos:
                fila.pop(p, None)
        for p in prontos:
            try:
                avaliar(Path(p))
            except Exception:
                log.exception("Erro ao avaliar %s", p)


def loop_reconciliacao() -> None:
    """Scan completo a cada 5 min — pega o que o inotify perdeu."""
    while True:
        time.sleep(300)
        log.info("Reconciliação periódica iniciada")
        total = 0
        for p in WATCH_DIR.rglob("*.md"):
            h = sha1(p)
            if h and hashes.get(str(p)) != h:
                hashes[str(p)] = h
                try:
                    avaliar(p)
                    total += 1
                except Exception:
                    log.exception("Erro na reconciliação de %s", p)
        log.info("Reconciliação concluída: %d arquivos reavaliados", total)


def loop_heartbeat() -> None:
    while True:
        try:
            enviar_heartbeat(modo=MODO, arquivos=len(hashes))
        except Exception:
            log.exception("Falha no heartbeat")
        time.sleep(60)


# ─── Handler do inotify ───────────────────────────────────────────
class Handler(FileSystemEventHandler):
    def on_any_event(self, event):
        if event.is_directory or not event.src_path.endswith(".md"):
            return
        with lock:
            fila[event.src_path] = time.time()


# ─── Main ─────────────────────────────────────────────────────────
def main() -> None:
    log.info("=" * 70)
    log.info("🛡️  GUARDIÃO DA CONSCIÊNCIA — iniciando")
    log.info("=" * 70)
    log.info("Modo ativo            : %s (lógica 'auto' desativada nesta versão)", MODO)
    log.info("Pasta vigiada         : %s", WATCH_DIR.resolve())
    log.info("Arquivo de regras     : %s", REGRAS.resolve())
    log.info("Diretório de logs     : %s (rotação 10MB × 5)", LOG_DIR.resolve())
    log.info("Liberação modo 'auto' : %s (bloqueado até lá)", DATA_LIBERACAO_AUTO.isoformat())
    log.info("=" * 70)

    # Indexa hashes iniciais
    for p in WATCH_DIR.rglob("*.md"):
        h = sha1(p)
        if h:
            hashes[str(p)] = h
    log.info("Index inicial concluído: %d arquivos .md catalogados", len(hashes))

    obs = Observer()
    obs.schedule(Handler(), str(WATCH_DIR), recursive=True)
    obs.start()
    log.info("Observador inotify ativo em %s", WATCH_DIR)

    Thread(target=loop_debounce, daemon=True, name="debounce").start()
    Thread(target=loop_reconciliacao, daemon=True, name="reconciliacao").start()
    Thread(target=loop_heartbeat, daemon=True, name="heartbeat").start()
    log.info("3 threads de background iniciadas: debounce, reconciliacao, heartbeat")

    # whitelists pra detectores
    ignorar = RULES.get("ignorar", {}) or {}
    wl_pm2 = ignorar.get("pm2", []) or []
    wl_docker = ignorar.get("docker", []) or []
    Thread(target=loop_pm2, args=(wl_pm2,), daemon=True, name="pm2-watcher").start()
    Thread(target=loop_docker, args=(wl_docker,), daemon=True, name="docker-watcher").start()
    log.info("Detectores PM2/Docker iniciados (whitelist pm2=%s, docker=%s)", wl_pm2, wl_docker)

    # notificação de boot — direto, pra confirmar que o caminho funciona
    notificar_telegram(
        tipo="sistema",
        titulo="🛡️ Guardião da Consciência online",
        mensagem=(
            f"Modo: *{MODO}*\n"
            f"Vigiando: {len(hashes)} arquivos em `docs/CONSCIENCIA/`\n"
            f"Modo `auto` travado até: {DATA_LIBERACAO_AUTO.strftime('%d/%m/%Y')}"
        ),
    )

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        log.info("Sinal de encerramento recebido. Parando observador...")
        obs.stop()
        obs.join()
        log.info("Guardião encerrado com sucesso")


if __name__ == "__main__":
    main()
