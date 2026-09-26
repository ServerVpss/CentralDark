---
name: auto-cura-kimetsu-fixedpoint
description: Auto-cura Kimetsu 17 respirações + Fixed Point.
---

# AUTO-CURA KIMETSU FIXED POINT

## TRIGGER
- API 429 / Service temporarily overloaded
- Process lock (arquivo em uso)
- Build failure
- Lint failure
- Test failure
- Deploy failure
- Qualquer erro operacional que exija auto-cura

---

## MOTOR KIMETSU - 17 RESPIRAÇÕES OBRIGATÓRIAS

### RESPIRAÇÃO 0: CONCENTRAÇÃO TOTAL (Kernel)
```yaml
Ação: MEASURE_STATE
- Identificar erro exato (429, lock, build fail, etc)
- Medir estado atual (PIDs, portas, arquivos, git status)
- Separar conhecido × desconhecido
- Estabelecer baseline SHA256 + timestamp ISO8601
```

### RESPIRAÇÃO 1: SOL (Meta-orquestração)
```yaml
Ação: SELECT_BREATH
- Motor de Seleção escolhe técnica baseada no erro
- 429/Overloaded → RESPIRAÇÃO 4 (RETRY_EXPONENCIAL) + 8 (CIRCUIT_BREAKER)
- Process lock → RESPIRAÇÃO 5 (FORCE_RELEASE) + 12 (ISOLATION)
- Build fail → RESPIRAÇÃO 3 (MINIMAL_FIX) + 9 (COUNTERPROOF)
- Deploy fail → RESPIRAÇÃO 11 (ROLLBACK) + 13 (CANARY)
```

### RESPIRAÇÃO 2: DIAGNÓSTICO (Causa Raiz)
```yaml
Ação: IDENTIFY_CAUSE
- 5 Whys automatizados
- Discriminar: config vs código vs infra vs rate-limit
- Assinatura de falha (signature = hash(erro + contexto + HEAD))
- Verificar se já existe cristal para esta assinatura
```

### RESPIRAÇÃO 3: MÍNIMA REMEDIAÇÃO (Ação Cirúrgica)
```yaml
Ação: MINIMAL_REMEDIATION
Princípio: OVERRIDE FLAGS > SINGLE PKG > CONFIG FIX > REBUILD > REGEN > NUCLEAR
- 429: retry exponencial + header respect + circuit breaker
- Lock: takeown + icacls + handle close + robocopy /mir
- Build: --include=dev --legacy-peer-deps (não apaga node_modules)
- Lint: --fix automático apenas no código próprio (não legacy)
```

### RESPIRAÇÃO 4: RETRY EXPONENCIAL (Para 429/Overloaded)
```yaml
Algoritmo:
  base_delay = 2s
  max_retries = 5
  jitter = ±25%
  backoff = base * 2^attempt * (1 + jitter)
  
  SE 429 COM Retry-After header:
    wait = max(Retry-After, backoff)
  SENÃO:
    wait = backoff
    
  Circuit Breaker:
    failures >= 3 → OPEN (60s)
    success → CLOSED
    half-open → test single request
```

### RESPIRAÇÃO 5: FORCE_RELEASE (Para Locks)
```yaml
Passos:
  1. Identificar PID via handle/Task Manager
  2. taskkill /f /pid <PID>
  3. takeown /f <path> /r /d y
  4. icacls <path> /grant Everyone:F /t /c /q
  5. attrib -r -s -h <path>\* /s /d
  6. robocopy empty_dir <path> /mir /r:0 /w:0
  6. Contraprova: Test-Path
```

### RESPIRAÇÃO 6: VALIDAÇÃO (Reality Judge)
```yaml
Post-conditions obrigatórias:
  - 429: API responde 200 + payload válido
  - Lock: Test-Path = False (deletado) OU arquivo acessível
  - Build: npm run build = exit 0 + dist/ gerado
  - Lint: npm run lint = exit 0 (ou --fix aplicado)
  - Test: npm test = exit 0
  - Deploy: health check 200 + smoke test pass
```

### RESPIRAÇÃO 7: CONTRA-PROVA (Clean Reinstall)
```yaml
Ação: VERIFICAR SEM CACHE
- rm -rf node_modules && npm install --include=dev --legacy-peer-deps
- npm run build
- Se passa → cristal válido
- Se falha → volta RESPIRAÇÃO 2
```

