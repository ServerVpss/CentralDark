# Registro Guardiao Decisor v3

Data: 2026-06-26
Responsavel: GPT Orquestrador CentralDark

## Decisao

O Guardiao deve continuar em modo propor. Nenhuma acao automatica de mover, limpar ou reorganizar arquivo deve ser executada.

O filtro de decisao deve atuar antes de qualquer notificacao no Telegram.

## Estado verificado

- O arquivo infra/guardiao/analista/decisor.py existe.
- O fluxo infra/guardiao/analista/analista.py ja importa decidir.
- O Guardiao tem trava de modo automatico ate 08/07/2026.
- A camada atual precisa de calibragem para reduzir repeticao e baixa qualidade.

## Politica operacional

- Critico passa.
- Proposta comum so passa com score alto.
- Proposta repetida deve ser bloqueada por cache temporal.
- Evento agrupado nao deve virar spam.
- Telegram deve receber somente proposta util.

## Pendencias

- Aplicar ajuste final de threshold no codigo/configuracao.
- Validar em branch antes de qualquer merge.
- Reinicio de PM2 somente com aprovacao humana.
- Notion indisponivel no MCP enquanto a credencial nao estiver configurada.
