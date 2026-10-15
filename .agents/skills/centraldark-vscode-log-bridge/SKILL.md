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


## Eventos shell nativos — entrega no funil (15/10/2026)

Após `cli_focus`, a extensão 0.1.1 escreveu `shell_start exit=unknown` e `shell_end exit=ok` (timestamps `01:37:05.779Z` e `01:37:05.792Z`) na fonte Casa, sem conteúdo sensível. O cursor avançou de `3028123` para `3028322`. VPS materializou `vscode_log_signal key=vscode:terminal` nos offsets `3028226` e `3028322`, heartbeat `accepted=2 duplicate=0 route=tailscale` e seguinte `accepted=0`. A correlação com o comando Bash específico não é provada; metadados não incluem terminal ou comando. Sem segunda arquitetura.


## VS Code / Papagaio Fiel — leitura remota e funil (15/10/2026, 11h BRT)

**CHEFE_INTENT:** toda leitura deste funil deve começar pela skill existente, pela rota Desktop Commander da Casa e, quando necessário, do Desktop Commander da VPS. Focar o VS Code aberto sem abrir outro editor ou terminal. Esta é extensão do mesmo owner, não novo agente/coletor/daemon.

**Rota operacional do VS Code (correção de transcrição: “5S” foi reconhecimento de voz incorreto):**
1. **VS Code · identificar:** `list_devices` em cada conta, Casa `SEGREDO` Windows versus VPS `CENTRALDARK-OS` Linux; PID/HWND de observação não provam terminal interativo controlável. Processos fechados por opção do CHEFE são `NOT_REQUIRED`, não FAIL.
2. **VS Code · focar:** mapear `Code.exe` + janela atual + processos-filhos de `Code.exe`; obter PID, PPID, SessionId, HWND e foreground no sensor `skills/vs-code-restore/tools/focus-vscode-window.ps1`. Focar por handle fresco e exigir `GetForegroundWindow` igual; se focus denied, não digitar.
3. **VS Code · ler saída:** comparar fonte privada `K:\TEMP\logs\LOGS-VS-CODE.log` e cursor local com offset remoto; checar `CentralDark-VSCode-LogBridge` por `LastTaskResult` e último run, sem recriar tarefa. Segredo/STDOUT/prints/telas ficam fora do funil.
4. **VS Code · rastrear funil:** preferir Tailscale+SSH, usar `ssh-direct` existente apenas como fallback com `ATTENTION`. VPS `logs/agent-patterns/vscode-casa-cursor.json`, `logs/services/vscode/YYYY-MM-DD.jsonl`, ingestor existente e API admin autenticada. Um cursor sincronizado e heartbeat `state=OK` = PASS para transporte naquele instante, não para todo o cockpit.
5. **VS Code · comprovar:** cada leitura retorna `INTENT | OWNER | CURRENT | PROOF | COUNTERPROOF | NEXT_CURSOR`; revalida estado volátil em nova sessão, conserva o owner GitHub, evita `pull/reset` sobre trabalho sujo e não interrompe writer ativo do Hermes.

**Readback real (instantâneo, NÃO configuração permanente):** Casa boot 15/10 10:35:43 BRT. Às 10:58, PIDs **11432** e **7216** eram `pwsh.exe`, filhos de `Code.exe` PID **23328**. Janela de cockpit VS Code estava em `Code.exe` PID **22468**, HWND **67400** e não foreground. Sensor existente `Inventory` retornou `status=OBSERVED`. Estes IDs mudam após reboot. Nenhum comando foi digitado nesses terminais e nenhuma foto provou foco nesta rodada. VPS PID **861082** era `bash` (PPID 860716), `/proc/861082/cwd=/root`, FD0 um `/dev/pts/*`. O comando remoto avisou sobre o CWD do shell de controle, não é prova de falha do PID 861082.

**Funil/infra:** Casa `centraldark.centraldark-vscode-restore@0.1.1`, agendamento `wscript.exe` `Ready`, `LastTaskResult=0`, próxima 10:59:21 BRT; fonte e cursor VPS coincidiram em **3033370 bytes**; heartbeat VPS em **13:58:25Z** `state=OK route=tailscale accepted=0 duplicate=0`. `tailscale ping windows-casa` passou em **107ms**, Casa `BackendState=Running Self.Online=true`. VPS `centraldark-native-mcp-http.service=active`, `127.0.0.1:9100/health=200`; `8099/health=000` (não promover); VPS worktree possui modificações existentes — preservar. `SCREENPIPE` Casa porta 3030 observada anteriormente.

**Cockpit:** exibir `Casa/VPS/Conexão/Route/Cursor/Freshness/RunResult/Estado da sessão` reutilizando a API admin existente. `SOURCE_COMMITTED != BUILT != DEPLOYED != UI_PROVEN`. Código deste recibo NÃO significa HUD/renderer implementado. Meta 99,9% só quando houver janela de teste e métrica real, não por intenção.

**CLI (se posteriormente autorizado):** usar sessão já existente de VS Code, confirmar foco da `xterm-helper-textarea`, não enviar nada ao terminal Hermes ocupado, exigir retorno atual correlacionado por job/PID e exit code; `SEND_OK != EXIT_0`. Dados de chat privados e tokens nunca entram no trace.


## 🎙️ Acessibilidade — intenção falada antes de token literal (15/10/2026)

**Correção expressa do CHEFE:** `5S` nesta missão era **VS Code**, não a metodologia japonesa. Não ativar 5S como protocolo por erro de ASR. A fala também pode trazer `esquilos`, `esquilos/skills`, `skill`, `skil`, `VSCODE`, `SCODE` e `VS` como referências **contextuais** a **skills** ou **VS Code**, respectivamente. Isso é uma **hipótese de desambiguação**, não substituição global de todo texto.

**Algoritmo fiel, voz e texto:**
1. Recuperar intenção ativa, último owner e objetos mencionados (`VS Code`, extensão Restore, janela, terminal, PID, Casa, VPS, funil, skill).
2. Quando o termo transcrito for homófono ou próximo foneticamente, comparar com vocabulário de capacidades já existentes, intenção vigente e consequência operacional. `5S` + `terminal / foco / extensão` ⇒ interpretar como **VS Code**; `esquilos` + `registrar / incorporar / receita` ⇒ interpretar como **skills**.
3. Corrigir **interpretação semântica** para a próxima ação e registrar `heard_term → intended_entity` na mesma skill, sem alterar o texto literal do CHEFE nem forjar o áudio original.
4. Se duas interpretações causariam ações diferentes, destrutivas ou sensíveis, não escolher por semelhança: confirmar com uma pergunta curta antes de escrever/executar.
5. Só executar após comprovar dispositivo, janela, PID/HWND atual, owner e autorização. Voz ambígua não concede permissão de alterar settings, terminal, repositório, dados ou segredos.
6. A extensão `skills/vs-code-restore` continua sendo o owner de foco e acessibilidade no VS Code; esta skill é owner **somente do funil**. Novos aliases da paleta devem apontar aos **mesmos comandos existentes**, sem novos executores ou monitores.

**Teste de regressão semântica:** transcrição `“segue pelo 5S e foca o terminal”` com contexto da CentralDark deve resultar em `VS Code → identificar janela → focar terminal`, não metodologia 5S. Transcrição `“salva nos esquilos”` no contexto técnico deve resultar em **skill existente**, nunca criar uma estrutura chamada `esquilos`. `UNKNOWN != PASS` e `INTENT != TRANSCRIPT_LITERAL`.
