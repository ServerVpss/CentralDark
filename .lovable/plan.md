

## Plano: Corrigir Loop de Consultas Duplicadas

### Problema Identificado

O Telegram está enviando a mesma mensagem repetidamente porque:

1. **Webhook Timeout**: A busca de foto em 27 estados leva muito tempo (~30s), e o Telegram reenvia webhooks que não foram respondidos rapidamente
2. **Sem proteção de duplicatas**: O código não verifica se já processou a mesma `update_id`
3. **Logs mostram**: A mesma consulta `/foto 09710078100` (update_id: 305657436) foi processada múltiplas vezes

### Solução

#### Parte 1: Responder Imediatamente ao Telegram

Modificar o fluxo para:
- Responder "OK" ao Telegram ANTES de processar a consulta
- Usar processamento assíncrono para consultas longas

#### Parte 2: Proteção Contra Duplicatas

Adicionar uma tabela de cache ou verificação para evitar processar a mesma `update_id` mais de uma vez:

```typescript
// No início do handleUpdate()
const updateId = update.update_id;

// Verificar se já processamos este update
const { data: existing } = await this.supabase
  .from("processed_updates")
  .select("id")
  .eq("update_id", updateId)
  .eq("bot_id", this.bot.id)
  .single();

if (existing) {
  console.log(`Update ${updateId} already processed, skipping`);
  return;
}

// Marcar como processado ANTES de executar
await this.supabase.from("processed_updates").insert({
  update_id: updateId,
  bot_id: this.bot.id
});
```

#### Parte 3: Otimizar Busca Nacional de Fotos

Aumentar o batch size para acelerar a busca:
- Atual: 5 estados por vez (27/5 = 6 batches = ~25-30s)
- Novo: 9 estados por vez (27/9 = 3 batches = ~10-15s)

E adicionar timeout mais curto por estado:
```typescript
// Timeout de 3s por estado para não travar
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3000);
```

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/telegram-webhook/index.ts` | Adicionar proteção de duplicatas e otimizar busca |

### Migração de Banco de Dados

Criar tabela para rastrear updates processados:

```sql
CREATE TABLE IF NOT EXISTS processed_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id BIGINT NOT NULL,
  bot_id UUID NOT NULL REFERENCES telegram_bots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(update_id, bot_id)
);

-- Índice para busca rápida
CREATE INDEX idx_processed_updates_lookup ON processed_updates(update_id, bot_id);

-- Limpar registros antigos automaticamente (mais de 1 hora)
CREATE OR REPLACE FUNCTION cleanup_old_updates()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM processed_updates WHERE created_at < NOW() - INTERVAL '1 hour';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_updates
AFTER INSERT ON processed_updates
FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_old_updates();
```

---

### Resumo das Mudanças

1. **Proteção de duplicatas**: Evita processar a mesma mensagem múltiplas vezes
2. **Busca mais rápida**: Aumentar batches de 5 para 9 estados
3. **Timeout por estado**: 3 segundos máximo por requisição
4. **Limpeza automática**: Registros removidos após 1 hora

