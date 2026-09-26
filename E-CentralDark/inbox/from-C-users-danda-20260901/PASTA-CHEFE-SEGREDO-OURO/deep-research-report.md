# CENTRALDARK — arquitetura inteira, contraprova e pacote PR-ready

## Veredito da pesquisa

A descoberta principal é mais forte do que simplesmente “montar uma arquitetura nova”: **grande parte da arquitetura que construímos nesta sessão já existe, em forma canônica, dentro da própria CentralDark**. O documento JARVIS vigente já define uma Casa com **um núcleo e muitos braços**, N percepções, fan-out de leitura, evidência normalizada, deduplicação, teste discriminante, realidade como árbitro, Writer único e absorção do delta reutilizável. Ele inclusive afirma que aumentar o número de braços **não multiplica a autoridade nem a caneta**. fileciteturn27file0 fileciteturn28file0

O ciclo mestre também já comprime a Casa em uma única entrada humana: `!CENTRALDARK` expande para Acordar, Calibrar, Multibússola, MetaLupa, Reconciliar, Contraprova, Remedição, Fixed Point, Registra e Boot; o próprio contrato estabelece percepção paralela, mutação serializada e um Writer por escopo. fileciteturn5file0

Então **não é caso de criar “CENTRALDARK regenerativa V2”**. O correto é exatamente a regra que tu vem repetindo: **mesma arquitetura, fórmula interna mais larga, peças reposicionadas e lacunas preenchidas**. O método operacional canônico reforça isso com `REUSE_BEFORE_CREATE`, Writer único e a regra de que modelo/host é motor temporário, não identidade nem autoridade. fileciteturn20file0

E teve uma descoberta grande no “pacotão AGI”: o ZIP que tu trouxe nesta sessão tem SHA-256 `757f09a723ca5b789f12f2d0c04f8ba33a1915fbf520a5a9675193b65ffdf27f`, **exatamente o mesmo hash do `agi-self-improvement-main.zip` que a CentralDark já minerou integralmente em 16 de agosto**. A mineração canônica classificou 128 de 128 arquivos e já decidiu encaixar evaluator, experimentation, meta improver, hyper-meta improver, self-verification e memory synthesizer nos owners existentes de **Metacognição + MetaLupa + evolution_gate**, em vez de importar um segundo sistema. fileciteturn14file0

Repiti o teste do pacote agora, nesta sessão: **55 testes passaram e 19 falharam, em 74**, reproduzindo exatamente o receipt histórico. As falhas permanecem concentradas nas integrações externas/submódulos não materializados. Isso é uma bela contraprova de que o histórico da Casa sobre esse ZIP estava consistente. O relatório canônico já registra os mesmos números e explica que as 19 falhas vêm das famílias externas ausentes. fileciteturn14file0

**Conclusão:** o que realmente faltava não era outro cérebro. Faltavam principalmente três ligações explícitas:

**rastro observável de qualquer modelo que toca a missão → rendezvous entre modelos/janelas/eixos → aprendizado longitudinal da própria MetaLupa usando o evolution gate que já existe.**

Essa é a peça debaixo do tapete.

## O mecanismo que fica por baixo da Casa

A arquitetura consolidada que sobreviveu à pesquisa fica assim, em texto normal:

**SEGREDO/CHEFE**  
→ uma intenção vigente  
→ **SOL/T0** fixa missão, destino, alvo de prova e escopo material  
→ **!CENTRALDARK** comprime a interface  
→ **#ACORDAR** recupera estado vivo e contexto relevante  
→ **!CALIBRAR** prende intenção, autoridade, risco, capabilities, boundary e proof target  
→ **!MULTIBÚSSOLA / !MULTIBÚSSOLA_META** abre os bearings necessários  
→ rendezvous inicial normaliza e cruza percepção  
→ **!META_LUPA** procura falso verde, UNKNOWN, contradição e teste que realmente separa hipóteses  
→ **Kimetsu / respirações** escolhe política operacional apropriada  
→ **!RECONCILIAR** procura owner e capacidade existentes antes de criar qualquer coisa  
→ **Capability Contract Router** seleciona o menor conjunto suficiente de capacidades  
→ **Overclock / Enxame Ômega** alarga para T1...TN somente quando existe trabalho independente ou ganho informacional  
→ entram Claude, Hermes, Codex, Gemini, OpenCode, modelos futuros, ferramentas ou agentes que tiverem capability **medida naquele runtime**  
→ cada passagem deixa receipt e um evento observável  
→ rendezvous entre modelos  
→ rendezvous entre janelas  
→ rendezvous entre eixos físicos  
→ dedupe causal  
→ contradições viram testes discriminantes  
→ **!DELTAUTILS** deixa passar apenas ganho material  
→ **um Writer por escopo** recebe o delta  
→ menor mutação autorizada  
→ contraprova  
→ remedição  
→ **Reality Judge**  
→ promover, rejeitar, rollback ou UNKNOWN  
→ **Fixed Point da missão**  
→ registro do ouro  
→ Boot  
→ passagem inversa da prova  
→ próximo Acordar.

