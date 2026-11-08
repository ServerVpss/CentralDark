<!-- CENTRALDARK_MISSION_HUD_FIXED_PROTOCOL -->
## HUD operacional conversacional — ponto fixo de apresentacao

<!-- CENTRALDARK_MINIMUM_COMMIT_SYNC_RULE_20261107 -->
**REGRA FIXA DO CHEFE — NENHUM DELTA SEM COMMIT; CASA SEM ATRASO:** toda alteração útil, por menor que seja, deve ser registrada no owner existente e receber commit específico, publicação na `main` conforme proteções e leitura de confirmação. Nunca encerrar um ciclo como sincronizado enquanto o checkout da Casa estiver com commits atrás da `main`.

**SEQUÊNCIA OBRIGATÓRIA:** `INTENÇÃO → OWNER EXISTENTE → MENOR DELTA → CASA/OWNER (quando acessível) → TESTE/CONTRAPROVA → COMMIT MÍNIMO → PUSH MAIN → RECONCILIAR CASA COM MAIN → READBACK DO MESMO CONTEÚDO/SHA → RECEIPT → NEXT_CURSOR`. Arquivo gravado não equivale a commit; commit não equivale a push; GitHub atualizado não equivale ao checkout local sincronizado.

**TRAVA DE PRESERVAÇÃO:** se o checkout tiver trabalho local de outros owners, conflitos, processo Git ou `.git/index.lock`, não executar `reset --hard`, `clean`, stash destrutivo, remover lock às cegas nem forçar pull. Preservar alterações, medir a causa, reconciliar com segurança e manter `CASA_MAIN_SYNC=PENDING/BLOCKED` até prova real. Nunca marcar 🟢 por intenção, cabeçalho ou histórico. Sem branch, writer, arquivo, HUD ou arquitetura paralelos quando o owner existente atende.
<!-- /CENTRALDARK_MINIMUM_COMMIT_SYNC_RULE_20261107 -->

Contrato universal no topo de `AGENTS.md`, consumido pela Skill Mae `centraldark-operational-method`. Chamar `!HUD` ou `#HUD`; usar exatamente um quadro monoespacado NO TOPO da resposta e a resposta operacional ABAIXO. Preservar quesitos numerados, textos completos, status e provas. Cada nova missao substitui apenas o conteudo ATIVO do quadro; preservar historico das missoes neste mesmo owner. So alterar estado de quesito apos conclusao e contraprova. `FORMATO_APROVADO` nao significa missao concluida. Fora do repo/contexto, `HUD_SOURCE=UNKNOWN`; nao afirmar memoria ou sincronizacao entre conversas sem readback. Reconciliador unico: `scripts/centraldark-inventory-reconcile.sh`. O bloco Hermes que segue e o checkpoint vigente, nao um HUD paralelo.

<!-- CASA_MAIN_RECONCILIATION_RECEIPT_20261107 -->
**RECIBO DE RECONCILIAÇÃO CASA ↔ MAIN — 07/11/2026 (medição, não selo de conclusão).**

- **CURRENT antes do recibo:** Casa `F:\CentralDark` em `main@3abb839991ec829a5cdba1217a5d894541978cb0`; `origin/main@e62bb539bfd7bbffe6ee9fcc6baf5fdea8378de4`; `ahead=0 / behind=57`. O `git fetch origin main` terminou com saída 0; atualizou somente a referência remota, NÃO o checkout.
- **Diferenças comprovadas:** 47 arquivos rastreados com alterações locais (incluindo 2 exclusões), 203 arquivos locais sem rastreamento sobre caminhos acrescentados na `main`. Dos 22 rastreados modificados em ambos os lados, 5 têm conteúdo igual ao da `main` e 17 diferem. Dos 203 não rastreados coincidentes, 196 têm conteúdo igual ao da `main` e 7 diferem. Demais arquivos não rastreados, fora do cone do merge, não foram modificados.
- **Trava:** `.git/index.lock` com 0 bytes, sem atualização desde 05/11/2026, não estava aberto por outro processo (abertura exclusiva comprovada); sem Git writer ativo, foi **movido e preservado** em `F:\_WORKER\CENTRALDARK-index-lock-stale-20261107-074349.lock`. Não se matou processo nem se removeu outra trava.
- **Salvaguarda verificada:** backup privado `F:\_WORKER\CENTRALDARK-CASA-main-reconcile-20261107-074657.zip`; SHA-256 `e6e266c339e6aaff9d571dd0154ca519ecef8860a396cead6c060ed9648f90d1`; 248 arquivos presentes e os 2 excluídos registrados no manifesto; `248/248` hashes internos conferidos, `0` divergências. Esse ZIP NÃO deve ser publicado, pois contém estado local.
- **Tentativa sem perda:** `git merge --ff-only origin/main` retornou `exit 1` recusando sobrescrever arquivos locais rastreados e não rastreados. HEAD permaneceu `3abb839991ec829a5cdba1217a5d894541978cb0`; nenhuma mudança do checkout foi descartada. Tentativa de merge em cópias temporárias identificou múltiplos conflitos; nenhum conteúdo conflitante foi automaticamente escolhido.
- **VEREDITO:** `CASA_MAIN_SYNC=BLOCKED_PENDING_RECONCILIATION`; `HEAD_CURRENT=NO`; `ZERO_DATA_LOSS=NO_DESTRUCTIVE_ACTION_OBSERVED`; `NEXT_CURSOR=RECONCILIAR_17_TRACKED_E_7_UNTRACKED_POR_OWNER_DEPOIS_REMEDIR_CONFLITOS_E_FAZER_FF_READBACK`. Sem `reset --hard`, `git clean`, stash destrutivo, commit em massa ou ramo paralelo; atualizar esse mesmo recibo após a convergência verdadeira.
<!-- /CASA_MAIN_RECONCILIATION_RECEIPT_20261107 -->

### Acompanhamento GitHub do Corpo Único na Sala de Controle

@code_ref: apps/instinto-superior/src/components/central/CockpitShell.tsx; apps/instinto-superior/src/components/central/ReconciliacaoCorpoUnico.tsx; apps/instinto-superior/src/lib/github.functions.ts; apps/instinto-superior/src/lib/admin.functions.ts; apps/instinto-superior/src/lib/cockpit.functions.ts; apps/instinto-superior/src/lib/sync.functions.ts; apps/instinto-superior/src/components/central/SshBridgeProof.ts; apps/instinto-superior/src/hooks/useTelegramBotsResumo.ts; supabase/migrations/20261107181500_cockpit_reconciliation_permissions.sql
@last_updated: 2026-11-07T18:15:00Z

A área administrativa `/sala-controle?aba=reconciliacao` apresenta o Funil Único #1977 como missão ativa e o PR-Mãe #1562 como referência anterior. A leitura GitHub usa o mesmo acesso de servidor de Main e Minha Oficina. A rota tenta as variáveis existentes e usa a sessão local do GitHub CLI para leitura do repositório quando a credencial de ambiente é recusada. A comparação usa os dois SHAs e mantém o último retrato identificado como histórico quando a conexão falta. A fila mostra o próximo passo, P1 documentais e pendências informadas na sessão. Os sucessores apontam aos PRs, commits e linhas do recibo original.

Os registros de sessão são anexados ao `agent_events` existente com a sessão administrativa do Supabase e política de linha específica. A migração `supabase/migrations/20261107181500_cockpit_reconciliation_permissions.sql` também libera somente as colunas de resumo dos bots para administradores. A leitura de provas SSH usa o cliente Supabase do Cockpit. A migração está preparada localmente e depende de aplicação autorizada. O tipo de registro é uma classificação informada. Uma nota marcada como fato exige referência por SHA, arquivo e linha e aguarda conferência de mérito. O painel consulta os 100 registros mais recentes. A trilha do GitHub é somente leitura e liga ao inventário completo preservado no #1977.

**Prova desta etapa:** GitHub confirmou #1977 em rascunho, com conflito, HEAD `253ab540c5f60488ed3f514eb106a1def08a5efa`. Na comparação com `ba4fe358b6ac5f4ad659a6340cfbad91827ad2a9`, a branch estava 125 commits à frente e 59 atrás. Este recibo documenta o delta local. A leitura autenticada da aba publicada e o readback do ledger na Sala de Controle estão pendentes.

### Absorção do Status legado pelo Cockpit

@code_ref: apps/instinto-superior/src/components/central/SistemaCentralDark.tsx; apps/instinto-superior/status/
@last_updated: 2026-11-07T18:29:27Z

`Saúde do sistema` é a entrada visual única. O Mega Painel mantém eventos e notificações. Status exibe a leitura dos serviços. Runtime / Capabilities apresenta capacidades e papéis. Infraestrutura concentra o host e seus processos. Radar concentra sinais e alertas. Os HTMLs `capsula.html`, `ai-review.html`, `conselho.html` e `protocolos.html` têm cards nativos no Mega Painel com a fonte original. Cápsula, revisão e conselho mostram apenas a fotografia histórica. `index.html` e `infra.html` ficam como fonte histórica, com as respectivas funções visuais nos painéis existentes.

Os arquivos de `apps/modulos/status` passam a pertencer a `apps/instinto-superior/status`. HTML, estilos, snapshots, receitas, contratos, coletores e testes permanecem juntos, fora dos arquivos públicos do Instinto Superior. Os workflows e leitores do mesmo repositório usam o novo caminho. As páginas antigas são referência de origem e sua publicação/infraestrutura precisa de readback separado. A migração de código não certifica as sondas, a execução dos coletores nem a troca do endereço publicado.

### CENTRALDARK_MISSION_HUD_33_20261107 — quadro ativo único (01–33)

**INTENÇÃO:** conservar o mesmo HUD quadrado, agora com 33 quesitos numerados e o Corpo Único integrado ao fio operacional. Este bloco é o quadro ATIVO no owner existente; não é outro HUD, programa, rota, executor ou checkpoint. Estados 🟢 de fonte/histórico não significam runtime atual; estados 🟡 não viram PASS sem medição. A numeração 01–13 foi preservada e 14–33 é delta da missão Corpo Único / Electron / MCP Casa. Não substituir outros registros do README.

```text
╔═════════════════════════════════════════════════════════════════╗
║ 🪬 CENTRALDARK — !MICHELIN ⭐⭐⭐                                  ║
║ 👑 CHEFE → SOL → HERMES → REALIDADE → KAIZEN                    ║
╠═════════════════════════════════════════════════════════════════╣
║ 🎯 MISSÃO: CENTRALDARK DESKTOP / BUILDER                        ║
║ 🧠 FASE: BUILD OK · GUI, COCKPIT E EXE FINAL PENDENTES          ║
╠═════════════════════════════════════════════════════════════════╣
║ 📋 01–13 · PROTOCOLO E CONTINUIDADE                             ║
║ 01 🟢 Localizar o proprietário do HUD                           ║
║ 02 🟢 Ler a receita de apresentação                             ║
║ 03 🟢 Confirmar a fonte na main                                 ║
║ 04 🟢 Preservar um único quadro operacional                     ║
║ 05 🟢 Exibir intenção, fase e estados                           ║
║ 06 🟢 Exibir provas e pendências                                ║
║ 07 🟡 Sincronizar checkout da Casa                              ║
║ 08 🟡 Validar boot operacional completo                         ║
║ 09 🟡 Comprovar consumo pela Skill Mãe                          ║
║ 10 🟡 Validar runtime Hermes                                    ║
║ 11 🟡 Confirmar continuidade entre sessões                      ║
║ 12 🟡 Executar contraprova do ciclo                             ║
║ 13 🟡 Confirmar FIXED_POINT                                     ║
╠═════════════════════════════════════════════════════════════════╣
║ 🏠 14–22 · CORPO ÚNICO / CASA                                   ║
║ 14 🟢 Aplicativo Tray existente (fonte histórica)               ║
║ 15 🟢 Owner Remote Bridge identificado                          ║
║ 16 🟡 Cloudflare integrado ao Corpo Único                       ║
║ 17 🟡 Túnel automático ao iniciar Windows                       ║
║ 18 🟡 Indicador Cloudflare no HUD superior                      ║
║ 19 🟡 Logs e TRACE dentro do Corpo Único                        ║
║ 20 🟡 Integração das capacidades existentes                     ║
║ 21 🟡 Pareamento MCP Casa ↔ ChatGPT                             ║
║ 22 🟡 Substituição do Desktop Commander                         ║
╠═════════════════════════════════════════════════════════════════╣
║ 🖥️ 23–28 · CENTRALDARK DESKTOP / ELECTRON                      ║
║ 23 🟡 Cockpit como página inicial do Electron                   ║
║ 24 🟡 Chromium integrado ao Electron                            ║
║ 25 🟡 Hermes One dentro da mesma janela                         ║
║ 26 🟡 Codex / Claude / DeepSeek / VS Code                       ║
║ 27 🟡 Terminal e navegador internos                             ║
║ 28 🟡 Chat principal orquestrando capacidades                   ║
╠═════════════════════════════════════════════════════════════════╣
║ 🔗 29–33 · CONECTIVIDADE / MCP                                  ║
║ 29 🟢 Rota MCP /mcp no agente (fonte local)                     ║
║ 30 🟢 Bloqueio HTTP 401 (teste histórico)                       ║
║ 31 🟡 Autenticação real pelo ChatGPT                            ║
║ 32 🟡 Tailscale + Cloudflare reconciliados                      ║
║ 33 🟡 Acesso independente de máquina                            ║
╠═════════════════════════════════════════════════════════════════╣
║ 🟢 = PROVA DE FONTE OU TESTE HISTÓRICO                          ║
║ 🟡 = PENDENTE DE CONSUMO/CONTRAPROVA VIVA                       ║
╠═════════════════════════════════════════════════════════════════╣
║ 🎯 VEREDITO: FONTE REGISTRADA; RUNTIME NÃO SELADO               ║
║ 🟡 FIXED_POINT=PENDING · NÍVEL=UNKNOWN · XP=UNKNOWN             ║
║ ➡️ NEXT_CURSOR: VALIDAR GUI VIA scripts/code.bat                ║
╚═════════════════════════════════════════════════════════════════╝
```

