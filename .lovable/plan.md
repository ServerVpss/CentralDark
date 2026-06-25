## Plano: consertar TLS do mcp.centralldark.com (Opção B)

**Contexto:** você manteve o `mcp` em DNS-only no Cloudflare (pra matar o bot block da OpenAI). Como a infra estava em Cloudflare Full (Strict) com cert CF-Origin, ao tirar o proxy o TLS caiu (HTTP 000 no browser, Painel/Claude/ChatGPT quebrados via domínio). Já existe um cert Let's Encrypt válido pra `mcp.centralldark.com` no servidor — só não está sendo servido. Vou editar **só o bloco do mcp no Caddy** pra apontar pra esse cert, validar e recarregar.

## Passos

1. **Inspecionar Caddy atual** (read-only)
   - Ler `/etc/caddy/Caddyfile` e `/etc/caddy/conf.d/*.Caddyfile` pra achar o bloco do `mcp.centralldark.com`.
   - Confirmar caminho exato do cert LE em `/var/lib/caddy/.../mcp.centralldark.com/`.

2. **Editar só o bloco do mcp** (escopo cirúrgico)
   - Trocar a diretiva de TLS daquele host pra usar o cert/key LE existente (`tls <cert.crt> <key.key>`), removendo qualquer referência ao cert CF-Origin **apenas naquele bloco**.
   - Zero mudança nos outros hosts (`whatsapp`, `crm`, `financeiro`, `bot.multizap.dev`, etc).

3. **Validar antes de aplicar**
   - `caddy validate --config /etc/caddy/Caddyfile` — se falhar, aborta sem reload.

4. **Reload do Caddy**
   - `systemctl reload caddy` (reload, não restart — zero downtime nos outros hosts).

5. **Smoke test**
   - `curl -I https://mcp.centralldark.com/health` deve responder 200.
   - `openssl s_client -connect mcp.centralldark.com:443 -servername mcp.centralldark.com </dev/null | openssl x509 -noout -issuer` deve mostrar `Let's Encrypt`.
   - Confirmar que `whatsapp.centralldark.com` e os outros continuam 200 (não regredi nada).

6. **Rollback automático**
   - Antes de editar, salvo backup do snippet em `/etc/caddy/conf.d/.backup-<timestamp>/`.
   - Se smoke test falhar, restauro backup + reload e reporto.

7. **Registrar na consciência**
   - Anotar em `docs/CONSCIENCIA/APRENDIZADOS.md` via MCP: "mcp em DNS-only usa cert LE direto, não CF-Origin" — pra próxima IA não tentar reativar proxy.

## Risco

Baixo e reversível. Mudança escopada num único bloco, backup automático, reload (não restart). Se algo der errado, rollback em 1 comando.

## Autorização

Preciso do seu **ok** pra rodar — vou mexer no Caddy da VPS via `vps_run_once_script` com `CONFIRMO RUN ONCE`.
