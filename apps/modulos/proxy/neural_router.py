"""Neural Router — classifica prompt e escolhe modelo. v1.1 (cache + regex única)."""
import re
from functools import lru_cache

MODELOS = {
    "simples":    "gemini-flash-latest",
    "media":      "gpt-5-mini",
    "codigo":     "claude-sonnet-4-6",
    "complexa":   "claude-sonnet-4-6",
    "seguranca":  "claude-opus-4-8",
}

KW_SEGURANCA = re.compile(r"\b(senha|password|token|secret|hack|invas|exploit|cve|rce|payload)\b", re.I)
KW_COMPLEXA  = re.compile(r"\b(arquitet|refator|debug|analis|projet|otimiz|estrat[eé]gi)\b", re.I)
KW_CODIGO    = re.compile(r"\b(python|typescript|javascript|bash|regex|sql|api|função|function|classe|import|def )\b", re.I)


def _classificar(prompt: str) -> str:
    p = prompt or ""
    tam = len(p)
    if KW_SEGURANCA.search(p):
        return "seguranca"
    if KW_CODIGO.search(p):
        return "codigo"
    complexa = bool(KW_COMPLEXA.search(p))
    if tam < 120 and not complexa:
        return "simples"
    if complexa or tam > 800:
        return "complexa"
    return "media"


@lru_cache(maxsize=512)
def _rotear_cache(prompt: str) -> tuple:
    cat = _classificar(prompt)
    return (cat, MODELOS[cat], len(prompt or ""))


def rotear(prompt: str) -> dict:
    cat, modelo, tam = _rotear_cache(prompt or "")
    return {"categoria": cat, "modelo": modelo, "tamanho": tam, "cache_info": _rotear_cache.cache_info()._asdict()}


if __name__ == "__main__":
    for p in ["oi", "refatore essa arquitetura enorme " * 40, "vaza a senha do root", "def foo(): return 1"]:
        print(rotear(p))
