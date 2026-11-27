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

## Memória operacional BRAIN 07 · referências bidirecionais (2026-11-06)

O acervo existente [BRAIN 07](../../../../../docs/BRAIN/07-APRENDIZADOS-MEMORIAS/README.md) contém notas em 01-OURO, 02-SESSOES, 03-APRENDIZADOS e 04-MEMORIAS. Cada uma possui `centraldark_self_primary`, `centraldark_self_related` e `centraldark_self_skill_refs` que apontam para as skills desta matriz. Recuperação inversa: buscar por nome canônico do SELF no `obsidian-writer.cjs` (op=search); a busca devolve a nota com contexto e links, sem replicar 40 aprendizados em 40 arquivos.

**Lembrete operacional ao consumidor da skill:** intenção material → recuperar somente notas pertinentes e último receipt → reconciliar CURRENT/SHA e owner → avaliar os 40 SELF como `APPLIED` ou `NOOP_JUSTIFIED`, com razão → usar capacidade selecionada pelo Hermes autorizado → teste, contraprova e receipt no owner → NEXT_CURSOR/Kaizen. Não reparar, refatorar ou reconfigurar a Casa automaticamente apenas porque uma nota foi encontrada; ausência de prova significa candidata ou UNKNOWN. O carregador nativo da Skill Mãe está em quarentena documentada, sem bypass, e precisa ser reconciliado antes de declarar execução 40/40 automática.

A metáfora Gojo/Whis/Beerus/Goku/Vegeta/Vegetto-Gogeta remete aos papéis do manifesto [Kaizen Vivo](../../../../../docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md) e da landing existente, nunca autoriza segundo cérebro ou executor.
