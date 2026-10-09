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

<!-- PR1788_MCP_WEBHOOK_AUTOSYNC_READBACK_20261009 -->
## Readback MCP + webhook + sync autônomo — CURRENT

**Fonte da medição:** `main=5344bd87074c334ddf3ac322ae7d6aaacecdf665`; PR #1788 antes deste commit: `9fac8bfc1d7345b9ee64d2eb5a009ed9a4523553`.

### Acertos provados

- `centraldark-native-mcp-http.service=active`, PID `197693`, processo carregado pelo `EnvironmentFile` protegido existente.
- `:9100` escutando e `http://127.0.0.1:9100/health` respondeu `ok=true`, `service=mcp-centraldark`.
- `https://api.centralldark.com/deploy/health` respondeu HTTP 200 e declarou `canonicalOwner=scripts/vps/auto-sync-main.sh`.
- Assinatura inválida no `POST /webhook` foi rejeitada com HTTP 401 `INVALID_SIGNATURE`.
- Webhook GitHub existente ID `647381247`: ativo, evento `push`, URL `https://api.centralldark.com/webhook`.
- Cron existente na VPS: `*/5 * * * * /root/CentralDark/scripts/vps/auto-sync-main.sh`.
- O handler existente delega `push` assinado de `refs/heads/main` para `scripts/vps/auto-sync-main.sh`; não há segundo webhook, scheduler ou dispatcher.

### Limites mantidos

- O webhook reage a `push` na `main`; não é um evento direto de `pull_request`.
- `VALID_GITHUB_WEBHOOK_DELIVERY=UNKNOWN`: não foi executada entrega assinada válida nesta medição.
- A resposta pública de `deploy/health` indicou `signature=missing`; portanto o transporte está vivo, mas a chave HMAC do webhook ainda não está comprovada no runtime.
- `VPS_HEAD == origin/main` e `auto-sync.log` devem ser lidos após uma entrega válida antes de fechar o efeito autônomo.

```text
MCP_LISTENER=PASS
MCP_HEALTH=PASS
PUBLIC_DEPLOY_HEALTH=PASS
INVALID_SIGNATURE_REJECT=PASS
WEBHOOK_DECLARATION=PASS
VPS_CRON_OWNER=PASS
VALID_WEBHOOK_DELIVERY=UNKNOWN
AUTOSYNC_EFFECT=UNKNOWN
FIXED_POINT_GLOBAL=FALSE
```

**NEXT_CURSOR:** disponibilizar/provar `GITHUB_WEBHOOK_SECRET` no environment protegido → enviar entrega assinada atual ao `/webhook` → ler `auto-sync.log` + `auto-sync-status.json` → confirmar `VPS_HEAD == origin/main` → registrar receipt final no mesmo PR.
<!-- /PR1788_MCP_WEBHOOK_AUTOSYNC_READBACK_20261009 -->

<!-- PR1788_VPS_MAIN_SKILLS_AUDIT_RECEIPT_20261009 -->
## Auditoria de skills — MAIN × VPS × PR #1788 (receipt 09/10/2026)

**INTENÇÃO:** salvar neste PR as provas da auditoria de skills, sem duplicar skills/owners nem concorrer com o Hermes. A PR permaneceu aberta durante a leitura; o Hermes avançou o próprio HEAD enquanto esta auditoria era preparada. Este registro é SOMENTE documentação de prova; não promove skill nem altera runtime.

| Fonte | Prova observada | Status |
|---|---|---|
| GitHub main | HEAD 5344bd87074c334ddf3ac322ae7d6aaacecdf665; árvore completa (truncated=false): 993 arquivos SKILL.md sob .agents/skills, 14 caminhos que contêm centraldark | INVENTÁRIO PASS |
| VPS | /root/CentralDark @ e073059e0f76a53290886b56cbf668bf53d4b7f5: 993 SKILL.md, 14 caminhos centraldark; 993 SKILL.md Git-tracked e 0 não rastreados | INVENTÁRIO PASS |
| Diferença main/VPS checkout | GitHub compare e073059e...5344bd87: 1 commit à frente na main, nenhuma modificação em .agents/skills nesse commit | GIT DIFF PASS |
| Dirty na VPS | Somente .agents/skills/opus-magus/SKILL.md alterado entre SKILL.md locais: +4/-0, apontando para centraldark-evidence-reconciliation; scripts/register-github-webhook.sh também dirty, mas fora de skill | LOCAL DELTA PROVADO, PRESERVADO |
| SHA256 da skill local opus-magus | 392520fd7026f49c31c062eb67d169c470466e2bae88a599c958e5e07154db8e | HASH VPS PROVADO |
| SHA256 do library-index na VPS | bb92d6c57e0646c5d76c68e1d353d14e3dd4439b3b9deaea2f4f5b035ea23520 | HASH VPS PROVADO |
| Skill do funil criada no mesmo PR | centraldark-evidence-reconciliation/SKILL.md e references/fixed-point-funnel.md, no commit 45abcf7098387148b1494142937620d27f2064c5; versão 1.1.0 e referências nas skills existentes verificadas por readback GitHub | CODE/PR PASS |
| Evolução concorrente do Hermes | HEAD do PR avançou para a2d28c2b10f33a7d674396d916556dbe06adf05a, com alterações na skill centraldark-evidence-reconciliation, em centraldark-ops e na referência github-fast-inventory.md | COMMIT PRESERVADO; não auditado aqui |
| Sincronização novo funil na VPS | Nova skill do branch PR não observada no checkout antigo da VPS; HEAD VPS anterior à criação | RUNTIME SYNC UNKNOWN |
| Comparação SHA256 arquivo a arquivo 993/993 | Não completada; contagem e git-diff não são confirmação de SHA256 individual | PENDENTE |
| PR/CI/E2E | PR #1788 continua aberta; self-test e gates do commit 45abcf7 registrados no receipt original; consulta a status combinado daquele SHA retornou lista vazia | CI GLOBAL UNKNOWN; MERGED != DEPLOYED |

