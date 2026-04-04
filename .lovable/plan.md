
# Filtrar Dados Internos da API nos Resultados

## Problema
A API do veiculosapi.com retorna metadados da sua conta/assinatura junto com os dados da consulta. Campos como SUCESSO, PROTOCOLO, USUARIO, CONSUMO HOJE, TOTAL DIARIO, RESET EM, TIPO (TOKEN), INICIO USO, VENCIMENTO, TEMPO RESTANTE, DIAS TOTAIS RESTANTES, DDD, CLASSIFICACAO e MODULO são dados internos do provedor e não devem ser exibidos ao usuário final.

## Solução
Adicionar esses campos às listas de campos ignorados em **3 pontos**:

### 1. Edge Function `telegram-webhook` — `formatGenericResult`
Adicionar ao array `ignoredKeys` (linha ~2129):
```
sucesso, protocolo, usuario, consumo_hoje, consumo, total_diario, 
reset_em, tipo, inicio_uso, vencimento, tempo_restante, 
tempo_restante_detalhado, dias_totais_restantes, dias_totais, 
ddd, classificacao, modulo
```

### 2. Edge Function `telegram-webhook` — `txtIgnoredKeys` (linha ~497)
Mesmos campos adicionados à lista global de chaves ignoradas no modo TXT.

### 3. Painel Web — `MonospaceResultDisplay.tsx`
Adicionar os mesmos campos ao filtro do `extractData` para que não apareçam na interface web.

## Resultado
- Dados do plano/API nunca mais aparecem nos resultados
- Apenas os dados reais da consulta (nome, CPF, endereço, etc.) são exibidos
- Funciona tanto no Telegram quanto no painel web
