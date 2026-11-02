<!-- CENTRALDARK_SKILL_MOTHER_OPEN_AND_GLOBAL_INDEX_20261028 -->
## 🪬 Índice global e abertura da Skill-Mãe — modo operacional

**Intenção do CHEFE:** “abre a Skill-Mãe”, “abre a pasta da Skill-Mãe”, “mostra a Skill-Mãe”, “abre o índice global”, “modo operacional da CentralDark”. Reutilizar este mesmo owner. Não criar atalho paralelo, outra skill, outro índice ou pedir ao CHEFE que procure a pasta.

**Índice global existente:** `K:\.agents\library-index.json`, entrada `skills[id=centraldark-operational-method]`. **Fonte canônica:** `K:\.agents\skills\centraldark-operational-method\SKILL.md`. **Pasta operacional:** `K:\.agents\skills\centraldark-operational-method`. As receitas detalhadas ficam em `references\` desta mesma pasta. Entradas gerais já existentes: `K:\LEIA-ME-IA.md`, `K:\AGENTS.md`, `K:\RULES.md`. Não copiar toda a biblioteca para abrir ou explicar uma pasta.

**Quando o CHEFE disser “abre a Skill-Mãe”:** na **Casa Windows SEGREDO**, com sessão gráfica e comando autorizado, abrir **esta pasta** no Explorador de Arquivos, usando PowerShell:

```powershell
$p = 'K:\.agents\skills\centraldark-operational-method'
if (Test-Path -LiteralPath $p -PathType Container) {
    Start-Process -FilePath 'explorer.exe' -ArgumentList ('"' + $p + '"')
} else {
    Write-Output 'UNKNOWN: pasta Skill-Mãe indisponível nesta máquina.'
}
```

**Resultado pedido:** a janela do Explorador com a pasta aberta. Se pedir **“abre o arquivo da Skill-Mãe”**, mostrar `SKILL.md` no editor já existente, sem modificar o arquivo. Se pedir **“mostra o índice global”**, abrir `.agents\library-index.json` somente para consulta. Se pedir **“explica a Skill-Mãe”**, usar o índice e as seções pertinentes em linguagem clara, sem tentar executar tarefas.

**Método único:** `CHEFE_INTENT → ÍNDICE GLOBAL EXISTENTE → SKILL-MÃE → OWNER PERTINENTE → AÇÃO PEDIDA → CONFIRMAÇÃO DO EFEITO`. Se o Explorador não puder abrir, registrar `OPEN_SKILL_MOTHER=UNKNOWN` com a causa; isso não bloqueia outros trabalhos. Não alegar que todos os agentes carregaram o método apenas porque o texto está no Git. **MODO CLAREZA — ASD-STE100 | 80%** nas respostas; sem repetição de verificações já concluídas, sem disputa de foco ou execução não solicitada.

<!-- /CENTRALDARK_SKILL_MOTHER_OPEN_AND_GLOBAL_INDEX_20261028 -->

### GATILHO DE RODADA — toda mensagem recebida exige Casa antes da decisão (CHEFE 29/10/2026)

**Gatilho obrigatório na mesma conversa:** a cada novo comando do CHEFE ou retorno `HERMES -> ORACULO`, SOL não termina apenas com um ACK textual: **1)** lê o `Goal`/sessão original do Hermes e seus critérios, contador de turnos, recibo, `NEXT_CURSOR` e o estado atual de `Loop`; **2)** confere a situação viva da Casa `K:\` (`HEAD`, branch, dirty, owner, comando/resultado da missão, status Cockpit) e o GitHub via `gh`; **3)** contraprova o recibo contra owner, arquivos, testes e UI quando pertinentes, distinguindo evento observado de declaração de origem; **4)** escolhe o **menor próximo delta material** do mesmo Goal, ou `BLOCKED/UNKNOWN/FIXED_POINT` com causa e cursor; **5)** devolve o comando ao Hermes **original** pela mesma superfície nativa `Mensagem` (ou CLI original na mesma sessão se a interface não estiver disponível e sem disputar owner), faz readback de recebimento, e aguarda a próxima resposta real; **6)** somente então responde ao CHEFE com o resultado comprovado, sem encerrar a missão prematuramente. Preservar texto humano, não repetir comando cujo envio esteja incerto, não criar Goal/Loop/skill/bridge paralelo. **Cada nova chegada é o gatilho; não alegar observação da tela em background quando não há uma execução ativa.** Se alguma fonte não estiver acessível, dizer precisamente qual e marcar `BLOCKED`, em vez de inventar estado.

**Contraprova da rodada de 29/10/2026:** consulta na Casa e `gh` confirmou `K:\`/GitHub `main=a34bf39023567cd268b923facbdda049119c541d`, worktree limpo no instante da leitura; `.auto-sync/status.json` registrava `09:34:08 BRT, success, Casa já está em dia com main`, que não identifica o clique de `09:24:24`. O Hermes original, na sessão `20260920_235705_013b82`, retornou `STATUS=BLOCKED`, `RECEIPT_ID=CD_HUD_RECON_20261029_BD9A28C5E6E0`, `NEXT_CURSOR=OWNER_SYNC_EVENT_PROOF_REQUIRED`: o `sync.functions.ts` grava horário/status/detalhes, não autor/ACK/evento, e o Goal original tinha `done, 2/20` por juiz que aceitou relatório textual de 20/20. O transporte Hermes→ChatGPT não enviou esse recibo por haver rascunho prévio no compositor da conversa: **preservar o texto, não sobrescrever ou simular entrega**. O próximo delta útil é **instrumentar e testar o owner Sync existente para produzir prova causal em eventos FUTUROS**, não fabricar origem do evento antigo, nem reiniciar o Goal automaticamente.

### HERMES_BOOTSTRAP_DETECTION_RECOVERY — owner original, sem reinstalação (29/10/2026)

**Incidente medido:** em `C:\Users\Administrador\AppData\Local\hermes\logs\desktop.log` às 15:17, `Gateway ticket bootstrap failed` seguido de `no usable Hermes install` e exibição indevida do assistente inicial. O launcher já existente `C:\Users\Administrador\AppData\Local\hermes\hermes-agent\.hermes\bin\hermes.exe --version` responde versão 0.22.5 e **exit 0 em 3s**; a falha temporária da sonda não prova ausência da instalação. A execução mostrou event-loop lag de 8185ms na tentativa de recuperação da sessão. **Não relacionar a causa exclusivamente à VPS sem prova**.

**Menor delta no owner ORIGINAL Hermes:** em `C:\Users\Administrador\AppData\Local\hermes\hermes-agent\apps\desktop\electron\source-backend.ts` refatorar a chamada existente `execProbe(command, ['--version'])` para `probe()`; no primeiro erro esperar 750ms e repetir **o mesmo launcher uma única vez**; no segundo erro retornar `null`, sem falso verde, sem instalar, sem alternar backend. Teste incorporado no `electron/source-backend.test.ts` com launcher `.cmd` que falha na primeira tentativa e passa na segunda, e launcher persistentemente inválido que segue rejeitado. **Contraprova:** Vitest `7 PASS/1 SKIP/0 FAIL`, `tsc -p tsconfig.electron.json --noEmit` PASS, ESLint escopo PASS, bundle Electron para `%LOCALAPPDATA%\hermes\cache\bootstrap-fix-bundle-audit` PASS. `git diff --check` PASS no checkout original `NousResearch/hermes-agent@19949783`. **Não considerar DEPLOYED**: pacote `apps/desktop/release/win-unpacked/resources/app.asar` ainda antigo, processo Hermes ativo com Goals `active 0/20` e `active 1/20`; não substituir binário/reiniciar enquanto há execução ou rascunho. `NEXT_CURSOR=PACKAGE_AND_READBACK_WHEN_HERMES_IDLE`; checkouts da Casa `K:\` e perfis não devem ser movidos.

### HERMES_WINDOW_STATE_NATIVE — minimizar / maximizar / restaurar (29/10/2026)

**Owner único:** a janela original `Hermes.exe`. **Receita:** localizar somente o processo Hermes com `MainWindowHandle != 0`; obter seu `AutomationElement` por handle e o `WindowPattern`. Ler `Current.WindowVisualState` antes de agir. Se o pedido for **maximizar**, chamar `WindowPattern.SetWindowVisualState(Maximized)` somente se não estiver maximizada; se já estiver `Maximized`, devolver `ALREADY_MAXIMIZED` sem clicar. Para **restaurar**, usar `Normal`; para **minimizar**, usar `Minimized`, somente após pedido explícito. Como alternativa nativa, os botões UIA `Minimizar`/`Maximizar`/`Restaurar` do MESMO processo podem expor `InvokePattern`; confirmar sempre estado depois e evitar coordenadas, `Alt+Space` ou segundo controlador. **Não confundir tamanho da janela principal com aba, painel, Goal ou posição dos monitores.** Não mudar estado de janelas sem intenção atual.

**Prova de leitura na Casa em 29/10:** janela única `Hermes`, PID `31664`; botões `Minimizar` e `Restaurar` disponíveis, ambos com `InvokePattern`; `WindowPattern.Current.WindowVisualState=Maximized`. **Resultado `ALREADY_MAXIMIZED`**, sem nova mutação. O export antigo de Power Automate Desktop usava a janela `Hermes` e `UIAutomation.Click` em `Edit 'Address'`, mas não era uma prova de maximização: ações separadas, estados e recibos distintos.

## #OBSERVACOES# — Hermes Desktop: abrir URL em nova aba pela UIA existente (28/10/2026)

**Gatilho:** "Hermes abre esta URL em uma nova aba". **Owner:** esta Skill-Mãe; script [Hermes-Desktop-BrowserTab.ps1](scripts/Hermes-Desktop-BrowserTab.ps1), detalhes e contraprova na [referência de foco/automação](references/FOCUS-DELEGACAO-TELEMETRIA.md). **Fonte:** código Power Automate Desktop enviado pelo CHEFE, `UIAutomation.Click.Click Element: appmask['Window \'Hermes\'']['Edit \'Address\''] ClickType: UIAutomation.ClickType.LeftClick`; seu ControlRepository usa `uia3`, `Window 'Hermes'`, `RootWebArea` e `Edit 'Address'`. O export contém **seletor e imagem**, não um resultado de execução depois do clique. A **contraprova real** tem de vir de leitura UIA posterior.

**Regra:** reutilizar `Hermes.exe` autorizado, localizar o navegador embutido pelo `Edit 'Address'` e **o botão específico `New tab`** no mesmo painel; **não** confundir com `New session tab` (chat/Goal), **não** usar `Ctrl+T`, cliques por coordenadas ou abrir Edge externo. `-Mode Inspect` lê sem agir. `-Mode OpenNewTab -FromUrl '<URL_QUE_JA_ESTA_ABERTA>' -ToUrl '<URL_SOLICITADA_NA_HORA>'` só age se o URL original identificar um único painel; invocar o botão nativo com UIAutomation.InvokePattern, focar o Address identificado, digitar URL, Enter **uma vez**, reler tab count, abas originais e documento/URL da nova aba. URL é variável de execução, não fica gravada no Git. Se alguma etapa não comprovar o efeito, marcar `BLOCKED_OR_PARTIAL`/UNKNOWN, nunca PASS fictício, e não remover abas existentes. **Inspeção viva 28/10:** Hermes mostrou **2 painéis browser**, cada qual com `New tab` e `Address`, e o painel atual do Cockpit foi identificado sem modificar interface; a abertura real de nova aba/URL **ainda não foi executada neste recibo**.

## #OBSERVACOES# — Aprendizagem recursiva operacional: hipótese mensurável, não marketing (28/10/2026)

**REGISTRO CANÔNICO / INTENÇÃO DO CHEFE — `CENTRALDARK_SELF_IMPROVING_HARNESS_HYPOTHESIS_V1`:** aproveitar as duas superfícies **já existentes** no Hermes Desktop (`Mensagem` do executor e ChatGPT/Oráculo embutido na mesma conversa) para uma missão com até **20 turnos**, na qual a execução real gera evidência, o Oráculo reconcilia essa evidência com a Casa e o GitHub, e somente a próxima melhoria validada passa a compor a receita canônica. O CHEFE pode acompanhar a mesma conversa pelo celular; a conversa é interface de acompanhamento, **não** fonte única do cursor nem mecanismo que executa continuamente por conta própria. **Não** criar outro agente, skill paralela, navegador, checkout, cérebro, writer ou Goal desnecessário; reutilizar `centraldark-oracle-surface`, `Hermes-Oracle-Return.ps1`, Skill-Mãe e owner Hermes originais.

**PROVA HISTÓRICA JÁ OBTIDA — NÃO REDESCOBRIR:** (a) SOL executou e confirmou escrita no chat `Mensagem` do Hermes; (b) uma tarefa enviada ao Hermes apareceu na timeline do executor e iniciou suas ferramentas; (c) após um bloqueio por foco, SOL substituiu a receita de escrita por `ValuePattern.SetValue` + `Button 'Enviar'.InvokePattern`, **sem foco/teclado**, com `TEST_ID=CD_UISEND_2810_2335` e `ACTOR=SOL_OPERATOR`; (d) o texto apareceu como **nova mensagem nesta conversa ChatGPT** e ficou visível também na captura do iPhone; (e) script e instruções corrigidos foram persistidos no GitHub. **VEREDITO:** `SOL_TO_HERMES_DISPATCH=PROVEN`, `HERMES_EMBEDDED_CHATGPT_SEND_BY_SOL=PROVEN`, `PERSISTENT_RECIPE_IMPROVEMENT=PROVEN`. Isso comprova **autocorreção operacional + retenção de uma receita**, NÃO treinamento/alteração dos pesos do GPT, NÃO autonomia contínua de ChatGPT e NÃO melhoria recursiva em escala por si só. `HERMES_REAL_GOAL_RESULT_TO_ORACLE=NOT_YET_PROVEN`, `POST_LLM_HOOK=NOT_CONFIGURED`, `20_TURN_E2E_LOOP=NOT_YET_PROVEN`. O `ACTOR` escrito no chat não autentica origem: exige recibo correlacionado ao executor real.

**HIPÓTESE TESTÁVEL:** `H1`: depois que a CentralDark corrige e salva uma receita por contraprova, tarefas **novas e equivalentes** passam a ser executadas com **menos falhas/retrabalho** do que a versão anterior, sem perder precisão de prova. `H2` (mais forte e ainda não demonstrada): o sistema melhora **o próprio método de detectar, propor e verificar melhorias** ao longo de gerações, e essa melhora se transfere a missões novas; não chamar isso de RSI demonstrada sem essa contraprova longitudinal. Relacionar a literatura de *self-refinement*, *agent harness self-improvement*, *continual skill learning* e *recursive self-improvement* como referências conceituais; resultados de papers/benchmarks externos **não são resultados medidos da CentralDark**.

**CRITÉRIO POR TURNO (até 20, NÃO obrigatoriamente 20):** `INTENT_ID/LOOP_ID/TURN_ID/NEXT_CURSOR` persistidos → ação do executor Hermes original → `RECEIPT_ID` único com `HEAD/BRANCH/DIRTY`, owner, comandos, resultado e estado antes/depois → Oráculo verifica contraprova independente GitHub/Casa/testes e decide `PASS|FAIL|BLOCKED|UNKNOWN` → registrar o delta material e promover **somente** receita comprovada ao owner canônico → próximo turno apenas se ainda há critério pendente e pré-condições válidas. `FIXED_POINT` significa **todos os critérios aplicáveis satisfeitos com evidência real e nenhuma melhoria material restante**. Uma etapa `TURN_DONE` não implica `GOAL_DONE`; um `UNKNOWN` nunca vira verde. Impedir execução duplicada por `RECEIPT_ID`, manter `ONE_WRITER_PER_SCOPE`, não reiniciar Goal/Loop por rotina, preservar edição humana, não confundir resposta da UI com readback do runtime. Alterações destrutivas, publicação/deploy e mudanças fora do escopo precisam respeitar a autoridade/autorizações do CHEFE.

**MEDIR TRANSFERÊNCIA, não contar somente mensagens:** comparação `baseline → versão corrigida → teste novo/replay`, com métricas `TASK_PASS_RATE`, `REPEATED_FAILURE_RATE`, `REWORK_PER_TASK`, `RECEIPT_CORRELATION_RATE`, `DUPLICATE_ACTIONS`, `REGRESSIONS` e `NEXT_TASK_REUSE_RATE`. Registrar denominador, escopo, versão, condições e amostras comparáveis; avaliar transferibilidade em **tarefas não usadas para inventar a receita**. Se resultado, assinatura do ambiente, owner ou avaliador diferir, registrar a divergência em vez de extrapolar. **Gate de aprendizagem:** melhora observável em tarefas futuras + recibos independentes + nenhuma regressão relevante; caso contrário, apenas `CANDIDATE_IMPROVEMENT` ou `UNKNOWN`. É permitido encerrar antes do turno 20, e um bloqueio externo congela cursor sem fingir missão concluída.

**PRÓXIMO DELTA EXECUTÁVEL quando houver uma missão real:** usar a receita de ida e volta **já existente**, receber um resultado real do Hermes e seu envelope, confrontar o resultado com o Goal original e medir se uma segunda tarefa reutiliza a receita sem redescoberta. Não enviar um `oi` extra nem rodar automaticamente vinte ciclos apenas para fabricar evidência. Esta seção é **registro de intenção + contrato de medição**, não hook instalado e não promessa de execução em background.

### CRISTAL MICHELIN ⭐⭐⭐ — florescimento recursivo fiel (28/10/2026)

**Nome operacional:** `CENTRALDARK_RECURSIVE_CRYSTAL_3_STARS_V1`. **Visão idealizada, não estado alegado:** a CentralDark funciona como uma oficina que transforma a intenção humana em uma ação testada, cristaliza a melhor receita disponível e torna a **próxima missão comparável** mais fácil de cumprir. A metáfora indica etapas de engenharia, não inteligência autônoma comprovada, nem crescimento inevitável.

**SEMENTE — intenção fiel:** o CHEFE define o resultado desejado e os critérios; SOL/Oráculo formaliza `INTENT_ID`, `GOAL_ID`, limites, `NEXT_CURSOR` e o que conta como conclusão. Fidelidade = o executor **não muda o objetivo nem a regra de aprovação durante a rodada** para se declarar vencedor. Não iniciar ciclos novos só porque existe capacidade de automatizar.

**RAIZ — único sistema:** reaproveitar o Hermes original, `centraldark-oracle-surface`, `Hermes-Oracle-Return.ps1`, Skill-Mãe, Casa `K:\` e GitHub `main`. Uma mensagem do Hermes não é uma nova entidade nem prova por si; o recibo causal autentica a procedência dentro do sistema. `ONE_SYSTEM_ONLY` e `ONE_WRITER_PER_SCOPE` permanecem invariantes.

**FLOR — autocorreção observável:** por turno, executor executa → Casa/GitHub medem resultado → Oráculo confronta critérios → identifica **o menor delta material causal** → escolhe corrigir, reverter, bloquear ou concluir. Saída obrigatória: `{INTENT_ID, LOOP_ID, TURN_ID, RECEIPT_ID, NEXT_CURSOR, BASELINE_SHA, RESULT_SHA, TESTS, STATUS, BLOCKER}`; se faltar evidência, `UNKNOWN`, sem selo de sucesso e sem ação repetida às cegas. Até 20 rodadas é **teto**, não meta obrigatória.

**FRUTO — aprendizagem transferível:** a correção só ganha status `REUSABLE_RECIPE` após teste da versão nova + prova de não regressão; só ganha status `TRANSFERRED_LEARNING` se uma **tarefa futura diferente do caso de treino** reaproveitar o método e melhorar ao menos uma medida observável (menos falhas, menos retrabalho ou maior taxa de PASS) **sem piorar as demais**. Comparar contra baseline equivalente, com hashes, contexto e denominadores; publicar no owner canônico, nunca apenas no texto do chat. `PROVEN_ON_ONE_CASE != GENERALIZED`.

**ESTRELAS COMO GATES, NÃO DECORAÇÃO:** `⭐ = AÇÃO_REAL_COM_READBACK`; `⭐⭐ = CORREÇÃO_PERSISTIDA_E_TESTADA`; `⭐⭐⭐ = TRANSFERÊNCIA_MEDIDA_EM_NOVA_TAREFA_SEM_REGRESSÃO`. A prova `CD_UISEND_2810_2335` sustenta o transporte de chat e a correção persistida da receita; **não** certifica ainda a terceira estrela de aprendizagem generalizada nem um Goal de 20 turnos concluído.

**Deliberação recursiva fiel:** `OBSERVAR → DELIBERAR → AGIR → VERIFICAR → CRISTALIZAR → REUTILIZAR → COMPARAR`. Cada novo ciclo lê o último `NEXT_CURSOR` válido e reavalia a **mesma intenção do CHEFE**, em vez de imaginar um objetivo independente. Se `FIXED_POINT`, encerrar; se `BLOCKED`, registrar causa e preservar cursor; se `FAIL`, reverter ou corrigir o menor escopo; se `UNKNOWN`, coletar somente a prova necessária. Mudanças de avaliação devem ser versionadas e testadas separadamente para impedir falso verde. Imaginação propõe candidatos; **evidência decide o que floresce**.

### CRISTAL — SEMÁFORO VIVO COM DUAS PROVAS, SEM VERDE FALSO (29/10/2026)

**`STATUS_PANEL_PROOF_DIMENSIONS_V1` reutiliza o mesmo owner; não criar sensor, serviço ou painel paralelo.** Fonte executável: `apps/instinto-superior/src/components/central/StatusPanel.tsx`; origem de dados: `src/lib/cockpit.functions.ts`; teste de regressão: `scripts/verify-hud-zone.mjs` ("maquina de estados distingue rota disponível de execução comprovada sem falso verde"). **Regra:** o serviço ter `HTTP 200` com JSON válido e `status=ok` pode provar que a **rota de consulta está disponível**, mas `proof_state=NOT_REVALIDATED` mantém **execução não comprovada**. Renderizar dois fatos separados: `ROTA DISPONÍVEL` verde, `EXECUÇÃO NÃO REVALIDADA` amarelo; não alterar `grafoVivo/receipts` de `RUNNING` para `PASS` no sensor. O `Commander /health ok + engine_connected=true` mede **ponte conectada**, não comando autenticado; `Screenpipe status=degraded` mostra **SAÚDE DEGRADADA** (motivo real no corpo), não "executando" indistinto. `VPS SHA` sem leitura autenticada = `UNKNOWN` mesmo se GitHub/Casa igual, pois `MERGED != DEPLOYED`. Se consulta expirar, retirar o verde imediatamente e classificar UNKNOWN. Sem reconfigurar serviço, abrir novo coletor ou presumir execução por arquivo de recibo.

**Contraprova da Casa:** em 29/10 às 13:38 BRT, `api/live-fabric/graph` respondeu 200 com 25 nós/24 arestas e `invocation_proven=false`; `api/microdeploy/receipts/index.json` respondeu 200 com 24 itens, cada qual `NOT_REVALIDATED`; `Screenpipe 3030/health` respondeu `degraded` por áudio; `Commander 9101/health` informou `ok=true, engine_connected=true`; VPS SSH `segredo-vpss` terminou em timeout na porta 22. A correção é **clareza visual** e prova separada, não alegação de execução remota. `NODE_TSC=0`, `HUD_TEST=31 PASS / 1 TODO`, `NPM_BUILD=PASS` no checkout local; lint sem prettier preexistente CRLF passou no componente, lint completo exige política de linhas/Prettier separada. Runtime/deploy no SHA resultante devem ser lidos novamente antes de declarar implantação.

### CRISTAL DE ACEITAÇÃO — delegação Hermes para 20 rodadas de autoaperfeiçoamento (28/10/2026)

**Intenção explícita do CHEFE:** pedir ao Hermes Desktop **original**, na sessão do executor já existente, a execução de **20 rodadas progressivas de aperfeiçoamento operacional na CentralDark**, com foco nas capacidades `Self-Refinement → Reflective/Continual Learning → Recursive Self-Improvement`. **Este registro contém apenas critérios de êxito**, não cria regras, hooks, agentes, skills, Goal ou Loop. Estado observado antes da delegação: botão nativo `Goal blocked — Turn 0/20`, identificado como `GOAL_ID=CENTRALDARK_TARGET_PATH_RECONCILE_0_20`, e `Loop deferred — 113 runs`. Esse Goal existente é de **reconciliação de caminhos**; os 20 turnos solicitados de autoaperfeiçoamento **não são o mesmo objetivo por identidade presumida**. Não substituir silenciosamente uma intenção pela outra.

**Critérios de êxito a entregar pelo Hermes:** (1) `20` rodadas identificáveis ou `FIXED_POINT/BLOCKED` real explicado antes do limite; (2) em cada rodada, `TURN_ID`, causa/resultado, `RECEIPT_ID` autêntico e `NEXT_CURSOR` correlacionados ao executor; (3) `BASELINE → DELTA → TESTE → READBACK` observáveis, não apenas uma resposta textual; (4) `PASS/FAIL/BLOCKED/UNKNOWN` compatível com evidências da Casa e HEAD GitHub; (5) nenhuma regressão relevante nas funções já comprovadas; (6) melhora mensurável no retrabalho, frequência de falhas ou taxa de sucesso; (7) receita corrigida reutilizada em uma **tarefa nova**, sem redescoberta; (8) demonstrar, se houver prova, a evolução do próprio método de verificar e melhorar as receitas, caso contrário classificar `RSI_NOT_PROVEN`; (9) contagem de uso de skill em **ativação nativa** separada de **execução terminal**, sem falsos PASS; (10) relatório final com `RODADAS_REALIZADAS/20`, `GIT_HEAD`, evidências, melhorias preservadas, bloqueios, ganhos medidos e `NEXT_CURSOR`. **Uma rodada sem evidência não vira rodada aprovada.** A delegação deve ser visível na timeline do Hermes; este registro isolado não equivale a despacho ou a vinte execuções.

**Recibo da tentativa de delegação na UI nativa (mesma sessão, sem novo Goal):** `INTENT_REF=CD_RSI20_20261028_2322` composto no `Edit 'Mensagem'` do `Hermes.exe PID 31664`, com readback exato `1802` caracteres. Após sincronização do estado do editor, o botão **`Enfileirar mensagem`** ficou habilitado; `InvokePattern.Invoke()` executado **uma vez** e editor ficou vazio. A interface mostrou `1 Queued`; ao abrir a fila, o item que ficou visível era um tick do **Goal original de reconciliação de caminhos**, enquanto o Goal original avançou para `Turn 5/20`. O marcador da delegação **não foi visto ainda** no histórico nem no cartão atual da fila. **Veredito fiel:** `QUEUE_BUTTON_INVOKED=PROVEN`, `DRAFT_CLEARED=PROVEN`, `QUEUE_NONEMPTY=PROVEN`, `RSI_MESSAGE_RECEIVED_BY_EXECUTOR=UNCONFIRMED`, `RSI_20_TURNS=NOT_PROVEN`. A fila já existente foi preservada, sem repetição ou interrupção do Goal corrente.

### RECEITA DE RECUPERAÇÃO E REUTILIZAÇÃO DO GOAL NATIVO (29/10/2026) — `GOAL_RECOVERY_RECONCILE_REPLACE_V1`

**Descoberta reusável, SEM mecanismo novo:** o Hermes original mantém o Goal na mesma sessão de desktop por `GoalManager`/`SessionDB` (`state_meta['goal:<session_id>']`). O comando **`/goal clear`** limpa **somente** o Goal, não exige apagar o histórico da sessão nem criar agente/Loop/worktree. **`/goal <objetivo>`** na mesma sessão define novo Goal com `max_turns=20` por padrão e admite contrato nativo com linhas `outcome:`, `verification:`, `stop when:`. `/goal show` e `/goal status` dão readback no owner. **Não chamar `/goal resume` como substituição de objetivo**: no Hermes instalado, `GoalManager.resume(reset_budget=True)` também redefine `turns_used=0`. Fazer `resume` sem necessidade pode perder o progresso do orçamento; primeiro usar `/goal show` ou `/goal status` e agir no Goal original somente quando a intenção atual justificar. A alteração de um Goal vigente usa autorização explícita do CHEFE; **a autorização de 29/10/2026 para substituir este Goal já foi concedida e utilizada**, não reclamar permissão nova retroativamente.

**Problema medido que motivou a receita:** sessão `20260920_235705_013b82`, Hermes Desktop original, tinha `GOAL_ID=CENTRALDARK_TARGET_PATH_RECONCILE_0_20`, `paused 6/20`, `7 subgoals`, causa declarada `scope conflict; CHEFE must resolve/archive the blocked goal and issue a new RSI Goal ID`. A fonte de verdade mostra que `E:\CentralDark` existe como **diretório, mas NÃO é checkout Git**; `K:\` é repo Git na `main`. Não confundir TARGET_PATH histórico de uma missão com raiz Git atual ou inventar conflito entre Goal e permissão. O old Goal foi auditado em `/goal show` e no `state.db` em modo **readonly**, depois `/goal clear` foi executado uma vez no owner da **mesma sessão**; stdout `✓ Objetivo removido.`, readback `status=cleared, turns=6/20`.

**Replay da receita pela interface nativa do Hermes (substituir somente depois de medir o Goal e quando a intenção do CHEFE autorizar):**

```powershell
$sid = '20260920_235705_013b82' # Substituir pelo session_id real do Goal a recuperar
hermes chat --resume $sid --query '/goal show' --oneshot --quiet
# Reconciliar GOAL_ID, status, turns, subgoals, NEXT_CURSOR, HEAD, owner e caminhos antes da mutacao.
# Com a autorizacao expressa vigente para trocar o Goal:
hermes chat --resume $sid --query '/goal clear' --oneshot --quiet
$q = @'
/goal GOAL_ID=CENTRALDARK_RSI_SELF_IMPROVEMENT_20_20261029 | CHEFE | HERMES_DESKTOP_ORIGINAL | RUMO=20 rodadas mensuradas de aperfeicoamento na CentralDark a partir de CURRENT e do cursor real.
outcome: Melhorar execucao, receitas e avaliacao em ate 20 rodadas; terminar com fixed point demonstrado ou bloqueio real documentado.
verification: Para cada rodada verificar baseline, delta, testes, RECEIPT_ID, NEXT_CURSOR e HEAD; medir transferencia da receita em tarefa nova, sem regressao; classificar RSI_NOT_PROVEN se a melhoria do metodo nao tiver evidencias.
stop when: Bloqueio real provado, falta de evidencia critica, ou fixed point verificavel; apresentar NEXT_CURSOR sem falso PASS.
'@
hermes chat --resume $sid --query $q --oneshot --quiet
hermes chat --resume $sid --query '/goal show' --oneshot --quiet
```

**Aplicação real e resultado:** em `29/10/2026`, após autorização do CHEFE, a CLI do Hermes original confirmou `Objetivo definido (orçamento de 20 turnos)` com **GoalID `CENTRALDARK_RSI_SELF_IMPROVEMENT_20_20261029`** e contrato **C01–C10** completo (a instalação real incluiu os dez critérios detalhados, mais extensos que o exemplo acima). O `state.db` em leitura confirmou `status=active`, `turns_used=0`, `max_turns=20`, `subgoals=0` e `contract.verification` preenchido. **`GOAL_REPLACED_BY_OWNER=PROVEN`; `GOAL_RSI_20_ROUNDS_EXECUTED=NOT_PROVEN`.** O Loop existente não foi alterado; a receita não cria novos mecanismos ou regras. Em recuperação futura, usar GoalID e critérios **correntes** da intenção do CHEFE, nunca copiar cegamente o ID/data do exemplo e nunca reiniciar um Goal vivo sem autorização.

## #OBSERVACOES# — Supabase Realtime: usos reais de skills no Cockpit (28/10/2026)

**Owner único / não duplicar:** reutilizar o Supabase **CentralDark** já conectado e a tabela **`public.agent_events`** existente (publicação `supabase_realtime`, RLS com `has_role(auth.uid(),'admin')` para leitura). Não criar segunda tabela/coleção ou expor `service_role` no frontend. A Edge Function original `agent-log` é o único ponto de ingestão: exige `X-Agent-Secret` obtido do ambiente confiável do executor, nunca do navegador, repositório ou chat.

**Contrato explícito da invocação (não confundir catálogo / skill carregada / benchmark com uso):** após uma skill realmente executada e comprovada pelo owner, o recibo JSON deve conter `event_type=skill_invocation`, `verified=true`, `skill_id`, `receipt_id` único, `source` (`HermesDesktop` ou outro owner atestado), `outcome=PASS|FAIL|BLOCKED|UNKNOWN` e opcional `run_id`/`proof_sha`. Emitir uma única vez com o script canônico [Publish-SkillUsageReceipt.ps1](scripts/Publish-SkillUsageReceipt.ps1) e `-ReceiptPath '<RECIBO_REAL_VALIDADO>'`, somente após a execução. Publica `agent=HERMES, area=skill-usage, acao=skill_invocation, metadata={verified,skill_id,receipt_id,outcome,source,...}` na **mesma** `agent_events` através do `agent-log`. Se a credencial, o recibo ou o ACK faltarem, registrar `BLOCKED`, sem inventar evento. Esse emissor exige conexão e credencial configuradas no runtime Hermes, não altera a sessão do Goal nem envia mensagens ao Oráculo.

**Cockpit:** `Sistema → Infraestrutura → Gaveta · Skills · Plugins → Telemetria de foco, delegação e retorno → Uso real de skills · Supabase Realtime`. O componente existente `FocusTelemetryPanel` incorpora `SkillUsageRealtimePanel`, que consulta **somente** invocações autenticadas com recibo e escuta `INSERT` em `agent_events` pelo canal Supabase Realtime, reconsultando com RLS admin + reconciliação a cada 60s. Conta por `skill_id`, deduplica `receipt_id`, separa `PASS/FAIL/BLOCKED/UNKNOWN`; se a janela de 1.000 eventos for atingida, indica `PARTIAL` e não declara total global. `STREAM_ON` = WebSocket conectado, **não** comprova eventos. `0` significa nenhum **evento de invocação instrumentado**, não que a skill nunca foi usada. Telemetria do benchmark UIA permanece outra fonte.

**Prova medida na implantação:** `agent_events` e publicação Realtime já existentes, política admin e Edge Function `agent-log` inspecionadas; suite local de agregação **4/4 PASS**, TypeScript **0 erros nos novos arquivos** (94 erros anteriores fora do escopo), publisher PowerShell parser 0 erros e teste de recibo inexistente bloqueado com RC=2. **AGENT_LOG_SECRET não estava configurado na sessão de comando Windows**: não há comprovante de ingestão ponta a ponta nem histórico total de skills ainda; nenhuma execução foi inventada ou inserida como teste. Critério de fechamento futuro: evento **real** do executor → `agent-log` ACK → `agent_events` persiste → Realtime `SUBSCRIBED` entrega e painel atualiza o contador por receipt, sem recarga manual.

**REVISÃO TÉCNICA — NATIVE SKILL LIFECYCLE × CONTADOR SUPABASE (28/10/2026):** auditado no Hermes Agent instalado `v0.22.5+2285.g1994978`, arquivo original `tools/skill_usage.py`: `bump_use()` emite `on_skill_lifecycle(action='loaded')` **após** persistir `use_count`, representando **skill presente no caminho ativo de prompt/turno**, NÃO execução terminal de tarefa. Os campos `session_id` e `task_id` são opcionais e podem vir `''`: reparado o adaptador [Hermes-SkillLifecycle-Bridge.py](scripts/Hermes-SkillLifecycle-Bridge.py) para não rejeitar eventos legítimos e produzir `receipt_id` determinístico mesmo quando ausentes. O adaptador só admite `action=loaded` com `skill_name` e `use_count>0`; exige segredo do executor confiável, ignora outros eventos e não transmite texto de conversa. `SkillUsageRealtimePanel` + `skill-usage-realtime.ts` agora separam os dois contratos da **mesma tabela existente** `agent_events`: `skill_loaded` → `ACTIVATIONS`; `skill_invocation` com recibo terminal → `EXECUTIONS` e `PASS/FAIL/BLOCKED/UNKNOWN`. Deduplicação por `receipt_id`, sem converter ativação em PASS. Prova offline: testes Node **8/8 PASS**, Python adaptador **5/5 PASS**, ESLint nos dois arquivos de UI **0 erros**; nenhuma linha de teste foi inserida no Supabase.

**LIMITE REAL DESTA REVISÃO:** `hermes hooks list` na sessão Windows continua informando **nenhum shell hook/webhook configurado**; `AGENT_LOG_SECRET` não foi provado disponível no ambiente de execução Hermes; `NATIVE_HOOK_REGISTERED=NO`, `AGENT_LOG_ACK=NOT_PROVEN`, `SKILL_ACTIVATIONS_LIVE=NOT_PROVEN`, `SKILL_TERMINAL_RECEIPTS_LIVE=NOT_PROVEN`. O Hermes exige **aprovação explícita do hook** no perfil correto, com allowlist por evento/comando; não ativar `hooks_auto_accept`, não escrever segredo em `K:\` nem modificar `C:\Users\...\.hermes\config.yaml` automaticamente. O próximo gate genuíno é `hook approved → native action loaded → edge function ACK → SELECT em agent_events → subscriber SUBSCRIBED com atualização na UI`. Até lá a tela foi corrigida e testada, mas **automação E2E continua bloqueada**. `UNKNOWN_IS_NOT_PASS`.

### CRISTAL NATIVO — Goal criterion, clique, persistência e expansão visual (29/10/2026)

**Receita reutilizável `HERMES_GOAL_CRITERION_NATIVE_UIA_V1`:** na MESMA janela original `Hermes.exe` e no Goal correto, CHEFE/SOL colaboram sem criar outro Goal, agente, aba ou script. O CHEFE abriu o primeiro diálogo e mostrou os controles em screenshots; SOL observou e preencheu `Edit 'Criterion'` por `ValuePattern.SetValue` com readback exato. Após autorização do CHEFE para concluir, SOL abriu `Button 'Goal actions'` via `ExpandCollapsePattern.Expand`, escolheu `MenuItem 'Add criterion'` por `InvokePattern.Invoke`, conferiu `Window 'Add criterion'` e texto atual, e acionou **`Button 'Add'.InvokePattern.Invoke uma única vez`**. `Add` chama o **método nativo `subgoal.add`**, não uma automação paralela. Código oficial conferido por `gh`: [NousResearch/hermes-agent — session-control-goal.tsx](https://github.com/NousResearch/hermes-agent/blob/main/apps/desktop/src/app/chat/composer/status-stack/session-control-goal.tsx) e [session-control.ts](https://github.com/NousResearch/hermes-agent/blob/main/apps/desktop/src/store/session-control.ts).

**Dupla contraprova:** a consulta **readonly** a `SessionDB/state_meta['goal:20260920_235705_013b82']` confirmou `GOAL_ID=CENTRALDARK_RSI_SELF_IMPROVEMENT_20_20261029`, `active`, `0/20`, `subgoals=1`, critério com **938 caracteres**, SHA-256 `2904861a3014a08c214883f6fd10afa2562db72d2d77935a9d438e714adbf44a`. Após o CHEFE indicar a rota de expansão, SOL fez **readback visual real**: sob `Goal active · Turn 0/20` estão `Criteria · 1`, o texto `CRITERIO - COMUNICACAO SOL <-> HERMES POR RODADA`, `Copy criterion 1` e `Remove criterion 1`. Esse é o caminho **visual de confirmação**, além do recibo interno; não clicar em Remove para verificar.

**Sequência reproduzível:** `Goal active` (expandir status, se recolhido) → `Goal actions` → `Add criterion` → `Criterion` → readback exato → `Add` uma vez → `Goal active` expandido → `Criteria · N` e texto visível → `SessionDB` somente leitura com mesmo conteúdo e orçamento preservado. Usar o controle visual para inspeção, não confundir `View details` com adicionar. Menus/diálogos temporários podem sumir entre chamadas e exigem reabrir e verificar novamente. **Correção de falha medida:** `DIALOG_COUNT=0`/ `MENU_ITEM_COUNT=0` entre ações não significa ausência de recurso; a rota aprovada foi feita **na mesma operação UIA**, com espera curta pela presença real de menu, editor e botão, preservando qualquer texto preexistente. Se o diálogo desaparecer depois de potencial clique, **consultar `subgoals` antes de tentar novo envio**, evitando duplicatas.

**Escopo/prova:** `CRITERION_UI_ADDED=PASS`, `CRITERION_PERSISTED=PASS`, `CRITERION_VISUAL_READBACK=PASS`, `GOAL_RESET=NO`. Adicionar o critério **não prova** execução automática das 20 rodadas nem retorno terminal Hermes→mesma conversa; `RSI_20_ROUNDS_DONE=NOT_PROVEN`. A receita não autoriza limpar Goal, remover critério ou sobrescrever edição do CHEFE.

### DÍVIDA CORRIGIDA — circuito operacional Hermes ⇄ Oráculo (29/10/2026)

**Exigência atual do CHEFE:** o Goal de RSI não será medido somente por 20 execuções internas do Hermes. **Por rodada material**, SOL deve poder entregar o próximo comando ao **mesmo Hermes original**, e o Hermes deve devolver **um resultado de execução real, com `LOOP_ID/TURN_ID/RECEIPT_ID/NEXT_CURSOR` correlacionados, nesta EXATA conversa ChatGPT já aberta**. SOL analisa a evidência e propõe o delta seguinte. **A ida e a volta são parte do critério, não detalhes opcionais.** Não inventar URL do chat, evento terminal, recibo ou autorização: a URL é lida exclusivamente da UI real em runtime; `ACTOR=HERMES` em texto sozinho não autentica origem. Executar as ações pelo Hermes e transportador **já existentes**, não por novo script, scheduler, perfil, browser ou agente.

**Skill Oráculo operacional atualizada:** a fonte `K:\.agents\skills\software-development\centraldark-oracle-surface\SKILL.md` e o espelho `catalogo/skills-integradas/centraldark-oracle-surface/SKILL.md` agora incluem a seção **Operational RSI circuit — reuse the PROVEN Hermes Desktop UI recipe**. Rota **SOL→Hermes**: `Edit 'Mensagem'` do Hermes Desktop + `ValuePattern.SetValue` + readback + envio nativo (ou fila nativa com recibo de aceitação, sem confundir `1 Queued` com tarefa recebida). Rota **Hermes→SOL**: o Hermes real produz envelope terminal → mesmo `scripts/Hermes-Oracle-Return.ps1` (`HermesEmbedded`, `Mode Send`) escreve via `Edit 'Pergunte ao ChatGPT'`, `SetValue`, readback, `Button 'Enviar'.InvokePattern.Invoke` **uma única vez** → recibo visível na conversa correta → SOL confronta runtime/Casa/`gh` e determina próximo delta. Não reexecutar `TEST_ID=CD_UISEND_2810_2335` nem reabrir foco/aba; o piloto histórico provou transporte SOL, **não** o retorno de um Goal terminal do Hermes. `Hermes-Oracle-Return.ps1` é transportador de um disparo, não callback configurado. Sem recibo verdadeiro e evento efetivo, `HERMES_TO_SOL_AUTOMATIC_LOOP=UNKNOWN` e `20_ROUNDS_COMPLETED=FALSE`. A integração precisa de **um turno real** com ida, volta, readback e next cursor antes de expandir.

**Prova GitHub por ferramenta do CHEFE:** para inspeção de main, origem dos commits e arquivos, preferir `gh` nativo na Casa (ex.: `gh api repos/ServerVpss/CentralDark/commits/main --jq '.sha'`) e Git local `git -C K:\ ...`. `gh` confirmou o commit `4340a4902e2a` com os quatro arquivos da receita direta e a paridade entre `K:\` e `main`. Não transformar inspeção de código ou a existência do script em prova E2E.

## #OBSERVACOES# — Retorno Hermes Desktop → Oráculo na MESMA conversa ChatGPT (28/10/2026)

**Owner único:** esta Skill-Mãe, reutilizando o [Oracle Surface existente](catalogo/skills-integradas/centraldark-oracle-surface/SKILL.md), o executor Hermes original e a referência [Focus/UIAutomation](references/FOCUS-DELEGACAO-TELEMETRIA.md). **Transportador operacional da Casa:** [Hermes-Oracle-Return.ps1](scripts/Hermes-Oracle-Return.ps1). Este é um **adaptador de interface de execução única**, não outra skill, modelo, agente, scheduler, cérebro, browser, serviço ou prova de Goal. CHAT_GLOBAL é a mesma aba aberta https://chatgpt.com/c/<conversation-id> identificada por URL exata, **não** outra janela ChatGPT com nome parecido. A URL/ID são bindings temporários da sessão; **não gravá-los no Git, scripts ou recibos versionados**.

**Intenção:** CHEFE → SOL → HERMES DESKTOP → EXECUÇÃO → RESULTADO/RECIBO → MESMA CONVERSA CHATGPT/ORÁCULO → SOL. O sentido SOL→Hermes já teve ensaio real de rascunho "oi" sem envio e com readback DRAFT_ONLY=true; o sentido Hermes→Oráculo exige **um** evento de saída material realmente terminado por turno (DONE, COMPLETED, TURN_DONE, STEP_DONE, BLOCKED ou FAILED), **sem declarar o Goal pai concluído por terminar uma etapa**. Invocar o transportador uma vez quando o **executor Hermes já existente** produzir esse evento: não instalar polling, não criar Goal, não recomeçar loop e não pedir que CHEFE copie a resposta. A ligação a um evento nativo de conclusão do Hermes **não é considerada comprovada** só pela existência do script ou desta regra.

**Envelope exigido (JSON UTF-8 lido do arquivo de resultado existente da execução):** actor=HERMES, loop_id, turn_id, receipt_id, parent_id, intent_id, event_id, causation_id, surface_id, attempt_id, next_cursor, status, message. Correlacionar com o recibo/Goal no owner Hermes antes de chamar; a string actor=HERMES sozinha **não autentica o produtor**. Não incluir segredos, tokens ou mensagem privada não pertinente; payload maior que o limite exige síntese pelo mesmo executor.

### Receita operacional JÁ PRONTA — mesmo chat Hermes Desktop → Oráculo (28/10/2026)

**Gatilho de uso:** resultado real do executor Hermes já disponível no seu arquivo JSON com os 13 campos exigidos, e a conversa ChatGPT original **já aberta no Hermes Desktop**. Um resultado de etapa `TURN_DONE` não implica Goal concluído. A rota de transporte `ValuePattern.SetValue + Button 'Enviar'.InvokePattern` tem prova **real nesta mesma conversa** (`CD_UISEND_2810_2335`, operador SOL). **Reutilizar**, não reconstruir, não pedir novo ensaio para redescobrir, não criar skill, janela, aba, agente ou link.

```powershell
# Bindings de runtime SOMENTE: nunca versionar URL privada ou JSON de sessão.
$transport = 'K:\.agents\skills\centraldark-operational-method\scripts\Hermes-Oracle-Return.ps1'
$chatAtual = '<URL_EXATA_DA_CONVERSA_JA_ABERTA_NO_HERMES>'
$reciboReal = '<CAMINHO_ABSOLUTO_DO_JSON_REAL_PRODUZIDO_PELO_HERMES>'
# Leitura sem efeito; exige URL correta, compositor único, estado de resposta.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $transport -Mode Inspect -TargetSurface HermesEmbedded -ConversationUrl $chatAtual
# Uma execução POR RECIBO TERMINAL verdadeiro. NUNCA enviar recibo simulado.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File $transport -Mode Send -TargetSurface HermesEmbedded -ConversationUrl $chatAtual -PayloadPath $reciboReal
```

**RECEITA DE AÇÃO:** localizar `Hermes.exe` → comparar URL exata do `Document` ChatGPT e `Edit 'Address'` do mesmo painel → confirmar editor `Pergunte ao ChatGPT` vazio e ausência de `Parar` → verificar `RECEIPT_ID` ainda não visível → `ValuePattern.SetValue` no editor **sem foco** → confirmar texto por readback → `Button 'Enviar'.InvokePattern.Invoke()` **uma única vez** → confirmar editor vazio e `RECEIPT_ID` no texto/botão da mesma conversa; se readback atrasar, **consultar novamente**, nunca reenviar cegamente. `SENT_WITH_UI_READBACK/RC=0` = entrega comprovada; `SEND_UNCONFIRMED.../RC=3` = envio feito sem prova tardia, bloquear reenvio; `BLOCKED/RC=2` = sem prova de ação segura. Não usar `SetFocus`, `SendKeys`, `Ctrl+T`, `Enter`, browser novo ou hook para esta ação pontual. A identidade declarada `ACTOR=HERMES` só é considerada original depois de conferir recibo/execução no owner Hermes (não basta o prefixo). O `post_llm_call` **não é necessário para executar o comando acima**; só para ligar o disparo automático após cada fim de turno, que continua outra capacidade, sem falso verde.

**Inspeção sem ação:** powershell.exe -NoProfile -File K:\.agents\skills\centraldark-operational-method\scripts\Hermes-Oracle-Return.ps1 -ConversationUrl '<URL_ATUAL_DO_CHAT>' -Mode Inspect. **Retorno real autorizado após conclusão:** mesmo script com -Mode Send -PayloadPath '<ARQUIVO_RESULTADO_HERMES>.json'; se a aba não estiver ativa, informar também -ActivateExistingTab -TabTitle '<TITULO_DA_ABA_EXISTENTE>'. -Mode Draft faz apenas ensaio **sem enviar**, somente quando o editor estiver vazio. Nunca usar teclas em uma janela não validada. Ao enviar pela UI do Hermes ou Edge autorizado: identificar **a conversa exata**, verificar o editor "Pergunte ao ChatGPT", confirmar que não existe rascunho humano nem resposta em andamento, checar recibo duplicado, escrever diretamente com **UIAutomation.ValuePattern.SetValue** (sem SetFocus, SendKeys ou Ctrl+T), reler o valor, localizar o botão **"Enviar"** e invocá-lo uma única vez via **UIAutomation.InvokePattern**, e procurar RECEIPT_ID/TEST_ID na conversa após o editor esvaziar. Jamais confundir "Parar" com "Enviar". Se o envio não for confirmado, **não repetir cegamente**. C:\ pode hospedar binários/perfil Windows, mas a receita canônica fica somente em K:\.

**ATALHO CANÔNICO JÁ EXISTENTE — ORÁCULO NATIVO PRIMEIRO:** a skill [centraldark-oracle-surface](catalogo/skills-integradas/centraldark-oracle-surface/SKILL.md) registra o piloto e replay históricos do próprio Hermes Desktop Preview (08/10; commits `f69597e220cb`, `c444f7761bbf`, `037ee28c13be`, `04d569a4eddb`). Para uma pergunta na **mesma conversa já aberta**, consultar os bindings realmente disponíveis na sessão Hermes: `desktop_preview read` e `drive_preview elements` **sobre essa aba** → compor consulta pelo `scripts/trigger-fabric/oracle_evidence_hook.py --mode query` com IDs verdadeiros → um envio por ref semântico → `desktop_preview read` da resposta → envelope `--mode evidence` → confrontar CURRENT/GitHub/Casa. O script `oracle_evidence_hook.py` **formata** pergunta/recibo, não clica nem envia. `desktop_preview open`/`browser_exec` separado não devem substituir a conversa aberta; o piloto antigo não comprova disponibilidade dessas tools em toda sessão atual. Se o Preview nativo não existir para essa aba no runtime, reutilizar **a mesma** ponte `Hermes-Oracle-Return.ps1` via UIAutomation, sem acrescentar engine. O bloqueio `FOCUS_OR_TARGET_CHANGED_BEFORE_TYPING` no teste `CD_ORACLE_C3E5FCF_2810` é **falha da rota UIAutomation**, não falha do Oráculo: mensagem não enviada, `LOOP_ID/TURN_ID/RECEIPT_ID=UNKNOWN` preservados. Não repetir o mesmo focus sem novo binding medido, não trocar de chat e não exigir hook `post_llm_call` para **consulta direta**. Hook só serve ao disparo automático futuro por conclusão de turno.

**NOVO FIX POINT — escrita e envio DIRETOS na UI do Hermes (28/10/2026):** CHEFE pediu teste `self correction`; SOL operou o ChatGPT **já aberto dentro de Hermes.exe PID=31664** na URL exata autorizada, usando o `Edit 'Pergunte ao ChatGPT'` existente. **Ação real**: `ValuePattern.SetValue` com `TEST_ID=CD_UISEND_2810_2335` e `ACTOR=SOL_OPERATOR`, seguida de leitura independente confirmando 204 caracteres no compositor; o botão real `Enviar` apareceu e suportou `InvokePattern`; `Invoke()` executou uma única vez e o editor foi esvaziado. **Readback independente posterior:** o `ControlType.Text` na conversa correta mostrou o marcador e a mensagem chegou como nova mensagem **nesta mesma conversa**. O primeiro polling local deu `SEND_ATTEMPTED_READBACK_UNCONFIRMED` por latência de renderização; **isso não desfaz a prova posterior**. O caminho de foco anterior `FOCUS_OR_TARGET_CHANGED_BEFORE_TYPING` é **superado para esta superfície** por `SetValue + Invoke`: `DIRECT_UIA_WRITE_AND_SEND=PROVEN_AND_USABLE`, `SAME_CONVERSATION_DELIVERY=PROVEN_FOR_SOL_PROBE`. **Não confundir:** `ACTOR=SOL_OPERATOR` é teste de transporte iniciado por SOL, **não** prova de resultado real `ACTOR=HERMES` com `LOOP_ID/TURN_ID/RECEIPT_ID`; `HERMES_AUTO_RETURN_AFTER_GOAL=NOT_PROVEN` e `post_llm_call=NOT_CONFIGURED`. Esta nova prova foi incorporada ao **mesmo** `Hermes-Oracle-Return.ps1`, sem segunda skill/script, sem teclado/foco/aba nova e sem reenviar o teste. `ONE_SEND` → readback tardio → **não repetir**.

**Duas superfícies para o MESMO Oráculo (28/10/2026):** o transportador existente `Hermes-Oracle-Return.ps1` agora aceita `-TargetSurface Auto|HermesEmbedded|ExternalBrowser`. `Auto` prioriza **o ChatGPT já aberto DENTRO do processo Hermes.exe**, identificado pelo `Document` com URL da conversa exata + `Edit 'Address'` do mesmo painel + `Edit 'Pergunte ao ChatGPT'` descendente do documento; se não estiver disponível, reutiliza o Edge/Chrome autorizado já aberto, **sem abrir abas/links**. `-Mode Inspect` não foca nem escreve; `-Mode Draft` não envia; `-Mode Send` exige envelope terminal originado e correlacionado pelo Hermes e somente um envio. Estado medido na Casa: `HermesEmbedded=OBSERVED` (mesmo PID Hermes, URL e editor exatos, rascunho vazio, porém `CHAT_BUSY=true`); `ExternalBrowser=OBSERVED` (mesma URL, editor detectado, sem envio). `HERMES_EMBEDDED_SEND_FROM_SOL_PROBE=PROVEN` pelo marcador `CD_UISEND_2810_2335`; `HERMES_ORIGINAL_TERMINAL_RECEIPT_RETURN=NOT_YET_PROVEN` até retorno de evento real. **Não** classificar `Parar` do chat do executor como `Parar` da resposta do Oráculo: avaliar controles apenas no `Document` da conversa correta. Se a aba tiver mudado, estiver ocupada, houver rascunho do CHEFE ou prova de origem insuficiente, bloquear, não procurar outra conversa.

**Identidade de ida e volta:** quando o CHEFE pede `SOL → Hermes → Oráculo → SOL`, preservar a sessão/Goal do Hermes, transmitir a tarefa somente ao editor `Mensagem` do executor real e conferir a execução. No retorno, incluir o prefixo inequívoco `HERMES -> ORACULO` com `ACTOR=HERMES`, `LOOP_ID`, `TURN_ID`, `RECEIPT_ID`, `INTENT_ID`, `STATUS` e `NEXT_CURSOR`. São **dados de origem declarada**, não uma identidade autenticada pelo ChatGPT: o Oráculo confronta cada marcador com recibo/execução reais da Casa antes de tratá-lo como evento Hermes. Uma mensagem do CHEFE não ganha esse selo por conter texto semelhante. Se a plataforma apresenta os dois como mensagens do usuário, não inventar um novo papel de autor; a proveniência é o recibo + leitura independente da origem. Uma etapa concluída não encerra o Goal pai; o Oráculo só propõe o próximo delta depois da contraprova no Git/Casa e **não se autopromove a loop autônomo permanente**. A ativação de `post_llm_call` ainda depende do runtime e do consentimento do Hermes; receita `!=` hook configurado.

**Critério Michelin:** TARGET_EXACT + HERMES_RECEIPT_CORRELATED + COMPOSER_EMPTY + ONE_SEND + ORACLE_READBACK → REVERSE_HANDOFF_PROVEN. SURFACE_PROVEN_READONLY != DRAFT_PROVEN_NO_SEND != SENT_WITH_UI_READBACK != ORACLE_RESPONSE_CORRELATED. Bloquear em CHAT_BUSY, WRONG_TAB, EXISTING_USER_DRAFT, ENVELOPE_NOT_TERMINAL, DUPLICATE e UNKNOWN; preservar LOOP_ID, NEXT_CURSOR, foco e dados do CHEFE. **Estado observado nesta implantação:** editor da conversa exata identificado; escrita e envio SOL→ChatGPT embutido via UIA direta (`SetValue + InvokePattern`) e recebimento nesta conversa **comprovados**; retorno de recibo terminal produzido pelo executor original Hermes, gatilho nativo pós-execução e ciclo autônomo Oráculo→Hermes ainda requerem teste E2E específico.

**Recibo de delegação SOL → Hermes — prova única 28/10/2026:** no Hermes Desktop original, o editor UIA `Mensagem` foi localizado vazio, recebeu a tarefa de retorno ao Oráculo com marcador `CD_ORACLE_C3E5FCF_2810` e teve readback de **1.080 caracteres**. O envio por `Enter` limpou o editor, e a leitura posterior localizou a mensagem efetiva na timeline do executor Hermes (primeiros termos: `CHEFE autorizou agora UMA PROVA REAL`). O Hermes iniciou ferramentas e inspeções do script nativo `Hermes-Oracle-Return.ps1`; o painel ChatGPT embutido ainda apresentava `CHAT_BUSY=true`, e **o marcador não estava visível** no documento ChatGPT na última medição. Veredito estrito: `SOL_TO_HERMES_COMMAND_DISPATCH=PROVEN`; `HERMES_TO_ORACLE_RECEIPT_DELIVERY=NOT_YET_PROVEN`; `ONE_SHOT_TEST=IN_PROGRESS_OR_BLOCKED_BY_BUSY`. Não repetir blindamente o envio nem declarar um loop E2E concluído; preservar Goal e Loop originais.

**Hook nativo realmente encontrado na Casa:** a instalação Hermes possui `hermes hooks` e o evento shell `post_llm_call` no Desktop, cujo `extra.assistant_response` contém a resposta final do turno; `on_session_end` não fornece o corpo da resposta. `hermes hooks list` na Casa em 28/10 retornou **"No shell hooks or outbound webhooks configured"**. Assim `HERMES_ORACLE_POST_TURN_HOOK=NOT_CONFIGURED`, sem falso verde. A configuração de shell hook é um **opt-in no perfil Hermes** e usa consentimento de primeira execução; **não habilitar `hooks_auto_accept`, não mudar perfil C:\ nem reiniciar o Goal silenciosamente**. Próximo delta real: correlacionar o evento Hermes com o envelope existente, prender o URL da conversa atual de forma privada e autorizar/validar o hook `post_llm_call` no runtime antes de declarar retorno automático E2E.

<!-- FIX_POINT_7_CANONICAL_REFS_V1 -->
## 🔒 CABEÇALHO OBRIGATÓRIO — FIX POINT

Gatilho único: **!CENTRALDARK** (alias **#CENTRALDARK**). O dono do ciclo é
**docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml**,
seção **fix_point_reference_pack**. Essa tag indexa as **sete fontes canônicas**
sem obrigar o CHEFE a repetir sete links em cada missão. O boot existente
**scripts/trigger-fabric/centraldark_full_trigger_boot.py** lê e verifica
hashes dos sete arquivos; depois consulta o conteúdo pertinente ao objetivo.
Não executa cegamente todas as fases e não confunde presença de arquivo com
compreensão ou prova de runtime.

HUD compacto do ciclo ativo: **🪬 CENTRALDARK — !MICHELIN ⭐⭐⭐**.
As estrelas desse título são **identidade visual, não estrelas conquistadas**.
Michelin de fato = avaliação pelo owner **RULES.md**, com receipts e mesmo SHA.
FIXED_POINT = verificação pelo owner **scripts/lupa/horn-reuse-fixed-point.mjs**,
não pelo cabeçalho. Exibir no HUD: INTENÇÃO, FASE, NÍVEL APENAS COM FONTE,
XP SOMENTE COM RECEIPT, LAST_PASS, NEXT_CURSOR e VEREDITO medido.
Status desconhecido = UNKNOWN; sem conexão com o repositório, informar fonte
indisponível e nunca afirmar carregamento automático.

Atualização deste ponteiro: **2026-10-26T21:05:02Z**. Sem segundo router, HUD ou scheduler.
<!-- /FIX_POINT_7_CANONICAL_REFS_V1 -->


<!-- CENTRALDARK_LIVE_CONNECTION_CIRCUIT_20261026 -->
## 🪬 CentralDark — Circuito Vivo e Skill Mãe (26/10/2026)

**Contrato e receitas:** [CentralDark: Circuito Vivo, Conexões e Realtime](../../../docs/ARQUITETURA/CENTRALDARK-CIRCUITO-VIVO-CONEXOES-20261026.md).
Este contrato vale para Claude, GPT/Codex, Gemini, Hermes e todos os agentes que trabalham na CentralDark. **README é o índice humano; LEIA-ME-IA é a entrada técnica existente; AGENTS, CLAUDE e a Skill Mãe apontam para o mesmo contrato sem duplicar arquitetura.** Documentos detalhados permanecem bibliotecas rastreáveis.

- Ordem de validação: **Cockpit → GitHub main → Casa/VPS → Supabase/Edge/API → retorno ao Cockpit**, com recibo e SHA.
- API de cada conector mantém owner, autenticação, destino, rota e inventário. **Screenpipe nativo na porta 3030**, Cockpit Casa na 8080; rota de produto api/screenpipe é alvo até implantação autenticada e prova.
- **Realtime** só representa evento realmente emitido. Novo **Feed Vivo** está no Sync Center, lendo os ledgers existentes agent_events e hub_mission_events (com RLS), sem promover conexão WebSocket a execução concluída.
- **SSH bidirecional** é testado por ida e volta; VM nova segue a mesma receita e inventaria dependências, sem clonar chaves ou abrir roteador paralelo.
- **Quatro janelas/monitores**: inventário físico por Skill Mãe; WinDisc/desktop virtual => UNKNOWN. Teste opcional Identificar usa função nativa do Windows somente em sessão física e via executor autorizado.
- Mudou: anotar por quê, por quê não outra forma, owner, contrato, timestamp UTC, estado real, última compilação/prova e NEXT_CURSOR. Publicar por owner da Forja existente; **COMMIT != DEPLOYED**.

**Última alteração neste índice:** 2026-10-26T10:05:23Z. O SHA desta atualização deve ser associado ao recibo do commit, não pré-inventado no texto.
<!-- /CENTRALDARK_LIVE_CONNECTION_CIRCUIT_20261026 -->


# METODO OPERACIONAL CENTRALDARK

<!-- CENTRALDARK_KANBAN_EXECUCAO_DIRETA_20261026 -->
## Execução direta de tarefa existente — método curto (26/10/2026)

**MÉTODO OBRIGATÓRIO DA CENTRALDARK, a partir de 26/10/2026:** para **consultar, retomar, executar e fechar** tarefas Hermes Kanban, aplicar a [seção 8 da Receita Universal existente](references/HERMES-KANBAN-RECEITA-UNIVERSAL.md), sem criar outro método, skill ou dispatcher. O Kaizen Vivo [kaizen-sistema-um](../kaizen-sistema-um/SKILL.md) aprende com a mesma prova, sem duplicar o procedimento. **A instrução desta skill é requisito operacional, não prova automática de carga por todos os agentes.**

**Intenção do CHEFE:** reduzir verificações repetidas e evitar complexidade quando ele pedir para executar, retomar ou consultar uma tarefa que já tem ID. **Aplicar à tarefa existente, nunca criar outra por rotina.** Preservar as verificações mínimas que comprovam estado e impedem dois escritores.

**Fluxo enxuto:**
1. Conectar uma única vez à Casa autorizada. Consultar o ID informado com `hermes kanban show <ID> --json`. Ler apenas `status`, `assignee`, `workspace_path`, `model_override`, `provider_override` e execução ativa. Se `done`, informar resultado com prova. Se `running`, **não despachar de novo**; comunicar execução ativa.
2. Se `blocked` ou `scheduled` e o CHEFE autorizou expressamente **executar agora**, usar `hermes kanban unblock <ID>` no MESMO cartão. Não desbloquear a missão-mãe permanente `t_911e17ff` nem outras tarefas.
3. Rodar **uma vez** `hermes kanban dispatch --dry-run --max 1 --json`; confirmar que a próxima execução é o ID requerido. Se for outra tarefa, **não disparar globalmente**. Corrigir apenas o alvo autorizado ou registrar bloqueio.
4. Quando o alvo estiver confirmado, executar `hermes kanban dispatch --max 1 --json` **uma vez**. Não abrir simultaneamente Claude Code CLI e Hermes para escrever no mesmo projeto. O modelo `claude-opus-4-6` no cartão não é, por si, prova de execução pelo programa Claude Code CLI.
5. Confirmar com **um readback**: `hermes kanban show <ID> --json` e `hermes kanban runs <ID>`. Reportar `RUNNING` apenas com `run_id`/worker real; reportar `DONE` apenas com conclusão e entrega verificada. Distinguir `DISPATCHED`, `RUNNING`, `REVIEW`, `DONE` e `BLOCKED`.
6. Se houver falha, fazer diagnóstico **somente do erro concreto**. Não repetir consultas, reabrir inventário inteiro, testar tecnologias não envolvidas, mudar perfil/modelo, criar cartão, pasta, fila, automação ou processo paralelo sem necessidade.
7. Preferir resposta curta ao CHEFE: `ID | STATUS | EXECUTOR | OWNER | PROVA | PRÓXIMO PASSO`. Registrar recibo ou comentário no próprio cartão apenas quando houver mudança material.

**Aplicação já identificada:** `t_87d162cb` é o cartão do **CentralDark Installer**; workspace `E:\VMs\CentralDark-Installer`; modelo desejado Anthropic Opus 4.6. A missão de desenvolver o software não autoriza formatar/reparticionar o K:, instalar Linux, mudar boot/WSL ou iniciar VM. A tarefa-mãe `t_911e17ff` permanece índice `blocked`.

**Limite:** verificações mínimas de integridade, ID, owner, concorrência e prova continuam obrigatórias; a otimização elimina redundância, não a validação necessária.
<!-- /CENTRALDARK_KANBAN_EXECUCAO_DIRETA_20261026 -->

## Critério operacional — TARGET_PATH da Casa, raiz Git e discos (2026-10-28)

**Gatilho:** Hermes/Cockpit/Goal declarar `TARGET_PATH`, `TARGET_MATCH`, `E:\CentralDark`, `K:\` ou suspeita de usar `C:\`. **Verificação real na Casa SEGREDO em 28/10:** unidades `C:`, `E:`, `F:`, `J:`, `K:` montadas; `git -C K:\ rev-parse --show-toplevel` retornou `K:/`; `K:\` estava em `main`, HEAD `a3355c27e378f63e940e646216f696ef5d96a2b5`, worktree limpo. `E:\CentralDark` existe como diretório sem `.git` na raiz e contém subdiretórios (`CentralDark`, `centraldark-desktop`, `_MAPA_CASA`); **não inferir que não tem propósito nem apagar, migrar ou renomear**. A captura do Goal descreveu `TARGET_MATCH=false` e `TARGET_PATH=E:\CentralDark`: **a divergência é de papel semântico, não evidência de utilização do disco C:**. `C:\Users\Administrador` pode hospedar perfis pessoais de ferramentas; nunca promover uma cópia de perfil a owner do repositório.

**Critério de aceite:** `REPO_ROOT` deve ser obtido por `git rev-parse --show-toplevel` no workspace autorizado e ser `K:\` para operações Git da Forja observada; `TARGET_PATH` deve declarar seu papel e owner antes de comparar. `TARGET_PATH` de projeto/instalação ≠ `REPO_ROOT`; comparar somente caminhos com a **mesma função**. Se a missão exige repo e recebe `E:\CentralDark` sem Git, `TARGET_MATCH=false` é uma detecção correta e o próximo passo é reconciliar o binding na configuração que o originou, **não trocar automaticamente todos os TARGET_PATH por K:**. Se exige diretório de instalação, testar contrato específico antes de afirmar divergência. `REPO_ROOT=K:\` não implica que `E:\`, `F:\` ou `C:\` estejam proibidos para compatibilidade, transitórios ou perfis. Sem proveniência do binding, registrar `TARGET_BINDING_OWNER=UNKNOWN`, evidência e `NEXT_CURSOR`; **não mover/deletar dados, não reiniciar Goal, não declarar deploy/VPS PASS**. Revalidar quando o HEAD, ambiente ou contrato material mudar; reutilizar receipts válidos e preservar `ONE_WRITER_PER_SCOPE`.

## Gatilho operacional — SSH reverso Casa ↔ VPS e PIDs (2026-10-25)

**ATIVAR POR INTENÇÃO**, quando o pedido disser `VPS → Casa`, `SSH reverso`, `PIDs/processos da Casa`, `sem Desktop Commander`, `Tailscale Casa/VPS` ou erros `Host key verification failed` / `Permission denied` nessa ponte. **Owner único já provado:** [one-shot da Casa](../../../scripts/casa/CentralDark-VPS-Casa-PID-OneShot.ps1). Antes de investigar do zero, recuperar a [lição causal](../../../docs/CONSCIENCIA/APRENDIZADOS/2026-10-25-SSH-REVERSO-CASA-VPS-ONESHOT-REUSO.md), a [lembrança verificável](../../../docs/CONSCIENCIA/LEMBRANCAS/03-evidencias-contraprovas/2026-10-25-CIRCUITO-SSH-CASA-VPS-PIDS-COMPROVADO.md) e o [receipt original](../../../docs/RECEIPTS/CENTRALDARK-SSH-VPS-CASA-PIDS-ONESHOT-20261025.md).

**Executar sob demanda:** na Casa Windows, `powershell.exe -NoProfile -File K:\scripts\casa\CentralDark-VPS-Casa-PID-OneShot.ps1`. A receita conserva `segredo-vpss` → VPS e seleciona a chave **já existente** `/root/.ssh/segredo_vps_ed25519` no retorno; exigir `IdentitiesOnly=yes`, `BatchMode=yes`, `StrictHostKeyChecking=yes`, fingerprint e `whoami` antes de `Get-Process`. **Não instalar, criar chaves, expor senhas ou afrouxar SSH para fazer passar.** Host key não confiável exige pin verificado fora do canal; `Permission denied` após host pin exige conferir seleção da identidade antes de culpar firewall/Tailscale.

**Evidência histórica, não garantia permanente:** na contraprova de 25/10/2026, `VPS_TO_CASA_SSH_AUTH=PASS`, `VPS_TO_CASA_PID=PASS COUNT=545` e `EXIT=0`; script/receipt foram lidos na Casa e na `main` com blob idêntico. Para nova rodada, exigir **saída atual** (Id e ProcessName), identidade correta, código 0, receipt e readback. `READ_PID_PASS != PROCESS_MUTATION_AUTHORIZED`; `SSH_CASA_VPS_PASS != SYNC_OBSIDIAN_GITHUB_VPS_PASS`. O resultado não autoriza encerrar/iniciar processos ou declarar automação remota irrestrita. Aplicar Kimetsu e `ONE_WRITER_PER_SCOPE` em cada ação material.


## Consulta oficial PowerShell sob demanda (2026-10-25)

**Gatilho acionável ao agente observar erro PowerShell:** `Get-FileHash`, `CommandNotFoundException`, `ParserError`, `.ps1`, `powershell.exe`, `pwsh`, cmdlets, utility modules, PSScriptAnalyzer, SecretManagement, Crescendo, PlatyPS, DSC, Gallery, instalação/edições, SDK, VS Code, Windows management, Azure PowerShell/runbooks e remoting. Consultar PRIMEIRO [Microsoft Learn — PowerShell](https://learn.microsoft.com/en-us/powershell/) e rotear pelo [mapa oficial de gatilhos](references/POWERSHELL-CONSULTA-OFICIAL-GATILHOS.md). Consultor acionável sob demanda: `scripts/Consultar-PowerShellDocs.ps1 -Mensagem "ERRO"`; `-SomenteRota` não acessa a rede. `NO_MATCH => NO_SEARCH`.

**Fluxo:** `PS_ERROR_MATCH → OFFICIAL_WEB_LOOKUP → HOST_VERSION_AND_EDITION → LOCAL_CAUSE → MIN_DELTA → TEST → READBACK`. Diagnóstico somente leitura; a correção é mutação distinta, sujeita à intenção, Kimetsu e owner único. `DOCS_FOUND != HOST_SUPPORTED != FIX_PROVED`. Não instalar módulos, atualizar runtime, mudar política ou alterar infra só por consultar. Contraprova: `Get-FileHash` ausente na Casa requer consultar `Microsoft.PowerShell.Utility` e verificar módulos/versão; `RemoteSigned` foi ajustado para CurrentUser com autorização explícita e não implica que o cmdlet esteja instalado. Se a web falhar, `DOC_FETCH_STATUS=UNAVAILABLE`. Ativação quando um agente carregado observa o erro, NÃO monitoramento global de processos.


## Regra canônica de identidade do Remote (2026-10-24)

O nome público do produto, owner e capacidade é **CentralDark-Remote**. Não validar integração, saúde, pareamento, catálogo, tarefa ou cockpit pelo nome do antigo fornecedor. O pacote npm do motor open source pode aparecer apenas como dependência técnica interna/atribuição de origem, nunca como nome do produto ou rota de controle. Reutilizar OAuth2 PKCE, autenticação, catálogo, bridge e installer CentralDark existentes. A URL de controle é `https://mcp.centralldark.com/mcp`; referências históricas permanecem históricas e nunca são prova de estado atual. Estado exige tool-call real + readback + contraprova. Ver [regra e aceitação de nomenclatura](references/CENTRALDARK-REMOTE-NOMENCLATURA.md).