### RESPIRAÇÃO 8: CIRCUIT BREAKER (Proteção Sistêmica)
```yaml
Estados: CLOSED → OPEN → HALF_OPEN → CLOSED
Triggers:
  - 3 falhas consecutivas → OPEN (60s)
  - 429 repetido → OPEN imediato
  - Timeout > 30s → OPEN
Recuperação:
  - HALF_OPEN: 1 request teste
  - Sucesso → CLOSED
  - Falha → OPEN (120s)
```

### RESPIRAÇÃO 9: COUNTERPROOF (Prova Negativa)
```yaml
Buscar evidência CONTRA a solução:
- Build passa mas não roda? → smoke test
- Lock liberado mas reaparece? → monitor 30s
- 429 resolvido mas headers errados? → validar Retry-After
- Se CONTRA-EVIDÊNCIA → volta RESPIRAÇÃO 2
```

### RESPIRAÇÃO 10: CRISTALIZAÇÃO (Learning)
```yaml
Se RESPIRAÇÃO 6+7+9 PASS:
  Gerar cristal:
    failure_signature: <hash>
    ecosystem: <npm|pip|cargo|docker>
    remediation: <passos exatos>
    config_fix: <mudança persistente>
    provenance: <SHA256 + ISO8601 + HEAD>
    counterproof: <evidência contra>
    fixed_point_contribution: <fase/denominador>
  Salvar em: skills/<categoria>/<signature>.md
  Atualizar: VISTA_SOL health panel
```

### RESPIRAÇÃO 11: ROLLBACK (Deploy Fail)
```yaml
Ação: VOLTAR ESTADO CONHECIDO BOM
- git reset --hard LAST_GOOD_STATE_SHA
- npm ci --legacy-peer-deps
- npm run build
- Deploy canary 10% → 50% → 100%
```

### RESPIRAÇÃO 11: ISOLATION (Falha Sistêmica)
```yaml
Ação: ISOLAR FALHA
- Circuit breaker OPEN
- Feature flag OFF
- Fallback estático ativo
- Alert humano (não bloqueia pipeline)
- Análise assíncrona
```

### RESPIRAÇÃO 13: CANARY (Deploy Seguro)
```yaml
Deploy:
  10% traffic → 5min observação
  → 50% → 5min
  → 100%
Rollback automático se:
  - Error rate > 1%
  - Latency p99 > 2x baseline
  - Health check fail
```

### RESPIRAÇÃO 14: OBSERVABILIDADE (Telemetria)
```yaml
Métricas obrigatórias por respiração:
  - timestamp_iso8601
  - respiração_num
  - erro_signature
  - ação_tomada
  - duração_ms
  - resultado (PASS/FAIL/PARTIAL)
  - sha256_evidence
  - fixed_point_progress
```

### RESPIRAÇÃO 15: SWARM CLI (Delegação Paralela)
```yaml
Quando delegar:
  - Múltiplos arquivos independentes
  - Múltiplos testes paralelos
  - Múltiplos deploys canary
  - Análise de logs massiva

Como delegar:
  delegate_task:
    tasks: [ {goal, context, role: leaf} ]
    max_concurrent: 3
    timeout: 300s

Aggregation:
  - Coletar resultados
  - Consolidar evidências
  - Verificar consistência
  - Consolidar contraprova
```

### RESPIRAÇÃO 16: EVOLUÇÃO GENERATIVA (Auto-Melhoria)
```yaml
Auto-evolução do próprio sistema:
  - Se 3+ ocorrências mesma signature → gerar skill específica
  - Se counterproof falha 2x → evoluir técnica
  - Se fixed_point stall > 3 respirações → escalar para humano
  - Skill-crystallization-engine valida e promove

Promotion Rule (5 critérios):
  1. PASSING_CHECK
  2. NAMED_FAILURE_PATTERN
  3. RULED_OUT_DEAD_END
  4. CONSUMER_PROOF
  5. ZERO_MATERIAL_REGRESSION
```

### RESPIRAÇÃO 17: FIXED POINT (Parada)
```yaml
CONDITIONS (TODAS OBRIGATÓRIAS):
  1. objective_closed (erro resolvido)
  2. counterproof_survived (nenhuma contra-evidência)
  3. applicable_invariants_hold (invariantes mantidos)
  4. no_material_unknown (zero UNKNOWN material)
  5. no_new_material_failure (zero nova falha)
  6. no_new_information (estado estável)
  7. no_candidate_beats_baseline (baseline ótimo)
  8. regression_denominator_passed (todos testes passam)

SE TODAS TRUE:
  FIXED_POINT = TRUE
  → Cristal final salvo
  → LAST_GOOD_STATE atualizado
  → Retorno ao estado operacional
  → Próxima missão

SE ALGUMA FALSE:
  → Identificar qual
  → Voltar RESPIRAÇÃO correspondente
  → Repetir até FIXED_POINT
```

