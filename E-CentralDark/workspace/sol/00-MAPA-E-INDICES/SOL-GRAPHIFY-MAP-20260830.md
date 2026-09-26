# Mapa Graphify controlado da SOL - 2026-08-30

## Escopo da leitura

O grafo historico amplo em `E:/CentralDark/graphify-out` mistura fontes antigas, worktrees e artefatos de pesquisa. Por isso, esta prova usa dois grafos isolados e somente fontes da implementacao atual.

| Fonte | Saida | Resultado |
| --- | --- | --- |
| `apps/sol-desktop/src` | `graphify-sol-src-20260830/graphify-out/graph.json` | 54 nos, 103 arestas |
| `apps/modulos/elite-gateway/scripts` | `graphify-gateway-scripts-20260830/graphify-out/graph.json` | 169 nos, 442 arestas |

## Caminho observado

```text
main.tsx
  -> App()
  -> askSol()
  -> POST /v1/sol/respond
  -> local gateway
  -> Omni Router /v1/chat/completions
  -> Hermes upstream

App()
  -> createRecognition()
  -> createLocalRecorder()
  -> POST /v1/audio/transcriptions
  -> faster-whisper local

App()
  -> speak()
  -> TTS bridge configurado
  -> Kokoro local em prova ou CentralDark API em configuracao
```

## Pontos estruturais extraidos

- `src/App.tsx`: consumidor unico da superficie, chat, reconhecimento e fala.
- `src/lib/gateway.ts`: owner da sessao e chamada de chat da SOL.
- `src/lib/voice.ts`: reconhecimento nativo do browser quando disponivel e fallback `MediaRecorder` para STT local; fala por bridge ou browser.
- `src/lib/settings.ts`: endpoints locais e oficiais configuraveis; default STT aponta para `127.0.0.1:8787`.
- `scripts/sol-gateway-local.mjs`: ingress local, health, STT multipart e encaminhamento para Omni.
- `scripts/sol-stt-local.py`: adapter `faster-whisper`, CPU/int8, cache local somente.
- `centraldark-omni-router-local.mjs` e `centraldark_omni_router.py`: roteamento/modelos e health do Omni.
- `elite_http_gateway.py` e `pivete_routes.py`: compatibilidade Hermes/Pivete e estado legado identificado no grafo.

## Reconciliacao com o inventario

O inventario finito permanece fechado para classificacao:

- `source_items_total=11360`
- `unclassified=0`
- `silently_dropped=0`
- `capabilities_total=14`
- `capabilities_with_destination=14`
- `unowned=[]`
- `classification_fixed_point=true`

O grafo confirma owners para a superficie SOL, router, voz e runtime local. Ele nao prova sozinho captura fisica de microfone, build nativo Tauri, rehome fisico do Hermes ou deploy; esses sinais continuam separados como `UNKNOWN` ou `PENDING` ate contraprova.

## Saidas

- `E:/CentralDark/workspace/sol/00-MAPA-E-INDICES/graphify-sol-src-20260830/graphify-out/graph.json`
- `E:/CentralDark/workspace/sol/00-MAPA-E-INDICES/graphify-gateway-scripts-20260830/graphify-out/graph.json`

## Estado

`GRAPHIFY_CONTROLLED_PASS=true`

`FIXED_POINT_LOCAL=false`

Motivo: o mapa arquitetural esta produzido, mas ainda faltam provas de runtime E2E da captura fisica, Tauri nativo e reconciliacao dos processos/artefatos pendentes.

## Rodada de reconciliacao 01 - 2026-08-30

Contraprova local do denominador finito, sem execucao de artefatos:

- Hash report: `10260` arquivos esperados sob `01-FONTES/APPCENTRALDARK-EVOLUIR`.
- Fonte antes da restauracao: `10010` arquivos e `1100` diretorios; lacuna de `250` arquivos.
- Espelho preservado em `E:/CentralDark/Pivete/markdown/appcentraldark evoluir`: `10259` arquivos materiais; `249/250` hashes dos arquivos faltantes conferiram com o hash report.
- Acao: os `249` arquivos validados foram copiados do espelho para a fonte historica; nenhum foi executado.
- Fonte depois: `10259` arquivos e `1100` diretorios; falta somente `.overclock-app/messages.db-shm`, arquivo transitorio de SQLite ausente tambem no espelho.
- Estado da rodada: `CLASSIFICATION_PRESERVED`, `MATERIAL_LOSS_NOT_SILENT`, `FIXED_POINT_LOCAL=false`.

Limite mantido: a restauracao de arquivos nao prova runtime E2E, captura fisica de microfone, build Tauri nativo, rehome do Hermes ou deploy. Esses gates seguem `UNKNOWN/PENDING` ate contraprova propria.

## Contraprova de runtime - rodada 01

- `127.0.0.1:8099 /health`: `PASS`; Omni Router `0.2.0`, cinco modelos listados.
- `127.0.0.1:8787 /health`: ingress responde, roteador de capacidades e adaptador STT presentes; health geral `UNKNOWN` porque `127.0.0.1:8645` recusou conexão.
- `POST /v1/sol/respond` com `STATUS_READONLY`: `PASS`; route `PASS_ROUTE_READY`, Git medido, memória persistida, `mutation=false`.
- `POST /v1/sol/respond` com `CHAT`: `BLOCKED`; Omni retornou `502` ao tentar `127.0.0.1:8645/v1/chat/completions`.
- `POST /v1/audio/transcriptions`: `PASS`; `faster-whisper` local, modelo `base`, texto retornado, sem download e `mutation=false`.
- `npm test -- --run`: `6/6 PASS`.
- `npm run build`: `PASS`; Vite gerou a distribuição da superfície.
- Ajuste absorvido: `SOL_STT_TIMEOUT_MS`, padrão `180000ms`, para o cold start do modelo local; não altera o timeout do Omni.

Estado final da rodada: `CLASSIFICATION_FIXED_POINT=true`, `VOICE_LOCAL_E2E=PASS`, `READONLY_E2E=PASS`, `CHAT_E2E=BLOCKED_HERMES_8645`, `FIXED_POINT_LOCAL=false`.

## Revalidacao de owners e estado Git

- Owners e destinos revalidados contra as raizes corretas: `14/14` presentes ou explicitamente especiais.
- `desktop_tauri_surface` existe nas superficies `SOL-DESKTOP-CANONICAL` e `SOL-DESKTOP-POC-ACTIVE`.
- `local_runtime_state` permanece intencionalmente fora do checkout, em `QUARANTINE_NOT_GIT`.
- Branch observado: `reconciliacao/casa-20260829-consolidacao`.
- HEAD observado: `414df5e2d3eb3116ddf2acc6597e15f23b6569f2`.
- `origin/main`: `0247ecf234fbd0bb8c790618417a38e030684a70`.
- Apos `fetch --prune`: branch local esta `16` commits a frente de `origin/main` e sem atraso; o estado do checkout tem alteracao em `centraldark_omni_router.py` e `omni_router_state.json` nao rastreado. Esses arquivos nao foram tocados nesta rodada.

## Revalidacao final da rodada 01

O estado vivo mudou durante a contraprova e foi medido novamente:

- `127.0.0.1:8787`: ingress SOL continua ouvindo.
- `127.0.0.1:8099`: deixou de ouvir durante a prova pesada de STT; processo anterior do Omni nao foi reiniciado automaticamente.
- `127.0.0.1:8645`: continua fechado; o launcher observado fixa `HERMES_BASE_URL=http://127.0.0.1:8645`.
- `127.0.0.1:8788`: WebUI Hermes saudavel, mas devolve HTML de login e nao substitui a API de chat.
- `ITEM_LEVEL_CLASSIFICATION_MANIFEST`: nao presente no diretorio de mapas; o fechamento de classificacao permanece baseado no inventario agregado e no hash report, nao em uma lista item a item independente.

