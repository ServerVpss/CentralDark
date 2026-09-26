# Protocol Integration Rule (SINCRONIZAR_CASA_COM_MAIN example)

**Data:** 2026-08-26

**Lições da sessão:**

- Novo protocolo operacional (SINCRONIZAR_CASA_COM_MAIN) foi solicitado.
- Instrução explícita do CHEFE: "NÃO criar outro sistema. Antes de criar arquivo novo → procure owner canônico existente → se houver owner adequado, integre nele."
- O protocolo foi integrado como seção `protocols.SINCRONIZAR_CASA_COM_MAIN` dentro do arquivo já canônico `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`.
- Reutilizou todos os gatilhos existentes do ciclo mestre (#ACORDAR → !CALIBRAR → !MULTIBÚSSOLA_META → ... → !BOOT).
- Invariantes reforçados: NO_BLIND_COPY, NO_DUPLICATION, ONE_SYSTEM_ONLY, REUSE_BEFORE_CREATE, REALITY_IS_JUDGE.

**Regra resultante para o método:**

1. Qualquer novo protocolo, fluxo ou regra operacional deve ser avaliado contra os contratos/owners existentes primeiro.
2. O owner preferencial para reconciliação e sincronização de estados (CASA ↔ main) é o CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json.
3. Só criar novo arquivo se houver lacuna material comprovada (gap real + prova de que o owner existente não serve).
4. Ao integrar, declarar claramente que reutiliza os gatilhos do ciclo mestre e os invariantes da Casa.

**Exemplo de integração correta (patch aplicado):**

Adição de bloco `protocols.SINCRONIZAR_CASA_COM_MAIN` com:
- flow completo
- classification (CASA_ONLY, MAIN_ONLY, CONFLICTING, UNIQUE_USEFUL)
- direction rules
- invariants
- enforcement via single_global_owner

**Consequência:**
O protocolo agora é descoberto automaticamente em qualquer boot que carregue o contrato de reconciliação, sem necessidade de "lembrar" de arquivo separado.

**Pitfall a evitar:**
Criar `SINCRONIZAR_CASA_COM_MAIN.md` ou skill dedicada nova só porque "é um protocolo novo". Isso viola ONE_SYSTEM_ONLY e REUSE_BEFORE_CREATE.

**Referência cruzada:**
- CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json (seção protocols)
- Ciclo mestre no MASTER-CYCLE / TRIGGERS
- Regra "NÃO criar outro sistema" repetida pelo CHEFE nesta sessão.