# O que descobri agora (com o conector já funcionando)

Consegui entrar na VPS pelo conector novo. Confirmei o seguinte:

- A pasta `/root/CentralDark/apps/modulos/mcp/` existe, mas só tem **`package.json` + `tsconfig.json` + `logs/`**. **Não tem `src/` nem `dist/`** ali.
- O `package.json` diz que é o pacote `@centraldark/mcp v0.3.0` ("Servidor MCP da CentralDark — conecta IAs à infraestrutura"), com `main: dist/index.js`, deps `@modelcontextprotocol/sdk`, `express`, `zod`.
- A pasta `/root/CentralDark/apps/mcp/` também só tem logs.
- O servidor MCP está vivo agora (`runtimeTools: 70`, `dispatcher: mcp_admin_call`), então o código **está rodando em outro caminho da VPS**, fora do repositório Git `/root/CentralDark/`.
- O conector me prende dentro de `/root/CentralDark/` e bloqueou meu `pm2 jlist` (precisa de `MCP_ALLOW_VPS_COMMANDS=true`), então eu não consigo descobrir sozinho onde está o `dist/index.js` que o PM2 está executando.

# Como resolver — escolha 1 dos 3 caminhos

**Caminho A — Liberar comando 1x na VPS (mais rápido, 30s)**
Você libera `MCP_ALLOW_VPS_COMMANDS=true` no `.env` do MCP e reinicia. Aí eu rodo `pm2 jlist`, descubro o `pm_exec_path` real do processo `MCP-CentralDark`, leio o `src/index.ts` e te explico em PT-BR como o servidor monta as 70 tools, autenticação, OAuth GitHub, etc.

**Caminho B — Ler pelo GitHub (`ServerVpss/CentralDark`)**
Se o código fonte estiver versionado no repo `ServerVpss/CentralDark` (mesmo que num path tipo `packages/mcp/src/`), eu uso `github_read` com o `GH_TOKEN` que já está nos secrets, baixo `src/index.ts` e te explico. Risco: pode estar fora do repo (ex.: só na VPS).

**Caminho C — Você me diz o path**
Se você já souber onde está (`/opt/mcp`, `/srv/centraldark-mcp`, um clone separado, etc.), me passa o caminho absoluto e eu leio direto via `vps_read_file_safe` desde que esteja dentro de uma raiz permitida.

# Recomendação

Vai de **A**: é o mais limpo. Em 1 minuto eu mapeio tudo e te explico em linguagem simples como o MCP funciona por dentro (boot, registro de tools, auth, ciclo ChatGPT → VPS → resposta).

Me confirma qual caminho seguir e parto pra cima.
