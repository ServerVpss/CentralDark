---
name: centraldark-meta-rsi
description: "Orquestracao metodologica 40/40 Self com Kimetsu, META e Hermes existentes. Nao e novo executor."
owner: centraldark-operational-method
status: OPERATIONAL_CONTRACT
---

# META-RSI | Pedra Filosofal operacional

**Ciclo:** INTENT_PARENT -> CURRENT/SHA -> 40 checagens Self -> Kimetsu -> META-LUPA/META-GRILL/MULTIBUSSOLA quando material -> Hermes -> PATCH -> TESTE -> CONTRAPROVA -> RECEIPT -> NEXT_CURSOR.

**Regra 40/40:** TODAS as quarenta capacidades sao avaliadas em cada ciclo: APPLIED ou NOOP_JUSTIFIED com razao. Isso NAO sao quarenta agentes nem quarenta mutacoes.

**Runtime:** reutilizar somente worker, schedulers, memoria e codigo do Hermes existentes. Na Casa foi encontrado agent/background_review.py, revisor por turno; sua existencia nao comprova 40/40 automatico, nem operacao persistente apos fechar a sessao. Conectar ao runtime exige teste isolado do adaptador existente.

**Contrato de recibo:** CYCLE_ID, OWNER, SOURCE_SHA, BASELINE, SELF_CHECKS[40], META_USED, PATCH_SHA, TESTS, COUNTERPROOF, STATUS e NEXT_CURSOR.

**Seguranca operacional:** sem autoautorizacao, bypass de gates, alteracao de politicas, escrita simultanea ou refatoracao cega de producao. Um writer por escopo; nenhuma mudanca nos pesos do modelo e chamada de fine-tuning real.

**Catalogo:** catalog.json e ../../catalogo/META-RSI-40.md; usar ../kimetsu-brainstorm/SKILL.md, ../meta-lupa/SKILL.md e ../meta-multibussola/SKILL.md.

**Fixed point:** matriz completa e validada nao implica runtime RSI ativo. RUNTIME=UNKNOWN ate prova real.
