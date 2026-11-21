"""Validate META-RSI contracts and, on request, the official Hermes skills loader.

No skill is executed and no security/trust gate is modified.
Use --loader-check inside the installed Hermes Python environment.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import subprocess
import sys


MOTHER = Path(__file__).resolve().parents[1]
REPO = MOTHER.parents[2]
CATALOG = MOTHER / "Skills" / "meta-rsi" / "catalog.json"


def source_exists(root: Path, name: str) -> bool:
    item = root / name
    if item.is_file():
        return True
    return subprocess.run(
        ["git", "-C", str(root), "cat-file", "-e", "HEAD:" + name],
        capture_output=True, check=False,
    ).returncode == 0


def catalog_check() -> dict:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    methods = catalog["methods"]
    adapters = catalog["meta_adapters"]
    assert len(methods) == 40, "SELF_METHOD_COUNT"
    assert [m["id"] for m in methods] == list(range(1, 41)), "SELF_ORDER"
    assert len({m["slug"] for m in methods}) == 40, "SELF_IDS_UNIQUE"
    assert len({a["slug"] for a in adapters}) == len(adapters), "META_IDS_UNIQUE"
    for item in methods + adapters:
        target = REPO / item["contract"]
        assert target.is_file(), "MISSING_CONTRACT: " + str(target)
        assert "Skill Mae" in target.read_text(encoding="utf-8"), "MISSING_MOTHER_BINDING: " + str(target)
    for item in adapters:
        assert source_exists(REPO, item["source"]), "MISSING_SOURCE: " + item["source"]
    assert (MOTHER / "SKILL.md").is_file(), "MOTHER_MISSING"
    assert (MOTHER / "Skills" / "kimetsu-brainstorm" / "SKILL.md").is_file(), "KIMETSU_ADAPTER_MISSING"
    return {
        "result": "PASS", "self_methods": len(methods),
        "adapters": len(adapters), "runtime": "UNKNOWN",
    }


def loader_check(project: Path) -> dict:
    """Real Hermes API: project trust, quarantine, list and skill_view readback."""
    project = project.resolve(strict=True)
    source = os.environ.get("HERMES_AGENT_SOURCE")
    if not source:
        localapp = os.environ.get("LOCALAPPDATA")
        if not localapp:
            raise RuntimeError("HERMES_AGENT_SOURCE_REQUIRED")
        source = str(Path(localapp) / "hermes" / "hermes-agent")
    home = Path(source).resolve(strict=True)
    if not (home / "tools" / "skills_tool.py").is_file():
        raise RuntimeError("HERMES_SKILL_LOADER_NOT_FOUND")
    os.chdir(project)
    sys.path.insert(0, str(home))
    from tools import skills_tool
    from agent.skill_utils import is_quarantined_project_skill

    roots, _ = skills_tool.skill_search_dirs()
    trusted_project = (project / ".agents" / "skills").resolve()
    trusted = any(path.resolve() == trusted_project for _, path in roots)
    print(json.dumps({
        "loader_phase": "SEARCH_ROOTS", "project": str(project),
        "trusted": trusted, "root_count": len(roots),
    }), flush=True)
    if not trusted:
        return {"result": "BLOCKED_UNTRUSTED_PROJECT", "project_trusted": False}

    real_mother = trusted_project / "centraldark-operational-method" / "SKILL.md"
    mother_quarantined = is_quarantined_project_skill(real_mother)
    if mother_quarantined:
        return {
            "result": "BLOCKED_MOTHER_QUARANTINE",
            "project_trusted": True,
            "mother_quarantined": True,
            "method_readback": "NOT_REPEATED_AFTER_BLOCK",
            "runtime_execution": "NOT_TESTED",
        }
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    wanted = (
        ["centraldark-" + m["slug"] for m in catalog["methods"]] +
        ["centraldark-" + m["slug"] + "-adapter" for m in catalog["meta_adapters"]] +
        ["centraldark-meta-rsi", "centraldark-operational-method"]
    )
    available = skills_tool.find_all_skills()
    names = {s["name"] for s in available}
    absent = [name for name in wanted if name not in names]
    sample_names = [
        "centraldark-meta-rsi", "centraldark-self-focus",
        "centraldark-meta-lupa-adapter", "centraldark-kimetsu-brainstorm-adapter",
    ]
    reads = {}
    for name in sample_names:
        if name not in names:
            reads[name] = False
            continue
        response = json.loads(skills_tool.skill_view(name, preprocess=False))
        reads[name] = response.get("success") is True

    ok = not mother_quarantined and not absent and all(reads.values())
    return {
        "result": "PASS" if ok else "BLOCKED_LOADER_GATE",
        "project_trusted": True,
        "official_loader": str(home / "tools" / "skills_tool.py"),
        "mother_quarantined": mother_quarantined,
        "expected_skills": len(wanted),
        "discovered": len(wanted) - len(absent),
        "absent": absent,
        "skill_view_readbacks": reads,
        "runtime_execution": "NOT_TESTED",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--loader-check", action="store_true")
    parser.add_argument("--project-root", type=Path, default=REPO)
    args = parser.parse_args()
    try:
        base = catalog_check()
        print(json.dumps({"catalog": base}, ensure_ascii=False), flush=True)
        if args.loader_check:
            outcome = loader_check(args.project_root)
            print(json.dumps({"loader": outcome}, ensure_ascii=False), flush=True)
            return 0 if outcome["result"] == "PASS" else 2
        return 0
    except Exception as exc:
        print(json.dumps({"result": "FAIL", "error": str(exc)}, ensure_ascii=False), flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
