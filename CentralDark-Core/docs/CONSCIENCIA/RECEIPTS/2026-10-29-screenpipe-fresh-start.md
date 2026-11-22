# Screenpipe Casa - reset de gravações e captura nova (2026-10-29)

**Intenção CHEFE:** eliminar totalmente as gravações antigas do Screenpipe e começar do zero. **Owner:** Screenpipe Desktop existente da Casa; documentação vinculada à skill .agents/skills/screenpipe-live-observer/SKILL.md. Sem alteração no Cockpit, no banco Supabase nem na arquitetura de owners.

## Readback causal da Casa (29/10/2026, America/Bahia)

- Antes: C:\Users\Administrador\.screenpipe\data continha ~6,274 GB de mídia (gravações de tela/áudio); C:\Users\Administrador\.screenpipe\storage continha ~51,873 GB de índices e payloads. C: com ~3,27 GiB livres; Screenpipe em degraded, frames desatualizados e alerta de pouco espaço.
- O usuário autorizou explicitamente a exclusão integral das gravações antigas. Screenpipe foi encerrado, apenas as pastas de histórico data e storage foram apagadas e recriadas vazias; chats, pipes, store.bin, secrets.sqlite, skills e repositório não foram apagados.
- Primeiro reinício não iniciou captura: logs indicaram frame storage: active index is missing porque storage.json ainda apontava para a geração do índice removida. O processo foi parado e foram removidos somente os metadados **obsoletos de armazenamento/gravação** (storage.json, storage-migration-complete.json, storage-reclamation-complete.json, sqlite-planner-maintenance.json, db.sqlite-shm, db.sqlite.owner, db.sqlite.quarantine.reserve.json, disk-pressure-notification-state.json, usage-cache.json). Preservadas credenciais/configuração do aplicativo.
- Segundo reinício: Screenpipe criou nova geração e676bbb1-d64e-481c-aab7-159a965f7a29; GET http://127.0.0.1:3030/health retornou HTTP 200, status=healthy, frame_status=ok, vision_reason=ok; 4 monitores reconhecidos, 47 frames registrados e arquivos de mídia novos. C: passou a ~57,58 GiB livres.
- Readback posterior às 13:34: frame_status=ok, frame atualizado, 7329 frames registrados; o **status agregado voltou a degraded**. Isto não invalida a nova gravação visual, mas exige inspeção das dependências antes de afirmar HEALTHY permanente. CAPTURE_FRESH=PASS naquele instante; SERVICE_ALL_DEPENDENCIES_HEALTHY=UNKNOWN/DEGRADED.

## Contrato reutilizável

STOP_EXISTING_SCREENPIPE → REMOVE_ONLY_RECORDING_DATA → REMOVE_STALE_STORAGE_POINTERS_IF_INDEX_MISSING → RESTART_SAME_APP → FRESH_FRAME_READBACK → CHECK_ALL_DEPENDENCIES. Não apagar configurações, tokens, skills nem dados fora do Screenpipe. DISK_SPACE_RECOVERED != ALL_DEPENDENCIES_HEALTHY; HTTP_200 != FRESH_FRAME sem timestamps. Não iniciar um segundo gravador.

## Resultado e continuidade

HISTORY_RESET=PASS; FRESH_RECORDING=PASS_AT_13:34; GIT_CODE_CHANGES=NONE; VPS_NOT_REQUIRED; NEXT_CURSOR=SCREENPIPE_DEPENDENCY_READBACK_AND_COCKPIT_EXISTING_OWNER.