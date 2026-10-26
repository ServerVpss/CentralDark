# Foco e delegação mensurável — SOL ↔ Claude ↔ Hermes

Owner canônico: ../SKILL.md (centraldark-operational-method).
UI: apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx → GavetaForja → FocusTelemetryPanel.
Sensor Casa: ../scripts/Measure-FocusWindow.ps1; dados privados em %LOCALAPPDATA%\CentralDark\telemetry\focus-events.jsonl.
Leitura autenticada: apps/instinto-superior/src/lib/centraldark-focus-telemetry.functions.ts.
Canal observado: MCP Remote Desktop Commander → PowerShell/UIAutomation → Edge; Browser.get_tab_context dá ACK/readback.

## Protocolo de envio real com autorização

1. Descobrir aba exata pelo título, confirmar URL pelo Browser. Site aberto não significa envio possível.
2. Janela msedge com MainWindowHandle → raiz UIAutomation → TabItem → SelectionItemPattern.Select para a aba do Claude. Seleção programática não é clique físico.
3. Encontrar ControlType.Edit chamado Escreva as instruções para o Claude. Rejeitar draft preexistente. ValuePattern.SetValue escreve a intenção.
4. Só enviar com autorização explícita para aquela delegação, texto correto em readback e botão Enviar mensagem habilitado. InvokePattern.Invoke uma única vez; retry cego é proibido.
5. Prova de entrega: mensagem enviada visível e ACK do Claude pela leitura da aba; ACK não equivale a execução concluída.
6. Coordenação pelo Kanban mãe existente t_911e17ff, owner por workspace, uma caneta por escopo, recibo real do executor.
7. Resposta: CURRENT / DELTA / PROVA / CONTRAPROVA / NEXT_CURSOR. MESSAGE_SENT != ACK != EFFECT_PROVED != NETWORK_CONNECTED.

## Benchmark de foco sem envio

- Na Casa autorizada, executar powershell.exe -NoProfile -ExecutionPolicy Bypass -File .agents/skills/centraldark-operational-method/scripts/Measure-FocusWindow.ps1 -MinRounds 5 -MaxRounds 8 -Tolerance 0.15.
- Por ciclo: aba ChatGPT → aba Claude → focar o editor → digitar exatamente oi → ler valor → apagar → ler vazio → voltar à aba ChatGPT.
- Restaurar a aba originalmente selecionada. Nunca clicar Enviar no ensaio. Não apagar draft preexistente. Se editor ocupado, encerrar sem sobrescrever.
- Registrar ação UIA, timestamp UTC, run_id, tipo, duração Stopwatch.TotalMilliseconds, sucesso de readback, rota; NÃO registrar conversas, credenciais, conteúdo livre, IDs de conta ou janelas não envolvidas.
- React/editor é assíncrono: dar até 500ms para readback após SetValue, depois validar. Limpar apenas o oi próprio se a atualização atrasar.
- Fixed point finito: mínimo 5 ciclos, últimas 3 durações com (máx-mín)/média <= 0.15; máximo 8. Se não estabilizar = NOT_FIXED_POINT, não 200% comprovado.
- Remedir depois de mudanças ambientais; escopo temporal dos indicadores = 24h.

## Campos da Sala de Controle

- Ações UIA: apenas eventos instrumentados verified=true.
- Troca de aba: tab_switch, mediana e p95 de latência; não confundir com clique físico ou handshake MCP.
- oi/apagar: par type e clear no mesmo run, sem envio de mensagem.
- Roundtrip: round_trip medido ponta a ponta na UI.
- Uso da Skill Mãe: runs instrumentados distintos; NÃO é ranking global de todas as skills.
- ACK: apenas evento ack comprovado, distinto da conclusão da missão.
- Cliques físicos e conexões indiretas de rede: NÃO MEDIDOS (null). Não estimar pelo número de abas.
- Server function com requireSupabaseAuth + role admin. Fora da Casa retornar NO_LOCAL_SOURCE; sem log local retornar NO_EVENTS; falha de leitura não vira zero. Polling 10s só lê sensor.

## Papel do MCP CentralDark

Primeira entrega usa o MCP Remote Desktop Commander na Casa e gera trilha local auditável. Isso NÃO prova ingestão centralizada no servidor MCP CentralDark. Para unificar Casa/VPS/Claude/Hermes, reutilizar pipeline de auditoria MCP existente com correlação, autorização, sanitização, idempotência, source timestamps e readback. Nunca prometer E2E, conexão indireta ou ranking total sem essa prova.

Classificação BOUNDED. Respirações: Concentração + Som → Trovão → Lua → Fixed Point finito.
Por que: reduzir caminhos desnecessários com readback; não criar segundo gateway, skill, Kanban ou processo de fundo.

## Receita operacional completa — ampliação SOL (25/10/2026)

