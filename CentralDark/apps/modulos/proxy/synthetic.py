"""Synthetic Data Forge — gera dataset sintético anônimo dos logs. v1.1 (stats + anti-key expandido)."""
import json, re, time
from pathlib import Path

RE_KEY   = re.compile(r"(sk-[A-Za-z0-9\-_]{10,}|Bearer\s+[A-Za-z0-9\.\-_]{20,}|xoxb-[A-Za-z0-9\-]{20,}|ghp_[A-Za-z0-9]{20,})")
RE_EMAIL = re.compile(r"[\w\.-]+@[\w\.-]+")
RE_CPF   = re.compile(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b")
RE_IP    = re.compile(r"\b(\d{1,3}\.){3}\d{1,3}\b")
RE_JWT   = re.compile(r"eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}")

def anonimizar(txt: str) -> str:
    if not txt: return txt
    txt = RE_JWT.sub("[JWT]", txt)
    txt = RE_KEY.sub("[KEY]", txt)
    txt = RE_EMAIL.sub("[EMAIL]", txt)
    txt = RE_CPF.sub("[CPF]", txt)
    txt = RE_IP.sub("[IP]", txt)
    return txt

def gerar(origem="logs/chamadas.jsonl", destino="data/synthetic/dataset.jsonl") -> dict:
    base = Path(__file__).parent
    orig = base / origem
    dest = base / destino
    dest.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    ignoradas = 0
    if not orig.exists():
        dest.write_text("")
        return {"gerados": 0, "origem_inexistente": True, "destino": str(dest)}
    with orig.open() as fi, dest.open("w") as fo:
        for linha in fi:
            try:
                reg = json.loads(linha)
            except Exception:
                ignoradas += 1
                continue
            reg["prompt"] = anonimizar(reg.get("prompt", ""))
            reg["resposta"] = anonimizar(reg.get("resposta", ""))
            for k in ("ip", "user", "token", "chave"):
                reg.pop(k, None)
            fo.write(json.dumps(reg, ensure_ascii=False) + "\n")
            n += 1
    return {"gerados": n, "ignoradas": ignoradas, "origem_bytes": orig.stat().st_size, "destino": str(dest), "ts": int(time.time())}

if __name__ == "__main__":
    print(gerar())
