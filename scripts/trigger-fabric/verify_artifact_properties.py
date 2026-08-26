#!/usr/bin/env python3
import argparse
import re
import sys
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
    tags = fm.get("tags", "")
    if tags and not (tags.startswith("[") and tags.endswith("]") and re.search(r"[A-Za-zÀ-ÿ0-9]", tags)):
        errors.append("tags_invalid")
    return errors


def check_paths(root: Path, paths):
    failures = []
    for rel in paths:
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
    good = """---\ntitle: x\nstatus: KNOWLEDGE_ONLY\ndate: 2026-08-26\nupdated: 2026-08-26T08:38:00-03:00\ntags: [x]\ncategory: A-Teste\nsensitivity: INTERNAL\nsource: teste\nsource_class: INTERNAL\nsource_rule: regra\nowner: owner\n---\n"""
    bad = "---\ntitle: x\nstatus: INVENTADO\n---\n"
    ok = not validate_text(good) and bool(validate_text(bad))
    print(f"ARTIFACT_PROPERTIES_SELF_TEST={'PASS' if ok else 'FAIL'}")
    return ok


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--check-critical", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test and not self_test():
        raise SystemExit(1)
    if args.check_critical:
        failures = check_paths(Path(args.root).resolve(), CRITICAL)
        if failures:
            for path, errs in failures:
                print(f"ARTIFACT_PROPERTIES_FILE=FAIL path={path} errors={';'.join(errs)}")
            print("ARTIFACT_PROPERTIES_VERIFY=FAIL")
            raise SystemExit(1)
        print("ARTIFACT_PROPERTIES_VERIFY=PASS")


if __name__ == "__main__":
    main()