A intenção escolhe missão e executor; esta receita padroniza a ENTREGA com prova. Não instalar bridge, criar segundo executor ou mudar o Kanban. A skill principal e a referência atual continuam como único owner.

### FASE 0: descobrir o caminho com menos passos

1. Leitura de Browser.list_tabs identifica tabId, URL e título; Browser.get_tab_context confere o diálogo. No modo desta sessão, Browser apenas LÊ; não afirmar que ele clicou ou enviou.
2. Se houver autorização de envio, consultar Remote Desktop Commander.list_devices e confirmar a Casa Windows SEGREDO online. O fallback UIA pode funcionar mesmo quando o browser API está em modo leitura.
3. Descobrir processo msedge com MainWindowHandle válido. Usar Add-Type -AssemblyName UIAutomationClient, AutomationElement.FromHandle e ControlType.TabItem + SelectionItemPattern.Select para a aba de Claude.
4. Confirmar também a URL da conversa pela barra de endereços após selecionar; título ou nome do agente isolados não garantem destino. Se sessão/URL divergem, STOP_WRONG_DESTINATION sem tocar no editor.
5. Encontrar o editor pelo nome acessível Escreva as instruções para o Claude (ControlType.Edit), obter ValuePattern e SetFocus; verificar HasKeyboardFocus. Não depender de coordenadas de tela, OCR, clique físico ou Alt+Tab cego.
6. Antes de cada escrita: exigir URL correta, elemento habilitado, editor vazio após Trim, ausência de outro escritor e missão autorizada. Se draft não vazio: STOP_NO_OVERWRITE. Nunca apagar texto de outra pessoa.
7. Resolver a missão: intenção, owner, workspace, ID_MAE quando aplicável, critérios, fronteiras e prova. Deduplicar por conversa + missão + hash do texto + readback recente. Não usar --parent em filha de mãe bloqueada; o Kanban t_911e17ff já define essa regra.
8. Executar ValuePattern.SetValue com a mensagem; conferir texto COMPLETO por readback. React/editor atualiza de forma assíncrona: polling de 20–25ms, prazo limitado (500–850ms medidos), sem falha instantânea e sem sleeps grandes fixos.
9. Só após autorização de envio e readback exato, confirmar botão Enviar mensagem habilitado e chamar InvokePattern.Invoke UMA vez. Enter, paste e retry cego não substituem esse gate.
10. Ler de novo via Browser. Estado separado: COMPOSED → INVOKED → MESSAGE_VISIBLE → ACK → HERMES_DONE → EFFECT_PROVED. Composer vazio não prova entrega; ACK do Claude não prova instalação, commit ou execução Hermes. Consultar kanban runs e efeito no host.
11. Devolver CURRENT / DELTA / PROVA / CONTRAPROVA / NEXT_CURSOR. Não copiar conversas, credenciais, cookies ou IDs de conta para logs. Retomar seleção anterior só quando não interromper ação humana.

**Atalhos com guarda:** cache de AutomationElement e padrões somente durante a mesma rodada; reaproveitar tabId vigente; evitar revarrer a árvore quando foco/URL/elemento continuam válidos. Invalidar ao navegar, trocar sessão, reiniciar Edge ou perceber elemento stale. Segurança e readback são constantes, não atalhos descartáveis.

### FASE 1: calibrar sem enviar

- Pré-condições: Claude na URL esperada, editor vazio, pessoa não digitando, aba de origem identificada. Não fazer benchmark sobre draft nem durante interação concorrente.
- Um ciclo: selecionar ChatGPT → selecionar Claude → focar editor → escrever apenas oi → ler oi → limpar apenas esse oi → confirmar vazio → voltar a ChatGPT. Proibir InvokePattern do botão Enviar. Restaurar aba inicial em finally.
- Medir separadamente tab_switch ida e volta, focus, type+ACK, clear+ACK e round_trip via Stopwatch.TotalMilliseconds monotônico. Cada evento inclui UTC, run_id, round, route e verified=true somente após readback.
- Limite: no sensor existente MinRounds=5, MaxRounds=8, Tolerance=0.15. Fixed point atual significa dispersão das **últimas 3** durações (max-min)/média <= 0.15. Se 8 ciclos não alcançam o critério: NOT_FIXED_POINT, sem repetir indefinidamente. Isso não prova 200% de performance.
- Em exceção, limpar só o literal oi próprio após confirmar autoria/valor, jamais sobrescrever draft desconhecido; sem envio e sem criação de tarefas. Tempo de interface NÃO é latência de rede, ACK do modelo ou duração da missão.

### FASE 2: medir e otimizar sem regressão

