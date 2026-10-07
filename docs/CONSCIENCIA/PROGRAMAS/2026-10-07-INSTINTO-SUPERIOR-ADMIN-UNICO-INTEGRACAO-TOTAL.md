# 2026-10-07 — Instinto Superior · Admin Único · Integração Total

## Intenção do CHEFE

A CentralDark terá uma única superfície administrativa humana em `admin.centralldark.com`, com identidade visível `Instinto Superior`. AionUi, Rakazo, MCP, Hermes, One Heart/HUD, Knowledge Hub/Grafo, modelos, skills, tools, CI, runtime, remoto e integrações continuam existindo como capabilities/owners reais por baixo, sem reescrita desnecessária. Primeiro integrar e enquadrar tudo no mesmo cockpit; depois absorver gradualmente as cascas redundantes, capability por capability, preservando ouro funcional e compatibilidade.

## Invariantes

- CURRENT > HISTORY
- REALITY_IS_JUDGE=true
- REUSE_BEFORE_CREATE=true
- ONE_SYSTEM_ONLY=true
- ONE_WRITER_PER_SCOPE=true
- UNKNOWN_IS_NOT_PASS=true
- ACTION_IS_NOT_PROOF=true
- DOCUMENTED_IS_NOT_EXECUTED=true
- MERGED_IS_NOT_DEPLOYED=true
- ROUTE_LEGACY_IS_NOT_OWNER=true
- PRESERVE_GREEN_STATE=true
- NO_SECOND_BRAIN=true
- NO_SECOND_HERMES=true
- NO_SECOND_SCHEDULER=true
- NO_SECOND_WEBHOOK_ENGINE=true
- NO_SECOND_MEMORY_ENGINE=true
- NO_SECOND_HEALTH_AGGREGATOR=true
- NO_SECOND_GATEWAY=true

## Arquitetura-alvo de superfície

`admin.centralldark.com`
→ **Instinto Superior**
→ uma única navegação humana
→ capabilities internas apontando para owners/runtimes existentes.

`centralldark.com`
→ landing pública / portfólio
→ sem função operacional administrativa
→ pode permanecer mínima/branca enquanto a landing não for construída.

### Capabilities dentro do Instinto Superior

1. **Visão Geral / One Heart**
   - health
   - health/deep
   - score de saúde
   - SSE
   - erros/warns/requests
   - dependências
   - heartbeat
   - forensic
   - runtime/processo

2. **Agents / Bots**
   - AionUi agent inventory
   - Rakazo bots/agentes
   - Hermes executor
   - workers
   - delegação

3. **Modelos / Inteligência**
   - modelos locais
   - Grok
   - Gemini
   - Kylin
   - bindings
   - reasoning/model selection

4. **Skills / Habilidades**
   - catálogo
   - status
   - install/update
   - skill trust/quarantine
   - self-evolution quando CURRENT comprovar

5. **Ferramentas / MCP**
   - catálogo MCP
   - clients/config
   - policy/admin
   - tools
   - connector
   - runtime MCP

6. **Conhecimento**
   - Grafo Celestial
   - Knowledge Hub
   - memória
   - consciência
   - aprendizados
   - lembranças
   - padrões
   - personal context

7. **Projetos / Trabalho**
   - Linear
   - issues/workspaces
   - trabalho recente

8. **CI / Execução**
   - GitHub Actions
   - Buildkite
   - self-hosted runners
   - receipts/checks

9. **Observabilidade**
   - logs/events
   - sectors/mcp
   - sectors/hermes
   - sectors/agents
   - mcp-audit
   - mcp-admin-audit
   - SSE live stream
   - forensic
   - model bindings
   - delta útil / erros únicos / repetição

10. **Runtime / Fabric**
    - Hermes Core
    - Omni Router
    - Live Execution Fabric
    - workers
    - NEXT_CURSOR
    - receipts
    - Git HEAD / dirty state

11. **Integrações**
    - GitHub
    - Supabase
    - Notion
    - Figma
    - Sentry
    - Buildkite
    - Linear
    - demais connectors vivos

12. **Remoto / Rede**
    - Tailscale
    - VPS
    - Casa
    - SSH
    - RDP
    - Remote Desktop
    - Screenpipe
    - tailnet/MagicDNS

