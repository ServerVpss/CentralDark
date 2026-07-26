"""Contratos e testes sao imutaveis apos baseline: hashes SHA-256 devem
bater com LOCK.json. Qualquer alteracao no Turno B (solucao verde) que
toque contratos ou testes derruba este teste.
"""
import hashlib, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOCK = ROOT / "LOCK.json"


def _sha(p: pathlib.Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def test_hashes_congelados():
    assert LOCK.exists(), "LOCK.json ausente na baseline"
    lock = json.loads(LOCK.read_text(encoding="utf-8"))
    for rel, sha in lock["files"].items():
        p = ROOT / rel
        assert p.exists(), f"arquivo travado sumiu: {rel}"
        actual = _sha(p)
        assert actual == sha, f"hash divergente em {rel}: {actual} != {sha}"
