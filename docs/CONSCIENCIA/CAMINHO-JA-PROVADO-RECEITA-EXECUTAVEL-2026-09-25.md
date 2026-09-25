# CAMINHO JÁ PROVADO — Receita Executável CentralDark

schema: `centraldark.proven-path-recipe.v1`
fingerprint_sha256_without_this_line: `15a4d91b3aac6be1ba4d189b7f40d4f833d95fef29224a5071fba84dd62404bc`
status: `CANDIDATE_CRYSTAL`
crystallized_at: `2026-09-25T09:18-03:00`
scope: `GLOBAL_CENTRALDARK_SESSION_2026-09-25`
owner: `PR_MOTHER_1562`
new_architecture: `false`
one_system_only: `true`
reuse_before_create: `true`
reality_is_judge: `true`

## 1. Critério do CHEFE

Caminho já provado não deve virar esforço repetido. Ele deve virar receita executável:

```text
CAMINHO_JA_PROVADO
→ SELAR_RECEITA_EXECUTÁVEL
→ GUARDAR_FINGERPRINT
→ PRÓXIMO_EXECUTOR_CARREGA_A_RECEITA
→ ADAPTA_SOMENTE_BINDINGS_DO_AMBIENTE
→ EXECUTA_A_MESMA_SEQUÊNCIA
→ RODA_A_MESMA_PROVA
→ COMPARA_RESULTADO_FORMATO_EFEITO
→ DIVERGIU = DELTA_NOVO
→ NÃO_DIVERGIU = REUTILIZA_CRISTAL
```

## 2. Cadeados

- `UNKNOWN != PASS`
- `ACTION != PROOF`
- `DOCUMENTED != EXECUTED`
- `MERGEABLE != MERGED`
- `MERGED != DEPLOYED`
- `HISTORY != CURRENT_STATE`
- `SEARCHED != VERIFIED`
- `TOOL_LISTADO != TOOL_ATIVO`
- `PONTO_FIXO != PASS`
- `NO_V2_V3_PARALLEL=true`
- `NO_SECOND_BUILDER=true`
- `NO_SECOND_MCP=true`
- `NO_DUPLICATE_OWNER=true`
- `NO_SECRET_VALUES=true`
- `NO_RAW_PRIVATE_REASONING=true`

## 3. Deltas provados desta sessão

### 3.1 GitHub / repositórios

- GitHub App `ServerVpss` passou para `repository_selection=all`.
- Repositórios antes 404 ficaram acessíveis via conector:
  - `ServerVpss/centraldark-emergent-mind`
  - `ServerVpss/centraldark-instinto-superior`
  - além de outros repos da organização.
- `centraldark-emergent-mind` e `centraldark-instinto-superior` possuem `AGENTS.md` de Lovable e sincronização Lovable ↔ GitHub por branch conectada.

### 3.2 Lovable / MCP

- Workspace Lovable `CentralDark` medido.
- MCP connectors medidos:
  - `CentralDark /admin/mcp` OAuth `CONNECTED`
  - `CentralDark /mcp` OAuth `CONNECTED`
- Sem terceiro MCP.
- Erro de rota observado: `/mcp/admin` não era MCP quebrado; era ordem de rota incompatível.
- Correção em PR filho `#1690`: alias interno `/mcp/admin` reutilizando mesmo auth/handler de `/admin/mcp`, sem redirect HTTP.
- Runtime do alias: `PASS` observado.
- CI same-head do PR #1690: `NOT_YET_PROVEN` enquanto checks aplicáveis não fecharem.

### 3.3 Builder Bolt

- Builder canônico = `apps/modulos/Bolt/`.
- Source canônico = `apps/modulos/Bolt/source/`.
- Runtime/container = `CentralDark-Builder`.
- Rota pública compat = `https://builder.centralldark.com`.
- Rota canônica de convergência = `/builder`.
- Backend authority = API canônica CentralDark.
- Open-Lovable/Lovable = donor/adapter/padrão, não substituto do Bolt.
- `ARCHITECTURAL_FIXED_POINT=PASS`.
- `RUNTIME_COMPLETE_FIXED_POINT=NOT_YET_PROVEN`.

Lacunas materiais ainda abertas:
- `WORKSPACE_PER_PROJECT=NOT_IMPLEMENTED`
- `OPEN_LOVABLE_BRIDGE=NOT_IMPLEMENTED`
- `HERMES_INTEGRATION=NOT_IMPLEMENTED`
- galeria material do Builder ainda não comprovada na `main`
- scripts históricos ainda apontam para `apps/builder-bolt/` em vez de `apps/modulos/Bolt/`.

### 3.4 Open-Lovable

- `firecrawl/open-lovable` é donor de capability, não novo produto CentralDark.
- Ouro material observado:
  - abstração de sandbox/provider
  - importador URL/site
  - edição contextual/cirúrgica
  - streaming de geração/aplicação
  - instalação/exportação de pacotes
