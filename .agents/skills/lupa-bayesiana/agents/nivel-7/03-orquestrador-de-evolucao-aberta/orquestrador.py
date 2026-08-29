"""Implementação mínima do Orquestrador."""

def ponto_fixo(rodadas: list[str], delta_material: bool) -> bool:
    if delta_material:
        return False
    if len(rodadas) < 2:
        return False
    return rodadas[-1] == rodadas[-2]

def formatar_metrica(numerador: int, denominador: int, janela: str) -> str:
    if denominador <= 0:
        raise ValueError("denominador precisa ser > 0")
    return f"{numerador}/{denominador} · janela={janela}"
