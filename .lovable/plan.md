
# Foco no builder.centralldark.com — 4 agentes em paralelo

## Antes de começar
Salvo a pendência aberta (fluxo guiado de reautorização OAuth do MCP) em `docs/PENDENCIAS.md` via `pendencias_add`, pra não perder. Depois mergulho 100% no builder.

## O alvo
- **Domínio:** `builder.centralldark.com`
- **Stack:** container `CentralDark-Builder` (Bolt fork) em `apps/modulos/Bolt/docker-compose.yml`
- **Roteia IA via:** Elite Gateway local (`host.docker.internal:8082` Anthropic, `api.centralldark.com/v1` OpenAI-like)
- **Exposto por:** Caddy → porta `127.0.0.1:5174`

## Os 4 sub-agentes (rodam em paralelo, read-only)

1. **Agente Saúde Operacional**
   - Bate `https://builder.centralldark.com` + `/health` se existir, mede latência e TTFB
   - Checa PM2/Docker do builder via MCP (`execute_command`, `vps_list_dir_safe`)
   - Confere Caddy: cert válido, redirect HTTPS, headers
   - Olha `pm2 logs` e `docker logs CentralDark-Builder` recentes (erros, restart loops)

2. **Agente IA/Gateway**
   - Testa Elite Gateway `http://VPS:8082/v1/messages` (Anthropic-compat) com requisição mínima
   - Testa `https://api.centralldark.com/v1/chat/completions` com a key `SEGREDO_ELITE_123`
   - Valida rotação de chaves (ap7 → Anthropic) e fallback
   - Olha logs do `elite-anthropic-proxy` e `Elite-Gateway` no PM2

3. **Agente Performance**
   - Mede bundle size do Bolt, tempo de boot do container, RAM/CPU em uso (`docker stats`)
   - Avalia se `CHOKIDAR_USEPOLLING=true` + `WATCHPACK_POLLING=true` tão custando CPU à toa
   - Verifica volume `CentralDark-Builder-node_modules` (tamanho, cache pnpm)
   - Sugere ajustes de Vite/HMR

4. **Agente UX/Frontend**
   - Abre o builder via Playwright headless, screenshot da home + 1 fluxo (criar projeto, abrir chat IA)
   - Captura erros de console e network 4xx/5xx
   - Confere se o chat IA do Bolt está chamando o gateway certo e voltando resposta

Cada agente devolve um mini-relatório (estado + achados + sugestões priorizadas).

## Depois dos 4 retornos
Eu consolido tudo no formato Placar Visual (Método Gamificado) com:
- Fase atual de cada frente
- ▓░ + ✅⚠️❌ por item
- O que falta
- Próximos passos (Leigo / Técnico)

## Aplicação de correções
Modo **auditar + aplicar fixes seguros** (default que assumi):
- Mudanças de config (env, cache, polling, headers Caddy) → aplico direto
- Mudança em `apps/modulos/mcp/`, `infra/caddy/`, `secrets/`, workflows → **paro e pergunto** (áreas protegidas do CLAUDE.md)
- Restart de container → peço OK antes
- Nada destrutivo sem confirmação

Se você quiser só relatório (sem aplicar nada) ou mão totalmente livre, me fala antes de eu rodar — caso contrário sigo nesse meio-termo.

## Áreas protegidas que NÃO toco sem "PERMITO PIVETE"
`apps/modulos/mcp/`, `infra/caddy/`, `secrets/`, `.github/workflows/`, `docs/CONSCIENCIA/`, `apps/bot-telegram/`, `scripts/webhook/`, `scripts/contas-admin/`.

## Risco
Baixo. Tudo de leitura primeiro; só aplico fix depois do retrato completo. Builder fica no ar o tempo todo da auditoria.