Isso não é uma arquitetura que estou inventando agora por estética. O JARVIS atual já possui a espinha dorsal **Intent → Reanchor → Fan-out read-only → Normalize evidence → Dedupe → Arbitrate by test → Single Writer → Verify same target → Canonical promotion → Runtime → Observe → Absorb reusable delta ou No Change**. Ele também já determina que duas janelas repetindo a mesma fonte não contam como evidências independentes e proíbe votação de modelos como mecanismo de verdade. fileciteturn28file0

O Capability Router atual encaixa diretamente nessa cadeia: ele recebe intenção, estado vivo, risco, escopo, capabilities requeridas, candidatos vivos, Writer scope e proof target; filtra candidatos e busca deterministicamente o **menor conjunto suficiente**, bloqueando capability não observada como UNKNOWN. Ele explicitamente separa `ROUTE_READY`, execução, correção e Fixed Point. fileciteturn33file0

E o aprendizado canônico de ontem já fez a classificação correta do Kimetsu: **respirações são políticas operacionais especializadas, não novo motor, nova autoridade nem segundo orquestrador**. O mesmo documento cristaliza a direção “N modelos, N janelas, N CLIs, N agentes, N percepções → uma intenção vigente, um owner por capacidade, um Writer por escopo e uma realidade como Judge”. fileciteturn36file0

### O “suga quem toca” virou um contrato técnico

A parte nova que eu preservei no pacote é o que chamamos de **MODEL_TOUCH**.

Não significa extrair pensamento privado do modelo. Significa que qualquer corpo que participa deixa **rastro operacional observável**: qual missão recebeu, qual task, qual target, qual engine/modelo, que capabilities realmente usou, qual rota percorreu, que evidência produziu, quais UNKNOWNs sobraram, quais contradições encontrou, resultado do teste, resultado da contraprova, latência e custo quando realmente medidos.

Então Claude não “ensina” a MetaLupa porque se chama Claude.

Hermes não ganha peso porque é Hermes.

Codex não vira autoridade porque acertou três vezes.

O que entra é: **nessa classe de problema, nessa condição observada, essa rota produziu esse efeito e sobreviveu a esta prova.**

Isso combina com o evolution gate que já existe na própria MetaLupa: o gate determinístico foi feito para impedir que algo seja chamado de “evolução” sem **antes/depois, ganho informacional, delta reutilizável, teste, contraprova, regressão e proveniência no mesmo escopo**. fileciteturn22file0

É aqui que o “Hyper Meta” do pacote AGI finalmente encontra lugar sem virar outro bicho:

**não existe Hyper-Meta como novo dono.**

Existe a própria MetaLupa deixando receipt sobre o que ela fez; o receipt volta para **Metacognição + MetaLupa + evolution_gate**; uma mudança no mecanismo de avaliação vira candidata; candidata é testada contra baseline e contraprova; só depois pode ser absorvida no owner existente. Isso é precisamente compatível com a decisão já registrada na mineração do ZIP AGI. fileciteturn14file0

A MetaLupa canônica já possui AutoLupa: ela revisa o próprio veredito, procura contraprova ignorada, duplicação, dependência entre evidências, rollback falho, falso verde e divergência de intenção; outra passagem só é justificada por contradição ou evidência material nova. O ponto fixo ocorre quando nova passagem já não altera materialmente hipótese, bloqueios, risco, próximo teste ou veredito. fileciteturn8file0

Portanto a formulação mais correta da tua ideia é:

**MetaLupa nunca fica incapaz de melhorar. Mas também não fica girando vazia.**

Ela é **permanentemente melhorável e acionada por evento material**.

