"""Notifica Telegram via edge function notify-telegram do Supabase."""
import json
import logging
import os
import time
import urllib.request

log = logging.getLogger("guardiao.notifier")

SUPABASE_URL = "https://kagejpghnwdfymddwxuf.supabase.co"
NOTIFY_FN = f"{SUPABASE_URL}/functions/v1/notify-telegram"


def _post(url: str, payload: dict, headers: dict, tentativas: int = 3) -> bool:
    body = json.dumps(payload).encode("utf-8")
    for i in range(1, tentativas + 1):
        try:
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as r:
                if 200 <= r.status < 300:
                    return True
                log.warning(
                    "POST %s → HTTP %s (tentativa %d/%d)",
                    url, r.status, i, tentativas,
                )
        except Exception as e:
            log.warning(
                "POST %s falhou: %s (tentativa %d/%d)",
                url, e, i, tentativas,
            )
        time.sleep(min(2 ** i, 30))
    return False


def notificar_telegram(tipo: str, titulo: str, mensagem: str) -> None:
    """Envia notificação via edge function. Tipo deve estar no CHECK constraint."""
    token = os.environ.get("NOTIFY_API_KEY", "")
    if not token:
        log.error("NOTIFY_API_KEY ausente — notificação NÃO enviada: %s", titulo)
        return

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }
    payload = {
        "tipo": tipo,
        "titulo": titulo,
        "mensagem": mensagem,
        "origem": "guardiao",
    }

    if _post(NOTIFY_FN, payload, headers):
        log.info("Telegram OK: [%s] %s", tipo, titulo)
    else:
        log.error("Telegram FALHOU após 3 tentativas: [%s] %s", tipo, titulo)
