# 🧠 STATE VAULT / RETENTION / SESSION LIFECYCLE

## Papel
Cristalizar continuidade entre visitas, ferramentas, conversas e ambientes sem transformar cache em autoridade.

## Classes de estado
- `ACTIVE_MISSION`: intenção, escopo, owner, pendências, evidências, NEXT_CURSOR.
- `TOOL_TRACE_CACHE`: tool, request/result metadata, duração, status, evidence_ref, timestamp.
- `CONVERSATION_CACHE`: mensagens autorizadas, resumos, decisões, links e lineage.
- `REASONING_RECEIPT`: conclusão, premissas declaradas, evidências e decisão; não persiste chain-of-thought privada.
- `RECEIPTS`: provas duráveis.
- `SESSION_CHECKPOINTS`: snapshot de retomada.

## Política de retenção
- padrão: 30 dias para cache transitório.
- usuário escolhe dias, quota e destino.
- `PIN_FOREVER` somente para artefato explicitamente promovido.
- `AUTO_DELETE` nunca apaga receipts/docs canônicos por padrão.
- limpeza deve suportar `DRY_RUN` e receipt de remoção.

## Quotas mensuráveis
- medir `USED_GB`, `FREE_GB`, `QUOTA_GB`, `ITEM_COUNT`, `OLDEST_ITEM`, `NEWEST_ITEM`.
- avisar em 80%; política configurável em 100%.
- vídeo/áudio/frame devem ter quota separada de tool calls/conversas.
## Destinos de armazenamento
- `LOCAL`: SQLite/JSONL comprimido para alta frequência.
- `E:\CentralDark`: destino preferencial da Casa para estado persistente local.
- `WORKSPACE`: armazenamento por projeto.
- `GITHUB`: manifests, receipts, índices, checkpoints e cold archive; não usar banco binário vivo a cada tool call.

## GitHub Auth Broker
Preferência: GitHub App/OAuth > credencial existente do GitHub CLI > token manual.
Nunca persistir token em repo, log, cache exportado ou receipt.
Persistir apenas account/repo/scope/provider/status.

## Lifecycle por visita
`REHYDRATE → MEASURE → WORK → CHECKPOINT → VERIFY → CLOSE_SESSION → RETENTION_SWEEP`

- `CLOSE_SESSION` encerra processos temporários da visita, não mata bridge-base necessária à Casa.
- checkpoint registra `session_id`, goal, completed, pending, evidence_refs, next_cursor, storage_bytes, retention_days.
- nova visita começa pelo último receipt + NEXT_CURSOR, depois remede estado vivo.

## Owners canônicos para reuse
- handoff/continuidade: `docs/CONSCIENCIA/02-PROTOCOLO-HANDOFF-IA.md`.
- memória/contexto: `apps/modulos/memoria-api/index.mjs`.
- limpeza/retention: `scripts/guarda/guarda-limpar-logs.sh`.
- Screenpipe/cache cross-surface: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SCREENPIPE-BINDING.yml`.
