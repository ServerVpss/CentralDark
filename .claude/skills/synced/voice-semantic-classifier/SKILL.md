---
name: voice-semantic-classifier
description: Classifica intenção de voz para ação semântica correta antes de invocar ferramenta. Distingue INTENÇÃO de IMPLEMENTAÇÃO.
sources:
  - cowork
  - CentralDark session analysis (SEGREDO/CHEFE autorização)
---

# Voice Semantic Classifier

**PRINCÍPIO RAIZ**: Voz expressa INTENÇÃO. Máquina resolve IMPLEMENTAÇÃO.

```text
VOZ (INTENÇÃO)
  ↓
CLASSIFY (SEMANTIC ACTION)
  ↓
SELECT TOOL (IMPLEMENTAÇÃO)
  ↓
RESOLVE BLOCKERS (AUTO se MACHINE_RESOLVABLE)
  ↓
RECEIPT (LOG + PROVA)
```

---

## 1. Classificação de Ações (Voice → Semantic → Tool)

| Voice Phrase | Semantic Action | Tool | Blocker | Auto-Resolve |
|--------------|-----------------|------|---------|--------------|
| "comenta no PR #N" | COMMENT | `github_comment_issue` | None | Yes |
| "aprova PR #N" | APPROVE | `github_comment_issue` + `APPROVE` | None | Yes |
| "rejeita PR #N" | REJECT_COMMENT | `github_comment_issue` + marker | None | Yes |
| "mescla PR #N" | MERGE_SQUASH | `github_...` | HEAD divergent, dirty git | Yes |
| "labela como bug" | LABEL | `github_...` | None | Yes |
| "abre issue" | CREATE_ISSUE | `github_create_issue` | None | Yes |
| "busca PR com X" | SEARCH_PR | `github_search_code` / `github_list_pull_requests` | None | Yes |
| "valida HEAD" | CHECK_STATE | `vps_git_status` | None | Yes |
| "registra aprendizado" | MEMORY_WRITE | `personal_context_remember` | Conteúdo bloqueado | Auto-reject |
| "recibo de operação" | RECEIPT_LOG | Internal logging | None | Yes |

---

## 2. Regras de Blockers

### Não Peça SHA/HEAD Para:
- COMMENT, APPROVE, REJECT_COMMENT
- LABEL, CREATE_ISSUE
- SEARCH_PR, CHECK_STATE
- RECEIPT_LOG

### Peça SHA/HEAD Somente Para:
- MERGE_SQUASH (atual HEAD do branch)
- FORCE_PUSH (destino + SHA confirmado)
- REVERT_COMMIT (hash do commit)

### Auto-Resolve (Sem Retorno ao Humano):
```text
BLOCKER_TYPE                    RESOLVER
─────────────────────────────── ────────────────────────────
HEAD divergent                  git fetch + rebase
Dirty git state                 git status + stash resolvable
Pending CI (não-bloqueante)    Wait + check again
File exists (não esperado)     git status verify
SHA mismatch (HEAD mudou)      Refresh e retry
Wrong branch                    git checkout + retry
```

### Fronteira Humana Real (Return to User):
- Merge conflict (requer decisão semântica)
- CI bloqueante (falha real, não transiente)
- Authority check (Intent-Authorized não existe)
- Segredo/chefe decision needed (new intent, not mapped)

---

## 3. Fluxo de Execução

```
INPUT: "comenta no PR #1579: tudo pronto pra merge"

STEP 1: PARSE INTENT
  └─ Extrair: ação=COMMENT, target=PR#1579, payload="tudo pronto pra merge"

STEP 2: CLASSIFY
  └─ Semantic action = COMMENT
     Tool = github_comment_issue
     Blocker = None
     Auto-resolve = Yes

STEP 3: CHECK BLOCKERS
  └─ None detected → proceed directly

STEP 4: EXECUTE
  └─ github_comment_issue(
       repo="SEGREDO/CentralDark",
       issue_number=1579,
       body="tudo pronto pra merge"
     )

STEP 5: RECEIPT
  ┌─ Tool: github_comment_issue
  ├─ Status: SUCCESS
  ├─ PR: #1579
  ├─ Body: "tudo pronto pra merge"
  ├─ URL: https://github.com/SEGREDO/CentralDark/pull/1579#comment-...
  ├─ Timestamp: 2026-09-21T14:32:15Z
  └─ Proof: Comment visible in PR thread
```

