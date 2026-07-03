"""Chain Reaction — 4 IAs em sequência. v1.1 (circuit breaker + métricas)."""
import httpx, time, json
from pathlib import Path

CADEIA = ["gemini-flash-latest", "gpt-5-mini", "claude-sonnet-4-6", "gemini-2.5-pro"]
METRICAS = Path(__file__).parent / "logs/metricas.jsonl"
METRICAS.parent.mkdir(parents=True, exist_ok=True)

def _log(reg: dict) -> None:
    try:
        with METRICAS.open("a") as f:
            f.write(json.dumps(reg, ensure_ascii=False) + "\n")
    except Exception:
        pass

async def rodar(url, headers, prompt: str, cadeia=None):
    cadeia = cadeia or CADEIA
    atual = prompt or ""
    passos = []
    falhas_seguidas = 0
    async with httpx.AsyncClient(timeout=60) as client:
        for i, modelo in enumerate(cadeia):
            if falhas_seguidas >= 2:
                passos.append({"modelo": modelo, "ok": False, "skip": "circuit_open"})
                continue
            instrucao = prompt if i == 0 else f"Melhore a resposta abaixo (mais precisa, clara e completa):\n\n{atual}"
            body = {"model": modelo, "max_tokens": 1024, "messages": [{"role": "user", "content": instrucao}]}
            t0 = time.time()
            try:
                r = await client.post(url, headers=headers, json=body)
                ms = int((time.time() - t0) * 1000)
                if r.status_code == 200:
                    d = r.json()
                    txt = "".join(b.get("text", "") for b in d.get("content", [])) \
                        or d.get("choices", [{}])[0].get("message", {}).get("content", "")
                    atual = txt or atual
                    passos.append({"modelo": modelo, "ok": True, "chars": len(txt), "ms": ms})
                    _log({"modelo": modelo, "ok": True, "ms": ms, "modo": "chain"})
                    falhas_seguidas = 0
                else:
                    passos.append({"modelo": modelo, "ok": False, "http": r.status_code, "ms": ms})
                    _log({"modelo": modelo, "ok": False, "ms": ms, "http": r.status_code, "modo": "chain"})
                    falhas_seguidas += 1
            except Exception as e:
                ms = int((time.time() - t0) * 1000)
                passos.append({"modelo": modelo, "ok": False, "erro": str(e)[:120], "ms": ms})
                _log({"modelo": modelo, "ok": False, "ms": ms, "erro": str(e)[:120], "modo": "chain"})
                falhas_seguidas += 1
    return {"resultado": atual, "passos": passos, "ok": any(p.get("ok") for p in passos)}
