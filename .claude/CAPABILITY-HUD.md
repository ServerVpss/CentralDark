# Claude Capability HUD — ponte para .agents

Este arquivo não cria governo paralelo. Ele aponta Claude/Claude Code para o contrato canônico em `.agents`.

```text
CANONICAL_CAPABILITY_HUD=.agents/CAPABILITY-HUD-BOOT.json
CANONICAL_SKILL=.agents/skills/centraldark-capability-hud/SKILL.md
INTENT_ROUTER=.agents/skills/centraldark-intent-deploy-router/SKILL.md
ACORDAR_CALLS_CAPABILITY_HUD=true
```

## Regra

Antes de Claude dizer que não consegue, que falta ferramenta, que falta link, run id ou device, precisa tentar a rota segura pertinente.

`#ACORDAR` / `!ACORDAR` chama este HUD automaticamente: acordar não é só lembrar contexto; é medir capacidade real da sessão antes de responder, perguntar, recusar ou mutar.

```text
#ACORDAR
→ LOAD_CAPABILITY_HUD
→ PROBE_RELEVANT_TOOL
→ IF_FAIL, REPORT_REAL_BLOCKER
→ ASK_ONLY_MINIMUM_IDENTIFIER
```

```text
TOOL_UNKNOWN
→ LOAD_CAPABILITY_HUD
→ PROBE_RELEVANT_TOOL
→ IF_FAIL, REPORT_REAL_BLOCKER
→ ASK_ONLY_MINIMUM_IDENTIFIER
```

## Saída mínima quando travar

```text
PAREI_EM=
BLOQUEIO_REAL=
JA_TENTEI=
IDENTIFICADOR_MINIMO_PARA_CONTINUAR=
```

## Cadeados

```text
TOOL_LISTED != TOOL_ACTIVE
OAUTH_CONNECTED != DEVICE_USABLE
SEARCHED != VERIFIED
COMMIT_EXISTS != CI_PASS
PATCHED != ROOT_CAUSE_FIXED
UNKNOWN != PASS
```
