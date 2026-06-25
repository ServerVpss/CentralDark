"""
Fila de eventos JSONL append-only — handoff entre Guardião e Analista.

Guardião só escreve via `publicar()`. Analista consome via `tail()`,
mantendo offset persistido em queue/.offset.
"""
import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

log = logging.getLogger("guardiao.queue")

QUEUE_DIR = Path(__file__).parent
QUEUE_FILE = QUEUE_DIR / "events.jsonl"
OFFSET_FILE = QUEUE_DIR / ".offset"
ROTATE_BYTES = 5 * 1024 * 1024  # 5MB

_write_lock = Lock()


def publicar(
    source: str,
    severity: str,
    key: str,
    title: str,
    body: str,
    dedup_window_s: int = 300,
    payload: dict | None = None,
) -> None:
    """Anexa um evento na fila. Chamado pelo Guardião."""
    QUEUE_DIR.mkdir(exist_ok=True)
    evento = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "severity": severity,
        "key": key,
        "title": title,
        "body": body,
        "dedup_window_s": dedup_window_s,
        "payload": payload or {},
    }
    linha = json.dumps(evento, ensure_ascii=False) + "\n"
    with _write_lock:
        # rotação simples — se passou de 5MB, renomeia pra .1 e zera offset
        if QUEUE_FILE.exists() and QUEUE_FILE.stat().st_size > ROTATE_BYTES:
            QUEUE_FILE.rename(QUEUE_DIR / "events.jsonl.1")
            if OFFSET_FILE.exists():
                OFFSET_FILE.unlink()
            log.info("Fila rotacionada (passou de 5MB)")
        with open(QUEUE_FILE, "a", encoding="utf-8") as f:
            f.write(linha)
    log.debug("Evento publicado: [%s/%s] %s", source, severity, key)


def _ler_offset() -> int:
    if not OFFSET_FILE.exists():
        return 0
    try:
        return int(OFFSET_FILE.read_text().strip() or "0")
    except (ValueError, OSError):
        return 0


def _gravar_offset(off: int) -> None:
    try:
        OFFSET_FILE.write_text(str(off))
    except OSError as e:
        log.warning("Falha ao gravar offset: %s", e)


def consumir(batch_max: int = 50) -> list[dict]:
    """Lê novos eventos a partir do último offset salvo. Atualiza offset ao fim."""
    if not QUEUE_FILE.exists():
        return []
    offset = _ler_offset()
    eventos = []
    try:
        with open(QUEUE_FILE, "r", encoding="utf-8") as f:
            tamanho = os.fstat(f.fileno()).st_size
            if offset > tamanho:  # fila foi rotacionada/zerada
                offset = 0
            f.seek(offset)
            for _ in range(batch_max):
                pos = f.tell()
                linha = f.readline()
                if not linha:
                    break
                if not linha.endswith("\n"):
                    # linha parcial — não consome ainda
                    f.seek(pos)
                    break
                try:
                    eventos.append(json.loads(linha))
                except json.JSONDecodeError:
                    log.warning("Linha inválida descartada da fila")
            offset = f.tell()
    except OSError as e:
        log.error("Erro lendo fila: %s", e)
        return []
    if eventos:
        _gravar_offset(offset)
    return eventos


def tail(intervalo_s: float = 1.0):
    """Generator estilo tail -f — bloqueia esperando novos eventos."""
    while True:
        eventos = consumir()
        if eventos:
            for e in eventos:
                yield e
        else:
            time.sleep(intervalo_s)