## Foco / delegação / telemetria de latência (2026-10-25)

- **#OBSERVACOES# (2026-10-28) — HERMES MOLDURA + RECUPERAÇÃO DO GOAL APÓS LIMITE:** a receita canônica de `maximizar|minimizar|restaurar Hermes` e `retomar Goal interrompido` foi absorvida **na referência de foco/UIAutomation existente** `references/FOCUS-DELEGACAO-TELEMETRIA.md` (seção “Hermes Desktop: moldura maximizar/minimizar/restaurar e retomada do Goal”). Antes: HWND/estado, alvo exato e autorização; ação: somente moldura acessível/WindowPattern; depois: readback no mesmo HWND. **`HERMES_MAXIMIZE=PROVEN_AND_USABLE`**: em 28/10, a ação efetiva `Maximizar Hermes` teve readback `Maximizar → Restaurar` na árvore acessível. Reutilizar a mesma receita sem exigir repetir ensaio já comprovado; minimizar/restaurar existem como controles, mas sua execução completa não está neste recibo. O Goal permaneceu bloqueado/loop pausado; **não declarar Goal concluído** nem interferir no botão `Parar`. **O destino de todo delta durável é o owner canônico em `K:\.agents\skills\centraldark-operational-method\`; `C:\Users\Administrador\.agents\skills` é cópia de perfil, não writer ou fonte da verdade.** `SESSION_LIMIT_EXPIRED != MISSION_DONE`; consumir último recibo/CARACOL e `NEXT_CURSOR` antes de continuar. Sem outro script, skill, arquivo de sessão ou worktree.


