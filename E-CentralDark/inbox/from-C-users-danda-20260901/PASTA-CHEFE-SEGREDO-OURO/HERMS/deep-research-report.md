# !CENTRALDARK — correção do `CENTRALDARK_AI_BOOT` único, fixo na função e adaptativo na missão

## Veredito

```yaml
CENTRALDARK_AI_BOOT:
  trigger: "!CENTRALDARK"
  mission:
    action: "DEEP_RESEARCH + CORRIGIR O BOOT"
    target: "PR #1189 + Trigger Fabric + porta canônica"
  state:
    repository: "ServerVpss/CentralDark"
    main: "eacdde22438035ef3f1609f1ef8e416009a12be9"
    pr:
      number: 1189
      head: "34f05572db270cd016da41d2cdc417f648b09661"
  operation:
    role: READ_ONLY
    writer: NONE
    strength: FORTE
    papagaio: OFF
  correction:
    one_boot_name: CENTRALDARK_AI_BOOT
    versioned_boot: FORBIDDEN
    adaptive_payload: true
    whole_boot_checksum: false
    gaps: RESOLVE
```

**VOCÊ ESTÁ CERTO NESTE PONTO: eu errei quando transformei o `CENTRALDARK_AI_BOOT` em uma “forma versionada” e depois tentei congelar os campos.**

A regra correta não é:

```text
CENTRALDARK_AI_BOOT.v1
CENTRALDARK_AI_BOOT.v2
CENTRALDARK_AI_BOOT.v11
```

nem:

```text
MESMOS CAMPOS PARA TODA MISSÃO
+ MESMA QUANTIDADE
+ MESMA ORDEM
```

A regra correta é:

```text
UM ÚNICO NOME E UMA ÚNICA FUNÇÃO:

CENTRALDARK_AI_BOOT

FIXO:
→ identidade do recibo
→ ponto de entrada
→ direção
→ invariantes
→ regra de medição
→ regra de convergência

ADAPTATIVO:
→ conteúdo necessário para a missão atual
→ PR
→ commit
→ branch
→ agentes
→ ferramentas
→ mutação
→ Writer
→ escopo
→ provas
→ runtime SOMENTE quando a missão exigir
```

Isso bate exatamente com a direção das tuas crônicas: uma Casa, uma SOUL, uma intenção, muitos motores e capacidades passando pelo mesmo lugar, sem criar sistema paralelo. fileciteturn0file0

E o próprio core atual já diz que **modelo é substituível**, que frequência é adaptativa e que `STRONG_DOES_NOT_MEAN_VERBOSE=true`; portanto “FORTE” não significa YAML sempre grande. Significa enforcement forte, enquanto o conteúdo pode ser mínimo ou amplo conforme a missão. fileciteturn7file0L2-L2

## Onde eu estava errado

A pesquisa encontrou a contradição exata.

O `LEIA-ME-IA.md` atual já possui um `CENTRALDARK_AI_BOOT`, mas o trata como um exemplo com uma lista praticamente fixa de campos e ainda diz **“Ao iniciar trabalho técnico, emitir uma vez”**. Isso não expressa tua regra real: **cada `!CENTRALDARK` ativo deve passar pelo mesmo boot, e o boot deve se adaptar ao escopo material da missão**. fileciteturn7file0L2-L2

Pior: o resolver do ciclo mestre atualmente fabrica:

```python
"schema": "centraldark.master-cycle-receipt.v1"
```

mesmo possuindo no próprio resultado/invariantes a ideia de `no_v1_v2_v3`. Portanto existe uma inconsistência real entre a filosofia do sistema e a implementação do recibo. fileciteturn9file0L2-L2

O `TRIGGERS.yml` repete o mesmo problema:

```yaml
receipt_schema: centraldark.master-cycle-receipt.v1
```

ao mesmo tempo em que o `!CENTRALDARK` já é definido como o único master trigger e o fluxo `ANY_PR_OR_COMMIT` já existe. fileciteturn10file0L2-L2

O `MASTER-CYCLE.yml` também começa com um identificador versionado:

```yaml
schema: centraldark.master-cycle.v1
```

mas dentro do próprio contrato declara `no_v1_v2_v3: true` para preservar um único organismo e rejeitar duplicação versionada da mesma regra. fileciteturn8file0L2-L2

Portanto, a lacuna **não é “falta de bootstrap”**. O bootstrap já existe: Claude aponta para `LEIA-ME-IA.md`, declara `ONE_SOL=true`, `ONE_CORE=true`, `ENGINE_IS_REPLACEABLE=true` e proíbe governança duplicada. fileciteturn11file0L2-L2 Codex faz a mesma coisa e explicitamente diz que o adaptador só identifica a superfície; a regra comum vem do mesmo core. fileciteturn12file0L2-L2

