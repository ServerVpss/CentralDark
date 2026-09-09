from __future__ import annotations
import json
from typing import Any, Mapping

REQUIRED_FACTS = (
    'acordar_done','calibrar_done','multibussola_done','meta_lupa_done',
    'menos_e_mais_done','owner_resolved','writer_scope_valid',
    'evidence_bound','no_destructive_bypass'
)
RULES = (
    (('acordar_done','calibrar_done','multibussola_done','meta_lupa_done','menos_e_mais_done'),'boot_gate_done'),
    (('boot_gate_done','owner_resolved','writer_scope_valid','evidence_bound'),'work_gate_done'),
    (('work_gate_done','no_destructive_bypass'),'centraldark_action_gate_pass'),
)

def _bool(value: str | None) -> bool:
    return str(value or '').strip().lower() in {'1','true','yes','sim','required'}

def _extract_facts(payload: Mapping[str, Any]) -> set[str]:
    gate = payload.get('centraldark_gate') if isinstance(payload.get('centraldark_gate'), dict) else {}
    values = gate.get('facts') or payload.get('facts') or []
    facts = {str(v) for v in values} if isinstance(values, list) else set()
    for key in REQUIRED_FACTS:
        if gate.get(key) is True or payload.get(key) is True:
            facts.add(key)
    return facts

def close_facts(facts: set[str]) -> set[str]:
    facts = set(facts)
    changed = True
    while changed:
        changed = False
        for body, head in RULES:
            if all(item in facts for item in body) and head not in facts:
                facts.add(head); changed = True
    return facts

def validate_payload_gate(payload: Mapping[str, Any], *, required: bool) -> dict[str, Any]:
    if not required:
        return {'accepted': True, 'status': 'NOT_APPLICABLE', 'gate': 'HORN_CARACOL'}
    derived = close_facts(_extract_facts(payload))
    missing = [f for f in REQUIRED_FACTS if f not in derived]
    ok = 'centraldark_action_gate_pass' in derived and not missing
    return {
        'accepted': ok,
        'status': 'PASS' if ok else 'BLOCKED',
        'gate': 'HORN_CARACOL',
        'missing': missing,
        'derived': sorted(derived),
    }

def validate_webhook_gate(headers: Mapping[str, str], body: bytes) -> dict[str, Any]:
    normalized = {str(k).lower(): str(v) for k, v in headers.items()}
    header_required = _bool(normalized.get('x-centraldark-gate-required'))
    try:
        payload = json.loads(body or b'{}')
    except json.JSONDecodeError:
        return {'accepted': not header_required, 'status': 'INVALID_JSON' if header_required else 'NOT_APPLICABLE', 'gate': 'HORN_CARACOL'}
    if not isinstance(payload, dict):
        return {'accepted': not header_required, 'status': 'INVALID_PAYLOAD' if header_required else 'NOT_APPLICABLE', 'gate': 'HORN_CARACOL'}
    body_required = payload.get('centraldark_gate_required') is True
    return validate_payload_gate(payload, required=header_required or body_required)
