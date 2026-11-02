# Cursor nativo Cua com moldura Hermes

Owner: hermes-visual-computer-use, subordinado ao metodo operacional CentralDark. Reutilizar o driver Cua nativo do computer_use e a CLI direta do daemon ja ativo; nao desenhar outro cursor. O wrapper CuaDriverBackend.start() permanece registrado como rota que falhou nesta bancada.

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

## Prova e limites
CHEFE confirmou cursor verde e rosa em 02/11/2026. Foto mostra hermes-443ff947f17d, identidade exata do teste persistente. Esta prova confirma render nativo, nao certifica topologia distinta ou ausencia de input por cor.
Cua 0.28.2 retorna position:null fixo no get_agent_cursor_state Windows, que tambem causa tool_output_invalid no MCP. Resultado move_cursor=effect:unverifiable nao constitui prova visual. Confirmacao humana com identidade exata e suficiente para a prova especifica; nao repetir investigacao sem delta.
Fonte upstream inspecionada: https://github.com/trycua/cua/blob/cua-driver-rs-v0.28.2/libs/cua-driver/rust/crates/platform-windows/src/tools/impl_.rs

## Recuperacao
Falha de alvo: enumerar novamente. Falha de daemon: consultar status e corrigir o host existente. Falha no meio: finally encerra backend e overlay proprios. Nao matar todos os processos Cua. Nao atualizar driver automaticamente.