- **#OBSERVACOES# (2026-10-28T12:26:38Z) — OPERAR 4 MONITORES DA CASA:** o contrato executável por intenção está na [receita operacional existente de foco/UIAutomation, seção “Receita operacional viva dos 4 monitores”](references/FOCUS-DELEGACAO-TELEMETRIA.md#observacoes--receita-operacional-viva-dos-4-monitores-28102026). Os gatilhos `!CENTRALDARK #MONITORES_CASA`, “janela 1–4”, “monitor”, “AMD Adrenalin”, “localizar janela” recuperam **este mesmo owner** antes de criar código ou abrir nova skill. Inventariar `Screen.AllScreens`, cruzar posição/retângulo/EDID/UIAutomation, preservar foco do usuário, executar apenas ação segura autorizada e selar before/after. **Snapshot atual 28/10:** dois AOC 24G2W1G4, um AOC 24G2W1G5, um Dell S2421HN; identificação física por posição é remensurada porque DISPLAYx mudou desde 26/10. Fonte complementar de documentação visual: `E:\VMs\CentralDark-Installer\CentralDark-README.md`. `MONITORS_DISCOVERED != UI_CLICK_PROVED`; nenhum controle da RX 580 ou layout físico é modificado por esta receita.

- **Protocolo canônico aditivo:** [references/FOCUS-DELEGACAO-TELEMETRIA.md](references/FOCUS-DELEGACAO-TELEMETRIA.md). Reusa Edge UIAutomation + MCP Remote Desktop Commander, mede transições/foco/oi-apagar sem enviar, aceita envio real apenas com autorização e lê ACK por Browser. A Sala de Controle/Gaveta da Forja mostra somente eventos com readback e distingue ações UIA, cliques físicos não medidos e conexões MCP não comprovadas. Servidor fora da Casa exibe NO_LOCAL_SOURCE. Não criar gateway ou skill paralelos.
- **#OBSERVACOES# (2026-10-27T15:35:04.692Z) — ROTEAMENTO CLICK-TO-MAP:** owner `centraldark-operational-method` mantém a seção [«Navegação deliberada do Cockpit — mapa vivo botão por botão»](references/FOCUS-DELEGACAO-TELEMETRIA.md#navegação-deliberada-do-cockpit--mapa-vivo-botão-por-botão). Gatilhos `!CENTRALDARK #HERMES #MAPEAR_COCKPIT`, “usar mouse”, “clicar botão por botão”, “mapear cockpit”. **Inventariar todos** os controles via `data-cd-flow`/ARIA/role; **acionar somente navegação e expansão seguras** com executor de UI já autorizado; foto/DOM/estado ANTES e DEPOIS; registrar recebimento do clique vs. efeito real, sem simular mouse físico a partir de InvokePattern. Não clicar automaticamente em enviar, apagar, credenciais, deploy, commit, alterações de GPU ou controles sem classificação; `NOT_EXECUTED` se não houver ferramenta de ação. Comprovou falha → identificar owner → menor delta → teste existente → BACKCHECK → receipt Obsidian/BRAIN; não criar segunda skill/robô. *Referência atualizada ≠ Hermes ativo consumiu ≠ automação agendada*.
- **#OBSERVACOES# (2026-10-27T16:15:04.980Z) — CRISTAL RUNTIME/RADEON:** o Hermes entregou recibo de **seis cliques de navegação e expansão**, com DOM readback e sessão Desktop autenticada, preservado na [mesma referência — Recibo consumido, seis cliques Radeon](references/FOCUS-DELEGACAO-TELEMETRIA.md#recibo-consumido--seis-cliques-de-navegação-radeon-hermes-desktop-2026-10-27). `MAP_RADEON_SAFE_NAV=6/6_REPORTED`; `RECORD_BUTTON_E2E=UNKNOWN` e `CSV_EXPORT_E2E=UNKNOWN`. `browser_exec AUTH_REQUIRED` anterior pertence à sessão isolada, não à sessão do CHEFE. **NEXT_CURSOR:** mapear Infraestrutura → Radar → Mega Painel → Status no mesmo desktop autorizado; gate HUD legado segue cone separado. Nenhum commit, deploy ou autonomia agendada comprovada por este recibo.
- **#OBSERVACOES# (2026-10-28T09:26:43.135-03:00) — RECEITA OPERACIONAL NATIVA DE MONITORES WINDOWS:** gatilhos `mapear telas`, `monitor`, `Adrenalin`, `usar os quatro monitores` e `localizar janela`. **Por que fazer:** evitar clique cego e localizar o Installer na tela física correta. **Por que não outra coisa:** o Windows já possui a função nativa e visual `Identificar`; não usar captura histórica, desktop remoto WinDisc, AMD ou automação sem alvo acessível como substituto da sessão física. **Owner:** esta Skill Mãe coordena a receita; o contrato e recibo vivem em [CentralDark: Circuito Vivo, Conexões e Realtime](../../../docs/ARQUITETURA/CENTRALDARK-CIRCUITO-VIVO-CONEXOES-20261026.md). **Único procedimento operacional:** `Configurações` → `Sistema` → `Tela` → `Identificar`; observar o numeral grande exibido em cada painel e registrar a topologia, sem arrastar monitores, escolher resolução, alterar modo de projeção ou aplicar configuração. **Mapa físico comprovado pelo Identify:** `3 = esquerda`; `2 = centro superior`; `4 = centro inferior`; `1 = direita`. **Inventário de identidade complementar:** D1 AOC 24G2W1G4/DisplayPort/`ATNMBXA002919`; D2 AOC 24G2W1G5/DisplayPort/`ATOM8XA000468`; D3 AOC 24G2W1G4/HDMI/`ATNM4XA002193`; D4 DELL S2421HN/HDMI/`4JD4DQ3`. **Prova:** screenshots da sessão física com numerais `1..4`, Settings Windows, `WmiMonitorID` e `WmiMonitorConnectionParams`; nenhuma configuração gráfica foi alterada. **NEXT_CURSOR:** se for preciso mover/operar uma janela, confirmar primeiro seu número pelo Identify nativo e obter alvo UI local acessível; ação material continua exigindo autorização e readback.
- **#OBSERVACOES# (2026-10-28T14:14:29.254-03:00) — CADEADO IDENTIFICAR SELADO:** teste local do owner executou `Configurações` → `Sistema` → `Tela` → botão **Identificar** pela UI nativa. `NATIVE_IDENTIFY_UI_DISPATCH=PASS`; o overlay numérico é transitório e surge nos painéis físicos, não dentro da janela Configurações. Contraprova pós-teste por PowerShell: `Screen.AllScreens.Count=4`, retângulos preservados (`DISPLAY2=-1080,-828,1080x1920`; `DISPLAY4=0,-1080,1920x1080`; `DISPLAY3=0,0,1920x1080`; `DISPLAY1=1920,-831,1080x1920`) e Radeon RX 580 em `1920x1080@144`; `TOPOLOGY_STABLE=PASS`. **Fronteira de autonomia:** a Casa pode inventariar por PowerShell sem interface e o executor visual local pode disparar o botão nativo; `POWERSHELL_NATIVE_IDENTIFY_COMMAND=UNAVAILABLE` nas APIs/CLIs públicas, portanto não alegar ação headless. Nenhuma resolução, arranjo, projeção, driver, disco ou boot foi modificado. **NEXT_CURSOR:** reutilizar esta receita e registrar somente novo delta físico ou falha de readback.

