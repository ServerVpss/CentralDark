"""Testes do deduplicador com agrupamento."""
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from analista.dedup import Dedup


def _ev(key="x", title="t", body="b", janela=300):
    return {"key": key, "title": title, "body": body, "dedup_window_s": janela, "severity": "aviso"}


def test_primeira_ocorrencia_passa():
    d = Dedup()
    assert d.deve_passar(_ev()) is True


def test_repeticoes_dentro_da_janela_sao_absorvidas():
    d = Dedup()
    assert d.deve_passar(_ev()) is True
    for _ in range(5):
        assert d.deve_passar(_ev()) is False


def test_apos_janela_expirar_passa_de_novo():
    d = Dedup()
    assert d.deve_passar(_ev(janela=1)) is True
    time.sleep(1.1)
    assert d.deve_passar(_ev(janela=1)) is True


def test_coletar_resumos_gera_agregado():
    d = Dedup()
    d.deve_passar(_ev(janela=1))
    for _ in range(4):
        d.deve_passar(_ev(janela=1))
    time.sleep(1.1)
    resumos = d.coletar_resumos()
    assert len(resumos) == 1
    assert "× 5" in resumos[0]["title"]
    assert resumos[0]["_agrupado"] is True


def test_resumo_nao_emitido_se_so_uma_ocorrencia():
    d = Dedup()
    d.deve_passar(_ev(janela=1))
    time.sleep(1.1)
    assert d.coletar_resumos() == []
