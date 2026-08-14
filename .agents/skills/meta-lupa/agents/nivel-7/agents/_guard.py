"""Guard read-only reentrante para agentes N7 aninhados."""
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
        depth = getattr(_state, "depth", 0)
        if depth == 0:
            _state.violations = []
        _state.depth = depth + 1
        _state.active = True
        try:
            result = func(*a, **kw)
        finally:
            _state.depth -= 1
            _state.active = _state.depth > 0

        assert not _state.violations, (
            f"read-only violado por {func.__module__}: {_state.violations}"
        )
        return result
    return wrapper
