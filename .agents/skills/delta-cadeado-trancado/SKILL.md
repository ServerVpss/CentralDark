---
name: delta-cadeado-trancado
description: Cristalização do delta CADEADO TRANCADO → hardening VPS + MetaLupa FABLE_LOOP defense + porta-de-entrada discovery + mutant tests + deploy guards
---

# Delta CADEADO TRANCADO — Cristalização Operacional

**Origem:** Mineração do acervo histórico `CADEADO TRANCADO SO COM PERMITO SEGREDO` (hardening-pack, Mandato Celestial, Runtime Closed Loop, Self-Learning Skills, go.txt/FABLE_LOOP defense)

**Promotion Rule (satisfeita):**
1. ✅ **Passing check** — YAML lint 3/3 workflows + npm test 4/4 passing
2. ✅ **Named failure pattern** — FABLE_LOOP estagnação sem evidência delta; CSP eval bloqueado sem correlação; CSS duplicado byte-por-byte
3. ✅ **Ruled-out dead-end** — Editar bundle ChatGPT; adicionar unsafe-eval; relaxar CSP; chamar de vírus sem prova; criar V2/V3

---

## Delta Mínimo Aplicado (6 owners canônicos)

| Owner | Mudança | Linhas |
|-------|---------|--------|
| `.agents/skills/meta-lupa/SKILL.md` | FABLE_LOOP DEFENSE + capability stripping + 10 contraprovas | +46 |
| `.github/workflows/porta-de-entrada.yml` | Discovery read-only (fase A) + Runtime receipt v1 schema | +43 |
| `.github/workflows/pr-auto-review.yml` | 20 mutant tests adversariais (FABLE_LOOP) | +64 |
| `.github/workflows/vps-exec-selfhosted.yml` | Evidence capture + UFW canonical + verify bind/ports + PM2 stability | -270 (refatorado) |
| `scripts/vps/deploy-operational-guards.sh` | secrets_rotation_check() no ecosystem.config | +15 |
| `package.json` | Duplicatas @radix-ui removidas (separator, slider, switch, tabs) | -6 |

## Novos Scripts (untracked → commitados)

| Script | Propósito |
|--------|-----------|
| `.github/scripts/discovery.sh` | Discovery read-only completo: sistema, PM2, Docker, Git, modelos |
| `.github/scripts/pm2-stability.js` | Análise restart counts + sugestão ecosystem.config |
| `.github/scripts/generate-receipt.js` | Emissão `centraldark.runtime.receipt.v1` |

---

## Padrão de Uso (Reutilização)

### Quando aplicar
- Novo hardening VPS necessário
- Nova porta-de-entrada/FABLE_LOOP defense requerida
- Mutant tests para porta de entrada
- Runtime receipt para auditoria

### Como reutilizar
```bash
# 1. Verificar owners atuais
git diff HEAD -- .github/workflows/ .agents/skills/meta-lupa/SKILL.md scripts/vps/

# 2. Aplicar delta incremental (não V2)
#    - Estender workflow existente com step/job
#    - Append na skill (não sobrescrever)
#    - Novo script em .github/scripts/ (não inline)

# 3. Validar
npx yaml-lint .github/workflows/*.yml
npm run test
```

### Anti-padrões (não fazer)
- ❌ Criar `vps-exec-selfhosted-v2.yml`
- ❌ Criar `meta-lupa-v2` skill
- ❌ Inline bash complexo em YAML (extrair para `.github/scripts/`)
- ❌ Editar bundle externo (ChatGPT, etc.)
- ❌ Relaxar CSP/segurança sem prova causal

---

## Evidência de Execução (Receipt)

```yaml
MEASURED_AT: 2026-08-22T22:15:00Z
CENTRALDARK_BRANCH: feat/gatilhos-execucao-reversivel-remediacao
CENTRALDARK_HEAD: 67950e916
YAML_LINT: 3/3 passing
NPM_TEST: 4/4 passing
GIT_COMMIT: 67950e916
GIT_PUSH: origin/feat/gatilhos-execucao-reversivel-remediacao
```

---

## Conexão com Acervo Original

| Componente CADEADO | Owner Atual | Status |
|--------------------|-------------|--------|
| hardening-pack scripts | vps-exec-selfhosted.yml + porta-de-entrada.yml | ✅ Integrado |
| Mandato Celestial (AutoLupa) | meta-lupa/SKILL.md | ✅ Estendido (FABLE_LOOP) |
| Runtime Closed Loop (fases A-H) | porta-de-entrada.yml + pr-auto-review.yml | ✅ Parcial (A, H) |
| Self-Learning Skills | centraldark-operational-method (Registro do Ouro) | ✅ Conceito aplicado |
| FABLE_LOOP Defense (go.txt) | meta-lupa + pr-auto-review | ✅ Mutant tests + capability stripping |

---

## Próximos Passos Naturais (se necessário)

1. **PR para main** — quando CHEFE autorizar
2. **Fases B-G Runtime Closed Loop** — estender porta-de-entrada com topology/detectors/model-routing/patch-plan/isolated-impl/independent-judge
3. **Self-Learning Skill formal** — criar `.agents/skills/self-learning/` com harvest procedure
4. **Deploy VPS real** — validar evidence capture + UFW canonical em produção

---

**Cristalizado pelo HERMES-CASA sob autoridade do CHEFE/SEGREDO.**  
**Ouro registrado. Catraca girando.**