Isso é mais forte do que “loop infinito”, porque evita que ruído produzido pelo próprio loop seja confundido com aprendizado. A própria arquitetura JARVIS atual diz que `IDLE` é válido e que loop sem informação nova é desperdício, não autonomia. fileciteturn29file0

Essa distinção também aparece na literatura: Self-Refine mostra ganhos ao intercalar geração, feedback e refinamento, enquanto Reflexion mantém feedback de tentativa/erro em memória para melhorar decisões futuras; nenhum desses resultados implica que refinamento infinito sem informação nova seja desejável. citeturn2academia25turn2academia24

## O fan-out de verdade: local, CI, VPS e N modelos

O que tu chamou de “Casa”, “CI” e “homem das cavernas na VPS” fica muito bom quando separado em **planos físicos**, e não identidades.

**LOCAL CONTROLADO** é a superfície de integração: contexto rico, estado vivo do dono, ouro, operação interativa e Writer sob controle.

**CI CONTRAPROVA** é a superfície limpa: reproduz teste, regressão, HEAD/alvo exato e gates determinísticos. O próprio Engine Binding atual já exige CI self-hosted e manda claims específicos de runtime serem medidos, não presumidos. fileciteturn37file0

**VPS FORJA** é a superfície de força: fan-out, build, pesquisa, experimentação, testes caros e tarefas longas. Só que a fórmula robusta é **compute alto + autoridade limitada**, não autoridade infinita.

Isso combina diretamente com Hermes. A documentação oficial suporta perfis independentes com configuração, memória, sessões, skills e gateway próprios; a superfície multi-gateway trata cada par gateway/perfil como agente isolado e mantém as sessões no backend que realmente possui aquele perfil. citeturn1search4turn1search8 Hermes também tem delegação para subagentes com contexto e terminal isolados. citeturn5search6

Tem uma regra externa particularmente importante para tua VPS: a própria documentação oficial do Hermes alerta para **não executar dois gateways contra o mesmo diretório de dados simultaneamente**, porque sessions/memory stores não foram projetados para escrita concorrente. Em Docker, isolamento por diretório/container permite lifecycle, filesystem e recursos separados. citeturn1search0 O storage atual de sessões também usa SQLite em WAL com arquitetura de leitores concorrentes e Writer único, o que curiosamente casa muito bem com a lei da CentralDark. citeturn1search11

Então N lados podem atacar a mesma intenção, mas não transformamos isso em N mãos escrevendo na mesma memória.

**N observadores, N ambientes, N modelos, N bearings: sim.**

**N writers sobre o mesmo escopo e estado: não.**

E mais um freio importante apareceu na pesquisa externa: **mais agentes não significa automaticamente mais qualidade**. Um trabalho recente do Google Research encontrou configurações em que agentes independentes amplificaram erros fortemente, enquanto coordenação centralizada conteve melhor essa amplificação; o melhor desenho depende da decomposição, ferramentas e estrutura da tarefa. citeturn2search4 Anthropic, em experiências de equipes paralelas de agentes em software, também destaca a importância do harness e dos testes para manter longas execuções no trilho. citeturn2search12

Isso reforça tua Multibússola: ela não pergunta “quantos braços posso abrir?”, mas **“quantos eixos independentes ainda existem que têm chance real de reduzir UNKNOWN ou produzir prova?”**

Quando a resposta é dez, abre dez.

Quando é um, manda um.

Quando acabou o delta, os gorilas sentam. 😹

## A volta inversa no Fixed Point

Essa parte da nossa sessão sobreviveu praticamente inteira.

O Fixed Point **não deve voltar para trás desfazendo trabalho**. Ele deve voltar para trás como **propagação de prova**.

Primeiro a missão fecha no sentido direto: resultado observado, remedição, contraprova, Judge e estado final.

Depois o sistema percorre as decisões que produziram aquele resultado e pergunta:

qual bearing trouxe informação?

qual bearing foi inútil?

qual capability realmente existia?

qual rota foi melhor?

qual modelo entregou evidência nova?

qual saída era eco da mesma fonte?

qual hipótese da MetaLupa caiu?

qual teste discriminou de verdade?

qual regra merece ser absorvida?

qual prova antiga foi invalidada?

A saída dessa volta **não é “resetar tudo”**. É invalidar somente o cone afetado.

