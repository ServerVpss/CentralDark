"""Testes do motor de janela deslizante."""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from detectores.anomaly_engine import JanelaDeslizante


def test_contagem_dentro_janela():
    j = JanelaDeslizante(janela_s=10)
    for _ in range(3):
        j.registrar("a")
    assert j.contar("a") == 3


def test_eventos_velhos_descartados():
    j = JanelaDeslizante(janela_s=1)
    j.registrar("a")
    j.registrar("a")
    time.sleep(1.1)
    assert j.contar("a") == 0


def test_chaves_independentes():
    j = JanelaDeslizante(janela_s=10)
    j.registrar("a")
    j.registrar("b")
    j.registrar("b")
    assert j.contar("a") == 1
    assert j.contar("b") == 2
