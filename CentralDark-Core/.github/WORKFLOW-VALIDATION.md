# Validação do Workflow Dependabot Auto-Merge

## Data
2026-09-04

## Checklist de Validação

### Estrutura YAML
- [x] Nome do workflow: "Dependabot Auto-Merge (só patches)"
- [x] Trigger: pull_request (opened, reopened, synchronize, ready_for_review)
- [x] Permissões: contents: write, pull-requests: write
- [x] Concurrency group: dependabot-auto-merge-${{ github.event.pull_request.number }}
- [x] Job: auto-merge-patch
- [x] Runs-on: [self-hosted, Linux]

### Steps Validados
- [x] "Sair limpo se não for Dependabot" — SKIP=1 se não for dependabot
- [x] "Coletar metadados do PR" — dependabot/fetch-metadata@v3
- [x] "Detectar stale/conflitado" — verifica mergeable e dispara RESOLVE_REQUESTED
- [x] "Checkout do SHA exato" — só executa se RESOLVE_REQUESTED=1
- [x] "Resolver conflito" — executa resolve-conflicts.sh
- [x] "Habilitar auto-merge" — GraphQL mutation para patches (sem review manual)
- [x] "Comentar quando for MINOR" — avisa que aguarda revisão humana

### Remoções
- [x] Passo "Aprovar PR" removido (causava erro 422 em repositório privado)

### Validações Externas
- [x] Sintaxe YAML válida (testada com Python yaml.safe_load)
- [x] Permissões de arquivo corretas (644)
- [x] Workflows GitHub Actions disponíveis na interface

## Status
✅ VALIDADO — Workflow pronto para execução
