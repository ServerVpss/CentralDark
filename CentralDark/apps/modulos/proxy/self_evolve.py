"""Self-Evolution Engine — ranking baseado em medição reproduzível, não em volume de XP.

Mantém /arsenal/evolve e /arsenal/stats e o owner de aprendizados já existente.
O XP oficial pertence ao ledger append-only da MetaLupa: ranking não concede XP.
"""
import json
import math
import os
import re
import tempfile
import time
from collections import defaultdict, deque
from pathlib import Path

BASE = Path(__file__).parent
METRICAS = BASE / "logs/metricas.jsonl"
APRENDIZADOS = BASE.parent.parent.parent / "docs/CONSCIENCIA/APRENDIZADOS.md"
SNAPSHOT = BASE / "data/ranking.json"
MAX_LINHAS = 10000
MIN_AMOSTRAS = 10
COBERTURA_LATENCIA_MINIMA = 0.8
MAX_LATENCIA_MS = 300000
MODELO_VALIDO = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:/+-]{0,127}$")


def _snapshot_anterior() -> dict:
    """Conserva somente o último registro do mesmo owner; não carrega JSON gigante."""
    try:
        if not SNAPSHOT.is_file() or SNAPSHOT.stat().st_size > 128_000:
            return {}
        data = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError, TypeError):
        return {}


def _escrever_snapshot(resultado: dict) -> None:
    """Troca atômica: leitura concorrente nunca vê JSON parcial."""
    SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
    destino = None
    try:
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=SNAPSHOT.parent, prefix=".ranking-",
            suffix=".tmp", delete=False,
        ) as arq:
            destino = Path(arq.name)
            json.dump(resultado, arq, ensure_ascii=False, indent=2, allow_nan=False)
            arq.write("\n")
            arq.flush()
            os.fsync(arq.fileno())
        os.replace(destino, SNAPSHOT)
    finally:
        if destino and destino.exists():
            destino.unlink()


def _wilson_inferior(acertos: int, total: int) -> float:
    """Limite inferior conservador da taxa de acerto (z=1,96); não é XP."""
    if total <= 0:
        return 0.0
    p = acertos / total
    z = 1.96
    z2 = z * z
    return max(0.0, (
        p + z2 / (2 * total) -
        z * math.sqrt((p * (1 - p) + z2 / (4 * total)) / total)
    ) / (1 + z2 / total))


def avaliar() -> dict:
    stats = defaultdict(lambda: {"ok": 0, "erro": 0, "ms": []})
    lidas = 0
    invalidas = 0
    if METRICAS.is_file():
        # deque limita RAM mesmo se o log tiver milhões de linhas.
        with METRICAS.open("r", encoding="utf-8", errors="replace") as arq:
            linhas = deque(arq, maxlen=MAX_LINHAS)
        for linha in linhas:
            try:
                evento = json.loads(linha)
            except (ValueError, TypeError):
                invalidas += 1
                continue
            if not isinstance(evento, dict):
                invalidas += 1
                continue
            modelo = evento.get("modelo")
            sucesso = evento.get("ok")
            if (not isinstance(modelo, str) or not MODELO_VALIDO.fullmatch(modelo)
                    or type(sucesso) is not bool):
                invalidas += 1
                continue
            lidas += 1
            stats[modelo]["ok" if sucesso else "erro"] += 1
            latencia = evento.get("ms")
            if (type(latencia) in (float, int) and math.isfinite(latencia)
                    and 0 < latencia <= MAX_LATENCIA_MS):
                stats[modelo]["ms"].append(float(latencia))

    ranking = []
    for modelo, valores in stats.items():
        total = valores["ok"] + valores["erro"]
        latencias = sorted(valores["ms"])
        cobertura = len(latencias) / total
        media_ms = round(sum(latencias) / len(latencias)) if latencias else 0
        p90_ms = latencias[min(len(latencias) - 1, math.ceil(0.9 * len(latencias)) - 1)] if latencias else 0
        taxa_ok = valores["ok"] / total
        inferior = _wilson_inferior(valores["ok"], total)
        apto = total >= MIN_AMOSTRAS and cobertura >= COBERTURA_LATENCIA_MINIMA
        motivo = ("TRANSPORTE_AMOSTRADO" if apto else
                  "AMOSTRA_INSUFICIENTE" if total < MIN_AMOSTRAS else
                  "LATENCIA_SEM_PROVA")
        # Taxa HTTP + latência não atestam qualidade, intenção ou skill do modelo.
        # Não recompensar 1 chamada isolada, latência ausente nem sucesso declarado sem contraprova.
        score = inferior * (1000 / max(p90_ms, 100)) if apto else 0.0
        ranking.append({
            "modelo": modelo,
            "score": round(score, 3),
            "taxa_ok": round(taxa_ok, 3),
            "media_ms": media_ms,
            "total": total,
            "p90_ms": round(p90_ms),
            "limite_inferior_ok": round(inferior, 3),
            "cobertura_latencia": round(cobertura, 3),
            "apto": apto,
            "motivo": motivo,
        })
    ranking.sort(key=lambda item: (not item["apto"], -item["score"], -item["total"], item["modelo"]))
    anterior = _snapshot_anterior()
    resultado = {
        "ranking": ranking,
        "amostras": lidas,
        "linhas_invalidas": invalidas,
        "ts": int(time.time()),
        "ultimo_lider_registrado": anterior.get("ultimo_lider_registrado", ""),
        "xp_status": "META_LUPA_LEDGER_EXCLUSIVO",
    }
    _escrever_snapshot(resultado)
    return resultado


def salvar_aprendizado(res: dict) -> None:
    """Acrescenta aprendizado só quando a liderança comprovada realmente mudou."""
    lider = next((item for item in res.get("ranking", []) if item.get("apto")), None)
    if not lider or lider["modelo"] == res.get("ultimo_lider_registrado"):
        return
    APRENDIZADOS.parent.mkdir(parents=True, exist_ok=True)
    linha = (
        f"\n## {time.strftime('%Y-%m-%d %H:%M')} — self-evolution: troca de liderança comprovada\n"
        f"- **{lider['modelo']}**: score conservador={lider['score']} · "
        f"acerto={lider['taxa_ok']*100:.1f}% · p90={lider['p90_ms']}ms · "
        f"amostras={lider['total']} · cobertura={lider['cobertura_latencia']*100:.1f}%\n"
        "- XP: nenhuma concessão automática; ganhos somente no ledger canônico MetaLupa "
        "após testes, contraprova e receipt.\n"
    )
    # O nome do modelo passou pela allowlist; nenhum texto cru de log é levado ao Docs.
    with APRENDIZADOS.open("a", encoding="utf-8") as arq:
        arq.write(linha)
    res["ultimo_lider_registrado"] = lider["modelo"]
    _escrever_snapshot(res)


if __name__ == "__main__":
    atual = avaliar()
    salvar_aprendizado(atual)
    print(json.dumps(atual, indent=2, ensure_ascii=False))