- Baseline local isolado: 6 ciclos UIA focar/escrever/ACK/limpar/ACK sem troca de aba; 79,0–93,9 ms por ciclo. Critério exploratório 3 anteriores versus 3 últimas a 15% atingido no ciclo 6. Não equivale a roundtrip inteiro.
- Baseline do script canônico: execução de Measure-FocusWindow.ps1 com MinRounds 5 MaxRounds 8 Tolerance 0.15; exit 0, cycles=5, fixed_point=true, input_sent=false. Mean round_trip=547,42 ms, min=458,23 ms, max=814,11 ms. run_id=5cb01123f5444f77b2bf2e4cea164ca8; dados em %LOCALAPPDATA%\CentralDark\telemetry\focus-events.jsonl, timestamps UTC 2026-10-25T10:43:04 a 10:43:06.
- Contraprova: a primeira amostra completa de aquecimento (814,11 ms) continua no log; ponto fixo refere-se às últimas 3, não a todos os ciclos. Na primeira tentativa isolada, a leitura imediatamente após SetValue acusou falso FAIL pela atualização assíncrona; polling curto corrigiu a detecção.
- Próxima melhoria de MÉTRICA, sem alterar resultados passados: quando n >= 6, comparar também médias das 3 anteriores e 3 últimas, além da dispersão interna. Versionar algoritmo de fixed point antes de unir séries. Informar n, mediana, intervalos e possível aquecimento; p95 com amostra pequena não sustenta SLO.
- Próxima melhoria de SCRIPT no mesmo owner: validar URL depois da troca de aba, e impedir competição por foco se humano/worker estiver escrevendo. A versão observada seleciona principalmente por título; não atribuir guard de URL ao script até editar/testar. Revalidar somente o cone alterado.
- Otimização causal: identificar primeiro gargalo tab_switch, element lookup, render React, foco, rede/ACK ou execução Kanban. Escolher UMA melhoria local por vez, repetir benchmark no mesmo host e comparar baseline; nunca remover ACK ou prova para ganhar milissegundos.

### Falhas e respostas esperadas

| Sinal | Ação | Estado |
|---|---|---|
| Browser só lê, UIA disponível | usar fallback local autorizado e confirmar URL | UIA_READY, não BROWSER_WRITE |
| Sem janela/aba ou URL errada | parar sem escrever; recuperar sessão | BLOCKED_CHANNEL ou WRONG_DESTINATION |
| Draft preenchido ou editor ocupado | preservar e não competir por foco | STOP_NO_OVERWRITE |
| SetValue OK, leitura atrasada | polling limitado até ACK do editor | RETRY_READ_ONLY |
| Botão desabilitado / Invoke incerto | consultar conversa ANTES de tentar outro envio | DELIVERY_UNKNOWN |
| Mensagem na conversa, sem ACK | informar pendência de confirmação | MESSAGE_VISIBLE |
| ACK sem prova de arquivo ou instalador | consultar Hermes runs, log, artefato e hash | ACK_ONLY |
| Ponto fixo UIA, missão lenta | medir caminho de rede/executor separadamente | UI_FIXED_POINT_ONLY |

### Registro de Aprendizados (escopo e responsabilidade)

- o_que: ampliação aditiva da referência do protocolo JÁ vinculada à Skill Mãe; nenhuma skill, gateway, worker ou painel paralelo.
- por_que_fazer: operacionalizar Focus comprovado, reduzir caminhos, registrar tempos e manter idempotência.
- por_que_nao_fazer_outra_coisa: Browser de leitura + UIA e sensor existentes atendem ao objetivo sem infraestrutura duplicada.
- por_que_usar: reutilizar SOL → Claude → Hermes → HUD → SOL e o catálogo canônico, com owner/contraprova.
- por_que_modificar: readback React assíncrono, risco de duplicar envio, cache inválido e falsa interpretação de 200%.
- o_que_mudou: fases 0–2, evidência real, otimizações com guarda, falhas e próximo cursor; não mudou executores nem mensagem da missão.
- prova: benchmark script com exit 0 + eventos do run_id acima; teste anterior de envio UIA com mensagem visível e ACK do Claude.
- contraprova: nenhum oi foi enviado; editor final vazio; ACK não prova entrega da tarefa; ganho global ou 200% permanece UNKNOWN.
- executado_em: 2026-10-25, Casa Windows, UTC-03:00 (UTC exato no log). veredito=PROVADO no escopo UIA local; UNKNOWN no ganho geral.
- proximo_cursor: validar persistência da referência, integridade do script e inventário vivo existente; passar alteração de guard da URL ao writer responsável pelo sensor antes de mudar produção.


## Recibo real da Casa — 25/10/2026

