

# Integrar Sistema de Cache no Bot Telegram

## Situacao Atual

O bot Telegram (`telegram-webhook`) possui sua propria implementacao de consultas que **nao usa o cache**:
- Funcao `executeQuery()` interna (linhas 1158-1295)
- Chama `fetchFromProvider()` diretamente
- Cada consulta no bot = chamada para API externa
- Nao verifica nem salva na tabela `query_cache`

Enquanto isso, o frontend usa `api-query` que:
- Verifica cache antes de chamar APIs
- Salva resultados para reuso
- Indica `fromCache: true` quando usa dados indexados

## Solucao Proposta

Refatorar o `telegram-webhook` para delegar consultas ao `api-query` (que ja tem cache).

### Arquitetura Nova

```text
ANTES (duplicado, sem cache):
[Bot] --> executeQuery() --> fetchFromProvider() --> API Externa

DEPOIS (unificado, com cache):
[Bot] --> fetch(api-query) --> [Cache Check] --> API Externa (se miss)
```

## Mudancas Necessarias

### 1. Criar funcao helper no telegram-webhook

Adicionar funcao para chamar o `api-query`:

```typescript
async function executeQueryWithCache(
  queryType: string, 
  queryInput: string, 
  estado?: string
): Promise<{ data: Record<string, unknown>; fromCache: boolean }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const response = await fetch(`${supabaseUrl}/functions/v1/api-query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({ queryType, queryInput, estado }),
  });
  
  const result = await response.json();
  return {
    data: result.data || result,
    fromCache: result.fromCache || false
  };
}
```

### 2. Substituir chamadas de executeQuery

Localizar todas as chamadas a `executeQuery()` no telegram-webhook:
- Linha 2524: consulta via callback
- Linha 3620: consulta via comando direto
- Linha 3894: consulta de CPF automatica
- Linha 3938: geracao de PDF
- Linha 4025: geracao de TXT

Substituir por `executeQueryWithCache()`.

### 3. Ajustar logica de creditos

O `api-query` ja gerencia creditos apenas para cache miss. Remover duplicacao no `telegram-webhook`:

```typescript
// ANTES (sempre conta credito)
await this.logQuery(telegramUserId, queryType, queryInput, result);

// DEPOIS (so conta se nao veio do cache)
if (!fromCache) {
  await this.logQuery(telegramUserId, queryType, queryInput, result.data);
}
```

### 4. Adicionar indicador visual no bot

Quando resultado vier do cache, mostrar badge na mensagem:

```typescript
const cacheIndicator = fromCache ? "⚡ Cache" : "🔄 Live";
const headerLine = `${queryTypeLabels[queryType]} | ${cacheIndicator}`;
```

## Beneficios

1. **Economia**: Consultas repetidas no bot usam cache = menos custo de API
2. **Velocidade**: Respostas do bot mais rapidas quando dados ja indexados
3. **Consistencia**: Mesma logica de cache no frontend e no bot
4. **Manutencao**: Codigo de consulta centralizado em um lugar so

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/telegram-webhook/index.ts` | Adicionar `executeQueryWithCache()`, substituir chamadas, ajustar logica de creditos |
| (opcional) Remover funcoes duplicadas | `executeQuery()`, `fetchFromProvider()`, `fetchFromProviderWithTimeout()` - mais de 200 linhas que podem ser removidas |

## Riscos e Mitigacoes

| Risco | Mitigacao |
|-------|-----------|
| Latencia adicional (HTTP interno) | Desprezivel (~10-20ms) vs economia de cache |
| Falha do api-query | Fallback para funcao local existente |
| Timeout | api-query ja tem timeout de 30s |

## Ordem de Implementacao

1. Adicionar funcao `executeQueryWithCache()` no telegram-webhook
2. Testar com uma consulta especifica (ex: CPF)
3. Substituir todas as outras chamadas
4. Remover codigo duplicado (opcional, pode manter como fallback)
5. Testar fluxo completo no bot

