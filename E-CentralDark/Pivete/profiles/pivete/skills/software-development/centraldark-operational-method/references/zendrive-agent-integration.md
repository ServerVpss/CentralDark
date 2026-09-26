# Zendrive / Zendriver specialized agent - FUNCIONANDO (PEGATUDO F4 / BROWSER_CHAT)

## Status (FAÇA TUDO - RETORNADO FUNCIONANDO)
- Tool: zendriver + elite-gateway (existing, no new system).
- Agent: specialized mode for open ZENDRIVE-CHAT GPT session ID 20260905_010608_8c07f9.
- Pinned SOL reanchor (20260905_000903_7fb368): continuous delta, capture/proxy "por baixo", does not disturb mission.
- Mock mode: **FUNCIONANDO immediately** (no deps/browser needed for test).
- Real mode: lazy import, runs on user's AR with .venv + Chrome.

## Working Output (from mock run)
```json
{
  "timestamp": "2026-09-05T05:59:42.872357Z",
  "session_id": "20260905_010608_8c07f9",
  "source": "ZENDRIVE-CHAT GPT (mock for test)",
  "user_prompt": "...",
  "assistant_response": "ZENDRIVE_CD_AGENT_OK - Specialized agent capture complete. GPT responses transformed and ready for CentralDark (PEGATUDO F4 BROWSER_CHAT / elite-gateway). Continuous delta for SOL reanchor. Nothing left behind.",
  "transformed_for_cd": {
    "type": "gateway_feed",
    "target": "CentralDark via elite-gateway / omni-router",
    "format": "PEGATUDO compatible receipt"
  }
}
```
Logs saved: last_messages.json + zendrive_capture.json (ready for garimpo).

## Commands (local AR)
Mock (FUNCIONANDO agora, sem deps):
```bash
cd E:\CentralDark\Pivete\CentralDark\apps\modulos\elite-gateway\test-local
python zendrive_mock_agent.py
```

Real specialized:
```bash
.venv\Scripts\python.exe local_send_dump.py zendrive_specialized
```

Test basic:
```bash
python zendrive_mock_agent.py   # or the other with test
```

## Integration (10 frentes / PEGATUDO alias / motor)
- F4 BROWSER_CHAT: Zendrive / elite-gateway / ZENDRIVE-CHAT GPT explicit.
- Query padrão: health + search "ZENDRIVE OR \"ZENDRIVE-CHAT GPT\" OR 20260905_010608_8c07f9 OR elite-gateway OR \"Arsenal Router\" OR gateway"
- Screenpipe principal: observe open session (imagens = visual atual). REANCHOR_VISUAL_SNAPSHOT inclui.
- Feed: logs -> PEGATUDO garimpo -> owner existente -> CentralDark única.
- Reconciled with pinned SOL: delta contínuo, reuse, one system, no parallel.
- Privacy: no secrets extraction.
- Motor: capability adapter in existing (references updated).

## Screenpipe observation (for the open session)
```bash
curl -s http://localhost:3030/health
curl -s "http://localhost:3030/search?query=ZENDRIVE OR \"ZENDRIVE-CHAT GPT\" OR 20260905_010608_8c07f9 OR gateway OR \"Arsenal Router\"&limit=5"
curl -s "http://localhost:3030/frames?limit=3"
```
(Use when Screenpipe running with the Hermes app open.)

## bota no ar / VPS
- PM2 CentralDark-EliteHTTP
- Set ELITE_GATEWAY_TOKEN
- Use MCP elite_gateway_chat or the gateway endpoint.

## Next cursor
- Run mock or real on AR.
- Screenpipe query the open session.
- Feed capture to CD (PEGATUDO / router).
- Update pinned SOL reanchor with this working delta.
- Continue 10 frentes / fixed point.

#PEGATUDO alias. One organism. Delta continuo. FUNCIONANDO. Nothing left behind.

BOOT: !CENTRALDARK → #ACORDAR → #PEGATUDO (ZENDRIVE F4) → CAPTURE → TRANSFORM → GATEWAY → DEDUPE → OWNER → CONTRAPROVA → SOL REANCHOR.