**Origem:** readback de árvore GitHub, comandos read-only na VPS via SEGREDO → SSH e receipt do Hermes https://github.com/ServerVpss/CentralDark/pull/1788#issuecomment-6086061833. A lacuna de owner do funil foi corrigida **no branch do PR**, não na main nem comprovadamente no runtime.

**Regra operacional do CHEFE:** delta material → mesmo owner → commit no mesmo PR → push → readback SHA → receipt; ONE_WRITER_PER_SCOPE; preservar o avanço do Hermes; não fabricar PASS, não criar outra PR e não produzir commit vazio.

**NEXT_CURSOR:** verificar SHA do funil no checkout/ambiente Hermes; confrontar os 993 conteúdos com SHA256 se houver necessidade discriminante; preservar arquivos locais dirty; reconciliar também o novo github-fast-inventory.md do Hermes; testes/CI do HEAD atual; somente então avaliar FIXED_POINT. GLOBAL_FIXED_POINT=FALSE.
<!-- /PR1788_VPS_MAIN_SKILLS_AUDIT_RECEIPT_20261009 -->

<!-- PR1788_SCRIPTS_METABOLIC_DEPENDENCIES_20261009 -->
## Metabolismo operacional — skills + scripts + dependências (contraprova VPS, 09/10/2026)

**Ampliação explícita da intenção do CHEFE:** skill isolada não fecha missão. O mesmo funil CURRENT → OWNER/WRITER → DELTA → TEST → CONTRAPROVA → READBACK → RECEIPT → NEXT_CURSOR também cobre **shell `.sh`, JavaScript `.mjs/.cjs/.js`, Python `.py`, PowerShell `.ps1`, dependências, cron/systemd, Hermes, MCP, Bridge, One Heart, logs e caminhos externos necessários**. Reutilizar os owners reais, não criar scheduler, daemon, catálogo, skill-mãe ou coletor adicional. Isto estende a aceitação API01/API03/API06/API09–API16 no mesmo PR #1788; é contrato e rastro, não deploy.

### Superfícies reais medidas (Casa SEGREDO → SSH Segredo-VPS → host CENTRALDARK-OS)

