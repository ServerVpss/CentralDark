# Template de Auditoria de PR — Preencher e Anexar ao PR

## Auditoria PR #XXX — <title>

**Branch**: `<branch-name>`  
**Autor**: `<login>`  
**Data**: `<YYYY-MM-DD>`  
**Auditor**: `<seu-login>`

---

### ✅ Entregue (Confirmado Mecanicamente)

- [ ] Correção real: `<descrição curta>`
- [ ] CI passing: `<N> checks`
- [ ] Ledger chain íntegra: `sim/não` (se skill meta-lupa)
- [ ] Sem breaking change no schema/interface: `sim/não`

---

### 🔴 Lacunas Críticas (Bloqueiam Merge)

#### 1. Testes Citados vs Existência
| Teste Citado no PR | Existe no Repo? | Caminho Esperado | Status |
|---|---|---|---|
| `test_lupa.py` | ☐ Sim / ☐ Não | `testes/test_lupa.py` | ☐ OK / ☐ **LACUNA** |
| `test_meta_lupa_3t.py` | ☐ Sim / ☐ Não | `testes/test_meta_lupa_3t.py` | ☐ OK / ☐ **LACUNA** |
| `test_deny_delete.py` | ☐ Sim / ☐ Não | `testes/test_deny_delete.py` | ☐ OK / ☐ **LACUNA** |
| `test_ledger_check.py` | ☐ Sim / ☐ Não | `testes/test_ledger_check.py` | ☐ OK / ☐ **LACUNA** |
| `test_run_attacks.py` | ☐ Sim / ☐ Não | `testes/test_run_attacks.py` | ☐ OK / ☐ **LACUNA** |

#### 2. Recursos Declarados na Skill vs Existência
| Recurso Declarado | Caminho | Existe? | Status |
|---|---|---|---|
| guardrail | `guardrails/validar_meta_lupa.py` | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| política | `approvals/politica.json` | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| regressão 3T | `testes/test_meta_lupa_3t.py` | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| testes base | `testes/test_lupa.py` | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |

#### 3. Interface CLI (Branch vs Main)
| Arg Novo no Branch | Existe no Main? | Default Seguro? | Status |
|---|---|---|---|
| `--achievement` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--mode-used` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--triggers` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--risk` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--error-found` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--root-cause` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--counter-evidence` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--test-created` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--regression-created` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--false-green-blocked` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--guardrail-added` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--rollback-proven` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--improvements` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `--penalty` | ☐ Sim / ☐ Não | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |

#### 4. Achievements vs Evidência
| Achievement | Evidência Requerida | Presente no Ledger? | Status |
|---|---|---|---|
| `erro_reproduzido` | Teste automatizado reproduz defeito | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `causa_raiz_provada` | `root_cause` preenchido + prova contrária | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `ponto_fixo_atingido` | AutoLupa executada (`autolupa_executed: true`) | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |
| `falso_verde_bloqueado` | Bloqueio real de falso verde nesta missão | ☐ Sim / ☐ Não | ☐ OK / ☐ **LACUNA** |

#### 5. Flag `false_green_blocked` Coerente?
- Defeito original era falso verde? ☐ Sim / ☐ Não
- Ledger marca `false_green_blocked: true`? ☐ Sim / ☐ Não
- **Status**: ☐ OK / ☐ **LACUNA**

---

#### 6. Correção Semântica e Independência do Oráculo
| Prova | Evidência | Status |
|---|---|---|
| Contrato derivado da regra, não do código | `<invariantes>` | ☐ OK / ☐ **LACUNA** |
| Contraexemplo mínimo executado | `<entrada → atual ≠ esperado>` | ☐ OK / ☐ **LACUNA** |
| Oráculo usa mecanismo independente | `<algoritmo/fonte>` | ☐ OK / ☐ **REJEITAR** |
| Matriz de papéis inclui privilegiados | `<ator × papel × recurso>` | ☐ OK / ☐ **REJEITAR** |
| Bordas temporal inferior/superior testadas | `<t-1,t,t+ttl-1,t+ttl>` | ☐ OK / ☐ **REJEITAR** |
| Feature flag existe em código/config/call site/teste | `<paths>` | ☐ OK / ☐ **REJEITAR** |
| Consumidor real e rollback comprovados | `<call site + restauração>` | ☐ OK / ☐ **REJEITAR** |
| Alegação do PR coincide com o que os testes provam | `<comparação>` | ☐ OK / ☐ **REJEITAR** |

Gate executado:
```text
python scripts/semantic-gate.py <manifesto.json>
STATUS=
FALSE_GREEN=
REJECT_REASONS=
```

---

### 🟡 Lacunas Menores (Não Bloqueiam, Mas Registrar)
1. 
2. 

---

### 📋 Veredito Final

```
VEREDITO: ☐ APROVAR  ☐ CONDICIONAR  ☐ BLOQUEAR
```

**Próxima Ação Obrigatória** (se CONDICIONAR/BLOQUEAR):
```
<passo concreto, ex: "Criar testes/test_lupa.py com 1 teste de posterior() e 1 de finish-use receipt">
```

---

### 🔗 Evidências Coletadas
- `gh pr diff XXX` → `<output ou link>`
- `gh pr checks XXX` → `<output>`
- `find testes -name "*.py"` → `<output>`
- `git diff main..origin/branch -- script.py | grep add_argument` → `<output>`
- `cat .agents/skills/meta-lupa/references/uso-ledger.jsonl | tail -3` → `<output>`

---

**Assinatura do Auditor**: `<login>`  
**Timestamp**: `<YYYY-MM-DDTHH:MM:SSZ>`