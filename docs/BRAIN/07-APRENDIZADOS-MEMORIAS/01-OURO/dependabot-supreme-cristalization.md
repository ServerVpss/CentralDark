---
centraldark_note_schema: "brain07.v1"
centraldark_category: "01-OURO"
centraldark_kind: "OURO_REUTILIZAVEL_COM_PROVA_CONTEXTUAL"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Sistema Dependabot — Cristalização Suprema"
centraldark_agent_recall: "Reutilizar tecnica, autoria, limites e evidencia no owner; nao presumir runtime atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["gojo-seis-olhos","whis-orientacao","vegetto-gogeta-convergencia","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "fd01d05748b596b0f59dd84a5640a0e73e3bc85a"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Learning"
centraldark_self_related: ["Self-Memory","Self-Documentation"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-learning/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-memory/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-documentation/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---
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
