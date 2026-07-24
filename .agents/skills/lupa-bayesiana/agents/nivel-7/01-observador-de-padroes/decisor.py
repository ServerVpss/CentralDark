"""Implementação mínima do Observador — regras puras para os testes."""

def decidir_precedencia(fato, hipotese):
    if fato.get("kind") == "fato" and fato.get("source") == "pivete" \
       and hipotese.get("kind") in ("inferencia", "hipotese"):
        return "DROP_HYPOTHESIS"
    return "KEEP_BOTH"

def contar_evidencias(evs):
    """Correlacionadas contam uma vez. União-find simples."""
    parent = {e["id"]: e["id"] for e in evs}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a, b):
        parent[find(a)] = find(b)
    for e in evs:
        for c in e.get("correlates_with", []):
            if c in parent:
                union(e["id"], c)
    return len({find(e["id"]) for e in evs})

def narrativa_violou(janela, retracoes):
    if len(janela) < 2: return False
    if janela[0] == janela[1]: return False
    return len(retracoes) == 0
