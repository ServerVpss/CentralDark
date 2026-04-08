

# Unificar API Key e Limpar Referências iSeek no api-query

## Contexto
Os 75 módulos atuais são todos da mesma API (VeiculosAPI). A diferença é apenas o **nome do módulo** na URL (ex: `cpf` vs `iseek-dados---irpf`). Atualmente o código usa **duas chaves de API diferentes** (`CONSULTAS_API_KEY` para módulos nativos e `ISEEK_API_KEY` para ex-iSeek), o que é desnecessário já que é a mesma API.

## Alterações

### 1. `supabase/functions/api-query/index.ts`
- **Unificar API key**: usar apenas `CONSULTAS_API_KEY` para TODOS os módulos (remover lógica de `isIseekModule` que seleciona `ISEEK_API_KEY`)
- **Manter `MODULE_API_NAME`**: esse mapeamento é necessário porque os nomes dos módulos na API são diferentes (ex: `irpf` → `iseek-dados---irpf`). São nomes válidos na VeiculosAPI.
- **Remover entradas `-isk`** do `MODULE_API_NAME` (linhas 116-150): esses módulos (`cpf-isk`, `cnpj-isk`, etc.) já não existem no banco
- **Limpar comentários** que mencionam "ex-iSeek", "iSeek", "Sobrepostos com sufixo -isk"

### 2. Resumo das mudanças no `fetchFromProvider()`
```
// ANTES (2 chaves):
const apiKey = isIseekModule ? ISEEK_API_KEY : CONSULTAS_API_KEY;

// DEPOIS (1 chave):
const apiKey = CONSULTAS_API_KEY;
```

### Resultado
- Uma única chave de API para tudo
- `MODULE_API_NAME` mantido (necessário para traduzir nomes de módulos)
- Sem referências a iSeek no código
- Sem entradas mortas (`-isk`) no mapeamento

