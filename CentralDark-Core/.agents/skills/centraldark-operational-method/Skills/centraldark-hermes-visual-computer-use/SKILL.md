---
name: centraldark-hermes-visual-computer-use
description: Identificar monitores por numero ou posicao, capturar um monitor autorizado com Windows.Graphics.Capture e mostrar moldura verde de atividade no Hermes Windows 11. Use para captura de tela, monitor um/dois/tres/quatro, bancada operacional e automacao visual com indicador, sem substituir o cursor Cua existente.
platforms: [windows]
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
metadata:
  hermes:
    category: productivity
    tags: [desktop, computer-use, monitors, capture, overlay]
---
# CENTRALDARK Hermes Visual Computer Use
Reutiliza Skill Mae + Kimetsu para contexto e o computer_use Cua para cursor/teclado.
Este complemento fornece a captura WGC por monitor ausente no driver instalado; nao substitui captura de janela Cua nem usa outro motor de input.

## Ativacao e ferramentas reais
Instalacao: scripts/Install.ps1 publica o .NET na biblioteca Skills/ da Skill Mae e instala o plugin existente no HERMES_HOME real.
Descoberta: Ler Skill Mae em centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use/SKILL.md; ferramentas no toolset hermes_visual_computer_use. O plugin permanece registrado como hermes-visual-computer-use por compatibilidade; sem segunda pasta de Skill.
Uma sessao GUI ja aberta pode manter catalogo congelado. Usar nova sessao ou recarga nativa de plugins; nao reiniciar o aplicativo nem interromper tarefas alheias.

1. computer_list_monitors({}) retorna quantidade pela lista, numero logico, Device, coordenadas fisicas, resolucao, DpiScale, Primary e Connected.
2. Resolver "monitor um/1", "dois/2", "tres/3", "quatro/4" pelo Number atual. Numeracao humana da Casa foi vinculada por foto: 1 direita, 2 superior, 3 esquerda, 4 inferior. DISPLAY nao e numero humano universal. Posicao/arquivo/app citado e pista; validar janela/conversa atuais antes de agir.
3. computer_capture_monitor({"monitor":1,"authorized":true}) retorna imagem multimodal e encerra captura/moldura. authorized=true somente com pedido do usuario para aquela tela.
4. Para automacao solicitada: mesma chamada com keepActive=true, leaseSeconds=30. Reutilizar computer_use existente; hooks refletem AUTOMATING durante input, CAPTURING apos retorno. O cursor permanece Cua, nao e movido por esta skill.
5. computer_get_active_monitor({}) e computer_get_capture_status({}) leem o processo da mesma sessao.
6. computer_hide_overlay({}) encerra WGC e overlay no mesmo owner. on_session_end, EOF, timeout de lease, alteracao de geometria/DPI e descarregamento tambem limpam recursos.
computer_show_overlay({"monitor":1}) e PREVIA, nao captura: nunca declarar CAPTURA ATIVA sem WGC iniciado.

## Configuracao
default.json configura somente o overlay proprio. nativeCaptureBorder=true e clickThrough=true permanecem obrigatorios.
Espessura 10 pixels fisicos; #00D889; opacidade 0.30; sombra difusa; cantos arredondados; fade 220ms.
Texto: HERMES COMPUTER USE MONITOR 01 CAPTURA ATIVA durante sessao real.
WGC.IsBorderRequired=true quando suportado. Falha de exclusao da moldura da captura reprova a operacao.
Nao ocultar borda nativa, nao alterar Windows, nao capturar continuamente sem pedido. Lease maxima 120s.

## Estados e recuperacao
IDLE, INITIALIZING, CAPTURING, AUTOMATING, PAUSED, STOPPING, ERROR.
Falhou: registrar erro exato, consultar computer_get_capture_status, encerrar somente esta sessao.
Monitor desconectado ou resolucao/DPI alterados: encerra; enumerar novamente antes de retomar.
Borda nativa WGC != moldura WPF propria != cursor Cua. Nao afirmar que render de borda prova input.
Imagens temporarias sao removidas apos codificacao multimodal; output explicito pede retencao PNG sem sobrescrita.
Nao criar watcher, scheduler, MCP, UI ou runtime de input paralelo.

## Validacao
Pedido: "Hermes, identifique todos os monitores conectados ao computador. Apresente a quantidade, resolucao, coordenadas e monitor principal. Ative o overlay verde no Monitor 1, faca uma captura de diagnostico e encerre a captura corretamente."
Executar ferramentas acima, conferir imagem e terminar IDLE/captureActive=false/overlayVisible=false.
Testes e limites: [referencia tecnica](references/technical.md), [teste executavel](scripts/test_visual.py).
Fisicamente nao testar topologias 1/2/3 ou DPI diferente sem essa bancada real; teste sintetico nao equivale a hardware.
Antes do input Cua, capture a janela com pid/window_id explicitos e confira que pertence ao monitor selecionado. Os hooks so indicam AUTOMATING com HWND conhecido e MonitorFromWindow correspondente; alvo desconhecido nao e promovido a controle comprovado.

## Reconhecimento natural e piscada ÔÇö confirmado pelo CHEFE em 02/11/2026
Entrada de qualquer modelo: verbo + alvo + efeito. "Pisca monitor um/1" = somente moldura no monitor 1; "isca monitor dois" no mesmo teste conserva a intencao de piscar. Nao interpretar confirmacao como nova ordem e nao duplicar envio por mensagens repetidas antes da execucao.
Casa confirmada fisicamente: 1 direita vertical; 2 centro superior horizontal; 3 esquerda vertical; 4 centro inferior horizontal principal.
Prova: tres ciclos por tela executados e apagados; CHEFE confirmou visualmente as quatro telas, individualmente e na ordem 1,2,3,4. Esta prova valida mapeamento e overlay nesta bancada, nao topologias diferentes.
Executar scripts/blink.py --monitor 1 pelo Python do Hermes. O helper usa o mesmo visual.py: show_overlay -> .65s -> hide_overlay -> .35s, tres vezes, finally fecha somente sua sessao. Nao captura tela, nao clica e nao move mouse.
Via ferramentas do Hermes: repetir computer_show_overlay/espera/computer_hide_overlay com os mesmos tempos e alvo. Nao criar outro executor para piscar.
Para qualquer numero/posicao: consultar computer_list_monitors somente se alvo, geometria, conexao ou binding mudou. Nunca derivar numero humano do sufixo DISPLAY.
Resposta: "Monitor N: tres piscadas executadas. Moldura apagada." Confirmacao visual so quando o humano disser ou houver prova independente; nao inferir pelo retorno do processo.
**Combinado antes de executar (sem pedir autorizacao de novo):** avisar em linguagem natural o que vai aparecer, em quais telas e em que ordem; dizer desde o inicio que ao terminar vai perguntar uma unica vez se o CHEFE viu. Exemplo: "Vou piscar as telas 1 a 4, uma por vez, tres vezes cada. No final, me diga se viu todas." Apos terminar, perguntar somente se ainda faltar confirmacao. Se o CHEFE ja confirmou espontaneamente, aceitar e seguir, sem perguntar outra vez. Se nao viu, investigar o efeito na tela indicada, sem repetir cegamente. Essa comunicacao e parte da receita existente, nao um gatilho, script ou servico novo.
**Confirmacao recebida em 09/11/2026:** o CHEFE acompanhou e viu as quatro telas piscarem na ordem 1ÔåÆ2ÔåÆ3ÔåÆ4 no teste anterior. Nao solicitar novamente confirmacao desse mesmo teste.
Onde modificar: SKILL.md=metodo; default.json=aparencia/binding; native/=WGC/overlay/estados; scripts/=ponte/plugin/instalacao/testes; references/=documentacao e provas.

