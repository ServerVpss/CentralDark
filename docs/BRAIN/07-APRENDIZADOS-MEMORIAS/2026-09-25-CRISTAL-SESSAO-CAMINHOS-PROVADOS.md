# 💎 Cristal da sessão — caminhos provados e receitas executáveis — 2026-09-25

Status: **SESSION_CRYSTAL_WITH_EXECUTABLE_PROVEN_PATH_REGISTRY**  
Authority: **SEGREDO/CHEFE**  
Start main for this seal: `8490556418ff9a7910a3ecd72b9a4de0e4ef9f88`  
Reality rule: **CURRENT > HISTORY · UNKNOWN != PASS · REALIDADE = JUDGE**

Este cristal não transforma histórico em runtime atual. Ele preserva critérios, caminhos reproduzíveis e fingerprints. O próximo executor deve carregar `PROVEN-CLAIMS.lock.json`, adaptar somente bindings declarados, executar a mesma sequência e comparar resultado/formato/efeito.

## Fórmula selada

```text
CAMINHO_JA_PROVADO
→ SELAR_RECEITA_EXECUTÁVEL
→ GUARDAR_FINGERPRINT
→ PRÓXIMO_EXECUTOR CARREGA A RECEITA
→ ADAPTA SOMENTE BINDINGS DO AMBIENTE
→ EXECUTA A MESMA SEQUÊNCIA
→ RODA A MESMA PROVA
→ COMPARA RESULTADO/FORMATO/EFEITO
→ DIVERGIU = DELTA NOVO
→ NÃO DIVERGIU = REUTILIZA CRISTAL
```

## Critérios completos preservados

