"""CentralDark menu overlay for the Hermes Telegram adapter.

The plugin owns presentation and safe navigation only. It does not create a
polling loop, execute the restart, duplicate META-RSI, or become an executor.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any


MENU_TEXT = (
    "<b>🏛️ CentralDark</b>\n\n"
    "Camada operacional do Hermes.\n"
    "O menu projeta o estado; o owner executa.\n\n"
    "🧬 META-RSI: catálogo 40/40 presente\n"
    "⚪ Runtime 40/40: UNKNOWN\n"
    "🟡 UNKNOWN ≠ PASS"
)



def _centraldark_root() -> Path | None:
    candidates = []
    configured = os.environ.get("CENTRALDARK_ROOT", "").strip()
    if configured:
        candidates.append(Path(configured).expanduser())
    here = Path(__file__).resolve()
    candidates.extend([here, *here.parents])
    for candidate in candidates:
        root = candidate if candidate.is_dir() else candidate.parent
        for parent in [root, *root.parents]:
            matrix = parent / ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
            if matrix.is_file():
                return parent
    return None


def _matrix_status() -> str:
    root = _centraldark_root()
    if root is None:
        return "<b>📖 Matriz META-RSI</b>\\n\\nFonte canônica não localizada.\\nEstado: <b>UNKNOWN</b>."
    matrix = root / ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
    rows = re.findall(r"^\|\s*(?:0[1-9]|[12][0-9]|3[0-9]|40)\s*\|", matrix.read_text(encoding="utf-8"), re.MULTILINE)
    return (
        "<b>📖 Matriz META-RSI</b>\\n\\n"
        f"Capacidades catalogadas: <b>{len(rows)}/40</b>\\n"
        f"Fonte: <code>{matrix.name}</code>\\n"
        "Execução runtime: <b>UNKNOWN</b>.\\n\\n"
        "Catálogo lido do owner canônico."
    )


def _checkpoint_status() -> str:
    home = Path(os.environ.get("HERMES_HOME", "/data")).expanduser()
    current = home / ".hermes/centraldark/verified-execution/telegram-meta-rsi-integration/current.json"
    if not current.is_file():
        return "<b>🧾 Receipts CentralDark</b>\\n\\nCheckpoint não localizado.\\nEstado: <b>UNKNOWN</b>."
    try:
        payload = json.loads(current.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return "<b>🧾 Receipts CentralDark</b>\\n\\nReceipt ilegível.\\nEstado: <b>UNKNOWN</b>."
    return (
        "<b>🧾 Receipts CentralDark</b>\\n\\n"
        f"Etapa: <code>{payload.get('step', 'UNKNOWN')}</code>\\n"
        f"Próximo cursor: <code>{payload.get('next_cursor', 'UNKNOWN')}</code>\\n"
        f"Resultado: <b>{payload.get('outcome', 'UNKNOWN')}</b>\\n"
        f"Integridade: <b>{'HASH_CHAIN_PASS' if payload.get('sha256') else 'UNKNOWN'}</b>"
    )


def _checkpoint_result() -> str:
    text = _checkpoint_status()
    marker = "Resultado: <b>"
    if marker not in text:
        return "UNKNOWN"
    return text.split(marker, 1)[1].split("</b>", 1)[0]


def _gateway_connections() -> str:
    state_file = Path("/data/gateway_state.json")
    if not state_file.is_file():
        return "<b>🔗 Conexões</b>\\n\\nEstado do gateway não localizado.\\nEstado: <b>UNKNOWN</b>."
    try:
        payload = json.loads(state_file.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return "<b>🔗 Conexões</b>\\n\\nEstado ilegível.\\nEstado: <b>UNKNOWN</b>."
    safe = []
    for key in ("telegram", "a2a", "webhook"):
        value = payload.get(key)
        if isinstance(value, dict):
            state = value.get("status", value.get("state", "UNKNOWN"))
        else:
            state = value if value is not None else "UNKNOWN"
        safe.append(f"{key.upper()}: <b>{str(state)}</b>")
    return "<b>🔗 Conexões</b>\\n\\n" + "\\n".join(safe) + "\\n\\nNenhum segredo foi lido."


def _keyboard(InlineKeyboardButton, InlineKeyboardMarkup):
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("🧬 META-RSI 40/40", callback_data="cd:meta"),
            InlineKeyboardButton("📊 HUD", callback_data="cd:hud"),
        ],
        [
            InlineKeyboardButton("🧾 Receipts", callback_data="cd:receipts"),
            InlineKeyboardButton("🔗 Conexões", callback_data="cd:connections"),
        ],
        [
            InlineKeyboardButton("🫁 Kimetsu", callback_data="cd:kimetsu"),
            InlineKeyboardButton("⭐ Michelin", callback_data="cd:michelin"),
        ],
        [
            InlineKeyboardButton("🦜 Papagaio", callback_data="cd:papagaio"),
            InlineKeyboardButton("🔄 Restart controlado", callback_data="cd:restart"),
        ],
    ])


def _back_keyboard(InlineKeyboardButton, InlineKeyboardMarkup):
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔙 CentralDark", callback_data="cd:main")],
    ])


def _meta_keyboard(InlineKeyboardButton, InlineKeyboardMarkup):
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("📖 Ver matriz 40/40", callback_data="cd:matrix"),
            InlineKeyboardButton("🧾 Último receipt", callback_data="cd:receipt"),
        ],
        [InlineKeyboardButton("🔙 CentralDark", callback_data="cd:main")],
    ])


def _restart_keyboard(InlineKeyboardButton, InlineKeyboardMarkup):
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ SIM, preparar gate", callback_data="cd:confirm:restart"),
            InlineKeyboardButton("❌ NÃO, cancelar", callback_data="cd:confirm:no"),
        ],
        [InlineKeyboardButton("🔙 CentralDark", callback_data="cd:main")],
    ])


def _safe_page(data: str, InlineKeyboardButton, InlineKeyboardMarkup) -> tuple[str, Any]:
    pages = {
        "cd:hud": (
            "<b>📊 HUD CentralDark</b>\n\n"
            "O HUD é projeção do estado real.\n"
            f"Último estado do checkpoint: <b>{_checkpoint_result()}</b>."
        ),
        "cd:receipts": _checkpoint_status(),
        "cd:connections": _gateway_connections(),
        "cd:kimetsu": (
            "<b>🫁 Kimetsu</b>\n\n"
            "Seleção de técnica: sob demanda.\n"
            "Método declarado ≠ método executado."
        ),
        "cd:michelin": (
            "<b>⭐ Michelin 3 Estrelas</b>\n\n"
            "Construir → integrar → provar.\n"
            "As estrelas dependem de evidência."
        ),
        "cd:papagaio": (
            "<b>🦜 Papagaio</b>\n\n"
            "Fiel: preservar sequência.\n"
            "ON: replay completo.\n"
            "OFF: execução objetiva."
        ),
    }
    return pages.get(data, "<b>⚠️ Rota desconhecida.</b>\n\nNenhuma ação foi executada."), _back_keyboard(InlineKeyboardButton, InlineKeyboardMarkup)


async def _show_menu(update, context) -> None:
    from telegram import InlineKeyboardButton, InlineKeyboardMarkup

    message = update.effective_message
    if message is not None:
        await message.reply_text(
            MENU_TEXT,
            parse_mode="HTML",
            reply_markup=_keyboard(InlineKeyboardButton, InlineKeyboardMarkup),
        )


async def _handle_callback(update, context) -> None:
    from telegram import InlineKeyboardButton, InlineKeyboardMarkup

    query = update.callback_query
    if query is None:
        return
    await query.answer()
    data = query.data or ""

    if data == "cd:main":
        await query.edit_message_text(
            MENU_TEXT,
            parse_mode="HTML",
            reply_markup=_keyboard(InlineKeyboardButton, InlineKeyboardMarkup),
        )
        return
    if data == "cd:meta":
        await query.edit_message_text(
            "<b>🧬 META-RSI 40/40</b>\n\n"
            "Catálogo canônico: <b>40 capacidades</b>\n"
            "Owner: <code>centraldark-meta-rsi</code>\n"
            "Execução persistente: <b>UNKNOWN</b>\n\n"
            "Nenhuma capacidade será marcada como evoluída sem ação, evidência e contraprova.",
            parse_mode="HTML",
            reply_markup=_meta_keyboard(InlineKeyboardButton, InlineKeyboardMarkup),
        )
        return
    if data == "cd:matrix":
        await query.edit_message_text(_matrix_status(), parse_mode="HTML", reply_markup=_back_keyboard(InlineKeyboardButton, InlineKeyboardMarkup))
        return
    if data == "cd:receipt":
        await query.edit_message_text(_checkpoint_status(), parse_mode="HTML", reply_markup=_back_keyboard(InlineKeyboardButton, InlineKeyboardMarkup))
        return
    if data == "cd:restart":
        text = (
            "<b>🔄 Restart controlado</b>\n\n"
            "Esta ação interrompe e inicia o owner do gateway.\n"
            "Ainda está bloqueada até o adapter Hermes e o readback do mesmo chat serem provados.\n\n"
            "Confirmação registrada sem execução."
        )
        await query.edit_message_text(text, parse_mode="HTML", reply_markup=_restart_keyboard(InlineKeyboardButton, InlineKeyboardMarkup))
        return
    if data == "cd:confirm:no":
        await query.edit_message_text(
            "<b>❌ Ação cancelada.</b>\n\nNenhum processo foi alterado.",
            parse_mode="HTML",
            reply_markup=_back_keyboard(InlineKeyboardButton, InlineKeyboardMarkup),
        )
        return
    if data == "cd:confirm:restart":
        await query.edit_message_text(
            "<b>⚠️ Restart não executado.</b>\n\n"
            "Gate bloqueado: adapter Hermes e entrega no mesmo chat ainda não estão provados.\n"
            "Nenhum processo foi interrompido.",
            parse_mode="HTML",
            reply_markup=_back_keyboard(InlineKeyboardButton, InlineKeyboardMarkup),
        )
        return
    if data.startswith("cd:"):
        text, keyboard = _safe_page(data, InlineKeyboardButton, InlineKeyboardMarkup)
        await query.edit_message_text(text, parse_mode="HTML", reply_markup=keyboard)


def _register_handlers(native, adapter) -> None:
    """Wire scoped handlers before Hermes' broad Telegram handlers."""
    from telegram.ext import CallbackQueryHandler, CommandHandler

    native.add_handler(CommandHandler("start", _show_menu), group=0)
    native.add_handler(CallbackQueryHandler(_handle_callback, pattern=r"^cd:"), group=0)


def register(ctx) -> None:
    ctx.register_telegram_handler(_register_handlers)
