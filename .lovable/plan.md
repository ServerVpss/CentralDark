## Objetivo
Dar ao Hermes/MCP autoridade pra ler TODOS os segredos que ficam em `/root/CentralDark/secrets/` na VPS, de forma segura, sem expor nada pro frontend nem pro ChatGPT/Grok que conecta via MCP.

## Como vai funcionar (visão simples)

Hoje o `/admin/mcp` já tá autenticando com senha admin (acabamos de corrigir o bug do `gh_token`). Falta só uma coisa: uma **tool nova** dentro do MCP chamada `read_secret` (ou `list_secrets`) que, quando chamada por um cliente autenticado com escopo `admin`, lê os arquivos de `/root/CentralDark/secrets/` e devolve o conteúdo.

Fluxo:

```
ChatGPT/Grok (com token admin)
      ↓ chama tool "read_secret" via MCP
/admin/mcp no VPS
      ↓ valida escopo admin
      ↓ lê /root/CentralDark/secrets/<arquivo>
      ↓ devolve conteúdo
```

## Segurança (regras travadas)

1. **Só escopo `admin`** — nunca escopo `mcp` normal. Se o token não tiver `admin`, retorna 403.
2. **Whitelist de diretório** — a tool só lê de `/root/CentralDark/secrets/`. Qualquer tentativa de path traversal (`../`, `/etc/`, etc.) é bloqueada.
3. **Auditoria** — cada leitura grava log em `/root/CentralDark/logs/mcp-secrets-audit.log` com timestamp, IP, nome do segredo lido.
4. **Sem cache no cliente** — resposta com header `Cache-Control: no-store`.
5. **Nenhum segredo vaza pro frontend Lovable** — isso vive 100% na VPS, dentro do `dist/index.js` do MCP.

## Três tools novas

| Tool | O que faz | Escopo |
|---|---|---|
| `list_secrets` | Lista nomes dos arquivos em `/root/CentralDark/secrets/` (só nomes, sem valores) | `admin` |
| `read_secret` | Recebe `{ name: "TELEGRAM_BOT_TOKEN" }` e devolve o valor | `admin` |
| `read_all_secrets` | Devolve objeto `{ nome: valor }` com tudo de uma vez | `admin` |

## Implementação (VPS, modo build)

1. Editar `dist/index.js` (com backup `.bak.<timestamp>`) e adicionar as 3 tools no handler `/admin/mcp` na seção `tools/list` e `tools/call`.
2. Criar pasta `/root/CentralDark/logs/` se não existir.
3. `pm2 restart 17 --update-env`.
4. Testar via curl:
   ```
   curl -H "Authorization: Bearer <admin_token>" \
        -X POST https://webhook.centralldark.com/admin/mcp \
        -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"list_secrets"}}'
   ```
5. Reconectar no ChatGPT/Grok e testar `list_secrets` → `read_secret`.

## Perguntas antes de executar

1. **Formato dos arquivos em `/root/CentralDark/secrets/`**: são arquivos soltos tipo `TELEGRAM_BOT_TOKEN.txt` com o valor cru, ou é um `.env` gigante com `CHAVE=valor`? Isso muda a lógica da tool.
2. **Quer as 3 tools ou só `read_secret`+`list_secrets`?** (o `read_all_secrets` é conveniente mas mais perigoso se o token vazar).
3. **Confirma que só a senha admin autoriza?** Ou quer adicionar uma segunda camada tipo IP whitelist da VPS/Lovable?

Assim que responder isso + trocar pra build mode, eu aplico direto no VPS.