- `MAIN=5344bd87074c334ddf3ac322ae7d6aaacecdf665` no inventário GitHub, árvore `truncated=false`. `VPS_CHECKOUT=/root/CentralDark@e073059e0f76a53290886b56cbf668bf53d4b7f5`; checkout historicamente atrasado, dirty `.agents/skills/opus-magus/SKILL.md` e `scripts/register-github-webhook.sh` (nenhum dos dois resetado, limpo ou substituído).
- `/root/CentralDark/scripts/`: **550 caminhos Git rastreados**, **0 Git-untracked**. Auditoria de filesystem: **547 arquivos regulares + 2 links simbólicos**; 234 arquivos `.sh`, 168 `.mjs`, 69 `.py`, 21 `.ps1`. Diferenças entre métrica Git e walk físico decorrem de visões distintas; não inferir exclusão.
- `/root/scripts/`: **ABSENT**; não criar esse path por suposição. A busca até profundidade 3 em `/root` encontrou seis árvores `scripts` reais (incluindo a canônica): `/root/.hermes/scripts`, `/root/.hermes/hermes-agent/scripts`, `/root/CentralDark_MCP_RUNTIME/scripts`, `/root/CentralDark__arm_router_1771/scripts` e `/root/CentralDark_FULL_20261004003605/scripts`.
- Script sources comparados por **caminho relativo + SHA-256 do conteúdo** com `/root/CentralDark/scripts`: `CentralDark_MCP_RUNTIME` 463 arquivos de código, **424 idênticos, 39 diferentes, 0 extras**; `arm_router_1771` 473, **450 idênticos, 23 diferentes, 0 extras**; `FULL_20261004003605` 460, **423 idênticos, 37 diferentes, 0 extras**. São candidatos/checkout diferentes, **não** owners substitutos nem sincronizações aprovadas.
- Hermes: `/root/.hermes/hermes-agent/scripts` = **183 arquivos de código de upstream próprio**, não clonar cegamente para o repo; `/root/.hermes/scripts` = **2 scripts exclusivos**: `centraldark-eternal-sentinel.sh` (3.504 bytes, SHA256 `443513c3791f8be24c7b7e17aecbbaa27298cd62f8045b7dace63653ac43d98c`, `bash -n PASS`, executável) e `centraldark-main-pulse-reconcile.sh` (183 bytes, SHA256 `61d1b45efd7114e47e8581cb7d066e672ff5e944f0f95d995e8c8389b8fc6013`, `bash -n PASS`, sem bit executável). O pulse referencia o owner existente `scripts/vps/main-pulse-reconciler.sh`; o sentinel referencia config protegida de Hermes. Ativação desses dois não foi provada por cron/systemd nesta consulta: `UNKNOWN`, sem expor valores de env.
- `main` vs `VPS HEAD`: compare GitHub indicou um commit adiante na `main` e **nenhum arquivo `scripts/` alterado nesse commit**. Igualdade de paths/HEAD **não** é prova de consumo pelo runtime; para cada producer/consumer vivo exigir binário carregado, ambiente/interpreter e readback causal.
- Dependências estáticas observadas entre fontes: `scripts/vps/deploy-guards-dispatcher.sh`, `scripts/agent-call.mjs`, `scripts/lib/theme.sh`, `scripts/vps/centraldark-deploy.sh`; dependências de binários presentes em textos incluem `node`, `bash`, `python3`, `git`, `pm2`, `curl`, `npm`, `systemctl`, `gh`, `docker`, `jq`, `ssh`, `bun`, `flock`. Frequência textual **não** é prova de execução.
- No `PATH` da sessão SSH auditada, `jq` e `pm2` **não foram encontrados**, embora serviços possam usar caminhos/ambientes distintos: `PATH_GAP_CANDIDATE`, não falha global. Cron root faz referência a `/root/CentralDark/scripts/vps/auto-sync-main.sh`; isso não garante entrega webhook, sync bem-sucedido ou efeito de One Heart. Serviços observados ativos incluem Caddy, Hermes Core, MCP HTTP, Tailscale, cron e quatro runners Actions; unit active ≠ todos scripts saudáveis.

### Testes somente de sintaxe, sem executar scripts de operação

- `bash -n`: **234 `.sh` examinados; 233 PASS, 1 FAIL** em `scripts/run-once/eliminar-duplicatas-consciencia-brain.sh`: placeholder `cd <caminho-vps>`. O conteúdo também contém `git reset --hard`; classificar `RUN_ONCE_UNSAFE/FAIL_SYNTAX`, **não executar** nem corrigir placeholder às cegas; preservar owner e propor remoção da ambiguidade somente com política de segurança/escopo.
- `ast.parse`: **69 `.py` examinados; 69 PASS** na sintaxe, sem importar/rodar código.
- `node --check`: **173 arquivos JS/MJS/CJS examinados; 172 PASS, 1 FAIL** no código anteriormente presente em `scripts/memory-linker/precompact-session-digest.test.mjs`, pela declaração duplicada `const secret`. **Menor correção sem mudar lógica do teste** publicada **neste PR** em `1562550d55a98ff2f3623c1094b97246e4e7719e` (uma linha removida, mesmo owner). Candidato pós-patch passou em `node --input-type=module --check` por stdin na VPS; blob atualizado foi relido no branch: `610db7c4e8fface756666e29c44a1f037fe123f4`. **SUITE/CI do mesmo HEAD ainda UNKNOWN**; a VPS checkout não recebeu esse commit.
- `.ps1` (21) foram contados, **sem** teste de parser PowerShell nesta prova. Execuções operacionais `.sh`, mudanças de systemd, webhook, cron, envs, branch main e reload/restart **NÃO executadas**.

### Mesmo funil de manutenção para todas as dependências — sem engine nova

**API01/API16, antes de cada mutação:** resolver `TARGET → SCRIPT_REALPATH + GIT_OWNER + RUNTIME_OWNER + PARENT_CALLERS + SOURCE/IMPORTS + BIN/PACKAGE/ENV_NAMES + CRON/SYSTEMD/WORKDIR + OUTPUT_LOG + ROLLBACK`; comparar SHA-256/bit executável/shebang e todas as referências entre a main, PR, checkout, pasta externa e serviço. Não copiar scripts externos ou substituir worktree dirty automaticamente. Um dependency drift vira `PLACA/VER PENDÊNCIA` no HUD atual, com `OWNER`, `PROOF_KEY`, `TEST` e `NEXT_CURSOR`, não outro painel.

**API03/API06/API09–API13, depois de delta autorizado:** testar o menor cone de dependências por classe (sintaxe sem execução, testes direcionados, health do processo correto, Hermes→MCP/dispatcher autenticado, `event_id` em `logs/events`+`sectors`+`services`, `/heartbeat`, SSE e readback), atribuir cada output ao writer/serviço correto. Reusar scripts existentes de deploy/sync e o funil `log-funnel.js`; nenhuma instalação indiscriminada baseada em `command -v`. Preservar secrets e logs brutos; não imprimir valores.

