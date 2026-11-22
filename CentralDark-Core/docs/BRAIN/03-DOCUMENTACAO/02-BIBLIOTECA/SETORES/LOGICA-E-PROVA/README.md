---
title: "Setor Horn — Lógica & Prova"
status: "CANDIDATE_IN_PR_EXECUTABLE_BINDING"
owner: "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/README.md"
writer: "SOL"
writer_scope: "BRAIN_LIBRARY_LOGIC_PROOF"
tags: ["brain", "biblioteca", "logica", "prova", "horn", "herbrand", "contraprova"]
---

# 🧮 SETOR HORN · LÓGICA & PROVA

Este setor é uma gaveta semântica da **Biblioteca Cognitiva existente** e agora também uma fronteira determinística consumida pelo motor cognitivo. Não cria novo cérebro, novo owner ou nova autoridade.

```text
REUSE_BEFORE_CREATE=true
NEW_SECTOR != NEW_SYSTEM
SOURCE != AUTHORITY
REALITY=JUDGE
UNKNOWN != PASS
```

## Missão

Transformar fontes de lógica formal, verificação e prova em material reutilizável para:

- separar fato medido de opinião;
- representar regras e dependências;
- propagar somente consequências forçadas;
- chegar a ponto fixo sem converter UNKNOWN em falso;
- construir testes discriminantes e contraprovas;
- alimentar skills e contratos somente quando houver evidência.

## 🧠 Memória visual · checksum semântico

Os símbolos abaixo são âncoras estáveis de leitura e recuperação, não decoração. Eles tornam saltos de raciocínio e falso-verde visualmente detectáveis sem substituir a prova técnica.

```text
👑 = intenção / CHEFE
🧠 = conhecimento / cognição
📚 = biblioteca / fonte
🔍 = investigação
🧮 = lógica / cálculo
🛡️ = guardrail / limite
🔁 = loop / repetição
⚙️ = execução
🧪 = teste
📜 = evidência / receipt
⚖️ = realidade / julgamento
🔒 = regra cristalizada
🟢 = provado
🟡 = UNKNOWN / pendente
🔴 = quebrado
```

Mapa mental preferencial:

```text
👑 INTENÇÃO
→ 📚 FONTE
→ 🔍 INVESTIGAÇÃO
→ 🧮 REGRA
→ ⚙️ EXECUÇÃO
→ 🧪 TESTE
→ 📜 EVIDÊNCIA
→ ⚖️ VEREDITO
→ 🔒 CRISTALIZAÇÃO
→ 🔁 REUTILIZAÇÃO
```

Checks visuais:

```text
🟢 sem 📜 = FALSO_VERDE
⚙️ sem 🧪 = EXECUCAO_NAO_PROVADA
📚 sem 🔍 = FONTE_NAO_ANALISADA
🧮 sem fato = LOGICA_SOLTA
⚖️ sem rastro = JULGAMENTO_INVALIDO
🔁 sem ganho = REPETICAO_INUTIL
```

Regra de memória:

```text
VER → ASSOCIAR → RECUPERAR_SEM_OLHAR → USAR → REVISITAR
```

Não repetir paredes de texto. Repetir a estrutura. O emoji facilita recuperação e auditoria humana; o estado técnico continua sendo decidido por fatos, testes, receipts e `REALITY=JUDGE`.

## 🔒 Amarração executável

```text
BIBLIOTECA
→ scripts/memory-linker/library-router.mjs
→ apps/modulos/HERMES-CORE/core/horn-proof-gate.mjs
→ SECTOR_HORN_ROUTED
→ LIBRARY_ENTRY_ACCEPTED
→ COGNITIVE_COUNCIL
→ PERCEPTION_ORCHESTRA
→ HORN_WRITER_GATE
→ ONE_WRITER
→ REALIDADE
```

Bindings:

```text
HORN_ENGINE=apps/modulos/HERMES-CORE/core/horn-proof-gate.mjs
LIBRARY_OWNER=scripts/memory-linker/library-router.mjs
COGNITIVE_OWNER=apps/modulos/HERMES-CORE/core/cognitive-council.mjs
RUNTIME_CONSUMER=apps/modulos/HERMES-CORE/core/perception-orchestra.mjs
MENTAL_LOCK=docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/HORN-COGNITIVE-LOCK.md
PDF_CONFORMANCE=SETORES/LOGICA-E-PROVA/PDF-CONFORMANCE-CC2003.md
```

Toda `entry` aceita pelo catálogo passa pelo gate Horn. O motor cognitivo carrega o mesmo lock e a prontidão do Writer é derivada por cláusula Horn; se as premissas não forem marcadas, o resultado fica `UNKNOWN`, nunca falso verde.

```text
LIBRARY_GATE_REQUIRED=true
COGNITIVE_GATE_REQUIRED=true
HORN_GATE_BYPASS_FOR_CLAIM_PROMOTION=false
```

## Lentes da equipe

A Mesa de Convergência já mapeia quatro participantes do núcleo do debate para lentes funcionais existentes:

```text
Geoff Huntley   → AUTOMATION_FACTORY
Ian Livingstone → STRUCTURAL_SKEPTIC
Dex Horthy      → HUMAN_AGENT_COORDINATION
Greg Pstrucha   → OBSERVABILITY_PROOF
```

