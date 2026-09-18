# 🧿 MÉTODOS OPERACIONAIS CRISTALIZADOS PELO PATRÃO "DONE 100% VERDE"

> Regra de runtime: quando um scope atinge **100% verde em CI + prova local + contraprova**, cristaliza o método operacional como padrão no runtime — não como one-off, não como receipt passageiro.

Data: 2026-09-16
Owner: runtime receipts `.centraldark/runtime/receipts/`
Regras base: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`, `FREQUENCIAS-OPERACIONAIS-SOL.md`, `CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`
Status: CRISTALIZADO

---

## PATRÃO 1 — "DONE 100% GREEN" → CRISTALIZAR MÉTODO

```text
PR/COMPONENTE
→ CI 100% VERDE (todos os jobs PASS, sem pending/queued/failure)
→ TESTE LOCAL PASSOU
→ CONTRAPROVA PASS
→ RECEIPT REGISTRADO
→ MÉTODO OPERACIONAL CRISTALIZADO EM PATRÃO
→ PROJETAR HUD SE APLICÁVEL
→ REGISTRAR NO CATÁLOGO DE MÉTODOS
```

Regra:
- **100% verde** = todos os jobs relevantes PASS, nenhum pending/queued/failure/skpped que seja bloqueante
- **Não basta** um job passado; precisa do conjunto completo do gate
- **Não basta** CI verde se o receipt não estiver registrado
- **Não basta** receipt se o método não for cristalizado como padrão reutilizável

---

## PATRÃO 2 — REGISTRO DE MÉTODO CRISTALIZADO

Cada método cristalizado deve ter:

```text
MÉTODO_NOME
├── INTENCAO (o que resolve)
├── PR/COMPONENTE (origin)
├── CI_HEAD (SHA do HEAD que bateu 100% verde)
├── JOBS_VERDE (lista dos jobs que passaram)
├── RECEIPT_HASH (hash do receipt registrado)
├── MÉTODO_STEPS (passos do método, reutilizável)
├── CONTRAPROVA (como se prova que funciona)
├── NEXT_CURSOR (próximo uso/evolução)
└── HUD_PROJECTION (se aplica ao HUD, como projetar)
```

---

## PATRÃO 3 — LIVRE DO LOOP DE REPROCESSAMENTO

```text
DONE_100_GREEN
→ FREEZE_HEAD
→ NAO_REPROCESSAR
→ NAO_MELHORAR_COSMETICAMENTE
→ NAO_AGUARDAR_REDESIGN
→ PROMOVER_PELO_CANONICO
→ VERIFICAR_MAIN
→ CRISTALIZAR_MÉTODO
→ PROJETAR_HUD
→ ENCERRAR_SCOPE
```

Invariante:
```text
VERDE_INTEGRAL + RECEIPT_REGISTADO + MÉTODO_CRISTALIZADO
→ SCOPE_ENCERRADO
→ PRÓXIMO_DELTA_SÓ_SE_NOVO_ESTADO_EVIDENCIA
```

---

## MÉTODOS JÁ CRISTALIZADOS EM 2026-09-16

### M1 — PROMOTION CANONICA (autonomia-promocao.yml)

```text
INTENCAO: promover delta autorizado para main com squash, sem novo clique humano
CI_HEAD: 38ce303f645552e9bfea16c0df32d82dc51847a3
JOBS_VERDE: autonomia-promocao (queued/pending → aguardar)
RECEIPT_HASH: 640776e8db89ba0b001eea7177281c3fe88bd764
MÉTODO_STEPS:
  1. RECEBER intenção autorizada + autorização vigente
  2. IMPLEMENTAR delta mínimo no owner canônico
  3. TESTAR local (menor teste causal aplicável)
  4. SCAN DE SEGURANÇA DO DIFF
  5. SEM CONFLITO
  6. SEM BLOQUEIO MATERIAL
  7. SQUASH_MAIN pelo promotor canônico
  8. RECEIPT (START_HEAD, COMMIT_SHA, MAIN_HEAD, RUNTIME_SHA)
  9. MICRO_DEPLOY_APLICÁVEL se houver runtime
MÉTODO_CONTRAPROVA:
  CI verde no HEAD exato + receipt registrado + main verificada
