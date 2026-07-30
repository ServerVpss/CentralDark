#!/usr/bin/env python3
"""Aplica somente correções determinísticas e allowlisted.

Qualquer achado sem transformação exata permanece pendente e vira Issue. O script
nunca inventa código para "deixar verde".
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PR_COMMAND = 'GH_TOKEN="${{ github.token }}" bash scripts/evolucao/publicar-pr-automatico.sh'


def replace_exact(path: Path, old: str, new: str, fix_id: str, fixes: list[dict]) -> None:
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    if old not in text:
        return
    updated = text.replace(old, new)
    if updated == text:
        return
    path.write_text(updated, encoding="utf-8", newline="\n")
    fixes.append({"id": fix_id, "path": path.relative_to(ROOT).as_posix(), "method": "exact-replacement"})


def finding_id(prefix: str, path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    return f"{prefix}-{hashlib.sha1(relative.encode()).hexdigest()[:8]}"


def remove_telegram_literal(path: Path, fixes: list[dict], fix_id: str) -> None:
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(
        r"(process\.env\.BOT_TOKEN_[A-Z0-9_]+\s*\|\|\s*)['\"]\d{8,12}:[A-Za-z0-9_-]{30,}['\"]"
    )
    updated, count = pattern.subn(r"\1''", text)
    if count:
        path.write_text(updated, encoding="utf-8", newline="\n")
        fixes.append({
            "id": fix_id,
            "path": path.relative_to(ROOT).as_posix(),
            "method": "remove-secret-fallback",
            "count": count,
        })


def ensure_response_rule_link(path: Path, fixes: list[dict]) -> None:
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    marker = ".claude/rules/00-resposta-dupla-pivete.md"
    if marker in text:
        return
    anchor = "## 3. O que você nunca faz sem ordem escrita"
    if anchor not in text:
        return
    block = (
        "## 3. Formato técnico obrigatório\n\n"
        "Carregue `.claude/rules/00-resposta-dupla-pivete.md`: primeiro diagnóstico técnico, "
        "depois Papo Reto do Pivete.\n\n---\n\n"
        "## 4. O que você nunca faz sem ordem escrita"
    )
    path.write_text(text.replace(anchor, block), encoding="utf-8", newline="\n")
    fixes.append({"id": "CD-AUTO-RESPOSTA-DUPLA", "path": path.relative_to(ROOT).as_posix(), "method": "canonical-link"})


def ensure_pull_request_permission(lines: list[str]) -> list[str]:
    if any(re.match(r"^\s{2}pull-requests\s*:\s*write\s*(?:#.*)?$", line) for line in lines):
        return lines
    try:
        index = next(i for i, line in enumerate(lines) if line.strip() == "permissions:" and not line.startswith((" ", "\t")))
    except StopIteration:
        try:
            index = next(i for i, line in enumerate(lines) if line.strip() == "jobs:" and not line.startswith((" ", "\t")))
        except StopIteration:
            return lines
        return lines[:index] + ["permissions:", "  contents: write", "  pull-requests: write", ""] + lines[index:]
    return lines[: index + 1] + ["  pull-requests: write"] + lines[index + 1 :]


def convert_workflow_push_to_pr(path: Path, fixes: list[dict]) -> None:
    if not path.is_file():
        return
    original = path.read_text(encoding="utf-8")
    if "git push" not in original or "gh pr create" in original:
        return

    lines = original.splitlines()
    changed = False
    for index, line in enumerate(lines):
        stripped = line.lstrip()
        if stripped.startswith("#") or not re.search(r"\bgit\s+push\b", line):
            continue
        indent = line[: len(line) - len(stripped)]
        if re.search(r"\bif\s+git\s+push\b.*;\s*then\s*$", stripped):
            lines[index] = f"{indent}if {PR_COMMAND}; then"
        elif re.search(r"\bgit\s+pull\b.*&&\s*git\s+push\b.*&&\s*break\s*$", stripped):
            lines[index] = f"{indent}{PR_COMMAND} && break"
        elif re.search(r"\bgit\s+push\b.*&&\s*exit\s+0\s*$", stripped):
            lines[index] = f"{indent}{PR_COMMAND} && exit 0"
        else:
            lines[index] = f"{indent}{PR_COMMAND}"
        changed = True

    if not changed:
        return
    lines = ensure_pull_request_permission(lines)
    updated = "\n".join(lines) + "\n"
    updated = updated.replace("✅ Painel atualizado (tentativa", "✅ PR do painel atualizado (tentativa")
    updated = updated.replace("✅ INDEX publicado (tentativa", "✅ PR do INDEX atualizado (tentativa")
    updated = updated.replace(
        '                echo "push tentativa $i falhou, aguardando e retentando..."\n'
        '                sleep $((RANDOM % 5 + 2))\n'
        '              done',
        '                echo "publicação em PR tentativa $i falhou, aguardando e retentando..."\n'
        '                sleep $((RANDOM % 5 + 2))\n'
        '              done\n'
        '              echo "publicação em PR falhou após 5 tentativas"\n'
        '              exit 1',
    )
    updated = updated.replace(
        '          echo "⚠️ push falhou (não bloqueia o monitor)"',
        '          echo "❌ publicação em PR falhou após 3 tentativas"\n'
        '          exit 1',
    )
    path.write_text(updated, encoding="utf-8", newline="\n")
    fixes.append({
        "id": finding_id("CD-AUTO-WF-DIRECT", path),
        "path": path.relative_to(ROOT).as_posix(),
        "method": "branch-pr-publisher",
    })


def correct_legacy_xp(fixes: list[dict]) -> None:
    script = ROOT / "scripts/evolucao/corrigir-xp-legado.py"
    if not script.is_file():
        return
    proc = subprocess.run(
        ["python3", str(script)],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"LEGACY_XP_CORRECTION_FAILED:{proc.returncode}:"
            f"{proc.stdout.strip()}:{proc.stderr.strip()}"
        )
    try:
        payload = json.loads(proc.stdout.splitlines()[-1])
    except (IndexError, json.JSONDecodeError) as exc:
        raise RuntimeError("LEGACY_XP_CORRECTION_RECEIPT_INVALID") from exc
    if payload.get("changed") is True:
        fixes.append({
            "id": "CD-AUTO-LUPA-XP-LEGACY",
            "path": ".agents/skills/meta-lupa/references/uso-ledger.jsonl",
            "method": "append-only-penalty",
            "xp_gained": payload.get("xp_gained"),
            "record_hash": payload.get("record_hash"),
        })


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=".artifacts/evolucao/autofix.json")
    args = parser.parse_args()
    fixes: list[dict] = []

    gate_old = '        "ponto_fixo_atingido": args.point_fixed == "sim",'
    gate_new = (
        '        "ponto_fixo_atingido": (\n'
        '            args.point_fixed == "sim" and args.autolupa == "sim"\n'
        '        ),'
    )
    for candidate in (
        ROOT / ".agents/skills/meta-lupa/scripts/meta_lupa.py",
        ROOT / ".agents/skills/meta-lupa/scripts/meta_lupa_core.py",
    ):
        replace_exact(candidate, gate_old, gate_new, "CD-AUTO-LUPA-AUTOLUPA", fixes)

    auditor = ROOT / "scripts/evolucao/auditar-autonomia.py"
    auditor_import_old = (
        "        module = importlib.util.module_from_spec(spec)\n"
        "        spec.loader.exec_module(module)"
    )
    auditor_import_new = (
        "        module = importlib.util.module_from_spec(spec)\n"
        "        sys.modules[spec.name] = module\n"
        "        spec.loader.exec_module(module)"
    )
    replace_exact(auditor, auditor_import_old, auditor_import_new, "CD-AUTO-LUPA-EXEC", fixes)

    detector_old = '        if re.search(r"(?m)^\\s*git\\s+push(?:\\s|$)", text) and "gh pr create" not in text:'
    detector_new = '        if re.search(r"(?m)^(?!\\s*#).*?\\bgit\\s+push(?:\\s|$)", text) and "gh pr create" not in text:'
    replace_exact(auditor, detector_old, detector_new, "CD-AUTO-WF-DIRECT-DETECTOR", fixes)

    evolution = ROOT / "apps/bot-telegram/evolucao-ias.cjs"
    remove_telegram_literal(evolution, fixes, "CD-AUTO-EVOL-SECRET")
    notify = ROOT / "apps/modulos/artifacts-builder/utils/notify.mjs"
    remove_telegram_literal(notify, fixes, finding_id("CD-AUTO-SECRET", notify))

    for workflow in sorted((ROOT / ".github/workflows").glob("*.y*ml")):
        convert_workflow_push_to_pr(workflow, fixes)

    ensure_response_rule_link(ROOT / "LEIA-ME-IA.md", fixes)
    correct_legacy_xp(fixes)

    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {"schema": 1, "count": len(fixes), "fixes": fixes}
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
