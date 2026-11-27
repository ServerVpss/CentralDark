# Tarefas entre IAs

Esta pasta é a fila simples de comunicação assíncrona entre ChatGPT, Grok, Lovable e outros agentes.

## Estrutura

```txt
docs/tarefas/
├── abertas/        tarefas esperando execução
├── em_andamento/   tarefas que já foram assumidas
├── concluidas/     tarefas finalizadas com sucesso
├── com_erro/       tarefas que falharam
├── resultados/     respostas geradas pelas IAs
└── logs/           registros sanitizados do monitor
```

## Fluxo

1. Uma IA cria um arquivo em `abertas/`.
2. O monitor pega a tarefa mais antiga.
3. A tarefa vai para `em_andamento/`.
4. O executor gera um resultado em `resultados/`.
5. A tarefa vai para `concluidas/` ou `com_erro/`.

## Regra de segurança

Nunca expor tokens, senhas, cookies, chaves, sessões ou dados privados.
Ações sensíveis precisam de confirmação explícita antes de executar.

## Caminho futuro

Quando a estrutura principal do projeto estiver pronta, esta pasta pode migrar para `ia/tarefas/`.
