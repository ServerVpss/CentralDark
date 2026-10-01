#!/usr/bin/env python3
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

MASTER = "!CENTRALDARK"
TRIGGER_EMOJIS = {
    "CENTRALDARK": "👑",
    "ACORDAR": "🌅",
    "CALIBRAR": "🎯",
    "MULTIBUSSOLA": "🧭",
    "META_LUPA": "🔎",
    "RECONCILIAR": "🔄",
    "DELTA_UTIL": "💎",
    "CONTRAPROVA": "🧪",
    "REMEDICAO": "📏",
    "FIXED_POINT": "📍",
    "REGISTRA": "🧾",
    "RASTRO": "🔏",
    "BOOT": "🚀",
}
INTENT_ALIGNMENT_THRESHOLD_PERCENT = 80

CHAIN = [
    "ACORDAR",
    "CALIBRAR",
    "MULTIBUSSOLA",
    "META_LUPA",
    "RECONCILIAR",
    "DELTA_UTIL",
    "CONTRAPROVA",
    "REMEDICAO",
    "FIXED_POINT",
    "REGISTRA",
    "RASTRO",
    "BOOT",
]

GUIDED_TELEMETRY_PHASES = [
    ("ACORDAR", "#ACORDAR"),
    ("CENTRALDARK", "!CENTRALDARK"),
    ("TOOL_DISCOVERY", "TOOL DISCOVERY"),
    ("REMEASURE", "REMEASURE"),
    ("INTENT_SCOPE", "INTENÇÃO/ESCOPO"),
    ("RENDEZVOUS", "RENDEZVOUS"),
    ("OWNER", "OWNER"),
    ("ZERO_TRUST", "ZERO TRUST"),
    ("META_LUPA", "META LUPA"),
    ("TEST", "TESTE"),
    ("CI_SAME_HEAD", "CI MESMO HEAD"),
    ("REALITY_JUDGE", "REALITY JUDGE"),
    ("FIXED_POINT", "FIXED POINT"),
    ("LOCK", "CADEADO"),
    ("PROMOTION", "PROMOTION"),
]
GUIDED_TELEMETRY_STATUSES = {"UNKNOWN", "ACTIVE", "PASS", "FAIL", "BLOCKED", "SKIPPED"}
GUIDED_TELEMETRY_ICONS = {
    "UNKNOWN": "⚪",
    "ACTIVE": "🔵",
    "PASS": "✅",
    "FAIL": "❌",
    "BLOCKED": "⛔",
    "SKIPPED": "➖",
}
GUIDED_TELEMETRY_SURFACES = [
    "CLI", "CHAT", "VOICE", "WORK", "COWORK", "CODE_AGENT", "API", "MCP", "WEB", "DESKTOP", "SOL", "HERMES", "TELEGRAM"
]

DELTA_CANONICAL = "!DELTA UTILS"
DELTA_ALIASES = (
    "!delta utils", "!deltautils", "deltautils", "!delta util", "!deltautil", "deltautil",
    "!delta útil", "delta útil", "delta util", "delta utils", "!centralutil",
    "delta de agora", "toma esse delta", "pega o delta",
)
MULTIBUSSOLA_META_ALIASES = (
    "!multibussola_meta", "!multibússola_meta", "multibussola_meta", "multibússola_meta"
)
MULTIBUSSOLA_META_ROUTES = [
    "FORWARD_ROUTE", "REVERSE_ROUTE", "INVERSE_ROUTE", "CROSS_BEARING_RENDEZVOUS"
]
MULTIBUSSOLA_PROOF_GATES = [
    "PROOF_TARGET_MATCH",
    "PROOF_OWNERSHIP",
    "INDEPENDENT_COUNTERPROOF",
    "EXTERNAL_ANCHOR_WHEN_APPLICABLE",
    "REMEDICAO_T1",
    "REALITY_JUDGE",
]
TIK_TAK_ROLE_ORDER = ["GEOFF", "IAN", "GREG", "DEX", "HERMES", "REALIDADE"]
TIK_TAK_ROLE_BINDINGS = {
    "GEOFF": "AUTOMATION_FACTORY",
    "IAN": "STRUCTURAL_SKEPTIC",
    "GREG": "OBSERVABILITY_PROOF",
    "DEX": "HUMAN_AGENT_COORDINATION",
    "HERMES": "EXECUTION_ROLE",
    "REALIDADE": "REALITY_JUDGE",
}
TIK_TAK_OUTER_LOOP = [
    "REMEASURE_CURRENT_STATE",
    "/goal",
    "SELECT_EXISTING_EXECUTOR",
    "LAUNCH_THROUGH_EXISTING_OWNER",
    "OBSERVE",
    "REVIEW",
    "COUNTERPROOF",
    "REMEASURE",
    "CONTINUE_TO_PROOF_FIXED_POINT_OR_NEXT_CURSOR",
]
TIK_TAK_LOCKS = [
    "GREG_VERDICT_REQUIRED_BEFORE_GREEN",
    "DEX_APPROVAL_REQUIRED_FOR_CRITICAL_DELTA",
    "CI_PENDING_IS_NOT_PASS",
    "MERGE_IS_NOT_DEPLOY",
    "HERMES_IS_EXECUTOR",
    "REALIDADE_IS_JUDGE",
]
NEGATION_TOKENS = {"nao", "nunca", "sem"}

