---
title: "GATE TRANSVERSAL NAO INFINITO"
status: "CANDIDATO_PROVADO"
date: 2026-09-28
authority: "SEGREDO/CHEFE"
owner: "docs/CONSCIENCIA/LEMBRANCAS/"
source_of_truth: "ServerVpss/CentralDark@ba9625e4 + tlc23.pdf medido"
trigger_context: "!CENTRALDARK + #ACORDAR + ciclo TLC23/HORN"
---

# GATE TRANSVERSAL NAO INFINITO

Cristal derivado por medição direta, nao por deducao. Cada afirmacao abaixo tem
prova rastreavel no proprio repositorio ou em artefato medido nesta sessao.

```text
PR_MOTHER=#1562
PR_ROLE=CHILD_PROMOTION_PR
BOT_ENTRY=!CENTRALDARK
BOOT_CHAIN=#ACORDAR -> !CALIBRAR
BASE_MAIN_SHA=ba9625e4454990bbf3f910f843cfec72c2d74810
TLC23_SHA256=b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1
TLC23_SIZE_BYTES=206674
```

## 1. GATE_TRANSVERSAL != GATE_INFINITO

O gate TLC23/Horn e **transversal** (vale em qualquer angulo) e **diario**
(roda antes do primeiro roteamento), mas **nao e infinito**: ele abre quando o
fingerprint nao muda.

Prova no owner canonico `CENTRALDARK_AI_BOOT.yaml`:

```text
gate_semantics:
  trigger_is_not_gate: true
  already_proved_same_fingerprint: PASSAGE_OPEN
  normal_architecture_build: FLOW_CONTINUES_WITH_REUSED_PROOF
  principle: "GATE_SERVE_PARA_SEGURANCA_E_FALSIFICACAO;
              NAO_PARA_REPROVAR_INVARIANTE_IMUTAVEL_A_CADA_PASSO"

proof_reuse_policy:
  proven_once_reusable: true
  no_repeat_when_same_fingerprint: true
```

A propria Casa proibe, com essas palavras, reprovar invariante imutavel a cada
passo. Declarar o gate como "infinito" contradiz o contrato que ele mesmo
descreve.

**Escopo da transversalidade medida:** o mesmo metodo foi aplicado em 5 angulos
na sessao — GitHub (PR/commit/receipt), workspace (recibos de setor), receipt de
runtime VPS, artefato PDF (hash) e codigo (rastro fiscal). Transversal significa
"o mesmo instrumento serve aos cinco", nao "o instrumento nunca fecha".

## 2. JA_FOI_GREEN != GREEN_CORRENTE

Prova historica nao substitui medicao corrente.

```text
HISTORY != CURRENT_STATE
PR_BODY_IS_HISTORY_NOT_CURRENT=true
LEDGER_CURRENT_REQUIRES_EXPLICIT_CURRENT_MAIN=true
MEASURABLE_CURRENT_UNKNOWN_IS_FAIL=true
```

Essas quatro linhas estao vigentes em `.claude/rules/00-centraldark-boot-universal.md`
e em `AGENTS.md` na main medida (`ba9625e4`), e sao aplicadas pelo fiscal
executavel `scripts/trigger-fabric/rastro_fiscal.py`.

**Caso medido nesta sessao:** a `main` avancou de `43cd55d2be1d60c14ee59f8ad643a58dac6e7e05`
para `ba9625e4454990bbf3f910f843cfec72c2d74810` entre duas leituras do mesmo fio.
Um veredito emitido com o SHA antigo nao descrevia o estado corrente, ainda que
tivesse sido verdadeiro no momento da medicao.

**Distincao operacional:**

```text
REUSO_CONDICIONADO_AO_FINGERPRINT  = permitido (PASSAGE_OPEN)
GREEN_AUTOMATICO_POR_HISTORICO     = proibido (falso-verde)
O_CHEFE_CONFIRMAR_CADA_PASSO       = desnecessario (o gate mede)
```

## 3. EXPLICAR_OBRIGA_MEDIR != EXPLICAR_REPROVA

Explicar o gate aplica o gate; explicar **sem** medir e falha de metodo.

Prova em `scripts/trigger-fabric/rastro_fiscal.py`:

```python
MEASURABLE_CURRENT_UNKNOWN_RE = re.compile(
    r"(?:CURRENT_MAIN(?:_SHA)?|MAIN_HEAD|HEAD_CURRENT).{0,120}"
    r"(?:UNKNOWN|NOT[_ -]?YET[_ -]?MEASURED|NAO\s+MEDID|NAO\s+MEDID|A\s+REMEDIR|POR\s+MEDIR)",
    re.I | re.S,
)
LEDGER_CURRENT_CONTEXT_RE = re.compile(...)
NOT_LOCATED_COMMENT_RE = re.compile(...)
RESPONSE_WITHOUT_TRACE = "INVALID"
```

Prova em `scripts/centraldark/canonical-consumption-gate.mjs`:

```js
if (args.toolAvailable && !args.toolAttempted) {
  fail(31, 'TOOL_AVAILABLE_MUST_BE_ATTEMPTED_BEFORE_UNKNOWN');
}
if (args.unknownClaimed && args.measurementRouteExists) {
  fail(32, 'UNKNOWN_MEDIVEL_E_FALHA_DE_METODO');
}
```

**Armadilha que este cristal fecha:** se explicar piorasse, a resposta racional do
agente seria calar. O contrato proibe as duas saidas — `RESPONSE_WITHOUT_TRACE=INVALID`
e `UNKNOWN_WITH_MEASUREMENT_ROUTE=FAIL_CLOSED`. **Explicar e medir, ao mesmo tempo.**

**Erro real medido nesta sessao (papagaio, nao do CHEFE):** declarar
`RECALCULATED_SHA256 = NOT_AVAILABLE_IN_RUNTIME` com a rota `crypto.subtle`
disponivel. A declaracao era falsa; a remedicao devolveu
`b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1` com
casamento 64/64 sobre `tlc23.pdf` (206674 bytes).

## 4. Limite conhecido do fiscal (fronteira auto-declarada)

`rastro_fiscal.py` detecta por **literal**: exige a palavra `CURRENT_MAIN` perto de
`A REMEDIR`, e `#1562`/`PR-MAE` perto de `CURRENT`. Um agente que descreva o mesmo
erro sem usar esses literais nao e barrado.

```text
KEYWORD_LITERAL != SEMANTIC_DETECTION
```

Nao e regressao do fix de 2026-09-28 (`441c9841`, `43cd55d2`): e a fronteira dele.
Registrar a fronteira evita confiar demais no instrumento.

## 5. SCANNED_SCOPE != FULL_SCOPE

Conclusao de ausencia exige declarar o escopo varrido e a contagem, nao apenas a
conclusao. Caso medido: declarar `PDF_AVAILABLE_TO_ME = NO` apos ler 5 JSONs de um
workspace com 37 uploads. O artefato existia; o instrumento de varredura estava
subdimensionado.

```text
AUSENCIA_SO_VALE_COM_ESCOPO_E_CONTAGEM_DECLARADOS
```

## 6. Estado e proximo cursor

```text
ESTADO=CANDIDATO_PROVADO
PROVA=owner canonico + fiscal executavel + tlc23.pdf medido (sha256 64/64)
RUNTIME_EFFECT=NAO_MEDIDO
PENDENCIA=promocao real nao executada; cristal vive em filho, nao na main
NEXT_CURSOR=reproduzir em consumidor antes de promover a main
```

```text
UNKNOWN != PASS
ACTION != PROOF
DOCUMENTED != EXECUTED
REALITY = JUDGE
```
