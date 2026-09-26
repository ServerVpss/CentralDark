"""
valor_gate.py — Avaliador de VALOR REAL de entregas, inspirado no GDPval
(OpenAI, arXiv 2510.04374): julgar o que um agente produz como o mercado
julga — comparação direta contra padrão profissional, não "parece bom".
INSPIRADO no GDPval; não é o benchmark oficial. Zero dependências.
"""
import re

VEREDITOS = ("PROFISSIONAL", "REVISAR", "TEATRAL")


def _palavras(texto):
    return {p for p in re.findall(r"[a-zà-ú0-9]{4,}", (texto or "").lower())}


def avaliar(tarefa: str, entrega: str, evidencias=(), contexto: str = "",
            minimo_palavras: int = 40):
    """Pontua uma entrega em 5 dimensões derivadas do espírito GDPval.
    Retorna dict com pontos por dimensão, total 0-100 e veredito."""
    pontos = {}
    n = len(re.findall(r"\w+", entrega or ""))
    pontos["entregavel_completo"] = 25 if n >= minimo_palavras else round(25 * n / minimo_palavras)
    pontos["ancorado_em_evidencia"] = 25 if evidencias else 0
    if contexto:
        usados = len(_palavras(contexto) & _palavras(entrega))
        pontos["usa_material_de_referencia"] = min(20, 4 * usados)
    else:
        pontos["usa_material_de_referencia"] = 10  # sem referência fornecida
    estrutura = sum([
        bool(re.search(r"(?m)^#+\s", entrega or "")),
        bool(re.search(r"(?m)^[-*]\s", entrega or "")),
        bool(re.search(r"(?m)^\d+[.)]\s", entrega or "")),
    ])
    pontos["formato_profissional"] = min(15, 5 * estrutura + (5 if estrutura else 0))
    pontos["risco_e_limite_declarados"] = 15 if re.search(
        r"(?i)risco|limite|limita|rollback|garantia|n[aã]o cobre", entrega or "") else 0
    total = sum(pontos.values())
    veredito = "PROFISSIONAL" if total >= 75 else ("REVISAR" if total >= 45 else "TEATRAL")
    return {"tarefa": tarefa, "pontos": pontos, "total": total, "veredito": veredito}


def comparar(entrega_a: str, entrega_b: str, tarefa: str = "", **kw):
    """Comparação direta A×B — a métrica primária do GDPval é exatamente
    head-to-head contra o especialista. Aqui: seu agente × outra versão."""
    a = avaliar(tarefa, entrega_a, **kw)
    b = avaliar(tarefa, entrega_b, **kw)
    if a["total"] > b["total"]:
        vencedor = "A"
    elif b["total"] > a["total"]:
        vencedor = "B"
    else:
        vencedor = "EMPATE"
    return {"vencedor": vencedor, "placar": (a["total"], b["total"]), "a": a, "b": b}
