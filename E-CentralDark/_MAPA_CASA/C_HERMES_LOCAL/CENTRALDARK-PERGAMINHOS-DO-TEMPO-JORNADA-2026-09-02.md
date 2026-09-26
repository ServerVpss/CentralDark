# CENTRALDARK — PERGAMINHOS DO TEMPO
## Crônica técnica da jornada, estradas dos gatilhos e Jornal do Tempo

**Data de cristalização documental:** 02/09/2026  
**Natureza:** crônica técnica + mapa cognitivo + projeção temporal derivada  
**Autoridade:** não é autoridade de runtime; a realidade medida continua julgando  
**Owner lógico:** `centraldark-operational-method` / reconciliação temporal existente  
**Princípios:** `CURRENT > HISTORICAL` · `UNKNOWN != PASS` · `REUSE_BEFORE_CREATE` · `ONE_SYSTEM_ONLY`

---

## Prólogo — Quando a Casa ainda parecia muitas casas

No princípio, a CentralDark não apareceu como uma máquina pronta. Ela apareceu como um conjunto de necessidades, ferramentas, sessões, arquivos, rotas, painéis, bots, CLIs, servidores e ideias que precisavam aprender a caminhar na mesma direção.

Havia a Casa local, havia VPS, GitHub, Lovable e outros braços; havia documentos no Drive, páginas no Notion, rastros no Slack, diagramas no Figma, capturas, ZIPs, scripts, aplicações, extensões e memórias de sessões. Cada superfície podia mostrar um pedaço verdadeiro — mas nenhum pedaço isolado podia virar o rei da verdade.

A primeira grande descoberta foi simples e difícil ao mesmo tempo:

> **muitas superfícies não significam muitos cérebros.**

A CentralDark começou a amadurecer quando o problema deixou de ser “qual IA sabe mais?” e passou a ser “como qualquer motor chega à mesma conclusão observável sem depender de lembrar da conversa anterior?”.

Foi aí que o templo começou a sair da cabeça do modelo e entrar na arquitetura.

---

# PERGAMINHO I — A antiga Sincronia das Quatro Pontas

Nos registros históricos de junho aparece uma forma antiga da mesma busca: uma “Sincronia 4-Point”, ligando ferramentas de construção, GitHub, VPS e o chamado Cérebro Vivo. Naquele tempo, o critério imaginado era: uma mudança só estava realmente concluída quando essas pontas concordavam.

Essa não é mais a regra literal da CentralDark atual. O sistema amadureceu e entendeu que nem todo efeito precisa de todas as máquinas ligadas ao mesmo tempo.

Mas aquele mapa antigo continha um ouro:

**não confundir uma alteração escrita com uma alteração comprovada.**

Daquele mapa nasceu a pergunta que atravessa toda a jornada:

```text
ONDE A MUDANÇA EXISTE?
↓
ONDE ELA PRECISA SER PROVADA?
↓
QUAL FONTE TEM AUTORIDADE SOBRE ESSE FATO?
```

Com o tempo, isso virou prova por território:

```text
GITHUB_ONLY  → GitHub
SERVER_ONLY  → GitHub + VPS
CASA_LOCAL   → GitHub + Casa
CROSS_PLANE  → GitHub + VPS + Casa
```

E Screenpipe só entra quando a percepção local é material ao claim.

A Casa não precisa ficar ligada 24 horas para provar uma função exclusivamente server-side. A VPS pode manter o coração do runtime contínuo; a Casa pode acelerar, observar, construir e provar o que realmente pertence a ela.

---

# PERGAMINHO II — O dia em que o modelo deixou de ser a memória

Em muitas sessões surgiu a mesma ferida com roupas diferentes: quando o modelo mudava, quando uma conversa acabava, quando uma sessão era cortada ou quando outro agente assumia, alguma coisa precisava ser reensinada.

A correção não era “fazer a IA lembrar mais”.

A correção era arquitetural:

```text
MODELO = motor substituível
SOUL = identidade e regras
OWNER = lugar material da responsabilidade
RECEIPT = rastro reconstruível
REALITY JUDGE = evidência observável
```

