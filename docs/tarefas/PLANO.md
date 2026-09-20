# Plano da fila de tarefas

## Feito

- Estrutura base em português definida.
- Fila temporária em `docs/tarefas/` escolhida por ser aceita pelo conector atual.

## Próximos passos

1. Criar monitor em Python.
2. Criar tarefa de handshake.
3. Ativar o monitor via PM2 quando o usuário confirmar.
4. Validar resultado criado em `docs/tarefas/resultados/`.
5. Depois migrar para `ia/tarefas/` quando a allowlist permitir.

## Ponto de parada

Antes de criar ou iniciar serviço PM2, pedir confirmação objetiva ao usuário.
