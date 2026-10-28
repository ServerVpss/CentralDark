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

### #OBSERVACOES# — Receita operacional viva dos 4 monitores (28/10/2026)

- **Owner único de uso da interface:** esta referência da Skill-Mãe. Fonte complementar de identificação AMD e da tela Installer: `E:\VMs\CentralDark-Installer\CentralDark-README.md` (documento do installer, não criar segunda automação).
- **Objetivo/gatilho:** `!CENTRALDARK #MONITORES_CASA`, “janela 1–4”, “qual tela?”, “localizar janela”, “usar AMD Adrenalin”, “operar em monitor X”. O CHEFE indica o monitor ou envia imagem; Hermes identifica janela e aplicativo antes de navegar.
- **Fonte comprovada em 28/10/2026:** WMI `root\wmi:WmiMonitorID` retornou 4 monitores ativos: AOC `24G2W1G4` (2), AOC `24G2W1G5` (1), Dell `S2421HN` (1). O README do Installer registra a ordem **do menu AMD Adrenalin 1–4**, com três AOC e um Dell; a ordem AMD **não é automaticamente equivalente** a `\\.\DISPLAY1..4` do Windows nem ao apelido de posição.
- **Medida atual de `System.Windows.Forms.Screen.AllScreens` (28/10/2026):**

| Alias por posição | `Screen.DeviceName` atual | Bounds atuais `(x,y,w,h)` | Orientação |
|---|---|---|---|
| `janela 1` · esquerda vertical | `\\.\DISPLAY2` | `(-1080,-828,1080,1920)` | vertical |
| `janela 2` · centro superior | `\\.\DISPLAY4` | `(0,-1080,1920,1080)` | horizontal |
| `janela 3` · centro inferior | `\\.\DISPLAY3` | `(0,0,1920,1080)` | horizontal, primária |
| `janela 4` · direita vertical | `\\.\DISPLAY1` | `(1920,-831,1080,1920)` | vertical |

- **Contraprova de mutabilidade:** o snapshot de 26/10 tinha associação diferente entre `DISPLAYx` e posições; por isso **NÃO fixar** aliases em `DISPLAY1..4` ou coordenadas em automação. Remeça `Screen.AllScreens` a cada nova sessão, após reconexão/reboot, arranjo de tela, mudança de driver ou indício de divergência. O nome comercial/identificador EDID vem de WMI; só associá-lo a `Screen.DeviceName` se houver correlação técnica confiável (display path/adapter/target), **nunca por ordem da lista**.
- **Ciclo de operação:** `CHEFE_INTENT → IDENTIFICAR MONITOR (alias/posição) → REMEDIR DISPLAYS → LOCALIZAR HWND/PROCESSO → UIA OU BROWSER AUTORIZADO → CONFERIR ABA/URL/ROLE → BEFORE → AÇÃO SEGURA → AFTER + CONTRAPROVA → RECEIPT → NEXT_CURSOR`. Cruzar `Screen.Bounds` com retângulo da janela ativa; se houver múltiplas janelas, usar título, HWND e confirmação visual. Foco humano ocupado → `FOCUS_BUSY`, não disputar mouse. Tela/monitor ausente, renumerado ou não identificável → `UNKNOWN`, não clicar.
- **AMD Adrenalin — somente observar:** abrir o menu já existente `Gravação e transmissão → Gravar → Janela ativa` para **localizar** as quatro saídas sem iniciar gravação, sem alterar resolução, ordem, overclock, voltagem, potência, ventoinha, perfil ou driver. O painel LIVE da RX 580 usa outro owner de telemetria; mapear monitores não equivale a alterar hardware.
- **Evidência e rastro:** `MONITOR_ALIAS | MEASURED_UTC | SCREEN_DEVICE_CURRENT | BOUNDS | EDID_MODEL_IF_VERIFIED | APP | HWND | BEFORE | ACTION | AFTER | AUTH_SCOPE | RECEIPT`. Persistir apenas informações operacionais sanitizadas na biblioteca; não registrar conteúdo privado de telas ou tokens. **DISPLAY_DISCOVERY_PASS != GUI_CONTROL_PASS != ACTION_EFFECT_PASS.**
- **Estado deste registro:** `MONITORS_WMI=4_PASS`; `SCREEN_BOUNDS=4_PASS`; `AMD_DISPLAY_TO_WINDOWS_SCREEN_JOIN=UNKNOWN`; `AUTOMATED_CLICK_CURRENT=NOT_EXECUTED`. **NEXT_CURSOR:** consumir esta receita ao receber um alias; provar no desktop autorizado uma navegação de baixo risco, sem instalar segundo controlador. `LAST_UPDATED_UTC=2026-10-28T12:26:38Z`.