**API14/API15:** projetar dependência faltante, script inválido ou runtime divergente no HUD/Obsidian já existente, com status `PASS/FAIL/UNKNOWN/BLOCKED/STALE` por alvo/prova/frescor. Nunca transformar `bash -n PASS` em `RUNTIME PASS`. Apenas `FIXED_POINT=true` quando branch PR, main, runtime e consumidor final tiverem a prova pertinente — `MERGED != DEPLOYED`.

**COORDENAÇÃO/ONE_WRITER:** Hermes está evoluindo `centraldark-evidence-reconciliation` e suas referências no mesmo PR; esta auditoria escreve **somente neste programa existente** e o patch mínimo no teste de `scripts/memory-linker`. Os ajustes futuros no funil da skill devem ser feitos pelo writer Hermes, usando estas medições como input, sem clonar skill, script ou PR.

**PLACAR:** `SCRIPTS_SOURCE_INVENTORY=PASS` (escopos explícitos); `BASH_SYNTAX=233_PASS_1_FAIL`; `PY_SYNTAX=69_PASS`; `JS_PRE_PATCH=172_PASS_1_FAIL`; `JS_ONE_LINE_FIX_CODE=PASS`; `POWERSHELL_PARSE=UNKNOWN`; `EXTERNAL_SCRIPTS_EXECUTION=UNKNOWN`; `METABOLIC_DEPENDENCIES_E2E=UNKNOWN`; `GLOBAL_FIXED_POINT=FALSE`.

**NEXT_CURSOR:** classificar `run-once` inseguro sem rodar → provar consumidor de `jq/pm2` no runtime efetivo → comparar SHA dos scripts chamados por Hermes/MCP/cron, sem apagar as cópias → testar a correção JS na suíte do mesmo SHA → correlacionar cron/webhook/One Heart/log-funnel/HUD por recibo causal → registrar PASS/UNKNOWN na **mesma PR #1788**.
<!-- /PR1788_SCRIPTS_METABOLIC_DEPENDENCIES_20261009 -->

<!-- PR1788_CASA_HUD_LAW_MIRROR_RECEIPT_20261009 -->
## CASA / Obsidian — reconciliação da lei “ENTROU, TEM QUE SELAR” com HUD.html (09/10/2026)

**INTENÇÃO:** reconciliar **o mesmo HTML físico** da Casa com a lei já implementada em `docs/HUD/HUD.html` no branch da **PR #1788**. Escrita somente no HUD físico preexistente; nenhum segundo manifesto, nova aba, nova skill, novo serviço ou arquitetura. Esta seção é o receipt canônico no contrato existente do PR; não é outro HUD.

### Preflight byte a byte, antes da escrita

- **Origem lida:** `main` GitHub e `PR #1788` via `gh api` autenticado da Casa. A PR estava **OPEN** e seu HEAD não mudou durante o espelhamento: `75720ec71c1b83985f8798e7a95ae0add3a8b907`.
- **Alvo físico:** `C:\Users\Administrador\Documents\Obsidian Vault\🪬Centraldark -HUD🪬\HUD.html` na Casa `SEGREDO` (Desktop Commander online, processo PowerShell no Windows). A verificação inicial encontrou **exatamente o mesmo conteúdo byte por byte** que `docs/HUD/HUD.html@main`.
- **Antes, MAIN + CASA:** `221001 bytes`; **SHA256** `00A35C33DCE62AEC5E34B72B1DF6AF784D6ECA2E1451DD08BCFBDA0C86EA9950`. Não houve alterações locais exclusivas a preservar. O arquivo da main não foi alterado.
- **Fonte do delta:** `docs/HUD/HUD.html@PR1788` com **225379 bytes** e SHA256 `6AAB13D3170D75306C83AFBC7EAAE1727323550EE9819B453938FB0B065A7452`, incluindo `CD_HUD_MANIFESTO_ENTROU_TEM_QUE_SELAR_20261009` e a grade histórica intacta.
- **Proteção da escrita:** exigido HEAD da PR igual ao SHA pinado; arquivo da Casa igual ao SHA anterior; blob remoto igual ao SHA esperado; lei, três abas, 15 cadeados e quatro `<script>` presentes. Na falha da gravação ou do hash pós-escrita, o procedimento preparado restauraria em memória os bytes originais. Não houve falha nem rollback.
- **Depois, CASA:** SHA256 `6AAB13D3170D75306C83AFBC7EAAE1727323550EE9819B453938FB0B065A7452`; **225379 bytes**. `CASA_HUD_MIRROR=PASS`; `CASA_MATCHES_PR_SOURCE=True`; `PR_MOVED_DURING_SYNC=False`. Apenas o HUD físico existente foi atualizado.

### Readback físico e testes no próprio PC

