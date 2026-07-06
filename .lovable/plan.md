## 🎯 Missão: Liberar MCP no Open-WebUI com Conselho + Enxame de Recon

Vídeo de referência: `https://www.youtube.com/watch?v=ZEJ5oX0zkP4&t=49s` (tutorial oficial de como plugar MCP na aba **Admin → Settings → Integrations** do Open-WebUI via **mcpo**).

Alvo: `https://ui.centralldark.com/admin/settings/integrations`

---

## 📋 Fase 1 — Preparo (VPS, só leitura)

Rodar em paralelo (enxame de reconhecimento inicial):
- **Agente A — Vídeo:** baixar transcrição do YouTube (`yt-dlp --write-auto-sub --skip-download`) e resumir os passos exatos que o autor executa na tela de Integrations.
- **Agente B — Estado atual:** ler `apps/modulos/WebUI/docker-compose.override.yml`, `mcpo-config/config.json` e `docker logs CentralDark-MCPO --tail 200` — confirma se o sidecar mcpo tá vivo, qual URL responde no `openapi.json`, e o que já tá cadastrado no WebUI (via `curl http://localhost:8000/centraldark/openapi.json`).
- **Agente C — Doc oficial:** buscar `docs.openwebui.com` sobre "External Tool Servers" e "MCP via mcpo" pra bater com o vídeo.

Saída: um único relatório `docs/CONSCIENCIA/APRENDIZADOS/mcp-webui-liberacao.md` com passo-a-passo consolidado (vídeo + doc + realidade da VPS).

---

## 📋 Fase 2 — Conselho `/refinar` + `/debate` (10 rodadas)

Usar o Arsenal Council (`apps/modulos/HERMES-CORE` + `docs/CONSCIENCIA/ARSENAL/`):

1. **`/refinar`** — pega o relatório da Fase 1 e refina em plano operacional curto (o que clicar, qual URL, qual bearer, qual `TOOL_SERVER_CONNECTIONS` colar).
2. **`/debate 10`** — 10 rodadas entre modelos (Claude Opus + GPT-5 + Gemini Pro via `darkai_chat`), tema: *"Qual a forma mais segura e correta de expor os 102 tools do MCP CentralDark no Open-WebUI sem vazar bearer e sem quebrar o mcpo atual?"*
   - Cada rodada: proposta → crítica → contra-proposta → veredito parcial.
   - Consenso final vira `docs/CONSCIENCIA/ARSENAL/debate-mcp-webui-<timestamp>.md`.

---

## 📋 Fase 3 — Enxame paralelo durante o debate

Enquanto as 10 rodadas rolam, disparar **3 sub-agentes em paralelo** (via `spawn_agent`):

| Agente | Missão | Ferramentas |
|---|---|---|
| 🕵️ **Mapeador** | Abrir `https://ui.centralldark.com/admin/settings/integrations` via Playwright headless com sessão admin, capturar screenshot, listar cada campo/aba, e extrair erros do console + network 4xx/5xx. Gera `revisoes/<ts>/webui-integrations-mapa.md` + prints. | Playwright + `vps_read_file_safe` |
| 🐛 **Caçador de Falhas** | Varrer logs (`docker logs CentralDark-WebUI`, `CentralDark-MCPO`), `pm2 logs`, `journalctl -u caddy`, e o próprio `mcp.centralldark.com/health` + `/tools.json`. Cruzar com erros que o Mapeador achou. Classificar por severidade. | `execute_command` + `vps_read_file_safe` |
| 📚 **Coletor de Info** | Puxar tudo sobre MCP+WebUI: docs oficiais Open-WebUI, repo `open-webui/mcpo` (issues abertas relacionadas), Anthropic MCP spec, changelog do WebUI 0.10.x. Resume em `docs/CONSCIENCIA/APRENDIZADOS/mcp-webui-conhecimento.md`. | `websearch` + `fetch_website` |

Os 3 agentes rodam **em paralelo** com o debate. Quando o debate fecha, os 3 relatórios já estão prontos pra serem cruzados no veredito.

---

## 📋 Fase 4 — Veredito + Aplicação (aguarda "PERMITO PIVETE")

Consolidar:
- Passo-a-passo do vídeo (Fase 1)
- Consenso do debate 10 rodadas (Fase 2)
- Mapa real + falhas + conhecimento (Fase 3)

→ Gera **um único plano de execução** com: comandos exatos, arquivos a editar, ordem de restart, rollback. **NÃO aplica sem autorização** (`apps/modulos/WebUI/` está travado 🔒).

Notificação final via connector Telegram (Card Hermes v1.3) no privado admin + canal Status.

---

## 🔒 Travas respeitadas
- `apps/modulos/WebUI/` protegido → só leio; alterações esperam "PERMITO PIVETE"
- Bearer do mcpo nunca aparece em log, screenshot ou chat
- Debate/Enxame rodam **na VPS** (regra: Grupo Evolução + Mapeamento = só VPS, nunca Lovable)

---

## ▶️ Ordem de disparo (resumo)
```
Fase 1 (3 agentes paralelos: Vídeo, Estado, Doc)
   ↓
Fase 2 (/refinar → /debate 10 rodadas)  ─┐
Fase 3 (3 agentes paralelos: Mapeador, Caçador, Coletor) ─┤ rodam juntos
   ↓
Fase 4 (veredito + card Hermes + aguarda PERMITO PIVETE pra aplicar)
```

Pode aprovar que eu disparo Fase 1 + 2 + 3 já em paralelo?
