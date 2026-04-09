

## Adicionar Sugestão de Correção Ortográfica para Consultas por Nome Sem Resultado

### Problema
Quando o usuário consulta um nome e não encontra resultados (ex: "Maria gertudes coronel"), o sistema retorna apenas "Nome não encontrado" sem sugerir possíveis correções de digitação.

### Solução
Adicionar detecção de erros ortográficos comuns em nomes brasileiros e sugerir correções quando a consulta não retornar resultados.

### Implementação

**1. Criar dicionário de correções comuns** (dentro do `telegram-webhook/index.ts`)

Mapa de substituições frequentes em nomes brasileiros:
- "gertudes" → "gertrudes"
- "goncalves" → "gonçalves"  
- "conceicao" → "conceição"
- "lucio" → "lúcio"
- "tereza" → "theresa/tereza" (variação)
- Padrões genéricos: letras trocadas, acentos faltando, consoantes duplicadas/faltando

Usar uma abordagem de **similaridade por distância de Levenshtein simplificada** + dicionário de substituições comuns para gerar 1-3 sugestões.

**2. Modificar resposta de "não encontrado" no Telegram** (`telegram-webhook/index.ts`)

Quando `isEmptyResult` retornar true para módulos de nome (`nome`, `nomefull`, `nomeabreviadofiltros`):
- Gerar sugestões ortográficas baseadas no input
- Adicionar botões inline para cada sugestão (ex: `retry_query:nome:Maria Gertrudes Coronel`)
- Manter botões existentes de "Nova Consulta" e "Menu"

Exemplo de mensagem:
```
❌ Nome não encontrado

🔍 Você quis dizer?
├ Maria Gertrudes Coronel
└ Maria Gertrudes Coronell

💡 Verifique a ortografia e tente novamente.
```

**3. Modificar resposta no Website** (`src/pages/Consultas.tsx`)

Quando consulta por nome retorna erro/vazio:
- Mostrar sugestões clicáveis abaixo da mensagem de erro
- Ao clicar, preencher automaticamente o campo e executar nova consulta

### Detalhes Técnicos

- Dicionário com ~50 substituições comuns em nomes brasileiros (consoantes mudas, acentos, letras trocadas)
- Função `suggestCorrections(input: string): string[]` que retorna até 3 sugestões
- Botões inline no Telegram usam callback `retry_query:nome:{sugestão}` (já suportado)
- No website, sugestões aparecem como chips/badges clicáveis

### Arquivos Modificados
1. `supabase/functions/telegram-webhook/index.ts` — dicionário + lógica de sugestão + botões inline
2. `src/pages/Consultas.tsx` — sugestões clicáveis na interface web