<!-- /CENTRALDARK_JANELAS_1_A_4_UIA_20261026 -->


---

## 🖱️ Navegação deliberada do Cockpit — mapa vivo botão por botão (27/10/2026)

<!-- #OBSERVACOES#
@owner: .agents/skills/centraldark-operational-method/references/FOCUS-DELEGACAO-TELEMETRIA.md
@doc_ref: .agents/skills/centraldark-operational-method/SKILL.md; docs/HUD/README.md; apps/instinto-superior/scripts/verify-hud-zone.mjs
@code_ref: apps/instinto-superior/src/components/central/CockpitShell.tsx; apps/instinto-superior/src/components/central/SistemaCentralDark.tsx; apps/instinto-superior/src/components/central/RuntimeSistema.tsx
@last_updated: 2026-10-27T15:35:04.692Z
@escopo: ensinar Hermes/Oracle a usar a interface real, mapear controles e corrigir a menor falha por owner
@implementado: receita operacional vinculada à skill-mãe; sem novo processo, skill, browser, gateway ou writer
@pendente: executor Hermes consumir esta versão, efetuar cliques seguros e produzir receipts UI por botão no runtime autenticado
@next_cursor: testar seleção Sistema → Runtime / Capabilities → Métricas/Rastreamento/Configurações/Mostrar sensores; readback e link ao teste existente
-->

**Gatilhos:** `!CENTRALDARK #ACORDAR #HERMES #MAPEAR_COCKPIT`, “usa o mouse”, “clica botão por botão”, “valida a tela”, “melhora a skill”. Este é **modo da skill-mãe** `centraldark-operational-method`; não criar `centraldark-oracle-surface` como novo cérebro/owner. Se Oracle já existir como ferramenta visual conectada, aproveitar sua sessão/driver atual. Se não existir permissão efetiva de clicar no runtime, `CAN_CLICK=NO`, nunca fingir cliques ou usar logs de inspeção como cliques reais.

### Fluxo único: inventariar tudo, clicar somente no que é seguro

```text
CHEFE_INTENT → CONTEXT → META-GRILL → CURRENT/GREEN_STATE
→ OWNER EXISTENTE → MAPA DE ROTAS (somente leitura)
→ CLASSIFICAR CADA CONTROLE: SAFE_NAV | READ_ONLY_EXPAND | MUTATING | UNKNOWN
→ SELECIONAR ALVO SEM CONCORRER COM O HUMANO
→ CAPTURA ANTES (URL, aba, heading, contagem, estado, amostra, UTC)
→ CLICAR UMA VEZ [somente SAFE_NAV / READ_ONLY_EXPAND]
→ CAPTURA DEPOIS (mesma sessão, URL, DOM/aria e efeito visível)
→ COUNTERPROOF → REGISTRAR RESULTADO POR BOTÃO
→ BACKCHECK → PRÓXIMO BOTÃO (mesmo trilho)
→ PROPOR MENOR CORREÇÃO POR OWNER → TESTE/GATE → RECEIPT → NEXT_CURSOR
```

**Primeiro mapear sem clicar:** enumerar todos os controles visíveis/habilitados por `role`, nome acessível, `aria-label`, `data-cd-flow`, título/ícone e contexto do setor. O mapa separa `button`, `tab`, `link`, `switch` e `menuitem`. `VISIBLE != ENABLED != CLICKED != EFFECT_PROVED`; elemento renderizado não prova backend. Incluir controles ocultos somente com rastro de expansão de menu e sob a mesma sessão. Clicar um controle por vez, voltar ao checkpoint/aba inicial após registrar efeito, não varrer coordenadas em loop cego.