0. **BOOT antes de mutar:** carregar owners canônicos, medir repo/Git root/remote/branch/HEAD/dirty/writer/runtime/tools/permissões/serviços/rotas/MCP/bridges/sensores.
1. **Leis de prova:** UNKNOWN != PASS; ACTION != PROOF; DOCUMENTED != EXECUTED; MERGED != DEPLOYED; EXISTS != RUNNING; QUEUED != PASS; TOOL_LISTED != TOOL_ACTIVE; TOOL_CATALOG_VISIBLE != TOOL_CALL_SUCCESS; CI_GREEN != ABSOLUTE_PROOF; PM2_ONLINE != MOTOR_SAUDAVEL; AUTOSTART != DEPLOY; MAPA != RUNTIME; BADGE_VISUAL != PROOF; HISTORY != CURRENT_STATE; SOURCE != RUNTIME; SINTOMA_SUMIU != CAUSA_RESOLVIDA.
2. **Casa:** WORKSPACE + SENSORS + DESKTOP + LOCAL_MCP + OPTIONAL_LOCAL_MODEL; Docker=SANDBOX_WORKLOAD_NOT_BRAIN; WSL=LINUX_EXECUTION_SURFACE_NOT_AUTHORITY; Git owners dão verdade estrutural e CURRENT runtime dá verdade operacional.
3. **REUSE_BEFORE_CREATE:** ONE_SYSTEM_ONLY; CONTINUE_BEFORE_RESTART; ABSORB_BEFORE_DUPLICATE; SEARCH_BEFORE_INVENT; ONE_OWNER_PER_CAPABILITY; ONE_WRITER_PER_SCOPE; PARALLELIZE_PERCEPTION; SERIALIZE_MUTATION; EVOLVE_SAME_OBJECT. Criar novo só com gap material provado e extensão insuficiente.
4. **Fato/hipótese/UNKNOWN:** cada claim registra source/observed_at/evidence/counterevidence/verdict; inferência não preenche lacuna.
5. **Tools L0→L5:** ATTACHED → CONTRACT → TOOL_CATALOG → TOOL_EXECUTION → STATE_READ → MUTATION; nenhum nível promove automaticamente o seguinte; CAPABILITY != AUTHORITY.
6. **Execução determinística:** intenção → contexto → CURRENT → inventário → reconciliação → reuse → owner → preflight/checkpoint/rollback → menor delta → executar → testar → provar → contraprovar → Reality Judge → remedir → receipt → NEXT_CURSOR → fixed point/blocker exato.
7. **Delta útil contínuo:** sem prova fica CANDIDATE/UNKNOWN; falha resolvível continua máquina-owned; mesma falha sem informação nova reutiliza cristal/no-change.
8. **Teste + contraprova:** exact target/SHA quando aplicável; efeito esperado; counterproof; no regression; CURRENT remeasurement; falha de contraprova reabre claim.
9. **Segurança/zero regressão:** no secret leak; no blind reset; no blind pull sobre dirty runtime; no force push sem autorização; no irreversível sem autorização; least privilege; segredo só por referência/cofre.
10. **MOTOR != ESTEIRA:** Hermes/PM2/runtime não é GitHub Actions/runner/deploy; PM2 online não prova motor saudável; deploy exige rota, execução, SHA, runtime e health.
11. **Micro-deploy causal:** PASS comprovado → micro-deploy do escopo afetado → runtime health/proof → receipt #1562 → NEXT_TIK_TAK; DOC_ONLY pode ser NOT_APPLICABLE.
12. **TIK-TAK:** estado mudou → prova antiga expira → remedir → gates afetados → contraprovar novo HEAD/runtime → só então verde.
13. **Promoção CURRENT:** CURRENT_MAIN → REUSE_PROVEN → OWNER → DELTA_MINIMO → prova/contraprova → segurança mínima → remeasure main → commit conforme modo vigente → main readback → deploy causal → T1 → novidade → #1562 → NEXT_CURSOR.
14. **PR-mãe #1562:** ledger/rendezvous append-only, não mergear; toda novidade material PASS/FAIL/UNKNOWN/BLOCKED/STALE entra com evidência e NEXT_CURSOR; segredo nunca entra.
15. **Fronteira humana:** só login/MFA/consentimento/segredo em local seguro/pagamento/concessão administrativa/ação física/nova intenção/decisão humana inevitável; pedir uma ação exata e auto-resumir depois.
16. **Falha localizável:** host/componente/service/file/line/function/step/error/return code/state/cause/routes attempted/auto-fix/who resolves/exact action/resume condition/next automatic action. Erro genérico é inválido.
17. **Fixed Point Casa:** somente objective_met + applicable_gates_pass + material_unknown=0 + material_blocker=0; provar perfis/rotas aplicáveis; delta material continua, sem delta novo = NO_CHANGE_WAIT_FOR_EVENT.
18. **Métricas:** HEALTH/PROOF_SCORE/PROGRESS/PERCENT só com denominador medido; denominator unknown → metric UNKNOWN.
19. **Receipt final:** PROVADO/QUEBRADO/UNKNOWN/EVIDENCIA_FALTANTE/DELTA/START_HEAD/COMMIT/MAIN/DEPLOY/DEPLOYED_SHA/RUNTIME_SHA/FINAL_HEAD/HEAD_CHANGED/EXECUTOR/TESTS/COUNTERPROOF/NO_REGRESSION/SECRET_EXPOSED/FIXED_POINT/PENDENCIA/RISCO/ROLLBACK/PR_MOTHER/NEXT_CURSOR.
20. **Regra final:** MENOS_E_MAIS; PAPAGAIO_OFF; NO_PARALLEL_ARCHITECTURE; NO_FALSE_GREEN; NO_MICROMANAGEMENT quando a máquina resolve. CHEFE=intenção; SOL=coordenação; HERMES=execução; MCP/tools=mãos; Git=registro; runtime=demonstração; REALIDADE=juiz.

## Caminhos provados nesta sessão e agora selados no registry

### 1. Tailscale VPS → Windows SEGREDO
CURRENT remeasurement: `tailscaled=active`; peer `segredo` presente; 3/3 pings via DERP(sao); TCP/3389 OPEN. Conexão direta P2P não foi estabelecida e não é inventada como PASS.

### 2. Tailscale Network Flow Logs
Credencial existente foi reutilizada por referência, sem expor valor. A leitura `/api/v2/tailnet/-/logging/network` respondeu HTTP 200 no CURRENT e envelope `logs` foi parseado.

### 3. Tailscale tools no MCP — prova de source da PR #1691
No HEAD exato `3a07f200ad03972500ebce42d4b5107fafab69b6`: syntax PASS, 16/16 testes targeted PASS, catálogo source 130 tools, 4 `tailscale_*` read-only/non-destructive, chamadas live HTTP 200. **Isto NÃO sela deploy/runtime**.