MASTER_INGRESS_ALIASES = {
    "CENTRALDARK_MASTER": (
        "!centraldark", "#centraldark", "!central-dark", "#central-dark", "!cdark", "#cdark",
        "centraldark visualize", "central dark visualize",
        "centraldark executar", "central dark executar",
        "centraldark verificar", "central dark verificar",
        "centraldark editar", "central dark editar",
        "centraldark comitar", "central dark comitar",
        "centraldark rodar", "central dark rodar",
    ),
    "ACORDAR": ("#acordar", "#acorda", "!acordar", "!acorda"),
    "CALIBRAR": ("!calibrar", "#calibrar"),
    "CRISTALIZAR": ("#cristalizar", "!cristalizar", "#crystalizar", "!crystalizar", "#crystalaizar", "!crystalaizar"),
    "GARIMPO_UNIVERSAL": ("!garimpo_universal", "!garimpo universal", "#garimpo_universal", "#garimpo universal"),
    "MULTIBUSSOLA": ("!multibussola", "!multibússola", "!multi-bussola", "!multibussola_meta", "!multibússola_meta"),
    "META_LUPA": ("!meta_lupa", "!metalupa"),
    "RECONCILIAR": ("!reconciliar",),
    "DELTA_UTIL": ("!delta utils", "!deltautils", "!delta util", "!deltautil", "!delta útil", "!centralutil"),
    "CONTRAPROVA": ("!contraprova",),
    "REMEDICAO": ("!remedição", "!remedicao"),
    "TIK_TAK": ("!tik-tak", "!tik_tak", "#tik-tak", "#tik_tak"),
    "FIXED_POINT": ("!fixed_point",),
    "REGISTRA": ("!registra",),
    "RASTRO": ("!rastro", "!lei do rastro", "!cadeado"),
    "BOOT": ("!boot",),
    "FABLE_LOOP": ("!fable_loop", "#fable_loop", "!fabler_loop", "#fabler_loop"),
}

INVOCATION_GRAMMAR_PATH = (
    Path(__file__).resolve().parents[2]
    / "docs" / "ARQUITETURA" / "CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md"
)


def _grammar_verb_aliases(path: Path = INVOCATION_GRAMMAR_PATH) -> tuple[str, ...]:
    """Verbos do dono único (gramática §3 verb_dispatch). Sem cópia local para envelhecer."""
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return ()
    section = text.split("## 3.", 1)[-1].split("## 4.", 1)[0]
    verbs: list[str] = []
    for found in re.findall(r"aliases:\s*\[([^\]]*)\]", section):
        verbs.extend(v.strip().strip("\"'") for v in found.split(",") if v.strip())
    phrases: list[str] = []
    for verb in verbs:
        phrases.extend((f"centraldark {verb}", f"central dark {verb}"))
    return tuple(dict.fromkeys(phrases))


GRAMMAR_VERB_PHRASES = _grammar_verb_aliases()
MASTER_INGRESS_ALIASES["CENTRALDARK_MASTER"] = tuple(
    dict.fromkeys(MASTER_INGRESS_ALIASES["CENTRALDARK_MASTER"] + GRAMMAR_VERB_PHRASES)
)

VOICE_INGRESS_ALIASES = {
    "GARIMPO_UNIVERSAL": (
        "garimpo universal",
        "centraldark garimpo universal",
        "central dark garimpo universal",
    ),
    "CENTRALDARK_MASTER": (
        "centraldark visualize", "central dark visualize",
        "centraldark executar", "central dark executar",
        "centraldark verificar", "central dark verificar",
        "centraldark editar", "central dark editar",
        "centraldark comitar", "central dark comitar",
        "centraldark rodar", "central dark rodar",
    ),
    "ACORDAR": (
        "acordar",
        "acorda",
        "sol acordar",
        "sol acorda",
        "centraldark acordar",
        "central dark acordar",
        "centraldark sol acordar",
        "central dark sol acordar",
        "acordar centraldark",
        "acorda centraldark",
    ),
}
VOICE_INGRESS_ALIASES["CENTRALDARK_MASTER"] = tuple(
    dict.fromkeys(VOICE_INGRESS_ALIASES["CENTRALDARK_MASTER"] + GRAMMAR_VERB_PHRASES)
)

CANONICAL_SOL_PROFILE_ID = "ORQUESTRACAO_SOL"
CANONICAL_SOL_PROFILE_DISPLAY = "😎 Orquestração SOL 🌞"

HUMAN_IDENTITY_VERSION_PATTERNS = (
    re.compile(r"(?i)\b(?:centraldark|sol|hermes|pivete|boot)[a-z0-9_-]*(?:[_-]v[1-9][0-9]*)\b"),
    re.compile(r"(?i)\b(?:centraldark|sol|hermes|pivete|boot|perfil|profile|identidade(?:\s+visual)?)\s+(?:v|versao|versão)\s*[1-9][0-9]*(?:\.[0-9]+)*\b"),
)


def normalize(text: str) -> str:
    raw = unicodedata.normalize("NFKD", str(text or ""))
    raw = "".join(ch for ch in raw if not unicodedata.combining(ch)).lower()
    raw = re.sub(r"[^a-z0-9!#@/_\-\s]+", " ", raw)
    # "centraldark! faça" (transcrição de voz): marcador só vale no começo da palavra
    raw = re.sub(r"(?<=[a-z0-9])[!#]+", " ", raw)
    return " ".join(raw.strip().split())


def _phrase_match(normalized: str, phrase: str):
    target = normalize(phrase)
    if not target:
        return None
    hay, needle = normalized.split(), target.split()
    for start in range(0, len(hay) - len(needle) + 1):
        if hay[start:start + len(needle)] == needle:
            return start, start + len(needle)
    return None


def _negated_or_discussed(normalized: str, match) -> bool:
    if not match:
        return False
    tokens = normalized.split()
    start, end = match
    neighborhood = tokens[max(0, start - 4):start] + tokens[end:min(len(tokens), end + 5)]
    if any(t in NEGATION_TOKENS for t in neighborhood):
        return True
    joined = " ".join(neighborhood)
    return any(
        p in joined
        for p in (
            "nao deve",
            "nao executar",
            "nao execute",
            "nao usar",
            "nao use",
            "apenas mencionar",
            "so mencionar",
            "somente discutir",
            "falando sobre",
            "falei de",
            "falei do",
            "falei da",
            "falou de",
            "falou do",
            "falou da",
        )
    )


def _resolve_delta(normalized: str):
    for alias in DELTA_ALIASES:
        match = _phrase_match(normalized, alias)
        if match:
            return (alias, False, True) if _negated_or_discussed(normalized, match) else (alias, True, False)
    return None, False, False


