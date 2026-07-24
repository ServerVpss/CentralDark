"""Nenhum __pycache__ pode existir dentro do pacote baseline N7."""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]


def test_no_pycache_in_baseline():
    offenders = [str(p) for p in ROOT.rglob("__pycache__")]
    assert offenders == [], f"__pycache__ vazado na baseline: {offenders}"