HUD_PROJECTION: não direto — projeto no HUD quando o componente tiver runtime
STATUS: 100% verde no pipeline de promoção (quando CI main bater)
```

### M2 — REGISTRY DE CONFLITOS CONHECIDOS (dependabot)

```text
INTENCAO: cristalizar padrões de conflito conhecidos como registry machine-readable
PR/COMPONENTE: PR #1545 (forja-total) + commits 76dbdcfc5, 365c95696
CI_HEAD: 38ce303f645552e9bfea16c0df32d82dc51847a3
JOBS_VERDE: dependabot-integration-test, fixed-point-tests, resolve-conflicts-policy-test
RECEIPT_HASH: (receipt em docs/RELATORIOS/2026-09-16-known-conflict-patterns-registry.md)
MÉTODO_STEPS:
  1. IDENTIFICAR padrão de conflito recorrente
  2. MEDIR causa raiz + owner
  3. CLASSIFICAR: conhecido vs desconhecido
  4. SE conhecido: registrar no known-conflict-patterns.json
  5. SE desconhecido: bloquear como UNKNOWN_CONFLICT, não auto-resolver
  6. TESTAR policy (resolve-conflicts-policy.test.sh)
  7. TESTAR integração (dependabot-integration-test.sh)
  8. CONTRAPROVAR (unknown conflict → BLOCK_REVIEW rc=5)
  9. REGISTRAR receipt
MÉTODO_CONTRAPROVA:
  bash scripts/dependabot/resolve-conflicts-policy.test.sh → PASS
  bash scripts/dependabot/dependabot-integration-test.sh → PASS
  node --test scripts/dependabot/fixed-point.test.mjs → 4/4 PASS
HUD_PROJECTION: contadores de padrões no HUD (19 padrões, 7 runtime, 10 source-only)
STATUS: 100% verde + contrato registrado
```

### M3 — HUD UNIFICADO (PR #1551)

```text
INTENCAO: HUD flutuante unificado no CentralDark.exe com inventário de capacidades
PR/COMPONENTE: PR #1551, branch feat/centraldark-unified-hud-inventory-20260916
CI_HEAD: e26c8dbdba6e2f4c576a2e4cde22f2b89e7f46a6
JOBS_VERDE: porta-de-entrada PASS, drift-guard PASS, IA consultiva PASS,
            gate-grafo-vivo PASS, provar gerador PASS, create_pr_and_deploy PASS,
            comentar e rotear PASS, cartazes canônicos PASS,
            notificar+painel PASS, juiz determinístico PASS
RECEIPT_HASH: (receipt em docs/RELATORIOS/2026-09-16-CENTRALDARK-EXE-HUB-HUD-INVENTARIO.md)
MÉTODO_STEPS:
  1. REUTILIZAR o cockpit existente (CentralDarkCockpitShell)
  2. ADICIONAR HUD flutuante como projeção observável (não nova app, não nova rota)
  3. INVENTARIAR capacidades existentes (SOURCE_PROVED, RUNTIME_PROBE, PARCIAL, GAP)
  4. MAPEAR contas/harnesses (ADAPTER_REQUIRED vs NOT_APPLICABLE)
  5. LISTAR gaps explícitos (8 gaps, 2 plugins opcionais)
  6. TESTAR contrato (centraldark-desktop-contract.test.mjs)
  7. PROJETAR no HUD: stats, eventos, mudanças, observable%
  8. REGISTRAR receipt
MÉTODO_CONTRAPROVA:
  node --test centraldark-desktop-contract.test.mjs → PASS
  PR jobs 10/10 → PASS
  NONEW_APP=false, NEW_ROUTER=false, NEW_AUTH=false, SCREEN_SCRAPING=false
HUD_PROJECTION:
  - 16 capabilities inventariadas (11 SOURCE_PROVED, 2 RUNTIME_PROBE, 3 PARCIAL)
  - 6 accounts/harnesses mapeados (4 ADAPTER_REQUIRED, 2 DESKTOP_COMMANDER)
  - 8 gaps explícitos
  - 2 plugins analíticos opcionais (PostHog, Datadog)
  - observable%, mudanças, eventos, repos no resumo
  - layout persistido (localStorage)