Isso já é coerente com a arquitetura JARVIS: um resultado pode gerar novo trabalho candidato, mas precisa passar por delta material, dedupe, elegibilidade/autorização e a fila existente; worker não pode transformar a própria saída em aprovação. O mesmo documento também afirma que o ouro absorvido deve reduzir a probabilidade de redescobrir e refazer a mesma classe de trabalho. fileciteturn28file0 fileciteturn29file0

A cadeia final, portanto, tem dois sentidos:

**ida:** intenção → percepção → escolha → execução → prova → realidade → Fixed Point.

**volta:** Fixed Point → prova real → consequências das decisões → aprendizado reutilizável → owners existentes → recalibração seletiva → registro → próximo Acordar.

O efeito mais interessante não é “ela lembra mais”.

É que, ao longo das missões, **o custo para resolver feridas repetidas deve cair**.

Isso transforma memória em seleção operacional.

## Contraprova contra nós mesmos

Aqui eu fiz exatamente o que tu pediu: peguei a arquitetura que eu mesmo vinha propondo e tentei quebrar.

**Primeira coisa que caiu:** eu tinha falado antes que “Hermes já tem suporte conceitual para spawn de Claude, Codex e OpenCode” de forma forte demais. A pesquisa oficial prova delegação para subagentes, perfis, múltiplos gateways e modelos substituíveis; **não prova, só por isso, que toda combinação Claude/Codex/OpenCode CLI esteja disponível como uma capability nativa homogênea no teu runtime**. Portanto a nova arquitetura não presume isso. O Capability Router deve medir cada caminho concreto antes de usá-lo. citeturn5search6turn1search8

**Segunda coisa que caiu:** aqueles arquivos que apareceram na sessão local sugerindo algo como `orchestrator-core.mjs`, messenger, registry e rendezvous próprios seriam uma má integração se virassem um novo núcleo. O JARVIS atual é explícito: não criar Work Engine, segunda fila nem segundo orquestrador; o plano de controle e os owners existentes devem ser reutilizados. fileciteturn28file0 Portanto meu pacote **não implementa um segundo orquestrador**.

**Terceira coisa que caiu:** “a MetaLupa não pode parar de se melhorar” não pode significar processo rodando eternamente. A forma tecnicamente consistente é **não ficar FINAL como capacidade de aprendizado**, porém entrar em `NO_CHANGE/IDLE` quando não há nova informação. Isso é exatamente o critério já registrado na MetaLupa e no JARVIS. fileciteturn8file0 fileciteturn29file0

**Quarta coisa que caiu:** número de janelas não pode ser métrica de inteligência ou qualidade. As próprias regras canônicas dizem que duas telas repetindo a mesma fonte são um único cluster. E pesquisa multiagente recente mostra que paralelismo mal coordenado pode piorar o resultado. fileciteturn28file0 citeturn2search4

**Quinta coisa que eu encontrei no próprio canônico:** antes de ampliar os YAMLs, vale limpar duplicações de chave. No `ENGINE_BINDING.yml` lido nesta sessão, `source_prs_reconciled`, `second_semantic_owner` e `graph_is_derived_not_authority` aparecem repetidos dentro do mesmo mapping; na leitura do Master Cycle também há repetições de blocos/chaves. fileciteturn37file0 fileciteturn5file0 A especificação YAML 1.2.2 define mapping como associação com **chaves únicas** e trata não-unicidade como ponto de falha de loading; portanto um gate estrito de duplicate keys é uma correção de base antes de empilhar mais semântica nesses arquivos. citeturn4search0

E tem mais uma contraprova importante: **não importei o pacote AGI como “AGI core”**. O próprio relatório canônico já concluiu que o nome/README não provam AGI e mapeou o material útil para os mecanismos existentes. fileciteturn14file0 Isso impede que `hyper_meta_improver_agent.py` vire, pela força do nome, um segundo cérebro da Casa.

## Pacote consolidado e testes

Montei o pacote completo com a arquitetura, os deltas, schemas, implementação candidata, testes e body de PR:

**[Baixar CentralDark-Cadeia-Regenerativa-PR-Ready.zip](sandbox:/mnt/data/CentralDark-Cadeia-Regenerativa-PR-Ready.zip)**

SHA-256 do ZIP: **7587855d51ccc44618fd32837dca246b43d6978df0111990f83ed3bb92636bd1**

O pacote tem **28 arquivos** e foi montado deliberadamente como **delta de integração**, não como repo/arquitetura paralela.