**OWNER DO HUD:** `docs/HUD/README.md`; **MÉTODO:** `.agents/skills/centraldark-operational-method/SKILL.md`; **EXECUÇÃO CASA:** owners existentes em `scripts/remote-bridge/` e `scripts/casa/`; **EXECUÇÃO DESKTOP:** owner Hermes/Electron existente. **EVIDÊNCIA:** fotografia dos 33 estados apresentada na conversa em 07/11/2026; green = fonte já conferida ou observação histórica, não uma sondagem global atual. **CURRENT CASA:** checkout local `main` 51 commits atrás de `origin/main`, com mudanças de outros owners ainda sujas; `.git/index.lock` antigo impede commit local sem intervenção cautelosa. **REGRA:** não forçar `git pull`, apagar lock, alterar arquivos alheios, promover estado sem contraprova ou criar branch/PR paralelo. **NEXT_CURSOR:** reconciliar checkout de forma preservadora; medir 16–22 no Corpo Único, depois 23–33, e registrar os efeitos no quadro existente.

### CENTRALDARK_MCP_CASA_PLUGIN_AUTH_CHECKPOINT_20261107 — plugin existente, sem duplicar

**INTENÇÃO:** corrigir o ZIP `plugin(1).zip` que já contém o aplicativo `CentralDark MCP Casa`, não criar outra identidade. O pacote editado nesta conversa preserva o mesmo `.app.json` e seu app ID; muda `author.name` e `interface.developerName` para `SegredoiDev`, versão `1.0.1`, e acrescenta o ponteiro `.mcp.json` com `https://mcp.centralldark.com/mcp` e OAuth/DCR. **ARTEFATO DA CONVERSA:** `CentralDark-MCP-Casa-SegredoiDev-1.0.1.zip`; SHA256 `64a5b1dd7e934f5fe19c4983fa8bcca8eb20f6621c293c28cd744939ce691e42`. O ZIP não contém credenciais. O ZIP não foi instalado nem prova conectividade.

**PROVA VIVA PARCIAL (Casa SEGREDO, 07/11/2026):** GET HTTPS para `/mcp` devolveu `401` sem credencial (proteção esperada, `MCP_AUTH_REQUIRED` relatado pelo CHEFE); `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server`, `/.well-known/oauth-protected-resource/mcp`, `/authorize`, `/token` e `/register` devolveram `404` em GET. **LIMITAÇÃO:** métodos GET em `/token` e `/register` não comprovam POST; mas metadados discovery 404 impedem declarar fluxo OAuth configurado. **STATUS Q21/Q31:** PENDING, pois `MCP_AUTH_REQUIRED != PLUGIN_CONECTADO` e `ZIP_VALIDO != OAUTH_PASS`. **NEXT_CURSOR:** no owner MCP CentralDark existente validar discovery OAuth e fluxo PKCE/DCR com resposta HTTP e autenticação legítima; reimportar/atualizar o plugin existente e provar `tools/list` autenticado. Não divulgar tokens e não abrir conexão anônima para contornar 401.

### CENTRALDARK_HUD_VSCODE_CHROMIUM_CONTINUITY_20261107 — superficie habitual do CHEFE

Intencao informada pelo CHEFE (07/11/2026): ChatGPT usado dentro do Chromium/Electron integrado ao VS Code para programar, mantendo a conversa na mesma bancada. Essa interface de conversa NAO e automaticamente o renderer Hermes Desktop, nem o owner do HUD. Preferir reconhecer e reutilizar a janela/aba atual; nao abrir segunda instancia nem trocar a interface. A continuidade depende do workspace/sessao restauravel, NAO de PID estavel (PIDs mudam entre inicializacoes).

Evidencia viva, Casa Windows SEGREDO: titulo da janela do processo Code.exe PID 31056 = `Modo clareza ativado (chatgpt.com) - Bolt - Visual Studio Code [Administrador]`. O sufixo `Bolt` e titulo da janela/workspace e NAO autorizacao para usar a interface Bolt. A lista de abas nativa do navegador conectado nao ficou acessivel (`Browser access requires the originating browser context`); nao declarar leitura dessas abas. Por rota local existente de Chrome DevTools, endpoint read-only `http://127.0.0.1:9222/json/list` devolveu 17 targets, com titulos/origens observados: `ChatGPT` (chatgpt.com), `Cockpit CentralDark - Sala de Controle` (192.168.35.130:8080) e `Historico | Hostinger` (hpanel.hostinger.com). Metadados de targets Chrome NAO provam que essas paginas sejam abas internas do VS Code. Nenhum conteudo de conversas, cookies, tokens ou parametros de URLs foi registrado. O editor mostrou `README.md` aberto e o CHEFE forneceu captura da tela; readback documental anterior confirmado.

NEXT_CURSOR operacional preservado: aproveitar a bancada VS Code + Chromium ja aberta para localizar logs de execucao/porta do Hermes sem misturar navegadores; no repo Hermes diferenciar `browser-host` (9120), `Vite` (5174) e o dashboard legado (8787). Se outra conversa chamar `!HUD`/`#HUD`, ler AGENTS.md + Skill Mae + este mesmo README; sem acesso, anunciar SOURCE_UNKNOWN. Proxima descoberta adiciona delta aqui, sem mudar status dos 13 quesitos sem contraprova.
### CENTRALDARK_HUD_VISUAL_OVERLAY_MOUSE_RECIPE — receita vinculada ao owner existente

OWNER DO METODO: `.agents/skills/centraldark-operational-method/SKILL.md` (`Metodo unico: contexto vivo, navegador, monitores e edicao visual`). OWNER DA IMPLEMENTACAO VISUAL: `.agents/skills/centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use/SKILL.md` (secoes `Cursor nativo integrado` e `Modo operacional visual: clique com cursor virtual Cua + overlay`). REFERENCIAS: `references/native-cursor.md`, `scripts/blink_cursor.py` na MESMA pasta da skill visual. O HUD documenta e aponta, nunca cria outro motor, overlay, mouse ou capturador.

RECEITA DE LOCALIZACAO VISUAL: (1) recuperar janela/sessao existente do VS Code/Chromium, titulo, PID e HWND atuais; (2) enumerar monitores pelo metodo operacional existente e reconciliar numero humano, coordenadas e MonitorFromWindow sem presumir geometria antiga; (3) selecionar janela/aba e confirmar o alvo por acessibilidade/captura autorizada; (4) para APRESENTAR, usar `blink_cursor.py --mode position --monitor N`: cursor virtual Cua e overlay Hermes juntos, sem mover mouse fisico nem clicar; (5) para PISCAR, `--mode blink --monitor N`; (6) somente apos ordem explicita de clicar, usar `--mode click --monitor N --pid PID --hwnd HWND --x X --y Y` com coordenadas observadas; (7) verificar efeito real e, no finally, encerrar o overlay e a sessao propria, sem interromper a janela do CHEFE. Preferir UIA e hit-test; nao repetir clique incerto.

ESTADOS DE PROVA: `SOURCE_FOUND` para receita presente; `OVERLAY_VISIBLE` somente com confirmacao visual; `VIRTUAL_CURSOR_VISIBLE` somente com confirmacao visual; `CLICK_EFFECT_PASS` somente com contraprova do controle; `IDLE` apos encerramento confirmado. `SCRIPT_EXISTS != UI_EXECUTED`, `CUA_CALL_OK != UI_EFFECT_PROVEN`. Nunca usar `scope=desktop`, `SetCursorPos`, `mouse_event` nem criar daemon novo. A localizacao de ChatGPT em VS Code e dado de monitoramento; nao prova acesso ao conteudo da aba.

NEXT_CURSOR: localizar a janela ativa e sua tela atual, apresentar overlay + cursor virtual pelo mesmo helper existente, observar e documentar o resultado; manter o quesito 10 (Hermes porta historica) pendente ate prova propria.
HERMES_OVERLAY_MOUSE_MONITOR1_RECEIPT_20261107: identificador existente `Identify-CentralDarkMonitors.ps1 -ListWindows` enumerou 4 telas e localizou VS Code `Code.exe` PID 31056 / HWND 329050 no monitor humano 1 (direita vertical, DISPLAY1, X=1920 Y=-831 Width=1080 Height=1920). Cua-driver daemon preexistente RUNNING (PID 17844). Executado SEM CLIQUE o helper preexistente `.agents/skills/centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use/scripts/blink_cursor.py --mode position --monitor 1`: resultado `execution=completed`, `cursor=native_cua_virtual`, coordenada absoluta `[2460,-159]`, `cycles=1`, sessao `hermes-visual-cursor-985065d03d`, `cleanup=completed`, exit code 0. Overlay+cursor virtual solicitados pelo mesmo metodo, sem mover mouse fisico, sem criar processo persistente nem clicar. Confirmacao humana da visibilidade = PENDING; portanto nao declarar VISIBLE_PASS nem alterar estado do quesito 10 (porta historica). NEXT_CURSOR: receber contraprova visual se necessaria e seguir com rastreio das portas 8787/9120; nao confundir demonstracao de overlay com servidor web Hermes ativo.<!-- /CENTRALDARK_MISSION_HUD_FIXED_PROTOCOL -->
# 🪬 HUD histórico → Instinto Superior · documento de migração

**Intenção do CHEFE (15/10/2026):** o `docs/HUD/HUD.html` é a **fonte de capacidades legado**. Todas as capacidades devem convergir para o **zone de navegação existente** no Instinto Superior. `docs/HUD` fica como referência, ensinamento, template e prova de paridade até que as funções sejam comprovadamente migradas. Nenhuma exclusão antes do inventário e do teste de paridade.

## 🪬 Ponte Radeon RX 580 → Cockpit vivo (27/10/2026)

<!-- #OBSERVACOES#
@owner: docs/HUD/README.md
@code_ref: scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat; scripts/casa/CentralDark-RtssOverlay.ps1; apps/instinto-superior/src/lib/maquina.functions.ts; apps/instinto-superior/src/components/central/RuntimeSistema.tsx
@last_updated: 2026-10-28T17:32:00.000Z
@escopo: telemetria local somente leitura reutilizando fonte Afterburner MAHMSharedMemory e RuntimeSistema autenticado
@implementado: coletor sensor-only, feed LOCALAPPDATA, leitura SSR Casa, UI em código com FPS/GPU/CPU/VRAM/histórico/CSV
@pendente: validar visual após reload no cockpit autenticado, CI do mesmo HEAD, testes negativos de frescor e autenticação; persistência do coletor após reboot ainda não garantida
@next_cursor: validar a ponte RTSS no Cockpit autenticado, corrigir só falhas do owner, selar delta Git após gates; VPS/host externo permanece UNKNOWN
@prova_visual: 27/10/2026 12:25:32 - painel Radeon RX 580 LIVE 58/60 sensores, FPS 71.8, GPU 79%, Temp 45C, CPU 100%, VRAM 2263.1MB, 25 amostras no historico, idade 4s, CONVERGENCIA SENSOR FRESCO E AUTENTICADO. Root cause do UNKNOWN anterior: estado de bootstrap (historico aguardando duas leituras consecutivas); nao e falha intermitente.
-->

**Intenção atual:** o mesmo painel Radeon RX 580 mostrado pelo Adrenalin deve aparecer **vivo** dentro do cockpit existente, com tema escuro/vermelho, métricas selecionáveis e rastreamento. Não embutir processo/janela proprietária nem simular números. Uso estritamente **somente leitura**, sem alterar driver, clocks, tensão, potência ou ventilação.

## 🖥️ Ponte RTSS por posição física (28/10/2026)

**Intenção:** transformar o Desktop Overlay Host já instalado em uma capacidade limitada do mesmo Cockpit. O painel reutiliza `RuntimeSistema.tsx`, a autenticação admin já existente e o script local `scripts/casa/CentralDark-RtssOverlay.ps1`; não há segundo Cockpit, executor genérico, shell enviado pelo navegador ou controlador de GPU.

**Allowlist:** `status`, `open`, `move` e `close`. `move` só aceita os aliases físicos `esquerda`, `centro-superior`, `centro-inferior` e `direita`, remeça `Screen.AllScreens` no instante do comando e devolve PID, visibilidade e retângulo para readback. A rota só opera quando o servidor autenticado é a Casa Windows `SEGREDO`; VPS, preview ou host externo retornam estado explícito e não fazem tentativa remota.

