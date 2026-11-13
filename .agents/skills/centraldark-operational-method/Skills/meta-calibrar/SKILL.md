---
name: centraldark-meta-calibrar-adapter
description: "Adaptador da Skill Mae para META-CALIBRAR; preserva owner original e utiliza Hermes existente."
owner: centraldark-operational-method
canonical_source: "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml"
status: OPERATIONAL_ADAPTER
---

# META-CALIBRAR

**Finalidade:** Calibrar sem fingir PASS.

**Owner canonico:** docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml. Consultar antes de aplicar; nao copiar runtime nem criar gatilho ou executor paralelo.

**Procedimento:** INTENCAO -> CURRENT -> OWNER -> PROVA -> APLICAR METODO ORIGINAL -> CONTRAPROVA -> RECEIPT -> NEXT_CURSOR.

**Gates:** SOURCE_PRESENT, OWNER_RESOLVED, RUNTIME_OBSERVED avaliados separadamente. Metodo documentado nao prova execucao. Se nao aplicavel nesta rodada 40/40: NOOP_JUSTIFIED.

**Conexoes:** Skill Mae ../../SKILL.md; META-RSI ../meta-rsi/SKILL.md; Kimetsu ../kimetsu-brainstorm/SKILL.md.

**Compatibilidade:** preservar a fonte e os aliases em .agents/skills ate validar todos os loaders.