Neste setor:

```text
PRIMARY_LENS=STRUCTURAL_SKEPTIC
PRIMARY_SOURCE_PROFILE=IAN_LIVINGSTONE
CROSSCHECK_LENS=OBSERVABILITY_PROOF
CROSSCHECK_SOURCE_PROFILE=GREG_PSTRUCHA
LOOP_SUPPORT=AUTOMATION_FACTORY
COORDINATION_SUPPORT=HUMAN_AGENT_COORDINATION
```

Os nomes são perfis de fonte/lentes funcionais. Não são clones de personalidade, autoridade, Writer ou voto.

## Cobertura matemática da equipe

Ataques existentes da CentralDark:

```text
A_LOGIC
B_IMPLEMENTATION
C_REGRESSION_FALSE_GREEN
D_SIMPLIFICATION
```

Mapeamento já consolidado:

```text
HUNTLEY     = {B_IMPLEMENTATION, D_SIMPLIFICATION}
LIVINGSTONE = {A_LOGIC, C_REGRESSION_FALSE_GREEN}
HORTHY      = {B_IMPLEMENTATION}
PSTRUCHA    = {C_REGRESSION_FALSE_GREEN}
```

Logo:

```text
UNIAO_EQUIPE = {A, B, C, D}
COBERTURA_ESTRUTURAL = |UNIAO_EQUIPE| / 4 = 4 / 4 = 1 = 100%
```

**100% significa somente cobertura das quatro dimensões definidas.** Não significa 100% de correção, segurança, sucesso ou equivalência humana.

```text
STRUCTURAL_COVERAGE_4_OF_4=100%
CORRECTNESS_100=false
SAFETY_100=false
PROOF_REQUIRES_CLOSED_DENOMINATOR=true
```

Redundância atual:

```text
A_LOGIC=1 lente principal
B_IMPLEMENTATION=2 lentes
C_REGRESSION_FALSE_GREEN=2 lentes
D_SIMPLIFICATION=1 lente principal
MEDIA_DE_COBERTURA=6 atribuicoes / 4 eixos = 1.5x
```

## Fórmula operacional do setor

```text
FATOS_MEDIDOS
+ REGRAS_EXPLICITAS
→ FECHO_LOGICO
→ TESTE_DISCRIMINANTE
→ CONTRAPROVA
→ REMEDICAO
→ PONTO_FIXO
```

Regra Horn aplicada operacionalmente:

```text
FATO = marcado
REGRA cujas premissas foram marcadas = pode marcar conclusão
REPETIR até nenhuma marca nova
NAO_MARCADO != FALSO
NAO_MARCADO != LIXO
NAO_MARCADO = NAO_PROVADO_NESTE_FECHO
```

## Conformidade com o PDF

Denominador explícito do comportamento implementado:

```text
H1 cláusula negativa força contradição
H2 regra positiva propaga conclusão
H3 não marcado permanece UNKNOWN
H4 iteração termina em fixed point

D={H1,H2,H3,H4}
```

Teste executável: `apps/modulos/HERMES-CORE/core/horn-proof-gate.test.mjs`.

```text
PDF_SUBSET_TARGET=4/4=100%
UNIVERSAL_LOGIC_COVERAGE=UNPROVEN
```

O exemplo do PDF `p ∧ ¬q ∧ (q ∨ ¬p)` vira:

```text
p
p → q
q → F

{p} → {p,q} → CONTRADIÇÃO
```

A prova same-head do PR decide se o alvo de 4/4 foi realmente atingido pela implementação atual.

## Roteamento por agente

### Ian Livingstone · STRUCTURAL_SKEPTIC

Usar para desmontar pressupostos estruturais, procurar permissões implícitas, fronteiras frágeis, regras ausentes, dependências escondidas e claims que só parecem verdade porque ninguém tentou falsificá-los.

```text
CLAIM
→ PREMISSAS
→ REGRAS
→ FRONTEIRAS
→ CONTRAEXEMPLO
→ PROVA OU UNKNOWN
```

### Greg Pstrucha · OBSERVABILITY_PROOF

Usar para transformar claim em sinal observável e teste barato, priorizando verificação determinística e evitando empilhar não-determinismo sobre não-determinismo.

### Geoff Huntley · AUTOMATION_FACTORY

Usar depois que objetivo, sinais e condição de parada estiverem definidos, automatizando o ciclo sem perder observabilidade.

### Dex Horthy · HUMAN_AGENT_COORDINATION

Usar quando a fronteira humano↔agente, handoff, escopo, intenção ou responsabilidade de decisão precisar ficar explícita.

## Condição de saída

Uma conclusão sai deste setor somente quando:

```text
CLAIM_NAMED=true
PREMISES_VISIBLE=true
EVIDENCE_OBSERVED=true
COUNTERPROOF_ATTEMPTED=true
UNKNOWN_NOT_PROMOTED=true
DENOMINATOR_DEFINED_WHEN_PERCENT_USED=true
```

Depois disso, o delta pode seguir para o owner existente, skill candidata ou cristalização. O setor não promove a si mesmo.