def _collect_alias_matches(normalized: str, alias_map):
    active, ambiguous = [], []
    tokens = normalized.split()
    resume_verbs = {"continue", "continua", "prossiga", "retome"}
    for trigger_id, aliases in alias_map.items():
        for alias in aliases:
            match = _phrase_match(normalized, alias)
            if not match:
                continue
            if trigger_id == "CENTRALDARK_MASTER" and alias.startswith(("centraldark ", "central dark ")):
                _, end = match
                verb = alias.split()[-1]
                if end == len(tokens) and verb not in resume_verbs:
                    continue
            item = {"trigger_id": trigger_id, "alias": alias}
            (ambiguous if _negated_or_discussed(normalized, match) else active).append(item)
            break
    return active, ambiguous


def _resolve_master_ingress(normalized: str, input_mode: str = "text"):
    active, ambiguous = _collect_alias_matches(normalized, MASTER_INGRESS_ALIASES)
    if input_mode == "voice":
        voice_active, voice_ambiguous = _collect_alias_matches(normalized, VOICE_INGRESS_ALIASES)
        seen = {(item["trigger_id"], item["alias"]) for item in active + ambiguous}
        for item in voice_active:
            key = (item["trigger_id"], item["alias"])
            if key not in seen:
                active.append({**item, "voice": True})
                seen.add(key)
        for item in voice_ambiguous:
            key = (item["trigger_id"], item["alias"])
            if key not in seen:
                ambiguous.append({**item, "voice": True})
                seen.add(key)
    return active, ambiguous


def _normalized_phase_status(phase_status):
    normalized = {}
    for key, value in (phase_status or {}).items():
        phase = str(key or "").strip().upper()
        status = str(value or "UNKNOWN").strip().upper()
        normalized[phase] = status if status in GUIDED_TELEMETRY_STATUSES else "UNKNOWN"
    return normalized


def build_guided_telemetry(
    master_cycle_active: bool,
    matched_trigger_ids=None,
    phase_status=None,
    intent_ok=None,
    intent_reason=None,
    previous_failure=None,
):
    matched_trigger_ids = list(matched_trigger_ids or [])
    supplied = _normalized_phase_status(phase_status)
    steps = []

    for phase, label in GUIDED_TELEMETRY_PHASES:
        status = supplied.get(phase, "UNKNOWN")
        if phase == "CENTRALDARK" and master_cycle_active and phase not in supplied:
            status = "PASS"
        if phase == "ACORDAR" and "ACORDAR" in matched_trigger_ids and phase not in supplied:
            status = "PASS"
        if phase == "INTENT_SCOPE":
            if intent_ok is True:
                status = "PASS"
            elif intent_ok is False:
                status = "FAIL"
        steps.append({"phase": phase, "label": label, "status": status})

    failure = None
    if intent_ok is False:
        failure = {
            "phase": "INTENT_SCOPE",
            "status": "FAIL",
            "reason": str(intent_reason or "Desvio da intenção original detectado."),
        }
    if failure is None:
        for step in steps:
            if step["status"] in ("FAIL", "BLOCKED"):
                failure = {
                    "phase": step["phase"],
                    "status": step["status"],
                    "reason": f"{step['label']} marcou {step['status']}.",
                }
                break

    mandatory = [step for step in steps if step["status"] != "SKIPPED"]
    if failure:
        overall = "FAIL" if failure["status"] == "FAIL" else "BLOCKED"
    elif master_cycle_active and mandatory and all(step["status"] == "PASS" for step in mandatory):
        overall = "PASS"
    elif master_cycle_active:
        overall = "IN_PROGRESS"
    else:
        overall = "INACTIVE"

    next_cursor = failure["phase"] if failure else next(
        (step["phase"] for step in steps if step["status"] == "UNKNOWN"),
        None,
    )
    visual_chain = " → ".join(
        f"{GUIDED_TELEMETRY_ICONS[step['status']]} {step['label']}" for step in steps
    )
    copyable_chain = " → ".join(label for _, label in GUIDED_TELEMETRY_PHASES)

    return {
        "schema": "centraldark.guided-telemetry.v1",
        "render_required": bool(master_cycle_active),
        "rendering_is_operational_method_not_decoration": True,
        "surfaces": GUIDED_TELEMETRY_SURFACES,
        "status": overall,
        "copyable_chain": copyable_chain,
        "visual_chain": visual_chain,
        "steps": steps,
        "failure": failure,
        "previous_failure": previous_failure,
        "next_cursor": next_cursor,
        "red_x_on_failure": True,
        "exact_failed_phase_required": True,
        "intent_scope_must_be_evaluated": True,
        "unknown_is_pass": False,
        "previous_failure_stitches_next_execution": True,
        "same_path_can_be_replayed_by_another_agent": True,
        "telemetry_is_authority": False,
        "telemetry_requires_external_proof_for_green": True,
    }


def render_guided_telemetry(telemetry, ansi: bool = False) -> str:
    if not telemetry or not telemetry.get("render_required"):
        return ""
    bold = "\033[1m" if ansi else ""
    red = "\033[91m" if ansi else ""
    yellow = "\033[93m" if ansi else ""
    green = "\033[92m" if ansi else ""
    reset = "\033[0m" if ansi else ""

    lines = [
        f"{bold}# !CENTRALDARK — TELEMETRIA GUIADA{reset}",
        telemetry.get("visual_chain", ""),
    ]
    failure = telemetry.get("failure")
    previous = telemetry.get("previous_failure")
    if failure:
        lines.extend([
            f"{red}{bold}❌ FORA DO PADRÃO — {failure.get('phase', 'UNKNOWN')}{reset}",
            f"{red}CAUSA: {failure.get('reason', 'não informada')}{reset}",
            f"{yellow}PRÓXIMO CURSOR: {telemetry.get('next_cursor') or 'UNKNOWN'}{reset}",
        ])
    elif telemetry.get("status") == "PASS":
        lines.append(f"{green}{bold}✅ CADEIA FECHADA SOB STATUS INFORMADO{reset}")
    else:
        lines.append(f"{yellow}⚠️ CADEIA EM ANDAMENTO — próximo cursor: {telemetry.get('next_cursor') or 'UNKNOWN'}{reset}")
    if previous:
        lines.append(
            f"🧵 COSTURA DO PASSADO: {previous.get('phase', 'UNKNOWN')} — {previous.get('reason', 'sem detalhe')}"
        )
    return "\n".join(lines)


