---
name: vs-code-restore
description: Restaura a bancada do workspace CentralDark no VS Code (terminais, abas e checagem de extensoes) a partir do mapa salvo, sem depender do Claude. Use ao abrir o workspace CentralDark ou quando quiser reconstruir a bancada.
version: 0.1.4
metadata: {"status":"v0.1.4_source_in_pr_install_pending","mapa":"workspace-map-20261014.json","ultima_versao_local_historica":"0.1.1","candidate_version":"0.1.4","candidate_compilado":false,"candidate_instalado_na_casa":false,"comando_nativo_testado":false,"telemetria_probe":true}
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


## 🎙️ Acessibilidade e correção de ASR — intenção VS Code (15/10/2026)

**Decisão do CHEFE:** quando o ditado da conversa disser `5S` durante uma missão de janela, foco, PID, terminal ou extensão, o objeto correto é **VS Code**, não a metodologia 5S. `esquilos`, `skil` e variantes podem significar **skills** no contexto de registrar/incorporar a receita. Não reescrever as palavras originais do usuário nem aplicar substituição global: interpretar **por intenção e escopo**.

**Comportamento da extensão e dos operadores:**
- Manter os comandos já implementados (`centraldark.zendriveCli`, `centraldark.mapVscodeUi`, `centraldark.showTrace` quando instalado); aliases fonéticos são formas de **localizar** o mesmo comando, não novas implementações, nem executores.
- Frente ao pedido “foca o VS Code”: inventariar janelas frescas, confirmar PID/HWND, focar a sessão comprovada e observar retorno; não selecionar PID antigo nem criar terminal adicional.
- Frente a “esquilos/skills”: buscar a skill de owner antes de criar qualquer outra; reusar `skills/vs-code-restore` para UI e `.agents/skills/centraldark-vscode-log-bridge` somente para eventos.
- Se a interpretação puder executar comandos, alterar arquivos ou afetar permissões, pedir confirmação **somente se houver ambiguidade material**; execução autorizada mantém writer único por escopo.
- Para acessibilidade da interface, preferir rótulos e descrições inequívocos na paleta (`VS Code`, `Terminal existente`, `CentralDark Trace`) e status legíveis. **Não** fazer captura oculta de áudio ou transcrição de conversas; a extensão não escuta o microfone.

**Casos de teste semântico**: “5S, foca a janela” ⇒ foco VS Code, “esquilos, salva receita” ⇒ registrar skill, “abrir Hermes” ⇒ capacidade Hermes existente; palavra realmente desconhecida com duas ações possíveis ⇒ perguntar antes de agir. `ASR_CONFLICT != OPERATOR_COMMAND`.


## 🔌 Terminal interativo VS Code ↔ MCP CentralDark — descoberta e prova de sessão (2026-10-15)

**DELTA do CHEFE:** expor **uma sessão real do terminal integrado VS Code** aos consumidores autorizados do MCP CentralDark e do cockpit Instinto Superior, preservando Hermes e Claude Code que já executam trabalho. Esta é uma evolução de `skills/vs-code-restore` (UI + foco) e da skill existente `centraldark-vscode-log-bridge` (telemetria). **Não criar outro MCP, agente, terminal extra, listener público, capturador de prompt ou segunda janela.**

**Probe comprovada por Remote Desktop Commander Casa:** em 15/10/2026 às 13:28:57 -03:00, janela VS Code `PID=22468 HWND=67400` com `xterm-helper-textarea` em árvore UIAutomation. Em 13:26, `mcp__CENTRALDARK__list_sessions` reportou `No active sessions`. Isso confirma **GUI_PRESENT**, não `MCP_INTERACTIVE_SESSION_BOUND`, nem prova que a mesma `xterm-helper-textarea` pertença a Hermes ou Claude Code. Não selecionar por PID fixo de sessão anterior.

**Catálogo MCP read-only:** `mcp_admin_catalog(filter="remote_desktop")` retornou a rota canônica `RDC_DESKTOP_COMMANDER` para `SEGREDO|mcp.desktopcommander.app/mcp`; `mcp_admin_catalog(filter="terminal")` retornou **0 tools/rotas próprias de terminal**. Portanto `UIA_DISCOVERED=true` e `ATTACH_AND_SEND=UNKNOWN`: a rota do conector alcança a Casa, **mas não fornece attach nativo comprovado ao PTY do VS Code**.

**Receita do mesmo owner, em ordem (somente quando a sessão alvo estiver disponível):**

