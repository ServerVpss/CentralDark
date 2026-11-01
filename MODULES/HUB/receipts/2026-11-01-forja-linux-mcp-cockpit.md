# Forja Linux — MCP, Instinto Superior e rota privada

Measured UTC: 2026-11-01T19:31:55.999507+00:00
Base source: 14153f91ad9929cd5456d00c8ec50da74901cdc0. Writer: Codex nesta sessão; apps/modulos/cloudroom preservado.

- INTENÇÃO: executar MCP STDIO e cockpit no Linux, chave pelo Admin, transporte privado para Casa/outros dispositivos.
- OWNER: apps/modulos/mcp; apps/instinto-superior; MODULES/HUB/CENTRALDARK-HUB-CREDENTIAL-CONTROL-PLANE.md.
- CURRENT: systemd user centraldark-mcp-tunnel.service e centraldark-instinto-superior.service ativos; loginctl Linger=yes. Túnel responde via plugin OpenAI; Sala de Controle HTTP 200 e navegador redireciona a /auth. Tailscale user unit ativa, backend NeedsLogin.
- ENV: arquivo completo no checkout Linux, modo0600, SHA256 8c19647b6c7e6f333d6a59625c9bba76a542bd1dde06ccc7a1d4958cb62e06fd igual à origem; nenhum valor neste recibo.
- DELTA: dependências locais; tunnel-client oficial v0.0.18 recebido do pacote do CHEFE; perfil e units privadas no usuário Linux; entrada da chave no Admin existente; sondas de portas Linux via ss/pgrep; papel CASA explícito, sem presumir VPS por hostname.
- PROVA: handshake STDIO, listTools, mcp_status, unknown-tool rejection PASS; chamada mcp_status pelo plugin em 2026-11-01T19:28:00.559Z PASS, cid 186d7a40-a384-4be8-a524-e8e62c3e0808. Build node-server final PASS; testes de gates, gravação0600, ausência de segredo no retorno/comando, restart fixo e falha parcial PASS. Bundle público: zero valores secretos da .env encontrados.
- LIMITES: typecheck global ainda tem erros anteriores em AutoSyncButton, DesignCenter e StatusPanel; não alegar tsc verde. auditStartupReady=false não foi contornado. Login admin humano e acesso de segundo dispositivo UNKNOWN. API Tailscale antiga HTTP401; Linux NeedsLogin; não migrada identidade Windows nem tokens Tailscale. VPS não alterada.
- TAILSCALE: 1.104.4 Linux amd64; SHA256 oficial 624ea093d47d62cf56f17b8332d74b8decda4a1faa610ebc60a1de334b2b3dc9 confirmado. Nada de Funnel público.
- ROLLBACK: remover apenas units/perfil desta instalação após preservar credencial no owner; reverter commit do escopo, sem reset/clean e sem tocar cloudroom. Não apagar .env original.
- NEXT_CURSOR: autenticação Tailscale → Serve HTTPS privado 8080 → readback Windows/segundo dispositivo → login admin → provar campo e sondas pelo cockpit.
