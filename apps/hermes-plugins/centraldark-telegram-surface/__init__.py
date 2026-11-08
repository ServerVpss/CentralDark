"""CentralDark menu overlay for the Hermes Telegram adapter.

The plugin owns presentation and safe navigation only. It does not create a
polling loop, execute the restart, duplicate META-RSI, or become an executor.
"""

from __future__ import annotations

from typing import Any


MENU_TEXT = (
    "<b>🏛️ CentralDark</b>\n\n"
    "Camada operacional do Hermes.\n"
    "O menu projeta o estado; o owner executa.\n\n"
    "🧬 META-RSI: catálogo 40/40 presente\n"
    "⚪ Runtime 40/40: UNKNOWN\n"
    "🟡 UNKNOWN ≠ PASS"
)


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
            "Runtime desta integração: <b>UNKNOWN</b>."
        ),
        "cd:receipts": (
            "<b>🧾 Receipts CentralDark</b>\n\n"
            "A cadeia de checkpoint do código está válida.\n"
            "Entrega de receipt nesta conversa: <b>UNKNOWN</b>."
        ),
        "cd:connections": (
            "<b>🔗 Conexões</b>\n\n"
            "O menu não altera tokens, polling, A2A ou webhook.\n"
            "Readback desta superfície: <b>UNKNOWN</b>."
        ),
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
        text = (
            "<b>📖 Matriz META-RSI</b>\n\n"
            "40 capacidades catalogadas no owner canônico.\n"
            "Avaliação runtime 40/40: <b>UNKNOWN</b>.\n\n"
            "O catálogo não será duplicado dentro do menu."
        )
        await query.edit_message_text(text, parse_mode="HTML", reply_markup=_back_keyboard(InlineKeyboardButton, InlineKeyboardMarkup))
        return
    if data == "cd:receipt":
        text = (
            "<b>🧾 Último receipt META-RSI</b>\n\n"
            "Nenhum receipt runtime 40/40 foi comprovado nesta superfície.\n"
            "Estado: <b>UNKNOWN</b>."
        )
        await query.edit_message_text(text, parse_mode="HTML", reply_markup=_back_keyboard(InlineKeyboardButton, InlineKeyboardMarkup))
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