**Cadeado:** números `1..4` continuam pertencendo ao Windows `Configurações → Sistema → Tela → Identificar`. A UI os mostra apenas como mapa humano confirmado (`esquerda=3`, `centro superior=2`, `centro inferior=4`, `direita=1`); o comando resolve pelo retângulo físico atual, nunca por `DISPLAYx` ou pela ordem interna do RTSS. `TODAS_AS_TELAS=NOT_IMPLEMENTED` e `RTSS_LABEL_PER_MONITOR=NOT_CONFIGURED` até teste específico, reversível e visual.

**Reversão:** o Cockpit só permite fechar um PID que ele mesmo iniciou durante a vida daquele servidor. Host já aberto pelo usuário não é encerrado. Abrir/mover não altera clocks, ventoinhas, resolução, arranjo ou driver. O script não escreve `DesktopOverlayHost.cfg`; porém o host RTSS pode persistir a própria posição. O hash atual diverge do baseline anteriormente anotado e exige backup confiável antes de qualquer rollback (`RTSS_CFG_INTEGRITY=UNKNOWN`). Em `2026-10-28 17:35Z`, o cartão foi exibido na sessão autenticada e **Atualizar estado** devolveu `STATUS · host fechado`; os quatro movimentos físicos já tinham sido testados e revertidos pelo mesmo script. Build completo segue como gate distinto.

**Owners reaproveitados:** coleta `scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat`; frontend existente `RuntimeSistema.tsx`; server function autenticada `maquina.functions.ts`; referência legado `docs/HUD/HUD.html`. O caminho `K:\HUD.html` era legado/inexistente na Casa: o HTML canônico é `K:\docs\HUD\HUD.html`. O feed efêmero **não deve ser gravado no repositório**: utiliza `%LOCALAPPDATA%\CentralDark\CENTRALDARK-AFTERBURNER-LIVE.js`; seus bytes não são prova de commit nem dado para Git.

**Provas locais observadas em 27/10/2026:** GPU RX 580 e Intel i5-10400F; MSI Afterburner em execução; memória `MAHMSharedMemory` abriu em modo read-only, assinatura `MHAM`, versão 131072, **60 sensores anunciados**. O modo do coletor existente `CENTRALDARK_SENSOR_ONLY=1` iniciou o mesmo loop de **10 s**, sem exibir segundo HUD nem executar a sondagem remota. Leitura do feed: `centraldark.afterburner.v1`, `52/60` sensores válidos, `SOURCE_FRESH`. A contraprova temporal viu arquivo atualizar entre `14:58:13Z` e `14:58:33Z`, com idade da última amostra **2,4 s**. O número antigo de 51 sensores é histórico, não contagem atual.

**Consumo do cockpit:** `lerMaquinaViva` já exige sessão Supabase e role `admin`; a leitura GPU somente tenta acessar o arquivo quando o próprio servidor roda na Casa Windows identificada como `SEGREDO`. Em outro host (inclusive VPS) retorna `UNKNOWN`; arquivo ausente/fora do esquema, intervalo maior que 30 s ou timestamp do futuro também retornam `UNKNOWN/STALE` sem reutilizar números vencidos. O frontend agrupa os sensores disponíveis e gráficos das leituras da sessão; registro/exportação CSV desse painel são ações explícitas locais do navegador. **Não substituem logs persistentes do AMD Adrenalin** para forense de reinicializações.

**Estado dos gates desta rodada:** PowerShell payload parser `0` erros e `git diff --check` `PASS`; arquivos TS tocados com `0` diagnósticos próprios no typecheck. A execução direta de `tsc --noEmit` em 28/10 retornou saída `2` e **94 linhas de erro em outros módulos**, sem referência a `maquina.functions.ts` ou `RuntimeSistema.tsx`; portanto build geral permanece bloqueado. `verify-hud-zone.mjs` também já possui falha legada no `CockpitShell`. A superfície autenticada do cartão RTSS foi lida e devolveu status; movimento UI 4/4 não foi repetido porque o script já fora testado e revertido. `LOCAL_SENSOR_PIPELINE=PASS`; `COCKPIT_STATUS_READBACK=PASS`; `COCKPIT_MOVE_UI_4_4=NOT_REPEATED`; `GITHUB_RELEASE=NOT_DONE`. Nenhuma inferência de 24/7 após reinício.

## Fonte e owners

- Fonte legada: `docs/HUD/HUD.html`; preservar selos, nomes, CSS/temas, JS, contratos de DOM, ações e histórico. **NÃO APAGAR** por haver novo botão.
- Linhagem atual: `docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json`. A fonte canônica tem **198 seções + L000**; o snapshot embutido no HUD HTML antigo dizia **169 elos**. UIDs legados e lacunas são preservados, não renumerados.
- Destino de UI: `apps/instinto-superior/src/components/central/CockpitShell.tsx`, reutilizando o `Tabs` autenticado. Componente parcial extraído: `HudDeterministico.tsx`. Sem segundo cockpit.
- Owners de runtime permanecem os mesmos: Hermes Gateway/kanban; MCP/log-funnel; One Heart; APIs autenticadas; extensão `skills/vs-code-restore`. Documentar aqui não cria serviços.
- ZIP/plug-and-play é um **artefato de atualização com hashes**, nunca autorização para substituir estado local divergente ou apagar dados.

## Inventário agrupado das capacidades do HUD

| Domínio legado observado | Destino no zone existente | Estado da migração nesta branch |
|---|---|---|
| Replay Gênesis, passo, pausa, reset, leitura de UID | HUD · Selos · Gênesis | **SOURCE_NATIVE**; readback gráfico pendente |
| Hermes tipado por UID, geração de missão sem IA | Mesmo zone, prévia e copiar missão | **SOURCE_NATIVE**; envio real ao Gateway NÃO migrado |
| Nomes de 15 cadeados históricos e lei ENTROU_TEM_QUE_SELAR | Mesmo zone, inventário histórico | **SOURCE_NATIVE**; verificação live de campos/selos NÃO migrada |
| Fixed Point (10 critérios observáveis) e aceite | Reality Judge/estado existente | **PENDENTE DE PARIDADE** |
| Estados de Casa, VPS, Tailscale, bridge privado e MCP | Sistema CentralDark/observabilidade existentes | **PENDENTE DE PARIDADE** |
| One Heart, mapa de API/13 rotas, metas/goal loop | Sistema CentralDark/owners já existentes | **PENDENTE DE PARIDADE** |
| MSI Afterburner (51 sensores), Screenpipe e telemetria | Observabilidade CentralDark | **PENDENTE DE PARIDADE** |
| Skins/temas, responsividade, HUD relógio e notificações | Design Center/peles e componentes existentes | **PENDENTE DE PARIDADE** |
| Operações GitHub, PRs, deploy, auto-sync, status de arquivos | Sync Center/Forja | **PENDENTE DE PARIDADE** |
| Mapas, Obsidian, grafos, instalação, bibliotecas e skills | Navegação de capacidades existente | **PENDENTE DE PARIDADE** |
| Auditores determinísticos de botões e lacunas | Reality Judge/QA | **PENDENTE DE PARIDADE** |

A tabela é **inventário por domínio**, não prova de censo individual de todos os botões/scripts do HUD. Inventário exaustivo de IDs, listeners, CSS e endpoints ainda é necessário para declarar migração integral.

## Leis de selo e de Gênesis

1. Um novo selo exige `owner, scope, proof-key, source-sha, receipt, readback, observed-at, next-cursor`.
2. Selos históricos são datados e não viram PASS CURRENT por apenas aparecerem em UI. Novos selos têm trilha operacional separada de UIDs Lxxx; replay de aprendizados não é execução.
3. O Gênesis só avança diante de `prev_uid/next_uid` íntegros, com último `PENDING_NEXT_CURSOR`. `PASS_REPLAY_DOCUMENTAL != GATE_CI_PASS != RUNTIME_PASS`.
4. Hermes sem IA: formar texto de missão determinístico é permitido; `PREPARED != TASK_CREATED != EXECUTED != RECEIPT_CONFIRMED`. API autenticada e autorização continuam separadas.
5. Um único writer por escopo; alterações locais sujas da Casa/VPS permanecem intactas. Novo componente é parte do cockpit original, não aplicação paralela.

## Provas observadas na branch

- Readback GitHub da fonte: `docs/HUD/HUD.html` ~4.030 linhas e manifesto `ENTROU_TEM_QUE_SELAR`; 15 nomes de cadeados.
- Linhagem JSON: `L000 + 198 nós`; arestas `prev_uid/next_uid` verificadas e último cursor `PENDING_NEXT_CURSOR`.
- Tab autenticada adicionada ao `CockpitShell` original; sem `iframe`, sem criar outro Hermes, sem modificar o HUD HTML antigo.
- Checagem estática: **10/10 invariantes** na mesma branch; são verificações de fonte, NÃO build/URL/UI.
- Suíte de regressão `apps/instinto-superior/scripts/verify-hud-zone.mjs` adicionada para rodar no checkout materializado: `node --test scripts/verify-hud-zone.mjs`, a partir da pasta do app. **Execução da suíte e build Vite ainda não comprovados.**

## NEXT_CURSOR

Build/CI da PR isolada → corrigir apenas falhas reais do owner → readback em zone autenticado → migrar em lotes de capacidades (sensores, contratos, temas, controle/aceite, Hermes Gateway) com prova de paridade → só então reduzir o legado a manifesto/template, nunca quebrar links/owners históricos.

**Conformidade por escopo:** fonte/inventário parcial documentados; `100%` de satisfação declarado pelo CHEFE não equivale a conformidade técnica integral. `RUNTIME_HUD_MIGRATED=NOT_PROVEN`.


## Retomada operativa — 15/10/2026 11h50 BRT

**Gatilhos falados no chat:** `#acordar → !calibrar → !CENTRALDARK`. Mesmo owner em `.agents/skills/centraldark-operational-method/SKILL.md` da `main`. Não são comandos shell nem prova de execução automática. Cada mensagem de nova descoberta deve começar por **🍒🎰🎲 Outra melhoria antecipada**, indicando ganho, motivo, prova e cursor.

**Prova de runtime lida nesta rodada:** Casa `SEGREDO` e VPS `CENTRALDARK-OS` responderam por conectores independentes; VS Code `Code.exe` PID **22468**, HWND **67400**, `foreground=true` (valores efêmeros); `Hermes.exe` com três processos encontrados. VPS `tailscaled`, `hermes-gateway`, `centraldark-native-mcp-http` ativos; quatro runners GitHub. O funil MCP canônico respondeu `ingest=OK` com **0 novos eventos naquele ciclo**; job Hermes recorrente com 2 sinais em 90 minutos; **nenhuma delegação viva nova comprovada**. `LOG_FUNNEL_PRESENT != RAW_TERMINAL_STREAMING`.

**Checklist diário:** owner histórico já existe em `docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md`. O zone `HudDeterministico` agora recebe a **mesma prop de estado** de `CockpitShell` e apresenta GitHub, API, VPS/deploy, Screenpipe, Hermes e recibos sob um único componente. O owner de saúde continua `ObservabilidadeCentralDark`; não há segundo coletor. Se Hermes/Unigram/CentralDark.exe estiver fechado por escolha, não classificar como falha.

**Faxina/Forja:** foi localizada a skill `.agents/skills/main-pinned-runtime-fast-path/SKILL.md` e o scratch canônico `/root/CentralDark/_worktrees/main-pinned-runtime-fastpath` com lock, guard de realpath e receipt antes de cleanup. VPS checkout principal apresenta **seis arquivos rastreados modificados**; Casa tem worktrees ativos. **Não limpar nenhum deles.** `SCRATCH_RESET != MAIN_RESET`.

**Deliberação Hermes pelo terminal:** a janela do VS Code estava em primeiro plano, porém a operação de consulta ao CLI Hermes foi bloqueada pela ferramenta. **Nenhum comando foi digitado no terminal existente, nenhuma tarefa nova foi delegada e nenhum acompanhamento contínuo foi iniciado por essa rota.** Operação posterior deve confirmar foco do terminal-alvo, executor único, permissão e readback, sem tentar contornar bloqueios.

**Dívida identificada:** a suíte `apps/instinto-superior/scripts/verify-hud-zone.mjs` ainda verifica a sintaxe anterior `<HudDeterministico />` enquanto o cockpit já usa `<HudDeterministico estado={dado} />`. Tentativa de atualizar o teste foi bloqueada pela ferramenta. Assim, `TEST_CONTRACT=STALE`, `BUILD=UNKNOWN` e `UI_PROVEN=NO`. Atualizar a mesma suíte quando possível, sem abrir outra PR nem declarar PASS.

**NEXT_CURSOR:** atualizar contrato de teste → executar teste + build em clone/worktree isolado do disco K: vinculado ao VS Code → ler CI mesma SHA → conferir interface no cockpit real → migrar os domínios restantes do HTML legado com paridade até que ele se torne apenas documentação. Sem merge/deploy prematuro.


## FIXED_POINT / Forja Viva — pacote de aliases e build plug-and-play (15/10/2026)

**Aceite do CHEFE:** `SATISFACTION_STAGE=100_PERCENT_ACCEPTED_BY_CHEFE`; manter a paridade parcial já concluída e abrir cadeado apenas para DELTA novo verificado. Isso **não implica** `TECHNICAL_CONFORMITY=100%` sem métricas e UI real.

