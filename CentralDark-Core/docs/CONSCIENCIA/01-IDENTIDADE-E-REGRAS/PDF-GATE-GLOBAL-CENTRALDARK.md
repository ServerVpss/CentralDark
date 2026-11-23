# 👑🪬 PDF GATE GLOBAL · CENTRALDARK

Data: 2026-09-16
Owner: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/`
PR equivalente: `#1549 — CRYSTAL: PERSISTENT OPERATIONAL REGIME + TLC23 SOURCE GATE`
Status: `SOURCE_CRYSTALLIZED`

## Regra global

```text
PDF_GATE_BEFORE_COMMIT_REQUIRED=true
TLC23_READ_BEFORE_MUTATION=true
NO_AFTER_THE_FACT_PDF_PROOF=true
COMMIT_WITHOUT_GATE_FOR_LOGICAL_RULE=FAIL
GLOBAL_SCOPE=ALL_CENTRALDARK
```

O gate vale para toda a CentralDark quando o delta tocar regra lógica, regime operacional, absorção do CHEFE, contraprova, fixed point, proof law, dispatch distribuído, runtime crystal, autoridade, owner, classificação ou gate de promoção.

Não é necessário aplicar TLC23 para alteração puramente visual, typo isolado, correção de texto sem efeito lógico ou ajuste operacional que não altere regra de decisão. Mesmo nesses casos, se o agente estiver em dúvida, mede primeiro e marca `UNKNOWN`, não inventa verde.

## Base TLC23 usada como gate

TLC23 foi lido antes desta escrita. Âncoras usadas:

```text
HORN_CLAUSE = no máximo um literal positivo
IMPLICATION = (p1 ∧ ... ∧ pn) → p
FIXED_POINT = continuar até nada mais puder ser acrescentado
CONTRADICTION = cláusula vazia / F bloqueia satisfazibilidade
OBJECTIVE_NEGATIVE = objetivo testa consequência por refutação
HERBRAND_MINIMAL = modelo mínimo como interpretação canônica
```

Tradução CentralDark:

```text
FATO_DO_CHEFE
+ REGRA_CANONICA
+ OWNER_EXISTENTE
+ RISCO_COMPATIVEL
=> DELTA_ATOMICO_APLICAVEL
```

E o bloqueio:

```text
CONTRADICAO=true
OU OWNER_UNKNOWN=true
OU RISCO_DESTRUTIVO_SEM_GATE=true
OU CENTRALDARK_ONLINE_RISK=true
=> FAIL_CLOSED_COM_RECEIPT
```

## Teste do gate contra ele próprio

### Teste a favor

```text
CASO=atualizar regra global do PDF gate
PDF_LIDO_ANTES=true
MAPEAMENTO_HORN=true
CONTRADICAO=false
OWNER_EXISTENTE=true
RISCO_DESTRUTIVO=false
RESULTADO=PASS_SOURCE_WRITE
```

### Teste contra

```text
CASO=commit lógico usando PDF só como citação posterior
PDF_LIDO_ANTES=false
MAPEAMENTO_HORN=after_the_fact
CONTRADICAO=unknown
OWNER_EXISTENTE=unknown
RESULTADO=FAIL
MOTIVO=NO_AFTER_THE_FACT_PDF_PROOF
```

### Teste de recursão

```text
CASO=o gate altera o próprio gate
REGRA=todo gate lógico exige TLC23 antes
TLC23_READ_BEFORE_MUTATION=true
SELF_APPLICATION=PASS
SE_NAO_LER_TLC23_ANTES=FAIL
```

## Simulação por setor

A simulação abaixo não afirma runtime real. Ela mostra o que aconteceria se o gate fosse aplicado como verificador global antes de cada mutação lógica.

