---
name: hermes-visual-computer-use
description: Identificar monitores por numero ou posicao, capturar um monitor autorizado com Windows.Graphics.Capture e mostrar moldura verde de atividade no Hermes Windows 11. Use para captura de tela, monitor um/dois/tres/quatro, bancada operacional e automacao visual com indicador, sem substituir o cursor Cua existente.
platforms: [windows]
metadata:
  hermes:
    category: productivity
    tags: [desktop, computer-use, monitors, capture, overlay]
---
# Hermes Visual Computer Use
Reutiliza Skill Mae + Kimetsu para contexto e o computer_use Cua para cursor/teclado.
Este complemento fornece a captura WGC por monitor ausente no driver instalado; nao substitui captura de janela Cua nem usa outro motor de input.

## Ativacao e ferramentas reais
Instalacao: scripts/Install.ps1 publica o .NET e instala skill e plugin no HERMES_HOME REAL.
Descoberta: skill_view(name="hermes-visual-computer-use"); ferramentas no toolset hermes_visual_computer_use.
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
Para piscar com mouse visivel, usar scripts/blink_cursor.py --monitor N ou --all (ordem humana crescente). Reutilizar a sessao persistente CuaDriverBackend do Hermes e o overlay visual.py existente. Posicionar primeiro o cursor e depois piscar a moldura e o cursor tres vezes. Consultar references/native-cursor.md antes de executar.
Usar scope=window e coordenadas ABSOLUTAS do desktop virtual: X+Width/2, Y+Height*.35. Nao combinar target com scope. Nao usar scope=desktop: ele move o mouse fisico. Cor distingue sessoes; nao identifica monitor.
Prova humana real: references/native-cursor-confirmation.json. A foto mostra exatamente hermes-443ff947f17d. Na versao Windows Cua 0.28.2, position:null e um valor fixo no codigo upstream; nao interpretar como cursor invisivel.
