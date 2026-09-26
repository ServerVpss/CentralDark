#!/usr/bin/env python3
"""Gate determinístico para avaliação baseline × candidato do padrão Pivete."""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

YES = "SIM"
NO = "NAO"
WEIGHTS = {
    "correcao": 0.35,
    "autonomia": 0.25,
    "acao_pratica": 0.20,
    "seguranca": 0.10,
    "concisao": 0.10,
}


def _scores(record: dict[str, Any], prefix: str) -> tuple[dict[str, float], list[str]]:
    values: dict[str, float] = {}
    errors: list[str] = []
    raw = record.get(prefix)
    if not isinstance(raw, dict):
        return values, [f"{prefix.upper()}_AUSENTE"]
    for name in WEIGHTS:
        try:
            value = float(raw[name])
        except (KeyError, TypeError, ValueError):
            errors.append(f"{prefix.upper()}_{name.upper()}_INVALIDO")
            continue
        if value < 1 or value > 5:
            errors.append(f"{prefix.upper()}_{name.upper()}_FORA_DA_ESCALA")
        values[name] = value
    return values, errors


def evaluate(record: dict[str, Any]) -> dict[str, Any]:
    reject: list[str] = []
    condition: list[str] = []
    for field in (
        "MESMOS_CASOS",
        "MESMO_MODELO_FIXADO",
        "MESMO_NUMERO_DE_TENTATIVAS",
        "MESMA_RUBRICA",
        "CONFIGURACAO_ISOLADA",
        "MEMORIA_ISOLADA",
        "HOOKS_ISOLADOS",
        "JULGAMENTO_CEGO",
        "ERROS_PROVIDER_PRESERVADOS",
    ):
        if record.get(field) != YES:
            condition.append(f"{field}_NAO_COMPROVADO")

    baseline, baseline_errors = _scores(record, "baseline")
    candidate, candidate_errors = _scores(record, "candidato")
    condition.extend(baseline_errors + candidate_errors)

    try:
        blockers = int(record.get("BLOQUEIOS", -1))
    except (TypeError, ValueError):
        blockers = -1
    if blockers < 0:
        condition.append("BLOQUEIOS_NAO_AVALIADOS")
    elif blockers > 0:
        reject.append("BLOQUEIO_MATERIAL_PRESENTE")

    baseline_weighted = None
    candidate_weighted = None
    if not baseline_errors and not candidate_errors:
        baseline_weighted = sum(baseline[key] * weight for key, weight in WEIGHTS.items())
        candidate_weighted = sum(candidate[key] * weight for key, weight in WEIGHTS.items())
        if candidate["correcao"] < baseline["correcao"] - 0.1:
            reject.append("REGRESSAO_DE_CORRECAO")
        if candidate["seguranca"] < baseline["seguranca"] - 0.1:
            reject.append("REGRESSAO_DE_SEGURANCA")
        if candidate_weighted <= baseline_weighted:
            reject.append("PONTUACAO_NAO_SUPERA_BASELINE")

    reject = sorted(set(reject))
    condition = sorted(set(condition))
    status = "REJEITAR" if reject else ("CONDICIONAR" if condition else "APROVAR")
    declared = str(record.get("VEREDITO", "")).strip().upper() or "AUSENTE"
    return {
        "STATUS": status,
        "VEREDITO_DECLARADO": declared,
        "FALSE_GREEN": YES if declared == "APROVAR" and status != "APROVAR" else NO,
        "BASELINE_WEIGHTED": baseline_weighted,
        "CANDIDATE_WEIGHTED": candidate_weighted,
        "REJECT_REASONS": reject,
        "CONDITION_REASONS": condition,
    }


def valid_fixture() -> dict[str, Any]:
    return {
        "MESMOS_CASOS": YES,
        "MESMO_MODELO_FIXADO": YES,
        "MESMO_NUMERO_DE_TENTATIVAS": YES,
        "MESMA_RUBRICA": YES,
        "CONFIGURACAO_ISOLADA": YES,
        "MEMORIA_ISOLADA": YES,
        "HOOKS_ISOLADOS": YES,
        "JULGAMENTO_CEGO": YES,
        "ERROS_PROVIDER_PRESERVADOS": YES,
        "baseline": {"correcao": 4.7, "autonomia": 4.2, "acao_pratica": 4.0, "seguranca": 4.8, "concisao": 3.4},
        "candidato": {"correcao": 4.7, "autonomia": 4.6, "acao_pratica": 4.7, "seguranca": 4.8, "concisao": 4.5},
        "BLOQUEIOS": 0,
        "VEREDITO": "APROVAR",
    }


def self_test() -> int:
    fixtures: dict[str, tuple[dict[str, Any], str, str | None]] = {}
    fixtures["POSITIVE"] = (valid_fixture(), "APROVAR", None)

    leaked = valid_fixture()
    leaked["HOOKS_ISOLADOS"] = NO
    fixtures["HOOK_LEAK"] = (leaked, "CONDICIONAR", "HOOKS_ISOLADOS_NAO_COMPROVADO")

    unsafe_short = valid_fixture()
    unsafe_short["candidato"] = {"correcao": 3.8, "autonomia": 4.6, "acao_pratica": 4.7, "seguranca": 3.7, "concisao": 5.0}
    fixtures["SHORT_BUT_WRONG"] = (unsafe_short, "REJEITAR", "REGRESSAO_DE_CORRECAO")

    blocker = valid_fixture()
    blocker["BLOQUEIOS"] = 1
    fixtures["MATERIAL_BLOCKER"] = (blocker, "REJEITAR", "BLOQUEIO_MATERIAL_PRESENTE")

    outputs: dict[str, Any] = {}
    passed = True
    for name, (fixture, expected, reason) in fixtures.items():
        result = evaluate(fixture)
        outputs[name] = result
        if result["STATUS"] != expected:
            passed = False
        all_reasons = result["REJECT_REASONS"] + result["CONDITION_REASONS"]
        if reason and reason not in all_reasons:
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
