

# Integrar iSeek como Provedor Fallback na api-query

## Resumo
Adicionar o endpoint iSeek (`ISEEK_API_BASE` + `ISEEK_API_KEY`, já configurados como secrets) como fallback automático para módulos CPF. Quando o VeiculosAPI falhar (erro, timeout, notFound), o sistema tenta automaticamente o iSeek antes de retornar erro ao usuário.

## Detalhes Técnicos

**Arquivo**: `supabase/functions/api-query/index.ts`

### 1. Nova função `fetchFromIseek`
- Usa `ISEEK_API_BASE` e `ISEEK_API_KEY` dos secrets
- URL: `${ISEEK_API_BASE}?apikey=${ISEEK_API_KEY}&modulo=iseek-cpf&string=${valor}`
- Timeout de 30s, mesma interface `ProviderResult`
- Parseia resposta aninhada `{ status: 200, data: { ... } }` — extrai `data` interno

### 2. Mapa de fallback iSeek
```text
ISEEK_FALLBACK_MODULES = {
  "cpf"       → "iseek-cpf",
  "cpffull"   → "iseek-cpf",
  "cpf-isk"   → "iseek-cpf",
  "cpfsus"    → "iseek-cpf",
  "parentes"  → "iseek-cpf",
  "parentes-3"→ "iseek-cpf",
}
```
Apenas módulos baseados em CPF, pois o iSeek só suporta `iseek-cpf`.

### 3. Lógica de fallback no fluxo "MÓDULO PADRÃO" (linha ~508)
Após `fetchFromProvider` retornar erro ou notFound:
- Verificar se o módulo tem entrada em `ISEEK_FALLBACK_MODULES`
- Se sim, chamar `fetchFromIseek` com o módulo mapeado
- Se iSeek retornar dados válidos, usar esses dados (adicionando `fallback_provider: "iseek"` nos metadados)
- Se iSeek também falhar, retornar o erro original do VeiculosAPI
- Log estruturado indicando uso de fallback

### 4. Deploy
Deploy da função `api-query` após as alterações.