- `HUD_LAW_PRESENT=PASS`, `HISTORIC_CADEADOS=15`, sendo **12 selados históricos + 3 abertos**; abas `HUD/MAPA/FORJA` preservadas, **4 blocos JavaScript**.
- `CASA_HTML_SCRIPT_SYNTAX=4/4_PASS` via Node instalado na Casa, compilando os quatro blocos extraídos do **arquivo físico pós-escrita** em `vm.Script`, sem executar chamadas de rede.
- `CASA_LAW_GATE_MOCK=PASS` sobre o **código de gate extraído do HTML físico**, executado com DOM simulado sem instalar dependências: ao inserir cartão dinâmico `SELADO` sem receipt, passou a `aberto/VER PENDÊNCIA`; 15 cadeados originais preservados; segunda execução da verificação manteve a pendência. O primeiro mock tinha apenas uma falha de harness (`MutationObserver` ausente do contexto artificial), corrigida no próprio teste sem mudar a lei.
- `OBSIDIAN_PROCESS=OFF` durante a medida. Por isso `OBSIDIAN_VISUAL_READBACK=UNKNOWN` e `REAL_EVENT_TO_HUD_E2E=UNKNOWN`. **Teste sintático ou mock não é execução de evento real**.
- Esta escrita **não promoveu** o PR à `main`, **não atualizou** checkout, processo ou HUD da **VPS** e não reclassificou o status de serviço. A Casa está espelhando deliberadamente o **HTML do branch não mergeado**, não a `main` de produção.

### Regra executável, sem falso verde

**ENTROU → EXIGIR OWNER, SCOPE, PROOF_KEY, SOURCE_SHA, RECEIPT, READBACK, OBSERVED_AT, NEXT_CURSOR.** Sem prova atribuível e recente, entrada nova na grade existente → `VER PENDÊNCIA`. **SELADO histórico = prova datada, nunca RUNTIME CURRENT automático.** O HTML **não valida assinaturas nem substitui o juiz backend**; `READBACK_PASS` no DOM é apenas metadado declarado até o owner operacional prová-lo.

**ESTADO:** `SOURCE_BRANCH_HUD=PASS`; `CASA_HUD_BYTES_EQUAL_PR=PASS`; `CASA_LAW_MOCK=PASS`; `CASA_HTML_JS_SYNTAX=PASS`; `CASA_HISTORIC_CADEADOS_PRESERVED=PASS`; `OBSIDIAN_GUI=UNKNOWN`; `VPS_HUD_EQUALS_PR=UNKNOWN`; `MAIN_EQUALS_PR=FALSE` enquanto não mergear; `E2E_REAL_EVENT=UNKNOWN`; `FIXED_POINT_GLOBAL=FALSE`.

**NEXT_CURSOR:** abrir o mesmo HUD no Obsidian/visualizar a grade quando a UI estiver disponível → correlacionar evento real `event_id` do MCP/One Heart com receipt do owner e estado do cadeado → verificar CI e merge da **mesma PR #1788** → depois de promover o PR, espelhar somente o HTML canônico da `main` na Casa e VPS com readback de SHA-256 em ambos, preservando qualquer delta local legítimo.
<!-- /PR1788_CASA_HUD_LAW_MIRROR_RECEIPT_20261009 -->


<!-- PR1788_GITHUB_MINERAL_ESCAVACAO_API_LOG_ONEHEART_20261009 -->
## Escavação de PRs, issues e branches via a MESMA API/MCP/log-funnel/One Heart/HUD (09/10/2026)

**Intenção do CHEFE:** examinar todos os PRs (open/closed/merged), issues e branches acessíveis da CentralDark; extrair critérios/provas ainda úteis, inclusive dos merged antigos, e reconciliar SOMENTE lacunas reais no PR #1788. 'Examinai tudo; retende o bem'. Não reabrir #1562/#1757, nem criar outro PR, owner, API, logger, heartbeat, serviço, HUD ou plugin. Estado histórico é minério CANDIDATO; merge nunca prova runtime.

### Owners existentes preservados

- GitHub API: ferramentas GitHub já registradas no catálogo 'apps/modulos/mcp/src/tools/core/tools-catalog.js'; dispatcher 'apps/modulos/mcp/src/tools/core/mcp-admin.js'; OAuth/admin existentes. Consultas com rota autorizada; não despejar tokens, headers, comentários brutos ou segredos.
- Logs: 'apps/modulos/mcp/src/log-funnel.js' + as três projeções do MESMO evento em 'logs/events/YYYY-MM-DD.jsonl', 'logs/sectors/<setor>/YYYY-MM-DD.jsonl', 'logs/services/<servico>/YYYY-MM-DD.jsonl', mantendo um 'event_id'. Logs originais systemd/PM2 continuam preservados; não criar quarto fluxo/coletor.
- One Heart/stream: '/heartbeat', 'apps/modulos/mcp/src/operational-telemetry.js' e '/admin/logs/stream' autenticado; mesmo evento chega como estado derivado sem fingir que a existência do código prova funcionamento.
- Interface: 'docs/HUD/HUD.html' nas abas HUD/MAPA/FORJA com 15 cadeados históricos; Obsidian pela capacidade já existente em 'apps/modulos/obsidian-plugin-grafo-vivo/'. O HUD não é outro writer, o vault da Casa não é owner concorrente; 'HUD_WRITE_HOLD=ON' até ACK de writer/branch/base-SHA neste PR.
- Memória, receitas e lineage: 'docs/CONSCIENCIA/APRENDIZADOS.md', 'docs/CONSCIENCIA/MAPA-DO-CEREBRO.md' e receipts existentes. Deduplicação por PROOF_KEY/fingerprint antes de qualquer patch; não misturar memória pendente com promoção automática.

