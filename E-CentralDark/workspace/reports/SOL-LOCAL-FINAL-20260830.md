# SOL / CentralDark - fechamento local 2026-08-30

## Entrega

- Pacote: `E:/CentralDark/workspace/builds/SOL-local-package-20260830-proofed-v3.zip`
- Tamanho: `410325` bytes
- SHA-256: `4F2C8D0E924D82A70E4C1E631F0DD18B4AA18A593B98ED992EB1931D35C2CBA6`
- Conteudo: 77 arquivos; `src-tauri/target`, `node_modules`, `.env`, cookies, historico, tokens e bancos foram excluidos.

## Counterproof local

Recibo: `E:/CentralDark/workspace/sol/03-VOZ/provas/sol-local-counterproof.receipt.json`

- 13 checks passaram: UI, ingress, STT adapter, mutation false, Omni, chat, STT e TTS WAV.
- `local_only=true` e `secrets_read=false`.
- O primeiro carregamento do modelo pode levar mais de 30 segundos; o probe usa timeout de 120 segundos.

## Inventario finito

- `source_items_total=11360`
- `source_items_classified=11360`
- `unclassified=0`
- `silently_dropped=0`
- `capabilities_with_destination=14/14`
- `unowned=[]`
- `classification_fixed_point=true`
- `mission_fixed_point=false`

## Graphify controlado

- SOL source: 54 nos, 103 arestas.
- Gateway scripts: 169 nos, 442 arestas.
- Mapa: `E:/CentralDark/workspace/sol/00-MAPA-E-INDICES/SOL-GRAPHIFY-MAP-20260830.md`.

## Bloqueios materiais

- Smart App Control confirmado em enforce: `VerifiedAndReputablePolicyState=1`.
- Eventos 3077/3033 bloqueiam `cssparser_macros-874ce416aeff0e4a.dll` durante o build Rust/Tauri.
- Captura fisica do microfone pelo WebView/Tauri: `UNKNOWN`.
- Processos Hermes continuam vivos fora da porta antiga; rehome fisico dos clones: `PENDING`.

## Veredito

`LOCAL_RUNTIME_VOICE_PASS=true`

`FIXED_POINT_LOCAL=false`

O runtime web, chat, STT, TTS, inventario e grafo estao comprovados. O ponto fixo completo exige resolver o bloqueio de assinatura administrada, provar captura fisica e reconciliar o Hermes apos encerramento integral dos processos.
