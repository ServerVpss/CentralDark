

## Plano: Corrigir Parser para Reconhecer Separador ⎯ (Travessão)

### Problema Identificado

A API NexFuture retorna dados usando **dois formatos diferentes de separador**:

| Formato | Exemplo | Atual |
|---------|---------|-------|
| Dois pontos `:` | `empresas: ( 0 - Encontrados)` | Funciona |
| Travessão `⎯` | `CPF ⎯ 00119020270` | **Não funciona** |

O log mostra que os dados principais estão sendo perdidos:
- **Entrada**: `CPF ⎯ 00119020270\nNOME ⎯ EVA JOSE DE ALMEIDA\nSEXO ⎯ F`
- **Parse atual**: `{"empresas":"( 0 - Encontrados)","emails":"( 3 - Encontrados)"...}`
- Os campos CPF, NOME, SEXO não estão sendo extraídos

### Solucao

Modificar o regex na funcao `parseDataString` para reconhecer **ambos os separadores** (`:` e `⎯`):

**Arquivo:** `supabase/functions/telegram-webhook/index.ts`

**Linha 501 - De:**
```typescript
const match = trimmed.match(/^([A-ZÀ-Ú\s_]+):\s*(.+)$/i);
```

**Para:**
```typescript
// Suporta separadores: dois pontos (:) OU travessão (⎯ ou -)
const match = trimmed.match(/^([A-ZÀ-Ú\s_]+)(?::|⎯|-)\s*(.+)$/i);
```

### Resultado Esperado

Apos a correcao, o parse deve extrair:

```json
{
  "cpf": "00119020270",
  "nome": "EVA JOSE DE ALMEIDA",
  "sexo": "F",
  "nascimento": "1984-10-05",
  "nome_mãe": "AURIA MARIA DE ...",
  "empresas": "( 0 - Encontrados)",
  "emails": "( 3 - Encontrados)"
}
```

E a mensagem formatada no Telegram vai mostrar todos os dados corretamente categorizados.

### Resumo da Mudanca

| Item | Descricao |
|------|-----------|
| Arquivo | `supabase/functions/telegram-webhook/index.ts` |
| Linha | 501 |
| Mudanca | Adicionar `⎯` e `-` como separadores validos no regex |

