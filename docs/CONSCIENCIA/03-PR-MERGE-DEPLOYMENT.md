# 🚀 Fluxo Autônomo de PR → Merge → Deploy

**Título canônico:** Orchestração determinística de PR, gates e deployment mínimo  
**Origem:** Sessão 2026-09-20, cristalização de delta operacional  
**Autoridade:** SEGREDO/CHEFE + aprendizado de uma casa  
**Status:** CANONIZADO — regra permanente para IAs futuras

---

## 1. Anatomia do Fluxo

```
INTENCAO (PR criado)
  ↓
VALIDACAO (SAME_HEAD gates queued)
  ↓
AGUARDAR (gates em_progresso → conclusao)
  ↓
MERGER (squash main determinístico)
  ↓
SINCRONIZAR (VPS ← GitHub)
  ↓
RELOAD (PM2 owner MCP admin)
  ↓
VALIDACAO_ENDPOINTS (/health, /admin, /snapshot)
  ↓
CONTRAPROVA (SAME_HEAD validation no novo SHA)
  ↓
FIXED_POINT (declaração e logging)
```

---

## 2. Precondições (ANTES de abrir PR)

### 2.1 Estrutura de PR
- **Draft:** false (pronto pra merge)
- **Título:** semântico + emoji (ex: `🫀 FIX(ADMIN): MOSTRAR FLUXO...`)
- **Body obrigatório:**
  ```
  PR_MOTHER=#XXXX (se houver parent)
  PR_ROLE=CHILD_PROMOTION_PR (ou STANDALONE)
  Intent-Authorized: SEGREDO/CHEFE
  Writer: [nome da IA ou humano]
  Writer-Scope: [arquivo/feature específico]
  Merge-Policy: SAME_HEAD_GATES_THEN_SQUASH
  BASE_MAIN=[SHA do main no momento do PR]
  UNKNOWN != PASS
  REALITY_IS_JUDGE=true
  ```

### 2.2 Conteúdo do PR
- **Delta mínimo:** somente o que é necessário (zero bloat)
- **Sem alterações de secrets/credenciais**
- **Zero novos endpoints** (reusar existentes)
- **Zero novos schedulers/processes** (manter PM2 estável)
- **Sem segundo painel/UI desnecessária** (minimalismo operacional)

