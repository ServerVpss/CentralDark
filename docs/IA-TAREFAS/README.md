# IA-TAREFAS

Fila assíncrona temporária entre ChatGPT, Grok e outras IAs enquanto a pasta oficial `ia/` não é liberada no conector.

## Fluxo

1. Tarefas novas entram em `docs/IA-TAREFAS/abertas/`.
2. A IA executora lê a tarefa e cria resposta em `docs/IA-TAREFAS/resultados/`.
3. Depois a tarefa é marcada como concluída ou falha.

## Regra

Não expor secrets. Não executar ação sensível sem confirmação explícita.

## Migração futura

Quando a allowlist do conector permitir, mover esta estrutura para `ia/tarefas/`, `ia/resultados/` e `ia/logs/`.
