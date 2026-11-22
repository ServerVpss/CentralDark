#!/usr/bin/env python3
"""Gate somente leitura do Jukebox A–Z / J001–JNNN.

Uso:
    python3 scripts/trigger-fabric/verify_jukebox.py --check
    python3 scripts/trigger-fabric/verify_jukebox.py --self-test

Owner: scripts/trigger-fabric/verify_repo_contract.py; sem novo workflow,
sem atualização de runtime e sem renumeração automática de IDs antigos.
"""
from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

PATH = "docs/CONSCIENCIA/RECEIPTS/2026-10-21-JUKEBOX-CENTRALDARK-A-Z-001-N.md"
BASELINE_COUNT = 301
BASELINE_FNV64 = "83f1dfa563d66705"  # Identidade+titulo J001..J301, jamais estado vivo
HEADINGS = re.compile(r'^### <a id="j(\d{3,})"></a>J(\d{3,}) · (.+)$', re.M)
ROW = re.compile(
    r'^\| ([A-Z#]) \| (.*?) \| \[(\d{3,})\]\(#j(\d{3,})\) \| ([^|]+) \| \x60([^\x60]+)\x60 \|$',
    re.M,
)


def fnv_titles(rows: list[tuple[str, str]]) -> str:
    """Fingerprint de identidade por Unicode codepoint, independente do SO."""
    h = 0xCBF29CE484222325
    for ident, title in rows:
        for char in f"J{ident}\t{title}\n":
            h ^= ord(char)
            h = (h * 0x100000001B3) & 0xFFFFFFFFFFFFFFFF
    return f"{h:016x}"


