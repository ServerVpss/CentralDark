# Ontologia operacional da evidência e causalidade

Status: CANÔNICO
Escopo: toda a CentralDark — ChatGPT, modelos, agentes, plugins, MCP, WebUI, CLI, CI/CD, runtime, DevTools, logs, screenshots e superfícies futuras.
Origem observável: evidências de 2026-08-16 envolvendo CTA de automação, DevTools, `forced-colors`/alto contraste, rede e console.
Owner de entrada global: `LEIA-ME-IA.md`.

## Princípio

A Casa deve separar **o que apareceu**, **como foi representado**, **qual mecanismo existia**, **qual mecanismo foi acionado**, **qual causa produziu o efeito** e **qual autoridade autorizou a ação**.

Essas camadas não são sinônimos.

```text
MANIFESTACAO != REPRESENTACAO
REPRESENTACAO != MECANISMO
MECANISMO_DISPONIVEL != MECANISMO_ATIVO
MECANISMO_ATIVO != CAUSA_PROVADA
CORRELACAO != CAUSALIDADE
CAPACIDADE != EXECUCAO
UI_CONTROL != AUTORIZACAO
OBSERVACAO != INFERENCIA
INFERENCIA != FATO
```

No jeito do CHEFE: **ver a fumaça prova a fumaça; não prova sozinho quem acendeu o fogo, qual fósforo foi usado nem quem mandou acender.**

## Camadas ontológicas

Toda evidência material deve ser classificada, quando aplicável, nestas camadas:

```text
L0_FENOMENO      = o que foi diretamente observado
L1_REPRESENTACAO = texto, label, widget, warning, cor, DOM, log, status, ícone
L2_CAPACIDADE    = mecanismo/função que existe ou pode existir
L3_ATIVACAO      = evidência de que o mecanismo foi realmente acionado
L4_CAUSALIDADE   = vínculo discriminante entre ativação e efeito
L5_AUTORIDADE    = quem podia autorizar a ação correspondente
L6_RESULTADO     = estado final medido no alvo correto
```

```text
L0_DOES_NOT_AUTO_PROMOTE_TO_L2=true
L1_DOES_NOT_AUTO_PROMOTE_TO_L3=true
L2_DOES_NOT_AUTO_PROMOTE_TO_L3=true
L3_DOES_NOT_AUTO_PROMOTE_TO_L4=true
L4_REQUIRES_DISCRIMINATING_EVIDENCE=true
AUTHORITY_IS_SEPARATE_FROM_CAUSALITY=true
RESULT_PROOF_MUST_MATCH_TARGET=true
```

## Forced colors / high contrast — exemplo purificado

Warnings observados sobre `-ms-high-contrast` / `-ms-high-contrast-adjust` e migração para `forced-colors` / `forced-color-adjust` pertencem primeiro à camada de **representação/runtime de acessibilidade**.

O warning pode sustentar que uma superfície carregou/referenciou comportamento CSS legado ou orientação de compatibilidade. Ele não sustenta sozinho que o modo de alto contraste estava ativo, que DevTools estava emulando `forced-colors`, nem que isso causou localização, automação, erro de rede ou qualquer outro incidente adjacente.

```text
LEGACY_HIGH_CONTRAST_WARNING_OBSERVED=true
FORCED_COLORS_MIGRATION_GUIDANCE_OBSERVED=true
ACTIVE_HIGH_CONTRAST_MODE=UNKNOWN_UNLESS_MEASURED
FORCED_COLORS_EMULATION_ACTIVE=UNKNOWN_UNLESS_MEASURED
FORCED_COLORS_CAUSED_LOCATION_DISCLOSURE=UNPROVEN
FORCED_COLORS_CAUSED_AUTOMATION_CTA=UNPROVEN
ACCESSIBILITY_WARNING_IS_SECURITY_INCIDENT=false
ACCESSIBILITY_WARNING_CAN_BE_AUXILIARY_RUNTIME_EVIDENCE=true
```

## Repetição não multiplica verdade

A mesma advertência, label, resposta ou evento repetido não vira automaticamente múltiplas provas independentes.