**Owners reaproveitados:**
- `docs/CONSCIENCIA/PADRAO-EMOJIS.md` — significado humano, sem execução de shell (regra cristalizada na main).
- `docs/ARQUITETURA/CENTRALDARK-FORJA-VIVA/VISUAL-NAMING-REGISTRY.yml` — identificação visual da Forja (mesma arquitetura, sem agente paralelo).
- `.agents/skills/centraldark-operational-method/SKILL.md` e `AGENTS.md` — contratos globais de recuperação e repetição; ambos registram o alias sem criar skill nova.
- `apps/instinto-superior/src/components/central/HudDeterministico.tsx` — UI dentro do zone já existente, sem copiar o HUD legado.
- `apps/instinto-superior/package.json` e `apps/instinto-superior/scripts/build-plugplay.mjs` — rotina de build (uma implementação técnica, não nova receita/owner).
- `apps/instinto-superior/scripts/verify-hud-zone.mjs` — mesmo teste, atualizado para nova assinatura de props e aliases.

**Aliases exibidos no cockpit:** 🔧 🛠️ 👨🏻‍🔧 👀 👁️ 🪡 🎄 🌞 🌟 ✨ ☄️ 🔥 🪛 ⚒️ → seis grupos `DIAGNOSTICAR`, `MANUTENCAO`, `OLHO`, `LINHAGEM`, `ANTECIPACAO`, `FORJA_PACOTE`. Um clique **seleciona** receita tipada com propósito, ganho, owner, comando fixo e prova; outro clique **copia** texto. Não executa, não faz deploy, não abre outro terminal e não eleva permissões. Zoom usa controles já presentes no VS Code e navegador.

**Build POMBO64 sob demanda:** `cd apps/instinto-superior && npm run build:plugplay` → `npm run verify:hud` (Node test) → `npm run build` (Vite já existente) → `node scripts/build-plugplay.mjs` (usa `jszip` já declarado). Saída por padrão no diretório `.artifacts/instinto-superior` **do próprio checkout**; se o checkout estiver no K: montado no VS Code, permanece no K:. `CENTRALDARK_FORGE_ARTIFACTS` pode apontar explicitamente para o vault de artefatos do mesmo volume, sem tocar `C:` ou `/tmp` involuntariamente.

**Cadeados no empacotamento:** pacote id imutável `CENTRALDARK-INSTINTO-SUPERIOR`, `POMBO-CENTRALDARK`, SHA `SOURCE`, revisão baseada no commit, inventário de arquivos compilados com SHA256, `SHA256SUMS.txt`, manifesto/contratos `manifest.yml capabilities.yml owners.yml dependencies.yml install.yml uninstall.yml rollback.yml tests.yml receipt.yml`. Falha segura para fonte modificada no fileset causal, symlink, tamanho excessivo, item sensível ou saída ausente. Se existir ZIP de mesmo nome, reutiliza somente com hash igual. Não apaga artefato prévio nem instala/deploya. `parent_package_sha256` opcional é referência, não prova de pai validado.

**Prova medida neste DELTA:** GitHub releitura mesma branch: **14/14 invariantes estáticos** coerentes (significado emojis nos dois owners e UI, test/cockpit, manifesto, paths, lineage e bloqueio autoexec). Receita do teste anteriormente desatualizada foi corrigida no SHA `eca0bea46`. A tentativa de criar staging na Casa via Desktop Commander foi bloqueada pela ferramenta; **Node test executado = UNKNOWN**, **Vite build = UNKNOWN**, **ZIP produzido = NÃO**, **UI em runtime = NÃO COMPROVADA**. Não contornar o bloqueio via outra rota; aguardar o pipeline autorizado.

**NEXT_CURSOR:** CI da PR #1832 no HEAD exato → executar testes em runner limpo/autorizado → compilar → validar ZIP e hash → readback do cockpit no runtime → migrar demais sensores/ações do HUD e provar paridade antes de reduzir docs/HUD/HUD.html a template. Retomar pelo `#acordar / !calibrar / !CENTRALDARK`; não repetir mapeamento completo nem limpar worktree ativa.


## 🧹 Forja Viva — resultado desta rodada e checklist de worktree (15/10/2026)

**Intenção vigente:** continuar trabalhando ao lado do CHEFE no chat, sempre iniciando ganho verificado com **🍒🎰🎲 Outra melhoria antecipada**, sem supor que texto no chat equivale a comando enviado ao terminal. `#acordar → !calibrar → !CENTRALDARK` recupera contexto, owner, source SHA, prova, pendências e NEXT_CURSOR.

**Owners evoluídos, sem criar skill:** semântica 🧹 registrada em `docs/CONSCIENCIA/PADRAO-EMOJIS.md` na `main`; ciclo de limpeza e checkout em `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`; ponte de comportamento no `AGENTS.md` e na `.agents/skills/centraldark-operational-method/SKILL.md`. Na branch da **PR #1832**, `VISUAL-NAMING-REGISTRY.yml` recebeu grupo `faxina_segura`; `HudDeterministico.tsx` exibe o sétimo alias `WORKTREE_CLEANUP`, com checklist, owner, prova e estado `UNKNOWN`; `verify-hud-zone.mjs` recebeu teste dedicado.

