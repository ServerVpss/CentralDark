

## Plano: Corrigir Exibição de Fotos no Bot Telegram

### Problema Identificado

Analisando os logs da edge function `telegram-webhook`:

1. **Requisições são enviadas corretamente:**
   ```
   Fetching from: http://node.tconect.xyz:3030/foto?cpf=38244335831&estado=RJ
   Fetching from: http://node.tconect.xyz:3030/foto?cpf=38244335831&estado=BA
   ...
   ```

2. **Nenhuma resposta é logada** - não há "Response received" para as requisições de foto

3. **Nenhuma foto é encontrada** - não há log "Photo found in X, stopping search early"

4. **Resultado enviado sem foto** - "Telegram API: sendMessage" em vez de "sendPhoto"

### Causas Prováveis

| Causa | Probabilidade | Descrição |
|-------|---------------|-----------|
| Timeout muito curto | Alta | 3 segundos pode não ser suficiente para a API TConect responder |
| Campo foto incorreto | Média | A API pode retornar a foto em campo diferente (image, base64, url, data) |
| API não retorna JSON válido | Baixa | A resposta pode não ser um JSON parseável |

### Solução

#### Parte 1: Adicionar Logs de Debug

Adicionar logs detalhados para entender o que a API retorna:

```typescript
for (const { state, result } of batchResults) {
  // LOG: Ver o que a API retornou para cada estado
  console.log(`Photo search result for ${state}:`, JSON.stringify(result).substring(0, 300));
  
  // Verificar múltiplos campos possíveis para a foto
  const fotoUrl = result.foto || result.image || result.url || result.base64;
  
  if (result && !result.error && fotoUrl) {
    results[state] = { ...result, foto: fotoUrl };
    if (!foundFoto) {
      foundFoto = fotoUrl;
      foundNome = result.nome;
      foundEstado = state;
    }
  }
}
```

#### Parte 2: Aumentar Timeout

Aumentar o timeout de 3s para 5s ou 8s para dar mais tempo à API:

```typescript
// De: 3000ms (muito curto)
const timeoutId = setTimeout(() => controller.abort(), 3000);

// Para: 8000ms (mais seguro)
const timeoutId = setTimeout(() => controller.abort(), 8000);
```

#### Parte 3: Verificar Múltiplos Campos de Foto

Atualizar a lógica para aceitar diferentes nomes de campo:

```typescript
// Verificar múltiplos campos possíveis
const getFotoUrl = (result: Record<string, unknown>): string | null => {
  const possibleFields = ['foto', 'image', 'url', 'photo', 'base64', 'data'];
  for (const field of possibleFields) {
    const value = result[field];
    if (typeof value === 'string' && value.length > 10) {
      // É uma URL ou base64
      if (value.startsWith('http') || value.startsWith('data:image')) {
        return value;
      }
    }
  }
  return null;
};
```

---

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/telegram-webhook/index.ts` | Adicionar logs, aumentar timeout, verificar múltiplos campos |

---

### Mudanças Detalhadas

**Linha 416** - Aumentar timeout:
```typescript
// De:
const timeoutId = setTimeout(() => controller.abort(), 3000);

// Para:
const timeoutId = setTimeout(() => controller.abort(), 8000);
```

**Linhas 437-446** - Adicionar logs e verificar múltiplos campos:
```typescript
for (const { state, result } of batchResults) {
  // LOG: Ver o que a API retorna
  console.log(`Foto result for ${state}:`, JSON.stringify(result).substring(0, 500));
  
  // Verificar múltiplos campos possíveis para a foto
  const fotoUrl = result.foto || result.image || result.url || result.photo;
  
  if (result && !result.error && fotoUrl) {
    results[state] = { ...result, foto: fotoUrl };
    if (!foundFoto) {
      foundFoto = fotoUrl;
      foundNome = result.nome;
      foundEstado = state;
      console.log(`Photo found in ${state}, URL: ${String(fotoUrl).substring(0, 100)}`);
    }
  }
}
```

**Linhas 1047 e 1998** - Melhorar verificação de foto para envio:
```typescript
// Verificar múltiplos formatos de foto
const fotoUrl = result.foto || result.image || result.url || result.photo;
const isValidPhotoUrl = fotoUrl && typeof fotoUrl === 'string' && 
  (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:image'));

if (isValidPhotoUrl) {
  await telegramRequest(this.token, "sendPhoto", {
    chat_id: chatId,
    photo: fotoUrl,
    caption: formattedResult.substring(0, 1024),
    parse_mode: "HTML",
    reply_markup: keyboard([btn("🔍 Nova Consulta", "menu:query"), btn("🏠 Menu", "menu:main")]),
  });
} else {
  // ... sendMessage fallback
}
```

---

### Resumo das Mudanças

| Item | Descrição |
|------|-----------|
| Timeout | Aumentar de 3s para 8s |
| Logs | Adicionar log do resultado de cada estado |
| Campos | Verificar `foto`, `image`, `url`, `photo` e `base64` |
| Debug | Log completo para identificar formato real da API |

### Resultado Esperado

Após as mudanças:
1. Os logs mostrarão exatamente o que a API TConect retorna
2. Se a foto existir em qualquer campo, será detectada e exibida
3. O timeout maior dará tempo suficiente para a API responder

