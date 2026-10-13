"""CentralDark menu adapter for the already running native Hermes Telegram gateway.

This adapter persists a *routing preference*, not a second executor.
A deterministic no-LLM path requires its own consumer and E2E receipt.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import tempfile
import threading

_LOCK = threading.RLock()
_STATE_FILENAME = "typed-core-telegram-modes.json"


def _context() -> tuple[Path, str] | None:
    """The gateway binds profile and chat with ContextVars before invoking plugins."""
    try:
        from hermes_constants import hermes_home_key
        from gateway.session_context import get_session_env

        if str(get_session_env("HERMES_SESSION_PLATFORM", "")).lower() != "telegram":
            return None
        user = get_session_env("HERMES_SESSION_USER_ID", "")
        chat = (get_session_env("HERMES_SESSION_KEY", "")
                or get_session_env("HERMES_SESSION_CHAT_ID", ""))
        if not user or not chat:
            return None
        scope = hashlib.sha256(f"telegram:{chat}:user:{user}".encode()).hexdigest()
        return Path(hermes_home_key()), scope
    except (ImportError, ValueError, OSError, TypeError):
        return None


def _filename(home: Path) -> Path:
    return home / "state" / "centraldark" / _STATE_FILENAME


def _read(home: Path) -> dict[str, bool]:
    try:
        obj = json.loads(_filename(home).read_text(encoding="utf-8"))
        if isinstance(obj, dict) and obj.get("schema") == 1 and isinstance(obj.get("modes"), dict):
            return {k: v for k, v in obj["modes"].items()
                    if isinstance(k, str) and isinstance(v, bool)}
    except (OSError, ValueError, TypeError):
        pass
    return {}


def _write(home: Path, modes: dict[str, bool]) -> None:
    dest = _filename(home)
    dest.parent.mkdir(parents=True, exist_ok=True)
    path = None
    try:
        fd, path = tempfile.mkstemp(prefix=".ht-mode-", dir=str(dest.parent))
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            json.dump({"schema": 1, "modes": modes}, stream, sort_keys=True)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(path, dest)
    finally:
        if path and os.path.exists(path):
            os.unlink(path)


def _status() -> bool | None:
    scope = _context()
    if scope is None:
        return None
    home, key = scope
    with _LOCK:
        return _read(home).get(key, False)


def _toggle(on: bool) -> str:
    scope = _context()
    if scope is None:
        return "Disponível apenas na conversa Telegram autenticada do Hermes. Nada foi alterado."
    home, key = scope
    with _LOCK:
        modes = _read(home)
        if on:
            modes[key] = True
        else:
            modes.pop(key, None)
        try:
            _write(home, modes)
        except OSError:
            return "Não consegui salvar o modo. Hermes atual permanece inalterado."
    if on:
        return ("🟢 /hton — Preferência Hermes Typed Core LIGADA nesta conversa.\n"
                "🦜 Priorizar receitas comprovadas; Hermes atual continua como fallback.\n"
                "🧿 Rota determinística E2E exige contraprova do consumidor.")
    return ("⚪ /htoff — Preferência Hermes Typed Core DESLIGADA nesta conversa.\n"
            "✅ Hermes atual, modelo, cron e sessão preservados.")


def _pre_llm_call(**kwargs):
    """Routing hint only. This hook cannot bypass the native LLM call."""
    if _status() is not True:
        return None
    return {"context": (
        "[CENTRALDARK_TYPED_CORE_PREFERENCE_ON] "
        "Prefer proven authorized fingerprint-compatible CentralDark/Hermes recipes "
        "using existing tools and owners. Reuse verified proof; measure only affected "
        "delta. If no deterministic consumer exists, preserve this Hermes session, "
        "model, tools and fallback. A routing preference is NOT a no-model execution "
        "receipt. Never claim deterministic E2E without an effect readback."
    )}


def register(ctx) -> None:
    # Hermes' native Telegram gateway discovers parameterless plugin commands
    # and includes their Portuguese descriptions in setMyCommands.
    ctx.register_command("hton", handler=lambda _args: _toggle(True),
                         description="Ativar preferência Hermes Typed Core")
    ctx.register_command("htoff", handler=lambda _args: _toggle(False),
                         description="Voltar ao Hermes atual (fallback)")
    ctx.register_hook("pre_llm_call", _pre_llm_call)