**Seletor confiável:** preferir `data-cd-flow` estável; depois `getByRole("tab"|"button", {name})`, `aria-label` e caminho acessível confirmado. Clique real via ferramenta de browser/computer autorizada ou via `UIAutomation.InvokePattern` no Windows, com verificação antes/depois. `InvokePattern` é ação UIA sem mouse físico: **não reportar** `physical_mouse_clicks` se não houve evento físico observado. Mouse/posição apenas como fallback visual autorizado, com screenshot atual, verificação de resolução, janela e alvo; jamais coordenadas fixas sem readback. Não executar código JavaScript arbitrário de página, contornar login ou injetar tokens.

**Política de interação:** autoriza ensaio automático só de abas, menus, expandir/recolher, seleção de área, paginação e filtros **que não alteram backend**. **NÃO clicar automaticamente** em `Enviar`, `Excluir`, `Instalar`, `Rebuild`, `Deploy`, `Sync`, `Commit`, `Push`, `Parar/Iniciar serviço`, `Exportar` com dados sensíveis, permissões, botões que aceitam transações, controles de GPU/energia, `TODO` desconhecido ou ações não classificáveis; só registrar `NEEDS_EXPLICIT_ACTION_AUTH`. Botão de registro CSV/telemetria somente com solicitação específica e verificação de privacidade. Não executar navegação automática se pessoa estiver digitando ou outro writer/robot controlar a janela; restaurar foco apenas se seguro.

**Caso piloto — Radeon RX 580 já LIVE:** usar a **sessão autenticada já aberta**, verificando origem, certificado/rede e rota `/sala-controle` (Casa pode estar em `http://localhost:8080` ou no host Tailscale privado autorizado; não fixar origem por suposição). Em seguida, `Sistema CentralDark` → aba `Runtime / Capabilities` → painel `Radeon RX 580 · Desempenho`. Mapear e, quando autorizado pela sessão, selecionar **Métricas**, **Rastreamento**, **Configurações** e **Mostrar todos os sensores reais** (somente expansão). Confrontar `LIVE` + contador atual + sensor `GPU usage` + `sourceUpdatedAt` + avanço da série entre T0 e T1. **Não reutilizar snapshot de 58/60 como constante**: é medição temporal, pode variar. Comparar dados da mesma tela, no mesmo timestamp. O texto antigo `UNKNOWN` exibido pelo agente não é a verdade do novo frame; atualizar conclusão após readback e registrar `PAST_UNKNOWN → CURRENT_LIVE`, não reexecutar o coletor sem causa.

**Pitfall — sessão da ferramenta ≠ sessão do usuário:** o cockpit SPA redireciona requisições não-autenticadas para `/auth`. `browser_exec` isolado pode não compartilhar a sessão do Hermes Desktop; isso **não demonstra** que o CHEFE esteja deslogado. Priorizar a sessão da superfície já autenticada e autorizada, validando a ação e o efeito por readback. Em 2026-10-27 o Hermes relatou **reuso bem-sucedido do Desktop Preview**, sem novo login, com seis controles navegados (recibo abaixo): atualizar `PAST_BROWSER_EXEC_AUTH_REQUIRED → CURRENT_DESKTOP_SESSION_AUTHORIZED`. Se a superfície autenticada real não estiver acessível naquela execução, registrar `CLICK_STATUS=NOT_EXECUTED` / `BLOCKED_AUTH_REQUIRED` especificamente para **a ferramenta usada**, preservar a missão e retomar no owner autorizado. Não copiar cookies/tokens, não pedir credencial em chat e não contornar RBAC. Evidência histórica nunca substitui readback atual. **Fallback quando o bridge do Desktop Preview estiver indisponível (timeout/sem aba):** usar `computer_use` sobre o Edge real do CHEFE — focar a barra de endereço via Ctrl+L, digitar a URL da sala de controle, Enter, e validar por `page_info`/DOM readback; não assumir que a digitação caiu na barra de endereço sem readback (a digitação pode ir para o input de uma página aberta, e.g. ChatGPT). Sempre confirmar a URL renderizada por captura + SOM antes de declarar cockpit alcançado."

