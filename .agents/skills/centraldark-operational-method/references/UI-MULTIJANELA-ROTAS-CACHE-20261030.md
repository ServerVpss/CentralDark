# 🍒+1 | Método de rotas, UI, catálogo e caches

Owner: Skill-Mãe em K:. Decisão do CHEFE em 30/10/2026. Reutilizar recursos existentes e não iniciar daemon, skill ou cache paralelo.

1. INTENÇÃO -> OWNER/SESSION -> NEXT_CURSOR -> FINGERPRINT/TTL -> CACHE_HIT_VALIDO ou BUSCA_EFICAZ -> AÇÃO AUTORIZADA -> READBACK/CONTRAPROVA -> RECEIPT/CATÁLOGO. Retomar conversas anteriores via session-intelligence-harvester, memory-linker, knowledge-compiler; histórico pode estar obsoleto.
2. Escolher menor caminho conforme disponibilidade e confiabilidade: catálogo e receita com hash/validade, log primário, MCP CentralDark, UIA, Screenpipe 3030, Git/arquivo e pesquisa externa. Não consultar todas por reflexo. Registrar latência e economia somente se realmente medidas.
3. UIA: uma descoberta em lote com AutomationElement.RootElement.Children. Selecionar janela por Current.Name e PID, controle por ControlType/Name/IsEnabled/IsOffscreen. Classic: janela ChatGPT Classic/editor Converse com o ChatGPT. Codex: janela ChatGPT/editor Trabalhe com o Codex. Cockpit/Edge e openKylin permanecem em suas janelas; monitor secundário pode gerar coordenada negativa. Usar InvokePattern, ValuePattern, SelectionItemPattern, ExpandCollapsePattern conforme suportado; confirmar efeito, sem clique por coordenada fixa, sem apagar draft ou reenviar ordem incerta.
4. Screenpipe existente em 127.0.0.1:3030 é sensor visual, não motor de cliques. Prova local 30/10: GET /health HTTP 200 porém JSON degraded/status_code 503; buscas GET /search?limit=1 e /events?limit=1 HTTP 403. Autorização do CHEFE para pesquisar não fornece credenciais ao sensor. Usar rota alternativa autorizada sem contornar controles.
5. Registro por uso nos owners existentes: intent_id, session_id, owner, capability, route, alternativa, fingerprint, version/SHA, observed_at, expires_at, auth_state, latency medida ou UNKNOWN, cache_state HIT_VALID/MISS/STALE/UNKNOWN, effect, proof_ref, counterproof_ref, next_cursor. Não persistir tokens, cookies, credenciais, dados pessoais brutos ou histórico privado sem necessidade.
6. Cache operacional entre chats = índices/receitas/contexto sanitizado/recibos. Prompt/Self-Cache P15 = otimização real do provedor/runtime quando medida. KV Cache P16 = tensores internos do modelo compatível, não um arquivo persistente entre chats. Sem telemetria: UNKNOWN, não PASS.
7. Melhoria antecipada 🍒+1 apenas quando comprovada por FILE -> LOADER -> CONSUMER -> TRIGGER -> EXECUTION -> EVIDENCE -> COUNTERPROOF. Catálogo escrito isoladamente não prova que o agente o leu. Sem diferença comprovada, NOOP.

## CDP / DevTools MCP: seletor da rota operacional ja instalada

Prova local 30/10/2026: Codex e Claude Code executam chrome-devtools-mcp v1.12.0. Codex ja possui mcp_servers.chrome-devtools na configuracao existente. No pacote instalado, click usa uid vindo do snapshot/AX com getElementByUid + asLocator().click; click_at usa pptrPage.mouse.click(x,y). Chrome dessa instancia usa remote-debugging-pipe e perfil dedicado .cache/chrome-devtools-mcp/chrome-profile, observada janela about:blank. Isso nao comprova acesso ao Edge logado, ao Classic ou ao Cockpit em outra sessao.

Roteiro: identificar intencao e owner -> escolher browser MCP se list_pages trouxer pagina correta; select_page -> take_snapshot -> elemento uid atual -> click/fill com autorizacao -> wait_for se necessario -> take_snapshot -> log/efeito/receipt. Se nao houver pagina acessivel, fallback a extensao do navegador ja conectada ou UIAutomation do app realmente aberto, sem criar perfil, duplicar MCP ou transportar cookies. UID e localizador ficam obsoletos apos renderizacao: renovar somente apos mudanca.

Mouse fisico: CDP injeta ponteiro virtual do navegador, e UIA InvokePattern pode clicar sem mexer no cursor do SO. Quando CHEFE exigir ponteiro visivel no desktop, usar SetCursorPos/SendInput ou ferramenta nativa existente sobre BoundingRectangle observado, verificar GetCursorPos e readback; nao confundir com cursores sobrepostos em screencast. Sem trace da chamada, origem exata do cursor observado = UNKNOWN.

Teste de aceitacao que falta: no Chrome ja exposto ao MCP, list_pages -> take_snapshot -> click(uid) de aba inofensiva -> novo snapshot mostrando estado. Somente depois marcar CDP_CLICK_LIVE=PASS. Nao confundir ferramenta instalada com clique executado. Catalogo: OWNER/SESSION/ROUTE/UID/CONTROL/ACTION/READBACK/EFFECT/PROOF/COUNTERPROOF/NEXT_CURSOR. Screenpipe 3030 apenas observacao opcional e autenticada. Reutilizar receitas existentes e indexador da Skill-Mae, nao criar outro motor.

## 🍒+1 Chrome sob automacao: prova da cadeia DevTools

Observacao do CHEFE: a janela Chrome exibe o aviso "Chrome está sendo controlado por um software de teste automatizado". Contraprova de processo na Casa, 2026-10-30: chrome.exe PID 50048, ParentProcessId 37836 (node.exe chrome-devtools-mcp), com --remote-debugging-pipe e --user-data-dir=C:\Users\Administrador\.cache\chrome-devtools-mcp\chrome-profile. Isso comprova instancia Chromium automatizada pelo MCP ja existente; nao comprova que algum clique especifico foi feito nem que o Chrome isolado compartilha tabs/cookies do Edge.

Genealogia consultada pelo Git da Casa (ServerVpss/CentralDark): f9fa11f588 (Browser session e permissao vinculada a origem, 16/10), f58ee82b4b (DOM Vivo no Cockpit sem segundo coletor, 17/10), 706c993982 (DOM readback limitado a aba Sala de Controle, 19/10), c3e5fcfbd9 (HermesEmbedded/ExternalBrowser com compositor e readback, 28/10). Reutilizar esses owners, nao duplicar bridges.