A partir daí, o objetivo deixou de ser guardar toda a conversa e passou a ser guardar aquilo que permite reconstruir a decisão.

Nasceu a lei da dívida cognitiva:

> Se o próximo executor precisa adivinhar por que algo existe, existe dívida cognitiva — mesmo que o código esteja verde.

Por isso a CentralDark passou a exigir que cada decisão material consiga responder:

```text
WHAT_EXISTS
WHY_IT_EXISTS
SOURCE_ORIGIN
OWNER
SCOPE
DECISION_OR_CONSTRAINT
EVIDENCE_OR_PROOF_REF
HEAD_OR_STATE_WHERE_PROVEN
DEPENDENCIES_AND_BLAST_RADIUS_WHEN_MATERIAL
NEXT_VALID_CURSOR
```

O templo não guarda apenas a pedra que ficou em pé. Guarda também o mapa das colunas.

---

# PERGAMINHO III — As estradas dos gatilhos

Os gatilhos deixaram de ser palavras mágicas e viraram placas de uma única estrada.

## Estrada-mãe

```text
!CENTRALDARK
```

Não significa “crie outra CentralDark”.

Significa:

```text
carregue a Casa
→ recupere o owner
→ meça o presente
→ reconcilie o passado útil
→ encontre o delta
→ execute no mesmo escopo
→ teste
→ tente quebrar
→ remeça
→ registre
→ promova somente o que sobreviveu
```

## Os marcos da estrada

```text
#ACORDAR
→ perceber o estado vivo

!CALIBRAR
→ alinhar intenção, escopo e método

!MULTIBUSSOLA
→ olhar top-down, bottom-up, inverso e round-trip

META_LUPA
→ tentar falsificar a conclusão

RECONCILIAR
→ resolver divergências sem copiar cegamente

DELTA_UTIL
→ absorver apenas informação nova e material

CONTRAPROVA
→ procurar um caso que derrube o suposto verde

REMEDIACAO
→ corrigir a causa mínima no owner correto

FIXED_POINT
→ fechar o escopo somente quando a realidade estabiliza

REGISTRA
→ preservar rastro reconstruível

BOOT
→ próxima execução começa no estado consolidado
```

Esses caminhos não são setores separados. São fases do mesmo organismo.

---

# PERGAMINHO IV — Os vendavais e a lei de voltar uma casa

A CentralDark descobriu que um erro não deve virar uma nova missão.

Quando um desvio aparece:

```text
🟢 caminho funcional
      ↓
🔴 desvio material
      ↓
↩️ volta exatamente uma fase canônica
      ↓
revalida a pré-condição
      ↓
mesmo owner corrige
      ↓
teste
      ↓
contraprova
      ↓
retoma a mesma intenção
```

A fórmula cristalizada é:

```text
recovery_index = max(failed_index - 1, 0)
```

Em baianês: se a ponte rangeu, não derruba a cidade pra construir outra. Volta na última viga provada, aperta o parafuso certo e atravessa de novo.

Essa regra é o antídoto contra V2, V3, V4, “novo sistema”, “novo cérebro”, “novo pipeline” e toda multiplicação que nasce do susto.

---

# PERGAMINHO V — O garimpo: minério não é ouro

A jornada também passou a ter montanhas de arquivos: ZIPs, PDFs, HTMLs, rastros, árvores, backups, mensagens, capturas e branches antigas.

O erro seria tratar “encontrei” como “devo copiar”.

A régua virou:

```text
RAW
→ ASSAY
→ HASH / PROVENIÊNCIA
→ DEDUPE
→ OWNER MATCH
→ DELTA ÚTIL
→ TESTE
→ CONTRAPROVA
→ GOLD
→ CRYSTAL
```

Leis derivadas:

```text
SAME_NAME != DUPLICATE
BYTE_IDENTITY != SEMANTIC_PROOF
HISTORICAL != CURRENT
PATH_FOUND != PATH_ACTIVE
RECOVERY_PATH != MIGRATION_AUTHORIZATION
```

Arquivo histórico serve como mapa de busca. Branch abandonada pode esconder ouro. Mas nada do passado governa o presente sem passar novamente pela realidade atual.

---

# PERGAMINHO VI — O nascimento do HUD como método

