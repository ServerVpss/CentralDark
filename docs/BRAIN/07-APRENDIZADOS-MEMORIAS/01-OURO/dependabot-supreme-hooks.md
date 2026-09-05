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
