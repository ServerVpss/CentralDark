---
centraldark_note_schema: "brain07.v1"
centraldark_category: "01-OURO"
centraldark_kind: "OURO_REUTILIZAVEL_COM_PROVA_CONTEXTUAL"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Hooks do Sistema Dependabot — Ação Automática"
centraldark_agent_recall: "Reutilizar tecnica, autoria, limites e evidencia no owner; nao presumir runtime atual."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["gojo-seis-olhos","whis-orientacao","vegetto-gogeta-convergencia","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_blob_sha: "4ce80c606a7e59bc1fd311013faecd849e20f891"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Integration"
centraldark_self_related: ["Self-Monitoring","Self-Auditing"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-integration/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-monitoring/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-auditing/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---
# Hooks do Sistema Dependabot — Ação Automática

## Gatilhos Automáticos (Integrar ao .github/workflows/)

### Quando um PR do dependabot é aberto:
1. Workflow dependabot-auto-merge.yml é acionado
2. Coleta metadados do PR
3. Se mergeable=true: habilita auto-merge via GraphQL
4. Se mergeable=false: dispara resolve-conflicts.sh
5. Se minor: comenta que aguarda revisão

### Quando um PR do dependabot é atualizado:
1. Workflow reage ao synchronize
2. Reavalia mergeability
3. Se conflito apareceu: resolve automaticamente
4. Se conflito sumiu: habilita auto-merge

### Quando o runner self-hosted está offline:
1. Dependabot não consegue resolver conflitos localmente
2. PR fica pendente até runner voltar
3. Monitoramento alerta sobre runner offline

## Monitoramento Automático
- Script: scripts/dependabot/dependabot-supreme-monitor.sh
- Executar a cada 5 minutos via cron
- Verifica: PRs abertos, workflow runs, status do runner

## Alerta de Falha
Se o workflow falhar:
1. Log é gerado no GitHub Actions
2. ERRO 422 é detectado (repositório privado bloqueia reviews)
3. Solução: remover passo APPROVE do workflow (já aplicado)

## Estado da Implementação
✅ Workflow dependabot-auto-merge.yml corrigido
✅ Script resolve-conflicts.sh funcional
✅ Script de monitoramento criado
✅ Documentação completa