## 🍒 Histórico canônico de builds Desktop (25/10/2026)

- **Único owner:** o Desktop existente em apps/modulos/Bolt/source. **Receita viva:** apps/modulos/Bolt/source/scripts/centraldark-rebuild.mjs e **livro de builds:** apps/modulos/Bolt/source/resources/build-history.json. O mesmo Cockpit exibe o cartão Builders CentralDark, contagem de builds PASS, versão, horário Bahia, hash, commit e botão Rebuild Windows; sem segundo painel, executor ou Skill Mãe.
- **Primeiro builder registrado:** 1.0.0, commit 9051151, instalador + exe gerados no Windows Casa em 25/10/2026, BUILD_RC=0 e smoke local "Server build loaded successfully". A prova, hashes e ressalvas estão em docs/CONSCIENCIA/APRENDIZADOS/2026-10-25-PRIMEIRO-BUILDER-CENTRALDARK.md. Primeira entrada **deste catálogo**, não afirmar primeiro build absoluto sem inventário anterior.
- **Contador/versão:** n=quantidade de entradas com build_status PASS; avança 1.0.0 → 1.0.1 → 1.0.2 apenas após build exit 0, artefatos novos e SHA256 válido. Sem build válido, não contar nem avançar. Smoke, instalação externa e deploy são status separados; BUILD_PASS != APP_EXECUTED != DEPLOYED.
- **Rebuild autorizado:** confirmação do usuário + renderer Electron validado + worktree limpa e exclusiva + pnpm install --frozen-lockfile --prod=false com NODE_ENV=development + comando original pnpm centraldark:build:win; rollback da versão em caso de falha; sem push/merge/deploy automático. Abas web sem bridge mostram indisponibilidade, não fingem execução.
- **Aprendizado imutável:** anexar evidências por versão e manter última data de sucesso, sem apagar recibos/IDs. Não transformar um único smoke em Fixed Point global. PR histórica é trilha, não merge nem instalação. Se o Cockpit instalado ainda não contiver o delta, SOURCE_READY != UI_DEPLOYED.

