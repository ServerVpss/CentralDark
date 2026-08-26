#!/usr/bin/env python3
import argparse
import re
import subprocess
from datetime import date, datetime
from pathlib import Path

REQUIRED = {
    "title", "status", "source_rule", "date", "updated", "tags",
    "category", "sensitivity", "source", "source_class", "owner",
}
STATUS = {"CANONICO", "DERIVED_VIEW", "CANDIDATE", "KNOWLEDGE_ONLY", "QUARANTINE", "HISTORICAL", "SUPERSEDED", "FLASH_READY", "UNPROVEN", "BLOCKED"}
SENSITIVITY = {"PUBLIC", "INTERNAL", "SENSITIVE_QUARANTINE"}
SOURCE_CLASS = {"HUMAN_AUTHORITY", "TOOL_MEASURED", "INTERNAL", "EXTERNAL_UNTRUSTED", "UNDECLARED"}
CRITICAL = [
    "docs/CONSCIENCIA/MAPA-DO-CEREBRO.md",
    "docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md",
    "docs/CONSCIENCIA/PIVETE-IA/PIVETE-18-ROTA-MEMORIA.md",
    "docs/CONSCIENCIA/APRENDIZADOS/2026-08-26-intencao-unica-propriedades-ciclo-mestre.md",
]


def parse_frontmatter(text: str):
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end < 0:
        return {}
    out = {}
    for line in text[4:end].splitlines():
        if not line or line.startswith(" ") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip().strip('"').strip("'")
        out[key.strip()] = value
    return out


def valid_date(value: str) -> bool:
    try:
        parsed = date.fromisoformat(str(value))
        return parsed.isoformat() == str(value)
    except (TypeError, ValueError):
        return False


def valid_datetime(value: str) -> bool:
    raw = str(value or "")
    if "T" not in raw:
        return False
    try:
        datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return True
    except (TypeError, ValueError):
        return False


def validate_text(text: str):
    fm = parse_frontmatter(text)
    missing = sorted(k for k in REQUIRED if not fm.get(k))
    errors = []
    if missing:
        errors.append("missing=" + ",".join(missing))
    if fm.get("status") and fm["status"] not in STATUS:
        errors.append("status_invalid=" + fm["status"])
    if fm.get("sensitivity") and fm["sensitivity"] not in SENSITIVITY:
        errors.append("sensitivity_invalid=" + fm["sensitivity"])
    if fm.get("source_class") and fm["source_class"] not in SOURCE_CLASS:
        errors.append("source_class_invalid=" + fm["source_class"])
    if fm.get("date") and not valid_date(fm["date"]):
        errors.append("date_invalid=" + fm["date"])
    if fm.get("updated") and not valid_datetime(fm["updated"]):
        errors.append("updated_invalid=" + fm["updated"])
    if fm.get("observed_at") and not valid_datetime(fm["observed_at"]):
        errors.append("observed_at_invalid=" + fm["observed_at"])
    tags = fm.get("tags", "")
    if tags and not (tags.startswith("[") and tags.endswith("]") and re.search(r"[A-Za-zÀ-ÿ0-9]", tags)):
        errors.append("tags_invalid")
    return errors


def artifact_eligible(rel: str) -> bool:
    rel = rel.replace("\\", "/")
    if not rel.endswith(".md"):
        return False
    if rel in CRITICAL:
        return True
    return (
        rel.startswith("docs/CONSCIENCIA/APRENDIZADOS/")
        or rel.startswith("docs/BRAIN/")
    )


def changed_artifacts(root: Path, base_sha: str):
    if not base_sha:
        return []
    proc = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=ACMR", f"{base_sha}...HEAD", "--"],
        cwd=root,
        text=True,
        capture_output=True,
        check=False,
        timeout=15,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"git_diff_failed:{(proc.stderr or '').strip()[:200]}")
    return sorted({line.strip() for line in proc.stdout.splitlines() if artifact_eligible(line.strip())})


def check_paths(root: Path, paths):
    failures = []
    for rel in sorted(set(paths)):
        p = root / rel
        if not p.is_file():
            failures.append((rel, ["file_missing"]))
            continue
        errs = validate_text(p.read_text(encoding="utf-8", errors="replace"))
        if errs:
            failures.append((rel, errs))
        else:
            print(f"ARTIFACT_PROPERTIES_FILE=PASS path={rel}")
    return failures


def self_test():
    good = """---\ntitle: x\nstatus: KNOWLEDGE_ONLY\ndate: 2026-08-26\nupdated: 2026-08-26T08:38:00-03:00\nobserved_at: 2026-08-26T08:39:00-03:00\ntags: [x]\ncategory: A-Teste\nsensitivity: INTERNAL\nsource: teste\nsource_class: INTERNAL\nsource_rule: regra\nowner: owner\n---\n"""
    bad_enum = "---\ntitle: x\nstatus: INVENTADO\n---\n"
    bad_temporal = """---\ntitle: x\nstatus: KNOWLEDGE_ONLY\ndate: definitely-not-a-date\nupdated: yesterday\ntags: [x]\ncategory: A-Teste\nsensitivity: INTERNAL\nsource: teste\nsource_class: INTERNAL\nsource_rule: regra\nowner: owner\n---\n"""
    good_errors = validate_text(good)
    enum_errors = validate_text(bad_enum)
    temporal_errors = validate_text(bad_temporal)
    eligibility_ok = (
        artifact_eligible("docs/CONSCIENCIA/APRENDIZADOS/novo.md")
        and artifact_eligible("docs/BRAIN/01-CONCEITOS/Banda/x.md")
        and not artifact_eligible("docs/ARQUITETURA/README.md")
    )
    ok = (
        not good_errors
        and bool(enum_errors)
        and any(e.startswith("date_invalid=") for e in temporal_errors)
        and any(e.startswith("updated_invalid=") for e in temporal_errors)
        and eligibility_ok
    )
    print(f"ARTIFACT_PROPERTIES_SELF_TEST={'PASS' if ok else 'FAIL'}")
    return ok


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--check-critical", action="store_true")
    parser.add_argument("--changed-from", default="")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    if args.self_test and not self_test():
        raise SystemExit(1)

    paths = list(CRITICAL if args.check_critical else [])
    if args.changed_from:
        try:
            changed = changed_artifacts(root, args.changed_from)
        except RuntimeError as exc:
            print(f"ARTIFACT_PROPERTIES_VERIFY=FAIL error={exc}")
            raise SystemExit(1)
        print(f"ARTIFACT_PROPERTIES_CHANGED_DENOMINATOR={len(changed)}")
        paths.extend(changed)

    if paths:
        failures = check_paths(root, paths)
        if failures:
            for path, errs in failures:
                print(f"ARTIFACT_PROPERTIES_FILE=FAIL path={path} errors={';'.join(errs)}")
            print("ARTIFACT_PROPERTIES_VERIFY=FAIL")
            raise SystemExit(1)
        print("ARTIFACT_PROPERTIES_VERIFY=PASS")


if __name__ == "__main__":
    main()
