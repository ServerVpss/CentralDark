# Hermes Visual Computer Use — implementacao Windows
Owner: .agents/skills/centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use. @code_ref: native/*.cs; scripts/visual.py; scripts/hermes_plugin.py.
Escopo: complemento por monitor; nao substitui Hermes/Cua, nao modifica fontes do Hermes, nao injeta input.

## Arquitetura real
Hermes PluginContext.register_tool registra seis ferramentas no toolset hermes_visual_computer_use.
Cada conversa possui um filho HermesVisual.exe via stdin/stdout JSONL; nao ha servidor de rede, servico, agendamento ou coleta ao abrir o Hermes.
O host WPF permanece IDLE ate operacao explicita. Bridge limita 8 filhos, serializa cada canal e timeout 20s.
O filho encerra no EOF, fim de sessao, unload ou encerramento do Python. Lease visual 1..120s expira sozinho.
Mutex nativo por HMONITOR impede duas sessoes disputarem o mesmo overlay.

## Captura WGC
EnumDisplayMonitors + GetMonitorInfo + GetDpiForMonitor descobrem monitores conectados, sem presumir quantidade.
Mapeamento humano confirmado da Casa fica em default.json; sem binding completo/unico, numeros logicos seguem a enumeracao, sem alegar equivalencia com Configuracoes Windows.
IGraphicsCaptureItemInterop.CreateForMonitor cria GraphicsCaptureItem do HMONITOR escolhido.
D3D11CreateDevice com BGRA + IDXGIDevice + CreateDirect3D11DeviceFromDXGIDevice cria IDirect3DDevice.
Direct3D11CaptureFramePool.CreateFreeThreaded entrega frame; SoftwareBitmap.CreateCopyFromSurfaceAsync e BitmapEncoder gravam PNG.
GraphicsCaptureSession.IsBorderRequired=true se ApiInformation confirmar suporte; IsCursorCaptureEnabled=true inclui cursor disponivel.
GraphicsCapturePicker nao e necessario para alvo HMONITOR ja escolhido sob autorizacao explicita; nao dispara picker invisivel.
Os recursos pool, sessao, device e bitmap sao descartados. Frame timeout 10s. Mudanca de geometria/DPI e desconexao param a sessao; nova captura exige reenumeracao.
A imagem do monitor nao altera coordenadas nem a captura de janela do driver Cua.

## Overlay
Janela WPF transparente independente, WS_EX_NOACTIVATE|WS_EX_TRANSPARENT|TOOLWINDOW, Topmost e ShowActivated=false.
SetWindowPos usa pixels fisicos; desenho aplica escala DPI. Thickness inicial 10px; esmeralda #00D889; opacity .30.
DropShadowEffect blur28, Border.CornerRadius20 e DoubleAnimation 220ms.
SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE=0x11) e obrigatorio para o overlay; se falhar, operacao falha.
Logo, a captura WGC NAO deve conter a moldura customizada. Isso evita recursao, nao oculta a borda nativa WGC.
Captura ativa e simulacao sao distintas: show_overlay rotula PREVIA; CAPTURA ATIVA somente quando existe sessao WGC.
Estados: IDLE -> INITIALIZING -> CAPTURING -> AUTOMATING/CAPTURING, PAUSED ou STOPPING -> IDLE; falha limpa recursos e informa ERROR.
PAUSED descarta a captura; retomar exige nova captura autorizada, sem reaproveitar frame antigo.

## Integracao e cursor
Plugin hooks pre_tool_call/post_tool_call refletem input computer_use apenas quando a mesma sessao ja possui captura explicita ativa.
Nao sobrescreve computer_use, nao altera o mouse fisico, nao configura cua-driver. Cursor nativo Cua preservado.
on_session_end e ctx.on_unload limpam somente os filhos desta skill.
Ferramentas: computer_list_monitors, computer_capture_monitor, computer_show_overlay, computer_hide_overlay, computer_get_active_monitor, computer_get_capture_status.
captura retorna imagem no formato multimodal ja adotado por Hermes; PNG temporario removido apos codificacao. output explicito e retencao autorizada, sem sobrescrita.

## Instalacao e uso
PowerShell: scripts/Install.ps1 [-HermesRoot <repositorio-instalado>].
Detecta HERMES_HOME pelo proprio hermes_constants.get_hermes_home; instala em skills/centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use e plugin existente plugins/hermes-visual-computer-use.
Usa SDK .NET8 instalado, target Windows10.0.26100 para expor IsBorderRequired; disponibilidade runtime checada antes de usar.
Publica runtime gerado localmente; binarios e imagens nao entram no Git.
Ativacao usa cmd_enable oficial, preservando outros plugins e configuracoes. Sem restart forcado.
Nova sessao Hermes deve enxergar a skill e seis ferramentas; contexto ja aberto pode manter catalogo congelado.

## Diagnostico e recuperacao
Executar scripts/test_visual.py com o Python da instalacao, ler references/validation.json.
Comando manual sem Hermes: python scripts/visual.py '{"operation":"list_monitors"}'.
Nao encerrar o Hermes inteiro para limpar overlay. computer_hide_overlay para a sessao; EOF/lease e fallback automatico.
Runtime nao compilado, WGC indisponivel, monitor ausente, acesso negado, exclusao nao suportada e timeout sao falhas explicitas.
Nao criar fallback silencioso BitBlt/GDI quando a ferramenta promete WGC.
Para desinstalar: hermes plugins disable hermes-visual-computer-use; preservar fonte e remover somente sua instalacao apos encerrar sessoes.

## Testes e limites
validation.json registra o que foi executado. Modelos sinteticos 1/2/3/4 nao equivalem a bancada fisica.
Bancada real atual: quatro telas, dois retratos 1080x1920 e duas paisagens1920x1080, DPI100%.
Hardware1/2/3, DPI misto fisico e hotplug permanecem pendentes ate teste real, sem mudar configuracao Windows para fingir cobertura.
Cancelamento por EOF e expiracao de lease sao testaveis sem desligar computador nem alterar configuracoes.
Fonte Microsoft: https://learn.microsoft.com/windows/uwp/audio-video-camera/screen-capture
Fonte Hermes: website/docs/developer-guide/plugins/index.md da instalacao.
Fonte Cua: https://hermes-agent.nousresearch.com/docs/user-guide/features/computer-use
AUTOMATING exige HWND conhecido no computer_use atual ou no ultimo capture da mesma sessao, e MonitorFromWindow deve coincidir com a captura selecionada. Alvo desconhecido permanece CAPTURING, sem inventar monitor de controle. Para garantir indicador durante input, fornecer pid/window_id na captura Cua anterior.
ACEITE 02/11/2026: build/publish executados, 43 verificacoes passaram (incluem assertions auxiliares), quatro capturas WGC reais e cleanup; skill_view success=true; seis entradas no registro Hermes; retorno multimodal com PNG temporario removido; hooks reais passaram sem input injetado; status final IDLE/captureActive=false/overlayVisible=false. CLI oficial confirmou hooks ativos no gateway e ferramentas para proxima sessao. Nao foi simulado dialogo de LLM nem afirmada adocao por conversa GUI ja aberta. Nenhum fonte existente do Hermes/Cua foi alterado. Pendencias fisicas explicitadas em validation.json.