## Entrada canonica do catalogo integrado (2026-10-24)

- Catálogo canônico descritivo: [catalogo/CATALOGO.md](catalogo/CATALOGO.md).
- **Biblioteca de diagramas no Obsidian (owner existente):** [DIAGRAMAS-CENTRALDARK.md — seção 12: Skill-Mãe, cristal, preservação e reconstrução](../../../docs/BRAIN/03-DOCUMENTACAO/03-GUIAS/DIAGRAMAS-CENTRALDARK.md#12-skill-mãe--cristal-reutilizável--preservação-e-reconstrução-2026-10-28). Quando uma operação mudar uma relação comprovada, **atualizar a seção correspondente no mesmo documento** e guardar owner, receipt, data e prova; se não alterar o fluxo, reutilizar o diagrama sem reescrever. A própria biblioteca é a projeção do Obsidian; não criar uma segunda pasta de diagramas dentro da Skill-Mãe. Versionar no Git e enviar ao GitHub somente mediante operação solicitada/provada; `DIAGRAMA_LOCAL != GITHUB_BACKUP != RESTORE_TESTADO`.
- **CentralDark Plugin (interface unificada, owner existente):** `apps/modulos/obsidian-plugin-grafo-vivo/`, com mapa de módulos no [README](../../../apps/modulos/obsidian-plugin-grafo-vivo/README.md#centraldark-plugin--organização-unificada-2026-10-28). O plugin **não** substitui a Skill-Mãe nem o Hermes: recebe intenção/evento pertinente, exibe estado, chama o executor autorizado e registra efeito. Obsidian `K:\docs` é o vault de conhecimento, não a raiz universal do projeto. Para instalação nova, resolver `CENTRALDARK_ROOT` por variável ou descoberta validada; `HERMES_ENDPOINT`/SSH é binding independente e nunca presumir VPS ou Casa ativa. Preservar o ID legado `centraldark-grafo-vivo` até prova de migração; **não substituir o bundle instalado** enquanto `Hermes Live` existir nele sem fonte reconciliada. Owner único por capacidade, menor delta, prova antes de atualizar receita, diagramas e catálogo.
- **#OBSERVACOES# — CAPACIDADES CENTRALDARK DENTRO DA SKILL-MÃE (28/10/2026):** 17 fontes CentralDark foram importadas para [`catalogo/skills-integradas/`](catalogo/skills-integradas/), incluindo as 6 capacidades que faltavam (notas vivas, Hermes Operations, reconciliação diária, evidências, CentralDark Ops e Oracle). Cada módulo usa sua própria pasta e carrega os `scripts/` e `references/` correspondentes quando existirem. **Gatilho do CHEFE:** pedir a ação em português; consultar esta Skill-Mãe → [índice por intenção](catalogo/INDICE-PESQUISA.md) → módulo correto → execução realmente autorizada → resultado. Não exigir que o CHEFE escolha uma skill. **Manutenção do catálogo:** `powershell.exe -NoProfile -File scripts/atualizar-catalogo-self-healing.ps1 -SincronizarSkillsCentralDark` quando houver pedido de sincronização. Fontes antigas preservadas para consumidores que dependem de caminhos absolutos; **nenhuma pasta original foi movida ou excluída**. Modo Clareza 80%, anti-fricção, um writer por destino e prova do efeito continuam válidos.
- Índice navegável por intenção: [catalogo/INDICE-PESQUISA.md](catalogo/INDICE-PESQUISA.md).
- **Inventário vivo** com todos os arquivos, datas de criação, modificação, referências e SHA-256: [catalogo/ARQUIVOS-VIVOS.json](catalogo/ARQUIVOS-VIVOS.json) + [catalogo/INDICE-VIVO.md](catalogo/INDICE-VIVO.md). O arquivo [catalogo/ARQUIVOS.json](catalogo/ARQUIVOS.json) é apenas o **snapshot histórico da importação inicial**.
- **Autocura e atualização recursiva com prova:** [references/AUTO-MELHORIA-COM-PROVA.md](references/AUTO-MELHORIA-COM-PROVA.md). Atualizador único: `scripts/atualizar-catalogo-self-healing.ps1`; Agendador Windows `CentralDark-Skill-Catalogo-Autocura`, a cada 2 minutos com usuário da Casa conectado.
- **Regra de escrita:** respeitar [https://agentskills.io/specification](https://agentskills.io/specification) e [manual Hermes Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills). Explicações, mudanças e aprendizados em **português**; manter termos técnicos quando necessários. Para cada modificação registrar `por_que_fazer`, `por_que_nao_fazer_outra_coisa`, `por_que_usar`, `por_que_modificar`, `o_que_mudou`, `prova`, `contraprova`, data/hora e referência.
- **Promoção de prova real:** `scripts/registrar-prova-hermes-casa.ps1` confirma DONE + execução completada + resultado no destino e gera recibo; `atualizar-catalogo-self-healing.ps1` acrescenta o aprendizado validado a esta skill em bloco delimitado, sem remover o método já comprovado.
- Pesquisa: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/pesquisar-catalogo.ps1 -Termo kanban`.
- Uma entrada canonica e modulos especializados reutilizados, mantendo originais por compatibilidade.
- **HANDOFF ENTRE AGENTES E CONTAS (CENTRALDARK-REMOTE, 24/10/2026):** ler [references/HANDOFF-CENTRALDARK-REMOTE-20261024.md](references/HANDOFF-CENTRALDARK-REMOTE-20261024.md) antes de retomar a migracao/pareamento Remote. Reaproveitar plano e provas, consultar estado vivo do cartao `t_5b386368`, nao competir com worker, nao confundir build, health 200 ou output PowerShell enorme com conexao E2E. Intencao unica do CHEFE, contas independentes; comunicar em HUD game FIXO V1 sem regressao.
- **MISSÃO-MÃE ÚNICA DA CENTRALDARK (24/10/2026):** `t_911e17ff` = EXPANDIR CONHECIMENTO, ID permanente; permanece `blocked` SEM assignee como índice e não worker. Toda filha declara `ID_MAE=t_911e17ff` na intenção/corpo e `created_by=mae:t_911e17ff:<autor>`, owner e workspace absoluto, mantendo um escritor por alvo. **Não usar `--parent` no despacho enquanto a mãe estiver blocked**: no Hermes o parent é dependência, e impede a filha de executar. Depois da filha DONE com prova/readback, executar `hermes kanban link t_911e17ff <ID_FILHA>` e confirmar pais/filhos sem alterar o DONE. Hoje foram vinculadas filhas já DONE: `t_13f64ec8`, `t_928a8cbd`, `t_2805243c`, `t_26e02a16`. O Cockpit usa o Forja Executor existente + `lerMissoesMaeCentralDark` para status reais. GitHub guarda histórico verificado; Casa é teste primário, VPS exige readback próprio via canal autorizado. Continuar pelo handoff `K:\scripts\remote-bridge\canonical\HANDOFF-DELTA-CHATGPT-MAE-COCKPIT-20261024.md` e pelo aprendizado `docs/CONSCIENCIA/APRENDIZADOS/2026-10-24-MISSAO-MAE-HERMES-COCKPIT-MVP.md`. Não criar arquitetura paralela; não inventar passos/fases/progresso.
- **Receita universal obrigatoria antes de qualquer delegacao Hermes:** [references/HERMES-KANBAN-RECEITA-UNIVERSAL.md](references/HERMES-KANBAN-RECEITA-UNIVERSAL.md). Ler integralmente quando criar, atribuir, verificar ou depurar missoes.
- **RSI Loop — Recursive Self-Improvement com Recipe Transfer (29/10/2026):** carregar [references/rsi-loop-method.md](references/rsi-loop-method.md) para missões de autoaperfeiçoamento operacional. Contém: 3 estágios (Self-Refinement → Reflective → RSI), ciclo de 10 critérios, formato de receipt, fixed point, padrões de correção TypeScript (TS4111, TS2532, TS18048, TS2375, TS2769, TS2322, TS2345, TS2339, TS2503), regras de transferência e contraprova obrigatória. Reaproveitar receitas existentes sem redescoberta. Reutilizar owners canônicos. Não criar skill paralela. menos `CLASSIFICACAO`, `INTENT`, `BREATH_ID/NAME`, condição observada, ação, evidência, veredito e `NEXT_BREATH`. Não basta citar a respiração. `TÉCNICA_DECLARADA != TÉCNICA_EXECUTADA`; `UNKNOWN != PASS`. Para leitura/diagnóstico sem mutação, Concentração/Lua/Som podem encerrar a rodada. Para mudança, preservar aprovação já dada, writer único e usar a menor respiração material adequada.
- **Recuperação Kimetsu + delta contínuo (25/10/2026):** [references/KANBAN-KIMETSU-RECUPERACAO-E-DELTA-20261025.md](references/KANBAN-KIMETSU-RECUPERACAO-E-DELTA-20261025.md). Antes de retomar filhas falhas, distinguir cota, conectividade, contexto e workspace; preservar os IDs, provar duplicidade antes de arquivar (nunca usar `archive --rm` por rotina), usar `scheduled` para espera deliberada e liberar **uma execução por vez somente após tratar a causa**. Kimetsu existente não é MoA. Resultado histórico: 13 → 8 bloqueados, 5 em espera; isso **não prova** a entrega dessas filhas. O mesmo protocolo inclui abertura genérica de Explorer com readback. Não tocar modelos, runtime ou cartões por mera leitura desta skill. Aprendizado verificável: [registro Kimetsu no núcleo de Aprendizados](../../../docs/CONSCIENCIA/APRENDIZADOS/2026-10-25-KIMETSU-KANBAN-RECUPERACAO-DEDUPLICACAO.md).
- **HUD !michelin estilo game — CONTRATO VISUAL FIXO V1 (24/10/2026):** usuario aprovou expressamente o ultimo quadro monoespacado nesta conversa: moldura dupla, cabecalho CENTRALDARK/MICHELIN, missao, ambiente, placar, barra de progresso, indicadores de cada PASS, inventario, dois IDs Kanban, tres estrelas e rodape PONTO FIXO. Em todas as proximas respostas de HUD, manter exatamente esse desenho, um quadro unico, compacto, sem listas/tabelas expandidas; melhorias apenas aditivas e sem regressao. Valores 13/13, 68 arquivos, 12 skills e 100% sao snapshot historico: atualizar com prova atual ou marcar nao verificado. O contrato visual nao altera a receita Hermes nem equivale a prova tecnica. Esta regra deve ser lida por agentes que consultam a skill; nao presumir que outros agentes a receberam sem leitura.
- **Gatilho `!michelin` / Michelin 3 estrelas:** carregar a [skill Michelin 3 Estrelas](catalogo/skills-integradas/michelin-3-estrelas/SKILL.md) e o [protocolo detalhado](references/MICHELIN-3-ESTRELAS-PROTOCOLO.md) JUNTO da receita da intencao. Procedimento: INTENT_FIRST, reuso, fases construir/integrar/provar, testes, contraprova e readback. **A skill foi extraida sem alterar o original** `docs/LEMBRANCAS/metodo-chefe-conformidade-michelin-20261019.md`; aprendizado em `docs/CONSCIENCIA/APRENDIZADOS/2026-10-24-MICHELIN-3-ESTRELAS-SKILL-HERMES-CASA.md`. O metodo nao troca o CLI nem altera `hermes kanban create`. Selo escopado, nao Fixed Point global.
- **INTENCAO PRIMEIRO**: escolher em tempo de execucao `AMBIENTE_ALVO`, `WORKSPACE_ALVO`, `TITULO`, `DESCRICAO`, `PERFIL`, `PROVEDOR`, `MODELO`, `CHAVE_IDEMPOTENCIA`, `ID_MISSAO`. Nenhum workspace e universal; `C:\root` foi somente destino de um teste passado.
- **Casa Windows**: CLI local `C:\Users\Administrador\AppData\Local\hermes\bin\hermes.exe`. `default` foi o perfil comprovado nesta Casa (validar `kanban assignees`).
- **VPS Linux**: CLI configurado em `/root/.hermes/hermes-agent/.hermes/bin/hermes`, conforme receita existente `scripts/vps/neurolink-gateway-dispatch.sh`; confirmar existencia e perfil no ambiente VPS antes de agir. Nunca confundir executores.
- **Uma operacao de delegacao**: `hermes kanban create` para criar/cartao de qualquer missao; o verbo (criar, excluir, editar, testar) pertence exclusivamente a `DESCRICAO`, definido pela intencao atual. Nenhum comando paralelo de delecao.
- **Assignee imediato**: usar `--assignee PERFIL` em `kanban create`. Se cartao existente veio `unassigned`, `hermes kanban assign ID PERFIL`. A variante com `--assignee default` foi testada na criacao de `t_26e02a16`.
- **Cadeia free tier, modelo e reasoning Hermes (2026-10-25; receita Free Tier comprovada em 29/10):** [references/HERMES-FREE-TIER-FALLBACK.md](references/HERMES-FREE-TIER-FALLBACK.md). Estado medido: primary `llamacpp` local, fallback chain VAZIA; inventário também registra `provider + model + reasoning_effort` por cartão e os melhores resultados **somente no escopo comprovado**. Regra fixa: para qualquer conclusão sobre Hermes Desktop/CLI/Kanban, consultar primeiro o GitHub/documentação oficial `NousResearch/hermes-agent`, depois confrontar `hermes --version`, help, config/schema e runtime da Casa. Não projetar upstream na instalação local. Valores recentes medidos: Opus 4.6=`minimal`, Haiku 4.5=`low`, Sonnet 4.5=`medium`; `NULL` no Kanban = herança do perfil, não `none`. CLI local `set-model` troca model/provider; reasoning é knob separado. Para delegação core, persistir `delegation.provider`/`delegation.model` via `hermes config set`, desligar `compression.codex_gpt55_autoraise`, executar um smoke test único e provar o modelo pelo readback do dispatcher antes do fan-out.
- **Modelo por missao, nao fixo na skill**: `--model MODELO --provider PROVEDOR`. NVIDIA `nvidia/nemotron-3-ultra-550b-a55b` / `nvidia` foi aprovado no teste real da Casa; outros modelos podem funcionar quando efetivamente medidos. `jann`/custom falhou por indisponibilidade do endpoint nesse teste.
- **Prova**: `hermes kanban show ID --json`, `hermes kanban runs ID`, efeito observado no host alvo; `READY != RUNNING != DONE` e `DONE` sozinho nao prova o arquivo.
- **TESTES WINDOWS CASA PRESERVADOS**: `t_2805243c` (**CRIAR TXT=PASS**, `DONE` com conteúdo conferido) e `t_26e02a16` (**EXCLUIR TXT=PASS**, `DONE` e arquivo ausente em readback). Ambos pelo Hermes Kanban local, perfil `default`, provedor `nvidia`, modelo `nvidia/nemotron-3-ultra-550b-a55b`. Não alterar esse método validado para crescimento da skill; estender somente a intenção e validar cada novo efeito.
- **Documentos de navegacao**: [catalogo/CATALOGO.md](catalogo/CATALOGO.md), [catalogo/INDICE-PESQUISA.md](catalogo/INDICE-PESQUISA.md). Preservar os originais, nao alterar GitHub/main, Cockpit ou VPS fora da intencao.


## Grafia de fala aprovada pelo CHEFE — teste de áudio (2026-10-19)

Na resenha informal e em falas destinadas ao áudio, preferir **“Ôchente!”** (CH, circunflexo) à grafia “Oxente” ou “Ôxente”, porque o CHEFE testou a voz e aprovou a pronúncia. Usar baianês espontâneo, frases curtas, humor e palavrões leves/contextuais quando combinarem com a conversa, sem agressão dirigida. Exemplo de tom aprovado: **“Ôchente, pivetão! Agora o doce ficou no ponto dessa porra!”**. Preservar grafia convencional em documentação formal, nomes técnicos, citações e histórico. Preferência de comunicação não altera evidência, gates nem execução; não substituir retroativamente textos históricos.

## Gatilho
Qualquer tarefa no repositorio ServerVpss/CentralDark ou missao derivada (VPS, GitHub, MCP, workflows, issues, deploy). O método é uma caixa de ferramentas: não é permissão, lei nem bloqueio. A intenção vigente escolhe o mínimo útil.

## Contrato operacional — VISUAL FIRST / DELTA EXATO (19/10/2026)

**Gatilho:** quando a pessoa pedir um botão, setor, card, menu, navegação ou posicionamento no Cockpit/Builder, cumprir **exatamente o objeto solicitado**, sem ampliar para uma migração, integração de infraestrutura, auditoria, novo agente, novo PR ou outro painel.

```text
INTENT_FIRST=true
UI_FIRST=SHOW_SELECT_POSITION_THEN_INTEGRATE
REQUESTED_SCOPE_IS_CEILING=true
VISIBLE_BUTTON != CONNECTED_CAPABILITY
DISCOVERED_INTEGRATION != AUTHORIZED_EXECUTION
REUSE_EXISTING_COCKPIT=true
NOTIFICATION_IS_PROPOSAL_NOT_PERMISSION=true
```

1. **Materializar primeiro:** inserir no owner visual existente os botões, menus e cartões solicitados, mantendo navegação e seleção para revisão imediata. Se não houver ligação comprovada, sinalizar `INTEGRAÇÃO PENDENTE` sem fazer o botão fingir execução. Preservar funções existentes.
2. **Não antecipar:** não criar/iniciar agentes, scripts, deploy, migração, conexão a provedores, auditoria opcional ou novas telas sem pedido correspondente. Se o usuário pedir só uma mudança visual, fazer só essa mudança, validar o escopo visual e parar.
3. **Descobrir depois, sem executar:** o sistema pode identificar oportunidades de ligação com owners e rotas já existentes e **avisar** com evidência, impacto e próxima ação proposta. Avisa quando existir oportunidade comprovada; aguarda pedido/autorização antes de integrar ou modificar infraestrutura.
4. **Segurança sob demanda, proteção de base permanente:** não transformar cada tarefa visual em projeto de segurança, revisão ampla ou bloqueio hipotético sem solicitação. **Não** desabilitar autenticação, isolamento, autorização, tratamento de segredos, RLS, validações e demais controles básicos existentes. Nunca expor credenciais ou representar dados simulados como reais. Qualquer ação de risco exige as autorizações próprias.
5. **Coordenação:** SOL pode coordenar e delegar para Hermes, Jarvis, Claude/Codex ou outros coordenadores existentes apenas quando a intenção incluir delegação. Coordenadores podem repassar subgoals no Kanban existente com owner e ACK; abrir terminal não inicia agente. Um escritor por escopo.
6. **Contraprova proporcional:** provar que o item visual foi renderizado/selecionado (quando houver acesso); não exigir teste end-to-end de provedor para afirmar `UI_PRESENT`. Separar `UI_PRESENT`, `INTEGRATION_PENDING`, `RUNTIME_CONNECTED`, `EFFECT_PROVED`; documentação/HTTP 200 isolado não comprovam clique ou integração.

**Sequência:** `PEDIDO EXATO → MOSTRAR → POSICIONAR/REVISAR → DESCOBRIR OPORTUNIDADE → AVISAR → AGUARDAR AUTORIZAÇÃO → INTEGRAR → CONTRAPROVAR`. A primeira entrega deve ser útil antes das etapas futuras. `UNKNOWN != PASS`.
## Lei persistente — Casa ⇄ main, CHEFE como aprovação viva (2026-10-19)

**Autoridade:** o CHEFE aprova a intenção em tempo real no diálogo; a PR não é requisito universal para alterações cotidianas autorizadas. Abrir PR somente quando solicitado ou quando o componente exigir isolamento/revisão técnica. Não criar PR automaticamente para cada delta.

```text
CASA_COMMIT_IMPLIES_MAIN_SYNC=true
MAIN_COMMIT_IMPLIES_CASA_SYNC=true
PR_BY_EXCEPTION=true
CHEFE_IS_LIVE_APPROVAL=true
SYNC_IS_BIDIRECTIONAL_NOT_DESTRUCTIVE=true
UNKNOWN_IS_NOT_SYNCED=true
```

**Ciclo obrigatório por delta aprovado:** medir HEAD local e remoto, identificar owner e diferenças, preservar arquivos não relacionados e último verde, aplicar a menor mudança, executar gates proporcionais, fazer commit local de escopo exato, sincronizar com `origin/main` quando autorizado e seguro, confirmar SHA remoto e incorporar o resultado de volta na Casa; conferir identidade dos arquivos/SHAs e registrar recibo. No sentido inverso, ao detectar novo commit em `main`, atualizar a Casa com o mesmo cuidado, sem reset destrutivo ou descarte de mudanças locais. Reusar scripts/owners de sincronização já existentes.

**Fechamento atômico de alterações geradoras:** se a mudança atualizar índices, catálogos, hashes, timestamps, históricos ou outros artefatos gerados pelo próprio owner, executar a regeneração e incluir esses arquivos no mesmo commit escopado. Não deixar “dívida de commit” causada pelo próprio delta. Só separar um arquivo quando ele for comprovadamente pré-existente e não causal; nesse caso registrar `DEBT_EXPLICIT=` com owner, motivo e próximo cursor antes de finalizar. `SOURCE_DELTA + GENERATED_METADATA = ONE_COMMIT_SCOPE`.

**Exceções que impedem promoção automática:** conflito não resolvido, working tree com alterações de outros writers, segredos, autorização ausente, testes obrigatórios falhos, proteção de branch ou políticas de revisão. Nesses casos preservar os dois lados e declarar `BLOCKED/UNKNOWN` com o menor próximo passo; **não** forçar push, não contornar proteção da main e não dizer `SINCRONIZADO` sem readback. A autorização para um delta não autoriza subir trabalho não relacionado.

**Escopo da lei:** governança operacional, não prova de que um daemon de sincronização já exista ou esteja rodando. `LOCAL_COMMITTED != MAIN_UPDATED` e `MAIN_UPDATED != CASA_UPDATED`.

## 🔒 Main-first lock — obrigatório em toda rodada

Antes de qualquer leitura conclusiva, delegação, edição, teste que possa orientar mutação ou declaração de estado, consultar a `origin/main` atual e registrar o SHA observado. Esta consulta é um preflight persistente; não pode ser substituída por memória, receipt histórico, branch local, PR, comentário de agente ou estado de runtime.

```text
MAIN_FIRST_PRECHECK=MANDATORY
MAIN_CURRENT_IS_CANONICAL=true
FETCH_ORIGIN_BEFORE_WORK=true
REMEASURE_MAIN_BEFORE_MUTATION=true
DIRTY_OR_BEHIND_MAIN= PRESERVE_AND_CLASSIFY
HISTORY_OR_PR_IS_NOT_CURRENT=true
RUNTIME_MIRROR_REQUIRES_MAIN_SHA=true
COGNITIVE_LOCK=MAIN_SHA+OWNER+WRITER+SCOPE
```

Mínimo verificável:

```text
git fetch origin --prune
→ git rev-parse origin/main
→ git status --short --branch
→ fixar OWNER/WRITER/SCOPE
→ comparar o delta contra esse SHA
→ re-fetch + readback do SHA antes de commit/push/deploy
```

Se `origin/main` se mover, repetir a comparação. Se o checkout estiver dirty, atrás, divergente ou com worktrees concorrentes, preservar e classificar; não resetar, limpar, sobrescrever ou integrar cegamente. `MAIN_FIRST_PRECHECK=PASS` prova apenas que a consulta ocorreu, não que a tarefa está concluída.

Guard executável do mesmo owner:

```bash
python3 scripts/trigger-fabric/main_first_change_guard.py \
  preflight --receipt <scratch>/main-first-preflight.json
```

O guard consulta `origin/main`, PRs abertos, issues abertas e os commits atuais da main. Ele retorna `BLOCKED_DIRTY_WORKTREE` quando a árvore não está preservada em um worktree limpo. Depois da alteração, a finalização exige o mesmo receipt, commit/PR no mesmo HEAD, testes, dívida explícita e `NEXT_CURSOR`; quando autorizado, `--comment-pr` publica o receipt no PR. Falha no preflight/finalizer bloqueia a promoção; não há bypass silencioso.

## Comunicação mínima — responsabilidade humana ≠ erro técnico (2026-10-19)

Quando só falta uma ação do CHEFE, falar em linguagem natural, com o **local e a ação exata**, sem apresentar como falha nem acionar alerta técnico. Exemplo: **"🟡 Falta o CHEFE abrir Cockpit → Minha Oficina e olhar os seis cartões."** Não mostrar `NÃO COMPROVADO` como cobrança humana ou alerta vermelho. Para erro real, usar **"🔴 Precisa corrigir [causa e local]"**; para funcionalidade provada, **"🟢 Funcionando"**. Preservar estados técnicos `UNKNOWN/FAIL/PASS` nos dados, logs e receipts; mudar somente a mensagem exibida quando a única pendência é conferência humana. Objetivo: comunicação curta, útil e sem ruído.

## Contrato de precisão de resposta — reutiliza o método existente

**MODO CLAREZA — ASD-STE100 | 80% (CHEFE, 2026-10-28).** **Cada explicação e receita operacional**, antiga ou nova, é apresentada com este estilo quando for consumida: começar pelo resultado ou resposta; frase curta; uma ideia de cada vez; português brasileiro natural; voz ativa; palavras familiares; termos iguais para conceitos iguais; termo técnico explicado; sequência lógica; sem repetição. Preservar informações materiais, comandos exatos e provas. Em áudio, explicar de forma ainda mais direta. **A clareza é aplicada no próprio texto de cada explicação**, não numa seção separada recitada em toda resposta. Na edição de um owner existente, ajustar a passagem tocada; não refatorar todos os documentos sem demanda. **Operação:** usar esta Skill-Mãe antes de atuar, reutilizar owner, executar somente a intenção autorizada, conferir efeito e comunicar PASS/UNKNOWN em palavras simples. No brainstorming, explorar sem acionar ferramentas; o CHEFE define quando agir. **NÃO transformar modo de escrita em novo gate, nova skill, auditoria ou restrição contra a intenção.**

<!-- CENTRALDARK_CLAREZA_AGENTES_MODELOS_CLI_20261029 -->
**Regra de fala ao operar a Skill-Mãe (CHEFE, 2026-10-29):** qualquer **modelo, agente, assistente de código, script com saída para pessoas ou agente de linha de comando (CLI)** que **carregar este contrato** deve comunicar o resultado em **português brasileiro claro, nível ASD-STE100 80%**: primeiro a resposta; depois o que aconteceu, a prova real, o que falta e a ação útil. Usar frases curtas, voz ativa, uma ideia por frase, sem repetir jargão ou inventar verde. Baianês e resenha naturais, com referência bíblica curta e opcional quando pertinente; **humor ou verso não substituem recibo técnico**. O modo de falar deve ser como a conversa com o CHEFE, sem virar caricatura ou cerimônia.

**Duas camadas, uma verdade:** na **mensagem para a pessoa**, traduzir `CI=UNKNOWN` → “Ainda não confirmei o resultado dos testes”, `CI=QUEUED` → “Os testes ainda não começaram”, `CI=RUNNING` → “Os testes ainda não terminaram”, `CASA_HEAD_OLD` → “A Casa está com uma versão antiga” e `Codex Review: Failed` → “O Codex não concluiu a revisão; isso não prova defeito no código”. Nos **logs, JSON, CLI usados por outros programas, comandos, exit codes, SHAs e receipts**, conservar os valores exatos e o formato esperado; quando possível, adicionar resumo humano separado **sem quebrar consumidores**. Exemplo humano: “Os testes ainda não terminaram. A Casa está com uma versão antiga. Precisamos atualizar sem perder os arquivos locais.”

**Alcance verificável:** esta regra orienta **quem ler/carregar** a Skill-Mãe; editar GitHub **não prova** que Claude, Codex, Hermes, um script existente ou outra sessão já a consumiu. Sem readback do agente e de sua saída, estado de aplicação no runtime = `UNKNOWN`. Reutilizar `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md`; **não** clonar skill, reescrever todos os scripts ou mudar comportamento de máquina sem teste.
<!-- /CENTRALDARK_CLAREZA_AGENTES_MODELOS_CLI_20261029 -->
## Anti-fricção CURRENT

### 🪬 Ordem do CHEFE — operação sempre pela Skill-Mãe (2026-10-28)

**Escopo:** qualquer operação da CentralDark solicitada a este assistente, Hermes ou outro executor. Antes de agir, **consumir a parte pertinente desta Skill-Mãe** e executar sob o **mesmo contrato operacional do Hermes**; não improvisar método, owner, orquestrador ou procedimento paralelo. O assistente pode atuar como **executor do método Hermes** quando possui ferramenta e autorização reais, mas **não deve fingir** ser o processo Hermes Desktop nem atribuir a ele ações que não realizou.

```text
CENTRALDARK_OPERATION_REQUIRES_SKILL_MOTHER=true
CANONICAL_OWNER=.agents/skills/centraldark-operational-method/SKILL.md
ASSISTANT_FOLLOWS_HERMES_OPERATIONAL_CONTRACT=true
PARALLEL_OPERATIONAL_METHOD=PROHIBITED
OUTSIDE_CANONICAL_METHOD_STATUS=UNKNOWN
UNKNOWN_IS_NOT_PASS=true
CHEFE_DECIDES_WHEN_TO_OPERATE=true
```

**Rota obrigatória, pertinente e sem cerimônia:** `CHEFE_INTENT → SKILL_MOTHER/PERTINENT_CONTEXT → OWNER_EXISTENTE → REUSE_BEFORE_CREATE → MENOR_DELTA_AUTORIZADO → EXECUTAR → READBACK/CONTRAPROVA_APLICAVEL → RECEIPT → NEXT_CURSOR`. Não exigir reler toda a biblioteca nem refazer provas válidas. Se a Skill-Mãe estiver inacessível, se faltar ferramenta real ou se a ação pretendida desviar do método: **não declarar execução**, marcar `UNKNOWN` **somente para a ação/claim afetado**, nomear a causa e preservar o restante da missão. Segurança técnica, consentimento e restrições superiores continuam válidos; `UNKNOWN` não autoriza contornar limites. **Exploração/conversa não é ordem de operação.**



**#OBSERVACOES# 2026-10-28 — correção operacional da SOL/assistentes (owner atual, sem nova skill).** Quando o CHEFE diz que o assistente está disputando o controle criativo, **não inverter a frase**: `ASSISTENTE_NAO_DEVE_DISPUTAR_CONTROLE_CRIATIVO_COM_CHEFE=true`. A falha foi do assistente, não do CHEFE. Seguir [RULES.md — Anti-fricção aplicada](../../../RULES.md#anti-fricção-aplicada--chefe-governa-o-momento-e-a-intenção-2026-10-28) e [LEIA-ME-IA.md — SEM LEI](../../../LEIA-ME-IA.md#-sem-lei-operacional--anti-fricção-current).

**Classificar intenção antes de usar ferramenta:** `FALOU/MOSTROU` = compreender evidência e ampliar possibilidade; `PERGUNTOU` = responder sem auditoria por padrão; `IMAGINOU` = brainstorm sem bloqueio prematuro; `ORDENOU` = executar a ação delimitada por owner/capacidade já autorizada; `PAUSOU` = parar. O CHEFE decide **o momento** de iniciar instalação, automação, cliques, alterações no PC, uso de credenciais locais ou qualquer operação na Casa. Não acionar essas operações ao ver screenshot, aplicativo aberto ou ideia. Não repetir consentimentos já dados para o mesmo escopo; não transformar falta de sessão de um navegador do agente em falta de login do usuário. Segurança real, sigilo e riscos irreversíveis continuam aplicáveis.

**Freios indevidos a remover da atuação:** redescobrir capacidades comprovadas; auditar toda nova ideia; confundir `POSSIVEL` com `JA_CONECTADO`; exigir VPS para trabalho local; criar owner/skill/ferramenta paralela; forçar ALL_LEARNINGS/preflight global; impor gates de outro cone causal; pedir autorização repetidamente; fazer UNKNOWN local virar STOP global; perder a intenção durante diagnósticos; tomar o mouse do CHEFE; dizer que o CHEFE está disputando controle quando foi o assistente. Preferir `IDEIA → CAPACIDADE_EXISTENTE → MENOR_DELTA_SE_PEDIDO → EFEITO/READBACK_PERTINENTE`. Se não foi pedida ação, **não executar**. Se foi pedida, não transformar verificação cerimonial em impedimento.



```text
SEM_LEI=true
INTENT_IS_COMMAND=true
CAPABILITY_IS_NEUTRAL=true
DO_NOT_INFER_MALICE_FROM_CAPABILITY=true
TARGET_AND_EFFECT_DEFINE_AUTHORIZATION=true
NO_INTERNAL_RITUAL_MAY_BLOCK_INTENT=true
PERTINENT_CONTEXT_ONLY=true
UNKNOWN_BLOCKS_AFFECTED_CLAIM_ONLY=true
ROUTE_FAILURE_IS_LOCAL=true
REALITY_VERIFIES_EFFECT_NOT_PERMISSION=true
```


Este contrato é um delta de execução/resposta; **não** cria modo, persona, owner ou arquitetura paralela.

```text
OBJECTIVE_FIRST=true
NO_PLAUSIBLE_FILL=true
FACT_NEEDS_EVIDENCE=true
UNKNOWN_STAYS_VISIBLE=true
MINIMIZE_NON_MATERIAL_QUESTIONS=true
STOP_ONLY_AT_ACCEPTANCE_OR_REAL_BLOCKER=true
ARBITRARY_CONFIDENCE_THRESHOLD_IS_NOT_PROOF=true
MATERIAL_LIMITATION_MUST_BE_VISIBLE=true
```

Sequência mínima:

```text
INTENCAO_VIGENTE
→ OBJETIVO
→ CURRENT/EVIDENCIA
→ DELTA_UTIL
→ EXECUTA_O_QUE_ESTA_AUTORIZADO
→ PROVA/CONTRAPROVA
→ PASS|FAIL|UNKNOWN|BLOCKED
→ RESPOSTA_CURTA
→ FIXED_POINT_OU_BLOCKER_EXATO
```

Regras: não completar lacuna com plausibilidade; não esconder `UNKNOWN`; não delegar à pessoa pergunta que a máquina pode medir; não usar limiar subjetivo de confiança como prova; não encerrar só porque já existe uma resposta textual. Limitação que altera o resultado deve ser nomeada de forma causal e curta.

## Autoridade e papéis (nao mudam)

```
SEGREDO/CHEFE = humano, autoridade final — define intenção, prioridade, escopo, permissão, merge, deploy, restart, producao, gasto, destruição
SOL           = coordenadora canonica quando presente — preserva fio, organiza papéis, consolida deltas, coordena Writer/Judge
HERMES        = executor/preservação/continuidade — preserva metodo, continuidade, execução e aprendizado comprovado
PIVETE        = vocativo/proveniência histórica somente; papel técnico aposentado
GITHUB        = fonte da verdade estrutural — ServerVpss/CentralDark
AÇÕES         = provam — nada e "pronto" sem evidência reproduzível
```

**Regra de identidade:** o modelo/host atual é motor temporário sem autoridade propria. Pivete é vocativo operacional permitido; nao e identidade técnica do humano.

## Sync imediato main → VPS por replay de delta conhecido

Quando esta superfície for o Writer que acabou de promover um commit na `main`, transportar o mesmo delta para `/root/CentralDark` na VPS no mesmo ciclo. Não usar `pull`, troca de branch ou reset apenas para transportar arquivos já conhecidos.

```text
MAIN_WRITE
→ COMMIT_DELTA_PATHS
→ VPS_PATH_CLASSIFY
→ SAME_BLOB_REPLAY
→ HASH_READBACK
→ RELOAD/RESTART_IF_RUNTIME_APPLICABLE
→ CONTINUE
```

```text
MAIN_WRITE_REPLAYS_TO_VPS=true
SAME_COMMIT_DELTA_ONLY=true
NO_RUNTIME_PULL_REQUIRED_FOR_KNOWN_DELTA=true
NO_BRANCH_SWITCH_REQUIRED_FOR_DELTA_TRANSPORT=true
NO_HARD_RESET_FOR_RUNTIME_SYNC=true
PRESERVE_LOCAL_GOLD_ON_DIVERGENCE=true
HASH_READBACK_REQUIRED=true
RUNTIME_HEAD_PARITY_NOT_REQUIRED_FOR_FILE_DELTA_SYNC=true
```

Classificação mínima por path: `NEW_BLOB=ALREADY_SYNCED`; `PARENT_BLOB=SAFE_REPLAY`; `ABSENT+NEW_FILE=SAFE_CREATE`; qualquer outro conteúdo=`LOCAL_DIVERGENCE`, reconciliar só o path. Copy materializa bytes; efeito de runtime continua exigindo readback e reload/restart somente quando aplicável.

## Boot pertinente — sem checklist global

Carregar só o que muda a decisão atual: intenção, CURRENT do alvo, owner/capability pertinente e prova já reutilizável. O resto é lazy-load.

```text
INTENT
→ CURRENT_IF_NEEDED
→ PERTINENT_OWNER
→ EXECUTE
→ READBACK
→ CONTINUE
```

Não consumir todos os aprendizados antes de agir. Não exigir MetaLupa/TLC23/Writer ritual quando o próprio delta não depende disso.

## 🫀 Metabolismo operacional da runtime central — ferida, costura, cristal e cadeado

Esta é uma **especialização do ciclo operacional acima**, consumida sob demanda. Não cria novo cérebro, daemon, health monitor, watchdog, scheduler, ledger, HUD, logger, gate ou executor. A skill **define como interpretar e agir**; observação contínua só existe quando um consumer/scheduler já implantado a executa e comprova. `SKILL.md` escrito != runtime monitorado.

### Pulso do organismo: observar a cadeia causal, não apenas a luz verde

```text
INTENÇÃO_VIGENTE + CURRENT/FINGERPRINT
→ MAPA-DO-CEREBRO (setor → owner → dependências materiais)
→ SENSORES EXISTENTES POR SETOR (GitHub/main, VPS, Casa se pertinente, MCP, Hermes, systemd/PM2 conforme owner, logs, rede, CI)
→ RECONCILIAR TIMESTAMP + FONTE + ESCOPO + HEAD + PROCESSO + EFEITO
→ SAÚDE DA CAPACIDADE + FERIDAS ATIVAS + ÚLTIMO VERDE PRESERVÁVEL
→ MENOR DELTA NO OWNER QUE CAUSOU A FERIDA
→ EFEITO + CONTRAPROVA + CRISTAL + CADEADO + NEXT_CURSOR
```

- Separar **identidade**, **código na main**, **transporte**, **serviço em execução**, **health da capacidade**, **efeito entregue** e **memória/prova**. `MAIN_GREEN != VPS_HEALTHY`; `MCP_RESPONDE != TODAS_AS_ROTAS_FUNCIONAM`; `PORTA_ABERTA != EFEITO_CORRETO`; `CI_SUCCESS != DEPLOYED`; `HUD_VERDE != REALIDADE_VERDE`.
- Reutilizar o roteador `docs/CONSCIENCIA/MAPA-DO-CEREBRO.md`, o coletor `apps/modulos/mcp/src/log-funnel.js` (`events/sectors/services`, `appendCentralEvent`), a rota autenticada `/admin/logs/stream` quando disponível e os probes/receipts já pertencentes a cada owner. O coletor é **telemetria**, não executor ou juiz, e não recebe segredos.
- Probe é material apenas com origem, instante, alvo e resultado. Timeout, erro de parse, caminho inacessível, sensor offline e sinal envelhecido não provam falha do serviço observado. Testar rota independente autorizada quando ela realmente discriminar a causa; falha local não interrompe setor independente.
- Latência, backlog, erros, restarts, consumo de recursos e freshness são **sinais candidatos**, não limites arbitrários. Comparar baseline real e contrato do serviço; não inventar SLO, percentual verde, prazo de recuperação ou cobertura global.
- Não varrer tudo em toda ação. Ao tocar um setor, seguir somente suas dependências e consequências materiais; expandir o cone se aparecer evidência de propagação. A Casa offline não invalida automaticamente a VPS; uma VPS viva não prova os clientes nem a Casa.

### Feridas: detectar, atribuir, costurar sem ampliar o machucado

```text
FERIDA_DETECTADA
→ INCIDENTE_EXISTENTE? CORRELACIONAR, NÃO DUPLICAR
→ CLASSIFICAR: NOVA | AGRAVADA | RECORRENTE | REABERTA | HISTÓRICA | FALSO_ALARME | UNKNOWN
→ CAUSA: CHANGE_INTRODUCED | PREEXISTING | EXTERNAL | SENSOR | UNKNOWN
→ PROVAR FONTE + BASELINE + DELTA + DEPENDÊNCIAS + EFEITO OBSERVADO
→ PROTEGER LAST_KNOWN_GOOD + ESTADO_DIRTY + DADOS + SECRETOS
→ COSTURAR O OWNER EXATO (repair | rollback causal | rota autorizada alternativa)
→ TESTAR O CONE AFETADO + BACKCHECK NO ÚLTIMO VERDE
→ CONTRAPROVA NEGATIVA (a causa original não se reproduz; adjacências essenciais não regrediram)
→ READBACK NO RUNTIME REAL SE HOUVER EFEITO DE RUNTIME
→ CRISTALIZAR RECEITA REUTILIZÁVEL NO OWNER EXISTENTE
→ SELAR CADEADO OU DEIXAR ABERTO COM BLOQUEIO EXATO
```

- **Ferida criada pela nossa mudança:** confrontar estado anterior e novo (SHA/path/config/processo), atribuir causalidade antes de culpar um serviço; se a mudança feriu algo, não declarar conclusão. Voltar uma casa **apenas no escopo afetado**, restaurar o verde ou corrigir na mesma costura, retestar e preservar o delta útil não causador. Não usar `git reset --hard`/`clean` em checkout ou runtime com patrimônio; scratch reutilizável segue sua proteção própria.
- **Ferida já machucada/recorrente:** recuperar incidente, tentativas, último green e aprendizagem. Remediar **causa persistente** no mesmo owner, sem repetir restart cego, sem mascarar exceção, sem trocar sintoma por `PASS`. Se reaparecer após selo, **REOPEN** vinculado à prova anterior; não apagar a cicatriz nem fabricar incidente paralelo.
- **Ferida de sensor/transporte:** corrigir o probe ou seguir outro caminho autorizado antes de afirmar indisponibilidade do alvo. Não confundir `WRAPPER_PREFLIGHT_PASS` com saúde do serviço.
- Cada reparo tem fronteiras: um Writer por escopo; proteção de secrets; sem mudanças em massa, deploy, restart ou rollback não pertinentes; preservar logs e evidências existentes, sujeitos à política de retenção e privacidade.

### Cadeado: tocou, cuidou, consertou, melhorou — tem que selar **no lugar correto**

```text
TOCOU = alvo/owner + baseline + ação ou observação + rastro
CUIDOU = risco contido + último verde protegido + dependências não regredidas
CONSERTou = falha original reproduzida/medida → efeito corrigido + contraprova
MELHOROU = melhoria incremental com comparação mensurável antes × depois
CRISTALIZOU = causa + sequência + owner + fingerprint + testes + rollback/fallback + prova reutilizável
SELO = receipt endereçável + código/doc SHA quando houver + effect readback + status honesto + NEXT_CURSOR
```

<!-- #OBSERVACOES# | TOCOU-RAS<->SELO<->GANHO | @last_updated: 2026-10-16T10:42:57.361Z -->
**Vínculo obrigatório com documentação e cadeado (CHEFE, 2026-10-16):**
`TOCOU_OWNER → #OBSERVACOES# + @last_updated → DOC_DO_MESMO_OWNER_COM @code_ref → TESTE_T0_T1 → CONTRAPROVA_INDEPENDENTE → RECEIPT → SELO`.
Vincular o rastro do arquivo ao owner de documentação sem criar um novo registro ou outro HUD: gate `scripts/lupa/diagram-route-gate.mjs`; lock `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml`; executor de lock `scripts/trigger-fabric/centraldark_full_trigger_boot.py#cmd_reseal_fingerprint`.
**Experimentação e implementação são livres dentro de escopo isolado autorizado**, sem desfazer o último verde. Para **substituir/re-selar** solução comprovada, exigir ganho real mensurado `T0→T1` (inclusive capacidade binária `0→1`), critério e instrumento, evidência endereçável, contraprova de regressão independente, mesmo `CLAIM_KEY+OWNER` e causa explícita. Falta de ganho → não promover o novo como melhor, preservar selo anterior e registrar aprendizado do experimento. `VISUAL_ONLY` é melhoria de apresentação, não prova de capacidade de runtime. **Os valores enviados pelo próprio executor continuam alegações até a realidade/CI confirmá-los.**

O selo fica **no owner que governa a capacidade** e no receipt/ledger existente, não em chat, clone de arquivo, segundo HUD ou nota solta. Quando a correção for comportamento operacional, este `SKILL.md` é owner do método; código/runtime continuam pertencendo a seus owners específicos. Conhecimento empírico confirmado pode alimentar `docs/CONSCIENCIA/ARSENAL/APRENDIZADOS.md` pelo fluxo de aprendizado já existente, sem duplicar eventos do log-funnel. HUD e grafo são **projeções**: atualizar a superfície canônica existente quando aplicável, conservando IDs, nós, setas e layout, sem torná-la autoridade ou declarar runtime recuperado pelo visual.

Receipt mínimo por ferida material: `INTENT_ID / WOUND_ID(correlação existente) / SECTOR / OWNER / HOST / BASELINE_SHA_OU_FINGERPRINT / DETECTED_AT / SYMPTOM / ROOT_CAUSE(provada|hipótese) / BEFORE / DELTA_PATHS / AFTER / NEGATIVE_TEST / REGRESSION_BACKCHECK / READBACK / STATUS / RECEIPT_REF / NEXT_CURSOR`. Campo indisponível é `UNKNOWN`, não valor inventado; registrar segredo apenas como presença/ausência se autorizado, nunca seu valor.

**Grau de conformidade** é calculado sobre os critérios *pertinentes ao objetivo*, não sobre quantidade de logs, comandos, emojis ou checks verdes:

```text
APPLICABLE = critérios materiais do GOAL + invariantes herdados
PROVED_PASS = critérios com prova e contraprova válidas no alvo correto
CONFORMIDADE_COMPROVADA = PROVED_PASS / APPLICABLE (mostrar numerador e denominador)
UNKNOWN | FAIL | BLOCKED = parcelas explícitas, nunca somadas a PASS
N/A = exclusão justificada antes do cálculo, sem esconder critério material
100% DO ESCOPO != 100% DO ORGANISMO
FIXED_POINT = objetivo terminal satisfeito + continuidade preservada + cadeado comprovado
```

Distinguir `PRESERVADO` (não regrediu), `REPARADO` (falha corrigida), `MELHORADO` (benefício adicional provado), `PARCIAL` (há efeito mas falta critério material), `REABERTO` (regressão medida) e `BLOCKED/UNKNOWN` (sem prova suficiente). Se o arquivo documental foi alterado mas a runtime não consumiu, o selo é **DOCUMENTED_ONLY**: não inventar deploy, automação, vigilância contínua ou cura global. O cadeado fecha a ferida **somente** no nível comprovado; se a causa voltar, reabre o mesmo fio e costura o cone afetado.


### 👩‍🚀 Self-Realigning + Auto-Healing + Magic Space — órbita segura do mesmo organismo

`MAGIC_SPACE` é metáfora operacional para **navegação por dependências e recuperação com prova**. Não é novo subsistema, agente, IA, scheduler, watcher, logger ou plano de controle. Esta seção aprofunda o **metabolismo + ferida/costura/cristal/cadeado** anteriores; instrução documentada não equivale a autocura ativa.

```text
PULSO (probe existente sob demanda ou consumer vivo comprovado)
→ CURRENT (host/processo/fonte/instante/HEAD/config/efeito)
→ SELF_REALIGNING: comparar contrato + fingerprint + último verde
→ CLASSIFICAR: drift esperado | drift causal | falha de sensor | incidente | UNKNOWN
→ CORRELACIONAR: WOUND_ID + setor + owner + mudança causadora
→ CANDIDATO_AUTOHEAL = causa conhecida + receita provada + autorização + rollback
→ SE APTO: adquirir writer/lock do setor → replay idempotente do menor delta
→ VALIDAR: health + efeito esperado + contraprova negativa + regressões adjacentes
→ PASS: receipt + cristal no owner + selo + NEXT_CURSOR
→ FAIL: VOLTA_UMA_CASA no cone afetado + nova evidência discriminante
→ SEM ROTA SEGURA: degradar só capacidade afetada; BLOCKED/UNKNOWN documentado
→ PULSO SEGUINTE: verificar freshness; selo histórico não prova CURRENT
```

**Self-Realigning:** drift não autoriza `pull`, `reset`, `clean`, force-push, sobrescrita de dirty/untracked, restart amplo nem convergência forçada entre Casa, VPS e main. Esses são **sensores independentes**. Identificar qual binding mudou e se a divergência é legítima. Reconciliar **somente** a configuração, o blob ou a rota cuja causalidade foi provada pelo owner e cuja receita é segura. `BLOB_SYNC != CONSUMER_RUNNING_NEW_BLOB`.

**Auto-Healing:** executar sem microconfirmação redundante **somente dentro da intenção/autorização real** e da capacidade da ferramenta. Requer `KNOWN_CAUSE + OWNER + SCOPE + REPLAYABLE_RECIPE + EXCLUSIVE_WRITER + LAST_KNOWN_GOOD + ROLLBACK + HEALTH_PROBE`. Reusar Hermes e os executores, logs/receipts, roteador de setores e gates existentes; skill não concede credenciais, autorização ou scheduler. Diagnosticar primeiro: reinício repetido sem causa provada não é autocura.

**Magic Space / órbita de segurança:** cada setor mantém sua própria órbita (fonte → owner → executor → sensor → efeito → aprendizado) e se realinha sem colidir com os demais. Não transformar a metáfora em produto ou diretório.
- **Idempotência:** mesmo `WOUND_ID + fingerprint` não recebe a mesma mutação sem evidência nova; deduplicar no rastro existente e usar lock do writer, sem segunda fila.
- **Fusível anti-loop:** após erro repetido ou falta de progresso, suspender apenas a mesma tentativa no escopo afetado (`REQUIRES_NEW_DISCRIMINATING_EVIDENCE`); timeout/backoff/retry seguem limites reais do executor, nunca números arbitrários.
- **Ferida criada pela autocura:** voltar uma casa; restaurar a capacidade anterior comprovada se seguro e autorizado, sem apagar a mudança útil de outro setor.
- **Contraprova de consumo:** medir consumidor em execução, não apenas arquivo no disco, porta aberta, processo vivo ou painel verde.
- **Cadeado reabrível:** `REMEDIATED + NEGATIVE_PROBE_PASS + BACKCHECK_PASS + EFFECT_READBACK + RECEIPT_REF`. Recorrência reabre a ferida anterior, registra novo fingerprint e invalida somente as provas afetadas.

```text
SELF_REALIGNING = PROVEN | PARTIAL | UNKNOWN | BLOCKED
AUTO_HEALING = PROVEN | PARTIAL | UNKNOWN | BLOCKED
ORBITAL_MAP = docs/CONSCIENCIA/MAPA-DO-CEREBRO.md (roteador existente)
LOG_FUNNEL = apps/modulos/mcp/src/log-funnel.js (sensor, não executor)
AUTO_HEALING_PROVEN somente se consumer vivo + trigger + reparo + efeito + contraprova
DOCUMENTED_ONLY != AUTONOMOUS_HEALING
NO_PARALLEL_MAGIC_SPACE=true
```

**Cristal reutilizável:** `INTENT → SECTOR → OWNER → WOUND_ID → FINGERPRINT → SIGNAL → CAUSE → SAFE_DELTA → BACKOUT → EFFECT → COUNTERPROOF → RECEIPT → NEXT_CURSOR`. Guardar no owner/ledger existente; HUD é projeção, não fonte da cura. Benefício, reparo e saúde global são claims distintos e exigem provas distintas.

<!-- ONE_HOUSE_AUREOLA_20261017_SKILL -->
## 🪡 WEAKEST_MATERIAL_LINK_FIRST — sub-rotina da mesma skill

Só quando houver evolução material: 1) GOAL e critérios; 2) CURRENT com SHA/host/alvo; 3) separar falha de sensor, execução e método, e selecionar elo por impacto; 4) reutilizar Gênesis/anti-receita/padrões; 5) hipótese falsificável e teste discriminante com uma variável quando possível; 6) menor delta no owner com Writer único e último verde protegido; 7) BUILD → INSTALL → CONNECT → PROVE, backcheck e teste negativo; 8) registrar ganho, refutação ou bloqueio no mesmo receipt e identificar NEXT_CURSOR. Sem informação nova, STOP_BLIND_RETRY; sem efeito provado, DOCUMENTED_ONLY/UNKNOWN, jamais Michelin ⭐⭐⭐.