### Contrato adicional de aceite: integra API01, API05 e API09–API16 existentes

1. **Inventário EXAUSTIVO POR PAGINAÇÃO:** obter PRs de todos os estados, issues de todos os estados e branches pela API GitHub existente até cada cursor acabar. Registrar contagem, estado, SHA/ref, fonte, data, target, page/cursor e resultado. 'Primeiros 100' != 'ALL'. Se a paginação não acabar, apresentar 'INVENTORY=PARTIAL' + 'NEXT_CURSOR', nunca PASS.
2. **Minerar cláusulas perdidas, não duplicar:** cada candidato deve carregar 'source_kind', 'pr_or_issue_number|branch_ref', 'source_sha', 'source_url', 'criterion_claim', 'existing_owner', 'existing_APIxx', 'proof_key', 'fingerprint', 'observed_at', 'counterproof', 'classificacao' e 'NEXT_CURSOR'. Classificações: 'ALREADY_COVERED', 'REUSABLE_PROOF', 'MISSING_CLAUSE', 'HISTORICAL', 'SUPERSEDED', 'UNKNOWN'. Confrontar 'main', PR #1788 e runtime; não fazer merge/cherry-pick automático do legado nem importar branches inteiros.
3. **PASSAGEM PELA MESMA API E LOGS:** para nova leitura ou alteração MATERIAL efetuada por consumer autorizado, producer existente registra um evento sanitizado via 'appendCentralEvent' com 'event_id', 'sector', 'service', 'source', 'kind', 'sha', 'correlation_id', 'level' e metadados mínimos; NÃO salvar comentários inteiros, credenciais, tokens ou logs secretos. Exigir readback do MESMO 'event_id' em events/sectors/services; até a chamada ocorrer no runtime marcar 'MCP_TO_LOG=UNKNOWN', não documentar como já executado.
4. **ONE HEART + HUD:** consumir o estado derivado desse evento em '/heartbeat', comprovar SSE autenticado em '/admin/logs/stream', e a atualização de ACERTOS/VER PENDÊNCIA na grade HUD/MAPA/FORJA do HTML existente. Falha recebe placa com OWNER, ROTA, ERRO, PROVA e NEXT_CURSOR; prova histórica continua datada. Mesmo fingerprint compatível usa 'REPLAY_BEFORE_REDISCOVERY', sem repetir todo o trabalho.
5. **OBSIDIAN/CASA:** reusar 'autoUpdater' e 'knowledgeHub' do plugin existente, preservar Grafo Vivo 2D/3D e único arquivo HUD.html físico. Comparar hash do branch em PR aberto versus Casa, main e VPS separadamente; 'HASH_EQUAL' não equivale a 'OBSIDIAN_GUI_PASS'. Exigir readback visual pelo consumer autorizado, sem nova UI e sem escrita concorrente.
6. **SEGURANÇA E FECHAMENTO:** preservar GREEN_STATE; cada patch pertence ao owner existente, um writer por arquivo, commit no mesmo PR, teste, readback e receipt versionado por SHA; revisar especificamente comentários de code review do #1788 sobre pulse/sync SHA, backup/missões e cadeados iniciais. 'MERGED != DEPLOYED', 'CODE != RUNTIME', 'DOCUMENTED != EXECUTED', 'UNKNOWN != PASS'.

### Inventário de partida medido na consulta, NÃO conclusão integral

- #1788 OPEN, rendezvous único; #1562 CLOSED/UNMERGED (162 arquivos/529 commits); #1757 CLOSED/UNMERGED. Handoff do legado já registrado em https://github.com/ServerVpss/CentralDark/pull/1788#issuecomment-6086697803 — não duplicar os 2.500 comentários como ledger.
- Merged verificados nesta amostra: #998 (Relíquia/HUD escavação), #1583 (heartbeat), #1604 (logs + MCP + painel), #1783 (G01–G12), #1784 (Kaizen/placas), #1786 (placa HUD). São referências de origem, NÃO PASS de runtime.
- #1767 (Cartographer) e #1777 (Oracle HUD) seguem OPEN nesta leitura; possível colisão em 'docs/HUD/HUD.html', portanto sem ACK não editar o HTML. Reviews do #1788 trouxeram achados pendentes sobre preservação de missões, rollback, fileset, pin de SHA e validação de selos iniciais.
- Busca retornou os PRIMEIROS 100 PRs e os PRIMEIROS 100 issues; não é inventário completo. A enumeração de branches via cursor chegou ao fim com 770 refs nesta medição, mas o conteúdo de cada branch não foi reconciliado. 'PR_ISSUE_EXHAUSTED=false', 'BRANCH_LIST_EXHAUSTED=true', 'CLAUSE_MINING_COMPLETE=false'.
- Prova real GitHub API -> MCP autenticado -> 'log-funnel.js' -> events/sectors/services -> heartbeat -> SSE -> HUD -> Obsidian: 'E2E=UNKNOWN' nesta rodada. Nenhum evento operacional foi produzido e nenhuma alteração foi feita em VPS/Casa.

