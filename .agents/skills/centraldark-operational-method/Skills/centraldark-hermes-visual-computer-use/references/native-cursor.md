# Cursor nativo Cua com moldura Hermes

Owner: centraldark-hermes-visual-computer-use, dentro de centraldark-operational-method/Skills; plugin Hermes com ID legado somente por compatibilidade. Reutilizar o driver Cua nativo do computer_use e a CLI direta do daemon ja ativo; nao desenhar outro cursor. O wrapper CuaDriverBackend.start() permanece registrado como rota que falhou nesta bancada.

## Executar
1. Resolver Python e raiz reais do Hermes. O helper carrega selected_venv/site_packages do gerenciador PM existente. Nao instalar pacotes nem mudar a configuracao global para contornar ambiente incorreto.
2. Consultar cua-driver status. Se o host visual estiver parado, iniciar cua-driver serve sem --no-overlay pela rota autorizada da Casa. Nao duplicar processo existente. O helper recusa host ausente.
3. Executar scripts/blink_cursor.py --monitor 1, ou --all para todos os monitores conectados na ordem humana crescente. O helper enumera monitores reais pelo visual.py e usa o mesmo binding confirmado.
4. Posicionar cursor nativo antes da moldura. Mostrar/esconder ambos tres vezes. Encerrar somente a sessao do helper, inclusive em falha. Se o chamador iniciou um host temporario exclusivamente para o teste, encerra-lo depois; preservar hosts preexistentes e sessoes alheias.

Nao captura imagens, nao clica, nao escreve, nao altera Windows. A moldura e PREVIA e nao deve afirmar captura ativa. Para captura real usar computer_capture_monitor com autorizacao e WGC existente.

## Comando por voz: posicione no monitor N (02/11/2026)
"Posicione no monitor 2", "leva o cursor para a tela dois", "aponte no de cima" e equivalentes => script existente scripts/blink_cursor.py --monitor 2 --mode position; mostra cursor virtual Cua e overlay do Hermes juntos por 5 segundos, e encerra as duas sessoes. "Pisca monitor 2" => --mode blink com tres ciclos. Nao mover mouse fisico salvo ordem explicita.

Contraprova: o wrapper CuaDriverBackend.start() travou no handshake por 30 segundos com drivers 0.21.0 e 0.28.2. A chamada direta ao daemon ja ligado foi comprovada: cua-driver call start_session -> set_agent_cursor_enabled -> move_cursor(scope=window, coordenadas absolutas) -> end_session. O CHEFE confirmou visualmente o cursor virtual no monitor humano 2 (960,-702 com geometria 1920x1080, X=0,Y=-1080). get_agent_cursor_state position=null e move_cursor effect=unverifiable nao contradizem essa confirmacao. O plugin existente fornece a moldura; o driver Cua fornece o mouse virtual. Sem parser, servico ou cursor paralelo.

## Coordenadas e identidade
move_cursor em Windows usa coordenadas fisicas ABSOLUTAS do desktop virtual, inclusive negativas. scope=window controla apenas o cursor emulado. scope=desktop move o ponteiro fisico e nao pertence a esta receita. Nao combinar target com scope; o driver rejeita essa mistura.
Cores pertencem a identidade da sessao, nao sao numeros de monitor. Nao fixar cor rosa/verde nem reusar HWND/PID antigo. Para automacao de janela, capturar e conferir PID/HWND atuais antes de enviar input com computer_use existente.

## Receita unificada — localizar + marcar + apontar + agir

O cursor Cua e o overlay Hermes formam **uma única trajetória visual**, não duas automações:

```text
TARGET_ID
→ UIA_WINDOW/CONTROL
→ PID + HWND CURRENT
→ MONITOR_ID_HUMANO + MONITOR_RECT
→ TARGET_MATCH
→ MONITOR_MATCH
→ show_overlay(mesmo monitor)
→ CUA_SESSION
→ set_agent_cursor_enabled(true)
→ move_cursor(scope=window)
→ ACTION_SINGLE
→ READBACK independente
→ hide_overlay + end_session
```

Regras: o overlay precisa marcar a tela que contém a janela/controle resolvido; o cursor virtual deve permanecer no mesmo monitor e `scope=window`; qualquer divergência de monitor, PID/HWND ou geometria exige redescoberta antes da ação. `OVERLAY_SHOWN != TARGET_PROVEN`, `CURSOR_MOVED != ACTION_PROVEN`, `CUA_CALL_OK != UI_EFFECT_PROVEN`.

