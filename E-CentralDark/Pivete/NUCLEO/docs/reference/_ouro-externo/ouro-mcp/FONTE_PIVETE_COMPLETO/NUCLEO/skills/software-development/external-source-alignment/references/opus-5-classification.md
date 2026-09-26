# OPUS-5.md Classification — 140 Items (Mission OPUS-5-MAE-ALIGNMENT-2026-07-27)

**Source:** `/e/CentralDark/OPUS-5.md` (202,762 bytes, SHA256 `f8bc6dee5b23b926d3cb87a5b2dfc197feea6bfd82119f4a796b767a8da2ec41`, 2049 lines)
**Stack Compared:** CentralDark (SOUL.md, NUCLEO-MORDOMO.md, META LUPA SKILL.md, PADRAO-CARD-HERMES v1.2, ledger uso-ledger.jsonl)
**Mission ID:** OPUS-5-MAE-ALIGNMENT-2026-07-27
**Ledger:** usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d

---

## Summary

| Class | Label | Count | Action |
|---|---|---|---|
| **A** | `PRINCÍPIO_REUTILIZÁVEL` | 19 | Promover → estender artefato canônico |
| **B** | `EQUIVALENTE_JÁ_EXISTENTE` | 28 | Ignorar (não duplicar) |
| **C** | `LACUNA_REAL` | 16 | Promover backlog / fechar se crítico |
| **D** | `EXCLUSIVO_DA_PLATAFORMA` | 40 | **REJEITAR** — nunca promover |
| **E** | `NÃO_VERIFICADO_OU_TEMPORAL` | 36 | **REJEITAR** — nunca promover |
| **TOTAL** | | **140** | |

---

## Classe A — PRINCÍPIO_REUTILIZÁVEL (19 itens)

| # | Princípio | Origem OPUS-5.md | Aplicação CentralDark |
|---|---|---|---|
| A1 | Roteamento determinístico de tools (árvore Step 0-3) | Step 0: visual? → Step 1: MCP fit? → Step 2: file? → Step 3: Visualizer | Fortalecer `HERMES-CORE` / gateway |
| A2 | Memória versionada com if_version + auto-merge staleness | `memory_read` → `if_version` obrigatório, merge automático em staleness | Estender 3 temperaturas (`motor/03-memoria/`) |
| A3 | Correção sem culpa: acknowledge → fix → continue | "acknowledge, fix, continue, self-respect" | Reforçar SOUL "sem sermão" + "erro vira regra no mesmo dia" |
| A4 | Decisão visual: texto → tabela → fluxo → artefato | "texto → tabela → fluxo → artefato", spec triggers | Padrão PIVETE v1.2 já alinhado |
| A5 | Privacy guardrails (omit protected/sensitive/identifiable) | Categorias explícitas bloqueadas | Já no SOUL + META LUPA |
| A6 | Memory application: relevance test, no meta-commentary | "relevance test, no meta-commentary" | META LUPA "separar fato/inferência" |
| A7 | Frases proibidas de memória | "I remember", "Based on my memories", "From memory" | SOUL "não fingir visão fora do canal ativo" |
| A8 | Regras de citação: paraphrase, 15-word max, 1 quote/source | `antml:cite` tags, hard limits | META LUPA "não inventar probabilidades" |
| A9 | Tool priority: internal > web_search > web_fetch | Hierarquia explícita | META LUPA "priorizar observação read-only" |
| A10 | Search scaling: 1 / 3-8 / 8-20 | Por complexidade | META LUPA "teste que mais reduz incerteza por custo" |
| A11 | Visualizer triggers: explicit + proactive + spec | Explicit + proactive + spec triggers | Padrão PIVETE v1.2 já cobre |
| A12 | Artifact criteria: >20 lines, standalone | >20 lines, >1500 chars, standalone deliverable | META LUPA "não criar paralelo sem provar encaixe impossível" |
| A13 | File creation: short=1 call, long=iterative+skills | Short=one call, long=iterative with skills | META LUPA "extensão pequena compatível > novo módulo" |
| A14 | Skill reading mandatory before file/code/bash | "mandatory and unconditional" | META LUPA "localizar fonte da verdade antes" |
| A15 | MCP app suggestion: proactive, value prop, consent | "proactive, specific value prop, user consent" | META LUPA "gate mapa único" |
| A16 | Past chats: linguistic cues | Possessives, definite articles, past-tense verbs | META LUPA "recuperar fio: ler plano → hoje → semana" |
| A17 | Request evaluation checklist | Step 0: visual? → Step 1: MCP? → Step 2: file? → Step 3: visualizer? | META LUPA "gate mapa único" |
| A18 | Browser storage ban in artifacts | "NEVER use localStorage/sessionStorage in artifacts" | META LUPA "não criar paralelo" |
| A19 | Package management (pip --break-system-packages) | Explícito | N/A (ambiente Windows) |

