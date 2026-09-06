# Sistema Dependabot — Cristalização Suprema

## Visão Geral
O sistema Dependabot da CentralDark opera com autonomia total via GitHub Actions.
Quatro ecossistemas são monitorados: npm (root), npm (Bolt/source), pip (Bolt/docs), github-actions.

## Componentes

### 1. dependabot.yml
Configuração dos ecossistemas com agrupamentos para evitar conflitos em cadeia.
Labels canônicos aplicados a todos os PRs: AUTO, GIT, PERMITO-SEGREDO, AGENTE-HERMES, MELHORIA, IA-EXECUTAR.

### 2. dependabot-auto-merge.yml
Workflow de auto-merge que:
- Coleta metadados do PR via dependabot/fetch-metadata
- Detecta conflitos (mergeable=false) e dispara resolve-conflicts.sh
- Habilita auto-merge via GraphQL para patches
- Comenta quando é minor (aguardando revisão humana)

### 3. resolve-conflicts.sh
Script determinístico que resolve conflitos:
- Aceita lado do PR para package.json/lockfiles (mantém o bump)
- Aceita main para todos os outros arquivos (fail-closed)
- Faz commit e push da correção

## Histórico de Evolução
- PR #1351: 47 updates em Bolt/source (sucesso)
- PR #1341: Teste de prova do motor de conflito
- PR #1321/1318/1315: Runner offline→online
- 2026-09-04: Correção do erro 422 (removeu passo APPROVE)

## Estado Atual
✅ Workflow corrigido e operational
✅ Script resolve-conflicts.sh validado
✅ Monitor script criado
✅ Cristalização documentada
