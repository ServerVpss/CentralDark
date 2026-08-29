"""Testes do Orquestrador — AutoLupa, ponto fixo, imutabilidade da baseline, ZIP reprodutível, métricas com denominador, ponto-fixo não forjado."""
import hashlib, io, os, pathlib, zipfile, json

PKG  = pathlib.Path(__file__).resolve().parents[2]
ROOT = pathlib.Path(__file__).resolve().parents[5]  # repo root

# ----- Imutabilidade byte-a-byte (baseline vs solução conceitual) -----
BASELINE_GLOBS = ["contracts", "01-observador-de-padroes/tests",
                  "02-conversor-de-erro-em-teste/tests",
                  "03-orquestrador-de-evolucao-aberta/tests",
                  "evidence/ledger.jsonl"]

def test_baseline_files_have_stable_hashes_recorded():
    """Verifica somente entradas do manifest (anti-drift por artefatos de runtime)."""
    manifest = PKG / "evidence" / "reports" / "baseline_hashes.json"
    if not manifest.exists():
        return
    esperado = json.loads(manifest.read_text())
    for rel, sha in esperado.items():
        f = PKG / rel
        assert f.exists(), f"arquivo da baseline sumiu: {rel}"
        h = hashlib.sha256(f.read_bytes()).hexdigest()
        assert h == sha, f"baseline alterada: {rel}"

# ----- Ponto fixo não pode ser forjado só por número de rodadas -----
def test_ponto_fixo_exige_delta_zero_material():
    from orquestrador import ponto_fixo
    # 3 rodadas iguais, mas com nova evidência material → NÃO é ponto fixo
    assert ponto_fixo(rodadas=["v","v","v"], delta_material=True) is False
    # 2 rodadas iguais sem delta → é ponto fixo
    assert ponto_fixo(rodadas=["v","v"], delta_material=False) is True

# ----- Métricas com numerador/denominador/janela -----
def test_metricas_exigem_denominador():
    from orquestrador import formatar_metrica
    out = formatar_metrica(numerador=1, denominador=10, janela="24h")
    assert "1/10" in out and "24h" in out
    try:
        formatar_metrica(numerador=1, denominador=0, janela="24h")
        assert False, "denominador 0 deveria falhar"
    except ValueError:
        pass

# ----- ZIP reprodutível: mesmo SHA em duas construções -----
def _build_zip(dst):
    files = sorted(
        [f for f in PKG.rglob("*") if f.is_file() and "__pycache__" not in f.parts],
        key=lambda p: str(p.relative_to(PKG))
    )
    with zipfile.ZipFile(dst, "w", compression=zipfile.ZIP_DEFLATED) as z:
        for f in files:
            zi = zipfile.ZipInfo(str(f.relative_to(PKG)))
            zi.date_time = (2026, 1, 1, 0, 0, 0)
            zi.external_attr = 0o644 << 16
            z.writestr(zi, f.read_bytes())
    return hashlib.sha256(dst.read_bytes()).hexdigest()

def test_zip_reprodutivel_duas_builds():
    import tempfile
    with tempfile.TemporaryDirectory() as td:
        a = pathlib.Path(td)/"a.zip"; b = pathlib.Path(td)/"b.zip"
        ha = _build_zip(a); hb = _build_zip(b)
        assert ha == hb, f"ZIP não reprodutível: {ha} != {hb}"
