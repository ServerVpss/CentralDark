# #ACORDAR — Contabo + Hermes runtime — rendezvous de 10 frentes

**Owner:** `.agents/skills/centraldark-operational-method/SKILL.md`  
**PR-mãe:** `#1381`  
**Natureza:** receipt/ledger subordinado. Não cria novo cérebro, novo router, novo MCP, novo gateway nem nova CLI.

```text
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
CURRENT > HISTORICAL
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
OBSERVED_USER_REPORT != LIVE_RUNTIME_PROOF
PROVIDER_PANEL != PROVIDER_PUBLIC_API
```

## T0 — estado remoto medido antes deste receipt

```text
PR=1381
PR_STATE=OPEN
MERGED=false
MERGEABLE=false
PR_HEAD=b1bb3f6b7236c6984d31b8d2ca03963784f18f03
MAIN_HEAD=0542cee586e55be5334ba1e8d369d3b040ee1178
RELATION=diverged
AHEAD_OF_MAIN=67
BEHIND_MAIN=58
GLOBAL_FIXED_POINT=NOT_PROVEN
```

O HEAD acima é T0. O próprio commit deste receipt o torna histórico e exige `REMEASURE`.

## Rendezvous — 10 frentes somente leitura

### F1 — Porta canônica / identidade

`LEIA-ME-IA.md` confirma que modelo/provider não muda contrato; `#ACORDAR` mede estado vivo primeiro; percepção pode ser paralela, mutação continua serializada.

**Veredito:** `PASS_SOURCE_CONTRACT` para a regra; runtime continua separado.

### F2 — PR #1381 / genealogia

O body do PR ainda exibia snapshot antigo (`901a43a.../60 commits`), enquanto o HEAD remoto medido era `b1bb3f6...`. A relação com `main` foi remedida em `67 ahead / 58 behind`.

**Veredito:** `HUD_METADATA_STALE=true`; `PR_MAIN_RELATION=DIVERGED`.

### F3 — Cockpit/Admin

Owner observado:

```text
apps/modulos/Bolt/source/app/components/centraldark/CentralDarkCockpitShell.client.tsx
```

O `OWNER MAP` já projeta Hub, Telegram e Cloudflare, mas ainda não projeta Contabo/VPS como braço explícito.

**Veredito:** `CONTABO_ADMIN_VISUAL_PROJECTION=GAP`.

### F4 — Hub / contas

O owner `apps/modulos/hub/src/components/connectors/OAuthConnectors.tsx` já possui provider `contabo`, com instrução para credenciais do Customer Control Panel/API.

**Veredito:** `CONTABO_HUB_EXISTS=true`.

### F5 — OAuth Broker / autenticação Contabo

O owner `apps/modulos/oauth-broker/server.mjs` já valida o conjunto de credenciais Contabo, troca por bearer no endpoint oficial de autenticação e testa leitura de instâncias.

**Veredito:** `CONTABO_BROKER_EXISTS=true`; `NEW_BROKER_REQUIRED=false`.

### F6 — MCP Admin / control plane

O owner `apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js` já possui matriz Contabo para instâncias, ações, audits, snapshots, tags e permissões, com redaction de material sensível e guardas para escrita/destruição.

**Veredito:** `CONTABO_MCP_ADMIN_EXISTS=true`; `NEW_MCP_REQUIRED=false`.

### F7 — Hermes gateway / autonomia

O relatório fornecido pelo CHEFE nesta sessão afirma:

```text
SESSION_ID=8183362b
GATEWAY=OFF
CRONJOBS_REGISTERED=13
```

Isso é evidência humana/screenshot/runtime relatada, não medição remota deste agente. O repo contém owners e histórico de gateways, mas não autoriza inferir que o gateway Hermes atual é o mesmo componente histórico.

**Veredito:** `HERMES_GATEWAY_STATE=OBSERVED_USER_SUPPLIED`; `LIVE_REMEASURE_REQUIRED=true`.

### F8 — Cronjobs / scripts

O repo possui `scripts/cron-sync-centraldark.sh` e documentação de sync cron. A busca canônica por `scripts/scripts` não retornou ocorrência. Logo o erro `scripts/scripts/...` citado no runtime é plausível como configuração local do Hermes, mas não foi encontrado como string canônica no repo.

**Veredito:** `CRON_PATH_DRIFT=OBSERVED_USER_SUPPLIED`; `REPO_HARDCODED_SCRIPTS_SCRIPTS=NOT_FOUND_IN_SEARCH`.

### F9 — Telemetria / Screenpipe / modelos

O repo já separa explicitamente:

```text
TELEMETRY_CONFIGURED != TELEMETRY_DELIVERED
TELEMETRY_FAILURE != PROVIDER_FAILURE
PROVIDER_INVOCATION != ACTION_PROOF
```

