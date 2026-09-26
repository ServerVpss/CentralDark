#!/usr/bin/env python3
import argparse, json, sys
from pathlib import Path
from urllib.parse import urlparse, parse_qs

TRACK_KEYS=("v","lang","kind","name","tlang","fmt")
DEBUG_KEYS=("debug_videoId","docid","cc","au_d","len","origin","timestamp","reqBlocked")

def load_debug(path):
    raw=Path(path).read_text(encoding="utf-8") if path else sys.stdin.read()
    return json.loads(raw)

def first(q,key):
    v=q.get(key)
    return v[0] if v else None

def main():
    ap=argparse.ArgumentParser(description="Extract safe YouTube media/caption locators from observed debug JSON and optional timedtext URL. Does not fetch media/captions.")
    ap.add_argument("debug_json", nargs="?", help="Path to debug JSON; stdin if omitted")
    ap.add_argument("--timedtext-url", default=None, help="Observed timedtext request URL")
    args=ap.parse_args()
    d=load_debug(args.debug_json)
    out={
        "source_class":"PLAYER_DEBUG_LOCATOR",
        "video_id": d.get("debug_videoId") or d.get("docid"),
        "debug": {k:d.get(k) for k in DEBUG_KEYS if k in d},
        "debug_json_is_full_caption_payload": False,
        "caption_track": None,
        "complete_caption_payload": False,
    }
    if args.timedtext_url:
        q=parse_qs(urlparse(args.timedtext_url).query, keep_blank_values=True)
        out["caption_track"]={k:first(q,k) for k in TRACK_KEYS if first(q,k) is not None}
        out["caption_track"]["observed_from"]="TIMEDTEXT_REQUEST_URL"
    out["next"]=("ACQUIRE_AUTHORIZED_COMPLETE_TEXT" if out.get("caption_track") else "OBSERVE_CAPTION_TRACK_METADATA_OR_TIMEDTEXT_REQUEST")
    print(json.dumps(out, ensure_ascii=False, indent=2, sort_keys=True))

if __name__=="__main__":
    main()
