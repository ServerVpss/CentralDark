"""Auto-Healing Swarm — dispara N alternativas em paralelo. v1.1 (métricas + limits)."""
import asyncio, httpx, time, json
from pathlib import Path

METRICAS = Path(__file__).parent / "logs/metricas.jsonl"
METRICAS.parent.mkdir(parents=True, exist_ok=True)
LIMITS = httpx.Limits(max_connections=50, max_keepalive_connections=20)

def _log(reg: dict) -> None:
    try:
        with METRICAS.open("a") as f:
            f.write(json.dumps(reg, ensure_ascii=False) + "\n")
    except Exception:
        pass

async def _chamar(client, url, headers, payload, modelo):
    body = dict(payload); body["model"] = modelo
    t0 = time.time()
    try:
        r = await client.post(url, headers=headers, json=body, timeout=30)
        ms = int((time.time() - t0) * 1000)
        if r.status_code == 200:
            _log({"modelo": modelo, "ok": True, "ms": ms, "modo": "swarm"})
            return {"modelo": modelo, "ms": ms, "resp": r.json()}
        _log({"modelo": modelo, "ok": False, "ms": ms, "http": r.status_code, "modo": "swarm"})
        return {"modelo": modelo, "erro": f"http_{r.status_code}", "ms": ms}
    except asyncio.CancelledError:
        raise
    except Exception as e:
        ms = int((time.time() - t0) * 1000)
        _log({"modelo": modelo, "ok": False, "ms": ms, "erro": str(e)[:120], "modo": "swarm"})
        return {"modelo": modelo, "erro": str(e)[:120], "ms": ms}

async def swarm(url, headers, payload, principal, fallbacks):
    modelos = [principal] + [m for m in fallbacks if m != principal]
    async with httpx.AsyncClient(limits=LIMITS) as client:
        tasks = [asyncio.create_task(_chamar(client, url, headers, payload, m)) for m in modelos]
        vencedor = None
        tentativas = []
        try:
            for coro in asyncio.as_completed(tasks):
                res = await coro
                tentativas.append({k: v for k, v in res.items() if k != "resp"})
                if "resp" in res:
                    vencedor = res
                    break
        finally:
            for t in tasks:
                if not t.done():
                    t.cancel()
            await asyncio.gather(*tasks, return_exceptions=True)
        if vencedor:
            vencedor["tentativas"] = tentativas
            return vencedor
        return {"erro": "todos_falharam", "tentativas": tentativas}
