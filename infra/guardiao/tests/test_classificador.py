"""Testes unitários do classificador do Guardião da Consciência."""
import pytest

from classificador import classificar

REGRAS = {
    "pastas": {
        "docs/CONSCIENCIA/04-INFRA-VPS": {
            "nome_regex": ["vps", "ssh", "pm2"],
            "palavras_chave": ["vps", "ssh"],
        },
        "docs/CONSCIENCIA/06-MCP": {
            "nome_regex": ["mcp", "conector"],
            "palavras_chave": ["mcp"],
        },
        "docs/CONSCIENCIA/05-APRENDIZADOS": {
            "nome_regex": ["aprendizado", "metodo"],
            "palavras_chave": ["aprendi"],
        },
    }
}


def test_arquivo_ssh_classifica_em_infra_vps():
    """Caso clássico: 05-SSH-VPS.md está na raiz e deveria ir para 04-INFRA-VPS."""
    r = classificar("docs/CONSCIENCIA/05-SSH-VPS.md", REGRAS)
    assert r is not None
    assert r["pasta_correta"] == "docs/CONSCIENCIA/04-INFRA-VPS"
    assert r["confianca"] >= 0.4
    assert "ssh" in r["motivo"].lower() or "vps" in r["motivo"].lower()


def test_arquivo_ja_na_pasta_correta_retorna_none():
    """Não deve propor mover arquivo que já está no lugar certo."""
    r = classificar("docs/CONSCIENCIA/04-INFRA-VPS/05-SSH-VPS.md", REGRAS)
    assert r is None


def test_arquivo_mcp_vai_para_pasta_mcp():
    r = classificar("docs/CONSCIENCIA/06-MCP-CENTRALDARK.md", REGRAS)
    assert r is not None
    assert r["pasta_correta"] == "docs/CONSCIENCIA/06-MCP"


def test_arquivo_sem_match_retorna_none():
    """Nome que não bate com nenhuma regra deve ser ignorado."""
    r = classificar("docs/CONSCIENCIA/xyz-aleatorio-zzz.md", REGRAS)
    assert r is None


def test_confianca_baixa_retorna_none():
    """Match fraco (apenas 1 palavra-chave) fica abaixo do threshold 0.4."""
    regras_fracas = {
        "pastas": {
            "docs/foo": {"palavras_chave": ["x"]},
        }
    }
    r = classificar("docs/CONSCIENCIA/arquivo-x-aqui.md", regras_fracas)
    # 1 ponto / 5 = 0.2 < 0.4 → None
    assert r is None


def test_motivo_é_explicado_no_retorno():
    """Toda proposta deve trazer um motivo legível."""
    r = classificar("docs/CONSCIENCIA/aprendizado-novo.md", REGRAS)
    assert r is not None
    assert isinstance(r["motivo"], str)
    assert len(r["motivo"]) > 0
    assert "aprendizado" in r["motivo"].lower()


def test_caso_ambiguo_escolhe_pasta_com_maior_pontuacao():
    """Se duas pastas batem, vence a de maior pontuação."""
    regras = {
        "pastas": {
            "docs/A": {"palavras_chave": ["vps"]},  # 1 ponto
            "docs/B": {"nome_regex": ["vps"], "palavras_chave": ["vps"]},  # 3 pontos
        }
    }
    r = classificar("docs/CONSCIENCIA/algo-vps.md", regras)
    assert r is not None
    assert r["pasta_correta"] == "docs/B"


def test_regras_vazias_retorna_none():
    """Edge case: dicionário de regras sem pastas."""
    r = classificar("docs/CONSCIENCIA/qualquer.md", {"pastas": {}})
    assert r is None
