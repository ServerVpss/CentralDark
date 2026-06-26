---
name: Atualização do Mega Painel consolidada (1 commit por turno)
description: Nunca disparar múltiplas atualizações pequenas no painel-data.json durante o mesmo turno — consolidar tudo numa única chamada ao final
type: preference
---

# Regra: 1 commit de painel por turno, sempre no fim

O usuário reclamou de poluição no chat com vários cards `chore(painel): ...`
em sequência (ex.: "IA atualiza painel — atualização" + "registrar push" +
"IA atualiza painel — atualização" de novo). Causa: a IA estava chamando
`mcp_custom_z0d0P--atualizar_painel` várias vezes ao longo do mesmo turno.

## Como aplicar

1. **Acumular mentalmente** todas as mudanças relevantes (eventos, marcos,
   progresso, áreas afetadas) ao longo da execução da tarefa.
2. **Chamar `atualizar_painel` UMA ÚNICA VEZ**, no final do turno, com o
   resumo consolidado de tudo que aconteceu.
3. Nunca chamar `atualizar_painel` no meio do turno "pra registrar progresso
   parcial". Se a tarefa for muito longa, registrar marco intermediário só
   se o usuário pedir explicitamente.
4. Evitar também `vps_run_once_script` que toque em `painel-data.json` —
   passar pelo fluxo oficial (`atualizar_painel`) que já consolida.

## Por quê

Cada chamada vira um commit + um card de PR no chat. Múltiplas chamadas =
chat poluído e histórico do repo cheio de ruído. Um commit consolidado por
turno é suficiente — o painel reflete em menos de 30s de qualquer jeito.