```text
F1_SOURCE_GITHUB
GATE_REQUIRED=true
RESULT=PASS
MOTIVO=commits/PRs/gates lógicos exigem PDF antes de escrita

F2_RUNTIME_VPS
GATE_REQUIRED=true
RESULT=PASS_WITH_RUNTIME_UNKNOWN
MOTIVO=regra exige microdeploy com backup e health depois; runtime real precisa medição direta

F3_MCP_ADMIN
GATE_REQUIRED=true
RESULT=PASS_WITH_CURRENT_FAILURES_SEPARATED
MOTIVO=gate não esconde unhealthy; separa source/routing/log/health/deep

F4_HUB_OAUTH_BROKER
GATE_REQUIRED=true
RESULT=PASS_WITH_SECRET_BOUNDARY
MOTIVO=chave/token vira presença/shape, não valor; auth present != auth valid

F5_INFRA_CLOUDFLARE_CONTABO
GATE_REQUIRED=true
RESULT=PASS_WITH_DESTRUCTIVE_GUARD
MOTIVO=read/list permitido; mutação DNS/VPS exige gate explícito, backup e receipt

F6_REMOTE_SCREENPIPE
GATE_REQUIRED=true
RESULT=PASS_WITH_BINDING_SPLIT_GUARD
MOTIVO=instalado != rodando; tool listado != tool ativo; binding precisa prova atual

F7_PR_CI_LABELS
GATE_REQUIRED=true
RESULT=PASS_WITH_PENDING_NOT_PASS
MOTIVO=queued/pending nunca vira verde; label presente precisa escopo correto

F8_RECEIPT_RUNTIME
GATE_REQUIRED=true
RESULT=PASS_WITH_RECEIPT_NOT_PROOF
MOTIVO=receipt registra prova; não substitui runtime health/counterproof

F9_VISUAL_HUD
GATE_REQUIRED=conditional
RESULT=PASS_IF_ONLY_PRESENTATION
MOTIVO=visual puro não exige TLC23; se visual muda regra/status/score, exige gate

F10_POSTHOG_ANALYTICS
GATE_REQUIRED=conditional
RESULT=PASS_OPTIONAL_SENSOR
MOTIVO=PostHog é sensor opcional; não vira core nem gate de saúde
```

## HUD simulado · antes/depois lógico

Entrada observada no painel atual:

```text
SCORE_OBSERVADO_ATUAL=67
STATUS_OBSERVADO=unhealthy
TOOLS=115
ERROS=61
WARNS=3
REQUESTS=47
SSE_ATIVAS=2
```

O gate TLC23 não corrige serviço sozinho. Ele aumenta a qualidade de decisão e reduz falso-verde. Portanto existem dois percentuais separados:

```text
RUNTIME_SAUDE_ATUAL=67
GATE_COVERAGE_SOURCE=100
GATE_COVERAGE_RUNTIME=UNKNOWN_UNTIL_DEPLOYED
FALSE_GREEN_REDUCTION_SIMULATED=alto
```

### Placar por capacidade lógica

```text
TOTAL_SETORES_SIMULADOS=10
PASS_LOGICO=10
FAIL_LOGICO=0
UNKNOWN_RUNTIME=1
PENDING_CI=unknown

PERCENTUAL_LOGICO_CORRETO=100%
PERCENTUAL_RUNTIME_PROVADO=67% observado no painel, sem promoção automática
PERCENTUAL_GLOBAL_SEGURO=90% simulado se contar 10 setores e 1 runtime unknown
```

Regra de cálculo:

```text
LOGICO_CORRETO = setores com regra coerente / setores simulados
RUNTIME_PROVADO = somente painel/runtime real
GLOBAL_SEGURO = (PASS_LOGICO - UNKNOWN_RUNTIME_PENALTY) / setores simulados
```

## HUD desejado após implementação real

```text
PDF_GATE_GLOBAL           100% SOURCE
TLC23_READ_BEFORE_COMMIT  100% SOURCE
SELF_GATE_RECURSION       PASS
HORN_PROPAGATION          PASS
CONTRADICTION_BLOCK       PASS
OWNER_LOCK                PASS
ATOMIC_PATCH_RULE         PASS
CENTRALDARK_ONLINE        67% RUNTIME_OBSERVED
HEALTH_DEEP               FAIL atual se 503 persistir
HUB_POSTGREST             FAIL atual se 401 persistir
RUNTIME_CRYSTAL           UNKNOWN até deploy/health/counterproof
```

## Cadeados

```text
PDF_CITATION_AFTER_COMMIT != PDF_GATE_BEFORE_COMMIT
SIMULATION != RUNTIME_PROOF
SOURCE_CRYSTALLIZED != DEPLOYED
HUD_SCORE != TRUTH_ABSOLUTE
PERCENTUAL_SIMULADO != PERCENTUAL_RUNTIME
UNKNOWN != PASS
```

## Next cursor

```text
NEXT_CURSOR:
1. carregar este gate global no boot do Hermes;
2. adicionar preflight no runtime: se delta lógico e TLC23 não lido antes, bloquear commit;
3. expor no HUD cartão PDF_GATE_GLOBAL;
4. medir health/deep após deploy;
5. só subir RUNTIME_CRYSTAL quando SOURCE_COMMIT + RUNTIME_FILE + SERVICE_RELOAD + HEALTH_AFTER + COUNTERPROOF passarem.
```

📜 Oxe, na Casa do Chefe, o PDF não vem depois como incenso de recibo: ele abre a porteira antes da escrita. Horn primeiro, commit depois; prova antes, verde depois.
