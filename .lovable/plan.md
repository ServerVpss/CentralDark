

# Sistema de Fila de Retry para Erros 429 do Telegram

## Problema
Quando muitos comandos são executados simultaneamente, o Telegram retorna erro `429 Too Many Requests`. Atualmente essas mensagens são perdidas.

## Solução
Adicionar retry com backoff na própria função `telegramRequest`, e para casos onde o retry também falha, salvar a mensagem numa tabela de fila no banco para ser processada depois por um cron job.

## Passo 1 — Criar tabela `telegram_message_queue`

```sql
CREATE TABLE telegram_message_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid,
  method text NOT NULL,          -- sendMessage, editMessageText, sendPhoto...
  payload jsonb NOT NULL,        -- body completo da requisição
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 5,
  retry_after timestamp with time zone,
  status text DEFAULT 'pending', -- pending, processing, done, failed
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE telegram_message_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON telegram_message_queue
  FOR ALL TO public USING (true) WITH CHECK (true);

CREATE INDEX idx_queue_status_retry ON telegram_message_queue (status, retry_after);
```

## Passo 2 — Atualizar `telegramRequest` no `telegram-webhook`

Adicionar na função `telegramRequest`:
- Detectar resposta 429 e ler `retry_after` do header/body
- Fazer 1 retry local com `sleep(retry_after)` (se <= 5 segundos)
- Se retry local falhar ou `retry_after > 5s`, salvar na tabela `telegram_message_queue` com o `retry_after` calculado
- Retornar `{ ok: true, queued: true }` para que o fluxo não quebre

## Passo 3 — Criar Edge Function `telegram-retry-queue`

Nova função que:
1. Busca mensagens da fila com `status = 'pending'` e `retry_after <= now()`
2. Para cada mensagem, busca o token do bot e executa a requisição
3. Se sucesso → marca como `done`
4. Se 429 novamente → incrementa `retry_count`, calcula novo `retry_after` com backoff exponencial
5. Se `retry_count >= max_retries` → marca como `failed`
6. Processa no máximo 20 mensagens por execução

## Passo 4 — Cron job a cada 30 segundos (ou 1 minuto)

Agendar execução periódica da `telegram-retry-queue` via pg_cron.

## Resultado
- Nenhuma mensagem é perdida por erro 429
- Retry local imediato para delays curtos (<=5s)
- Fila persistente para delays longos
- Backoff exponencial evita loops de rate-limit
- Máximo de 5 retries antes de desistir