### 4. Diagnóstico do micro-deploy autônomo
O caminho de diagnóstico separa trigger, fila/runner, gate e deploy runtime. Nesta sessão o trigger automático foi provado; a falha histórica determinística foi `GIT_EPHEMERAL_AUTH_MISSING` no gate antigo; no CURRENT do seal o deploy do main `8490556418ff9a7910a3ecd72b9a4de0e4ef9f88` está QUEUED e a amostra de fila caiu para 42. **QUEUED != PASS**.

### 5. HUD/RUDY híbrido — prova de source da PR #1691
H01..H16 preservam identidade/ordem; MCP OU repo é gatilho suficiente no source contract; só status/evidência/% mudam. **PR source PASS não é main/deploy/handshake runtime PASS**.

### 6. Live Execution Fabric público
CURRENT: quatro probes status/graph em `api.centralldark.com` e `admin.centralldark.com` retornaram HTTP 200.

### 7. MCP runtime
CURRENT: `/health`, `/health/deep`, `/tools.json` = HTTP 200; versão 0.4.0; toolCount 126; deep status healthy score 100.

## Não selado como PASS final

- Windows Remote Desktop Commander: devices SEGREDO permanecem offline no último sensor disponível.
- Windows Runner: não provado nesta cristalização.
- HUD/RUDY #1691: não está em main/deploy.
- Tailscale MCP tools #1691: source-only; runtime público ainda 126.
- Canonical deploy do CURRENT: queued no momento do seal.
- PROVEN_PATH_REPLAY engine: self-test dedicado PASS, mas a suíte completa `test_centraldark_full_trigger_boot.py` encontrou ASSERT em herança de runtime-preflight no operational method; portanto **FULL_SUITE_PASS não é alegado**.
- GLOBAL_FIXED_POINT: não alegado.

## Fingerprint / replay

`PROVEN-CLAIMS.lock.json` é o registry executável. Cada claim guarda `lock_key`, `dependency_fingerprint`, comandos/sequência, prova, efeito esperado, bindings e self-test. O executor usa:

```text
FINGERPRINT IGUAL
→ REUSE_PROVEN_PATH_NO_RETHINK
→ adaptar somente bindings
→ mesma prova
→ comparar schema/efeito

FINGERPRINT DIFERENTE
→ REVALIDATE_AFFECTED_CONE_ONLY
→ DELTA NOVO
→ contraprova
→ reseal se sobreviver
```

## NEXT_CURSOR

`REPLAY_REGISTRY_SELF_TEST → REGISTER_RECEIPT_#1562 → TIK_TAK_CURRENT → resolver somente blockers atuais sem reabrir cristais equivalentes`.


## T1 runtime — tentativa de replay na VPS após cristalização

Observed at: `2026-09-25T10:40Z`  
Surface: `vmi3256920:/root/CentralDark`

A primeira tentativa de carregar/revalidar a receita no corpo vivo da VPS foi executada sem mutar o worktree.

```text
LOCAL_HEAD=1df94e30ac0f0313edcc760db9e4789104772342
DIRTY_COUNT=104
GITHUB_MAIN=95db8435602506026eef9214ef35e4716a473b23
FETCH_ORIGIN_MAIN=BLOCKED
ERROR=could not read Username for 'https://github.com'
```

Classificação:

```text
CURRENT_MAIN_CRYSTAL=PROVED_IN_GITHUB
VPS_CURRENT_RECIPE_LOAD=BLOCKED_GIT_AUTH
VPS_WORKTREE_DIRTY=true
BLIND_PULL_RESET_CLEAN=FORBIDDEN
RUNTIME_REPLAY_PASS=NOT_CLAIMED
GLOBAL_FIXED_POINT=NOT_CLAIMED
```

Aplicação da própria lei do cristal:

```text
DIVERGIU
→ DELTA_NOVO=VPS_GIT_AUTH_BINDING
→ INVALIDAR SOMENTE O CONE DEPENDENTE
→ PRESERVAR O CRISTAL E OS 104 DELTAS LOCAIS
→ REPARAR/REUTILIZAR BINDING DE AUTENTICAÇÃO EXISTENTE
→ CARREGAR A MESMA RECEITA EM WORKTREE ISOLADO
→ RODAR O MESMO SELF-TEST
→ COMPARAR SCHEMA/EFEITO
```

