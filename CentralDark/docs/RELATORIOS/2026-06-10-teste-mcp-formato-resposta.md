# Teste do formato da resposta do MCP CentralDark — 2026-06-10

## Pergunta
Por que o cliente Python falhou em fazer `json.loads()` na resposta de `POST /mcp` mesmo com token válido?

## Como rodei
Via `ssh-vps`, na própria VPS:

```bash
TOKEN=$(grep ^MCP_CENTRALDARK_TOKEN= /root/CentralDark/secrets/mcp.env | cut -d= -f2-)
curl -sk -L -D headers.txt -o body.txt \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H "authorization: Bearer $TOKEN" \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  https://mcp.centralldark.com/mcp
```

Artefatos: `/root/CentralDark/revisoes/teste-mcp-final/{headers.txt,body.txt}` (token NÃO consta).

## Resultado (sanitizado)

```
HTTP/2 200
content-type: text/event-stream
cache-control: no-cache
```

Corpo (início):

```
event: message
data: {"result":{"tools":[{"name":"kit_boas_vindas", ...
```

Tamanho do body: ~44 KB. Catálogo veio íntegro.

## Diagnóstico
**Cenário (b): resposta em SSE.** O servidor MCP responde `/mcp` no formato Streamable HTTP / SSE
(`text/event-stream`), com uma linha `event: message` + uma linha `data: <json>`.

- Token: OK (200, conteúdo válido).
- Auth: OK.
- O erro do cliente Python anterior foi parser: tentou `json.loads(body)` no payload SSE inteiro,
  que NÃO é JSON puro. Tem que primeiro extrair as linhas `data:` e dar `json.loads` em cada uma
  (ou concatenar, se vier multi-frame).

## Próximos passos
1. Cliente Python: ler linha a linha, juntar tudo após `data: ` até linha em branco, `json.loads` no resultado.
2. Conectores externos (Grok / Lovable): garantir que enviam `Accept: application/json, text/event-stream`
   e que sabem decodificar SSE — a maioria dos clientes MCP oficiais já faz isso nativo.
3. Atualizar a skill `mcp-centraldark-connector` reforçando que `/mcp` é SSE por padrão
   (já está documentado em "Erros comuns", mas vale destacar no fluxo principal).

## O que NÃO foi tocado
Caddy, PM2, Docker, WuzAPI, WhatsApp, CRM, banco, secrets, domínio. Sem restart, sem edição de produção.