## Cursor nativo integrado: receita Michelin comprovada

**Fala natural = monitor + acao.** "Posicione no monitor 2", "bota o mouse virtual na tela dois", "leva o cursor pro monitor de cima", "aponte no monitor dois" e "mostre o mouse na tela 2" significam posicionar o **cursor virtual Cua** e mostrar a moldura Hermes no monitor humano 2. Aceitar numero 1 a 4, por extenso ou posicao confirmada (1 direita, 2 superior, 3 esquerda, 4 inferior nesta Casa). "Posicione" = uma previa de 5 segundos; "pisque" = tres ciclos. Mouse fisico somente quando explicitamente pedido. Perguntas, negacoes e relatos nao disparam acoes. A fala nao exige frase literal nem outro parser.

**Receita real comprovada em 02/11/2026:** usar o daemon Cua ja aberto com chamadas diretas cua-driver call: start_session -> set_agent_cursor_enabled(true) -> move_cursor(scope=window, x, y) -> end_session no finally, sempre usando o mesmo rotulo de sessao. Coordenadas absolutas do desktop virtual; no monitor humano 2, confirmado X=0 Y=-1080, 1920x1080, o cursor foi mostrado em (960,-702), calculado por X+Width/2 e Y+Height*.35. O CHEFE confirmou visualmente o cursor virtual nesta tela. get_agent_cursor_state pode retornar position=null e move_cursor effect=unverifiable: isso nao invalida a prova humana. O caminho CuaDriverBackend.start() travou 30 segundos com drivers 0.21.0 e 0.28.2; usar a rota direta CLI que funcionou. A moldura vem do visual.py/plugin existente via show_overlay/hide_overlay. O helper existente scripts/blink_cursor.py --monitor 2 --mode position combina cursor e overlay; --mode blink conserva tres piscadas. Nao abrir outro daemon, criar novo cursor nem manter captura permanente.

Para piscar com mouse visivel, usar scripts/blink_cursor.py --monitor N ou --all (ordem humana crescente). Reutilizar a sessao persistente CuaDriverBackend do Hermes e o overlay visual.py existente. Posicionar primeiro o cursor e depois piscar a moldura e o cursor tres vezes. Consultar references/native-cursor.md antes de executar.
Usar scope=window e coordenadas ABSOLUTAS do desktop virtual: X+Width/2, Y+Height*.35. Nao combinar target com scope. Nao usar scope=desktop: ele move o mouse fisico. Cor distingue sessoes; nao identifica monitor.
Prova humana real: references/native-cursor-confirmation.json. A foto mostra exatamente hermes-443ff947f17d. Na versao Windows Cua 0.28.2, position:null e um valor fixo no codigo upstream; nao interpretar como cursor invisivel.

## Modo operacional visual: clique com cursor virtual Cua + overlay (02/11/2026)

**DECISAO DO CHEFE:** na automacao visual do Hermes CentralDark, o clique deve ser feito pelo **cursor virtual do `cua-driver`**, nao pelo ponteiro fisico do Windows. A janela real deve ficar focada e a moldura verde do `visual.py` deve permanecer visivel **na mesma tela e durante o deslocamento e clique**, encerrando-se apos a acao. Evoluir somente o helper existente `scripts/blink_cursor.py`: o modo `click` foi acrescentado sem alterar `blink` e `position`, nem criar outro driver, script ou Skill.

**Receita operacional:** identificar janela viva, PID e HWND atuais; identificar monitor e ponto de clique pelo centro do controle acessivel/observado (UIA e hit-test); chamar `scripts/blink_cursor.py --mode click --monitor N --pid PID_ATUAL --hwnd HWND_ATUAL --x X_ABSOLUTO --y Y_ABSOLUTO`. O helper valida PID/HWND/retangulo e monitor, foca a janela **sem mover o mouse fisico**, inicia a sessao Cua, liga o cursor virtual, mostra o overlay na tela certa, executa `move_cursor(scope=window)` e `click(scope=window, delivery_mode=background)`, confirma fechamento do overlay e encerra apenas a propria sessao. `x/y` sao coordenadas absolutas de desktop; o helper converte para as coordenadas locais exigidas pelo clique da janela.

**Prova tecnica desta evolucao:** `python -m py_compile` PASS; teste no Trinity, monitor 4, navegacao pelo botao "Todos os Agentes", `cua-driver click` retornou rota `synthetic_events`, entrega `background`, codigo 0; readback independente de UIAutomation confirmou `HasKeyboardFocus=True` no botao "Todos os Agentes" e `False` no controle anterior. Overlay foi exibido e encerrado no mesmo ciclo. O driver reporta `effect=unverifiable`: isso NAO prova todos os efeitos de navegacao, e a confirmacao humana de visibilidade deste novo modo ainda depende do CHEFE.

**Sem confusao de garantia:** `CUA_CALL_OK != UI_EFFECT_PROVEN`; verificar na mesma janela o efeito pretendido antes de concluir; se efeito incerto, nao repetir o clique cegamente. Nao usar `SetCursorPos`, `mouse_event` ou `scope=desktop` como substitutos do cursor virtual. O modo usa exclusivamente a CLI Cua e o overlay Hermes existentes. `PROMPT_SELF_CACHE_P15=APLICAVEL` (sem HIT medido); `KV_CACHE_P16=UNKNOWN`; `NEXT_CURSOR=REUSE_CUA_VISUAL_CLICK_ON_NEXT_AUTHORIZED_UI_ACTION`.