**NEXT_CURSOR:** 'EXHAUST_ALL_PR_AND_ISSUE_PAGINATION -> CLASSIFY_MISSING_CLAUSES_IN_EXISTING_API01_API16 -> ACK_ACTIVE_WRITER -> FIRST_OWNER_LOCAL_DELTA -> API09_EVENT_ID_3_PROJECTIONS -> API12_HEARTBEAT -> API13_AUTH_SSE -> API14_HUD_LIVE -> API15_OBSIDIAN_VISUAL -> API16_RECEIPT_SAME_SHA'.

**Sem falso verde:** este contrato foi documentado dentro do PR #1788. A execução da mineração completa e o fechamento ponta a ponta permanecem pendentes até prova causal.
<!-- /PR1788_GITHUB_MINERAL_ESCAVACAO_API_LOG_ONEHEART_20261009 -->

<!-- PR1788_HUD_OBSIDIAN_DETERMINISTIC_SEAL_CONTINUITY_20261009 -->
## Continuidade selada HUD ⇄ Obsidian ⇄ PR #1788 — casca mutável, essência preservada (09/10/2026)

**Novo delta do CHEFE sobre API14–API16, sem alterar critérios nem owners:** a entrada operacional consulta obrigatoriamente o **mesmo HUD atual e o PR rendezvous nele indicado**, mais `main`, owner e receipt correspondente. O HUD é a placa viva consultiva, junto ao Obsidian como espelho da Casa; `docs/`, commits, logs e efeito medido continuam a fonte canônica verificável. Não declarar verdade apenas porque um cartão está verde.

A lei **ENTROU, TEM QUE SELAR** já reside em `docs/HUD/HUD.html` neste PR (`CD_HUD_MANIFESTO_ENTROU_TEM_QUE_SELAR_20261009`); **não reescrever o HTML ou disputar `HUD_WRITE_HOLD=ON`**. O contrato complementar está nos owners de entrada `docs/ARQUITETURA/CENTRALDARK-GITHUB-ENTRY-HUD-GATE.md` e de Obsidian `docs/ARQUITETURA/HERMES-CASA-OBSIDIAN-SYNC.md`. Manter as três abas, os cadeados existentes, o mesmo arquivo físico e o plugin Obsidian existentes.

```text
PROVEN_FLOOR = receipts + PROOF_KEY + scope + target + SHA + fingerprints
SELADO + UNCHANGED_DEPENDENCIES + AUTHORIZED_DETERMINISTIC_RUNNER
  -> REPLAY_SAME_OWNER_SCRIPT_WITHOUT_AI -> MINIMUM_REALITY_READBACK -> RECEIPT
UNKNOWN|STALE|DIRTY|INVALIDATED|FAIL
  -> PRESERVE_LAST_GOOD -> PLACA_VER_PENDENCIA(OWNER, ROUTE, ERROR, NEXT_CURSOR)
NO_NEW_ARCHITECTURE = TRUE
```

**Não repetir missão determinística já selada** significa **reutilizar receita e prova histórica**, rodando somente a verificação mínima dos bindings/efeitos que podem mudar. Não significa suprimir readback ou eternizar selo de serviço. Runner não encontrado = `UNKNOWN/BLOCKED`, jamais inventar daemon/cron/gatilho. Registrar `event_id` no `log-funnel.js` e projetar no One Heart/HUD somente quando o evento realmente atravessar o MCP; sem simular E2E.

**Continuidade da casca do PR:** #1788 permanece o único PR ativo deste escopo enquanto `OPEN` e com capacidade. Comentários são sinalização, não ledger. Se houver fechamento/merge ou limite de comentários **e ainda restarem APIxx/Goal pendentes**, usar a receita de `2026-10-06-pr-mae-ledger-rollover.md` para levar **somente deltas não selados**, links de receipts, cláusulas, owners e `NEXT_CURSOR` ao próximo PR autorizado, marcando predecessor e sucessor no **mesmo HUD.html**; nunca reexecutar provas seladas por causa da troca de PR. Nenhum sucessor é aberto nesta declaração; sem pendências, nenhum PR adicional.

**Prova nesta alteração:** contrato publicado no PR #1788, não prova de runtime; `API14_HUD_LAW=DOCUMENTED`, `API15_OBSIDIAN_GUI=UNKNOWN`, `API09–API13_ONE_HEART_E2E=UNKNOWN`, `DETERMINISTIC_SEAL_REPLAY_RUNTIME=UNKNOWN`. Atualização física do Obsidian/VPS depende de writer autorizado, mesmo hash e readback após promoção.
<!-- /PR1788_HUD_OBSIDIAN_DETERMINISTIC_SEAL_CONTINUITY_20261009 -->

<!-- PR1788_HERMES_AUTONOMY_SKILL_SYNC_READBACK_20261009 -->
## Hermes — autonomia delegada + integração automática das skills na VPS após MAIN (09/10/2026)

