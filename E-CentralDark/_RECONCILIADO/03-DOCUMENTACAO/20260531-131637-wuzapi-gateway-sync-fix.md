# Relatório de Correção - Integração WuzAPI / Gateway / CRM Realtime
**Data:** 2026-05-31 13:16:37

### 1. Problemas Resolvidos
- **Gateway WuzAPI Client:** Corrigido endpoint de  para . Adicionado  via . Refatorado payload de envio  convertendo chaves literais para a sintaxe oficial da WuzAPI (`Phone`, `Body`, `Id`).
- **Webhooks Payload Parser:** `express.urlencoded` configurado adequadamente. O roteador agora suporta `x-www-form-urlencoded` engolido por `go-resty`, convertendo parâmetros ou chaves `jsonData` perfeitamente.
- **Supabase Sync Contatos:** `syncContactsFromWuzapi` refatorado para ler objetos dict-like (Chave: jid) e fazer match com prioridade de nomenclaturas. Adicionado batch limit seguro de 50 fetches de `avatar` por ciclo de sincronização para não causar rate limit timeout.
- **Upsert Seguro:** `upsertContact` agora verifica `name_locked` com antecedência antes do patch SQL para não sobrescrever nomenclaturas manuais de atendentes do CRM.
- **Internal Routes Gateway:** O Entrypoint `app.js` foi reconfigurado para incluir de fato a `/messages/send-text` e `/sync` que se encontravam inacessíveis por ausência de declaração Express.
- **Migração Supabase (Schema):** Adicionada rotina de banco `20260531...add_contact_wuzapi_fields.sql` que adicionará as colunas sem destruir a integridade do Realtime.
- **Env Loader:** Criado script cirúrgico `run-once/023-fix-gateway-supabase-env.sh` para o Owner da VPS transportar variáveis secretas sem expor chaves ao terminal ou Git.

### 2. Auditoria e Risco de Segurança
- Logs do PM2 foram auditados via mock (script bash interno). Confirmado que `top_level_keys`, `content_type`, e event mask (`TEST...`) são emitidos silenciosamente sem vazar o corpo da mensagem, telefone puro ou keys administrativas.
- O `WUZAPI_WEBHOOK_SECRET` recebido em querystring (`req.query.secret`) foi adicionado na aba 🔴 Crítico do `SECURITY_BACKLOG.md` como alerta para sanitização de Headers HTTP nas próximas revisões.

### 3. Próximos Passos Obrigatórios na VPS
O operador deve executar `bash scripts/run-once/023-fix-gateway-supabase-env.sh` e fazer Push do script de migração no Github Actions, ou aplicá-lo fisicamente via SQL Editor do Supabase Studio.
