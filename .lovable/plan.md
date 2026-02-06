
# Plano: Correção da Formatação de Resultados de Telefone com Múltiplas Pessoas

## Problema Identificado

Quando uma consulta por telefone retorna dados de múltiplas pessoas, os resultados estão sendo misturados ao invés de serem exibidos separadamente. Isso ocorre tanto no Telegram quanto no painel administrativo.

### Formato dos dados da API de telefone:
```text
RESULTADOS ENCONTRADOS PARA O TELEFONE 1136517405

BASE 1
CPF: 82463166487
NOME: EZENILDO JOSE DA SILVA
...

BASE 2
CPF: 01114154113
NOME: ANNE KATIUSCIA SERPA
...
```

### Causa Raiz
1. O sistema só aplica formatação especial para múltiplas pessoas em consultas de CEP
2. A detecção de múltiplas pessoas usa regex que não corresponde ao formato de telefone
3. O parsing separa dados por formato "CPF ⎯" mas a API retorna "CPF:"

---

## Solução Proposta

### Arquivo 1: `supabase/functions/telegram-webhook/index.ts`

**Mudanças:**

1. **Atualizar função `isMultiPersonResult`**
   - Adicionar suporte ao formato `CPF:` (dois pontos) além de `CPF [⎯—-]` (traço)
   - Detectar também padrões "BASE X"

2. **Atualizar `parseMultiplePersonRecords`**
   - Suportar o formato de telefone: "CPF: valor" além de "CPF ⎯ valor"
   - Detectar separadores "BASE X" para dividir registros

3. **Expandir tratamento especial de múltiplas pessoas**
   - Aplicar a mesma lógica usada para CEP também para consultas de telefone
   - Na função `processQuery`, adicionar: `if ((queryType === 'cep' || queryType === 'telefone') && ...)`

4. **Atualizar `formatMultiPersonPage`**
   - Tornar o título dinâmico (não fixo como "CONSULTA DE CEP")
   - Usar "CONSULTA DE TELEFONE" quando apropriado

---

### Arquivo 2: `supabase/functions/telegram-format-result/index.ts`

**Mudanças:**

1. **Atualizar função `parseMultiplePersonRecords`**
   - Adicionar suporte ao formato `CPF: valor` (dois pontos)
   - Detectar separadores "BASE X\n" para dividir registros corretamente

2. **Atualizar `formatMultiPersonPage`**
   - Receber parâmetro `queryType` para exibir título correto
   - Usar emojis apropriados para cada tipo de consulta

---

### Arquivo 3: `src/components/consultas/QueryResultFormatter.tsx`

**Mudanças:**

1. **Atualizar função `parseMultiplePersonRecords`**
   - Adicionar detecção de formato "BASE X" como separador de registros
   - Suportar formato `CPF: valor` além de `CPF ⎯ valor`

2. **Atualizar header do card de resultados**
   - Mostrar "X pessoas encontradas para o telefone Y" quando for consulta de telefone

---

## Implementação Técnica

### Nova regex para detecção (isMultiPersonResult):
```typescript
function isMultiPersonResult(dataStr: string): boolean {
  // Formato com traço: CPF ⎯ or CPF — or CPF -
  const dashMatches = dataStr.match(/CPF\s*[⎯—-]/gi) || [];
  // Formato com dois pontos: CPF: 12345 or CPF: `12345
  const colonMatches = dataStr.match(/CPF[:\s`]+[\d.-]+/gi) || [];
  // Formato BASE X (indica múltiplos registros)
  const baseMatches = dataStr.match(/BASE\s+\d+/gi) || [];
  
  const cpfCount = Math.max(dashMatches.length, colonMatches.length);
  const hasMultipleBases = baseMatches.length > 1;
  
  return cpfCount > 1 || hasMultipleBases;
}
```

### Nova lógica de parsing (parseMultiplePersonRecords):
```typescript
// Dividir por "BASE X" se presente
if (text.includes('BASE')) {
  const baseSections = text.split(/(?=BASE\s+\d+)/gi).filter(s => s.trim());
  // Processar cada seção como um registro separado
}

// Ou dividir por CPF se não houver BASE
const cpfSections = text.split(/(?=CPF[:\s`]+[\d.-]+)/gi).filter(s => s.trim());
```

### Condição expandida no processQuery:
```typescript
// Antes (só CEP):
if (queryType === 'cep' && rawDataStr && isMultiPersonResult(rawDataStr))

// Depois (CEP e Telefone):
if ((queryType === 'cep' || queryType === 'telefone') && rawDataStr && isMultiPersonResult(rawDataStr))
```

---

## Resultado Esperado

### No Telegram:
```text
📞 TELEFONE RESULTADO

👥 2 pessoas encontradas

┌─────────────────────────────
│ 👤 PESSOA 1
├─────────────────────────────
│ 📛 Nome: EZENILDO JOSE DA SILVA
│ 🆔 CPF: 824.631.664-87
│ 📅 Nasc: 15/03/1985
└─────────────────────────────

┌─────────────────────────────
│ 👤 PESSOA 2
├─────────────────────────────
│ 📛 Nome: ANNE KATIUSCIA SERPA
│ 🆔 CPF: 011.141.541-13
│ 📅 Nasc: 22/07/1990
└─────────────────────────────

💡 Clique no CPF para consultar
🤖 @Bot
```

### No Painel Admin:
Cards separados e expansíveis para cada pessoa, com botão para consultar CPF individual.

---

## Arquivos que serão modificados:

1. `supabase/functions/telegram-webhook/index.ts`
2. `supabase/functions/telegram-format-result/index.ts`  
3. `src/components/consultas/QueryResultFormatter.tsx`

## Deploy necessário:
- telegram-webhook
- telegram-format-result
