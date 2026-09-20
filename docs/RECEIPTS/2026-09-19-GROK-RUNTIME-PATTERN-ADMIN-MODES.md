# Receipt — Grok runtime pattern + Admin modes

Data: 2026-09-19
Owner humano: SEGREDO/CHEFE
Repo: `ServerVpss/CentralDark`
Owner arquitetural: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/GROK-BUILD-ADAPTER.yml`

## Intenção

Capturar o padrão operacional real do Grok que estava vivo no console/terminal da VPS,
cristalizar somente o delta útil no organismo CentralDark e permitir ao CHEFE escolher
defaults Grok no mesmo painel Admin, sem criar segundo cérebro, segundo log ou autoridade paralela.

## Fontes medidas

- processo vivo `grok` e árvore de filhos em `/proc`
- `/root/.grok/config.toml` com campos não secretos
- `/root/.grok/version.json`
- sessão viva `events.jsonl`
- `/root/.grok/logs/unified.jsonl`
- `grok --help` e `grok agent --help`
- agentes/personas/roles/workflows bundled em `/root/.grok/bundled`
- watcher vivo `/tmp/watch-deploy.sh`

## Estado vivo observado

```text
PROCESS_RUNNING=true
PID=884140
CWD=/root/CentralDark
TTY=pts/0
ACTIVE_BINARY=grok-1.0.30-linux-x86_64
INSTALLED_VERSION=1.0.34
STABLE_VERSION=1.0.34
VERSION_DRIFT=true
```

A sessão medida continha 45.072 eventos estruturais. A máquina de fases observada foi:

```text
waiting_for_model
→ streaming_reasoning
→ streaming_text
→ permission_prompt
→ tool_execution
→ próximo loop
```

Contagens da captura:

```text
loops_started=488
turns_started=103
tool_calls=2651
permission_allow=663
subagents_spawned=34
subagents_completed=32
subagents_failed=2
inference_retries=10
inference_failures=15
```

## Padrões provados

- Subagente observado: `general-purpose`.
- Modelos de filhos observados: `grok-4.6` (29) e `grok-4.5` (5).
- Parent → child model inheritance foi observado.
- `monitor`, `scheduler_create`, `scheduler_list`, handles de background e kill foram usados de verdade.
- O runtime possui fila/wake/admission gates observáveis.
- O Grok também delegou comandos ao Hermes; subagente próprio e delegação Grok→Hermes são mecanismos diferentes.
- `HEADLESS` foi observado em logs e `INTERACTIVE_PTY` foi provado pelo processo vivo.
- `plan` e `explore` existem como built-ins, mas não foram observados executando nesta sessão.

Watcher observado:

```text
poll=90s
seleciona primeiro run ativo
pode migrar para outro run quando o alvo termina
```

Isso permanece uma ferida conhecida. Regra CentralDark: watcher focado deve seguir alvo exato
`scope|target|sha|run_id`, ter deadline e encerrar no terminal/superseded.

## Modos incorporados no mesmo owner

O adapter canônico continua sendo:

`apps/modulos/HERMES-CORE/core/grok-build-adapter.mjs`

Defaults selecionáveis no Admin:

- invocation: `HEADLESS | READ_ONLY_AUDIT | INTERACTIVE_PTY | ACP_STDIO | INSPECT`
- agent: `general-purpose | plan | explore`
- model: `grok-4.6 | grok-4.5`
- reasoning: `low | inherit`
- subagents: on/off
- plan: on/off
- permission no Admin: `default | plan`

Permission modes fortes documentados pelo Grok — `acceptEdits`, `auto`, `dontAsk`,
`bypassPermissions` — não recebem botão de autoridade no Admin. Quando usados explicitamente,
continuam exigindo `mutation_intent + writer_scope_proven`.

## Estado e prova

A seleção é persistida em:

`/root/CentralDark/logs/control/grok-mode.json`

Ela é consumida pelo mesmo Grok Build Adapter nas próximas invocações.
Entrada explícita de missão vence o default do Admin.
Regras:

```text
SELECTED != ACTIVE
AVAILABLE != OBSERVED
DOCUMENTED != EXECUTED
ACTION != PROOF
UNKNOWN != PASS
ADMIN_SELECTION != MUTATION_AUTHORITY
```

Só evento/log de uma invocação posterior pode provar que o modo selecionado foi realmente usado.

## Artefatos

- `GROK-BUILD-ADAPTER.yml` — contrato/owner
- `GROK-RUNTIME-PATTERN.json` — snapshot sanitizado máquina-legível
- `grok-build-adapter.mjs` — consumidor executável
- `mcp/src/grok-control.js` — controle persistente do Admin
- `mcp/src/agent-observability.js` — ingestão estrutural `events.jsonl + unified.jsonl`
- `mcp /admin → Grok` — UI de escolha
- `grok_mode_status` — leitura MCP

Raw prompts, respostas privadas, comandos brutos e secrets não fazem parte do snapshot canônico.
