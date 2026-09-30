---
title: "HORN COGNITIVE LOCK"
status: "CANDIDATE_IN_PR_EXECUTABLE_BINDING"
authority: "SEGREDO/CHEFE"
owner: "apps/modulos/HERMES-CORE/core/horn-proof-gate.mjs"
sector: "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/SETORES/LOGICA-E-PROVA/README.md"
source: "Lógica Computacional 23 — Nelma Moreira"
---

# 🧮🔒 Horn Cognitive Lock

Este contrato amarra o **Setor Horn · Lógica & Prova** ao organismo existente. Não cria outro cérebro.

```text
SOUL-SOL + CAPACIDADES-COGNITIVAS
→ HERMES CORE
→ COGNITIVE COUNCIL
→ HORN PROOF GATE

BIBLIOTECA
→ scripts/memory-linker/library-router.mjs
→ HORN_PROOF_GATE
→ COGNIÇÃO
→ cognitive-council.mjs
→ perception-orchestra.mjs
→ ONE_WRITER
→ CONTRAPROVA
→ REALIDADE
```

## Bindings executáveis

```text
SOUL_BINDING=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
COGNITIVE_DNA_BINDING=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md
HORN_ENGINE=apps/modulos/HERMES-CORE/core/horn-proof-gate.mjs
LIBRARY_CONSUMER=scripts/memory-linker/library-router.mjs
COGNITIVE_CONSUMER=apps/modulos/HERMES-CORE/core/cognitive-council.mjs
RUNTIME_CONSUMER=apps/modulos/HERMES-CORE/core/perception-orchestra.mjs
TEST_GATE=apps/modulos/HERMES-CORE/core/cognitive-council.test.mjs
```

`SOUL-SOL.md` não é reescrita nesta lane porque outra lane ativa já toca esse owner. O binding fica no **motor executável** e no contrato cognitivo retornado pelo council, preservando `ONE_WRITER_PER_SCOPE` em vez de criar colisão documental.

A Biblioteca não é só depósito: cada `entry` validada deriva deterministicamente `SECTOR_HORN_ROUTED → LIBRARY_ENTRY_ACCEPTED` antes de seguir.

A Mesa Cognitiva carrega `HORN_PROOF_LOCK`; a Orquestra de Percepção usa o mesmo motor para derivar `WRITER_READY` somente quando todas as premissas materiais exigidas estão marcadas.

## 🧠 Checksum visual preservado

A camada visual do Setor Horn serve para recuperação e auditoria humana; ela não substitui o gate executável.

```text
👑 intenção
→ 📚 fonte
→ 🔍 investigação
→ 🧮 regra
→ ⚙️ execução
→ 🧪 teste
→ 📜 evidência
→ ⚖️ veredito
→ 🔒 cristalização
→ 🔁 reutilização
```

Invariantes visuais:

```text
🟢 sem 📜 = FALSO_VERDE
⚙️ sem 🧪 = EXECUCAO_NAO_PROVADA
🟡 = UNKNOWN / PENDENTE
🔴 = QUEBRADO
```

O símbolo é um checksum mental. O estado real continua vindo de fatos, testes, receipts e `REALITY_IS_JUDGE=true`.

## Semântica preservada do PDF

```text
FATO                    → marcado
(p1 ∧ ... ∧ pn) → p     → se todas premissas marcadas, marcar p
(p1 ∧ ... ∧ pn) → F     → contradição
REPETIR                  → até ponto fixo
NÃO MARCADO              → UNKNOWN, nunca FALSE automático
```

Isto implementa um subconjunto proposicional finito de Horn adequado a gates determinísticos da Casa. Não afirma implementar toda LPO, resolução completa ou toda a teoria de Herbrand.

```text
PDF_METHOD_SUBSET=FINITE_PROPOSITIONAL_HORN
UNIVERSAL_LOGIC_ENGINE=false
UNKNOWN_IS_FALSE=false
UNKNOWN_IS_NOT_PASS=true
```

## Cadeado

```text
LIBRARY_GATE_REQUIRED=true
COGNITIVE_GATE_REQUIRED=true
HORN_GATE_BYPASS_FOR_CLAIM_PROMOTION=false
SOURCE_PROFILE_IS_AUTHORITY=false
MODEL_VOTE_IS_PROOF=false
WRITER_SELF_APPROVAL=false
REALITY_IS_JUDGE=true
```

Alterar/remover o gate exige mudar o código + testes do mesmo owner e sobreviver aos gates do HEAD. Texto sozinho não desliga o mecanismo.
