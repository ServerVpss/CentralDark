# Análise de Sessão — PR #410 (27/07/2026)

## Resumo
Auditoria do PR #410 `fix(meta-lupa): finish-use passa a exibir o recibo de XP na saída` revelou **5 lacunas críticas** que impedem merge seguro.

---

## Lacunas Detectadas

### 1. Testes Citados Inexistentes (Falso Verde de Versão)
| Teste Citado | Status Real |
|---|---|
| `test_lupa.py` | ❌ Ausente |
| `test_meta_lupa_3t.py` | ❌ Ausente |
| `test_deny_delete.py` | ❌ Ausente |
| `test_ledger_check.py` | ❌ Ausente |
| `test_run_attacks.py` | ❌ Ausente |

**Prova**: `find . -name "test_*.py"` retorna vazio em `.agents/skills/meta-lupa/`

---

### 2. Recursos Declarados Ausentes (Falso Verde de Recurso)
Matriz XP-5 (SKILL.md linhas 347-356) declara:
| Recurso | Caminho | Estado Real |
|---|---|---|
| guardrail | `guardrails/validar_meta_lupa.py` | ❌ AUSENTE |
| política | `approvals/politica.json` | ❌ AUSENTE |
| regressão 3T | `testes/test_meta_lupa_3t.py` | ❌ AUSENTE |
| testes | `testes/test_lupa.py` | ❌ AUSENTE |

**Prova**: `ls -la .agents/skills/meta-lupa/` — só existe `scripts/meta_lupa.py` + `references/`

---

### 3. Interface CLI Incompatível (Falso Verde de Interface)
Branch `fix/meta-lupa-recibo-xp-20260727` adiciona **13 argumentos novos** ao `finish-use` que **não existem no main**:

```python
# Apenas no branch, não no main:
--mode-used
--triggers
--risk
--error-found
--root-cause
--counter-evidence
--test-created
--regression-created
--false-green-blocked
--guardrail-added
--rollback-proven
--improvements
--achievement (append, choices=XP_AWARDS)
--penalty (append, choices=XP_PENALTIES)
```

**Risco**: Se mergeado sozinho, `main` quebra ao rodar `finish-use` com args novos.

---

### 4. Achievements Sem Evidência Reproduzível
Registro FINAL no ledger declara:
```json
"achievements": ["causa_raiz_provada", "erro_reproduzido", "ponto_fixo_atingido"],
"xp_gained": 40
```

Problemas:
- `erro_reproduzido` → **não há teste automatizado** que reproduza o defeito (antes só printava `usage_id`, depois printa recibo)
- `ponto_fixo_atingido` → **AutoLupa não executada** (`"autolupa_executed": false` no ledger)

**Regra da skill (XP-4)**: "Sem o bloco [AutoLupa], veredito não sela."

---

### 5. Flag `false_green_blocked` Incoerente
Defeito original: **comando "passava" (exit 0) mas não mostrava se houve XP** — operador precisava abrir JSONL manual.

Isso **se enquadra na Invariante de Falsificação** (SKILL.md linhas 12-16): *"ausência de erro ou listagem de recurso é evidência insuficiente"*

Porém ledger marca: `"false_green_blocked": false`

**Deveria ser**: `true` (o defeito ERA um falso verde de exposição)

---

## O Que Estava Correto ✅

- Correção mínima, cirúrgica: nova função `_final_receipt_line()` que **só lê campos já existentes**
- Zero breaking change no schema do ledger
- Idempotência preservada (`FINAL_IDEMPOTENT` / `FINAL_CONFLICT`)
- Ledger chain íntegra (`xp_before=855` casa com `xp_after` do FINAL anterior)
- `RISCO_RESIDUAL` declarado honestamente (nomes de campo podem mudar)

---

## Veredito da Sessão

```
VEREDITO: CONDICIONAR
NÃO MERGEAR até resolver Lacunas 1 e 2 (testes + interface)
```

### Ações Obrigatórias (Ordem)
1. **Criar `testes/test_lupa.py`** (mínimo: 1 teste `posterior()` + 1 teste `finish-use` receipt) — **OU** remover linhas 303, 355 do SKILL.md que mentem sobre existência
2. **Trazer args novos pro main** (parte do PR ou PR separado antes do merge)
3. **Corrigir `false_green_blocked: true`** no ledger do FINAL (ou justificar por que não é falso verde)
4. **Rodar AutoLupa real** (Fase 9) ou **remover `ponto_fixo_atingido`** dos achievements

---

## Lição Central Para Futuras Sessões

> **Nunca confiar no PR body, commit message ou SKILL.md como prova de existência.**
> 
> A única prova válida é **prova mecânica no disco**: `git ls-files`, `find`, `ls -la`, `cat`, `git show`, `diff`.
> 
> - Se a skill/matriz declara "PRESENTE" → validar no checkout limpo
> - Se o PR body cita "TOTAL=52 PASS=52" → rodar o teste ou confirmar arquivo
> - Se o branch adiciona args → garantir compatibilidade com main ou bloquear merge

---

## Ferramentas Criadas Nesta Sessão

1. **Skill `pr-auditing`** — classe para detectar falso verde em PRs antes de merge
2. **Template `templates/auditoria-pr.md`** — checklist pronto para preencher
3. **Script `scripts/pr-audit.py`** — validador automático (roda localmente)

```bash
# Uso do script:
python scripts/pr-audit.py 410 --repo ServerVpss/CentralDark
```

---

## Próximos Passos Recomendados

1. Aplicar template no PR #410 como comentário de review
2. Rodar `pr-audit.py` no PR para confirmar lacunas mecanicamente
3. Bloquear merge até resolver (label `do-not-merge` ou similar)
4. Criar issue/fix para recursos ausentes da meta-lupa (guardrail, política, testes)