**INTENÇÃO vigente do CHEFE:** Hermes deve executar o trabalho técnico autorizado **sem micro-passos** (inventariar, editar arquivos/skills/scripts dos owners, testar, corrigir, commitar no PR ativo, publicar receipt e SELAR a prova no HUD), inclusive no workspace da VPS sob `/root/CentralDark`. Não criar outro agente, timer, script-engine, PR ou arquitetura. **/root como caminho não impede que o usuário root altere o sistema fora da pasta**, então essa delegação mantém os gates para ações destrutivas, não libera YOLO nem substitui o mecanismo de aprovação real do Hermes.

### DELTA CANÔNICO — TRÊS COMMITS NO MESMO PR #1788

| Commit | Owner existente | Delta |
|---|---|---|
| `b550cc903ea21b462b716cedb06ae6663c382fda` | `scripts/vps/auto-sync-main.sh` | Com fast-forward válido da `main` e diff em `.agents/skills/`, executa o owner `scripts/skill-sync-check.sh --apply` uma vez, com `CENTRALDARK_ROOT` e `CENTRALDARK_SKILL_SYNC_REF=<SHA_exato_promovido>`. Reutiliza lock/backup/hash/oracle sem sobrescrever drift e sem restart. |
| `099cd09e1e0c903dadecb04dcfb6e6601dbc3afc` | `.agents/skills/skill-synchronization/SKILL.md` | Atualiza skill opt-in para `version: 0.3.0`, descrevendo execução contínua no scope, sync pós-main e a fronteira `SYNCED != LOADED`. |
| `7a0cf71d5a45b6bbd5d2ee07930bfe87b54f423e` | `.agents/skills/software-development/centraldark-ops/SKILL.md` | Incorpora a delegação de trabalho com scripts `.sh`, Node/Python, CI, readback e receipt; sem reaprovação por etapa rotineira, sem permissão ilimitada fora do owner. |

### TESTE E CONTRAPROVA

- `bash -n` sobre o script recuperado do **branch do PR** e enviado somente à entrada padrão da shell na VPS: **PASS, exit 0**. Nenhum script de deploy nem skill-sync real foi executado neste teste.
- Readback estático no arquivo do PR: `SYNC_FUNCTION_COUNT=1`, `SYNC_CALL_COUNT=1`, `PIN_SAME_SHA=true`, `BLOCK_DIRTY=true`, `NO_SECURITY_CONFIG_TOUCH=true`. Guard existente exige `branch=main` e worktree rastreada limpa; novo helper exige `HEAD=<SHA_promovido>`; `skill-sync-check.sh` existente recusa drift independente.
- Fonte VPS medida via Casa→SSH: `VPS_HEAD=e073059e0f76a53290886b56cbf668bf53d4b7f5`, `BRANCH=main`; alterações rastreadas `.agents/skills/opus-magus/SKILL.md` e `scripts/register-github-webhook.sh` **PRESERVADAS**. Com esse tracked dirty o auto-sync permanece **BLOCKED**; não executar `reset --hard`, stash, force ou merge automático para ocultar.
- `PR #1788` está **OPEN**, base `5344bd87074c334ddf3ac322ae7d6aaacecdf665`; commit de branch **não é push em main**. Cron/webhook existente acompanha `refs/heads/main`, não PR não-mergeado; este delta só passa ao runtime após promoção legítima, avanço do checkout e readback.
- **AUTONOMIA CONCEDIDA NO CONTRATO ≠ ALTERAÇÃO DAS APPROVALS:** nenhum `~/.hermes/config.yaml` ou allowlist foi alterado na VPS. Modo `smart` recomendado com confirmação apenas para operações realmente críticas; nenhuma permissão é ilimitada. Carregamento da skill por processo Hermes já em execução ainda `UNKNOWN`.

**ESTADO DE PROVA:** `PR_CODE_COMMITTED=PASS`; `SHELL_SYNTAX=PASS`; `SAME_SHA_HOOK_STATIC=PASS`; `MAIN_MERGED=NO`; `VPS_MAIN_SYNC=BLOCKED_TRACKED_DIRTY`; `HERMES_SKILL_RUNTIME_HASH=UNKNOWN`; `HERMES_ACTIVE_SESSION_POLICY=UNKNOWN`; `AUTONOMOUS_OPERATIONAL_E2E=UNKNOWN`; `GLOBAL_FIXED_POINT=FALSE`.

**NEXT_CURSOR:** o writer correto reconcilia o tracked dirty sem perda → valida PR #1788 e seus checks no **mesmo SHA** → promove para `main` pelo gate vigente → cron atual realiza ff-only e chama o **mesmo** `skill-sync-check.sh` → comparar hash da `skill-synchronization v0.3.0` e `centraldark-ops` em `main`, checkout, `~/.hermes/skills` → carregar nova sessão Hermes se necessário → testar pequena missão reversível com execução/receipt → atualizar o **mesmo** HUD com `SELADO` apenas após readback causal. `MERGED != DEPLOYED`; `SYNCED != LOADED`; `UNKNOWN != PASS`.
<!-- /PR1788_HERMES_AUTONOMY_SKILL_SYNC_READBACK_20261009 -->