Este blocker é de **binding do ambiente**, não motivo para reabrir ou reinterpretar os caminhos já selados.

## T2 runtime — replay corrigido, commit mínimo e receipt obrigatório

Observed at: `2026-09-25T16:39-03:00`  
Surface: `vmi3256920:/root/CentralDark`  
Linked ledger: `#1562`  
Commit provado: `e3ff925e6b27c0583af30f65b505c386663732b5`

A divergência T1 foi confirmada como **binding Git do ambiente**, não falha da receita nem motivo para redesenhar arquitetura.

```text
BLOCKER_T1=git/https sem credential helper no shell remoto
FIX_BINDING=gh auth setup-git
NO_BLIND_PULL_ON_DIRTY_TREE=true
NO_FORCE_PUSH=true
WORKTREE_CLEAN_FROM=origin/main
MUTATION_SCOPE=apps/modulos/mcp/src/admin.js + apps/modulos/mcp/dist/admin.js
COMMIT=e3ff925e6b27c0583af30f65b505c386663732b5
PUSH=main
```

Sequência executável obrigatória para repetir este caminho:

```text
CAMINHO_JA_PROVADO
→ medir auth/remoto/main/local/dirty
→ se conector cair, tentar reconectar/relogin/helper/túnel antes de declarar bloqueado
→ se VPS estiver suja ou atrás da main, NÃO dar pull cego
→ criar worktree limpa de origin/main
→ copiar somente owners afetados já provados no runtime
→ rodar sintaxe/prova aplicável
→ commit mínimo
→ push normal sem force
→ receipt no GitHub (#1562 ou PR filho equivalente)
→ reexecutar a mesma prova HTTP/API/UI
→ comparar resultado/formato/efeito
→ divergiu = delta novo
→ não divergiu = reutiliza cristal
```

Prova pós-push:

```text
/omni → HTTP 302 → /admin?tab=omni
/admin?tab=omni → HTTP 200
/api/omni/status → HTTP 200
SECRET_EXPOSED=false
FORCE_PUSH=false
VPS_DIRTY_TREE_CARRIED=false
```

Contrato operacional obrigatório para E:/CentralDark e VPS:

```ini
CENTRALDARK_EXECUTION_CONTRACT=MANDATORY
EVERY_CHANGE_ON_E_MUST_BE_MEASURED=true
EVERY_CHANGE_REQUIRES_TEST=true
EVERY_CHANGE_REQUIRES_COUNTERPROOF=true
EVERY_CHANGE_REQUIRES_GIT_RECEIPT=true
NO_UNRECORDED_LOCAL_CHANGE=true
NO_CLAIM_WITHOUT_EVIDENCE=true
NO_PUSH_WITHOUT_VALIDATION=true
NO_SECRET_IN_GIT=true
FAILURE_MUST_BE_LOCALIZED=true
NO_DIRECT_MAIN_WITHOUT_EXPLICIT_AUTHORIZATION=true
PR_MOTHER_OR_CHILD_RECEIPT_REQUIRED=true
CONNECTOR_DROP_RETRY_RELOGIN_OR_TUNNEL_BEFORE_BLOCKED=true
UNTRACKED_IMPORTANT_GENERATES_ALERT_NOT_DELETE=true
```

Classificação:

```text
DIVERGIU_ANTES=DELTA_NOVO:VPS_GIT_AUTH_BINDING
FIX_APLICADO=PASS
REPLAY_WORKTREE_LIMPA=PASS
GIT_RECEIPT=PASS
RUNTIME_PROOF=PASS
NÃO_DIVERGIU_DEPOIS=REUTILIZA_CRISTAL
```



## T3 — contrato obrigatório levado ao runtime de governança

Observed at: `2026-09-25T16:45-03:00`

O cristal deixou de ser somente memória/receipt e passou a ter superfícies de enforcement no GitHub:

```text
AGENTS.md
→ regra obrigatória da Casa

scripts/hooks/pre-commit.centraldark-execution-contract.sh
→ hook local instalável para E:\CentralDark e clones autorizados

.github/workflows/centraldark-execution-contract.yml
→ CI que bloqueia remoção/acidente do contrato

docs/CONSCIENCIA/EXECUCAO/CENTRALDARK-EXECUTION-CONTRACT.md
→ receita executável e auditável
```

Regra selada:

```text
CAMINHO_JA_PROVADO
→ SELAR_RECEITA_EXECUTÁVEL
→ GUARDAR FINGERPRINT
→ PRÓXIMO EXECUTOR CARREGA A RECEITA
→ ADAPTA SOMENTE BINDINGS DO AMBIENTE
→ EXECUTA A MESMA SEQUÊNCIA
→ RODA A MESMA PROVA
→ COMPARA RESULTADO/FORMATO/EFEITO
→ DIVERGIU = DELTA NOVO
→ NÃO DIVERGIU = REUTILIZA CRISTAL
```

Queda de conector vira tentativa de recuperação, não abandono:

```text
CONNECTOR_DOWN_ONCE
→ RETENTAR
→ RELOGIN/HELPER
→ TUNEL/SENSOR AUTORIZADO EXISTENTE QUANDO APLICÁVEL
→ BLOCKED SOMENTE COM CAUSA LOCALIZADA
```

Conclusão: `LOCAL_ONLY_CHANGE_FORBIDDEN=true`; mudança material deve terminar em commit/push/receipt no #1562 ou PR filho equivalente, salvo blocker localizado.

## T4 — fixed point vivo da Casa via Tailscale + RDC online

Observed at: `2026-09-25T18:34-03:00`

CURRENT medido por dois sensores independentes:

```text
REMOTE_DESKTOP_COMMANDER_DEVICE=SEGREDO
RDC_STATUS=ONLINE
TAILSCALE_SEGREDO_IP=100.123.93.25
VPS_TAILSCALE_PING=PASS
VPS_TO_SEGREDO_TCP_3389=OPEN
VPS_TO_SEGREDO_TCP_22=CLOSED_OR_FILTERED
VPS_TO_SEGREDO_TCP_9100=CLOSED_OR_FILTERED
VPS_TO_SEGREDO_TCP_8098=CLOSED_OR_FILTERED
VPS_TO_SEGREDO_TCP_3030=CLOSED_OR_FILTERED
VPS_TO_SEGREDO_TCP_3000=CLOSED_OR_FILTERED
VPS_TO_SEGREDO_TCP_8080=CLOSED_OR_FILTERED
VPS_TO_SEGREDO_TCP_8787=CLOSED_OR_FILTERED
VPS_TO_SEGREDO_TCP_9000=CLOSED_OR_FILTERED
```

Contraprova aplicada:

```text
RDP_OPEN != HOST_FULLY_EXPOSED
CLOSED_OR_FILTERED != SERVICE_STOPPED
RDC_ONLINE + TAILSCALE_PING_PASS + TCP_3389_OPEN
→ CASA_ACESSIVEL_PELA_VPS=PASS
→ CORREDOR_PROVADO=VPS → TAILSCALE → SEGREDO → RDP/RDC
```

Delta material em relação ao cristal anterior:

```text
ANTES: Windows Remote Desktop Commander = OFFLINE/UNKNOWN
AGORA: SEGREDO RDC = ONLINE
DIVERGENCE=RDC_RUNTIME_STATE_CHANGED
ACTION=REVALIDATE_AFFECTED_CONE_ONLY
RESULT=PASS
```

Receita executável para replay:

```text
1. tailscale ping 100.123.93.25
2. provar pelo menos um canal real de entrada da Casa
3. medir portas relevantes a partir da VPS
4. não inferir serviço parado a partir de CLOSED_OR_FILTERED
5. confirmar RDC/agent local como segundo sensor quando disponível
6. comparar resultado/formato/efeito com este T4
7. se iguais → REUTILIZA_CRISTAL
8. se divergirem → DELTA_NOVO e revalidar somente o cone afetado
```

NEXT_CURSOR:

`preservar Tailscale como espinha; evoluir serviços/bridges por cima; não reabrir arquitetura-base enquanto fingerprint e provas deste T4 permanecerem equivalentes`.

