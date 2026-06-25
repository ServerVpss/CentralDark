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

from analista.dedup import Dedup  # noqa: E402
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
    root = logging.getLogger("analista")
    root.setLevel(getattr(logging, nivel.upper(), logging.INFO))
    root.addHandler(fh)
    root.addHandler(sh)
    root.propagate = False


configurar_logs(os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("analista.core")


pq = FilaPrioridade()
dedup = Dedup()
limiter = RateLimiter()


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
            critico = evento.get("severity") == "critico"
            dormiu = limiter.aguardar(critico=critico)
            if dormiu > 0:
                log.debug("Rate-limit: dormiu %.1fs", dormiu)
            tipo, mensagem = formatar(evento)
            titulo = evento.get("title", "Guardião")
            notificar_telegram(tipo=tipo, titulo=titulo, mensagem=mensagem)
            limiter.registrar_envio()
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