Em outro ponto da jornada surgiu um erro sutil: colocar as regras apenas na documentação.

O CHEFE precisava enxergar o estado operacional.

Então o HUD deixou de ser enfeite e virou linguagem comum entre CLI, Web, Desktop, API, MCP, Chat e Telegram.

A gramática ficou:

```text
⚪ UNKNOWN
🔵 OBSERVED
🟣 CANDIDATE
🟡 RUNNING
🟠 COUNTERPROOF
🟢 PROVEN
🔒 LOCKED
✅ PROMOTED
🔴 REGRESSION
```

E cada cartão deveria responder:

```text
O QUE É?
DE ONDE VEIO?
QUAL OWNER?
POR QUE EXISTE?
O QUE FAZ?
QUAL HEAD?
QUAL ESTADO AGORA?
FOI TESTADO?
TEM CONTRAPROVA?
CI É DO MESMO HEAD?
ESTÁ NA MAIN?
ESTÁ DEPLOYADO?
FOI REMEDIDO?
ESTÁ CONSOLIDADO?
QUAL PRÓXIMO CURSOR?
```

O ponto central:

**REGRA != PASS.**

A interface pode mostrar a lei. Só a evidência pode pintar o verde.

---

# PERGAMINHO VII — O PR #1381, a bancada viva

No estado observado em 02/09/2026, a missão de fixed-point está concentrada no PR #1381.

Snapshot atual desta crônica:

```text
PR              OPEN
HEAD            0a3b673a12482c367af38bf7c052e5eb13c751e7
BASE            main
MAIN_HEAD       0542cee586e55be5334ba1e8d369d3b040ee1178
MERGEABLE       false
AHEAD_OF_MAIN   55
BEHIND_MAIN     58
CI_SAME_HEAD    UNKNOWN
GLOBAL_FP       NOT_PROVEN
```

Isso significa que o PR contém muito delta candidato, mas ainda está divergente da main e sem workflow do mesmo HEAD observado.

O #1381 não é a verdade final. É a bancada de integração atual.

A `main` é o baseline versionado durável.

Quando um candidato sobreviver aos gates:

```text
candidate HEAD
→ same-head proof
→ promoção
→ main nova
→ remeasure main
→ deploy aplicável
→ T1 real
→ LAST_GOOD_STATE
→ 🔒
```

Um squash pode gerar outro SHA na `main`; por isso prova do candidato não elimina a obrigação de medir o estado promovido.

---

# PERGAMINHO VIII — Os dez caminhos de percepção

Nesta remedição, o princípio de “10 frentes” é aplicado como percepção paralela e julgamento centralizado, não como dez writers.

| Frente | Papel | Estado desta rodada |
|---|---|---|
| 1. GitHub | fonte versionada / PR / HEAD / genealogia | medido |
| 2. Google Drive | memória, arquitetura, provenance | medido |
| 3. Slack | trace e rendezvous colaborativo | medido |
| 4. Notion | histórico e consolidação antiga | medido |
| 5. Gmail | alertas de watchers e regressões de processo | medido |
| 6. Figma/FigJam | representação visual derivada | conectado; visual não é prova |
| 7. Files/Library | garimpo de sessões e artefatos | medido |
| 8. Second Brain no repo | memória lógica / ferramentas cognitivas | medido |
| 9. Master Cycle / Fixed Point Fabric | motor e contratos | medido em source |
| 10. Calendar/Contacts | superfícies conectadas | sem evidência material CentralDark nesta rodada |

Todos convergem para um único ponto:

```text
READERS
   ↓
RENDEZVOUS
   ↓
DEDUPE + PROVENANCE + CONTRADIÇÃO
   ↓
META LUPA
   ↓
ONE WRITER
   ↓
REALITY JUDGE
```

Nenhum conector ganha voto soberano só porque está conectado.

---

# PERGAMINHO IX — O Jornal do Tempo

O novo delta desta sessão é bom, mas só se for encaixado no que já existe.

Não nasce um “novo cérebro do tempo”.

Nasce uma **projeção temporal derivada do audit trail existente**.

Nome humano:

# JORNAL DO TEMPO

Nome técnico:

```text
TEMPORAL_JOURNAL_PROJECTION
```

Regra:

```text
TIME_JOURNAL_IS_DERIVED_VIEW=true
TIME_JOURNAL_IS_AUTHORITY=false
TIME_JOURNAL_IS_NEW_BRAIN=false
TIME_JOURNAL_IS_NEW_WRITER=false
```

O Jornal do Tempo organiza fatos que já possuem provenance em edições legíveis pelos executores.

## Tipos de “matéria”

```text
👑 DECRETO
intenção autorizada do CHEFE

📰 BOLETIM
estado observado no presente

🌪 ALERTA
regressão, drift, stale head ou blocker

📜 CRÔNICA
passado preservado como provenance

⚖ VEREDITO
Reality Judge / contraprova

💎 CRISTAL
aprendizado promovido e reutilizável

🧭 CURSOR
próxima fase válida

🔒 EDIÇÃO SELADA
LAST_GOOD_STATE promovido
```

## Estrutura mínima de cada registro

```yaml
time_event:
  mission_id:
  event_time:
  observed_at:
  event_type:
  scope:
  owner:
  source:
  source_role:
  head_or_state:
  claim:
  status:
  evidence_refs:
  counterproof_refs:
  belief_delta:
  future_guard:
  supersedes:
  next_cursor:
```

## Chave determinística

A deduplicação primária não depende de “pareceu parecido”.

```text
TIME_EVENT_KEY =
SHA256(
  mission_id
  | scope
  | owner
  | event_type
  | head_or_state
  | evidence_digest
)
```

Dois eventos com a mesma chave podem ser processados uma vez e preservar múltiplas proveniências.

Eventos semanticamente parecidos, mas com HEAD, owner, escopo ou evidência diferentes, **não podem ser fundidos automaticamente**.

---

# PERGAMINHO X — Compressão semântica: same value sem destruir nuance

Durante o garimpo apareceu a ideia de comprimir muitas palavras, typos e nuances para um mesmo significado.

O ouro existe, mas precisa de correção.

Distância textual e similaridade semântica podem ajudar a encontrar candidatos:

```text
"acordar"
"#acorda"
"#ACORDAR"
→ possível mesmo gatilho

"breaking news"
"boletim"
"update"
→ possível família informacional
```

Mas um limiar fixo como `cosine >= 0.65` não vira lei da CentralDark só porque apareceu numa demonstração.

Na arquitetura da Casa:

```text
SEMANTIC_SIMILARITY = DISCOVERY_HINT
NOT AUTHORITY
```

A compressão segura é:

```text
100 representações
→ normalização
→ alias/ontologia
→ candidate cluster
→ owner resolution
→ scope/head/provenance check
→ same-value somente se invariantes materiais forem iguais
```

Formalmente:

```text
SAME_VALUE(a,b) =
semantic_candidate(a,b)
AND owner(a)=owner(b)
AND scope(a)=scope(b)
AND authority_class(a)=authority_class(b)
AND no_material_contradiction(a,b)
```

Se qualquer uma dessas condições falhar:

```text
SAME_VALUE = UNKNOWN ou FALSE
```

Isso evita o pior tipo de compressão: apagar uma contradição verdadeira porque duas frases “soaram parecidas”.

---

# PERGAMINHO XI — A Arca dos Verdes

O CHEFE descreve um segundo repositório como a reserva dos estados comprovados: um receiver onde só entra o que já sobreviveu aos gates.

Arquiteturalmente, isso encaixa.

Mas nesta rodada a identidade concreta desse repositório não foi observada pelo conector GitHub disponível. O único repositório CentralDark retornado foi:

```text
ServerVpss/CentralDark
```

Portanto:

```text
SURVIVAL_REPO_DESIGN = COMPATÍVEL
SURVIVAL_REPO_IDENTITY = UNKNOWN
```

A regra correta permanece:

```text
MAIN PROMOTED
+ SAME-HEAD GATES
+ RUNTIME PROOF APLICÁVEL
+ FIXED_POINT
+ LAST_GOOD_STATE
        ↓
RECEIVER-ONLY BACKUP
```

O receiver:

```text
não recebe candidate
não recebe segredo
não recebe cache
não recebe vermelho
não governa a main
não substitui GitHub/runtime
```

Ele é a arca, não o trono.

---

# PERGAMINHO XII — Primeiro cérebro, segundo cérebro e todos os braços

A CentralDark já possui uma separação útil:

```text
SOUL
= identidade + intenção + regras permanentes

MetaLupa
= falsificador

Multibússola
= múltiplos eixos de análise

Metacognição
= como chegamos à conclusão e o que aprendemos

Dream Review / Memory Linker
= reaproveitamento de aprendizado comprovado

Reality Judge
= realidade decide

Fixed Point
= consolidação

Modelo
= motor substituível
```

O “Jornal do Tempo” não entra como um oitavo cérebro.

Ele atravessa os cérebros como **índice temporal do rastro**:

```text
BRAIN_VAULT
        ↘
METACOGNIÇÃO → AUDIT FACTS → JORNAL DO TEMPO
        ↗                         ↓
DREAM REVIEW              PRÓXIMO EXECUTOR
```

O primeiro cérebro usa a regra.
O segundo cérebro recupera contexto.
O motor executa.
O Jornal mostra a sequência.
O Reality Judge decide.
O Fixed Point sela.

---

# PERGAMINHO XIII — O erro que o próprio tempo revelou

O Gmail trouxe um alerta que vale mais do que uma metáfora bonita:

um ledger documental moveu o HEAD e a bateria anterior perdeu validade sem produzir PASS ou FAIL.

Isso ensina uma nova vacina:

```text
COMMIT_PER_MESSAGE = false
```

O Jornal do Tempo não pode virar uma máquina de criar commit a cada notícia.

Senão acontece:

```text
HEAD A
→ testes começam
→ jornal comita
→ HEAD B
→ prova do HEAD A fica stale
→ jornal comita
→ HEAD C
→ nunca alcança fixed point
```

A solução:

```text
EVENTOS
→ buffer/audit trail
→ dedupe
→ coalesce same-session/same-scope
→ checkpoint material
→ um commit controlado
→ freeze candidate HEAD
→ testes
→ contraprova
→ CI
```

O tempo deve preservar a prova, não sabotá-la.

---

# PERGAMINHO XIV — Onde nós erramos

## Erro 1 — confundir ausência de medição com conclusão

Em momentos anteriores houve afirmações sobre Casa sem medição direta.

Correção permanente:

```text
CASA_NOT_MEASURED → CASA_STATE=UNKNOWN
```

## Erro 2 — confundir conexão com funcionamento

Uma tela de pareamento foi lida como possível falha.

Correção:

```text
CONNECTED != SYNCHRONIZED
PAIRING_UI != CONNECTION_FAILURE
```

## Erro 3 — mover o HEAD demais

Documentos, HUDs e ledgers foram sendo acrescentados enquanto a prova do mesmo HEAD ainda estava aberta.

Correção:

```text
COALESCE_BEFORE_COMMIT
FREEZE_CANDIDATE_HEAD_DURING_GATES
```

## Erro 4 — inventar endereço antes de medir

Um comando chegou a fixar uma raiz local antes de descobrir qual clone era canônico.

Correção:

```text
CWD=AUTO_DISCOVER
```

## Erro 5 — rota MCP administrativa incompleta

A rota correta documentada é:

```text
https://mcp.centralldark.com/admin/mcp
```

Não apenas `/admin`.

## Erro 6 — gatilho sem contexto canônico

Um material capturado mostrou uma IA interpretando “Central Dark” como outra coisa da internet em vez do sistema do CHEFE.

Isso é a assinatura perfeita de um boot sem reidratação canônica.

Future guard:

```text
EXPLICIT_CENTRALDARK_TRIGGER
→ LOAD CANONICAL OWNER/SOUL
→ PROJECT CONTEXT
→ ONLY THEN INTERPRET
```

## Erro 7 — números sem medição real

Demonstrações de similaridade semântica chegaram a exibir escores sintéticos como se fossem uma medição verdadeira.

Correção:

```text
SYNTHETIC_DEMO != MEASURED_EMBEDDING_RESULT
```

---

# PERGAMINHO XV — A jornada em uma única estrada