## Prova e limites
CHEFE confirmou cursor verde e rosa em 02/11/2026. Foto mostra hermes-443ff947f17d, identidade exata do teste persistente. Esta prova confirma render nativo, nao certifica topologia distinta ou ausencia de input por cor.
Cua 0.28.2 retorna position:null fixo no get_agent_cursor_state Windows, que tambem causa tool_output_invalid no MCP. Resultado move_cursor=effect:unverifiable nao constitui prova visual. Confirmacao humana com identidade exata e suficiente para a prova especifica; nao repetir investigacao sem delta.
Fonte upstream inspecionada: https://github.com/trycua/cua/blob/cua-driver-rs-v0.28.2/libs/cua-driver/rust/crates/platform-windows/src/tools/impl_.rs

## Recuperacao
Falha de alvo: enumerar novamente. Falha de daemon: consultar status e corrigir o host existente. Falha no meio: finally encerra backend e overlay proprios. Nao matar todos os processos Cua. Nao atualizar driver automaticamente.

## Clique operacional (sem mouse fisico) — 02/11/2026

Reutilizar **o mesmo** `scripts/blink_cursor.py` com `--mode click`. Descobrir PID, HWND, monitor N e centro real do controle pelo UIAutomation da janela atual; conferir hit-test e geometria. Chamar `--monitor N --mode click --pid PID_ATUAL --hwnd HWND_ATUAL --x X_ABSOLUTO --y Y_ABSOLUTO`. Nao utilizar `--all` ou PID/HWND/coordenadas historicos para cliques.

O modo valida `GetWindowThreadProcessId`, `GetWindowRect` e ponto dentro da janela e do monitor; `SetForegroundWindow` atua somente no foco da janela. A sessao nativa do Cua mantem `set_agent_cursor_enabled(true)`, `move_cursor(scope=window, x/y absolutos)` e `click(scope=window, pid, x/y relativos ao retangulo da janela, delivery_mode=background)`. O overlay existente `visual.request("show_overlay")` permanece ativo durante movimento e clique; `finally` sempre solicita `hide_overlay` e encerra somente aquela sessao Cua. Nenhum mouse fisico, `SendInput`, `SetCursorPos`, `mouse_event`, `scope=desktop`, segundo cursor ou segundo overlay.

Teste observado: Chrome Trinity, monitor 4, botao "Todos os Agentes", resultado do Cua `delivery.mode=background`, execucao exit 0, UIAutomation `HasKeyboardFocus=True` no botao apos o clique. `effect=unverifiable` no driver exige readback do efeito desejado; clique enviado nao significa que toda navegacao foi concluida. Aprovacao visual do CHEFE para este **modo de clique** ainda nao recebida; nao extrapolar a confirmacao anterior da piscada para esta funcao. Exigir nova contraprova somente se a intencao for validar visualmente o novo modo; nao transformar prova de codigo em necessidade de teste Hermes ao vivo para outros deltas.


## Selecionar controle atual sem PID nem coordenadas gravadas (06/11/2026)

A mesma receita `scripts/blink_cursor.py --mode click` aceita `--window-title "Agente Hermes" --control-name "Novo bate-papo"` em vez de `--pid/--hwnd/--x/--y`. Consulta read-only a `centraldark-operational-method/scripts/Identify-CentralDarkMonitors.ps1 -ResolveControl`, que exige exatamente uma janela e um controle UIAutomation visivel/habilitado e associa o centro do controle ao monitor humano realmente conectado. `--monitor N` opcional funciona como contraprova: mismatch bloqueia. A versao explicita original continua funcional para alvos ja medidos, sem substituir Cua nem WGC.

O resultado e verificado pelo mesmo `resolve_window` Win32 e pelas coordenadas dentro da janela/monitor antes de chamar o daemon Cua existente; nunca transformar selecao de UI em `SetCursorPos` ou `mouse_event`. Retornar `WINDOW_CONTROL_DISCOVERY_FAILED`, `CONTROL_MONITOR_MISMATCH` ou `CUA_CLICK_TARGET_DEVICE_MISMATCH` quando houver divergencia. `UIA_TARGET_RESOLVED` prova somente descoberta; `CUA_CALL_OK` nao prova efeito. Exigir leitura do resultado visual antes de repetir input. Observacao read-only na janela Hermes em 06/11: controle nomeado localizado no monitor 4; clique dinamico nao testado.
