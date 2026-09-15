#!/usr/bin/env python3
"""Horn-Caracol + Compasso gate for CENTRALDARK operational work.

Single fail-closed gate adapter:
- Horn facts close to a fixed point.
- Compasso/Banda contract is bound to the same gate.
- Caracol must traverse every positioned graph node toward the nucleus without
  inventing semantic edges.
- Musical notes in docs/BRAIN must have frontmatter/tags and graph context.
- MAESTRO is the SOL coordination role, never a new authority/agent.
No external dependencies.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

CORE_REQUIRED = (
    "acordar_done",
    "calibrar_done",
    "multibussola_done",
    "meta_lupa_done",
    "menos_e_mais_done",
    "owner_resolved",
    "writer_scope_valid",
    "evidence_bound",
    "no_destructive_bypass",
)
MUSICAL_REQUIRED = (
    "band_compasso_bound",
    "musical_semantics_bound",
    "maestro_owner_resolved",
    "caracol_reaches_nucleus",
    "musical_notes_cataloged",
    "musical_notes_linked",
)
REQUIRED = CORE_REQUIRED + MUSICAL_REQUIRED

RULES = (
    (
        (
            "acordar_done",
            "calibrar_done",
            "multibussola_done",
            "meta_lupa_done",
            "menos_e_mais_done",
        ),
        "boot_gate_done",
    ),
    (
        ("boot_gate_done", "owner_resolved", "writer_scope_valid", "evidence_bound"),
        "work_gate_done",
    ),
    (
        ("band_compasso_bound", "musical_semantics_bound", "maestro_owner_resolved"),
        "compasso_gate_done",
    ),
    (
        ("caracol_reaches_nucleus", "musical_notes_cataloged", "musical_notes_linked"),
        "graph_music_gate_done",
    ),
    (
        (
            "work_gate_done",
            "compasso_gate_done",
            "graph_music_gate_done",
            "no_destructive_bypass",
        ),
        "centraldark_action_gate_pass",
    ),
)

CARACOL = (
    "BORDA",
    "A",
    "CORPO",
    "SOMBRA",
    "ALMA",
    "VOLTA",
    "COMPASSO",
    "NUCLEO",
)
MUSICAL_SEMANTICS = {
    "CANCAO": "ONE_HUMAN_INTENT",
    "PARTITURA": "BANDA_COMPASSO_GLOBAL",
    "COMPASSO": "INTENT_FINGERPRINT_OR_MISSION_ID",
    "BATIDA": "EVENT_ID",
    "TEMPO": "STATE_VERSION_OR_HEAD_OBSERVED",
    "INSTRUMENTO": "AGENT_MODEL_OR_SURFACE",
    "NOTA_MUSICAL": "SKILL_CAPABILITY_OR_MATERIAL_OPERATIONAL_EVENT",
    "MAESTRO": "SOL_COORDINATION",
    "MAESTRIA": "PROOF_DRIVEN_ORCHESTRATION",
    "DISSONANCIA": "CONTROLLED_CONFLICT_FOR_COUNTERPROOF",
    "HARMONIA": "FIXED_POINT",
}

SCORE_PATH = Path("docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json")
GRAPH_PATH = Path("apps/modulos/graph-panel/public/graph.js")
MUSICAL_CORE = (
    Path("docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.md"),
    Path("docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_INTENCAO_UNICA_COMPASSO.md"),
    Path("docs/BRAIN/01-CONCEITOS/02-BANDA/INTENT_SYNC_STATE.md"),
    Path("docs/BRAIN/01-CONCEITOS/02-BANDA/LACUNA_BANDA_INTENCAO_UNICA.md"),
    Path("docs/BRAIN/01-CONCEITOS/03-DISSONANCIA/DISSONANCIA_OPERACIONAL_CONTROLADA.md"),
)
MUSICAL_PATTERN = re.compile(
    r"\b(?:banda|compasso|partitura|maestro|maestria|disson[aâ]ncia|harmonia|caracol)\b"
    r"|notas?\s+musicais?",
    re.IGNORECASE,
)
MUSICAL_HUBS = (
    "[[BANDA_COMPASSO_GLOBAL]]",
    "[[BANDA_INTENCAO_UNICA_COMPASSO]]",
    "[[BRAIN]]",
    "[[MAPA-DO-CEREBRO]]",
    "[[SEMANTIC-LINKER]]",
    "[[GRAPH-INVESTIGATOR]]",
)
CORE_FRONTMATTER_FIELDS = ("title:", "status:", "owner:", "updated:", "tags:")


def _facts(payload):
    if isinstance(payload, list):
        return {str(x) for x in payload}
    if not isinstance(payload, dict):
        return set()
    source = (
        payload.get("facts")
        or payload.get("horn_facts")
        or payload.get("centraldark_gate", {}).get("facts")
    )
    facts = set(str(x) for x in source) if isinstance(source, list) else set()
    gate = (
        payload.get("centraldark_gate")
        if isinstance(payload.get("centraldark_gate"), dict)
        else payload
    )
    for key in REQUIRED:
        if gate.get(key) is True:
            facts.add(key)
    return facts


def close(facts):
    facts = set(facts)
    changed = True
    while changed:
        changed = False
        for body, head in RULES:
            if all(b in facts for b in body) and head not in facts:
                facts.add(head)
                changed = True
    return facts


def evaluate(payload):
    observed = _facts(payload)
    derived = close(observed)
    missing = [x for x in REQUIRED if x not in derived]
    ok = "centraldark_action_gate_pass" in derived and not missing
    return {
        "accepted": ok,
        "verdict": "PASS" if ok else "BLOCK",
        "missing": missing,
        "derived": sorted(derived),
        "caracol": list(CARACOL),
        "musical_semantics": MUSICAL_SEMANTICS,
        "reason": "" if ok else "HORN_CARACOL_COMPASSO_REQUIRED_FACT_MISSING",
    }


def _frontmatter(text):
    if not text.startswith("---\n"):
        return ""
    end = text.find("\n---", 4)
    if end < 0:
        return ""
    return text[4:end]


def repo_check(repo_root):
    root = Path(repo_root).resolve()
    issues = []
    details = {
        "musical_notes": [],
        "missing_frontmatter": [],
        "missing_tags": [],
        "missing_graph_context": [],
        "missing_hub_link": [],
    }

    score_file = root / SCORE_PATH
    if not score_file.is_file():
        issues.append(f"MISSING_SCORE:{SCORE_PATH.as_posix()}")
        score = {}
    else:
        try:
            score = json.loads(score_file.read_text(encoding="utf-8"))
        except Exception as exc:
            issues.append(f"SCORE_JSON_INVALID:{type(exc).__name__}")
            score = {}

    expected_aliases = {
        "BANDA": "BANDA_COMPASSO_GLOBAL",
        "COMPASSO": "BANDA_COMPASSO_GLOBAL",
        "PARTITURA": "BANDA_COMPASSO_GLOBAL",
        "NOTA_MUSICAL": "MATERIAL_OPERATIONAL_EVENT",
        "MAESTRO": "SOL_COORDINATION",
        "MAESTRIA": "PROOF_DRIVEN_ORCHESTRATION",
        "DISSONANCIA": "CONTROLLED_DISSONANCE",
        "HARMONIA": "FIXED_POINT",
        "CARACOL": "CARACOL_REVERSO_CAUSAL",
    }
    aliases = score.get("aliases", {}) if isinstance(score, dict) else {}
    for key, value in expected_aliases.items():
        if aliases.get(key) != value:
            issues.append(f"SCORE_ALIAS:{key}")

    semantic = score.get("musical_semantics", {}) if isinstance(score, dict) else {}
    for key in (
        "song",
        "score",
        "compass",
        "beat",
        "tempo",
        "instrument",
        "note",
        "maestro",
        "mastery",
        "dissonance",
        "resolution",
        "harmony",
        "caracol",
    ):
        if key not in semantic:
            issues.append(f"MUSICAL_SEMANTIC_MISSING:{key}")
    maestro = semantic.get("maestro", {}) if isinstance(semantic, dict) else {}
    if maestro.get("role") != "SOL_COORDINATION":
        issues.append("MAESTRO_OWNER_NOT_SOL_COORDINATION")
    if maestro.get("new_authority") is not False or maestro.get("new_agent") is not False:
        issues.append("MAESTRO_PARALLEL_AUTHORITY_FORBIDDEN")
    caracol = semantic.get("caracol", {}) if isinstance(semantic, dict) else {}
    if caracol.get("all_positioned_nodes_on_trajectory") is not True:
        issues.append("CARACOL_ALL_POSITIONED_NODES_NOT_REQUIRED")
    if caracol.get("semantic_edge_invention") is not False:
        issues.append("CARACOL_SEMANTIC_EDGE_INVENTION_NOT_BLOCKED")

    gate_binding = score.get("bindings", {}).get("horn_caracol_gate", {}) if isinstance(score, dict) else {}
    if gate_binding.get("path") != ".agents/skills/meta-lupa/scripts/horn_caracol_gate.py":
        issues.append("HORN_CARACOL_BINDING_PATH")
    if gate_binding.get("test") != ".agents/skills/meta-lupa/guardrails/test_horn_caracol_gate.py":
        issues.append("HORN_CARACOL_BINDING_TEST")
    if gate_binding.get("reference") != ".agents/skills/meta-lupa/references/tlc23-horn-caracol-gate.md":
        issues.append("HORN_CARACOL_BINDING_REFERENCE")

    graph_file = root / GRAPH_PATH
    if not graph_file.is_file():
        issues.append(f"MISSING_GRAPH_OVERLAY:{GRAPH_PATH.as_posix()}")
    else:
        graph = graph_file.read_text(encoding="utf-8")
        graph_markers = (
            "function ordemCaracol()",
            "const validos = dadosGrafo.nodes.filter",
            "function desenharCaracol(ctx, globalScale)",
            "for (let i = 1; i < ordem.length; i++) ctx.lineTo(ordem[i].x, ordem[i].y);",
            ".onRenderFramePost((ctx, globalScale) => desenharCaracol(ctx, globalScale))",
            "CARACOL é overlay de navegação",
        )
        for marker in graph_markers:
            if marker not in graph:
                issues.append(f"CARACOL_GRAPH_MARKER_MISSING:{marker[:44]}")

    for rel in MUSICAL_CORE:
        path = root / rel
        if not path.is_file():
            issues.append(f"MUSICAL_CORE_MISSING:{rel.as_posix()}")
            continue
        text = path.read_text(encoding="utf-8")
        fm = _frontmatter(text)
        if not fm:
            issues.append(f"MUSICAL_CORE_FRONTMATTER:{rel.as_posix()}")
            continue
        for field in CORE_FRONTMATTER_FIELDS:
            if field not in fm:
                issues.append(f"MUSICAL_CORE_PROPERTY:{rel.as_posix()}:{field[:-1]}")

    brain = root / "docs/BRAIN"
    if brain.is_dir():
        for path in sorted(brain.rglob("*.md")):
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            if not MUSICAL_PATTERN.search(text):
                continue
            rel = path.relative_to(root).as_posix()
            details["musical_notes"].append(rel)
            fm = _frontmatter(text)
            is_catalog_index = path.name.upper().startswith("INDEX")
            if not fm and not is_catalog_index:
                details["missing_frontmatter"].append(rel)
                issues.append(f"MUSICAL_NOTE_FRONTMATTER:{rel}")
            elif fm and "tags:" not in fm:
                details["missing_tags"].append(rel)
                issues.append(f"MUSICAL_NOTE_TAGS:{rel}")
            if "[[" not in text:
                details["missing_graph_context"].append(rel)
                issues.append(f"MUSICAL_NOTE_ISOLATED:{rel}")
            if not any(hub in text for hub in MUSICAL_HUBS):
                details["missing_hub_link"].append(rel)
                issues.append(f"MUSICAL_NOTE_NO_HUB:{rel}")
    else:
        issues.append("BRAIN_ROOT_MISSING")

    facts = {key: True for key in CORE_REQUIRED}
    facts.update(
        {
            "band_compasso_bound": not any(i.startswith(("MISSING_SCORE", "SCORE_", "HORN_CARACOL_BINDING")) for i in issues),
            "musical_semantics_bound": not any(i.startswith("MUSICAL_SEMANTIC_") for i in issues),
            "maestro_owner_resolved": not any(i.startswith("MAESTRO_") for i in issues),
            "caracol_reaches_nucleus": not any(i.startswith(("MISSING_GRAPH_OVERLAY", "CARACOL_")) for i in issues),
            "musical_notes_cataloged": not any(
                i.startswith(("MUSICAL_CORE_", "MUSICAL_NOTE_FRONTMATTER", "MUSICAL_NOTE_TAGS", "MUSICAL_NOTE_NO_HUB"))
                for i in issues
            ),
            "musical_notes_linked": not any(i.startswith("MUSICAL_NOTE_ISOLATED") for i in issues),
        }
    )
    horn = evaluate({"centraldark_gate": facts})
    accepted = not issues and horn["accepted"]
    return {
        "accepted": accepted,
        "verdict": "PASS" if accepted else "BLOCK",
        "issues": issues,
        "facts": facts,
        "horn": horn,
        "details": details,
        "rule": "UNKNOWN_IS_NOT_PASS",
    }


def self_test():
    good = {k: True for k in REQUIRED}
    bad_meta = {k: True for k in REQUIRED if k != "meta_lupa_done"}
    bad_music = {k: True for k in REQUIRED if k != "musical_notes_linked"}
    assert evaluate({"centraldark_gate": good})["accepted"] is True
    assert evaluate({"centraldark_gate": bad_meta})["accepted"] is False
    assert evaluate({"centraldark_gate": bad_music})["accepted"] is False
    print("HORN_CARACOL_COMPASSO_SELF_TEST=PASS")


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--facts-file")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--repo-check", metavar="ROOT")
    args = ap.parse_args(argv)

    if args.self_test:
        self_test()
        return 0

    if args.repo_check:
        result = repo_check(args.repo_check)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result["accepted"] else 2

    raw = (
        open(args.facts_file, encoding="utf-8").read()
        if args.facts_file
        else sys.stdin.read()
    )
    result = evaluate(json.loads(raw or "{}"))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["accepted"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
