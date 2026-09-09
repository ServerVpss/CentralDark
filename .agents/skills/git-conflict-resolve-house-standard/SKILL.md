---
name: git-conflict-resolve-house-standard
description: Padrão único da Casa para detectar e resolver conflito de PR (dependabot ou humano). Todo PR aberto passa pelo radar global; não criar segundo resolvedor nem fazer merge manual fora deste padrão.
metadata:
  type: operational
  version: "1.2"
  owner: SEGREDO/CHEFE
---

# Conflito de PR — padrão único da Casa

Owner do motor: `scripts/dependabot/resolve-conflicts.sh`
Radar global: `scripts/dependabot/reconcile-open-prs.sh`
Gatilho: `.github/workflows/dependabot-auto-merge.yml`

O nome histórico `dependabot` permanece por compatibilidade/proveniência. A função do radar é **global do repositório**: nenhum PR aberto, humano ou bot, deve ficar invisível ao circuito de reconciliação.

```text
ONE_CONFLICT_ENGINE=true
ALL_OPEN_PRS_PASS_GLOBAL_RADAR=true
DEPENDABOT_SPECIALIZATION != SECOND_SYSTEM
HUMAN_PR_AUTO_CONTENT_RESOLUTION=false
UNKNOWN != PASS
```

Se aparecer um segundo resolvedor, ele é o errado. Este se atualiza; não se duplica.

## 1. Radar global antes da resolução

```text
PR_OPEN_OR_UPDATED
→ RADAR_GLOBAL
→ MEASURE MAIN + HEAD + AUTHOR + BASE + MERGEABILITY
→ UPDATE_BRANCH quando same-repo e seguro
→ REMEASURE
→ CONFLICT?
   → DEPENDABOT: resolver determinístico especializado
   → HUMANO/OUTRO: medir conflitos + receipt + Writer semântico fail-closed
→ SAME_HEAD_TEST
→ COUNTERPROOF
```

O radar é repositório-global, não “um job por PR Dependabot”. O job especializado de auto-merge continua exclusivo do Dependabot; isso não impede que PRs humanos atravessem o mesmo radar de conflitos.

## 1.1 Drift material antes de update-branch

Antes de chamar update-branch, rebase ou merge porque a main andou, classificar o delta:

```text
MAIN_ADVANCED != PROBLEMA
BEHIND_TOTAL = TELEMETRIA
BEHIND_TOUCHING_ACTIVE_SCOPE = RELEVANCIA
MATERIAL_BEHIND = DECISAO

MAIN_CHANGED
→ CHECKER
→ MATERIAL_TO_ACTIVE_SCOPE?
   → NAO: IGNORE_AND_CONTINUE_PREVIOUS_FLOW
   → SIM: RECONCILE_OR_REMEASURE
   → UNKNOWN: MEASURE_NOT_PASS
```

A main so vira acao quando tocar escopo ativo, owner, contrato, gate, runner, dependencia, conflito real ou fix requerido pelo PR. Caso contrario, o fluxo anterior continua e o HEAD do PR nao deve ser reiniciado so por contagem de behind.


## 2. A regra que quase ninguém acerta

O motor está na branch do PR e faz `git merge origin/main`. Logo:

```text
--ours    = lado do PR    (HEAD)
--theirs  = lado da main  (MERGE_HEAD)
```

Isso é contraintuitivo e já custou caro: a versão anterior do motor tinha comentários invertidos em relação ao código — dizia “mantém main” e usava `--ours`, que aceita o PR.

```text
FAIL_CLOSED_ESCRITO != FAIL_CLOSED_IMPLEMENTADO
```

## 3. Política por classe de PR

### Dependabot

| Caminho | Lado que vence | Por quê |
|---|---|---|
| `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` — em qualquer diretório | **PR** (`--ours`) | o PR é o bump; manter a main aqui apaga o motivo do PR |
| todo o resto | **main** (`--theirs`) | fail-closed: PR automático não promove código canônico sozinho |

### PR humano / não-Dependabot

O motor **não escolhe conteúdo automaticamente**. Ele reproduz o merge em worktree isolado, lista cada path em conflito, aborta o merge e devolve:

```text
HUMAN_CONFLICT_AUTO_RESOLUTION=BLOCKED_FAIL_CLOSED
NEXT_CURSOR=SEMANTIC_WRITER_RECONCILE
PR_BRANCH_WRITE=0
DIRECT_MAIN_WRITE=0
```

