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
