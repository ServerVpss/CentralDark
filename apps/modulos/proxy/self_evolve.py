"""Self-Evolution Engine — ajusta prioridade dos modelos com base em métricas. v1.1 (streaming + tail)."""
import json, time
from pathlib import Path
from collections import defaultdict

BASE = Path(__file__).parent
METRICAS = BASE / "logs/metricas.jsonl"
APRENDIZADOS = BASE.parent.parent.parent / "docs/CONSCIENCIA/APRENDIZADOS.md"
SNAPSHOT = BASE / "data/ranking.json"
MAX_LINHAS = 10000

def avaliar() -> dict:
    stats = defaultdict(lambda: {"ok": 0, "erro": 0, "ms": []})
    lidas = 0
    if METRICAS.exists():
        # tail: pega só as últimas MAX_LINHAS pra não explodir memória
        linhas = METRICAS.read_text(errors="ignore").splitlines()[-MAX_LINHAS:]
        for linha in linhas:
            try:
                r = json.loads(linha)
            except Exception:
                continue
            lidas += 1
            k = r.get("modelo", "?")
            if r.get("ok"):
                stats[k]["ok"] += 1
            else:
                stats[k]["erro"] += 1
            if r.get("ms"):
                stats[k]["ms"].append(r["ms"])
    ranking = []
    for m, s in stats.items():
        total = s["ok"] + s["erro"]
        if total == 0:
            continue
        media_ms = sum(s["ms"]) / len(s["ms"]) if s["ms"] else 0
        taxa_ok = s["ok"] / total
        score = taxa_ok * (1000 / max(media_ms, 100))
        ranking.append({
            "modelo": m, "score": round(score, 3),
            "taxa_ok": round(taxa_ok, 3),
            "media_ms": int(media_ms), "total": total,
        })
    ranking.sort(key=lambda x: -x["score"])
    resultado = {"ranking": ranking, "amostras": lidas, "ts": int(time.time())}
    try:
        SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
        SNAPSHOT.write_text(json.dumps(resultado, indent=2, ensure_ascii=False))
    except Exception:
        pass
    return resultado

def salvar_aprendizado(res: dict):
    if not res.get("ranking"):
        return
    try:
        APRENDIZADOS.parent.mkdir(parents=True, exist_ok=True)
        linha = f"\n## {time.strftime('%Y-%m-%d %H:%M')} — ranking automático (amostras={res.get('amostras',0)})\n"
        for r in res["ranking"]:
            linha += f"- **{r['modelo']}**: score={r['score']} · ok={r['taxa_ok']*100:.1f}% · {r['media_ms']}ms · {r['total']} chamadas\n"
        with APRENDIZADOS.open("a") as f:
            f.write(linha)
    except Exception as e:
        print(f"[self_evolve] erro salvando aprendizado: {e}")

if __name__ == "__main__":
    r = avaliar()
    salvar_aprendizado(r)
    print(json.dumps(r, indent=2))
