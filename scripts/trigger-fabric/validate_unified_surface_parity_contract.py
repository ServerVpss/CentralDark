#!/usr/bin/env python3
"""Validate CENTRALDARK_UNIFIED_SURFACE_PARITY_01 contract.

This validator is intentionally dependency-light. It does not execute runtime
changes. It checks whether the machine-readable contract still contains the
minimum invariants required by the CHEFE/SOL/HERMES operating law.
"""

from __future__ import annotations

import json
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "docs" / "ARQUITETURA" / "CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml"
INVOCATION_GRAMMAR = ROOT / "docs" / "ARQUITETURA" / "CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md"
SKILL = ROOT / ".agents" / "skills" / "centraldark-unified-surface-parity" / "SKILL.md"
HARVESTER = ROOT / ".agents" / "skills" / "session-intelligence-harvester" / "SKILL.md"
VOICE_CLASSIFIER = ROOT / ".claude" / "skills" / "synced" / "voice-semantic-classifier" / "SKILL.md"
INTENT_ROUTER = ROOT / ".agents" / "skills" / "centraldark-intent-deploy-router" / "SKILL.md"
INTENT_BINDING = ROOT / ".agents" / "INTENT-DEPLOY-BINDING.json"
TRIGGER_FAMILY_OWNER = ROOT / "docs" / "SEGURANCA" / "ADM-GATILHOS-OPERACIONAIS.json"
RECEIPT = ROOT / "docs" / "RECEIPTS" / "2026-09-26-CENTRALDARK-UNIFIED-SURFACE-PARITY-01.md"
INVOCATION_GRAMMAR_RECEIPT = ROOT / "docs" / "RECEIPTS" / "2026-09-27-CENTRALDARK-INVOCATION-GRAMMAR-01.md"
PLUGIN_SOURCE_ROOT = ROOT / ".agents" / "plugins" / "centraldark-unified-surface-parity"
PLUGIN_MANIFEST = PLUGIN_SOURCE_ROOT / "plugin.json"
PLUGIN_MCP = PLUGIN_SOURCE_ROOT / "mcp.json"
PLUGIN_BUNDLED_SKILL = PLUGIN_SOURCE_ROOT / "skills" / "centraldark-unified-surface-parity" / "SKILL.md"
PLUGIN_SOURCE = PLUGIN_SOURCE_ROOT / "SOURCE.json"

REQUIRED_FILES = [CONTRACT, INVOCATION_GRAMMAR, SKILL, HARVESTER, VOICE_CLASSIFIER, INTENT_ROUTER, INTENT_BINDING, TRIGGER_FAMILY_OWNER, RECEIPT, INVOCATION_GRAMMAR_RECEIPT, PLUGIN_MANIFEST, PLUGIN_MCP, PLUGIN_BUNDLED_SKILL, PLUGIN_SOURCE]