13. **Sistema / Diagnóstico**
    - deep health
    - service status
    - diagnostic E2E
    - admin policy
    - runtime/process state

## GOLD_KEEP agora

- AionUi vivo na VPS, incluindo Agents, Bots/Agentes, Modelo, Habilidades, Ferramentas, Remoto e Sistema.
- Rakazo vivo, incluindo bots persistentes, browser, desktop, terminal, workers, sandbox, MCP, memória e delegação.
- MCP runtime em `:9100` e seus endpoints/API.
- Hermes Core, gateway, scheduler/cron, kanban e continuity existentes.
- `centraldark-oracle-surface` como capability consultiva, não segundo cérebro.
- One Heart/health existente; não criar outro agregador.
- Omni/Live Execution Fabric.
- Grafo Celestial / Knowledge Hub / memória e aprendizagem.
- Caddy como edge/router existente.
- Portas internas existentes podem permanecer por trás da superfície única.
- Rotas legadas permanecem quando houver consumer/compatibilidade.

## O que some como superfície/duplicação

- A tela isolada `MCP CentralDark · Painel Admin` deixa de ser produto administrativo próprio.
- `mcp.centralldark.com/admin` pode sobreviver como alias/redirect/compatibilidade para a capability MCP do Instinto Superior.
- Duplicação visual real em `apps/modulos/mcp/src/admin.js`:
  - Auditoria aparece duas vezes
  - Conector aparece duas vezes
  - Diagnóstico aparece duas vezes
  Isso é FRICTION/DUPLICATE, não capability distinta.
- Branding visível `AionUi` e `Rakazo` deixa de ser identidade principal; passam a ser engines/origens/capabilities do Instinto Superior.
- Não renomear cegamente nomes técnicos internos, services, paths ou envs enquanto houver valor operacional em preservá-los.

## Rotas e compatibilidade

- `admin.centralldark.com` = entrada privada canônica do Instinto Superior.
- `centralldark.com` = futura landing pública.
- `mcp.centralldark.com` = runtime/API/compatibilidade MCP.
- `mcp.centralldark.com/admin` = compatibilidade; não owner visual.
- AionUi `:25808`, Rakazo `:25810`, MCP `:9100`, Hermes e demais portas internas podem permanecer enquanto o edge apresenta uma superfície única.
- Uma porta externa/HTTPS não significa uma única porta interna.

## Feridas que DEVEM continuar visíveis até resolver

Medição VPS de 07/10/2026:
- `/health` = HTTP 200.
- catálogo MCP = 153 tools.
- `/health/deep` = HTTP 503, score 67.
- `hub_mission_consumer` = FAIL / disabled por `SUPABASE_URL_MISSING`.
- subsistema Telegram naquele runtime = FAIL/unreachable.
- loadavg acima do threshold na medição.
- `/heartbeat` = HTTP 500 por `ReferenceError: operational is not defined`.
- dispatcher Hermes registrou pressão de memória e limitou novos workers a 1 por tick.
- houve histórico recuperado de `lost durable fire claim ownership`; failure_streak atual voltou a 0.
- UNKNOWN/FAIL não pode ser escondido visualmente durante a convergência.

## Ciclo Hermes ↔ Oracle já existente

Owner: `centraldark-oracle-surface`.

```
CHEFE
→ Hermes continuity
→ centraldark-oracle-surface
→ CHAT_GLOBAL / Oracle
→ CORRELATE_RESPONSE
→ CURRENT + owner + runtime
→ EXECUTE_EXISTING_OWNER
→ MEASURE
→ COUNTERPROVE
→ RECEIPT
→ NEXT_CURSOR
→ RETURN_TO_ORACLE
→ REPEAT
→ FIXED_POINT
```

O `CentralDark Eternal Self-Heal` é watchdog/recovery/resume. O timer não substitui o loop ativo.

