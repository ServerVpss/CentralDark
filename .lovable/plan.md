

# Processar Consultas em Background (Fire-and-Forget)

## Problema
O Telegram envia updates via webhook de forma **sequencial** — ele só envia o próximo update depois que recebe `200 OK` do anterior. Atualmente, o webhook **aguarda** a consulta terminar (até 25s pelo timeout) antes de responder. Se `/foto` demora 30s, o `/cpf` enviado logo depois fica na fila do Telegram esperando.

## Solução
Mudar a arquitetura para **fire-and-forget**: o webhook responde `200 OK` imediatamente ao Telegram e processa a consulta em background.

```text
ANTES:
  Telegram → webhook → aguarda consulta (30s) → 200 OK → próximo update

DEPOIS:
  Telegram → webhook → 200 OK (imediato) → próximo update
                     ↘ background: executa consulta → envia resultado
```

## Mudanças

### Arquivo: `supabase/functions/telegram-webhook/index.ts`

**No handler principal (linha ~5180-5187):**
- Em vez de `await Promise.race([handler.handleUpdate(), timeoutPromise])`, usar `waitUntil` pattern ou simplesmente não aguardar o processamento
- O Deno em Edge Functions suporta `EdgeRuntime.waitUntil()` ou pode-se usar o padrão de disparar a promise sem await e responder imediatamente:

```typescript
// Disparar processamento em background (não bloqueia resposta)
const processingPromise = handler.handleUpdate().catch(err => {
  console.error("Background processing error:", err.message);
});

// Usar waitUntil se disponível (Deno Deploy / Supabase Edge)
// Isso garante que a função não seja encerrada antes do processamento
if (typeof (globalThis as any).EdgeRuntime !== 'undefined') {
  (globalThis as any).EdgeRuntime.waitUntil(processingPromise);
}

// Responder imediatamente ao Telegram
return new Response("OK", { status: 200 });
```

- Remover o `timeoutPromise` de 25s já que o processamento não bloqueia mais a resposta
- Manter logs de erro para debugging

## Resultado Esperado
- `/foto` inicia processamento em background, resposta `200` vai imediata
- `/cpf` enviado logo depois é recebido e processado sem esperar o `/foto`
- Ambos os resultados são enviados ao chat quando ficam prontos
- Nenhuma mudança no banco de dados necessária

## Risco
- Se `waitUntil` não estiver disponível no Supabase Edge Functions, a alternativa é invocar uma segunda Edge Function (como `telegram-api-query`) via `fetch` sem `await`, delegando o trabalho pesado