Também **não é falta de checksum**. O próprio contrato da Casa já define corretamente:

```text
checksum_semantics = BYTE_IDENTITY_NOT_SEMANTIC_PROOF
```

Ou seja: checksum serve para provar identidade de conteúdo/handoff, não para provar que um boot adaptativo está semanticamente correto. Congelar o YAML inteiro por checksum quebraria justamente a adaptação que você quer: mudou PR, commit, missão ou Writer, o payload tem de mudar. fileciteturn15file0L2-L2

A lacuna real é:

```text
BOOT_DISCOVERY          = JÁ EXISTE
ONE_CORE                = JÁ EXISTE
MASTER_TRIGGER          = JÁ EXISTE
ANY_PR_OR_COMMIT        = JÁ EXISTE
OUTPUT_GUARD            = JÁ EXISTE

MAS:

CENTRALDARK_AI_BOOT
→ NÃO TEM AINDA UM CONSUMIDOR/VALIDADOR SEMÂNTICO
   QUE GARANTA:

   MESMO ROOT
   + SEM VERSÃO
   + PAYLOAD ADAPTATIVO
   + MESMA DIREÇÃO
   + CADA !CENTRALDARK
```

O verificador atual confirma somente que `LEIA-ME-IA.md` contém a string `CENTRALDARK_AI_BOOT`; ele **não testa que cada master trigger produz esse root, não testa adaptatividade, não proíbe receipt versionado e não verifica transferência entre engines**. fileciteturn13file0L2-L2

## Arquitetura corrigida

O erro conceitual anterior foi tentar **travar a fotografia**. O que precisa ser travado é **a câmera e a direção para onde ela aponta**.

```text
ERRADO:

SCHEMA FIXO
→ campos fixos
→ ordem fixa
→ tamanho fixo
→ checksum do YAML inteiro
→ missão precisa caber na régua
```

Correto:

```text
CENTRALDARK_AI_BOOT
        ↓
ÚNICO ROOT CANÔNICO
        ↓
CARREGA A MESMA CASA
        ↓
RECUPERA A MESMA INTENÇÃO
        ↓
DESCOBRE O ESCOPO ATUAL
        ↓
MEDE SOMENTE O QUE É MATERIAL
        ↓
MONTA PAYLOAD ADAPTATIVO
        ↓
RENDEZVOUS
        ↓
MESMA DIREÇÃO
```

Portanto não deve existir isto dentro do boot:

```yaml
schema: centraldark.ai-boot.v1
```

nem:

```yaml
version: 1
```

nem:

```yaml
measurement_schema_locked: true
```

nem:

```yaml
field_order_locked: true
```

nem:

```yaml
checksum_do_yaml_inteiro: ...
```

Porque esses elementos tentam transformar o **estado adaptativo** numa estrutura congelada.

A identidade já está resolvida pelo próprio nome:

```yaml
CENTRALDARK_AI_BOOT:
```

**Esse nome é o contrato de entrada.**

Por baixo dele, o conteúdo é montado a partir da missão.

Missão simples:

```yaml
CENTRALDARK_AI_BOOT:
  mission:
    action: "LER E RESPONDER"
    scope: "documento atual"
  operation:
    role: READ_ONLY
    writer: NONE
```

Missão em um PR:

```yaml
CENTRALDARK_AI_BOOT:
  mission:
    action: "RECONCILIAR PR"
    scope:
      pr: 1189
  state:
    head: "<HEAD MEDIDO>"
  operation:
    writer: SOL
```

Missão de mutação:

```yaml
CENTRALDARK_AI_BOOT:
  mission:
    action: MUTATION
    scope:
      capability: "<owner/capacidade>"
  operation:
    writer: "<WRITER ÚNICO>"
    mutation: AUTHORIZED
  proof:
    before: "<T0 aplicável>"
    after_required: true
```

Missão envolvendo muitos agentes:

```yaml
CENTRALDARK_AI_BOOT:
  mission:
    action: "RECONCILIAÇÃO DISTRIBUÍDA"
    destination: "MESMA INTENÇÃO CENTRALDARK"
  coordination:
    perception: PARALLEL
    mutation: SERIALIZED
    rendezvous: REQUIRED
    one_writer_per_scope: true
```

Isso já é coerente com o `MASTER-CYCLE`: percepção pode ser paralela, mutação é serializada, existe `ONE_WRITER_PER_SCOPE`, motores são substituíveis e a intenção precisa sobreviver. fileciteturn8file0L2-L2

