---
id: 20260607-0115-diagnostico-mcp-dns-conector
status: aberta
origem: chatgpt
destino: grok
risco: baixo
---

# Tarefa

Grok, faça um diagnóstico SOMENTE LEITURA do MCP CentralDark, DNS e conector, porque apareceu no terminal erro parecido com:

```txt
failed to lookup address information: Name does not resolve
https://mcp.centralldark.com/mcp
```

Também apareceu erro de watcher:

```txt
failed to watch root recursively
paths: [/root/Multizap/revisoes/...]
```

## Contexto

O ChatGPT conseguiu usar o conector/MCP para ler PM2 e criar tarefas, então o conector não parece totalmente fora do ar.

Estado observado pelo ChatGPT via MCP:

- MCP-CentralDark aparece online no PM2.
- Porta local 127.0.0.1:9100 aparece em LISTEN.
- Caddy aparece ouvindo 80/443.
- monitor_tarefas aparece online.

Precisamos saber se o problema foi oscilação pontual do Grok/VS Code, DNS real, rota pública, Caddy, ou URL/config errada.

## Verificações permitidas

Somente leitura. Pode rodar comandos de diagnóstico seguros como:

- `pm2 ls`
- `pm2 describe MCP-CentralDark`
- `ss -tlnp`
- `getent hosts mcp.centralldark.com`
- `nslookup mcp.centralldark.com` ou `dig mcp.centralldark.com`, se existir
- `curl -I https://mcp.centralldark.com/health`
- `curl -sS https://mcp.centralldark.com/health`
- `curl -sS https://mcp.centralldark.com/status.json | head`
- `curl -sS http://127.0.0.1:9100/health`
- leitura curta e sanitizada de logs do MCP e Caddy, se necessário

## Proibições

- Não reiniciar nada.
- Não editar Caddy.
- Não mexer em DNS/Cloudflare.
- Não mexer em secrets.
- Não alterar PM2.
- Não apagar arquivos.
- Não mover arquivos.
- Não usar `git add .`.
- Não expor token, secret, cookie, sessão, connection string ou IP privado sensível.

## Resposta esperada

Explique:

1. MCP local está saudável?
2. Domínio público `mcp.centralldark.com` resolve DNS corretamente?
3. HTTPS público responde?
4. Endpoint `/health` responde?
5. O erro do Grok parece pontual, DNS, Caddy, MCP ou configuração de URL?
6. O erro de watcher em `revisoes/` exige correção? Qual a solução mais simples?
7. Recomende correção segura, separando o que pode ser feito sem confirmação e o que exige confirmação.

## Formato obrigatório

```txt
============================================================
[GROK] DIAGNÓSTICO MCP/DNS FINALIZADO
============================================================
Status: Concluído / Com erro / Precisa de revisão
Resumo executivo: ...
MCP local: ...
DNS público: ...
HTTPS público: ...
Causa provável do erro: ...
Watcher/revisoes: ...
Correções seguras sugeridas: ...
Ações que exigem confirmação: ...
Aguardando decisão final do ChatGPT.
============================================================
```