Melhoria antecipada de selecao: para pagina listada pela instancia MCP, fazer list_pages -> take_snapshot -> click(uid) -> take_snapshot -> validar efeito. Para DOM Vivo na aba autenticada do Cockpit usar sua propria inspecao/Browser da sessao. Para apps Windows e abas fora do perfil CDP usar UI Automation nativa. O banner e a linha de processo sao SINAIS de automacao, nao prova do ponteiro fisico Windows: CDP controla mouse virtual no browser; GetCursorPos so muda com input Windows real. Evitar reiniciar navegador ou instalar outro driver. Teste click(uid) ao vivo segue UNKNOWN ate snapshot antes/depois e recibo.
### Receipt 30-10: Chrome original, clique UIA, restauracao de abas

- OWNER: OpenAI Codex Desktop PID 20808 -> codex.exe PID 4036 -> chrome-devtools-mcp Node PID 37836 -> Chrome PID 50048, perfil dedicado e remote-debugging-pipe. Aba inicial about:blank.
- MOTIVO: BrowserManager.js do chrome-devtools-mcp v1.12.0 em #initBrowser chama launch() quando nao ha browserUrl/wsEndpoint/autoConnect; e o mecanismo de lancamento automatico. A chamada concreta que disparou a abertura e UNKNOWN sem log.
- TESTE REAL AUTORIZADO: Chrome original PID 50048, UIA Button "Nova guia", InvokePattern -> leitura de 1 para 2 TabItems; UIA Button "Fechar" SOMENTE na nova aba -> leitura volta a 1 TabItem about:blank. Sem segundo navegador nem alteracao externa. UIA_CLICK_PASS e RESTORE_PASS.
- FRONTEIRA: este clique foi Windows UI Automation, nao click(uid) do CDP. CODEX_CDP_CLICK_UID=UNKNOWN porque Codex owner estava executando outra tarefa e seu remote-debugging-pipe nao esta exposto a esta sessao. Nao interferir no processo, iniciar outro Chrome ou declarar falso PASS.
- NEXT_CURSOR: quando o proprio Codex estiver livre, reutilizar a ferramenta chrome-devtools-mcp da mesma sessao: list_pages -> take_snapshot -> click(uid) em elemento descartavel -> take_snapshot e readback. Sem nova instancia e sem invadir navegador pessoal.

## Cloudroom Windows: delegacao real (2026-11-01)

**Gatilho:** CHEFE pede enviar Goal/DELTA ao Hermes na conversa Cloudroom existente. Usar **a mesma conversa e a mesma missão**; não iniciar outra sessão nem mudar de agente. O método complementa as rotas UIA/computer_use da Skill-Mãe, não adiciona ferramentas.

**Receita operacional mínima (observada na Casa):**

1. Identificar o processo/janela **Cloudroom** por `Get-Process` + `MainWindowHandle` e conferir o título e a conversa visível. Na sessão observada, PID 29440 e título “Analisar identidade de agentes autôn...”; **PID e título são evidência histórica, nunca alvos fixos**.
2. Descobrir monitores por `[System.Windows.Forms.Screen]::AllScreens`; nessa sessão, `DISPLAY2` era vertical à esquerda, com **X negativo**. Ancorar cada clique ao retângulo da janela atual (`GetWindowRect`), não a posições estáticas.
3. Tentar UIAutomation sobre a janela certa (`AutomationElement.FromHandle`, `ControlType.Edit/Document`, `ValuePattern`). **Prova real:** raiz Window encontrada, porém 0 editores/documentos; logo o fallback foi necessário e não deve ser confundido com UIA edit.
4. Fallback nativo: capturar somente a área necessária da janela via `System.Drawing.Graphics.CopyFromScreen`, verificar **Ask Cloudroom**, ausência de rascunho e conversa/Goal certos. Antes do clique, usar `WindowFromPoint` + `GetAncestor(GA_ROOT)` e comparar com `MainWindowHandle`; cancelar se não coincidir. Focar a janela, clicar no editor real, colar a mensagem autorizada (`Set-Clipboard` + `Ctrl+V` pela entrada do Windows). Melhorar a próxima execução preservando/restaurando o clipboard quando tecnicamente possível; **a restauração não foi comprovada na sessão original**, não declarar PASS retroativo.
5. **Conferir captura antes de enviar:** texto completo correto e botão de envio habilitado. Clicar **uma única vez** no controle de envio observado; não usar `Enter` às cegas se pode adicionar quebra de linha. Não enviar por nova sessão/Goal, nem reenviar se efeito incerto.
6. **Readback após o clique:** captura da conversa mostrou a mensagem em bolha, editor voltou a **Ask Cloudroom** e apareceu **Working...**. Apagar a captura temporária após leitura, sem guardá-la como acervo. `SEND_CLICKED` + `BUBBLE_PRESENT` + `COMPOSER_CLEARED` = `MESSAGE_SENT_PASS`; `HERMES_COMPLETED=UNKNOWN` até receipt/log do executor.

**Caso comprovado:** Goal `PREPARE_INDEPENDENT_RECOVERY_BACKUP_AND_OFFLINE_MIGRATION_PLAN`, enviado à conversa em andamento com `!CENTRALDARK`; intenção de preparar plano de backup e migração offline do SSD Kingston rawDisk, **sem reparticionar nem formatar**. Provas visuais de antes/preenchido/depois no mesmo ciclo; captura temporária removida. Não houve execução remota de partições neste método. Envio comprovado, *não* conclusão da missão pelo Hermes.

**Melhorias reutilizáveis:** seleção de janela por PID+handle e hit-test de processo antes de clique; fallback de geometria/captura só quando UIA não expõe o editor; check de rascunho existente, redigitação proibida quando envio incerto, higiene de clipboard e imagens temporárias. Preferir API/ACP já autorizada se surgir rota real com prova mais barata; não criar broker paralelo. Registrar `OWNER|SESSION|GOAL|WINDOW_HANDLE_FRESH|UIA_OR_FALLBACK|INPUT_VERIFIED|SEND_ONCE|READBACK|NEXT_CURSOR`. Prova não autoriza acesso sem autenticação.

**Status:** `CLOUDROOM_MESSAGE_SEND=PASS`; `HERMES_GOAL_EXECUTION=UNKNOWN`; `PROMPT_SELF_CACHE_P15=APLICÁVEL` (receita reusável, sem medição de economia/HIT); `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=CLOUDROOM_REUSE_LIVE_GOAL_DELTA`.