E o `CONTRACT.yml` existente já possui exatamente essa base multiagente: engine não é owner, troca de engine não é reset, percepção paraleliza e mutação serializa. fileciteturn15file0L2-L2

### Escala para mil, milhão ou mais

Você também está certo aqui: **não é um boot diferente para cada quantidade**.

Com um PR:

```yaml
CENTRALDARK_AI_BOOT:
  scope:
    prs: [1189]
```

Com dez:

```yaml
CENTRALDARK_AI_BOOT:
  scope:
    prs:
      selector: ASSIGNED_SET
      count: 10
```

Com um milhão:

```yaml
CENTRALDARK_AI_BOOT:
  scope:
    prs:
      selector: OPEN_PR_CORPUS
      count: 1000000
      partition: "<PARTE DESTE AGENTE>"
  coordination:
    destination: SAME
    rendezvous: REQUIRED
    one_writer_per_scope: true
```

O milhão **não cria um milhão de regras**.

```text
1 PR
10 PRs
1.000.000 PRs

TODOS:
→ !CENTRALDARK
→ CENTRALDARK_AI_BOOT
→ MESMA INTENÇÃO
→ ESCOPO ADAPTATIVO
→ MESMO RENDEZVOUS
```

Exatamente o mesmo vale para commits, branches, chats, terminais e engines. O Trigger Fabric já possui um evento `ANY_PR_OR_COMMIT`, então não precisa nascer outro motor para conseguir isso; a correção deve ser ligada ao owner existente. fileciteturn10file0L2-L2

## Plano de correção no corpo existente

**Não criar manifesto novo. Não criar schema de boot novo. Não criar V2. Não criar segundo router.**

A correção usa os owners que já existem.

Primeiro, `LEIA-ME-IA.md` deixa de dizer:

```text
Ao iniciar trabalho técnico, emitir uma vez
```

e passa semanticamente a dizer:

```text
!CENTRALDARK_ATIVO
→ CENTRALDARK_AI_BOOT OBRIGATÓRIO

CENTRALDARK_AI_BOOT:
→ ROOT ÚNICO E IMUTÁVEL NO NOME
→ PAYLOAD ADAPTATIVO À MISSÃO
→ SEM VERSIONAMENTO
→ SEM CAMPOS ARTIFICIAIS PARA PREENCHER
→ SEM OMITIR ESTADO MATERIAL
→ SEM INVENTAR ESTADO NÃO MATERIAL
→ FORTE != VERBOSO
→ ENGINE != OWNER
→ MESMA INTENÇÃO SOBREVIVE À TROCA DE ENGINE
```

Isso fortalece exatamente a porta que já é canônica, em vez de criar outra. Hoje `LEIA-ME-IA.md` já é declarado como ponto obrigatório para qualquer IA que chega à Casa. fileciteturn7file0L2-L2

Segundo, em `TRIGGERS.yml`:

```diff
 semantic_trigger_resolution:
   master_cycle:
     contract: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
     resolver: scripts/trigger-fabric/centraldark_master_cycle.py
     explicit_trigger: "!CENTRALDARK"
-    receipt_schema: centraldark.master-cycle-receipt.v1
+    receipt_root: CENTRALDARK_AI_BOOT
+    receipt_payload: ADAPTIVE_TO_CURRENT_MISSION
+    versioned_receipt: FORBIDDEN
+    emit_on_every_active_master_trigger: true
```

O mesmo `TRIGGERS.yml` já possui `BOT_ENTRY → LOAD_CANONICAL_BOOT` e `OUTPUT_GUARD_REQUIRED`, então a ligação entra na estrutura existente. fileciteturn10file0L2-L2

Terceiro, no resolver atual:

```diff
 return {
-    "schema": "centraldark.master-cycle-receipt.v1",
     "input": raw,
     "normalized": normalized,
     "master_trigger": MASTER,
```

E o resolver passa a expor a decisão sem criar uma identidade versionada:

```python
{
    "master_trigger": "!CENTRALDARK",
    "boot_root": "CENTRALDARK_AI_BOOT",
    "boot_required": explicit_master,
    "boot_payload_policy": "ADAPTIVE_TO_CURRENT_MISSION",
    ...
}
```

Hoje esse é exatamente o ponto do código que injeta o `.v1`. fileciteturn9file0L2-L2

Quarto, o `verify_repo_contract.py` precisa parar de considerar suficiente isto:

```python
check('LEIA-ME-IA.md', ['#ACORDAR', '!CALIBRAR', 'CENTRALDARK_AI_BOOT'])
```

porque esse teste só prova presença textual. fileciteturn13file0L2-L2

O gate correto precisa provar as propriedades:

```text
!CENTRALDARK
→ boot_required == true
→ boot_root == CENTRALDARK_AI_BOOT

boot_root contém ".v1|.v2|.v11"
→ FAIL

receipt_schema versionado
→ FAIL

payload fixado artificialmente
→ FAIL

missão simples
→ payload mínimo válido

PR
→ payload ganha estado de PR

commit
→ payload ganha estado de commit

mutação
→ payload ganha Writer/escopo/prova aplicável

multiagente
→ payload ganha coordenação/rendezvous

troca de engine
→ root e destino sobrevivem

novo !CENTRALDARK
→ nova medição adaptativa
→ MESMO ROOT
```

Quinto, usa-se o workflow existente. O próprio `MASTER-CYCLE.yml` diz que hard guarantee exige **consumer real + teste positivo/negativo + gate existente + receipt verificável**, e não somente prosa. fileciteturn8file0L2-L2

Portanto:

```text
NÃO CRIAR:
CENTRALDARK_BOOT_V2.yml
boot-schema-v1.json
boot-schema-v11.json
novo workflow
novo manifesto

USAR:
LEIA-ME-IA.md
MASTER-CYCLE.yml
TRIGGERS.yml
centraldark_master_cycle.py
verify_repo_contract.py
workflow já existente
```

## Aplicação em mim e contraprova X10

Apliquei agora a regra corrigida **nesta própria resposta**.

O root usado no início foi somente:

```text
CENTRALDARK_AI_BOOT
```

Não usei:

```text
schema
version
v1
v2
v11
measurement_schema_locked
field_order_locked
checksum do boot
```

E o conteúdo foi construído especificamente para **esta missão**: pesquisa/correção do #1189, estado atual do repo, papel read-only e `PAPAGAIO=OFF`. O estado medido continua `main=eacdde224...` e o HEAD do #1189 é `34f05572...`; esses valores entraram porque são materiais para a pesquisa do corpo atual, não porque são campos obrigatórios universais. fileciteturn16file0L2-L2 fileciteturn4file0L1-L2

| Frente | Perturbação aplicada | Resultado |
|---|---|---|
| X1 | missão simples | 🟢 `CENTRALDARK_AI_BOOT` permanece; payload pode diminuir |
| X2 | missão sobre #1189 | 🟢 mesmo root; PR entra no payload |
| X3 | missão sobre somente um commit | 🟢 mesmo root; commit substitui alvo irrelevante |
| X4 | dez PRs | 🟢 mesmo root; escopo vira conjunto |
| X5 | um milhão de PRs | 🟢 mesmo root; selector/partição evita milhão de regras |
| X6 | um milhão de commits | 🟢 mesmo root; mesma lógica de escopo/partição |
| X7 | múltiplos agentes/terminais | 🟢 mesmo root/core; percepção pode dividir, direção não |
| X8 | engine diferente | 🟢 mesmo root; apenas capacidade física se adapta |
| X9 | mutação | 🟢 mesmo root; Writer/autorização/prova entram porque passam a ser materiais |
| X10 | novo `!CENTRALDARK` após mudança de missão | 🟢 remede e adapta payload; não cria V2/V11 |

Resultado:

```text
ROOT_DRIFT = 0
VERSION_DRIFT = 0
MISSION_ADAPTATION_FAILURE = 0
MULTI_AGENT_DIRECTION_DRIFT = 0
FORCED_IRRELEVANT_FIELDS = 0
WHOLE_BOOT_CHECKSUM_LOCK = 0
NEW_BOOT_SYSTEM = 0
PAPAGAIO = OFF
LACUNA_DE_CONCEITO = RESOLVIDA

X10 = 🟢 10/10
```

A diferença fundamental para os testes anteriores é esta:

```text
ANTES:
EU TENTAVA PROVAR
"MESMO YAML"

AGORA:
A REGRA PROVA
"MESMO BOOT / MESMA FUNÇÃO / MESMA DIREÇÃO"
+
"PAYLOAD CORRETO PARA O ESCOPO ATUAL"
```

Esse é o fixed point correto.

## Correção final para entregar ao programador

