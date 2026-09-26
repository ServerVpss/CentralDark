---
name: hermes-windows-runtime-ops
description: "Hermes gateway loop / bash taskkill fails / lightshot 404."
category: hermes
---

# Hermes Windows Runtime Ops

## 1. O terminal do Hermes no Windows é git-bash (MSYS) — e isso quebra ferramentas nativas

Sintomas observados nesta sessão (Windows 10, Hermes profile pivete):

- `taskkill //F /PID N` → `ERRO: Argumento/opção inválido` (barra dupla). Use **`/F`** (uma barra).
- `cmd /c "taskkill /F /PID N & ..."` chamado do bash → **saída engolida** (vazio), kill não executa.
- `wmic process ... | grep` no bash → resultado inconsistente (cabeçalho/espaços poluem).
- `for /f` dentro de `.bat` rodado via `cmd /c` a partir do bash → pode não executar o loop.

**Workaround validado:** para QUALQUER kill de processo no Windows, rode no **CMD nativo do Windows** (ex: `C:\Users\danda>`), não no terminal bash do Hermes. O CMD nativo executa `taskkill`, `wmic` e `for /f` de forma confiável — o próprio Pivete rodou `hermes-web-ui start` e `.bat` com sucesso lá.

## 2. Loop de gateway duplicado (diagnóstico validado por observação)

- `hermes gateway run --replace` faz **apenas handoff do token do Telegram**; NÃO mata o supervisor anterior.
- Relançamentos manuais repetidos (ou `.bat` de restart) acumulam supervisors independentes que se respawnam em cadeia → spinner "Pensando" preso, múltiplos PIDs `gateway run --replace` vivos, `gateway_state.json` mente (falso verde: aponta 1 PID, há 6+ reais).
- A Web UI em `http://localhost:8648` é servida por **`node.exe` rodando `hermes-web-ui/dist/server/index.js`** (achar PID com `netstat -ano | findstr :8648`). **Não é o gateway** — matar gateways não derruba a 8648.
- `hermes gateway stop` só para o supervisor de *service* instalado; não alcança supervisors órfãos de launch manual.

**Receita de limpeza (rodar no CMD NATIVO do Windows):**

```bat
REM 1. Listar gateways órfãos
wmic process where "name='python.exe'" get ProcessId,CommandLine | findstr "gateway run --replace"

REM 2. Matar TODOS
for /f "tokens=2" %p in ('wmic process where "name='python.exe'" get ProcessId^,CommandLine ^| findstr /i "gateway run --replace"') do taskkill /F /PID %p

REM 3. Conferir que zero restou, depois subir 1 único:
hermes gateway run --replace
```

Bridges `hermes_bridge.py` duplicados: matar pelos mesmos PIDs listados (filtrar `hermes_bridge`). Manter só 1 por perfil.

## 3. Vision: prnt.sc / lightshot preview → URL direta

- `vision_analyze` numa URL de *preview* do prnt.sc → `source is not a recognized image`.
- **Fix testado:** `web_extract` na página de preview; ela embute a imagem direta, ex: `https://img.lightshot.app/<ID>.png`. Chamar `vision_analyze` nessa URL **direta**.
- Path local (`C:\...`) e base64 continuam 404 (limite de transporte — ver `img-view` / `visao-perfil-pivete`).
- 404 numa URL **direta** significa que o **backend de visão está morto**, não erro de transporte. Declare cegueira; NÃO faça loop trocando modelo (ver overlap abaixo).

## 4. Overlap / skills relacionadas

- Regras de transporte de visão: `img-view` + `visao-perfil-pivete` são as autoritativas.
- `vision-fallback-autoresilient` está **DESATUALIZADA**: lista cadeia `nous/google/gemini-3.5-flash` (o `config.yaml` real tem `tencent/hy3:free` primário + `openrouter/x-ai/grok-4.5` + `openrouter/openai/gpt-5.5`) e manda trocar modelo em 404 — mas 404 é falha de transporte/backend, troca de modelo não resolve. **Recomendar `hermes curator adopt vision-fallback-autoresilient`** para correção (skill provavelmente user-owned; não patchada aqui).