REQUIRED_MARKERS = {
    CONTRACT: [
        "id: CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "CRISTAL_PROVADO_EQ_REPLAY_FIRST: true",
        "trigger_master:",
        "auto_grill:",
        "gev_jev_adapter:",
        "surface_parity:",
        "voice_tool_binding",
        "PLATFORM_UNAVAILABLE",
        "VALIDATION_COST_SHOULD_SCALE_WITH_BLAST_RADIUS",
        "EVENT_ID",
        "CAUSATION_ID",
        "same_canonical_session: true",
        "shared_ordered_trace: true",
        "same_structured_outcome: true",
        "forbid_voice_only_session_or_trace: true",
        "plugin_publication_gate:",
        "PLUGIN_ARTIFACT_CREATED_NE_PLUGIN_PUBLISHED: true",
        "PLUGIN_DIRECTORY_MISS_NEQ_NOT_PUBLISHED: true",
        "PUBLISHED_PLUGIN_CLAIM_REQUIRES_ID_RELEASE_URL: true",
        "PLUGIN_SCOPE_MUST_BE_OBSERVED: true",
        "VOICE_BINDING_PUBLISHED_NE_VOICE_RUNTIME_EXPOSED: true",
        "CHEFE_INTENT_IS_AUTHORITY: true",
        "CHEFE_COMMAND_IS_NOT_MODEL_CLAIM: true",
        "MODEL_CLAIM_REQUIRES_PROOF: true",
        "MODEL_MAY_NOT_DOWNGRADE_CHEFE_INTENT_TO_UNKNOWN: true",
        "UNKNOWN_APPLIES_ONLY_TO_UNMEASURED_EXTERNAL_STATE: true",
        "EXTERNAL_REALITY_STILL_REQUIRES_MEASUREMENT: true",
    ],
    INVOCATION_GRAMMAR: [
        "# CENTRALDARK_INVOCATION_GRAMMAR_01",
        "**Owner:** CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "SOB_DEMANDA: true",
        "SAME_INTENT_PIPELINE: true",
        "wake_word:",
        "verb_dispatch:",
        "visualize:",
        "faca:",
        "continue:",
        "cristalize:",
        "contraprova:",
        "normalized_intent_shared: true",
        "same_canonical_SESSION_ID: true",
        "same_tool_call_visibility_when_supported: true",
        "same_usage_tokens_visibility_when_supported: true",
        "voice_tool_call_visibility_reuses_unified_surface_owner: true",
        "voice_semantic_classifier_is_renderer_owner: false",
        "NAO_CONFUNDIR_VISUALIZE_COM_EXECUTE",
        "NAO_CARREGAR_TUDO_POR_PADRAO",
        "PLATFORM_UNAVAILABLE",
        "NEXT_CURSOR:",
        "CANONICAL_CYCLE_IS_CONDITIONAL=true",
        "CANONICAL_TRIGGER_FAMILY_OWNER=docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json#trigger_chain",
        "ROUTE_ABOVE_IS_SUBSET_OF_OWNER=true",
        "FAMILY_NOT_DUPLICATED_HERE=true",
        "TRIGGER_FAMILY_IS_NOT_ALWAYS_FULL_EXECUTION=true",
        "NO_SECOND_PARSER=true",
        "VOICE_REUSES_EXISTING_CLASSIFIER=true",
        "INTENT_ROUTER_REUSED=true",
        "REALITY_IS_FINAL_JUDGE=true",
        "!CENTRALDARK !GARIMPO_UNIVERSAL",
        "MULTI_SURFACE_PARALLEL_CANDIDATES: true",
        "ONE_CANONICAL_FINALIZER_PER_SCOPE: true",
        "MULTI_MODEL != MULTI_TRUTH",
        "CHEFE_INTENT_IS_AUTHORITY: true",
        "MODEL_CLAIM_REQUIRES_PROOF: true",
        "UNKNOWN_APPLIES_ONLY_TO_UNMEASURED_EXTERNAL_STATE: true",
    ],
    SKILL: [
        "canonical_id: CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "# CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "CRISTAL_PROVADO = REPLAY_FIRST",
        "Auto-Grill",
        "GEV/JEV",
        "Voice Tool Binding",
        "TEXT ⇄ VOICE ⇄ WORK ⇄ DESKTOP",
        "PLATFORM_UNAVAILABLE",
        "único `SESSION_ID` canônico",
        "VOICE_TOOL_CALL_VISIBILITY_REUSES_UNIFIED_SURFACE_OWNER=true",
        "VOICE_SURFACE_ID_IS_PROVENANCE_ONLY=true",
        "trilha exclusiva da Voz",
        "contrato de saída estruturada é igual",
        ".claude/skills/synced/voice-semantic-classifier/SKILL.md",
        "CHEFE_INTENT_IS_AUTHORITY=true",
        "MODEL_CLAIM_REQUIRES_PROOF=true",
        "UNKNOWN_APPLIES_ONLY_TO_UNMEASURED_EXTERNAL_STATE=true",
    ],
    HARVESTER: [
        "## Modo GARIMPO_UNIVERSAL",
        "MULTI_SURFACE_PARALLEL_CANDIDATES=true",
        "MULTI_MODEL_PARALLEL_READERS=true",
        "ONE_CANONICAL_FINALIZER_PER_SCOPE=true",
        "PARALLEL_CANDIDATE_IS_NOT_CANONICAL_WRITE=true",
        "SEMANTIC_IDENTITY = OWNER + CAPABILITY + SCOPE",
        "SAME_FINDING_WITHOUT_NEW_EVIDENCE=DROP_DUPLICATE",
        "!CENTRALDARK !GARIMPO_UNIVERSAL",
    ],
    VOICE_CLASSIFIER: [
        "CENTRALDARK_INVOCATION_GRAMMAR_01=true",
        "CANONICAL_INVOCATION_GRAMMAR=docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md",
        "NO_SECOND_PARSER=true",
        "RAW_VOICE_TRANSCRIPT_PRESERVED=true",
        "NORMALIZED_INTENT_SHARED=true",
        "TEXT_AND_VOICE_SHARE_SEMANTIC_ACTION=true",
        "VOICE_TOOL_CALL_VISIBILITY_REUSES_UNIFIED_SURFACE_OWNER=true",
        "VOICE_MISSING_RENDERER_IS_NOT_EXECUTION_FAILURE=true",
        "VOICE_TOOL_RESULT_IS_NOT_RENDERER_PROOF=true",
        "PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true",
        "VOICE_CANONICAL_CONSUMPTION_PREFLIGHT=true",
        "VOICE_MAIN_IS_CANONICAL_SOURCE=true",
        "VOICE_POINTER_TEXT_IS_NOT_SOURCE=true",
        "VOICE_REPLAY_BEFORE_REDISCOVERY=true",
        "VOICE_TOOL_AVAILABLE_MUST_BE_ATTEMPTED_BEFORE_UNKNOWN=true",
        "VOICE_INVALID_RECIPIENT_REDISCOVER_ROUTE=true",
        "VOICE_MUST_NOT_CLAIM_CANNOT_EXECUTE_WHEN_AUTHORIZED_ROUTE_EXISTS=true",
    ],
    INTENT_ROUTER: [
        "CENTRALDARK_INVOCATION_GRAMMAR_01=true",
        "VOICE_CLASSIFIER_OWNER=.claude/skills/synced/voice-semantic-classifier/SKILL.md",
        "GRAMMAR_DISPATCH_PRECEDES_TOOL_SELECTION=true",
        "NO_SECOND_PARSER=true",
        "SAME_NORMALIZED_INTENT_ACROSS_SURFACES=true",
    ],
    INTENT_BINDING: [
        "\"invocation_grammar_binding\": {",
        "\"id\": \"CENTRALDARK_INVOCATION_GRAMMAR_01\"",
        "\"voice_classifier_owner\": \".claude/skills/synced/voice-semantic-classifier/SKILL.md\"",
        "\"no_second_parser\": true",
        "\"normalized_intent_shared_across_surfaces\": true",
        "\"live_voice_binding_status\": \"UNKNOWN_UNTIL_MEASURED\"",
    ],
    RECEIPT: [
        "# RECEIPT — CENTRALDARK_UNIFIED_SURFACE_PARITY_01",
        "Voice Tool Binding",
        "PERMISSION_EXISTS != TOOL_EXPOSED",
        "Cristal provado não deve ser redescoberto",
        "Comando para Worker / Cloud Code",
        "PASS:",
        "UNKNOWN:",
        "NEXT_CURSOR:",
        "same_canonical_SESSION_ID: true",
        "voice_only_session_or_trace: forbidden",
        "PLUGIN_PUBLICATION_STATUS=",
        "PLUGIN_ID=",
        "PLUGIN_RELEASE_ID=",
        "PLUGIN_URL=",
        "PLUGIN_SCOPE=",
        "PLUGIN_DIRECTORY_MISS_NEQ_NOT_PUBLISHED=true",
        "PUBLISHED_PLUGIN_CLAIM_REQUIRES_ID_RELEASE_URL=true",
        "UNKNOWN",
    ],
    INVOCATION_GRAMMAR_RECEIPT: [
        "# RECEIPT — CENTRALDARK_INVOCATION_GRAMMAR_01",
        "Owner pai: `CENTRALDARK_UNIFIED_SURFACE_PARITY_01`",
        "CENTRALDARK_INVOCATION_GRAMMAR_01: true",
        "MESMA_INTENCAO → MESMO_FUNIL → MESMO_OWNER → MESMA_PROVA",
        "NAO_CONFUNDIR_VISUALIZE_COM_EXECUTE",
        "NAO_CARREGAR_TUDO_POR_PADRAO",
        "NORMALIZED_INTENT_SHARED=true",
        "PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true",
        "validador exige o subcontrato e o receipt filho",
        "NEXT_CURSOR:",
    ],
}

