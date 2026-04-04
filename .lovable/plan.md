

# Integração do Novo Provedor VeiculosAPI

## Visão Geral

Substituir os provedores antigos (NexFuture offline, TConect parcial) pelo novo provedor **veiculosapi.com**, que já está pronto e cobre praticamente todos os módulos. A API usa um padrão simples:

```text
GET https://veiculosapi.com/api/proxy?apikey=CHAVE&modulo=TIPO&string=VALOR
```

## Módulos Disponíveis no Novo Provedor

| Módulo API | Comando Bot | Categoria |
|---|---|---|
| `cpffull` | `/cpf` | Pessoa |
| `nome` | `/nome` | Pessoa |
| `rg` | `/rg` | Documento |
| `titulo` | `/titulo` | Documento (novo) |
| `telefonefull` | `/telefone` | Contato |
| `endereco` | `/endereco` | Contato (novo) |
| `cep` | `/cep` | Contato |
| `pix` | `/pix` | Financeiro |
| `renda` | `/renda` | Financeiro (novo) |
| `placa` | `/placa` | Veículo |
| `placa-serpro` | `/placa2` | Veículo |
| `cnpj-cred` | `/cnpj` | Empresa |
| `fotomg/fotosp/fotorj/...` (12 estados) | `/foto` | Foto |

## Mudanças Necessárias

### 1. Salvar a API Key como secret
- Adicionar `VEICULOS_API_KEY` como secret no projeto (valor: `UlPfuQAO0AhCGoUKQcVg8RJWyFdzS8gY`)

### 2. Edge Function `api-query/index.ts`
- Adicionar função `fetchFromVeiculosApi(modulo, valor)` que faz GET para `https://veiculosapi.com/api/proxy?apikey=KEY&modulo=MODULO&string=VALOR`
- Criar mapeamento de `queryType` interno para `modulo` da API:
  - `cpf` → `cpffull`, `telefone` → `telefonefull`, `placa_completa` → `placa-serpro`, `cnpj` → `cnpj-cred`, etc.
- Atualizar `handleQuery()` para usar o novo provedor como **primário**
- Manter TConect como fallback para `score` e `foto` (busca nacional por estado)
- Adicionar novos módulos: `titulo`, `endereco`, `renda`
- Para **foto**: usar os módulos `foto{estado}` (fotomg, fotosp, fotorj, etc.) em vez de iterar estados no TConect
- Atualizar `cacheTTL` com os novos tipos

### 3. Edge Function `telegram-webhook/index.ts`
- Atualizar `enabledQueryTypes`: ativar **todos** os módulos que o novo provedor suporta
- Adicionar novos comandos: `/titulo`, `/endereco`, `/renda`
- Atualizar `queryTypeAliases` e `queryTypeLabels` com os novos tipos
- Atualizar `showQueryMenu()` com os novos botões
- Adicionar comandos `/titulo`, `/endereco`, `/renda` no parser de comandos

### 4. Frontend `QueryModulesManager.tsx`
- Adicionar os novos módulos (titulo, endereco, renda) na lista
- Atualizar provider para "VeiculosAPI" nos módulos migrados

### 5. Validação `queryValidation.ts`
- Adicionar schemas para `titulo`, `endereco`, `renda`

## Segurança
- A API key fica apenas no backend (edge function), nunca exposta no frontend
- Continua usando cache para evitar chamadas desnecessárias

## Resultado Esperado
- Todos os módulos de consulta voltam a funcionar via o novo provedor
- Novos módulos (titulo, endereco, renda) disponíveis
- Foto por estado usa endpoints dedicados (fotomg, fotosp, etc.)
- Score continua via TConect (único provedor que oferece)