- Preflight: origem HEAD local 96d4ffabce52ae44db999fda005189790068c8e6; origin/main observada 1605a73795a55facce29121877f343ca3f0c3056. Árvore dirty de outros owners preservada; NÃO houve commit, push ou deploy.
- Execução v1 inicial: 5 ciclos, fixed_point=true (dispersão apenas das últimas três), média de round trip 509,29ms, mínimo 436,62ms, máximo 711,24ms; zero envio. Inconsistência encontrada: seleção de aba já ativa contava como troca. Também foram identificados atrasos assíncronos no editor; dois primeiros ensaios falharam, sem envio.
- Corrigido: aguardar readback do foco/valor até 500ms, limpeza segura; pular aba já selecionada. Eventos limpos passaram a schema v2; histórico v1 não entra no placar do Cockpit.
- Execução v2 #1: 5 ciclos, fixed_point=true, média 694,32ms. Execução v2 #2 com cache do editor: 8 ciclos, fixed_point=false, média 626,71ms. NÃO afirmar ganho constante/200%; variabilidade do ambiente permanece.
- Agregado v2 readback em 25/10: 80 eventos verified=true, 28 transições de aba reais, 13 focos, 13 escritas, 13 limpezas, 13 idas e voltas; tempo mediano por transição 133,75ms, p95 212,864ms. O editor Claude ficou vazio em readback. Todas as escritas foram ensaios oi sem Enviar.
- Vite Casa GET dos três módulos UI + server function: HTTP 200 JavaScript, import da Gaveta confirmado; TypeScript direcionado: 0 erros nos novos arquivos. TypeScript global: exit 2 e 74 diagnósticos em outros módulos preexistentes; NÃO declarar build completo verde.
- Fonte de contabilidade MCP: tool MCP Remote Desktop Commander efetivamente usada. Ingestão remota no MCP CentralDark central, ranking global de skills, conexões de rede e cliques físicos: ainda NÃO PROVADOS. Leitor autorizado por role admin e Casa SEGREDO. Sem servidor Casa/role não há sinal.
- DELTA: Skill Mãe atualizada; referência e script novos; componente de Gaveta + server function nova. Contraprova de deploy/visibilidade autenticada ainda pendente. NEXT_CURSOR: reconciliar worktree dirty e origem main antes de publicar; readback visual no Cockpit sob conta admin; homologar adapter de auditoria no MCP central com receipt de envio e leitura no destino.

---

## Mapa verbal das quatro janelas / monitores da Casa (2026-10-26)

<!-- CENTRALDARK_JANELAS_1_A_4_UIA_20261026 -->

Intencao do CHEFE: dizer apenas "janela 1", "janela 2", "janela 3" ou "janela 4" para resolver a regiao de trabalho. Owner unico: esta referencia do protocolo Focus/UIAutomation ja vinculado a Skill Mae. Nao criar segundo motor, browser, HUD ou agente.

| Alias | Posicao | Monitor medido | Bounds (X,Y,W,H) |
|---|---|---|---|
| janela 1 | esquerda vertical | DISPLAY3 | (-3000,127,1080,1920) |
| janela 2 | centro superior | DISPLAY1 | (-1927,-863,1760,990) |
| janela 3 | centro inferior | DISPLAY4 | (-1920,138,1920,1080) |
| janela 4 | direita vertical | DISPLAY2 | (0,0,1080,1920) |

Snapshot real da Casa SEGREDO em 2026-10-26: Chrome foi observado no monitor central inferior com uma aba "Cockpit CentralDark - Sala de Controle"; Edge foi observado na esquerda vertical com outra aba "Cockpit CentralDark - Sala de Controle". Displays podem ser renumerados pelo Windows: o apelido permanece ligado a POSICAO relativa, e nao cegamente ao numero DISPLAY.

Receita antes da proxima acao: enumerar Screen.AllScreens; resolver o alias por coordenadas relativas; enumerar janelas MainWindowHandle e UIAutomation.AutomationElement.FromHandle; cruzar a intersecao de retangulos; obter titulo, abas TabItem e URL; confirmar URL e sessao autenticada por readback antes de navegar. Se monitor, aba ou URL nao forem resolvidos, retornar UNKNOWN em vez de adivinhar.

A chamada "janela 3" identifica o centro inferior. "Olhe a janela 3" solicita leitura/observacao, nunca envio de mensagem. "Navegue na janela 3" autoriza apenas a navegacao solicitada, sem mutacao de backend. Se Browser API estiver sem contexto de extensao, o fallback UIAutomation lista janelas/abas, mas nao prova conteudo autenticado.

Inventario circular desejado: COCKPIT -> GITHUB MAIN -> CASA E VPS -> SUPABASE E API -> READBACK COCKPIT; estado/owner/prova separados, sem inventar E2E. Classificacao BOUNDED, Concentração + Som. Prova local: enumeracao real de quatro monitores e duas janelas de browser. Este contrato documenta o alias; nao e uma automacao de navegacao ja testada.

<!-- /CENTRALDARK_JANELAS_1_A_4_UIA_20261026 -->
