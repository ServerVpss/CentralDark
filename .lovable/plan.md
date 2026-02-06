
## Plano: Adicionar Retry com Delay no Health Check

### Objetivo
Implementar uma verificação dupla com delay de 10 segundos para funções detectadas como offline, evitando falsos positivos durante deploys.

### Alterações

**Arquivo:** `supabase/functions/health-check/index.ts`

1. **Modificar a função `checkFunction`** para aceitar um parâmetro de retry
2. **Criar nova função `checkFunctionWithRetry`** que:
   - Faz a primeira verificação
   - Se detectar offline/error, aguarda 10 segundos
   - Faz uma segunda verificação antes de confirmar o status
   - Retorna o resultado final

### Fluxo Atualizado

```text
┌─────────────────────────────┐
│   Verificar Função (1ª)     │
└──────────────┬──────────────┘
               │
       ┌───────┴───────┐
       │               │
    Online?         Offline/Error?
       │               │
       ▼               ▼
   Retornar      Aguardar 10s
   "online"            │
                       ▼
              ┌────────────────┐
              │ Verificar (2ª) │
              └───────┬────────┘
                      │
                      ▼
               Retornar status
                   final
```

### Detalhes Tecnicos

```typescript
// Nova função com retry
async function checkFunctionWithRetry(
  baseUrl: string, 
  functionName: string
): Promise<FunctionHealth> {
  // Primeira verificação
  const firstCheck = await checkFunction(baseUrl, functionName);
  
  // Se online na primeira, retorna imediatamente
  if (firstCheck.status === 'online') {
    return firstCheck;
  }
  
  // Se offline/error, aguarda 10 segundos
  console.log(`⏳ ${functionName} detectada offline, aguardando 10s para retry...`);
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Segunda verificação
  const retryCheck = await checkFunction(baseUrl, functionName);
  retryCheck.error = retryCheck.status !== 'online' 
    ? `${retryCheck.error} (confirmado após retry)`
    : undefined;
  
  return retryCheck;
}
```

### Beneficios

- Elimina alertas falsos durante janelas de deploy (~30-60s)
- Mantém detecção real de problemas persistentes
- Adiciona log indicando quando retry está em andamento
- Mensagem de erro atualizada indica que foi confirmado após retry