O radar deixa receipt idempotente no próprio PR e aplica `🔄 GIT-DIVERGÊNCIA` quando a label existir. O Writer do escopo reconcilia o significado; depois os mesmos gates medem o HEAD novo.

## 4. Fluxo canônico

```text
PR abre/anda
→ radar global dispara
→ main/head/mergeability medidos
→ classificar MATERIAL_BEHIND
→ update-branch/rebase somente se MATERIAL_DRIFT ou UNKNOWN medido exigir
→ conflito passa pelo motor único
→ Writer semântico só quando necessário
→ checks no mesmo HEAD
→ contraprova
→ squash/promoção apenas pela política aplicável
```

Na mão, quando o runner estiver fora:

```bash
ssh Segredo-VPS "cd /root/CentralDark && PR_KIND=dependabot PR_HEAD_REF=<branch> bash scripts/dependabot/resolve-conflicts.sh <PR>"
```

Para PR humano, o modo seguro é somente medir/listar:

```bash
ssh Segredo-VPS "cd /root/CentralDark && PR_KIND=human PR_HEAD_REF=<branch> bash scripts/dependabot/resolve-conflicts.sh <PR>"
```

## 5. Regras de ferro

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != CI_PASS
SKIPPED != PASS
CONFLICT_SEEN != CONFLICT_RESOLVED
```

- Não criar segundo script de conflito.
- Não `force push` em `main`.
- `NO_CONFLICT` significa apenas que naquele instante não havia divergência.
- Se a main avançar, classificar materialidade antes de mexer no HEAD; behind total sozinho é telemetria.
- PR humano não recebe resolução cega de arquivos conflitantes.
- Job skipped por filtro especializado não significa que o PR saiu do radar global.
- Squash é padrão de promoção quando aplicável; checks continuam sendo evidência, não decoração.

## 6. Armadilhas registradas

1. **`--ours`/`--theirs` invertidos.** Sempre reprovar a semântica quando a política mudar.
2. **Reinjetar bump por nome de branch.** O manifesto do próprio PR é a fonte do bump, não inferência do branch name.
3. **Lockfile único = conflito em cadeia.** Agrupamento Dependabot reduz colisões; radar global continua medindo todas.
4. **Radar especializado confundido com radar global.** O job de auto-merge é Dependabot-only; o radar de conflitos não pode ser Dependabot-only.
5. **Resolver PR humano com winner automático.** Proibido: conflito semântico humano exige Writer do escopo.

## 7. Receipt mínimo do radar

```text
PR_NUMBER
AUTHOR
BASE_REF
HEAD_REF
HEAD_SHA
MAIN_SHA
MERGEABILITY
CONFLICT_CLASS
ENGINE
WRITER_REQUIRED
NEXT_CURSOR
```

Para conflito humano, o comentário no PR é proveniência/ledger, nunca fonte da verdade.

## 8. Adaptação

Realidade nova (outro gerenciador, lockfile, tipo de PR ou regra de conflito) atualiza **este arquivo, este radar e este motor no lugar**. Nunca um segundo sistema.

## 9. Evolução planejada — inteligência adaptativa por trás do Hub, sem perder o caminho determinístico

A direção autorizada pelo SEGREDO/CHEFE é integrar, quando o Hub/API estiverem realmente online e medidos, uma camada de inteligência da própria CentralDark atrás das superfícies de revisão e dependências. A superfície chamada Rabbit e o fluxo de Dependabot continuam sendo partes do organismo da Casa; nenhum fornecedor, modelo ou engine externa recebe autoridade arquitetural.

```text
RABBIT_SURFACE
+ DEPENDABOT_SURFACE
+ RADAR_GLOBAL
→ CENTRALDARK_HUB/API
→ CAPABILITY/MODEL_ROUTER
→ FRONTIER_FIRST
→ FALLBACK_DOWN_CHAIN
→ SAME_CONFLICT_ENGINE
→ TEST
→ COUNTERPROOF
→ RECEIPT
```

### 9.1 Determinismo primeiro

O objetivo não é chamar IA em todo conflito. O primeiro caminho continua obrigatório e reproduzível:

```text
CONFLICT
→ FINGERPRINT
→ KNOWN_RULE?
   → YES: MINIMAL_DETERMINISTIC_FIX
          → TEST
          → COUNTERPROOF
          → RECEIPT
          → AI_CALLED=0
   → NO: UNKNOWN_CONFLICT
