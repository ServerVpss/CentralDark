#!/usr/bin/env python3
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

TERMINAL = {"CRYSTAL", "NO_CHANGE_PROVEN", "HISTORICAL_EXCEPTION"}
ALLOWED = TERMINAL | {
    "DISCOVERED",
    "FORENSIC",
    "OWNER_MAPPED",
    "RULE_PROMOTED",
    "REGRESSION_WIRED",
    "COUNTERPROVED",
    "OPEN",
    "UNKNOWN",
}
LEARNING_CATEGORIES = ("armadilha", "erro-correcao", "erro-correção")
TOTAL_MARKERS = (
    "INCIDENT_CRYSTALLIZATION_TOTAL=true",
    "META_INCIDENT_CRYSTAL=TOTAL",
    "ALL_INCIDENTS_CRYSTALLIZED=true",
)
REQUIRED_META_LENSES = (
    "META_EXPANSAO_DE_DOMINIO",
    "META_MINERACAO",
    "META_MENOS_E_MAIS",
    "META_LUPA",
    "META_INSTINTO_SUPERIOR",
    "META_METACOGNICAO_OPERACIONAL",
)


def sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def discover(repo_root):
    docs = repo_root / "docs"
    sources = {}
    if docs.exists():
        for path in docs.rglob("*"):
            if not path.is_file():
                continue
            rel = path.relative_to(repo_root).as_posix()
            if "incidente" in path.name.casefold():
                sources[f"file:{rel}"] = {"kind": "INCIDENT_FILE", "ref": rel}

    learning = repo_root / "docs/CONSCIENCIA/APRENDIZADOS.md"
    if learning.exists():
        text = learning.read_text(encoding="utf-8", errors="replace")
        matches = list(re.finditer(r"(?m)^###\s+(\d+)\.\s+(.+?)\s*$", text))
        for idx, match in enumerate(matches):
            start = match.start()
            end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
            section = text[start:end]
            cat = re.search(r"\*\*Categoria:\*\*\s*([^\n]+)", section, flags=re.I)
            category = cat.group(1).strip().casefold() if cat else ""
            title = match.group(2).strip()
            incident_like = any(token in category for token in LEARNING_CATEGORIES)
            if not category and "incidente" in title.casefold():
                incident_like = True
            if incident_like:
                key = f"learning:{match.group(1)}"
                sources[key] = {
                    "kind": "LEARNING_INCIDENT",
                    "ref": "docs/CONSCIENCIA/APRENDIZADOS.md",
                    "title": title,
                    "category": category or "UNKNOWN",
                }
    return sources


def scan_total_claims(repo_root):
    claims = []
    roots = [repo_root / "docs", repo_root / ".agents/skills/meta-lupa/references"]
    suffixes = {".md", ".json", ".yml", ".yaml", ".txt"}
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in suffixes:
                continue
            try:
                if path.stat().st_size > 2_000_000:
                    continue
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            for marker in TOTAL_MARKERS:
                if marker in text:
                    claims.append({"path": path.relative_to(repo_root).as_posix(), "marker": marker})
    return claims


def validate_cluster(cluster_id, cluster, repo_root):
    errors = []
    owner = cluster.get("owner_path")
    if not owner:
        errors.append("OWNER_PATH_MISSING")
        return errors
    owner_path = repo_root / owner
    if not owner_path.exists():
        errors.append(f"OWNER_PATH_NOT_FOUND:{owner}")
        return errors
    content = owner_path.read_text(encoding="utf-8", errors="replace")
    markers = cluster.get("owner_markers") or []
    if not markers:
        errors.append("OWNER_MARKERS_MISSING")
    for marker in markers:
        if marker not in content:
            errors.append(f"OWNER_MARKER_MISSING:{marker}")
    regressions = cluster.get("regression_paths") or []
    if not regressions:
        errors.append("REGRESSION_PATHS_MISSING")
    for path in regressions:
        if not (repo_root / path).exists():
            errors.append(f"REGRESSION_PATH_NOT_FOUND:{path}")
    if not (cluster.get("counterproof") or []):
        errors.append("COUNTERPROOF_MISSING")
    cross = cluster.get("cross_meta_counterproof") or {}
    for lens in REQUIRED_META_LENSES:
        item = cross.get(lens)
        if not isinstance(item, dict):
            errors.append(f"CROSS_META_{lens}_MISSING")
            continue
        if item.get("status") not in {"NO_CHANGE", "DELTA_ABSORBED"}:
            errors.append(f"CROSS_META_{lens}_STATUS_INVALID")
        if not item.get("evidence"):
            errors.append(f"CROSS_META_{lens}_EVIDENCE_MISSING")
    if cluster.get("fixed_point") is not True:
        errors.append("FIXED_POINT_UNPROVEN")
    return errors


