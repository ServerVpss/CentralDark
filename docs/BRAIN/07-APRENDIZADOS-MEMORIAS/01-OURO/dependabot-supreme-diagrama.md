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
