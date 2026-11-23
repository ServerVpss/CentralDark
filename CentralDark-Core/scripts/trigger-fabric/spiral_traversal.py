#!/usr/bin/env python3
"""CentralDark CARACOL traversal verifier.

Builds a deterministic navigation traversal over catalogued points without
creating semantic graph edges. It can inspect graph-data.json or tracked repo
paths, classify points into 10 adaptive fronts, and prove forward/reverse
closure over a single derived next relation.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

NUCLEUS_TOKENS = (
    "leia-me-ia",
    "00-leia-primeiro",
    "mapa-do-cerebro",
    "mapa-do-cérebro",
    "consciencia",
    "consciência",
)

FRONTS = {
    "F1_BOOT_IDENTITY": ("leia", "agents", "soul", "identidade", "porta-de-entrada", "boot"),
    "F2_INTENT_MASTER_CYCLE": ("intent", "intenc", "master-cycle", "multibussola", "meta-lupa", "reconc"),
    "F3_MEMORY_GRAPH": ("brain", "memory", "memoria", "grafo", "graph", "vector", "knowledge", "aprend"),
    "F4_CAPABILITY_ROUTING": ("capability", "capacidade", "router", "megazord", "adapter"),
    "F5_RUNTIME_ENGINE": ("runtime", "engine", "model", "modelo", "hermes", "codex", "claude", "nous", "openai", "mistral", "grok"),
    "F6_TOOLS_SENSORS": ("screenpipe", "mcp", "tool", "browser", "terminal", "connector", "sensor"),
    "F7_HANDOFF_CONTINUITY": ("handoff", "receipt", "checksum", "cursor", "continu", "pombo"),
    "F8_WRITER_EXECUTION": ("writer", "lease", "execu", "worktree", "mutation", "mutacao", "mutação"),
    "F9_PROOF_JUDGE": ("proof", "prova", "counterproof", "contraprova", "remed", "judge", "fixed-point", "fixed_point"),
}
FALLBACK_FRONT = "F10_CI_DEPLOY_RESIDUAL"

TEXT_SUFFIXES = {
    ".md", ".txt", ".json", ".yml", ".yaml", ".toml", ".py", ".js", ".mjs", ".cjs",
    ".ts", ".tsx", ".jsx", ".sh", ".ps1", ".html", ".css", ".sql", ".csv", ".xml",
}


def norm(value: object) -> str:
    s = str(value or "").strip().lower()
    s = s.replace("\\", "/")
    s = re.sub(r"[^a-z0-9áàâãéêíóôõúç/_\-.]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")


def is_nucleus(record: dict) -> bool:
    hay = norm(f"{record.get('id', '')} {record.get('label', '')} {record.get('path', '')}")
    return any(token in hay for token in NUCLEUS_TOKENS)


def classify_front(record: dict) -> str:
    hay = norm(" ".join(str(record.get(k, "")) for k in ("id", "label", "path", "group", "type", "category")))
    scores = []
    for front, tokens in FRONTS.items():
        score = sum(1 for token in tokens if token in hay)
        if score:
            scores.append((-score, front))
    if not scores:
        return FALLBACK_FRONT
    scores.sort()
    return scores[0][1]


def validate_unique(records: list[dict]) -> list[str]:
    ids = [str(r["id"]) for r in records]
    counts = Counter(ids)
    return sorted(k for k, n in counts.items() if n > 1)


def graph_records(graph_path: Path) -> list[dict]:
    graph = json.loads(graph_path.read_text(encoding="utf-8"))
    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or graph.get("links") or []
    records = []
    degree = defaultdict(int)
    node_ids = {str(n.get("id")) for n in nodes if n.get("id") is not None}
    dangling = []
    for edge in edges:
        a = edge.get("from", edge.get("source"))
        b = edge.get("to", edge.get("target"))
        if isinstance(a, dict):
            a = a.get("id")
        if isinstance(b, dict):
            b = b.get("id")
        a, b = str(a), str(b)
        if a not in node_ids or b not in node_ids:
            dangling.append((a, b))
            continue
        degree[a] += 1
        degree[b] += 1
    if dangling:
        raise ValueError(f"DANGLING_SEMANTIC_EDGES:{dangling[:10]}")
    for node in nodes:
        node_id = str(node.get("id"))
        records.append({
            "id": node_id,
            "label": node.get("label") or node_id,
            "group": node.get("group"),
            "type": node.get("type"),
            "category": node.get("category"),
            "degree": degree[node_id],
            "source": "graph",
        })
    return records


def git_ls_files(root: Path) -> list[str]:
    try:
        out = subprocess.check_output(
            ["git", "-C", str(root), "ls-files", "-z"],
            stderr=subprocess.DEVNULL,
        )
        return [p for p in out.decode("utf-8", errors="replace").split("\0") if p]
    except Exception:
        return []


def repo_records(root: Path) -> list[dict]:
    files = git_ls_files(root)
    if not files:
        files = [str(p.relative_to(root)).replace("\\", "/") for p in root.rglob("*") if p.is_file()]
    records = []
    for rel in sorted(set(files)):
        suffix = Path(rel).suffix.lower()
        if suffix and suffix not in TEXT_SUFFIXES:
            continue
        records.append({
            "id": rel,
            "path": rel,
            "label": Path(rel).stem,
            "degree": 0,
            "source": "repo",
        })
    return records


def traversal_order(records: list[dict]) -> list[dict]:
    enriched = []
    for record in records:
        item = dict(record)
        item["front"] = classify_front(item)
        item["nucleus"] = is_nucleus(item)
        enriched.append(item)
    # Outer -> nucleus. On graph input, low-degree points are visited before hubs.
    # Repo catalog fallback uses deeper paths before shallow/root owners.
    def key(item: dict):
        depth = str(item.get("path", item.get("id", ""))).count("/")
        return (
            1 if item["nucleus"] else 0,
            int(item.get("degree", 0)),
            -depth,
            item["front"],
            norm(item["id"]),
        )
    return sorted(enriched, key=key)


def horn_closure(order_ids: list[str]) -> tuple[set[str], int]:
    if not order_ids:
        return set(), 0
    relation = list(zip(order_ids, order_ids[1:]))
    visited = {order_ids[0]}
    rounds = 0
    while True:
        rounds += 1
        before = len(visited)
        for a, b in relation:
            if a in visited:
                visited.add(b)
        if len(visited) == before:
            break
    return visited, rounds


def verify_records(records: list[dict], source: str) -> dict:
    duplicates = validate_unique(records)
    if duplicates:
        return {
            "schema": "centraldark.spiral-traversal-proof.v1",
            "status": "FAIL_DUPLICATE_POINTS",
            "source": source,
            "duplicates": duplicates,
        }

    ordered = traversal_order(records)
    ids = [str(r["id"]) for r in ordered]
    discovered = set(ids)
    forward, forward_rounds = horn_closure(ids)
    reverse_ids = list(reversed(ids))
    reverse, reverse_rounds = horn_closure(reverse_ids)
    forward_missing = sorted(discovered - forward)
    reverse_missing = sorted(discovered - reverse)
    extra_forward = sorted(forward - discovered)
    extra_reverse = sorted(reverse - discovered)
    front_counts = Counter(r["front"] for r in ordered)
    payload = "\n".join(ids).encode("utf-8")
    path_sha256 = hashlib.sha256(payload).hexdigest()

    ok = not (forward_missing or reverse_missing or extra_forward or extra_reverse)
    return {
        "schema": "centraldark.spiral-traversal-proof.v1",
        "status": "PASS" if ok else "FAIL_COVERAGE",
        "source": source,
        "denominator": len(discovered),
        "forward_visited": len(forward),
        "reverse_visited": len(reverse),
        "forward_missing": forward_missing,
        "reverse_missing": reverse_missing,
        "forward_extra": extra_forward,
        "reverse_extra": extra_reverse,
        "duplicates": duplicates,
        "fragment_drop": len(forward_missing) + len(reverse_missing),
        "forward_rounds": forward_rounds,
        "reverse_rounds": reverse_rounds,
        "first": ids[0] if ids else None,
        "last": ids[-1] if ids else None,
        "nucleus_tail": [r["id"] for r in ordered if r["nucleus"]],
        "front_counts": dict(sorted(front_counts.items())),
        "traversal_sha256": path_sha256,
        "semantic_edges_created": 0,
        "ordered_ids": ids,
    }


def self_test() -> dict:
    fixture = [
        {"id": "far-unknown", "label": "far unknown", "degree": 0},
        {"id": "screenpipe", "label": "Screenpipe sensor", "degree": 1},
        {"id": "runtime-hermes", "label": "Hermes runtime", "degree": 2},
        {"id": "mapa-do-cerebro", "label": "MAPA-DO-CEREBRO", "degree": 8},
        {"id": "leia-me-ia", "label": "LEIA-ME-IA", "degree": 9},
    ]
    positive = verify_records(fixture, "self-test-positive")
    duplicate = verify_records(fixture + [dict(fixture[0])], "self-test-duplicate")
    reverse_ok = positive.get("forward_visited") == positive.get("reverse_visited") == len(fixture)
    nucleus_ok = set(positive.get("nucleus_tail", [])) == {"mapa-do-cerebro", "leia-me-ia"}
    negative_ok = duplicate.get("status") == "FAIL_DUPLICATE_POINTS"
    status = "PASS" if positive.get("status") == "PASS" and reverse_ok and nucleus_ok and negative_ok else "FAIL"
    return {
        "schema": "centraldark.spiral-traversal-self-test.v1",
        "status": status,
        "positive_status": positive.get("status"),
        "forward_reverse_same_denominator": reverse_ok,
        "nucleus_tail_proven": nucleus_ok,
        "duplicate_negative_test_blocks": negative_ok,
        "fixture_denominator": len(fixture),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--source", choices=("graph", "repo"), default="repo")
    parser.add_argument("--graph", default="apps/modulos/status/graph-data.json")
    parser.add_argument("--compact", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        result = self_test()
    else:
        root = Path(args.repo_root).resolve()
        if args.source == "graph":
            graph_path = Path(args.graph)
            if not graph_path.is_absolute():
                graph_path = root / graph_path
            records = graph_records(graph_path)
            result = verify_records(records, str(graph_path))
        else:
            records = repo_records(root)
            result = verify_records(records, str(root))

    if args.compact and "ordered_ids" in result:
        result = {k: v for k, v in result.items() if k != "ordered_ids"}
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0 if result.get("status") == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
