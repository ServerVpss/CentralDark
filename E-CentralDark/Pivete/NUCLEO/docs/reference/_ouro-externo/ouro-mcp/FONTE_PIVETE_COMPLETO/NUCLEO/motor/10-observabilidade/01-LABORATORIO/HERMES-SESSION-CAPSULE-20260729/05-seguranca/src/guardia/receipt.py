import hashlib, json

def make_receipt(event, counterproof, verdict, previous_receipt_sha256=None):
    body = {
        "event_id": event.event_id,
        "observed_at": event.observed_at,
        "target": event.target,
        "verdict": verdict,
        "evidence": list(event.evidence),
        "counterevidence": list(counterproof.evidence_against),
        "unknown": list(event.unknown),
        "residual": [] if verdict == "PROVEN" else ["remeasure_or_discriminate"],
        "previous_receipt_sha256": previous_receipt_sha256,
        "next_cursor": "NEXT_#ACORDAR" if verdict == "PROVEN" else "REMEASURE"
    }
    canonical = json.dumps(body, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    body["receipt_sha256"] = hashlib.sha256(canonical).hexdigest()
    return body