REQUIRED_MARKERS.update({
    PLUGIN_MANIFEST: [
        '\"name\": \"centraldark-unified-surface-parity\"',
        '\"repository\": \"https://github.com/ServerVpss/CentralDark\"',
        '\"displayName\": \"CentralDark Unified Surface\"',
    ],
    PLUGIN_MCP: [
        '\"mcpServers\": {',
        '\"centraldark\": {',
        '\"type\": \"streamable-http\"',
        '\"url\": \"https://mcp.centralldark.com/mcp\"',
    ],
    PLUGIN_BUNDLED_SKILL: [
        '# CentralDark Unified Surface Parity',
        'distribution/binding adapter, not a second owner',
        'PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true',
        'NO_SECOND_PARSER=true',
        'VOICE_REUSES_EXISTING_CLASSIFIER=true',
        'Successful plugin publication does not itself prove Voice runtime exposure',
    ],
    PLUGIN_SOURCE: [
        '\"canonical_owner\": \"CENTRALDARK_UNIFIED_SURFACE_PARITY_01\"',
        '\"published_plugin_id\": \"plugins_6ab87b459ff08191a69311acd4c77d83\"',
        '\"published_scope\": \"USER\"',
        '\"published_discoverability\": \"PRIVATE\"',
        '\"generated_artifact_is_owner\": false',
    ],
})


