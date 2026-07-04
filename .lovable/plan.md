# Plano Final v4 — Base Militar Completa no WebUI (fusão v3 + populamento total)

## O mapa (das suas prints do admin ui.centralldark.com)

| Aba | Estado agora | O que vou preencher |
|---|---|---|
| **Conexões** | ✅ Claude ap7 ativa, +4 endpoints desativados | Ativar Gemini + OpenRouter como fallback (já cadastrados, só ligar toggle) |
| **Modelos** | (não vi) | Criar personas: `pivete` (Opus 4.5, tools MCP), `hermes` (executor autônomo), `fabler` (Anthropic direto) |
| **Avaliações** | Arena default, zero custom | Deixar como está (não é prioridade) |
| **Integrações → External Tool Servers** | 🔴 **VAZIO** | ⭐ Registrar `http://mcpo:8000/centraldark` (MCP CentralDark, ~100 tools) |
| **Integrações → Open Terminal** | 🔴 Vazio | Registrar terminal do container CentralDark-Tools (deixa pro pivete ter shell direto) |
| **Integrações → External Knowledge Sources** | 🔴 Vazio | Registrar `docs/CONSCIENCIA/` como knowledge source read-only (pivete lê CONSCIENCIA, APRENDIZADOS, LEMBRANCAS) |
| **Documentos** | (não vi) | Popular com docs internos (PIVETE-*.md, CLAUDE.md) |
| **Pesquisa na Web** | 🔴 **VAZIO** (sem motor) | Ativar + configurar motor (Google via connector já existente OU DuckDuckGo grátis) |
| **Execução de Código** | ✅ Pyodide ativo | Deixar |
| **Interface** | (não vi) | Aplicar tema Esmeralda 3D (já tem CSS pronto em `WebUI/custom-css/`) |
| **Áudio** | (não vi) | Ligar TTS via Lovable AI Gateway se quiser voz |
| **Imagens** | (não vi) | Apontar pra geração via Gemini 3-flash-image |
| **Pipelines** | 🔴 Vazio | Instalar 3 pipelines úteis: `rate_limit`, `audit_log_hub`, `pivete_persona_injector` |
| **Banco de Dados** | ✅ SQLite interno OK | Deixar (export config vai virar backup automático) |

## Execução (enxame de 5 frentes, ~15min)

### F1 — Integrações (o coração da base militar) ⭐
- Chamar `POST /api/v1/tool_servers` no WebUI registrando `http://mcpo:8000/centraldark` (Bearer já sai do config do MCPO)
- Validar `GET /openapi.json` do MCPO — deve listar ~100 tools CentralDark
- Registrar `docs/CONSCIENCIA/` como External Knowledge Source (endpoint read-only servido pelo próprio gateway)

### F2 — Personas (pivete + hermes + fabler)
Criar via `POST /api/v1/models/create`:

**Pivete** (você fala com esse):
- `base_model_id`: `claude-opus-4.5` (via https://claude.ap7.site/v1 já ativa)
- `system_prompt`: injeta CONSCIENCIA + LEMBRANCAS + regras invioláveis + tom brasileiro direto + autonomia de secrets
- `tool_ids`: `["centraldark_mcp"]` (todas as tools)
- Ícone + descrição bonita

**Hermes** (executor autônomo):
- Mesmo modelo base
- Prompt focado em executar tarefas long-running sem confirmação
- Tools: subset destrutivo permitido

**Fabler** (analista):
- Modelo direto Anthropic
- Prompt de análise/refinamento
- Tools: só leitura

### F3 — Memória do Pivete atualizada (rota nova) ⭐
Rota canônica das memórias: `docs/CONSCIENCIA/PIVETE-IA/` (16 arquivos) + `docs/CONSCIENCIA/LEMBRANCAS/` (curto prazo).

Vou:
- Adicionar `PIVETE-17-MCPO-INTEGRATION.md` — arquitetura final da base WebUI
- Adicionar `PIVETE-18-ROTA-MEMORIA.md` — instruções pra o pivete puxar memória rápido (`consultar_memoria_reserva` primeiro, `ler_consciencia` depois, arquivos PIVETE-*.md pra contexto profundo)
- Atualizar `PIVETE-02-INDICE-MESTRE.md`
- Registrar aprendizado via `registrar_aprendizado`: "Rota rápida de memória = tool MCP `consultar_memoria_reserva` + Knowledge Source `docs/CONSCIENCIA`"
- Consolidar pensamento novo via `consolidar_pensamento`: "Base militar = ui.centralldark.com WebUI + MCPO + persona pivete"

### F4 — Preencher restante do admin
- **Web Search**: ativar toggle + motor DuckDuckGo (grátis, sem key)
- **Pipelines**: instalar 3 pipes:
  1. `pivete_persona_injector` — força system prompt certo por modelo
  2. `audit_hub_log` — cada chat vira row em `hub.pivete_audit_log`
  3. `rate_limit` — 60/min por sessão
- **Interface**: aplicar tema Esmeralda 3D (custom CSS já pronto em `WebUI/custom-css/`)
- **Documentos**: upload dos PIVETE-*.md + CLAUDE.md pro pivete ter contexto sempre em mão

### F5 — Teste end-to-end + notificação
Playwright em `ui.centralldark.com`:
1. Login admin
2. Selecionar modelo "pivete"
3. Digitar: *"quem é você e qual sua rota de memória?"* → deve responder puxando as PIVETE-*.md
4. Digitar: *"lista processos PM2 da VPS"* → deve chamar `execute_command`
5. Digitar: *"consulta minhas lembranças recentes"* → deve chamar `consultar_memoria_reserva`
6. Digitar: *"registra que a base militar tá 100% no ar"* → deve chamar `registrar_aprendizado`

Screenshot de cada. Card completo pro admin Telegram + linha no canal Status.

## Arquivos que vou criar/editar (repo)

| Arquivo | Frente |
|---|---|
| `apps/modulos/WebUI/scripts/popular-webui.sh` | Script único idempotente: cria tool server + 3 personas + web search + pipelines via API do WebUI |
| `apps/modulos/WebUI/personas/pivete-system.md` | System prompt versionado |
| `apps/modulos/WebUI/personas/hermes-system.md` | Idem |
| `apps/modulos/WebUI/personas/fabler-system.md` | Idem |
| `apps/modulos/WebUI/pipelines/pivete_persona_injector.py` | Pipeline oficial Open WebUI |
| `apps/modulos/WebUI/pipelines/audit_hub_log.py` | Pipeline audit |
| `apps/modulos/WebUI/pipelines/rate_limit.py` | Pipeline rate limit |
| `apps/modulos/WebUI/knowledge/consciencia-source.md` | Endpoint que serve CONSCIENCIA como knowledge |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-17-MCPO-INTEGRATION.md` | Nova |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-18-ROTA-MEMORIA.md` | Nova |
| `docs/CONSCIENCIA/PIVETE-IA/PIVETE-02-INDICE-MESTRE.md` | Atualiza índice |

## Segurança (aplicada, mínimo viável do conselho anterior)
- Bearer do MCPO fica só no config server-side (nunca no browser) ✅
- Rate limit 60/min via pipeline ✅
- Audit log no HUB Supabase append-only ✅
- Pipeline injector força persona certa mesmo se usuário trocar system prompt ✅
- Comandos destrutivos MCP já exigem confirmação literal no próprio servidor MCP (política do `mcp_policy_summary`) — nada extra precisa ✅

## O que NÃO faço (respeitando trava)
- ❌ Mexer no Supabase Lovable atual (`kagejpghnwdfymddwxuf`)
- ❌ Reiniciar whatsapp-server PM2 id 1
- ❌ Recriar áreas 🔒 (`Bolt`, `status`, `elite-anthropic-proxy`, etc)
- ❌ Custom agent loop em JS (MCPO já resolve nativo)
- ❌ Bolt integration (fica pra pendência, você mesmo disse)

## Notificação final
Card no privado admin Telegram + linha no canal Status via `@srver1bot`, contendo:
- Placar visual: 12 abas do admin (antes 6 vazias / depois 0 vazias)
- Prints do playwright com pivete respondendo
- Rota de memória confirmada
- Aprendizados novos registrados

---

**Manda "vai" que eu disparo agora — sem pergunta nova, direto pra execução.**