def validate_human_identity_naming(text: str):
    raw = str(text or "")
    violations = []
    for pattern in HUMAN_IDENTITY_VERSION_PATTERNS:
        for match in pattern.finditer(raw):
            violations.append({"match": match.group(0), "start": match.start(), "end": match.end()})
    return {
        "schema": "centraldark.human-identity-naming-guard",
        "ok": not violations,
        "canonical_identity_is_single": True,
        "canonical_visual_identity_is_single": True,
        "human_facing_version_suffix_forbidden": True,
        "technical_schema_api_version_is_identity": False,
        "violations": violations,
    }


def evaluate_multibussola_state(state):
    required = bool(state.get("required_bearings_covered"))
    contradiction = bool(state.get("material_contradiction"))
    local = bool(state.get("local_analysis_stable")) and required and not contradiction
    unknown = int(state.get("unknown_material", 0))
    counterproof = bool(state.get("counterproof_survives"))
    t1 = bool(state.get("t1_stable"))

    ephemeral_workspace_used = bool(state.get("ephemeral_workspace_used"))
    ephemeral_cleanup_readback_pass = bool(state.get("ephemeral_cleanup_readback_pass"))
    ephemeral_unclassified_residue = int(state.get("ephemeral_unclassified_residue", 0))
    ephemeral_cleanup_ok = (
        not ephemeral_workspace_used
        or (ephemeral_cleanup_readback_pass and ephemeral_unclassified_residue == 0)
    )

    if not local:
        verdict = "RESIDUAL_MAP_NEXT_CURSOR"
    elif state.get("failure_stable"):
        verdict = "FIXED_POINT_FAIL"
    elif state.get("frontier_stable"):
        verdict = "FIXED_POINT_BLOCKED"
    elif unknown == 0 and counterproof and t1 and ephemeral_cleanup_ok:
        verdict = "FIXED_POINT_PASS"
    else:
        verdict = "LOCAL_FIXED_POINT_NOT_YET"
    return {
        "local_analysis_stable": local,
        "local_fixed_point": local,
        "local_fixed_point_ends_global_mission": False,
        "unknown_material": unknown,
        "required_bearings_covered": required,
        "material_contradiction": contradiction,
        "counterproof_survives": counterproof,
        "t1_stable": t1,
        "ephemeral_workspace_used": ephemeral_workspace_used,
        "ephemeral_cleanup_required": ephemeral_workspace_used,
        "ephemeral_cleanup_readback_pass": ephemeral_cleanup_readback_pass,
        "ephemeral_unclassified_residue": ephemeral_unclassified_residue,
        "ephemeral_cleanup_ok": ephemeral_cleanup_ok,
        "verdict": verdict,
        "mission_state": "CLOSED" if verdict == "FIXED_POINT_PASS" and state.get("global_objective_closed") else "NOT_YET",
    }