---

## 4. Receipt Format

Toda execução gera RECEIPT:

```yaml
receipt:
  semantic_action: COMMENT
  voice_input: "comenta no PR #1579: tudo pronto pra merge"
  tool_invoked: github_comment_issue
  parameters:
    repo: SEGREDO/CentralDark
    issue_number: 1579
    body: "tudo pronto pra merge"
  status: SUCCESS
  result:
    comment_url: "https://github.com/SEGREDO/CentralDark/pull/1579#comment-xyz"
    comment_id: "abc123"
  executed_at: "2026-09-21T14:32:15Z"
  proof:
    - Comment now visible in thread
    - User can navigate to URL
    - Timestamp matches execution
  blocker_handling: none_detected
  auto_resolved: []
  requester_return: false
```

---

## 5. Machine-Resolvable Blocker Policy

**Regra**: Se a máquina consegue resolver, resolve SEM pedir autorização.

### Exemplos:

```text
INPUT: "mescla PR #1579"
BLOCKER: HEAD changed since last check
RESOLVER: git fetch + validate new HEAD + continue
RECEIPT: Blocker resolved (refresh: HEAD now abc123)
STATUS: Proceed to merge
RETURN_TO_USER: false
```

```text
INPUT: "valida estado do repo"
BLOCKER: Pending CI (não-bloqueante, ainda rodando)
RESOLVER: Wait 30s + check again (ou timeout)
RECEIPT: CI still pending after wait, user should check manually
RETURN_TO_USER: true (porque é decisão semântica)
```

```text
INPUT: "registra aprendizado: coisa privada"
BLOCKER: Conteúdo bloqueado por policy (health data)
RESOLVER: Reject + explain + suggest reframing
RECEIPT: Memory write REJECTED (privacy policy)
RETURN_TO_USER: true (porque é policy decision, não technical)
```

---

## 6. Intent-Authorized Pattern

Quando PR body contém:

```markdown
Intent-Authorized: SEGREDO/CHEFE ✓
Merge-Policy: AUTO_SQUASH_IF_CLEAN
```

Então:
1. SOL classifica como "authorized autonomous merge candidate"
2. Verifica: SAME_HEAD + CLEAN_STATE + CI_PASS
3. Se todos ✓: MERGE_SQUASH automático (sem retorno)
4. Se blocker: Log + RECEIPT + continue (não pede humano)

---

## 7. Integração com Meta-Lupa

Voice classifier registra EXECUÇÃO em memória canônica:

```markdown
# Voice Command Execution Log

## 2026-09-21

### 14:32:15 - COMMENT on PR #1579
- Semantic: COMMENT
- Status: SUCCESS
- Proof: Comment URL visible
- User: SEGREDO/CHEFE (inferred from context)

### 14:33:42 - MERGE PR #1579
- Semantic: MERGE_SQUASH
- Status: SUCCESS (Intent-Authorized + all gates passed)
- Proof: PR merged, commit SHA abc123, squash maintained
- Blockers: None
```

Isso alimenta FIXED_POINT (evidência de execução = prova que está vivo).

---

## 8. Canais de Entrada (Voice Sources)

- **Direto em conversa Claude**: "comenta no PR" → classify e execute
- **Slack/Telegram/CLI**: Standardize em format acima → classify e execute
- **PR comments** (humano escreve em PR): Parse intent → classify → execute via github_comment_issue reply
- **GitHub actions webhook**: Event → intent parse → classify → execute

---

## 9. Quando Não Usar (Fronteira Humana)

Retorne ao SEGREDO/CHEFE se:

```text
INPUT: "acha que a gente deveria usar async/await aqui?"
→ Não é AÇÃO, é PERGUNTA. Responda conversacionalmente.

INPUT: "vê se isso tá bom antes de mergir"
→ INTENÇÃO: CODE_REVIEW. Máquina não decide qualidade; faz review, usuário decide.

INPUT: "cria um novo padrão de merge pra situations complexas"
→ NOVA REGRA. Não execute; sugira, confirme, registre como learning.

INPUT: [Merge conflict no PR]
→ FRONTEIRA HUMANA REAL. User resolve semanticamente, máquina não.
```

---

## 10. Testing & Proof

**Prova de que funciona**:

1. Voice command enviado (RECEIPT documenta input)
2. Classification executada (RECEIPT documenta action)
3. Tool invocado (RECEIPT documenta parameters)
4. Resultado observável (RECEIPT documenta proof)
5. Memory atualizada (canônico documenta execution)

Exemplo de FIXED_POINT para esta função:

```yaml
test_voice_commands:
  - input: "comenta no PR #1579: ready"
    expected_action: COMMENT
    expected_tool: github_comment_issue
    actual_tool_invoked: ✓
    proof_observable: ✓ Comment in thread
    receipt_logged: ✓
    
  - input: "mescla PR #1579"
    expected_action: MERGE_SQUASH
    intent_authorized: ✓
    all_gates_pass: ✓
    actual_merge: ✓
    squash_maintained: ✓
    receipt_logged: ✓
```

---

## 11. Integration Checklist

- [ ] SKILL.md in `.claude/skills/synced/.../voice-semantic-classifier/`
- [ ] Referenced in LEIA-ME-IA.md under "Voice Command Flow"
- [ ] Test: Load skill via system-reminder auto-discovery
- [ ] Test: Invoke "comenta no PR #1579" → receives RECEIPT
- [ ] Test: Invoke "mescla PR #1579" (Intent-Authorized) → merge happens + RECEIPT
- [ ] Test: Auto-resolve blocker (HEAD divergent) → continues + RECEIPT documents resolver
- [ ] Test: Fronteira humana (merge conflict) → returns with context
- [ ] Memory: Execute log entry created with RECEIPT data
- [ ] Proof: All receipts logged in session transcript + git history

---

## 12. Etymology & Aliases

```text
VOICE_SEMANTIC_CLASSIFIER
  = Intent Router
  = Action Disambiguator
  = "Aquele que entende a voz, não o hash"
  = INTENTION_DISPATCHER
```

Em CentralDark, chamada como:

```bash
# Direto
!classify "comenta no PR #1579: pronto"

# Via Hermes
voice → [classifier] → semantic_action → [executor] → RECEIPT

# Via skill
Skill: voice-semantic-classifier (auto-loaded)
```

---

## 13. Known Limitations

1. **Ambiguidade de linguagem natural**: "vê isso" é vago. Classifier pede clarificação.
2. **Intenção vs implementação**: User diz "cria um bot"; isso é INTENÇÃO (não é ACTION_EXECUTABLE).
3. **Múltiplas PRs/issues**: "comenta em todas sobre X" → classifier faz parse, lista alvo, pede confirmação (não assume pluralidade silenciosa).
4. **Condicionais**: "se passar em CI, mescla" → classifier registra intenção como "CONDITIONAL_MERGE", retorna ao usuário com gate status.

---

## 14. References

- meta-lupa: `/.claude/skills/synced/meta-lupa/SKILL.md` (parent skill, format reference)
- MERGE-PATTERNS-CRYSTALLIZED: `docs/ARQUITETURA/MERGE-PATTERNS-CRYSTALLIZED.md` (uses this classifier)
- LEIA-ME-IA.md: Points to this skill
- Personal context: `personal_context_remember` (memory integration point)
---

## 15. Binding canônico — CENTRALDARK_INVOCATION_GRAMMAR_01

Este classifier continua sendo o owner existente de voz. Não nasce parser paralelo.