**Mapa/recibo sanitisado por controle:** `INTENT_ID | RUN_ID | SCREEN | SOURCE_SHA | ROUTE_URL_PATH | ROLE | ACCESSIBLE_NAME | DATA_CD_FLOW | CLASSIFICATION | BEFORE_STATE | ACTION_TOOL | ACTION_TYPE | AFTER_STATE | EFFECT | TIMESTAMP_UTC | RECEIPT | STATUS | NEXT_CURSOR`. Usar `LOCALAPPDATA\CentralDark\telemetry` apenas para logs locais autorizados, sem HTML bruto, cookies, conta, email, tokens, mensagens privadas, prints com credenciais ou conteúdo de campos de formulário. Versionar na Biblioteca Obsidian/BRAIN só síntese sanitizada e comprovada ligada ao owner, nunca telemetria privada bruta.

**Autoaperfeiçoamento controlado da skill:** cada botão falho gera **uma hipótese com owner**, não PR/skill nova. Classificar `UI_ABSENT | DISABLED | WRONG_ROUTE | NO_AUTH | STALE_DATA | SOURCE_MISSING | TEST_STALE | BACKEND_ERROR | UNKNOWN`; corrigir a menor causa, atualizar o teste **no arquivo existente** `apps/instinto-superior/scripts/verify-hud-zone.mjs` quando o contrato realmente mudou, sem afrouxar invariantes de segurança. `BACKCHECK` das 2–3 ações anteriores, repetir só o botão afetado e regressões vizinhas. Registrar `#OBSERVACOES#`, owner, UTC real, antes/depois, contraprova, receipts. Novas receitas passam a esta mesma referência/skill-mãe somente depois de teste e selo causal.

**Condicional real:** sem ferramenta interativa válida, executor autenticado ou autorização para a ação, **somente mapa estático/ARIA** e `CLICK_STATUS=NOT_EXECUTED`; retomar pela mesma janela depois. Browser API em modo somente leitura não vira `CLICKED=PASS` pela existência de uma aba. Não tentar controles remotos alternativos para contornar bloqueio.

**Classificação:** BOUNDED. Respirações 1 Concentração (alvo), 13 Som (sinais), 9 Flor (clique preciso), 3 Lua (contraprova), 16 Regeneração Monotônica (melhoria sem regressão). `DECLARED != CLICKED != PROVED`. **A referência ensina o ciclo; não afirma execução automática agendada, cobertura 100% nem resposta dos serviços.**

---

## 🪬 Recibo consumido — seis cliques de navegação Radeon, Hermes Desktop (2026-10-27)

<!-- #OBSERVACOES#
@owner: .agents/skills/centraldark-operational-method/references/FOCUS-DELEGACAO-TELEMETRIA.md
@doc_ref: .agents/skills/centraldark-operational-method/SKILL.md; docs/HUD/README.md
@last_updated: 2026-10-27T16:15:04.980Z
@evidence: relatorio de Hermes fornecido pelo CHEFE em 27/10/2026, 13:11 hora local, com descricoes DOM antes/depois
@evidence_grade: EXECUTED_REPORTED_BY_HERMES; owner source selectors lidos em Casa; nao houve segunda reproducao independente nesta atualizacao
@state: MAP_RADEON_SAFE_NAV=6/6_REPORTED; CAMERA/NETWORK_TRACE=UNKNOWN; RECORD_EXPORT_E2E=NOT_TESTED
@next_cursor: Sistema CentralDark > Infraestrutura, Radar, Mega Painel, Status; mapear SAFE_NAV por readback; tratar gate verify-hud no owner separadamente
-->

