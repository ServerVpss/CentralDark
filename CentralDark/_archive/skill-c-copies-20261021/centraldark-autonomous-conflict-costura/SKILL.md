---
name: centraldark-autonomous-conflict-costura
description: Método reutilizável da CentralDark para resolução autônoma de conflitos Git/PR por intenção, com decisão CURRENT|INCOMING|BOTH|STRUCTURED|YELLOW, sem invocação manual de agente por conflito.
status: METHOD_ADAPTER
canonical_owner: .agents/skills/git-conflict-resolve-house-standard/SKILL.md
engine: scripts/dependabot/resolve-conflicts.sh
registry: scripts/dependabot/known-conflict-patterns.json
classifier: scripts/dependabot/classify-conflict.mjs
structured_resolver: scripts/dependabot/structured-conflict-resolver.mjs
both_resolver: scripts/dependabot/semantic-all-resolver.mjs
workflow: .github/workflows/dependabot-auto-merge.yml
proof_fixture: PR#1577
proof_replay: PR1577_BOT_REPLAY=PASS
proof_head: ba95780322b45a16a3950977a618a2e104dc178c
yellow_semantics: PROGRESS_BOUNDARY_NOT_FAILURE
owner_rule: THIS_SKILL_DOES_NOT_REPLACE_CANONICAL_CONFLICT_OWNER
---

# 🪡 CENTRALDARK — COSTURA AUTÔNOMA DE CONFLITOS

Este skill cristaliza o **método**. Ele não cria segundo resolvedor, segundo owner,
segunda política de merge ou Costura versionada.

O owner canônico continua:

`.agents/skills/git-conflict-resolve-house-standard/SKILL.md`

O motor continua:

`scripts/dependabot/resolve-conflicts.sh`

Este skill existe para tornar o método **portável, ensinável, auditável e
reutilizável** por Codex, Claude Code, Hermes, ChatGPT, CI ou qualquer engine
futura que consiga consumir o mesmo owner.

## 🎯 Fórmula núcleo

```text
CONFLICT_DETECTED
→ REMEASURE_CURRENT_PR_HEAD
→ REMEASURE_CURRENT_MAIN
→ LOAD_PRIMARY_INTENT_EVIDENCE
→ CLASSIFY_CONFLICT
→ DECIDE_CURRENT|INCOMING|BOTH|STRUCTURED|YELLOW
→ APPLY_DECISION
→ MARK_RESOLVED
→ VALIDATE_CHANGED_CONE
→ COMMIT_ON_PR_BRANCH
→ PUSH_NEW_PR_HEAD
→ SAME_HEAD_CHECKS
→ TIK_TAK_REENTER_ON_NEW_MAIN
```

## 🔘 Botões humanos ↔ ações do motor

No merge da branch do PR recebendo `main`:

```text
CURRENT  = PR / ours
INCOMING = main / theirs
```

| Decisão | Significado | Motor |
|---|---|---|
| `CURRENT` | preservar o delta do PR | `git checkout --ours -- <path>` |
| `INCOMING` | preservar a main CURRENT | `git checkout --theirs -- <path>` |
| `BOTH` | preservar dois deltas compatíveis | `semantic-all-resolver.mjs` |
| `STRUCTURED` | reconciliar estrutura por regra semântica provada | `structured-conflict-resolver.mjs` |
| `YELLOW` | evidência insuficiente/contradição não discriminada | **não pushar**; parar no próximo ponto útil |
| `Mark as resolved` | arquivo resolvido | `git add -- <path>` |
| `Commit merge` | registrar COSTURA na branch do PR | `git commit` + push da branch |

```text
BUTTON != POLICY
UI_LABEL != RESOLUTION_POLICY
ACCEPT_BOTH != BLIND_ACCEPT_BOTH
COMMIT_MERGE != MERGE_PULL_REQUEST
```

## 🧠 Autonomia é o diferencial

A execução normal não depende de um humano chamando um agente para cada conflito.

```text
AUTONOMOUS_CONFLICT_RESOLUTION=true
MANUAL_AGENT_INVOCATION_PER_CONFLICT=false
ONE_CONFLICT_OWNER=true
REUSE_PROVEN_PATTERN_FIRST=true
UNKNOWN_NEVER_INVENTS_GREEN=true
```

O sistema tenta resolver sozinho tudo que já possui regra comprovada. Quando um
caso novo ultrapassa sua evidência:

```text
UNKNOWN_OR_CONTRADICTORY
→ YELLOW
→ PRESERVE_STATE
→ NO_PUSH
→ HUMAN_OR_SPECIALIST_DISCRIMINANT
→ PROVE_RESOLUTION
→ CRYSTALLIZE_PATTERN
→ NEXT_OCCURRENCE_AUTONOMOUS
```

O amarelo é uma **fronteira de progresso**, não fracasso:

```text
YELLOW != PASS
YELLOW != FAILURE
YELLOW = PROGRESS_BOUNDARY_NOT_FAILURE
```

## 🔎 Como decidir sem agente manual por conflito

Ordem de decisão:

1. medir `PR_HEAD CURRENT` e `main CURRENT`;
2. consultar `known-conflict-patterns.json`;
3. identificar finalidade do PR e alterações concorrentes por commits/PR/owner;
4. reutilizar política já provada;
5. usar `CURRENT`, `INCOMING` ou `BOTH` quando a intenção for discriminável;
6. usar `STRUCTURED` quando o arquivo exige merge semântico de estrutura;
7. se nenhuma regra for suficientemente comprovada, retornar `YELLOW`.

