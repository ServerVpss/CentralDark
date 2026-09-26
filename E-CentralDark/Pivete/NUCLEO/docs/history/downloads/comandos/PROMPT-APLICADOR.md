# Prompt — aplicar quando for ligar no Hermes

```text
#ACORDAR
!CALIBRAR
!MULTIBUSSOLA

MISSÃO=CENTRALDARK-HERMES-BROWSER-ADAPTER-01

OBJETIVO:
ligar navegador do CHEFE + Zendriver ao Hermes através da arquitetura canônica existente,
sem criar segundo Hermes, segundo MCP, segundo event bus ou Browser Brain.

LEIA:
- LEIA-ME-IA.md
- AGENTS.md
- docs/CONSCIENCIA/EXPANSAO-DE-DOMINIO.md
- docs/INTEGRACOES/CHROME-DEVTOOLS-MCP.md
- docs/ARQUITETURA/EVIDENCE-ENVELOPE-CAUSAL.md
- docs/ARQUITETURA/AGENT-ADAPTER-CANONICO.md
- scripts/memory-linker/artifact-capability.mjs
- apps/modulos/HERMES-CORE/agents/Universal-Handler/agent.mjs
- apps/modulos/HERMES-CORE/agents/Executor/agent.mjs
- apps/modulos/HERMES-CORE/core/decisor.mjs
- apps/modulos/elite-gateway/
- este pack inteiro

REMEÇA ESTADO VIVO ANTES DE ESCREVER.

ARQUITETURA OBRIGATÓRIA:
FOREGROUND Chrome DevTools MCP
             \
              → Browser Bridge V1 → existing Universal-Handler → Hermes
             /
BACKGROUND Zendriver

Browser Bridge → existing evidence-envelope/agent-log
Browser observation útil → existing artifact-capability → Dream Review

NÃO CRIE ferramenta browser no Executor enquanto handler/http satisfizer o contrato.
NÃO copie MCPService do Bolt para Hermes.
NÃO use endpoint interno do ChatGPT como contrato.
NÃO exponha cookies/tokens.
NÃO publique bridge.
Bind local por default.

E2E:
T0 browser
T1 provider
T2 bridge
T3 Hermes
T4 Hermes return
T5 browser result
T6 evidence envelope

WIRED somente se T0-T6 passarem na lane correspondente.
```
