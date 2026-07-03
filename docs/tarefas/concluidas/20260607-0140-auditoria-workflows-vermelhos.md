---
id: 20260607-0140-auditoria-workflows-vermelhos
status: aberta
origem: chatgpt
destino: grok
risco: baixo
---

# Tarefa

Grok, faça uma auditoria SOMENTE LEITURA dos workflows do GitHub Actions que estão gerando runs vermelhos repetidos no repositório oficial `ServerVpss/CentralDark`.

## Contexto

O usuário está vendo muita sujeira vermelha no GitHub Actions. O deploy principal está funcionando, mas workflows auxiliares ligados a tarefas/monitor parecem estar falhando em commits de tarefas.

O ChatGPT observou que o workflow que mais aparece vermelho agora é:

```txt
.github/workflows/ativar-monitor-tarefas.yml
```

Exemplo recente:

```txt
display_title: tarefas: processar 20260607-0115-diagnostico-mcp-dns-conector
conclusion: failure
```

Também aparecem nomes como:

```txt
run-once-monitor-tarefas.yml
one-shot-vps-mcp-branding-apply.yml
```

## Objetivo

Descobrir a causa dos runs vermelhos e propor correção segura para parar de gerar vermelho novo.

## Verificar

1. Quais workflows estão falhando mais.
2. Se eles rodam em `push` quando deveriam rodar só manualmente.
3. Se são workflows antigos/auxiliares que ficaram duplicados agora que `monitor_tarefas` já roda no PM2.
4. Se algum workflow está tentando SSH, PM2 ou pull de forma desnecessária.
5. Se há conflito com o fluxo atual:

```txt
ChatGPT → docs/tarefas/abertas → monitor_tarefas PM2 → Grok → docs/tarefas/resultados → ChatGPT revisa
```

## Regras obrigatórias

- Somente leitura/análise.
- Não deletar runs.
- Não cancelar runs.
- Não editar workflows ainda.
- Não reiniciar serviços.
- Não mexer em secrets.
- Não mexer em Caddy, Docker, WuzAPI, WhatsApp, CRM, Gateway, banco ou domínio.
- Não usar `git add .`.
- Não expor credenciais, tokens, chaves, cookies, sessões ou connection strings.

## Responder

Use este formato:

```txt
============================================================
[GROK] AUDITORIA WORKFLOWS VERMELHOS FINALIZADA
============================================================
Status: Concluído / Com erro / Precisa de revisão
Resumo executivo: ...
Workflows que mais falham: ...
Causa provável: ...
Quais devem virar manual-only: ...
Quais podem continuar no push: ...
Quais devem ser mantidos mas não bloquear deploy: ...
Correção YAML sugerida: ...
O que NÃO apagar agora: ...
Plano seguro em 3 passos: ...
Aguardando decisão final do ChatGPT.
============================================================
```
