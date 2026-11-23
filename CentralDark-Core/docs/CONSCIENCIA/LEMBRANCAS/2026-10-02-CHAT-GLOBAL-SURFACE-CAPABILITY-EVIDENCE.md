# 2026-10-02 — CHAT_GLOBAL, superfície, capability, estado e prova

## Origem

O CHEFE corrigiu uma inferência em que “ChatGPT” estava sendo tratado como se fosse a categoria global de chat. A categoria correta é `CHAT_GLOBAL`: ChatGPT, Claude Chat, Gemini Chat, Grok Chat e futuras superfícies são implementações/proveniência dessa classe.

A correção também separou capability de marca. Um chat conectado ao GitHub pode ler/escrever repo sem possuir shell. O mesmo chat, se receber shell, Desktop Commander, MCP executor ou bridge equivalente autorizado, passa a ter capability executora naquele escopo.

## Modelo canônico

```text
CHEFE
→ CHAT_GLOBAL / ORACLE-SURFACE
→ CAPABILITY BUS / TOOLS MEDIDAS
→ EXECUTOR CAPABILITY QUANDO DISPONÍVEL
→ REALIDADE
```

```text
CHAT_GLOBAL != CHATGPT
BRAND != SURFACE_CLASS
SURFACE != CAPABILITY
SURFACE != EXECUTOR_PROOF
GITHUB_ACCESS != SHELL_ACCESS
REPO_READ_WRITE != HOUSE_EXECUTION
TOOL_CATALOG != TOOL_EXECUTION
```

## Capability é runtime, não marca

```text
CHAT_GLOBAL + DOCS/CONTEXT
= RACIOCÍNIO / RECONCILIAÇÃO

CHAT_GLOBAL + GITHUB
= CAPABILITY DE REPO

CHAT_GLOBAL + SHELL|DESKTOP_BRIDGE|MCP_EXECUTOR AUTORIZADO
= CAPABILITY EXECUTORA NO ESCOPO MEDIDO
```

A mesma marca pode ter capabilities diferentes em sessões diferentes. Marcas diferentes podem ter a mesma capability quando recebem o mesmo toolset.

## Lei de evidência entre superfícies

```text
SAME_CLAIM + SAME_SCOPE + SAME_TIME
→ MEASURED_EVIDENCE > UNMEASURED_INFERENCE
```

Não existe regra fixa “Hermes > chat” ou “chat > Hermes”.

Exemplos:
- Hermes com shell mede melhor o filesystem/processo/HEAD local do corpo onde está executando.
- CHAT_GLOBAL com GitHub CURRENT mede melhor a main remota do que um checkout local atrasado.
- HEAD local não prova CURRENT main.
- CURRENT main não prova runtime local.
- falha/ausência de tool em uma superfície não prova ausência da capability no organismo.

## Autogrill obrigatório antes de claim de capability

```text
1. Qual é a classe da superfície?
2. Qual é a marca/proveniência?
3. Quais tools foram realmente medidas nesta sessão?
4. Qual capability deriva dessas tools?
5. Estou inferindo capability pelo nome do produto?
6. Existe evidência direta do mesmo claim/escopo/tempo?
7. O CHEFE já informou uma topologia que não foi falsificada pelo cânone/CURRENT?
```

```text
CAPABILITY_PRIOR_FROM_BRAND=FORBIDDEN
TOOLSET_MUST_BE_MEASURED_BEFORE_CAPABILITY_CLAIM=true
USER_STATED_SURFACE_FACT_OUTRANKS_ASSISTANT_GENERIC_PRIOR=true
REMOTE_INFERENCE_MUST_NOT_OVERRIDE_MEASURED_LOCAL_STATE_WITHOUT_COUNTEREVIDENCE=true
```

## Proveniência não deve ser apagada

Globalizar a regra não significa apagar história.

Correto:
```text
“sessão ChatGPT de 2026-09-29 observou X”
```

Errado:
```text
trocar toda ocorrência histórica de ChatGPT por CHAT_GLOBAL
```

Registros de sessão, incidentes, receipts e evidências mantêm a marca real. Owners normativos usam `CHAT_GLOBAL` quando a regra se aplica a qualquer chat.

## Owners evoluídos nesta passagem

- `.agents/skills/centraldark-unified-surface-parity/SKILL.md`
- `docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml`
- `.agents/plugins/centraldark-unified-surface-parity/skills/centraldark-unified-surface-parity/SKILL.md`
- `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`
- `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`
- `LEIA-ME-IA.md`
- `AGENTS.md`
- `CENTRALDARK_AI_BOOT.yaml`
- `apps/modulos/HERMES-CORE/prompts/hermes-core.md`
- `apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml`
- `docs/CONSCIENCIA/04-MCP-E-CONECTORES/EXECUTOR-CENTRALDARK-CHATGPT.md` — filename legado preservado
- `docs/ARQUITETURA/CENTRALDARK-INSTINTO-SUPERIOR-OS/CENTRALDARK-MATRIZ-BIDIRECIONAL-GOLDEN-CAPSULE.md`
- `.claude/skills/synced/voice-semantic-classifier/SKILL.md`
- `scripts/lupa/runtime-proof-same-target.test.mjs`

## Regra de remediação para inferência desse tipo

```text
INFERENCE_FINDING
→ CLASSIFY_AS_HISTORY_OR_NORMATIVE_OWNER
→ HISTORY? PRESERVE_PROVENANCE
→ NORMATIVE? RESOLVE_EXISTING_OWNER
→ REPLACE_BRAND_PRIOR_WITH_SURFACE_CLASS
→ MEASURE_TOOLSET
→ DERIVE_CAPABILITY
→ SCOPE_EVIDENCE_BY_CLAIM_TIME
→ TARGETED_TEST
→ READBACK
```

## Contraprova

- tool disponível não significa tool executada;
- GitHub write não significa shell;
- shell local não significa main atual;
- uma resposta correta não prova persistência global;
- uma marca conhecida não define papel ou autoridade;
- CHAT_GLOBAL não é novo cérebro, owner ou sistema.

## Cristal

```text
CHAT_GLOBAL_IS_CLASS_NOT_PRODUCT=true
CHATGPT_IS_ONE_CHAT_GLOBAL_SURFACE=true
SURFACE_NAME_IS_NOT_CAPABILITY=true
GITHUB_ACCESS_IS_NOT_SHELL_ACCESS=true
CHAT_GLOBAL_WITH_AUTHORIZED_SHELL_OR_BRIDGE_CAN_EXECUTE_IN_SCOPE=true
MEASURED_EVIDENCE_OUTRANKS_UNMEASURED_INFERENCE_FOR_SAME_CLAIM_SCOPE_TIME=true
LOCAL_HEAD_IS_NOT_CURRENT_MAIN_UNLESS_REMEASURED=true
CURRENT_MAIN_IS_NOT_LOCAL_RUNTIME_STATE_WITHOUT_LOCAL_MEASUREMENT=true
LOCAL_TOOL_MISS_IS_NOT_GLOBAL_CAPABILITY_MISS=true
PROVENANCE_SPECIFIC_BRAND_MUST_BE_PRESERVED=true
```

## NEXT_CURSOR

Qualquer novo executor/chat deve primeiro consumir docs/owners, classificar a superfície e medir tools antes de falar sobre capacidade. Nenhum prior genérico de marca substitui evidence/current.
