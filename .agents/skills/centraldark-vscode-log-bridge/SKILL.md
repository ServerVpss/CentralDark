---
name: centraldark-vscode-log-bridge
description: Enviar sinais do VS Code Casa ao funil unico CentralDark via SSH/Tailscale, sem transportar texto bruto ou duplicar o owner.
---

# VS Code — Logs: receita da Forja (não instalar na VPS)

## Donos: cada coisa no lugar

- GitHub: fonte canônica da skill, scripts, testes e histórico de mudanças.
- Casa: K:\TEMP\logs\LOGS-VS-CODE.log é o bruto. K:\TEMP aponta para F:\TEMP\CentralDark; os bytes não ficam na raiz K:.
- Casa/script: scripts/casa/vscode-log-bridge.ps1 lê lotes completos; transmite apenas nível, componente, offset e SHA-256 da linha.
- VPS/script: scripts/vps/ingest-vscode-log.mjs recebe via SSH/STDIN e chama o MESMO apps/modulos/mcp/src/log-funnel.js.
- API: GET /admin/api/logs/LOGS-VS-CODE.log autentica usuário admin e projeta estado/eventos sanitizados.
- GH CLI: inspeciona código, PR, SHA e checks; NUNCA serve para publicar logs ou credenciais.

## Ordem reprodutível

1. Conferir origem, tamanho e último registro sem expor conteúdo pessoal.
2. pwsh -NoProfile -File scripts/casa/vscode-log-bridge.ps1 -DryRun
3. Materializar apenas script aprovado na VPS; conferir hash e integridade do owner sem git pull/reset.
4. Rodar uma vez, validar ACK do script VPS, cursor da Casa e um mesmo evento em logs/events, logs/sectors/vscode e logs/services/vscode.
5. Conferir GET /admin/api/logs/LOGS-VS-CODE.log com autenticação, filtro e status. Sem 200 real não há rota web provada.
6. Agendar na Casa: pwsh -NoProfile -File scripts/casa/vscode-log-bridge.ps1 -InstallTask somente depois do teste pontual.
7. Citar commit/SHA, rotas atuais, último recebimento, fallback exercitado e contraprova.

## Atenção suave

Preferir Tailscale SSH com BatchMode + StrictHostKeyChecking=yes; se não passar, usar alias SSH direto já aprovado.
Se SSH direto atender, state=ATTENTION amarelo e route=ssh-direct; uma rota quebrada não derruba as demais.
Se tudo cair: arquivo/cursor permanecem na Casa, sem descarte; estado vira ATTENTION, nunca PASS. Retomar do offset confirmado.
Sem heartbeat recente => ATTENTION; sem fonte => UNKNOWN. Não gerar alertas agressivos nem falsa confirmação.

## Limites

Não enviar log bruto, prompt, conversa, conta, token, email ou chave para GitHub/API.
Não duplicar coletores, skills em VPS, ou criar segunda arquitetura de logs. Skill ensina; scripts executam; a API observa.
Git commit não é deploy, e existência de script não prova agendamento; só rastro de execução fecha cadeado.

## Organização

skill = COMO / scripts Casa = COLETA / script VPS = INGERE / log-funnel = DONO / API = CONSULTA / TEMP = DADO VOLÁTIL / receipt = PROVA SEM SEGREDO

## Execução invisível na Casa (sem janela piscando)

- O Task Scheduler executa `C:\Windows\System32\wscript.exe //B //Nologo "K:\scripts\casa\vscode-log-bridge-hidden.vbs"`, e não `pwsh.exe` diretamente.
- O `vscode-log-bridge-hidden.vbs` chama o MESMO `vscode-log-bridge.ps1` com `WScript.Shell.Run(command, 0, True)` (janela oculta, exit code preservado).
- O `-InstallTask` já usa esse launcher; é preciso materializar os dois arquivos em `K:\scripts\casa` antes do agendamento.
- A flag `Settings.Hidden` do Task Scheduler oculta o item na interface do agendador; ela **não oculta janela do PowerShell**. O launcher é o que evita o piscar.
- A automação continua no usuário da Casa (LogonType Interactive) para preservar acesso a K:\TEMP e à chave SSH local; não migrar para SYSTEM às cegas.
- Testar execução e `LastTaskResult=0` com mesmo cursor/SSH antes de declarar PASS. Não afirmar observação direta da tela sem captura.


## Integração com operação direta no terminal VS Code (15/10/2026)

