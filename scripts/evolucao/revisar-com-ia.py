#!/usr/bin/env python3
"""Revisão opcional por IA sobre finding_ids já produzidos por script.

A IA nunca é fonte única. Falha, ausência de credencial ou JSON inválido converte o
resultado para MODO SCRIPT sem esconder o motivo.
"""
from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def extract_json(text: str) -> dict | None:
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        value = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    return value if isinstance(value, dict) else None


def script_result(audit: dict, reason: str) -> dict:
    return {
        "schema": 1,
        "mode": "SCRIPT",
        "agent": "script",
        "reason": reason,
        "evidence_sha256": audit.get("evidence_sha256", ""),
        "confirmed_finding_ids": [item["id"] for item in audit.get("findings", [])],
        "analysis": "Auditoria determinística preservada; nenhuma autoria de IA foi declarada.",
        "next_action": "Aplicar somente auto-fix allowlisted; abrir Issue para o restante.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    audit_path = ROOT / args.input
    output_path = ROOT / args.output
    audit = json.loads(audit_path.read_text(encoding="utf-8"))

    darkai_bin = os.environ.get("DARKAI_BIN", "darkai")
    model = os.environ.get("DARKAI_REVIEW_MODEL", "openai/gpt-5.4")
    agent = os.environ.get("DARKAI_REVIEW_AGENT", "darkai")
    has_gateway = bool(os.environ.get("DARKAI_URL") and os.environ.get("DARKAI_ANON_KEY"))
    probe = subprocess.run(
        ["bash", "-lc", f"command -v {shlex.quote(darkai_bin)} >/dev/null 2>&1 || test -x {shlex.quote(str(ROOT / darkai_bin))}"],
        cwd=ROOT,
        check=False,
    )
    if not has_gateway or probe.returncode != 0:
        result = script_result(audit, "IA_INDISPONIVEL_OU_SEM_CREDENCIAL")
    else:
        findings = [
            {key: item.get(key) for key in ("id", "severity", "path", "title", "evidence")}
            for item in audit.get("findings", [])
        ]
        prompt = (
            "Revise apenas os achados fornecidos. Não invente arquivo, commit, teste ou sucesso. "
            "Responda somente JSON com evidence_sha256, finding_ids, analysis e next_action.\n"
            f"EVIDENCE_SHA256={audit.get('evidence_sha256', '')}\n"
            f"FINDINGS={json.dumps(findings, ensure_ascii=False)}"
        )
        executable = darkai_bin if Path(darkai_bin).is_absolute() else str(ROOT / darkai_bin) if (ROOT / darkai_bin).exists() else darkai_bin
        proc = subprocess.run(
            [executable, "--model", model, "--system", "Revisor fail-closed do CentralDark.", prompt],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
            timeout=180,
            encoding="utf-8",
            errors="replace",
        )
        parsed = extract_json(proc.stdout) if proc.returncode == 0 else None
        valid_ids = {item["id"] for item in audit.get("findings", [])}
        ids = parsed.get("finding_ids") if parsed else None
        valid = (
            parsed
            and parsed.get("evidence_sha256") == audit.get("evidence_sha256")
            and isinstance(ids, list)
            and all(isinstance(item, str) and item in valid_ids for item in ids)
            and isinstance(parsed.get("analysis"), str)
            and isinstance(parsed.get("next_action"), str)
        )
        if not valid:
            result = script_result(audit, "IA_RETORNOU_RECIBO_INVALIDO")
        else:
            result = {
                "schema": 1,
                "mode": "IA",
                "agent": agent,
                "reason": "",
                "evidence_sha256": audit["evidence_sha256"],
                "confirmed_finding_ids": ids,
                "analysis": parsed["analysis"],
                "next_action": parsed["next_action"],
            }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
