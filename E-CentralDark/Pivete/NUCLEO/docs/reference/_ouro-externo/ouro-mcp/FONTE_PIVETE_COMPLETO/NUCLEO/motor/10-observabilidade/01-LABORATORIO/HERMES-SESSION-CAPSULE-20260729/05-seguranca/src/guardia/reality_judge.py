def judge(event, counterproof):
    if event.event_type in {"AUTHORITY_CONFLICT", "WRITER_CONFLICT", "BOUNDARY_PRESSURE"}:
        return "FAILED"
    if event.event_type in {"HEARTBEAT_LOST", "UNKNOWN_MATERIAL"}:
        return "UNKNOWN"
    if event.unknown or not event.evidence:
        return "UNKNOWN"
    if counterproof.evidence_against and not event.metadata.get("discriminating_test_passed", False):
        return "UNKNOWN"
    return "PROVEN"