**Classificação ao vivo (snapshot, NÃO número configurado):**
- Casa `K:\` com **33 mudanças tracked** e **ao menos 95 entradas untracked**. `CASA_MAIN=KEEP_ACTIVE`; não usar `git clean/reset`, não copiar/alterar arquivos de outro writer.
- VPS `/root/CentralDark` com **6 mudanças tracked**. `VPS_MAIN=KEEP_ACTIVE`.
- Scratch VPS canônico `/root/CentralDark/_worktrees/main-pinned-runtime-fastpath` presente; `git status --porcelain=v1 --untracked-files=normal` retornou **0 entradas**. `VPS_SCRATCH=READONLY_SAFE_CANDIDATE`; falta provar locks/owners/recibos/commit exclusivo para **autorizar** qualquer descarte. Nenhuma faxina foi executada nesta rodada.

**Checklist do CURRENT — sem preencher verdes falsos:**
- [x] 🟢 Fonte visual canônica atualizada na `main`, commit `6874a55087c32fd5aac9bd35d1a60ceab19495ec`.
- [x] 🟢 Skill de faxina existente evoluída na `main`, commit `b9ae142aeec967f1a38b23448c842470a83ef483`.
- [x] 🟢 `AGENTS.md` e método operacional atualizados na `main`, commits `8c0298824a9c4ed5b3d2f9bf0c5bb3a3d6c8995b` e `ef1fb274abc031dadef5d5d3fe29037b3db73e7a`.
- [x] 🟢 Atalho 🧹 escrito no HUD existente na branch da PR, sem novo executor; teste de contrato registrado.
- [x] 🟢 Casa e VPS inventariadas por leitura remota independente, sem executar limpeza.
- [ ] 🟡 `node --test` no mesmo SHA da PR + build Vite no runner adequado.
- [ ] 🟡 Readback da interface e screenshot na Casa quando o CHEFE pedir build visual.
- [ ] 🟡 Publicação do delta de UI na `main` somente após checks/readback, sem sobrescrever alterações dos writers.
- [ ] 🟡 Limpeza de scratch sob lock **somente após** prova de dispensabilidade, histórico/recibo íntegros e destino readback. Não limpar worktree ativa.

**Fechamento/FIXED_POINT:** a conformidade aceita pelo CHEFE é a do estágio anterior. `SOURCE_DEFINED=PASS`; `MAIN_DOCS=PASS`; `UI_SOURCE_BRANCH=PASS`; `NODE_TEST=UNKNOWN`; `BUILD=UNKNOWN`; `INSTALLED=UNKNOWN`; `WORKTREE_CLEANUP_EXECUTED=NO`. O checklist CURRENT será renderizado pelo owner já existente do HUD; este trecho é **receipt documental** e não cria um checklist concorrente.

**NEXT_CURSOR:** gates da PR #1832 com HEAD atual → teste/build se possível → decisão de promoção → readback real do cockpit → quando autorizado e seguro, limpar somente scratch descartável e registrar prova posterior.


## 🗄️ Harness Instinto Superior — gaveta histórica, catálogos e absorção HUD (15/10/2026)

**DELTA do CHEFE:** o Instinto Superior é o **harness privado visual** da CentralDark, ligado ao MCP e Hermes **já existentes**. Não criar outro cérebro, coletor, plugin ou interface concorrente. A Forja Viva absorve funcionalidades e aprendizagens preservando owner. "HARNES_BUILDADO" é **intenção arquitetural**; não equivale a binário compilado/deploy ou execução comprovada.

**Origens reconciliadas (GitHub main medida `0f2b35f390a8f45330bd31a95aec355e1c58621c`):**
- Gavetas existentes: `scripts/memory-linker/pattern-library.mjs` (Memórias, Regras, Skills, Testes, Guardrails, Contratos), leitura histórica em `docs/CONSCIENCIA/LEMBRANCAS/README.md`. Pattern Library derivada; não é um segundo cérebro nem ledger de conversas.
- Arsenal histórico dos 10 cards: `docs/CONSCIENCIA/RETOMADA-Arsenal-TelePainel.md`, datado 29/06/2026. São cards documentais e não devem inflar a contagem de skills instaladas.
- Skills: `.agents/skills` tem **996** `SKILL.md`, dos quais **4 em .archive** e **992 fora**; `skills/` contém **3**. Total **999 documentos SKILL.md da árvore Git exata**, inventariados em `apps/instinto-superior/src/data/forja-gaveta.snapshot.json`, com nomes, categorias, filtros, paginação e SHA.
- Plugins versionados nas famílias alvo: `.agents/plugins/centraldark-unified-surface-parity`, `apps/modulos/HERMES-CORE/plugins/centraldark-runtime-guard`, `apps/modulos/obsidian-plugin-grafo-vivo` = **3 fontes**. Número não é igual aos plugins instalados nas máquinas.
- Casa, prova filesystem somente leitura 15/10 13:16 BRT: **26 diretórios de extensão VS Code** (inclui múltiplas versões da mesma extensão) e **5 diretórios de plugin Obsidian em K:\docs\.obsidian\plugins**.
- VPS, prova filesystem 15/10 16:17Z: `~/.hermes/skills/` tem **95 SKILL.md** e 37 diretórios de primeiro nível; `~/.hermes/plugins/` tem **3 diretórios** (`homeassistant`, `hermes-dreaming`, `typed-core-telegram`).
- MCP, readback do `mcp_admin_catalog` e `skill_listar` da conexão Primary: **141 tools**, **13 rotas** e **3 skills da API skill_listar** (mermaid-skill, pretty-mermaid, vs-code-restore). São denominadores distintos e timestamps do snapshot permanecem visíveis.
- `apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx`: evolução da aba **Sistema CentralDark → Infraestrutura → Gaveta · Skills · Plugins**, com o mesmo componente exportado `GavetaForja` projetado na aba autenticada `HUD · Selos · Gênesis`. Nenhuma segunda tela/serviço/coleção.
- Nove owners de automação tipados, em `forja-gaveta.snapshot.json`: Skill Workshop, Memory Linker, skill-sync, testes, build POMBO64, refresco cockpit, Hermes, Claude Code, faxina de worktree. O clique seleciona/copia receita; não envia comandos em nome do CHEFE sem sessão e readback.

**Inventário estrutural HUD, sem falsa paridade:** `docs/HUD/HUD.html` no blob `3623be3ebd1e5e13046796b7b6895d37ce82585a`, 4.030 linhas, **189 títulos de seção e 33 controles com seletor detectados**, mais as 4 abas `HUD/MAPA/FORJA/OPERACAO`. Origem serializada em `apps/instinto-superior/src/data/hud-migration.snapshot.json` com linha, owner proposto e estado de prova. A extração de controles por seletor **não afirma recensear todos os eventos criados dinamicamente em JS**; nem todas as heurísticas de owner foram validadas em runtime. `HudDeterministico` agora permite navegar/filtrar esse inventário e chama `estado.refetch()` pela query viva já existente para o botão de atualização. Não migrou automaticamente efeitos sensíveis como chave Moltbook, formulários, acesso Casa, delegação ou sync destrutiva; permanecem no owner existente até adapter autorizado e readback.

**CLAUDE_CODE:** Casa VS Code janela PID 22468, processos Claude PID 21204 e 30564, Hermes PID 4892/10552/18256 identificados por leitura. `mcp__CENTRALDARK__list_sessions` = `No active sessions`; tentativa do foco via PowerShell sob política da Casa retornou `PSSecurityException`. **`CLAUDE_TERMINAL_SEND=NOT_SENT`**; processo existente não prova terminal manipulável, e não contornamos a restrição. A receita tipada foi acrescentada à Gaveta somente em modo `COPY_ONLY`.

**Teste e estados deste DELTA:** suite `verify-hud-zone.mjs` evoluída para **10 testes definidos**, cobrindo contagem, proveniência, labels, inventário 189/33, single owner, ausência de despacho e a nova prop `atualizar`. `CODE_COMMITTED_IN_PR=true`; `NODE_TEST_RUN=UNKNOWN`; `VITE_BUILD=UNKNOWN`; `ZIP_POMBO64=NOT_BUILT`; `DEPLOY_PROD=NOT_PROVEN`; `VISUAL_CASA=NOT_PROVEN`. Não confundir os checks estruturais feitos por leitura com CI PASS.

**NEXT_CURSOR:** validar CI/Node/Vite no HEAD exato da PR #1832; resolver somente feridas causais; provar interface do catálogo/HUD no runtime; reconciliar owners dos controles sensíveis e sensores MMF Casa (read-only) pelo MCP existente; descobrir terminal VS Code com sessão controlável para handoff real ao Claude/Hermes, exigir ACK/receipt; só então considerar promoção da paridade e faxina 🧹. Manter arquivo legado como template/histórico até substituição integral demonstrada.


## 🪛 CI do harness — contraprova real no HEAD da gaveta

**Inspeção por job logs oficiais no HEAD `5088569527b1f233c11a1c247ff6ba9415431b6d` (antes do hotfix de clipboard):**
- `guard`, workflow run 38768407685: `NO_SILENT_ERROR_RATCHET=FAIL new_findings=1` aponta **`HudDeterministico.tsx` erro silencioso `.catch(() => {})`** na cópia da missão Gênesis. **Delta causal reparado** no mesmo owner, commit `df7556b02149fa43765c8c70bb949b5072f1d774`: mostra `FAILED` ou `COPIED` ao usuário sem despacho. O teste existente foi reforçado no commit `6b8f04d89d9c2b82cf8f21e4d1936180835a7fbb`.
- `Provar pacote, funil e contraprova`, run 38768407871: `REPO_CONTRACT_VERIFY=FAIL failed=3`. Fatos distinguíveis nos logs: `GLOBAL_LEARNING_LINEAGE=FAIL` com `APRENDIZADOS_GLOBAL_LINEAGE_PROJECTION_DRIFT` e `LINEAGE_MANIFEST_DRIFT`; `docs/CONSCIENCIA/APRENDIZADOS.md` sequência numérica (esperado 171/172 e inconsistências); `SOUL_STALE` após mudança em `AGENTS.md`. São **outras dependências/owners**, não corrigir fazendo renumeração cega do Gênesis nem forçando SOUL sem sua contraprova. Seguem `YELLOW/BLOCKED` até correção no owner.
- `Porta, identidade e governança`, runs 38768620793 e 38768400760, jobs finais com falha, requerem reconciliação no respectivo gate (sem confundir com sucesso de testes locais).

**Estado honesto:** os logs acima pertencem ao SHA `5088569`, **não** ao HEAD após hotfix. Nova execução de CI é exigida para provar a correção de clipboard. Não houve `node --test` local, compilação Vite, pacote POMBO64, sessão Claude vinculada, merge nem deploy neste ciclo.


## 🍒 Cabeça Externa — catálogo A–Z ancorado

**INTENT:** cristalizar os princípios ensinados pelo CHEFE e oferecer leitura alfabética no **mesmo** Instinto Superior, sem painel novo. **Natureza desta seção:** ensinamentos/síntese da conversa de 17/10/2026, não execução de runtime nem censo do ledger NeuroLink. Os 26 verbetes são *índice humano curado*, não 26 novos aprendizados numerados nem 26 novos selos.

| Letra | Princípio | Regra verificável / aplicação |
|---|---|---|
| **A** | **Autocrítica** | Reconhecer erro e medir sua causa, sem atribuir sucesso por convicção. |
| **B** | **Bridge** | Reusar a ponte autorizada Casa ↔ VPS ↔ GitHub antes de criar transporte paralelo. |
| **C** | **Convergência** | Um organismo e um cockpit; múltiplas capacidades continuam com seus owners. |
| **D** | **Disciplina** | Treinar deliberadamente com hipótese, esforço focado e diferença observável. |
| **E** | **Ego em xeque** | Contraprova tem prioridade sobre defesa do próprio resultado. |
| **F** | **Frutos** | Saúde e qualidade se comprovam por efeito, teste e receipt. |
| **G** | **GitHub** | Main é fonte técnica versionada; merged não significa deployed. |
| **H** | **Hermes** | Executor reaproveitado; não duplicar motor, agenda ou memória. |
| **I** | **Intenção viva** | Cada pedido é delta da intenção, com contexto e owner recuperados. |
| **J** | **Julgamento** | A realidade e a contraprova decidem PASS/FAIL/UNKNOWN. |
| **K** | **Kaizen** | Observar, experimentar com segurança, medir, reter o que funciona. |
| **L** | **Legado** | Migrar com paridade, referência e rollback; não apagar a fonte cedo. |
| **M** | **Mentoria** | Consultar técnicas já provadas para encurtar descobertas repetidas. |
| **N** | **Não duplicar** | Procurar o owner e o objeto atuais antes de adicionar uma peça. |
| **O** | **Observação** | Pausa intencional, falha e ausência de sensor são estados diferentes. |
| **P** | **Papagaio OFF** | Respostas curtas; preservar a árvore de provas nas âncoras. |
| **Q** | **Qualidade** | Performance, testes, segurança e UX são critérios, não adjetivos. |
| **R** | **Receipts** | Registrar escopo, SHA, owner, timestamp, prova e NEXT_CURSOR. |
| **S** | **Segurança** | Segredos fora dos logs e da UI; uma caneta por escopo. |
| **T** | **Treinamento deliberado** | Repetição só vira aprendizado ao corrigir fraquezas medidas. |
| **U** | **Unificação** | Instinto Superior é a única superfície admin humana; owners seguem especializados. |
| **V** | **Validação** | Cópia parcial, porta aberta e HTTP 200 não fecham o ciclo. |
| **W** | **Worktree** | Preservar alterações e artefatos da Casa e da VPS; sem limpeza automática. |
| **X** | **XP operacional** | Lições viram ganho quando o resultado é reproduzível, não por tentativa acumulada. |
| **Y** | **YAML / contratos** | Contratos versionados orientam testes e handoffs; configuração não comprova runtime. |
| **Z** | **Zelo** | Observar tudo, reter o bem, registrar o aprendizado e evitar regressão. |

### Onde aparece, sem casca paralela

- **Destino humano:** `admin.centralldark.com` → Sala de Controle autenticada → Instinto Superior → aba **HUD · Selos · Gênesis** → seção interna recolhível **Cabeça Externa · A–Z**. Não adicionar oitava seção PAPAGAIO nem 11ª missão MCP; inserir conteúdo dentro do zone de conhecimento já existente.
- **Owner de UI já existente:** `apps/instinto-superior/src/components/central/HudDeterministico.tsx`, consumido por `CockpitShell.tsx`. Responsável pela evolução do componente: **PR #1843** (ativa); integrar **nesse mesmo escopo/escritor**, não editar por janela concorrente. Não acrescentar nova store, tabela persistente, coletor, API, skill, rota ou fonte de autoridade.
- **Fonte de aprendizagem:** `docs/CONSCIENCIA/APRENDIZADOS.md` + `docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json`. Esta tabela é o **índice editorial** deste contrato até existir vínculo verificável por UID; não inventar UID, número de lição ou resultado operacional para cada letra.
- **Origem legada:** `docs/HUD/HUD.html` permanece intacto, com referências preservadas. A seção A–Z é uma âncora adicional, não substitui Gênesis, selos, cadeados e zonas existentes.
- **Visual:** mesma pele, tipografia e componentes já utilizados; pesquisa alfabética acessível, acordeão compacto, uma letra por verbete, detalhes de prova/owner só quando existirem. Responsivo mobile, sem segundo menu, sem indicador PASS para princípios apenas documentados.
- **Teste discriminante no owner:** `apps/instinto-superior/scripts/verify-hud-zone.mjs`; confirmar 26 letras únicas e em ordem, interação teclado/busca, zero disparo implícito, permissão admin, nenhuma mudança nas 7 seções/10 missões, quatro peles preservadas, e build + readback visual na mesma SHA.

**RECEIPT / PROVA:** `DOC_ANCHOR=GITHUB_MAIN_READBACK_REQUIRED`; `UI_INTEGRATED=UNKNOWN`; `BUILD=UNKNOWN`; `DEPLOY=UNKNOWN`; `RUNTIME=UNKNOWN`. Não promover apenas pela presença desta especificação.

**NEXT_CURSOR:** reconciliar com PR #1843 → aplicar menor delta no `HudDeterministico` pelo writer do componente → rodar suíte e build no HEAD exato → readback da sala autenticada → receipt + decisão de promoção com os gates existentes. Preservar a migração da Casa/VPS e as alterações locais.


<!-- CENTRALDARK_BROWSERS_VSCODE_20261017 -->
## 🍒 Conexão Casa · Chrome for Testing · VS Code — evidência de 17/10/2026

**INTENT_ID:** CENTRALDARK-CHROME-VSCODE-OBSERVABILIDADE-MICRODEPLOY-20261017. **OWNER DE UI:** `apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx`, em edição na PR #1838; **não editar por segunda caneta**. Consumidor: `PainelAdminCentralDark` / Sala de Controle do Instinto Superior. Este bloco documenta o delta, não afirma instalação nem deploy.

**Prova visual enviada pelo CHEFE:** duas janelas **Chrome for Testing v155.0.8059.39** (perfis **Default** e **Profile 1**, associados ao cache Puppeteer nas telas) e uma janela **Chrome oficial v155.0.8059.85** (Profile 14 na captura). `chrome://version` identifica executável/perfil do navegador mostrado; capturas não atribuem processo/PID de terminal, não comprovam sessão Zendriver/CDP, Puppeteer conectado, Playwright em execução ou perfil de automação apto para testes. Preservar perfis, cookies, histórico, login e sessões; **não copiar dados do perfil**.

**Erro visível:** VS Code exibiu `A janela terminou inesperadamente (motivo: oom, código: -536870904)`. Isso confirma encerramento por falta de memória no processo/janela, **não identifica a extensão, Chrome ou PID responsável**. Sem amostra de CPU/RAM/pagefile simultânea não atribuir causalidade. Não reiniciar nem matar processos durante a migração sem coordenação do CHEFE.

**Prova de ponte independente (consulta MCP, 17/10/2026 08:59:26 UTC):** `sector=vscode`, `kind=vscode_bridge_status`, `route=tailscale`, `state=OK`, `source_last_write_utc=2026-10-17T08:50:12.6276681Z`, `offset=3068781`, `playwright=null`. A fonte voltou a avançar após 08:05 UTC; heartbeat não prova conexão interativa ao PTY ou leitura de PID. A função `Get-PlaywrightProbe` já existe em `scripts/casa/vscode-log-bridge.ps1`, enquanto `apps/modulos/mcp/src/vscode-log-route.js` interpreta `playwright`; `null` exige `UNKNOWN`, não `NOT_RUNNING` ou `PASS`.

**Projeção mínima no cockpit existente:** no cartão/zona de Observabilidade já pertencente à PR #1838, apresentar separadamente `CHROME_TESTING_OBSERVADO_EM_IMAGEM`, `CHROME_NORMAL_OBSERVADO_EM_IMAGEM`, `VSCODE_OOM_OBSERVADO_EM_IMAGEM`, `VSCODE_LOG_BRIDGE_LAST_HEARTBEAT`, `PLAYWRIGHT_RUNTIME=UNKNOWN`, `CHROME_PID=UNKNOWN` e `PTY_MCP_INTERACTIVE=NOT_PROVEN`, com origem, timestamp e limite de prova. **Não** tornar a foto estado online permanente. Sem nova API, coletor, store, tela, rota ou executor. Quatro peles e controles do HUD permanecem.

**Gates para microdeploy:** PR #1838 no HEAD exato + dependências das PRs #1842/#1843 conforme owner → suíte `apps/instinto-superior/scripts/verify-hud-zone.mjs` + build → CI no mesmo SHA → readback autenticado do cockpit e das quatro peles → deploy seletivo com prova de SHA e rollback → receipt. Os workflows atuais usam runners self-hosted que podem estar intencionalmente pausados pela migração; `QUEUED` não é `DEPLOYED`. O fallback MAIN-PINNED existente lista owners `mcp/hub_bot/hermes/oauth_broker`, **não autoriza usar owner falso para publicar Instinto Superior**.

**CURRENT:** `DOCUMENTED_MAIN=PASS_AFTER_READBACK` (quando o commit for comprovado); `UI_SOURCE_PR1838=NEEDS_WRITER`; `CI=UNKNOWN`; `MICRODEPLOY=NOT_PROVEN`; `RUNTIME_VISUAL=UNKNOWN`. **NEXT_CURSOR:** responsável pela PR #1838 consome este índice, implementa menor delta e prova build/deploy na rota aprovada após o runner voltar, preservando trabalhos locais e a cópia VPS 4.

## CENTRALDARK_HERMES_DESKTOP_WEBAPP_INVENTORY_20261106 — HUD incremental (PENDING)

Intencao CHEFE: preservar exatamente a interface do Hermes Desktop em execucao na Casa, reproduzi-la no navegador com o renderer existente, e somente depois incorporar capacidades do Bolt sem usar sua interface. Nao criar outro app, HUD, builder ou arquitetura.