Ele contém a arquitetura consolidada completa; relatório de pesquisa e contraprova; guia do delta canônico; body de PR; schema para `MODEL_TOUCH`; schema para improvement receipt; implementação candidata de harvest dentro da MetaLupa; rendezvous regenerativo candidato dentro da Trigger Fabric; testes de dedupe causal, não-votação e reverse proof seletivo; merge guides para Master Cycle e Engine Binding; receipt do pytest do pacotão AGI; receipt da autocontraprova; validador do próprio pacote; e manifesto SHA-256.

O validador do pacote passou:

**4 testes passaram em 0,04 s.**

Além disso, ele confirma explicitamente que **não existe owner paralelo criado pelo pacote** e que o harvest **não escreve no canônico sozinho**.

Também rodei novamente o suite do ZIP AGI: **55 passaram e 19 falharam**, reproduzindo o resultado já registrado pela mineração canônica. fileciteturn14file0

Uma consequência prática da pesquisa externa também foi incorporada ao pacote: a VPS/FORJA fica compatível com a recomendação de isolamento físico do Hermes, sem compartilhar o mesmo state/data directory entre gateways escritores concorrentes. citeturn1search0

E o desenho não usa “um modelo julgando a si mesmo = PASS”. Anthropic recomenda evals que combinem critérios e ambientes verificáveis para agentes, justamente porque loops multi-turno e ferramentas tornam avaliação mais difícil; baselines e regressões precisam ser tratados como infraestrutura central. citeturn3search6 Isso encaixa diretamente no `evolution_gate` da Casa. fileciteturn22file0

## Estado do PR e o próximo estado real

Achei um detalhe que muda a ação correta no GitHub: **já existe o PR #1228 aberto no teu repositório**, e ele mexe justamente em `!MULTIBUSSOLA_META`, Fixed Point local e `scripts/trigger-fabric/centraldark_master_cycle.py`. Ele está atualmente aberto e o GitHub o reportou como `mergeable: false`; os arquivos alterados são `docs/CODEX/SETUP.md`, o aprendizado de Multibússola Meta e `centraldark_master_cycle.py`. fileciteturn40file0

Portanto, **abrir outro PR concorrente mexendo no mesmo ciclo agora violaria a própria regra de Writer único que estamos tentando consolidar**. O procedimento correto é reconciliar o delta deste pacote com o #1228, atualizar/rebasear aquela frente e só então promover. A arquitetura canônica exige justamente que mutação do mesmo escopo seja serializada e que handoff ocorra antes de outro Writer tocar o alvo. fileciteturn27file0

Eu **não alego ter aberto ou alterado o PR**, porque a conexão GitHub disponível nesta sessão me dá leitura do repo, arquivos, branches, commits, checks e PRs, mas não expõe operação de escrita/criação de branch, commit ou PR; também pesquisei uma integração instalável adicional para criação de pull request e nenhuma apareceu. O ZIP inclui `docs/PR_BODY.md` pronto e todo o material de integração, mas inventar um “PR aberto” aqui seria justamente o falso verde que a MetaLupa proíbe. fileciteturn7file0

O estado honesto, portanto, é:

**ARQUITETURA CONSOLIDADA: PASS.**

**PACOTÃO AGI RECONCILIADO COM O CANÔNICO: PASS — e, surpreendentemente, ele já havia sido minerado antes.** fileciteturn14file0

**MODEL_TOUCH + CROSS-MODEL HARVEST + REVERSE PROOF: DELTA IMPLEMENTADO E TESTADO NO PACOTE, ainda não promovido à main.**

**VPS/FORJA: desenho fechado com isolamento e autoridade limitada; runtime ainda precisa ser materializado/medido.** citeturn1search0turn1search8

**PR #1228: existe e ocupa parte do mesmo escopo; precisa ser reconciliado antes da promoção.** fileciteturn40file0

**PR novo criado por mim: NÃO — bloqueado pela superfície de escrita disponível e, arquiteturalmente, não seria correto abrir um concorrente antes de reconciliar o #1228.**

E a fórmula que sobreviveu à lupa inteira ficou simples:

**Uma intenção. Uma Casa. Um mapa. N braços. N modelos. N máquinas. N eixos. Um Writer por escopo. Evidência em vez de votação. Realidade julgando. Fixed Point fechando a missão. Prova voltando para trás. Ouro alterando a próxima rota. MetaLupa sempre melhorável, mas nunca autorizada a reinventar a fundação sozinha.** fileciteturn28file0 fileciteturn8file0