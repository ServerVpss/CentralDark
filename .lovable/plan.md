

# Reexibir Campos Úteis Removidos por Engano

## Problema
Os seguintes campos foram adicionados à lista de campos ignorados, mas o usuário quer que sejam exibidos pois contêm informações úteis para o resultado:
- **operadora** — operadora do telefone
- **tipotelefone** — tipo (celular/fixo)
- **data** — data associada ao registro
- **ano** — ano do registro
- **ranking** — relevância do resultado
- **whatsapp** — se o número tem WhatsApp
- **resultados** — quantidade de resultados encontrados
- **estados_encontrados** — estados onde foram encontrados dados
- **total_fotos** — total de fotos encontradas
- **estado_encontrado** — estado onde a foto foi localizada

## Solução
Remover esses 10 campos das 3 listas de ignorados:

### 1. `supabase/functions/telegram-webhook/index.ts` — `ignoredKeys` (linha ~4693)
Remover: `operadora`, `tipotelefone`, `data`, `ano`, `ranking`, `whatsapp`, `resultados`, `estados_encontrados`, `total_fotos`, `estado_encontrado`

### 2. `supabase/functions/telegram-webhook/index.ts` — `txtIgnoredKeys` (linha ~1719)
Remover os mesmos campos da lista de exportação TXT

### 3. `src/components/consultation/MonospaceResultDisplay.tsx` — `ignoredKeys` (linha ~14)
Remover os mesmos campos do painel web

## Campos que continuam ocultos (metadados internos)
`requests_used`, `requests_remaining`, `daily_limit`, `fallback_provider`, `apikey`, `prioridade`, `classificacao`, `ddd`, `saldo`, `conta`, `protocolo`, `usuario`, etc.

## Arquivos alterados
- `supabase/functions/telegram-webhook/index.ts`
- `src/components/consultation/MonospaceResultDisplay.tsx`

