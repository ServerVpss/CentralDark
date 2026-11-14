"""Cursor virtual nativo Cua com overlay Hermes no monitor solicitado."""
#OBSERVACOES# @owner=centraldark-hermes-visual-computer-use @doc_ref=../references/native-cursor.md
# @last_updated=2026-11-06T18:02:11.1794150Z
# @implementado=target UIA dinamico, com validacao Win32 e clique exclusivo Cua virtual; modos legados preservados.
import argparse
import ctypes
from ctypes import wintypes
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

def resolve_window(pid, hwnd):
    """Valida a janela viva antes de qualquer clique do Cua (sem mouse fisico)."""
    user32 = ctypes.windll.user32
    rect = wintypes.RECT()
    actual_pid = wintypes.DWORD()
    if not user32.IsWindow(hwnd) or not user32.GetWindowRect(hwnd, ctypes.byref(rect)):
        raise RuntimeError("CUA_CLICK_WINDOW_STALE")
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(actual_pid))
    if actual_pid.value != pid:
        raise RuntimeError("CUA_CLICK_PID_MISMATCH")
    return rect


def resolve_target(window_title, control_name):
    """Read the current UIA window/control/monitor from the existing Skill Mae helper."""
    helper = Path(__file__).resolve().parents[3] / "scripts" / "Identify-CentralDarkMonitors.ps1"
    if not helper.is_file():
        raise RuntimeError("CANONICAL_UIA_RESOLVER_MISSING")
    proc = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-File", str(helper),
         "-ResolveControl", "-WindowTitle", window_title, "-ControlName", control_name],
        stdin=subprocess.DEVNULL, capture_output=True, text=True,
        encoding="utf-8", errors="replace", timeout=20,
    )
    if proc.returncode != 0:
        raise RuntimeError("WINDOW_CONTROL_DISCOVERY_FAILED " + (proc.stderr or proc.stdout)[-600:])
    try:
        target = json.loads(proc.stdout.strip().splitlines()[-1])
        for key in ("pid", "hwnd", "monitor", "x", "y"):
            target[key] = int(target[key])
        if not target["device"] or target.get("input_dispatched") is not False:
            raise ValueError("Invalid source identity")
        if target["pid"] <= 0 or target["hwnd"] <= 0 or target["monitor"] <= 0:
            raise ValueError("Invalid window/monitor")
        return target
    except (KeyError, IndexError, ValueError, TypeError, json.JSONDecodeError) as exc:
        raise RuntimeError("WINDOW_CONTROL_DISCOVERY_INVALID_RESPONSE") from exc


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    choice = parser.add_mutually_exclusive_group()
    choice.add_argument("--monitor", type=int)
    choice.add_argument("--all", action="store_true", help="Ordem humana crescente")
    parser.add_argument("--mode", choices=("blink", "position", "click", "working"), default="blink",
                        help="position = previa 5 segundos; blink = 3 ciclos; click = Cua virtual + overlay; working = foco continuo com expiracao")
    parser.add_argument("--duration", type=int, default=60, metavar="SEGUNDOS",
                        help="working: sessao visual ativa 1..120s, sem processo permanente")
    parser.add_argument("--cursor-motion", action="store_true",
                        help="working: mover cursor virtual com a moldura fixa no monitor selecionado")
    parser.add_argument("--pid", type=int, help="PID atual da janela para --mode click")
    parser.add_argument("--hwnd", type=int, help="HWND atual da janela para --mode click")
    parser.add_argument("--x", type=int, help="X absoluto do alvo na tela para --mode click")
    parser.add_argument("--y", type=int, help="Y absoluto do alvo na tela para --mode click")
    parser.add_argument("--window-title", help="Titulo parcial atual da janela (descoberta UIA)")
    parser.add_argument("--control-name", help="Nome exato atual do controle acessivel (UIA)")
    parser.add_argument("--hermes-root", type=Path,
                        default=Path(os.environ.get("LOCALAPPDATA", "")) / "hermes/hermes-agent")
    args = parser.parse_args()
    click_params = (args.pid, args.hwnd, args.x, args.y)
    dynamic = bool(args.window_title or args.control_name)
    explicit = any(value is not None for value in click_params)
    if args.mode == "click":
        if args.all:
            parser.error("click exige janela unica; --all nao permitido")
        if dynamic:
            if not args.window_title or not args.control_name or explicit:
                parser.error("click dinamico exige apenas --window-title e --control-name")
        elif args.monitor is None or any(value is None for value in click_params):
            parser.error("click explicito exige --monitor N --pid PID --hwnd HWND --x X --y Y")
    elif dynamic or explicit:
        parser.error("alvos de clique somente permitidos no modo click")
    elif args.monitor is None and not args.all:
        parser.error("informe --monitor N ou --all")
    if args.cursor_motion and args.mode != "working":
        parser.error("--cursor-motion exige working")
    if args.mode == "working":
        if args.all or args.monitor is None:
            parser.error("working exige um unico --monitor N")
        if not 1 <= args.duration <= 120:
            parser.error("working exige --duration entre 1 e 120 segundos")
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
    target = resolve_target(args.window_title, args.control_name) if dynamic else None
    if target and args.monitor is not None and target["monitor"] != args.monitor:
        raise RuntimeError("CONTROL_MONITOR_MISMATCH")
    wanted_monitor = args.monitor if args.monitor is not None else (target["monitor"] if target else None)
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
            monitors = [m for m in monitors if m["Number"] == wanted_monitor]
        if not monitors:
            raise RuntimeError("MONITOR_NOT_CONNECTED")
        call(driver, sid, "start_session")
        session_started = True
        for monitor in monitors:
            if args.mode == "working":
                # A mesma sessao Cua + visual permanece viva durante a operacao.
                # O host renova a lease do MESMO overlay, sem segunda janela.
                x = monitor["X"] + monitor["Width"] * .5
                y = monitor["Y"] + monitor["Height"] * .35
                call(driver, sid, "set_agent_cursor_enabled", {"enabled": True})
                call(driver, sid, "move_cursor", {"scope": "window", "x": x, "y": y})
                shown = visual.request("show_overlay", {
                    "monitor": monitor["Number"], "leaseSeconds": min(120, args.duration + 5)
                }, session=sid)
                if not shown.get("ok") or not shown.get("result", {}).get("overlayVisible"):
                    raise RuntimeError("VISUAL_WORKING_START_FAILED")
                try:
                    started = visual.request("renew_overlay", {
                        "leaseSeconds": min(120, args.duration + 5), "visualState": "working"
                    }, session=sid)
                    if not started.get("ok") or not started.get("result", {}).get("overlayVisible"):
                        raise RuntimeError("VISUAL_WORKING_RENEW_UNAVAILABLE " + str(started)[:300])
                    print(json.dumps({"mode": "working", "monitor": monitor["Number"],
                                      "execution": "started", "duration_seconds": args.duration,
                                      "human_visual_confirmation": "not_inferred"}), flush=True)
                    ends_at = time.monotonic() + args.duration
                    next_renew = time.monotonic() + 15
                    waypoints = ((.30, .35), (.70, .35), (.70, .65), (.30, .65))
                    movement_count = 0
                    while (remaining := ends_at - time.monotonic()) > 0:
                        if args.cursor_motion:
                            fx, fy = waypoints[movement_count % len(waypoints)]
                            mx = monitor["X"] + monitor["Width"] * fx
                            my = monitor["Y"] + monitor["Height"] * fy
                            call(driver, sid, "move_cursor", {"scope": "window", "x": mx, "y": my})
                            movement_count += 1
                        time.sleep(min(2 if args.cursor_motion else 15, remaining))
                        if time.monotonic() >= next_renew and ends_at - time.monotonic() > 0:
                            renewed = visual.request("renew_overlay", {
                                "leaseSeconds": min(120, args.duration + 5), "visualState": "working"
                            }, session=sid)
                            if not renewed.get("ok") or not renewed.get("result", {}).get("overlayVisible"):
                                raise RuntimeError("VISUAL_WORKING_RENEW_FAILED " + str(renewed)[:300])
                            next_renew = time.monotonic() + 15
                finally:
                    hidden = visual.request("hide_overlay", session=sid)
                    if not hidden.get("ok") or hidden.get("result", {}).get("overlayVisible"):
                        raise RuntimeError("VISUAL_WORKING_CLEANUP_FAILED")
                item = {"number": monitor["Number"], "mode": "working",
                        "cursor_origin": [x, y], "duration_seconds": args.duration,
                        "execution": "completed", "renewal": "same_visual_session",
                        "virtual_cursor_moves": movement_count,
                        "human_visual_confirmation": "not_inferred"}
                receipt["monitors"].append(item)
                print(json.dumps(item), flush=True)
                continue
            if args.mode == "click":
                pid = target["pid"] if target else args.pid
                hwnd = target["hwnd"] if target else args.hwnd
                x = target["x"] if target else args.x
                y = target["y"] if target else args.y
                if target and str(monitor["Device"]).casefold() != str(target["device"]).casefold():
                    raise RuntimeError("CUA_CLICK_TARGET_DEVICE_MISMATCH")
                rect = resolve_window(pid, hwnd)
                if not (monitor["X"] <= x < monitor["X"] + monitor["Width"] and
                        monitor["Y"] <= y < monitor["Y"] + monitor["Height"]):
                    raise RuntimeError("CUA_CLICK_WRONG_MONITOR")
                if not (rect.left <= x < rect.right and rect.top <= y < rect.bottom):
                    raise RuntimeError("CUA_CLICK_OUTSIDE_WINDOW")
                # Foco na janela, sem SetCursorPos, mouse_event ou SendInput.
                ctypes.windll.user32.SetForegroundWindow(hwnd)
                call(driver, sid, "set_agent_cursor_enabled", {"enabled": True})
                shown = visual.request("show_overlay",
                    {"monitor": monitor["Number"], "leaseSeconds": 12}, session=sid)
                if not shown.get("ok") or not shown.get("result", {}).get("overlayVisible"):
                    raise RuntimeError("CUA_CLICK_OVERLAY_FAILED")
                try:
                    call(driver, sid, "move_cursor",
                         {"scope": "window", "x": x, "y": y})
                    time.sleep(.8)
                    clicked = call(driver, sid, "click",
                        {"scope": "window", "pid": pid,
                         "x": x - rect.left, "y": y - rect.top,
                         "delivery_mode": "background"})
                    time.sleep(1.2)
                finally:
                    hidden = visual.request("hide_overlay", session=sid)
                    if not hidden.get("ok") or hidden.get("result", {}).get("overlayVisible"):
                        raise RuntimeError("CUA_CLICK_OVERLAY_DID_NOT_CLOSE")
                item = {"number": monitor["Number"], "mode": "click",
                        "cursor_origin": [x, y], "pid": pid, "hwnd": hwnd,
                        "target_binding": "live_UIA" if target else "explicit_verified",
                        "execution": "dispatched", "route": "cua-driver",
                        "delivery": clicked.get("delivery"),
                        "effect": "requires_independent_UI_readback",
                        "human_visual_confirmation": "not_inferred"}
                receipt["monitors"].append(item)
                print(json.dumps(item), flush=True)
                continue
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
