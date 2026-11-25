"""Demonstração CentralDark: quatro cursores Cua coordenados por um writer único."""
import argparse
import json
import os
import shutil
import subprocess
import time
import uuid
from pathlib import Path

DEFAULT_ROUTE = (4, 2, 1, 3, 4)
HORIZONTAL_POINTS = ((0.234, 0.667), (0.443, 0.556), (0.651, 0.444), (0.833, 0.333))
VERTICAL_POINTS = ((0.259, 0.281), (0.491, 0.411), (0.722, 0.542), (0.889, 0.672))
SPEED_PRESETS = {
    30: {"label": "DEMONSTRATIVO", "glide_ms": 1000, "stage_pause_ms": 700, "hold_seconds": 1.5},
    50: {"label": "FLUIDO", "glide_ms": 600, "stage_pause_ms": 400, "hold_seconds": 1.0},
    100: {"label": "RAPIDO", "glide_ms": 180, "stage_pause_ms": 100, "hold_seconds": 0.5},
}
PRESET_ALIASES = {"fluido": 50, "rapido": 100}

def powershell_screens():
    script = (
        "Add-Type -AssemblyName System.Windows.Forms;"
        "@([System.Windows.Forms.Screen]::AllScreens | ForEach-Object {"
        "[pscustomobject]@{Device=$_.DeviceName;X=$_.Bounds.X;Y=$_.Bounds.Y;"
        "Width=$_.Bounds.Width;Height=$_.Bounds.Height;Primary=$_.Primary}"
        "}) | ConvertTo-Json -Compress"
    )
    p = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=10
    )
    if p.returncode != 0:
        raise RuntimeError("MONITOR_ENUM_FAILED: " + (p.stderr or p.stdout)[-500:])
    data = json.loads(p.stdout.strip())
    return data if isinstance(data, list) else [data]

def load_monitor_map(config_path):
    cfg = json.loads(config_path.read_text(encoding="utf-8-sig"))
    bindings = {k.casefold(): int(v) for k, v in cfg["monitorBindings"].items()}
    mapped = {}
    for screen in powershell_screens():
        human = bindings.get(str(screen["Device"]).casefold())
        if human:
            mapped[human] = screen
    missing = [n for n in (1, 2, 3, 4) if n not in mapped]
    if missing:
        raise RuntimeError("DEMO_REQUIRES_4_MAPPED_MONITORS: " + ",".join(map(str, missing)))
    return mapped

def resolve_driver():
    driver = os.environ.get("HERMES_CUA_DRIVER_CMD") or shutil.which("cua-driver")
    if driver:
        return driver
    local = Path(os.environ.get("LOCALAPPDATA", "")) / "Programs/Cua/cua-driver/bin/cua-driver.exe"
    if local.is_file():
        return str(local)
    raise RuntimeError("CUA_DRIVER_NOT_FOUND")

def cua_call(driver, name, payload, timeout=10):
    p = subprocess.run(
        [driver, "call", name],
        input=json.dumps(payload, separators=(",", ":")),
        capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout
    )
    if p.returncode != 0:
        raise RuntimeError(f"CUA_{name.upper()}_FAILED: " + (p.stderr or p.stdout)[-500:])
    return json.loads(p.stdout) if p.stdout.strip() else {}