FORBIDDEN_MARKERS = {
    HARVESTER: [
        "GARIMPO_UNIVERSAL_V2",
        "SECOND_HARVESTER=true",
    ],
    CONTRACT: [
        "CENTRALDARK_UNIFIED_SURFACE_PARITY_02",
        "V2",
        "parallel_runtime: true",
    ],
    INVOCATION_GRAMMAR: [
        "CENTRALDARK_UNIFIED_SURFACE_PARITY_02",
        "parallel_voice_runtime: true",
        "always_load_everything: true",
        "voice_side_channel: true",
        "VISUALIZE_EQUALS_EXECUTE: true",
    ],
    SKILL: [
        "novo sistema paralelo",
        ".agents/skills/voice-semantic-classifier/SKILL.md",
        "Este skill substitui Hermes integralmente",
        "substitui Hermes",
        "substitui SOL",
    ],
    RECEIPT: [
        "já testado na Casa após formatação",
        "GEV/JEV real online PASS",
    ],
    INVOCATION_GRAMMAR_RECEIPT: [
        "CENTRALDARK_UNIFIED_SURFACE_PARITY_02",
        "runtime paralelo de voz criado",
        "Voice binding real PASS",
    ],
}


# Valor real, não trecho: a chave precisa estar ativa (fora de comentário) com
# o valor exigido, e não pode aparecer ativa com outro valor.
REQUIRED_VALUES = {
    CONTRACT: {
        "CRISTAL_PROVADO_EQ_REPLAY_FIRST": "true",
        "same_canonical_session": "true",
        "shared_ordered_trace": "true",
        "same_structured_outcome": "true",
        "forbid_voice_only_session_or_trace": "true",
        "CLAIM_WITHOUT_COMMIT_ON_MAIN": "INVALID",
        "VALIDATED_CLAIM_REQUIRES_VALIDATOR_EXIT_0": "true",
        "PLUGIN_ARTIFACT_CREATED_NE_PLUGIN_PUBLISHED": "true",
        "PLUGIN_DIRECTORY_MISS_NEQ_NOT_PUBLISHED": "true",
        "PUBLISHED_PLUGIN_CLAIM_REQUIRES_ID_RELEASE_URL": "true",
        "PLUGIN_SCOPE_MUST_BE_OBSERVED": "true",
        "VOICE_BINDING_PUBLISHED_NE_VOICE_RUNTIME_EXPOSED": "true",
        "CHEFE_INTENT_IS_AUTHORITY": "true",
        "CHEFE_COMMAND_IS_NOT_MODEL_CLAIM": "true",
        "MODEL_CLAIM_REQUIRES_PROOF": "true",
        "MODEL_MAY_NOT_DOWNGRADE_CHEFE_INTENT_TO_UNKNOWN": "true",
        "UNKNOWN_APPLIES_ONLY_TO_UNMEASURED_EXTERNAL_STATE": "true",
        "EXTERNAL_REALITY_STILL_REQUIRES_MEASUREMENT": "true",
    },
}


def active_values(text: str, key: str) -> list[str]:
    pattern = re.compile(rf"^\s*{re.escape(key)}\s*:\s*([^#\n]*?)\s*(?:#.*)?$", re.M)
    return [m.group(1).strip().strip("\"'") for m in pattern.finditer(text)]