## Integracao canonica na Mae (2026-11-02)

Owner: .agents/skills/centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use/SKILL.md. Codigo WGC, overlay, monitores, capturas, cursor virtual Cua e provas neste mesmo diretorio. O plugin existente hermes-visual-computer-use permanece adaptador da runtime Hermes, nao e outra biblioteca. Testar tela por tela com scripts/blink_cursor.py --monitor N --mode blink e exigir observacao humana separada da execucao automatica. Nao declarar validacao humana sem confirmacao do CHEFE.


## Descoberta dinamica de alvo pela janela e controle UIA (06/11/2026)

Usar o mesmo owner e o mesmo `blink_cursor.py`; nao criar input, overlay, plugin nem Skill paralela. Para pedido explicito de clique, **preferir** `scripts/blink_cursor.py --mode click --window-title "Agente Hermes" --control-name "Novo bate-papo"` (titulos e nomes sao exemplos, devem corresponder a janela e controle atuais). O helper existente `../../scripts/Identify-CentralDarkMonitors.ps1 -ResolveControl -WindowTitle "Agente Hermes" -ControlName "Novo bate-papo"` faz apenas descoberta: retorna PID, HWND, monitor humano, device e centro atual do controle UIAutomation, sem clique, teclado, captura ou movimento de cursor.

O Python confere identidade da janela com `GetWindowThreadProcessId`, retangulo `GetWindowRect`, monitor e device WGC antes de invocar **somente Cua virtual** (`scope=window`, `delivery_mode=background`) e o overlay existente. `--monitor N` opcional no modo dinamico precisa coincidir com o monitor medido; o modo explicito anterior continua disponivel. Janela/controle ausente, ambiguo, desabilitado, fora da tela ou mudanca de monitor: bloquear sem clique, redescobrir somente sob nova intencao. CLI nao faz `SetCursorPos`, `mouse_event` nem `scope=desktop`. Depois do input: prova de efeito UI independente; chamada Cua bem-sucedida nao significa navegacao concluida.

**Prova local 06/11:** o resolvedor UIA somente leitura identificou o botao `Novo bate-papo` da janela Hermes no monitor humano 4, retornando PID/HWND e coordenadas atuais, `input_dispatched=false`; PowerShell AST=PASS e Python `py_compile`=PASS. Clique real dessa rota dinamica nao foi realizado, portanto permanece **UNKNOWN**. Hardware diferente das quatro telas mapeadas na Casa exige novo binding, nao inferencia.


## Foco visual continuo no mesmo contrato operacional (08/11/2026)

**Intencao:** durante uma operacao visual ativa no VS Code, manter no mesmo monitor o cursor virtual Cua e a moldura do owner Hermes Visual. Nao desenhar outro overlay, nao abrir driver, nao alterar o mouse fisico, nao capturar imagens sem autorizacao.

**Implementacao unica:** `scripts/blink_cursor.py --mode working --monitor 1 --duration 60` (1 a 120 segundos). O helper continua dono da propria sessao; abre `show_overlay` uma vez, chama `renew_overlay` do `native/Program.cs` **na mesma instancia**, com `visualState=working`, e renova a lease periodicamente enquanto o comando estiver ativo. Os modos anteriores `blink`, `position` e `click` permanecem. Somente um monitor por sessao `working`.

**Identidade visual:** usar o `Overlay.cs` original: `working` / TRABALHANDO (ciano), `attention` / PRECISA DE VOCE (amarelo), `completed` / CONCLUIDO (verde). Esse delta estava preparado na Casa e foi compilado com o SDK 8.0.427 de `native/global.json`; nao acionar simultaneamente o renderer independente de CentralDark Halo sobre a mesma tela. `Codigo Compilado != Visual Validado`.

**Lease e seguranca:** nenhum modo infinito ou processo autonomo: duracao maxima por chamada 120s; a renovacao exige atividade real do chamador no mesmo processo. `finally` encerra overlay e a propria sessao Cua. Expiracao, troca de geometria, falta de writer, falha de host ou EOF encerram o recurso sem tocar sessoes de terceiros. Isso nao garante moldura visivel durante toda inferencia futura fora de uma chamada ativa; o orquestrador deve invocar o modo novamente por operacao autorizada.

**Fonte cruzada:** os logs de extensao Claude Code e Codex no VS Code registram sessoes, mas nao provaram chamadas diretas de `cua-driver` ou `blink_cursor.py`. O metodo visual com estados e watcher foi identificado no source `apps/modulos/centraldark-halo-main/src-tauri/src/lib.rs`, e a rota de input Cua e o overlay WPF pertencem a esta Skill Mae. Nao declarar equivalencia tecnica nao provada entre agentes.

**Prova exigida:** `AST_PASS`, `git diff --check`, build do mesmo `native/HermesVisual.csproj` no SDK pinado, run com `execution=started` e `completed`, encerramento de `HermesVisual` e conferencia visual humana independente. `INPUT_DISPATCHED != EFFECT_PROVEN`; `OVERLAY_EXECUTED != OVERLAY_VISIBLE_CONFIRMED`. Publicacao GitHub e sincronizacao entre Casa e main exigem recibos separados.

<!-- CENTRALDARK_MONITOR_HERMES_VISUAL_SPEED_20261109 -->
## 09/11/2026 (Bahia) ÔÇö Quatro telas, piscada e clique virtual sem duplicar o m├®todo

**Pedido do CHEFE:** localizar de uma vez todos os monitores da Casa, piscar somente as telas humanas 1ÔåÆ4 com o mesmo overlay Hermes, verificar cursor virtual, velocidade e localiza├º├úo segura de cliques. N├úo alterar mouse f├¡sico, telas, programas, servi├ºos nem criar outro motor visual.

**Mapa medido na Casa SEGREDO em 10/11/2026 01:28 UTC:** monitor humano 1 = direita vertical `DISPLAY1` (x=1920,y=-831,1080├ù1920); 2 = superior horizontal `DISPLAY4` (x=0,y=-1080,1920├ù1080); 3 = esquerda vertical `DISPLAY2` (x=-1080,y=-828,1080├ù1920); 4 = inferior principal horizontal `DISPLAY3` (x=0,y=0,1920├ù1080). N├║meros humanos vinculados pela posi├º├úo e pela configura├º├úo confirmada pelo CHEFE, nunca pelo sufixo `DISPLAYn`. Descoberta pela ferramenta existente `scripts/Identify-CentralDarkMonitors.ps1 -Identify` levou 4.607 ms; enumerou quatro telas. `-ListWindows` localizou respectivamente 1, 1, 1 e 12 janelas/pain├®is.

