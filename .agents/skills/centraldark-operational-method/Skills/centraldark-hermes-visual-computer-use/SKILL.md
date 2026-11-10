---
name: centraldark-hermes-visual-computer-use
description: Identificar monitores por numero ou posicao, capturar um monitor autorizado com Windows.Graphics.Capture e mostrar moldura verde de atividade no Hermes Windows 11. Use para captura de tela, monitor um/dois/tres/quatro, bancada operacional e automacao visual com indicador, sem substituir o cursor Cua existente.
platforms: [windows]
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

## Reconhecimento natural e piscada — confirmado pelo CHEFE em 02/11/2026
Entrada de qualquer modelo: verbo + alvo + efeito. "Pisca monitor um/1" = somente moldura no monitor 1; "isca monitor dois" no mesmo teste conserva a intencao de piscar. Nao interpretar confirmacao como nova ordem e nao duplicar envio por mensagens repetidas antes da execucao.
Casa confirmada fisicamente: 1 direita vertical; 2 centro superior horizontal; 3 esquerda vertical; 4 centro inferior horizontal principal.
Prova: tres ciclos por tela executados e apagados; CHEFE confirmou visualmente as quatro telas, individualmente e na ordem 1,2,3,4. Esta prova valida mapeamento e overlay nesta bancada, nao topologias diferentes.
Executar scripts/blink.py --monitor 1 pelo Python do Hermes. O helper usa o mesmo visual.py: show_overlay -> .65s -> hide_overlay -> .35s, tres vezes, finally fecha somente sua sessao. Nao captura tela, nao clica e nao move mouse.
Via ferramentas do Hermes: repetir computer_show_overlay/espera/computer_hide_overlay com os mesmos tempos e alvo. Nao criar outro executor para piscar.
Para qualquer numero/posicao: consultar computer_list_monitors somente se alvo, geometria, conexao ou binding mudou. Nunca derivar numero humano do sufixo DISPLAY.
Resposta: "Monitor N: tres piscadas executadas. Moldura apagada." Confirmacao visual so quando o humano disser ou houver prova independente; nao inferir pelo retorno do processo.
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
## 09/11/2026 (Bahia) — Quatro telas, piscada e clique virtual sem duplicar o método

**Pedido do CHEFE:** localizar de uma vez todos os monitores da Casa, piscar somente as telas humanas 1→4 com o mesmo overlay Hermes, verificar cursor virtual, velocidade e localização segura de cliques. Não alterar mouse físico, telas, programas, serviços nem criar outro motor visual.

**Mapa medido na Casa SEGREDO em 10/11/2026 01:28 UTC:** monitor humano 1 = direita vertical `DISPLAY1` (x=1920,y=-831,1080×1920); 2 = superior horizontal `DISPLAY4` (x=0,y=-1080,1920×1080); 3 = esquerda vertical `DISPLAY2` (x=-1080,y=-828,1080×1920); 4 = inferior principal horizontal `DISPLAY3` (x=0,y=0,1920×1080). Números humanos vinculados pela posição e pela configuração confirmada pelo CHEFE, nunca pelo sufixo `DISPLAYn`. Descoberta pela ferramenta existente `scripts/Identify-CentralDarkMonitors.ps1 -Identify` levou 4.607 ms; enumerou quatro telas. `-ListWindows` localizou respectivamente 1, 1, 1 e 12 janelas/painéis.

**Execução visual existente:** `scripts/blink_cursor.py --all --mode blink` chamou Cua virtual + overlay sequencialmente em 1, 2, 3, 4; três piscadas por tela (12 no total), exit 0, `cleanup=completed`, 70.738 ms de duração. Os pontos de cursor virtual foram (2460,-159), (960,-702), (-540,-156), (960,378). O ponteiro físico permaneceu em (2467,-124) antes e depois. Isso confirma comandos e encerramento das sessões; CHEFE ainda precisa confirmar se viu as quatro molduras.

**Melhoria sem segundo script:** para o pedido de **só piscar**, preferir o helper já existente `scripts/blink.py` (moldura, sem driver de mouse); teste `--monitor 1 --count 1` terminou exit 0 em 2.936 ms, overlay e captura desligados. Para apontar ou clicar, continuar com `scripts/blink_cursor.py`. Estes tempos são de testes diferentes; não inferir percentual global de aceleração nem manter overlay permanentemente.

**Clique e localização:** busca de 354 controles UIA na janela Code-OSS levou 576 ms e encontrou dois elementos com nome `Explorer (Ctrl+Shift+E)` no mesmo retângulo (-1072,-789,36×36): um `TabItem` e um `Group`. O resolver existente `scripts/Identify-CentralDarkMonitors.ps1` foi ajustado: aceita a única entrada acionável apenas quando **todos os retângulos coincidem exatamente**. Dois `Toggle Chat` acionáveis ou controle inexistente continuam bloqueados. `-ResolveControl` localizou o Explorer na tela humana 3 (x=-1054,y=-771). `scripts/blink_cursor.py --mode click --monitor 3 --window-title 'HARNES Dev' --control-name 'Explorer (Ctrl+Shift+E)'` enviou um clique `cua-driver` em modo background, exit 0, limpeza completa, 11.138 ms; mouse físico não se moveu. A mudança de estado do Explorer NÃO foi confirmada por leitura independente, então o efeito visual do clique permanece PENDENTE.

**Método afinado:** descobrir a topologia **uma vez** → usar mapeamento humano atual → piscar apenas overlay se não houver clique → localizar janela e controle vivos com UIA → checar monitor e retângulo → clicar uma única vez com Cua virtual e moldura → ler o efeito → encerrar somente a própria sessão. Se o controle duplicado ocupar lugares diferentes, **não clicar**. Medir sempre o tempo, mas não otimizar removendo travas ou trocando motor.

**Owners:** `scripts/Identify-CentralDarkMonitors.ps1`, `Skills/centraldark-hermes-visual-computer-use/scripts/blink.py`, `scripts/blink_cursor.py`, `references/native-cursor.md`. Esta seção registra o resultado no owner existente; nenhuma arquitetura visual nova.
<!-- /CENTRALDARK_MONITOR_HERMES_VISUAL_SPEED_20261109 -->