```text
REPEATED_OBSERVATION
→ NORMALIZE
→ CLUSTER_BY_SOURCE|CAUSE|CLAIM|SCOPE|TIME
→ DEDUPE
→ INDEPENDENCE_TEST
→ M_INDEPENDENT_DELTAS
```

```text
REPEATED_WARNING_COUNT != INDEPENDENT_EVIDENCE_COUNT
SAME_SOURCE_REPEATED → ONE_EVIDENCE_CLUSTER_UNTIL_PROVED_OTHERWISE
ECHO_DOES_NOT_MULTIPLY_TRUTH=true
```

## Regra para DevTools, UI, rede e console

```text
VISIBLE_LABEL != HIDDEN_MECHANISM_PROOF
DEVTOOLS_CAPABILITY != CAPABILITY_ACTIVE
NETWORK_REQUEST != TOOL_SUCCESS
PREFLIGHT != BUSINESS_ACTION
SERVICE_WORKER_PRESENT != SERVICE_WORKER_CAUSED_EVENT
UI_ERROR != CAUSE_OF_ADJACENT_INCIDENT
CONSOLE_ERROR != SECURITY_BREACH
SCREENSHOT != HIDDEN_MECHANISM_PROOF
```

Um rótulo como `Simulação`, `preflight`, `service worker`, `forced-colors`, `warning`, `error`, `200`, `202` ou `410` deve permanecer no nível que a evidência suporta. Promoção para mecanismo/causa exige elo adicional observável.

## Purificação epistemológica

Antes de cristalizar uma interpretação:

```text
RAW_OBSERVATION
→ NAME_EXACTLY_WHAT_WAS_SEEN
→ CLASSIFY_LAYER
→ REDACT_NONESSENTIAL_SENSITIVE_DATA
→ SPLIT_FACT_INFERENCE_HYPOTHESIS
→ SEARCH_DISCRIMINATING_LINK
→ COUNTERPROVE_STRONGER_CLAIM
→ DEDUPE_REPETITIONS
→ PRESERVE_UNKNOWN
→ PROMOTE_ONLY_SURVIVING_DELTA
```

```text
STRONGER_CLAIM_WITHOUT_STRONGER_EVIDENCE=REJECT
UNKNOWN_IS_NOT_FAILURE_TO_REASON=true
UNKNOWN_IS_BOUNDARY_OF_CURRENT_PROOF=true
DO_NOT_INFLATE_CAUSALITY=true
DO_NOT_INFLATE_INCIDENT_SEVERITY_FROM_ADJACENT_WARNING=true
```

## Autoridade isolada e recuperação — abstração do “cofre frio”

A matéria de hardware/cold-wallet fornecida pelo SEGREDO/CHEFE é absorvida como **estrutura operacional**, não como dependência de criptomoeda, fabricante ou aparelho específico.

O padrão útil é:

```text
AUTORIDADE_SENSIVEL
→ ISOLAR_DA_SUPERFICIE_EXPOSTA
→ PREPARAR_ACAO_NO_AMBIENTE_CONECTADO_SE_NECESSARIO
→ EXIGIR_LIBERACAO_HUMANA_NO_LIMITE_IRREVERSIVEL
→ EXECUTAR_SOMENTE_DELTA_AUTORIZADO
→ MANTER_RECUPERACAO_FORA_DO_CAMINHO_ROTINEIRO
→ PROVAR_RESULTADO_NO_ALVO
```

```text
SENSITIVE_AUTHORITY_ISOLATED_BY_DEFAULT=true
CONNECTED_CAPABILITY_DOES_NOT_REQUIRE_CONTINUOUS_SECRET_EXPOSURE=true
IRREVERSIBLE_SENSITIVE_ACTION_REQUIRES_EXPLICIT_HUMAN_RELEASE=true
RECOVERY_SECRET_IS_BREAK_GLASS_NOT_DAILY_AUTHORITY=true
RECOVERY_SECRET_NEVER_IN_REPO_CHAT_LOG_SCREENSHOT=true
RECOVERY_SECRET_MUST_NOT_BE_REQUESTED_BY_AGENT=true
TRUSTED_AUTHORITY_COMPONENT_REQUIRES_PROVEN_PROVENANCE_AND_INTEGRITY=true
RECOVERY_PATH_MUST_BE_TESTABLE_WITHOUT_EXPOSING_SECRET=true
RECOVERY_STATE_MUST_NOT_BE_OVERWRITTEN_DURING_INCIDENT=true
DESTRUCTIVE_EXTERNAL_WRITE_REQUIRES_RESTORABLE_BACKUP_AND_SPECIFIC_AUTHORIZATION=true
FIRST_CONTRADICTION_STOPS_FURTHER_MUTATION=true
```