```

Conflito conhecido não deve voltar a depender de modelo, chat ou disponibilidade externa.

### 9.2 IA somente como escalada de conflito desconhecido

Quando a assinatura ainda não tiver regra provada, o Hub pode convocar uma capacidade de análise. A escolha de modelo pertence ao roteador da CentralDark, não ao workflow de conflito.

```text
UNKNOWN_CONFLICT
→ HUB_CAPABILITY_REQUEST
→ AVAILABLE_MODELS_MEASURED
→ FRONTIER_MODEL_FIRST
→ FALLBACK_ORDERED_BY_CAPABILITY
→ ANALYZE_CAUSE
→ PROPOSE_MINIMAL_FIX
→ APPLY_ONLY_WITH_WRITER/AUTHORITY
→ TEST_ON_EXACT_HEAD
→ COUNTERPROOF
```

Se o modelo de fronteira estiver indisponível, o roteador desce a cadeia por capacidade comprovada. `MODEL_UNAVAILABLE != MISSION_FAILURE` quando existe fallback autorizado e equivalente; `UNKNOWN != PASS` continua valendo.

### 9.3 Aprendizado obrigatório após uma correção nova

Uma correção resolvida por IA não fecha a missão sozinha. Ela só vira aprendizado da Casa quando for transferida para o caminho determinístico:

```text
NEW_CONFLICT_CLASS
→ AI/HUMAN_ANALYSIS
→ MINIMAL_FIX_PROVED
→ EXTRACT_CONFLICT_FINGERPRINT
→ CHOOSE_EXISTING_OWNER
   → dependabot.yml        quando a causa for geração/agrupamento de updates
   → .coderabbit.yaml      quando a causa for regra/sinal de revisão
   → reconcile-open-prs.sh quando a causa for detecção/varredura
   → resolve-conflicts.sh  quando a causa for resolução determinística
   → SKILL.md              para contrato/política/armadilha aprendida
→ ADD/UPDATE TEST FIXTURE
→ REPRODUCE SAME CLASS
→ PROVE AI_CALLED=0
→ RECEIPT
```

Lei:

```text
AI_FIXED_ONCE
+ SAME_CLASS_REQUIRES_AI_AGAIN
= LEARNING_NOT_TRANSFERRED
```

### 9.4 Função dos YAMLs — trabalham juntos, não se substituem

`.github/dependabot.yml` continua dono da política de abertura, agrupamento e classe das atualizações de dependência. `.coderabbit.yaml` continua dono da superfície de revisão/sinais. O Radar Global mede todos os PRs. O resolver continua sendo o único mutator determinístico de conflito.

```text
DEPENDABOT_YAML = PRODUZ + AGRUPA + CLASSIFICA UPDATES
RABBIT_YAML     = OBSERVA + REVISA + SINALIZA CAUSA/RISCO
RADAR           = DETECTA GLOBALMENTE
RESOLVER        = CORRIGE DETERMINISTICAMENTE
HUB/API         = ROTEIA CAPACIDADE QUANDO ESCALADA FOR NECESSÁRIA
MODEL           = SUBSTITUÍVEL
REALITY_JUDGE   = VEREDITO
```

O fato de a superfície Rabbit poder usar inteligência da própria CentralDark no futuro **não autoriza** ligar hoje autofix, resolução de conflito ou MCP externo sem Hub/API online, allowlist, writer lease, testes e receipt.

### 9.5 Fronteira atual de prova

```text
RADAR_GLOBAL_DESIGN=PROVED_ON_PR_BRANCH
ONE_CONFLICT_ENGINE=PROVED_BY_REPO_CONTRACT
RABBIT_CURRENT_CONFIG=REVIEW_ONLY
DEPENDABOT_CURRENT_CONFIG=UPDATE_POLICY
CENTRALDARK_HUB_AI_CONFLICT_ROUTING=PLANNED_NOT_EXECUTED
FRONTIER_FIRST_MODEL_ROUTING=INTENT_LOCKED_NOT_RUNTIME_PROVEN
AUTONOMOUS_AI_SELF_FIX=NOT_ENABLED
```

Até o Hub estar online e a rota real ser medida, esta seção é contrato de evolução, não afirmação de runtime.