def resolve(
    text: str,
    master_active: bool = False,
    chefe_source: bool = False,
    bot_entry: bool = False,
    phase_status=None,
    intent_ok=None,
    intent_reason=None,
    previous_failure=None,
    input_mode: str = "text",
    source_surface=None,
    session_id=None,
    profile_id=None,
    profile_display=None,
):
    raw = str(text or "")
    normalized = normalize(raw)
    mode = str(input_mode or "text").strip().lower()
    if mode not in {"text", "voice"}:
        mode = "text"

    ingress, ambiguous_ingress = _resolve_master_ingress(normalized, input_mode=mode)
    ids = [x["trigger_id"] for x in ingress]
    aliases = [x["alias"] for x in ingress]
    ambiguous_ids = [x["trigger_id"] for x in ambiguous_ingress]

    master_marker_seen = "CENTRALDARK_MASTER" in ids or "CENTRALDARK_MASTER" in ambiguous_ids
    master_ambiguous = "CENTRALDARK_MASTER" in ambiguous_ids
    explicit_master = bool("CENTRALDARK_MASTER" in ids and chefe_source)
    explicit_subtrigger = bool(any(i != "CENTRALDARK_MASTER" for i in ids) and chefe_source)
    inherited = bool(master_active or bot_entry)
    master_cycle_active = bool(explicit_master or explicit_subtrigger or inherited)
    untrusted_master_attempt = bool(ids and not chefe_source)

    if master_active:
        activation_source = "INHERITED_SESSION"
    elif bot_entry:
        activation_source = "BOT_ENTRY"
    elif explicit_master:
        activation_source = "VOICE_TRIGGER" if mode == "voice" else "EXPLICIT_TRIGGER"
    elif explicit_subtrigger:
        activation_source = "VOICE_SUBTRIGGER_FUNNEL" if mode == "voice" else "SUBTRIGGER_FUNNEL"
    else:
        activation_source = None

    chefe_material = bool(chefe_source and master_cycle_active and not ambiguous_ingress)
    delta_match, delta_active, delta_ambiguous = _resolve_delta(normalized)
    garimpo_universal_active = "GARIMPO_UNIVERSAL" in ids
    harvest_active = bool(delta_active or chefe_material or garimpo_universal_active)
    tik_tak_active = "TIK_TAK" in ids
    meta_match = next((a for a in MULTIBUSSOLA_META_ALIASES if _phrase_match(normalized, a)), None)
    meta_active = meta_match is not None

    guided_telemetry = build_guided_telemetry(
        master_cycle_active,
        matched_trigger_ids=ids,
        phase_status=phase_status,
        intent_ok=intent_ok,
        intent_reason=intent_reason,
        previous_failure=previous_failure,
    )

    session_ref = str(session_id or "").strip() or None
    canonical_profile_id = str(profile_id or "").strip() or CANONICAL_SOL_PROFILE_ID
    canonical_profile_display = str(profile_display or "").strip() or CANONICAL_SOL_PROFILE_DISPLAY
    surface = str(source_surface or "").strip().upper() or ("VOICE" if mode == "voice" else "UNKNOWN")

    return {
        "schema": "centraldark.master-cycle-receipt.v1",
        "input": raw,
        "normalized": normalized,
        "input_mode": mode,
        "source_surface": surface,
        "master_trigger": MASTER,
        "explicit_marker_seen": master_marker_seen,
        "explicit_match": explicit_master,
        "master_ambiguous_or_negated": master_ambiguous,
        "untrusted_master_attempt": untrusted_master_attempt,
        "master_cycle_active": master_cycle_active,
        "activation_source": activation_source,
        "next_master_active": master_cycle_active,
        "expanded_chain": CHAIN if master_cycle_active else [],
        "visual_trigger_chain": (
            " → ".join([
                "⭕ !AURÉOLA CANÔNICA",
                f"{TRIGGER_EMOJIS['CENTRALDARK']} !CENTRALDARK",
                *[f"{TRIGGER_EMOJIS[x]} {x}" for x in CHAIN],
            ]) if master_cycle_active else ""
        ),
        "aureola": {
            "role": "VISIBLE_ROUTE_DEBUGGER",
            "contract": "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml",
            "visible_fields": ["CURRENT_PHASE", "MULTIBUSSOLA_AXIS", "DESTINATION_OWNER", "NEXT_GATE"],
            "compare": ["INTENT_ROUTE", "ACTUAL_ROUTE"],
            "mismatch_action": "STOP_AND_RECONCILE",
            "route_trace_is_private_reasoning": False,
            "route_trace_is_technical_proof": False,
            "bible_reference_is_semantic_cue_not_proof": True,
            "material_discovery_is_learning_candidate_not_fact": True,
        },
        "intent_alignment": {
            "phase": "CALIBRAR",
            "emoji": TRIGGER_EMOJIS["CALIBRAR"],
            "threshold_percent": INTENT_ALIGNMENT_THRESHOLD_PERCENT,
            "percentage_means": "INTERPRETATION_ALIGNMENT_NOT_RUNTIME_PASS",
            "continuous_recalibration": True,
            "new_chefe_material": "DELTA_TO_ACTIVE_INTENT_FIRST",
            "preserve_compatible_active_intent": True,
            "replacement_requires": "EXPLICIT_REPLACE_OR_PROVEN_MATERIAL_INCOMPATIBILITY",
            "pertinence_first": True,
            "minimum_sufficient_loop": True,
            "triggers_are_conditional_not_ritual": True,
            "new_teaching": "REMIX_MINIMUM_DELTA_IN_EXISTING_RULE",
            "do_not_parrot_chefe": True,
            "align_thought_not_wording": True,
            "execute_when_gte_threshold_and_scope_authorized": True,
            "below_threshold_or_material_contradiction": "ASK_ONLY_INDISPENSABLE_GAP",
        },
        "guided_telemetry": guided_telemetry,
        "session_provenance": {
            "session_id": session_ref,
            "profile_id": canonical_profile_id,
            "profile_display": canonical_profile_display,
            "session_id_is_authority": False,
            "profile_is_authority": False,
            "session_change_is_new_mission": False,
            "model_change_resets_mission": False,
            "route": "RANDOLF -> KNOWLEDGE_HUB -> NOTIFICATION_HUB",
        },
        "master_funnel": {
            "canonical_entry": MASTER,
            "matched_trigger_ids": ids,
            "matched_aliases": aliases,
            "ambiguous_trigger_ids": ambiguous_ids,
            "normalized_to_master": bool(explicit_subtrigger and not inherited),
            "master_reentry_guard": bool(inherited and ids),
            "requested_phases": [i for i in ids if i not in ("CENTRALDARK_MASTER", "FABLE_LOOP", "CRISTALIZAR", "GARIMPO_UNIVERSAL")],
            "requested_modes": [i for i in ids if i == "GARIMPO_UNIVERSAL"],
            "requested_methods": [i for i in ids if i == "FABLE_LOOP"],
            "phase_markers": [i for i in ids if i == "CRISTALIZAR"],
            "cristalizar_is_phase_marker_not_engine": True,
            "voice_is_modality_not_second_trigger_system": True,
            "markerless_alias_opens_master": mode == "voice",
            "all_explicit_human_triggers_enter_master_once": True,
        },
        "delta_harvest": {
            "canonical_signal": DELTA_CANONICAL,
            "active": harvest_active,
            "explicit_signal_active": delta_active,
            "garimpo_universal_active": garimpo_universal_active,
            "owner": ".agents/skills/session-intelligence-harvester/SKILL.md" if harvest_active else None,
            "semantic_identity": "OWNER+CAPABILITY+SCOPE" if harvest_active else None,
            "multi_surface_parallel_candidates": harvest_active,
            "one_canonical_finalizer_per_scope": harvest_active,
            "candidate_lane_is_not_canonical_write": harvest_active,
            "same_finding_without_new_evidence": "DROP_DUPLICATE" if harvest_active else None,
            "next_executor_replay": "LAST_GOOD_STATE->INPUT_DIFF->REUSE_PROOF_OR_TARGETED_REVALIDATION" if harvest_active else None,
            "candidate_from_chefe": chefe_material,
            "ambiguous_or_negated": delta_ambiguous,
            "matched_alias": delta_match,
            "mode": "DELTA_HARVEST" if harvest_active else ("UNKNOWN" if delta_ambiguous else None),
            "route_to_existing_owner": harvest_active,
            "information_gain_required": harvest_active,
            "zero_regression": harvest_active,
            "no_parallel_version_identity": harvest_active,
            "claim_is_fact": False,
            "screen_is_runtime_proof": False,
            "repetition_is_independent_proof": False,
            "temporal_label_is_authority": False,
        },
        "tik_tak": {
            "canonical_signal": "!TIK-TAK",
            "active": tik_tak_active,
            "canonical_rule": "REGRA-ZERO-CENTRALDARK" if tik_tak_active else None,
            "semantic_family": "AUTOMATION_FACTORY_OUTER_LOOP" if tik_tak_active else None,
            "owner": "docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md" if tik_tak_active else None,
            "wraps_master_cycle": tik_tak_active,
            "goal_step": "/goal" if tik_tak_active else None,
            "role_order": TIK_TAK_ROLE_ORDER if tik_tak_active else [],
            "role_bindings": TIK_TAK_ROLE_BINDINGS if tik_tak_active else {},
            "geoff_formula": ["IMPLEMENTACAO", "SIMPLIFICACAO"] if tik_tak_active else [],
            "outer_loop_sequence": TIK_TAK_OUTER_LOOP if tik_tak_active else [],
            "locks": TIK_TAK_LOCKS if tik_tak_active else [],
            "greg_verdict_required_before_green": tik_tak_active,
            "dex_approval_required_for_critical_delta": tik_tak_active,
            "ci_pending_is_not_pass": tik_tak_active,
            "merge_is_not_deploy": tik_tak_active,
            "hermes_is_executor": tik_tak_active,
            "reality_is_judge": tik_tak_active,
            "select_existing_executor_only": tik_tak_active,
            "works_above_coding_agents": tik_tak_active,
            "invalidate_only_affected_stale_proof": tik_tak_active,
            "remeasure_current_target": tik_tak_active,
            "rerun_affected_gates": tik_tak_active,
            "same_head_counterproof_required": tik_tak_active,
            "preserve_unaffected_valid_proof": tik_tak_active,
            "continue_until": "PROOF_OR_FIXED_POINT_OR_NEXT_CURSOR" if tik_tak_active else None,
            "fanout_agents": False,
            "is_swarm_trigger": False,
            "creates_new_owner": False,
            "creates_new_brain_or_router": False,
        },
        "identity_naming_guard": {
            "canonical_identity_is_single": True,
            "canonical_visual_identity_is_single": True,
            "human_facing_version_suffix_forbidden": True,
            "technical_schema_api_version_is_identity": False,
        },
        "multibussola": {
            "canonical_signal": "!MULTIBUSSOLA",
            "active": meta_active,
            "matched_alias": meta_match,
            "mode": "META" if meta_active else None,
            "profile": "META_MULTIBUSSOLA" if meta_active else None,
            "owner": "docs/CONSCIENCIA/MULTIBUSSOLA.md" if meta_active else None,
            "routes": MULTIBUSSOLA_META_ROUTES if meta_active else [],
            "proof_gates": MULTIBUSSOLA_PROOF_GATES if meta_active else [],
            "invalidate_stale_bearings_on_material_change": meta_active,
            "unknown_material_must_be_zero_for_pass": meta_active,
            "fixed_point_is_pass": False,
            "creates_new_pipeline": False,
            "creates_new_owner": False,
        },
        "status": "MATCH" if (master_cycle_active or harvest_active or meta_active) else (
            "UNKNOWN" if (delta_ambiguous or ambiguous_ingress or untrusted_master_attempt) else "NO_MATCH"
        ),
        "authority_changed": False,
        "mutation_authorized": False,
        "capability_is_authority": False,
        "agent_may_reduce_human_objective": False,
        "objective_must_be_preserved": True,
        "full_requested_material_must_be_processed": True,
        "session_observation_is_global_current_state": False,
        "single_reader_may_declare_global_reality": False,
        "divergent_readers_require_rendezvous": True,
        "current_reality_requires_reconciliation": True,
        "remote_screenshot_is_remote_proof": False,
        "session_memory_is_current_state": False,
        "connector_failure_is_provider_failure": False,
        "sensor_failure_is_world_failure": False,
        "transport_failure_requires_authorized_alternate_route": True,
        "alternate_route_must_remeasure_same_target": True,
        "tool_discovery_required_before_access_claim": bool(master_cycle_active),
        "claiming_no_access_before_tool_discovery_is_invalid": True,
        "remote_write_requires_proven_gate": True,
        "chat_only_knowledge": "FAIL",
        "session_memory_is_durable_state": False,
        "persistence_quorum_min": 1,
        "preferred_redundancy": 2,
        "mirror_is_second_owner": False,
        "backup_is_source_of_truth": False,
        "persistence_is_promotion": False,
        "old_copy_is_current_reality": False,
        "no_blind_overwrite": True,
        "durable_continuity_requires_receipt_and_next_cursor": True,
        "all_phases_considered": master_cycle_active,
        "phase_execution_is_adaptive": True,
        "unknown_is_pass": False,
        "graph_is_authority": False,
        "plain_word_centraldark_does_not_trigger": mode != "voice",
        "cross_chat_is_current_state": False,
        "github_substitutes_missing_chat_memory": False,
    }


