

## Plano: Limitar Busca de Fotos para 7 Estados Específicos

### Objetivo
Ajustar a busca nacional de fotos para pesquisar apenas nos 7 estados solicitados em vez de todos os 27 estados brasileiros.

### Estados Selecionados

| Sigla | Estado |
|-------|--------|
| RJ | Rio de Janeiro |
| BA | Bahia |
| MA | Maranhão |
| SP | São Paulo |
| ES | Espírito Santo |
| CE | Ceará |
| PI | Piauí |

### Benefícios da Mudança

1. **Busca mais rápida**: De ~27 requisições para apenas 7
2. **Menos timeout**: Reduz risco de timeout do webhook
3. **Resposta imediata**: Com batch de 9, todos os 7 estados são consultados em paralelo (1 batch só)

### Mudança Técnica

**Arquivo:** `supabase/functions/telegram-webhook/index.ts`

**Linha 142-146 - De:**
```typescript
const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];
```

**Para:**
```typescript
const brazilianStates = [
  "RJ", "BA", "MA", "SP", "ES", "CE", "PI"
];
```

### Resultado Esperado

- A consulta `/foto CPF` (sem estado) agora buscará apenas nos 7 estados configurados
- A consulta `/foto ESTADO CPF` com estado específico continuará funcionando normalmente
- Tempo de resposta muito mais rápido (~2-3 segundos vs ~10-15 segundos)