STATUS: 100% verde em CI
```

---

## PATRÃO 4 — PROJEÇÃO HUD A PARTIR DE MÉTODO CRISTALIZADO

```text
MÉTODO_CRISTALIZADO
→ EXTRAIR_METRICAS_OBSERVÁVEIS
→ MAPEAR_CAPACIDADES
→ IDENTIFICAR_GAPS
→ PROEJAR_NO_HUD
├── RESUMO: health dos componentes principais
├── CONTAS: cuentas/harnesses mapeados
├── CAPACIDADES: inventário com estado
├── LACUNAS: gaps explícitos + plugins opcionais
└── EVENTOS: stream de mudanças com assinatura
```

Regra:
- HUD projeta **o que já existe e foi provado**, não inferência
- UNKNOWN permanece UNKNOWN no HUD
- ADAPTER_REQUIRED não vira OBSERVABLE sem adapter real
- GAP não vira PASS sem adapter

---

## PATRÃO 5 — RUNTIME RECEIPT COMO ANCHOR DE MÉTODO

```text
MÉTODO_CRISTALIZADO
→ RECEIPT_DE_RUNTIME (quando aplicável)
├── MCP_HEALTH=OK
├── SERVICE_VERSION=X.Y.Z
├── CATALOG_VERSION=SHA
├── TOOL_COUNT=N
├── DEVICE_AUTHORIZED=true/false
├── WATCHDOG_STATUS=ok/alert
├── SCREENPIPE_STATUS=runtime/real
├── UNKNOWN_IS_NOT_PASS=true
└── REALIDADE=JUIZ
```

Regra:
- O receipt de runtime vira **prova de que o método está vivo**, não só no source
- Sem receipt de runtime, método é SOURCE_ONLY, não RUNTIME_PROVED
- RECEIPT_HASH deve bater com o arquivo registrado

---

## PATRÃO 6 — MÉTODO COMO ENTRADA PARA PRÓXIMO CICLO

```text
MÉTODO_CRISTALIZADO_NO_RUNTIME
→ PRÓXIMO_DELTA
├── REUTILIZAR Método M1/M2/M3 como base
├── EXTRAIR gap ou evolução do método
├── CRISTALIZAR_MÉTODO_V2 somente se delta comprovado
└── NAO_REINVENTAR_M1_M2_M3
```

Regra:
- Método cristalizado é **ponto de partida**, não traineeINGAPÉ
- Nova evolução do método exige delta comprovado, não só melhoria cosmética
- ELSE: DROP ou tratar em outro ciclo

---

## CONTRAPROVA GERAL

```text
NENHUM_MÉTODO_CRISTALIZADO_SEM_CI_100_VERDE=false
NENHUM_MÉTODO_SEM_RECEIPT_REGISTADO=false
NENHUM_MÉTODO_SEM_CONTRAPROVA=false
NENHUM_MÉTODO_SEM_NEXT_CURSOR=false
NENHUM_MÉTODO_SEM_HUD_PROJECTION_SE_APLICÁVEL=false
CRISTALIZADO != PROMOVIDO_PARA_MAIN (se depender de runtime)
CRISTALIZADO != FIM_DA_MISSÃO (CHECKPOINT, não FIM)
```

---

## PRÓXIMOS MÉTODOS A CRISTALIZAR (quando chegar 100% verde)

### M4 — MCP PROXY COMPETITOR (quando runtime provado)

```text
INTENCAO: proxy de providers competindo com escolha explícita do CHEFE
PR/COMPONENTE: (a definir — app/mcp-proxy.ts ou skill CONNECTION_MANAGER)
PRÉ-REQUISITO: runtime MCP proxy funcionando com 3+ providers
STATUS: não cristalizado — aguardar runtime proof
```

### M5 — DRIP MACHINE / VOÇOROCA (quando integrado)

```text
INTENCAO: canal de feedback do CHEFE para o MCP após escolha
PR/COMPONENTE: (a definir — integração HCP)
PRÉ-REQUISITO: canal funcional ligado ao MCP
STATUS: não cristalizado — aguardar integração
```

---

Fonte: cristalização de métodos operacionais a partir de padrão "DONE 100% VERDE".
Owner: `.centraldark/runtime/receipts/2026-09-16-metodos-operacionais-cristalizados.md`
Estado real: cristalizado a partir de PR #1551 (10/10 verde) + registry dependabot (100% verde) + MCP health OK.
Próximo cursor: aguardar CI main 38ce303f6 → microdeploy → método M1 completo.