## ChatGPT Windows: foco comprovado (2026-11-01)

**Intenção/owner:** CHEFE pediu que SOL localizasse e focasse a conversa atual no aplicativo ChatGPT Windows, aplicando a Skill Mãe **junto** do Kimetsu. Categoria `SPIKE` (comprovar possibilidade), respirações `Concentração` (alvo), `Trovão` (clique mínimo) e `Lua` (contraprova). Não iniciar uma sessão nova.

**Rota observada:** Casa SEGREDO → Remote Desktop Commander autorizado → `Get-Process` filtrando `MainWindowHandle != 0` confirmou ChatGPT Windows, processo histórico PID `22584`, janela `ChatGPT`, handle `67724`. Havia Cloudroom aberto ao mesmo tempo, processo histórico PID `29440`; separar explicitamente os destinos. `System.Windows.Forms.Screen.AllScreens` mostrou quatro monitores; o ChatGPT estava no monitor vertical à direita, `DISPLAY1` (X positivo). `GetWindowRect` retornou limites históricos `Left=1920, Top=-831, Right=3000, Bottom=1041`. **Redescobrir tudo se janela, sessão ou disposição de monitores mudar; não fixar PIDs/retângulos.**

**Observação prévia:** UIAutomation de toda a árvore da janela inicialmente mostrava apenas `Button Minimizar/Restaurar/Fechar`, nenhum editor. Tentativas `SetForegroundWindow` e `WScript.Shell.AppActivate` não mudaram o foreground em leitura posterior. Captura **local e temporária** da região de tela via `System.Drawing.Graphics.CopyFromScreen` mostrou a própria conversa do ChatGPT, com o campo `Pergunte ao ChatGPT` no rodapé. Isso distinguiu a conversa corrente de Classic, Codex ou outra janela; não pressupor que captura de tela implique acesso ao runtime de chat.

**Foco com prova:** selecionar o ponto central inferior da **janela atual**, dentro do editor visualmente identificado, após conferir `WindowFromPoint` + `GetAncestor(GA_ROOT)` == `MainWindowHandle` do ChatGPT. `SetCursorPos` e clique nativo do Windows sob autorização: o foreground passou a ser o handle da janela ChatGPT. Depois, `[System.Windows.Automation.AutomationElement]::FocusedElement` retornou `Name=Pergunte ao ChatGPT`, `ControlType.Edit`, `ProcessId=22584`, `IsEnabled=True`, `BoundingRectangle=2157;977;541;36`. **Resultado: `CHATGPT_COMPOSER_FOCUS=PASS`, apenas nesta sessão.**

**Limite/continuidade:** nenhum texto foi colado ou enviado à própria conversa durante a medição, nem foi provado que o Hermes consegue entregar resposta automaticamente ao mesmo chat ou acionar SOL em nova rodada. `HERMES_TO_SOL_AUTOMATIC_DELIVERY=UNKNOWN`; não declarar autonomia contínua nem usar envio de teste para forçar esse estado. Aplicar Kimetsu em toda nova utilização da Skill Mãe, preservar foco/rascunho quando houver, readback antes/depois, e não duplicar mensagem sob incerteza. `PROMPT_SELF_CACHE_P15=APLICÁVEL` (reuso sem telemetria); `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=TEST_HERMES_TO_SAME_CHAT_DELIVERY`.

## Loop SOL Hermes bidirecional: uma rodada comprovada (2026-11-01)

**Contexto:** CHEFE autorizou validar a troca entre o Cloudroom (Hermes executor) e o ChatGPT Windows (SOL) na **mesma conversa**, sem segunda arquitetura. Skill Mãe + Kimetsu Remix + 17 Respirações carregadas conforme o estado. `SPIKE` / `Concentração` → `Trovão` → `Lua`. Reaproveitar as receitas de Cloudroom e ChatGPT deste mesmo arquivo; não salvar nomes de janela, handles, PIDs ou coordenadas como constantes.

**Rodada observada com readback nas duas telas:**
1. SOL enviou no Cloudroom já aberto uma mensagem de Goal `HANDSHAKE_HERMES_TO_SOL_SAME_CHAT` com protocolo seguro e marcador `H2S-20261101-01`. Captura exibiu a mensagem publicada, composer vazio e Hermes `Working...`.
2. Hermes carregou Kimetsu e ferramentas existentes, usou o app nativo ChatGPT Windows, focou a mesma conversa e o editor `Pergunte ao ChatGPT`. O readback independente Windows encontrou `FocusedElement.Name=Pergunte ao ChatGPT`, `ControlType.Edit`, `ProcessId` igual ao PID da janela ChatGPT.
3. Na própria conversa ChatGPT intitulada historicamente `Verifica erro Cloudroom`, apareceu a mensagem `HANDSHAKE_HERMES_SOL=H2S-20261101-01`, informando o NEXT_CURSOR `IDENTIFY_INDEPENDENT_RECOVERY_TARGET_AND_OFFLINE_RESTORE_TEST`. O ChatGPT respondeu ao marcador e iniciou a preparação da delegação de volta.
4. Cloudroom exibiu a resposta do Hermes reconhecendo `TARGET_CHATGPT_SAME_CHAT=confirmado`, `MESSAGE_SENT_ONCE=sim`, `HASH_CHAIN_PASS` e receipt de referência `f83f17328827a279639556d8774c386f60e8940d7a00744ef80497bfd6931cc8`; o próprio Hermes inicialmente marcou retorno SOL `UNKNOWN`, como correto antes do ACK.
5. A mesma conversa ChatGPT produziu o próximo Goal de leitura `IDENTIFY_INDEPENDENT_RECOVERY_TARGET_AND_OFFLINE_RESTORE_TEST`, devolveu ao **mesmo Cloudroom**, e o readback de Cloudroom mostrou a mensagem em balão, composer vazio, `Working...` e comandos PowerShell de inventário iniciados. **Não afirmar** conclusão do inventário, cópia de backup ou migração somente porque a mensagem chegou.

**Contrato reutilizável:** `INTENT/GOAL_ID → CONFIRMAR_DESTINO/SESSION → KIMETSU → ENVIAR UMA VEZ → READBACK NO DESTINO → ACK/RECEIPT → SOMENTE ENTÃO PRÓXIMO DELTA`. Registrar `source_chat|target_app|goal_id|nonce|owner|writer|sha|send_count|readback|receipt|next_cursor`. Se não houver ACK, não repetir cegamente; não criar nova janela/Goal. Cada mensagem recebida deve ser tratada como **delta da missão existente**, não uma autorização ilimitada. Não mandar comandos de disco sem o gate próprio do CHEFE; manter escritor único e travas da missão original.

