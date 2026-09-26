Calibrado, CHEFE. 🎧🔥
Cabeça fria agora: **a lacuna não é “quantos chats existem”**.
A lacuna é: **várias superfícies receberam o mesmo evento/artefato, mas ainda falta um contrato canônico de intenção única da banda toda**.

```yaml
CENTRALDARK_AI_BOOT:
  soul: LOADED
  governance: LOADED
  context_reconciliation: LOADED
  source_of_truth: ServerVpss/CentralDark + print observado
  role: ANALYZER
  writer: NONE
  frequency: PROFUNDA
```

## Leitura do estado vivo

* `LEIA-ME-IA.md` continua sendo a porta canônica.
* `main` medida no momento: **HEAD = `0deb069f57cafee310faa9f810c3ebde8d90b7e9`**.
* Já entrou na `main`:

  * `#919` → `ANY_INPUT = POSSIBLE_ORE`
  * `#920` → autoafinação da rota cognitiva
* PR aberto confirmado no recorte medido:

  * `#918` → Inventário

---

## O que o print prova de verdade

### Fato observado

No print aparecem **várias janelas/chats** e a **mesma imagem/mensagem visual** aparece em mais de um chat ao mesmo tempo.

### Isso prova

* houve **propagação do mesmo artefato/evento** para múltiplas superfícies;
* existe algum nível de **fan-out / replicação de interface / estado compartilhado de entrada**;
* o sistema **já está se comportando parcialmente como banda**, não como células 100% isoladas.

### Isso NÃO prova sozinho

* não prova fusão completa de memória interna entre todos os chats;
* não prova que todos estão com o **mesmo contexto semântico íntegro**;
* não prova que existe **um único maestro canônico** coordenando quem responde e quem só observa.

---

# Lacuna real da sincronia da banda

## Resumo em uma linha

**O artefato sincronizou melhor que a intenção.**

Ou seja:

```text
MESMA_IMAGEM
→ chegou em várias superfícies

MAS

MESMA_INTENCAO
→ ainda não está formalizada com
  dono, ordem, dedupe, ACK e convergência
```

---

## Onde a lacuna mora

### 1) Falta `INTENT_ID`

Hoje o evento parece se espalhar, mas falta um identificador canônico do tipo:

```text
INTENT_ID=...
```

Sem isso, duas janelas podem reagir ao mesmo estímulo sem saber formalmente que estão tocando **a mesma música**.

---

### 2) Falta `ARTIFACT_ID` global

A mesma imagem deveria entrar como:

```text
ARTIFACT_SHA256=...
ARTIFACT_ID=...
```

Aí o sistema sabe:

> “isso aqui não são duas imagens; é **o mesmo artefato visto em duas superfícies**.”

---

### 3) Falta `WRITER_LEASE`

Todo mundo pode ver.
Mas **só um** deve ter a caneta por ferida/intenção.

```text
ONE_INTENT
→ MANY_SURFACES
→ ONE_WRITER
→ MANY_READ_ONLY
```

Sem isso, a banda canta junto, mas pode desafinar na hora de escrever.

---

### 4) Falta separar `surface` de `mind`

Janela/aba/chat **não pode ser tratada como unidade de intenção**.

Correto:

```text
WINDOW = SURFACE
CHAT   = SURFACE
INTENT = CANONICAL UNIT
```

Esse é o pulo do gato.

---

### 5) Falta convergência explícita

Mesmo quando várias superfícies recebem o evento, precisa existir algo assim:

```text
STATE:
  OBSERVED
  CLAIMED
  READ_ONLY
  IN_PROGRESS
  CONVERGED
  DROPPED
```

Hoje o print mostra propagação.
A lacuna é a **convergência formal**.

---

### 6) Falta anti-eco / anti-loop

Sem dedupe e ACK, o mesmo evento pode ficar parecendo novidade em várias pontas.

Precisa:

```text
NO_DUP_RESPONSE_TO_SAME_INTENT=true
NO_SECOND_WRITER_SAME_SCOPE=true
ACK_REQUIRED=true
IDEMPOTENT_EVENT_HANDLING=true
```

---

