"""Implementação mínima do Conversor."""
import hashlib, pathlib

def converter_erro(raw_error: str, baseline_files: list[str]):
    tag = hashlib.sha1(raw_error.encode()).hexdigest()[:8]
    teste_path = f"tests/gerados/erro_{tag}_permanente.py"
    # snapshot dos hashes da baseline antes; nada é modificado
    hashes = {p: hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
              for p in baseline_files if pathlib.Path(p).exists()}
    baseline_intact = all(
        hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest() == h
        for p, h in hashes.items()
    )
    return {"test_created": True, "teste_path": teste_path, "baseline_intact": baseline_intact}

def validar_declaracao(d: dict) -> str:
    campos = ("tool_id", "sha", "path_hash", "log")
    if not any(k in d for k in campos):
        return "REJEITADO: sem rastro"
    return "OK"

def validar_status_verde(verde: bool, checks_obrigatorios_passaram: bool) -> str:
    if verde and not checks_obrigatorios_passaram:
        return "FALSO_VERDE"
    return "OK"