**Execu├º├úo visual existente:** `scripts/blink_cursor.py --all --mode blink` chamou Cua virtual + overlay sequencialmente em 1, 2, 3, 4; tr├¬s piscadas por tela (12 no total), exit 0, `cleanup=completed`, 70.738 ms de dura├º├úo. Os pontos de cursor virtual foram (2460,-159), (960,-702), (-540,-156), (960,378). O ponteiro f├¡sico permaneceu em (2467,-124) antes e depois. Isso confirma comandos e encerramento das sess├Áes; CHEFE ainda precisa confirmar se viu as quatro molduras.

**Melhoria sem segundo script:** para o pedido de **s├│ piscar**, preferir o helper j├í existente `scripts/blink.py` (moldura, sem driver de mouse); teste `--monitor 1 --count 1` terminou exit 0 em 2.936 ms, overlay e captura desligados. Para apontar ou clicar, continuar com `scripts/blink_cursor.py`. Estes tempos s├úo de testes diferentes; n├úo inferir percentual global de acelera├º├úo nem manter overlay permanentemente.

**Clique e localiza├º├úo:** busca de 354 controles UIA na janela Code-OSS levou 576 ms e encontrou dois elementos com nome `Explorer (Ctrl+Shift+E)` no mesmo ret├óngulo (-1072,-789,36├ù36): um `TabItem` e um `Group`. O resolver existente `scripts/Identify-CentralDarkMonitors.ps1` foi ajustado: aceita a ├║nica entrada acion├ível apenas quando **todos os ret├óngulos coincidem exatamente**. Dois `Toggle Chat` acion├íveis ou controle inexistente continuam bloqueados. `-ResolveControl` localizou o Explorer na tela humana 3 (x=-1054,y=-771). `scripts/blink_cursor.py --mode click --monitor 3 --window-title 'HARNES Dev' --control-name 'Explorer (Ctrl+Shift+E)'` enviou um clique `cua-driver` em modo background, exit 0, limpeza completa, 11.138 ms; mouse f├¡sico n├úo se moveu. A mudan├ºa de estado do Explorer N├âO foi confirmada por leitura independente, ent├úo o efeito visual do clique permanece PENDENTE.

**M├®todo afinado unificado:** descobrir a topologia **uma vez** ÔåÆ resolver `TARGET_ID`/janela/controle vivos ÔåÆ obter PID/HWND atuais ÔåÆ mapear monitor humano + ret├óngulo ÔåÆ exigir `TARGET_MATCH=PASS` e `MONITOR_MATCH=PASS` ÔåÆ acender o **overlay na tela resolvida** ÔåÆ habilitar e mover o **cursor virtual Cua** dentro da mesma janela/tela ÔåÆ executar uma ├║nica a├º├úo autorizada ÔåÆ reler o efeito por UIA/snapshot/readback independente ÔåÆ encerrar somente overlay e sess├úo Cua criados para a opera├º├úo. Se o controle duplicado ocupar lugares diferentes, se a janela mudar de monitor ou se overlay/cursor n├úo coincidirem com o alvo, **n├úo clicar**. Medir sempre o tempo, mas n├úo otimizar removendo travas ou trocando motor.

**Contrato visual forte:** `LOCALIZAR != MARCAR != APONTAR != AGIR != PROVAR`. A receita completa ├® `LOCALIZAR ÔåÆ TARGET_LOCK ÔåÆ MONITOR_LOCK ÔåÆ OVERLAY_MARK ÔåÆ CUA_CURSOR ÔåÆ ACTION_SINGLE ÔåÆ READBACK ÔåÆ COUNTERPROOF`. O overlay funciona como marcador visual do monitor/alvo atual; o cursor Cua mostra a trajet├│ria da a├º├úo sem mover o ponteiro f├¡sico do usu├írio. Os dois devem referenciar o mesmo monitor e a mesma janela antes do input.

**Owners:** `scripts/Identify-CentralDarkMonitors.ps1`, `Skills/centraldark-hermes-visual-computer-use/scripts/blink.py`, `scripts/blink_cursor.py`, `references/native-cursor.md`. Esta se├º├úo registra o resultado no owner existente; nenhuma arquitetura visual nova.
<!-- /CENTRALDARK_MONITOR_HERMES_VISUAL_SPEED_20261109 -->

<!-- CENTRALDARK_HERMES_DASHBOARD_CUA_FOREGROUND_FALLBACK_20261110 -->
## 10/11/2026 ÔÇö Digitar no Hermes Agent Dashboard da direita com Cua existente

**Inten├º├úo confirmada:** operar o campo inferior de `Hermes Agent - Dashboard` (Hostinger) dentro do Hermes Desktop da Casa, sem confundir com `Mensagem` do BOT CHAT ao meio nem com a CLI do Windows. O CHEFE confirmou visualmente que esta rota de digita├º├úo funcionou; a mensagem de reconhecimento foi apenas digitada, **Enter n├úo foi enviado**.

**Identifica├º├úo viva (n├úo fixar coordenadas):** janela `Hermes.exe`, t├¡tulo `Hermes`, controle UIA `Terminal input` (`ControlType.Edit`), painel direito `Hermes Agent - Dashboard`, monitor humano 4. Resolver por `scripts/Identify-CentralDarkMonitors.ps1 -ResolveControl -WindowTitle 'Hermes' -ControlName 'Terminal input'`: retorna PID, HWND, monitor, device e centro atual; durante o teste o centro mudou de `(1319,990)` para `(1337,977)` ÔÇö nunca usar esses n├║meros como constante. Conferir `GetWindowRect`, `GetWindowThreadProcessId` e monitor antes do input. `Mensagem` do painel central ├® um alvo distinto.

**Receita j├í funcional:** 1) identificar o controle vivo via UIA; 2) chamar o `scripts/blink_cursor.py --mode click --monitor 4 --window-title 'Hermes' --control-name 'Terminal input'` para o **mouse virtual Cua + overlay existente** (sem mover o mouse f├¡sico); 3) capturar novo centro vivo ap├│s clique, pois o painel pode mudar de geometria; 4) usar o `cua-driver call type_text` na sess├úo existente, com `pid`, `window_id` e `x/y` **relativos ao ret├óngulo da janela**, inicialmente `delivery_mode=background`; 5) somente se o driver retornar explicitamente `code=background_unavailable`, repetir **a mesma digita├º├úo uma vez** com `delivery_mode=foreground` (foco tempor├írio, sem mudar servi├ºo nem invocar outro motor); 6) conferir na tela se o texto apareceu **no campo certo** antes de qualquer `press_key return`. N├úo reenviar texto se o primeiro input j├í tiver efeito vis├¡vel; n├úo enviar Enter sem ordem expl├¡cita.

