"""Cursor virtual nativo Cua com overlay Hermes no monitor solicitado."""
#OBSERVACOES# @owner=centraldark-hermes-visual-computer-use @doc_ref=../references/native-cursor.md
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import uuid
from pathlib import Path

def call(driver, sid, name, payload=None):
    data = dict(payload or {})
    data["session"] = sid
    proc = subprocess.run(
        [driver, "call", name, json.dumps(data, separators=(",", ":"))],
        stdin=subprocess.DEVNULL, capture_output=True,
        text=True, encoding="utf-8", errors="replace", timeout=18)
    if proc.returncode != 0:
        raise RuntimeError("CUA_CLI_FAILED " + name + ": " + (proc.stderr or proc.stdout)[-500:])
    try:
        result = json.loads(proc.stdout)
    except json.JSONDecodeError:
        raise RuntimeError("CUA_CLI_INVALID_RESPONSE " + name)
    if result.get("isError") or result.get("is_error") or result.get("ok") is False:
        raise RuntimeError("CUA_CLI_LOGICAL_ERROR " + name + ": " + str(result)[:450])
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    choice = parser.add_mutually_exclusive_group(required=True)
    choice.add_argument("--monitor", type=int)
    choice.add_argument("--all", action="store_true", help="Ordem humana crescente")
    parser.add_argument("--mode", choices=("blink", "position"), default="blink",
                        help="position = cursor e overlay por 5 segundos; blink = 3 ciclos")
    parser.add_argument("--hermes-root", type=Path,
                        default=Path(os.environ.get("LOCALAPPDATA", "")) / "hermes/hermes-agent")
    args = parser.parse_args()
    root = args.hermes_root.resolve()
    sys.path.insert(0, str(root))
    os.chdir(root)
    from pm.environments import selected_venv, site_packages
    sys.path.insert(0, str(site_packages(selected_venv(root))))
    driver = os.environ.get("HERMES_CUA_DRIVER_CMD") or shutil.which("cua-driver")
    if not driver:
        raise RuntimeError("CUA_DRIVER_NOT_FOUND")
    status = subprocess.run([driver, "status"], capture_output=True,
                            text=True, timeout=5)
    if status.returncode or "not running" in (status.stdout + status.stderr).lower():
        raise RuntimeError("CUA_VISUAL_HOST_REQUIRED: daemon Cua com overlay precisa estar ativo")
    import importlib.util
    spec=importlib.util.spec_from_file_location("visual",Path(__file__).resolve().with_name("visual.py"))
    visual=importlib.util.module_from_spec(spec);spec.loader.exec_module(visual)
    sid = "hermes-visual-cursor-" + uuid.uuid4().hex[:10]
    session_started = False
    receipt = {"session": sid, "mode": args.mode, "cursor": "native_cua_virtual",
               "monitors": [], "completed": False}
    try:
        listed = visual.request("list_monitors", session=sid)
        if not listed.get("ok"):
            raise RuntimeError("VISUAL_LIST_MONITORS_FAILED " + str(listed))
        monitors = sorted(listed["result"]["monitors"], key=lambda m: m["Number"])
        if not args.all:
            monitors = [m for m in monitors if m["Number"] == args.monitor]
        if not monitors:
            raise RuntimeError("MONITOR_NOT_CONNECTED")
        call(driver, sid, "start_session")
        session_started = True
        for monitor in monitors:
            x = monitor["X"] + monitor["Width"] * .5
            y = monitor["Y"] + monitor["Height"] * .35
            call(driver, sid, "set_agent_cursor_enabled", {"enabled": True})
            call(driver, sid, "move_cursor", {"scope": "window", "x": x, "y": y})
            cycles = 1 if args.mode == "position" else 3
            for cycle in range(cycles):
                if cycle:
                    call(driver, sid, "set_agent_cursor_enabled", {"enabled": True})
                    call(driver, sid, "move_cursor",
                         {"scope": "window", "x": x + cycle * 12, "y": y})
                shown = visual.request("show_overlay",
                    {"monitor": monitor["Number"], "leaseSeconds": 7}, session=sid)
                if not shown.get("ok"):
                    raise RuntimeError("VISUAL_OVERLAY_FAILED " + str(shown))
                try:
                    time.sleep(5 if args.mode == "position" else .8)
                finally:
                    hidden = visual.request("hide_overlay", session=sid)
                    if not hidden.get("ok") or hidden.get("result", {}).get("overlayVisible"):
                        raise RuntimeError("OVERLAY_DID_NOT_CLOSE")
                if args.mode == "blink":
                    call(driver, sid, "set_agent_cursor_enabled", {"enabled": False})
                    time.sleep(.35)
            item = {"number": monitor["Number"], "device": monitor["Device"],
                    "cursor_origin": [x, y], "mode": args.mode, "cycles": cycles,
                    "execution": "completed",
                    "human_visual_confirmation": "requires_human_or_independent_evidence"}
            receipt["monitors"].append(item)
            print(json.dumps(item), flush=True)
        receipt["completed"] = True
    finally:
        try:
            if session_started:
                call(driver, sid, "end_session")
        finally:
            visual.close_session(sid)
    print(json.dumps({"cleanup": "completed", "receipt": receipt}), flush=True)

if __name__ == "__main__":
    main()
