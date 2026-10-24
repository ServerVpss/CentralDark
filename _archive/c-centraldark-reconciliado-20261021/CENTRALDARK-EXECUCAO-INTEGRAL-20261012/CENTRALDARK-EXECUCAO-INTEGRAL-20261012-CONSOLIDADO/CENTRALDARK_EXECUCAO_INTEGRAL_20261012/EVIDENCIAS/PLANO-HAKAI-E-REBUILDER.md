# 🟡 Pendências — ninguém recebe PASS por existir

## Frente 1: MCP + Rebuilder

1. Medir **qual binário/dist/index.js e qual source** a unit `centraldark-native-mcp-http.service` usa, PID/ExecStart/WorkingDirectory, proveniência de commit e checks da mesma revisão.
2. Medir `src/tools/core/mcp-admin.js` e manifesto destrutivas efetivamente usados no runtime, sem acessar segredos.
3. Verificar a trilha do microdeploy existente, que permite somente fileset estreito (`src/index.js`, `dist/index.js`, `operational-telemetry.js`), e **não** aceita o dispatcher. Alterar allowlist é decisão de manutenção revisada com testes e rollback, não bypass automático.
4. Descobrir o **owner existente real do Rebuilder** (a busca em pastas limitadas não encontrou a palavra), ou registrar `UNKNOWN`. Nunca inventar Rebuilder novo por conveniência.
5. Testar unit e integração em um scratch canônico isolado; promover apenas fileset causal autorizado e comprovar /health, /heartbeat, /tools, logs, PID, SHA antes/depois.

## Frente 2: Pulso integrado + HAKAI

1. `bash -n` e `--pulse --plan` foram comprovados; `--scan` com `exitCode=0` prova só varredura **parcial** e JSON canônico.
2. `--pulse` real pode disparar Git fetch, microdeploy, classificação Hermes e gravações. **Não executar só para ter verde** sem um cenário seguro e autorização contextual.
3. Inventariar todos os chamadores no repo, `.github`, cron (incluindo crontabs de usuário), systemd, processos vivos e scripts externos; busca limitada que retorna vazio não prova inexistência.
4. Só quando um teste funcional reproduzir os efeitos esperados do antigo com recibo/SHA/rollback e nenhum consumidor depender do nome legado: parar agendamento, atualizar callers para o script único, conferir retorno, mover o antigo ao backup existente. Apagar só depois de janela e readback.
5. Dados por SHA exato podem ser duplicatas reais. **Candidatos por nome ou corpo normalizado** são hipóteses e **não** candidatos automáticos ao HAKAI.

## Cursor

`MCP_RUNTIME_OWNER_AND_FILESET → SAME_SHA_TESTS → DEPLOY_ISOLADO → READBACK_RUNTIME` e em paralelo `PULSE_REAL_PARITY → CALLER_MAP → HAKAI_BACKUP_MOVE → RE-RUN_AND_READBACK`.
