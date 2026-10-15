---
name: vs-code-restore
description: Restaura a bancada do workspace CentralDark no VS Code (terminais, abas e checagem de extensoes) a partir do mapa salvo, sem depender do Claude. Use ao abrir o workspace CentralDark ou quando quiser reconstruir a bancada.
version: 0.1.1
metadata: {"status":"v0.1.1_instalada_comando_ui_pending","mapa":"workspace-map-20261014.json","compilado":true,"instalado_na_casa":true,"comando_nativo_testado":false,"telemetria_probe":true}
---

# VS Code Restore: CentralDark

Extensao nativa do VS Code: mapeia a interface sob comando e preserva a capacidade de restaurar a bancada manualmente. A restauracao automatica e o disparo de agentes ficam desligados por padrao para nao duplicar os owners existentes.

## O que restaura

- 4 terminais PowerShell 7 no diretorio `K:\`: Hermes 1, Hermes 2, Claude Code e um terminal vazio.
- Abas de editor que tiverem URL ou arquivo no mapa. Hoje o mapa tem 17 entradas, mas nenhuma com URL preenchida, entao nenhuma aba e reaberta ainda.
- Checagem das 20 extensoes do mapa, avisando as que faltam. Nao instala nada.

## O que NAO restaura (limites da API do VS Code)

- Posicao das janelas em cada monitor. A extensao nao consegue mover janelas do sistema.
- Abas de outras janelas do VS Code: tudo abre no grupo ativo.
- Sessoes de IA que ja estavam em andamento: o plugin abre novas.

## Arquivos

- `SKILL.md`: esta documentacao.
- `workspace-map-20261014.json`: mapa capturado em 14/10/2026. E a fonte da verdade do plugin.
- `package.json`: manifesto, comando e configuracoes.
- `tsconfig.json`: compilacao.
- `src/extension.ts`: codigo do plugin.

## Configuracoes

- `centraldark.restore.onOpen` (padrao `false`): restaura ao abrir o VS Code.
- `centraldark.restore.startAgents` (padrao `false`): executa `hermes chat` e `claude` nos terminais. Desligue se nao quiser abrir agentes automaticamente.

## Comando manual

- `CentralDark: Restaurar bancada`, pela paleta de comandos (`Ctrl+Shift+P`).

## Como compilar

1. `cd K:\skills\vs-code-restore`
2. `npm install`
3. `npm run compile`

Para instalar localmente, gerar o pacote com `npx @vscode/vsce package` e depois instalar o `.vsix` no VS Code.

## Estado atual (medido)

- Mapa: **parcial**. Capturadas 17 entradas em Editores Abertos. Faltam: rolar a lista, Saida, Debug e Extensoes, e as URLs reais das abas web.
- Extensao: TypeScript compilado (`TSC_EXIT=0`), VSIX de 14.224 bytes empacotado, `code --install-extension` retornou `INSTALL_EXIT=0` e `code --list-extensions` mostrou `centraldark.centraldark-vscode-restore@0.1.0`. Ativacao/invocacao do comando pela UI: **UNKNOWN** ate readback no Extension Host.
- UIAutomation: 3 janelas e 319 controles acessiveis deduplicados catalogados. Sao observacoes, nao 319 cliques comprovados.
- GitHub: publicacao no MESMO owner em main `9aca9ff8a651b73d196e9931305a86b950d4e09a`; `.vscodeignore` em `01d4f00618dce97ef2b5d9e773f64c4b43efac5f`. Readback da fonte PASS.
- Casa K: o diretorio local continua sem tracking do Git; ha 6 arquivos de OUTRO escopo preparados no indice. Nao realizar pull/reset/commit sobre esse trabalho ate reconciliar as arvores com o SHA remoto.

## Manutencao

Quando o layout mudar, recapturar e atualizar o `workspace-map-20261014.json`. Nao mexer no codigo para trocar abas ou terminais.

## 🪬 Mapeamento contínuo da UI — mesmo owner

INTENÇÃO: mapear o VS Code e aprender a operar os controles reais sem perder
identidade das janelas, ações, permissões, evidências nem o trabalho do CHEFE.
Não cria segundo plugin, nova skill, scheduler, memória ou roteador. Reutiliza
a extensão centraldark-vscode-restore e o Desktop Commander da Casa.

### Sensores complementares (não intercambiáveis)

1. Windows UIAutomation: tools/map-vscode-ui.ps1 inventaria janelas VS Code,
   MenuItem, Button, TabItem, ComboBox e Hyperlink, com nomes acessíveis,
   automation_id, enabled e offscreen. Filtra URLs, paths e termos sensíveis.
   Não move foco, não clica nem lê conteúdo de chats/documentos.
2. Extensão nativa VS Code: comando "CentralDark: Mapear interface (read-only)"
   observa comandos, terminais com PID, abas, extensões e pastas do workspace
   pela API oficial. Grava vscode-native-map.json no armazenamento persistente
   da extensão e abre o resultado. Não dispara comandos do inventário.
3. Desktop Commander: atua no Windows mediante reidentificação da janela
   e do controle imediatamente antes da ação; coordenadas antigas não valem.

### Como medir novamente

powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'K:\skills\vs-code-restore\tools\map-vscode-ui.ps1'

O snapshot UIAutomation é salvo atomicamente em
skills/vs-code-restore/ui-accessibility-20261014.json, no mesmo owner.
Cada medição substitui apenas esse snapshot de observação. Preservar
workspace-map-20261014.json com as escolhas e referências anteriores.
No VS Code, Ctrl+Shift+P e "CentralDark: Mapear interface (read-only)"
atualiza o snapshot nativo depois de instalar/ativar a extensão.

### Protocolo de aprendizado por botão

TARGET_WINDOW → ROLE+LABEL+AUTOMATION_ID → BEFORE →
CHECK_SCOPE/AUTHORITY → INVOKE_ONCE → AFTER → COMPARE →
PASS|FAIL|UNKNOWN → RECEIPT → NEXT_CURSOR.

- OBSERVED significa que existe, não que foi testado ou funciona.
- Não misturar controles de janelas, terminais, extensões e perfis diferentes.
- Começar por comandos reversíveis: Explorador, Terminal, Paleta, layout.
- Delete, Discard, Reset, Push, Merge, Deploy, instalar plugin, autenticar,
  mudar permissões ou executar comando desconhecido exige escopo próprio.
- Se um elemento mudar ou desaparecer, remapear e retornar a UNKNOWN.
- Guardar fonte, janela, role, ID, efeito, hora, owner/SHA e recibo existente.
- API VS Code não expõe literalmente todos os botões do Electron; UIAutomation
  cobre os visíveis ao sensor, menus fechados ficam UNKNOWN.

### Contraprova inicial — 2026-10-14

- Casa SEGREDO: Desktop Commander acessível pela conta CENTRALDARK.
- 3 janelas VS Code inventariadas via UIAutomation.
- 118 + 106 + 95 = 319 controles deduplicados registrados, ainda não testados.
- Janela superior e Terminal pwsh já tiveram foco confirmado em observação anterior.
- TypeScript da extensão: npm run compile, TSC_EXIT=0.
- Comando instalado e todos os botões testados: UNKNOWN.
- Não apagar artefatos locais existentes nem lançar outros executores.


## 🪬 Operação direta do terminal integrado — prova e reutilização (15/10/2026)

OWNER desta interação: a MESMA skill `skills/vs-code-restore`, extensão existente e Desktop Commander autorizado da Casa. Não criar segundo plugin, novo executor ou nova arquitetura. Hermes, ChatGPT e outros executores que tenham permissão para operar a Casa seguem esta receita; acesso autorizado continua obrigatório.

### Rota demonstrada (Windows → VS Code → Bash da VPS)

1. Identificar o processo `Code.exe` com `MainWindowHandle != 0`; não presumir janela ou terminal pelo índice histórico.
2. Via Windows UIAutomation, inspecionar a árvore de `AutomationElement.FromHandle(MainWindowHandle)`; identificar o terminal ativo por `ClassName=xterm-helper-textarea` e `Name` iniciando com `Terminal N`. Na sessão observada foi `Terminal 9`, **não fixar esse número**.
3. `SetFocus()` no elemento do terminal e ler `AutomationElement.FocusedElement` imediatamente antes de escrever; exigir `ClassName=xterm-helper-textarea` e nome correspondente. Se o foco estiver em `ProseMirror`, `Pergunte ao ChatGPT`, editor ou outro campo, **não enviar**.
4. Digitar um comando por vez com `WScript.Shell.SendKeys`, seguido de `{ENTER}`; conferir foco entre comandos. Testar com `echo PING_...` e `echo PONG_...` antes de consultas read-only. Comandos que contenham `+`, `^`, `%`, `~`, `(`, `)`, `{`, `}`, `[` ou `]` exigem escaping adequado de SendKeys; para blocos complexos preferir arquivo/script aprovado e execução pelo terminal. **Não usar SendKeys como transporte fiel de scripts arbitrários sem contraprova**.
5. Na sessão 15/10, foram enviados oito comandos de leitura ao terminal da VPS: hostname, pwd, date -u, systemctl is-active, ls, journalctl e delimitadores. O processo de envio concluiu sem erro; a saída individual desses oito comandos no terminal **não foi capturada automaticamente**. Foto fornecida pelo CHEFE anteriormente comprova execução visível de `echo PONG_CENTRALDARK_1015` no Bash `root@CENTRALDARK-OS`; também evidencia que `>`/`>>` sofreram fragmentação em uma tentativa.
6. Se houver necessidade de provar resposta e desempenho, fazer readback por terminal/SSH autorizado e capturar recibo sanitizado, distinguindo explicitamente o caminho de observação. `SEND_OK != EXECUTION_PASS`; screenshot histórico != runtime atual. Não alterar prompt, sessões de IA ou diretórios do usuário por engano.

### Log e recibo: encaixar no funil existente

- Fonte bruta Casa: `K:\\TEMP\\logs\\LOGS-VS-CODE.log` (junção para `F:\\TEMP\\CentralDark`). Coletor existente `scripts/casa/vscode-log-bridge.ps1`, agendador `CentralDark-VSCode-LogBridge`, launcher invisível `scripts/casa/vscode-log-bridge-hidden.vbs`.
- PR existente **#1820**, branch `feat/vscode-log-funnel-casa-20261014`, skill canônica `.agents/skills/centraldark-vscode-log-bridge/SKILL.md`; ingestão `scripts/vps/ingest-vscode-log.mjs` → owner `apps/modulos/mcp/src/log-funnel.js` → `events`, `sectors/vscode`, `services/vscode` → API admin autenticada.
- Não assumir que os comandos do terminal já entram automaticamente no `LOGS-VS-CODE.log`: cobertura dessa fonte **UNKNOWN**. Não registrar comandos, chats, tokens, chaves, stdout bruto ou prompts. Registrar somente metadados sanitizados (tipo de ação, resultado, timestamp, owner, fingerprint, origem e próximo cursor), pelo mesmo funil quando a integração estiver comprovada.
- Prova da Casa em 15/10: log de origem com 3.027.886 bytes, tarefa `Ready`/`LastTaskResult=0`/`wscript.exe`; dry-run `signals=0 offset=3027886->3027886`. Isso prova ausência de novos sinais **nessa fonte**, não captura das ações da sessão.
- PR #1820 medido `OPEN`, `MERGEABLE`, `isDraft=false` no HEAD `fdb2a1a32c5ea5f656126ff16817228b7d9ee507`; merge/main, CI same-HEAD e implantação são provas separadas. Não mergear automaticamente. A árvore local `K:\\` tinha alterações pré-existentes e divergência de main; não fazer `git pull/reset` nem sobrescrever.

### Fixed point

`TARGET_WINDOW → TARGET_TERMINAL → FOCUS_READBACK → SEND_ONCE → READBACK → CONTRAPROVA → RECEIPT_SANITIZADO → NEXT_CURSOR`.

O ponto fixo atual é **rota de envio demonstrada e documentação reutilizável**, não automação de saída/observabilidade universal. Evoluir só os owners existentes; só promover PASS para o escopo efetivamente observado.


## 🪬 ZENDRIVE CLI no VS Code — v0.1.1, circuito de telemetria (15/10/2026)

- **Comando instalado:** `CentralDark: ZENDRIVE CLI (terminal existente)` (`centraldark.zendriveCli`), na mesma extensão `centraldark.centraldark-vscode-restore@0.1.1`. Reutiliza `vscode.window.activeTerminal` ou um terminal existente reconhecido; chama `terminal.show(false)`; **não cria nem inicia outro Hermes**. É um comando de foco, não uma nova API/modelo ChatGPT.
- **Observação de shell:** `onDidStartTerminalShellExecution`, `onDidEndTerminalShellExecution`, `onDidChangeTerminalShellIntegration` do VS Code. Só quando a integração de shell estiver disponível. O listener roda no host de UI Windows e emite linhas sintéticas **sanitizadas** na fonte preexistente `K:\TEMP\logs\LOGS-VS-CODE.log`, sem criar arquivo, coletor, scheduler ou serviço novo. Campo `centraldark.restore.terminalTelemetry=true` por padrão, desativável.
- **Privacidade:** evento `cli_focus|shell_start|shell_end|shell_integration`, classe `exit=ok|nonzero|unknown` e timestamp UTC. Não lê nem escreve texto de comando, stdout/stderr, chat, chave, cookie ou conta. Falha do log não impede uso do terminal.
- **Prova do código:** `npm run compile` compilou, `npx @vscode/vsce package --offline` gerou `centraldark-vscode-restore-0.1.1.vsix` (17.168 bytes); `code --install-extension --force` retornou 0 e `code --list-extensions --show-versions` mostrou `centraldark.centraldark-vscode-restore@0.1.1`. Teste Node com API VS Code simulada: comando registrado, foco no terminal existente, zero terminais novos, 4 eventos sem conteúdo sensível e classes de exit testadas — PASS.
- **Prova real do funil (evento CONTROLADO, não shell nativo):** um marcador `event=integration_probe source=controlled_test` elevou a fonte de 3.027.886 para 3.028.022 bytes; agendador existente processou e avançou cursor para 3.028.022 pela rota `tailscale`. VPS materializou `kind=vscode_log_signal`, `key=vscode:terminal`, `end_offset=3028022`; heartbeat `accepted=1,duplicate=0` e heartbeat seguinte `accepted=0`. Isso prova **fonte → agendador → SSH → log-funnel**, não que o listener da extensão tenha disparado em uma janela já aberta.
- **Pendência exata:** reinicialização/ativação da extensão na janela do VS Code já aberta e readback de evento `shell_start/shell_end` produzido por comando real. Não reiniciar a bancada sem preservar as sessões. Não declarar captura de saída do terminal. Frequência atual do coletor: **1 minuto**, não streaming instantâneo.
- **Provider Zendrive:** alias `zendrive-chatgpt-local` já pertence a `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`; testes de source e simulação históricos. Medição nesta sessão: Hermes Gateway VPS `active`, MCP VPS `active` e HTTP 9100 `200`; Omni 8099 `000` na VPS, CDP 9222 `CLOSED` na Casa. **Não há sessão ChatGPT Premium/API conectada por este comando**; não copiar cookies ou presumir créditos de API.
- **Receita universal para ChatGPT/SOL, Hermes e outros executores autorizados:** localizar janela e terminal corretos → focar → enviar uma intenção → conferir retorno → registrar apenas metadados no mesmo funil → contraprova → recibo → próximo cursor. `SEND_OK != EXECUTION_PASS`; `SOURCE_COMMITTED != RUNTIME_ACTIVATED`.

**Owners sem duplicação:** `skills/vs-code-restore` (UI/CLI); `.agents/skills/centraldark-vscode-log-bridge` (telemetria/receita); `apps/modulos/mcp/src/log-funnel.js` (ingestão); `apps/modulos/HERMES-CORE` (executor); `apps/modulos/elite-gateway` (provider Zendrive). PR de logs #1820 continua independente de merge/deploy.


## Contraprova nativa da extensao na janela aberta — 15/10/2026

- VS Code Casa PID volátil `26296`: Command Palette exibiu `CentralDark: ZENDRIVE CLI (terminal existente)`; `InvokePattern.Invoke()` do item de menu retornou sem erro. A interface voltou a focar `xterm-helper-textarea` (Terminal 9 Bash); nenhum novo terminal foi solicitado pelo comando.
- **Readback direto do listener instalado:** `LOGS-VS-CODE.log` cresceu de `3028022` para `3028123` bytes com linha `[INFO] [terminal] centraldark.zendrive_cli event=cli_focus exit=unknown utc=...`. Conteúdo de comando/chat não foi registrado.
- **Readback na VPS:** `logs/sectors/vscode/2026-10-15.jsonl` materializou `kind=vscode_log_signal key=vscode:terminal end_offset=3028123`; heartbeat `route=tailscale accepted=1 duplicate=0`; heartbeat seguinte `accepted=0`. **FOCO + EMISSAO NATIVA + INGESTAO NO FUNIL = PASS**, apenas para `cli_focus`.
- Teste de `echo ZENDRIVE_CLI_PING_1015` enviado no Bash remoto teve foco/Enter enviados, porém **não** aumentou a fonte e **não** produziu `shell_start/shell_end`; provável ausência de integração de shell nesse terminal, mas a causa exata não foi provada. **CAPTURA UNIVERSAL DE COMANDOS = NOT_PROVEN**; saída do echo não foi capturada automaticamente.
- A função de coordenação ChatGPT/SOL continua nesta conversa, não vira automaticamente API ChatGPT Premium. Hermes permanece executor oficial. Não duplicar Hermes nem criar leitor de stdout bruto.


## Shell start/end — prova posterior (15/10/2026)

Depois da leitura imediata do teste Bash, o arquivo Casa recebeu **dois eventos nativos adicionais** do listener da extensão: `shell_start exit=unknown` em `2026-10-15T01:37:05.779Z` e `shell_end exit=ok` em `2026-10-15T01:37:05.792Z`. A fonte avançou `3028123 → 3028322`. O funil VPS registrou dois `vscode_log_signal key=vscode:terminal` com offsets `3028226` e `3028322`; heartbeat `accepted=2 duplicate=0 route=tailscale`, seguintes `accepted=0`.

**SELO EXATO:** a extensão observou e entregou pelo menos um par de início/fim de execução; **não** é possível atribuí-lo com segurança ao `echo` anterior ou a um terminal específico, porque o evento deliberadamente não transporta comando, saída nem identidade do terminal. Captura universal e correlação por terminal seguem pendentes; não extrapolar.


## 🍒 Sensor rápido PID/HWND + Saída/Trace — 15/10/2026

**INTENT_ID:** CENTRALDARK-VSCODE-FOCUS-TRACE-20261015 · **OWNER:** esta mesma skill
(`skills/vs-code-restore`), sem extensão, executor, monitor ou coletor paralelo.
O ChatGPT/SOL usa a rota Desktop Commander **SEGREDO Windows**;
o conector Remote Desktop Commander de outra conta pode listar **CENTRALDARK-OS Linux**.
Nunca adivinhar deviceId, PID, HWND nem aba de terminal com base em fotografia antiga.

### Receita reproduzível (rápida, sem disputa com Hermes)

1. `list_devices` nos conectores disponíveis; escolher a Casa Windows online.
2. **Sensor em uma única chamada** (Windows PowerShell, só inventário):
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'K:\skills\vs-code-restore\tools\focus-vscode-window.ps1' -Mode Inventory`.
   Retorna JSON compacto: quantidade de janelas Code, PID, HWND, título truncado,
   retângulo e `foreground`. PID e HWND são voláteis; remedir antes de cada ação.
