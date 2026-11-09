---
centraldark_note_schema: "brain07.v1"
centraldark_category: "01-OURO"
centraldark_kind: "OURO_REUTILIZAVEL_COM_PROVA_CONTEXTUAL"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Diagrama do Sistema Dependabot Supremo"
centraldark_agent_recall: "Reutilizar tecnica, autoria, limites e evidencia no owner; nao presumir runtime atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["gojo-seis-olhos","whis-orientacao","vegetto-gogeta-convergencia","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "cd14ac959f7761a550a4d06f77aa5ef8843647f1"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Modeling"
centraldark_self_related: ["Self-Analysis","Self-Integration"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-modeling/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-analysis/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-integration/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---
# Diagrama do Sistema Dependabot Supremo

## Fluxo Principal

```
dependabot.yml
    │
    ├── npm (root) ──────────► PR de dependência ──► dependabot-auto-merge.yml
    ├── npm (Bolt/source) ──► PR de dependência ──► dependabot-auto-merge.yml
    ├── pip (Bolt/docs) ─────► PR de dependência ──► dependabot-auto-merge.yml
    └── github-actions ──────► PR de ação ────────► dependabot-auto-merge.yml
                                    │
                                    ├── meta: fetch-metadata@v3
                                    │
                                    ├── mergeable=true ──► enablePullRequestAutoMerge (GraphQL)
                                    │
                                    ├── mergeable=false ──► RESOLVE_REQUESTED=1
                                    │                           │
                                    │                           └──► resolve-conflicts.sh
                                    │                                   │
                                    │                                   ├── package.json/lock: usa lado PR (bump)
                                    │                                   └── outros: usa lado main
                                    │
                                    └── update-type=minor ──► Comentário "aguarda revisão humana"
```

## Componentes

### dependabot.yml
```
┌─────────────────────────────────────────┐
│ 4 ecossistemas configurados:            │
│  - npm (root)                           │
│  - npm (Bolt/source)                    │
│  - pip (Bolt/docs)                      │
│  - github-actions                       │
│                                         │
│ Labels: AUTO, GIT, PERMITO-SEGREDO,    │
│         AGENTE-HERMES, MELHORIA,       │
│         IA-EXECUTAR                     │
│                                         │
│ Agrupamentos para evitar conflitos:     │
│  - radix-ui: @radix-ui/*               │
│  - bolt-source-security: security      │
│  - bolt-source-deps: version updates   │
│  - docs-security: security             │
│  - docs-deps: version updates          │
│  - actions-all: minor+patch            │
└─────────────────────────────────────────┘
```

### dependabot-auto-merge.yml (CORRIGIDO)
```
┌─────────────────────────────────────────┐
│ Job: auto-merge-patch                   │
│ Runs-on: [self-hosted, Linux]          │
│                                         │
│ Steps:                                  │
│ 1. SKIP=1 se não for dependabot        │
│ 2. dependabot/fetch-metadata@v3        │
│ 3. Verifica mergeable (API)            │
│    - false → RESOLVE_REQUESTED=1      │
│    - null  → aguarda cálculo           │
│    - true  → segue para auto-merge     │
│ 4. Se RESOLVE_REQUESTED=1:             │
│    - Checkout SHA exato                │
│    - Executa resolve-conflicts.sh      │
│ 5. Se patch e sem conflito:            │
│    - enablePullRequestAutoMerge (GraphQL)│
│ 6. Se minor:                           │
│    - Comenta "aguarda revisão"         │
│                                         │
│ REMOVIDO: passo "Aprovar PR" (422)    │
└─────────────────────────────────────────┘
```

### resolve-conflicts.sh
```
┌─────────────────────────────────────────┐
│ Entrada: PR_NUMBER                      │
│                                         │
│ 1. Fetch origin main                    │
│ 2. Fetch PR branch                      │
│ 3. Merge --no-commit origin/main       │
│    - Se CONFLICT:                       │
│      - package.json/lock: --ours (PR) │
│      - outros: --theirs (main)        │
│    - Se NO_CONFLICT: aborta merge     │
│ 4. Commit --no-edit                    │
│ 5. Push branch resolvida              │
│                                         │
│ Semântica:                              │
│  - --ours = lado do PR (HEAD)         │
│  - --theirs = lado da main            │
└─────────────────────────────────────────┘
```

## Histórico de Execução

### PR #1351 (SUCESSO)
- 47 updates em Bolt/source
- Workflow executou com sucesso
- Auto-merge habilitado
- Merge realizado

### PR #1341 (TESTE DE PROVA)
- Bump de zod (simulação)
- Motor de conflito testado
- Resultado: NO_CONFLICT determinístico

### PR #1321/1318/1315 (RUNNER OFFLINE→ONLINE)
- Runner self-hosted offline
- PRs ficaram pendentes
- Runner retornou online
- Resolução automática

### 2026-09-04 (CORREÇÃO 422)
- Erro: "GitHub Actions is not permitted to approve pull requests"
- Causa: repositório privado bloqueia reviews via API
- Solução: removido passo APPROVE do workflow
- Status: CORRIGIDO
```

## Estado Atual
```
┌─────────────────────────────────────────┐
│ SISTEMA OPERACIONAL                    │
│                                        │
│ ✅ dependabot.yml — configurado        │
│ ✅ dependabot-auto-merge.yml — corrigido│
│ ✅ resolve-conflicts.sh — funcional   │
│ ✅ Script de monitoramento — criado   │
│ ✅ Documentação — completa            │
│ ✅ Teste de integração — criado      │
│ ✅ Validação YAML — criada           │
│                                        │
│ AGUARDANDO:                             │
│  - Próximo PR dependabot para validar │
│  - Execução periódica do monitor      │
└─────────────────────────────────────────┘
```
