"""Blink the selected monitor via the existing Hermes overlay. No capture or input.
#OBSERVACOES# @owner=centraldark-hermes-visual-computer-use @doc_ref=../references/monitor-human-confirmation.json
"""
import argparse, json, time
from visual import request, close_session
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--monitor",type=int,required=True)
    p.add_argument("--count",type=int,choices=range(1,6),default=3)
    args=p.parse_args()
    session="hermes-blink-"+str(time.time_ns())
    try:
        for _ in range(args.count):
            r=request("show_overlay",{"monitor":args.monitor,"leaseSeconds":3},session)
            if not r.get("ok"):raise RuntimeError(str(r))
            time.sleep(.65)
            r=request("hide_overlay",session=session)
            if not r.get("ok") or r["result"]["overlayVisible"]:
                raise RuntimeError("OVERLAY_DID_NOT_CLOSE")
            time.sleep(.35)
        print(json.dumps({"ok":True,"monitor":args.monitor,"cycles":args.count,
                          "overlayVisible":False,"captureActive":False,
                          "human_visual_confirmation":"not_inferred"}))
    finally:
        close_session(session)
if __name__=="__main__":
    main()
