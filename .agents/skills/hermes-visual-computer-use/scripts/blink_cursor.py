"""Replay comprovado: moldura e cursor Cua nativo, sem input fisico."""
import argparse, ctypes, json, os, shutil, subprocess, sys, time, uuid
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    choice = parser.add_mutually_exclusive_group(required=True)
    choice.add_argument("--monitor", type=int)
    choice.add_argument("--all", action="store_true", help="Ordem humana crescente")
    parser.add_argument("--hermes-root", type=Path, default=Path(os.environ.get("LOCALAPPDATA", "")) / "hermes/hermes-agent")
    args = parser.parse_args()
    root = args.hermes_root.resolve()
    sys.path.insert(0, str(root))
    os.chdir(root)
    from pm.environments import selected_venv, site_packages
    sys.path.insert(0, str(site_packages(selected_venv(root))))
    driver = os.environ.get("HERMES_CUA_DRIVER_CMD") or shutil.which("cua-driver")
    if not driver:
        raise RuntimeError("CUA_DRIVER_NOT_FOUND")
    os.environ["HERMES_CUA_DRIVER_CMD"] = driver
    status = subprocess.run([driver, "status"], capture_output=True, text=True, timeout=5)
    if status.returncode or "not running" in (status.stdout + status.stderr).lower():
        raise RuntimeError("CUA_VISUAL_HOST_REQUIRED: iniciar cua-driver serve; nao usar --no-overlay")
    from tools.computer_use.cua_backend import CuaDriverBackend
    import visual
    sid = "hermes-visual-blink-" + uuid.uuid4().hex[:10]
    backend = None
    receipt = {"session": sid, "mode": "native_cua_cursor_and_monitor_preview", "monitors": []}
    try:
        listed = visual.request("list_monitors", session=sid)
        if not listed.get("ok"):
            raise RuntimeError(str(listed))
        monitors = sorted(listed["result"]["monitors"], key=lambda m: m["Number"])
        if not args.all:
            monitors = [m for m in monitors if m["Number"] == args.monitor]
        if not monitors:
            raise RuntimeError("MONITOR_NOT_CONNECTED")
        backend = CuaDriverBackend()
        backend.start()
        receipt["cursor_session"] = backend._session_id
        def call(name, payload):
            out = backend.call_tool(name, payload)
            if out.get("isError"):
                raise RuntimeError(str(out.get("data")))
            return out
        call("set_agent_cursor_enabled", {"enabled": True})
        for monitor in monitors:
            # Cua move_cursor usa pixels ABSOLUTOS do desktop virtual.
            # scope=window desenha o cursor; scope=desktop moveria o mouse fisico.
            x = monitor["X"] + monitor["Width"] * .5
            y = monitor["Y"] + monitor["Height"] * .35
            call("move_cursor", {"scope": "window", "x": x, "y": y})
            time.sleep(.35)
            for cycle in range(3):
                call("set_agent_cursor_enabled", {"enabled": True})
                call("move_cursor", {"scope": "window", "x": x + cycle * 12, "y": y})
                shown = visual.request("show_overlay", {"monitor": monitor["Number"], "leaseSeconds": 5}, session=sid)
                if not shown.get("ok"):
                    raise RuntimeError(str(shown))
                time.sleep(.8)
                hidden = visual.request("hide_overlay", session=sid)
                if not hidden.get("ok"):
                    raise RuntimeError(str(hidden))
                call("set_agent_cursor_enabled", {"enabled": False})
                time.sleep(.35)
            receipt["monitors"].append({"number": monitor["Number"], "device": monitor["Device"], "cursor_origin": [x, y], "cycles": 3, "execution": "completed", "visual_confirmation": "requires_human_or_independent_evidence"})
            print(json.dumps(receipt["monitors"][-1]), flush=True)
        receipt["completed"] = True
    finally:
        try:
            if backend:
                backend.stop()
        finally:
            visual.close_session(sid)
    print(json.dumps({"cleanup": "completed", "receipt": receipt}), flush=True)

if __name__ == "__main__":
    main()
