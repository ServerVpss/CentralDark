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


## Convergência API + MCP + One Heart — PR único de aceite E2E (2026-10-09)

**Intenção vigente do CHEFE:** um Instinto Superior administrativo, **uma API/fachada canônica, um MCP/dispatcher oficial e um One Heart**, sem novos serviços, motores de log, gateways, schedulers, painéis ou owners. O Hermes usa o catálogo e os endpoints autorizados; Casa/VPS/Omni permanecem capacidades atrás dos owners existentes. Todas as frentes convergem no **mesmo PR de aceite**; os PRs anteriores servem de proveniência, não de segundo trabalho concorrente.

**Baseline GitHub para início:** \`main@98eb21d292465e74b030b6a48f38441fd470b0c9\`. Qualquer HEAD posterior exige remedição antes de afirmar CURRENT. As contagens \`141 dispatchables / 11 rotas / 20 operações administrativas\` e \`153 tools MCP público\` são inventários históricos de **escopos distintos**; código de \`mcp-admin.js\` descreveu **13 rotas lógicas** numa leitura posterior. Não consolidar contagens sem \`catalogVersion + policy + runtime\` do mesmo alvo. API única significa **entrada/roteamento coerente**, não apagar portas, serviços técnicos ou compatibilidade.

### Owners que NÃO mudam

| Escopo | Owner existente |
|---|---|
| Intenção, aceitação e convergência visual | Este programa e \`docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md\` |
| API/MCP HTTP, OAuth e compatibilidade | \`apps/modulos/mcp/src/index.js\`, \`src/mcp-server.js\`, \`src/oauth.js\` |
| Dispatcher e rotas de capacidade | \`apps/modulos/mcp/src/tools/core/mcp-admin.js\`, \`tools-catalog.js\` |
| Logs canônicos | \`apps/modulos/mcp/src/log-funnel.js\` e consumidores \`/admin/logs/stream\`; **não criar coletor novo** |
| One Heart e telemetria | \`apps/modulos/mcp/src/operational-telemetry.js\` + \`GET /heartbeat\` existente |
| Omni/FastAPI | \`apps/modulos/elite-gateway/scripts/centraldark_omni_router.py\` |
| Hermes/Goal/Oracle | Hermes Core e \`centraldark-oracle-surface\` existentes; Goal vigente quando aplicável |
| HUD/Obsidian/Casa | \`docs/HUD/HUD.html\` nas três abas + plugin/vault existentes; **cópia da Casa não é outro owner** |
| Rotas Tailscale/SSH/edge | \`mcp-admin.js\` + documentos de gateway/rotas existentes; configuração real do proxy medida antes de mudanças |

### Fluxo obrigatório de evidência — uma só linha causal

\`CHEFE → Instinto Superior/HUD → API autorizada → MCP catalog/dispatcher → Hermes / Omni / Casa via Tailscale / VPS → efeito real → log-funnel existente → /heartbeat + /admin/logs/stream → readback no HUD + receipt + NEXT_CURSOR\`.

Logs de serviços distintos usam **adapters/consumers que já existem** e não ganham writer global adicional. Se um serviço ainda não emite para esse funil, marcar GAP específico do producer/adapter e provar o delta mínimo no seu owner; não declarar que a integração está pronta por existir a pasta.

A estrutura do coletor é **única**, com segregação por finalidade e serviço:

\`\`\`text
/root/CentralDark/logs/
  events/YYYY-MM-DD.jsonl            # trilha normalizada comum
  sectors/<setor>/YYYY-MM-DD.jsonl   # projeção por setor
  services/<servico>/YYYY-MM-DD.jsonl # projeção por serviço, inclusive MCP e Hermes quando emissão estiver comprovada
\`\`\`

Esses três caminhos são materializações do mesmo evento (\`event_id\`/timestamp/proveniência), **não três coletores**; preservar logs brutos de PM2/systemd e trilhas/auditorias pré-existentes. \`CENTRALDARK_LOG_ROOT\` deve continuar resolvido pelo owner; não assumir que todos os runtimes usam o mesmo filesystem. Nunca registrar tokens/corpos sensíveis.

### Critérios de aceite únicos deste PR — todos começam UNKNOWN até prova por SHA/alvo

- [ ] **API01 — CURRENT/owners:** GitHub \`main\`, HEAD do PR, VPS, checkout de execução, dirty files, writers e serviços/PIDs com timestamp; sem misturar source e runtime.
- [ ] **API02 — edge/rotas:** confirmar configuração viva para \`admin.centralldark.com\`, \`mcp.centralldark.com\`, \`api.centralldark.com\`, \`ui.centralldark.com\`; HTTPS, paths legados e reverso da VPS comprovados; não inventar nova API pública.
- [ ] **API03 — serviço MCP carregado:** systemd/ExecStart/cwd/PID, \`src\`/\`dist\` e \`:9100\` correlacionados; \`GET /health\`, \`/health/deep\`, \`/heartbeat\`, \`/tools.json\`; \`HTTP200 != E2E\`.
- [ ] **API04 — autenticação real:** OAuth/PKCE discovery/\`authorize\`/\`token\`, Bearer/escopos MCP vs Admin, cookies de sessão admin, 401/403 esperados; somente metadados sanitizados, nunca valores secretos.
- [ ] **API05 — catálogo único:** \`mcp_admin_catalog\`, \`tools-catalog.js\`, \`mcp_admin_call\`, \`catalogVersion\`, policy, ferramentas e rotas com mesma versão carregada; não somar 141/153/13.
- [ ] **API06 — execução Hermes→MCP:** o Hermes aciona tool read-only já autorizada via dispatcher; provar request-id, policy, resultado real, readback e receipt do MESMO \`LOOP_ID\`/\`PARENT_ID\`.
- [ ] **API07 — Casa/Tailscale/SSH:** confirmar tailnet e rota bidirecional atual, autenticação da tool e execução de uma capacidade segura na Casa. PONG histórico, porta OPEN e dispositivo online são provas separadas.
- [ ] **API08 — Omni/FastAPI:** conferir serviço/portas e \`/health\`, \`/v1/models\`, rotas de inferência e \`/kernel/vps/delta/*\`; Omni não substitui o MCP.
- [ ] **API09 — coletor único:** testar \`appendCentralEvent\` sem segredos, mesmo \`event_id\` nas três materializações \`events\`, \`sectors\`, \`services\`, schemas, permissões e append-safe; rollback/contraprova.
- [ ] **API10 — logs MCP:** uma chamada MCP autorizada deve produzir evento sanitizado atribuível ao MCP no funil e readback via consultas/stream existentes; eventos não devem depender de abrir o painel.
- [ ] **API11 — logs Hermes e outros setores:** validar producers/adapters existentes (Hermes/agents/VPS/Omni/Screenpipe quando aplicável) e respectivas pastas por setor/serviço; ausência de source vira PLACA, não novo coletor.
- [ ] **API12 — One Heart:** \`GET /heartbeat\` agrega **estado derivado** dos setores, sem substituir o log completo; inclui status, timestamp, frescor, contadores, erros, warnings e \`UNKNOWN\` correto quando fonte falha.
- [ ] **API13 — SSE/autorização:** \`/admin/logs/stream\` autenticado propaga eventos com filtro/proveniência, reconexão e consumer real, sem cruzar boundaries nem vazar segredos.
- [ ] **API14 — HUD três abas:** \`HUD/MAPA/FORJA\` existentes exibem acertos, fingerprints, PROVEN_FLOOR, erros/UNKNOWN com \`VER PENDÊNCIA\`, dono, receita e NEXT_CURSOR; não criar quarto painel nem sobrepor writer do PR #1767/#1777.
- [ ] **API15 — espelho Casa/Obsidian:** comparar hash do \`docs/HUD/HUD.html\` aprovado com arquivo local Windows; espelhar **somente por rota autorizada viva**, testar abertura/atualização do HUD existente. Ponte offline = BLOCKED neste critério, não PASS.
- [ ] **API16 — provas e recuperação:** testes do cone afetado, rollback, prova negativa auth, source/runtime hash, CI mesmo SHA, receipt sanitizado e Reality Judge **após** efeito; \`MERGED != DEPLOYED\`, \`CODE=CURRENT != RUNTIME=LOADED\`.

### Coordenação dos trabalhos no PR ÚNICO

- **ONE_WRITER_PER_SCOPE:** Hermes executa/coordena o writer de cada owner, leitores/Oracles podem operar em paralelo; não gravar simultaneamente \`docs/HUD/HUD.html\` em #1767, #1777 e neste PR.
- **PRs #1767 e #1777:** recuperar resultados/patches aproveitáveis e conciliar no cone correto antes de promover; sem fechar, rebasear ou sobrescrever PR alheio automaticamente.
- **PRs-mãe #1562 e #1757:** histórico fechado; não reabrir nem tratar como trabalho ativo.
- **GOAL/CRITÉRIOS:** parent continua vivo até aceitação real; \`CHILD_DONE != PARENT_DONE\`. Acompanhar cada APIxx com \`PROVEN/FAIL/UNKNOWN/BLOCKED\`, fonte, SHA/PID, receipt, contraprova e cursor.
- **VPS e Casa:** cópia de docs/receitas não é deploy de código; nenhum reset, stash, rebase destrutivo ou restart por reflexo. Se recarregar binário for causalmente necessário, medir primeiro e registrar como delta separado.
- **SEM_NOVO_MOTOR:** nenhuma segunda API, MCP, gateway, scheduler, health, heartbeat, agregador, coletor, dashboard, pasta nova de logs ou engine de memória.
- **FALHA:** \`PLACA → VER PENDÊNCIA → owner → receita → NEXT_CURSOR\`. **ACERTO:** \`proof_key/fingerprint compatíveis → REPLAY_BEFORE_REDISCOVERY\`; nada de provar tudo outra vez.
- **Casa indisponível nesta consulta:** Desktop Commander informou \`SEGREDO OFFLINE\`, portanto \`API15=BLOCKED_BY_CURRENT_ROUTE\`; não apresentar arquivo Windows como sincronizado.

**NEXT_CURSOR:** \`CURRENT_MAIN_PR_VPS_CASA → IDENTIFY_ACTIVE_WRITERS → API03_MCP_9100_ENTRYPOINT → API04_AUTH → API05_CATALOG → API09_LOG_FUNNEL → API10_MCP_EVENT → API12_HEARTBEAT → API13_SSE → API14_HUD → API15_OBSIDIAN → API16_RECEIPT\`.

**FIXED_POINT:** somente quando todos os API01–API16 necessários ao objetivo estiverem satisfeitos por evidência causal, com nenhum UNKNOWN material; nenhum PASS por declaração textual.

<!-- API1788_HUD_CURRENT_CASA_PR_FIRST_20261009 -->
### PR #1788 · HUD vivo MAIN + Casa · fase CURRENT, sem segunda caneta (09/10/2026)

**Intenção viva:** antes de qualquer função operacional de API/MCP/Hermes/One Heart consultar o PR ativo do escopo **dentro da projeção do HUD existente**, e confrontar `MAIN_HEAD`, `PR_HEAD`, checks do mesmo SHA, receipts, `docs/HUD/HUD.html@main`, materialização VPS e arquivo Obsidian da Casa. Reutilizar a leitura dentro do turno enquanto `proof_key` não mudar; se mudar, atualizar só o cone afetado. Owner de entrada já existente: `docs/ARQUITETURA/CENTRALDARK-GITHUB-ENTRY-HUD-GATE.md`, `AGENTS.md` e `scripts/trigger-fabric/centraldark_full_trigger_boot.py`. **Não** criar outro gate, webhook, API, MCP, HUD ou scheduler.

**CURRENT observado:** `main=e073059e0f76a53290886b56cbf668bf53d4b7f5`, PR #1788 no HEAD `f0ec9e09ef720b5f28f0ed3bfdfac2016c2d2539`, com os critérios API01–API16 ainda abertos. Origem/PR avançam: revalidar antes de promover. A correção documental de credenciais `e073059` consta na main; isso não comprova revisão de credenciais no runtime. `LINEAGE_MANIFEST_DRIFT` foi reportado no gate e continua pendência até readback por SHA.

**Contraprova Casa→VPS enviada no terminal (snapshot, não estado eterno):** `SYNC_RC=2`, `VPS_HEAD=8ef0f065db197e4f2d3a68d2a1747f1e4d0f3588`, `MAIN_HEAD=98eb21d292465e74b030b6a48f38441fd470b0c9` naquele fetch, `TRACKED_DIRTY=1`, `HUD_MIRROR_MATCH_RC=1`, `SSH_EXIT=2`. A rota Remote Desktop Commander `SEGREDO` apareceu offline neste turno. **Sem** promover VPS/Casa sync a PASS, sem reset/stash/clean/rebase nem substituir arquivo físico desconhecido.

**Contrato de aceitação que já pertence aos critérios API01, API09–API16:**
- **PR/HUD primeiro:** projetar PR #1788 (ou sucessor medido), main, HEAD, checks, fonte de prova, observado_em, frescor e `NEXT_CURSOR` nos campos do HUD/MAPA/FORJA já existentes; valor vencido vira `STALE`, falha vira `VER PENDÊNCIA`. Não gravar HEAD estático como se fosse LIVE. Reutilizar polling/SSE e consumidores já existentes em vez de inventar atualização paralela.
- **Logs com mesmo coração:** `event_id` do producer autorizado atravessa o único `apps/modulos/mcp/src/log-funnel.js`, materializa `logs/events`, `logs/sectors/<setor>`, `logs/services/<servico>`; `GET /heartbeat` consome estado derivado e `/admin/logs/stream` transmite via auth. Falta de prova do producer vira PLACA, não novo coletor.
- **MAIN ↔ VPS ↔ Casa:** o único `docs/HUD/HUD.html` é a fonte de projeção aprovada; materialização de `/root/.centraldark/HUD.html` e espelho Obsidian usam owners e rotas autorizados existentes. Só `SHA256_MAIN=SHA256_VPS=SHA256_CASA` + abertura visual comprova API15. Caso Casa offline, `API15=BLOCKED`, sem falso verde.
- **Único writer HUD:** #1767 e #1777 já modificam o mesmo owner. Primeiro recuperar patches e combinar critérios, escolher um writer, e **só então** aplicar ao `docs/HUD/HUD.html` no PR #1788. Nenhuma escrita concorrente desse arquivo.
- **Proven floor:** preferir ACERTOS históricos com `OWNER/PROOF_KEY/FINGERPRINT/RECEIPT`; fracassos viram PLACA com `ERRO/ROTA/OWNER/PROVA/NEXT_CURSOR`. O que não mudou reutiliza prova, o que mudou retesta apenas o cone.

**Memória — apenas recibo pendente informado, não mutação:** revisão de 20 propostas = `1 MERGE_CANDIDATE`, `5 DUPLICATE_REJECT`, `14 REBUILD_REQUIRED`, `APPROVED=0`; memória ativa e aprendizagem pertencem aos owners existentes, não à caneta da API/MCP.

**PLACAR NESTE DOCUMENTO:** `PR_CURRENT_READ=PASS`; `API01_FULL=UNKNOWN`; `API09-API13_E2E=UNKNOWN`; `API14_LIVE_HUD=UNKNOWN`; `API15_CASA_MIRROR=BLOCKED_BY_ROUTE`; `GLOBAL_FIXED_POINT=FALSE`. Este delta é **contrato/coordenação**, não implementação nem prova de runtime.

**NEXT_CURSOR:** `PR1788_READBACK → ONE_HUD_WRITER → API03_MCP_LOADED → API09_LOG_EVENT_ID → API12_ONE_HEART → API14_PR_HUD_LIVE → API15_CASA_MIRROR_SHA → API16_RECEIPT`.
<!-- /API1788_HUD_CURRENT_CASA_PR_FIRST_20261009 -->

<!-- PR1788_API14_API15_API16_HUD_TRIPLE_SHA_READBACK_20261009 -->
## Contraprova API14–API16 · HUD único / Espelho MAIN ↔ VPS ↔ CASA (09/10/2026)

**Pedido do CHEFE:** executar no owner existente e atualizar **este mesmo PR #1788**, sem segundo HUD, coletor, PR, serviço, arquivo auxiliar nem reset da VPS. Prova de arquivo ≠ prova de UI/runtime. Este receipt é um snapshot mais recente que a placa `API15=BLOCKED_BY_ROUTE` histórica acima: a rota Desktop Commander foi reavaliada e respondeu.

### CURRENT e proveniência do mesmo escopo

- `MAIN_HEAD=5344bd87074c334ddf3ac322ae7d6aaacecdf665` (medido via GitHub e novamente por `gh api` na Casa antes do espelho).
- `PR1788_HEAD_BEFORE_RECEIPT=c33197eb5da69b06ba045ec6c5006a7efa89239e`; após este commit, usar o HEAD atualizado da PR.
- `CASA_DEVICE=SEGREDO`: Desktop Commander `Online` + `pong`, e execução PowerShell remota confirmada neste turno.
- `CASA_TO_VPS_SSH=PASS`: alias preexistente `Segredo-VPS` retornou `CENTRALDARK-OS`, `SSH_EXIT=0`. Não foi criada outra rota ou alterada chave.
- `VPS_REPO_HEAD=e073059e0f76a53290886b56cbf668bf53d4b7f5` anterior ao espelho; `TRACKED_DIRTY=1` no script `scripts/register-github-webhook.sh`. Checkout não sofreu pull/reset/clean; **espelhar o HTML não é atualizar o checkout nem carregar serviço**.

### API15 — espelho do MESMO HUD.html, arquivo por arquivo

| Ponto | Antes do delta (SHA-256) | Readback pós-delta (SHA-256) |
|---|---|---|
| `docs/HUD/HUD.html@main` | `00A35C33…EA9950` | `00A35C33…EA9950` |
| VPS `/root/.centraldark/HUD.html` | `28036038…6F6621E` | `00A35C33…EA9950` |
| Casa `C:\\Users\\Administrador\\Documents\\Obsidian Vault\\🪬Centraldark -HUD🪬\\HUD.html` | `B20A3949…3C243C3` | `00A35C33…EA9950` |

**SHA-256 integral 3/3:** `00A35C33DCE62AEC5E34B72B1DF6AF784D6ECA2E1451DD08BCFBDA0C86EA9950`, `221001 bytes` em cada materialização. Na **segunda leitura independente**, `MATCH_3=True` com o mesmo MAIN_HEAD. Foram escritos **somente os dois `HUD.html` físicos já existentes**, sem backup, arquivo auxiliar, restart, cópia de chaves, alteração do checkout ou modificação do `docs/HUD/HUD.html@main`.

**Conservação de conteúdo:** os três HTMLs já tinham 15 cadeados históricos com os mesmos nomes; a versão da main preserva esses 15 e inclui o catálogo de 13 rotas. O readback de arquivo **passou**. A Casa tinha Obsidian/HUD GUI **fechados** no teste final; não abriu janela nova. `API15_FILE_HASH=PASS`, `API15_UI_VISUAL_READBACK=UNKNOWN`, portanto **API15 E2E ainda NÃO é PASS global**.

### API14 / API16 — escopo e lacunas sem falso verde

- `API14=PARTIAL`: `docs/HUD/HUD.html` da main preserva o catálogo de 13 rotas e os 15 cadeados. Leitura do HTML demonstrou superfície documental; prova de atualização dinâmica HUD/MAPA/FORJA com `event_id`, `VER PENDÊNCIA`, serviço e usuário autenticado segue `UNKNOWN`.
- `API16=PARTIAL`: proveniência com `MAIN_HEAD`, pré-hashes, pós-hashes e readback independente está registrada. A consulta a status GitHub do HEAD anterior da PR devolveu lista vazia `statuses=[]`: **não equivale a CI PASS**. Testes negativos OAuth, evento sanitizado no funil, SSE real e UI visual não foram executados.
- `MCP_9100_HTTP=000`, `ONE_HEART_9100_HTTP=000`, `SSE_9100_UNAUTH_HTTP=000` em sondagem pela VPS: sem resposta HTTP, não equivale a 401/403 nem a autenticação reprovada. Nenhum restart foi tentado.
- Conector administrativo CentralDark para status VPS/deploy/Tailscale retornou `The tool failed internally` neste turno; **somente essa rota falhou**. A SSH Casa→VPS foi provada independentemente.
- `API09_API13_E2E=UNKNOWN`; `VPS_RUNTIME_LOADED=UNKNOWN`; `MAIN_TO_VPS_CHECKOUT_SYNC=NOT_DONE`; `GLOBAL_FIXED_POINT=FALSE`. Não elevar documentação ou espelho de HTML a deploy.

**NEXT_CURSOR do mesmo PR:** medir owner MCP `:9100` (processo/ExecStart, sem reiniciar por reflexo) → provar evento sanitizado no `log-funnel.js` `events/sectors/services` → provar One Heart/SSE autenticado → HUD/MAPA/FORJA atualizar no mesmo evento → abrir o HUD existente no Obsidian sem outro painel → readback visual e CI no mesmo SHA → fechar API14–API16 apenas se todos os critérios sobreviverem à contraprova.

**Estado:** `HASH_MIRROR_3_OF_3=PASS`; `API14=PARTIAL`; `API15_FILE_MIRROR=PASS`; `API15_UI=UNKNOWN`; `API16=PARTIAL`; `NO_NEW_ARCHITECTURE=true`. A fonte e o writer canônicos continuam os mesmos.
<!-- /PR1788_API14_API15_API16_HUD_TRIPLE_SHA_READBACK_20261009 -->
