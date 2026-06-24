## O que vou fazer

Documentar o **Elite Gateway** em dois lugares ao mesmo tempo: no repo GitHub `ServerVpss/CentralDark` e direto na pasta `/root/CentralDark/docs/` da VPS.

## Arquivo

**`docs/ELITE_GATEWAY.md`** com:

- **O que é** — proxy compatível com OpenAI que usa as contas-admin (ChatGPT/Claude/Gemini logadas via navegador) no lugar de API key paga
- **URL pública**: `https://elite.centralldark.com`
- **Token Bearer**: referência ao `.env` da VPS (valor real nunca entra no markdown)
- **Endpoints**: `GET /v1/models` e `POST /v1/chat/completions`
- **Como plugar no Cline, Bolt, Cursor, Continue** — passo a passo (Base URL + token + model `gpt-4o`)
- **Onde mora na VPS**:
  - Serviço na porta interna `8080`
  - Caddyfile: `/etc/caddy/centraldark-managed/root-imports/elite.centralldark.com.Caddyfile`
  - `.env` com token: `/root/CentralDark/config/.env`
  - Symlink contas-admin → Elite
- **Dependência do contas-admin**: profile ChatGPT precisa estar logado pelo noVNC (`status.centralldark.com/ai-review.html`) — senão dá timeout
- **Troubleshooting**: 403, resposta vazia, timeout
- **Comando `curl` de validação** pronto pra copiar

## Como vou publicar (dois caminhos, em paralelo)

1. **GitHub** — commit no repo `ServerVpss/CentralDark` branch `main` via API com `GH_TOKEN`
   Mensagem: `docs: adiciona documentação do Elite Gateway`
2. **VPS direto** — gravar o mesmo arquivo via MCP em `/root/CentralDark/docs/ELITE_GATEWAY.md` pra já aparecer lá imediatamente, sem depender do sync

## Também atualizo

- **`docs/README.md`** no repo — adicionar link pro novo doc na lista
- **Memória do projeto** (`mem://`) — registrar que o Elite Gateway tá documentado, URL, e que o token vivo só existe no `.env` da VPS

## O que NÃO vou fazer

- Não exponho o token real no markdown
- Não mexo em código do TelePanel (este sandbox)
- Não toco em Caddy, PM2 ou nada vivo na VPS

---
**Pode mandar?** Se sim, eu commito no GitHub e gravo na VPS no mesmo passo, e te mando o link do commit + confirmação da gravação.