---
title: "BRAIN 07 — Aprendizados, Memórias e Ouro"
date: 2026-06-29
updated: 2026-11-06
tags: ["brain","indice","aprendizados","memorias","ouro","kaizen","centraldark"]
category: "BRAIN07_INDEX"
status: "CANONICO_DERIVADO"
owner: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/README.md"
centraldark_note_schema: "brain07.v1"
centraldark_kaizen_policy: "docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md"
---

# 🧠 07 · Aprendizados e Memórias

**Na raiz fica somente este README.** Cada nota preserva a história do CHEFE, mas aponta para sua categoria, seu contexto e o aprendizado reutilizável sem duplicar sistemas.

## Categorias e subcategorias

| Pasta | Conteúdo | Para que o agente utiliza |
|---|---|---|
| [01-OURO](01-OURO/) | Métodos valiosos, sínteses e ouro histórico | Reaproveitar capacidade comprovada, preservando fonte e escopo |
| [02-SESSOES](02-SESSOES/) | Cristais, sessões, deltas e NEXT_CURSOR | Retomar a intenção sem recomeçar a conversa |
| [03-APRENDIZADOS](03-APRENDIZADOS/) | Correções, soluções, erros, contratos e contraprovas | Aprender a causa, aplicar menor delta e revalidar só onde necessário |
| [04-MEMORIAS](04-MEMORIAS/) | História, experiências e evolução narrada pelo CHEFE | Contextualizar com respeito, sem presumir sentimentos ou permissões |

## Propriedades herdadas pelas notas

`centraldark_note_schema` (contrato), `centraldark_category` (gaveta), `centraldark_kind` (tipo), `centraldark_context_owner` (CHEFE), `centraldark_intent_anchor` (assunto humano), `centraldark_agent_recall` (como recuperar), `centraldark_metabolic_roles` (papéis funcionais), `centraldark_kaizen_phase` ou `centraldark_kaizen_trigger` (laço de aprendizado), `centraldark_kaizen_policy` (fonte do Kaizen), `centraldark_kaizen_runtime` (limite da prova), `centraldark_previous_path` e `centraldark_previous_blob_sha` (proveniência quando aplicável).

**O código existente `apps/bot-telegram/skills/externas/obsidian-writer.cjs` insere propriedades Kaizen em novas notas criadas nas quatro gavetas.** Isso não significa captura automática de toda conversa nem propagação garantida para uma VPS desatualizada.

## Metabolismo da CentralDark: os símbolos são funções

| Referência | Função técnica expressa no mapa |
|---|---|
| 👑 CHEFE | Intenção, direção, decisão e autorização humanas |
| 🫀 Yuji | Identidade e continuidade acima do motor substituível |
| 🔥 Sukuna | Potência computacional subordinada a controle e autorização |
| 👁️ Gojo | Seis Olhos, observação, proteção, skill Oráculo e contraprova |
| 🪽 Whis | Orientação, precisão, conselho e antecipação sem escritor paralelo |
| 🐈 Beerus/Bills | Poda crítica e equilíbrio; jamais licença para destruição por metáfora |
| ♾️ Goku | Percepção/adaptação; face Instinto Superior do mesmo Hermes |
| 💜 Vegeta | Resiliência/correção; face Ego Superior do mesmo Hermes |
| 💎 Vegetto/Gogeta | Integração cognitiva e funcional num único organismo |
| 🫀 Kaizen | Vive → descobre → melhora → comprova → aprende → reutiliza → continua |

A fonte original das funções é [Intenção Viva e Kaizen Contínuo](../../CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md), projetada na [landing e no Cockpit](../../../apps/instinto-superior/src/components/central/MapaMetabolicoCristal.tsx). **Personagem e metáfora representam contratos operacionais, não agentes separados, consciência artificial comprovada ou prova de runtime.**

## Roteamento de uma fala material

INTENÇÃO DO CHEFE → CONTEXTO/PROVENIÊNCIA → CATEGORIA → OWNER EXISTENTE → NOTA/SUBCATEGORIA → MEMÓRIA/OURO + WIKILINKS → PROVA QUANDO TÉCNICA → KAIZEN → RECEIPT/NEXT_CURSOR.

Não registrar segredo no acervo cognitivo. Não copiar o histórico inteiro numa nova nota; recuperar o vínculo, guardar só o delta e preservar o original. Sem consumidor ativo, o registro é contrato/documentação, não automação comprovada.

## Consulta Obsidian

```dataview
TABLE centraldark_category AS "Gaveta", centraldark_intent_anchor AS "Intenção", centraldark_kaizen_runtime AS "Consumo"
FROM "07-APRENDIZADOS-MEMORIAS"
WHERE file.name != "README"
SORT file.mtime DESC
```

## Ligações existentes

- [[BRAIN]] e [[MAPA-OBSIDIAN-BRAIN]]: navegação semântica.
- [[BIBLIOTECA]]: fontes, estudo e proveniência, diferente de lembrança humana.
- [Lembranças](../../CONSCIENCIA/LEMBRANCAS/README.md): memória cruzada e recuperação.
- [Skill Mãe](../../../.agents/skills/centraldark-operational-method/SKILL.md): método operacional; [Kaizen Sistema Um](../../../.agents/skills/kaizen-sistema-um/SKILL.md): aprendizado e herança.
- [Cristal TOP CLEAN CEREJAS](02-SESSOES/2026-11-06-TOP-CLEAN-CEREJAS-RSI-CRISTAL-SESSAO.md) e [aprendizado anterior do índice](03-APRENDIZADOS/2026-10-27-CODIGO-AUTOAUDITAVEL-E-PORTA-DE-ENTRADA.md).

**Estado:** arquivo e grafo versionados no Git; sincronização Casa/VPS e consumo pelo Hermes dependem de leitura e teste no runtime correspondente.