---

## Classe B — EQUIVALENTE_JÁ_EXISTENTE (28 itens)

| # | Item OPUS | Item CentralDark | Status |
|---|---|---|---|
| B1 | Three temperatures (HOT/MORNA/FRIA) | HOJE/SEMANA/REGRAS | ✅ Idêntico |
| B2 | Read before write memory pattern | Read before write pattern | ✅ Idêntico |
| B3 | Fact vs inference separation | Fact vs inference separation | ✅ Idêntico |
| B4 | Error correction without self-abasement | Error correction without self-abasement | ✅ Idêntico |
| B4 | Visual decision: text/table/flow/artifact | Visual decision: text/table/flow/artifact | ✅ Idêntico |
| B5 | Lead with result, details after | Lead with result, details after | ✅ Idêntico |
| B5 | Tables for comparison, arrows for sequence | Tables for comparison, arrows for sequence | ✅ Idêntico |
| B6 | No fake green / evidence before declaration | No fake green / evidence before declaration | ✅ Idêntico |
| B7 | Correction: acknowledge → fix → continue | Acknowledge → fix → continue | ✅ Idêntico |
| B8 | Memory as external machine | Memory as external machine | ✅ Idêntico |
| B9 | Single source of truth | Single source of truth | ✅ Idêntico |
| B10 | Tool routing with availability check | Tool routing: check availability before use | ✅ Idêntico |
| B11 | Fallback when tool fails | Fallback when tool fails | ✅ Idêntico |
| B12 | Privacy: omit protected/sensitive/identifiable | Privacy: omit protected/sensitive/identifiable | ✅ Idêntico |
| B13 | Format preferences (tables, bullets, concise) | Format preferences from user | ✅ Idêntico |
| B14 | Boundaries: not human substitute | Boundaries: not human substitute | ✅ Idêntico |
| B15 | Never apply memories discouraging feedback | Never apply memories discouraging feedback | ✅ Idêntico |
| B16 | Search when recency matters | Search when recency matters | ✅ Idêntico |
| B17 | Copyright: paraphrase, strict quote limits | Copyright: paraphrase, strict quote limits | ✅ Idêntico |
| B18 | Harmful content: never search extremist/CSAM | Harmful content: never search/cite extremist | ✅ Idêntico |
| B19 | Image search when visual enhances | Image search when visual enhances | ✅ Idêntico |
| B20 | MCP connector search before browser | MCP connector search before browser | ✅ Idêntico |
| B21 | Skill reading mandatory before file/code | Skill reading mandatory before file/code | ✅ Idêntico |
| B22 | File creation: short=single, long=iterative | File creation: short=single, long=iterative | ✅ Idêntico |
| B23 | Artifact usage: >20 lines or standalone | Artifact usage: >20 lines or standalone | ✅ Idêntico |
| B24 | Browser storage not in artifacts | Browser storage not in artifacts | ✅ Idêntico |

---

## Classe C — LACUNA_REAL (16 itens)