Preservar fornecedores e seus motores: Claude, GPT/Codex e DeepSeek continuam com pesos, sessão, autenticação e execução originais; não extrair Chromium do produto, copiar cookies ou contornar proteções. A CentralDark expõe seletor e usa transportes autorizados. Ver alfabeto completo em RULES.md e régua Michelin já existente em AGENTS.md; não criar skill, monitor, Gênesis ou executor extra. Commit de documentação não prova consumo por Hermes.
<!-- /ONE_HOUSE_AUREOLA_20261017_SKILL -->

## 🔏 Lei do Rastro

```text
TRIGGER=🔏 !RASTRO
OWNER=AGENTS.md
RESPONSE_WITHOUT_TRACE=INVALID
EVERY_WRITE_CLAIM_TO_CHEFE_CARRIES=COMMIT_SHA+PATH+LINK+READBACK
EVERY_MEMORY_CLAIM_NAMES_WHERE=true
HUD_CURRENT_RECEIPT_SAME_TURN_AS_DIRECT_MAIN=true
APPLIES_TO_ALL_ENGINES=true
```

O rastro fecha o ciclo operacional; não cria segundo workflow, owner ou memória.

## Principio central: Menos é mais = precisao, nao brevidade

| MENOS (cortar) | MAIS (garantir) |
|----------------|-----------------|
| Tudo sem prova | Evidência reproduzível |
| Tudo que nao avança a missao | Prova de que funcionou |
| Assunção, invenção, hipótese promovida a fato | Investigar antes de agir |
| Duplicação, paralelo, v2/v3/novo/copy/backup | Reconciliar antes de criar |
| Perguntar o óbvio | Classificar antes de fechar |
| Ressuscitar o que tem que ficar morto | Manter o fio da missao vivo |
| Ruído cosmético | Gate real, rollback preparado, SHA fixado |