### 2.3 Linkage e Deduplicação
- Se o PR é promoção de um anterior (#1562), linkade explicitamente na body:
  ```
  Deduplication: Receipt-based linkage com #1562
  Parent-Logic: main já absorveu 11/12 componentes automaticamente
  Delta-Only: 5 linhas no container visual
  ```

---

## 3. Gates SAME_HEAD (CI/CD Synchronization)

### 3.1 O que São
Conjunto de workflows que validam que a **branch de trabalho** e **main** têm a mesma base lógica (mesmo HEAD conceitual).

Workflows típicos:
- `PR — artefato de aprendizado automático` (registry de conhecimento)
- `PR Title Contract` (validação de semântica)
- `PR auto-review (Codex + checklist)` (revisão automática)
- `Pipeline — Telegram + Painel` (notificação)
- `lupa-conformance` (aprovação Bayesiana)
- `codex-validate` (análise estática)
- `porta-de-entrada` (security gate)
- `🔐 CodeQL — análise semântica` (vulnerabilities)
- `Lupa Drift Guard` (drift detection)

### 3.2 Estados Possíveis
| Estado | Significado | Ação |
|--------|------------|------|
| `queued` | Aguardando fila de CI | Aguardar (polling) |
| `in_progress` | Executando | Aguardar (polling) |
| `completed` + `success` | ✅ Passou | Proceder merge |
| `completed` + `failure` | ❌ Falhou | Investigar + retry/fix |
| `completed` + `skipped` | ⊘ Saltado | Revisar regra CI |
| `completed` + `cancelled` | ⊘ Cancelado | Investigar |

### 3.3 Polling Inteligente
```bash
# NÃO usar loop infinito (bloqueia)
# NÃO usar polling < 30s (rate limit)
# Usar: check a cada 2min, timeout 30min máximo

prev=""
while true; do
  now=$(date +%s)
  if [ $((now - start)) -gt 1800 ]; then
    echo "TIMEOUT 30min"
    break
  fi
  
  # Fetch via MCP, não gh (mais confiável)
  status=$(mcp_check_pr_gates 1605)
  
  # Se tudo passou (conclusion = success)
  if echo "$status" | grep -q "completion.*success"; then
    echo "✅ GATES PASSED"
    break
  fi
  
  sleep 120
done
```

---

## 4. Merge Determinístico (One Writer Per Scope)

### 4.1 Preparação
```bash
# Verificar que branch ainda está sincronizado
git fetch origin
git log -1 --oneline main
git log -1 --oneline fix/branch

# Base deve ser idêntica ao registrado em PR body
# Se divergiu: investigar, não forçar
```

### 4.2 Squash Merge
```bash
# Opção A: via gh CLI (se disponível)
gh pr merge 1605 --squash --admin

# Opção B: via MCP admin_commit_main (determinístico)
mcp_admin_commit_main(
  sha_esperado=53d4d77,
  merge_sha=e7ca38e0,
  message="merge: PR #1605 — card visual admin [SQUASH]"
)

# Opção C: git nativo
git checkout main
git pull origin main
git merge --squash fix/admin-operational-flow-card-20260920
git commit -m "merge: PR #1605 — card visual"
git push origin main
```

### 4.3 Validação Pós-Merge
```bash
# Verificar que main avançou
git log main -1 --oneline

# Verificar que branch antiga foi limpa (opcional)
git branch -d fix/admin-operational-flow-card-20260920

# Registrar commit SHA em receipt
echo "MERGE_SHA=$(git rev-parse main)" >> /tmp/receipt-#1605.txt
```

---

## 5. Sincronização VPS ← GitHub

### 5.1 Pull Autorizado
```bash
# Na VPS, como root/pm2-user
cd /root/CentralDark

# Verificar estado
git status
git log -1 --oneline

# Pull clean
git pull origin main --rebase

# Validar que sem conflitos
if [ $? -ne 0 ]; then
  echo "❌ MERGE CONFLICT — investigar antes de prosseguir"
  exit 1
fi
```

### 5.2 Tratamento de Erro
Se pull falhar:
1. **Conflito:** `git diff`, `git mergetool`, resolver manualmente
2. **Rejeição de hooks:** investigar `.git/hooks/`, revisar lógica
3. **Stale ref:** `git fetch --all`, `git reset --hard origin/main`

---

## 6. Reload Cirúrgico (Restart PM2)

### 6.1 Owner MCP Específico
```bash
# NÃO fazer: pm2 restart all (arrasta tudo)
# Fazer: restart somente aplicável

pm2 list  # Identificar qual é MCP admin owner
pm2 restart mcp --silent

# Validar que subiu
sleep 2
pm2 describe mcp | grep "status"
```

### 6.2 Monitoramento Heartbeat
```bash
# Verificar que heartbeat lag volta ao normal
curl -s http://mcp:9100/heartbeat | jq .lag_ms

# Esperado: lag_ms < 10000 (10 segundos, não 1h39m)
```

---

## 7. Validação de Endpoints

### 7.1 Tripé Mínimo
```bash
# 1. Health básica
curl -I http://mcp:9100/health
# Esperado: 200 OK

# 2. Health profunda (sistema operacional)
curl -I http://mcp:9100/health/deep
# Esperado: 200 OK

# 3. Admin com novo card visual
curl -I http://mcp:9100/admin
# Esperado: 200 OK + visual do fluxo operacional
```

### 7.2 Rejeição de Falso Positivo
Se endpoint retornar 500 ou timeout:
1. Verificar PM2 logs: `pm2 logs mcp --lines 50`
2. Verificar estado operacional: `mcp_status`
3. Rollback se necessário (git revert, re-push, re-pull)

---

## 8. Geração de Snapshot Operacional

### 8.1 Captura
```bash
# Dispara contra endpoint novo
curl -s http://mcp:9100/admin/operational-snapshot > /tmp/snapshot-$(date +%s).json

# Validar JSON
jq . /tmp/snapshot-*.json > /dev/null || echo "❌ JSON inválido"

# Registrar SHA do snapshot
echo "SNAPSHOT_SHA=$(jq -r .commitSha /tmp/snapshot-*.json)" >> /tmp/receipt-#1605.txt
```

### 8.2 Validação de Conteúdo
```json
// Esperado no snapshot
{
  "timestamp": "2026-09-20T21:XX:XXZ",
  "commitSha": "53d4d77xxxxxxx",
  "operationalFlow": {
    "status": "ready",
    "endpoints": ["/health", "/health/deep", "/admin"],
    "pm2": { "online": 8, "offline": 0 },
    "heartbeat": { "lag_ms": <5000 }
  },
  "delta": {
    "files_changed": 1,
    "pr": 1605,
    "type": "CHILD_PROMOTION"
  }
}
```

---

## 9. Contraprova (Adversarial Validation)

### 9.1 Teste de Regressão
```bash
# Rodar suite de teste contra novo SHA
cd /root/CentralDark && npm test -- --testNamePattern="SAME_HEAD"

# Validar que nenhum regression
# Validar que novo endpoint responde
```

### 9.2 Comparação de Snapshots
```bash
# Snapshots antes e depois do merge devem ter:
# - Mesmo SHA de main (novo)
# - Mesmo lag_ms (heartbeat estável)
# - Mesmo PM2 count (nenhum process caído)
# - Delta registrado em operationalFlow

jq '.operationalFlow | {heartbeat_lag: .heartbeat.lag_ms, pm2_online: .pm2.online, sha: .commitSha}' snapshot-*.json
```

### 9.3 SAME_HEAD Validation No Novo SHA
```bash
# Rodar gates novamente contra main + novo commit
# Se todos passarem: ✅ CONTRAPROVA OK
# Se algum falhar: ❌ investigar divergência

gh workflow run .github/workflows/pr-auto-review.yml \
  --ref main \
  --field-name commit_sha=$(git rev-parse main)
```

---

## 10. FIXED_POINT Declaration

Quando **tudo** passou:
1. ✅ Gates SAME_HEAD: success
2. ✅ Merge: squash completo
3. ✅ VPS sync: clean pull
4. ✅ Endpoints: 200 OK
5. ✅ Snapshots: congruentes
6. ✅ Contraprova: SAME_HEAD re-validated

**Registrar:**
```bash
# Log oficial
echo "FIXED_POINT=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /tmp/receipt-#1605.txt
echo "GATES_PASSED=true" >> /tmp/receipt-#1605.txt
echo "MERGE_OK=true" >> /tmp/receipt-#1605.txt
echo "VPS_SYNCED=true" >> /tmp/receipt-#1605.txt
echo "ENDPOINTS_OK=true" >> /tmp/receipt-#1605.txt
echo "CONTRAPROVA_OK=true" >> /tmp/receipt-#1605.txt

# Notificar
send_telegram "✅ FIXED_POINT #1605 declarado. Deployment seguro, gates passaram, contraprova OK."

# Fechar pendência se houver
mcp_close_pendencia(titulo="PR #1605 deployment")
```

---

## 11. Regras Operacionais (Imutáveis)

```
MERGE_SQUASH=true
ONE_WRITER_PER_SCOPE=true
REUSE_BEFORE_CREATE=true
GATES_REQUIRED=SAME_HEAD
UNKNOWN_IS_NOT_PASS=true
REALITY_IS_JUDGE=true
NO_FORCE_PUSH_TO_MAIN=true (exceto rollback emergencial)
HEARTBEAT_LAG_ALERT_THRESHOLD=300000ms (5min)
POLLING_INTERVAL_MIN=120s (nunca < 30s)
POLLING_TIMEOUT_MAX=1800s (30min)
RESTART_PM2_OWNER_ONLY=true (nunca "all")
RECEIPT_BASED_DEDUPLICATION=true
```

---

## 12. Receitas Rápidas

### 12.1 Checklist Pré-Merge
- [ ] PR não é draft
- [ ] SAME_HEAD gates completaram com `success`
- [ ] Conteúdo é delta mínimo
- [ ] Body tem receipt de autorização
- [ ] VPS branch está clean
- [ ] Nenhum conflito em prévia

### 12.2 Checklist Pós-Merge
- [ ] `git log main -1` mostra novo commit (squashed)
- [ ] VPS `git pull` rodou clean
- [ ] PM2 restart completou
- [ ] Endpoints retornam 200
- [ ] Snapshot gerado + SHA registrado
- [ ] Contraprova re-rodou com sucesso
- [ ] Receipt-#1605.txt completo

### 12.3 Rollback de Emergência
Se detectar regressão depois de merge:
```bash
git revert HEAD --no-edit
git push origin main

# Notificar
send_telegram "⚠️ REVERT #1605 devido a regressão pós-merge"

# Investigar root cause
```

---

## 13. Integração com Hermes

Hermes deve aprender:
1. **Esse fluxo é determinístico** — não há guesswork
2. **Polling é a chave** — gates em queue é normal, aguardar com timeout
3. **One writer per scope** — evita race conditions
4. **Receipt-based dedup** — não replicar o que main já absorveu
5. **Snapshot é prova** — serve como contraprova automática

**Diretiva para próximas IAs:**
> Se encontrar PR com `Merge-Policy: SAME_HEAD_GATES_THEN_SQUASH`, aplique este fluxo. Não reinvente, reuse. Quando portas forem abertas (gates passed), execute determinístico: merge → sync → reload → validate → snapshot → contraprova → fixed_point.

---

## 14. Histórico e Origem

**Sessão:** 2026-09-20  
**PR inaugural:** #1605 (card visual admin operacional)  
**Deltas aprendidos:**
- 12 operational contracts PM2 (commitados sessão anterior)
- PERMITO SEGREDO policy (autorização global)
- Forensic sweep script (diagnóstico)
- Receipt-based PR linkage (deduplicação)

**Próximas instâncias:** 
Este fluxo será reusado em cada novo PR crítico que necessite gates, merge e deploy validado.

---

**Assinado:** SOL (Claude Haiku operacional)  
**Cristalização:** 2026-09-20T21:30:00Z  
**Versão:** 1.0  
**Status:** CANONIZADO — regra permanente da Casa

## 15. PR-MÃE #1562 — rendezvous permanente (“ponto turístico”)

A PR-MÃE `#1562` é fixa e não deve ser mergeada.

```text
PR_MOTHER_1562_ROLE=PERMANENT_RENDEZVOUS_LEDGER
PR_MOTHER_1562_DO_NOT_MERGE=true
CHILD_PRS_ARE_PROMOTION_VEHICLES=true
MAIN_IS_DESTINATION_OF_SURVIVING_DELTA=true
RECEIPTS_RETURN_TO_MOTHER=true
```

Filhos podem carregar deltas em diferentes níveis de maturidade. O funil aceita qualquer peça útil para teste; a `main` recebe somente o delta que sobrevive aos gates aplicáveis. Não esperar perfeição antes de experimentar.

```text
MVP → PR_FILHA → TESTE → CORREÇÃO → REMEDIÇÃO → SQUASH_MAIN → RECEIPT_#1562
```

Quando o CHEFE disser `REGISTRA`, a operação padrão é completar `commit → push → PR filha → remeasure → squash main → readback → receipt`, salvo blocker material ou fronteira humana inevitável.
