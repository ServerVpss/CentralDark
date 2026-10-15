---
name: vs-code-restore
description: Restaura a bancada do workspace CentralDark no VS Code (terminais, abas e checagem de extensoes) a partir do mapa salvo, sem depender do Claude. Use ao abrir o workspace CentralDark ou quando quiser reconstruir a bancada.
version: 0.1.0
metadata: {"status":"build_instalado_runtime_pending","mapa":"workspace-map-20261014.json","compilado":true,"instalado_na_casa":true,"comando_nativo_testado":false}
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
