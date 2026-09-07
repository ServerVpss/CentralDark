# GitHub Copilot — adaptador fino CentralDark

```text
CANONICAL_AGENT_CORE=LEIA-ME-IA.md
ADAPTER_ROLE=ENGINE_DISCOVERY_ONLY
ENGINE=COPILOT
```

Antes de responder ou agir, leia `LEIA-ME-IA.md` integralmente e siga o roteamento canônico definido ali. O core carrega identidade, autoridade, governança, frequências, MetaLupa, Multibússola, remediação, prova, memória, Writer e módulos sob demanda.

Este adaptador só informa qual engine/superfície chegou. Capacidades e ferramentas físicas devem ser medidas no runtime atual.

```text
ONE_SOL=true
ONE_CORE=true
LAZY_LOAD_BY_DEMAND=true
ENGINE_IS_REPLACEABLE=true
TOOLS_REQUIRE_RUNTIME_MEASUREMENT=true
DO_NOT_DUPLICATE_GOVERNANCE=true
DO_NOT_DEFINE_IDENTITY=true
DO_NOT_DEFINE_AUTHORITY=true
DO_NOT_DEFINE_MERGE_POLICY=true
DO_NOT_DEFINE_MEMORY=true
DO_NOT_CREATE_PARALLEL_AGENT=true
FUTURE_RULES_CONSUMED_FROM_CORE=true
```

Se Copilot exigir uma regra exclusiva de integração, registrar somente a diferença física da superfície. Regras comuns pertencem ao core.

## Automations / cloud agent — delta físico da superfície

Automação não cria intenção nova, não aprova a própria prova e não transforma ausência de contexto em PASS.

```text
AUTOMATION_OUTPUT_IS_NOT_HUMAN_INTENT=true
ISSUE_TRIGGER_IS_NOT_PR_DIFF=true
NO_LINKED_PR=NO_PR_DIFF_AVAILABLE
UNKNOWN_IS_NOT_PASS=true
REUSE_EXISTING_TELEMETRY_FIRST=true
NEW_DEPENDENCY_REQUIRES_PROVEN_GAP=true
NEW_WORKFLOW_REQUIRES_PROVEN_GAP=true
NO_MERGE_FROM_REVIEW_AUTOMATION=true
NO_DEPLOY_FROM_REVIEW_AUTOMATION=true
```

Quando uma automação disparada por `issue opened` receber instrução que pressuponha um PR/diff atual:

1. Ler a issue e procurar PR explicitamente ligado ou referência verificável a branch/commit.
2. Se houver PR ligado, revisar somente o diff observado daquele PR.
3. Se não houver PR/diff verificável, não inventar alterações nem telemetria: retornar `TELEMETRY_REVIEW=NO_CHANGE` e `REASON=NO_USER_FACING_DIFF_AVAILABLE`.
4. Telemetria só é necessária quando existe mudança observada de uso, estado, configuração, falha visível ou análise de população que precise ser medida.
5. Reutilizar transporte, logger, eventos e dependências existentes antes de propor pacote, endpoint ou workflow novo.
6. Eventos devem ter nomes estáveis e propriedades de baixa cardinalidade. Segredos, tokens, texto livre do usuário, credenciais e identificadores sensíveis não entram em propriedades normais; diagnóstico restrito deve permanecer separado.
7. Se a evidência não sustentar instrumentação nova, explicar por que `NO_CHANGE` é a decisão de menor regressão.

## Ponteiros canônicos verificáveis

Este adaptador carrega os owners `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`, `.agents/skills/meta-lupa/SKILL.md` e `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA` por meio de `LEIA-ME-IA.md`, e emite `CENTRALDARK_AI_BOOT`. Esses ponteiros são referências verificáveis; não duplicam governança.
