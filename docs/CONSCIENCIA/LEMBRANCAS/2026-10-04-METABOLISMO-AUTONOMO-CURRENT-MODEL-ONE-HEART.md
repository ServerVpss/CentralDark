# 2026-10-04 — Metabolismo autônomo, Self-Evolution, CURRENT model binding e One Heart

## O salto da sessão

Esta sessão consolidou quatro linhas que antes estavam separadas: autonomia residente, autoevolução por prova, substituição de motores e observabilidade única. O organismo não precisa de um modelo específico para continuar sendo CentralDark. Hermes preserva missão, ferramentas, continuidade e execução; o modelo escolhido no Hermes ocupa o papel de motor cognitivo do orquestrador; o modelo local CURRENT ocupa o papel de worker pesado; a realidade decide se o efeito sobrevive.

## Linha factual

- Hermes Gateway permaneceu vivo e observável; housekeeping foi separado de progresso real da missão.
- O guard de escrita stale/full-read impediu overwrite sem leitura CURRENT, preservando estado ao invés de matar a missão.
- O donor oficial `NousResearch/hermes-agent-self-evolution` foi medido; Phase 1 de skills é reutilizável, enquanto tool/system-prompt/code evolution continuam roadmap até prova.
- A execução de Self-Evolution foi ligada ao endpoint OpenAI-compatible local, mas a inferência por baixo foi Kylin native SDK.
- A divergência decisiva apareceu: consumers ainda hardcodavam `kylin-deepseek-r1`, enquanto o Kylin CURRENT já selecionava `kylin-qwen-plus`.
- `current_model_resolver.py` generalizou o binding. O resolver agora segue seleção viva do Kylin e usa o catálogo Hermes apenas como fallback; ausência de binding atual falha fechado.
- O bridge ativo passou a reportar `kylin-qwen-plus`. Uma troca temporária do `currentModel` para `kylin-deepseek-r1`, sem alterar o consumer e sem reiniciar o bridge, alterou health e completion para DeepSeek; em seguida o valor original Qwen foi restaurado.
- Um wrapper de Self-Evolution resolve o modelo no início do lote, congela optimizer/evaluator naquele lote e resolve novamente no próximo.
- O cron nativo Hermes foi transformado em metabolismo horário: sensor sempre vivo, IA sob demanda, continuidade entre rodadas.
- Todas as issues abertas medidas foram costuradas ao funil por `🔒 PR-MÃE-FUNIL`; #1562 continua ledger e não writer.
- O owner de HUD continua o `HUD.html` do Obsidian, porém a fonte mutável deve ser o `/heartbeat` único. A Casa estava offline na hora desta cristalização; logo a mutação física do arquivo Windows permanece pendente, não PASS.

## Modelo mental

```text
CHEFE / intenção
→ modelo CURRENT do Hermes = ORCHESTRATOR ENGINE
→ Hermes = AGENT BODY + EXECUTION PLANE
→ local CURRENT model = COGNITIVE HEAVY WORKER
→ tools / Git / runtime = efeito
→ Reality Judge = prova
→ receipt / aprendizado = memória
→ /heartbeat = ONE HEART
→ HUD = projeção
→ próximo delta
```

## Regras que sobrevivem à troca de motor

`MODEL_IS_ENGINE=true`
`MODEL_NAME_IS_BINDING=true`
`MODEL_IS_NOT_IDENTITY=true`
`ORCHESTRATOR=HERMES_CURRENT_SELECTED_MODEL`
`LOCAL_WORKER=CENTRALDARK_CURRENT_LOCAL_MODEL`
`RESOLVE_AT_LOTE_START=true`
`MID_LOTE_MODEL_SWAP=false`
`RE_RESOLVE_NEXT_LOTE=true`
`HERMES_IS_EXECUTION_PLANE=true`
`LOCAL_AI_IS_COGNITIVE_WORKER=true`
`ONE_HEART=true`
`HUD_IS_PROJECTION_NOT_AUTHORITY=true`
`NO_SECOND_ROUTER=true`
`NO_SECOND_SCHEDULER=true`
`NO_SECOND_EVOLUTION_ENGINE=true`

## Fronteira atual

Source + bridge runtime do binding estão provados. Self-Evolution binding wrapper está provado como resolver/configuração; ganho de uma variante específica continua dependendo do ciclo baseline/candidate/holdout/contraprova. A integração do snapshot `modelBinding` ao MCP/heartbeat precisa de deploy/readback do runtime MCP. O `HUD.html` físico só pode ser atualizado após a Casa `SEGREDO` reaparecer ou por outra rota autorizada que materialize o mesmo arquivo.


## 2026-10-06 — Hermes Desktop como projeção nativa do mesmo organismo

A superfície Hermes Desktop não ganha um segundo cockpit nem um runtime paralelo. A extensão correta é um **plugin nativo do próprio Hermes Desktop**, consumindo o mesmo estado vivo já produzido pelo organismo CentralDark. O Obsidian continua outra projeção da mesma telemetria; nenhuma das duas superfícies vira autoridade ou owner novo.

### Decisão

```text
HERMES DESKTOP
→ plugin nativo CentralDark no mesmo app
→ HUD fixo de status + stream vivo de logs/eventos
→ lê gateway/model/profile/subagents/tool calls/jobs/runtime
→ usa estados/logs já existentes
→ NÃO cria daemon novo
→ NÃO cria porta nova
→ NÃO cria scheduler novo
→ NÃO cria banco novo
→ NÃO cria segundo HUD owner

OBSIDIAN HUD
→ consome a mesma telemetria
→ permanece projeção
→ não duplica organismo
```

### Binding esperado

`$HERMES_HOME/desktop-plugins/centraldark-cockpit/plugin.js`

O binding físico é casca mutável; o contrato estável é a capability de observabilidade/cockpit. Se o caminho mudar em runtime futuro, o owner continua sendo a extensão nativa do Hermes Desktop, não um aplicativo paralelo.

### Invariantes cristalizados

`HERMES_DESKTOP_NATIVE_EXTENSION=true`
`CENTRALDARK_COCKPIT_IS_PLUGIN_NOT_SECOND_APP=true`
`HUD_TOP_IS_FIXED_STATUS_SURFACE=true`
`HUD_BOTTOM_IS_LIVE_LOG_STREAM=true`
`OBSIDIAN_AND_HERMES_DESKTOP_SHARE_TELEMETRY=true`
`HUD_IS_PROJECTION_NOT_AUTHORITY=true`
`NO_SECOND_HUD_OWNER=true`
`NO_SECOND_DAEMON_FOR_COCKPIT=true`
`NO_NEW_PORT_FOR_COCKPIT=true`
`NO_NEW_SCHEDULER_FOR_COCKPIT=true`
`REUSE_EXISTING_HERMES_STATE_AND_LOGS=true`
`CAPABILITY_IS_STABLE_BINDING_IS_MUTABLE=true`