| Evidencia | Estado | Fonte / prova |
| --- | --- | --- |
| Hermes Desktop local | FOUND | C:\Users\Administrador\AppData\Local\hermes\hermes-agent\apps\desktop; Hermes.exe observado em execucao |
| Git local Hermes | FOUND | branch centraldark/whatsapp-group-directory-michelin-20261103; fork segredounlock/hermes-agent; upstream NousResearch/hermes-agent |
| Alteracoes Hermes preservadas | FOUND | 3 modificados e 5 nao rastreados no git status; nao sobrescrever |
| Renderer React/Vite | SOURCE_FOUND | apps/desktop/src; apps/desktop/vite.config.ts; package.json dev:renderer na porta 5174 |
| Webapp browser host | HISTORY_FOUND | commits 7ac4cf552c (2026-10-19), 3883e02935 (2026-10-27), 51c8cba024 (2026-10-27), 7062229090 (2026-11-05) |
| Atualizador nativo | SOURCE_FOUND | apps/desktop/electron/app-updater.ts, update-gate.ts; e2e/update; nao equivale a push=atualizacao |
| Webapp local acessivel | NOT_PROVEN | portas 9120 e 5174 sem listener na sondagem; tentativa Vite local falhou por executavel ausente no caminho esperado |
| Interface web identica a Desktop | NOT_PROVEN | requer navegador, autenticacao, sessoes e comparacao visual |
| URL/porta historica usada pelo CHEFE | NOT_FOUND | historico de navegador e logs locais ainda nao examinados |
| CentralDark repo F: | FOUND | F:\CentralDark, main atras 33 commits de origin/main, dirty; preservar |
| Bolt | DEFERRED | capacidade futura apenas, nao usar sua interface |

Invariantes: REUSE_BEFORE_CREATE; ONE_SYSTEM_ONLY; ONE_WRITER_PER_SCOPE; UNKNOWN != PASS; ACTION != PROOF; MERGED != DEPLOYED; ZERO_REGRESSION. O inventario operacional permanece no owner scripts/centraldark-inventory-reconcile.sh; este registro e delta no HUD documental existente, nao segundo reconciliador. Nenhum servico foi iniciado nem atualizacao aplicada.

NEXT_CURSOR: buscar no historico do navegador e nos logs existentes o endereco/porta webapp anteriormente aberto; identificar o comando oficial compativel com a instalacao atual; iniciar apenas o renderer/webapp existente sem parar Hermes.exe; comparar visualmente Desktop e navegador; medir atualizador com contraprova; atualizar este mesmo bloco ate aceite explicito do CHEFE. FIXED_POINT=PENDING.

HERMES_PORT_TRACE_20261106 (delta do mesmo HUD; quesitos 09/10 permanecem PENDING): Casa SEGREDO, Tailscale status => windows-casa 100.123.93.25; serve HTTP tailnet:443 encaminha a 127.0.0.1:8787, que recusou conexao local; TCP tailnet:9100 encaminha a 127.0.0.1:9101, que aceitou TCP (sem prova de app). 9120/5174/8787 CLOSED. Identidade da rota 8787 encontrada no owner preexistente F:\CentralDark\scripts\remote-bridge\CentralDark-Remote-One.go linhas 110-113 e README-HUMANO-BRIDGE-TAILSCALE-OAUTH.md linha 39: rotulo hermes-dashboard, nao prova de paridade com renderer Hermes Desktop; codigo historico ainda apontava 9100->9100, diferente de configuracao Tailscale viva 9100->9101. No repositorio Hermes, apps/desktop/scripts/smoke-browser-host.mjs linha 14 usa http://127.0.0.1:9120 como default; webapp/launch tambem usa 9120. Prova: inspecao read-only de portas, Tailscale serve status e fontes locais; nao ha servidor web Hermes confirmado ativo. NEXT_CURSOR: investigar o processo/registro historico que abria 8787 e o host browser 9120; preservar a configuracao viva, sem iniciar novos servicos ate identificar o executor original.

HERMES_NOTEPAD_LOCALSTATE_TRACE_20261106 — evidência incremental somente leitura. Handoff fornecido pelo CHEFE medido historicamente em 2026-08-28T15:07Z (branch fix/git-conflict-padrao-unico, HEAD c4d713fbe3...), NAO estado atual. Reinspecao na Casa SEGREDO em 2026-11-06: `%LOCALAPPDATA%\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState` existe; TabState possui 272 arquivos .bin (total 2.017.032 bytes), WindowState possui 2 arquivos .bin; numero historico 30 abas NAO substitui inventario atual. `session-intelligence-harvester` ja existe em `.agents/skills/session-intelligence-harvester/SKILL.md` e estabelece HISTORICAL != CURRENT / SAME_VISUAL_SURFACE != SAME_BACKEND. Varredura read-only de bytes UTF-8 e UTF-16 em 272 .bin buscando literalmente 8787, 9120, 5174, webapp, tailscale e hermes: 0 arquivos com termos visiveis nessa codificacao, SEM afirmar ausencia dos dados (formato .bin pode ser estruturado/compactado). Nenhum conteudo sensivel de abas foi exposto, copiado ou persistido. Handoff cita `LocalState.zip` legado, mas a listagem da raiz atual so exibiu TabState/WindowState; zip historico ainda nao confirmado no host atual. Rota 8787 via Tailscale continua evidencia mais concreta; quesitos 09 e 10 PENDING. NEXT_CURSOR: investigar logs do executor preexistente de 8787/9120; se preciso, decodificar TabState pelo owner existente, sem escrever outro coletor.

HERMES_NOTEPAD_METHOD_GIT_COMMIT_07942A25 — #ACORDAR !CALIBRAR !BOT, lookup no repositório GitHub ServerVpss/CentralDark por histórico de commits: commit `07942a25af3ca2c0ea9cc3f33dfd3687678910b2`, 2026-08-22, titulo `GRAVAR MINERAÇÃO DO NOTEPAD LOCALSTATE COMO FONTE HISTÓRICA`, modificou o OWNER EXISTENTE `.agents/skills/session-intelligence-harvester/SKILL.md` com secao `Windows Notepad LocalState — mineração em lote`. Metodo DOCUMENTADO: LOCALSTATE -> INVENTARIAR WindowState/TabState -> RECONSTRUIR abas/janelas -> EXTRAIR texto/caminho -> DEREFERENCIAR quando permitido -> DEDUPLICAR -> CLASSIFICAR -> QUARENTENAR sensivel -> CRISTALIZAR somente inteligencia util. Contrato de evidencias: SOURCE, WINDOWS_FOUND, TABS_FOUND, UNSAVED_TABS, FILE_BACKED_TABS, DEDUPED_ITEMS, SENSITIVE_QUARANTINED, HISTORICAL_ITEMS, CURRENT_CANDIDATES, FORMAT_VERIFIED. RAW_LOCALSTATE -> DO_NOT_COMMIT; HISTORICAL != CURRENT; nenhum segredo no HUD. Link: https://github.com/ServerVpss/CentralDark/commit/07942a25af3ca2c0ea9cc3f33dfd3687678910b2 . A skill foi comprovada em GitHub e em F:; decoder executavel que recupere 100% dos .bin ainda NAO COMPROVADO. Quesito 10 permanece PENDING. NEXT_CURSOR: reutilizar o metodo desta skill para recuperar referencias de portas nas abas com comprovacao de formato; depois contrapor aos logs 8787/9120 e medir HTTP.

### CENTRALDARK_HUD_NATIVE_HALO_RECIPE — delta de integracao visual

RECEITA UNICA: `!CENTRALDARK`/`#HUD` -> recuperar checkpoint e quadro fixo -> `centraldark-operational-method/scripts/Identify-CentralDarkMonitors.ps1` localiza janela, processo, HWND e monitor -> `centraldark-hermes-visual-computer-use/scripts/blink_cursor.py --mode working --monitor N --renderer halo` usa Cua virtual e REUTILIZA `CodexHalo.exe` da bandeja como unica fonte do halo verdadeiro -> watcher/estado nativo Halo comanda luzes/temas (sem desenhar outro overlay) -> contraprova -> mesmo HUD e NEXT_CURSOR. Fonte da renderizacao: `apps/modulos/codex-halo-main/src/components/HaloOverlay.tsx`, `src/effects/FullEdgeEffect.tsx`, `src/App.css` e app instalada em `apps/modulos/Codex-Halo-Windows-x64-v0.1.8/CodexHalo.exe`. `PROCESS_EXISTS != OVERLAY_VISIBLE`: teste local no monitor 1 RC0 e cleanup concluido, porem estado Halo=idle, visual ativo NAO comprovado. Nao tratar demo/teste como atividade real e nao marcar fixed point da missao. Sem segundo cursor, overlay ou daemon.
### CENTRALDARK_HALO_BRANDING_SOURCE_FIRST_20261107 — nomes primeiro, antes da execucao

Por ordem do CHEFE, interrompida nova execucao do aplicativo. O source ORIGINAL existente em apps/modulos/codex-halo-main foi corrigido para branding CentralDark Halo no productName de src-tauri/tauri.conf.json, no titulo HTML index.html, nas mensagens/app_name de src-tauri/src/lib.rs e no menu/tooltip de src-tauri/src/tray.rs. JSON validado e readback local concluido. CentralDarkHalo.exe ja existe, mas o arquivo compilado possui metadata legada Codex Halo; source editado NAO equivale a exe recompilado. cargo nao esta em PATH, nao houve build, deploy nem reinicio. Preservados dev.qcoding.codexhalo, diretorio de dados Codex Halo e nomes de integracao legados para nao perder settings, auto-start e watchers. Nenhuma exclusao ou renomeacao de caminho em uso. Processo anterior CentralDarkHalo PID 46696 nao foi interrompido. NEXT_CURSOR: reconciliar scripts de instalacao/verificacao e referencias ao nome final sem migrar armazenamento, verificar toolchain Rust existente, build da MESMA source e contraprova do binario so depois, respeitando autorizacao CHEFE.

### CENTRALDARK_HALO_BUILD_AND_RENAME_READBACK_20261107 — NEXT_CURSOR provado

DELTA DE NOMES NA CASA: executavel original ja renomeado pelo CHEFE como `CentralDarkHalo.exe`; pasta do PACOTE movida no mesmo lugar de `apps/modulos/Codex-Halo-Windows-x64-v0.1.8` para `apps/modulos/CentralDark-Halo-Windows-x64-v0.1.8` apos confirmar zero processo usando a pasta anterior; sem copia nem delecao. Scripts de instalacao, verificacao, desinstalacao, suporte e hook historico renomeados de forma correspondente NA SOURCE ORIGINAL `apps/modulos/codex-halo-main` e no PACOTE, preservando state/registries antigos. `package-windows.ps1` ja aponta para `CentralDarkHalo.exe`/scripts novos/zip CentralDark; `blink_cursor.py` reconhece `CentralDarkHalo.exe` e recusa iniciacao automatica de binary de metadata antiga. Owners existentes mantidos.

CONTRAPROVA: parser de PowerShell => 11 scripts validos, 0 erros; configuracao Tauri JSON => PASS; Python `py_compile` => PASS. Tentativa protegida de build (`package-windows.ps1`) => `CENTRALDARK_HALO_BUILD_TOOLCHAIN_MISSING: cargo, pnpm`; stage anterior nao alterado. Instalador protegia contra EXE nao recompilado => `BLOCKED_UNBUILT_HALO: binary ProductName=Codex Halo`; abortado ANTES de tocar processo ou arquivos de instalacao. `CentralDarkHalo.exe` ainda tem ProductName/FileDescription `Codex Halo` nos metadados internos; portanto NOME EXTERNO != BINARIO RECOMPILADO, e UI DE TRAY ATUALIZADA != PROVADA. Ultima consulta de processos: CentralDarkHalo nao estava rodando; nao houve novo start, restart ou teste visual. Nao promover status dos quesitos 09/10 da missao Hermes. HELPER_SAFE_GATE_READBACK_20261107: execucao real do Python existente `blink_cursor.py --monitor 1 --mode working --duration 1 --renderer halo` recusada com `CENTRALDARK_HALO_BUILD_NOT_VERIFIED` (exit 1) ANTES de iniciar CentralDarkHalo.exe; readback: 0 processos Halo. Protecao foi efetiva e nao houve overlay/sessao nova. NEXT_CURSOR: toolchain Cargo+pnpm disponivel/autorizado -> rebuild da SOURCE existente -> metadados ProductName CentralDark Halo -> teste do installer/Verify e efeito real sem sobreposicao, mantendo Cua + HUD canonicos.
### VSCODE_VIBE_PROJECT_FOLDERS_OWNER_READBACK_20261107 — extenso nativa existente

OWNER CANONICO no GitHub `ServerVpss/CentralDark@main`: `skills/vs-code-restore/package.json`, `src/extension.ts`, `media/vibe.html` e `out/extension.js`; a `main` consultada tinha somente a view `centraldarkVibeCoding` e NAO continha `centraldarkWorkspaceFolders`. INSTALACAO LOCAL do mesmo ID `centraldark.centraldark-vscode-restore@0.2.1`: `%USERPROFILE%\.vscode\extensions\centraldark.centraldark-vscode-restore-0.2.1`.

