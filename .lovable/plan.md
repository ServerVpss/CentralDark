

# Enriquecer Caption da Foto com Dados Pessoais

## Problema
Quando a foto é encontrada (via botão 📸 ou busca direta), o caption mostra apenas:
```
📸 Foto encontrada (ES)
👤 CPF: 80912311720
```

Mas a API retorna dados completos: **nome**, **data de nascimento**, **sexo**, **filiação** (mãe/pai). Esses dados são ignorados.

## Solução

### Criar função `extractPhotoMetadata`
Extrair dados pessoais do resultado da API (mesma estrutura que `deepExtractPhoto` percorre):
- `nome` → Nome completo
- `nasc` → Data de nascimento (formatar DD/MM/AAAA)
- `sexo` → Sexo
- `filiacao.nomeMae` → Nome da mãe
- `filiacao.nomePai` → Nome do pai
- `cpf` → CPF formatado

### Atualizar os 3 locais onde foto é enviada

**1. Foto por estado (botão 📸)** — linha ~7535:
```
📸 Foto encontrada (ES)

👤 Nome: AGENOR CARLOS NUNES
📋 CPF: 809.123.117-20
📅 Nascimento: 01/07/1965
👩 Mãe: ALICE NUNES
```

**2. Foto nacional** — linha ~7482: mesmo formato

**3. Foto inline (resultado de consulta)** — linhas ~7196-7215: já usa `fullCaption` com dados formatados, então esse caso já funciona

### Limite de 1024 caracteres
O Telegram limita caption de fotos a 1024 chars. A função montará o caption respeitando esse limite, priorizando: Nome > CPF > Nascimento > Mãe > Pai.

## Arquivo alterado
- `supabase/functions/telegram-webhook/index.ts`