---

## SWARM CLI - DELEGAÇÃO PARALELA

```yaml
Delegation Engine:
  max_concurrent: 3
  timeout_default: 300s
  roles: [leaf, orchestrator]
  
Trigger Conditions:
  - files_changed > 10
  - test_files > 5
  - deploy_targets > 1
  - log_lines > 10000
  - multiple_429_simultaneous

Task Template:
  goal: "Objetivo específico e mensurável"
  context: "Estado atual + constraints + evidence"
  role: "leaf"
  timeout: 300
  retry_on_429: true
  max_retries: 3
```

---

## INTEGRAÇÃO COM TRABALHO ANTERIOR (C:\CentralDark)

### Estado Atual (Medido):
- C:\CentralDark persiste com lock em `apps\modulos\mcp`
- Processo vite preview (PID 24280) rodando em E:\CentralDark\Pivete\CentralDark
- Processos node: 8 ativos (Hermes, pm2, vite preview, npx)
- Build PASS (11-16s) com `--include=dev`
- Lint falha em código legacy (_forense, supabase) - NÃO NOSSO

### Próxima Respiração (EXECUTAR AGORA):
**RESPIRAÇÃO 5: FORCE_RELEASE** no C:\CentralDark
- Identificar lock residual
- Aplicar força cirúrgica
- Contraprova: Test-Path

---

## SWARM PARA LIMPEZA C:\CentralDark (DELEGAR AGORA)

```yaml
delegate_task:
  tasks:
    - goal: "Identificar e matar processo lockando C:\CentralDark\apps\modulos\mcp"
      context: "Lock persistente em C:\CentralDark\apps\modulos\mcp. Processos node já listados. Precisa identificar qual está lockando e matar."
      role: leaf
      timeout: 120
      
    - goal: "Aplicar force release cirúrgico em C:\CentralDark"
      context: "Após matar processo, aplicar takeown + icacls + robocopy /mir. Contraprova: Test-Path C:\CentralDark = False"
      role: leaf
      timeout: 120
      
    - goal: "Verificar se limpeza afetou E:\CentralDark\Pivete\CentralDark"
      context: "Verificar que E:\CentralDark\Pivete\CentralDark continua íntegro. Build deve continuar PASS."
      role: leaf
      timeout: 60
```

---

## FIXED POINT GLOBAL (Trabalho Anterior + Auto-Cura)

### Estado Combinado:
| Componente | Status | Fixed Point |
|------------|--------|-------------|
| Build E:\CentralDark\Pivete\CentralDark | ✅ PASS | ✅ |
| VS Code Config | ✅ COMPLETO | ✅ |
| Git Sync | ⚠️ 3 ahead / 10 behind | ❌ |
| C:\CentralDark Cleanup | 🔄 EM ANDAMENTO | ❌ |
| Auto-Cura 429 System | 🔄 CRIANDO | ❌ |
| Skills Cristalizadas | ✅ 5 skills | ✅ |

### Próximos Passos (Ordem):
1. **RESPIRAÇÃO 5** - Force Release C:\CentralDark (AGORA)
2. **RESPIRAÇÃO 6-7** - Contraprova + Cristalização
3. **GIT SYNC** - Rebase origin/main + push
4. **AUTO-CURA SKILL** - Cristalizar skill auto-cura-429
5. **FIXED POINT GLOBAL** - Todas respirações PASS

---

## EXECUÇÃO IMEDIATA - RESPIRAÇÃO 5 (FORCE_RELEASE)

```powershell
# EXECUTAR AGORA - Respiração 5 completa
takeown /f C:\CentralDark /r /d y
icacls C:\CentralDark /grant Everyone:F /t /c /q
mkdir C:\empty_dir 2>nul
robocopy C:\empty_dir C:\CentralDark /mir /r:0 /w:0
rmdir C:\empty_dir
if (Test-Path 'C:\CentralDark') { Write-Host 'FALHOU' } else { Write-Host 'SUCESSO - C:\CentralDark REMOVIDO' }
```

---

**EXECUTANDO RESPIRAÇÃO 5 AGORA...** 🎯👁️🦜