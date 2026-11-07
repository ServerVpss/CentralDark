---
title: "Código autoauditável e porta de entrada, aprendizado de 2026-10-27"
date: 2026-10-27
centraldark_note_schema: "brain07.v1"
centraldark_category: "03-APRENDIZADOS"
centraldark_kind: "APRENDIZADO_OPERACIONAL"
centraldark_context_owner: "SEGREDO/CHEFE"
centraldark_intent_anchor: "Preservar documentação e prova junto ao código sem novo sistema"
centraldark_agent_recall: "Recuperar causa, contraprova e owner antes de repetir auditoria ou implantação."
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
centraldark_kaizen_skill: ".agents/skills/kaizen-sistema-um/SKILL.md"
centraldark_kaizen_trigger: "MATERIAL_DELTA_WHEN_CONSUMED"
centraldark_kaizen_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
centraldark_metabolic_roles: ["gojo-seis-olhos","whis-orientacao","vegeta-resiliencia","beerus-autolimpeza","kaizen-continuo"]
centraldark_metabolic_source: "apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx"
centraldark_previous_path: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/README.md#aprendizado-recuperado"
centraldark_previous_blob_sha: "7300f94f55a8b2d420bef631239150034084281e"
centraldark_self_catalog: ".agents/skills/centraldark-operational-method/catalogo/META-RSI-40.md"
centraldark_self_primary: "Self-Improvement"
centraldark_self_related: ["Self-Auditing","Self-Documentation"]
centraldark_self_skill_refs: [".agents/skills/centraldark-operational-method/Skills/self-improvement/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-auditing/SKILL.md",".agents/skills/centraldark-operational-method/Skills/self-documentation/SKILL.md"]
centraldark_self_review: "APPLIED_OR_NOOP_JUSTIFIED_WHEN_RUNTIME_CONSUMES"
centraldark_self_activation: "RECALL_AND_REVIEW_ONLY_NOT_AUTOPATCH"
centraldark_self_runtime: "UNKNOWN_UNTIL_CONSUMER_READBACK"
---

# 📜 Aprendizado histórico do índice BRAIN 07

Esta seção foi retirada do README para manter a raiz como índice. Conteúdo de aprendizado preservado; referências Markdown relativas foram ajustadas à nova subpasta. A versão original continua no Git.

## 🪬 Aprendizado recuperado — Código autoauditável e porta de entrada (2026-10-27)

> **Registro no owner existente da biblioteca Obsidian/BRAIN**, sem segundo sistema de documentação.
> **@owner:** `docs/BRAIN/07-APRENDIZADOS-MEMORIAS/README.md`
> **@last_updated:** `2026-10-27T11:50:42.264Z`
> **@truth_scope:** `RECONCILIACAO_DE_REGRA_E_MEDICAO_PARCIAL`
> **@estado:** `REGRA_CANONICA_EXISTE; GATE_TESTADO_LOCALMENTE; ADERENCIA_UNIVERSAL_NAO_PROVADA`

### Produto e intenção preservada

A CentralDark deve ser **um produto com core compartilhado** e edições Desktop/Electron, OS bootável sobre Linux/openKylin e pesquisa de kernel nativo, mantendo cockpit, Hermes, MCP, memória, identidade e provas. A capacidade local não depende de contratar uma VPS mais potente; a infraestrutura remota é alvo/adaptador opcional, não segundo cérebro. **Kernel nativo próprio permanece trilha de pesquisa, não build/boot comprovado.**

### Lei «tocou → rastreou → documentou → testou → selou»

1. Toda modificação material de source precisa registrar **para que serve o componente**, **por que a decisão foi tomada**, **o que mudou**, **owner**, **referência documental**, **data/hora UTC ISO 8601 com milissegundos**, teste e recibo. O Git preserva a genealogia verificável: commit SHA, diff, autor efetivo e motivação do commit.
2. Em código comentável, usar `#OBSERVACOES#` e campos `@owner`, `@doc_ref`, `@last_updated`; completar `@escopo`, `@implementado`, `@pendente`, `@estado`, `@next_cursor` quando pertinente. Linguagens usam sua sintaxe válida (`//`, `#`, `/* */`, `{/* */}`). **JSON não admite comentários**: registrar no documento proprietário.
3. A nota canônica associada deve ter `@code_ref`, novo `@last_updated`, descrição concreta do efeito e contraprova **no mesmo delta Git**. Código removido requer `@removed: true` no documento. **Não simular carimbo, autoria, execução ou teste.**
4. `TODO`, `FIXME`, `NOTE`, comentários de racional/segurança, docstrings, JSDoc/TSDoc, divisão em seções e headers de licença são instrumentos úteis **quando agregam informação**; não comentar mecanicamente cada variável, não guardar código morto comentado e não afirmar que comentários são garantia de segurança. Explicar invariantes, efeitos visuais, parâmetros, interfaces e causalidade. Para arquivos `.tsx`, descrever contratos de componentes e handlers críticos sem poluir a renderização.
5. A porta de entrada deve fazer `REUSE_OWNER → DELTA_MINIMO → RASTRO_INLINE + DOC_SYNC → TESTE → CONTRAPROVA → RECEIPT → SELO`. Refatoração **string por string** significa preservar contratos e alterar incrementalmente com testes de regressão; nunca replace global cego.
6. Organização de source: owner único e diretórios por domínio/responsabilidade, documentação vizinha do código e índices navegáveis, metadados legíveis por máquina; não criar segunda biblioteca, duplicar rules ou empurrar alterações de runtime como se fossem documentais.

