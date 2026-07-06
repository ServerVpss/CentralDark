"""Notifica Telegram via script oficial notify-telegram.sh (Bot API direta, <pre> monoespaçado).

Substituido em 06/07/2026: a edge function notify-telegram do Supabase exigia
NOTIFY_API_KEY (nunca configurada -> notificacao sempre falhava em silencio).
Trocado pelo mesmo caminho ja testado por
scripts/notify-claude/notify-telegram.sh, que fala direto com a Bot API do
Telegram e ja e o padrao oficial do projeto.

Destino: respeita a env NOTIFY_CHAT_ID (ex.: grupo). Sem ela, o proprio
script cai no ADMIN privado.
"""
import logging
import os
import subprocess
from pathlib import Path

log = logging.getLogger("guardiao.notifier")

SCRIPT = Path(__file__).resolve().parent.parent.parent / "scripts" / "notify-claude" / "notify-telegram.sh"

EMOJI_POR_TIPO = {
    "sistema": "\U0001f6e1\ufe0f",
    "alerta": "\u26a0\ufe0f",
    "erro": "\U0001f534",
    "critico": "\U0001f6a8",
    "proposta": "\U0001f4cb",
}


def notificar_telegram(tipo: str, titulo: str, mensagem: str) -> None:
    """Envia notificacao via notify-telegram.sh (Bot API Telegram direta)."""
    if not SCRIPT.exists():
        log.error("notify-telegram.sh nao encontrado em %s -- nao enviado: %s", SCRIPT, titulo)
        return

    emoji = EMOJI_POR_TIPO.get(tipo, "\U0001f6e1\ufe0f")
    try:
        r = subprocess.run(
            ["bash", str(SCRIPT), emoji, titulo, mensagem],
            capture_output=True, text=True, timeout=15,
            env={**os.environ},
        )
        if r.returncode == 0:
            log.info("Telegram OK: [%s] %s", tipo, titulo)
        else:
            log.error("Telegram FALHOU (rc=%d): [%s] %s -- %s",
                      r.returncode, tipo, titulo, r.stderr.strip())
    except Exception as e:
        log.error("Telegram FALHOU (excecao): [%s] %s -- %s", tipo, titulo, e)