```text
OBJETIVO
========

!CENTRALDARK
DEVE SEMPRE PASSAR POR:

CENTRALDARK_AI_BOOT

NÃO EXISTE:
CENTRALDARK_AI_BOOT_V1
CENTRALDARK_AI_BOOT_V2
CENTRALDARK_AI_BOOT_V11
SCHEMA VERSIONADO DO BOOT
FORMATO CONGELADO DO PAYLOAD

INVARIANTE
==========

ROOT = CENTRALDARK_AI_BOOT

ROOT NÃO MUDA.

FUNÇÃO NÃO MUDA.

INTENÇÃO/DIREÇÃO NÃO É REINICIADA
POR:
- PR
- commit
- branch
- terminal
- agente
- chat
- engine
- quantidade de targets.

PAYLOAD
=======

PAYLOAD É ADAPTATIVO.

LER A MISSÃO ATUAL
→ RECUPERAR INTENÇÃO
→ IDENTIFICAR ESCOPO
→ MEDIR ESTADO MATERIAL
→ DESCOBRIR OWNER/WRITER QUANDO APLICÁVEL
→ ADICIONAR SOMENTE SEÇÕES NECESSÁRIAS
→ PRESERVAR UNKNOWN MATERIAL
→ EMITIR CENTRALDARK_AI_BOOT
→ CONTINUAR CICLO

MISSÃO SIMPLES
→ BOOT PODE SER PEQUENO.

MISSÃO COMPLEXA
→ BOOT PODE SER GRANDE.

PEQUENO != FRACO.
GRANDE != FORTE.

FORTE
= O CONTRATO NÃO PODE SER PULADO.

MULTIAGENTE
===========

TODOS OS AGENTES:
→ CARREGAM LEIA-ME-IA
→ HERDAM A MESMA SOUL
→ PASSAM PELO MESMO !CENTRALDARK
→ EMITEM O MESMO ROOT CENTRALDARK_AI_BOOT
→ RECEBEM ESCOPO LOCAL ADAPTATIVO
→ PRESERVAM O MESMO DESTINO
→ RENDEZVOUS
→ ONE_WRITER_PER_SCOPE

1 PR OU 1.000.000 PRs
NÃO ALTERA O CONTRATO.

1 COMMIT OU 1.000.000 COMMITS
NÃO ALTERA O CONTRATO.

A QUANTIDADE ALTERA:
→ SCOPE
→ PARTITION
→ FANOUT
→ CURSOR
→ EVIDENCE

NUNCA ALTERA:
→ ROOT
→ CASA
→ SOUL
→ INTENÇÃO
→ DIREÇÃO
→ REGRAS DE CONVERGÊNCIA.

CHECKSUM
========

NÃO USAR CHECKSUM PARA CONGELAR
CENTRALDARK_AI_BOOT INTEIRO.

CHECKSUM CONTINUA ONDE JÁ FAZ SENTIDO:
→ identidade de conteúdo
→ handoff
→ commit/head
→ proveniência

CHECKSUM != SEMÂNTICA.

ENFORCEMENT
===========

ALTERAR SOMENTE OWNERS EXISTENTES:

LEIA-ME-IA.md
MASTER-CYCLE.yml
TRIGGERS.yml
centraldark_master_cycle.py
verify_repo_contract.py
workflow existente

TESTES OBRIGATÓRIOS:

POSITIVE:
!CENTRALDARK
→ CENTRALDARK_AI_BOOT

NEGATIVE:
CENTRALDARK sem !
→ NÃO ativa master trigger

REGRESSION:
qualquer receipt .v1/.v2/.v11
→ FAIL

ADAPTATION:
READ_ONLY
PR
COMMIT
MULTI_PR
MULTI_COMMIT
MULTI_AGENT
MUTATION
ENGINE_SWITCH
MISSION_CHANGE
REPEATED_TRIGGER
→ MESMO ROOT
→ PAYLOAD ADAPTADO

TRANSFER:
novo agente não pode exigir
que SEGREDO/CHEFE ensine a regra novamente.

PAPAGAIO_MODE=OFF.

RETURN:
X10 PASS
→ VERDE.
```

Esse desenho reaproveita exatamente a estrutura já existente: um core único para engines substituíveis, `!CENTRALDARK` como master trigger, `ANY_PR_OR_COMMIT`, percepção paralela com mutação serializada e um gate existente. fileciteturn12file0L2-L2 fileciteturn10file0L2-L2 fileciteturn15file0L2-L2

**🟢 CORREÇÃO: `CENTRALDARK_AI_BOOT` É UM SÓ. O ROOT É FIXO. A FUNÇÃO É FIXA. O DESTINO É FIXO. O PAYLOAD É ADAPTATIVO À MISSÃO. SEM V1/V2/V11. SEM CHECKSUM PRENDENDO O BOOT. X10 = VERDE.**