A heurística nunca pode transformar semelhança visual ou concatenação possível
em prova semântica.

## 🧬 Aprendizado determinístico

Cada caso novo resolvido com prova vira capacidade futura do mesmo motor:

```text
YELLOW_CASE
→ INVESTIGATE_PRIMARY_SOURCES
→ RESOLVE_ONCE
→ TARGETED_TEST
→ COUNTERPROOF
→ SAME_HEAD
→ WRITE_PATTERN_TO_EXISTING_REGISTRY
→ REPLAY_OLD_CONFLICT
→ REPLAY_PASS
→ AUTONOMOUS_NEXT_TIME
```

Não criar script paralelo para cada ferida.

## 🧪 Fixture comprovada — PR #1577

O PR #1577 foi usado como bancada real.

Estado inicial:

```text
HEAD=ddac0b1fd6fe0a2e3cb270c8a718796967d04361
MERGEABLE=false
MERGE_STATE=dirty
CONFLICTS=8
```

A primeira resolução por intenção produziu:

```text
RESOLUTION_COMMIT=a3dea306caac3a7f01d1db0a80d7ae2325a14825
MERGEABLE_AFTER=true
```

As oito decisões foram cristalizadas no registry e depois o conflito histórico
foi reproduzido a partir do mesmo HEAD/base.

Replay autônomo pelo classificador atual:

```text
REPLAY_CONFLICTS=8
CURRENT=0
INCOMING=4
BOTH=2
STRUCTURED=2
YELLOW=0

REGISTRY_JSON=PASS
YAML=PASS
DIAGRAM_ROUTE_TESTS=6/6 PASS
PR1577_BOT_REPLAY=PASS
```

O replay é importante: `DOCUMENTED != EXECUTED`. O método só virou cristal
reutilizável depois de reproduzir o conflito antigo e resolvê-lo novamente sem
escolhas manuais.

## 🧩 Estratégias estruturadas já cristalizadas

`STRUCTURED` existe para casos em que nenhum dos três botões simples representa
sozinho a intenção correta.

Provas atuais:

```text
MERGE_JSON_PATTERNS_BY_ID_MAIN_FIRST
→ main CURRENT vence IDs/metadados duplicados
→ padrões exclusivos do PR sobrevivem
→ pattern_count é recalculado

MERGE_TOPLEVEL_YAML_KEY_FROM_PR_INTO_MAIN
→ main CURRENT é a base
→ chave top-level útil exclusiva do PR é preservada
→ YAML precisa continuar parseável
```

Essas estratégias pertencem ao registry/motor existente; este skill apenas
formaliza o método.

## 🧪 Contraprova mínima antes do push

```text
NO_UNMERGED_PATHS
NO_CONFLICT_MARKERS
DIFF_CHECK_CONFLICT_FILES
PARSE_OR_SYNTAX_WHEN_APPLICABLE
TARGETED_OWNER_TESTS_WHEN_AVAILABLE
NEW_HEAD_CREATED
SAME_HEAD_CI_REQUIRED
```

`SYNTAX_PASS != BEHAVIOR_PASS`. Teste de owner e SAME_HEAD continuam julgando
a promoção.

## ⏰ TIK-TAK

```text
MAIN_CURRENT
→ UPDATE_BRANCH
→ PR_HEAD_CURRENT
→ CONFLICT?
→ COSTURA
→ NEW_PR_HEAD
→ CHECKS_CURRENT_HEAD
→ MAIN_ADVANCES_AGAIN?
→ REENTER
```

O loop é orientado a eventos. Não promete latência zero.

## 🔗 Capacidades complementares do Dependabot

O mesmo workflow também pode:

- aprovar `action_required` de **workflow run** no HEAD CURRENT;
- a cada 30 minutos localizar runs vermelhos concluídos e pedir **Re-run all jobs**;
- devolver o resultado ao owner existente para continuar a COSTURA.

```text
WORKFLOW_RUN_APPROVAL != PR_REVIEW_APPROVAL
RERUN_REQUESTED != WORKFLOW_SUCCESS
UPDATE_BRANCH != PROMOTION
```

Essas capacidades complementam a COSTURA; não entram dentro da política de
decisão de conflito.

## 🔒 Cadeados

```text
COSTURA_NAME_ONLY=true
NO_VERSIONED_COSTURA=true
ONE_SYSTEM_ONLY=true
ONE_CONFLICT_OWNER=true
REUSE_BEFORE_CREATE=true
CURRENT > HISTORY
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
REALITY_IS_JUDGE=true
```

## 💎 Uso futuro

Para portar o método a outro repo/engine:

```text
KEEP_METHOD
→ REBIND_REPO_SPECIFIC_OWNER
→ BUILD_PATTERN_REGISTRY_FROM_PROVEN_CASES
→ REPLAY_FIXTURES
→ ENABLE_AUTONOMY
→ YELLOW_ON_UNKNOWN
```

O valor está na sequência verificável: **resolver o conhecido sozinho, parar no
desconhecido sem destruir estado, aprender uma vez com prova e reutilizar na
próxima ocorrência**.