def points_for(screen):
    return HORIZONTAL_POINTS if int(screen["Width"]) >= int(screen["Height"]) else VERTICAL_POINTS

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--loops", type=int, default=1)
    speed = parser.add_mutually_exclusive_group()
    speed.add_argument("--speed-percent", type=int, choices=tuple(SPEED_PRESETS))
    speed.add_argument("--preset", choices=tuple(PRESET_ALIASES))
    parser.add_argument("--glide-ms", type=int)
    parser.add_argument("--stage-pause-ms", type=int)
    parser.add_argument("--hold-seconds", type=float)
    parser.add_argument("--config", type=Path, default=Path(__file__).resolve().parents[1] / "default.json")
    args = parser.parse_args()
    if not 1 <= args.loops <= 5:
        parser.error("--loops deve ficar entre 1 e 5")

    manual_timing = any(value is not None for value in (
        args.glide_ms, args.stage_pause_ms, args.hold_seconds
    ))
    if (args.speed_percent is not None or args.preset is not None) and manual_timing:
        parser.error("preset/percentual nao pode ser combinado com timing manual")

    speed_percent = args.speed_percent
    if args.preset is not None:
        speed_percent = PRESET_ALIASES[args.preset]

    if speed_percent is not None:
        selected = SPEED_PRESETS[speed_percent]
        speed_label = selected["label"]
        glide_ms = selected["glide_ms"]
        stage_pause_ms = selected["stage_pause_ms"]
        hold_seconds = selected["hold_seconds"]
    else:
        speed_label = "CUSTOM"
        glide_ms = args.glide_ms if args.glide_ms is not None else 380
        stage_pause_ms = args.stage_pause_ms if args.stage_pause_ms is not None else 450
        hold_seconds = args.hold_seconds if args.hold_seconds is not None else 2.0

    if not 100 <= glide_ms <= 1500:
        parser.error("--glide-ms deve ficar entre 100 e 1500")
    if not 0 <= stage_pause_ms <= 5000:
        parser.error("--stage-pause-ms deve ficar entre 0 e 5000")
    if not 0 <= hold_seconds <= 30:
        parser.error("--hold-seconds deve ficar entre 0 e 30")

    mapped = load_monitor_map(args.config)
    route = list(DEFAULT_ROUTE)
    plan = {
        "recipe_id": "CENTRALDARK_CURSOR_MOUSE_DEMO",
        "writer": "ONE_WRITER",
        "cursors": 4,
        "route_human_monitors": route,
        "physical_mouse": "UNTOUCHED",
        "dispatch": "ORDERED_SUBSEQUENT",
        "windows_true_concurrent_input": False,
        "speed_percent": speed_percent,
        "speed_label": speed_label,
        "timing": {
            "glide_ms": glide_ms,
            "stage_pause_ms": stage_pause_ms,
            "hold_seconds": hold_seconds,
        },
        "screens": {str(n): mapped[n] for n in sorted(mapped)},
    }
    if args.dry_run:
        print(json.dumps({"dry_run": True, "plan": plan}, ensure_ascii=False))
        return

    driver = resolve_driver()
    status = subprocess.run([driver, "status"], capture_output=True, text=True, timeout=5)
    if status.returncode != 0 or "not running" in (status.stdout + status.stderr).lower():
        raise RuntimeError("CUA_DRIVER_NOT_RUNNING")

    run_id = uuid.uuid4().hex[:8]
    sessions = [f"centraldark-cursor-demo-{run_id}-{i}" for i in range(1, 5)]
    started = []
    receipt = dict(plan)
    receipt.update({"run_id": run_id, "sessions": sessions, "stages": [], "cleanup": False})
    try:
        for session in sessions:
            cua_call(driver, "start_session", {"session": session})
            started.append(session)
            cua_call(driver, "set_agent_cursor_enabled", {"session": session, "enabled": True})
            cua_call(driver, "set_agent_cursor_motion", {
                "session": session,
                "style": "comet_swoop",
                "timing": "fixed",
                "glide_duration_ms": glide_ms,
                "effects": {"trail": "on", "glow": "on"}
            })

        for loop in range(args.loops):
            for stage_index, human in enumerate(route, 1):
                screen = mapped[human]
                points = points_for(screen)
                destinations = []
                stage_started = time.perf_counter()
                for session, (fx, fy) in zip(sessions, points):
                    x = round(int(screen["X"]) + int(screen["Width"]) * fx)
                    y = round(int(screen["Y"]) + int(screen["Height"]) * fy)
                    cua_call(driver, "move_cursor", {
                        "session": session, "scope": "window", "x": x, "y": y
                    }, timeout=12)
                    destinations.append({"session": session, "x": x, "y": y})
                receipt["stages"].append({
                    "loop": loop + 1,
                    "stage": stage_index,
                    "human_monitor": human,
                    "device": screen["Device"],
                    "destinations": destinations,
                    "dispatch_seconds": round(time.perf_counter() - stage_started, 3)
                })
                time.sleep(stage_pause_ms / 1000)
        time.sleep(hold_seconds)
    finally:
        for session in started:
            try:
                cua_call(driver, "set_agent_cursor_enabled", {"session": session, "enabled": False}, timeout=5)
            except Exception:
                pass
            try:
                cua_call(driver, "end_session", {"session": session}, timeout=5)
            except Exception:
                pass
        receipt["cleanup"] = True

    receipt["human_visual_confirmation"] = "REQUIRES_HUMAN_OR_INDEPENDENT_EVIDENCE"
    print(json.dumps({"completed": True, "receipt": receipt}, ensure_ascii=False))

if __name__ == "__main__":
    main()