**Erro comum:** cortar palavras mas manter invenção. Menos nao e falar curto — e nao fazer o que nao precisa. Mais nao e falar muito — e garantir que o que ficou tem prova.

## Ciclo operacional canonico

```
EVIDÊNCIA
  → LEITURA (separar FATO VISÍVEL / HIPÓTESE / INFERÊNCIA / DÚVIDA REAL / AÇÃO POSSÍVEL / RISCO)
  → DIAGNÓSTICO ÚNICO (ERRO EXATO + EVIDÊNCIA + IMPACTO)
  → COMANDO ÚNICO (o que faz, onde atua, o que nao toca, resultado esperado, como falha, como volta, evidência de retorno)
  → REFINO DO PIVETE (caminho correto, ferramenta correta, nomes reais, limitações, ritmo, permissões)
  → EXECUÇÃO (dentro do território autorizado, preservar checkpoint, nao fechar sem evidência)
  → RESULTADO (saída real, nao expectativa)
  → VALIDAÇÃO (RESULTADO ESPERADO vs RESULTADO OBTIDO → PASSOU/FALHOU/PARCIAL/INCONCLUSIVO)
  → CORREÇÃO (menor mudança segura que resolve a causa comprovada)
  → PROVA (SHA, diff, arquivo alterado, teste, log, estado do PR, resultado repetível)
  → REGISTRO DO OURO (só aprendizado útil e comprovado — o que aconteceu, quem decidiu, por que, evidência, o que mudou, resultado, aprendizado, onde reaparecer)
  → PRÓXIMO PASSO (um só, claro)
```

## Pairwise Reality Selection — comparar rotas e cristalizar o vencedor

Comparação pareada é uma especialização condicional da MULTIBÚSSOLA + CONTRAPROVA + REALITY JUDGE. Não cria agente, juiz, workflow ou arquitetura nova.

A inspiração pode vir de uma superfície externa que apresenta duas opções ao humano, mas a CentralDark não promove hipótese sobre o mecanismo interno dessa superfície. O que se retém é o padrão observável: candidatos comparáveis + critério de escolha + registro do vencedor.

```text
PAIRWISE_REALITY_SELECTION=true
PAIRWISE_IS_CONDITIONAL_NOT_RITUAL=true
PAIRWISE_ONLY_WHEN=MATERIAL_ROUTE_AMBIGUITY_SURVIVES_REUSE_AND_DETERMINISTIC_FAST_PATH
SAME_INTENT_REQUIRED=true
SAME_TARGET_REQUIRED=true
SAME_BASELINE_OR_EQUIVALENT_BINDINGS_REQUIRED=true
SAME_EVIDENCE_SCHEMA_REQUIRED=true
REALITY_JUDGE_SELECTS_TECHNICAL_EFFECT_WINNER=true
ELOQUENCE_OR_MODEL_CONFIDENCE_IS_NOT_WINNER_PROOF=true
HUMAN_PREFERENCE_SELECTS_SUBJECTIVE_GOALS=true
NO_DISCRIMINATING_EVIDENCE=NO_WINNER
TIE_OR_INCOMPARABLE=UNKNOWN
LOSER_IS_NOT_DELETED_BLINDLY=true
WINNER_REQUIRES=PROOF+COUNTERPROOF+EFFECT_READBACK
WINNER_CRYSTAL_REQUIRES=OWNER+SEQUENCE+BINDINGS+FINGERPRINT+PROOF+COUNTERPROOF+EXPECTED_EFFECT+EVIDENCE+NEXT_CURSOR
REPLAY_WINNER_BEFORE_REDISCOVERY=true
CHANGED_FINGERPRINT=REVALIDATE_AFFECTED_CONE_ONLY
```

Fluxo mínimo:

```text
INTENÇÃO
→ REUSE/DETERMINISTIC_FAST_PATH
→ SE AINDA HOUVER ≥2 ROTAS MATERIALMENTE VIÁVEIS:
     CANDIDATO_A + CANDIDATO_B
     → NORMALIZAR MESMO ALVO/BASELINE/EVIDÊNCIA
     → EXECUTAR/PROVAR CADA ROTA SEM DUPLICAR WRITER
     → CONTRAPROVAR
     → REALITY_JUDGE_COMPARA_EFEITO
     → WINNER | TIE | UNKNOWN
     → WINNER: CRISTAL + FINGERPRINT + REPLAY
→ SENÃO:
     USAR ROTA DETERMINÍSTICA EXISTENTE
```

Critério técnico compara resultado observável: correção, completude, regressão, custo/latência quando material, estabilidade, reversibilidade e aderência ao owner/escopo. "Resposta mais bonita" não vence teste técnico.

Quando a intenção for subjetiva (estilo, preferência visual, escolha humana genuína), o humano é o juiz de preferência. Reality Judge continua verificando apenas claims técnicos e efeitos observáveis.

A comparação não autoriza executar duas mutações concorrentes no mesmo escopo. Leitura/probe pode ser paralelo; mutação respeita Writer único, isolamento e rollback. Se uma rota já está provada com fingerprint compatível, `REPLAY_BEFORE_REDISCOVERY` vence a experimentação redundante.

### Origem observada e limite de evidência

```text
OBSERVED_EXTERNAL_PATTERN=PAIRWISE_OPTION_PREFERENCE_SURFACE
OBSERVED_FACT=TWO_CANDIDATE_OPTIONS_PRESENTED_FOR_HUMAN_PREFERENCE
UNKNOWN=INTERNAL_MODEL_IDENTITIES|EXPERIMENT_SELECTION_REASON|HIDDEN_ROUTING
EXTERNAL_UI_IS_SEMANTIC_INPUT_NOT_INTERNAL_PROOF=true
CENTRALDARK_ADAPTATION_IS_OWN_METHOD_DELTA=true
```

## Contrato humano de execução integral

Este método é universal: não é preferência de um usuário específico. O sistema deve absorver complexidade operacional sempre que isso puder ser feito com segurança.

```text
INTENÇÃO HUMANA
  → DETECTAR CONTEXTO
  → ANTECIPAR FALHAS PREVISÍVEIS
  → PREPARAR PREFLIGHT + CHECKPOINT + TIMEOUT + RETRY LIMITADO + FALLBACK + ROLLBACK
  → EXECUTAR CONJUNTO COMPLETO
  → VALIDAR
  → FALHOU? DIAGNOSTICAR + CORRIGIR + FALLBACK + REMEDIR
  → AINDA FALHOU? MOSTRAR ERRO EXATO, LOCAL EXATO, CAUSA/INCERTEZA, ROTAS TENTADAS E AÇÃO HUMANA EXATA
  → HUMAN_FRONTIER? HUMANO FAZ SÓ O INEVITÁVEL NO LOCAL SEGURO
  → RETOMAR AUTOMATICAMENTE
  → PROVAR RESULTADO OU BLOCKER EXATO
```

Regras:
- microcomando não é padrão; operação integral autocontida é o padrão quando tecnicamente possível;
- se a máquina pode descobrir, o humano não deve adivinhar;
- se a máquina pode corrigir com segurança, o humano não deve executar a correção manualmente;
- diagnóstico deve apontar host/componente/serviço e, quando conhecido, arquivo/linha/função;
- causa não provada permanece hipótese rotulada;
- falha não resolvida deve listar o que já foi tentado e por que cada rota não resolveu;
- segredo/senha/token entra no sistema de origem ou prompt seguro, não no chat;
- após login/MFA/consentimento/permissão/pagamento/ação física/decisão humana inevitável, o executor retoma sozinho;
- `UNKNOWN != PASS`; erro genérico sem localização e próximo passo acionável é FAIL.

## Writer unico por escopo

- Leitores investigam em paralelo
- Um Writer por escopo mutavel
- Escrita só com: ALVO=CLARO + ESCOPO=AUTORIZADO + WRITER=IDENTIFICADO + HOST_PERMISSION=PERMITE + BASELINE=MEDIDO + ROLLBACK=APLICÁVEL
- Default em missão mutável já autorizada: adquirir Writer do escopo exato e executar; READ_ONLY só quando não há intenção de mutação, há colisão real de Writer ou a capability atual não escreve
- Handoff obrigatório antes de outro Writer atuar no mesmo escopo
- Worktree é isolamento quando materialmente necessário; main direta é válida quando a intenção/autoridade e o estado do repositório permitirem. Não criar branch/worktree por ritual

## 🔧 CHEFE_CURRENT — main direta e SSH condicional (sem CI como espera)