def _load_session_state(state_file):
    if not state_file:
        return False, "DISABLED"
    path = Path(state_file)
    if not path.exists():
        return False, "ABSENT"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return False, "INVALID"
    if payload.get("schema") != "centraldark.master-session-state.v1":
        return False, "INVALID"
    return bool(payload.get("master_active")), "LOADED"


def _load_previous_failure(state_file):
    if not state_file:
        return None
    path = Path(state_file)
    if not path.exists():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return None
    if payload.get("schema") != "centraldark.master-session-state.v1":
        return None
    failure = payload.get("last_failure")
    return failure if isinstance(failure, dict) else None


def _store_session_state(state_file, master_active, last_failure=None):
    path = Path(state_file)
    payload = {
        "schema": "centraldark.master-session-state.v1",
        "master_active": bool(master_active),
        "last_failure": last_failure,
    }
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def resolve_with_session_state(
    text: str,
    state_file=None,
    chefe_source: bool = False,
    bot_entry: bool = False,
    master_active: bool = False,
    phase_status=None,
    intent_ok=None,
    intent_reason=None,
    input_mode: str = "text",
    source_surface=None,
    session_id=None,
    profile_id=None,
    profile_display=None,
):
    persisted_active, load_status = _load_session_state(state_file)
    previous_failure = _load_previous_failure(state_file)
    receipt = resolve(
        text,
        master_active=bool(master_active or persisted_active),
        chefe_source=chefe_source,
        bot_entry=bot_entry,
        phase_status=phase_status,
        intent_ok=intent_ok,
        intent_reason=intent_reason,
        previous_failure=previous_failure,
        input_mode=input_mode,
        source_surface=source_surface,
        session_id=session_id,
        profile_id=profile_id,
        profile_display=profile_display,
    )
    persisted = False
    if state_file and load_status != "INVALID":
        current_failure = receipt["guided_telemetry"].get("failure")
        next_failure = None if receipt["guided_telemetry"].get("status") == "PASS" else (current_failure or previous_failure)
        _store_session_state(state_file, receipt["next_master_active"], last_failure=next_failure)
        persisted = True
    receipt["session_state"] = {
        "owner": "CALLER_PROVIDED_SESSION_FILE",
        "load_status": load_status,
        "persisted": persisted,
        "path_exposed": False,
        "previous_failure_loaded": bool(previous_failure),
    }
    return receipt


