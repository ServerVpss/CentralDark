#!/usr/bin/env python3
import argparse
import hashlib
import json
import re
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
TOTAL_MARKERS = (
    "INCIDENT_CRYSTALLIZATION_TOTAL=true",
    "META_INCIDENT_CRYSTAL=TOTAL",
    "ALL_INCIDENTS_CRYSTALLIZED=true",
)
LEARNING_CATEGORIES = {"armadilha", "erro-correcao", "erro-correção"}


def sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def slug(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9áàâãéêíóôõúç]+", "-", text, flags=re.I)
    return text.strip("-")[:80]


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
            incident_like = (
                category in LEARNING_CATEGORIES
                or any(token in title.casefold() for token in ("incidente", "erro", "falha", "armadilha", "falso"))
            )
            if incident_like:
                key = f"learning:{match.group(1)}:{slug(title)}"
                sources[key] = {
                    "kind": "LEARNING_INCIDENT",
                    "ref": "docs/CONSCIENCIA/APRENDIZADOS.md",
                    "title": title,
                    "category": category or "UNKNOWN",
                }
    return sources


def scan_total_claims(repo_root):
    claims = []
    # Artefatos declarativos apenas. O código do próprio detector contém os
    # marcadores como literais e não pode ser tratado como claim de totalidade.
    roots = [
        repo_root / "docs",
        repo_root / ".agents/skills/meta-lupa/references",
    ]
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


def validate_entry(entry, repo_root):
    errors = []
    status = entry.get("status")
    if status not in ALLOWED:
        errors.append(f"STATUS_INVALID:{status}")
    for field in ("id", "source_key", "evidence_ref", "evidence_limit"):
        if not entry.get(field):
            errors.append(f"{field.upper()}_MISSING")
    if status == "CRYSTAL":
        for field in ("owner_path", "counterproof_ref", "regression_path", "gate_head_sha"):
            if not entry.get(field):
                errors.append(f"CRYSTAL_{field.upper()}_MISSING")
        if entry.get("same_head_gate") != "PASS":
            errors.append("CRYSTAL_SAME_HEAD_GATE_NOT_PASS")
        head = str(entry.get("gate_head_sha", ""))
        if head and not re.fullmatch(r"[0-9a-f]{40}", head):
            errors.append("CRYSTAL_GATE_HEAD_SHA_INVALID")
        for field in ("owner_path", "regression_path"):
            value = entry.get(field)
            if value and not (repo_root / value).exists():
                errors.append(f"CRYSTAL_{field.upper()}_NOT_FOUND:{value}")
        if not entry.get("cross_meta_counterproof"):
            errors.append("CRYSTAL_CROSS_META_COUNTERPROOF_MISSING")
        if entry.get("fixed_point") is not True:
            errors.append("CRYSTAL_FIXED_POINT_UNPROVEN")
    return errors


def evaluate(repo_root, ledger):
    discovered = discover(repo_root)
    entries = ledger.get("entries", [])
    structural_errors = []
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
        for err in validate_entry(entry, repo_root):
            structural_errors.append(f"{eid or 'UNKNOWN'}:{err}")

    denominator = dict(discovered)
    for entry in entries:
        if entry.get("source_kind") == "EXTERNAL_HISTORY" and entry.get("source_key"):
            denominator.setdefault(entry["source_key"], {"kind": "EXTERNAL_HISTORY", "ref": entry.get("evidence_ref", "")})

    unregistered = sorted(k for k in denominator if k not in by_source)
    nonterminal = []
    terminal = []
    for key in sorted(denominator):
        entry = by_source.get(key)
        if not entry:
            continue
        if entry.get("status") in TERMINAL:
            terminal.append(key)
        else:
            nonterminal.append({"source_key": key, "status": entry.get("status")})

    claims = scan_total_claims(repo_root)
    total_ready = not structural_errors and not unregistered and not nonterminal and len(denominator) > 0
    if claims and not total_ready:
        structural_errors.append("FALSE_TOTAL_CRYSTALLIZATION_CLAIM")

    receipt = {
        "schema_version": 1,
        "gate": "INCIDENT_META_CRYSTAL",
        "denominator_scope": ledger.get("denominator_scope"),
        "denominator_count": len(denominator),
        "registered_count": len([k for k in denominator if k in by_source]),
        "terminal_count": len(terminal),
        "unregistered_count": len(unregistered),
        "nonterminal_count": len(nonterminal),
        "unregistered": unregistered,
        "nonterminal": nonterminal,
        "total_claims_found": claims,
        "total_ready": total_ready,
        "status": "CRYSTAL_TOTAL" if total_ready else "PARTIAL_EXPLICIT",
        "errors": structural_errors,
    }
    receipt["receipt_sha256"] = sha256_text(json.dumps(receipt, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    return receipt


def self_test():
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "docs/APRENDIZADOS").mkdir(parents=True)
        (root / "docs/CONSCIENCIA").mkdir(parents=True)
        (root / "docs/APRENDIZADOS/incidente-a.md").write_text("x", encoding="utf-8")
        (root / "docs/CONSCIENCIA/APRENDIZADOS.md").write_text("### 1. Erro antigo\n- **Categoria:** erro-correcao\n", encoding="utf-8")
        ledger = {"denominator_scope": "SELF_TEST", "entries": []}
        result = evaluate(root, ledger)
        assert result["total_ready"] is False
        assert result["unregistered_count"] == 2

        (root / "docs/claim.md").write_text("ALL_INCIDENTS_CRYSTALLIZED=true", encoding="utf-8")
        result = evaluate(root, ledger)
        assert "FALSE_TOTAL_CRYSTALLIZATION_CLAIM" in result["errors"]

        ledger["entries"] = [{
            "id": "INC-A",
            "source_key": "file:docs/APRENDIZADOS/incidente-a.md",
            "evidence_ref": "e",
            "evidence_limit": "l",
            "status": "CRYSTAL",
        }]
        result = evaluate(root, ledger)
        assert any("CRYSTAL_OWNER_PATH_MISSING" in err for err in result["errors"])
    print("INCIDENT_META_CRYSTAL_SELF_TEST=PASS")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--ledger", default="references/incident-crystals.json")
    parser.add_argument("--require-total", action="store_true")
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
    receipt = evaluate(repo_root, ledger)
    print(json.dumps(receipt, ensure_ascii=False, indent=2, sort_keys=True))

    if receipt["errors"]:
        return 1
    if args.require_total and not receipt["total_ready"]:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
