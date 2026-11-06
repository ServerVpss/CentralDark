"""Live WGC regression suite. Synthetic topology tests are explicitly labelled."""
import importlib.util, json, os, tempfile, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("visual",ROOT/"scripts"/"visual.py")
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
tests=[]
def check(name, condition, details=None):
    tests.append({"test":name,"passed":bool(condition),"details":details})
    if not condition: raise AssertionError(name)
def call(op,args=None,session="test"):
    r=v.request(op,args,session)
    check(op+"_ok",r.get("ok"),r if not r.get("ok") else None)
    return r["result"]
try:
    model=call("test_monitor_models")
    check("synthetic_1_2_3_4_and_mixed_dpi_records",len(model["results"])==4,model)
    monitors=call("list_monitors")["monitors"]
    check("live_connected_monitors",len(monitors)>0,len(monitors))
    check("one_primary",sum(m["Primary"] for m in monitors)==1)
    for m in monitors:
        r=call("capture_monitor",{"monitor":m["Number"],"authorized":True})
        image=r["image"]
        check("WGC_monitor_"+str(m["Number"]),
              image["width"]==m["Width"] and image["height"]==m["Height"] and
              image["backend"]=="Windows.Graphics.Capture" and r["overlayExcluded"] and image["nativeBorderRequired"],
              {"width":image["width"],"height":image["height"],"primary":m["Primary"]})
        Path(image["path"]).unlink()
        s=call("get_capture_status")
        check("cleanup_monitor_"+str(m["Number"]),s["state"]=="IDLE" and not s["captureActive"] and not s["overlayVisible"])
    number=monitors[0]["Number"]
    denied=v.request("capture_monitor",{"monitor":number,"authorized":False},"denied")
    check("capture_without_authorization_refused",not denied["ok"])
    invalid=v.request("capture_monitor",{"monitor":9999,"authorized":True},"invalid")
    check("nonexistent_monitor_refused",not invalid["ok"])
    r=call("capture_monitor",{"monitor":number,"authorized":True,"keepActive":True,"leaseSeconds":10})
    Path(r["image"]["path"]).unlink()
    check("active_monitor_identity",call("get_active_monitor")["monitor"]["Number"]==number)
    check("AUTOMATING",call("automating")["state"]=="AUTOMATING")
    check("CAPTURING",call("capturing")["state"]=="CAPTURING")
    other=v.request("show_overlay",{"monitor":number},"other")
    check("single_writer_monitor",not other["ok"],other)
    check("PAUSED",call("pause")["state"]=="PAUSED")
    check("pause_stops_capture",not call("get_capture_status")["captureActive"])
    check("explicit_stop",call("stop")["state"]=="IDLE")
    check("preview_not_capture",not call("show_overlay",{"monitor":number,"leaseSeconds":1})["captureActive"])
    time.sleep(1.5)
    check("lease_cleanup",call("get_capture_status")["state"]=="IDLE")
    # Session EOF cleanup in close_session; host must actually exit.
    call("show_overlay",{"monitor":number},"eof")
    host=v._hosts["eof"];v.close_session("eof")
    check("EOF_process_exit",host.process.poll() is not None)
finally:
    v.close_all()
    report={"tests":tests,"live_monitor_count":len(locals().get("monitors",[])),
            "pending":["physical 1/2/3 monitor configurations","physical mixed DPI","physical unplug/replug and resolution change"],
            "timestamp":time.time()}
    print(json.dumps(report))
    (ROOT/"references"/"validation.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