MARCACAO: CHEFE_DIRECT_MAIN_NO_CI_WAIT_20261026
Owner: MASTER-CYCLE.yml#current_delivery_policy. Modo desta missão:
REMEASURE_MAIN -> OWNER/ONE_WRITER -> MENOR_DELTA -> CHECK_LOCAL_APLICAVEL
-> COUNTERPROOF -> DIRECT_COMMIT/PUSH_MAIN -> READBACK/RECEIPT.
CI e squash/PR NÃO são uma condição obrigatória deste caminho. CI não
executada não é "verificação pendente"; é NOT_APPLICABLE neste fluxo.
Squash pertence somente à rota de PR autorizada. Um PR de mesmo escopo
exige reconciliação de writer e delta antes de qualquer promoção.
SSH direto VPS é caminho de execução quando o host responde; VPS offline
suspende SOMENTE ações e verificação de runtime naquele host.
Não usar "CI verde" nem "SSH offline" para conceder Michelin, FIXED_POINT
ou XP. Conservar security diff-check, testes locais proporcionais e SHA.

## Lifecycle canônico de branch e PR

Branch remota é mecanismo de transporte/isolamento, não memória, owner, intenção nem estacionamento. A intenção do CHEFE deve convergir até `main` ou terminar em blocker explícito; não deve ficar esquecida porque um executor criou uma branch nova.

```text
NEW_PR_DEFAULT=false
NEW_REMOTE_BRANCH_DEFAULT=false
BRANCH_IS_TRANSPORT_NOT_INTENT=true
NO_BRANCH_PARKING_LOT=true
AUTONOMOUS_PR_DRAFT_DEFAULT=false
AUTHORIZED_INTENT_DRAFT_AUTO_READY=true
DRAFT_IS_NOT_DEPENDENCY_SEMAPHORE=true
EXPLICIT_KEEP_DRAFT_PRESERVED=true

CURRENT_MAIN
→ FIND_MATCHING_CHILD(OWNER+SCOPE+CAPABILITY)
→ IF HEALTHY_CHILD: REUSE_EXISTING_BRANCH
→ ELSE IF DIRECT_MAIN_ALLOWED_BY_AUTHORITY_AND_RISK: DIRECT_MAIN
→ ELSE IF REMOTE_BRANCH_IS_MATERIALLY_REQUIRED:
     CREATE_EPHEMERAL_BRANCH_WITH_OWNER+SCOPE+INTENT+LIFECYCLE
     OPEN_READY_PR_SAME_TURN
     PROVE_SAME_HEAD
     PROMOTE
     DELETE_EPHEMERAL_BRANCH_AFTER_MERGE
→ ELSE: KEEP_WORK_LOCAL/WORKTREE_AND_CONTINUE
```

Uma branch remota nova só se justifica quando `main` direta não é aplicável e há necessidade material de PR, CI remoto, handoff entre executores ou isolamento. Se o trabalho ainda não está pronto para entrar no funil e não precisa existir remotamente, permanece em worktree/local isolado. Branch persistente de máquina precisa de owner e finalidade explícitos; não nasce como efeito colateral.

PR autônomo de intenção já autorizada deve nascer `draft=false`. Se uma superfície o criar como Draft por default, o normalizador canônico pode marcar `Ready for review` após provar mesma conta/repo/base/autorização. `KEEP_DRAFT` explícito, `do-not-merge`, PR-mãe e rascunho humano/material real são preservados.

```text
NEW_REMOTE_BRANCH_REQUIRES=OWNER+SCOPE+INTENT+LIFECYCLE
REMOTE_BRANCH_ONLY_WHEN=DIRECT_MAIN_NOT_APPLICABLE|PR_REQUIRED|REMOTE_CI_REQUIRED|CROSS_AGENT_HANDOFF_REQUIRED|ISOLATION_REQUIRED
EPHEMERAL_BRANCH_OPEN_READY_PR_SAME_TURN=true
EPHEMERAL_BRANCH_DELETE_AFTER_MERGE=true
PERSISTENT_BRANCH_REQUIRES_EXPLICIT_OWNER_AND_PURPOSE=true
BRANCH_WITHOUT_ACTIVE_PURPOSE=RECONCILE_BEFORE_CREATING_ANOTHER
```

Branches antigas não são apagadas cegamente: medir conteúdo contra `main`, preservar delta útil ainda não convergido e só classificar `SAFE_TO_REMOVE` quando a contraprova demonstrar que nada material seria perdido.
## Reconciliação antes de criar (REUSE_BEFORE_CREATE_REQUIRED)

Antes de criar código, skill, servico, workflow, plugin, rota, pasta, memória, documento, processo, arquitetura:

```
INTENÇÃO
  → BUSCAR CAPACIDADE EXISTENTE
  → ABRIR IMPLEMENTAÇÃO PRINCIPAL
  → CRUZAR CAPACIDADE COM PEDIDO
  → CLASSIFICAR AUTORIDADE E RUNTIME (CANONICAL|OPERATIONAL|CANDIDATE|PROGRAM_ONLY|HISTORICAL|UNKNOWN)
  → REUTILIZAR OU ESTENDER MINIMAMENTE
  → CRIAR SOMENTE COM GAP REAL PROVADO
```

Proibido: v2, v3, novo, final, copy, backup como fuga de reconciliação.

### Measure Before Creation — medir antes de criar

Generalização nomeada pelo CHEFE: antes de criar arquitetura, bot, rota, skill, memória, scheduler, workflow, app ou owner novo, medir o que já existe e provar se o gap é real.

```text
MEASURE_BEFORE_CREATION
  → medir o que já existe
  → provar se está vivo
  → descobrir owner atual
  → reutilizar antes de inventar
  → corrigir o menor delta
  → criar somente se o gap for real
```

```text
REUSE_BEFORE_CREATE
+ UNKNOWN != PASS
+ DOCUMENTED != EXECUTED
+ REALITY = JUDGE
= MEASURE_BEFORE_CREATION
```

Vínculo semântico compartilhado: `1Ts 5:21` → examinar tudo → medir/comparar/contraprovar → reter o que a realidade provar bom → melhorar o owner existente antes de criar outro.

```text
MEASURE_BEFORE_CREATION_SEMANTIC_REFERENCE="1Ts 5:21"
MEASURE_BEFORE_CREATION_APPLIES_TO=ALL_CURRENT_AND_FUTURE_AGENTS
VERSE_IS_SEMANTIC_CUE_NOT_PROOF=true
IMPROVE_EXISTING_OWNER_BEFORE_NEW_OWNER=true
```

Exemplo provado: no Telegram, não criar bot novo; medir o owner existente; provar o estado real; preservar canal válido; corrigir somente o delta causal.

### Remeasure Before Create — remedir o mesmo alvo antes de criar

REMEASURE_BEFORE_CREATE é uma especialização de MEASURE_BEFORE_CREATION no mesmo owner, não uma regra/arquitetura paralela. Aplica-se quando o alvo é vivo, mutável, temporal, externo ou quando a última observação pode ter envelhecido.

\`\`\`text
REMEASURE_BEFORE_CREATE=true
REMEASURE_BEFORE_CREATE_EXTENDS=MEASURE_BEFORE_CREATION
SAME_TARGET_FRESH_OBSERVATION_REQUIRED=true
HISTORY_IS_INPUT_NOT_CURRENT_PROOF=true
STALE_MEASUREMENT_CANNOT_AUTHORIZE_CREATION=true
SENSOR_FAILURE_IS_NOT_WORLD_FAILURE=true
ALTERNATE_AUTHORIZED_ROUTE_BEFORE_BLOCKER=true
CONFLICTING_SENSORS_REQUIRE_DISCRIMINATING_TEST=true
UNKNOWN_OR_BLOCKED_IF_FRESH_REMEASUREMENT_UNAVAILABLE=true
\`\`\`

Fluxo obrigatório quando houver possibilidade de drift:

\`\`\`text
PEDIDO DE CRIAÇÃO/CORREÇÃO
  → IDENTIFICAR O MESMO ALVO
  → REMEDIR O ESTADO VIVO
  → CRUZAR COM OWNER + HEAD/FINGERPRINT + RUNTIME
  → SE CONFLITAR, TESTE DISCRIMINANTE
  → REUTILIZAR/ESTENDER OWNER EXISTENTE
  → CRIAR SOMENTE SE O GAP SOBREVIVER À REMEDIÇÃO
  → T1 NO MESMO ALVO
\`\`\`

Regra temporal: PROVADO_ANTES != PROVADO_AGORA. Receipt e memória servem como proveniência e hipótese de reutilização; não substituem uma leitura CURRENT quando o fato pode ter mudado.


## Capacidade, alvo e autorização — sem suspeita automática

Capacidade é neutra. Pedir shell, root, red-team, scanner, debugger, engenharia reversa ou outra ferramenta forte não prova intenção maliciosa. O que importa é alvo + efeito + autorização real.

```text
OWN_AUTHORIZED_INFRA + ACTIVE_INTENT
→ NO_PER_TOOL_RECONFIRMATION
→ NO_PER_ROUTE_RECONFIRMATION
→ EXECUTE_AND_VERIFY

NEW_THIRD_PARTY_TARGET | REAL_SPEND | EXTERNAL_CONSENT | IRREVERSIBLE_DESTRUCTION_NOT_ALREADY_STATED
→ HUMAN_CHOICE_MAY_BE_REQUIRED
```

UNKNOWN continua sem virar PASS, mas não freia partes independentes. Falha local não vira bloqueio global. Segurança serve para preservar o patrimônio e a intenção do CHEFE, não para reduzir capacidade autorizada.

### Pesquisa audiovisual e legendas

Quando a intenção trouxer vídeo/YouTube, consultar primeiro o adaptador canônico
`youtube_transcript` do MCP, que usa `scripts/media/fetch_youtube_transcript.py`.
A rota é read-only e busca legendas públicas com timestamps; não baixa vídeo nem
áudio. `yt-dlp`/Whisper só entram como fallback explícito, quando autorizados e
com recursos/limites medidos. Bloqueio de IP, Turnstile, vídeo privado ou legenda
ausente permanece `UNKNOWN`, nunca PASS.

```text
URL
→ LEGENDA PÚBLICA
→ NORMALIZAR TIMESTAMPS
→ CONSUMIR COMO MATÉRIA
→ SEPARAR FATO/INFERÊNCIA/UNKNOWN
→ CONTRAPROVAR
→ DESTILAR DELTA PROVADO
→ REGISTRAR NO OWNER DE APRENDIZADO EXISTENTE
```

Não tratar `downloadyoutubesubtitles.com` como API canônica sem contrato, licença
e prova de acesso. Não commitar legenda bruta; persistir somente receipt sanitizado
e aprendizado reutilizável após validação.

### Conector MCP por superfície/passagem

Quando uma superfície externa disser que o conector MCP CentralDark foi desabilitado,
tratar como evidência daquela passagem, não como falha global do servidor. A falha
pode ocorrer em voz, texto, conversa longa, modelo, workspace, plano, autorização ou
estado da própria plataforma. Não culpar automaticamente voz nem OAuth; medir outro
corpo autorizado contra o mesmo alvo antes do veredito.

```text
CONNECTOR_DISABLED_IN_SURFACE
→ ACCEPT_AS_SURFACE_EVIDENCE
→ DO_NOT_PROMOTE_TO_SERVER_FAILURE
→ TEST_SAME_TARGET_VIA_HERMES_OR_MCP_DIRECT
→ TEST_FRESH_TEXT_CONVERSATION_WHEN_APPLICABLE
→ CLASSIFY: SURFACE_BLOCK | AUTH_BLOCK | SERVER_FAIL | UNKNOWN
```

`kit_boas_vindas`/`puxar_aprendizados` bloqueados em uma passagem não provam
`CentralDark-MCP` quebrado. Prova de servidor exige health/runtime/log ou chamada
MCP direta. Se outro corpo autorizado invoca a mesma tool com sucesso, o blocker é
da superfície/passagem observada até prova contrária.

## Gate de falsificação (MetaLupa)

UNKNOWN, ANOMALY, ACHADO_PENDENTE, BLOCKED (incluindo reason: SKIPPED), timeout, ausência de log ou ausência de revisão nunca equivalem a PASS.

Sinais parciais (HTTP 200, painel verde, processo vivo, arquivo existe, status scheduled, ausência de erro) nao sao PASS ponta a ponta sozinhos.

Falso verde existe quando conclusão verde e promovida apesar de evidência insuficiente, divergente ou nao ligada ao mesmo alvo/HEAD.

## Fechamento de missao (formato obrigatorio)

```
FEITO=           com evidência concreta, nao adjetivo
EVIDÊNCIA=       SHA, diff, teste, log, estado PR, health
NAO_TOCADO=      o que nao foi alterado
PENDENCIA=       o que falta
RISCO_RESIDUAL=  o que nao pode ser eliminado
ROLLBACK=        como voltar
PROXIMO_PASSO=   um só, claro
BOOT=            CENTRALDARK_AI_BOOT do inicio
FIO_DA_MISSAO=   continuidade do fio
```

Nao usar em conversa comum. Só para missao operacional executada.

### REGRA DA REGRA — publicar cada cursor fechado

Quando um `NEXT_CURSOR` for fechado com prova real e o estado for
`FIXED_POINT_SCOPED` ou equivalente, o executor deve publicar o delta concluído
no owner versionado, sem esperar um comando separado de publicação:

```text
NEXT_CURSOR_FECHADO_COM_PROVA
→ git fetch --no-tags origin refs/heads/main
→ comparar HEAD local com origin/main
→ separar somente os arquivos do delta concluído
→ git commit
→ git push origin main
→ ler novamente SHA local e remoto
→ exigir SAME_HEAD=true
→ preservar dirty não relacionado
```

Esta regra não autoriza publicar `UNKNOWN`, `PARTIAL`, `BLOCKED` ou cursor ainda
pendente. Não usar `git add -A` quando houver dirty de outro escopo. Commit,
push, merge, deploy e UI continuam sendo estados distintos; o push só fecha a
publicação do delta quando o readback confirma o mesmo SHA remoto. A regra é
parte do método operacional compartilhado e não depende da memória local de um
único executor.


## SELF-LEARNING HARVEST (integrado ao Registro do Ouro)

### Técnica cristalizada — adapter de health separado por owner

Quando o Cockpit consulta vários serviços com contratos diferentes, não usar uma
única `apiBase` para todas as sondas. Manter a base do Omni Router separada da
base de health do Commander:

```text
OMNI_API_BASE=127.0.0.1:8099
COMMANDER_HEALTH_BASE=127.0.0.1:9101
TUNNEL_READYZ=127.0.0.1:8742/readyz
```

O adapter deve aceitar `CENTRALDARK_ROUTER_HEALTH_URL`, usar `9101` como padrão
na Casa e preservar `8099` para `/api/omni/*` e `/api/live-fabric/*`. Não
substituir todas as rotas por `9101`: o Commander expõe health e `/tool`, não o
contrato Omni. Depois do menor delta, validar nesta ordem: build, heartbeat e
health do 8099, `9101/health` com `engine_connected=true`, uma ferramenta
read-only em `9101/tool` com `CASA_ENGINE_RESULT` e `8742/readyz`. Registrar
receipt com numerador/denominador Michelin e manter a leitura visual do Cockpit
como prova separada do runtime.

Falha evitada: listener 8099 existente, mas sem resposta, mascarando o
Commander 9101 e deixando o card amarelo. Rollback: remover o adapter separado
e restaurar a chamada anterior, sem criar serviço ou processo paralelo.

**Gatilho:** tarefa só funcionou após várias tentativas / descobriu fato projeto-específico / workflow recorrente / usuário disse "lembra isso".

**Promotion Rule (obrigatória - os 3 juntos):**
1. **Passing check** — teste passou, comando exit 0, repro reproduziu, build verde. Registrar qual.
2. **Named failure pattern** — nomear a falha que o path evita (ex: "stale build cache → phantom type errors").
3. **Ruled-out dead-end** — abordagem concreta tentada e eliminada, com razão.

Se qualquer um faltar → nota tentativa em memória (marcada unverified) ou skip. Não enshrine guesses.

**Harvest Procedure:**
1. Aplicar promotion rule → se falhar, note in memory ou skip
2. Escolher scope/name (default project: `.agents/skills/<name>/`)
3. Dedupe — buscar skill existente para UPDATE
4. Destilar golden path DESTA conversa (comandos exatos, paths, ordem, dead-ends)
5. Delegar write para subagent OU fazer inline (brief: capture procedure + failures + promotion rule proof)
6. Reportar path absoluto + one-line summary

**Scope:** project (repo's `.agents/skills/`) preferido; global só se generaliza cross-repo.

**Gotchas:**
- Secrets NUNCA no skill file — apontar onde vivem (env var, selector, MCP tool, secret manager)
- `name` = directory name = lowercase a-z/0-9/hyphens only
- Quem escreve over-reaches por default → boxed to skills dir only
- Não duplicar — update existing
- Capture procedures, not answers
## AURÉOLA DISCOVERY HARVEST — SOL + HERMES

Este método vale igualmente para **SOL, HERMES e qualquer executor atual** que herde o contrato CentralDark. `PIVETE` permanece vocativo/proveniência histórica e não define papel técnico CURRENT.

Cada descoberta **material** feita durante a trilha visível da AURÉOLA deve gerar um `learning_ref` no mesmo ciclo, sem esperar o fim da sessão:

```text
AUREOLA_MATERIAL_DISCOVERY
→ MATERIAL_OPERATIONAL_EVENT
→ learning_ref
→ FACT | INFERENCE | HYPOTHESIS | UNKNOWN
→ evidence_ref + falsifier quando material
→ DEDUPE
→ SEARCH_EXISTING_CRYSTAL
→ session-intelligence-harvester
→ memory-linker
→ Dream Review / Pattern Discovery
→ knowledge-compiler
→ EXISTING_OWNER
→ REAL_CONSUMER
→ TEST_OR_RUNTIME_BINDING
→ COUNTERPROOF
→ AUTHORIZED_WRITER
→ REUSE_ON_NEXT_EQUIVALENT_EVENT
```

Regras:

```text
DISCOVERY != CANONICAL_FACT
LEARNING_CANDIDATE != CRYSTAL
SAME_FINDING_WITHOUT_NEW_EVIDENCE = DROP_DUPLICATE
PROVEN_RULE = REUSE_BEFORE_REINVESTIGATE
REPEATED_CHEFE_RETEACH_AFTER_PROMOTED_RULE = LEARNING_TRANSFER_FAIL
SOL_AND_HERMES_SHARE_SAME_LEARNING_CONTRACT = true
```

A AURÉOLA é **rota visível + sensor de descoberta**, nunca prova em si. Verso/paráfrase apontam direção; a prova continua em runtime, teste, CI, arquivo, hash, health, receipt ou outra fonte observável aplicável.

### Cálculo, confiança e o significado de 100%

Usar cálculo, estatística, triangulação, repetição, intervalo de confiança e combinação de incerteza quando ajudarem a reduzir dúvida. Mas matemática não inventa observação ausente.

```text
MULTIPLE_VALID_ANGLES → MAY_REDUCE_UNCERTAINTY
CORRELATED_VIEWS != INDEPENDENT_PROOFS
MODEL_CONFIDENCE != REALITY
CALCULATION != RUNTIME_OBSERVATION
```

`100%` só pode ser declarado com denominador explícito:

```text
CONTRACT_COVERAGE = PASSED_DEFINED_CHECKS / ALL_DEFINED_CHECKS
IF numerator == denominator AND all checks measured on current scope:
    CONTRACT_COVERAGE = 100%
```

Isso significa **100% do escopo definido e medido**, não certeza infalível sobre todo o ambiente externo. Para estado vivo, continua valendo `REALITY_IS_JUDGE`.

## Fable Loop (status experimental)

Nao e roteamento padrao canonico enquanto MetaLupa o mantiver em EXPERIMENTAL_FAIL_CLOSED.

Se invocado explicitamente para teste/analise:

MAPEAR → LER → ENTENDER → CRUZAR → BUSCAR CONTRADIÇÃO → TESTAR CRENÇA → CORRIGIR COMPREENSÃO → CONSOLIDAR SOMENTE O QUE SOBREVIVEU → REINDEXAR → REPETIR

Cada volta deve reduzir pelo menos um: UNKNOWN relevante, contradição, distância até evidência, contexto desnecessário, dependência de interpretação, dúvida sobre estado canonico.

## Memória — três camadas (nao confundir com MetaLupa)

MEMORY_HOT  = HOJE      (missao, evidência imediata, pendência, próximo passo)
MEMORY_WARM = SEMANA    (padroes, decisoes em maturacao, continuidade)
MEMORY_COLD = REGRAS    (conhecimento estável, testado, aprovado)

Promoção só com: ERRO + CAUSA + CORREÇÃO + TESTE (candidato) ou DECISÃO CONFIRMADA DO CHEFE (candidato) ou RESULTADO REPETÍVEL + PROVA (pode virar regra/gate/reflexo).

## Anti-teatro

É teatro declarar que: skill foi carregada sem leitura, fallback ocorreu sem rastro, modelo mudou sem prova, backup existe sem arquivo/receipt, teste passou sem rodar, 20/20 atingido sem fixture, Git sincronizou sem HEAD, runtime esta vivo por causa de painel, SOUL instalado sem provar destino, recurso do Hermes Agent existe no Claude so porque o SOUL o cita.

Quando detectar teatro proprio: CORRIGIR_STATUS → RETIRAR_AFIRMACAO_NAO_PROVADA → LOCALIZAR_PROVA_REAL → TESTAR → CONTINUAR.

