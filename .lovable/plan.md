

# ✅ Integrar Sistema de Cache no Bot Telegram

## Status: CONCLUÍDO

A integração do sistema de cache no bot Telegram foi implementada com sucesso.

## Mudanças Realizadas

### 1. Nova Função: `executeQueryWithCache()`
Adicionada função helper que chama o endpoint `api-query` (que já possui cache):

```typescript
async function executeQueryWithCache(
  queryType: string, 
  queryInput: string, 
  estado?: string
): Promise<{ data: Record<string, unknown>; fromCache: boolean }>
```

### 2. Função Legacy: `executeQuery()`
Mantida para compatibilidade, mas agora delega para `executeQueryWithCache`:

```typescript
async function executeQuery(queryType: string, queryInput: string, estado?: string): Promise<Record<string, unknown>> {
  const { data } = await executeQueryWithCache(queryType, queryInput, estado);
  return data;
}
```

### 3. Atualizada `logQuery()`
Novo parâmetro `fromCache` para evitar duplicação de créditos:

```typescript
async logQuery(telegramUserId: number, queryType: string, queryInput: string, result: Record<string, unknown>, fromCache: boolean = false)
```
- Só registra crédito em `api_usage_logs` se `fromCache === false`
- Histórico sempre é registrado

### 4. Pontos de Chamada Atualizados

| Local | Descrição |
|-------|-----------|
| `processQuery()` | Consulta via callback de menu |
| `handleDirectQuery()` | Consulta via comando direto no grupo |
| `qcpf:` callback | Consulta rápida de CPF a partir de CEP |
| `pdf:` callback | Re-consulta para gerar PDF (usa cache) |
| `txt:` callback | Re-consulta para gerar TXT (usa cache) |

## Arquitetura Final

```text
ANTES (duplicado, sem cache):
[Bot] --> executeQuery() --> fetchFromProvider() --> API Externa (SEMPRE)

DEPOIS (unificado, com cache):
[Bot] --> executeQueryWithCache() --> api-query --> [Cache Check]
                                                     ├── HIT: Retorna dados indexados
                                                     └── MISS: API Externa + Salva no cache
```

## Benefícios Alcançados

1. **Economia**: Consultas repetidas no bot usam cache = menos custo de API
2. **Velocidade**: Respostas do bot mais rápidas quando dados já indexados
3. **Consistência**: Mesma lógica de cache no frontend e no bot
4. **Manutenção**: Código de consulta centralizado em `api-query`
5. **Créditos justos**: Só conta crédito em cache miss (evita cobrança dupla)

## Código Removido

As funções `fetchFromProvider()` e `fetchFromProviderWithTimeout()` foram mantidas como fallback interno, mas não são mais usadas para consultas principais.
