---
id: 20260607-0235-diagnostico-mcp-grok-conector
status: aberta
origem: chatgpt
destino: grok
risco: baixo
---

# Tarefa

Grok, diagnostique por que o conector personalizado do Grok falha ao conectar no MCP CentralDark.

## Contexto

O usuário tentou adicionar um conector personalizado no Grok com nome + URL do servidor MCP e recebeu:

```txt
Conexão falhou
Desculpe, houve um problema ao conectar a este servidor MCP.
```

O MCP CentralDark está online para ChatGPT/conector atual. O serviço PM2 `MCP-CentralDark` está online, a porta local 9100 está em LISTEN, os logs mostram `mcp_request_handled` e OAuth refresh funcionando.

URL provável usada pelo usuário deve ser validada:

```txt
https://mcp.centralldark.com/mcp
```

## Objetivo

Descobrir se a falha é:

1. URL errada usada no Grok.
2. Grok não aceita OAuth/dynamic registration igual ao ChatGPT.
3. Grok espera SSE antigo em vez de Streamable HTTP.
4. Grok procura discovery em caminho diferente.
5. CORS/headers/content-type incompatíveis.
6. Algum erro real no MCP quando uma tentativa nova vem do Grok.

## Regras obrigatórias

- Somente diagnóstico e leitura.
- Não reiniciar MCP.
- Não reiniciar Caddy.
- Não mexer em DNS, Cloudflare, domínio, secrets ou banco.
- Não expor tokens, client secrets, cookies, sessões ou Authorization.
- Não editar código ainda.
- Salvar logs completos sanitizados em `docs/tarefas/resultados/` ou relatório equivalente.

## Verificações pedidas

1. Testar localmente na VPS, sem secrets expostos:
   - `curl -i http://127.0.0.1:9100/health`
   - `curl -i http://127.0.0.1:9100/tools.json`
   - `curl -i http://127.0.0.1:9100/.well-known/oauth-protected-resource`
   - `curl -i http://127.0.0.1:9100/.well-known/oauth-authorization-server`
   - `curl -i http://127.0.0.1:9100/.well-known/oauth-protected-resource/mcp`
   - `curl -i http://127.0.0.1:9100/.well-known/oauth-authorization-server/mcp`
   - `curl -i -X POST http://127.0.0.1:9100/mcp` com JSON-RPC mínimo sem Authorization, só para ver erro esperado/sanitizado.
2. Testar externamente via domínio público:
   - `https://mcp.centralldark.com/health`
   - `https://mcp.centralldark.com/tools.json`
   - `https://mcp.centralldark.com/.well-known/oauth-protected-resource`
   - `https://mcp.centralldark.com/.well-known/oauth-authorization-server`
   - `https://mcp.centralldark.com/.well-known/oauth-protected-resource/mcp`
   - `https://mcp.centralldark.com/.well-known/oauth-authorization-server/mcp`
   - `POST https://mcp.centralldark.com/mcp` sem Authorization, registrar apenas status/headers/erro sanitizado.
3. Verificar no código se existe endpoint SSE (`/sse`, `/events`, `EventSource`) ou só Streamable HTTP (`/mcp`).
4. Verificar headers importantes: `content-type`, `www-authenticate`, CORS quando aplicável.
5. Comparar com o que um conector MCP externo normalmente precisa: URL base `/mcp`, discovery OAuth e dynamic registration.

## Responder neste formato

```txt
============================================================
[GROK] DIAGNÓSTICO MCP PARA CONECTOR GROK FINALIZADO
============================================================
Status: Concluído / Com erro / Precisa de revisão
Resumo executivo: ...
URL correta para testar no Grok: ...
Rotas locais OK: ...
Rotas públicas OK: ...
Resposta do POST /mcp sem auth: ...
Discovery OAuth: OK / Falha / Parcial
Transporte disponível: Streamable HTTP / SSE / ambos / indefinido
Compatibilidade provável com Grok: OK / Parcial / Não compatível ainda
Causa provável da falha: ...
Correção sugerida sem mexer em produção: ...
Correção que exigiria alteração de código: ...
Ações sensíveis necessárias: sim/não, quais
Próximo passo recomendado para ChatGPT revisar: ...
============================================================
```
