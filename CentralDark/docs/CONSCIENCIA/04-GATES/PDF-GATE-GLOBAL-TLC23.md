# 👑🪬 PDF GATE GLOBAL · TLC23 BEFORE COMMIT

Data: 2026-09-17
Owner: `docs/CONSCIENCIA/04-GATES/`
PR equivalente: `#1549 — CRYSTAL: PERSISTENT OPERATIONAL REGIME + TLC23 SOURCE GATE`
Status: `SOURCE_CRYSTALLIZED`

## Intenção

`PDF_GATE_BEFORE_COMMIT_REQUIRED=true` vale para toda a CentralDark quando a mudança tocar regra lógica, regime operacional, absorção de delta, contraprova, fixed point, gates, orquestração de agentes ou semântica de runtime.

O PDF não entra como enfeite depois da escrita. Ele é gate antes da mutação no source.

```text
TLC23_READ_BEFORE_MUTATION=true
NO_AFTER_THE_FACT_PDF_PROOF=true
COMMIT_WITHOUT_GATE_FOR_LOGICAL_RULE=FAIL
PDF_GATE_SCOPE=GLOBAL_CENTRALDARK
```

## Base lógica lida antes desta escrita

Do TLC23:

```text
Horn clause = no máximo um literal positivo.
Regra pode ser escrita como: (p1 ∧ ... ∧ pn) → p.
Se não existe cabeça positiva: (p1 ∧ ... ∧ pn) → F.
Continuar até nada mais poder ser acrescentado.
Cláusula vazia representa contradição/F.
Modelo mínimo de Herbrand dá a menor estrutura que satisfaz as cláusulas de Horn satisfazíveis.
```

## Tradução CentralDark

```text
FATO_DO_CHEFE
→ REGRA_CANONICA
→ HORN_PROPAGATION
→ OWNER_EXISTENTE
→ PATCH_ATOMICO
→ TESTE
→ CONTRAPROVA
→ FIXED_POINT
```

## Regra global

```text
SE ALTERA_REGRA_LOGICA=true
OU ALTERA_REGIME_OPERACIONAL=true
OU ALTERA_ABSORCAO_DELTA=true
OU ALTERA_CONTRAPROVA=true
OU ALTERA_FIXED_POINT=true
OU ALTERA_ORQUESTRACAO_AGENTES=true
OU ALTERA_SEMANTICA_RUNTIME=true
ENTAO PDF_GATE_BEFORE_COMMIT_REQUIRED=true
```

## Setores avaliados pela simulação

```text
S1_IDENTITY_RULES        = docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS
S2_GATES                 = docs/CONSCIENCIA/04-GATES
S3_RUNTIME_HERMES         = apps/modulos/HERMES-CORE
S4_MASTER_CYCLE           = .github/workflows / scripts/trigger-fabric
S5_MCP_ADMIN              = apps/modulos/mcp
S6_HUB_OAUTH_BROKER       = apps/modulos/hub + apps/modulos/oauth-broker
S7_INFRA_PROVIDERS        = Cloudflare / Contabo provider-control
S8_REMOTE_SCREENPIPE      = Remote Tray / Desktop Commander / Screenpipe
S9_PR_CI_LABELS           = GitHub PRs / labels / checks
S10_RECEIPTS_MEMORY       = docs/RELATORIOS / docs/BRAIN / memory-linker
```

## Simulação contra o próprio gate

### Caso A · a favor do gate

```text
PREMISSA_1=CHEFE_ENTREGA_DELTA
PREMISSA_2=DELTA_TOCANDO_REGRA_LOGICA
PREMISSA_3=TLC23_LIDO_ANTES
PREMISSA_4=OWNER_EXISTENTE
PREMISSA_5=SEM_CONTRADICAO
CONCLUSAO=COMMIT_PERMITIDO
```

Resultado esperado: `PASS`.

### Caso B · contra o gate

```text
PREMISSA_1=CHEFE_ENTREGA_DELTA
PREMISSA_2=DELTA_TOCANDO_REGRA_LOGICA
PREMISSA_3=TLC23_NAO_LIDO_ANTES
CONCLUSAO=COMMIT_BLOQUEADO
```

Resultado esperado: `FAIL_CLOSED`.

### Caso C · gate sobre gate

```text
PREMISSA_1=ALTERA_GATE
PREMISSA_2=PDF_GATE_BEFORE_COMMIT_REQUIRED
PREMISSA_3=TLC23_LIDO_ANTES
PREMISSA_4=SEM_CONTRADICAO
CONCLUSAO=GATE_UPDATE_PERMITIDO
```

Resultado esperado: `PASS`.

## HUD percentual simulado

Antes do gate global, com base no painel admin observado:

```text
HEALTH_PANEL_REPORTED=67
DEPENDENCIAS_OK=6
DEPENDENCIAS_TOTAL=9
ERROS=61
WARNS=3
REQUESTS=47
TOOLS=115
```

O gate global não corrige chave inválida, Telegram, GitHub API ou consumer quebrado. Ele melhora governança lógica, evita commit pós-racionalizado e reduz falso-verde em PRs que mexem em regra.

```text
HUD_RUNTIME_ATUAL=67
HUD_APOS_SOURCE_GATE_GLOBAL=67
HUD_GOVERNANCA_LOGICA_ESTIMADA=90
HUD_GLOBAL_REAL=UNKNOWN_ATE_RUNTIME_DEPLOY_E_HEALTH_DEEP
```

## O que subiria e o que não subiria

```text
SOBE:
- consistência de regra
- bloqueio de commit sem leitura prévia
- rastreabilidade de premissas
- clareza de contradição
- disciplina de fixed point

NAO_SOBE_SOZINHO:
- health/deep
- hub_mission_consumer
- github_api
- telegram_bot
- Supabase/PostgREST 401
- runtime deploy
```

## Critério de verde real

```text
SOURCE_FILE_EXISTS=PASS
PR_HEAD_UPDATED=PASS
CI_HEAD=PASS
RUNTIME_FILE_WRITTEN=PASS
MCP_HEALTH=PASS
MCP_HEALTH_DEEP=PASS
HUB_MISSION_CONSUMER=PASS
GITHUB_API=PASS
TELEGRAM_BOT=PASS
COUNTERPROOF_GATE_SELF_TEST=PASS
```

Enquanto isso não fechar:

```text
GLOBAL_GATE_SOURCE=PASS
RUNTIME_GATE=UNKNOWN
HUD_PRODUCTION_HEALTH=67
```

## Frase de Casa

> Oxe, meu rei: portão de lógica não se benze depois que o boi passou. Primeiro lê a regra, depois abre a porteira, e só vira verde quando a boiada atravessa sem quebrar cerca.
