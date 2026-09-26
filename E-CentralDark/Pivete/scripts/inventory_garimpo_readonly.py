#!/usr/bin/env python
"""Read-only metadata inventory for the CentralDark GARIMPO source root."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from zipfile import BadZipFile, ZipFile

ROOT = Path(r"E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE")
OUTPUT = Path(r"E:\CentralDark\Pivete\cache\garimpo-chefe-inventory-20260907.json")
SKIP_PARTS = {".extracted_", ".grok", "node_modules", ".git"}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def include(path: Path) -> bool:
    return not any(part.startswith(".extracted_") or part in SKIP_PARTS for part in path.relative_to(ROOT).parts)


def inspect(path: Path) -> dict[str, object]:
    item: dict[str, object] = {
        "path": str(path),
        "type": "ZIP",
        "size": path.stat().st_size,
        "mtime_utc": datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(),
        "sha256": sha256(path),
        "zip_integrity": "UNKNOWN",
        "entry_count": "UNKNOWN",
        "manifest_present": False,
        "checksum_present": False,
        "receipt_present": False,
        "counterproof_present": False,
        "validator_present": False,
    }
    try:
        with ZipFile(path) as archive:
            names = archive.namelist()
            lower = [name.lower() for name in names]
            item.update({
                "zip_integrity": "PASS" if archive.testzip() is None else "FAIL_BAD_MEMBER",
                "entry_count": len(names),
                "manifest_present": any("manifest" in name for name in lower),
                "checksum_present": any("checksum" in name or "sha256" in name for name in lower),
                "receipt_present": any("receipt" in name or "recibo" in name for name in lower),
                "counterproof_present": any("contraprova" in name or "counterproof" in name for name in lower),
                "validator_present": any("valid" in name or "test" in name for name in lower),
            })
    except (BadZipFile, OSError) as error:
        item["zip_integrity"] = f"FAIL:{type(error).__name__}"
    return item


items = [inspect(path) for path in sorted(ROOT.rglob("*.zip")) if include(path)]
hashes: dict[str, list[str]] = {}
for item in items:
    hashes.setdefault(str(item["sha256"]), []).append(str(item["path"]))
report = {
    "schema": "centraldark.garimpo-readonly-inventory.v1",
    "source_root": str(ROOT),
    "read_only": True,
    "generated_at_utc": datetime.now(timezone.utc).isoformat(),
    "artifact_count": len(items),
    "valid_count": sum(item["zip_integrity"] == "PASS" for item in items),
    "broken_count": sum(str(item["zip_integrity"]).startswith("FAIL") for item in items),
    "duplicate_hash_groups": {key: value for key, value in hashes.items() if len(value) > 1},
    "items": items,
}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({key: report[key] for key in ("artifact_count", "valid_count", "broken_count")}, ensure_ascii=False))
print(f"REPORT={OUTPUT}")
