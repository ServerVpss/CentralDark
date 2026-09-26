#!/usr/bin/env python3
"""Gate semântico adversarial para auditorias de PR."""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

YES = "SIM"
NO = "NAO"
NA = "NAO_APLICAVEL"


def evaluate(record: dict[str, Any]) -> dict[str, Any]:
    reject: list[str] = []
    condition: list[str] = []

    for field in (
        "CONTRATO_DERIVADO_DA_REGRA",
        "CONTRAEXEMPLO_MINIMO_EXECUTADO",
        "ORACULO_INDEPENDENTE",
        "PROVA_CONTRARIA_PROCURADA",
        "TESTES_EXECUTADOS",
    ):
        value = record.get(field)
        if value == NO and field == "ORACULO_INDEPENDENTE":
            reject.append("ORACULO_NAO_INDEPENDENTE")
        elif value != YES:
            condition.append(f"{field}_NAO_COMPROVADO")

    if record.get("ORACULO_REPETE_MECANISMO") == YES:
        reject.append("ORACULO_COPIA_IMPLEMENTACAO")
    if record.get("EVIDENCIA_MISREPRESENTADA") == YES:
        reject.append("EVIDENCIA_DE_TESTE_ENGANOSA")

    for field, reason in (
        ("RESULTADO_MONETARIO_CORRETO", "RESULTADO_MONETARIO_INCORRETO"),
        ("AUTORIZACAO_CORRETA", "AUTORIZACAO_INCORRETA"),
        ("BORDA_INFERIOR_CORRETA", "BORDA_INFERIOR_INCORRETA"),
        ("BORDA_SUPERIOR_CORRETA", "BORDA_SUPERIOR_INCORRETA"),
    ):
        value = record.get(field)
        if value == NO:
            reject.append(reason)
        elif value not in {YES, NA}:
            condition.append(f"{field}_NAO_AVALIADO")

    tests_pass = record.get("TESTES_PASSARAM")
    if tests_pass == NO:
        reject.append("TESTES_FALHARAM")
    elif tests_pass != YES:
        condition.append("RESULTADO_DOS_TESTES_AUSENTE")

    if record.get("FEATURE_FLAG_ALEGADA") == YES:
        for field in (
            "FEATURE_FLAG_IMPLEMENTADA",
            "FEATURE_FLAG_CONFIGURADA",
            "FEATURE_FLAG_CALL_SITE",
            "FEATURE_FLAG_TESTADA",
            "ROLLBACK_COMPROVADO",
        ):
            if record.get(field) != YES:
                reject.append(f"{field}_AUSENTE")

    if record.get("INTEGRACAO_ALEGADA") == YES and record.get("CONSUMIDOR_REAL_COMPROVADO") != YES:
        reject.append("CONSUMIDOR_REAL_NAO_COMPROVADO")

    reject = sorted(set(reject))
    condition = sorted(set(condition))
    computed = "REJEITAR" if reject else ("CONDICIONAR" if condition else "APROVAR")
    declared = str(record.get("VEREDITO", "")).strip().upper() or "AUSENTE"
    false_green = declared == "APROVAR" and computed != "APROVAR"
    return {
        "STATUS": computed,
        "VEREDITO_DECLARADO": declared,
        "FALSE_GREEN": YES if false_green else NO,
        "TESTS_PASS_DECLARED": tests_pass,
        "REJECT_REASONS": reject,
        "CONDITION_REASONS": condition,
    }


def valid_fixture() -> dict[str, Any]:
    return {
        "CONTRATO_DERIVADO_DA_REGRA": YES,
        "CONTRAEXEMPLO_MINIMO_EXECUTADO": YES,
        "ORACULO_INDEPENDENTE": YES,
        "ORACULO_REPETE_MECANISMO": NO,
        "PROVA_CONTRARIA_PROCURADA": YES,
        "TESTES_EXECUTADOS": YES,
        "TESTES_PASSARAM": YES,
        "RESULTADO_MONETARIO_CORRETO": NA,
        "AUTORIZACAO_CORRETA": NA,
        "BORDA_INFERIOR_CORRETA": NA,
        "BORDA_SUPERIOR_CORRETA": NA,
        "EVIDENCIA_MISREPRESENTADA": NO,
        "FEATURE_FLAG_ALEGADA": NO,
        "INTEGRACAO_ALEGADA": NO,
        "VEREDITO": "APROVAR",
    }


def self_test() -> int:
    cases: dict[str, tuple[dict[str, Any], str, str | None]] = {}
    cases["POSITIVE"] = (valid_fixture(), "APROVAR", None)

    copied = valid_fixture()
    copied.update({
        "ORACULO_INDEPENDENTE": NO,
        "ORACULO_REPETE_MECANISMO": YES,
        "EVIDENCIA_MISREPRESENTADA": YES,
        "VEREDITO": "APROVAR",
    })
    cases["COPIED_ORACLE_GREEN_SUITE"] = (copied, "REJEITAR", "ORACULO_COPIA_IMPLEMENTACAO")

    admin = valid_fixture()
    admin.update({"AUTORIZACAO_CORRETA": NO, "VEREDITO": "APROVAR"})
    cases["ADMIN_SELF_APPROVAL"] = (admin, "REJEITAR", "AUTORIZACAO_INCORRETA")

    edge = valid_fixture()
    edge.update({"BORDA_INFERIOR_CORRETA": NO, "VEREDITO": "APROVAR"})
    cases["LOWER_EDGE"] = (edge, "REJEITAR", "BORDA_INFERIOR_INCORRETA")

    feature = valid_fixture()
    feature.update({
        "FEATURE_FLAG_ALEGADA": YES,
        "FEATURE_FLAG_IMPLEMENTADA": YES,
        "FEATURE_FLAG_CONFIGURADA": YES,
        "FEATURE_FLAG_CALL_SITE": YES,
        "FEATURE_FLAG_TESTADA": YES,
        "ROLLBACK_COMPROVADO": NO,
        "VEREDITO": "APROVAR",
    })
    cases["FEATURE_WITHOUT_ROLLBACK"] = (feature, "REJEITAR", "ROLLBACK_COMPROVADO_AUSENTE")

    outputs: dict[str, Any] = {}
    passed = True
    for name, (fixture, expected_status, expected_reason) in cases.items():
        result = evaluate(fixture)
        outputs[name] = result
        if result["STATUS"] != expected_status:
            passed = False
        if expected_reason and expected_reason not in result["REJECT_REASONS"]:
            passed = False
        if name != "POSITIVE" and result["FALSE_GREEN"] != YES:
            passed = False

    outputs["SELF_TEST"] = "PASS" if passed else "FAIL"
    print(json.dumps(outputs, ensure_ascii=False, sort_keys=True))
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", help="manifesto JSON; omitir para stdin")
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
        print(json.dumps({"STATUS": "REJEITAR", "REJECT_REASONS": ["INPUT_INVALIDO"], "DETAIL": str(exc)}, ensure_ascii=False))
        return 3
    if not isinstance(value, dict):
        print(json.dumps({"STATUS": "REJEITAR", "REJECT_REASONS": ["INPUT_NAO_OBJETO"]}, ensure_ascii=False))
        return 3
    result = evaluate(value)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return {"APROVAR": 0, "CONDICIONAR": 2, "REJEITAR": 3}[result["STATUS"]]


if __name__ == "__main__":
    raise SystemExit(main())