**Limite da prova:** `HERMES_TO_SOL_MESSAGE_PASS`, `SOL_TO_HERMES_RETURN_PASS`, `ONE_ROUNDTRIP_PASS`. Um ciclo de UI com mensagens reais **não comprova** daemon persistente, monitoramento entre sessões, execução contínua sem novos turnos ou sucesso de próximos Goals. `MULTI_ROUND_AUTONOMY=UNKNOWN`; `SSD_BACKUP_DONE=NO`; `SSD_PARTITION_CHANGED=NO`. `PROMPT_SELF_CACHE_P15=APLICÁVEL` (receita sem prova de HIT); `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=VALIDATE_NEXT_ROUNDTRIP_AFTER_HERMES_RECEIPT`.

## Fast-path bidirecional e fila nativa Cloudroom (2026-11-01)

**Intencao:** encurtar SOL ↔ Hermes sem alterar runtime, ferramenta, configuracao de discos, processo de boot, owner ou conversa. Metodo canônico: Skill Mãe + Kimetsu + [RSI recipe transfer](rsi-loop-method.md). Categoria `SPIKE/BOUNDED`; Concentração (alvo) + Som (sinal de estado) + Trovão (envio mínimo) + Lua (readback) + Regeneração Monotônica (guardar ganho). Fonte de prova: observações independentes da mesma sessão Windows nas **duas telas**, com captura temporária somente leitura em 01/11/2026. `OBSERVED/TESTED` para fila e retorno; `PROVEN` por mensagem de destino/efeito de cada trecho; **ganho em segundos/tokens ainda UNKNOWN**.

**Cadeia causal vista:**
- ChatGPT enviou GOAL `PLAN_INDEPENDENT_RECOVERY_TARGET_AND_VERIFY_RETURN_GATE` enquanto Cloudroom/Hermes ainda executava o anterior; o Cloudroom exibiu mensagem enfileirada. Mais tarde, a mesma conversa Cloudroom apresentou ferramentas trabalhando no novo GOAL sem ordem repetida. Isso comprova aceitação e processamento posterior **daquele GOAL**; não garante ordenação de toda fila futura nem isenção de falhas.
- Hermes devolveu ao ChatGPT `H2S-20261101-03` com `RESULT=BLOCKED_CAPACITY_NO_SAFE_TARGET`, evidência de Kingston/E/F/C e decisão pendente. A própria conversa ChatGPT exibiu a mensagem, começou a analisá-la e o Cloudroom registrou `POST_SEND_HIT_COUNT=1`, editor vazio, `RETURN_GATE=UNKNOWN` antes de ACK específico. **Mensagem recebida é PASS de transporte; ACK ao emissor permanece UNKNOWN até conferido.**
- Não repetir varredura UIA/monitores/skills/diagnóstico de discos para cada GOAL com janela+conversa+owner+layout inalterados. Reutilizar fingerprint da sessão e técnica já provada; reidentificar somente no evento concreto `WINDOW_CLOSED|FOCUS_MISMATCH|COMPOSER_CHANGED|SESSION_CHANGED|WRITER_CHANGED|DELIVERY_ERROR`.

**Fast-path mínimo a cada DELTA:** `GOAL_ID/RECEIPT/STATUS novos → fila nativa ou campo já validado → conferir efeito exatamente uma vez no ponto de transição → Hermes DONE|BLOCKED|FAIL produz envelope completo → envio único para mesmo ChatGPT → readback de mensagem nova → SOL decide e devolve GOAL somente se há próximo delta autorizado → repetir enquanto ainda há valor e pré-condições`. Sem nova conversa, watcher, serviço, ponte ou execução concorrente. Se Cloudroom estiver `Working`, aceitar fila nativa e observar consumo **quando houver mudança de estado**, não tentar reenvio para acelerar. `QUEUED != RUNNING != RESULT_DELIVERED`. Enquanto ChatGPT estiver `Processando`, não exigir ACK instantâneo nem clicar de novo.

