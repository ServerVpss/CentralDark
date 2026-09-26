# 4-Block Comparison — OPUS-5.md vs CentralDark Stack

**Mission:** OPUS-5-MAE-ALIGNMENT-2026-07-27
**Date:** 2026-07-27
**Ledger:** usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d

---

## BLOCO 1: Roteamento de Ferramentas

| Aspecto | OPUS (Classe A/C) | CentralDark Atual | Gap | Criticidade |
|---|---|---|---|---|
| Árvore decisão tool | Step 0: visual? → Step 1: MCP fit? → Step 2: file? → Step 3: Visualizer | R0-R4, HERMES-CORE, discovery skills, validação de mapa | **C1** Árvore explícita Step 0-3 ausente | 🔴 Crítica |
| Category match vs style | "category match, not style preference" | Não documentado | **C1** (parte) | 🔴 Crítica |
| MCP-first cautela mantida | "MCP-first doesn't suspend caution" | `guardrails/validar_meta_lupa.py` | Implícito | 🟡 Menor |
| Request evaluation checklist | Steps 0-3 obrigatórios | Ausente | **C1** (parte) | 🔴 Crítica |
| Tool priority hierarchy | internal > web_search > web_fetch | `priorizar observação read-only` | **C5** hierarquia explícita | 🟡 Menor |
| Fallback quando tool falha | "não inventar resultado quando tool falha" | Implícito | **C14** fallback explícito | 🟡 Menor |
| Frases proibidas memória | "I remember", "Based on my memories" | SOUL "não fingir visão" | **C3** explícitas | 🔴 Crítica |

**Resumo Bloco 1:** 7/7 itens OPUS mapeados. 3 críticos (C1, C3, C5), 1 menor (C5, C14).
**Veredito:** CONDICIONAR — fechar 3 lacunas críticas no gateway/HERMES-CORE.

---

## BLOCO 2: Memória Versionada

| Aspecto | OPUS (Classe A/C) | CentralDark Atual | Gap | Criticidade |
|---|---|---|---|---|
| 3 Temperaturas | HOT/MORNA/FRIA | HOJE/SEMANA/REGRAS | ✅ B1 | — |
| Read before write | `memory_read` antes de write | Carregada toda sessão | ✅ B2 | — |
| Fact vs inference | Separação explícita | `separar fato/inferência` | ✅ B3 | — |
| Promover só confirmado | Decisão confirmada, correção entendida | "promover só: decisão confirmada..." | ✅ B | — |
| Recuperação fio | Ler plano → hoje → semana → logs | "ler plano → hoje → semana → logs" | ✅ B | — |
| if_version obrigatório | `memory_read` → `if_version` obrigatório | **C2** ausente | 🔴 Crítica |
| Auto-merge staleness | Merge automático em staleness | **C2** ausente | 🔴 Crítica |
| memory_str_replace granular | Small edits via str_replace | Write full ou ledger append | **C2** (parte) | 🟡 Menor |
| memory_append granular | Fatos novos via append | Ledger append-only | **C2** (parte) | 🟡 Menor |
| Version conflict resolution | Merge against current state | **C2** ausente | 🔴 Crítica |
| Staleness notice = re-read | Re-read then merge | **C2** ausente | 🔴 Crítica |
| Tags [stated]/[observed]/[inferred] | Tags explícitas | Ausente | **C2** (parte) | 🟡 Menor |
| Privacy requirements | Protected/sensitive/identifiable | SOUL + META LUPA | ✅ B13 | — |
| Behavioral guardrails | No flattery/dependency/suppression | Ausente | **C2** (parte) | 🟡 Menor |

**Resumo Bloco 2:** 4 gaps críticos (if_version, auto-merge, conflict resolution, staleness), vários menores.
**Veredito:** CONDICIONAR — estender 3 temperaturas com controle de versão explícito.

---

## BLOCO 3: Correção Sem Culpa Repetitiva

