# CENTRALDARK — ARQUITETURA ANTI-FLASH

`OBSERVED_AT=2026-08-24T22:01:34-03:00` · `REALITY=JUDGE` · `PAPAGAIO_MODE=OFF` · `POMBO_MODE=CHECKSUM_ON`

```text
MAIN_HEAD_MEDIDO = 01135a7eca5ed6375860e35578a6db23deed34f9
PRs_ABERTOS      = 1149 · 1150 · 1151 · 1152   (+1116 draft)
CHECKS_VERDES    = 0   ← 1 runner, 79 jobs na fila
MUTAÇÃO_FEITA    = NENHUMA
```

Fusão de três fontes, medidas — não narradas:

| Fonte | O que é | Estado |
|---|---|---|
| `CENTRALDARK_ARQUITETURA_CANONICA_2026-08-24.zip` | Pacote derivado da `main@53ba5d5` | 🟡 **HISTÓRICO** (ver [04](04-RASTRO-MEDIDO.md)) |
| Infográfico "Arquitetura Anti-Flash" | Camadas visuais da casa | 🟢 mapeado 1:1 em owners existentes |
| Eye of the Storm · Eye of the Chasm | Aliases culturais | 🟢 cristalizados como **percepção**, não proteção |

---

## Documentos

| # | Documento | O que responde |
|---|---|---|
| 01 | [ARQUITETURA ANTI-FLASH](01-ARQUITETURA-ANTI-FLASH.md) | Como a casa protege o sistema, camada por camada |
| 02 | [OS DOIS OLHOS](02-OS-DOIS-OLHOS.md) | Onde os Olhos entram — e onde **não** entram |
| 03 | [CONTROLE DE FRONTEIRA](03-CONTROLE-DE-FRONTEIRA.md) | O que bloqueia, o que quarentena, o que marca como derivado |
| 04 | [RASTRO MEDIDO](04-RASTRO-MEDIDO.md) | Delta real, SHAs, PRs, o que quebrou |
| 05 | [PLANO DE LANÇAMENTO](05-PLANO-DE-LANCAMENTO-PR.md) | Amarrar os PRs e jogar pra main — sem squash |

---

## Regra-mãe (herdada, não reinventada)

```text
CHEFE_INTENT → DESTINATION_LOCK → LIVE_STATE → DISCOVER/RENDEZVOUS
→ META_LUPA → OWNER_EXISTENTE → ONE_WRITER_PER_SCOPE → EXECUTE
→ OUTPUT_GUARD → REALITY_JUDGE → RECEIPT
→ MATERIAL_INGEST/KNOWLEDGE_COMPILER → CRYSTAL/FLASH
→ POMBO_CHECKSUM → NEXT_CURSOR → NEXT_BOOT
```

## Correções do CHEFE aplicadas nesta rodada

| # | Correção | Onde foi aplicada |
|---|---|---|
| 1 | *"a regra da CentralDark não impede squash"* | [04 §5](04-RASTRO-MEDIDO.md) · [05 §4](05-PLANO-DE-LANCAMENTO-PR.md) |

```text
SQUASH_PROIBIDO_POR_INVARIANTE = FALSE
MÉTODO_DE_MERGE = ESCOLHA_DO_CHEFE, sem padrão presumido
```

## Invariante que governa este pacote

```text
NO_NEW_ENGINE_FROM_METAPHOR = true
```

Nada aqui cria motor novo. Toda caixa do infográfico e todo Olho aterrissa
num **owner que já existe** na `main`. Se não aterrissa, fica `UNKNOWN` — não fica verde.

## Limite honesto

```text
CONTRACT_IN_GIT       != UNIVERSAL_RUNTIME_PROOF
IMPLEMENTED_ON_MAIN   != RUNNING_NOW
DOCUMENTO_BONITO      != SISTEMA_PROTEGIDO
```

Este conjunto é **derivado**. Os owners do repo `ServerVpss/CentralDark` continuam a fonte canônica.
