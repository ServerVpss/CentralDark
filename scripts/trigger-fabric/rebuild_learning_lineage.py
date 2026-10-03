#!/usr/bin/env python3
"""Compile/check the CentralDark learning NeuroLink projection without AI.

Front A: preserve the whole historical learning document as a bidirectional
lineage using stable UIDs, including historical genesis #0.
Front B is enforced separately by verify_repo_contract.py for the strict
cognitive numeric chain beginning at #115.

Usage:
  python scripts/trigger-fabric/rebuild_learning_lineage.py --check
  python scripts/trigger-fabric/rebuild_learning_lineage.py --write
"""
from __future__ import annotations

from collections import Counter, defaultdict
from pathlib import Path
import argparse
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
APRENDIZADOS = ROOT / "docs/CONSCIENCIA/APRENDIZADOS.md"
MANIFEST = ROOT / "docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json"
GENESIS_SOURCE = "docs/RELATORIOS/notion-sync/2026-07-03T17-29-45.md"
GENESIS_TITLE = "Conhecimento só existe se está no repo ou no Mega Painel"
MANIFEST_REPO_PATH = "docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json"
SOURCE_REPO_PATH = "docs/CONSCIENCIA/APRENDIZADOS.md"
ANCHOR = "{{FILE:/tmp/pr316/aprendizados.md}}"
BEGIN = "<!-- NEUROLINK_GLOBAL_BEGIN -->"
END = "<!-- NEUROLINK_GLOBAL_END -->"
HEADING_RE = re.compile(r"(?m)^###\s+(\d+)\.\s+(.+)$")
GLOBAL_LINE_RE = re.compile(r"(?m)^- \*\*NeuroLink Global:\*\* .*\n?")
BLOCK_RE = re.compile(
    r"\n*" + re.escape(BEGIN) + r"[\s\S]*?" + re.escape(END) + r"\n*"
)

def git_blob_sha(text: str) -> str:
    payload = text.encode("utf-8")
    header = f"blob {len(payload)}\0".encode("ascii")
    return hashlib.sha1(header + payload).hexdigest()

def strip_projection(text: str) -> str:
    text = BLOCK_RE.sub("\n", text)
    text = GLOBAL_LINE_RE.sub("", text)
    return text

def assign_nodes(text: str):
    matches = list(HEADING_RE.finditer(text))
    totals = Counter(int(m.group(1)) for m in matches)
    seen = defaultdict(int)
    nodes = []
    for order, m in enumerate(matches, start=1):
        n = int(m.group(1))
        seen[n] += 1
        suffix = chr(64 + seen[n]) if totals[n] > 1 else ""
        uid = f"L{n:03d}{suffix}"
        nodes.append(
            {
                "uid": uid,
                "legacy_learning_number": n,
                "legacy_occurrence": seen[n],
                "title": m.group(2),
                "document_order": order,
                "source_path": SOURCE_REPO_PATH,
                "relation_type": "CANONICAL_DOCUMENT_CONTINUITY",
            }
        )
    for i, node in enumerate(nodes):
        node["prev_uid"] = "L000" if i == 0 else nodes[i - 1]["uid"]
        node["next_uid"] = (
            "PENDING_NEXT_CURSOR" if i == len(nodes) - 1 else nodes[i + 1]["uid"]
        )
    return matches, nodes, totals

def projection_block() -> str:
    return f"""
{BEGIN}
## 🧠 NeuroLink global — duas frentes

- **Gênese histórica:** `L000` = aprendizado legado `#0 — {GENESIS_TITLE}`, preservado em `{GENESIS_SOURCE}`.
- **Frente A — histórico completo:** cada seção deste arquivo possui `GLOBAL_LINEAGE_UID`, `PREV_GLOBAL_UID` e `NEXT_GLOBAL_UID`; números legados duplicados não são renumerados e lacunas antigas não são preenchidas com conteúdo inventado.
- **Frente B — cognitivo determinístico:** do `#115` em diante, além da linhagem global, vale a cadeia estrita `N-1 ← N → N+1` do NeuroLink cognitivo.
- **Manifesto executável:** `{MANIFEST_REPO_PATH}`.
- **Regra:** `GLOBAL_EDGE_IS_CONTINUITY_NOT_CAUSAL_PROOF=true`.

{END}
"""

