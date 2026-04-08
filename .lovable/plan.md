

## Corrigir `[object Object]` no Website

### Problema
Quando a API retorna dados com objetos aninhados (como `filiacao`, `biometria`, `fotos`), o `QueryResultFormatter` não os achata antes de exibir. O `String(value)` aplicado a objetos produz `[object Object]`.

### Causa Raiz
No bloco de parsing JSON (linhas 1217-1226), objetos e arrays aninhados são copiados diretamente para `parsedData` sem achatamento. Depois, na renderização (linhas 1322 e 1338), `String(item)` é chamado em objetos.

### Solução

**Arquivo**: `src/components/consultas/QueryResultFormatter.tsx`

1. **Criar função `flattenObject`** que achata recursivamente objetos aninhados em pares `chave => valor` simples (strings):
   - `{filiacao: {mae: "Ana", pai: "João"}}` → `{filiacao_mae: "Ana", filiacao_pai: "João"}`
   - Arrays de objetos: `{fotos: [{uf: "SP", base64: "..."}]}` → `{fotos_1_uf: "SP"}` (filtrando base64)
   - Arrays de primitivos mantidos como `string[]`

2. **Aplicar `flattenObject`** no bloco de parsing JSON (linhas 1217-1226) antes de atribuir a `parsedData`

3. **Adicionar fallback seguro na renderização** (linhas 1322 e 1338): se o valor ainda for objeto, serializar como JSON legível ao invés de `String()`

### Detalhes Técnicos

```typescript
function flattenObject(obj: any, prefix = ''): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;
    if (value === null || value === undefined) continue;
    // Skip base64/photo values
    if (typeof value === 'string' && (value.startsWith('/9j/') || value.startsWith('iVBOR') || value.startsWith('data:image'))) continue;
    if (Array.isArray(value)) {
      if (value.every(v => typeof v !== 'object')) {
        result[newKey] = value.map(String);
      } else {
        value.forEach((item, i) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(result, flattenObject(item, `${newKey}_${i + 1}`));
          } else {
            result[`${newKey}_${i + 1}`] = String(item);
          }
        });
      }
    } else if (typeof value === 'object') {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  return result;
}
```

- Aplicar no parsing JSON e como fallback no rendering
- Sem impacto em resultados de texto (já são strings)

