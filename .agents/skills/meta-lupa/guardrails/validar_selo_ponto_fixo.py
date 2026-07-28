#!/usr/bin/env python3
"""Guardrail deterministico: selo de ponto fixo exige AutoLupa executada.

Contexto (SKILL.md, XP-4): "A AutoLupa (Fase 9) deve produzir um bloco curto
no fim do relatorio: PONTO_FIXO_ATINGIDO: sim|nao (...) Sem o bloco, veredito
nao sela."

Ponto fixo e o RESULTADO da AutoLupa. Um FINAL que grava
point_fixed_evidential=True -- ou reivindica o achievement ponto_fixo_atingido,
que vale 25 XP -- com autolupa_executed=False esta declarando o resultado de um
instrumento que nunca rodou. Isso e auto-atestacao: a forma de falso verde que
a Invariante de Falsificacao proibe ("alegacao de sucesso apoiada apenas por
ausencia de erro e evidencia insuficiente").

O motor (scripts/meta_lupa.py::_validate_achievements) hoje exige apenas
`--point-fixed sim`, que e a propria declaracao do executor. A pre-condicao
`--autolupa sim` nao e checada. Este guardrail fecha o buraco por fora, de
forma executavel e auditavel no CI, sem reescrever o motor canonico.

Uso:
    python guardrails/validar_selo_ponto_fixo.py
    python guardrails/validar_selo_ponto_fixo.py --ledger caminho.jsonl
    python guardrails/validar_selo_ponto_fixo.py --json

Saidas:
    SELO_OK=1 NOVAS=0 LEGADO=n   -> exit 0
    SELO_OK=0 NOVAS=k ...        -> exit 1

Divida declarada: LEGADO_CONHECIDO lista os record_hash ja gravados no ledger
canonico antes deste guardrail existir. O ledger e append-only; nao e
reescrito para esconder historia. Os registros ficam expostos como aviso, com
o XP indevido contabilizado. Corrigir o XP exige append autorizado pelo
Pivete (--penalty), nunca edicao manual.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]
ENGINE = SKILL / "scripts" / "meta_lupa.py"
LEDGER_PADRAO = SKILL / "references" / "uso-ledger.jsonl"

ACHIEVEMENT = "ponto_fixo_atingido"


class LedgerInputError(ValueError):
    """Falha de entrada que deve bloquear o guardrail, nunca virar verde."""

# record_hash de FINAIS que ja estavam no ledger canonico quando este
# guardrail nasceu. Divida conhecida, nao apagada.
LEGADO_CONHECIDO = {
    "6c0eb4a383c69221e5027e2bab20557cfd37b199516c7b198bab5bf0c7d5c1bb":
        "EVOL-METALUPA-FALSO-VERDE-20260727",
    "971f1efea856f84ef9056eb1725c869abcd1e61e331f0f64abcb8443e59c18d8":
        "FIX-METALUPA-RECIBO-XP-20260727 (PR #410)",
}


def _xp_do_ponto_fixo() -> int:
    """Le o valor do achievement do proprio motor, para nao duplicar constante."""
    try:
        spec = importlib.util.spec_from_file_location("meta_lupa_engine", ENGINE)
        module = importlib.util.module_from_spec(spec)
        assert spec and spec.loader
        spec.loader.exec_module(module)
        return int(module.XP_AWARDS[ACHIEVEMENT])
    except Exception as exc:
        raise LedgerInputError("nao foi possivel carregar o motor META LUPA") from exc


def ler_ledger(caminho: Path) -> list[dict]:
    if not caminho.exists():
        raise LedgerInputError("ledger ausente: %s" % caminho)
    registros = []
    for numero, linha in enumerate(caminho.read_text(encoding="utf-8").splitlines(), 1):
        linha = linha.strip()
        if not linha:
            continue
        try:
            registros.append(json.loads(linha))
        except json.JSONDecodeError as exc:
            raise LedgerInputError(
                "ledger invalido na linha %d: %s" % (numero, caminho)
            ) from exc
    return registros


def viola(rec: dict) -> bool:
    """FINAL que sela ponto fixo sem AutoLupa executada."""
    if rec.get("event") != "FINAL":
        return False
    autolupa = bool(rec.get("autolupa_executed"))
    if autolupa:
        return False
    selou = bool(rec.get("point_fixed_evidential"))
    reivindicou = ACHIEVEMENT in (rec.get("achievements") or [])
    return selou or reivindicou


def auditar(registros: list[dict]) -> dict:
    novas, legado = [], []
    for rec in registros:
        if not viola(rec):
            continue
        item = {
            "mission_id": rec.get("mission_id"),
            "usage_id": rec.get("usage_id"),
            "record_hash": rec.get("record_hash"),
            "point_fixed_evidential": bool(rec.get("point_fixed_evidential")),
            "autolupa_executed": bool(rec.get("autolupa_executed")),
            "achievement_reivindicado": ACHIEVEMENT in (rec.get("achievements") or []),
            "xp_gained": rec.get("xp_gained"),
        }
        (legado if rec.get("record_hash") in LEGADO_CONHECIDO else novas).append(item)
    xp = _xp_do_ponto_fixo()
    return {
        "guardrail": "validar_selo_ponto_fixo",
        "regra": "point_fixed_evidential ou achievement %s exige autolupa_executed=True" % ACHIEVEMENT,
        "finais_auditados": sum(1 for r in registros if r.get("event") == "FINAL"),
        "novas": novas,
        "legado": legado,
        "xp_indevido_legado": xp * len(legado),
        "selo_ok": not novas,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--ledger", default=str(LEDGER_PADRAO))
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    try:
        rel = auditar(ler_ledger(Path(args.ledger)))
    except LedgerInputError as exc:
        rel = {
            "guardrail": "validar_selo_ponto_fixo",
            "erro_entrada": str(exc),
            "selo_ok": False,
        }
        if args.json:
            print(json.dumps(rel, indent=2, ensure_ascii=False))
        else:
            print("SELO_OK=0 ERRO_ENTRADA=%s" % exc)
        return 2

    if args.json:
        print(json.dumps(rel, indent=2, ensure_ascii=False))
    else:
        for item in rel["legado"]:
            print("AVISO_SELO_LEGADO mission=%s hash=%s autolupa=False point_fixed=%s"
                  % (item["mission_id"], str(item["record_hash"])[:16], item["point_fixed_evidential"]))
        for item in rel["novas"]:
            print("SELO_SEM_AUTOLUPA mission=%s hash=%s xp_gained=%s"
                  % (item["mission_id"], str(item["record_hash"])[:16], item["xp_gained"]))
        print("SELO_OK=%d FINAIS=%d NOVAS=%d LEGADO=%d XP_INDEVIDO_LEGADO=%d" % (
            1 if rel["selo_ok"] else 0,
            rel["finais_auditados"],
            len(rel["novas"]),
            len(rel["legado"]),
            rel["xp_indevido_legado"],
        ))
    return 0 if rel["selo_ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