3. **Foco sem digitar:** repetir o script com
   `-Mode Focus -TargetPid <PID> -WindowHandle <HWND>`.
   A rotina reidentifica processo `Code`, janela `Visual Studio Code` e workspace
   `CentralDark`, chama `SetForegroundWindow` e exige readback `GetForegroundWindow`.
4. **Foco + foto:** `-Mode FocusCapture -TargetPid <PID> -WindowHandle <HWND>`.
   Faz `GetWindowRect` e `CopyFromScreen`, redimensiona a foto para até 1440px,
   devolve caminho local e tamanho. A imagem fica no `%TEMP%` da Casa, não no Git.
   Para vê-la neste chat, usar `read_file` do conector Casa: resultado traz image
   part base64. `Capture` sem foco pode fotografar janelas sobrepostas.
5. **Trace opt-in:** acrescentar `-EmitTrace` em `Inventory`, `Focus` ou
   `FocusCapture`. Só escreve `window_inventory|window_focus|window_capture`,
   status `observed|pass|fail`, PID, HWND e timestamp no
   **mesmo** `K:\TEMP\logs\LOGS-VS-CODE.log`, se ele já existir.
   Reusa o agendador `CentralDark-VSCode-LogBridge` →
   `scripts/casa/vscode-log-bridge.ps1` → SSH/Tailscale →
   `scripts/vps/ingest-vscode-log.mjs` → `log-funnel.js`.
   Não grava comando, texto de chat, stdout, título, imagem, cookie nem segredo.
