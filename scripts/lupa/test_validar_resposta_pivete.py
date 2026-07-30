#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
from pathlib import Path

SCRIPT = Path(__file__).with_name("validar-resposta-pivete.py")
spec = importlib.util.spec_from_file_location("validar_resposta_pivete", SCRIPT)
mod = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(mod)


def test_aceita_resposta_nao_tecnica_curta():
    ok, motivo = mod.avaliar("Pronto, Pivete. Ficou registrado.")
    assert ok is True
    assert motivo == "NAO_TECNICO_OU_CURTO"


def test_bloqueia_tecnico_sem_os_dois_blocos():
    texto = "A função do workflow foi corrigida no GitHub. " * 10
    ok, motivo = mod.avaliar(texto)
    assert ok is False
    assert motivo == "BLOCO_DIAGNOSTICO_TECNICO_AUSENTE"


def test_bloqueia_sem_papo_reto():
    texto = "## DIAGNÓSTICO TÉCNICO\nA função CLI mudou e o workflow foi testado. " * 5
    ok, motivo = mod.avaliar(texto)
    assert ok is False
    assert motivo == "BLOCO_PAPO_RETO_DO_PIVETE_AUSENTE"


def test_bloqueia_ordem_invertida():
    texto = (
        "## PAPO RETO DO PIVETE\nMelhorou e não perde tempo.\n"
        "## DIAGNÓSTICO TÉCNICO\nA função CLI e o workflow foram corrigidos com teste. " * 4
    )
    ok, motivo = mod.avaliar(texto)
    assert ok is False
    assert motivo == "ORDEM_INVALIDA_PAPO_RETO_VEIO_ANTES_DO_TECNICO"


def test_aceita_ordem_tecnico_depois_pivete():
    texto = (
        "## DIAGNÓSTICO TÉCNICO\n"
        "A função CLI agora exige duas condições; o workflow cobre a regressão.\n"
        "## PAPO RETO DO PIVETE\n"
        "Antes passava pela metade. Agora a porta só abre quando os dois lados estão certos. "
        "Isso reduz retrabalho e não remove a prova técnica."
    )
    ok, motivo = mod.avaliar(texto)
    assert ok is True
    assert motivo == "FORMATO_DUPLO_OK"


if __name__ == "__main__":
    testes = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    falhas = 0
    for teste in testes:
        try:
            teste()
            print("PASS", teste.__name__)
        except Exception as exc:
            falhas += 1
            print("FAIL", teste.__name__, exc)
    print(f"TOTAL={len(testes)} PASS={len(testes)-falhas} FAIL={falhas}")
    raise SystemExit(1 if falhas else 0)
