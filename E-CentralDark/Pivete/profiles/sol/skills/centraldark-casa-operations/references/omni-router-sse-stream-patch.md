# Omni Router — SSE Stream Patch (stream_not_implemented → StreamingResponse)

Cenário 30/08: o WebUI (8788) consome o Omni Router (8099) e o chat quebra
com `{"detail":"stream_not_implemented_yet"}` em toda chamada `stream=true`.
Causa: `centraldark_omni_router.py` raise 400 explícito quando `request.stream`
é `True`. O WebUI usa SSE obrigatório (SSE pro browser), então TODO chat quebra.

Receita provada: em vez de implementar stream real (caro, depende de cada
provider), **embrulhar a resposta non-stream em chunks SSE**. Mudança
cirúrgica: 1 import + 1 if-branch no `chat()`. Zero mudança de contrato,
zero regressão no non-stream, zero restart do WebUI/Hermes (que Pivete
proibiu).

## Onde mexer

`E:\CentralDark\Pivete\CentralDark\apps\modulos\elite-gateway\scripts\centraldark_omni_router.py`

### Patch 1 — import (linha ~35)
```python
# antes
from fastapi import FastAPI, Header, HTTPException, Request
# depois
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
```

### Patch 2 — assinatura do chat() (linha ~554)
```python
# antes
def chat(..., authorization: str = Header(default=None)) -> Dict[str, Any]:
# depois (precisa retornar StreamingResponse no branch stream)
def chat(..., authorization: str = Header(default=None)) -> Any:
```

### Patch 3 — remover o blocker e adicionar o branch SSE
**Remover** (linha ~556-557):
```python
if request.stream:
    raise HTTPException(status_code=400, detail="stream_not_implemented_yet")
```

**Inserir** antes do `return {` final (linha ~597), depois de
`evidence_delivery = emit_model_touch(event)`:
```python
if request.stream:
    def _gen():
        chunk_id = f"cd-{uuid.uuid4().hex[:16]}"
        created = int(time.time())
        words = text.split(" ")
        buf = ""
        for i, w in enumerate(words):
            buf += (w + " ")
            if len(buf) >= 20 or i == len(words) - 1:
                payload = {
                    "id": chunk_id,
                    "object": "chat.completion.chunk",
                    "created": created,
                    "model": f"{provider}/{resolved_model}",
                    "choices": [{"index": 0, "delta": {"content": buf}, "finish_reason": None}],
                }
                yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
                buf = ""
        final = {
            "id": chunk_id,
            "object": "chat.completion.chunk",
            "created": created,
            "model": f"{provider}/{resolved_model}",
            "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
        }
        yield f"data: {json.dumps(final, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(_gen(), media_type="text/event-stream")
```

A `text` já vem do final do `try:` (return das funções `run_openai` /
`run_claude_code` / `run_hermes` / `run_nous`). O branch SSE só quebra em
~20 chars e emite. Contrato OpenAI: `chat.completion.chunk` + `delta.content` +
`finish_reason=stop` + `data: [DONE]`. **Verificado**: o WebUI Hermes aceita
esse formato (testado em browser, retorno end-to-end).

## Como ativar a patch SEM restart do WebUI/Hermes

O Omni Router é processo separado (PID vai estar em `8099`). Pivete proíbe
restart do WebUI e do Hermes principal, **mas sub-serviços da cadeia free
tier SÃO autorizados a reciclar** (regra TRAVA NÃO-REINÍCIO + cadeia
free-watchdog).

Passo-a-passo:
1. Editar o arquivo (3 patches acima).
2. Validar sintaxe: `python -c "import py_compile; py_compile.compile('.../centraldark_omni_router.py', doraise=True)"`.
3. Matar SÓ o Omni Router (`Stop-Process -Id <PID_8099> -Force`).
4. O cron `4630de1d2d75` (`Cadeia Free Tier Watchdog`, 10min) ressuscita
   `launch_omni_router.py`, que relê o arquivo novo.
5. Validar: `curl -X POST http://127.0.0.1:8099/v1/chat/completions -d
   '{"model":"nous/tencent/hy3:free","messages":[...],"stream":true}'` →
   deve retornar `data: {...}\n\n` + `data: [DONE]`.

**CUIDADO:** se o watchdog não tiver subido ainda (roda a cada 10min),
esperar. O `launch_omni_router.py` está em
`C:\Users\danda\AppData\Local\Temp\launch_omni_router.py` (não no repo —
TEMP path, é launcher, não precisa versionar).

## Prova ponta-a-ponta (30/08, 10/10 PASS)

```text
[1] py_compile_sintaxe        OK
[2] stream_sse_OK              chunks=10 done=True
[3] stream_finish_reason       finish=True
[4] stream_false_regression    chat.completion OK
[5] old_blocker_removed        stream_not_implemented NÃO aparece mais
[6] v1_models_intact           lista tem auto/nous/openai
[7] webui_8788                  status=ok
[8] tailscale_iphone            http=200
[9] screenpipe_3030             healthy
[10] webui_provider_routes      auth + centraldark-router
```

## Pitfalls (CORTANTE)

- **WebUI `.env` é lido no boot, `/api/admin/reload` NÃO recarrega.**
  Trocar `OPENAI_API_KEY` ou `OPENAI_BASE_URL` em
  `C:\Users\danda\hermes-webui\.env` só vale no PRÓXIMO start do WebUI.
  Pivete proíbe restart do WebUI → config nova fica em disco, esperando
  watchdog ou restart autorizado.
- **Não confundir `requests` module ausente no import de teste.** O Omni
  Router roda no Python do uv (`cpython-3.11-windows-x86_64-none`) com
  `fastapi`/`uvicorn`/`requests` instalados via pip. Mas um `import
  centraldark_omni_router` num Python diferente falha com
  `ModuleNotFoundError: No module named 'requests'`. Isso é FALSO
  NEGATIVO do import local, não problema do serviço. O serviço prova-se
  com curl, não com import.
- **PID de quem está no 8099 muda.** O Cadeia Free Watchdog mata/relança
  o Omni Router a cada 10min se cair. Sempre medir antes de matar:
  `Get-NetTCPConnection -LocalPort 8099 | Select OwningProcess`.
- **`stream_not_implemented` no log de um daemon antigo não significa que
  o daemon atual quebra.** Cada ressurreição lê o arquivo novo. Procurar
  o erro no output ATUAL, não no log acumulado.