def validate_values(path: Path, text: str) -> list[str]:
    errors: list[str] = []
    for key, expected in REQUIRED_VALUES.get(path, {}).items():
        values = active_values(text, key)
        if not values:
            errors.append(f"MISSING_ACTIVE_KEY {path}: {key}")
        elif any(v != expected for v in values):
            errors.append(f"WRONG_VALUE {path}: {key}={values} expected={expected}")
    return errors


def validate_intent_binding_json(path: Path, text: str) -> list[str]:
    errors: list[str] = []
    try:
        data = __import__("json").loads(text)
    except Exception as exc:
        return [f"INVALID_JSON {path}: {exc}"]
    b = data.get("invocation_grammar_binding")
    expected = {
        "id": "CENTRALDARK_INVOCATION_GRAMMAR_01",
        "canonical_contract": "docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md",
        "voice_classifier_owner": ".claude/skills/synced/voice-semantic-classifier/SKILL.md",
        "intent_router_owner": ".agents/skills/centraldark-intent-deploy-router/SKILL.md",
        "no_second_parser": True,
        "wake_word_is_conditional_not_ritual": True,
        "normalized_intent_shared_across_surfaces": True,
        "raw_voice_transcript_preserved": True,
        "platform_unavailable_when_tool_not_exposed": True,
        "live_voice_binding_status": "UNKNOWN_UNTIL_MEASURED",
    }
    if not isinstance(b, dict):
        return [f"MISSING_BINDING {path}: invocation_grammar_binding"]
    for key, expected_value in expected.items():
        if b.get(key) != expected_value:
            errors.append(f"WRONG_BINDING_VALUE {path}: {key}={b.get(key)!r} expected={expected_value!r}")
    required_skills = set(data.get("canonical_skills", []))
    for required in {
        ".agents/skills/centraldark-unified-surface-parity/SKILL.md",
        ".claude/skills/synced/voice-semantic-classifier/SKILL.md",
    }:
        if required not in required_skills:
            errors.append(f"MISSING_CANONICAL_SKILL {path}: {required}")
    return errors


def _receipt_values(text: str, key: str) -> list[str]:
    return [m.strip() for m in re.findall(rf"(?m)^\s*{re.escape(key)}=(.*)$", text)]


def _receipt_value(text: str, key: str):
    """Valor único; várias linhas com valores diferentes viram conflito, não a primeira."""
    values = _receipt_values(text, key)
    if not values:
        return None
    if len(set(values)) > 1:
        return "CONFLICT:" + "|".join(sorted(set(values)))
    return values[0]


