#!/usr/bin/env python3
"""Gate determinístico para alegações de aprendizado/consolidação."""

from __future__ import annotations

import argparse
import json
import re
import sys
from typing import Any

SHA256 = re.compile(r"^[0-9a-f]{64}$")
YES = "SIM"
NO = "NAO"
NA = "NAO_APLICAVEL"


def evaluate(record: dict[str, Any]) -> dict[str, Any]:
    reasons: list[str] = []

    if not str(record.get("REGRA_GRAVADA_EM", "")).strip():
        reasons.append("REGRA_GRAVADA_EM_AUSENTE")

    before = str(record.get("FILE_SHA256_ANTES", "")).strip().lower()
    after = str(record.get("FILE_SHA256_DEPOIS", "")).strip().lower()
    if not SHA256.fullmatch(before) or not SHA256.fullmatch(after):
        reasons.append("FILE_SHA256_INVALIDO")
    elif before == after:
        reasons.append("FILE_SHA256_NAO_MUDOU")

    for field in ("TESTE_POSITIVO", "TESTE_NEGATIVO", "SESSAO_NOVA", "GATE_AUTO_INVOKED", "PROVA_CONTRARIA_PROCURADA"):
        if record.get(field) != YES:
            reasons.append(f"{field}_NAO_COMPROVADO")

    if record.get("TESTE_LIMITE") not in {YES, NA}:
        reasons.append("TESTE_LIMITE_NAO_COMPROVADO")

    write_occurred = record.get("WRITE_OCCURRED")
    if write_occurred not in {YES, NO}:
        reasons.append("WRITE_OCCURRED_AUSENTE")
    elif write_occurred == YES and record.get("ROLLBACK_PROVADO") != YES:
        reasons.append("ROLLBACK_OBRIGATORIO_APOS_ESCRITA")
    elif write_occurred == NO and record.get("ROLLBACK_PROVADO") not in {YES, NA}:
        reasons.append("ROLLBACK_PROVADO_NAO_COMPROVADO")

    if record.get("FONTE_PRIMARIA") not in {YES, NA}:
        reasons.append("FONTE_PRIMARIA_NAO_COMPROVADA")
    if record.get("DADOS_PRIVADOS_EXPOSTOS") != NO:
        reasons.append("DADOS_PRIVADOS_EXPOSTOS_OU_INCERTOS")
    if record.get("DUPLICATA_ENCONTRADA") not in {YES, NO}:
        reasons.append("INVENTARIO_DE_DUPLICATAS_AUSENTE")
    if record.get("DUPLICATA_ENCONTRADA") == YES and not str(record.get("DESTINO_DA_DUPLICATA", "")).strip():
        reasons.append("DESTINO_DA_DUPLICATA_AUSENTE")

    declared = str(record.get("VEREDITO", "")).strip().upper()
    false_green = bool(reasons and declared == "APROVAR")
    return {
        "STATUS": "ALLOWED" if not reasons else "BLOCKED",
        "VEREDITO_DECLARADO": declared or "AUSENTE",
        "FALSE_GREEN": "SIM" if false_green else "NAO",
        "REASONS": reasons,
    }


def valid_fixture() -> dict[str, Any]:
    return {
        "REGRA_GRAVADA_EM": "analysis/external-source-analysis/SKILL.md",
        "FILE_SHA256_ANTES": "1" * 64,
        "FILE_SHA256_DEPOIS": "2" * 64,
        "TESTE_POSITIVO": YES,
        "TESTE_NEGATIVO": YES,
        "TESTE_LIMITE": NA,
        "WRITE_OCCURRED": YES,
        "ROLLBACK_PROVADO": YES,
        "SESSAO_NOVA": YES,
        "GATE_AUTO_INVOKED": YES,
        "FONTE_PRIMARIA": YES,
        "PROVA_CONTRARIA_PROCURADA": YES,
        "DADOS_PRIVADOS_EXPOSTOS": NO,
        "DUPLICATA_ENCONTRADA": NO,
        "VEREDITO": "APROVAR",
    }


def self_test() -> int:
    positive = evaluate(valid_fixture())
    negative_fixture = valid_fixture()
    negative_fixture["TESTE_NEGATIVO"] = NO
    negative = evaluate(negative_fixture)
    limit_fixture = valid_fixture()
    limit_fixture["ROLLBACK_PROVADO"] = NA
    limit_case = evaluate(limit_fixture)
    legacy_fixture = valid_fixture()
    legacy_fixture["BLOB_ANTES"] = legacy_fixture.pop("FILE_SHA256_ANTES")
    legacy_fixture["BLOB_DEPOIS"] = legacy_fixture.pop("FILE_SHA256_DEPOIS")
    legacy_case = evaluate(legacy_fixture)
    auto_fixture = valid_fixture()
    auto_fixture["GATE_AUTO_INVOKED"] = NO
    auto_case = evaluate(auto_fixture)
    passed = (
        positive["STATUS"] == "ALLOWED"
        and negative["STATUS"] == "BLOCKED"
        and negative["FALSE_GREEN"] == YES
        and "TESTE_NEGATIVO_NAO_COMPROVADO" in negative["REASONS"]
        and limit_case["STATUS"] == "BLOCKED"
        and "ROLLBACK_OBRIGATORIO_APOS_ESCRITA" in limit_case["REASONS"]
        and legacy_case["STATUS"] == "BLOCKED"
        and "FILE_SHA256_INVALIDO" in legacy_case["REASONS"]
        and auto_case["STATUS"] == "BLOCKED"
        and "GATE_AUTO_INVOKED_NAO_COMPROVADO" in auto_case["REASONS"]
    )
    print(json.dumps({"SELF_TEST": "PASS" if passed else "FAIL", "POSITIVE": positive, "NEGATIVE": negative, "LIMIT": limit_case, "LEGACY_FIELDS": legacy_case, "AUTO_GATE": auto_case}, ensure_ascii=False, sort_keys=True))
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", help="JSON de evidência; omitir para stdin")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    try:
        if args.input:
            with open(args.input, encoding="utf-8") as handle:
                value = json.load(handle)
        else:
            value = json.load(sys.stdin)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        print(json.dumps({"STATUS": "BLOCKED", "REASONS": ["INPUT_INVALIDO"], "DETAIL": str(exc)}, ensure_ascii=False))
        return 2
    if not isinstance(value, dict):
        print(json.dumps({"STATUS": "BLOCKED", "REASONS": ["INPUT_NAO_OBJETO"]}, ensure_ascii=False))
        return 2
    result = evaluate(value)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0 if result["STATUS"] == "ALLOWED" else 2


if __name__ == "__main__":
    raise SystemExit(main())