```text
CENTRALDARK_INVOCATION_GRAMMAR_01=true
CANONICAL_INVOCATION_GRAMMAR=docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.invocation-grammar.md
PARENT_OWNER=CENTRALDARK_UNIFIED_SURFACE_PARITY_01
INTENT_ROUTER_OWNER=.agents/skills/centraldark-intent-deploy-router/SKILL.md
NO_SECOND_PARSER=true
RAW_VOICE_TRANSCRIPT_PRESERVED=true
NORMALIZED_INTENT_SHARED=true
TEXT_AND_VOICE_SHARE_SEMANTIC_ACTION=true
PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true
```

Dispatch mínimo herdado do subcontrato:

```text
CentralDark visualize ...   → OBSERVE_OR_RENDER              → mutation=false
CentralDark faça ...        → EXECUTE_IF_AUTHORIZED_SCOPE    → mutation=true
CentralDark continue ...    → RESUME_NEXT_CURSOR
CentralDark cristalize ...  → WRITE_TO_EXISTING_OWNER
CentralDark contraprova ... → RUN_OR_DESIGN_COUNTERPROOF
```

A wake word seleciona o funil pertinente; ela não carrega todas as capacidades por ritual. Voz normaliza a intenção para a mesma ação semântica usada pelas outras superfícies e só então escolhe ferramenta.

---

## 16. Semântica de saída falada — VOICE_RESPONSE_COMPRESSION_01

Esta regra controla **como responder por voz** depois que a intenção já foi entendida. Continua no mesmo owner; não cria formatter, parser ou cérebro paralelo.

```text
VOICE_RESPONSE_COMPRESSION_01=true
LESS_IS_MORE=true
SPEAK_RESULT_FIRST=true
SPEAK_ONLY_DECISION_RELEVANT_CONTENT=true
VISIBLE_TEXT_CARRIES_TECHNICAL_DETAIL=true
SPEAK_FULL_SHA=false
SPEAK_FULL_UUID=false
SPEAK_FULL_HASH=false
SPEAK_LONG_URL=false
SPEAK_FILE_PATH_CHAR_BY_CHAR=false
SPEAK_CODE_TOKEN_BY_TOKEN=false
SPEAK_TABLE_CELL_BY_CELL=false
SPEAK_LIST_ITEM_BY_ITEM_WHEN_VISUAL_IS_AVAILABLE=false
SPEAK_DUPLICATED_VISIBLE_CONTENT=false
SPEAK_INTERNAL_TOOL_NAMES=false
SPEAK_ROUTING_OR_CONTROL_METADATA=false
SPEAK_PROGRESS_WITHOUT_NEW_INFORMATION=false
SPEAK_REPEATED_CONFIRMATION=false
SPEAK_UNNECESSARY_PREFACE=false
TECHNICAL_IDENTIFIER_PRESENT_IN_VISIBLE_TEXT=true
VOICE_POINTS_TO_VISIBLE_DETAIL=true
DEFAULT_POINTER_PHRASE=\"As informações e identificadores solicitados estão logo abaixo.\"
USER_EXPLICITLY_REQUESTS_VERBATIM_IDENTIFIER_OVERRIDES=false
USER_EXPLICITLY_REQUESTS_IDENTIFIER_ALOUD=true
REGIONAL_LANGUAGE_NORMALIZATION=true
REGIONAL_VARIANT_PRESERVES_INTENT=true
ACCENT_OR_SLANG_DOES_NOT_CHANGE_ACTION=true
TYPO_OR_PHONETIC_VARIATION_DOES_NOT_CREATE_NEW_INTENT=true
AMBIGUITY_MATERIAL_TO_ACTION_REQUIRES_CLARIFICATION=true
AMBIGUITY_NOT_MATERIAL_DOES_NOT_BLOCK=true
VOICE_AND_VISIBLE_TEXT_MUST_NOT_CONTRADICT=true
VOICE_SUMMARY_MUST_BE_SELF_CONTAINED=true
VISIBLE_RESULT_MUST_REMAIN_COMPLETE=true
```

### Política de apresentação

