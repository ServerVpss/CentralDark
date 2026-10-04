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
