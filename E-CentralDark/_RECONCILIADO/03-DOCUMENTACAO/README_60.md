# 📂 apps/bot/src/pages/admin

Páginas internas do painel admin do bot. Cada `Admin*.tsx` aqui vira uma rota `/admin/...` registrada em `apps/bot/src/App.tsx` e aparece no menu lateral via `apps/bot/src/layouts/AdminLayout.tsx`.

## Páginas atuais

| Arquivo | Rota | O que faz |
|---------|------|-----------|
| `AdminApi.tsx` | `/admin/api` | Tokens e chaves de API |
| `AdminAutoReplies.tsx` | `/admin/auto-replies` | Respostas automáticas |
| `AdminBackups.tsx` | `/admin/backups` | Backups |
| `AdminCampaigns.tsx` | `/admin/campaigns` | Campanhas |
| `AdminChats.tsx` | `/admin/chats` | Conversas |
| `AdminCofreLovable.tsx` | `/admin/cofre` | Status do cofre Lovable + guia de rehidratação (cenário A vs B) |
| `AdminConnections.tsx` | `/admin/connections` | Conexões WhatsApp |
| `AdminContacts.tsx` | `/admin/contacts` | Contatos |
| `AdminFlows.tsx` | `/admin/flows` | Fluxos |
| `AdminSessions.tsx` | `/admin/sessions` | Sessões |
| `AdminWebhooks.tsx` | `/admin/webhooks` | Webhooks |

## Quando criar uma página nova aqui

1. Cria o `AdminAlgumaCoisa.tsx`.
2. Registra a rota em `apps/bot/src/App.tsx`.
3. Adiciona o item no menu em `apps/bot/src/layouts/AdminLayout.tsx`.
4. Atualiza essa tabela acima e o `PLANO.md` da pasta.
