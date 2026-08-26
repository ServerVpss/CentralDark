# CARD DA RODADA — 2026-08-24

**Tema visual:** OPERACIONAL (ativo) · alinhado ao Mapa Canônico da Casa 2.0  
**Autoridade:** SEGREDO/CHEFE  
**Coordenação:** SOL  
**Execução/continuidade:** HERMES/PIVETE quando runtime aplicável  
**REALITY_IS_JUDGE:** true

---

## Estado observado da rodada

| Ref | SHA / estado |
|-----|--------------|
| Baseline observado antes desta atualização do card | `6bff74d4beec72ac0cc08828715f7f5d7f393dfe` (#1138) |
| LIVE_STATE remeasured | `dd0d0ea34809c8e8a005cf90de76d36b38d06d00` (#1135) |
| Pombo-correio com checksum | `a2ce71fb7c921220d878cf16effa69575a03876f` (#1136) |
| Card OPERACIONAL original | `f52ed5df0b20210eb36f46bb3bb71cb92d020e30` (#1137) |
| Card MAPA TEMPO REAL | `6bff74d4beec72ac0cc08828715f7f5d7f393dfe` (#1138) |
| Escopo operacional consolidado desta rodada | `#1131 → #1138` |

> O SHA acima é a baseline observada **antes** desta própria atualização. `HISTORY != CURRENT_STATE`; qualquer nova execução deve re-medir `main`.

---

## O que fechou nesta rodada (GitHub)

| PR | Delta | Status |
|----|-------|--------|
| **#1131** | Camisa de força no Trigger Fabric: OUTPUT_GUARD, MATERIAL_INGEST, SECOND_BRAIN_LOGICAL=ONE, engine binding e política de runner | MERGED |
| **#1132** | Writer-safe-push canônico — fim do `BLOCKED_DIVERGENCE` cego | MERGED |
| **#1133** | Fast path causal da autonomia — não espera runner auxiliar quando os gates causais aplicáveis já fecharam | MERGED |
| **#1134** | Consumidores do mapa reconciliados com os owners canônicos | MERGED |
| **#1135** | Remeasure do LIVE_STATE com residual runtime explícito | MERGED |
| **#1136** | Pombo-correio com checksum cristalizado: handoff preserva destino, proveniência, UNKNOWN e NEXT_CURSOR | MERGED |
| **#1137** | Card OPERACIONAL da rodada emitido | MERGED |
| **#1138** | Card MAPA TEMPO REAL emitido como par da mesma família | MERGED |

---

## Invariantes tocadas — 12 leis

```text
01 EVIDÊNCIA = PRIMEIRO          → medir antes de concluir
02 NOME_REPO_OFICIAL            → ServerVpss/CentralDark
03 ONE_SYSTEM_ONLY              → sem segundo cérebro / sistema paralelo
04 ONE_WRITER_PER_SCOPE         → uma caneta por escopo
05 PARALLELIZE_PERCEPTION       → leitura multi-fonte pode paralelizar
06 SERIALIZE_MUTATION           → mutação é serializada
07 UNKNOWN != PASS              → runtime não medido permanece NOT_PROVEN
08 ZERO_REGRESSION              → preservar owners, destino e estado válido
09 OBSERVABLE_OR_EXECUTED       → claim material exige observação pertinente
10 ACTION != PROOF              → executar/mergear não prova runtime nem função correta
11 WRITER != JUDGE              → quem muda não se autoaprova; REALITY julga
12 SELF_PROOF != PASS           → texto, pacote ou agente não se autopromovem
```

---

## Pombo-correio com checksum — aprendizado da rodada

```text
POMBO != CÉREBRO
POMBO != OWNER
POMBO != WRITER
POMBO != JUIZ
POMBO != AUTORIDADE

POMBO =
TRANSPORTE
+ DESTINATION_LOCK
+ ESTADO_REFERENCIADO
+ PROVENIÊNCIA
+ CHECKSUM/SHA
+ RECEIPT
+ UNKNOWN
+ NEXT_CURSOR
```

`CHECKSUM = identidade de bytes`; `CHECKSUM != prova semântica`.

A regra só conta como aprendida quando uma próxima transferência equivalente reutiliza o contrato sem o CHEFE ter de ensinar novamente a mesma mecânica. Repetição da mesma instrução depois de promovida/provada = `LEARNING_TRANSFER_FAIL`.

---

## Classificação honesta

```text
GITHUB_OPERATIONAL_SCOPE_2026_08_24 = PROVADO
POMBO_CRYSTAL_GIT_SCOPE             = PROVADO
CARD_FAMILY_PRESENT                 = PROVADO

WINDOWS_LOCAL_RUNTIME_STATE         = NOT_PROVEN
VPS_RUNTIME_CURRENT_STATE           = NOT_PROVEN
VECTOR_MEMORY_RUNTIME               = NOT_PROVEN
HERMES_LOCAL_PROFILE_SOL            = NOT_PROVEN
LOCAL_SKILLS_ABSORPTION             = NOT_PROVEN
GLOBAL_RUNTIME_100_PERCENT          = NOT_PROVEN
```

```text
IMPLEMENTED_ON_MAIN != RUNNING_NOW
FILE_EXISTS != RUNTIME_PASS
MERGED != FUNCTIONALLY_PROVEN_EVERYWHERE
HISTORY != CURRENT_STATE
UNKNOWN != PASS
```

---

## Fluxo único da Casa — rodada consolidada

```text
INTENÇÃO DO CHEFE
  → DESTINATION_LOCK
  → medir GitHub vivo
  → Trigger Fabric / OUTPUT_GUARD / Segundo Cérebro lógico único
  → writer-safe global
  → fast path causal
  → consumidores do mapa reconciliados
  → LIVE_STATE remeasured
  → POMBO: handoff verificável + continuidade
  → CARD OPERACIONAL
  → CARD MAPA TEMPO REAL
  → próxima execução reancora estado vivo
```

---

## Próximo cursor real

```text
UNKNOWN_RUNTIME
→ medir corpo local/VPS quando a missão exigir
→ inventariar/reconciliar skills locais sem cópia cega
→ localizar owner/consumer
→ ABSORB_MINIMAL_DELTA somente quando houver delta útil provado
→ teste
→ contraprova
→ receipt
```

Nada nesta rodada autoriza transformar `NOT_PROVEN` de runtime em verde por documentação.

---

## Destino travado

```text
DESTINO_TRAVADO = true
SEM_FALSO_VERDE = true
SEM_ATALHO = true
SEM_CRIAÇÃO_DESNECESSÁRIA = true
RETORNO_SÓ_COM_REALIDADE = true
```

**Card reconciliado:** 2026-08-24 · família canônica da rodada · sem V2/V3.
