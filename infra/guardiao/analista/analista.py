"""
Analista — sub-agente do Guardião.

Loop:
  1. Lê eventos novos da fila (tail).
  2. Deduplica/agrupa.
  3. Empilha na fila de prioridade.
  4. Despacha respeitando rate-limit + jitter.
  5. Periodicamente emite resumos de agregação.

Roda como processo PM2 separado: `guardiao-analista`.
"""
import logging
import os
import sys
import time
from logging.handlers import RotatingFileHandler
from pathlib import Path
from threading import Thread

# permite imports `fila.*`, `detectores.*`, `analista.*` etc.
BASE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE))

import yaml  # noqa: E402

from analista.dedup import Dedup  # noqa: E402
from analista.decisor import decidir  # noqa: E402
from analista.formatter import formatar  # noqa: E402
from analista.priority_queue import FilaPrioridade  # noqa: E402
from analista.rate_limiter import RateLimiter  # noqa: E402
from notifier import notificar_telegram  # noqa: E402
from fila.event_queue import tail  # noqa: E402

LOG_DIR = BASE / "logs"
LOG_DIR.mkdir(exist_ok=True)


def configurar_logs(nivel: str = "INFO") -> None:
    fmt = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    fh = RotatingFileHandler(
        LOG_DIR / "analista.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    fh.setFormatter(fmt)
    sh = logging.StreamHandler()
    sh.setFormatter(fmt)
    for nome in ("analista", "guardiao.notifier"):
        lg = logging.getLogger(nome)
        lg.setLevel(getattr(logging, nivel.upper(), logging.INFO))
        lg.addHandler(fh)
        lg.addHandler(sh)
        lg.propagate = False


configurar_logs(os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("analista.core")


pq = FilaPrioridade()
dedup = Dedup()
limiter = RateLimiter()

# ─── Camada de decisão ────────────────────────────────────────────
# Flag de reversão: DECISOR_ENABLED=false volta ao comportamento antigo.
DECISOR_ENABLED = os.environ.get("DECISOR_ENABLED", "true").lower() != "false"
try:
    with open(BASE / "guardiao_rules.yaml", encoding="utf-8") as _f:
        REGRAS_DECISOR = (yaml.safe_load(_f) or {}).get("decisor", {})
except OSError:
    REGRAS_DECISOR = {}


def consumir_da_fila():
    """Lê eventos publicados pelo Guardião e empilha (após dedup)."""
    for evento in tail(intervalo_s=1.0):
        if dedup.deve_passar(evento):
            pq.push(evento)
            log.info(
                "Aceito: [%s/%s] %s (fila=%d)",
                evento.get("source"), evento.get("severity"),
                evento.get("key"), len(pq),
            )
        else:
            log.debug("Absorvido (dedup): %s", evento.get("key"))


def coletar_resumos():
    """A cada 30s, gera resumos de janelas expiradas e empilha."""
    while True:
        time.sleep(30)
        try:
            for resumo in dedup.coletar_resumos():
                pq.push(resumo)
                log.info("Resumo agregado empilhado: %s", resumo.get("key"))
        except Exception:
            log.exception("Erro coletando resumos")


def despachar():
    """Tira da fila de prioridade respeitando rate-limit."""
    while True:
        evento = pq.pop()
        if evento is None:
            time.sleep(0.5)
            continue
        try:
            chave = evento.get("key", "")
            critico = evento.get("severity") == "critico"

            # Camada de decisão: filtra proposta de baixa qualidade antes do envio.
            # Crítico nunca passa pelo filtro (bypass de segurança).
            if DECISOR_ENABLED and not critico:
                d = decidir(evento, {"repeticoes_10min": 0}, REGRAS_DECISOR)
                if d.acao in ("ignorar", "agrupar"):
                    log.info("Decisor descartou envio: %s score=%d key=%s [%s]",
                             d.acao, d.score, chave, d.motivo)
                    continue
                # propor / elevar -> envia, anotando o score no título
                evento["title"] = f"[D:{d.score}] {evento.get('title', 'Guardião')}"
                log.info("Decisor liberou: %s score=%d key=%s", d.acao, d.score, chave)

            log.info("Despachando: [%s/%s] %s",
                     evento.get("source"), evento.get("severity"), chave)
            dormiu = limiter.aguardar(critico=critico)
            if dormiu > 0:
                log.info("Rate-limit: aguardou %.1fs antes do envio", dormiu)
            tipo, mensagem = formatar(evento)
            titulo = evento.get("title", "Guardião")
            notificar_telegram(tipo=tipo, titulo=titulo, mensagem=mensagem)
            limiter.registrar_envio()
            log.info("Enviado: %s", evento.get("key"))
        except Exception:
            log.exception("Erro despachando evento %s", evento.get("key"))


def main() -> None:
    log.info("=" * 70)
    log.info("🧠 ANALISTA DO GUARDIÃO — iniciando")
    log.info("=" * 70)
    log.info("Rate-limit: 5 msgs/60s, cooldown 90s, jitter 5–15s")
    log.info("Fila: %s", BASE / "fila" / "events.jsonl")
    log.info("=" * 70)

    Thread(target=consumir_da_fila, daemon=True, name="consumidor").start()
    Thread(target=coletar_resumos, daemon=True, name="resumos").start()
    Thread(target=despachar, daemon=False, name="despachador").start()


if __name__ == "__main__":
    main()
