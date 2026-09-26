---
name: pr-auditing
description: Detectar falso verde em PRs antes de merge — validar testes citados, recursos declarados, interface CLI compatível, achievements com evidência, flags coerentes. Usar quando auditar PRs de escopo crítico ou quando o Pivete mandar "analise lacunas" / "prove antes de merge".
---

# PR Auditing — False Green Detection

Padrão reutilizável para auditar PRs e detectar inconsistências entre o que o PR **declara** (body, commit message, SKILL.md) e o que **existe no repositório** (checkout limpo, ledger, diff).

> Princípio central: **"O Git aparenta saúde mas o checkout limpo não entrega."**
> Sempre validar com prova mecânica no disco antes de declarar existência.

---

## 1. Checklist de Auditoria Pré-Merge

### 1.1 Testes Citados vs Existência Real

**Padrão de falha**: PR body cita `test_lupa.py TOTAL=52 PASS=52` mas arquivo não existe no repo.

**Verificação obrigatória**:
```bash
# Para cada teste citado no PR body/commit message:
find . -name "*test_lupa*" -o -name "*test_meta_lupa*" -o -name "*test_deny*" -o -name "*test_ledger*"
# Se retorna vazio → LACUNA CRÍTICA
```

### 1.2 Recursos Declarados em Matriz/Skill vs Existência Real

**Padrão de falha**: SKILL.md declara `guardrails/validar_meta_lupa.py` como "PRESENTE" mas não existe.

**Verificação obrigatória**:
```bash
# Para cada caminho na matriz de recursos (XP-5, etc.):
ls -la <caminho_declarado> 2>&1 || echo "AUSENTE: <caminho_declarado>"
```

### 1.3 Compatibilidade de Interface CLI (branch vs main)

**Padrão de falha**: Branch do PR adiciona args novos (`--achievement`, `--mode-used`, etc.) que não existem no `main`.

**Verificação obrigatória**:
```bash
# Comparar args do comando no branch vs main:
git show origin/main:<script_path> | grep -A 50 'comando_alvo'
git show origin/fix/...:<script_path> | grep -A 50 'comando_alvo'
# diff deve mostrar apenas adições compatíveis (novos args com defaults)
```

### 1.4 Achievements vs Evidência Reproduzível

**Padrão de falha**: `achievements: ["erro_reproduzido", "ponto_fixo_atingido"]` mas:
- `erro_reproduzido` → sem teste automatizado que reproduza o defeito
- `ponto_fixo_atingido` → AutoLupa não executada (`autolupa_executed: false`)

**Regra**: achievement só é válido se houver **evidência reproduzível** no ledger (teste, log, diff, hash).

### 1.5 Flag `false_green_blocked` Coerente

**Padrão de falha**: defeito era "comando passa mas não mostra XP" = falso verde de exposição, mas ledger marca `false_green_blocked: false`.

**Regra**: se o defeito se enquadra na **Invariante de Falsificação** (painel verde / ausência de erro / listagem = evidência insuficiente) → deve ser `true`.

---

## 2. Tipos de Falso Verde Mapeados

| Tipo | Sinal | Verificação Mecânica |
|---|---|---|
| **Falso verde de versão** | Tests citados no body, inexistentes no checkout | `git ls-files` / `find` |
| **Falso verde de interface** | Args novos no branch, não no main | `git diff main..branch -- script.py` |
| **Falso verde de achievement** | XP reivindicado sem teste/autolupa | ledger `autolupa_executed`, `test_created` |
| **Falso verde de métrica** | `false_green_blocked=false` quando defeito era falso verde | Confrontar com Invariante de Falsificação |
| **Falso verde de recurso** | Matriz declara "PRESENTE" mas arquivo ausente | `ls -la <path>` |

---

## 3. Template de Relatório de Auditoria

```markdown
## Auditoria PR #XXX — <title>

### ✅ Entregue
- [ ] Correção real (descrever)
- [ ] CI passing (N checks)
- [ ] Ledger chain íntegra
- [ ] Sem breaking change

### 🔴 Lacunas Críticas (bloqueiam merge)
1. **Testes inexistentes**: <lista>
2. **Interface incompatível**: <detalhe>
3. **Recursos declarados ausentes**: <matriz>

### 🟡 Lacunas Menores
1. **Achievement sem evidência**: <qual>
2. **Flag inconsistente**: <qual>

### Veredito
```
VEREDITO: CONDICIONAR | APROVAR | BLOQUEAR
PRÓXIMA AÇÃO: <passo concreto>
```
```

---

## 4. Comandos de Auditoria Rápida

```bash
# 1. Ver diff completo do PR
gh pr diff XXX

# 2. Ver arquivos alterados
gh pr view XXX --json files --jq '.files[].path'

# 3. Ver checks CI
gh pr checks XXX

# 4. Ver ledger se skill meta-lupa
cat .agents/skills/meta-lupa/references/uso-ledger.jsonl | tail -5

# 5. Verificar se testes existem na skill
find .agents/skills/<skill-name> -name "test_*.py" -o -name "*_test.py"

# 6. Comparar interface CLI main vs branch
git diff main..origin/fix/... -- <script_path> | grep -E '^\+.*add_argument'

# 7. Validar recursos declarados na skill
cat .agents/skills/<skill-name>/SKILL.md | grep -A 20 'Matriz de existência'
# depois checar cada path com ls -la
```

---

## 5. Referência da Sessão 27/07/2026 (PR #410)

### Contexto
PR #410: `fix(meta-lupa): finish-use passa a exibir o recibo de XP na saída`
Branch: `fix/meta-lupa-recibo-xp-20260727`

### Lacunas Encontradas
1. **4 testes citados inexistentes**: `test_lupa.py`, `test_meta_lupa_3t.py`, `test_deny_delete.py`, `test_ledger_check.py`, `test_run_attacks.py`
2. **4 recursos declarados ausentes**: `guardrails/validar_meta_lupa.py`, `approvals/politica.json`, `testes/test_meta_lupa_3t.py`, `testes/test_lupa.py`
3. **13 args novos no branch** não existentes no main (interface quebrada se mergeado sozinho)
4. **2 achievements sem evidência**: `erro_reproduzido` (sem teste), `ponto_fixo_atingido` (AutoLupa não rodou)
5. **Flag inconsistente**: `false_green_blocked=false` mas defeito era falso verde de exposição

### Veredito
```
VEREDITO: CONDICIONAR
Não mergear até resolver Lacunas 1 e 2.
```

---

## 6. Lição Central para Futuras Sessões

> **Nunca confiar no PR body, commit message ou SKILL.md como prova de existência.**
> 
> A única prova válida é **prova mecânica no disco**: `git ls-files`, `find`, `ls -la`, `cat`, `git show`, `diff`.
> 
> Se a skill/matriz declara "PRESENTE" → validar no checkout limpo.
> Se o PR body cita "TOTAL=52 PASS=52" → rodar o teste ou confirmar arquivo.
> Se o branch adiciona args → garantir compatibilidade com main ou bloquear merge.

---

## Recursos

- `scripts/` — (futuro) scripts de verificação automatizada
- `templates/auditoria-pr.md` — template pronto para preencher