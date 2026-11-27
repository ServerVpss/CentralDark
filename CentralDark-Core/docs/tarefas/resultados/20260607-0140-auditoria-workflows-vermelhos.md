---
id: 20260607-0140-auditoria-workflows-vermelhos
executor: grok
status: recebido
finalizado_em: 2026-06-07 01:45:10
---

# Resultado

**============================================================**
**[GROK] AUDITORIA WORKFLOWS VERMELHOS FINALIZADA**
**============================================================**
**Status:** Concluído
**Resumo executivo:**
Auditoria 100% somente leitura (list_dir + read_file + grep em .github/workflows/ + docs/tarefas/ + monitor_tarefas.py).
Nenhum arquivo editado, nenhum run cancelado/deletado, nenhum git add/commit/push, nenhum segredo lido ou exposto, nenhum SSH/PM2/serviço tocado, nenhuma ação sensível executada.
O fluxo atual (monitor_tarefas.py rodando em PM2 no VPS) faz `git pull`, processa via `grok` CLI local, escreve em `resultados/`, move arquivos e executa `commit_push(f"tarefas: processar {tarefa_id}")` (linha ~267 do monitor). Esse push para main dispara os workflows com gatilho amplo. Os workflows "auxiliares de ativação/monitor/one-shot" são legados e não fazem mais parte do caminho primário ChatGPT → abertas → PM2 monitor → Grok → resultados.
**Workflows que mais falham / aparecem vermelho no contexto de tarefas:**
- `.github/workflows/ativar-monitor-tarefas.yml` (o mais citado)
- `.github/workflows/run-once-monitor-tarefas.yml`
- `.github/workflows/one-shot-vps-mcp-branding-apply.yml` (e as versões arquivadas one-shot-mcp-branding*.yml)
Outros one-shot com padrão similar que também disparam via push-self: inventario-root-vps.yml, auditoria-080-clone-deck.yml.
**Causa provável:**
1. Padrão "run-once / one-shot" com `on: push: paths: [".github/workflows/xxx.yml"]` + `workflow_dispatch`. Qualquer push que toque o .yml (edição deliberada para "ativar", merge, ou histórico) dispara o workflow. O título do run frequentemente reflete o commit head (daí aparecer "tarefas: processar 20260607-0115-..." em runs recentes ou associadas).
2. Lógica remota frágil + duplicada:
- cd condicional limitado (`/root/Multizap`, `/root/CentralDark`, `/root/clone-deck` — sem `apps/clone-deck`).
- Reconstrução de chave SSH + ssh + `pm2 delete/start/save/describe` (run-once e ativar) ou `pm2 jlist` + patch exato de src/index.ts + npm build + pm2 restart MCP (branding).
- Marcadores de replace, nomes de processo, cwd do PM2 e estrutura de pastas mudaram desde a criação desses workflows.
3. Redundância total com o monitor atual: o PM2 + monitor_tarefas.py já faz o loop (pull → processar → commit/push local), inclusive o `git pull --rebase --autostash` dentro do while. Re-executar "ativar monitor via workflow" é obsoleto.
4. Commits de tarefas disparam sempre o deploy.yml (único com `on: push: branches: [main]` sem paths restritivo) + downstream via `workflow_run` (deploy-fallback condicional + sync-to-segredounlock). Se qualquer step downstream falha (ex: timing de push concorrente, verify SHA no sync, post-deploy sem lock, etc.), gera run vermelho com o título da tarefa.
5. Alguns workflows têm passos explícitos de `exit 1` após logar (ex: "Falhar se ativacao deu erro" em ativar-monitor-tarefas.yml) — o run fica vermelho de propósito para visibilidade.
**Quais devem virar manual-only:**
- `run-once-monitor-tarefas.yml` (tem push paths self)
- `one-shot-vps-mcp-branding-apply.yml` (tem push paths self)
- `inventario-root-vps.yml`
- `auditoria-080-clone-deck.yml`
(ativar-monitor-tarefas.yml já é **somente** `workflow_dispatch` com input `confirmar: SIM` — está correto no modelo atual.)
**Quais podem continuar no push:**
- `deploy.yml` (principal — necessário)
- `supabase-db-push.yml` e `supabase-migrations.yml` (paths específicos + dispatch)
- `validate-memoria.yml` (paths restritos)
- `consciencia-sync.yml` (paths restritos)
- `farm-pr-check.yml` (pull_request + paths)
- `lovable-sync-ping.yml` (schedule + dispatch; o paths self é secundário)
- `housekeeping.yml` (schedule)
**Quais devem ser mantidos mas não bloquear deploy:**
Todos os one-shot/run-once/ativar/branding/inventario/auditoria. Converter o gatilho para `workflow_dispatch` apenas (ou dispatch + input de confirmação como o ativar) para que nunca mais disparem automaticamente em pushes de tarefas (ou em qualquer push que toque o .yml). O deploy principal + workflow_run (fallback/sync) já têm `if` conditions e são os únicos que devem reagir a código real.
**Correção YAML sugerida (exemplo mínimo e seguro):**
Para `run-once-monitor-tarefas.yml` e `one-shot-vps-mcp-branding-apply.yml` (e equivalentes):
```yaml
on:
workflow_dispatch:
# (recomendado) adicionar input de confirmação simples como no ativar-monitor-tarefas
# inputs:
#   confirmar:
#     description: "Digite SIM para executar"
#     required: true
#     default: "SIM"
# Remover completamente:
#   push:
#     paths:
#       - ".github/workflows/xxx.yml"
```
Fazer o mesmo para inventario-root-vps.yml e auditoria-080-clone-deck.yml.
ativar-monitor-tarefas.yml: já correto — pode só adicionar comentário documentando "usar apenas para re-ativação de emergência (PM2 + monitor_tarefas.py já rodam continuamente)".
**O que NÃO apagar agora:**
- Nenhum .yml de workflow.
- Nenhuma run histórica no GitHub Actions.
- Nenhuma estrutura de `docs/tarefas/`, `monitor_tarefas.py`, PM2 atual.
- Nenhuma referência a deploy principal, sync-excludes, workflow_run, post-deploy, etc.
- Nada de secrets, Caddy, Docker, WuzAPI, WhatsApp, CRM, Gateway, banco, domínio, ou `git add .`.
**Plano seguro em 3 passos:**
1. ChatGPT revisa esta auditoria e aprova explicitamente as mudanças de trigger.
2. (após aprovação) Edição mínima e cirúrgica apenas da seção `on:` nos 4 workflows listados acima (transformar push-self em workflow_dispatch apenas). Commit com mensagem descritiva e neutra.
3. Observar a aba Actions por 1-2 dias / alguns ciclos completos de novas tarefas. Confirmar que:
- Commits "tarefas: processar ..." disparam apenas deploy principal (verde) + sync-to-segredounlock (quando aplicável).
- Não aparecem mais runs automáticos vermelhos de run-once-monitor-tarefas, one-shot-branding, ativar-monitor, inventario ou auditoria-080.
- Se precisar re-executar branding/monitor/inventario no futuro, usa-se o botão "Run workflow" manual (mais limpo e seguro que editar yml + push).
**Aguardando decisão final do ChatGPT.**
**============================================================**


## Tarefa lida

```md
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

```