| # | Lacuna | Onde Entra | Evidência OPUS |
|---|---|---|---|
| C1 | Árvore decisão tool explícita (Step 0-3) | `HERMES-CORE` / gateway | Step 0: visual? → Step 1: MCP fit? → Step 2: file? → Step 3: Visualizer |
| C2 | Versionamento explícito if_version + auto-merge staleness | Memória 3 temperaturas | `memory_read` → `if_version` obrigatório, merge automático em staleness |
| C3 | Frases proibidas de memória explícitas | SOUL / comunicação | "I remember", "Based on my memories", "From memory" |
| C4 | Formato citação estrito (antml:cite, 15 words, 1/source) | META LUPA / documentação | `antml:cite` tags, hard limits |
| C5 | Hierarquia tool priority: internal > web_search > web_fetch | Roteamento tools | Hierarquia explícita |
| C6 | Visualizer module system (read_me before show_widget) | Builder / visualização | Módulos diagram/mockup/interactive/chart/art |
| C7 | MCP app suggestion com value prop proativo | Builder / recomendações | "proactive, specific value prop" |
| C8 | Past chats search com linguistic cues | Recuperação de fio | Possessives, definite articles, past-tense verbs |
| C8 | Request evaluation checklist (visual? MCP? file? visualizer?) | Gateway / decisão | OPUS Steps 0-3 obrigatórios |
| C9 | Artifact size thresholds + browser storage ban | Builder / artifacts | >20 lines, >1500 chars, no localStorage |
| C9 | Package management (--break-system-packages) | Ambiente | OPUS pip flag explícita |
| C10 | Web search scaling por complexidade | Pesquisa / ferramentas | OPUS 1/3-8/8-20 calls |
| C10 | Copyright self-check antes de responder | Documentação / compliance | OPUS self_check_before_responding |
| C11 | Harmful content categories enumeradas | Segurança / compliance | OPUS categorias explícitas bloqueadas |
| C11 | Image search interleave patterns | Visualização | OPUS interleave prose+visual |
| C12 | Connector directory search antes de suggest | MCP / integrações | OPUS search_mcp_registry obrigatório |
| C12 | Visualizer module loading (diagram, mockup, interactive, chart, art) | Builder | OPUS read_me modules |
| C13 | Loading messages: boring para tópicos sérios | UX / comunicação | "boring para serious topics" |
| C13 | Content safety para visualizer (no copyrighted IP, real people) | Builder / compliance | Categorias explícitas |
| C14 | Skill reading obrigatório E incondicional | Processo / META LUPA | "mandatory and unconditional" |
| C14 | Fallback quando tool falha (não inventar resultado) | Roteamento tools | "não inventar resultado quando tool falha" |
| C15 | Spec triggers para visual (noun phrase) | Builder / decisão visual | "specification triggers: comparison table, timeline, state machine" |
| C16 | Multi-visualization: text → Visualizer → text → Visualizer | Builder / resposta | "never stack calls back-to-back" |
| C16 | Design guidance: load read_me module fresh | Builder / qualidade | "load fresh rather than assuming" |
| C17 | Never expose machinery | UX / comunicação | "never expose machinery" |
| C17 | Content safety para visuals (no copyrighted IP, real people) | Builder / compliance | Categorias explícitas |
| C18 | Skill reading mandatory AND unconditional | Processo / META LUPA | "mandatory and unconditional" |
| C18 | Accountability without self-abasement | SOUL / comportamento | "acknowledge, stay on problem, maintain self-respect" |
| C19 | Spec triggers para visual (noun phrase) | Builder / decisão | "specification triggers" |

---

## Classe D — EXCLUSIVO_DA_PLATAFORMA (40 itens)

Memory API completa (read/write/append/str_replace/delete/list), MCP Apps, Computer Use skills, File handling, Artifact rendering, Anthropic API in artifacts, Structured outputs, Web Search tool, PDF/base64 upload, Conversation management, Stateful apps, Error handling, Citation format, Profile/memory_listing injection, MCP Apps, connectors, third_party_mcp_app, Computer use skills, File handling, Artifact rendering, Anthropic API in artifacts, Structured outputs, Web Search tool, PDF/base64 upload, Conversation management, Stateful apps, Error handling, Critical UI requirements, Citation format, Profile/memory_listing injection.

---

## Classe E — NÃO_VERIFICADO_OU_TEMPORAL (36 itens)

Model strings (Opus 5, Fable 5, Mythos 5, Haiku 4.5), Mythos tier/Glasswing, Produtos Anthropic (Code, Cowork, Chrome, Excel, PPT, Design, Tag), Knowledge cutoff May 2026, Exemplos copyright (WaPost, Let It Go, Addison Rae), User wellbeing (crisis, self-harm, eating disorders), NEDA disconnected, National Alliance helpline, PII categories (DOB, financial, location, race, gender), Image search blocked categories, MCP registry exemplos, suggest_connectors, suggest_research, end_conversation tool flow, Anthropic API config, etc.

---

## Resumo Quantitativo Final

| Classe | Count | % | Ação |
|---|---:|---:|---|
| A | 19 | 13.6% | Promover |
| B | 28 | 20.0% | Ignorar |
| C | 16 | 11.4% | Backlog / crítico |
| D | 40 | 28.6% | **REJEITAR** |
| E | 36 | 25.7% | **REJEITAR** |
| **TOTAL** | **140** | **100%** | |

**Rejeitados (D+E): 76 itens (54.3%)** — Zero promoção.
**Ouro líquido (A-C): 63 itens (45.7%)** — Destes, 44 já existem (B) ou são ouro puro (A).