DELTA LOCAL NO MESMO OWNER: adicionada view `Pastas do projeto` (`centraldarkWorkspaceFolders`) ao Explorer existente, sem `when=workspaceFolderCount>0` (condicao podia ocultar o painel); provider nativo lista arquivos e diretorios e permite `vscode.open` ao clicar em arquivos, nunca altera workspace; procura ancestor `F:\CentralDark` quando a janela aberta usa subpasta `F:\CentralDark\apps\modulos\Bolt`. Adicionado o comando `centraldark.showProjectFolders` e o botao `Mostrar pastas do projeto` no `vibe.html` atual. Build `tsc -p skills/vs-code-restore` => exit 0. `git diff --check` => exit 0. Instalacao feita por readback SHA256 identico de `package.json`, `out/extension.js`, `media/vibe.html` na MESMA extensao instalada; nenhum VSIX, extensao paralela ou workspace novo criado.

PENDENCIA DE CONSUMO/VISUAL: as tentativas de foco/reload da janela `Code.exe` PID 31056 foram bloqueadas porque a foreground real estava em Chrome/ChatGPT; NAO foram enviadas teclas para a janela errada. `INSTALLED != LOADED != VISIBLE`. Proxima acao: ao focar a janela de VS Code EXISTENTE, executar `Developer: Reload Window`, clicar `Mostrar pastas do projeto` e contraprovar a arvore renderizada abaixo de Vibe Coding. Ate tal prova, manter estado visual PENDENTE. Nenhuma publicaçao desta alteracao na main comprovada.
### CENTRALDARK_VSCODE_RELEASE_0_2_2_READBACK_20261107 — SAME OWNER / PROVA REMOTA

- INTENCAO: evoluir `skills/vs-code-restore`, sem workspace/extensao paralela; exibir pastas CentralDark + Bolt abaixo do Vibe Coding.
- PROVA VISUAL: CHEFE confirmou a arvore; UIA identificou `Pastas do projeto` com tipo Tree no VS Code existente.
- GITHUB: PR #1993 `https://github.com/ServerVpss/CentralDark/pull/1993`, branch `feat/vscode-vibe-project-folders-20261107`, commit remoto `7fd4c0a192e21c85fc518bbcf33a8652ea2f8a6a`, 7 arquivos somente no mesmo owner. Readback de manifesto/TS/HTML na branch realizado. `main` permaneceu inalterada.
- RELEASE: `https://github.com/ServerVpss/CentralDark/releases/tag/centraldark-vscode-v0.2.2` criado como **PRE-RELEASE** vinculado ao mesmo SHA (nao atualizar automaticamente ate promocao).
- VSIX: asset `centraldark-vscode-restore-0.2.2.vsix` tamanho 78.872 bytes; hash SHA256 `648e97fc1d054183665b487bf34f80985e2b57f93eb14c85442cc65d918930cc`. Digest remoto `sha256:` identico via GitHub Releases API, estado `uploaded`.
- TESTES: `tsc=0`, diff check=0, testes focados 6/6 PASS; suite completa 7/8, falha historica de `test/browser-pairing.test.cjs` por rotulo ja ausente na main; nao escamotear falha.
- GATES: `Supabase Preview=SKIPPED`, combined status `PENDING`; `PR_OPEN != MAIN_MERGED`; `PRERELEASE != RELEASE_STABLE`; fixed point local da view `PASS`, fixed point publicacao estavel `PENDING`.
- NEXT_CURSOR: checks aprovados no mesmo HEAD -> revisao -> merge autorizado -> readback main -> promover esta release existente a estavel, sem criar release duplicado.

<!-- CENTRALDARK_HERMES_ENVELOPE_VERIFIED_CHECKPOINT_20261107 -->
- **DECISAO DO CHEFE (07/11/2026):** a futura mudanca para `.centraldark/.hermes` so sera implementada quando reabrirmos a **source completa do Hermes Desktop/Electron+Chromium** para integrar o Cockpit como landing page. Esta etapa e **CHECKPOINT + DOCUMENTACAO + COMMIT**, nao e migracao de dados, modificacao do Hermes, mudanca de path ativo, compilacao Electron, instalacao ou deploy. Reutilizar o owner existente, preservar todas as missoes e continuar pelo menor delta.
### 🪬 CentralDark Desktop — Hermes original em `.centraldark/.hermes` (checkpoint de plano, 07/11/2026)

- **INTENCAO DO CHEFE:** uma CentralDark; Cockpit por fora; mesmo Hermes original por dentro de `.centraldark/.hermes`, preservando configuracoes, sessoes, historico, commits e motor. **NAO executar migracao destrutiva ou criar Hermes paralelo.**
- **FONTE VIVA DO CHECKPOINT (atual, ainda nao migrada):** `C:\Users\Administrador\.hermes\centraldark\verified-execution\centraldark-hermes-envelope-20261107\current.json`; log: `events.jsonl`. Owner: `scripts/hermes/verified-checkpoint.py`; reader existente: `scripts/hermes/centraldark-entry.py`.
- **MISSAO:** `centraldark-hermes-envelope-20261107`. **LAST_VERIFIED_STEP:** `baseline-owner-e-estado`. **RECEIPT_SHA256:** `c36c325caf0621d03178929c24f891d357142c5995d727b2e810079f9606880b`. **AT_UTC:** `2026-11-07T04:54:44.323821+00:00`.
- **PROVA:** comandos fonte e storage existentes, read-only; run exit 0; `HASH_CHAIN_PASS` (1 evento); `status --mission centraldark-hermes-envelope-20261107` e `centraldark-entry.py --status` recuperaram esta missao, mesmo SHA e cursor. **Somente baseline foi verificada**, migracao NAO foi realizada; plano executavel NAO registrado (`plan_ready=false`).
- **NEXT_CURSOR:** `RECONCILIAR_DOTCENTRALDARK_DOTHERMES_SEM_PERDER_ESTADO` → inventariar consumidores do HOME e caminhos, preservar estado original, definir compatibilidade reversivel, testar leitor/checkpoints e consumo no HUD existente, so depois considerar a troca do storage.
- **HUD:** referencia documental pronta para a missao. A UI existente `apps/instinto-superior/src/components/central/CheckpointCentralDark.tsx` exibe missao/NEXT_CURSOR/SHA e consulta a cada 30 s, mas seu leitor `apps/instinto-superior/src/lib/checkpoint.functions.ts` linhas 40 e 81 usa a rota na VPS `/root/.hermes/centraldark/bin/centraldark-entry.py`. O checkpoint desta operacao foi escrito na **Casa Windows**: NAO afirmar sincronizacao com a VPS. **HUD_UI_CONSUMER=SOURCE_PRESENT / CROSS_HOST_READBACK_PENDING**; reconciliar pela rota autorizada existente e provar na tela autenticada. `docs/HUD/README.md` nao e banco do checkpoint, sem novo painel ou rota.
- **INVARIANTES:** `SOURCE_EXISTS != MIGRATED`; `CHECKPOINT_VERIFIED != GOAL_COMPLETE`; `LAST_VERIFIED != LATEST_USER_INTENT`; missao isolada e preservada; nenhuma exclusao, reparenting ou movimentacao no HOME.
<!-- /CENTRALDARK_HERMES_ENVELOPE_VERIFIED_CHECKPOINT_20261107 -->


### CENTRALDARK_HALO_REBRAND_HERO_PARITY_20261107
OWNER: apps/modulos/centraldark-halo-main. Active component: CentralOverlay.tsx.
Cockpit integration: CentralDarkHaloHarness.tsx. Product: CentralDark Halo.
Hero parity source includes decorative window, center logo/message, edge timing,
transparent background, click-through. No second engine. Existing user data
and external Codex integration remain compatible; historical records preserved.
SOURCE_ONLY; native rebuild, UI verification, Casa-main reconciliation PENDING.
NEXT_CURSOR: CHECK_TESTS_READBACK -> MAIN_COMMIT -> CASA_RECONCILE -> UI_COUNTERPROOF.


### CENTRALDARK_HALO_COMPAT_PROTECTION_20261107
Code refs: apps/modulos/centraldark-halo-main/scripts/windows/Install-CentralDark-Halo.ps1,
scripts/release/package-windows.ps1, and README.md.
Reconciled existing Casa protections: native executable ProductName must match
CentralDark Halo before installation and cargo/pnpm must exist before release staging.
Legacy hook cleanup remains targeted. README download links now use the local release
guide and current Hero HTML instead of an unrelated upstream release package.
SOURCE_ONLY; rebuild, runtime, visual confirmation and Casa-main sync remain PENDING.
NEXT_CURSOR: POWERSHELL_SYNTAX -> COMMIT_MAIN_READBACK -> CASA_RECONCILE.

<!-- CENTRALDARK_MCP_PAIRING_ROUTE_20261107 -->
### MCP CentralDark + Casa — tunnel STDIO versus OAuth HTTPS (07/11/2026)

**CHEFE_INTENT:** manter Corpo Unico, conservar o tunnel e o token autorizados, usar no Cockpit o pareamento de codigo proprio em vez da tela externa `mcp.desktopcommander.app/verify-device`; concluir ChatGPT -> OAuth MCP -> Casa via owners existentes sem outro tunnel/servico/owner.

**CURRENT MEDIDO (07/11/2026, apenas leitura e testes focados):**
- **Forja openKylin** `openkylin-vm` no IP atual `192.168.35.130`; checkout `/home/CentralDark-OS/CentralDark` no HEAD `be787cf3df9a422aaa6c695c80d6fb142faa4300`; `centraldark-mcp-tunnel.service` **active/running** com cliente STDIO `tunnel-client` e subprocesso `apps/modulos/mcp/src/mcp-server.js --stdio --compact --admin`. `http://127.0.0.1:8742/readyz` **HTTP 200**. Nao afirmar que status do servico equivale a chamada autorizada do plugin.
- **Cloudflare**: tunnel ja existente `centraldark-casa-mcp`, estado **healthy**, ingress de `mcp.centralldark.com` -> `http://127.0.0.1:9101` no connector Windows. **Nao alterar/duplicar** esse tunnel sem upstream OAuth provado.
- **Casa**: `127.0.0.1:9101/health` apresenta `engine_connected=true` e recibo `list_directory` verificado; Tailscale Serve da Casa `:9100 -> 127.0.0.1:9101`; OAuth nao faz parte do Casa Agent. Pela rota publica `/health=200`, `/mcp` anonimo `401` esperado, mas `/tools.json=404` e `/.well-known/oauth-authorization-server=404`: catalogo e OAuth nao chegam ao servidor MCP completo.
- **MCP HTTP completo**: `apps/modulos/mcp/dist/index.js` existe na VM, com dependencias; porta `127.0.0.1:9100` **sem listener**, e `centraldark-native-mcp-http.service` **nao instalado/ativo como unidade user da VM**. Nao iniciar segunda instancia de writer enquanto o owner canonical VPS nao estiver reconciliado. Origem VPS `89.117.78.124:22` e `100.90.199.124:22`: TIMEOUT neste probe, `admin.centralldark.com` HTTP 523; isso nao prova o estado interno da VPS.
- **Pareamento proprio ja implementado** em `apps/modulos/mcp/src/device-pairing.js` e `apps/modulos/mcp/src/oauth.js`, com tela `apps/instinto-superior/src/routes/mcp-autorizar.tsx`. Testes na VM: `LOG_DIR=/home/CentralDark-OS/CentralDark/logs node --test tests/device-pairing.test.mjs tests/pairing-consent-flow.test.mjs` -> **12 PASS / 0 FAIL**; sem `LOG_DIR`, teste falha por diretório padrao legado `/root/CentralDark/logs/mcp` inacessivel ao usuario da VM. Teste de fonte nao equivale a OAuth publicado.
- **Distincao de autenticacao**: o codigo do fornecedor Desktop Commander nao autoriza CentralDark. O proprio OAuth 2.1+PKCE/DCR do MCP deve emitir/validar autorizacao; o tunel STDIO OpenAI em `:8742` e o Cloudflare `:9101` sao transportes separados. Nao mostrar, copiar ou reutilizar tokens nem inserir um segundo login paralelo.

**FIXED_POINT = PENDING**; **NEXT_CURSOR**: recuperar a rota de acesso ao **MCP HTTP completo ja existente** (sem duplicar instancia nem derrubar o Casa Agent); provar `/.well-known/oauth-authorization-server` + `/tools.json` no mesmo hostname HTTPS; confirmar consentimento admin via `/mcp-autorizar` e `/token`; executar `initialize`, `tools/list` e `casa_commander_read` no MCP autenticado atraves da ponte Casa; salvar receipt e readback. O clique humano de consentimento nao e substituido por automacao.
<!-- /CENTRALDARK_MCP_PAIRING_ROUTE_20261107 -->

<!-- CENTRALDARK_MCP_PAIRING_COCKPIT_DELTA_20261107 -->
### Corpo Unico — pareamento a partir do Cockpit, sem falso amarelo (07/11/2026)

**Intencao:** o botao de pareamento no HUD/Cockpit deve conduzir a tela MCP Dispositivos existente; o token de STDIO ja salvo nao deve aparentar inativo quando `/readyz=200`. Preservar Cloudflare, Tailscale, Casa Agent e consentimento administrativo.

