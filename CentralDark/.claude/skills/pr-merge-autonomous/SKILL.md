---
name: pr-merge-autonomous
description: Orquestra PR críticos: gates SAME_HEAD → merge squash → VPS sync → reload → validação → contraprova → FIXED_POINT
trigger: user_asked
applies_to: ["github", "deployment", "ci_cd"]
---

# 🚀 PR-Merge Autônomo (SKILL)

**Contexto:** Quando um PR crítico está aberto e aguardando gates SAME_HEAD, execute este fluxo de forma determinística até FIXED_POINT.

## Fluxo Executivo

### 1. Status Check Inicial
```bash
# Verificar PR existe e está ready
gh pr view 1605 --json state,isDraft,statusCheckRollup

# Verificar gates
gh pr checks 1605 --required
```

**Critério de prosseguimento:**
- ✅ PR não é draft
- ✅ Gates obrigatórios existem
- ✅ Nenhum conflito detectado

### 2. Polling de Gates (com timeout)
```bash
# Aguardar até gates completarem (max 30 min)
# Polling a cada 2 min, evita rate limit

timeout=1800
start=$(date +%s)

while true; do
  elapsed=$(($(date +%s) - start))
  [ $elapsed -gt $timeout ] && echo "TIMEOUT" && exit 1
  
  status=$(gh pr checks 1605 --json name,conclusion --jq '.[] | select(.conclusion != null) | .conclusion' | sort | uniq)
  
  if echo "$status" | grep -q "success"; then
    echo "✅ Gates passed"
    break
  fi
  
  sleep 120
done
```

**Se falhar:** investigar logs e pausar (não forçar merge)

### 3. Merge Squash Determinístico
```bash
# Fetch + validar que branch ainda alinhado
git fetch origin
git diff main fix/branch --stat

# Squash merge
gh pr merge 1605 --squash --delete-branch --admin

# Validar
git log main -1 --oneline
```

### 4. Sync VPS (Determinístico)
```bash
# Na VPS
cd /root/CentralDark
git pull origin main --rebase

# Validar sem conflitos
[ $? -ne 0 ] && echo "SYNC FALHOU" && exit 1
git log -1 --oneline
```

### 5. Reload Cirúrgico PM2
```bash
# Somente PM2 owner MCP admin (nunca "all")
pm2 restart mcp --silent

# Aguardar + validar
sleep 2
pm2 describe mcp | grep -q "online" || exit 1
```

### 6. Validação de Endpoints
```bash
# Tripé mínimo
curl -I http://mcp:9100/health | grep -q "200"
curl -I http://mcp:9100/health/deep | grep -q "200"
curl -I http://mcp:9100/admin | grep -q "200"

[ $? -ne 0 ] && echo "ENDPOINTS FAILED" && exit 1
```

### 7. Snapshot + Registro
```bash
# Gerar snapshot operacional
snapshot_file="/tmp/snapshot-$(date +%s).json"
curl -s http://mcp:9100/admin/operational-snapshot > "$snapshot_file"

# Validar JSON
jq . "$snapshot_file" > /dev/null || exit 1

# Registrar na receipt
echo "SNAPSHOT=$snapshot_file" >> /tmp/receipt-#1605.txt
```

### 8. Contraprova (SAME_HEAD Revalidação)
```bash
# Rodar gates novamente contra main (novo SHA)
gh workflow run .github/workflows/pr-auto-review.yml \
  --ref main --field commit_sha=$(git rev-parse main)

# Aguardar conclusão
sleep 30
# (Em produção: polling até conclusão)
```

### 9. FIXED_POINT Declaration
Se tudo ✅:
```bash
echo "FIXED_POINT=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /tmp/receipt-#1605.txt
echo "✅ DEPLOYMENT SEGURO — GATES PASSARAM, CONTRAPROVA OK"
```

---

## Precondições (Antes de Chamar Esta Skill)

- [ ] PR está aberto (não é draft)
- [ ] Title segue padrão: emoji + TIPO(SCOPE): descrição
- [ ] Body tem `Merge-Policy: SAME_HEAD_GATES_THEN_SQUASH`
- [ ] Writer-Scope está explícito
- [ ] Delta é mínimo (sem bloat)
- [ ] VPS repo está clean (`git status` sem changes)

---

## Se Algo Falhar

| Falha | Ação |
|-------|------|
| Gates timeout | Revisar logs CI, pausar, não forçar merge |
| Merge conflito | Resolver no GitHub, re-trigger |
| VPS sync falha | Investigar, possível revert necessário |
| Endpoint 500 | PM2 logs, se crítico fazer rollback |
| Contraprova falha | Revert + investigar divergência |

---

## Output Esperado

Arquivo de receipt em `/tmp/receipt-#XXXX.txt` com:
```
START_TIME=2026-09-20T21:17:00Z
PR_NUMBER=1605
GATES_PASSED=true
MERGE_COMMIT=e7ca38e0bc2e474...
VPS_SHA=53d4d772bb9b1b03...
PM2_STATUS=online
ENDPOINTS_OK=true
SNAPSHOT_FILE=/tmp/snapshot-1695314400.json
CONTRAPROVA_OK=true
FIXED_POINT=2026-09-20T21:35:00Z
STATUS=SUCCESS
```

---

## Integração com Hermes

Hermes aprende:
1. **Este padrão é reusável** — aplica a todo PR crítico
2. **Não reinventar** — copiar fluxo, trocar PR numbers
3. **Polling com timeout** — aguardar gates é normal
4. **Determinístico** — mesmas etapas, mesmo ordem, mesmas validações

**Diretiva:**
```
IF PR.body.contains("Merge-Policy: SAME_HEAD_GATES_THEN_SQUASH")
THEN apply_skill("pr-merge-autonomous", pr_number=PR.number)
```

---

**Versão:** 1.0  
**Autor:** SOL (Claude operacional CentralDark)  
**Data:** 2026-09-20  
**Status:** CANONIZADO — ready para reuso
