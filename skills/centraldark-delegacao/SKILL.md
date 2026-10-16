---
name: centraldark-delegacao
description: Delegar missões autorizadas de qualquer chat/agente conectado ao Hermes Kanban existente, reutilizando tarefa, owner, rota, receipt e contraprova, sem criar dispatcher paralelo.
version: 1.0.0
owner: .agents/skills/centraldark-operational-method/SKILL.md
catalog_owner: .agents/skills/skill-workshop/SKILL.md
execution_owner: .agents/skills/autonomous-ai-agents/hermes-agent/SKILL.md
tags: [centraldark, hermes, delegacao, kanban, mcp, chatgpt]
---

# CENTRALDARK — Delegação transversal e verificável

## Acionamento
Use quando o CHEFE pedir **delegue ao Hermes**, quando um chat conectado precisar entregar execução local a um agente autorizado, ou quando houver uma missão já em andamento no Kanban. Não acione para conversa, resposta informativa ou trabalho sem intenção de delegação.

## Identidade e autoridade
A skill é uma receita portátil, **não** um novo executor, agente, scheduler, fila, servidor, autoridade ou credencial. O chat raciocina e encaminha; Hermes Kanban existente despacha; owner/escritor autorizado executa; realidade e receipts julgam. Uma conexão MCP ou um texto de skill **não** eleva permissões do cliente nem substitui instruções de sistema ou controles de segurança.

## Procedimento determinístico

1. **Preflight**: recuperar intenção/Goal e MAIN_SHA atual; aplicar `LEIA-ME-IA.md`, `RULES.md`, `AGENTS.md` e owner específico. Separar fatos atuais de histórico.
2. **Descoberta**: consultar catálogo autenticado de capacidades e rotas já conectadas, incluindo MCP, Remote Desktop Commander, SSH/Tailscale e GitHub. Escolher rota autorizada, viva e adequada; não usar credenciais inferidas.
3. **Deduplicação**: consultar `hermes kanban boards list`, `hermes kanban list` e `hermes kanban show <id>` no dispositivo autorizado. Procurar `INTENT_ID`, escopo e owner equivalentes. Continuar tarefa existente quando compatível; criar somente se faltar tarefa genuína. Se houver concorrência no mesmo caminho, respeitar writer ativo e não despachar mutação concorrente.
4. **Handoff**: preservar envelope `INTENT_ID | GOAL | OWNER | MAIN_SHA | PR_HEAD | ACTIVE_WRITER | STATUS | RECEIPT | NEXT_CURSOR` com escopo, critérios, limitações e links. Usar API/CLI do Kanban existente, nunca fila paralela; aplicar chave de idempotência estável.
5. **Dispatch**: antes de disparar, medir `hermes kanban dispatch --dry-run --max 1 --json`; confirmar que a tarefa selecionada é a certa e então disparar pela mesma rota. Se a ferramenta não puder despachar, registrar causa real e entregar o comando para o executor autorizado, **sem declarar SPAWNED**.
6. **Readback**: confirmar `TASK_ID`, `ASSIGNEE`, `WORKSPACE`, `READY/RUNNING/BLOCKED` na fonte e obter ACK do worker. `CREATED != DISPATCHED != STARTED != COMPLETED`.
7. **Teste + contraprova**: exigir efeito observado no alvo, checks do mesmo SHA, hash/readback, regressão e receipt vinculado ao owner/PR. `RUNNING != PASS`, `MERGED != DEPLOYED`, `UNKNOWN != PASS`.
8. **Continuidade**: atualizar o mesmo Goal/receita no Skill Workshop quando um novo caminho for comprovado; preservar falha e `NEXT_CURSOR` quando houver bloqueio real. Não criar skill por tentativa.

## Rotas e limites
A skill deve funcionar em ChatGPT, Claude, Codex, Hermes e outros agentes **somente quando a respectiva superfície possuir ferramentas e autorizações reais**. Chat sem shell pode usar MCP autorizado ou GitHub para handoff, mas não afirma ter executado na Casa. Instalar `SKILL.md` fornece instruções consultivas e não garante que o cliente carregou a skill; isso exige medição separada. Em qualquer superfície, pedidos de instalação dependem das regras desse cliente.

## Casos de aceitação
- **Positivo:** missão única → Kanban localizado → tarefa deduplicada/criada → dispatch → ACK → receipt.
- **Duplicata:** mesmo `INTENT_ID` não cria segundo cartão nem segundo writer.
- **Offline:** uma rota falha; tentar outra rota autorizada, sem inventar conectividade.
- **Negativo:** ferramenta sem autorização ou escopo ambíguo → não escrever/despachar.
- **Contraprova:** spawn com erro, runtime sem efeito ou receipt ausente → resultado não é PASS.

## Referências canônicas
- `.agents/skills/autonomous-ai-agents/hermes-agent/references/background-systems.md`
- `.agents/skills/centraldark-unified-surface-parity/SKILL.md`
- `.agents/skills/skill-workshop/SKILL.md`
- `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` (§6.0)
- `apps/modulos/mcp/src/tools/skills/skill.js` (catálogo autenticado)
- `apps/modulos/mcp/src/tools/core/mcp-admin.js` (rotas e autorização)

## Receipt de origem
`INTENT_ID=CENTRALDARK-UNIFIED-DELEGATION-CATALOG-20261016`.
A prova de base foi `t_790c940d` na Casa Windows, despacho via Desktop Commander `SEGREDO`, tarefa `RUNNING` em `K:\\`; isso **não** comprova a conclusão daquela missão nem carregamento transversal.