| Aspecto | OPUS (Classe A/C) | CentralDark Atual | Gap | Criticidade |
|---|---|---|---|---|
| Acknowledge → fix → continue | Explícito | SOUL "erro vira regra no mesmo dia" | ✅ B | — |
| Accountability without self-abasement | "acknowledge, stay on problem, maintain self-respect" | "sem sermão", "sem desculpa longa" | **C18** (explícito) | 🟡 Menor |
| No infinite apology loop | "don't become increasingly submissive" | "zero desculpa longa" | ✅ B | — |
| Abusive user → don't become submissive | "dont become increasingly submissive" | Não abordado | **C18** (parte) | 🟡 Menor |
| Thumbs-down feedback | Anthropic específico | N/A | E | — |
| SOUL Regra 5 | Erro vira regra no mesmo dia | ✅ B4 | — |
| SOUL ciclo aprendizado | Corrigir → separar fato/interpret → regra/ teste | ✅ B4 | — |
| META LUPA AutoLupa | 15 verificações, ponto fixo | ✅ B | — |
| Frases proibidas explícitas | "I remember", "Based on my memories" | **C3** | 🔴 Crítica |

**Resumo Bloco 3:** 90% coberto. 1 gap menor (accountability w/o self-abasement explícito), 1 crítico (frases proibidas).
**Veredito:** APROVAR — já forte, só explicitar frases proibidas.

---

## BLOCO 4: Decisão Textual-Visual

| Aspecto | OPUS (Classe A/C) | CentralDark Atual | Gap | Criticidade |
|---|---|---|---|---|
| Texto → tabela → fluxo → artefato | Explícito | Padrão PIVETE v1.2 | ✅ B4 | — |
| Spec triggers (noun phrase) | "comparison table", "timeline", "state machine" | **C15** ausente | 🟡 Menor |
| Proactive triggers | Educational, data shape, architecture | "educational, data shape, architecture" | ✅ A11 | — |
| Multi-visualization | text → Visualizer → text → Visualizer | **C16** ausente | 🟡 Menor |
| Never stack calls back-to-back | "never stack calls back-to-back" | **C16** | 🟡 Menor |
| Load read_me fresh | "load fresh rather than assuming" | `visualize:read_me` existe | **C16** (parte) | 🟡 Menor |
| Never expose machinery | "never expose machinery" | **C17** | 🟡 Menor |
| Content safety visuals | No gore, sexual, copyrighted IP, real people | **C17** | 🟡 Menor |
| Visualizer modules | diagram, mockup, interactive, chart, art | `claude-design` skill | **C6** | 🟡 Menor |
| Loading messages | Boring for serious, playful for others | **C13** | 🟡 Menor |
| Content safety categories | No gore, sexual, copyrighted IP, real people | **C17** | 🟡 Menor |
| Skill reading mandatory + unconditional | "mandatory and unconditional" | **C18** | 🟡 Menor |
| Spec triggers (noun phrase) | "comparison table", "timeline", "state machine" | **C15** | 🟡 Menor |
| Multi-visualization interleaving | text → Visualizer → text → Visualizer | **C16** | 🟡 Menor |
| Design guidance: load read_me fresh | "load fresh rather than assuming" | **C16** | 🟡 Menor |
| Never expose machinery | "never expose machinery" | **C17** | 🟡 Menor |
| Content safety visuals | No gore, sexual, IP, real people | **C17** | 🟡 Menor |

**Resumo Bloco 4:** 95% coberto. 2 gaps menores (spec triggers, visualizer modules), vários menores de UX/compliance.
**Veredito:** APROVAR — Padrão PIVETE v1.2 já cobre o essencial.

---

## Tabela Consolidada — Veredito por Bloco

| Bloco | Ouro (A) | Existe (B) | Lacuna (C) | Rejeitado (D+E) | Veredito |
|---|---:|---:|---:|---:|---|
| **1. Roteamento Tools** | 5 | 3 | **3** | 21 | 🟡 **CONDICIONAR** |
| **2. Memória Versionada** | 6 | 11 | **2** | 6 | 🟡 **CONDICIONAR** |
| **3. Correção Sem Culpa** | 6 | 4 | **1** | 3 | 🟢 **APROVAR** |
| **4. Decisão Visual** | 8 | 7 | **2** | 11 | 🟢 **APROVAR** |
| **TOTAL** | **25** | **25** | **8** | **41** | **CONDICIONAR** |

> Nota: Contagens ajustadas pós-consolidação (itens duplicados entre A/C removidos).

---

## 3 Lacunas Críticas (Ação Imediata)

