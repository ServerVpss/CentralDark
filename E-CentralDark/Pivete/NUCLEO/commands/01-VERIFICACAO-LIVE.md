# COMANDO - 01-VERIFICACAO-LIVE.md
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823\CENTRALDARK-HERMES-BROWSER-ADAPTER-PACK-20260823\01-VERIFICACAO-LIVE.md
**SHA:** acad88e828e78489
**Timestamp:** 2026-08-26T19:43:48.448491
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- GAP =

### Ouro Bruto (primeiros 5000 chars)
```
# Verificação live da CentralDark

## Main observado

```text
repository=ServerVpss/CentralDark
main=dcf70053f2af1d95bd86867e6f043fb634e919d0
```

## 1. Browser/DevTools já é domínio canônico

Owner:

`docs/CONSCIENCIA/EXPANSAO-DE-DOMINIO.md`

O contrato reconhece navegador, DevTools, MCP e CDP como satélites possíveis do mesmo organismo e declara o runtime físico como `UNPROVEN` até a Casa medir.

## 2. Chrome DevTools MCP já foi encaixado conceitualmente

Owner:

`docs/INTEGRACOES/CHROME-DEVTOOLS-MCP.md`

Estado:

`CANDIDATE_INTEGRATION`

Fluxo já definido:

```text
CHROME_DEVTOOLS_MCP
→ BROWSER_OBSERVATION
→ ARTIFACT_CAPABILITY_ADAPTER
→ SIGNALS
→ DEDUPE
→ META_LUPA / CONTRAPROVA
→ OWNER
→ TESTE
→ CANDIDATE|NO_CHANGE|CRYSTAL
```

## 3. Artifact Capability já entende browser

Owner:

`scripts/memory-linker/artifact-capability.mjs`

Classe existente:

`BROWSER_OBSERVATION`

Sinais existentes:

```text
BROWSER_DEBUGGING_OBSERVATION
BROWSER_CONSOLE_SIGNAL
BROWSER_NETWORK_SIGNAL
BROWSER_PERFORMANCE_SIGNAL
```

Portanto não criar `BrowserMiner`.

## 4. Envelope causal já reconhece Chrome/CDP e Zendriver

Owner:

`supabase/functions/_shared/evidence-envelope.mjs`

Entrada:

`supabase/functions/agent-log/index.ts`

Persistência:

`public.agent_events`

Documento:

`docs/ARQUITETURA/EVIDENCE-ENVELOPE-CAUSAL.md`

Sensores documentados:

```text
Chrome/CDP/Lighthouse
ChatGPT/Zendriver
MCP/VPS
Cloudflare/API
DarkAI
voz/áudio
guardrails
```

## 5. Zendriver já existe fisicamente no repo

Paths:

```text
apps/modulos/elite-gateway/scripts/elite_ws_gateway.py
apps/modulos/elite-gateway/scripts/send_and_dump.py
apps/modulos/elite-gateway/scripts/debug_dom.py
apps/modulos/elite-gateway/scripts/diagnostico_dom.py
apps/modulos/elite-gateway/scripts/mapeamento_humano.py
...
```

O `elite_ws_gateway.py` inicia Chrome com Zendriver e expõe WebSocket, porém o loop atual apenas retorna `Recebido: <message>`.

Logo:

```text
ZENDRIVER_TRANSPORT_CODE=FOUND
ZENDRIVER_CANONICAL_BROWSER_BRIDGE=NOT_COMPLETE
```

`send_and_dump.py` já prova que houve automação DOM real para abrir `chatgpt.com`, localizar `contenteditable`, digitar, enviar e ler mensagens. Isso é material histórico/executável, não contrato estável da UI atual.

## 6. Hermes já possui ponte HTTP universal

Owner:

`apps/modulos/HERMES-CORE/agents/Universal-Handler/agent.mjs`

Executor já possui:

```text
ferramenta=handler
→ handlerUniversal(args.acao,args)
```

O Universal-Handler suporta:

```text
http
ping
webhook
deploy
pm2
```

O Browser Adapter deve usar **HTTP local** por esse owner.

## 7. Hermes não possui browser nativo hoje

`core/decisor.mjs` lista somente:

```text
shell
darkai
git
escrever_arquivo
ler_arquivo
notificar_progresso
aprender
handler
```

Portanto:

`HERMES_NATIVE_BROWSER_TOOL=NOT_FOUND`

A solução mínima é **não criar uma nona ferramenta inicialmente**. Browser entra por `handler`.

## 8. MCP cliente já existe em outra superfície

`apps/modulos/Bolt/source/app/lib/services/mcpService.ts`

já suporta:

```text
stdio
sse
streamable-http
```

Isso prova que a Casa já conhece cliente MCP, mas esse código pertence ao Bolt e não deve ser copiado para o HERMES-CORE apenas para browser.

## Fixed finding

```text
GAP =
BROWSER TRANSPORTS EXISTEM
+ HERMES HTTP BRIDGE EXISTE
+ EVIDENCE NORMALIZER EXISTE
- CANONICAL BROWSER BRIDGE
```

```