Contrato:
- `ORACLE_OUTPUT_IS_CANDIDATE=true`
- `ORACLE_CANNOT_WRITE_CANONICAL_STATE_DIRECTLY=true`
- `PARALLEL_PERCEPTION=true`
- `SERIALIZED_MUTATION=true`
- `BACKGROUND_TASK_RUNNING != CONTROLLER_BLOCKED`
- `ORACLE_RESPONSE + NEXT_READONLY_PROBE != GOAL_DONE`
- `GOAL_DONE` apenas em FIXED_POINT provado ou HUMAN_FRONTIER real.

## Sequência de integração — um tiro, sem micro-passos humanos

1. Remeasure CURRENT/main + runtime VPS + PRs/receipts/owners.
2. Congelar GOLD_KEEP e identificar writer atual por escopo.
3. Definir `admin.centralldark.com` como envelope visual canônico do Instinto Superior usando o edge existente.
4. Encaixar AionUi e Rakazo como capabilities dentro da mesma navegação, sem reescrever seus motores.
5. Migrar a superfície do MCP Admin para os setores corretos do Instinto Superior:
   - One Heart
   - Ferramentas/MCP
   - Conhecimento/Grafo
   - Projetos/Linear
   - Observabilidade/Auditoria
   - Modelos/Grok
   - CI/Buildkite
   - Runtime/Omni
   - Remoto/Tailscale
   - Sistema/Diagnóstico
6. Preservar endpoints/API MCP e rotas de compatibilidade.
7. Deduplicar Auditoria/Conector/Diagnóstico visualmente.
8. Aplicar branding visual `Instinto Superior` com subtítulos por capability; manter nomes técnicos internos quando isso evita drift.
9. Conectar estados ao One Heart existente; não inventar cards verdes.
10. Expor feridas reais como FAIL/UNKNOWN até correção.
11. Corrigir feridas no owner correto somente depois de identificadas e contraprovar:
    - heartbeat `operational`
    - health/deep dependencies
    - Telegram health
    - hub mission consumer
    - pressão/load quando material
12. Provar cada migração com readback de UI, endpoints, logs, health e compatibilidade.
13. Preservar rollback.
14. Commitar por blocos coerentes no owner existente.
15. Registrar receipt e NEXT_CURSOR no ledger vigente; não criar nova PR-mãe.
16. Continuar automaticamente até o strongest safe FIXED_POINT.

## Owners/arquivos já identificados

- MCP runtime/admin:
  - `apps/modulos/mcp/src/admin.js`
  - `apps/modulos/mcp/src/index.js`
  - `apps/modulos/mcp/dist/index.js`
  - `apps/modulos/mcp/src/health-deep.js`
  - `apps/modulos/mcp/src/operational-telemetry.js`
- AionUi / Instinto Superior:
  - `/var/opt/centraldark/aionui` no runtime VPS
  - source/overlay já existente em `experiments/aionui-centraldark-instinto-superior/`
- Hermes:
  - `apps/modulos/HERMES-CORE/core/orchestrator.mjs`
  - skill `centraldark-oracle-surface`
  - job existente `CentralDark Eternal Self-Heal`
- Edge:
  - Caddy existente na VPS; medir config vigente antes de qualquer delta.
- Rakazo:
  - manter owner/runtime atual e integrar por capability/surface antes de absorver código.

## Critério de sucesso

```
ONE_ADMIN_ENTRY=true
INSTINTO_SUPERIOR_IS_VISIBLE_IDENTITY=true
AIONUI_GOLD_PRESERVED=true
RAKAZO_GOLD_PRESERVED=true
MCP_RUNTIME_PRESERVED=true
MCP_ADMIN_STANDALONE_SURFACE_RETIRED_OR_COMPAT_ONLY=true
LEGACY_ROUTES_COMPATIBLE=true
NO_SECOND_BRAIN=true
NO_SECOND_OWNER=true
NO_SECOND_SCHEDULER=true
NO_SECOND_HEALTH=true
OBSERVABILITY_PRESERVED=true
UNKNOWN_VISIBLE=true
ALL_MUTATIONS_COUNTERPROVEN=true
FIXED_POINT=true
```

## NEXT_CURSOR

Remeasure CURRENT/main and active writers, then execute this integration through the existing Hermes continuity/oracle loop. Do not stop at a report; stop only at proven FIXED_POINT, real HUMAN_FRONTIER, or explicit CHEFE cancellation.
