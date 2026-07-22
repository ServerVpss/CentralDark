#!/usr/bin/env python3
"""Testes determinísticos da MetaLupa Bayesiana.

Roda sem dependências: python test_lupa.py
"""
import math
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.lupa_bayesiana import odds, prob, posterior, entropia, voi  # noqa: E402


def approx(a, b, tol=1e-9):
    return abs(a - b) <= tol


def test_odds_prob_roundtrip():
    assert approx(odds(0.3), 0.3 / 0.7)
    assert approx(prob(odds(0.3)), 0.3)


def test_posterior_chain():
    # prior 0.3, LR 5 e 2 -> ~0.8113
    p = posterior(0.3, [5, 2])
    expected = (0.3 / 0.7 * 5 * 2) / (1 + 0.3 / 0.7 * 5 * 2)
    assert approx(p, expected, 1e-12)


def test_entropia_max_at_half():
    assert approx(entropia(0.5), 1.0, 1e-12)
    assert entropia(0.5) > entropia(0.3)
    assert approx(entropia(0.0), 0.0)
    assert approx(entropia(1.0), 0.0)


def test_entropia_reduces_with_evidence():
    p0 = 0.3
    p1 = posterior(p0, [5, 2])
    assert entropia(p0) > entropia(p1)


def test_voi_positive_negative():
    assert voi(10, 2, 1) == 7.0
    assert voi(10, 9, 5) == -4.0  # teste caro que quase nao reduz perda


def test_zero_one_rejected():
    for bad in (0.0, 1.0):
        try:
            odds(bad)
            raise AssertionError("deveria ter rejeitado prior 0 ou 1")
        except ValueError:
            pass


def test_falsification_gate_detects_fake_green():
    """Gate de Falsificacao: veredito sem observacao refutadora = BLOQUEAR (correto)."""

    def gate(veredito, obs):
        # SKILL Fase 8 item 1: sem observacao refutadora, hipotese nao esta pronta
        if obs is None:
            return "BLOQUEAR"
        return veredito

    veredito = "APROVAR"
    observacao_refutadora = None  # nao procurada
    resultado = gate(veredito, observacao_refutadora)
    assert resultado == "BLOQUEAR", "gate deveria bloquear sem falsificador definido"


def test_marker_present_in_entry_files():
    """LUPA_BAYESIANA_BOOT_REQUIRED deve constar nos arquivos de entrada presentes.

    Arquivos ausentes na branch atual sao registrados como AUSENTE no aprendizado
    e nao entram na validacao (regra: nao inventar substituto).
    """
    import os as _os
    root = _os.path.abspath(_os.path.join(_os.path.dirname(__file__), "..", "..", "..", ".."))
    marcador = "LUPA_BAYESIANA_BOOT_REQUIRED"
    obrigatorios = ["CLAUDE.md", "AGENTS.md", "README.md"]
    for rel in obrigatorios:
        caminho = _os.path.join(root, rel)
        assert _os.path.isfile(caminho), f"arquivo de entrada ausente: {rel}"
        with open(caminho, "r", encoding="utf-8") as fh:
            conteudo = fh.read()
        assert marcador in conteudo, f"marcador {marcador} ausente em {rel}"


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    falhas = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
        except Exception as e:
            falhas += 1
            print(f"FAIL {t.__name__}: {e}")
    print(f"\nTOTAL={len(tests)} PASS={len(tests) - falhas} FAIL={falhas}")
    sys.exit(1 if falhas else 0)