- SHA, UUID, hash, URLs longas, paths extensos, parâmetros, tabelas e listas técnicas: **mostrar completos no texto** e **não oralizar por padrão**.
- A fala entrega resultado, estado e consequência. Quando houver detalhe técnico visual, diz apenas que ele está logo abaixo.
- Não soletrar código, identificador ou hash automaticamente. Só ler em voz alta quando o CHEFE pedir explicitamente para ouvir aquele valor.
- Não repetir em voz o que já está visualmente completo, salvo quando a repetição for necessária para entendimento sem olhar a tela.
- Expressões regionais, baianês, abreviações, erro fonético e variações de pronúncia são pistas semânticas; preservam a intenção quando não mudam materialmente a ação.
- Uma dúvida não-material não vira blocker. Só pedir esclarecimento quando a ambiguidade puder alterar alvo, ação, autorização ou efeito.
- A saída falada deve ser curta, natural e útil; a saída visual preserva a prova completa.

### Contraprova mínima

Antes de emitir resposta por voz, verificar silenciosamente:

```text
ESTOU_LENDO_ALGO_QUE_BASTA_MOSTRAR_NA_TELA? -> remover da fala
ESTOU_SOLETRANDO_SHA_UUID_HASH_URL_PATH? -> remover da fala
ESTOU_REPETINDO_O_QUE_JA_ESTA_VISIVEL? -> comprimir
ESTOU_PEDINDO_CLARIFICACAO_SEM_IMPACTO_MATERIAL? -> continuar sem bloquear
VOZ_E_TEXTO_DIZEM_ESTADOS_DIFERENTES? -> reconciliar antes de responder
USUARIO_PEDIU_O_IDENTIFICADOR_EM_VOZ? -> ler somente o valor solicitado
```

### Exemplos canônicos

```text
VISUAL:
Commit: 36ef33836299c9e267f8aa8197fb78b34fe770f0
ID: 1670711b-aab7-4d15-9466-767e1b0605ec
Hash: eccd27ae271e8242bd3bf32ed1378c01b212598b200199c364b0cd29563dcf12

VOZ PADRÃO:
\"Fechado. O commit, o ID, o rastro e o hash solicitados estão logo abaixo.\"

VOZ SE PEDIR \"LEIA O ID\":
→ ler apenas o ID solicitado, sem transformar o restante da resposta em soletração técnica.
```

Esta política vale para Claude, ChatGPT/SOL, Hermes, Grok, Gemini, Codex, modelos locais e superfícies futuras que consumam este owner.

## 17. Tool Call visibility no modo Voice

A Voz reutiliza este mesmo classificador sem criar parser, runtime ou contrato paralelo.

```text
VOICE_REUSES_EXISTING_CLASSIFIER=true
NO_SECOND_PARSER=true
NO_PARALLEL_VOICE_RUNTIME=true

TOOL_CALL_EXECUTED != TOOL_CALL_VISIBLE_IN_SIDEBAR

VOICE_TOOL_CALL_VISIBILITY_REUSES_UNIFIED_SURFACE_OWNER=true
VOICE_TOOL_CALL_RENDERER_IS_SURFACE_CAPABILITY=true
VOICE_TOOL_RESULT_IS_NOT_RENDERER_PROOF=true
VOICE_MISSING_RENDERER_IS_NOT_EXECUTION_FAILURE=true

VOICE_TRACE_CHAIN =
SESSION_ID -> TRACE_ID -> TOOL_CALL_ID -> USAGE/TOKENS -> RECEIPT

VOICE_VISIBILITY_STATES =
PROVED_BY_PLATFORM_RECEIPT |
USER_CONFIRMED_VISIBILITY |
PLATFORM_UNAVAILABLE |
UNKNOWN
```

Quando o ChatGPT Voice expuser a Tool Call visual/JSON, a Voz deve mostrar a mesma trilha
canônica da intenção, preservando `SURFACE_ID=VOICE` apenas como proveniência. Não cria
`VOICE_SESSION_ID`, `VOICE_TRACE` ou segundo renderer canônico. Se a plataforma não expuser
o renderer, a execução da ferramenta continua sendo julgada pelo receipt real, sem simulação.

---

