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
