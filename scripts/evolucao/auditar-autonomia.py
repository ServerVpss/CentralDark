#!/usr/bin/env python3
"""Auditoria determinística da autonomia do CentralDark.

Não usa IA e não declara sucesso por ausência de resposta externa. O relatório é a
fonte mínima comum: IAs podem revisar os finding_ids, mas nunca substituí-los.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[2]
WORKFLOWS = ROOT / ".github" / "workflows"
EVOLUTION_ENGINE = ROOT / "apps" / "bot-telegram" / "evolucao-ias.cjs"
META_LUPA = ROOT / ".agents" / "skills" / "meta-lupa" / "scripts" / "meta_lupa.py"
CANONICAL_DIRS = (
    ROOT / ".claude",
    ROOT / ".agents",
    ROOT / ".github",
    ROOT / "scripts",
    ROOT / "apps",
    ROOT / "infra",
)
EXCLUDED_PARTS = {".git", "node_modules", "dist", "build", "coverage", "backups", "_LEGADO_ROOT_DOCS_CONFLITOS"}
TEXT_SUFFIXES = {".py", ".js", ".cjs", ".mjs", ".ts", ".tsx", ".sh", ".yml", ".yaml", ".json", ".md", ".env"}
TELEGRAM_TOKEN = re.compile(r"\b\d{8,12}:[A-Za-z0-9_-]{30,}\b")
VERSIONED_CANONICAL = re.compile(r"(?:^|[-_.])v\d+(?:[-_.]|$)", re.I)


@dataclass(frozen=True)
class Finding:
    id: str
    severity: str
    path: str
    title: str
    evidence: str
    autofix: bool = False


def rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def add(findings: list[Finding], finding: Finding) -> None:
    if not any(item.id == finding.id and item.path == finding.path for item in findings):
        findings.append(finding)


def workflow_findings(findings: list[Finding]) -> None:
    if not WORKFLOWS.is_dir():
        add(findings, Finding("CD-AUTO-WF-000", "blocker", ".github/workflows", "Diretório de workflows ausente", "GitHub Actions não possui fonte versionada."))
        return
    for path in sorted([*WORKFLOWS.glob("*.yml"), *WORKFLOWS.glob("*.yaml")]):
        text = read(path)
        p = rel(path)
        required = {
            "name": bool(re.search(r"(?m)^name\s*:", text)),
            "on": bool(re.search(r"(?m)^on\s*:", text)),
            "jobs": bool(re.search(r"(?m)^jobs\s*:", text)),
            "runs-on": "runs-on:" in text,
            "steps": "steps:" in text,
        }
        missing = [key for key, ok in required.items() if not ok]
        if missing:
            add(findings, Finding(
                f"CD-AUTO-WF-SCHEMA-{hashlib.sha1(p.encode()).hexdigest()[:8]}",
                "blocker", p, "Workflow sem componentes obrigatórios",
                "ausentes=" + ",".join(missing),
            ))
        if re.search(r"(?m)^\s*git\s+push(?:\s|$)", text) and "gh pr create" not in text:
            add(findings, Finding(
                f"CD-AUTO-WF-DIRECT-{hashlib.sha1(p.encode()).hexdigest()[:8]}",
                "blocker", p, "Workflow faz push direto sem PR",
                "git push encontrado sem criação de pull request", True,
            ))
        if p.endswith("sentinela-divergencias.yml") and "runs-on: [self-hosted" in text:
            add(findings, Finding(
                "CD-AUTO-SENTINELA-RUNNER", "blocker", p,
                "Sentinela depende exclusivamente da VPS",
                "varredura pública deveria continuar em runner hospedado quando a VPS estiver indisponível", True,
            ))
        if p.endswith("sentinela-divergencias.yml") and "pull-requests: write" not in text:
            add(findings, Finding(
                "CD-AUTO-SENTINELA-PR-PERM", "blocker", p,
                "Sentinela não possui permissão explícita para abrir PR",
                "permissions.pull-requests: write ausente", True,
            ))


def evolution_findings(findings: list[Finding]) -> None:
    if not EVOLUTION_ENGINE.is_file():
        add(findings, Finding("CD-AUTO-EVOL-000", "blocker", rel(EVOLUTION_ENGINE), "Motor de evolução ausente", "arquivo canônico não encontrado"))
        return
    text = read(EVOLUTION_ENGINE)
    if TELEGRAM_TOKEN.search(text):
        add(findings, Finding(
            "CD-AUTO-EVOL-SECRET", "blocker", rel(EVOLUTION_ENGINE),
            "Token Telegram gravado no código",
            "padrão de token detectado; valor omitido", True,
        ))
    simulated = all(token in text for token in ("gerarAprendizado", "Math.random", "registrarAprendizadoPermanente"))
    if simulated:
        add(findings, Finding(
            "CD-AUTO-EVOL-SIMULATED", "blocker", rel(EVOLUTION_ENGINE),
            "Aprendizado aleatório pode virar memória permanente",
            "gerarAprendizado + Math.random + registrarAprendizadoPermanente", True,
        ))
    if "fallbackMensagem" in text and "MODO SCRIPT" not in text:
        add(findings, Finding(
            "CD-AUTO-EVOL-FAKE-FALLBACK", "blocker", rel(EVOLUTION_ENGINE),
            "Fallback fala como IA sem declarar indisponibilidade",
            "fallback textual não contém recibo MODO SCRIPT", True,
        ))
    required = ("evidence_sha256", "finding_ids", "MODO SCRIPT", "auditar-autonomia.py")
    missing = [item for item in required if item not in text]
    if missing:
        add(findings, Finding(
            "CD-AUTO-EVOL-EVIDENCE", "blocker", rel(EVOLUTION_ENGINE),
            "Motor de evolução sem contrato mínimo de evidência",
            "ausentes=" + ",".join(missing),
        ))


def meta_lupa_findings(findings: list[Finding]) -> None:
    if not META_LUPA.is_file():
        add(findings, Finding("CD-AUTO-LUPA-000", "blocker", rel(META_LUPA), "MetaLupa ausente", "arquivo canônico não encontrado"))
        return
    spec = importlib.util.spec_from_file_location("centraldark_meta_lupa_audit", META_LUPA)
    if not spec or not spec.loader:
        add(findings, Finding("CD-AUTO-LUPA-IMPORT", "blocker", rel(META_LUPA), "MetaLupa não importável", "spec/loader indisponível"))
        return
    try:
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        args = SimpleNamespace(
            achievement=["ponto_fixo_atingido"], evidence=["prova"],
            point_fixed="sim", autolupa="nao", error_found="", root_cause="",
            counter_evidence="", false_green_blocked=False, test_created="",
            regression_created="", guardrail_added="", rollback_proven=False,
            risk=[], improvements=[],
        )
        failures = module._validate_achievements(args)
    except Exception as exc:  # fail-closed
        add(findings, Finding("CD-AUTO-LUPA-EXEC", "blocker", rel(META_LUPA), "Validação da MetaLupa não executou", type(exc).__name__))
        return
    if not any("ponto_fixo_atingido" in item for item in failures):
        add(findings, Finding(
            "CD-AUTO-LUPA-AUTOLUPA", "blocker", rel(META_LUPA),
            "Ponto fixo aceita AutoLupa não executada",
            "point_fixed=sim + autolupa=nao não foi rejeitado", True,
        ))


def tracked_source_files() -> list[Path]:
    result = subprocess.run(
        ["git", "-C", str(ROOT), "ls-files", "-z"],
        check=False, capture_output=True,
    )
    if result.returncode != 0:
        return []
    files = []
    for raw in result.stdout.split(b"\0"):
        if not raw:
            continue
        path = ROOT / raw.decode("utf-8", errors="replace")
        if any(part in EXCLUDED_PARTS for part in path.parts):
            continue
        if path.suffix.lower() not in TEXT_SUFFIXES or not path.is_file():
            continue
        if not any(path == base or base in path.parents for base in CANONICAL_DIRS):
            continue
        files.append(path)
    return files


def secret_and_duplicate_findings(findings: list[Finding]) -> None:
    for path in tracked_source_files():
        p = rel(path)
        text = read(path)
        if path != EVOLUTION_ENGINE and TELEGRAM_TOKEN.search(text):
            add(findings, Finding(
                f"CD-AUTO-SECRET-{hashlib.sha1(p.encode()).hexdigest()[:8]}",
                "blocker", p, "Token Telegram gravado em fonte executável",
                "padrão de token detectado; valor omitido",
            ))
        if any(base in path.parents for base in (ROOT / ".claude" / "rules", ROOT / "scripts" / "evolucao", ROOT / ".agents" / "skills")):
            if VERSIONED_CANONICAL.search(path.name):
                add(findings, Finding(
                    f"CD-AUTO-DUP-{hashlib.sha1(p.encode()).hexdigest()[:8]}",
                    "warning", p, "Nome versionado em área canônica",
                    "use um único nome canônico; v1/v2/v3 tende a criar doutrinas paralelas",
                ))


def build_report() -> dict:
    findings: list[Finding] = []
    workflow_findings(findings)
    evolution_findings(findings)
    meta_lupa_findings(findings)
    secret_and_duplicate_findings(findings)
    findings = sorted(findings, key=lambda item: (item.severity != "blocker", item.id, item.path))
    blockers = sum(item.severity == "blocker" for item in findings)
    warnings = sum(item.severity == "warning" for item in findings)
    payload = {
        "schema": 1,
        "summary": {"blockers": blockers, "warnings": warnings, "findings": len(findings)},
        "findings": [asdict(item) for item in findings],
    }
    payload["evidence_sha256"] = hashlib.sha256(
        json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    return payload


def markdown(report: dict) -> str:
    lines = [
        "# Auditoria de autonomia", "",
        f"- Bloqueadores: **{report['summary']['blockers']}**",
        f"- Avisos: **{report['summary']['warnings']}**",
        f"- Evidência SHA-256: `{report['evidence_sha256']}`", "",
    ]
    if not report["findings"]:
        lines.append("Nenhuma lacuna encontrada dentro do escopo auditado. Isso não prova áreas fora do escopo.")
    else:
        lines.extend(["| ID | Severidade | Arquivo | Achado | Auto-fix |", "|---|---|---|---|---|"])
        for item in report["findings"]:
            lines.append(f"| `{item['id']}` | {item['severity']} | `{item['path']}` | {item['title']} | {'sim' if item['autofix'] else 'não'} |")
    return "\n".join(lines) + "\n"


def write_if_changed(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return
    path.write_text(content, encoding="utf-8", newline="\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json-stdout", action="store_true")
    parser.add_argument("--json-output", default="")
    parser.add_argument("--markdown-output", default="")
    args = parser.parse_args()
    report = build_report()
    if args.json_output:
        write_if_changed(ROOT / args.json_output, json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
    if args.markdown_output:
        write_if_changed(ROOT / args.markdown_output, markdown(report))
    if args.json_stdout or not (args.json_output or args.markdown_output):
        print(json.dumps(report, ensure_ascii=False, sort_keys=True))
    return 1 if report["summary"]["blockers"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
