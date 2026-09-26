---
name: data-cleaner
description: "Limpa e normaliza dados — nulos, duplicatas, tipos."
version: 1.0.0
author: Pivete + Hermes
license: MIT
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [data, cleaning, pipeline, fullstack-dev-boost]
    related_skills: [code-reviewer, doc-writer]
    requires_toolsets: [terminal, file]
    requires_tools: [terminal, read_file, write_file, search_files]
    fallback_for_toolsets: []
    fallback_for_tools: []
    config: []
    blueprint: null
required_environment_variables: []
---

# Data Cleaner — Skill 1/3 do Fullstack Dev Boost

## When to Use
- Receber dataset bruto (CSV, JSON, Parquet, Excel, SQL dump)
- Detectar: nulos, duplicatas, tipos errados, outliers, encoding, schema drift
- Produzir base normalizada + relatório de mudanças

## Quick Reference
| Ação | Tool |
|---|---|
| Ler arquivo | `read_file` / `terminal` (pandas, duckdb) |
| Detectar issues | `terminal` (python script) |
| Corrigir/Normalizar | `write_file` / `terminal` |
| Reportar | `write_file` (JSON + Markdown) |

## Procedure
### 1. INGESTÃO
```python
# Input: path do arquivo bruto
# Output: df + metadata (linhas, colunas, tipos, encoding)
```

### 2. VARREDURA (Checklist)
- [ ] Nulos por coluna (`df.isnull().sum()`)
- [ ] Duplicatas exatas (`df.duplicated().sum()`)
- [ ] Tipos esperados vs reais (`df.dtypes`)
- [ ] Outliers numéricos (IQR / z-score)
- [ ] Categorias com cardinalidade alta/baixa
- [ ] Encoding (UTF-8, latin1, cp1252)
- [ ] Datas parseáveis
- [ ] Schema vs contrato (se houver)

### 3. NORMALIZAÇÃO
- Preencher nulos (estratégia por coluna: mediana, moda, "UNKNOWN", drop)
- Dedup (keep='first' ou por chave de negócio)
- Cast tipos (datetime, numeric, category)
- Padronizar strings (strip, lower, unidecode)
- Truncar outliers (winsorize) ou flag

### 4. SAÍDA
- Arquivo limpo: `clean_<original>.<ext>`
- Relatório: `clean_report_<timestamp>.md` + `clean_report_<timestamp>.json`

## Output Format (JSON)
```json
{
  "source": "path/original.csv",
  "clean_path": "path/clean_original.csv",
  "rows_before": 10000,
  "rows_after": 9847,
  "cols": 15,
  "nulls_fixed": {"col_a": 12, "col_b": 0},
  "duplicates_removed": 41,
  "type_casts": {"col_c": "object->datetime64"},
  "outliers_flagged": {"col_d": 23},
  "encoding_detected": "utf-8",
  "warnings": ["col_e tem 40% nulos - dropar?"]
}
```

## Verification
- `rows_after > 0`
- `nulls_fixed` soma = `rows_before - rows_after` (se drop)
- Tipos no arquivo limpo batem com `type_casts`
- Relatório Markdown legível existe

## Pitfalls
- Arquivo > 100MB → usar chunking / duckdb / polars lazy
- Encoding errado → tentar `chardet` / `cchardet`
- Coluna chave de negócio não informada → assumir index
- Pipeline falhar no meio → deixar arquivo original intacto