def validate_plugin_publication_receipt(path: Path, text: str) -> list[str]:
    errors: list[str] = []
    status = _receipt_value(text, "PLUGIN_PUBLICATION_STATUS")
    if status and status.startswith("CONFLICT:"):
        return [f"PLUGIN_PUBLICATION_STATUS_CONFLICT {path}: {status}"]
    if status not in {"UNKNOWN", "PASS", "BLOCKED"}:
        return [f"PLUGIN_PUBLICATION_STATUS_INVALID {path}: {status!r}"]
    if status == "PASS":
        required = {
            "PLUGIN_ID": _receipt_value(text, "PLUGIN_ID"),
            "PLUGIN_RELEASE_ID": _receipt_value(text, "PLUGIN_RELEASE_ID"),
            "PLUGIN_URL": _receipt_value(text, "PLUGIN_URL"),
            "PLUGIN_SCOPE": _receipt_value(text, "PLUGIN_SCOPE"),
            # contrato: pass_requires inclui current_release_readback
            "PLUGIN_RELEASE_READBACK": _receipt_value(text, "PLUGIN_RELEASE_READBACK"),
        }
        for key, value in required.items():
            if value in {None, "", "UNKNOWN", "NONE", "null"} or str(value).startswith("CONFLICT:"):
                errors.append(f"PLUGIN_PUBLICATION_PROOF_INCOMPLETE {path}: {key}={value!r}")
        url = required.get("PLUGIN_URL")
        if url not in {None, "", "UNKNOWN", "NONE", "null"} and not str(url).startswith("https://"):
            errors.append(f"PLUGIN_PUBLICATION_URL_INVALID {path}: {url!r}")
        # Recibo PASS precisa declarar o MESMO release/versão que SOURCE.json e plugin.json.
        try:
            source = json.loads(PLUGIN_SOURCE.read_text(encoding="utf-8"))
            manifest = json.loads(PLUGIN_MANIFEST.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            errors.append(f"PLUGIN_PUBLICATION_SOURCE_UNREADABLE {path}: {exc}")
            return errors
        expected_release = source.get("published_release_id") or source.get("release_id")
        expected_version = manifest.get("version")
        if required["PLUGIN_ID"] != source.get("published_plugin_id"):
            errors.append(f"PLUGIN_PUBLICATION_ID_DRIFT {path}: {required['PLUGIN_ID']!r} != {source.get('published_plugin_id')!r}")
        if required["PLUGIN_RELEASE_ID"] != expected_release:
            errors.append(f"PLUGIN_PUBLICATION_RELEASE_DRIFT {path}: {required['PLUGIN_RELEASE_ID']!r} != {expected_release!r}")
        readback = str(required["PLUGIN_RELEASE_READBACK"] or "")
        if not readback.startswith(f"{expected_release}|") or f"version={expected_version}" not in readback.split("|"):
            errors.append(f"PLUGIN_PUBLICATION_READBACK_DRIFT {path}: {readback!r} != {expected_release}|...|version={expected_version}")
    return errors


FLAG_MARKER = re.compile(r"^([A-Z][A-Z0-9_]*)=(\S+)$")


def validate_flag_contradictions(path: Path, text: str) -> list[str]:
    """Marcador KEY=valor exigido não pode conviver com KEY=outro_valor ativo."""
    errors: list[str] = []
    for marker in REQUIRED_MARKERS.get(path, []):
        m = FLAG_MARKER.match(marker)
        if not m:
            continue
        key, expected = m.groups()
        pattern = re.compile(rf"(?<![A-Z0-9_]){re.escape(key)}\s*=\s*([^\s`|,;)]+)")
        for line in text.splitlines():
            stripped = line.strip()
            if stripped.startswith("#") and not stripped.startswith("# "):
                continue
            for found in pattern.findall(line):
                if found != expected:
                    errors.append(f"CONTRADICTION {path}: {key}={found} expected={expected}")
    return errors


def validate_route_subset_of_owner(path: Path, text: str) -> list[str]:
    """Todo elo da rota comum escrita na gramática existe na família do dono."""
    import json

    try:
        chain = json.loads(TRIGGER_FAMILY_OWNER.read_text(encoding="utf-8"))["trigger_chain"]
    except Exception as exc:  # dono ausente ou ilegível não vira PASS
        return [f"TRIGGER_FAMILY_OWNER_UNREADABLE {TRIGGER_FAMILY_OWNER}: {exc}"]
    canonical = {item.split(" ", 1)[-1].strip() for item in chain}
    section = text.split("## 6.1", 1)[-1].split("```text", 1)[-1].split("```", 1)[0]
    errors: list[str] = []
    for line in section.splitlines():
        name = line.replace("→", "").strip()
        if not name:
            continue
        name = name.split(" ", 1)[-1].strip()
        if name not in canonical:
            errors.append(f"ROUTE_LINK_NOT_IN_OWNER {path}: {name}")
    return errors


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise AssertionError(f"MISSING_FILE: {path}")


# Proibição só vale para a forma afirmativa. "NAO_CRIAR_X", "não X",
# "forbid X" e "X: false" são a regra correta, não a violação.
NEGATION_PREFIX = re.compile(
    r"(NAO_CRIAR_|NAO_|NÃO_|\bnão\s+(?:\w+\s+){0,2}|\bnao\s+(?:\w+\s+){0,2}|\bnunca\s+|forbid_?)$",
    re.I,
)


def affirmative_occurrence(text: str, marker: str) -> bool:
    start = 0
    while (i := text.find(marker, start)) != -1:
        line_start = text.rfind("\n", 0, i) + 1
        before = text[line_start:i]
        if not NEGATION_PREFIX.search(before):
            return True
        start = i + len(marker)
    return False


def validate_file(path: Path) -> list[str]:
    errors: list[str] = []
    text = read_text(path)

    for marker in REQUIRED_MARKERS.get(path, []):
        if marker not in text:
            errors.append(f"MISSING_MARKER {path}: {marker}")

    for marker in FORBIDDEN_MARKERS.get(path, []):
        if affirmative_occurrence(text, marker):
            errors.append(f"FORBIDDEN_MARKER {path}: {marker}")

    errors.extend(validate_values(path, text))
    errors.extend(validate_flag_contradictions(path, text))
    if path == INVOCATION_GRAMMAR:
        errors.extend(validate_route_subset_of_owner(path, text))
    if path == INTENT_BINDING:
        errors.extend(validate_intent_binding_json(path, text))
    if path == RECEIPT:
        errors.extend(validate_plugin_publication_receipt(path, text))
    return errors


def validate_plugin_metadata() -> list[str]:
    """Validate current plugin identity without pinning a stale release.

    Source metadata consistency is not proof of live publication or Voice access.
    """
    errors: list[str] = []
    try:
        manifest = json.loads(PLUGIN_MANIFEST.read_text(encoding="utf-8"))
        source = json.loads(PLUGIN_SOURCE.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        return [f"PLUGIN_METADATA_UNREADABLE: {exc}"]
    if not isinstance(manifest, dict) or not isinstance(source, dict):
        return ["PLUGIN_METADATA_INVALID_OBJECT"]

    if manifest.get("name") != "centraldark-unified-surface-parity":
        errors.append("PLUGIN_NAME_MISMATCH")
    if manifest.get("repository") != "https://github.com/ServerVpss/CentralDark":
        errors.append("PLUGIN_REPOSITORY_MISMATCH")
    version = manifest.get("version")
    if not isinstance(version, str) or not re.fullmatch(r"\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?", version):
        errors.append(f"PLUGIN_VERSION_INVALID: {version!r}")
    if version != source.get("published_version") or version != source.get("version"):
        errors.append("PLUGIN_VERSION_MISMATCH")

    extensions = manifest.get("extensions", {})
    openai = extensions.get("com.openai", {}) if isinstance(extensions, dict) else {}
    interface = openai.get("interface", {}) if isinstance(openai, dict) else {}
    interface = interface if isinstance(interface, dict) else {}
    capabilities = interface.get("capabilities")
    if not isinstance(capabilities, list) or len(capabilities) != 2 or set(capabilities) != {"Read", "Write"}:
        errors.append(f"PLUGIN_CAPABILITIES_INVALID: {capabilities!r}")
    if interface.get("displayName") != "CentralDark Unified Surface":
        errors.append("PLUGIN_DISPLAY_NAME_MISMATCH")

    plugin_id = source.get("published_plugin_id")
    release_id = source.get("published_release_id")
    if not isinstance(plugin_id, str) or not re.fullmatch(r"plugins_[a-zA-Z0-9]+", plugin_id):
        errors.append("PLUGIN_ID_INVALID")
    if not isinstance(release_id, str) or not re.fullmatch(r"pluginrel_[a-zA-Z0-9]+", release_id):
        errors.append("PLUGIN_RELEASE_ID_INVALID")
    if release_id != source.get("release_id"):
        errors.append("PLUGIN_RELEASE_MISMATCH")
    if source.get("plugin_url") != f"https://chatgpt.com/plugins/{plugin_id}":
        errors.append("PLUGIN_URL_ID_MISMATCH")
    if source.get("canonical_owner") != "CENTRALDARK_UNIFIED_SURFACE_PARITY_01":
        errors.append("PLUGIN_CANONICAL_OWNER_MISMATCH")
    if source.get("published_scope") != "USER" or source.get("published_discoverability") != "PRIVATE":
        errors.append("PLUGIN_SCOPE_MISMATCH")
    if source.get("generated_artifact_is_owner") is not False:
        errors.append("PLUGIN_GENERATED_OWNER_INVALID")
    return errors


def main() -> int:
    errors: list[str] = []

    for path in REQUIRED_FILES:
        errors.extend(validate_file(path))
    errors.extend(validate_plugin_metadata())

    if errors:
        print("UNIFIED_SURFACE_PARITY_CONTRACT=FAIL")
        for error in errors:
            print(error)
        return 1

    print("UNIFIED_SURFACE_PARITY_CONTRACT=PASS")
    print(f"CONTRACT={CONTRACT.relative_to(ROOT)}")
    print(f"INVOCATION_GRAMMAR={INVOCATION_GRAMMAR.relative_to(ROOT)}")
    print(f"SKILL={SKILL.relative_to(ROOT)}")
    print(f"RECEIPT={RECEIPT.relative_to(ROOT)}")
    print(f"INVOCATION_GRAMMAR_RECEIPT={INVOCATION_GRAMMAR_RECEIPT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
