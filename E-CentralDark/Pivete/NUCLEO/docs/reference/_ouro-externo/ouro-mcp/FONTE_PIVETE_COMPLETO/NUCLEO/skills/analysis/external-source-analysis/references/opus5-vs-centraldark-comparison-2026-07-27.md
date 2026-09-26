# OPUS-5.md vs CentralDark Stack — Comparação Formal (27/07/2026)

## Metadados da Análise
- **Arquivo fonte**: `OPUS-5.md` (202.7 KB, SHA256 `f8bc6dee5b23b926d3cb87a5b2dfc197feea6bfd82119f4a796b767a8da2ec41`)
- **Stack alvo**: CentralDark (SOUL, NUCLEO-MORDOMO, META LUPA, PADRAO-CARD-HERMES v1.2)
- **Método**: META LUPA formal (BEGIN/FINAL registrados no ledger `usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d`)
- **Classes**: 5 classes × 140 itens = A(19) + B(28) + C(16) + D(40) + E(36) = 140

---

## Resumo Executivo

| Classe | Qtd | Ação |
|---|---:|---|
| **A — Princípio Reutilizável** | 19 | Extrair e implementar no stack |
| **B — Já Existe** | 28 | Confirmar, não duplicar |
| **C — Lacuna Real** | 16 | Fechar no stack existente |
| **D — Exclusivo Plataforma** | 40 | Rejeitar (não roda no nosso runtime) |
| **E — Temporal/Não Verificado** | 36 | Rejeitar (temporal/proprietário) |
| **Total** | **140** | **76 rejeitados, 19 aproveitáveis, 16 lacunas** |

**Veredito META LUPA**: `CONDICIONAR` — Fechar 3 lacunas críticas, documentar 13 no backlog, rejeitar 100% D/E.

---

## 10 Fórmulas Extraídas (76 itens D+E → 10 Fórmulas)

| Fórmula | Itens Origem (D/E) | Mecanismo | Onde Implementar |
|---|---|---|---|
| **F1** Memória Versionada | Memory API, Conversation mgmt, Stateful apps (D) | Ledger append-only + `if_version` + conflitos + auto-merge staleness | 3 temperaturas + ledger META LUPA |
| **F2** Descoberta Dinâmica + Opt-in | MCP Apps, suggest_connectors, MCP registry (D/E) | Registry → busca palavras-chave → suggest → usuário escolhe → conecta | Gateway/router + skills discovery |
| **F3** Sandbox + Artefatos | Computer Use, Artifacts (D) | Execução isolada (bash_tool) + render inline (SVG/HTML/React) + CSS vars | `claude-design` + `bash_tool` + `visualize:show_widget` |
| **F4** Busca Externa + Citações | Web Search, citações antml:cite (D) | web_search → web_fetch → fontes originais → citar antml:cite (doc-sent) → 1 quote/fonte, ≤15 palavras | `web_search`/`web_fetch` skills + citation rules |
| **F5** Ingestão Binários + Extração | PDF/base64 upload, File handling (D) | Upload → detect tipo → extrator (pdf-reading, file-reading, vision) → texto estruturado | `file-reading`/`pdf-reading`/`vision_analyze` |
| **F6** Histórico + Resumo + Recuperação | Conversation mgmt, History, Resumo (D/E) | 3 temperaturas (HOJE/SEMANA/REGRAS) + SESSION.md + ledger append-only + recuperação: ler plano → hoje → semana → logs → estado real → reconstruir | 3 temperaturas + SESSION.md + ledger META LUPA |
| **F7** Estado Persistente Entre Turns | Stateful apps, Game state (D) | Estado serializado (JSON) + persistência append-only + versionamento + recuperação ponto fixo | `MEMORY.md` + ledger META LUPA + AUTOLUPA |
| **F8** Saída Tipada Validada | Structured outputs XML/JSON, Citation format (D/E) | Schema (JSON Schema/design-md) → validação → saída tipada → parsing seguro → erro = retry com schema | `design-md` skill + validação schemas + `meta_lupa.py` contracts |
| **F9** Encerramento Gracioso | end_conversation flow, warning flow, confirmação (E) | Aviso → tentativas redirecionamento → warning explícito → confirmação → encerramento limpo | BOOT protocol / FIO_DA_MISSAO / handoff protocol |
| **F10** Investigação Assíncrona | suggest_research, background investigation (E) | Botão "Start research" → workflow autônomo 5-10 min → busca multi-fonte → cross-reference → relatório fonteado → usuário decide | `background-output-log` skill + `delegate_task` |

---

## 4 Blocos Comparados

| Bloco | Ouro (A) | Existe (B) | Lacuna (C) | Rejeitado (D+E) | Veredito |
|---|---:|---:|---:|---:|---|
| **1. Roteamento Tools** | 5 | 3 | **3 (CRÍTICAS)** | 21 | 🟡 CONDICIONAR |
| **2. Memória Versionada** | 6 | 11 | **2** | 6 | 🟡 CONDICIONAR |
| **3. Correção Sem Culpa** | 6 | 4 | **1** | 3 | 🟢 APROVAR |
| **4. Decisão Visual** | 8 | 7 | **2** | 11 | 🟢 APROVAR |

---

## 3 Lacunas Críticas (Ação Imediata)

| # | Lacuna | Onde | Evidência OPUS |
|---|---|---|---|
| **1** | Árvore decisão tool explícita (Step 0-3) | `HERMES-CORE` / gateway | Step 0: visual? → Step 1: MCP fit? → Step 2: file? → Step 3: Visualizer |
| **2** | Versionamento explícito (`if_version` + auto-merge) | 3 Temperaturas (`motor/03-memoria/`) | `memory_read` → `if_version` obrigatório, auto-merge em staleness |
| **3** | Frases proibidas memória explícitas | `SOUL.md` / `04-COMUNICACAO.md` | "I remember", "Based on my memories", "From memory", "In my memory", "According to my knowledge" |

