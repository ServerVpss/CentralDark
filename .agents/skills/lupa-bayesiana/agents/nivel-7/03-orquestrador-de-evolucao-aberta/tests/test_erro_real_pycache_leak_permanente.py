"""Novo teste permanente gerado pelo Conversor durante a missão.
ERRO CAPTURADO: walker de baseline incluía __pycache__ e produzia falso vermelho.
CORREÇÃO: iterar somente sobre entradas do manifest.
PROMOÇÃO: este teste falha se o walker voltar a listar artefatos de runtime.
"""
import pathlib, json
PKG = pathlib.Path(__file__).resolve().parents[2]

def test_baseline_manifest_nao_lista_pycache():
    manifest = PKG / "evidence" / "reports" / "baseline_hashes.json"
    if not manifest.exists(): return
    data = json.loads(manifest.read_text())
    for k in data:
        assert "__pycache__" not in k, f"artefato de runtime no manifest: {k}"
        assert not k.endswith(".pyc"), f".pyc no manifest: {k}"

def test_manifest_referencia_apenas_arquivos_existentes():
    manifest = PKG / "evidence" / "reports" / "baseline_hashes.json"
    if not manifest.exists(): return
    for k in json.loads(manifest.read_text()):
        assert (PKG / k).exists(), f"faltante: {k}"