def alpha_key(title: str) -> str:
    normal = unicodedata.normalize("NFKD", title).casefold()
    sem_acentos = "".join(ch for ch in normal if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", sem_acentos).strip()


def letter_of(title: str) -> str:
    normal = unicodedata.normalize("NFKD", title)
    normal = "".join(ch for ch in normal if not unicodedata.combining(ch)).upper()
    first = normal[:1]
    return first if first and "A" <= first <= "Z" else "#"


def validate(content: str, baseline: bool = True) -> list[str]:
    issues: list[str] = []
    markers = [
        "## 1. 🎼 Índice alfabético",
        "## 2. 🎚️ Índice numérico",
        "## 3. Painel de cobertura",
    ]
    positions = [content.find(marker) for marker in markers]
    if any(p < 0 for p in positions) or positions != sorted(positions):
        return ["INDEX_SECTION_ORDER_INVALID"]
    alpha = content[positions[0]:positions[1]]
    numeric = content[positions[1]:positions[2]]
    parsed = ROW.findall(alpha)
    headings = HEADINGS.findall(numeric)
    if not parsed:
        issues.append("ALPHABETICAL_INDEX_EMPTY")
    if not headings:
        issues.append("NUMERICAL_INDEX_EMPTY")
    alpha_rows = [line for line in alpha.splitlines() if line.startswith("| ") and "(#j" in line]
    if len(alpha_rows) != len(parsed):
        issues.append("ALPHA_ROWS_UNPARSEABLE")
    numeric_titles = [line for line in numeric.splitlines() if line.startswith('### <a id="j')]
    if len(numeric_titles) != len(headings):
        issues.append("NUMERIC_HEADINGS_UNPARSEABLE")

    by_id: dict[str, str] = {}
    for anchor, ident, title in headings:
        if anchor != ident:
            issues.append(f"ANCHOR_MISMATCH:{ident}")
        if ident in by_id:
            issues.append(f"DUPLICATE_NUMERIC_ID:{ident}")
        by_id[ident] = title
    expected_ids = [str(i).zfill(3) for i in range(1, len(headings) + 1)]
    if [ident for _, ident, _ in headings] != expected_ids:
        issues.append("NUMERIC_SEQUENCE_MUST_BE_CONTIGUOUS_001_N")
    if baseline:
        if len(headings) < BASELINE_COUNT:
            issues.append("BASELINE_301_DELETED")
        original_ids = [(str(i).zfill(3), by_id.get(str(i).zfill(3), ""))
                        for i in range(1, BASELINE_COUNT + 1)]
        if fnv_titles(original_ids) != BASELINE_FNV64:
            issues.append("BASELINE_TITLE_OR_ID_DRIFT_REQUIRES_APPROVED_MIGRATION")

    seen: set[str] = set()
    for letter, name, ident, link, group, state in parsed:
        if ident != link:
            issues.append(f"BROKEN_ALPHA_ANCHOR:{ident}->{link}")
        if ident in seen:
            issues.append(f"DUPLICATE_ALPHA_ID:{ident}")
        seen.add(ident)
        if by_id.get(ident) != name:
            issues.append(f"ALPHA_NUMERIC_TITLE_MISMATCH:{ident}")
        if letter != letter_of(name):
            issues.append(f"ALPHA_LETTER_MISMATCH:{ident}")
        if not group.strip() or not state.strip():
            issues.append(f"EMPTY_GROUP_OR_STATUS:{ident}")
    if len(parsed) != len(headings) or seen != set(by_id):
        issues.append("ALPHA_NUMERIC_BIJECTION_FAILURE")
    canonical = sorted(
        parsed,
        key=lambda row: (0 if row[0] == "#" else ord(row[0]), alpha_key(row[1]), row[2]),
    )
    if parsed != canonical:
        issues.append("ALPHABETICAL_ORDER_DRIFT")
    # A faixa segue as ancoras; nao congelar contagem textual de um snapshot.
    if "NEXT_CURSOR" not in content or "UNKNOWN != PASS" not in content:
        issues.append("PROOF_AND_REPLAY_CONTRACT_MISSING")
    return issues


def self_test() -> int:
    fixture = (
        "## 1. 🎼 Índice alfabético\n"
        "| A | Alpha | [001](#j001) | Grupo | `SOURCE` |\n"
        "| B | Beta | [002](#j002) | Grupo | `SOURCE` |\n"
        "## 2. 🎚️ Índice numérico\n"
        '### <a id="j001"></a>J001 · Alpha\n'
        '### <a id="j002"></a>J002 · Beta\n'
        "## 3. Painel de cobertura\nNEXT_CURSOR; UNKNOWN != PASS\n"
    )
    if validate(fixture, baseline=False):
        print("JUKEBOX_SELF_TEST=FAIL_VALID_FIXTURE")
        return 1
    broken = {
        "alphabet": fixture.replace(
            "| A | Alpha | [001](#j001) | Grupo | `SOURCE` |\n"
            "| B | Beta | [002](#j002) | Grupo | `SOURCE` |",
            "| B | Beta | [002](#j002) | Grupo | `SOURCE` |\n"
            "| A | Alpha | [001](#j001) | Grupo | `SOURCE` |",
        ),
        "duplicate": fixture.replace("[002](#j002)", "[001](#j001)"),
        "broken_link": fixture.replace("[002](#j002)", "[002](#j001)"),
        "skipped_number": fixture.replace("J002 · Beta", "J003 · Beta").replace('id="j002"', 'id="j003"'),
        "title_drift": fixture.replace("J002 · Beta", "J002 · Gamma"),
    }
    failed = [name for name, text in broken.items() if not validate(text, baseline=False)]
    if failed:
        print("JUKEBOX_SELF_TEST=FAIL_UNDETECTED:" + ",".join(failed))
        return 1
    print("JUKEBOX_SELF_TEST=PASS negative_cases=5")
    return 0


def main() -> int:
    if "--self-test" in sys.argv:
        return self_test()
    root = Path(next((arg for arg in sys.argv[1:] if not arg.startswith("--")), ".")).resolve()
    file = root / PATH
    if not file.is_file():
        print("JUKEBOX_ORDER=FAIL MISSING_FILE=" + PATH)
        return 1
    problems = validate(file.read_text(encoding="utf-8"))
    if problems:
        print("JUKEBOX_ORDER=FAIL reasons=" + ",".join(problems[:25]))
        return 1
    print("JUKEBOX_ORDER=PASS ALPHA_SORTED=true NUMERIC_CONTIGUOUS=true STABLE_301=true CROSS_REFERENCES=true")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
