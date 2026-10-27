---
title: Aprendizados & Memórias do Pivete
date: 2026-06-29
tags:
  - pessoal
  - aprendizado
  - memorias
  - lembrancas
  - aprender
  - ACORDAR
  - casa
  - bugs
  - engenharia
updated: 2026-10-27
---

# 🧠 Aprendizados & Memórias

> Coisas que você aprendeu, gostou, não quer esquecer. Momentos bons. Descobertas.

---

## Como registrar

Fale pelo Telegram de qualquer jeito:

- _"aprendi que o Obsidian Git resolve conflito com Their changes"_
- _"que coisa boa, aprendi a fazer X hoje"_
- _"nunca vou esquecer isso: o problema era Y"_
- _"gostei muito de como funcionou o agente de issues"_
- _"lembrança boa: quando o bot funcionou pela primeira vez"_

---

## Índice

```dataview
TABLE file.ctime AS "Registrado em", tags AS "Tags"
FROM "07-APRENDIZADOS-MEMORIAS"
SORT file.ctime DESC
```

---

*Atualizado automaticamente via bot @srver1bot.*

---

## Conexões Rápidas

- [[06-REUNIOES-NOTAS]] — notas que geraram esses aprendizados
- [[APRENDIZADOS]] — aprendizados técnicos (CONSCIENCIA)
- [[BRAIN]] — raiz do vault (00-MAPA-SISTEMA)

---

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

**Biblioteca Obsidian/BRAIN = referência canônica do acervo documental; Git/GitHub = versionamento, preservação e fonte canônica do código executável.** O PDF de referência sobre organização foi preservado no [owner existente da Biblioteca](../03-DOCUMENTACAO/02-BIBLIOTECA/README.md), com bytes originais e SHA-256, sem criar outro vault.
