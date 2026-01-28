
## Plano: Corrigir Formatação de Resultados de Consultas

### Problema Identificado

A API NexFuture retorna dados em um campo `data` como **string de texto formatada** em vez de objeto JSON estruturado:

```json
{
  "comando": "telefone",
  "valor": "63992184799",
  "data": "@QueryBuscasBot\nhttps://t.me/querybuscas\n\nRESULTADOS...\nCPF: 00119020270\nNOME: EVA JOSE..."
}
```

A função `formatQueryResult` atual:
1. Espera campos JSON estruturados (nome, cpf, telefone separados)
2. Não faz o parse do campo `data` quando ele é uma string
3. O filtro `shouldIgnore` pode estar removendo todo o conteúdo porque a string contém `@QueryBuscasBot`

### Solucao

Adicionar lógica para detectar e processar o campo `data` quando ele for uma string de texto formatada:

1. Se a resposta tiver um campo `data` do tipo string:
   - Limpar as referências ao bot antigo (`@QueryBuscasBot`, etc.)
   - Fazer parse linha por linha para extrair pares `CHAVE: valor`
   - Converter para objeto estruturado e continuar o processamento normal

2. Manter a lógica existente para quando a API retornar dados já estruturados

---

### Arquivo a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/telegram-webhook/index.ts` | Adicionar parser para campo `data` string |

---

### Mudanca Tecnica

**Funcao: `formatQueryResult`** (linhas 475-657)

Adicionar no inicio da funcao um pre-processamento para converter `data` string em campos estruturados:

```typescript
function formatQueryResult(queryType: string, data: Record<string, unknown>, botUsername?: string): string {
  if (data.error) {
    return `<b>Erro:</b> ${data.error}`;
  }

  // PRE-PROCESSAMENTO: Se o campo 'data' e uma string, fazer parse
  if (typeof data.data === 'string') {
    const parsedData = parseDataString(data.data);
    // Mesclar dados parseados com dados originais (exceto data, comando, valor)
    const { data: _, comando, valor, ...rest } = data;
    data = { ...rest, ...parsedData };
  }

  // ... resto da funcao existente
}
```

**Nova funcao auxiliar: `parseDataString`**

```typescript
function parseDataString(dataStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  // Limpar referencias ao bot antigo
  let cleaned = dataStr
    .replace(/@QueryBuscasBot/gi, '')
    .replace(/https?:\/\/t\.me\/querybuscas/gi, '')
    .replace(/QueryBuscasBot/gi, '')
    .replace(/querybuscas/gi, '')
    .trim();
  
  // Extrair pares CHAVE: valor (formato comum da API)
  const lines = cleaned.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Detectar secoes (ex: "BASE 1", "RESULTADOS ENCONTRADOS")
    if (trimmed.match(/^(BASE \d+|RESULTADOS)/i)) {
      currentSection = trimmed;
      continue;
    }
    
    // Extrair CHAVE: VALOR
    const match = trimmed.match(/^([A-Z\s_]+):\s*(.+)$/i);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();
      if (value && value !== '-') {
        result[key] = value;
      }
    }
  }
  
  return result;
}
```

---

### Fluxo do Parse

```text
API Response:
{
  "comando": "telefone",
  "data": "CPF: 12345\nNOME: JOAO\nENDERECO: RUA X"
}

     |
     v (parseDataString)
     
Objeto Estruturado:
{
  "cpf": "12345",
  "nome": "JOAO",
  "endereco": "RUA X"
}

     |
     v (formatQueryResult existente)
     
Saida Formatada:
[*] DADOS BASICOS
CPF => 12345
NOME => JOAO

[*] ENDERECO  
ENDERECO => RUA X
```

---

### Resumo das Mudancas

1. **Parser para campo `data`**: Converte string formatada em objeto JSON
2. **Limpeza de referencias**: Remove mencoes ao bot antigo do texto
3. **Extracao de pares chave/valor**: Identifica linhas no formato `CHAVE: valor`
4. **Compatibilidade**: Mantém funcionamento para APIs que já retornam JSON estruturado