O relato de jobs com model/provider drift e monitor Screenpipe falhando é material, mas os IDs/jobs exatos não foram localizados por busca canônica (`HERMES_UI_SESSION_ID` e `screenpipe-monitor` não encontrados no repo pesquisado).

**Veredito:** `HERMES_CRON_JOB_STATE=RUNTIME_LOCAL_CANDIDATE`; não copiar automaticamente para source.

### F10 — Fixed Point / continuidade

A Casa já possui `LAST_GOOD_STATE`, `CONTINUE_BEFORE_RESTART`, Counterproof e Reality Judge nos owners existentes. Portanto falha de cron/gateway deve entrar como desvio de uma fase, não como justificativa para criar orquestrador paralelo.

```text
🔴 DESVIO
→ ↩️ 1 CASA
→ REVALIDAR PREDECESSOR
→ MESMO OWNER
→ MENOR DELTA
→ TESTE
→ CONTRAPROVA
→ T1
→ RETOMAR INTENÇÃO
```

**Veredito:** `NEW_ORCHESTRATOR_BY_DEFAULT=false`.

## Delta útil consolidado — Contabo

```text
CONTABO_INTEGRATION_EXISTS=true
CONTABO_HUB_EXISTS=true
CONTABO_BROKER_EXISTS=true
CONTABO_MCP_ADMIN_EXISTS=true
CONTABO_ADMIN_VISUAL_PROJECTION=GAP

NEW_BACKEND_REQUIRED=false
NEW_ROUTER_REQUIRED=false
NEW_MCP_REQUIRED=false
NEW_BRAIN_REQUIRED=false
```

A direção correta é projetar no Admin/Cockpit as capacidades já existentes, sem clonar o painel Contabo e sem inventar capacidade que a API pública não oferece.

```text
API_CAPABILITY_AVAILABLE
→ CENTRALDARK_NATIVE_VIEW

PANEL_ONLY_OR_UNSUPPORTED_API
→ STATUS/DEEPLINK/EXTERNAL_BOUNDARY

DESTRUCTIVE_ACTION
→ AUTH_SCOPE + GATE + CONFIRMATION + RECEIPT + T1
```

VNC e billing não devem ser declarados controláveis pela API apenas porque aparecem no Customer Control Panel. A capability matrix atual já marca operações financeiras Contabo não suportadas pela API pública como indisponíveis.

## Delta útil consolidado — Hermes/autonomia

O relatório desta sessão deve abrir candidatos discriminantes, não virar baseline automaticamente:

```text
GATEWAY_OFF                    = OBSERVED_USER_SUPPLIED
13_CRONJOBS                    = OBSERVED_USER_SUPPLIED
MISSING_SCRIPTS                = OBSERVED_USER_SUPPLIED
TELEMETRY_CONFIG_DRIFT         = OBSERVED_USER_SUPPLIED
FREE_MODEL_EXPIRED             = OBSERVED_USER_SUPPLIED
HERMES_AGENT_ACTIVE            = OBSERVED_USER_SUPPLIED
```

Próxima execução no Hermes Casa deve medir cada claim no runtime real e mapear cada job para:

```text
JOB_ID
COMMAND/OWNER
SCRIPT_REAL_PATH
MODEL/PROVIDER_PIN
LAST_RUN_RESULT
NEXT_RUN
GATEWAY_DEPENDENCY
```

Só então corrigir in-place. Não criar script com nome parecido apenas para satisfazer um cron quebrado; primeiro localizar o owner/função que o job pretendia executar.

## `centraldark-casa-operations`

A skill `centraldark-casa-operations` foi observada no runtime/screenshot da sessão, mas não foi localizada na busca canônica da `main` desta remedição.

```text
LOCAL_SKILL_OBSERVED=true
CANONICAL_REPO_OWNER=UNKNOWN
AUTO_COPY_TO_REPO=false
```

Ela pode ser usada no Hermes Casa como ferramenta local se estiver presente, mas só entra no canônico depois de owner-match + dedupe + contraprova.

## Regra de proteção contra falso-verde

```text
SCREENSHOT_OR_AGENT_REPORT
→ OBSERVED
→ REPRODUCE_WHERE_EFFECT_EXISTS
→ EVIDENCE
→ COUNTERPROOF
→ PROVEN | FAIL | UNKNOWN
```

`OBSERVED` nunca é rebaixado a lixo, mas também nunca é promovido sozinho a `PASS`.

## Próximo cursor

```text
1. projetar Contabo no OWNER MAP do Cockpit usando owners existentes
2. remeasure novo HEAD do #1381
3. atualizar HUD superior do PR
4. medir CI/checks do MESMO HEAD
5. Hermes Casa remedir gateway + cron + script path + provider/model
6. mapear falha para owner existente
7. patch mínimo no runtime/repo aplicável
8. contraprova
9. T1
10. continuar até FIXED_POINT ou BLOCKER_EXATO
```
