# Relatório de Segurança - Diagnóstico Realtime, Bot e Chat
**Data:** 2026-05-31

Este relatório foi gerado seguindo o padrão rigoroso estabelecido em `security/README.md`. Nenhuma execução ocorreu sem a prévia garantia de ocultação de secrets e preservação de dados sensíveis.

### 1. Quais dados sensíveis existem no fluxo?
Existem os seguintes dados críticos no sistema:
- `WUZAPI_ADMIN_TOKEN` (token mestre do WhatsApp/Go).
- `SUPABASE_SERVICE_KEY` (bypassa RLS no banco de dados).
- `GATEWAY_SERVER_TOKEN` (protege o orquestrador Node.js).
- `WUZAPI_WEBHOOK_SECRET` (valida os envios do WuzAPI pro Gateway).
- `SUPABASE_PUBLISHABLE_KEY` (anon key para front-end).
- Dados de usuários finais em `payloads` de webhooks (números de telefone, conteúdo de mensagens).

### 2. Onde eles passam?
Eles trafegam nas seguintes camadas:
- Requisições HTTP(S) do **WuzAPI** (container/Go) para o **Gateway** (Node.js/PM2).
- Requisições do **Gateway** para o banco de dados **Supabase** via REST/PostgREST.
- WebSocket payloads do **Supabase Realtime** para o frontend **React/Vite**.
- Podem ser vazados se logs do PM2 ou Docker não forem higienizados.

### 3. Quais endpoints recebem webhooks?
- No Gateway: O endpoint principal para o tráfego do WhatsApp é `/wuzapi` ou `/api/webhooks/wuzapi`.

### 4. Esses endpoints validam secret?
- **Sim.** O código do roteador de webhooks do Gateway extrai `req.headers['x-wuzapi-secret']` ou `req.query.secret` e o compara com `env.WUZAPI_WEBHOOK_SECRET`. Se inválido, retorna `401 Unauthorized`.

### 5. O Gateway valida origem/secret?
- **Sim.** Além da validação de webhooks, o middleware `authMiddleware.js` impede acesso a rotas privilegiadas sem o header `Authorization: Bearer <GATEWAY_SERVER_TOKEN>`.

### 6. Supabase usa service_role só no backend?
- **Sim.** O arquivo `apps/crm/atendimento-whatsapp-gateway-deploy/gateway/src/services/supabaseService.js` recupera a chave `SUPABASE_SERVICE_KEY` no backend para operações assíncronas em banco (logar eventos, salvar mensagens). 

### 7. O frontend recebe apenas anon key?
- **Sim.** O componente frontend (`apps/crm/src/integrations/supabase/client.ts`) é instanciado unicamente com `VITE_SUPABASE_PUBLISHABLE_KEY` e não injeta service keys.

### 8. Realtime está limitado às tabelas corretas?
- **Fator de Risco.** De acordo com as diretrizes de `REALTIME_SECURITY.md`, o Realtime deve estar ligado *apenas* em `messages`, `chats`, `connections` e `instances`. A ativação global (em tabelas de config ou usuários) exporia infraestrutura a ouvintes anônimos no WebSocket.

### 9. RLS protege mensagens por workspace/tenant/conexão?
- **A Validar no Supabase Studio.** O acesso pelo frontend exige RLS baseado em `auth.uid()` e, obrigatoriamente, matching de `workspace_id` ou `tenant_id` para garantir isolamento Multi-tenant (evitando que o cliente A veja o WhatsApp do cliente B).

### 10. Logs estão limpos de tokens e segredos?
- **Melhoria contínua aplicada.** O diagnóstico 021 foi configurado para **NUNCA** imprimir valores. O script `021-diagnostico-realtime-bot-chat.sh` verifica as instâncias das variáveis lendo-as do `.env` e mascarando as strings (ex: reportando apenas `EXISTE (XX caracteres)` e URLs censuradas).

### 11. O que precisa ser corrigido antes de produção?
1. Revisar no painel do Supabase se o `supabase_realtime` publication tem tabelas além de `messages/chats/connections`. 
2. Assegurar que os buckets de `Storage` (para imagens/áudios do WhatsApp) não sejam públicos, necessitando `Signed URLs` para visualização no chat.
3. Testar a eficácia da política RLS (acessar endpoint com usuário logado tentando puxar `connection_id` alheio).
