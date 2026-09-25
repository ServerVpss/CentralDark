# ⚡ CentralDark Deterministic Fast Path

**Status:** arquitetura cristalizada; execução real depende de owner/backend medido.

## Intenção
Criar um modo explícito de depuração/admin que privilegia comandos secos, mensuráveis e reproduzíveis, reduzindo conversa ornamental sem remover os gates da Casa.

## Owner existente
- UI admin: `apps/modulos/mcp-admin-ui`
- Backend/admin: `apps/modulos/mcp/src/admin.js`
- Método universal: reutilizar os gates existentes de `REUSE_BEFORE_CREATE`, prova pós-ação, contraprova, receipt e `UNKNOWN != PASS`.

`REUSE_BEFORE_CREATE=true`: não criar segundo painel, segundo chat, segundo MCP ou segundo core.

## Nome canônico
`DETERMINISTIC_FAST_PATH`

Rótulo PT-BR: `⚡ CAMINHO RÁPIDO DETERMINÍSTICO`

## Fluxo
```text
!CENTRALDARK
→ #ACORDAR
→ CALIBRAR
→ selecionar DETERMINISTIC_FAST_PATH quando autorizado
→ MEDIR owner / HEAD / working tree / runtime alvo
→ comando seco mínimo
→ EXECUTAR por um writer autorizado
→ POST_PROBE
→ CONTRAPROVA
→ RECEIPT
→ REMEASURE
→ CONTINUAR até FIXED_POINT / HUMAN_FRONTIER / BLOCKED
```

## Regra de interação
No Fast Path, a resposta operacional deve priorizar:
1. alvo exato (`CASA_LOCAL`, `VPS`, `CI`, `PR`, `.exe`, serviço);
2. comando copiável;
3. resultado esperado;
4. campos de prova a devolver;
5. próximo comando apenas depois da evidência.

Exemplo:
```text
ALVO=CASA_LOCAL
COMANDO=<uma sequência curta e segura>
ESPERADO=<saída objetiva>
PROVA=<texto/foto/hash/status>
```

## Fail closed
O modo rápido NÃO significa pular segurança ou prova.

```text
FAST != BLIND
COMMAND_RAN != PASS
FILE_EXISTS != EXECUTED
DOCUMENTED != DEPLOYED
UNKNOWN != PASS
CONTRADICTION → FAIL_CLOSED
```

## Sincronização Git segura
Se `git pull --ff-only` falhar por working tree local, não usar reset/clean. Primeiro preservar delta local, sincronizar, depois reaplicar e reconciliar.

```text
DIRTY_WORKTREE
→ SNAPSHOT_DIFF
→ STASH/WORKTREE_SAFE_SAVE
→ FETCH/PULL --ff-only
→ RESTORE
→ CONFLICT? RECONCILE : CONTINUE
```

## UI Admin
O rumo correto é adicionar um seletor em `mcp-admin-ui` dentro do painel admin existente, não criar outra aplicação.

Estados previstos:
- `NORMAL`
- `DETERMINISTIC_FAST_PATH`

A UI só pode mostrar `ATIVO` quando o backend confirmar o modo aplicado para a sessão/admin atual. Toggle visual sem confirmação do backend = `UNKNOWN`, nunca verde.

## Escopo de modelos
O Fast Path não depende de LLM para decisões determinísticas básicas.

```text
N_MODELS_SUPPORTED=true
NO_MODEL_AVAILABLE → DETERMINISTIC_FALLBACK_OR_SETUP
MODEL_OUTPUT = PROPOSAL
EVIDENCE = JUDGE_IN_SCOPE
```

## Prova mínima para promover o botão
1. owner backend do execution-mode identificado;
2. endpoint/session binding implementado;
3. UI mostra estado retornado pelo backend;
4. teste NORMAL → FAST → NORMAL;
5. comando seco produz mesmo resultado para mesma entrada/estado;
6. logs/receipt incluem `execution_mode`;
7. rollback simples;
8. SAME_HEAD CI aplicável verde.

Até lá: **arquitetura aprovada, botão funcional ainda NÃO declarado.**

## Replay de caminho já provado

Owner: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml`

```text
PROVEN_PATH_REPLAY_LOCK=true
CAMINHO_JA_PROVADO
→ CARREGAR_RECEITA_SELADA
→ COMPARAR_FINGERPRINT
→ ADAPTAR_SOMENTE_BINDINGS_DO_AMBIENTE
→ EXECUTAR_MESMA_SEQUENCIA
→ RODAR_MESMA_PROVA
→ COMPARAR_SCHEMA_DE_RESULTADO + EFEITO_ESPERADO
→ DIVERGENCIA = DELTA_NOVO
→ SEM_DIVERGENCIA = REUSE_PROOF_NO_REPEAT
```

Não exigir que um agente novo reinterpretе do zero uma sequência já comprovada.
Mudança de host/path/auth-ref pode ser adaptação de ambiente; mudança de objetivo,
owner, lógica de prova ou efeito esperado exige revalidação do cone afetado.