def self_test():
    cases = []

    def add(name, ok):
        cases.append({"kind": name, "ok": bool(ok)})

    for token, phase in (
        ("#ACORDAR", "ACORDAR"),
        ("!CALIBRAR", "CALIBRAR"),
        ("!META_LUPA", "META_LUPA"),
        ("!RECONCILIAR", "RECONCILIAR"),
        ("!CENTRALUTIL", "DELTA_UTIL"),
        ("!CONTRAPROVA", "CONTRAPROVA"),
        ("!REMEDICAO", "REMEDICAO"),
        ("!TIK-TAK", "TIK_TAK"),
        ("!FIXED_POINT", "FIXED_POINT"),
        ("!REGISTRA", "REGISTRA"),
        ("!RASTRO", "RASTRO"),
        ("!BOOT", "BOOT"),
    ):
        r = resolve(token, chefe_source=True)
        add(
            "master_funnel",
            r["master_cycle_active"]
            and r["activation_source"] == "SUBTRIGGER_FUNNEL"
            and phase in r["master_funnel"]["matched_trigger_ids"],
        )

    r = resolve("!TIK-TAK", chefe_source=True)
    add(
        "tik_tak_outer_loop_preserves_remeasurement_without_swarm",
        r["tik_tak"]["active"]
        and r["tik_tak"]["canonical_rule"] == "REGRA-ZERO-CENTRALDARK"
        and r["tik_tak"]["semantic_family"] == "AUTOMATION_FACTORY_OUTER_LOOP"
        and r["tik_tak"]["role_order"] == TIK_TAK_ROLE_ORDER
        and r["tik_tak"]["role_bindings"] == TIK_TAK_ROLE_BINDINGS
        and r["tik_tak"]["outer_loop_sequence"] == TIK_TAK_OUTER_LOOP
        and r["tik_tak"]["greg_verdict_required_before_green"]
        and r["tik_tak"]["dex_approval_required_for_critical_delta"]
        and r["tik_tak"]["invalidate_only_affected_stale_proof"]
        and r["tik_tak"]["same_head_counterproof_required"]
        and not r["tik_tak"]["fanout_agents"]
        and not r["tik_tak"]["is_swarm_trigger"]
        and not r["tik_tak"]["creates_new_brain_or_router"],
    )

    r = resolve("!CENTRALDARK", chefe_source=True)
    add("master", r["explicit_match"] and r["expanded_chain"] == CHAIN)
    add(
        "tool_discovery_gate_present",
        any(step["phase"] == "TOOL_DISCOVERY" for step in r["guided_telemetry"]["steps"])
        and r["tool_discovery_required_before_access_claim"]
        and r["claiming_no_access_before_tool_discovery_is_invalid"],
    )
    add(
        "guided_telemetry_required",
        r["guided_telemetry"]["render_required"] and r["guided_telemetry"]["next_cursor"] == "ACORDAR",
    )

    r = resolve("#ACORDAR !CENTRALDARK", chefe_source=True)
    add(
        "guided_telemetry_acordar_and_master",
        r["guided_telemetry"]["steps"][0]["status"] == "PASS"
        and r["guided_telemetry"]["steps"][1]["status"] == "PASS",
    )

    r = resolve(
        "#ACORDAR !CENTRALDARK",
        chefe_source=True,
        phase_status={"REMEASURE": "PASS"},
        intent_ok=False,
        intent_reason="Saiu do escopo original",
    )
    add(
        "guided_telemetry_red_x_exact_phase",
        r["guided_telemetry"]["status"] == "FAIL"
        and r["guided_telemetry"]["failure"]["phase"] == "INTENT_SCOPE"
        and "Saiu do escopo" in render_guided_telemetry(r["guided_telemetry"]),
    )

    all_pass = {phase: "PASS" for phase, _ in GUIDED_TELEMETRY_PHASES}
    r = resolve("!CENTRALDARK", chefe_source=True, phase_status=all_pass, intent_ok=True)
    add(
        "guided_telemetry_pass_requires_all_steps",
        r["guided_telemetry"]["status"] == "PASS" and r["guided_telemetry"]["failure"] is None,
    )

    r = resolve("não execute #ACORDAR agora", chefe_source=True)
    add("negated_subtrigger", not r["master_cycle_active"] and r["status"] == "UNKNOWN")

    r = resolve("#ACORDAR", chefe_source=False)
    add("untrusted_subtrigger", not r["master_cycle_active"] and r["untrusted_master_attempt"])

    r = resolve("#ACORDAR", master_active=True, chefe_source=True)
    add(
        "reentry_guard",
        r["master_funnel"]["master_reentry_guard"] and r["activation_source"] == "INHERITED_SESSION",
    )

    r = resolve("CentralDark e o nome do repo")
    add("plain_word_guard", not r["master_cycle_active"] and r["status"] == "NO_MATCH")

    r = resolve("!CENTRALUTIL", chefe_source=True)
    add("centralutil_delta", r["delta_harvest"]["explicit_signal_active"] and r["master_cycle_active"])

    for token in ("#CRISTALIZAR", "!CRISTALIZAR", "#CRYSTALIZAR", "#CRYSTALAIZAR"):
        r = resolve(token, chefe_source=True)
        add(
            "cristalizar_funnels_once",
            r["master_cycle_active"]
            and r["activation_source"] == "SUBTRIGGER_FUNNEL"
            and r["master_funnel"]["phase_markers"] == ["CRISTALIZAR"]
            and r["master_funnel"]["cristalizar_is_phase_marker_not_engine"],
        )

    for phrase in ("#acordar", "!centraldark", "!centraldark sol acordar"):
        r = resolve(phrase, chefe_source=True)
        add("spoken_explicit_text_trigger", r["master_cycle_active"])

    # CHEFE 2026-09-27: voz = texto; "CentralDark" solto não abre o mestre (paridade + sob demanda)
    for phrase in ("acordar", "centraldark visualize o estado", "centraldark sol acordar", "sol acordar"):
        r = resolve(
            phrase,
            chefe_source=True,
            input_mode="voice",
            source_surface="HERMES_DESKTOP",
            session_id="20260905_031340_68bd10",
        )
        add(
            "voice_funnels_once",
            r["master_cycle_active"]
            and r["activation_source"] in {"VOICE_TRIGGER", "VOICE_SUBTRIGGER_FUNNEL"}
            and r["session_provenance"]["profile_id"] == CANONICAL_SOL_PROFILE_ID
            and r["master_funnel"]["voice_is_modality_not_second_trigger_system"]
            and r["tool_discovery_required_before_access_claim"],
        )

    r = resolve("centraldark", chefe_source=True, input_mode="text")
    add("plain_text_word_still_guarded", not r["master_cycle_active"])

    for mode in ("text", "voice"):
        add("plain_master_wake_is_neutral", not resolve("CentralDark", chefe_source=True, input_mode=mode)["master_cycle_active"])
        add("natural_master_requires_payload", not resolve("CentralDark visualize", chefe_source=True, input_mode=mode)["master_cycle_active"])
        add("natural_resume_uses_latest_cursor", resolve("CentralDark continue", chefe_source=True, input_mode=mode)["master_cycle_active"])
        for verb in ("visualize", "veja", "mostra", "leia", "observe", "mede", "faça", "faz", "executa", "corrige", "pluga", "costura", "sobe", "continue", "continua", "prossiga", "retome", "cristaliza", "registra", "sela", "receipt", "rastro", "contraprova", "valida", "testa", "verifica"):
            result = resolve(f"CentralDark {verb} alvo", chefe_source=True, input_mode=mode)
            add("canonical_operational_verb_dispatch", result["master_cycle_active"] and result["explicit_match"])

    r = resolve(
        "centraldark sol acordar",
        chefe_source=True,
        input_mode="voice",
        master_active=True,
    )
    add(
        "voice_reentry_guard",
        r["master_cycle_active"]
        and r["activation_source"] == "INHERITED_SESSION"
        and r["master_funnel"]["master_reentry_guard"],
    )

    for sample in (
        "BOOT_CENTRALDARK_BAIANES_V1",
        "CentralDark V2",
        "Hermes-v3",
        "identidade visual versão 4",
    ):
        add("identity_name_guard_rejects_parallel_suffix", not validate_human_identity_naming(sample)["ok"])

    for sample in (
        "schema centraldark.master-cycle-receipt.v1",
        "endpoint http://127.0.0.1:8099/v1/models",
        "API externa versão 2026-09-01",
    ):
        add("identity_name_guard_preserves_technical_version", validate_human_identity_naming(sample)["ok"])

    state_path = Path(__file__).with_name(".centraldark-telemetry-self-test.json")
    with state_path.open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "schema": "centraldark.master-session-state.v1",
                "master_active": True,
                "last_failure": {"phase": "TEST", "status": "FAIL", "reason": "falha anterior"},
            },
            handle,
        )
    try:
        r = resolve_with_session_state("continua", state_file=state_path, chefe_source=True)
        add(
            "guided_telemetry_stitches_previous_failure",
            r["guided_telemetry"]["previous_failure"]["phase"] == "TEST"
            and r["session_state"]["previous_failure_loaded"],
        )
    finally:
        try:
            state_path.unlink()
        except OSError:
            pass

    return {"ok": all(x["ok"] for x in cases), "cases": cases}