```text
1) DISCOVER_DEVICE → LIVE_CASA_ID + UTC/TIMESTAMP
2) UIA_FRESH_WINDOW → PID/HWND/title VS Code real + extension owner
3) TERMINAL_ENUM → same window xterm-helper-textarea + nome/shell/parent/owner da sessão
4) CHECK_AGENT_IDLE_OR_AUTHORIZED_INPUT_CHANNEL (Hermes ≠ Claude Code ≠ Bash)
5) FOCUS_TARGET → verify FocusedElement == selected terminal in same window
6) SEND_EXACTLY_ONCE (somente payload inofensivo / missão tipada autorizada)
7) OBSERVE_SHELL_EXIT_OR_AGENT_ACK + CORRELATION_ID + receipt sanitizado
8) MCP_CATALOG_SURFACE → role, provenance, consent, status, not raw terminal scrollback
9) IF_NO_IDENTIFIABLE_SESSION → FAIL_CLOSED + copy-only + NEXT_CURSOR
```

**Não** capturar segredos, comandos completos ou stdout bruto nos logs. `focus()` ≠ `writeText()` ≠ `agent_received()` ≠ `command_pass()`. Nunca enviar `git reset/clean/rebase/push` a uma sessão ocupada. Os comandos de leitura executados pelo **Desktop Commander** criam sessão sob seu próprio gerenciador, não se tornam automaticamente sessões VS Code. Enquanto `list_sessions` estiver vazio ou o target shell/agent não puder ser provado, **não enviar mensagem ao terminal via GUI**.