### Fonte canônica e auditoria realizada

- **PR de origem:** [#1836 — Governança de rastro datado](https://github.com/ServerVpss/CentralDark/pull/1836), aberto em **2026-10-16**, incorporado em **2026-10-18** (`a2984c61a1`).
- **Norma vigente:** [RULES.md](https://github.com/ServerVpss/CentralDark/blob/main/RULES.md), seção «Rastro semântico obrigatório — código e documentação juntos».
- **Fiscal reutilizado:** `scripts/lupa/diagram-route-gate.mjs#validateDiffCoverage` + `scripts/lupa/diagram-route-gate.test.mjs`, executados por `.github/workflows/porta-de-entrada.yml`.
- **Prova local nesta sessão:** `node --test scripts/lupa/diagram-route-gate.test.mjs` → **19/19 PASS** na Casa. **Não equivale a CI/deploy aprovado.**
- **Lacuna medida:** comparação `a2984c61a1..4699d474f0` levantou 1.547 caminhos com extensões de código entre mudanças; 242 no filtro atual do fiscal e 1.305 fora dele (**inclui arquivos legados/arquivados e outros formatos; números de triagem, não veredito universal**). Entre os arquivos verificáveis amostrados dentro do filtro, 209 não exibiam `#OBSERVACOES#` no início. Analisar por commit/owner antes de declarar infração.
- **Limites:** o fiscal não cobre, por exemplo, `.ps1`, `.bat`, `.cmd`, `.cs`, `.vue` e parte de diretórios de origem; verifica formato e mudança documental, **não a veracidade dos comentários**. A API de proteção da branch `main` retornou HTTP 403; portanto bloqueio universal por branch protection **não comprovado**. A execução CI consultada para `4699d474f0` estava pendente/enfileirada no momento da leitura.

### Próximo cursor

**Não criar gate paralelo.** Auditar commits específicos após #1836, classificar artefatos de origem versus arquivos gerados/arquivo morto, ampliar o escopo do fiscal existente às linguagens relevantes (PowerShell/Windows/React), com testes negativos por linguagem, e provar a obrigatoriedade efetiva do workflow antes de declarar conformidade.

**Biblioteca Obsidian/BRAIN = referência canônica do acervo documental; Git/GitHub = versionamento, preservação e fonte canônica do código executável.** O PDF de referência sobre organização foi preservado no [owner existente da Biblioteca](../../03-DOCUMENTACAO/02-BIBLIOTECA/README.md), com bytes originais e SHA-256, sem criar outro vault.

### 🪬 Continuidade CentralDark-OS local-first — aprendizado ligado ao owner (2026-10-27)

<!-- #OBSERVACOES#
@owner: docs/BRAIN/07-APRENDIZADOS-MEMORIAS/README.md
@doc_ref: docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md; docs/ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/INVENTARIO-KERNEL-PROPRIO.md
@last_updated: 2026-10-27T12:16:16.618Z
@estado: CONTRATO_DOCUMENTADO; FAILOVER_E2E_DESCONHECIDO; REPLAY_VPS_PENDENTE
@next_cursor: testar VPS off / Casa online, reconectar e comparar SHA + receipt sem repetir trabalho verde
-->

**Intenção:** parar de apresentar VPS como condição de funcionamento da CentralDark. O produto é **CentralDark-OS**, cujo core pode rodar na **Casa/Forja local** e em cápsulas remotas como a VPS quando existirem. Desligamento da VPS não cancela a missão local, não apaga memória, não autoriza novo cérebro nem exige rede para registrar novos deltas locais. Ao retornar a conectividade, reconciliar estados/SHAs/owners, aplicar somente alterações aprovadas e fazer contraprova no destino.

**Loop original e janela móvel:** CHEFE_INTENT → CONTEXT → META-GRILL → CURRENT/GREEN_STATE → GOAL → OWNER → MENOR_DELTA → HERMES/EXECUTE → OBSERVE → TEST → COUNTERPROOF → REALITY_JUDGE → RECEIPT → FIXED_POINT/NEXT_CURSOR → KAIZEN → CONTINUAR. BACKCHECK: editar → avançar → voltar algumas casas → conferir → corrigir menor causa → retestar cone afetado → continuar no mesmo trilho.

**Nomes:** interfaces/prompts de identidade devem dizer `CentralDark-OS`; referências técnicas reais de `VPS` (SSH, PID, host, `scripts/vps/`, deploy) permanecem `VPS`. `VPS_OFFLINE != CENTRALDARK_OS_OFFLINE`; porém `OFFLINE_LOCAL_CONTINUITY`, `QUEUE_AND_REPLAY` e `24_7_UPTIME` exigem prova de serviço, persistência, fila e sincronização. Local-first é contrato novo, não prova de automação já concluída.

**Links bidirecionais:** [JARVIS §6.0.A](../../../ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md) · [CentralDark-OS e kernel](../../../ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/INVENTARIO-KERNEL-PROPRIO.md) · [Loop Mestre](../../../CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md) · [Biblioteca de PDFs](../../03-DOCUMENTACAO/02-BIBLIOTECA/README.md).

**Nenhum novo vault, kernel, serviço, executor ou sincronizador foi criado por este aprendizado.**