O mapeamento da **sessão autenticada Hermes Desktop Preview**, sem reautenticação, registra seis transições de navegação com DOM readback pelo executor. Os seis controles abaixo são **SAFE_NAV/READ_ONLY_EXPAND**; os valores das métricas são **snapshot temporal**, nunca parâmetros fixos de teste.

| Ordem | Seletor observado no relatório | Ação / evidência de efeito | Owner | Resultado relatado |
|---|---|---|---|---|
| 1 | `btn-abrir-sistema-centraldar` | Abriu Sistema CentralDark; surgiram abas Mega Painel, Status, Runtime/Capabilities, Infra e Radar | `CockpitShell.tsx` / `SistemaCentralDark.tsx` | `PASS_NAV` |
| 2 | `tab-runtime-capabilities` | Aba Runtime/Capabilities renderizou CPU/VPS, disco, GPU/Sensores da Casa e Radeon | `SistemaCentralDark.tsx` | `PASS_NAV` |
| 3 | `tab-m-tricas` | Seleção Métricas, cards FPS/GPU/temperatura/CPU/VRAM e estado da fonte | `RuntimeSistema.tsx` | `PASS_NAV` |
| 4 | `tab-rastreamento` | Aba Rastreamento mostrou **Começar a registrar** e **Exportar CSV (0)** desabilitado | `RuntimeSistema.tsx` | `PASS_NAV` |
| 5 | `tab-configura-es` | Aba Configurações mostrou MMF read-only e periodicidade do coletor/consulta | `RuntimeSistema.tsx` / `maquina.functions.ts` | `PASS_NAV` |
| 6 | `btn-mostrar-todos-os-sensore` | Texto expandiu para **Ocultar sensores (58)** e revelou lista dos sensores | `RuntimeSistema.tsx` | `PASS_EXPAND` |

**Dados observados pelo Hermes (não reensaiados nesta alteração):** `MAHMSharedMemory`, `LIVE 58/60`, timestamp da amostra `2026-10-27 13:11:22` hora local, idade relatada `7 s`, histórico `7 amostras`; entre os sensores: 75,2 FPS, GPU usage 36%, GPU 45 °C, GPU power 30,6 W, fan 47%/1277 RPM, CPU 62,3%, CPU temp 72 °C e VRAM 2224 MB. Não promover valores antigos para estado atual.

**Contraprova / limite:** o botão **Começar a registrar** foi **observado**, mas o relatório de seis cliques **não demonstra seu acionamento com amostras gravadas**. **Exportar CSV (0)** apareceu disabled; não houve download validado. Então `TRACK_TAB_PASS=true` **não implica** `RECORD_PASS` ou `CSV_EXPORT_PASS`. Nenhuma ação perigosa/alteração de hardware relatada; sem log independente de rede, console e screenshot sob este mesmo `RUN_ID` (identificador ainda não informado), não declarar E2E universal nem todos os setores mapeados. O total de 58 sensores deve ser tirado do snapshot, não calculado apenas das categorias exemplificadas no relato.

**Regra reaproveitável (novo cristal):** navegar nos botões SAFE_NAV em uma mesma sessão autenticada; capturar `BEFORE → ACTION → AFTER` e marcar `NAV/EXPAND_PASS` somente com DOM alterado; verificar o efeito de backend **separadamente** com network/API/DB quando a ação o exigir; preservar `RUN_ID`, seletor, owner, timestamp, receipt e `NEXT_CURSOR`. Se `browser_exec` isolado voltar a mostrar `AUTH_REQUIRED`, consultar a sessão Desktop já autorizada antes de inferir logout global.

**NEXT_CURSOR:** continuar na **mesma janela** pelas abas `Infraestrutura → Radar → Mega Painel → Status`, ações seguras uma a uma, mantendo `STATE_HASH` e controle de foco. Registrar ações externas/destrutivas como `NEEDS_EXPLICIT_ACTION_AUTH` sem clicar para explorar. O problema `verify-hud-zone.mjs` (assertion legada `sticky top-0 z-50`) segue **outro cone causal**, não corrigido por este recibo. Delta Radeon e Skill-Mãe ainda dependem de gates/publicação; nenhum commit/push/deploy é inferido.
