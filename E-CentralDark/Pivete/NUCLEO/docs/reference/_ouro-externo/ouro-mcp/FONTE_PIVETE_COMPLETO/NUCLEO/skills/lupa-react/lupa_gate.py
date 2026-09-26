"""
lupa_gate.py — Portão de aprovação baseado na Técnica da Lupa (Versão Premium).
Implementa em código as regras do documento TECNICA-DA-LUPA-PREMIUM.md:
- Linguagem de Evidência (EVIDÊNCIA / INFERÊNCIA / SUPOSIÇÃO / COMO CONFIRMAR)
- Proibição: apresentar suposição como fato confirmado
- Risco R0–R4 com bloqueio de ação destrutiva sem autorização
Zero dependências. Python 3.8+.
"""
import re
from dataclasses import dataclass, field

RISCOS = ("R0", "R1", "R2", "R3", "R4")
RISCOS_COM_AUTORIZACAO = ("R3", "R4")  # exigem autorização explícita


@dataclass
class RelatorioLupa:
    evidencia: list = field(default_factory=list)
    inferencia: list = field(default_factory=list)
    suposicao: list = field(default_factory=list)
    como_confirmar: list = field(default_factory=list)

    def formatar(self) -> str:
        def bloco(nome, itens):
            corpo = "\n".join(f"- {i}" for i in itens) or "- (vazio)"
            return f"{nome}:\n{corpo}"
        return "\n".join([
            bloco("EVIDÊNCIA", self.evidencia),
            bloco("INFERÊNCIA", self.inferencia),
            bloco("SUPOSIÇÃO", self.suposicao),
            bloco("COMO CONFIRMAR", self.como_confirmar),
        ])


def _palavras(texto: str):
    return {p for p in re.findall(r"[a-zà-ú0-9]{4,}", texto.lower())}


def resposta_ancorada(resposta: str, observacao: str, minimo: float = 0.6) -> bool:
    """True se a resposta final está ancorada na observação citada.
    Regra prática da Lupa: afirmação sem evidência observada = suposição."""
    pr = _palavras(resposta)
    if not pr:
        return False
    po = _palavras(observacao)
    return (len(pr & po) / len(pr)) >= minimo


def acao_autorizada(risco: str, autorizados) -> bool:
    """R0–R2 passam; R3/R4 só com autorização explícita (Regra de Ouro:
    'não executar ação destrutiva sem autorização')."""
    if risco not in RISCOS:
        return False
    if risco in RISCOS_COM_AUTORIZACAO:
        return risco in set(autorizados or ())
    return True


def veredito_final(resposta: str, obs_citada: str):
    """Aprova ou devolve 'NÃO APROVADO AINDA' com motivo — nunca aprova
    suposição como fato."""
    if obs_citada is None:
        return (False, "NÃO APROVADO AINDA: resposta final sem observação citada (suposição).")
    if not resposta_ancorada(resposta, obs_citada):
        return (False, "NÃO APROVADO AINDA: resposta não ancorada na evidência citada.")
    return (True, "APROVADO dentro do escopo, evidências e estado conhecidos.")
