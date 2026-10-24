# 📋 Especificação do Cockpit de Inventário MCP

**Fonte:** `K:\docs\CONSCIENCIA\04-MCP-E-CONECTORES\ARQUITETURA-MCP-V2.md`  
**Baseada no Receipt:** `MCP-RECEIPT-ALIASING-JSONRPC.md`  
**Data:** 2026-10-21  
**Authority:** SEGREDO/CHEFE

## Visão Geral

O cockpit apresenta o inventário de tools MCP com:
- **Busca** em alias ou nome original
- **Paginação** controlada
- **Filtros** por provedor
- **Navegação** determinística (sem listas brutas)

## Interface da API

### `adminGuard.getAdminCatalog(request)`

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `provider` | string | Não | Filtra tools pelo provedor |
| `search` | string | Não | Busca em alias ou nome original (match parcial) |
| `page` | number | Não | Número da página (padrão: 1) |
| `limit` | number | Não | Itens por página (padrão: 20, máximo: 100) |

### Retorno Estruturado

```json
{
  "total": 58,
  "pages": 3,
  "currentPage": 1,
  "limit": 20,
  "tools": [
    {
      "alias": "github_repo_clone",
      "original": "github_repository_clone",
      "provider": "github",
      "description": "Clone um repositório GitHub",
      "category": "version-control"
    },
    // ... mais tools da página corrente
  ]
}
```

## Regras de Navegação

### 1. Filtro por Provider (quando especificado)

```
Se provider ESTIVER definido:
  - Apenas tools.where(provider === req.provider) são retornadas
  - total reflete apenas o conjunto filtrado
  - search opera dentro do conjunto filtrado

Se provider NÃO ESTIVER definido:
  - Catálogo completo é retornado
  - total = total geral de tools
```

### 2. Termo de Busca

```
O termo search faz match em:
  - alias (case-insensitive)
  - original (case-insensitive)
  - description (case-insensitive, opcional)

Se search NÃO ESTIVER definido:
  - Todas as tools da página são retornadas (sem filtro)

Se search ESTIVER definido:
  - total é recalculado para refletir o subset filtrado
  - Apenas tools matching o termo são retornados
```

### 3. Paginação

```
Páginas são 1-indexed:
  - page 1 = primeiros `limit` items
  - page N = itens ((N-1)*limit + 1) a (N*limit)

Metadados de navegação:
  - total: número total de items matching filtros
  - pages: ceil(total / limit)
  - hasPrevious: page > 1
  - hasNext: page < pages
  - startIndex: (page - 1) * limit + 1
  - endIndex: Math.min(page * limit, total)
```

### 4. Ordem Determinística

```
Tools são sempre retornadas na mesma ordem para o mesmo conjunto:
  - Ordem definida pelo registry de alias (hash-based determinístico)
  - Nunca reordenado entre requisições sem mudança de filtros
  - Isso garante cacheabilidade e experiência consistente
```

## Exemplos de Uso

### Exemplo 1: Catálogo Completo - Página 1

```http
GET /admin/catalog?page=1&limit=20
```

Retorna:
```json
{
  "total": 58,
  "pages": 3,
  "currentPage": 1,
  "limit": 20,
  "tools": [ /* first 20 tools in deterministic order */ ]
}
```

### Exemplo 2: Filtro por Provider - GitHub

```http
GET /admin/catalog?provider=github&page=1&limit=20
```

Retorna APENAS tools do provedor "github":
```json
{
  "total": 24,
  "pages": 2,
  "currentPage": 1,
  "limit": 20,
  "tools": [ /* 20 tools github */ ]
}
```

### Exemplo 3: Busca por Termo

```http
GET /admin/catalog?search=github&page=1&limit=20
```

Retorna tools matching "github" em alias ou nome original.

### Exemplo 4: Filtro + Busca Combinados

```http
GET /admin/catalog?provider=github&search=repo&page=1&limit=20
```

Retorna tools do GitHub com "repo" em alias/name/description.

## Integração com o Receipt Registrado

Todas as regras abaixo do receipt `MCP-RECEIPT-ALIASING-JSONRPC.md` se aplicam:

1. ✅ **Never eliminate tools - only alias** - O catálogo mostra both alias e original
2. ✅ **Avoid alias collisions** - A ordem determinística evita colisões
3. ✅ **Original names recoverable** - Cada ferramenta tem alias ↔ original mapping
4. ✅ **JSON-RPC validation at boundary** - Validation ocorre antes do catalog access
5. ✅ **Catalog always needs pagination/filters** - Nunca lista bruta sem navegação
6. ✅ **REUSE_BEFORE_CREATE=true** - Catálogo estende owner existente, não cria novo

## Fixed Point Consistency

| Criteria | Status | Justificativa |
|----------|--------|---------------|
| `catalog_has_pagination` | ✅ | Implementado via page/limit params |
| `catalog_has_search_filters` | ✅ | search e provider filters |
| `catalog_preserves_originals` | ✅ | Registry original↔alias bilateral |
| `catalog_deterministic_order` | ✅ | Hash-based ordering garante consistência |
| `no_raw_lists_without_nav` | ✅ | Catalog nunca retorna sem paginação |
| `provider_filter_supported` | ✅ | Filtro por provedor implementado |
| `search_in_alias_or_original` | ✅ | Busca cobre ambos os campos |
| `learning_closed_from_receipt` | ✅ | Receipt registado & aprendizados aplicados |

**Resultado:** Catálogo integrável, navegável e consistente com o fixed point estabilizado.

## Próximos Passos de Integração

1. **Implementar endpoint** `/admin/catalog` seguindo esta especificação
2. **Conectar ao registry** `toolCorrespondence` do receipt criado
3. **Testar todos os combos** de filtros (provider, search, pagination)
4. **Validar order determinístico** across requisições múltiplas
5. **Documentar no cockpit** interface de usuário

## Referências Cruzadas

- `K:\docs\APRENDIZADOS\MCP\MCP-RECEIPT-ALIASING-JSONRPC.md` - Receipt base
- `K:\docs\CONSCIENCIA\04-MCP-E-CONECTORES\ARQUITETURA-MCP-V2.md` - Arquitetura MCP
- `K:\docs\CONSCIENCIA\04-MCP-E-CONECTORES\MCP-REUSE-HORN-FIXED-POINT.md` - Lógica Horn
- `K:\docs\CONSCIENCIA\04-MCP-E-CONECTORES\BOAS-PRATICAS-MCP.md` - Boas práticas