**Registro da execu├º├úo:** `blink_cursor.py` despachou clique via `cua-driver` em modo `background`, `cleanup=completed`; o campo `Terminal input` permanecia sem foco UIA confirmado. `type_text` `background` retornou `background_unavailable` (`Chrome_WidgetWin_1`); `type_text` `foreground` retornou exit 0, `delivery.mode=foreground`, `effect=unverifiable`. **CHEFE confirmou visualmente que funcionou** em 10/11/2026. Portanto `DIGITACAO_VISIVEL=CONFIRMADA_PELO_CHEFE`, `TEXTO_ENVIADO=NAO`, `REPOSTA_HERMES_DIREITA=NAO_TESTADA`, `ACESSO_REMOTO_CASA=NAO_PROVADO`.

**Kaizen:** ├® o mesmo resolvedor UIA + Cua + overlay da Skill existente, n├úo outro watcher, bridge, script, teclado, agente ou arquitetura. Identificar alvo pelo nome/├írvore viva e s├│ usar foreground depois de falha expressa no background. A digita├º├úo n├úo concede automaticamente permiss├úo ao dashboard, VPS ou Casa.
**Contraprova de envio sem interven├º├úo do CHEFE (10/11/2026):** ap├│s a digita├º├úo inicial, o CHEFE apertou Enter manualmente e o Dashboard respondeu. Repetimos com **uma nova pergunta**, sem interven├º├úo humana: `Identify-CentralDarkMonitors.ps1 -ResolveControl -WindowTitle 'Hermes' -ControlName 'Terminal input'` encontrou a janela viva no monitor 4; `cua-driver type_text` retornou `background_unavailable`, depois `foreground` exit 0. UIA confirmou a pergunta integral no pr├│prio terminal da direita, e n├úo no BOT CHAT central. Em seguida `cua-driver press_key` com `key=return` tamb├®m retornou `background_unavailable` em modo background; a repeti├º├úo em `foreground` retornou exit 0. **Readback independente da UIA** confirmou a nova resposta do agente, seguida de `pronto` e campo livre. As duas sess├Áes Cua criadas para esses testes foram encerradas com `active=false`. O motor reportou `effect=unverifiable`, por├®m **a resposta real vis├¡vel na UI** encerra a d├║vida de entrega neste teste. N├úo afirmar que o acesso do Remote Bridge ├á Casa foi comprovado.

**Resposta recebida do painel direito:** Hermes relatou `HERMES_LOCAL=PASS`, `HOSTINGER_MCP=PASS`, `CENTRALDARK_MCP=BLOCKED_OAUTH`, `CLOUDFLARE_MCP=BLOCKED_OAUTH` e `CASA=UNKNOWN/BLOCKED` na sess├úo dele. Indicou Casa Agent/rota/autentica├º├úo e teste remoto real como pend├¬ncias. Essas s├úo declara├º├Áes do pr├│prio painel e n├úo substituem medi├º├Áes independentes em cada ambiente.
<!-- /CENTRALDARK_HERMES_DASHBOARD_CUA_FOREGROUND_FALLBACK_20261110 -->


<!-- CENTRALDARK_CURSOR_MOUSE_DEMO_20261125 -->
## Demonstração canônica — Cursor/Mouse coordenado

`RECIPE_ID=CENTRALDARK_CURSOR_MOUSE_DEMO`

**Gatilhos equivalentes:**
- `!CENTRALDARK iniciar teste do mouse`
- `!CENTRALDARK iniciar teste do mause`
- `!CENTRALDARK iniciar teste do cursor`
- `!CENTRALDARK iniciar teste do cursor_mouse`

Todos resolvem para a mesma receita. Não criar outro cursor, daemon, overlay, agente ou writer.

**Executor existente evoluído:** `scripts/demo_cursor_mouse.py`. Ele lê `default.json`, mede a geometria atual dos quatro monitores Windows, aplica o binding humano já aprovado e usa o `cua-driver` já ativo.

**Sequência:** `ONE_WRITER → 4 SESSIONS CUA → ENABLE CURSORS → COMET_SWOOOP + TRAIL + GLOW → rota 4→2→1→3→4 → CLEANUP`. As sessões são efêmeras e ganham ID novo por execução. Não catalogar PID/HWND/coordenada histórica como identidade permanente.

**Semântica do paralelismo no Windows:** os quatro cursores ficam visíveis ao mesmo tempo, porém o writer único envia `move_cursor(scope=window)` em ordem subsequente. A tentativa com quatro writers concorrentes causou timeout no daemon e não é a receita. Portanto: `PARALELISMO_VISUAL_COORDENADO=true`, `WINDOWS_TRUE_CONCURRENT_INPUT=false`, `PHYSICAL_MOUSE=UNTOUCHED`.

**Prova Casa 25/11/2026:** replay dinâmico do executor completou a rota `4 → 2 → 1 → 3 → 4`, quatro sessões, cinco estágios e encerrou com `completed=true` + `cleanup=true`. A demonstração anterior do mesmo método foi confirmada visualmente pelo CHEFE. Um replay futuro deve produzir recibo próprio; execução anterior não prova visibilidade futura.
<!-- /CENTRALDARK_CURSOR_MOUSE_DEMO_20261125 -->

<!-- CENTRALDARK_CURSOR_MOUSE_SPEED_PRESETS_20261125 -->
### Velocidades verificadas da mesma demonstração

A receita `CENTRALDARK_CURSOR_MOUSE_DEMO` tem três níveis comprovados na Casa SEGREDO em 25/11/2026. Eles alteram somente tempo de movimento/pausa; writer, quatro sessões Cua, rota, estilo, mouse físico e cleanup permanecem iguais.

| Entrada humana | Percentual | glide_ms | stage_pause_ms | hold_seconds | Média medida por etapa |
|---|---:|---:|---:|---:|---:|
| `30%` | 30 | 1000 | 700 | 1.5 | 7.43 s |
| `FLUIDO` ou `50%` | 50 | 600 | 400 | 1.0 | 5.80 s |
| `RÁPIDO` ou `100%` | 100 | 180 | 100 | 0.5 | 3.99 s |