- Reuso obrigatório: absorver capacidade no owner Bolt existente, não copiar UI/produto inteiro.

### 3.5 HUD / Inventário

- Não criar novo HUD.
- HUD canônico existente:
  - UI: `apps/modulos/hub/src/components/inventory/InventoryTab.tsx`
  - motor: `apps/modulos/hub/scripts/house-inventory-core.mjs`
  - índice: `apps/modulos/hub/src/generated/houseInventory.ts`
- Inventário CURRENT medido:
  - total `260`
  - capacidades `34`
  - skills `52`
  - aprendizados `46`
  - mineração `3`
  - cristais `25`
  - artefatos `64`
  - ferramentas `36`
- Semântica:
  - `MINERACAO/OURO` = candidato útil/minério
  - `CRISTAL` = fixed point/registro consolidado
  - `DIAMANTE` = `NOT_FOUND` como grupo canônico separado; não inventar.

### 3.6 Lovable Projects

- `list_projects` retornou `18` IDs únicos.
- Metadata do workspace reportava `17`.
- Resultado: `COUNT_DRIFT=TRUE`.
- Publicados observados: `13`.
- Não publicados observados: `5`.
- `TEMPLATES=0`.
- `DESIGN_SYSTEMS=0`.
- Interpretação: convergir projetos existentes para catálogo/galeria/template do Builder antes de criar novo template.

### 3.7 Regra de continuidade

- Regra permanente registrada: `EVERY_NEW_DELTA_FEEDS_PR_MOTHER`.
- Toda novidade material deve alimentar o PR-mãe `#1562`.
- Repetição sem mudança material deve ser deduplicada.

## 4. Receita executável

### Entrada

O próximo executor deve receber ou medir:

```yaml
bindings:
  repo: ServerVpss/CentralDark
  pr_mother: 1562
  current_main_head: REQUIRED
  active_child_prs: OPTIONAL_BUT_REMEASURE
  github_installation_scope: REQUIRED
  lovable_workspace: REQUIRED_IF_LOVABLE_SCOPE
  affected_owner: REQUIRED
  runtime_target: REQUIRED_IF_RUNTIME_EFFECT
  evidence_refs: REQUIRED
```

### Sequência

```text
1. CARREGAR_RECEITA
2. MEDIR_CURRENT_HEAD
3. MEDIR_OWNER_EXISTENTE
4. MEDIR_BINDINGS_DO_AMBIENTE
5. ADAPTAR_SOMENTE_BINDINGS
6. EXECUTAR_MESMA_SEQUÊNCIA_APLICÁVEL
7. RODAR_MESMAS_PROVAS_APLICÁVEIS
8. COMPARAR_RESULTADO_FORMATO_EFEITO
9. CLASSIFICAR:
   - PASS se mesmo resultado, mesmo formato, mesmo efeito e denominador declarado
   - DELTA_NOVO se divergir resultado, formato, efeito, owner ou premissa
   - UNKNOWN se não medido
   - BLOCKED se ferramenta/permissão/runtime ausente
10. REGISTRAR_NO_PR_MAE_1562
11. ATUALIZAR_NEXT_CURSOR
```

### Comparador

```yaml
compare:
  result:
    required: true
    examples: [PASS, FAIL, UNKNOWN, BLOCKED, STALE]
  format:
    required: true
    examples: [JSON_SCHEMA, HTTP_STATUS, TOOL_COUNT, FILE_PATH, PR_STATE, CHECK_STATE]
  effect:
    required: true
    examples: [runtime_changed, graph_updated, receipt_written, alias_works, catalog_updated]
```

### Regra de divergência

```text
SE resultado != esperado
OU formato != esperado
OU efeito != esperado
OU owner mudou
OU head mudou sem revalidação
OU premissa mudou
ENTÃO DIVERGIU = DELTA_NOVO.
```

### Regra de reutilização

```text
SE resultado == esperado
E formato == esperado
E efeito == esperado
E owner == mesmo
E head/prova ainda aplicável
ENTÃO NÃO_DIVERGIU = REUTILIZA_CRISTAL.
```

## 5. Fingerprint estrutural

Campos que definem identidade desta receita:

```yaml
fingerprint_fields:
  - schema
  - scope
  - owner
  - criteria
  - proven_deltas
  - executable_sequence
  - comparator
  - divergence_rule
  - reuse_rule
  - next_cursor
```

`sha256` deve ser recalculado quando qualquer campo material acima mudar.

## 6. NEXT_CURSOR

```text
#1562
→ CAMINHO_JA_PROVADO
→ RECEITA_EXECUTAVEL
→ FINGERPRINT
→ PROXIMO_EXECUTOR_REPLAY
→ ADAPT_ONLY_BINDINGS
→ SAME_SEQUENCE
→ SAME_PROOF
→ COMPARE_RESULT_FORMAT_EFFECT
→ DELTA_OR_REUSE_CRYSTAL
→ #1562
```