def _parse_phase_status(raw):
    if not raw:
        return None
    try:
        payload = json.loads(raw)
    except (TypeError, ValueError) as exc:
        raise SystemExit(f"--phase-status-json inválido: {exc}")
    if not isinstance(payload, dict):
        raise SystemExit("--phase-status-json deve ser um objeto JSON.")
    return payload


def _parse_intent_ok(raw):
    if raw is None or raw == "unknown":
        return None
    return raw == "true"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--master-active", action="store_true")
    parser.add_argument("--chefe-source", action="store_true")
    parser.add_argument("--bot-entry", action="store_true")
    parser.add_argument("--session-state-file")
    parser.add_argument("--check-human-identity-name")
    parser.add_argument("--telemetry", action="store_true", help="Exibe HUD/telemetria guiada antes do receipt JSON.")
    parser.add_argument("--phase-status-json", help="Mapa JSON de fase→UNKNOWN|ACTIVE|PASS|FAIL|BLOCKED|SKIPPED.")
    parser.add_argument("--intent-ok", choices=("true", "false", "unknown"), default="unknown")
    parser.add_argument("--intent-reason")
    parser.add_argument("--input-mode", choices=("text", "voice"), default="text")
    parser.add_argument("--source-surface")
    parser.add_argument("--session-id")
    parser.add_argument("--profile-id")
    parser.add_argument("--profile-display")
    args = parser.parse_args()

    if args.self_test:
        out = self_test()
    elif args.check_human_identity_name is not None:
        out = validate_human_identity_naming(args.check_human_identity_name)
    else:
        out = resolve_with_session_state(
            args.text or "",
            state_file=args.session_state_file,
            master_active=args.master_active,
            chefe_source=args.chefe_source,
            bot_entry=args.bot_entry,
            phase_status=_parse_phase_status(args.phase_status_json),
            intent_ok=_parse_intent_ok(args.intent_ok),
            intent_reason=args.intent_reason,
            input_mode=args.input_mode,
            source_surface=args.source_surface,
            session_id=args.session_id,
            profile_id=args.profile_id,
            profile_display=args.profile_display,
        )

    if args.telemetry and isinstance(out, dict) and out.get("guided_telemetry"):
        rendered = render_guided_telemetry(out["guided_telemetry"], ansi=sys.stdout.isatty())
        if rendered:
            print(rendered)
            print()
    print(json.dumps(out, ensure_ascii=False, indent=2, default=str))


if __name__ == "__main__":
    main()