**Contraprova de concorrência 15/10 13:33 -03:00:** Casa `K:\` HEAD `677fccd4b2`, stash/fetch vivos, `git clean` não observado no instante, sem `index.lock`, `git ls-files --others --exclude-standard` retornou **85.980 untracked**. `WORKTREE_CLEAN_ALLOWED=false`; não disputar alterações do Claude/Hermes, não limpar a Casa principal.

**Projeção no Instinto Superior (sem novo owner):** `apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx` → `GavetaForja` lista `RDC_DESKTOP_COMMANDER`, owner desta skill e `UIA_IDENTIFICADA_SESSAO_NAO_VINCULADA`. A interface é catálogo de disponibilidade, não botão de execução. `NEXT_CURSOR`: implementar binding de sessão **privado e autenticado** no caminho de ferramentas existente, validar ida/ACK do agente em sessão alvo ociosa e somente depois marcar `CONNECTED`.


**Nova contraprova UIA 2026-10-15 13:36 -03:00:** mesma janela VS Code retornou **5** elementos `xterm-helper-textarea`, incluindo `Terminal 6 · claude mcp add screenpipe error`; `AutomationElement.FocusedElement` retornou `ClassName=tiptap ProseMirror ProseMirror-focused, Name=Prompt`. Isto comprova prompt visual **Claude Code** em foco e terminais presentes, mas **não** vincula a sessão `Terminal 6` a um subprocesso/PTY/owner do MCP, nem afirma Claude ocioso. `SEND_ATTEMPTED=false`, `MCP_ACK=UNKNOWN`, `NO_INTERRUPT_OF_OTHER_WRITERS=true`. Reutilizar estes seletores em nova probe com hora e owner; nunca tratar cinco textareas como cinco sessões de execução comprovadas.


## 🧩 Script versionado da rota UIAutomation — 15/10/2026

O arquivo `skills/vs-code-restore/tools/focus-vscode-window.ps1` passou a existir na fonte canônica da `main` (commit de criação `68a7ceb011f4b2e06c6624433f4e62b2fada9ca8`). Ele implementa somente `Inventory`, `FocusTerminal` e `SendText`, sempre com readback de foco; `SendText` registra hash/comprimento e exige flag explícita para mutações.

**Contraprova Casa:** ao materializar o mesmo blob em `K:\TEMP\work\focus-vscode-window-main.ps1` e chamar `-Mode Inventory`, o Windows retornou `PSSecurityException / execução de scripts desabilitada`. Portanto `SCRIPT_SOURCE=PASS`, `SCRIPT_RUNTIME=BLOCKED_POLICY`. **Não usar `ExecutionPolicy Bypass`, não alterar política global e não converter esse bloqueio em FAIL do VS Code.**

Fallback dentro do mesmo owner: preferir o comando nativo já instalado `CentralDark: ZENDRIVE CLI (terminal existente)` / `centraldark.zendriveCli`, que usa a API do VS Code e não depende da execução externa de `.ps1`. Se a extensão não estiver ativa, classificar `UNKNOWN` e solicitar/realizar somente o reload autorizado com preservação das sessões. O script permanece útil em máquinas cuja política permita sua execução assinada/confiável.

**Receita atualizada:** `EXTENSION_NATIVE_FIRST → UIAUTOMATION_SCRIPT_IF_POLICY_ALLOWS → FOCUS_READBACK → SEND_ONCE → SEPARATE_EXECUTION_READBACK → RECEIPT_SANITIZADO`. `POLICY_BLOCKED != ROUTE_UNAVAILABLE`.

## MCP CentralDark — sessão interativa vinculada ao VS Code (2026-10-15)

**Objetivo:** reutilizar o Desktop Commander/MCP CentralDark e esta skill como owner da rota visível de foco/digitação, sem criar terminal-bridge concorrente.

```text
LIST_DEVICES
→ LIST_SESSIONS(device=SEGREDO)
→ CLASSIFY_PID_READONLY
→ READ_PROCESS_OUTPUT(pid)
→ ONLY_IF_SHELL_OWNER_KNOWN: SEND_HARMLESS_PROBE
→ READBACK_REQUIRED
→ SEND_ACCEPTED + NO_OUTPUT = SEND_ACCEPTED_READBACK_UNKNOWN
→ SEND + MATCHING_OUTPUT = INTERACTIVE_SESSION_PROVEN
→ THEN typed task may be sent only inside authorized owner/scope
```

**Cadeados:** não usar PID por posição histórica; não escrever em Vite, builder, watcher ou processo desconhecido; não usar comandos destrutivos, deploy ou segredo como sonda. Antes de mensagem real para Claude/Hermes, provar qual sessão é shell/REPL e capturar readback correspondente. Texto no chat ou `Input executed` sem saída não comprova que o comando foi consumido pelo terminal visível.

**Medição 2026-10-15:** o MCP CentralDark expôs cinco sessões PowerShell na Casa. A sessão `PID 34080` aceitou a entrada inofensiva `Write-Output '__CENTRALDARK_INTERACTIVE_PROBE__'`, porém não produziu saída nem em leitura posterior; portanto `SEND_ACCEPTED_READBACK_UNKNOWN`, não `INTERACTIVE_SESSION_PROVEN`. Outras sessões observadas incluíram Vite/Instinto e Artifacts Builder; não foram reutilizadas como terminal de comando.

**NEXT_CURSOR:** mapear PID ↔ terminal visível do VS Code/Claude/Hermes por evidência não destrutiva; só então usar `interact_with_process` para comando real e registrar `SEND/OUTPUT/EXIT_OR_PROMPT` no receipt existente.


## 🪬 ZENDRIVE CLI — acesso SSH Casa → VPS sem Desktop Commander (17/10/2026)

**Mesma extensão/owner:** `skills/vs-code-restore` v0.1.3. Não instala daemon,
não duplica Hermes, não exige Desktop Commander, não modifica
`C:\Users\Administrador\.ssh\config` nem transporta chave.

No VS Code (`Ctrl+Shift+P`), a extensão oferece:

- **CentralDark: Testar rota SSH Casa → VPS (Tailscale / pública)**:
  executa um probe de leitura com o `ssh.exe` já existente, priorizando
  `100.90.199.124` e usando a rota pública somente como fallback.
  O comando testa a identidade SSH existente `segredo-vpss`, exige
  `BatchMode=yes` e `StrictHostKeyChecking=yes`, e registra apenas
  rota, estado e hostname lido na saída `CentralDark — SSH Casa/VPS`.
- **CentralDark: Conectar VPS via Remote SSH (mesma identidade)**:
  realiza o probe e, se responder, abre o **seletor oficial**
  `remote-ssh.connectToHost` do VS Code, caso instalado. O usuário
  escolhe ali o alias já configurado. A extensão não cria conexão
  ou identidade SSH paralela.

**Distinção:** o probe Tailscale aplica um override efêmero de `HostName`
com `HostKeyAlias` já fixado; o seletor Remote-SSH respeita o **arquivo
SSH configurado pelo usuário**, normalmente o alias público. O botão NÃO
muda silenciosamente o `Remote-SSH` para Tailscale, não reescreve host
config e não assume que a extensão Microsoft Remote-SSH esteja instalada.

**Control plane complementar:** `apps/modulos/mcp` continua sendo o
MCP oficial da CentralDark. A consulta `tailscale_bridge_status`
agora pode consultar `tailscale status --json` LOCALMENTE na VPS se
o OAuth Broker da porta 8098 falhar, expondo somente contagens e booleanos.
`BROKER_DOWN` e `TAILSCALE_LOCAL_ONLINE` são estados diferentes;
nenhum deles sozinho prova acesso SSH Casa↔VPS ou Tailscale API autenticada.

**Instalação:** a mudança é código-fonte de branch/PR e precisa ser
compilada/instalada como atualização da extensão da Casa, preservando o
VS Code e o workspace existentes. Nunca inferir instalação local pelo
commit. O runtime MCP precisa carregar o código atualizado para refletir
o fallback.

**Fronteira:** nenhum push automático, reset, limpeza da Casa, abertura
pública de porta, edição do cofre, rotação de credenciais, deploy ou
alteração na `main` por estes comandos. Probe e navegação apenas.

**Teste discriminante na Casa após instalar:** terminal VS Code
`Ctrl+Shift+P` → `CentralDark: Testar rota SSH Casa → VPS` →
procurar `[OK] TAILSCALE` ou `[OK] PUBLIC_FALLBACK` na saída;
`Conectar VPS via Remote SSH` deve abrir o seletor nativo e permitir
selecionar `segredo-vpss`. Capturar rota e readback do SSH remoto;
não mudar o alias se o usuário tiver um workspace aberto.

**NEXT_CURSOR:** comparar source/branch com o checkout `K:\` sujo
antes de atualizar o VSIX; medir `TSC_EXIT`, `REMOTE_SSH_PICKER_OPEN`,
`SSH_READBACK` e `MCP_LOCAL_FALLBACK` de maneira independente.


## 🦀 ZENDRIVE 0.1.4 — navegador conectado + PID → VS Code (17/10/2026)

**Capacidade observada via plugin Browser da sessão ChatGPT:** `list_tabs`
enumera abas da sessão de navegador conectada e `get_tab_context`
lê o contexto disponível daquela aba. Esta observação acontece no
**cliente ChatGPT**; não transfere permissão, login, DOM completo,
controle de clique nem stdout ao runtime VPS/VS Code. A marca
`Interacted with Browser` descreve uso de ferramenta do browser,
não significa acesso universal a todos os botões ou manipulação da página.

**Mesma extensão ZENDRIVE, novos comandos no `Ctrl+Shift+P`:**

- `CentralDark: Localizar VS Code por PID (PowerShell / terminal)`
  (`centraldark.locateVsCodeByPid`): aceita PID decimal opcional.
  Sem PID, observa processos `Code.exe` com janela visível; com PID,
  segue `Win32_Process.ParentProcessId` até 20 níveis ou até
  `Code.exe`. Cruza terminal nativo `terminal.processId`,
  `process.pid` do Extension Host, nomes dos workspaces e
  `vscode.env.remoteName`. Mostra relatório no painel Saída
  `CentralDark — Rastreio PID/VS Code`. **Não abre outro Code, não
  altera foco, não escreve arquivo e não lê mensagens.**
- `CentralDark: Catálogo de abas e capacidades Browser/ZENDRIVE`
  (`centraldark.browserSurfacesCatalog`): expõe os limites
  reais da API VS Code e do Browser da sessão ChatGPT na
  saída `CentralDark — Catalogo Browser/ZENDRIVE`.
  **Catálogo não equivale a conexão local entre plugins.**

**MCP canônico, owner preservado:** em
`apps/modulos/mcp/src/tools/core/mcp-admin.js`,
`DELEGATED_PROVIDER_CAPABILITIES` inclui
`CHATGPT_BROWSER_TABS_CONTEXT` com estado
`OBSERVED_CLIENT_SIDE_ONLY` e
`ZENDRIVE_VSCODE_PID` com
`SOURCE_ONLY_UNTIL_VSIX_INSTALLED`. O catálogo não oferece
método de executar comandos no cliente ChatGPT; os plugins têm
escopos/autorização próprios. Nenhum segundo gateway/MCP criado.

**Exemplo do CHEFE:** PIDs `21172` e `40756` apareceram como
PowerShell lançado por ferramenta. A correlação com `Code.exe`
só pode ser afirmada se o PID ainda existir e a cadeia ancestral for
observada nessa mesma sessão Windows; um PID de processo encerrado
não constitui vínculo permanente. PID `12268` de VS Code foi um
snapshot histórico, não assumir atual.

**Readback após compilar/instalar VSIX 0.1.4 na Casa:**
`Ctrl+Shift+P` → localizador → informar PID atual ou deixar vazio →
confirmar saída `Processos Code.exe`, `Janela VS Code: PID`,
`Cadeia: PID=... pai=... exe=...`. Em seguida abrir
`Catálogo de abas e capacidades Browser/ZENDRIVE`.
Status compilação/VSIX instalado permanece separado de código em PR.

**Fast Path:** CLI já existente → PID → Code.exe/window →
workspace atual → terminal existente → Hermes → feedback.
Sem Remote Desktop Commander; usa API nativa e observação Win32
somente na Casa com extensão instalada.

**NEXT_CURSOR:** build tsc, VSIX 0.1.4, invoke commands, validar PID
de shell ativo e terminal; depois medir bridge remoto independente.


## 🧿 DOM VIVO — inspeção da própria aba do Cockpit (2026-10-17)

**Goal do CHEFE:** localizar conflitos de DOM da página que está aberta no
Chromium ZENDRIVE sem exigir outro navegador, serviço, executor, painel paralelo
ou concessão implícita de acesso às abas.

**Owner de interface:** `apps/instinto-superior/src/components/central/DesignCenter.tsx`
(aba **Design Center → DOM Vivo**, somente para sessão autenticada).

**Fast Path:**
1. Abrir o Cockpit atual no Chromium; Design Center → DOM Vivo.
2. Clicar **Medir agora** ou **Ao vivo · 3s**. A inspeção roda no contexto da
   página renderizada, sem rede, sem mexer no DOM e sem solicitar credenciais.
3. Ler métricas de elementos/viewport/documento e a lista de candidatos
   `ID_DUPLICADO`, `ARIA_ALVO_AUSENTE`, `TRANSBORDO_HORIZONTAL`,
   `CONTROLE_ENCOBERTO`. Cada linha apresenta o alvo e o motivo;
   sobreposição por popover/modal pode ser intencional.
4. **Copiar recibo DOM** para correlacionar com o owner React/CSS,
   corrigir no mesmo componente e repetir a medição.
5. A aba mostra leitura **somente do seu próprio `document`**,
   não inspeciona iframes cross-origin, outras abas nem processos Windows;
   a amostra limita o processamento aos primeiros 6.000 elementos e
   180 controles na viewport.

**Fronteira de autorização:** no contexto deste chat, o conector Browser
`list_tabs` respondeu `Browser access requires the originating browser context`.
Esse erro **não** significa que o Chromium ZENDRIVE esteja offline:
significa que esta conversa não herdou acesso à instância de origem.
O código DOM Vivo resolve a observação **dentro do próprio Cockpit**;
não promete controle da aba externa por ChatGPT.

**Situação:** código commitado em branch/PR #1842. Build e atualização do
preview `localhost:3000` dependem da promoção do delta para o checkout
da Casa pelo único writer autorizado. PR #1838 mantém
`ObservabilidadeCentralDark.tsx` como owner do Tool Call Lens; não
mover a auditoria DOM para lá ou criar segundo coletor.

**Readback discriminante:** conferir 4 peles, mobile/desktop,
duplicidades de ID e referências ARIA, largura scroll e botões cobertos.
`ZERO_ACHADOS` não significa acessibilidade perfeita nem resolução de todos
os conflitos de CSS. Nunca marcar reparado sem teste de tela.

## 🧬 Fast Path autônomo — instalar/conectar/provar/antirregressão

A extensão ZENDRIVE não conclui missão quando o código foi commitado. O ciclo do CHEFE é:
**CONSTRUIR → INSTALAR → CONECTAR → PROVAR → ANTIRREGRESSÃO**, no mesmo owner.

- Construir: TypeScript, lint/testes relevantes, versão e artefato VSIX com SHA.
- Instalar: no VS Code já aberto e autorizado da Casa, reler versão da extensão instalada; preservar sessão atual.
- Conectar: usar SSH existente/terminal existente; identidade e handshake medidos, sem importar segredo.
- Provar: observar a ferramenta nativa, PID e saída/exit de comando diagnóstico; correlacionar recibo com o MCP quando a chamada realmente atravessar o MCP.
- Antirregressão: repetir comando ZENDRIVE CLI, localizar VS Code por PID, rota SSH, abas e UI existente, erros de console.

Automação de desenvolvimento permitida onde houver execução autorizada; merge em main, produção VPS e modificação de credenciais precisam do gate de promoção do CHEFE. Falhou uma fase: parar e guardar error_code, sha, owner e next_cursor. Documento canônico: docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md.
