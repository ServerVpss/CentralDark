"""Testes do Conversor — erro vira teste; não edita testes existentes."""
import pathlib
PKG = pathlib.Path(__file__).resolve().parents[2]

def test_conversor_cria_teste_novo_nao_edita_baseline():
    from conversor import converter_erro
    r = converter_erro(raw_error="AssertionError X", baseline_files=[str(PKG/"contracts/common-contract.json")])
    assert r["test_created"] is True
    assert r["teste_path"].endswith("_permanente.py")
    assert r["baseline_intact"] is True

def test_declaracao_sem_rastro_falha():
    from conversor import validar_declaracao
    d = {"executado": True}  # sem tool-id, sem SHA, sem path+hash
    assert validar_declaracao(d) == "REJEITADO: sem rastro"

def test_status_verde_sem_check_obrigatorio_falha():
    from conversor import validar_status_verde
    assert validar_status_verde(verde=True, checks_obrigatorios_passaram=False) == "FALSO_VERDE"
