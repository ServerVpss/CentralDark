# Lote 2 — Auditoria real do endpoint `listChats` (read-only) — CONCLUÍDO

**Data:** 2026-06-09 13:55 BRT  
**Status:** ✅ Concluído  
**Modo:** read-only (somente GET, sem mutação)  
**Alvo:** WuzAPI `asternic/wuzapi:latest` rodando em `127.0.0.1:8081` (container `multizap-gateway-wuzapi-1`)

## Resultado-chave

**A WuzAPI não tem endpoint nativo de "list chats".** No spec OpenAPI oficial
da imagem (`/api/spec.yml`, 102KB, 60+ paths catalogados) o conceito de "chats
do WhatsApp" é decomposto em:

| Conceito CentralDark | Endpoint WuzAPI real | Método |
|---|---|---|
| chats 1:1 (contatos) | `/user/contacts` | `GET` |
| chats em grupo | `/group/list` | `GET` |
| histórico de mensagens de um chat | `/chat/history` | `GET` |

## Execução

Run-once `audit-list-chats-endpoint.mjs` testou 9 candidatos sintéticos
(`/chat/list`, `/chats`, `/chat`, `/chats/list`, `/session/chats`,
`/user/chats`, `/conversation/list`, `/chat/all`, `/chats/all`):

- **9/9 retornaram HTTP 404** com `WUZAPI_ADMIN_TOKEN` (sanitizado, nunca
  saiu da VPS).
- Inspeção subsequente de `/api/spec.yml` confirmou que essas rotas
  simplesmente não existem na build atual.

Relatório bruto: `/root/CentralDark/revisoes/20260609-135511-listchats-audit/relatorio.json`

## Garantias de segurança cumpridas

- ✅ Apenas GETs.
- ✅ `WRITE_FRAGMENTS` espelhado do adaptador oficial — nenhum fragmento de
  escrita pôde sair.
- ✅ Nenhuma sessão WhatsApp foi tocada (admin token só vê metadata, não
  invoca whatsmeow).
- ✅ Container, Docker, Caddy e banco não foram tocados.
- ✅ Token nunca trafegou entre VPS e sandbox.

## Ação aplicada no código

`CentralDark/apps/bot-server/src/gateways/whatsapp/wuzapi-readonly-audit.ts` atualizado:
`listChats` agora aponta para `/user/contacts` (GET, documentado=true) com
nota explicando a decomposição. Campo `<configuravel>` removido.

## Próximo lote sugerido

**Lote 3** — implementar service `getCentralDarkChats()` no
`read-only-whatsapp-service.ts` que combina `/user/contacts` + `/group/list`
em um único array `CentralDarkChatSummary[]`, com testes unitários usando
fixtures sanitizadas (sem token, sem rede).
