---
title: "Setor Horn — Lógica & Prova"
status: "CANDIDATE_IN_PR"
owner: "docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/README.md"
writer: "SOL"
writer_scope: "BRAIN_LIBRARY_LOGIC_PROOF"
tags: ["brain", "biblioteca", "logica", "prova", "horn", "herbrand", "contraprova"]
---

# 🧮 SETOR HORN · LÓGICA & PROVA

Este setor é uma gaveta semântica da **Biblioteca Cognitiva existente**. Não cria novo cérebro, novo owner ou nova autoridade.

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

## Lentes da equipe

A Mesa de Convergência já mapeia quatro participantes do núcleo do debate para lentes funcionais existentes:

```text
Geoff Huntley  → AUTOMATION_FACTORY
Ian Livingstone → STRUCTURAL_SKEPTIC
Dex Horthy     → HUMAN_AGENT_COORDINATION
Greg Pstrucha  → OBSERVABILITY_PROOF
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