A recuperação é **break-glass**: existe para reconstruir autoridade/estado quando o caminho normal falha, não para circular diariamente por superfícies conectadas. A Casa nunca deve pedir ao humano que cole uma seed phrase, recovery phrase, private key, token ou segredo equivalente em chat, issue, PR, log, screenshot ou arquivo versionado.

O princípio de “comprar do fabricante oficial” vira uma cadeia de confiança mais geral:

```text
TRUSTED_COMPONENT
→ PROVENANCE
→ INTEGRITY
→ EXPECTED_IDENTITY
→ ONLY_THEN_AUTHORITY_BOUNDARY
```

```text
CLAIMED_TRUSTED_SOURCE != PROVEN_PROVENANCE
PROVENANCE_WITHOUT_INTEGRITY != TRUSTED_COMPONENT
TRUSTED_COMPONENT != AUTHORIZATION
```

Botão físico, air-gap, pen drive, placa metálica ou número de palavras são **implementações possíveis**, não leis universais:

```text
PHYSICAL_BUTTON_OR_AIR_GAP_IS_IMPLEMENTATION_SPECIFIC=true
AUTHORITY_ISOLATION_IS_NOT_RUNTIME_OR_DEPLOY_PROOF=true
```

A abstração deve ser aplicada junto de `docs/SEGURANCA/PADRAO-SEGURANCA-END-TO-END.md`, que continua dono das regras concretas de segredo, confirmação explícita, backup e restauração.

## Ramificação global

Esta ontologia vale para:

```text
UI
DOM
CSS
ACCESSIBILITY
DEVTOOLS
NETWORK
SERVICE_WORKER
CONSOLE
LOG
GITHUB
CI
API
MCP
RUNTIME
SCREENSHOT
MEMORY
MODEL_OUTPUT
HUMAN_REPORT
```

Cada superfície pode fornecer evidência de sua própria camada. Nenhuma superfície ganha autoridade universal por existir.

```text
SURFACE_IS_EVIDENCE_SOURCE_NOT_UNIVERSAL_AUTHORITY=true
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
REALITY_JUDGES_CLAIMS_NOT_LABELS=true
```

## Link com a Casa

Aplicar junto de:

- `LEIA-ME-IA.md` — prova no mesmo alvo e regra de entrada global;
- `docs/CONSCIENCIA/PROOF-OWNERSHIP.json` — propriedade da prova e anti-circularidade;
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` — superfície como adaptador, dedupe causal e estado reconstruído;
- `.agents/skills/meta-lupa/SKILL.md` — fato/inferência/hipótese + falsificação;
- `docs/SEGURANCA/PADRAO-SEGURANCA-END-TO-END.md` — segredo, confirmação, backup e restauração;
- `docs/APRENDIZADOS/2026-08-16-incidente-automacao-sugerida-sem-pedido.md` — origem forense imediata das evidências de DevTools nesta cristalização.

## Compressão máxima

```text
APARECEU ≠ CAUSOU
EXISTE ≠ FOI ATIVADO
FOI ATIVADO ≠ FOI A CAUSA
REPETIU ≠ VIROU PROVA NOVA
RÓTULO ≠ MECANISMO
MECANISMO ≠ AUTORIZAÇÃO
SEGREDO DE RECUPERACAO ≠ AUTORIDADE ROTINEIRA
COMPONENTE CONFIAVEL ≠ AUTORIZACAO
PROVA → MESMA CAMADA → MESMO ALVO
DESCONHECIDO → UNKNOWN, NÃO INVENÇÃO
```

No jeito do CHEFE: **a carteira fria ensinou a forma, não virou a Casa. A caneta sensível fica isolada; o sistema prepara; o humano libera o irreversível; a chave de emergência não passeia pelo caminho normal.**