**Source e prova:**
- `apps/instinto-superior/src/components/central/McpAdminIntegrado.tsx`: apos salvar, consulta estado real; se `READY_CHECK_PASSED`, exibe "Tunel STDIO ativo" e separa OAuth do plugin. Novo atalho "Abrir pareamento no MCP", sem segunda tela/senha.
- `apps/instinto-superior/src/components/central/McpConsoleCentralDark.tsx`: mesmo painel Dispositivos, ativado pelo evento `centraldark:mcp-open-pairing` ou query `mcp-pareamento=1`. Nenhum codigo foi fabricado e nenhum token/credencial exposto.
- **Main commits:** `701f3701fd3e8b04ee77d304030a33c4afdab047` e `6c99575b8aab0938b7db66637c07dc692b06d7ae`.
- **Forja:** HEAD `6c99575b8aab0938b7db66637c07dc692b06d7ae`; `npm run verify:hud` **33 PASS / 0 FAIL / 1 TODO**; `npm run build:vps` **exit 0**; reinicio **somente** `centraldark-instinto-superior.service` exit 0; `8080/sala-controle=200`, `8080/mcp-autorizar=200`, `8742/readyz=200`, unidade app **active**, novo botao presente no asset compilado.
- **Casa HUD owner local** `F:\CentralDark\scripts\remote-bridge\CENTRALDARK-CORPO-UNICO-HUD.bat`: mesmo BAT alterado, botao "Parear Casa" agora abre o Cockpit pelo alias SSH `openkylin-vm`, query `mcp-pareamento=1`; SHA256 `b395b33eaa3bd6c3b0820f6c2c6840102f1227a0ad573041c352fbd15d3abd9e`, parser PowerShell **0 erros**. Arquivo local NAO rastreado no checkout Git; nova acao so aparece apos reabrir o HUD. Nao afirmar deploy/commit do BAT.
- **Nao resolvido:** `mcp.centralldark.com/.well-known/oauth-authorization-server=404` e `/tools.json=404`; publico atende Casa Agent `:9101`, nao o backend OAuth HTTP completo. Botao abre painel real, mas **codigo OAuth e chamada ChatGPT -> Casa ainda nao comprovados**. `STDIO_READY != MCP_PUBLIC_OAUTH_PASS`.

**NEXT_CURSOR:** restaurar roteamento HTTPS do MCP HTTP canônico sem sobrescrever tunnel saudável; autenticar com consentimento real no painel existente, validar `/register`, `/authorize`, `/token`, `tools/list`, e `casa_commander_read` autenticado; publicar/registrar o BAT no owner com gates, sem duplicar script e sem descartar o historico. FIXED_POINT_GLOBAL=PENDING.
<!-- /CENTRALDARK_MCP_PAIRING_COCKPIT_DELTA_20261107 -->
<!-- CENTRALDARK_DESKTOP_BUILDER_RUNTIME_HUD_20261108 -->
### CENTRALDARK DESKTOP / BUILDER — checkpoint medido na Casa em 08/11/2026

**INTENCAO:** buildar o unico CentralDark Desktop a partir da SOURCE Code-OSS; manter Explorer, abas, extensoes, terminal e navegador, incluir Cockpit como landing com login e posteriormente Hermes como motor interno. Este bloco e recibo no HUD canonico e **NAO altera nem renumera o quadro ativo 01-33**.

**OWNER:** Skill Mae .agents/skills/centraldark-operational-method/SKILL.md; receita .agents/skills/centraldark-operational-method/Skills/centraldark-builder-destop/SKILL.md; prova Hermes scripts/hermes/verified-checkpoint.py. Raiz oficial C:\CENTRALDAR DESKTOP. projeto = junction F:\CentralDark; builder = junction para centraldark desktop-1.145.2\build (NAO DESCARTAVEL); instalador = destino do futuro EXE final; _toolchain = Node v24.22.1; source extraida e ZIP originais preservados.

| Quesito | Estado | Evidencia e limite |
|---|---|---|
| Visual Studio Community 2026 e SDK 26100 | PROVADO | MSI exatos recuperados da ISO Microsoft; SDK log i399 Apply complete result 0x0; vswhere isComplete=true, reboot=false. |
| MSVC 14.51 e Spectre x64 | PROVADO | biblioteca em VC/Tools/MSVC/14.51.36231/lib/spectre/x64, linker liberado para tree-sitter. |
| npm, tree-sitter e Copilot esbuild | PROVADO NOS TESTES | Erros nativos LNK1104 e pacote esbuild ausente superados no ciclo de compilacao posterior, sem deletar SOURCE. |
| npm run compile | PROVADO PARA COMANDO | exit 0 reportado no checkpoint existente; nao demonstra GUI correta. |
| npm run electron / consulta CLI | PROVADO PARA COMANDO | exit 0, Electron 43.8.3; nao demonstra GUI correta. |
| Binario Electron | PROVADO | .build/electron/Code - OSS.exe, 239554048 bytes, SHA256 cffb420f19c8fbf4270c2f10ee4a453f7b0a07488b0915b30cc7a13c877f2c56. NAO e instalador final. |
| Janela visual em 08/11 | CONTRAPROVA — NAO PASS | Print mostra tela padrao Electron com instrucoes para executar EXE path-to-app. Processo renderer PID 47036 roda com --app-path para resources/default_app.asar e user-data-dir Roaming/Electron; nao se comprovou GUI do Code-OSS. |
| Cockpit landing + autenticacao | PENDENTE | Nao demonstrado na janela atual. |
| Hermes integrado e configurado | PENDENTE | Implementar sobre SOURCE original, sem motor paralelo e sem migracao prematura. |
| EXE final e instalador CentralDark Desktop | PENDENTE | Binario de desenvolvimento nao e instalador de distribuicao; pasta instalador sem EXE final comprovado. |
| Overlay/mouse Cua e contraprova visual | PARCIAL | Recibos do cursor/clique existem, GUI real final ainda sem PASS. |
| GitHub main e HUD Cockpit consumindo este estado | PENDENTE | Este registro e LOCAL, checkout da Casa contem outras alteracoes; sem commit/push/readback da main nesta operacao. |

**CHECKPOINT EXISTENTE:** missao centraldark-hermes-envelope-20261107, script scripts/hermes/verified-checkpoint.py status: verified=9, events=10; last_step=codeoss-11452-compile-electron-runtime-cli-pass-20261108; current_sha256=8573d5515444fa686bf55b2c72ff3b68c16c8859245fa316fdcc243288e70715. Os 10 eventos nao implicam sucesso da GUI. Nao fabricar PASS.

**NEXT_CURSOR / PENDENCIAS:** (1) diagnosticar o entrypoint/empacotamento em .build/electron/resources: atualmente default_app.asar e nao o app Code-OSS; provar janela real com logs, processo e readback sem modificar SOURCE a esmo; (2) integrar Cockpit Vite como landing/login no owner da shell, preservando a interface e capacidades originais; (3) integrar Hermes original como modulo/atalho com interface existente quando autorizado, sem reparenting prematuro; (4) compilar CentralDark Desktop final, gerar instalador em instalador e testar o EXE instalado; (5) reconciliar dirty checkout F:\CentralDark, commit minimo/push main respeitando gates e conferir SHA/readback remoto e consumo no Cockpit. Preservar ZIP, source, junctions, worktrees, .env e todas as receitas. DOCUMENTED != EXECUTED; CLI_PASS != GUI_PASS; UNKNOWN != PASS; FIXED_POINT_DESKTOP=PENDING.


#### Atualizacao P0: modulos nativos de inicializacao (08/11/2026, Casa)

<!-- CENTRALDARK_DESKTOP_NATIVE_MODULES_20261108 -->

**Causa confirmada em scripts/code.bat:** @vscode/policy-watcher ausente inicialmente; apos rebuild direcionado, novo teste revelou @vscode/spdlog e @vscode/windows-registry ausentes. O EXE aberto isoladamente mostrou default_app.asar; o metodo correto para testar a GUI de desenvolvimento e o launcher existente scripts/code.bat na SOURCE original.

| Modulo | Estado de artefato | Contraprova local |
|---|---|---|
| @vscode/policy-watcher | ARQUIVO GERADO E REQUIRE PASS | build/Release/vscode-policy-watcher.node, 188416 bytes; require retornou createWatcher=function, exit 0; SHA256 b3bdfbdddda74e5afd621e4bf381d37504e2a3ca8efe66c24c0d190cfb187c25. |
| @vscode/spdlog | ARQUIVO GERADO | build/Release/spdlog.node, 570368 bytes; processo 27064 nao presente na ultima verificacao; sem exit code final recuperado. |
| @vscode/windows-registry | ARQUIVO GERADO | build/Release/winregistry.node, 119808 bytes; processo 27064 nao presente na ultima verificacao; sem exit code final recuperado. |

**Status rigoroso:** NATIVE_FILES_PRESENT=PASS para os tres modulos; POLICY_WATCHER_LOAD=PASS; SPDLOG_LOAD=UNKNOWN; WINREGISTRY_LOAD=UNKNOWN; CODEOSS_GUI_PASS=PENDING. Rebuild gerou arquivos sem apagar ZIP, SOURCE, junctions ou scripts. Nao marcar item 10 verde antes de novo boot e readback da janela real.

**NEXT_CURSOR P0 ATUALIZADO:** executar scripts/code.bat com Node portable 24.22.1 e variaveis de desenvolvimento da SOURCE; registrar erro seguinte ou janela Code-OSS; confirmar GUI via processo e evidencia visual. Depois integrar Cockpit, Hermes e instalador sem duplicar owners. DOCUMENTED != EXECUTED; FILE_EXISTS != GUI_PASS.


**CENTRALDARK_HUD_BUILDER_READBACK_20261108_1609 — remedição no mesmo owner:** Casa SEGREDO, 08/11/2026 16:09 BRT. Binário de desenvolvimento C:\CENTRALDAR DESKTOP\centraldark desktop-1.145.2\.build\electron\Code - OSS.exe existe (239554048 bytes, última gravação 04:37 BRT); não é instalador. Na SOURCE existem policy-watcher (188416 bytes), spdlog (570368 bytes) e winregistry (119808 bytes). POLICY_WATCHER_LOAD=PASS somente por teste anterior; SPDLOG_LOAD=UNKNOWN, WINREGISTRY_LOAD=UNKNOWN, CODEOSS_GUI_PASS=PENDING; na sonda de processo atual não foi observado Code - OSS.exe vinculado à SOURCE. O launcher nativo scripts/code.bat continua o próximo teste; não assumir GUI funcional pela presença de arquivos.

**GIT / CONSUMO DO HUD (remedição 16:09 BRT):** checkout F:\CentralDark em main@4d2af54c746c827e01c47778a4ce9f4165c39eee; referência local origin/main@b4b3effce8112e4c0023f3742e6d5cc33304ce49; ahead=0 / behind=48. docs/HUD/README.md modificado localmente; skill builder existente ainda sem rastreamento. CASA_MAIN_SYNC=BLOCKED/PENDING; HUD_COCKPIT_CONSUMPTION=UNKNOWN; COMMIT/PUSH_MAIN=NAO_EXECUTADO_NESTE_DELTA. Sem reset, clean, rebase, branch nova, alteração das junctions, ZIP, SOURCE ou processos. O quadro ativo 01–33 mantém todos os textos e semáforos; não converter status documental em PASS de runtime.
<!-- /CENTRALDARK_DESKTOP_NATIVE_MODULES_20261108 -->
<!-- /CENTRALDARK_DESKTOP_BUILDER_RUNTIME_HUD_20261108 -->
<!-- CENTRALDARK_VSCODE_NATIVE_EXPLORER_RECEIPT_20261108 -->
### VS Code Restore / Vibe Coding: native Explorer recovery (Casa, 08/11/2026)
**OWNER EXISTENTE:** skills/vs-code-restore. A extensao CentralDark mantem a Activity Bar propria sem ocupar o Explorador nativo. O comando centraldark.restoreNativeExplorer devolve somente a view nativa Arquivos; centraldark.showProjectFolders navega nas pastas no mesmo owner. Icone media/centraldark-activity.svg agora incluido na mesma extensao. A versao local e 0.2.5; alteracao de source, testes, pacote, lock e output compilado no mesmo escopo.

**CONTRAPROVA:** npm --prefix F:\CentralDark\skills\vs-code-restore run compile retornou exit 0. Testes com Node 24.22.1: browser-pairing.test.cjs exit 0, remote-terminal.test.cjs exit 0, vsix-auto-update.test.cjs exit 0 (tanto na fonte original quanto no checkout de publicacao para os testes). node --check em out/extension.js exit 0 e git diff --cached --check exit 0. Teste antigo do pareamento esperava o botao "Abrir confirmacao"; foi ajustado para conferir a mensagem existente "clique em Confirmar pareamento" sem alterar a autorizacao humana. O bundle foi recompilado e apenas dois espacos finais gerados foram removidos para atender diff --check.

**LIMITES:** publicacao no GitHub nao significa VSIX instalada, Code-OSS GUI carregada nem Cockpit/Hermes integrados. Nao realizar deploy ou alterar configuracao de SSH. NEXT_CURSOR: commit/push do mesmo owner, readback remoto e reconciliacao segura do checkout principal e das pendencias restantes.
<!-- /CENTRALDARK_VSCODE_NATIVE_EXPLORER_RECEIPT_20261108 -->
