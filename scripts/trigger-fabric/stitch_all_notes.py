#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/NOTE-STITCHING-CONTRACT.yml"
NOTE_ROOTS = [
    "docs/BRAIN",
    "docs/CONSCIENCIA",
    "docs/ARQUITETURA",
    "docs/RELATORIOS",
    ".agents/skills",
]
EXTENSIONS = {".md", ".markdown", ".yml", ".yaml", ".json"}
EXCLUDE_PARTS = {
    "node_modules", "vendor", "dist", "build", ".git", "__pycache__", ".artifacts"
}
EXCLUDE_FILES = {"package-lock.json", "pnpm-lock.yaml", "yarn.lock"}
MASTER_CYCLE = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml"
UNIVERSAL_METHOD = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml"
SECOND_BRAIN = "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SECOND-BRAIN.yml"
STITCH_MARKER = "🪡"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def normalized_rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def excluded(path: Path) -> bool:
    rel = path.resolve().relative_to(ROOT)
    if path.name in EXCLUDE_FILES:
        return True
    return any(part in EXCLUDE_PARTS for part in rel.parts)


def source_class(rel: str) -> str:
    if rel.startswith("docs/BRAIN/"):
        return "SECOND_BRAIN_NOTE"
    if rel.startswith("docs/CONSCIENCIA/"):
        return "CONSCIENCE_NOTE"
    if rel.startswith("docs/ARQUITETURA/"):
        return "ARCHITECTURE_NOTE"
    if rel.startswith("docs/RELATORIOS/"):
        return "REPORT_NOTE"
    if rel.startswith(".agents/skills/"):
        return "SKILL_NOTE"
    return "CENTRALDARK_NOTE"


def owner_resolution(rel: str) -> str:
    if rel.startswith("docs/BRAIN/"):
        return SECOND_BRAIN
    if rel.startswith("docs/CONSCIENCIA/"):
        return "docs/CONSCIENCIA/MAPA-DO-CEREBRO.md"
    if rel.startswith("docs/ARQUITETURA/"):
        return "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CONTRACT.yml"
    if rel.startswith("docs/RELATORIOS/"):
        return "continuity/receipt-history"
    if rel.startswith(".agents/skills/"):
        return "capability-contract-router"
    return MASTER_CYCLE


def discover_notes():
    seen_paths = set()
    notes = []
    roots_seen = []
    for root_name in NOTE_ROOTS:
        root = ROOT / root_name
        if not root.exists():
            continue
        roots_seen.append(root_name)
        for path in sorted(root.rglob("*")):
            if not path.is_file() or excluded(path):
                continue
            if path.suffix.lower() not in EXTENSIONS:
                continue
            rel = normalized_rel(path)
            if rel in seen_paths:
                raise RuntimeError(f"DUPLICATE_PATH:{rel}")
            seen_paths.add(rel)
            digest = sha256_file(path)
            notes.append({
                "path": rel,
                "sha256": digest,
                "root": root_name,
                "source_class": source_class(rel),
                "stitch_marker": STITCH_MARKER,
                "master_cycle": MASTER_CYCLE,
                "universal_method": UNIVERSAL_METHOD,
                "owner_resolution": owner_resolution(rel),
                "derived_index_only": True,
            })
    return roots_seen, notes


def build_inventory():
    roots_seen, notes = discover_notes()
    by_hash = {}
    for note in notes:
        by_hash.setdefault(note["sha256"], []).append(note["path"])
    duplicate_groups = [paths for paths in by_hash.values() if len(paths) > 1]
    return {
        "schema": "centraldark.note-stitch-inventory.v1",
        "ok": True,
        "stitch_marker": STITCH_MARKER,
        "cultural_phrase": "vai #rasgando que eu vou costurando",
        "roots_configured": NOTE_ROOTS,
        "roots_seen": roots_seen,
        "note_count": len(notes),
        "unique_content_sha256": len(by_hash),
        "duplicate_content_groups": duplicate_groups,
        "notes": notes,
    }


def validate_contract(inventory):
    if not CONTRACT.exists():
        raise RuntimeError("NOTE_STITCHING_CONTRACT_MISSING")
    text = CONTRACT.read_text(encoding="utf-8", errors="strict")
    required = [
        'marker: "🪡"',
        'cultural_phrase: "vai #rasgando que eu vou costurando"',
        'EVERY_DISCOVERED_NOTE_GETS_STITCH_RECEIPT: true',
        'ONE_LOGICAL_SECOND_BRAIN: true',
        'PARALLEL_SECOND_BRAIN_FORBIDDEN: true',
        'scanner: scripts/trigger-fabric/stitch_all_notes.py',
    ]
    missing = [token for token in required if token not in text]
    if missing:
        raise RuntimeError("CONTRACT_TOKENS_MISSING:" + ",".join(missing))
    if inventory["note_count"] <= 0:
        raise RuntimeError("NO_NOTES_DISCOVERED")
    if "docs/BRAIN" not in inventory["roots_seen"]:
        raise RuntimeError("BRAIN_ROOT_NOT_DISCOVERED")
    if "docs/CONSCIENCIA" not in inventory["roots_seen"]:
        raise RuntimeError("CONSCIENCIA_ROOT_NOT_DISCOVERED")
    for note in inventory["notes"]:
        if len(note["sha256"]) != 64:
            raise RuntimeError(f"INVALID_SHA256:{note['path']}")
        if note["stitch_marker"] != STITCH_MARKER:
            raise RuntimeError(f"STITCH_MARKER_MISSING:{note['path']}")
        if note["master_cycle"] != MASTER_CYCLE:
            raise RuntimeError(f"MASTER_ROUTE_MISMATCH:{note['path']}")
        if note["universal_method"] != UNIVERSAL_METHOD:
            raise RuntimeError(f"UNIVERSAL_ROUTE_MISMATCH:{note['path']}")
    return True


def summary(inventory):
    return {
        "schema": inventory["schema"],
        "ok": inventory["ok"],
        "stitch_marker": inventory["stitch_marker"],
        "roots_seen": inventory["roots_seen"],
        "note_count": inventory["note_count"],
        "unique_content_sha256": inventory["unique_content_sha256"],
        "duplicate_content_group_count": len(inventory["duplicate_content_groups"]),
        "master_cycle": MASTER_CYCLE,
        "universal_method": UNIVERSAL_METHOD,
    }


def main():
    parser = argparse.ArgumentParser(description="🪡 CentralDark deterministic note stitcher")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--inventory", action="store_true")
    parser.add_argument("--output", type=str, default="")
    args = parser.parse_args()

    try:
        inventory = build_inventory()
        validate_contract(inventory)
        if args.output:
            output_path = Path(args.output)
            if not output_path.is_absolute():
                output_path = ROOT / output_path
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if args.inventory:
            print(json.dumps(inventory, ensure_ascii=False, indent=2))
        else:
            print(json.dumps(summary(inventory), ensure_ascii=False, indent=2))
        if args.self_test:
            print("NOTE_STITCHING_SELF_TEST=PASS")
        return 0
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        if args.self_test:
            print("NOTE_STITCHING_SELF_TEST=FAIL", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
