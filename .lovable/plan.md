# Plano — WebUI editável ao vivo (bind-mount) + fix do Integrations

## Objetivo
Parar de reconstruir container toda vez. Deixar 3 áreas do Open-WebUI editáveis direto na VPS, com reflexo imediato (ou restart de 3s). E de quebra resolver o erro 500 do `/api/v1/configs/tool_servers` que travou a página de integrações.

## O que vai virar bind-mount

| Área | Caminho no host (VPS) | Caminho dentro do container | Como recarrega |
|---|---|---|---|
| **Config/integrações** (tool_servers, MCP, modelos, providers) | `/root/CentralDark/apps/modulos/WebUI/data/` (já existe) | `/app/backend/data/` | Muda pela UI, salva no `webui.db` — zero restart |
| **Tema/CSS/logo CentralDark** | `/root/CentralDark/apps/modulos/WebUI/custom/static/` | `/app/backend/open_webui/static/` | Refresh do browser (Ctrl+F5) |
| **Prompts/personas/functions** | `/root/CentralDark/apps/modulos/WebUI/custom/functions/` | `/app/backend/data/functions/` | Auto-reload do WebUI (sem restart) |

## Fases

### Fase 1 — Fix imediato do Integrations (destravar hoje)
1. Backup do `docker-compose.override.yml` atual
2. Remover a linha `TOOL_SERVER_CONNECTIONS=...` (JSON mal escapado que quebra o `json.loads()` e retorna 500)
3. `docker compose up -d webui` — sobe limpo em ~5s
4. Cadastrar MCP na UI: **Settings → Connections → External Tool Servers → +**
   - URL: `https://mcp.centralldark.com/mcp`
   - Auth: Bearer `<MCP_SESSION_SECRET>` (já tá no cofre)
5. Verificar as 107 tools aparecendo

### Fase 2 — Bind-mount das 3 áreas editáveis
1. Criar estrutura no host:
   ```
   /root/CentralDark/apps/modulos/WebUI/custom/
   ├── static/          ← tema/logo/CSS
   └── functions/       ← prompts/personas
   ```
2. Copiar os arquivos atuais de dentro do container pro host (uma vez só, pra preservar defaults)
3. Editar `docker-compose.override.yml` adicionando volumes:
   ```yaml
   volumes:
     - ./data:/app/backend/data
     - ./custom/static:/app/backend/open_webui/static
     - ./custom/functions:/app/backend/data/functions
   ```
4. `docker compose up -d webui` uma última vez pra ativar os mounts
5. A partir daí: edita no host → efeito imediato ou restart de 3s (`docker restart CentralDark-WebUI`)

### Fase 3 — Documentação viva
Criar `apps/modulos/WebUI/EDITAR.md` com o mapa: "quer mudar X? edita arquivo Y". Assim qualquer IA nova (ou você em 3 semanas) sabe onde mexer sem quebrar nada.

## Trava e segurança
- `apps/modulos/WebUI/` é 🔒 protegido — este plano é o pedido formal de autorização (**PERMITO PIVETE WEBUI**)
- Backup automático do `docker-compose.override.yml` antes de qualquer edit (feito pelo `vps_write_file_safe`)
- Rollback = restaurar backup + `docker compose up -d`
- MCP secret nunca sai do cofre, nunca aparece em log
- Notificação Card Hermes v1.3 no @srver1bot quando concluir

## O que NÃO vai mudar
- Container continua Docker (isolamento preservado)
- Caddy/subdomínio `ui.centralldark.com` intocado
- Banco `webui.db` intocado (já era volume)
- Nenhuma migration, nenhuma reinstalação, nenhum downtime além dos 5s de restart

## Tempo estimado
- Fase 1: 5 min
- Fase 2: 10 min
- Fase 3: 5 min
- **Total: ~20 min**
