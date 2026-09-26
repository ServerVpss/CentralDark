#!/usr/bin/env python3
import re, sys, json

ALIASES = {
    "VAMOS_MELHORAR_OQUE_JA_EXITE":"IMPROVE_EXISTING",
    "MELHORE_OQUE_JA_EXITE":"IMPROVE_EXISTING",
    "VAMOS_MELHORAR_OQUE_JA_EXISTE":"IMPROVE_EXISTING",
    "MELHORE_OQUE_JA_EXISTE":"IMPROVE_EXISTING",
    "MULTIBUSSOLA_META":"MULTIBUSSOLA",
    "MULTIBÚSSOLA_META":"MULTIBUSSOLA",
    "CRYSTALIZAR":"CRISTALIZAR",
    "CRYSTALAIZAR":"CRISTALIZAR",
}
REGISTERED = {
    "CENTRALDARK","ACORDAR","CALIBRAR","PEGATUDO","IMPROVE_EXISTING",
    "MULTIBUSSOLA","META_LUPA","RECONCILIAR","CONTRAPROVA","REMEDICAO_T1",
    "REALITY_JUDGE","REGISTRA","BOOT","CRISTALIZAR","DELTAUTIL"
}
CHAIN = [
    "ACORDAR","CRISTALIZAR_MEASURE","CRISTALIZAR_FALLBACK","CALIBRAR","PEGATUDO","UNIVERSAL_INVENTORY","DELTAUTIL_RECONCILE",
    "TRUE_NORTH_LOCK","MULTIBUSSOLA","RESOLVE_REQUIRED_BEARINGS","EXECUTE_MATERIAL_BEARINGS",
    "FORWARD_ROUTE","REVERSE_ROUTE","INVERSE_ROUTE_WHEN_DISCRIMINANT","CROSS_BEARING_RENDEZVOUS",
    "DIVERGENCE_HANDLER","MATERIAL_CHANGE_HANDLER","LOCAL_FIXED_POINT_LOOP",
    "META_LUPA_WHEN_APPLICABLE","RECONCILIAR_WHEN_APPLICABLE","CONTRAPROVA",
    "REMEDICAO_T1","REALITY_JUDGE","SITE_READINESS_GATE","DOCUMENTATION_GATE","GLOBAL_FIXED_POINT","REGISTRA","BOOT_REFRESH","NEXT_CURSOR"
]

OPERATORS = {
    ">>": "FORWARD_CONTINUE",
    ">>>": "FORWARD_CONTINUE",
    "<<": "REVERSE_REMEASURE",
    "<<<": "REVERSE_REMEASURE",
}

def parse(text, master_context_active=False):
    stripped=text.strip()
    if stripped in OPERATORS:
        if not master_context_active:
            return {
                "status":"MASTER_CONTEXT_REQUIRED",
                "event":"CENTRALDARK",
                "trigger":None,
                "operator":OPERATORS[stripped],
                "master_context_active":False,
                "master_reentry":False,
            }
        return {
            "status":"OK_INTERNAL_OPERATOR",
            "event":"CENTRALDARK",
            "trigger":None,
            "operator":OPERATORS[stripped],
            "master_context_active":True,
            "master_reentry":False,
        }
    m=re.match(r"^\s*([!#])([A-Za-zÀ-ÿ0-9_]+)\b(?:\s+(.*))?$", stripped)
    if not m:
        return {"status":"NO_TRIGGER","event":None,"trigger":None}
    raw=m.group(2).upper()
    requested=ALIASES.get(raw,raw)
    if requested not in REGISTERED:
        return {"status":"UNKNOWN_TRIGGER","event":requested,"trigger":requested}
    objective=(m.group(3) or "").strip() or None
    operator=None
    if objective:
        parts=objective.split(maxsplit=1)
        if parts[0] in OPERATORS:
            operator=OPERATORS[parts[0]]
            objective=(parts[1].strip() if len(parts)>1 else None)
    if requested=="CENTRALDARK" and objective is None:
        objective="CONTINUE_CURRENT_DURABLE_MISSION_FROM_NEXT_CURSOR"
    # Inside an already active master context, recognized names are internal phases;
    # they must not recursively re-enter the master.
    if master_context_active:
        return {
            "status":"OK_INTERNAL_PHASE","event":"CENTRALDARK","trigger":requested,
            "requested_phase":requested,"objective":objective,"operator":operator,
            "master_context_active":True,"master_reentry":False
        }
    # Every recognized external trigger funnels into CENTRALDARK once.
    return {
        "status":"OK","event":"CENTRALDARK","trigger":requested,
        "requested_phase":requested,"legacy_event":requested,"objective":objective,"operator":operator,
        "master_context_active":True,"master_reentry":False,
        "policies":["IMPROVE_EXISTING","REUSE_BEFORE_CREATE","PEGATUDO","ZERO_REGRESSION"],
        "chain":CHAIN
    }

if __name__=="__main__":
    for arg in sys.argv[1:] or ["!CENTRALDARK teste"]:
        print(json.dumps(parse(arg),ensure_ascii=False))
