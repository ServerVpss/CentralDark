"""Final acceptance through Hermes' REAL skill loader, plugin manager and tool registry."""
import json, os, time, sys
sys.path.insert(0, os.getcwd())
from pathlib import Path
from hermes_constants import get_hermes_home
from hermes_cli.plugins import discover_plugins, get_plugin_manager
from tools.registry import registry

discover_plugins()
import importlib
registry=importlib.import_module('tools.registry').registry
names=["computer_"+x for x in ("list_monitors","capture_monitor","show_overlay","hide_overlay","get_active_monitor","get_capture_status")]
entries={name:next((e for e in registry.get_all_entries() if e.name==name),None) for name in names}
assert all(entries.values()), str({"scope":get_plugin_manager().scope_key,"actual":[e.name for e in registry.get_all_entries() if e.name.startswith("computer_")],"plugin":str(get_plugin_manager()._plugins.get("hermes-visual-computer-use"))[-700:]})
skill_file=Path(get_hermes_home())/"skills"/"centraldark-operational-method"/"Skills"/"centraldark-hermes-visual-computer-use"/"SKILL.md"
assert skill_file.is_file() and "name: centraldark-hermes-visual-computer-use" in skill_file.read_text(encoding="utf-8"), "CANONICAL_SKILL_NOT_FOUND"
sid="hermes-visual-final-validation"
def tool(name,args):
    response=entries["computer_"+name].handler(args,session_id=sid)
    if isinstance(response,dict) and response.get("_multimodal"):
        return json.loads(response["text_summary"]), response
    return json.loads(response),None
try:
    listed,_=tool("list_monitors",{})
    assert listed["ok"]
    captured,multi=tool("capture_monitor",{"monitor":1,"authorized":True,"keepActive":True,"leaseSeconds":20})
    assert captured["ok"] and multi["_multimodal"]
    image=captured["result"]["image"]
    assert image["backend"]=="Windows.Graphics.Capture" and image["nativeBorderRequired"]
    assert image["path"] is None and image["retention"]=="deleted_after_encoding"
    status,_=tool("get_capture_status",{})
    assert status["result"]["captureActive"] and status["result"]["overlayVisible"]
    # Exercise real plugin event dispatch without sending any mouse/keyboard input.
    import ctypes
    u=ctypes.WinDLL("user32")
    u.FindWindowW.argtypes=[ctypes.c_wchar_p,ctypes.c_wchar_p]
    u.FindWindowW.restype=ctypes.c_void_p
    hwnd=u.FindWindowW(None,"ChatGPT")
    hook_result="not_tested_no_matching_window"
    if hwnd:
        manager=get_plugin_manager()
        manager.invoke_hook("pre_tool_call",tool_name="computer_use",args={"action":"wait","window_id":hwnd},session_id=sid,task_id=sid,tool_call_id="visual-hook-test")
        hs,_=tool("get_capture_status",{})
        assert hs["result"]["state"]=="AUTOMATING",hs
        manager.invoke_hook("post_tool_call",tool_name="computer_use",args={"action":"wait","window_id":hwnd},result="{}",session_id=sid,task_id=sid,duration_ms=0)
        hs,_=tool("get_capture_status",{})
        assert hs["result"]["state"]=="CAPTURING",hs
        hook_result="actual_plugin_hooks_pass_no_input_injected"
    ended,_=tool("hide_overlay",{})
    assert ended["result"]["state"]=="IDLE"
    assert not ended["result"]["captureActive"] and not ended["result"]["overlayVisible"]
    report={"skill_discovered":True,"skill_owner":"centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use","registered_tools":names,"monitors":listed["result"]["monitors"],
            "capture":captured["result"],"final_status":ended["result"],
            "requested_validation":"Hermes, identifique todos os monitores conectados ao computador. Apresente a quantidade, resolucao, coordenadas e monitor principal. Ative o overlay verde no Monitor 1, faca uma captura de diagnostico e encerre a captura corretamente.",
            "execution":"actual Hermes registered tool handlers; no simulated LLM conversation", "hooks":hook_result,
            "timestamp":time.time()}
    path=Path(get_hermes_home())/"skills"/"centraldark-operational-method"/"Skills"/"centraldark-hermes-visual-computer-use"/"references"/"hermes-validation.json"
    path.write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(report))
finally:
    tool("hide_overlay",{})
    get_plugin_manager().invoke_hook("on_session_end",session_id=sid,completed=True,interrupted=False)