6. **Saída nativa:** após compilar/instalar a fonte atualizada da extensão,
   paleta `CentralDark: Mostrar Trace (Saída)` ou
   menu `Exibir → Saída → CentralDark Trace`. Este `OutputChannel` interno
   mostra somente `activate|show_trace|cli_focus|shell_start|shell_end|
   shell_integration|workspace_map|restore` com estados.
   Ele **não lê a Saída de outras extensões**, **não captura stdout do Hermes**,
   nem prova automaticamente que o servidor remoto executou um comando.
7. **CLI de verdade (modo com escrita, separado):** somente após identificar
   controle `xterm-helper-textarea` do terminal existente, confirmar foco
   por UIAutomation e autorização do escopo; preferir API nativa
   `centraldark.zendriveCli` para focar a sessão já ativa. Enviar **um**
   comando de teste inofensivo, validar retorno com screenshot novo e,
   quando aplicável, logs do próprio processo/SSH. Não usar SendKeys para
   scripts arbitrários, nem emitir comandos na sessão Haiku enquanto ele
   escreve/compila. `SEND_OK != COMMAND_EXIT_0 != E2E_PASS`.

### Guardas e provas

- Nenhum `-Restore`, auto-agente, terminal novo, `git pull/reset`, `npm install`,
  merge, deploy ou reinício de VS Code durante medição.
