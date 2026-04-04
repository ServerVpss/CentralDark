

# Correções Pós-Teste dos Módulos VeiculosAPI

## Problemas Identificados

### 1. Nome perde espaços
O frontend em `handleHistorySelect` faz `input.replace(/\D/g, '')` que remove TUDO que não é dígito — incluindo letras e espaços. Para módulos de texto (nome, mae, endereco), o valor deve ser preservado como está.

### 2. Placa timeout (30s não é suficiente)
Os módulos `placa` e `placa-simples` da VeiculosAPI demoram mais de 30s. Solução: aumentar timeout para 45s e adicionar módulo `placa-sesp` como fallback alternativo.

### 3. Tabela `query_modules` não existe
Gera erro no log a cada chamada. Solução: silenciar o erro ou criar a tabela.

---

## Mudanças

### Arquivo 1: `src/pages/Consultas.tsx`
- Corrigir `handleHistorySelect` para não remover caracteres de texto em módulos não-numéricos (nome, mae, endereco)

### Arquivo 2: `src/components/consultation/QueryInput.tsx`  
- Garantir que módulos de texto (nome, mae, endereco) não passem por limpeza de dígitos

### Arquivo 3: `supabase/functions/api-query/index.ts`
- Aumentar timeout de 30s para 45s no `fetchFromVeiculosApi`
- Silenciar o erro de `query_modules` (tabela opcional)
- Preservar espaços no input para módulos de texto (nome, mae, endereco)

### Arquivo 4: `supabase/functions/telegram-webhook/index.ts`
- Mesma correção de preservação de espaços para comandos /nome, /mae, /endereco

## Resultado Esperado
- Consulta por nome retorna resultados corretamente
- Placa tem mais tempo para responder
- Logs limpos sem erro de tabela inexistente

