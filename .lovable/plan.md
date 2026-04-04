

# Correção do Nome do Secret da API

## Problema
O nome `VEICULOS_API_KEY` é enganoso — a chave serve para **todos os módulos de consulta** (CPF, nome, telefone, placa, foto, score, etc.), não apenas veículos. O provedor se chama "veiculosapi.com" mas o serviço é uma plataforma completa de consultas.

## Solução
Usar um nome genérico e preciso para o secret:

**`CONSULTAS_API_KEY`**

Valor: `UlPfuQAO0AhCGoUKQcVg8RJWyFdzS8gY`

## Mudanças
1. Adicionar o secret com o nome `CONSULTAS_API_KEY`
2. Referenciar esse nome em todas as edge functions (`api-query`, `telegram-webhook`)
3. Implementar toda a integração com os módulos do provedor conforme o plano já aprovado

