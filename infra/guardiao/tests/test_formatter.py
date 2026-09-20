"""Testes do formatador de mensagens."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from analista.formatter import formatar


def test_formato_critico_mapeia_para_erro():
    tipo, msg = formatar({
        "severity": "critico", "source": "pm2",
        "title": "PM2 errored: x", "body": "foo",
    })
    assert tipo == "erro"
    assert "🚨" in msg
    assert "PM2 errored: x" in msg
    assert "⚙️ pm2" in msg


def test_formato_aviso_docker():
    tipo, msg = formatar({
        "severity": "aviso", "source": "docker",
        "title": "CPU alto", "body": "95%",
    })
    assert tipo == "aviso"
    assert "⚠️" in msg
    assert "🐳" in msg


def test_marca_agrupado():
    _, msg = formatar({
        "severity": "info", "source": "consciencia",
        "title": "x × 5", "body": "b", "_agrupado": True,
    })
    assert "agrupado" in msg
