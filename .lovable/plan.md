
# Sistema de Indexação de Consultas

## Visão Geral
Criar um sistema de cache e indexação para acelerar consultas repetidas, evitando chamadas desnecessárias às APIs externas quando o mesmo dado já foi consultado recentemente.

## Arquitetura da Solução

```text
┌─────────────────────────────────────────────────────────────────┐
│                      FLUXO DE CONSULTA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [Usuário Consulta CPF]                                        │
│          │                                                      │
│          ▼                                                      │
│   ┌──────────────────┐                                          │
│   │ Verificar Cache  │◄─── Busca por índice (hash do input)     │
│   └────────┬─────────┘                                          │
│            │                                                    │
│     ┌──────┴──────┐                                             │
│     │             │                                             │
│  [CACHE HIT]  [CACHE MISS]                                      │
│     │             │                                             │
│     ▼             ▼                                             │
│  Retorna       Chama API                                        │
│  Dados         Externa                                          │
│  Indexados        │                                             │
│                   ▼                                             │
│            ┌─────────────┐                                      │
│            │ Salva Cache │──► Índice por tipo + input           │
│            └─────────────┘                                      │
│                   │                                             │
│                   ▼                                             │
│            Retorna Dados                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes a Implementar

### 1. Nova Tabela: `query_cache`
Armazena resultados de consultas para acesso rápido:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único |
| query_type | TEXT | Tipo (cpf, cnpj, placa, etc.) |
| query_input | TEXT | Valor consultado (limpo) |
| query_hash | TEXT | Hash único (tipo + input) - ÍNDICE |
| cached_result | JSONB | Resultado completo da API |
| hit_count | INTEGER | Quantas vezes foi acessado do cache |
| created_at | TIMESTAMPTZ | Data de criação |
| expires_at | TIMESTAMPTZ | Expiração do cache (24h padrão) |
| last_accessed | TIMESTAMPTZ | Último acesso |

**Índices:**
- `idx_query_cache_hash` UNIQUE em `query_hash`
- `idx_query_cache_expires` em `expires_at`
- `idx_query_cache_type_input` em `(query_type, query_input)`

### 2. Edge Function: `api-query` (Atualização)
Modificar para verificar cache antes de chamar APIs externas:

1. Gerar hash do `queryType + queryInput`
2. Buscar em `query_cache` onde `query_hash = hash AND expires_at > NOW()`
3. Se encontrar (CACHE HIT):
   - Incrementar `hit_count`
   - Atualizar `last_accessed`
   - Retornar `cached_result`
4. Se não encontrar (CACHE MISS):
   - Chamar API externa normalmente
   - Salvar resultado em `query_cache`
   - Retornar resultado

### 3. Nova Página: `/consultas/indice` (Opcional)
Interface para visualizar e gerenciar o índice:

- **Estatísticas**: Total de entradas, taxa de hit/miss, economia estimada
- **Pesquisa por índice**: Buscar dados já indexados sem nova consulta
- **Limpeza manual**: Invalidar cache específico ou limpar tudo
- **Configuração**: Tempo de expiração, tipos a cachear

### 4. Componente: `CacheStats`
Widget no dashboard mostrando:
- Entradas no cache
- Taxa de acerto (hit rate)
- Economia de créditos/chamadas
- Consultas mais populares

### 5. Trigger de Limpeza Automática
Database trigger para limpar entradas expiradas:
- Executar a cada inserção nova
- Deletar onde `expires_at < NOW()`

## Configurações de Cache

| Tipo de Consulta | TTL (Tempo de Vida) | Motivo |
|------------------|---------------------|--------|
| CPF | 24 horas | Dados pessoais mudam pouco |
| CNPJ | 24 horas | Dados empresariais estáveis |
| Placa | 12 horas | Veículos podem mudar de dono |
| Score | 6 horas | Score pode mudar mais rápido |
| Foto | 7 dias | Fotos raramente mudam |
| Telefone | 24 horas | Associações estáveis |
| CEP | 30 dias | Endereços não mudam |

## Benefícios

1. **Velocidade**: Consultas cacheadas retornam em <100ms vs 300-2000ms
2. **Economia**: Menos chamadas às APIs externas = menos custo
3. **Resiliência**: Se API externa cair, dados recentes ainda disponíveis
4. **Analytics**: Saber quais consultas são mais frequentes

## Arquivos a Criar/Modificar

### Criar:
- **Migração SQL**: Tabela `query_cache` + índices + trigger de limpeza
- `src/components/consultation/CacheStats.tsx`: Widget de estatísticas
- `src/components/consultation/IndexSearch.tsx`: Busca no índice (opcional)

### Modificar:
- `supabase/functions/api-query/index.ts`: Adicionar lógica de cache
- `src/pages/Consultas.tsx`: Adicionar indicador de cache hit/miss
- `src/components/consultation/ProviderStatusList.tsx`: Mostrar stats do cache

## Detalhes Técnicos

### Geração do Hash (Edge Function)
```text
hash = SHA256(queryType.toLowerCase() + ":" + cleanInput)
```

### Fluxo no `api-query`
```text
1. Recebe request
2. Limpa input, normaliza tipo
3. Gera hash
4. SELECT * FROM query_cache WHERE query_hash = hash AND expires_at > NOW()
5. Se encontrou:
   - UPDATE hit_count, last_accessed
   - Return { fromCache: true, data: cached_result }
6. Se não:
   - Chama API externa
   - INSERT INTO query_cache (...)
   - Return { fromCache: false, data: result }
```

### RLS Policy
- Usuários autenticados podem ler cache de suas próprias consultas
- Service role pode ler/escrever qualquer cache
- Cache é compartilhado entre usuários para economia máxima

## Ordem de Implementação

1. Criar migração da tabela `query_cache`
2. Atualizar Edge Function `api-query` com lógica de cache
3. Atualizar frontend para mostrar indicador de cache
4. Criar widget de estatísticas
5. (Opcional) Criar página de gerenciamento de índice
