

## Plano: Corrigir Exibição de Fotos Base64

### Problema Identificado

A API TConect retorna fotos no campo **`fotoBase64`** como uma string Base64 pura (sem prefixo):

```json
{
  "cpf": "61503059375",
  "estado": "ma",
  "fotoBase64": "/9j/4AAQSkZJRgABAQEB9AH0AAD/2wBDA..."
}
```

O código atual verifica estes campos: `foto`, `image`, `url`, `photo`, `base64` - **mas não `fotoBase64`**.

### Mudanças Necessárias

#### 1. Edge Function `telegram-webhook` - Detecção de Foto

**Arquivo:** `supabase/functions/telegram-webhook/index.ts`

| Local | Mudança |
|-------|---------|
| Linha 442 | Adicionar `fotoBase64` na detecção |
| Linhas 1095-1097 | Atualizar verificação de foto válida |
| Linhas 2049-2052 | Atualizar verificação de foto válida |

**Código atualizado (linha 442):**
```typescript
// Verificar múltiplos campos possíveis para a foto (incluindo fotoBase64)
let fotoData = result?.foto || result?.image || result?.url || result?.photo || result?.fotoBase64;

// Se é Base64 puro (começa com /9j/ para JPEG), adicionar prefixo
if (fotoData && typeof fotoData === 'string') {
  if (fotoData.startsWith('/9j/') || fotoData.startsWith('iVBOR')) {
    fotoData = `data:image/jpeg;base64,${fotoData}`;
  }
}
```

**Código atualizado (linhas 1095-1097 e 2049-2052):**
```typescript
// Verificar múltiplos campos possíveis para a foto
let fotoUrl = result.foto || result.image || result.url || result.photo || result.fotoBase64;

// Converter Base64 puro para data URL se necessário
if (fotoUrl && typeof fotoUrl === 'string') {
  if (fotoUrl.startsWith('/9j/') || fotoUrl.startsWith('iVBOR')) {
    fotoUrl = `data:image/jpeg;base64,${fotoUrl}`;
  }
}

const isValidPhotoUrl = fotoUrl && typeof fotoUrl === 'string' && 
  (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:image'));
```

#### 2. Frontend `QueryResultFormatter` - Exibir Fotos

**Arquivo:** `src/components/consultas/QueryResultFormatter.tsx`

Adicionar lógica para detectar e exibir fotos Base64 nos resultados:

```typescript
// Verificar se há foto Base64 nos dados
function extractPhoto(data: any): string | null {
  const fotoData = data?.foto || data?.fotoBase64 || data?.image;
  if (!fotoData || typeof fotoData !== 'string') return null;
  
  // Se é Base64 puro, adicionar prefixo
  if (fotoData.startsWith('/9j/') || fotoData.startsWith('iVBOR')) {
    return `data:image/jpeg;base64,${fotoData}`;
  }
  
  // Se já é data URL ou HTTP URL
  if (fotoData.startsWith('data:image') || fotoData.startsWith('http')) {
    return fotoData;
  }
  
  return null;
}

// No componente, antes de mostrar os dados agrupados:
const photoUrl = extractPhoto(parsedData);

return (
  <div className="space-y-4">
    {photoUrl && (
      <Card className="bg-secondary/30 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Foto
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <img 
            src={photoUrl} 
            alt="Foto do documento" 
            className="max-w-[200px] rounded-lg border shadow-sm"
          />
        </CardContent>
      </Card>
    )}
    {/* ... resto do código existente ... */}
  </div>
);
```

#### 3. Não é necessário migrar dados existentes no banco

Os dados no banco estão corretos (contêm `fotoBase64`). A correção no frontend vai renderizar automaticamente as fotos existentes, pois:
- O `QueryResultFormatter` vai detectar o campo `fotoBase64`
- Vai converter para `data:image/jpeg;base64,...`
- Vai exibir como tag `<img>`

### Fluxo Corrigido

```text
API TConect
     |
     v (retorna fotoBase64)
     
Edge Function
     |
     v (detecta fotoBase64 e converte para data URL)
     
Telegram API sendPhoto
     |
     v (envia foto corretamente)
     
Banco de Dados (query_history)
     |
     v (armazena fotoBase64 no JSONB)
     
Frontend QueryResultFormatter
     |
     v (detecta fotoBase64, converte e exibe como <img>)
```

### Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `telegram-webhook/index.ts` | Adicionar `fotoBase64` na detecção e converter Base64 puro para data URL |
| `QueryResultFormatter.tsx` | Adicionar função `extractPhoto` e exibir imagem no card |

### Benefícios

1. Fotos da API TConect serão exibidas no Telegram
2. Fotos serão exibidas na página de Logs de Consultas
3. Dados existentes no banco serão exibidos corretamente sem migração
4. Suporte a JPEG (`/9j/`) e PNG (`iVBOR`) em Base64

