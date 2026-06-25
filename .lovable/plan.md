Plan: Desativar proxy Cloudflare (nuvem laranja → cinza) do subdomínio `mcp.centralldark.com` no domínio `centralldark.com`.

Objetivo: Fazer o subdomínio `mcp.centralldark.com` apontar diretamente para o IP da VPS (modo DNS only), sem passar pelo proxy/reverse da Cloudflare.

Passos:
1. Identificar o zone ID do domínio `centralldark.com` via Cloudflare API usando as secrets já configuradas (`CLOUDFLARE_API_TOKEN` ou `CF_API_TOKEN`).
2. Listar os registros DNS da zona para encontrar o record ID do subdomínio `mcp.centralldark.com`.
3. Verificar o estado atual (se já está em `proxied: false`, não fazer nada; se `proxied: true`, prosseguir).
4. Atualizar o registro DNS para `proxied: false` (DNS only).
5. Validar via DNS lookup que o subdomínio resolve para o IP da VPS diretamente, sem Cloudflare proxy.
6. Testar se `https://mcp.centralldark.com/health` continua respondendo corretamente.
7. Registrar a mudança em `docs/PENDENCIAS.md` ou log apropriado, se aplicável.

Riscos e observações:
- Desativar o proxy expõe o IP real da VPS para o subdomínio `mcp.centralldark.com`.
- Certificado SSL no domínio pode continuar funcionando se a VPS já servir HTTPS via Caddy/Let's Encrypt.
- O serviço MCP na VPS (porta 9100) deve continuar respondendo normalmente.
- Ação reversível: pode reativar o proxy depois se precisar.

Validação:
- `mcp.centralldark.com` resolve para o IP da VPS.
- `https://mcp.centralldark.com/health` retorna HTTP 200 com o catálogo esperado.
- Nenhuma interrupção de serviço detectada nos logs do PM2 `MCP-CentralDark`.