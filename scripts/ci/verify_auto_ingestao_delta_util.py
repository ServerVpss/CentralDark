#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUTO-INGESTAO-DELTA-UTIL.md"
MATERIAL = ROOT / "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MATERIAL-INGEST.md"
HUD = ROOT / "docs/CONSCIENCIA/PADRAO-HUD-STATUS-UNIVERSAL.md"

REQUIRED_DOC = [
    "AUTO_INGESTAO_DELTA_UTIL=true",
    "ONE_SYSTEM_ONLY=true",
    "SECOND_BRAIN_FORBIDDEN=true",
    "UNKNOWN_IS_PASS=false",
    "MODEL_OUTPUT_IS_NOT_USER_INPUT=true",
    "TOOL_OUTPUT_IS_NOT_USER_INPUT=true",
    "AUTHENTIC_USER_TURN",
    "GOOGLE_DRIVE_OWNER",
    "GITHUB_ISSUE_PR_COMMIT",
    "RUNTIME_LOG_SANITIZED",
    "source_id",
    "content_hash_or_revision",
    "FIND_EXISTING_OWNER",
    "EXTRACT_DELTA_UTIL",
    "ONE_WRITER_PER_CONFLICT_SCOPE",
    "READERS_MAX_PER_SIDE=50",
    "WRITER_COUNT_PER_CONFLICT_SCOPE=1",
    "RENDERED_TEXT_AS_USER_TURN=FAIL",
    "STREAM_FRAGMENT_AS_AUTHENTIC_TURN=FAIL",
    "SECRET_OR_TOKEN_IN_LOG=FAIL",
    "MIRROR != SOURCE_OF_TRUTH",
    "PERSISTENCE != PROMOTION",
    "INGESTION_DOES_NOT_GRANT_AUTHORITY=true",
    "CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true",
]

REQUIRED_MATERIAL = [
    "Auto-Ingestão Delta Útil — extensão 2026-09-15",
    "AUTO_INGESTAO_DELTA_UTIL=true",
    "READERS_MAX_PER_SIDE=50",
    "WRITER_COUNT_PER_CONFLICT_SCOPE=1",
    "CRYSTAL_REQUIRES_OWNER_CONSUMER_TEST_GATE=true",
]

missing = []
for path, required in [(DOC, REQUIRED_DOC), (MATERIAL, REQUIRED_MATERIAL)]:
    text = path.read_text(encoding="utf-8")
    for needle in required:
        if needle not in text:
            missing.append(f"{path.relative_to(ROOT)}::{needle}")
if HUD.exists():
    hud = HUD.read_text(encoding="utf-8").lower()
    has_human_first = (
        "termo humano universal primeiro" in hud
        or "human_first" in hud
        or "humana primeiro" in hud
    )
    if not has_human_first:
        missing.append("PADRAO-HUD-STATUS-UNIVERSAL.md::human_first")

if missing:
    print("AUTO_INGESTAO_DELTA_UTIL=FAIL")
    for item in missing:
        print("MISSING=" + item)
    sys.exit(1)

print(
    "AUTO_INGESTAO_DELTA_UTIL=PASS "
    "readers_max_per_side=50 "
    "one_writer=true "
    "provenance_required=true "
    "no_second_brain=true"
)