- `CURRENT` de 15/10: `Code.exe` PID **12268**, handle **657456**
  (são observações históricas, não IDs estáveis). O script foi executado
  em `Inventory` e `FocusCapture` na Casa: **2 janelas**, `status=OBSERVED`,
  foco `FOCUS_READBACK_PASS`, screenshot JPG 196.498 bytes,
  `no_terminal_input=true`. Testou-se depois do foco uma captura real do VS Code.
- **Atenção à fonte:** o script novo com `-EmitTrace` e a alteração
  `CentralDark Trace` foram escritos no GitHub em branch isolada; **não são
  prova de extensão ativada/reinstalada no VS Code**. O teste anterior provou
  somente `Inventory/FocusCapture`; o evento trace novo no funil e a aba
  Saída precisam de teste do runtime após instalar o pacote.
- A política PowerShell do processo inicial bloqueou execução de `.ps1`;
  a rota já prevista nesta skill
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ...`
  funcionou **somente naquele processo** e não modifica a política global.
- Speed path: `DEVICE → INVENTORY(JSON) → FOCUS_READBACK → CAPTURE → TRACE_OPT_IN
  → INSPECIONAR → (AUTORIZAR CLI) → EXECUTAR UMA VEZ → COMPARAR → RECEIPT`.
  `UNKNOWN != PASS`; Output UI não é log bruto do terminal.


### Readback adicional — trace real na Casa, 15/10

- Script atualizado `K:\skills\vs-code-restore\tools\focus-vscode-window.ps1` carregado
  por `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ...`.
- `-Mode Inventory -EmitTrace`: `EXIT=0`, duas janelas encontradas, origem
  `K:\TEMP\logs\LOGS-VS-CODE.log` avançou `3030328 → 3030578` bytes,
  incluindo `event=window_inventory state=observed` e
  `event=window_focus state=fail` (falha por ambiguidade: nenhuma janela VS Code
  era `foreground`, exigiu `-WindowHandle`).
- `-Mode FocusCapture -TargetPid 12268 -WindowHandle 657456 -EmitTrace`
  foi tentado em seguida; `FOCUS_RC=1`, pois Windows não concedeu
  `SetForegroundWindow` com readback válido naquele momento.
  Origem avançou `3030578 → 3030708` com `window_focus state=fail`.
  A rotina recusou captura, clique e comando. **Falha segura comprovada.**
- A execução anterior, enquanto VS Code estava em primeiro plano,
  havia passado `FOCUS_READBACK_PASS` com screenshot. Foco é estado volátil.
  Não usar PASS histórico como prova de foco atual; repetir medição e
  escolher `-Mode Capture -TargetPid ... -WindowHandle ...` se foco estiver
  bloqueado (a captura pode incluir oclusões, classificar como `UNKNOWN`).
- **Atenção:** origem escrita `!=` evento ingerido na VPS; a transferência
  agendada, o readback no `log-funnel` e o comando `CentralDark: Mostrar Trace`
  ainda precisam de prova pós-ativação da extensão. Não publicar IP, títulos,
  command-line, cookies, payloads ou imagem em receipt.


## 🦜 Semântica Papagaio Fiel — repetição correta da skill

**Regra do CHEFE:** a capacidade comprovada deve ser **incorporada no owner** e reaplicada
em qualquer janela/sessão com a mesma semântica, não por copiar o PID, a saída antiga
ou o texto de uma resposta. **Fiel = reproduzir o método e seus limites, não repetir
um PASS histórico.** Este contrato rege o uso desta mesma `vs-code-restore`.

### Máquina de estados de cada repetição

| Etapa | Pré-condição | Saída observável | Se falhar |
|---|---|---|---|
| 0. INTENT | Nova fala do CHEFE = delta; distinguir pergunta, observação e ordem | INTENT_ID + escopo + autorização | Sem supor autorização |
| 1. OWNER | Consultar `skills/vs-code-restore` e telemetria existente; comparar fonte e versão instalada | OWNER + git SHA + runtime-version + escritor atual | UNKNOWN, nenhuma skill duplicada |
| 2. DEVICE | `list_devices` e selecionar **Casa Windows SEGREDO online** (não a VPS Linux) | device ID atual e estado online | OFFLINE → registrar NEXT_CURSOR, sem inventar leitura |
| 3. MAP | `Inventory` no mesmo script de PID/HWND | JSON atual: janelas, PID, handle, foreground, retângulo | AMBIGUOUS → pedir/derivar alvo atual; jamais usar ID de outra rodada |
| 4. FOCUS | `Focus -TargetPid ... -WindowHandle ...` somente no alvo confirmado | readback GetForegroundWindow com mesmo HWND | FAIL → não enviar teclado/clique |
| 5. CAPTURE | `FocusCapture` ou `Capture` com ressalva de oclusão | arquivo JPG real + tamanho + timestamp | UNKNOWN, nunca fabricar screenshot |
| 6. CLI (se autorizado) | terminal correto identificado via API nativa/ZENDRIVE ou UIAutomation, writer único, escopo permitido | comando + resultado e exit code pelo processo **quando observáveis** | SEND_OK ≠ EXECUTION_PASS; sem eco imaginário |
| 7. TRACE | `-EmitTrace` opt-in; reutilizar `LOGS-VS-CODE.log` | novos bytes + evento sanitizado + offset local | ausência de evento = UNKNOWN; sem coletor extra |
| 8. PIPELINE | scheduler existente → vscode-log-bridge → SSH/Tailscale → ingest-vscode-log → log-funnel | ACK remoto do mesmo offset, accepted/deduplicated + evento recente | local PASS / VPS UNKNOWN ou ATTENTION |
| 9. RECEIPT | Critic/readback independente no **mesmo SHA** | INTENT_ID, OWNER, MAIN_SHA, ACTIVE_WRITER, ROUTE, OBSERVATION, PROOF, COUNTERPROOF, STATUS, NEXT_CURSOR | nunca GREEN sem readback |

### Semântica obrigatória (para que outro ChatGPT, janela ou executor repita fielmente)

- **OBSERVADO:** somente o que a ferramenta retornou nesta execução; separar `USER_SCREENSHOT`,
  `LIVE_TOOL`, `SOURCE_COMMITTED`, `RUNTIME_ACTIVATED`, `E2E_PROVEN`.
  `Screenshot != runtime comprovado`; `source != deployed`.
- **REUSAR ANTES DE CRIAR:** primeiro extensão `centraldark-vscode-restore`, comando
  `centraldark.zendriveCli`, script `focus-vscode-window.ps1`, log da Casa,
  tarefa `CentralDark-VSCode-LogBridge` e `log-funnel`. Não criar clones.
- **REPETIR COMO ALGORITMO:** reconsultar dispositivos, PID, HWND, estado do terminal
  e offsets **sempre**. Nunca reproduzir ids, coordenadas, caminhos temporários,
  resultados ou promessas como se fossem dados atuais.
- **MODO OBSERVAR por padrão:** inventário, leitura e foto não enviam comandos;
  foco explícito só no destino conferido. **MODO EXECUTAR** exige autorização
  do CHEFE, espaço sem escritor concorrente e contraprova do resultado. Não
  sequestrar terminal Hermes/Haiku ocupado nem usar SendKeys arbitrário.
- **FALHA FIEL:** `OFFLINE`, `AMBIGUOUS`, `FOCUS_READBACK_FAILED`,
  `TRACE_SINK_UNAVAILABLE` e `ACK_MISSING` são recibos úteis, não fracassos
  a ocultar. Repetir somente quando houver sensor/hipótese nova; não loopar.
- **LINHAGEM E PRIVACIDADE:** salvar aprendizados **nesta skill e no owner do funil
  já existente**; trace carrega só evento, estado, PID/handle efêmeros e UTC.
  Nunca enviar comando, stdout, chat, tela capturada, token ou cookie ao funnel.
- **INSTALAÇÃO NÃO IMPLÍCITA:** commit/PR não ativa extensão, atualização no
  computador depende de pacote efetivamente instalado + reload controlado +
  comando `CentralDark: Mostrar Trace (Saída)` provado ao vivo, respeitando
  sessão de trabalho existente.

**Esquema mínimo de retorno:** `INTENÇÃO | OWNER | CURRENT (fonte e horário) |
DELTA_EXECUTADO | PROVA | CONTRAPROVA | STATUS | NEXT_CURSOR`. Ao transferir
para outra janela/Haiku, enviar exatamente esse recibo e o endereço desta skill,
não uma suposta memória sincronizada. O novo executor relê e remede; sem `MAIN_SHA`
e provas correntes, classifica `UNKNOWN`.


## 🍒 Convergência da extensão 0.1.3 — fonte, VSIX e Casa

**INTENT_ID:** CENTRALDARK-VSCODE-EXTENSION-CONSOLIDATE-20261015. **CHEFE_INTENT:** antecipar melhorias úteis, sem esperar que os testes de voz estejam disponíveis. Não criar outra skill: o owner continua `skills/vs-code-restore`; o funil continua exclusivamente em `.agents/skills/centraldark-vscode-log-bridge`.

**Convergência de código na MESMA PR #1830:** esta branch preserva o comando `centraldark.zendriveCli` e adiciona `centraldark.focusExistingTerminal` como **alias da mesma função**, além de `centraldark.showTrace` e `OutputChannel("CentralDark Trace")`; `extension.ts` e `package.json` foram reconciliados para **0.1.3**. Não habilitar `restore.onOpen` nem `startAgents` automaticamente; ambos permanecem `false`.

**Contrato de evolução antecipada:** preparar e testar separadamente (a) acessibilidade de nomes da paleta, (b) visibilidade de eventos sanitizados na aba `Saída`, (c) sensor PID/HWND e captura no script existente, (d) fluxo único de logs Casa→VPS, (e) recibos para o cockpit. `SOURCE`, `VSIX_BUILT`, `VSIX_INSTALLED`, `ACTIVATED`, `FUNNEL_RECEIVED` e `UI_PROVEN` são estados distintos. A extensão não captura áudio, conversa, credenciais, comandos, stdout nem telas para o funil.

**Receita real comprovada na Casa, 15/10:** Desktop Commander `SEGREDO` Windows → preparar diretório de teste `K:\TEMP\work\centraldark-vscode-restore-next-20261015` separado da skill ativa → copiar somente fontes/manifesto da branch e configs públicas reutilizáveis → aproveitar `node_modules` já existente via junction → `node .../typescript/bin/tsc -p <STAGE>` (`TSC_RC=0`) → `npx.cmd --offline --yes @vscode/vsce package --no-dependencies --allow-missing-repository -o <STAGE>/centraldark-vscode-restore-0.1.3.vsix` (`VSCE_RC=0`) → conferir ZIP/VSIX com `System.IO.Compression.FileSystem` e comandos compilados → `code.cmd --install-extension <VSIX> --force` (`INSTALL_EXIT=0`) → `code.cmd --list-extensions --show-versions` confirma `centraldark.centraldark-vscode-restore@0.1.3`. VSIX: 12.479 bytes, SHA-256 `E035CE1F3E3B89713FAF32764BF198E3A073D6A578BFE18BE99636D4F6F5A64D`. VS Code permaneceu aberto (20 processos observados), sem reload/kill, sem novo terminal ou Hermes.

**Nota sobre instalador:** VSCE mostrou aviso de licença ausente na pasta temporária; empacotamento foi aprovado (`DONE`). Node emitiu aviso `DEP0169 url.parse()` durante instalação, mas processo retornou 0. Avisos não são equivalentes a regressões provadas. Evitar materializar dados privados do `ui-accessibility-20261014.json` no VSIX e não alterar login/tokens.

**Limite presente:** `VERSION_0.1.3_INSTALLED=PASS`; `OUTPUT_CHANNEL_ACTIVATED=NOT_PROVEN`, `COMMAND_UI_E2E=NOT_PROVEN`, `VOICE_ASR_E2E=DEFERRED_BY_CHEFE`; nenhum reload de sessão foi feito. GitHub `main` ainda mantém a linha estável 0.1.2 até gates/merge da PR #1830; a versão 0.1.3 é build da **branch** devidamente identificada. A futura operação deve comparar SHA, arquivo instalado e status dos checks antes de promover à main.

**NEXT_CURSOR:** validar o novo comando e o `CentralDark Trace` depois de um reload **natural/autorizado**, obter evento `show_trace` sanitizado e corresponder ao funnel existente; revisar gates CI da PR #1830 antes de merge. **Nada de nova receita, novo agente ou coletor.**