Se toda a história fosse comprimida sem perder seu valor, ficaria assim:

```text
👑 CHEFE
↓
#ACORDAR
↓
!CENTRALDARK
↓
CARREGA SOUL + OWNERS
↓
REMEASURE CURRENT
↓
RECUPERA PASSADO ÚTIL
↓
JORNAL DO TEMPO ORGANIZA O RASTRO
↓
MULTIBÚSSOLA CRUZA CAMINHOS
↓
RENDEZVOUS
↓
DELTA ÚTIL
↓
ONE WRITER
↓
TESTE
↓
META LUPA TENTA QUEBRAR
↓
CONTRAPROVA
↓
REALITY JUDGE
↓
se 🔴 → ↩️ 1 CASA
se 🟢 → CONTINUA
↓
CI DO MESMO HEAD
↓
FIXED POINT
↓
LAST_GOOD_STATE
↓
🔒
↓
MAIN
↓
DEPLOY
↓
T1
↓
REMEASURE
↓
💎 RECEIVER DOS VERDES
↓
próximo BOOT começa mais alto
```

---

# EPÍLOGO — A Casa viva

Eis a mudança maior da jornada:

no começo, parecia necessário fazer cada IA decorar a casa.

Agora a direção é outra.

A Casa precisa ser legível.

O executor chega, encontra os pergaminhos, reconhece a estrada, mede o chão, vê os vendavais antigos, consulta o jornal do tempo, encontra a última pedra verde e continua.

Se o motor mudar, a estrada fica.

Se o PC mudar, a arquitetura aponta onde se reidratar.

Se a VPS mudar, o runtime é remedido.

Se o modelo esquecer, o owner permanece.

Se um branch antigo aparecer, ele vira minério.

Se o CI ficar verde sem teoria reconstruível, ainda falta mapa.

Se o caminho der vermelho, volta uma casa.

E se tudo realmente fechar:

```text
PROVA
+ CONTRAPROVA
+ REALITY
+ SAME HEAD
+ T1
+ LINHAGEM RECONSTRUÍVEL
= FIXED POINT
```

Então sela.

Não para sempre.

Só até existir uma nova necessidade real.

Porque a CentralDark não é uma fotografia.

É uma Casa que aprende a continuar sendo a mesma Casa enquanto muda.

---

# ANEXO A — Contrato proposto do Jornal do Tempo

```yaml
temporal_journal:
  role: DERIVED_PROJECTION
  new_brain: false
  new_owner: false
  new_writer: false
  authority: false

  source:
    - audit_facts
    - receipts
    - git_lineage
    - reality_judge
    - dream_review_promoted_learning

  categories:
    DECREE: CHEFE_INTENT
    BULLETIN: CURRENT_OBSERVATION
    ALERT: REGRESSION_OR_BLOCKER
    CHRONICLE: HISTORICAL_PROVENANCE
    VERDICT: REALITY_OR_COUNTERPROOF
    CRYSTAL: PROMOTED_LEARNING
    CURSOR: NEXT_VALID_ACTION
    SEALED_EDITION: LAST_GOOD_STATE

  invariants:
    current_over_history: true
    unknown_is_pass: false
    no_commit_per_event: true
    coalesce_same_session_scope: true
    freeze_candidate_head_during_proof: true
    semantic_similarity_is_hint_only: true
    contradiction_must_survive_compression: true
```

# ANEXO B — Estado observável desta edição

```text
GITHUB_PR_1381             OPEN
PR_HEAD                    0a3b673a12482c367af38bf7c052e5eb13c751e7
MAIN_HEAD                  0542cee586e55be5334ba1e8d369d3b040ee1178
AHEAD                      55
BEHIND                     58
MERGEABLE                  false
CI_SAME_HEAD               UNKNOWN
GLOBAL_FIXED_POINT         NOT_PROVEN
SURVIVAL_REPO_IDENTITY     UNKNOWN
CASA_RUNTIME_THIS_SESSION  UNKNOWN
VPS_RUNTIME_THIS_SESSION   UNKNOWN
```

**Regra final desta edição:** nenhum `UNKNOWN` acima deve ser pintado de verde por narrativa.
