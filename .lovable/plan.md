
# Sistema de Contadores Automáticos para Bot Analytics

## Visão Geral

Este plano implementa um sistema robusto de contadores automáticos que atualiza corretamente a tabela `bot_analytics` quando mensagens são processadas pelos bots do Telegram.

## Problema Identificado

O código atual usa `upsert` com valores fixos:
```javascript
await this.supabase.from("bot_analytics").upsert({
  bot_id: this.bot.id,
  date: new Date().toISOString().split("T")[0],
  messages_received: 1,  // Isso SUBSTITUI ao invés de INCREMENTAR!
  ...
}, { onConflict: "bot_id,date" });
```

Isso significa que a cada mensagem processada, os contadores são **resetados para 1** ao invés de **incrementados**.

## Solução

Criar uma função PostgreSQL para incrementar contadores de forma atômica e segura.

## Implementação

### Etapa 1: Criar Função de Incremento no Banco de Dados

Criar uma função RPC `increment_bot_analytics` que:
- Recebe o `bot_id` e os campos a incrementar
- Faz um `INSERT ... ON CONFLICT ... UPDATE` com incremento real
- Garante operações atômicas (sem race conditions)

```text
┌─────────────────────────────────────────────────────────────┐
│  FLUXO DE ATUALIZAÇÃO DE ANALYTICS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Mensagem Recebida                                          │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │ telegram-webhook │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────────────┐                               │
│  │ increment_bot_analytics() │  ◄── Nova função RPC         │
│  └────────────┬─────────────┘                               │
│               │                                             │
│               ▼                                             │
│  ┌─────────────────────────────┐                            │
│  │  INSERT ... ON CONFLICT     │                            │
│  │  SET field = field + value  │  ◄── Incremento atômico    │
│  └─────────────────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Etapa 2: Atualizar Edge Function `telegram-webhook`

Modificar o método `guardMessage` para chamar a função RPC:

**Antes:**
```javascript
await this.supabase.from("bot_analytics").upsert({
  messages_received: 1,
  blocked_messages: isBlocked ? 1 : 0,
  ...
}, { onConflict: "bot_id,date" });
```

**Depois:**
```javascript
await this.supabase.rpc("increment_bot_analytics", {
  p_bot_id: this.bot.id,
  p_messages_received: 1,
  p_blocked_messages: isBlocked ? 1 : 0,
  p_spam_detected: blockedReason === "spam_detected" ? 1 : 0,
  p_links_blocked: blockedReason === "link_detected" ? 1 : 0
});
```

### Etapa 3: Adicionar Contadores para Novos Usuários

Detectar novos usuários e incrementar `new_users`:
- Verificar se o usuário já existe em `telegram_subscriptions`
- Se for novo, incrementar o contador

### Etapa 4: Adicionar Contadores para Usuários Ativos

Implementar rastreamento de usuários ativos diários:
- Criar tabela auxiliar `daily_active_users`
- Ao final do dia, consolidar contagem para `active_users`

### Etapa 5: Atualizar Edge Function `telegram-bot`

Corrigir o mesmo problema de incremento no arquivo `telegram-bot/index.ts` para `messages_sent`.

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/migrations/` | Nova migração com função RPC |
| `supabase/functions/telegram-webhook/index.ts` | Usar função RPC para incrementos |
| `supabase/functions/telegram-bot/index.ts` | Usar função RPC para incrementos |

## Detalhes Técnicos

### Função PostgreSQL `increment_bot_analytics`

```sql
CREATE OR REPLACE FUNCTION increment_bot_analytics(
  p_bot_id UUID,
  p_messages_received INT DEFAULT 0,
  p_messages_sent INT DEFAULT 0,
  p_new_users INT DEFAULT 0,
  p_active_users INT DEFAULT 0,
  p_blocked_messages INT DEFAULT 0,
  p_spam_detected INT DEFAULT 0,
  p_links_blocked INT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO bot_analytics (
    bot_id, date, 
    messages_received, messages_sent, new_users, active_users,
    blocked_messages, spam_detected, links_blocked
  )
  VALUES (
    p_bot_id, CURRENT_DATE,
    p_messages_received, p_messages_sent, p_new_users, p_active_users,
    p_blocked_messages, p_spam_detected, p_links_blocked
  )
  ON CONFLICT (bot_id, date) DO UPDATE SET
    messages_received = bot_analytics.messages_received + EXCLUDED.messages_received,
    messages_sent = bot_analytics.messages_sent + EXCLUDED.messages_sent,
    new_users = bot_analytics.new_users + EXCLUDED.new_users,
    active_users = bot_analytics.active_users + EXCLUDED.active_users,
    blocked_messages = bot_analytics.blocked_messages + EXCLUDED.blocked_messages,
    spam_detected = bot_analytics.spam_detected + EXCLUDED.spam_detected,
    links_blocked = bot_analytics.links_blocked + EXCLUDED.links_blocked;
END;
$$;
```

### Rastreamento de Novos Usuários

Na função `handleNewMember` e na primeira interação privada, verificar se o usuário é novo e incrementar contador.

### Rastreamento de Usuários Ativos

Usar uma abordagem de Set para rastrear IDs únicos por dia (via tabela auxiliar ou Redis-like pattern no Supabase).

## Benefícios

1. **Precisão**: Contadores incrementam corretamente
2. **Atomicidade**: Sem race conditions em atualizações concorrentes
3. **Performance**: Operação única no banco (UPSERT com incremento)
4. **Visibilidade**: Dashboard mostra dados reais de uso
5. **Análise**: Métricas confiáveis para tomada de decisão

## Próximos Passos

Após implementação, os gráficos de Analytics no dashboard mostrarão:
- Mensagens recebidas/enviadas por dia
- Novos usuários registrados
- Usuários ativos diários
- Mensagens bloqueadas (spam, links)