## 18. Preflight canônico da Voz — fonte, ferramentas e recuperação de rota

A superfície Voice herda o mesmo gate de consumo da CentralDark. Texto falado ou
ponteiro colado **não vira autoridade por si só**. Antes de negar capacidade,
responder de memória ou investigar do zero, a Voz resolve a fonte canônica,
reaproveita aprendizado existente e tenta a ferramenta/rota autorizada disponível.

```text
VOICE_CANONICAL_CONSUMPTION_PREFLIGHT=true
VOICE_MAIN_IS_CANONICAL_SOURCE=true
VOICE_POINTER_TEXT_IS_NOT_SOURCE=true
VOICE_CONSULTAR_CANONICO_ANTECEDE_INVESTIGAR=true
VOICE_REPLAY_BEFORE_REDISCOVERY=true
VOICE_TOOL_AVAILABLE_MUST_BE_ATTEMPTED_BEFORE_UNKNOWN=true
VOICE_UNKNOWN_WITH_MEASUREMENT_ROUTE=FAIL_CLOSED
VOICE_NO_PAPAGAIO_FALLBACK=true
```

Ordem mínima quando a Voz entra em sessão operacional:

```text
VOICE_INPUT
→ INVENTARIAR_FERRAMENTAS_E_ROTAS_AUTORIZADAS
→ LER ServerVpss/CentralDark@main
→ SOUL-SOL.md
→ LEIA-ME-IA.md
→ AGENTS.md
→ .agents/library-index.json
→ docs/CONSCIENCIA/APRENDIZADOS.md
→ REPLAY_APRENDIZADO_RELEVANTE
→ NORMALIZAR_INTENCAO
→ SELECIONAR_TOOL_REAL
→ EXECUTAR/MEDIR
→ RECEIPT/RASTRO
→ RESPOSTA_FALADA_COMPRIMIDA
```

### Recuperação de falha de roteamento de ferramenta

Falha do invocador/recipient não é prova de que o conector ou a capability não existem.

```text
VOICE_TOOL_ROUTING_ERROR != CAPABILITY_UNAVAILABLE
INVALID_RECIPIENT != CONNECTOR_UNAVAILABLE
CONNECTOR_ALIAS_FAILURE != TOOL_ABSENT
VOICE_INVALID_RECIPIENT_REDISCOVER_ROUTE=true
VOICE_REDISCOVER_AVAILABLE_CONNECTOR_BEFORE_DENIAL=true
VOICE_RETRY_AUTHORIZED_ROUTE_AFTER_ROUTING_ERROR=true
VOICE_MUST_NOT_CLAIM_CANNOT_EXECUTE_WHEN_AUTHORIZED_ROUTE_EXISTS=true
```

Fluxo de recuperação:

```text
TOOL_CALL_ROUTING_ERROR
→ CLASSIFICAR_COMO_TRANSPORT_OR_BINDING_FAILURE
→ INVENTARIAR_TOOLS/CONNECTORS_ATUAIS
→ RESOLVER_OWNER/ALIAS_CORRETO
→ RETENTAR_PELO_CAMINHO_AUTORIZADO
→ MEDIR_EFEITO
→ SE_SUCESSO: RECEIPT
→ SE_TODAS_ROTAS_FALHAREM: BLOCKER_EXATO
```

Caso observado em 2026-09-29: uma chamada de voz tentou um recipient `GitHub`
inválido e caiu em resposta narrativa de incapacidade. Na mesma sessão, o conector
GitHub real foi invocado corretamente e retornou PRs. Portanto:

```text
OBSERVED_FAILURE_SIGNATURE=VOICE_INVALID_RECIPIENT_THEN_FALSE_CAPABILITY_DENIAL
CAUSE_CLASS=ROUTING_BINDING_FAILURE
CORRECTION=REDISCOVER_REAL_CONNECTOR_AND_RETRY
COUNTERPROOF=GITHUB_CONNECTOR_SUCCEEDED_IN_SAME_SESSION
```

A lei de rastro continua obrigatória para writes:

```text
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
LEDGER_1562_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
```