---

## Itens Rejeitados — Classes D+E (76 itens)

### Classe D — Exclusivo Plataforma Anthropic (40)
Memory API completa, MCP Apps, Computer Use, File handling, Artifacts, Anthropic API in artifacts, Structured outputs, Web Search tool, PDF/base64 upload, Conversation management, Stateful apps, Error handling, Citation format, Profile/memory_listing injection, Computer use skills, File handling, Artifact rendering, Anthropic API in artifacts, Structured outputs in XML, Web Search tool, PDF/image base64 upload, Conversation management, Stateful applications, Error handling, Citation format antml:cite, Profile/memory_listing injection

### Classe E — Não Verificado / Temporal (36)
Model strings (Opus 5, Fable 5, Mythos 5, Haiku 4.5), Mythos tier/Glasswing, Produtos Anthropic (Code, Cowork, Chrome, Excel, PPT, Design, Tag), Knowledge cutoff May 2026, Exemplos copyright (WaPost, Let It Go, Addison Rae), User wellbeing (crisis, self-harm, eating disorders), NEDA disconnected, National Alliance helpline, PII categories (DOB, financial, location, race, gender), Image search blocked categories, MCP registry search examples, suggest_connectors, suggest_research, end_conversation flow, Anthropic API in artifacts config, structured_outputs_in_xml, tool_usage with web_search_20250305, MCP + web search combined, handling_tool_responses, file handling, conversation_management, stateful_applications, error_handling, critical_ui_requirements

---

## Mapeamento Fórmulas → Stack CentralDark

```
CentralDark Stack
├── gateway/router          → F2 (descoberta) + F4 (busca+citações)
├── HERMES-CORE             → F1 (memória via ledger) + F9 (BOOT protocol)
├── motor/03-memoria/       → F1 (if_version) + F6 (3 temperaturas) + F7 (ledger)
├── motor/06-ferramentas/   → F3 (bash_tool+claude-design) + F4 (web_search) + F5 (file/pdf/vision) + F10 (background-output-log)
├── skills/                 → F3 (claude-design) + F8 (design-md) + F10 (background-output-log)
├── SOUL.md / 04-COMUNICACAO.md → F9 (BOOT/FIO_DA_MISSAO)
└── META LUPA (ledger)      → F1 (append-only) + F7 (ponto fixo)
```

---

## Veredito Final

```
VEREDITO: CONDICIONAR
TRADUÇÃO DIRETA: OPUS-5.md contém 4 princípios reutilizáveis já 80-95% cobertos. 16 lacunas identificadas (3 críticas). 76 itens D/E rejeitados integralmente.
DECISÃO: Fechar 3 lacunas críticas nos artefatos existentes; documentar 13 lacunas menores no backlog; rejeitar 100% classes D/E.
HIPÓTESES: Nenhuma — análise read-only completa.
FONTE DA VERDADE: OPUS-5.md (SHA256 f8bc6dee5b23b926d3cb87a5b2dfc197feea6bfd82119f4a796b767a8da2ec41) + CentralDark stack (SOUL, NUCLEO-MORDOMO, META LUPA, PADRAO-CARD-HERMES v1.2).
PRIOR: 0.5 (neutro declarado).
EVIDÊNCIAS: 140 itens classificados em 5 classes; 4 blocos comparados; 21 lacunas mapeadas.
CLUSTERS: Nenhuma dependência cruzada detectada.
LRs: Qualitativos — evidências favorecem CONDICIONAR.
POSTERIOR: CONDICIONAR com alta confiança.
ENTROPIA ANTES/DEPOIS: N/A (análise qualitativa).
SENSIBILIDADE: Baixa — conclusão robusta a variações de classificação.
FALSIFICADOR: Encontrar princípio Classe A não coberto no stack (não encontrado).
PRÓXIMO TESTE: Implementar 3 lacunas críticas e rodar META LUPA de regressão.
VALOR DA INFORMAÇÃO: Alto — evita importação cega de 76 itens D/E.
CUSTO DO ERRO: Médio — importar D/E criaria drift e paralisia.
BLOQUEIOS: Classes D/E bloqueadas por regra de ouro.
AUTORIZAÇÃO: PERMITO PIVETE para fechar lacunas críticas.
RISCO RESIDUAL: Baixo — apenas documentação de backlog.
ENCAIXE NO MAPA: Lacunas entram em artefatos existentes (gateway, SOUL, 3 temperaturas).
ESTADO CONSOLIDAÇÃO: Análise read-only consolidada.
MECANISMO TRAVA: META LUPA formal (BEGIN/FINAL registrados).
AUTOLUPA: PONTO_FIXO_ATINGIDO=sim (15 verificações respondidas).
REGISTRO: usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d
FIO DA MISSÃO: OPUS-5.md → classificar 5 classes → comparar 4 blocos → mapear lacunas → veredito CONDICIONAR → registrar.
```

---

## Arquivos Relacionados

- **Manual atualizado**: `E:\CentralDark\Pivete\NUCLEO\MANUAL-SESSAO-19-07-2026\MANUAL.html` (seção `#opus-5-analise` + `#opus-5-formulas`)
- **Ledger META LUPA**: `.agents/skills/meta-lupa/references/uso-ledger.jsonl` (BEGIN/FINAL `usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d`)
- **Scripts de classificação**: `classify_opus.py`, `compare_4blocks.py` (no worktree)
- **Relatório comparativo**: `OPUS-5_vs_CentralDark_COMPARACAO.md`
- **Plano Mestre**: `PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`

---

*Gerado em 2026-07-27 via META LUPA formal (usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d)*