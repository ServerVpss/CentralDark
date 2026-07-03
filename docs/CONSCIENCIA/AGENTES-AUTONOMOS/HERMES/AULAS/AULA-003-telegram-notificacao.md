# AULA-003 — Notificação Telegram pós-ação

**Data:** 2026-07-03  
**Categoria:** procedimento  
**Pré-requisitos:** nenhum  
**Tempo estimado:** 2 min

## 1. O que é
Regra obrigatória: ao final de toda tarefa, enviar 2 posts via connector Telegram já linkado. Sem exceção. Sem pedir token.

## 2. Quando usar
- Fim de qualquer bloco/fase/deploy
- Sucesso ou falha (ambos merecem card)
- **Nunca** postar em Monitoramento direto — só admin privado + canal Status

## 3. Como fazer
1. Montar card HTML com timestamp BRT + bullets do que rolou
2. POST no `sendMessage` do gateway com `TELEGRAM_ADMIN_CHAT_ID`
3. Segundo POST curto com `TELEGRAM_STATUS_CHANNEL_ID`

## 4. Comandos prontos
```bash
node scripts/notificar-rollout-arsenal.mjs
```

Ou inline:
```bash
curl -X POST https://connector-gateway.lovable.dev/telegram/sendMessage \
  -H "Authorization: Bearer $LOVABLE_API_KEY" \
  -H "X-Connection-Api-Key: $TELEGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":1901426549,"text":"✅ ...","parse_mode":"HTML"}'
```

## 5. Armadilhas
- ❌ Usar `atualizar_painel` (dispatcher bugado)
- ❌ Pedir token pro user (já tá no connector)
- ❌ Mexer em VPS pra mandar mensagem (não precisa)
- ❌ Postar cards longos no canal Status (deixa privado; canal recebe só linha)

## 6. Verificação
- ✅ Response JSON com `"ok": true`
- ⚠️ 401/403 → connector precisa reconectar
- ⚠️ Nenhuma resposta em 10s → gateway fora

## 7. Ver também
- ROTAS-FIXAS/notificacao-telegram.md
- APRENDIZADOS/001-token-bot-vs-sessao-user.md
