# Relatório de Diagnóstico e Resolução - Banco de Dados do BOT (whatsapp_connections)
**Data:** 2026-05-31

### Problema Validado (Bug Diagnosticado)
O módulo frontend do Chat (Bot) e o seu Worker de Sincronização em Node.js tentavam acessar uma tabela chamada `instances`. O projeto foi migrado de um banco da *Lovable* para um **Banco Próprio da Empresa**, onde essa tabela simplesmente não existia, nem precisava existir, pois já existe a tabela definitiva e real: `whatsapp_connections`.
Criar uma tabela `instances` extra fragmentaria a fonte da verdade e abriria buracos na política RLS e na orquestração dos disparos de Webhook.

### Soluções e Provas Técnicas Implementadas:
1. **Frontend Hook Adaptado:** Em vez de refazer a tela, a interface `Instance` local do TS (em `instanceService.ts`) foi readaptada como *Adapter* (camada de abstração). Ela intercepta as colunas nativas (`qr_code`) e transforma virtualmente em (`qr_code_base64`) de modo silencioso e transparente aos antigos hooks React.
2. **Channel de Sockets Realtime:** Alterado o listen de `.channel("instances-realtime")` para `.channel("whatsapp_connections-realtime")` via parseamento no Event Handler.
3. **Bridge Sync (Worker PM2):** Todos os métodos `.from('instances')` em `apps/bot/server/src/bridge/supabase-sync.js` foram direcionados para `.from('whatsapp_connections')`. Atualização na escrita de propriedades que antes usavam chaves incorretas.

### Riscos Evitados e Segurança
O uso indiscriminado de queries não atestados (`select=access_token,app_secret`) do provedor nativo do CRM foi **estritamente omitido**. O bot lista puramente colunas seguras usando o alias explícito. O backend local (`.env`) jamais interage com `GATEWAY_SERVER_TOKEN` da interface cliente. Nenhuma exclusão de dados antigos (`DELETE`) do Caddyfile ou da engine Express foi executada.
