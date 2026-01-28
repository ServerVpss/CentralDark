
# Plano: Corrigir Parser para Exibir Todos os Resultados

## Problema Identificado

A API NexFuture retorna dados em **3 formatos diferentes** que o parser atual não está tratando corretamente:

### Formato 1: Campos simples com travessão
```
CPF ⎯ 00119020270
NOME ⎯ EVA JOSE DE ALMEIDA
```
✅ **Funcionando** - O regex com `:`, `⎯` e `-` já captura.

### Formato 2: Listas com marcador `•` (PROBLEMA PRINCIPAL)
```
TELEFONES: ( 5 - Encontrados)
• 63992184799 - POSSUI WHATSAPP
• 63992030010 - POSSUI WHATSAPP
• 63992783358 - NÃO POSSUI WHATSAPP
```
❌ **Não funciona** - O parser só captura `"telefones": "( 5 - Encontrados)"` e ignora os itens da lista.

### Formato 3: Múltiplos registros com BASE
```
BASE 1
CPF: 00119020270
NOME: EVA JOSE DE ALMEIDA

BASE 2
CPF: 00017837260
NOME: MARINEIDE DE JESUS DE ALMEIDA
```
❌ **Não funciona** - O parser sobrescreve valores duplicados e retorna apenas o último CPF/NOME.

---

## Solução

Reescrever a função `parseDataString` para:

1. **Detectar e armazenar itens de lista** (`•`) associados à última categoria vista
2. **Agrupar múltiplos registros** em arrays quando há duplicação de chaves
3. **Aceitar chaves sem espaço** antes do separador (`CPF:` além de `CPF :`)

---

## Mudanças Técnicas

### Arquivo: `supabase/functions/telegram-webhook/index.ts`

### Função: `parseDataString` (linhas 477-513)

**Novo código:**

```typescript
function parseDataString(dataStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  // Limpar referências ao bot antigo e URLs
  let cleaned = dataStr
    .replace(/@QueryBuscasBot/gi, '')
    .replace(/https?:\/\/t\.me\/querybuscas/gi, '')
    .replace(/QueryBuscasBot/gi, '')
    .replace(/querybuscas/gi, '')
    .replace(/https?:\/\/t\.me\/[^\s]+/gi, '')
    .trim();
  
  const lines = cleaned.split('\n');
  let currentListKey: string | null = null;
  let currentList: string[] = [];
  
  const saveCurrentList = () => {
    if (currentListKey && currentList.length > 0) {
      result[currentListKey] = currentList.join('\n');
      currentList = [];
    }
    currentListKey = null;
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Ignorar linhas de seção ou cabeçalho
    if (trimmed.match(/^(BASE \d+|RESULTADOS|---)/i)) {
      saveCurrentList();
      continue;
    }
    if (trimmed.match(/^[=\-_*]+$/)) continue;
    
    // Detectar linha de lista com marcador •
    if (trimmed.startsWith('•')) {
      const itemValue = trimmed.substring(1).trim();
      if (itemValue) {
        currentList.push(itemValue);
      }
      continue;
    }
    
    // Detectar linha de lista com marcador -
    if (trimmed.startsWith('-') && !trimmed.match(/^-+$/)) {
      const itemValue = trimmed.substring(1).trim();
      if (itemValue && !itemValue.match(/^[\-=_]+$/)) {
        currentList.push(itemValue);
      }
      continue;
    }
    
    // Extrair CHAVE: VALOR (aceita chaves com ou sem espaço antes do separador)
    // Formato: "CHAVE: valor", "CHAVE ⎯ valor", "CHAVE - valor"
    const match = trimmed.match(/^([A-ZÀ-Úa-zà-ú\s_]+?)\s*(?::|⎯|—|-)\s*(.*)$/i);
    if (match) {
      saveCurrentList(); // Salvar lista anterior se houver
      
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();
      
      // Se o valor indica uma lista (ex: "( 5 - Encontrados)"), preparar para coletar itens
      if (value.match(/\(\s*\d+\s*-\s*Encontrados?\s*\)/i)) {
        currentListKey = key;
        currentList = [];
        continue;
      }
      
      // Ignorar valores vazios ou placeholders
      if (!value || value === '-' || value === '--') continue;
      
      // Se a chave já existe, converter para array ou adicionar
      if (result[key] !== undefined) {
        if (Array.isArray(result[key])) {
          (result[key] as string[]).push(value);
        } else {
          result[key] = [result[key] as string, value];
        }
      } else {
        result[key] = value;
      }
    }
  }
  
  // Salvar última lista pendente
  saveCurrentList();
  
  return result;
}
```

---

### Mudanças na função `formatQueryResult` (linhas 515-700)

Adicionar suporte para exibir arrays como lista:

```typescript
// Na parte de formatação dos valores (linha ~672-676)
for (const item of items) {
  const displayKey = formatKey(item.key);
  let displayValue = item.value;
  
  // Se é um array, formatar como lista
  if (Array.isArray(displayValue)) {
    displayValue = displayValue.join('\n    ');
  }
  
  const valueStr = String(displayValue);
  if (!shouldIgnore(valueStr)) {
    text += `${displayKey} => ${valueStr}\n`;
  }
}
```

---

## Resultado Esperado

### Antes (atual):
```
Parsed data: {"empresas":"( 0 - Encontrados)","emails":"( 3 - Encontrados)","telefones":"( 5 - Encontrados)"}
```

### Depois (corrigido):
```
Parsed data: {
  "cpf": "00119020270",
  "nome": "EVA JOSE DE ALMEIDA",
  "emails": "fabriciomenezes13@gmail.com\njoanasm01@gmail.com\nJOANASM01@GMAIL.COM",
  "telefones": "63992184799 - POSSUI WHATSAPP\n63992030010 - POSSUI WHATSAPP\n63992783358 - NÃO POSSUI WHATSAPP"
}
```

---

## Resumo das Mudanças

| Item | Descrição |
|------|-----------|
| Parser de listas | Captura itens com marcador `•` ou `-` e associa à última categoria |
| Suporte a arrays | Chaves duplicadas viram arrays em vez de sobrescrever |
| Regex melhorado | Aceita chaves sem espaço antes do separador |
| Formatação | Arrays exibidos como lista com quebras de linha |