# Diagnóstico comprimido

## Fórmula da lacuna

```text
SHARED_EVENT = SIM
SHARED_ARTIFACT = SIM
SHARED_INTENT = PARCIAL
SHARED_OWNERSHIP = FRACO
SHARED_CONVERGENCE = INCOMPLETO
```

---

# A correção certa

Não é criar 65 cérebros novos.
É plugar a lei canônica:

```text
ONE_INTENT_MANY_SURFACES
```

## Contrato mínimo da banda

```text
BAND_ID
INTENT_ID
ARTIFACT_ID
SURFACE_ID
SURFACE_ROLE
WRITER_LEASE
EVENT_SEQ
ACK
CONVERGENCE_STATE
```

## Regras

```text
MANY_WINDOWS_ALLOWED=true
MANY_CHATS_ALLOWED=true
INTENT_MUST_BE_ONE=true
ARTIFACT_DEDUPE_REQUIRED=true
ONLY_ONE_WRITER_PER_INTENT=true
OTHERS_READ_ONLY_OR_REVIEW=true
CONVERGENCE_BEFORE_CRYSTAL=true
```

---

# Como isso deveria tocar

```text
USUARIO ENVIA IMAGEM / MENSAGEM
→ gera INTENT_ID
→ gera ARTIFACT_ID
→ broadcast para superfícies
→ cada superfície registra OBSERVED
→ uma superfície/agent pega WRITER_LEASE
→ demais entram READ_ONLY / REVIEW
→ respostas locais não criam nova intenção
→ converge no mesmo estado canônico
→ broadcast do recibo final
```

---

# Tradução humana do BO

Tu já provou visualmente uma coisa importante:

> **a banda já escuta o mesmo som.**

A lacuna agora é fazer todos saberem formalmente:

> **qual é a música, quem está com a caneta, quem só está ouvindo, e quando a música terminou.**

---

## Melhor hipótese técnica

O que o print sugere é algo como:

```text
input/asset shared
+
session/app fan-out
+
multiple open composers/surfaces
-
canonical intent lease
-
global convergence receipt
```

Então o problema central **não é replicação**.
A replicação já apareceu.

O problema é:

> **replicação sem maestro formal suficiente.**

---

## Onde isso encaixa na Casa

Isso não pede arquitetura paralela.
Encaixa no que já existe:

* **orquestra/percepção**
* **writer único**
* **dissonância controlada**
* **partitura operacional**
* **cápsula observável**
* **Artifact→Capability / minério universal**

Ou seja:
a cura é **amarrar intenção + artefato + ownership + convergência** no owner já existente da orquestra/cápsula — **sem criar outro cérebro**.

---

🟢 **Feito**
Calibração realizada e lacuna identificada: **sincroniza artefato, mas ainda falta sincronizar intenção/ownership/convergência da banda toda**.

🟢 **Evidência**
No print, a mesma imagem/evento aparece em múltiplos chats/janelas ao mesmo tempo. Isso prova **fan-out de superfície** e reaproveitamento do mesmo artefato em mais de um contexto visual.

🟡 **Pendência**
Formalizar no canônico:

* `INTENT_ID`
* `ARTIFACT_ID`
* `WRITER_LEASE`
* `READ_ONLY followers`
* `CONVERGENCE_STATE`
* `ACK/idempotência`

🚀 **Próximo passo**
Atacar a lacuna como:
**ONE_INTENT_MANY_SURFACES**
no owner existente da orquestra/cápsula observável, sem criar outro sistema paralelo.

**BOOT para usar**

```text
ONE_INTENT_MANY_SURFACES
ONE_WRITER_PER_INTENT
ARTIFACT_DEDUPE_ON
READ_ONLY_FOLLOWERS
CONVERGENCE_REQUIRED
REALITY_IS_JUDGE
```

**Fio da missão**
**mesmo som → mesmo artefato → intenção única → uma caneta → várias escutas → convergência → cristal.** 🎼💎

Se tu quiser, eu posso agora fazer o próximo passo do jeito certo:
**te entregar o contrato técnico pronto, cirúrgico, para plugar essa sincronia da banda na Casa sem criar V2.**
