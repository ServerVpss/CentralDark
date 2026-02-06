
# Plano: Incluir Nome e Data de Nascimento no Resultado de Score

## Situação Atual
A consulta de **Score** usa o provedor `tconect_score` (porta 3041), que retorna dados corrompidos:
- `nome: "Copiar"` - valor inválido
- `cpf: "\n';"` - valor corrompido
- Os dados de Score (CSB, CSBA, Faixas de Risco) estão corretos

Já a consulta de **CPF** usa o provedor `nexfuture` (porta 25589), que retorna dados completos:
- Nome completo
- Data de nascimento
- E dezenas de outros campos

## Solução Proposta
Modificar a função `handleQuery` para que consultas do tipo **Score** façam uma chamada adicional ao endpoint de CPF e mesclem os dados, retornando um resultado enriquecido com:
- Nome
- Data de Nascimento  
- Dados de Score (CSB, CSBA, Faixas de Risco)

## Alterações Técnicas

### 1. Modificar `supabase/functions/api-query/index.ts`

**Antes (linhas 223-226):**
```typescript
if (normalizedType === "score") {
  return await fetchFromProvider(providers.tconect_score, "/score", "cpf", cleanInput);
}
```

**Depois:**
```typescript
if (normalizedType === "score") {
  // Buscar Score e dados básicos do CPF em paralelo
  const [scoreResult, cpfResult] = await Promise.all([
    fetchFromProvider(providers.tconect_score, "/score", "cpf", cleanInput),
    fetchFromProvider(providers.nexfuture, "/cpf", "cpf", cleanInput)
  ]);
  
  // Extrair nome e nascimento do resultado de CPF
  let nome = null;
  let nascimento = null;
  
  if (cpfResult && !cpfResult.error) {
    const cpfData = typeof cpfResult.data === "string" ? cpfResult.data : JSON.stringify(cpfResult);
    
    // Extrair NOME
    const nomeMatch = cpfData.match(/NOME\s*[⎯\-:]\s*([^\n]+)/i);
    if (nomeMatch) nome = nomeMatch[1].trim();
    
    // Extrair NASCIMENTO
    const nascMatch = cpfData.match(/NASCIMENTO\s*[⎯\-:]\s*([^\n]+)/i);
    if (nascMatch) nascimento = nascMatch[1].trim();
  }
  
  // Mesclar Score com dados pessoais
  return {
    ...scoreResult,
    cpf: cleanInput,
    nome: nome || undefined,
    nascimento: nascimento || undefined,
    consulta_tipo: "score_enriquecido"
  };
}
```

## Resultado Esperado
A consulta de Score retornará:

```json
{
  "cpf": "38244335831",
  "nome": "NEYMAR DA SILVA SANTOS JUNIOR",
  "nascimento": "1992-02-05",
  "data": {
    "resposta": {
      "classificacao": "CSB:MEDIOSCORE CSBA:368...",
      "score": "SCORE SERASA..."
    }
  },
  "consulta_tipo": "score_enriquecido"
}
```

## Impacto
- A consulta de Score passa a demorar ~100-200ms a mais (chamada paralela ao CPF)
- Os dados de nome e nascimento serão exibidos corretamente na UI
- O cache continua funcionando normalmente
- Sem impacto em outras consultas

## Arquivos a Modificar
1. `supabase/functions/api-query/index.ts` - Adicionar lógica de enriquecimento para Score
