"""Guard read-only: instala audit hook que registra tentativas de escrita.
Nao toca em nenhum teste; se um run() violar, o proprio agente falha via assert.
"""
import sys, threading, functools

_state = threading.local()
_installed = False
_lock = threading.Lock()

WRITE_MODES = ("w", "a", "x", "+")


def _hook(event, args):
    active = getattr(_state, "active", False)
    if not active:
        return
    if event == "open" and len(args) >= 2:
        mode = args[1] or "r"
        if any(m in mode for m in WRITE_MODES):
            _state.violations.append((str(args[0]), mode))
    elif event in ("os.remove", "os.rename", "os.mkdir", "os.rmdir", "shutil.rmtree"):
        _state.violations.append((event, tuple(map(str, args))))


def _install():
    global _installed
    with _lock:
        if not _installed:
            sys.addaudithook(_hook)
            _installed = True


def read_only(func):
    @functools.wraps(func)
    def wrapper(*a, **kw):
        _install()
        _state.active = True
        _state.violations = []
        try:
            result = func(*a, **kw)
        finally:
            _state.active = False
        assert not _state.violations, (
            f"read-only violado por {func.__module__}: {_state.violations}"
        )
        return result
    return wrapper
