"""Public Hermes plugin SDK registration; never overrides computer_use.
#OBSERVACOES# @owner=hermes-visual-computer-use @doc_ref=../references/technical.md
"""
import importlib.util, ctypes
import json
from pathlib import Path
from hermes_constants import get_hermes_home

def _bridge():
    path = Path(get_hermes_home()) / "skills" / "hermes-visual-computer-use" / "scripts" / "visual.py"
    spec = importlib.util.spec_from_file_location("hermes_visual_bridge", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

bridge = None
_targets = {}
_user32=ctypes.WinDLL('user32',use_last_error=True)
_user32.MonitorFromWindow.argtypes=[ctypes.c_void_p,ctypes.c_uint]
_user32.MonitorFromWindow.restype=ctypes.c_void_p
OPERATIONS = ("list_monitors", "capture_monitor", "show_overlay", "hide_overlay",
              "get_active_monitor", "get_capture_status")

def _session(context):
    return str(context.get("session_id") or context.get("task_id") or "default")

def register(ctx):
    global bridge
    bridge = _bridge()
    for operation in OPERATIONS:
        name = "computer_" + operation
        properties = {}
        required = []
        if operation in ("capture_monitor", "show_overlay"):
            properties = {"monitor": {"type": "integer", "minimum": 1},
                          "leaseSeconds": {"type": "integer", "minimum": 1, "maximum": 120}}
            required = ["monitor"]
        if operation == "capture_monitor":
            properties.update({"authorized": {"type": "boolean",
                               "description": "True only for the user's requested monitor capture."},
                               "output": {"type": "string",
                               "description": "Optional explicit PNG retention; omitted deletes after image delivery."},
                               "keepActive": {"type": "boolean",
                               "description": "Keep capture/indicator for subsequent authorized computer_use actions, max 120s."}})
            required.append("authorized")
        schema = {"name": name, "description": {
            "list_monitors": "Enumerate connected Windows monitors: IDs, bounds, DPI and primary; does not capture.",
            "capture_monitor": "Capture authorized monitor using WGC with native border and excluded emerald overlay. Returns image.",
            "show_overlay": "Preview the selected monitor without capturing. Label says preview, never capture active.",
            "hide_overlay": "Stop this session's capture and overlay; release resources.",
            "get_active_monitor": "Read this session's selected monitor and state.",
            "get_capture_status": "Read WGC session state, indicator and capture exclusion."
        }[operation], "parameters": {"type": "object", "properties": properties,
                                    "required": required, "additionalProperties": False}}
        def handler(args, _op=operation, **context):
            return bridge.tool(_op, args, **context)
        ctx.register_tool(name=name, toolset="hermes_visual_computer_use",
                          schema=schema, handler=handler, check_fn=lambda: bridge.EXE.is_file())

    def before(tool_name="", args=None, **context):
        if tool_name != "computer_use" or (args or {}).get("action") in ("capture", "list_apps", "list_windows"):
            return
        key = _session(context)
        if key not in bridge._hosts:
            return
        state = bridge.request("get_capture_status", session=key)
        if state.get("result", {}).get("captureActive"):
            hwnd=(args or {}).get("window_id") or _targets.get(key)
            if hwnd and _user32.MonitorFromWindow(hwnd,0)==state["result"]["monitor"]["Handle"]:
                bridge.request("automating", session=key)

    def after(tool_name="", args=None, **context):
        key = _session(context)
        if tool_name == "computer_use" and (args or {}).get("action") == "capture":
            _targets[key]=(args or {}).get("window_id")
        if tool_name == "computer_use" and key in bridge._hosts:
            status = bridge.request("get_capture_status", session=key)
            if status.get("result", {}).get("captureActive"):
                bridge.request("capturing", session=key)

    def ended(session_id="", **context):
        key=str(session_id or context.get("task_id") or "default")
        _targets.pop(key,None)
        bridge.close_session(key)

    ctx.register_hook("pre_tool_call", before)
    ctx.register_hook("post_tool_call", after)
    ctx.register_hook("on_session_end", ended)
    ctx.on_unload(bridge.close_all)