# Regras Críticas de Workflow

## Extend, Never Replace

> "Não faça V3, V4, etc. Atualize e melhore o que já existe!"

Quando o CHEFE solicitar revisão de planejamento de infraestrutura ou qualquer mudança em produção:

1. **Nunca substitua** um sistema/componente existente por uma nova versão (V2, V3, V4, etc.)
2. **Sempre estenda** o que já existe, mantendo compatibilidade e preservando banco de dados e arquitetura legado
3. **Zero regressão** no que já funciona é obrigatório
4. Toda alteração deve ser uma **extensão segura**, nunca uma substituição

Aplicação:
- Ao planejar mudanças em HERMES-CORE, Hub, Inventory, ou qualquer módulo existente
- Ao receber solicitações de "criar novo X" quando X já existe
- Ao avaliar gaps em proof plans (estender owners existentes, não criar novos sistemas)

Exemplo: Se o House Inventory precisa de nova capacidade, estenda `house-inventory-core.mjs` em vez de criar `house-inventory-v2`.

## Continue em Loop até 100%

> "Prossig em loop até ter 100%, não quero você de novo aqui!"

Quando uma missão é dada:
1. **Não pare** em gates artificiais (PR criado, commit feito, etc.)
2. **Execute continuamente** até fixed point ou até que o humano diga para parar
3. **Reancorar** quando o estado mudar (main avançou, PR mergeou, etc.) e continuar
4. **Tic-tac para onde devia** — sem girar bonito, mas sem parar cedo demais

Exemplo: Se a missão é "reconciliação + deploy", não pare após criar o PR. Faça merge, deploy, e prove o resultado.

## "PROSSEGA PADRÃO" — LOOP ATÉ 100% (hard rule, 2026-08-28)

Quando o CHEFE diz "prosiga padroes" ou "prossig em loop até ter 100%":

1. **Não pare** em gates artificiais (PR criado, commit feito, merge feito).
2. **Execute continuamente** até fixed point: PR → merge → deploy → health check → próximo PR.
3. **Reancorar** quando o estado mudar (main avançou, PR mergeou) e continuar.
4. **Squash merge imediato** quando `mergeable=true` + CHEFE autorizou ("prosiga"):
   ```bash
   gh pr ready <num>  # se draft
   gh pr merge <num> --squash --delete-branch
   ```
5. **Não esperar CI** se o CHEFE já mandou prosseguir. Checks pendentes não bloqueiam squash.
6. **Deploy após merge**: alinhar VPS com main + restart PM2 + health check.
7. **Loop**: enquanto houver PRs abertos ou trabalho pendente, continue.

Exemplo real (2026-08-28):
- PR #1335 (AIOS GOLD ASSAY) → ready → squash merge → b15ffe980
- PR #1336 (fix hermes-core) → já mergeado → c2e07f6ea
- VPS main alinhada → pm2 restart all → 19 online → MCP health ok
- Loop continua enquanto houver trabalho.

## Filtro Anti-Regressão para Infra

Antes de qualquer planejamento de infraestrutura:
1. **Medir** o estado real do alvo
2. **Abrir owners** e consumidores existentes
3. **Classificar** cada delta como REUSE | EXTEND | GAP_REAL | REJECT
4. **Bloquear** criação de segundo sistema, segundo engine, segundo orquestrador
5. **Exigir** que toda mudança seja extensão segura, nunca substituição
