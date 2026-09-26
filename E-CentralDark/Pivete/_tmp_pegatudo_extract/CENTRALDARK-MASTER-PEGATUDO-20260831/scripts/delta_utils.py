#!/usr/bin/env python3
import argparse, json, sys

WEIGHTS = {
    "owner_match": 25,
    "extension_only": 15,
    "contract_match": 15,
    "tests": 20,
    "no_writer_collision": 10,
    "secret_boundary": 10,
    "documentation": 5,
}
DOT = {
    "ACTIVE_PASS": "🟢",
    "PENDING_UNKNOWN": "🟡",
    "BLOCKED_CONFLICT": "🔴",
    "AVAILABLE_INFO": "🔵",
    "DISABLED": "⚫",
}

def _ratio(flags):
    vals=[v for v in flags if v is not None]
    if not vals: return None
    return round(100*sum(bool(v) for v in vals)/len(vals))

def compatibility(signals):
    known=[k for k in WEIGHTS if signals.get(k) is not None]
    if not known: return None
    denom=sum(WEIGHTS[k] for k in known)
    return round(100*sum(WEIGHTS[k] for k in known if signals.get(k) is True)/denom)

def evaluate(candidate):
    s=candidate.get("signals",{})
    compat=compatibility(s)
    evidence=_ratio(candidate.get("evidence_fields",[]))
    ready=_ratio(candidate.get("readiness_gates",[]))
    sec=_ratio(candidate.get("security_gates",[]))
    safeguards=[s.get("owner_match"),s.get("extension_only"),s.get("contract_match"),s.get("tests"),s.get("no_writer_collision"),s.get("secret_boundary"),s.get("documentation")]
    safe=_ratio(safeguards)
    risk=None if safe is None else 100-safe
    gain=candidate.get("projected_gain_percent")
    if gain is not None:
        gain=max(0,min(100,round(gain)))
    blocked=any(v is False for v in [s.get("no_writer_collision"),s.get("secret_boundary")])
    unknown=any(v is None for v in [compat,evidence,ready,sec])
    if candidate.get("disabled"):
        status="DISABLED"
    elif blocked:
        status="BLOCKED_CONFLICT"
    elif unknown:
        status="PENDING_UNKNOWN"
    elif ready==100 and compat is not None and compat>=80:
        status="ACTIVE_PASS"
    else:
        status="AVAILABLE_INFO"
    return {
        "status":status,
        "glyph":DOT[status],
        "scores":{
            "compatibility_percent":compat,
            "evidence_coverage_percent":evidence,
            "integration_readiness_percent":ready,
            "security_gate_coverage_percent":sec,
            "regression_risk_percent":risk,
            "projected_gain_percent":gain,
        },
        "percent_is_proof":False,
        "color_is_proof":False,
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("file", nargs="?", help="candidate JSON; stdin when omitted")
    a=ap.parse_args()
    raw=open(a.file,encoding="utf-8").read() if a.file else sys.stdin.read()
    print(json.dumps(evaluate(json.loads(raw)),ensure_ascii=False,indent=2))
if __name__=="__main__": main()