- A receita de foco/digitação/contraprova da interface pertence a `skills/vs-code-restore/SKILL.md` na `main` (commit `6eab96cc7cacc6ff374888911b835f0c8c2d0353`); este owner cuida **somente da telemetria**, sem copiar o mecanismo de UI ou abrir outro coletor.
- A foto do CHEFE provou `echo PONG_CENTRALDARK_1015` executado em Bash `root@CENTRALDARK-OS` dentro do VS Code; um lote posterior de 8 comandos foi enviado pela automação, porém sua saída individual não foi capturada. `SEND_OK != OUTPUT_PASS`.
- Estado live da Casa medido: `LOGS-VS-CODE.log` 3.027.886 bytes; tarefa `CentralDark-VSCode-LogBridge` `Ready`, `LastTaskResult=0`, ação `wscript.exe`; dry-run `signals=0 offset=3027886->3027886`. O arquivo **não contém evidência nova** do pingue-pongue só por ter sido testado; não declarar cobertura de terminal sem prova.
- Para integrar ações do terminal: reutilizar `scripts/casa/vscode-log-bridge.ps1` → `scripts/vps/ingest-vscode-log.mjs` → `apps/modulos/mcp/src/log-funnel.js`. Primeiro medir origem e campos já aceitos; somente metadados não sensíveis (tipo de operação, owner, horário, resultado, fingerprint, next_cursor), jamais comandos brutos, stdout, tokens, sessões, prompts ou conversas. Evitar alterar contrato do coletor sem teste de idempotência, privacidade e API autenticada.
- PR #1820 continua `OPEN`, `MERGEABLE`, `isDraft=false` no HEAD `fdb2a1a32c5ea5f656126ff16817228b7d9ee507` no momento da leitura; checks same-HEAD, merge em main e deploy não foram promovidos a PASS. Preservar PR-mãe #1562 como ledger.

`FOCUS_PROVADO → ENVIO → READBACK → METADADO_SANITIZADO → FUNIL_EXISTENTE → RECIBO → FIXED_POINT`.


## Prova do circuito ZENDRIVE CLI 0.1.1 (15/10/2026)

- **UI owner** `skills/vs-code-restore` evoluído na `main` (fonte `a716b583`, manifesto `441919de`, receita `d4f1c097`); versão `centraldark.centraldark-vscode-restore@0.1.1` instalada na Casa. Comando `centraldark.zendriveCli` apenas foca terminal existente; não cria segundo Hermes nem sessão ChatGPT.
- A extensão observa eventos de shell integrado (`shell_start`, `shell_end`, `shell_integration`) e emite **somente metadados** no `K:\TEMP\logs\LOGS-VS-CODE.log` já existente, quando ativada no host UI Windows; saída e comandos não são lidos. O Task Scheduler já faz o transporte por SSH/Tailscale para este owner.
- **Contraprova de ponta a ponta (marcador controlado):** a fonte passou de `3027886` a `3028022` bytes, cursor `3028022`, rota `tailscale`; VPS materializou `vscode_log_signal key=vscode:terminal end_offset=3028022`, heartbeat `accepted=1 duplicate=0`, seguida de heartbeat `accepted=0`. Prova a ponte, não o evento nativo da extensão.
- Teste de código isolado: comando registrado, terminal reutilizado, 0 terminais novos, quatro eventos sanitizados e classes de exit `ok/nonzero` — PASS. **Pendente:** ativação da nova extensão na janela já aberta, emissão de `shell_start/shell_end` de comando real, captura automática de stdout (não implementada), e provider Zendrive real (Omni VPS 8099 não respondeu; CDP Casa 9222 fechado).
- Preservar `SOURCE_COMMITTED != RUNTIME_ACTIVATED`; não promover provider `zendrive-chatgpt-local` de simulação para live nem copiar cookies. Nenhum serviço paralelo ou segundo log-funnel.


## Contraprova nativa cli_focus 15/10

- Comando da extensão VS Code 0.1.1 foi invocado na janela real; retornou foco a `xterm-helper-textarea`. Listener `centraldark.zendriveCli` escreveu evento **real** `cli_focus` na fonte Casa (`3028022 → 3028123` bytes), sem texto de comando ou stdout.
- Coletor Task Scheduler existente enviou via `tailscale`; VPS confirmou `vscode_log_signal key=vscode:terminal end_offset=3028123`, heartbeat `accepted=1 duplicate=0` e depois `accepted=0`. Não é marcador sintético: é evento do comando da extensão.
- Bash remoto testado com `echo ZENDRIVE_CLI_PING_1015`; sem evento `shell_start/shell_end` observado. Captura universal de comandos/saída continua NOT_PROVEN; sem shell integration não criar novo coletor. `CLI_FOCUS_PIPELINE=PASS` somente.
