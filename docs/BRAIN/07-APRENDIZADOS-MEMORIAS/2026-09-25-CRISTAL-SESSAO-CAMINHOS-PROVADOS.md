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