def validate_entry(entry, clusters):
    errors = []
    status = entry.get("status")
    if status not in ALLOWED:
        errors.append(f"STATUS_INVALID:{status}")
    for field in ("id", "source_key", "evidence_ref", "evidence_limit"):
        if not entry.get(field):
            errors.append(f"{field.upper()}_MISSING")
    if "gate_head_sha" in entry or "same_head_gate" in entry:
        errors.append("STATIC_SELF_REFERENTIAL_HEAD_FORBIDDEN")
    if status in TERMINAL:
        cluster_id = entry.get("cluster_id")
        if not cluster_id:
            errors.append("TERMINAL_CLUSTER_ID_MISSING")
        elif cluster_id not in clusters:
            errors.append(f"TERMINAL_CLUSTER_UNKNOWN:{cluster_id}")
        if status == "HISTORICAL_EXCEPTION" and not entry.get("exception_reason"):
            errors.append("HISTORICAL_EXCEPTION_REASON_MISSING")
        if status == "NO_CHANGE_PROVEN" and not entry.get("counterproof_ref"):
            errors.append("NO_CHANGE_COUNTERPROOF_REF_MISSING")
    return errors


def evaluate(repo_root, ledger, observed_head=None, final_seal=False):
    discovered = discover(repo_root)
    entries = ledger.get("entries", [])
    clusters = ledger.get("clusters", {})
    structural_errors = []
    for cluster_id, cluster in clusters.items():
        for err in validate_cluster(cluster_id, cluster, repo_root):
            structural_errors.append(f"CLUSTER:{cluster_id}:{err}")

    by_source = {}
    ids = set()
    for entry in entries:
        eid = entry.get("id")
        if eid in ids:
            structural_errors.append(f"DUPLICATE_INCIDENT_ID:{eid}")
        ids.add(eid)
        source_key = entry.get("source_key")
        if source_key in by_source:
            structural_errors.append(f"DUPLICATE_SOURCE_KEY:{source_key}")
        by_source[source_key] = entry
        for err in validate_entry(entry, clusters):
            structural_errors.append(f"{eid or 'UNKNOWN'}:{err}")

    denominator = dict(discovered)
    for entry in entries:
        if entry.get("source_kind") == "EXTERNAL_HISTORY" and entry.get("source_key"):
            denominator.setdefault(entry["source_key"], {"kind": "EXTERNAL_HISTORY", "ref": entry.get("evidence_ref", "")})

    unregistered = sorted(k for k in denominator if k not in by_source)
    extra_registered = sorted(k for k in by_source if k not in denominator)
    structural_errors.extend(f"REGISTERED_SOURCE_NOT_IN_DENOMINATOR:{k}" for k in extra_registered)

    nonterminal = []
    terminal = []
    terminal_by_status = {key: 0 for key in sorted(TERMINAL)}
    for key in sorted(denominator):
        entry = by_source.get(key)
        if not entry:
            continue
        if entry.get("status") in TERMINAL:
            terminal.append(key)
            terminal_by_status[entry["status"]] += 1
        else:
            nonterminal.append({"source_key": key, "status": entry.get("status")})

    claims = scan_total_claims(repo_root)
    base_ready = len(denominator) > 0 and not structural_errors and not unregistered and not nonterminal and len(terminal) == len(denominator)
    if claims and not base_ready:
        structural_errors.append("FALSE_TOTAL_CRYSTALLIZATION_CLAIM")

    head_match = None
    same_head_gate = "NOT_RUN"
    if final_seal:
        if not observed_head or not re.fullmatch(r"[0-9a-f]{40}", observed_head):
            structural_errors.append("FINAL_SEAL_HEAD_SHA_INVALID")
            head_match = False
        else:
            try:
                actual = subprocess.check_output(["git", "-C", str(repo_root), "rev-parse", "HEAD"], text=True).strip()
            except Exception as exc:
                structural_errors.append(f"FINAL_SEAL_GIT_HEAD_UNAVAILABLE:{exc}")
                actual = ""
            head_match = actual == observed_head
            if not head_match:
                structural_errors.append(f"FINAL_SEAL_HEAD_MISMATCH:expected={observed_head}:actual={actual}")
            else:
                same_head_gate = "PASS_BY_FINAL_WORKFLOW_POSITION"

    total_ready = base_ready and not structural_errors and (not final_seal or head_match is True)
    denominator_count = len(denominator)
    coverage_percent = round((len(terminal) / denominator_count) * 100, 6) if denominator_count else 0.0
    receipt = {
        "schema_version": 2,
        "gate": "INCIDENT_META_CRYSTAL",
        "denominator_scope": ledger.get("denominator_scope"),
        "denominator_count": denominator_count,
        "registered_count": len([k for k in denominator if k in by_source]),
        "terminal_count": len(terminal),
        "terminal_by_status": terminal_by_status,
        "coverage_percent": coverage_percent,
        "unregistered_count": len(unregistered),
        "nonterminal_count": len(nonterminal),
        "unregistered": unregistered,
        "nonterminal": nonterminal,
        "total_claims_found": claims,
        "observed_head": observed_head,
        "same_head_gate": same_head_gate,
        "total_ready": total_ready,
        "status": "CRYSTAL_TOTAL" if total_ready else "PARTIAL_EXPLICIT",
        "seal": "LOCKED_100_ZERO_FALSE_GREEN" if total_ready and final_seal else None,
        "errors": structural_errors,
    }
    receipt["receipt_sha256"] = sha256_text(json.dumps(receipt, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    return receipt


def self_test():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "docs/APRENDIZADOS").mkdir(parents=True)
        (root / "docs/CONSCIENCIA").mkdir(parents=True)
        (root / "docs/APRENDIZADOS/incidente-a.md").write_text("x", encoding="utf-8")
        (root / "docs/CONSCIENCIA/APRENDIZADOS.md").write_text(
            "### 1. Falha que é regra\n- **Categoria:** regra\n\n### 2. Erro real\n- **Categoria:** erro-correcao\n",
            encoding="utf-8",
        )
        ledger = {"denominator_scope": "SELF_TEST", "clusters": {}, "entries": []}
        result = evaluate(root, ledger)
        assert result["unregistered_count"] == 2, result
        assert "learning:1" not in result["unregistered"]
        assert "learning:2" in result["unregistered"]
        (root / "docs/claim.md").write_text("ALL_INCIDENTS_CRYSTALLIZED=true", encoding="utf-8")
        result = evaluate(root, ledger)
        assert "FALSE_TOTAL_CRYSTALLIZATION_CLAIM" in result["errors"]
        ledger["entries"] = [{
            "id": "INC-A", "source_key": "file:docs/APRENDIZADOS/incidente-a.md",
            "evidence_ref": "e", "evidence_limit": "l", "status": "CRYSTAL",
            "cluster_id": "X", "gate_head_sha": "a" * 40,
        }]
        result = evaluate(root, ledger)
        assert any("STATIC_SELF_REFERENTIAL_HEAD_FORBIDDEN" in err for err in result["errors"])
    print("INCIDENT_META_CRYSTAL_SELF_TEST=PASS")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--ledger", default="references/incident-crystals.json")
    parser.add_argument("--require-total", action="store_true")
    parser.add_argument("--final-seal", action="store_true")
    parser.add_argument("--head-sha", default="")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0
    repo_root = Path(args.repo_root).resolve()
    ledger_path = Path(args.ledger)
    if not ledger_path.is_absolute():
        ledger_path = (Path.cwd() / ledger_path).resolve()
    ledger = json.loads(ledger_path.read_text(encoding="utf-8"))
    receipt = evaluate(repo_root, ledger, observed_head=args.head_sha or None, final_seal=args.final_seal)
    print(json.dumps(receipt, ensure_ascii=False, indent=2, sort_keys=True))
    if receipt["errors"]:
        return 1
    if args.require_total and not receipt["total_ready"]:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
