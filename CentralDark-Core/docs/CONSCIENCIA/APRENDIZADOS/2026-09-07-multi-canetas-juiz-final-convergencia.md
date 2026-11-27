---
title: "Multi-canetas, passagem de Writer e Juiz final"
status: "PROVADO_NO_REPO_COM_LIMITES_RUNTIME"
date: 2026-09-07
owner: "CentralDark Trigger Fabric + Proof Ownership + continuity"
pr: 1447
---

# !CENTRALDARK — convergência de múltiplas canetas

Este registro cristaliza somente comportamento já sustentado por owners, testes, commits ou contratos executáveis existentes. Não cria novo sistema, router, judge, identidade ou versão.

## Cristal principal

```text
MANY_HANDS_ALLOWED=true
PARALLEL_READERS_ALLOWED=true
MULTIPLE_WRITERS_ACROSS_INDEPENDENT_SCOPES=true
MULTIPLE_WRITERS_ACROSS_TIME_WITH_HANDOFF=true
SAME_SCOPE_CONCURRENT_WRITERS=false
ONE_WRITER_PER_SCOPE_AT_A_TIME=true

LAST_WRITER_IS_NOT_FINAL_TRUTH=true
WRITER_CANNOT_SELF_JUDGE_FINAL=true
FINAL_CONSOLIDATION=REALITY_JUDGE
CONSOLIDATE_ONLY=SURVIVING_PROVEN_DELTA
```

Em linguagem da Casa:

```text
MUITOS BRAÇOS / MODELOS / CANETAS PODEM CONTRIBUIR
→ percepção pode correr em paralelo
→ escopos independentes podem ter Writers independentes
→ no MESMO escopo mutável só uma caneta escreve por vez
→ a caneta pode passar de mão em mão mediante handoff
→ cada passagem preserva estado, evidência, receipt e NEXT_CURSOR
→ ser o último Writer não transforma uma opinião em verdade
→ prova + contraprova + remedição chegam ao Reality Judge
→ o Judge consolida somente o delta sobrevivente
→ FIXED_POINT encerra o escopo provado, não inventa verde global
```

## Passagem de caneta

O boot canônico exige lease compartilhado para Writer e define o handoff mínimo:

```text
OLD_WRITER_RELEASE
→ HANDOFF_RECEIPT
→ NEW_WRITER_ACQUIRE
```

Logo, `ONE_WRITER_PER_SCOPE` não significa "uma pessoa/modelo escreve para sempre". Significa exclusão mútua no mesmo escopo mutável durante cada passagem.

A herança segura deve carregar, quando aplicável:

```text
INTENT
CURRENT_HEAD_OR_STATE
WRITER_SCOPE
EVIDENCE_REFS
PROOF_TARGET
RECEIPT
NEXT_CURSOR
UNRESOLVED_SET
```

## Muitos modelos, um core

`ENGINE_BINDING.yml` trata OpenAI, Claude Code, Hermes, Nous e outros motores como engines substituíveis que herdam o mesmo contrato. O router pode descobrir MCP, GitHub, API, tools, models e adapters, mas seleciona o conjunto mínimo suficiente e preserva `ONE_SYSTEM_ONLY` + `ONE_WRITER_PER_SCOPE`.

GitHub, MCP, API, connector ou adapter são caminhos de transporte/capacidade. Não são autoridade humana e não viram Judge por estarem conectados.

```text
MCP_CONNECTION != MUTATION_AUTHORITY
GITHUB_CONNECTION != MUTATION_AUTHORITY
ENGINE != OWNER
CONNECTOR != JUDGE
```

## Feito marcante já presente na linhagem

O commit histórico `667603fbe1a2577e2845fbec847ee523756dacb4` (#733) está na ancestralidade da `main` atual e registra uma convergência real com Writers diferentes em sequência e escopos declarados, incluindo `GPT-5.6-Sol`, `GPT_CODEX_CONNECTOR` e `CLAUDE_SONNET_JUDGE`, além de trabalho sobre o bridge MCP/HUB e sincronização de artefatos. Isso é proveniência de passagem multi-caneta já absorvida pela Casa; não precisa ser reexecutado apenas para provar que esse fato histórico existiu.

O que precisa ser medido de novo em cada missão é o estado temporal: Writer atual, HEAD atual, runtime disponível, adapter realmente invocado e gates do HEAD corrente.

## Micro-passos visíveis, não pensamento privado

A telemetria guiada já existente expõe a rota operacional em fases, status, falha exata e `NEXT_CURSOR`, e consegue costurar a falha anterior na próxima execução.

```text
OPERATIONAL_TRACE = VISIBLE_DEBUG_ROUTE
OPERATIONAL_TRACE != PRIVATE_CHAIN_OF_THOUGHT
NEXT_CURSOR = NEXT_OPERATIONAL_STEP
TELEMETRY != AUTHORITY
GREEN_REQUIRES_EXTERNAL_PROOF
```

Portanto, quando a Casa mostra "o que vai fazer agora", ela mostra estado, fase, gate e próximo passo observável. Não é transcrição do raciocínio privado do modelo.

## Juiz final

O contrato de Proof Ownership proíbe prova circular e PASS do próprio provador. Para claims operacionais, a cadeia termina em efeito observável, counterproof, estado vivo, Judge e fixed-point do escopo.

```text
WRITER != JUDGE
ACTION != PROOF
SELF_PROOF != PASS
HISTORICAL_PASS != CURRENT_PASS
REALITY_JUDGES_CLAIMS_NOT_PEOPLE
```

Assim, a última caneta entrega o material; não recebe coroa automática. O Judge fecha somente o claim que resistiu ao caminho verificável.

## Música, compasso, bíblico e baianês

Essas camadas servem para navegação, continuidade e memória humana. Não criam autoridade técnica.

📜 Referência de passagem: `Dt 19:15`. Sentido aplicado: uma pista isolada não basta para fechar julgamento material.

Verso baianês original da Casa nesta cristalização: "Oxe, muita mão pode carregar a obra; no mesmo risco uma caneta firma por vez, e na porta final entra só o que a prova sustentou."

A Auréola canônica já separa explicitamente rota visível de raciocínio privado e exige evidência externa para software, runtime e CI.

## Limite da prova

Este documento prova a existência e a coerência desses mecanismos no repositório e preserva a proveniência histórica já incorporada à `main`. Ele NÃO declara que todo adapter, modelo, MCP ou runtime está ativo agora. Invocação atual continua `UNKNOWN` até ser observada no alvo correto.

```text
CONFIGURED != INVOCATION_PROVEN
DOCUMENTED != EXECUTED
HISTORICAL != CURRENT
UNKNOWN != PASS
REALITY = JUDGE
```