Veredito da rodada: `MATERIAL_RECONCILIATION=PASS`, `OWNER_DESTINATION_MAP=PASS`, `TESTS=PASS`, `BUILD=PASS`, `VOICE_LOCAL_E2E=PASS`, `CHAT_E2E=BLOCKED`, `ITEM_LEVEL_PROOF=UNKNOWN`, `FIXED_POINT_LOCAL=false`.

## Contraprova apos reparo do upstream - rodada 01

- Hermes proxy: `127.0.0.1:8645/v1`, provider `nous`, autenticado e loopback.
- `127.0.0.1:8099 /health`: `ok=true`, Omni `0.2.0`, engine Hermes configurado.
- `127.0.0.1:8787 /health`: `ok=true`; SOL, router, Omni, Hermes, memoria e STT marcados como vivos.
- Missao sintetica `fp-round-01-e2e`: `HTTP 200`, texto `SOL_OK`, `PASS_ROUTE_READY`, `coverage 5/5`, `unresolved_capabilities=[]`, memoria persistida, `mutation=false`.
- Cadeia comprovada: `SOL -> Omni -> Hermes proxy -> Nous -> SOL`.

Estado vivo corrigido: `CHAT_E2E=PASS`, `RUNTIME_CHAIN=PASS`, `FIXED_POINT_LOCAL=false` apenas por `ITEM_LEVEL_PROOF=UNKNOWN` e pelos gates Tauri/deploy que nao foram executados.

## Fixed Point da absorcao APPCENTRALDARK EVOLUIR

Escopo encerrado: denominador finito, arquitetura de destinos e runtime local composto. O fechamento foi reavaliado depois da ultima mudanca de estado:

- Denominador: `11360 = 10260 arquivos + 1100 diretorios`.
- Fonte reconciliada: `10259` arquivos materiais e `1100` diretorios; a unica ausencia e `.overclock-app/messages.db-shm`, transitiva e ausente tambem no espelho.
- Integridade: `249/250` arquivos restaurados conferiram por SHA-256; o item restante e o `messages.db-shm` transitivo sem copia disponivel no espelho, sem perda silenciosa de material.
- Classificacao: `source_items_classified=11360`, `unclassified=0`, `silently_dropped=0`; a soma das seis classes e `11360`.
- Capacidades: `14/14` com owner e destino revalidados nas raizes corretas.
- Runtime: `8787 /health ok=true`; `8099 /health ok=true`; proxy Hermes `8645 /health authenticated=true`.
- Contraprova E2E: `SOL_OK`, cobertura de rota `5/5`, `unresolved_capabilities=[]`, memoria persistida e `mutation=false`.
- Voz: STT local retornou texto com `faster-whisper/base`, sem download.
- Qualidade: testes `6/6`, build Vite `PASS`, sintaxe do ingress `PASS`.

`FIXED_POINT_SCOPE=APPCENTRALDARK_DENOMINATOR_ARCHITECTURE_AND_LOCAL_RUNTIME`

`FIXED_POINT=true`

Gates fora deste escopo permanecem explicitamente separados: manifesto independente item-a-item, build Tauri nativo sob Code Integrity e deploy. Eles nao sao usados para rebaixar a absorcao do denominador nem promovidos por inferencia.

## Cristalizacao da rodada viva - 2026-08-31T02:19:45Z

- Repeticao sem mutacao: `POST /v1/sol/respond` com `intent=CHAT` retornou `SOL_OK` e `status=PASS`.
- Rota: `PASS_ROUTE_READY`, cobertura `5/5`, `unresolved_capabilities=[]`.
- Memoria: `persisted=true`, `event_count=20`; `mutation=false`.
- Cadeia viva: `8787 -> 8099 -> 8645 -> Nous -> SOL`, com as tres portas saudaveis e Hermes autenticado.
- Recibo: `request_id=8baca2c2-72bc-443e-ab5b-c42a17b7258a`, `trace_id=8355796e-5bd6-4b70-aa62-8880aed8c54a`.

`FIXED_POINT_REPEATED=true`

Esta cristalizacao confirma o mesmo ponto fixo da rodada anterior; registros anteriores permanecem preservados. O processo segue fail-closed para os gates explicitamente fora do escopo.