O executor aceita `--speed-percent 30|50|100`, `--preset fluido` ou `--preset rapido`. Percentuais fora desses três níveis não são chamados de verificados. Timing manual legado continua disponível quando nenhum preset é solicitado.

Recibo técnico: `catalogo/comprovacoes/cursor-mouse-speed-presets-20261125.json`. `30%/50%/100%` tiveram `completed=true` e `cleanup=true`; a confirmação visual humana de cada replay específico não é inferida pelo script.
<!-- /CENTRALDARK_CURSOR_MOUSE_SPEED_PRESETS_20261125 -->


<!-- CENTRALDARK_EXISTING_SSH_TERMINAL_VISUAL_RECIPE_20261112 -->
## Terminal SSH existente na Casa ÔåÆ Linux CentralDark-OS

Consumir o `RECIPE_ID=CASA_EXISTING_SSH_TERMINAL_TO_LINUX` da Skill M├úe. Esta skill cuida da **aquisi├º├úo visual do alvo**; ela n├úo cria uma segunda sess├úo SSH por padr├úo.

```text
ENUMERAR_WINDOWS
ÔåÆ MATCH TITLE + PID + WINDOW_RECT
ÔåÆ MONITOR_MATCH
ÔåÆ FOCUS
ÔåÆ PROBE_MINIMO_READ_ONLY
ÔåÆ CAPTURE/READBACK DA MESMA ABA
ÔåÆ SSH_TARGET_MATCH
ÔåÆ TYPE/PASTE ONE COMMAND
ÔåÆ CAPTURE/READBACK DA MESMA ABA
ÔåÆ EFFECT_PROOF
```

Regras:
- janela correta n├úo implica aba correta;
- `AppActivate=PASS` ou mecanismo equivalente prova foco da janela, n├úo entrega no shell remoto;
- antes do comando material, exigir um probe inofensivo vis├¡vel na pr├│pria aba SSH;
- se uma ferramenta abrir aba auxiliar ou `send-input`, tratar como `WRONG_SURFACE`, congelar retry e fechar somente a superf├¡cie criada pela opera├º├úo quando isso for seguro;
- ap├│s qualquer mudan├ºa de aba/foco/render, reacquirir PID/t├¡tulo/ret├óngulo/monitor antes de nova entrada;
- comando que usa segredo deve referenci├í-lo no processo remoto sem imprimir o valor; screenshot/readback n├úo pode conter token;
- `INPUT_DELIVERY_OK != TERMINAL_TEXT_VISIBLE != REMOTE_EFFECT_PROVEN`.

Este caminho complementa Cua/UIA/overlay; usar o mecanismo de input j├í dispon├¡vel e autorizado para aquela bancada. N├úo mover mouse f├¡sico, n├úo abrir novo terminal s├│ para contornar target lock e n├úo transformar coordenada hist├│rica em receita.
<!-- /CENTRALDARK_EXISTING_SSH_TERMINAL_VISUAL_RECIPE_20261112 -->

<!-- CENTRALDARK_VISUAL_RECOVERY_LADDER_10X1_20261112 -->
## Recovery Ladder visual 10├ù1 ÔÇö falhou o clique, a miss├úo continua

**Princ├¡pio:** `ACTION_SENT != EFFECT_PROVEN`. Falha ou aus├¬ncia de efeito n├úo encerra a miss├úo e tamb├®m n├úo autoriza retry cego. Preservar `LAST_GOOD_STATE + TARGET_ID + TARGET_FINGERPRINT + NEXT_CURSOR`; acionar FABLE LOOP em leitura para classificar a falha, escolher **uma hip├│tese discriminante**, medir, e somente ent├úo permitir ao CoT-ReAct/Hermes executar o menor pr├│ximo passo autorizado.

**Contrato:** `10 hip├│teses dispon├¡veis != 10 retries`. Para fingerprint invari├ível, no m├íximo **um retry idempotente** da mesma a├º├úo ap├│s nova evid├¬ncia de que o alvo voltou a estar acion├ível. Sem informa├º├úo nova, n├úo repetir.

| ID | Hip├│tese observ├ível | Prova discriminante | Retorno seguro |
|---|---|---|---|
| H01 | PID/HWND/RuntimeId ficou velho | reenumerar janela/processo/controle | reacquirir IDs atuais; preservar TARGET_ID |
| H02 | janela mudou de monitor, posi├º├úo, DPI ou ret├óngulo | UIA + GetWindowRect + mapa atual de monitores | recalcular MONITOR_MATCH/CONTROL_BOUNDS e reposicionar overlay/Cua |
| H03 | controle foi recriado/detached por rerender | nova ├írvore UIA/DOM e identidade do controle | reacquirir elemento; n├úo usar ref antiga |
| H04 | modal/overlay/tooltip est├í interceptando eventos | hit-test/ReceivesEvents + leitura visual | resolver/bloquear modal conforme autoriza├º├úo; depois reavaliar alvo |
| H05 | controle ainda n├úo est├í vis├¡vel/est├ível/habilitado | Visible/Stable/Enabled/viewport | aguardar condi├º├úo observ├ível limitada e reread; sem force click |
| H06 | controle exige scroll, hover ou foco pr├®vio | bounds/viewport/focus state | trazer para viewport/focar de forma nativa e revalidar antes do clique |
| H07 | Cua background n├úo ├® suportado naquela superf├¡cie | retorno expl├¡cito `background_unavailable`/delivery | uma ├║nica tentativa foreground somente quando owner j├í autoriza e o alvo foi revalidado |
| H08 | a├º├úo funcionou, mas o readback foi cedo demais | evento/estado ass├¡ncrono, loading, mudan├ºa tardia | esperar condi├º├úo de p├│s-a├º├úo com timeout curto; **n├úo clicar de novo** |
| H09 | h├í controles duplicados/amb├¡guos | contagem + ret├óngulos + role/control type | estreitar por parent/role/AutomationId/texto; se n├úo convergir, BLOCKED |
| H10 | sess├úo/aba/processo/conex├úo mudou ou morreu | fingerprint de superf├¡cie, processo, heartbeat/readback | recuperar **a mesma sess├úo** quando poss├¡vel; reread ÔåÆ reacquire ÔåÆ refresh controlado; s├│ depois failover |

**Ladder operacional:**

