---
name: code-reviewer
description: "Review rigoroso — OWASP, performance, gargalos com métricas."
version: 1.0.0
author: Pivete + Hermes
license: MIT
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [code, review, security, performance, pipeline, fullstack-dev-boost]
    related_skills: [data-cleaner, doc-writer]
    requires_toolsets: [terminal, file, web]
    requires_tools: [terminal, read_file, write_file, search_files, web_search]
    fallback_for_toolsets: []
    fallback_for_tools: []
    config: []
    blueprint: null
required_environment_variables: []
---

# Code Reviewer — Skill 2/3 do Fullstack Dev Boost

## When to Use
- PR aberto / branch local / diff enviado
- Aplicar checklist OWASP Top 10 + boas práticas
- Medir gargalos com métricas exatas (complexidade, loops, queries, memory)
- Output estruturado para Doc Writer consumir

## Quick Reference
| Checklist | Tool |
|---|---|
| OWASP Top 10 | `search_files` (grep patterns) + `terminal` (bandit, semgrep) |
| Performance | `terminal` (py-spy, cProfile, explain analyze) |
| Complexidade | `terminal` (radon, xenon) |
| Dependências | `terminal` (pip-audit, npm audit) |
| Testes | `terminal` (pytest --cov, mutation testing) |

## Procedure
### 1. COLETA
- Ler diff / arquivos alterados (`read_file`, `search_files`)
- Identificar linguagem, framework, entrypoints

### 2. CHECKLIST OWASP (Top 10 + extras)
- [ ] A01: Broken Access Control (RBAC, IDOR, path traversal)
- [ ] A02: Cryptographic Failures (TLS, hash fraco, secrets no código)
- [ ] A03: Injection (SQLi, NoSQLi, command, LDAP, XSS)
- [ ] A04: Insecure Design (threat modeling ausente)
- [ ] A05: Security Misconfig (debug on, default creds, CORS *)
- [ ] A06: Vulnerable Components (CVE em deps, versions pinned)
- [ ] A07: Auth Failures (brute force, session fixation, MFA)
- [ ] A08: Software Integrity (CI/CD, supply chain, sigstore)
- [ ] A09: Logging/Monitoring Failures (PII no log, alerta ausente)
- [ ] A10: SSRF (fetch interno, metadata service)
- [ ] Extras: Secrets (git-secrets, truffleHog), Supply Chain (SLSA)

### 3. PERFORMANCE (Métricas Exatas)
| Métrica | Tool | Threshold |
|---|---|---|
| Cyclomatic Complexity | `radon cc` | > 10 = refatorar |
| Cognitive Complexity | `radon cc -c` | > 15 = refatorar |
| Duplicated Lines | `radon raw` | > 5% = extrair |
| SQL N+1 | `explain analyze` | rows x loops |
| Loop Aninhado O(n²+) | `py-spy` / manual | > 10k itens |
| Memory Leak | `tracemalloc` / `objgraph` | crescimento linear |
| Bundle Size | `webpack-bundle-analyzer` | > 500kb gzipped |

### 4. OUTPUT ESTRUTURADO (JSON para Doc Writer)
```json
{
  "scope": "PR #123 / branch feature/xyz",
  "files_reviewed": 12,
  "loc_changed": 847,
  "owasp_findings": [
    {"id": "A03", "file": "api/users.py:42", "severity": "HIGH", "detail": "SQL interpolation direta", "fix": "Usar parameterized query"}
  ],
  "perf_findings": [
    {"file": "services/report.py", "function": "generate", "metric": "O(n²) loop", "lines": "45-52", "impact": "~2.3s em 10k rows", "fix": "Usar dict lookup / pandas vectorizado"}
  ],
  "complexity": {"avg_cc": 8.2, "max_cc": 23, "hotspots": ["services/report.py:generate"]},
  "deps": {"vulnerable": 3, "outdated": 12, "details": [...]},
  "tests": {"coverage": 78, "mutations_survived": 4},
  "score": {"security": 6.2, "performance": 5.8, "maintainability": 7.1}
}
```

## Verification
- JSON válido + schema esperado
- Cada finding tem: file:line, severity, detail, fix sugerido
- Métricas numéricas (não "lento" — "2.3s em 10k rows")
- Score 0-10 por pilar

## Pitfalls
- Repo sem testes → não inventar coverage
- Linguagem não suportada por tool → fallback manual + anotar
- False positive OWASP → marcar "FP" no detail
- Monorepo → filtrar só arquivos do escopo