def render_projection(raw_text: str):
    base = strip_projection(raw_text)
    matches, nodes, _ = assign_nodes(base)
    rendered = base
    # bottom-up insertion preserves match offsets
    for i in range(len(matches) - 1, -1, -1):
        node = nodes[i]
        line = (
            "\n- **NeuroLink Global:** "
            f"`GLOBAL_LINEAGE_UID={node['uid']}`; "
            f"`PREV_GLOBAL_UID={node['prev_uid']}`; "
            f"`NEXT_GLOBAL_UID={node['next_uid']}`; "
            f"`LEGACY_LEARNING_NUMBER={node['legacy_learning_number']}`; "
            "`RELATION_TYPE=CANONICAL_DOCUMENT_CONTINUITY`; "
            f"`LINEAGE_MANIFEST={MANIFEST_REPO_PATH}`."
        )
        pos = matches[i].end()
        rendered = rendered[:pos] + line + rendered[pos:]
    if ANCHOR not in rendered:
        raise RuntimeError("APRENDIZADOS_ANCHOR_MISSING")
    rendered = rendered.replace(
        ANCHOR,
        ANCHOR + "\n\n" + projection_block().strip("\n") + "\n\n",
        1,
    )
    return rendered, nodes

def build_manifest(rendered: str, nodes):
    nums = [n["legacy_learning_number"] for n in nodes]
    totals = Counter(nums)
    highest = max(nums) if nums else 0
    gaps = [n for n in range(1, highest + 1) if totals[n] == 0]
    duplicates = []
    for n in sorted(k for k, count in totals.items() if count > 1):
        duplicates.append(
            {
                "legacy_learning_number": n,
                "count": totals[n],
                "uids": [x["uid"] for x in nodes if x["legacy_learning_number"] == n],
            }
        )
    return {
        "schema": "centraldark.learning-neurolink-lineage.v2",
        "status": "CANONICAL_DERIVED_INDEX",
        "source_path": SOURCE_REPO_PATH,
        "source_blob_sha": git_blob_sha(rendered),
        "semantics": {
            "front_a": "GLOBAL_HISTORICAL_LINEAGE_BY_STABLE_UID_AND_DOCUMENT_ORDER",
            "front_b": "STRICT_COGNITIVE_NUMERIC_CHAIN_FROM_115",
            "graph_edge": "CONTINUITY_NOT_CAUSAL_PROOF",
            "legacy_numbers": "PRESERVED_NOT_RENUMBERED",
            "missing_legacy_numbers": "RECORDED_NOT_INVENTED",
        },
        "genesis": {
            "uid": "L000",
            "legacy_learning_number": 0,
            "title": GENESIS_TITLE,
            "source_path": GENESIS_SOURCE,
            "prev_uid": None,
            "next_uid": nodes[0]["uid"] if nodes else "PENDING_NEXT_CURSOR",
            "relation_type": "HISTORICAL_GENESIS",
        },
        "audit": {
            "learning_sections": len(nodes),
            "highest_legacy_learning_number": highest,
            "duplicate_legacy_numbers": duplicates,
            "missing_legacy_numbers": gaps,
            "strict_cognitive_sequence": {
                "start": 115,
                "end": max([n for n in nums if n >= 115], default=114),
            },
        },
        "nodes": nodes,
    }

def canonical_json(data) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"

def check() -> int:
    actual = APRENDIZADOS.read_text(encoding="utf-8")
    expected_text, nodes = render_projection(actual)
    expected_manifest = build_manifest(expected_text, nodes)
    problems = []
    if actual != expected_text:
        problems.append("APRENDIZADOS_GLOBAL_LINEAGE_PROJECTION_DRIFT")
    if not MANIFEST.exists():
        problems.append("LINEAGE_MANIFEST_MISSING")
    else:
        try:
            current_manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        except Exception as exc:
            problems.append(f"LINEAGE_MANIFEST_INVALID_JSON:{exc}")
        else:
            if current_manifest != expected_manifest:
                problems.append("LINEAGE_MANIFEST_DRIFT")
    if problems:
        print("GLOBAL_LEARNING_LINEAGE=FAIL")
        for problem in problems:
            print(problem)
        return 1
    print(f"GLOBAL_LEARNING_LINEAGE=PASS sections={len(nodes)} genesis=L000")
    return 0

def write() -> int:
    actual = APRENDIZADOS.read_text(encoding="utf-8")
    rendered, nodes = render_projection(actual)
    manifest = build_manifest(rendered, nodes)
    APRENDIZADOS.write_text(rendered, encoding="utf-8", newline="\n")
    MANIFEST.write_text(canonical_json(manifest), encoding="utf-8", newline="\n")
    print(
        f"GLOBAL_LEARNING_LINEAGE=WRITTEN sections={len(nodes)} "
        f"source_blob_sha={manifest['source_blob_sha']}"
    )
    return 0

def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    args = parser.parse_args()
    return check() if args.check else write()

if __name__ == "__main__":
    sys.exit(main())