```text
ACTION_WITHOUT_PROVEN_EFFECT
ÔåÆ FREEZE_RETRY
ÔåÆ SAVE LAST_GOOD_STATE / TARGET_ID / TARGET_FINGERPRINT / NEXT_CURSOR
ÔåÆ REREAD
ÔåÆ REACQUIRE_ELEMENTS + PID/HWND + MONITOR_MAP
ÔåÆ FABLE: CLASSIFY H01..H10
ÔåÆ RUN ONE DISCRIMINATING READ-ONLY PROBE
ÔåÆ evidence_new?
   Ôö£ÔöÇ NO  ÔåÆ NEXT_HYPOTHESIS (sem repetir a├º├úo)
   ÔööÔöÇ YES ÔåÆ TARGET_MATCH + MONITOR_MATCH + ACTIONABILITY
             Ôö£ÔöÇ PASS ÔåÆ ONE_IDEMPOTENT_RETRY_OR_RECOVERY_ACTION
             ÔööÔöÇ FAIL ÔåÆ NEXT_HYPOTHESIS
ÔåÆ READBACK + COUNTERPROOF
ÔåÆ PASS | BLOCKED_WITH_CURSOR | UNKNOWN_WITH_CURSOR
```

**Budget:** parar antes de 10 se uma hip├│tese for provada; 10 ├® cat├ílogo m├íximo, n├úo obriga├º├úo. Se o or├ºamento acabar sem causa suficiente, `BLOCKED_WITH_CURSOR` mant├®m o Goal ativo e retom├ível, sem abrir nova miss├úo, janela, tab, driver ou executor. O pr├│ximo ciclo come├ºa no ├║ltimo `NEXT_CURSOR`, n├úo do zero.

**Refer├¬ncias de m├®todo:** Playwright-style actionability (unicidade, visibilidade, estabilidade, recebe eventos, enabled) inspira os gates; o recovery ladder j├í existente no `centraldark-oracle-surface` fornece `REREAD ÔåÆ REACQUIRE_ELEMENTS ÔåÆ ONE_IDEMPOTENT_RETRY ÔåÆ REFRESH`; FABLE LOOP faz calibra├º├úo read-only e CoT-ReAct executa somente quando h├í nova evid├¬ncia/rota segura. Isso ├® integra├º├úo de owners existentes, n├úo um quarto loop.
<!-- /CENTRALDARK_VISUAL_RECOVERY_LADDER_10X1_20261112 -->

<!-- CENTRALDARK_SINGLE_VIRTUAL_CLICK_FASTPATH_20261110 -->
## Clique unico CentralDark: cursor virtual primeiro, rota mais rapida comprovada

**Entrada unica:** `Skills/centraldark-hermes-visual-computer-use/scripts/blink_cursor.py --mode click`. Ha duas formas de resolver o mesmo alvo, nao dois motores de clique: (A) `--pid/--hwnd/--x/--y` com identidade e geometria verificadas nesta operacao (menor latencia quando ja se conhece o alvo); (B) `--window-title/--control-name` com UIA e resolvedor `scripts/Identify-CentralDarkMonitors.ps1 -ResolveControl` (mais segura quando o alvo precisa ser descoberto). Escolher A apenas com PID/HWND/ponto vivos; caso contrario escolher B. `--monitor N` valida o monitor atual.

**Atuador unico e obrigatorio:** Cua `click(scope=window, delivery_mode=background)` mais cursor virtual e overlay existentes. UIA, Win32 e Browser sao sensores/hit-test e contraprova; **nunca** usar `SetCursorPos`, `mouse_event`, `SendInput`, `scope=desktop` ou mover o ponteiro fisico do usuario como fallback. Se Cua estiver indisponivel, retornar BLOCKED/UNKNOWN em vez de substituir silenciosamente o atuador.

**Criterio de escolha:** menor custo de descoberta com alvo atual inequ?voco, mantendo isolacao do mouse fisico e mesmas garantias de PID/HWND/monitor/controle; nao otimizar velocidade sacrificando identidade. `CUA_CALL_OK != EFEITO_COMPROVADO`; confirmar a mudanca por UIA/snapshot/readback antes do proximo clique. Nao criar fun??o, plugin, runner ou cursor paralelo.
<!-- /CENTRALDARK_SINGLE_VIRTUAL_CLICK_FASTPATH_20261110 -->

<!-- CENTRALDARK_CUA_COCKPIT_TERMINAL_20261113 -->
## 13/11/2026 ÔÇö Cockpit embaixo + terminal em cima: rota CUA afinada

**Inten├º├úo comprovada:** operar a VM openKylin pelo Windows Terminal vis├¡vel e validar o mesmo efeito no Cockpit aberto no Chrome, mantendo cursor virtual/overlay Cua vis├¡vel e readback de tela. Reusar `cua-driver` e este owner; n├úo criar mouse, browser, daemon ou overlay paralelo.

**Descobertas desta execu├º├úo na Casa SEGREDO (PIDs/HWNDs s├úo ef├¬meros):**
- redescobrir janela por `list_windows` a cada mudan├ºa material; nesta sess├úo o terminal openKylin e o Chrome/Cockpit foram distinguidos por t├¡tulo + PID + HWND + bounds, nunca por coordenada fixa;
- `get_window_state` com screenshot ├® o readback preferido quando UIA do Chrome retorna ├írvore incompleta; `effect=unverifiable` do clique exige captura posterior;
- Windows Terminal rejeitou entrega `background` para teclado: usar `foreground` somente ap├│s confirmar PID/HWND vivos. Para JSON no PowerShell 5.1, preferir objeto ÔåÆ `ConvertTo-Json -Compress` ÔåÆ stdin do `cua-driver call`; n├úo depender de aspas em argv;
- nesta sess├úo, alguns `type_text + Return` deixaram o comando apenas **digitado**. Nunca mandar Enter duplo por h├íbito: recapturar a janela; somente se a linha estiver visivelmente staged e o prompt n├úo tiver executado, enviar um segundo `Return`;
- sess├úo Cua pode expirar durante espera/teste longo. Se `session ... has ended`, reviver o **mesmo session_id** com `start_session`, reposicionar o cursor e continuar somente ap├│s novo readback;
- manter overlay/cursor em lease bounded e mover o cursor antes de cada a├º├úo material. A captura ap├│s o clique ├® a contraprova; clique enviado != efeito;
- ao alternar terminal Ôåö Cockpit, evitar novo `git fetch` quando `FETCH_HEAD` acabou de ser medido e continua v├ílido para o mesmo c├ílculo. Revalidar a ref quando houver evento externo ou intervalo material;
- fluxo r├ípido comprovado: `list_windows ÔåÆ get_window_state(before) ÔåÆ start/revive session ÔåÆ move_cursor ÔåÆ one click/type ÔåÆ get_window_state(after)`. Browser/DOM conectado, quando dispon├¡vel para a mesma aba, pode substituir apenas a **leitura**; input continua no owner autorizado e o readback deve confirmar o efeito.