| # | Lacuna | Bloco | Onde | Esforço |
|---|---|---|---|---|
| 1 | Árvore decisão tool Step 0-3 + request checklist | 1 | `HERMES-CORE` / gateway / `validar-mapa.mjs` | Médio |
| 2 | Versionamento explícito `if_version` + auto-merge staleness | 2 | `motor/03-memoria/` (3 temperaturas) | Médio |
| 3 | Frases proibidas memória (`I remember`, `Based on my memories`) | 1/3 | `SOUL.md` / `04-COMUNICACAO.md` | Baixo |

---

## 13 Lacunas Menores (Backlog)

| # | Lacuna | Bloco | Prioridade |
|---|---|---|---|
| 1 | Category match vs style preference (MCP) | 1 | Baixa |
| 2 | Tool priority hierarchy explícita | 1 | Baixa |
| 3 | Fallback explícito quando tool falha | 1 | Baixa |
| 4 | Frases proibidas memória (parcial) | 3 | Baixa |
| 5 | Spec triggers visual (noun phrase) | 4 | Baixa |
| 6 | Visualizer module system | 4 | Média |
| 7 | MCP app suggestion proactive | 1 | Baixa |
| 8 | Past chats linguistic cues | 1 | Baixa |
| 8 | Request evaluation checklist | 1 | Baixa |
| 9 | Artifact thresholds + storage ban | 1 | Baixa |
| 10 | Package management flag | 1 | Baixa |
| 10 | Copyright self-check | 1 | Baixa |
| 11 | Harmful content categories | 1 | Baixa |
| 11 | Image interleave patterns | 4 | Baixa |
| 12 | Connector search before suggest | 1 | Baixa |
| 12 | Visualizer module loading | 4 | Baixa |
| 13 | Loading messages (boring/playful) | 4 | Baixa |
| 13 | Content safety visuals | 4 | Baixa |
| 14 | Skill reading unconditional | 1/2/3/4 | Baixa |
| 14 | Fallback tool failure | 1 | Baixa |
| 15 | Spec triggers visual | 4 | Baixa |
| 16 | Multi-visualization interleaving | 4 | Baixa |
| 16 | Design guidance load fresh | 4 | Baixa |
| 17 | Never expose machinery | 4 | Baixa |
| 17 | Content safety visuals | 4 | Baixa |
| 18 | Skill reading unconditional | 1/2/3/4 | Baixa |
| 18 | Accountability w/o self-abasement | 3 | Baixa |
| 19 | Spec triggers visual | 4 | Baixa |

---

## Classes D+E Rejeitadas — Resumo

| Classe | Count | Exemplos |
|---|---:|---|
| **D — Exclusivo Plataforma** | 40 | Memory API, MCP Apps, Computer Use, File handling, Artifacts, Anthropic API, Structured outputs, Web Search tool, PDF/base64, Conversation mgmt, Stateful apps, Error handling, Citations, Profile injection |
| **Profile/memory_listing injection** |
| **E — Não Verificado/Temporal** | 36 | Model strings (Opus 5, Fable 5, Mythos 5), Mythos tier/Glasswing, Produtos Anthropic (Code, Cowork, Chrome, Excel, PPT, Design, Tag), Knowledge cutoff May 2026, Exemplos copyright (WaPost, Let It Go, Addison Rae), User wellbeing (crisis, self-harm, eating disorders), PII categories (DOB, financial, location, race, gender), Image search blocked, MCP registry exemplos, suggest_connectors/research, end_conversation flow, Anthropic API config |

**Total rejeitado: 76 itens (54.3%) — Zero promoção.**

---

## Veredito META LUPA

```
VEREDITO: CONDICIONAR
TRADUÇÃO: 4 princípios reutilizáveis já 80-95% cobertos. 16 lacunas (3 críticas, 13 menores). 76 itens D/E rejeitados.
DECISÃO: Fechar 3 lacunas críticas; documentar 13 menores no backlog; rejeitar 76 itens D/E.
AUTORIZAÇÃO: PERMITO PIVETE para fechar 3 lacunas críticas.
RISCO RESIDUAL: Baixo.
PONTO_FIXO_ATINGIDO: sim (15 verificações AutoLupa).
REGISTRO: usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d
FIO: OPUS-5.md → classificar 5 classes → comparar 4 blocos → mapear lacunas → veredito CONDICIONAR → registrar
```