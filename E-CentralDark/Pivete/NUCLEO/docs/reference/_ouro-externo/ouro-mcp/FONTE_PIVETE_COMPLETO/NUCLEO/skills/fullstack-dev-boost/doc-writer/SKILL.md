---
name: doc-writer
description: "Consome cleaner + reviewer → relatório Markdown + plano."
version: 1.0.0
author: Pivete + Hermes
license: MIT
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [docs, reporting, pipeline, fullstack-dev-boost]
    related_skills: [data-cleaner, code-reviewer]
    requires_toolsets: [file]
    requires_tools: [read_file, write_file]
    fallback_for_toolsets: []
    fallback_for_tools: []
    config: []
    blueprint: null
required_environment_variables: []
---

# Doc Writer — Skill 3/3 do Fullstack Dev Boost

## When to Use
- Receber outputs JSON do `data-cleaner` e `code-reviewer`
- Gerar relatório final unificado em Markdown
- Incluir: resumo executivo, achados por severidade, métricas, plano de ação corretivo priorizado

## Quick Reference
| Input | Source |
|---|---|
| `clean_report_*.json` | data-cleaner |
| `review_report_*.json` | code-reviewer |
| Output | `fullstack_report_<timestamp>.md` |

## Procedure
### 1. LER INPUTS
```python
clean = read_json("clean_report_latest.json")
review = read_json("review_report_latest.json")
```

### 2. GERAR MARKDOWN (Template)

```markdown
# Fullstack Dev Boost — Relatório Consolidado
**Timestamp:** 2026-08-02 15:30:00
**Escopo:** PR #123 / dataset `vendas_q3.csv`

---

## 📊 Resumo Executivo
| Pilar | Score | Status |
|---|---|---|
| Qualidade dos Dados | 8.5/10 | 🟢 Bom |
| Segurança (OWASP) | 6.2/10 | 🟡 Atenção |
| Performance | 5.8/10 | 🟡 Atenção |
| Manutenibilidade | 7.1/10 | 🟢 Bom |

**Total arquivos:** 12 | **LOC alteradas:** 847 | **Linhas dataset:** 9.847/10.000

---

## 🧹 Data Cleaner — Achados
| Métrica | Valor |
|---|---|
| Linhas originais | 10.000 |
| Linhas limpas | 9.847 |
| Nulos corrigidos | 153 (col_a:12, col_b:0, col_e:141) |
| Duplicatas removidas | 41 |
| Outliers flagged | 23 (col_d) |
| Casts de tipo | 3 (col_c: datetime) |
| Warnings | col_e 40% nulos — avaliar drop |

---

## 🔒 Code Reviewer — OWASP Top 10
| Severidade | Count | Exemplos |
|---|---|---|
| CRITICAL | 0 | — |
| HIGH | 2 | A03: SQLi em api/users.py:42 |
| MEDIUM | 5 | A06: 3 deps com CVE, A05: debug=True |
| LOW | 3 | A09: PII em log, A01: IDOR potencial |

### Top 3 Críticos
1. **api/users.py:42** — SQL interpolation direta → parameterized query
2. **requirements.txt** — `requests==2.28.1` (CVE-2023-32681) → upgrade
3. **config.yaml** — `debug: true` em prod → false

---

## ⚡ Performance — Gargalos Medidos
| Arquivo | Função | Métrica | Impacto | Fix Sugerido |
|---|---|---|---|---|
| services/report.py | generate | O(n²) loop linhas 45-52 | 2.3s / 10k rows | Dict lookup / pandas vectorize |
| queries/dashboard.sql | — | N+1 em 3 joins | 840ms | Materialized view / CTE |

Complexidade ciclomática: média 8.2, máx 23 (services/report.py:generate)

---

## 🎯 Plano de Ação Corretivo (Priorizado)
| Prioridade | Item | Esforço | Responsável | Prazo |
|---|---|---|---|---|
| P0 | Corrigir SQLi api/users.py:42 | 15 min | Dev | Hoje |
| P0 | Upgrade requests 2.28.1 → 2.31+ | 10 min | Dev | Hoje |
| P1 | Desativar debug prod config.yaml | 2 min | DevOps | Hoje |
| P1 | Refatorar O(n²) services/report.py | 2h | Dev | Sprint |
| P2 | Materialized view dashboard.sql | 1h | DBA | Sprint |
| P2 | Avaliar drop col_e (40% nulos) | 30 min | Data | Sprint |
| P3 | Aumentar coverage 78% → 90% | 4h | QA | Próxima |

---

## ✅ Checklist de Entrega
- [ ] Relatório Markdown gerado
- [ ] JSON consolidado salvo (`fullstack_report_<ts>.json`)
- [ ] Plano de ação com responsáveis e prazos
- [ ] Links para arquivos originais (clean + review)
```

## Verification
- Markdown renderiza sem erro
- Todos os inputs referenciados (paths válidos)
- Plano de ação tem: prioridade, item, esforço, responsável, prazo
- Scores numéricos (0-10) presentes

## Pitfalls
- Input JSON faltando → abortar com erro claro
- Schema inesperado → validar chaves obrigatórias antes
- Arquivo grande → streaming write
- Encoding → forçar UTF-8