**Prova do caso:** o bot├úo `Sincronizar Casa/Main` do Cockpit foi localizado por captura atual e clicado uma vez pelo Cua em `foreground`; readback posterior mostrou a tentativa mudando para `local: conflict` e barra `Confirmando o mesmo SHA...`. Esse resultado provou despacho do bot├úo e revelou perda de detalhe no wrapper; o owner `apps/instinto-superior/src/lib/sync.functions.ts` foi corrigido para preservar o `conflict` causal do planner 3-way.

**Kaizen:** medir tempo de descoberta/a├º├úo/readback somente quando rel├│gio real estiver dispon├¡vel; n├úo inventar ganho percentual. Toda melhoria futura entra neste mesmo owner e em seus scripts existentes, com `FILE ÔåÆ LOADER ÔåÆ CONSUMER ÔåÆ TRIGGER ÔåÆ EXECUTION ÔåÆ EVIDENCE ÔåÆ COUNTERPROOF`.

`CUA_CALL_OK != EFFECT_PROVEN` ┬À `TYPE_TEXT != EXECUTED_COMMAND` ┬À `CLICK_SENT != SYNC_COMPLETE` ┬À `UNKNOWN != PASS`.
<!-- /CENTRALDARK_CUA_COCKPIT_TERMINAL_20261113 -->


<!-- CENTRALDARK_OBSIDIAN_CUA_UI_MAP_20261114 -->
## Regra reaproveit├ível ÔÇö ler interfaces de apps por Cua, sem imagem cont├¡nua (14/11/2026)

- **Entrada:** app j├í aberto e autorizado, janela/controle vivos medidos por PID/HWND/monitor; a leitura usa apenas a sess├úo Cua existente, nunca cria um motor paralelo.
- **Sensor textual:** `cua-driver call start_session` ÔåÆ `cua-driver call get_window_state` com `pid`, `window_id`, `include_screenshot:false` ÔåÆ consumir `tree_markdown`, `elements[].label/role/actions/frame`, `elements_complete` ÔåÆ `end_session` no `finally`. Filtrar texto e ├¡ndice por inten├º├úo; revalidar `element_token`/janela ap├│s mudan├ºas. N├úo persistir PID, coordenadas ou tokens de elemento como IDs est├íveis.
- **A├º├úo:** resolver alvo existente e usar exclusivamente `scripts/blink_cursor.py --mode click` (Cua virtual + overlay), seguido de readback textual Cua. `execution=dispatched` e `driver_effect=unverifiable` n├úo autorizam `UI_EFFECT=PASS`; falha de efeito n├úo autoriza mouse f├¡sico ou retries cegos.
- **Prova inicial:** Casa SEGREDO, Obsidian 1.15.1/Vault Orrery 2.3.0, `get_window_state(...include_screenshot:false)` devolveu 165 elementos, invent├írio parcial `elements_complete=false`. Foram observados busca, nota, propriedades e backlinks. CLI oficial existe, mas estava desabilitada; `CLI_READY=NO`.
- **Generaliza├º├úo:** cada app lido gera apenas `CAPABILITY_DISCOVERED` enquanto n├úo houver acionamento e readback. Registrar capacidades j├í comprovadas no seu owner e APRENDIZADOS/LEMBRANCAS existentes; n├úo criar cat├ílogo, skill, bridge ou plugin por app.
- **NEXT_CURSOR:** habilitar a CLI do Obsidian pelo controle real se aplic├ível e validar busca em lote, sem inferir leitura sem├óntica completa apenas do grafo.
<!-- /CENTRALDARK_OBSIDIAN_CUA_UI_MAP_20261114 -->


<!-- CENTRALDARK_WORKING_CURSOR_MOTION_VISUAL_PASS_20261114 -->
## 14/11/2026 - Mouse virtual em movimento com moldura fixa: VISUAL_PASS e cleanup

**Intencao:** o cursor virtual Cua se move dentro do monitor humano selecionado, com uma unica moldura Hermes Visual fixa enquanto o modo working estiver ativo. Nao deslocar o mouse fisico nem criar segundo cursor, overlay, daemon, janela ou executor.

**Owner/comando:** scripts/blink_cursor.py --monitor N --mode working --cursor-motion --duration SEGUNDOS. O mesmo owner reutiliza cua-driver (start_session, set_agent_cursor_enabled, move_cursor com scope=window, end_session) e visual.py/native/HermesVisual (show_overlay, renew_overlay na mesma sessao, hide_overlay). O movimento percorre quatro pontos internos a cada ~2s. Duracao de 1 a 120s. O modo working sem movimento e os modos blink, position e click permanecem.

**Mapa e prova humana:** Casa SEGREDO, monitor humano 2, superior horizontal, DISPLAY4 (x=0, y=-1080, 1920x1080). Em 14/11/2026, o CHEFE confirmou literalmente: "Confirmo visualmente o mouse virtual em movimento e a moldura fixa no monitor 2." VISUAL_PASS somente para a exibicao simultanea nesta bancada; nao equivale a clique provado ou integracao Halo aprovada. Reenumerar se a geometria mudar.

**Contraprova de limpeza:** execucao do mesmo helper com --monitor 2 --mode working --cursor-motion --duration 8; session=hermes-visual-cursor-19d0749299; execution=started, execution=completed, virtual_cursor_moves=2, renewal=same_visual_session, cleanup=completed, TEST_EXIT_CODE=0. hide_overlay retornou overlayVisible=false antes do recibo; o finally chamou end_session e visual.close_session. Essa prova e do contrato de encerramento, nao de pixels independentes apos o fechamento.

**Integracao futura no Halo:** reutilizar o atuador Cua e os estados working/attention/completed; a moldura, skin e visual devem permanecer sob o owner Halo existente. Nunca renderizar a moldura Hermes e a borda Halo juntas na mesma tela. HALO_INTEGRATION_VISUAL=UNKNOWN ate implementacao e teste visual separados, preservando o executavel aprovado.

**Kaizen/NEXT_CURSOR:** uma sessao por operacao autorizada; avisar monitor/efeito antes; perguntar sobre visibilidade apenas se a confirmacao ainda nao foi recebida; manter recibo tecnico e prova humana distintos; validar cone, commit, push conforme gate e readback sem levar mutacoes de outros owners.
<!-- /CENTRALDARK_WORKING_CURSOR_MOTION_VISUAL_PASS_20261114 -->