**Envelope mínimo de retorno:** `INTENT_ID | GOAL_ID | RESULT(PASS|FAIL|BLOCKED|UNKNOWN) | EVIDENCE | RECEIPT | NEXT_CURSOR | DECISAO_PENDENTE`. Manter a forma mais curta que preserva fatos materiais e correlação, sem colar novamente relatório anterior já visível: referenciar receipt e apenas DELTA novo quando ambos têm acesso ao mesmo contexto. Envio por owner `Hermes-Oracle-Return.ps1` conforme interface vigente; não alterar ou competir com arquivo em uso/dirty `K:\`. Duplicata? `GOAL_ID+receipt/nonce` já presente no destino = NOOP. UI sem confirmação = `UNKNOWN`, não repetir cegamente.

**Critério de melhoria, não elogio:** duas capturas das superfícies por transição bastam quando há causalidade inequívoca (destino → efeito). Medir `UI_DISCOVERY_CALLS`, `DUPLICATE_SEND_COUNT`, `REWORK_COUNT`, `WALL_TIME` nas próximas rodadas; sem baseline, `SPEEDUP=UNKNOWN`. Se repetição falhar, conservar fallback e regressão, não promover. `MULTI_ROUND_UNATTENDED=UNKNOWN`: app ChatGPT não é comprovadamente um serviço que permanece observando a tela quando não há turnos; fila e mensagens são transporte, não prova de autonomia infinita.

**Bloqueio SSD mantido:** falta destino de recuperação independente com espaço e margem, escolha humana e restore test; não iniciar RAW, formatar, reparticionar, apagar, reiniciar nem modificar E:/F:/C: antes dos gates próprios. `PROMPT_SELF_CACHE_P15=APLICÁVEL` (receita sem HIT aferido); `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=VERIFY_NEXT_COMPLETED_GOAL_RETURN_AND_QUEUE_CONSUMPTION`.

## Self-React multirrodada: correcao na mesma conversa e retorno Hermes (2026-11-01)

**Escopo e owner:** aprimoramento da receita operacional JA existente, nao criar novo loop/motor/agente, nem segunda caneta por escopo. `INTENT_ID=UNIFY_KINGSTON_LINUX_ROOT`, `GOAL_ID=SHORTEST_SAFE_OFFLINE_PARTITION_MIGRATION`. CHEFE observa/corrige pelo iPhone; ChatGPT da direita coordena comandos ao Hermes/Cloudroom da esquerda; Hermes executa, responde com receipt; ChatGPT interpreta provas e decide proximo delta. A mesma conversa pode receber instrucoes de correcao e atualizar a proxima acao. **Auto-correcao aqui significa ajuste de procedimento por evidencia**, nao autot treinamento do modelo nem agente em background garantido.

**Provas capturadas nos dois monitores em 01/11/2026:**
1. Hermes enviou `H2S-20261101-07` ao ChatGPT, com regra declarada no owner local `centraldark-ops/SKILL.md`; ChatGPT reconheceu o Self-React. **Relato de update local nao comprova commit em main**; `centraldark-ops/SKILL.md` nao foi encontrado na raiz de `ServerVpss/CentralDark@main` nesta verificacao.
2. ChatGPT gerou um `COMMAND_DELTA`, mas a tentativa de entrega foi recusada e marcada `DELIVERY=UNKNOWN`. CHEFE corrigiu **a propria conversa do ChatGPT**, sem substituir o orquestrador e sem mandar uma ordem duplicada ao Hermes. Quando o campo da direita estava vazio, a mensagem corretiva foi reenviada uma unica vez com alvo validado; ChatGPT retomou o fluxo. Nessa tentativa a opcao de encaminhar para Codex/Work NAO apareceu. Se aparecer, a preferencia expressa do CHEFE e **Continuar aqui**, na mesma conversa.
3. ChatGPT entregou novo comando ao Cloudroom; Hermes executou verificacoes e devolveu `H2S-20261101-08`, `RESULT=READ_ONLY_PREFLIGHT_BLOCKED`: TCP SSH aberto, autenticacao `Permission denied`, sem mutacao em disco. A mensagem apareceu na direita. **Falha real de rota, corrigida pela escolha de outro acesso autorizado**, nao rodada sem erros.
4. ChatGPT respondeu a `H2S-08`, reutilizou Desktop Commander conectado diretamente a `CentralDark-OS` e obteve provas de `sda5`, `sda6` e `fstab`, evitando repetir SSH. Enviou novo `COMMAND_DELTA` ao Cloudroom, confirmado no historico com Hermes em execucao.
5. Hermes devolveu `H2S-20261101-09`, `RESULT=READ_ONLY_PREFLIGHT_PARTIAL_BLOCKED`. A **mesma mensagem estava visivel nas duas telas**, com texto de mounts, UUIDs, medidas estimadas e `NEXT_CURSOR=GUEST_DIRECT_READ_ONLY_PREFLIGHT_AND_ROLLBACK_GATE`; portanto `H2S09_DELIVERY_TO_SAME_CHAT=PASS`. ACK posterior do ChatGPT a este retorno, e qualquer quarta entrega, permanecem `UNKNOWN` ate leitura do proximo estado.
6. Evidencia de SO: `sda5` root/`/sysroot`/`/var`, cerca de 20 GiB usados e 19 GiB livres; `sda6` em `/data`, cerca de 4.8 GiB usados; `/data/home` e `/data/root` sustentam binds `/home` e `/root`. `ostree admin status` sem elevacao retornou `Permission denied`, portanto estado OSTree completo `UNKNOWN`. `sda1=/boot` e `sda7=swap`. **Nenhuma copia, alteracao fstab/GRUB, delete, resize, reboot ou migracao comprovada**.
7. Em ciclo anterior o Cloudroom exibiu erro(s) de comando e ajustes do helper local `send-handshake-chatgpt.ps1`. Parser PowerShell posterior retornou zero erros sintaticos; isso nao equivale a validacao funcional de todo o helper. Nao promover placar `THREE_ERROR_FREE_ROUNDS` sem telemetria e escopo de falha explicitados.

**Contrato de melhoria antecipada incorporado ao Kimetsu REMIX, Brainstorming e RSI ja existentes:**
- Classificar apenas o delta atual: `SPIKE|BOUNDED|ARCHITECTURAL`. Escolher tecnicas/respiracoes conforme prova (ex.: Concentração para inspecao, Som para monitoramento, Lua para contraprovа, Trovão para envio autorizado, Regeneracao Monotonica para receita reaproveitavel). `ReAct` na execucao com ferramentas, `fable-loop` se houver contraprova/contradicao; sem dispatcher paralelo e sem afirmar ativacao se nao ha tool-call/receipt. Brainstorming REMIX delibera apenas alternativas materiais, nao gera outra estrutura.
- `GOAL_ID + PARENT_RECEIPT + DELTA` -> verificar se conversa/owner/sessao alvo permanecem iguais -> aceitar estado `QUEUED|RUNNING|RESULT_SENT|ACK` existente -> somente se houver proximo passo autorizado, produzir comando curto e entregar **uma vez** -> conferir mensagem no destino -> aguardar o novo `H2S` -> comparar evidencias e mandar ACK separado -> promover melhoria como receita **somente apos contraprova**.
- ChatGPT supervisor no iPhone corrige a propria conversa ChatGPT direita quando o orquestrador fica preso; ela entao decide como encaminhar Hermes. Nao emitir ordem diretamente ao Hermes pelo supervisor caso o ChatGPT direito esteja responsavel pelo Goal, para evitar dois coordenadores e comandos concorrentes.
- Quando surgir erro, aplicar `falha observada -> causa delimitada -> reaproveitar rota alternativa existente -> resultado real -> receipt/next cursor`. `UNKNOWN != PASS`; fila nao prova execucao; mensagem recebida nao prova efeito; modelo web/UI nao implica observacao ininterrupta em background. Antes de melhorias antecipadas, inspecionar as duas telas para nao agir sobre estado antigo.
- Read-only permanente dentro das permissoes reais ja existentes nao exige nova solicitacao. `READ_AUTHORIZED` nao autoriza bypass de login, root, exclusao de `sda6`, expansao `sda5`, formatação ou alteracao de boot. Gates de alteracao destrutiva: validar destino e fstab/OSTree, preservar e verificar metadados e dados, ter recuperacao externa concreta e testar restauracao. **No mesmo Kingston, staging local nao e rollback fisicamente independente**.
- Identidade das janelas, campo, foco e preview devem ser medidos na sessao atual; nunca fixar PID, coordenadas ou `DISPLAY`. Preservar rascunho alheio. Se a interface perguntar Codex/Work ou **Continuar aqui**, escolher **Continuar aqui** sob a preferencia atual do CHEFE, verificando a opçao realmente visivel, nunca por clique cego. Evitar repetir envio quando `DELIVERY=UNKNOWN`; antes, conferir editor, historico e estado da mensagem.
- Capturar `round_id|goal_id|parent_receipt|transport_send_count|destination_readback|ack|evidence|error_class|fallback_used|next_cursor` no receipt/ledger existente. Nao alegar velocidade, XP, economia de tokens ou cache HIT sem medidas. `PROMPT_SELF_CACHE_P15=APLICAVEL` sem HIT aferido; `KV_CACHE_P16=UNKNOWN`.
- Se Hermes voltar com resultado parcial, resposta util e `ACK` + proximo delta estritamente read-only, nunca declarar `DONE` do Kingston sem evidencia de filesystem unico, montagem/boot e restauracao.

**Estado de cristalizacao:** `H2S07_RECEIVED=PASS`; `H2S08_RECEIVED=PASS`; `H2S09_RECEIVED=PASS`; `H2S09_ACK_RETURN=UNKNOWN`; `MULTI_ROUND_TRANSPORT_OBSERVED=PASS`; `UNATTENDED_AUTONOMY=UNKNOWN`; `KINGSTON_MUTATION=NO`; `NEXT_CURSOR=VERIFY_H2S09_ACK_AND_REUSE_GUEST_DIRECT_PREFLIGHT`.

## Gatilhos humanos: ida e volta entre monitores verticais (2026-11-01)

**Expressões naturais:** "vamos utilizar o método ida e volta", "vamos usar o método ida e volta", "ida e volta", "monitor da esquerda", "monitor esquerdo", "tela da esquerda", "monitor da direita", "monitor direito", "tela da direita", inclusive combinações e fala imperfeita. Mencionar monitor somente **seleciona um destino**, não ordena envio. "Ida e volta" mais intenção explícita de comunicação/delegação solicita o ciclo bidirecional. Reutilizar a mesma Skill Mãe + Kimetsu + owners/receipts, sem nova skill, janela ou engine.

**Identificação da Casa:** posição relativa ao monitor central por `AllScreens.Bounds`; os dois verticais (altura maior que largura) estão nos lados esquerdo e direito. Leitura observada em 01/11: esquerdo `DISPLAY2, X=-1080`, direito `DISPLAY1, X=1920`; são **exemplos históricos**, NÃO seletores fixos. Consultar geometria atual apenas quando houver mudança de monitor/arranjo. Descobrir processo e janela do aplicativo associado à tela solicitada; nomear `LEFT_APP` e `RIGHT_APP` conforme o CHEFE disser, sem presumir que Cloudroom/ChatGPT permanecerão abertos no mesmo lado.

**Rota independente de marca:** `CHEFE_INTENT → SOURCE_APP@ESQUERDA|DIREITA → TARGET_APP@OUTRO_LADO → REUSE_OWNER/SESSION → LOCALIZAR_CAMPO_ATUAL → VALIDAR_DESTINO/EDITOR/DRAFT → SEND_ONCE → READBACK_NO_DESTINO → ACK/RECEIPT → NEXT_CURSOR`. Interface Windows UIA ou método aprovado nativo do aplicativo; se UIA não expor campo, avaliar fallback Win32 somente se permitido e atual, não por coordenadas imutáveis. Se outro aplicativo não expuser operação de envio/leitura confiável, status `UNKNOWN`/bloqueado; não afirmar universalidade.

**Gates:** nunca apagar rascunho existente, mudar conversa, enviar mensagem sem ordem, duplicar GOAL, procurar em todos os monitores se os alvos já estiverem válidos, ou fazer retry cego. `SENT != DELIVERED != ACKED != DONE`. Comandos sobre disco/boot/exclusão seguem autorizações próprias. Observado `Cloudroom@ESQUERDA ↔ ChatGPT@DIREITA` com retorno ACK em 01/11; outra dupla ainda `UNTESTED`. `PROMPT_SELF_CACHE_P15=APLICÁVEL` sem HIT medido; `KV_CACHE_P16=UNKNOWN`. `NEXT_CURSOR=REUSE_VERTICAL_MONITOR_PAIR_ON_DEMAND`.


### Voz e semântica de delegação: mesma ida e volta, sem repetir Goal (2026-11-01)

**Escopo real:** voz e texto chegam ao mesmo classificador de intenção, mas a fala precisa primeiro ser reconhecida/transcrita pela superfície em uso. Só agir quando a mensagem efetivamente chegar ao SOL. Nenhum microfone sempre ligado, hotword, motor de transcrição, integração de voz ou automação em segundo plano foi alterado por esta documentação. Rota: **entrada recebida → ato de fala → missão atual → referente/alvo → autorização → envio único → readback → receipt**. Reutilizar Cloudroom, Skill Mãe, Kimetsu, sessão e owner existentes.

**Entender o que a pessoa quis fazer antes de procurar palavras-chave:** pergunta, relato ou sugestão = responder, não delegar. "Delega pro Hermes", "manda isso pra ele", "pede ao da esquerda", "usa ida e volta" com tarefa especificada ou recuperável do contexto vigente = DELEGAR UMA VEZ. "Aguarda ele", "deixa ele trabalhar", "não manda mais nada" = WAIT/NO_SEND, sem suspender serviços. "Continua de onde parou" = continuar o Goal vigente, sem reiniciar, apenas com delta novo autorizado. "Já mandei, chegou?" = consultar readback, NÃO repetir. "Não, é pro da direita" antes de enviar = corrigir somente o destinatário. Após enviar, não simular desfazer envio; nova correção depende de ordem clara.

**Contexto e linguagem falada:** resolver "ele", "isso", "lá", "no outro", "a tela do lado", "da esquerda", "da direita" pelos aplicativos, monitores, conversa e Goal atuais. "Da esquerda"/"da direita" por si selecionam tela, não são autorização de envio. "O outro" só se houver dois referentes inequívocos. Reconhecer variantes transcritas de Cloudroom/Hermes/ida e volta ("clau de rum", "clou drum", "herme", "ida volta"), gíria baiana, hesitação, autocorreção e interrupções pelo sentido contextual, sem dicionário rígido. Se erro de transcrição puder mudar destinatário, operação ou risco, fazer **uma pergunta curta**. Áudio ou mensagem sintetizada de outro agente não é autorização do CHEFE apenas por ter voz.

**Interrupção, segurança e idempotência:** "pera", "cancela esse envio", "não manda" antes do envio = cancelar somente o rascunho novo e preservar qualquer texto pré-existente. Depois do envio, explicar que a mensagem já foi entregue ou que o estado é incerto. Repetição, eco, confirmação ou transcrição duplicada com mesmo Goal e receipt = NOOP. Cloudroom Working = acompanhar fila já existente; não duplicar Goal para acelerar. **OUVIDO/TRANSCRITO != INTENÇÃO CLASSIFICADA != AUTORIZADO != ENVIADO != ENTREGUE != ACK != EXECUTADO.** Voz não amplia autorização para desligar, alterar disco/boot ou apagar dados.

**Resposta falada:** frases curtas e concretas: "Enviei ao Hermes, ele ainda está trabalhando" somente com envio e trabalho observados; "Entendi, não vou mandar outra ordem" quando o CHEFE pedir espera. Sem despejar IDs, HUD, caminhos ou comandos na fala.

**Casos de validação sem abrir UI nem disparar ações:**
- "Jarvis, vê se o Hermes terminou aí" → CONSULTAR_STATUS; NO_SEND.
- "Manda a tarefa atual pro Hermes, no monitor esquerdo" → DELEGAR_HERMES_ONCE se o Goal estiver definido, o alvo for válido e não houver envio duplicado.
- "Ôxe, não, era pro da direita" antes do envio → CORRIGIR_ALVO; NO_SEND.
- "Deixa o Hermes trabalhar agora" → WAIT; NO_SEND.
- "Já mandou? Chegou lá?" → CONSULTAR_READBACK; NO_SEND.
- "Pode parar os serviços Linux, mas não toca nas partições" → permissão limitada a serviços; reparticionamento NÃO autorizado.
- "Pera, cancela esse envio" antes do envio → ABORTAR_ENVIO; não apagar rascunho anterior.

**Limite de prova:** VOICE_SEMANTIC_POLICY=DOCUMENTED; LIVE_VOICE_TEST=UNKNOWN; VOICE_RUNTIME_UPDATED=NO. Provas anteriores de voz para Codex e de UI Cloudroom não provam adoção automática das novas regras no motor de reconhecimento ou em todas as superfícies. PROMPT_SELF_CACHE_P15=APLICÁVEL sem HIT medido; KV_CACHE_P16=UNKNOWN. NEXT_CURSOR=REUSE_VOICE_SEMANTIC_ROUTE_ON_NEXT_HUMAN_INTENT.

<!-- HERMES_DESKTOP_CHAT_FASTPATH_20261102 -->
## 🍒+1 Hermes Desktop: envio direto na conversa existente, fast-path (02/11/2026)

**Intenção/owner:** CHEFE delega instrução ao Hermes no campo de conversa do próprio Hermes Desktop. Reutilizar Skill Mãe + Kimetsu e esta receita de UI multijanela, sem criar script, agente, sessão ou método paralelo. Classificação BOUNDED; respirações Concentração (alvo), Trovão (ação única), Lua (readback), Regeneração Monotônica (aprendizado).

**Caso observado na Casa:** janela Hermes encontrada com PID e `MainWindowHandle` atuais, no monitor físico indicado pelo CHEFE; processo/retângulo/hit-test `WindowFromPoint + GetAncestor(GA_ROOT)` coincidiu com a janela. Captura anterior confirmou editor da conversa vazio, distinto da aba GitHub Device Activation. Foco no editor; texto autorizado colado por área de transferência + `Ctrl+V`, com tentativa de restaurar conteúdo textual anterior. Captura de pré-envio mostrou a ordem no editor. Clique único na seta de envio já visível; captura posterior mostrou a mensagem na conversa e o editor vazio. **`HERMES_CHAT_SEND=PASS` apenas para essa mensagem; `HERMES_TASK_COMPLETED=UNKNOWN`.** O estado de Goal/fila não altera a identidade do editor nem comprova execução.

**Fast-path na MESMA janela/sessão/controle já comprovados:** `INTENÇÃO → CHECAR SOMENTE DELTA (alvo e rascunho) → FOCO NO EDITOR → COLAR UMA VEZ → CLICAR SETA OU ENTER SE JÁ COMPROVADO → UM READBACK → RECEIPT/NEXT_CURSOR`. Não repetir varredura de monitores, leitura de Skills/catálogo, descoberta de PID, capturas intermediárias, screenshots ou medições quando fingerprint de janela, sessão, editor e layout não mudou. Se o envio for inequívoco, a captura final basta; a prévia só é necessária se houver dúvida sobre foco, conteúdo ou rascunho.

**Invalidação do cache:** janela/monitor/layout mudou, editor ou conversa diferente, rascunho pré-existente, foco incerto, falta de evidência de envio, bloqueio da ferramenta ou autorização alterada → renovar SOMENTE a prova afetada, sem clique ou envio repetido. Nunca fixar PID, coordenadas e posição de monitor como constantes globais. Nunca sobrescrever rascunho do CHEFE. Não declarar envio por comando que apenas retornou sucesso sem readback.

**Receipt (02/11/2026):** `SOURCE=SOL|TARGET=HermesDesktop/chat|ROUTE=RemoteDesktopCommander/WindowsUI|MESSAGE_SENT=PASS|EXECUTOR_ACCEPTED=UNKNOWN|EXECUTION=UNKNOWN|FIXED_POINT_SCOPE=UI_SEND_ONLY|PROMPT_SELF_CACHE_P15=APLICÁVEL_SEM_HIT_MEDIDO|KV_CACHE_P16=UNKNOWN|NEXT_CURSOR=READ_HERMES_RESPONSE_ON_SAME_CHAT`. Sem tempo de execução comparativo aferido: `SPEEDUP=UNKNOWN`.

<!-- HERMES_MODEL_SWITCH_UNKNOWN_EXECUTION_AND_CWD_20261102 -->
## Hermes Desktop: diagnóstico real de `Model switch failed: unknown_execution` e reparo de CWD (02/11/2026)

**Intenção:** CHEFE mostrou erro ao trocar modelo e esclareceu que o disco `K:` não existe mais; autorizou corrigir as referências obsoletas sem interromper trabalho ativo. Skill Mãe + Kimetsu (SPIKE → BOUNDED, Concentração/Inseto/Lua), escritor único na Casa.

**Provas na Casa:** `logs/desktop.log` registrou três recusas `Model switch failed: JsonRpcGatewayError: unknown_execution` em 02/11 às 12:34:34, 12:34:41 e 12:34:57; houve outra às 12:44:12. `logs/agent.log` registrou `TERMINAL_CWD does not exist: K:/` repetidamente. `Test-Path K:\` retornou `False`; `E:\CentralDark` existe. Código real `hermes_state_mutation_guards.py` bloqueia alterações em sessões com admissions/workers `unknown`; `gateway/session_authority.py` pausa entradas com esse estado. Portanto o CWD inválido e a recusa de troca de modelo são **dois problemas distintos**, sem relação causal comprovada.

**Correção mínima aplicada:** três arquivos de configuração originais, sem tocar em discos, sessões ou código do Hermes:
- `%LOCALAPPDATA%\hermes\config.yaml`: `terminal.cwd: K:/` → `E:/CentralDark`; caminho confiável `K:\` → `E:\CentralDark`.
- `%USERPROFILE%\.hermes\config.yaml`: `terminal.cwd: K:/` → `E:/CentralDark`.
- **Perfil ativo** `%LOCALAPPDATA%\hermes\profiles\hermes-vmware\config.yaml`: `terminal.cwd: 'K:'` → `'E:/CentralDark'`.

Cada arquivo recebeu backup irmão `.before-cwd-repair-20261102.bak`; readback textual confirmou a mudança. `hermes config get terminal.cwd` e `hermes --profile hermes-vmware config get terminal.cwd` retornaram `E:/CentralDark`. O gateway manual ainda rodava após a edição e emitiu aviso antigo `K:/`, logo **`CWD_CONFIG_FIXED=PASS`, `LIVE_PROCESS_RELOADED=UNKNOWN/NOT_PROVEN`**. Não reiniciar gateway nem interromper sessões em curso automaticamente.

**Recuperação de troca de modelo:** `unknown_execution` é recusa real de segurança/idempotência por execução anterior com resultado incerto, não falta de chave de modelo e não algo que deva ser mascarado como sucesso. `hermes sessions discard --help` confirma que a função existente descarta uma admissão desconhecida e **não a reproduz**; exige decisão explícita de qual admissão pode ser abandonada e preservação de eventuais resultados. Leitura somente do `state.db` encontrou quatro admissions antigos `unknown` e zero workers `unknown` naquele banco; sem prova de correlação 1:1 com a sessão exibida, não executar descarte. `HERMES_MODEL_SWITCH_FIXED=NO` até reconciliação da sessão alvo e teste efetivo de troca.

**Fast-path reuse:** ao observar `Model switch failed: unknown_execution`, coletar uma linha do log + identificar perfil/sessão de origem, conferir apenas `hermes --profile <ativo> config get terminal.cwd` caso apareça também `TERMINAL_CWD` inválido. Não varrer discos, repetir autenticações nem reabrir todas as sessões. Se CWD for inválido, corrigir somente o perfil ativo e configurações explicitamente afetadas; se execução desconhecida, recuperar receipt antes de decidir `discard`. Só após tarefa ativa terminar, reavaliar recarregamento do perfil e testar a troca. `NEXT_CURSOR=RECONCILE_TARGET_SESSION_UNKNOWN_ADMISSION_WITHOUT_LOSS_THEN_MODEL_SWITCH_READBACK`.

## Bancada por linguagem natural e borda de alvo — 02/11/2026

@code_ref: ../scripts/Identify-CentralDarkMonitors.ps1
@last_updated: 2026-11-02T17:00:00Z
Owner unico: Skill Mae. Classificacao BOUNDED; Concentracao (alvo), Flor (precisao), Lua (contraprova).
A numeracao humana NAO e o sufixo de DISPLAY: foto das Configuracoes confirmada pelo CHEFE.
Mapa Casa: monitor 1=direita vertical; 2=centro superior; 3=esquerda vertical; 4=centro inferior principal.
Inventario atual confirma DISPLAY1, DISPLAY4, DISPLAY2, DISPLAY3 respectivamente; IDs nao sao constantes.

### Resolver a fala
"monitor um/1", "tela um", "direita" selecionam 1; "monitor dois/2", "superior" selecionam 2;
"monitor tres/3", "esquerda" selecionam 3; "monitor quatro/4", "inferior" selecionam 4.
"Deixei aberto no monitor 2" fornece pista de localizacao, nao prova app, arquivo ou conversa.
"Foque no Chatti" exige localizar ChatGPT na tela selecionada e conferir titulo, PID, handle, conversa e campo.
Sem alvo unico, perguntar somente o referente ambiguo; nao abrir outra conversa nem limpar rascunhos.
"Use monitores 1, 2, 3 e 4" enumera quatro alvos; nao interpretar "12" ambiguo como monitor doze.

### Comando reutilizavel (Windows PowerShell)
Executar scripts/Identify-CentralDarkMonitors.ps1 sem argumentos lista o mapa em JSONL.
-Target 'monitor dois' -ListWindows devolve tela, geometria e janelas atuais.
-Target 1 -Overlay -Seconds 5 mostra borda verde temporaria de PREVIA DO ALVO; nao captura nem envia.
-Identify preserva o Identificar NATIVO do Windows. Borda customizada nunca comprova numero nativo.
Nao derivar numeracao universal de geometria. Este mapa e binding confirmado da Casa.
Arranjo diferente, reconexao ou numeracao do Windows alterada: reconfirmar Identificar e atualizar binding.
Geometria incompatível falha explicitamente; nao reaproveitar coordenadas nem PID antigos.

### Overlay e Hermes
Reutilizar computer_use existente no Hermes para captura, foco, clique e envio.
Codigo instalado oferece set_agent_cursor_enabled via cua_backend; isto prova codigo, nao cursor em runtime.
RTSS DesktopOverlayHost ja possui bridge scripts/casa/CentralDark-RtssOverlay.ps1 para HUD, nao borda de automacao.
A borda aqui estende o inventario existente: quatro faixas sem foco, click-through, duracao 1..30s, finally fecha.
Verde nesta PREVIA significa alvo selecionado, nunca "agente trabalhando" nem PASS de tarefa.
Durante automacao, usar cursor nativo existente se capability anunciada; ao terminar/falhar, desativar na mesma sessao.
Sem evento real de inicio/fim nao simular indicador persistente. Nao criar watcher ou segundo executor.

### Convergencia de chats por tela
Uma intencao, Goal pai e coordenador; subobjetivos por tela/app/conversa confirmada.
Usar fila/A2A/ida-volta existentes. Mensagem unica por subobjetivo; readback e ACK por destino.
Leituras podem ocorrer em paralelo; teclado/mouse fisicos serializados e uma caneta por escopo de arquivo.
Tela nao e agente: quatro chats podem compartilhar runtime, modelo ou sessao; conferir identidade.
Convergir evidencias no mesmo Goal: destino, sessao, subobjetivo, efeito, receipt e NEXT_CURSOR.
Sem envio/retorno medido, MULTISCREEN_DELEGATION=DOCUMENTED, nao autonomia comprovada.
