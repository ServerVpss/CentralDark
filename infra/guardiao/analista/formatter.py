"""Formata eventos em mensagens bonitas pro Telegram (Markdown)."""
from datetime import datetime
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/Sao_Paulo")

EMOJI = {
    "critico": "🚨",
    "erro": "❌",
    "aviso": "⚠️",
    "info": "ℹ️",
}

SOURCE_EMOJI = {
    "pm2": "⚙️",
    "docker": "🐳",
    "consciencia": "📚",
    "guardiao": "🛡️",
}


def formatar(evento: dict) -> tuple[str, str]:
    """Retorna (tipo, mensagem_markdown). Tipo bate com CHECK da edge function."""
    sev = evento.get("severity", "info")
    src = evento.get("source", "?")
    titulo_in = evento.get("title", "(sem título)")
    body = evento.get("body", "")
    agrupado = evento.get("_agrupado", False)
    ts = datetime.now(TZ).strftime("%d/%m %H:%M:%S")

    e_sev = EMOJI.get(sev, "•")
    e_src = SOURCE_EMOJI.get(src, "📡")

    cabec = f"{e_sev} *{titulo_in}*"
    rodape = f"\n\n_{e_src} {src} · {ts}_"
    if agrupado:
        rodape = f"\n\n_{e_src} {src} · {ts} · agrupado_"

    mensagem = f"{cabec}\n\n{body}{rodape}"

    # mapeia severity -> tipo aceito pela edge function
    tipo = {
        "critico": "erro",
        "erro": "erro",
        "aviso": "aviso",
        "info": "info",
    }.get(sev, "info")

    return tipo, mensagem
