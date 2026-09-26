# COMANDO - squads-api.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\api\squads-api.md
**SHA:** 4138a9a25e1c7e48
**Timestamp:** 2026-08-28T02:02:38.550009
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- | `isPublic`              | boolean | Não         | Tornar publicamente visível (padrão: false) |
- | `isPublic` | boolean | Não         | Tornar todos os squads públicos (padrão: false) |

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/api/squads-api.md | Sincronização: 2026-01-26 -->

# Referência da API de Squads

API REST para sincronizar squads com Synkra e descobrir squads do marketplace.

## Visão Geral

A API de Squads permite:

- **Sync**: Enviar squads locais para a nuvem Synkra
- **Marketplace**: Descobrir e navegar squads públicos
- **Gerenciamento**: Atualizar visibilidade, excluir squads

**URL Base**: `https://api.synkra.ai`

## Autenticação

Todos os endpoints autenticados requerem:

### Chave de API (Recomendado para CLI)

```bash
Authorization: Bearer sk_your_api_key
```

### Token JWT (Aplicações web)

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Obtenha sua chave de API em: https://synkra.ai/settings/api-keys

## Endpoints

### Sincronizar Squad

Enviar uma definição de squad para Synkra.

```
POST /api/squads/sync
```

**Autenticação**: Obrigatória

**Corpo da Requisição**:

| Campo                   | Tipo    | Obrigatório | Descrição                                   |
| ----------------------- | ------- | ----------- | ------------------------------------------- |
| `squadData`             | object  | Sim         | Dados do manifesto do squad                 |
| `squadData.name`        | string  | Sim         | Nome do squad                               |
| `squadData.version`     | string  | Sim         | Versão semântica                            |
| `squadData.description` | string  | Não         | Descrição do squad                          |
| `squadData.author`      | string  | Não         | Nome do autor                               |
| `squadData.components`  | object  | Não         | Componentes do squad                        |
| `isPublic`              | boolean | Não         | Tornar publicamente visível (padrão: false) |
| `isOfficial`            | boolean | Não         | Marcar como oficial (apenas admin)          |

**Exemplo de Requisição**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "squadData": {
      "name": "my-squad",
      "version": "1.0.0",
      "description": "Meu squad incrível",
      "aios": {
        "minVersion": "2.1.0",
        "type": "squad"
      },
      "components": {
        "agents": ["greeter-agent"],
        "tasks": ["greet-user"]
      }
    },
    "isPublic": true
  }'
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "data": {
    "squad_id": "my-squad",
    "action": "created",
    "version": "1.0.0",
    "is_public": true
  },
  "duration_ms": 45
}
```

**Resposta de Erro** (400):

```json
{
  "success": false,
  "error": "Validation failed: name is required"
}
```

---

### Sincronização em Lote

Sincronizar múltiplos squads em uma requisição.

```
POST /api/squads/sync/batch
```

**Autenticação**: Obrigatória

**Corpo da Requisição**:

| Campo      | Tipo    | Obrigatório | Descrição                                       |
| ---------- | ------- | ----------- | ----------------------------------------------- |
| `squads`   | array   | Sim         | Array de objetos de dados de squad              |
| `isPublic` | boolean | Não         | Tornar todos os squads públicos (padrão: false) |

**Exemplo de Requisição**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync/batch \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "squads": [
      {
        "name": "squad-one",
        "version": "1.0.0",
        "description": "Primeiro squad"
      },
      {
        "name": "squad-two",
        "version": "2.0.0",
        "description": "Segundo squad"
      }
    ],
    "isPublic": false
  }'
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "data": {
    "total": 2,
    "created": 2,
    "updated": 0,
    "skipped": 0,
    "failed": 0,
    "errors": [],
    "duration_ms": 120
  }
}
```

**Resposta de Falha Parcial** (200):

```json
{
  "success": false,
  "data": {
    "total": 2,
    "created": 1,
    "updated": 0,
    "skipped": 0,
    "failed": 1,
    "errors": [
      {
        "index": 1,
        "squad_name": "squad-two",
        "error": "Validation failed: version is required"
      }
    ],
    "duration_ms": 85
  }
}
```

---

### Listar Squads Públicos (Marketplace)

Navegar squads disponíveis no marketplace.

```
GET /api/squads
```

**Autenticação**: Opcional

**Parâmetros de Query**:

| Parâmetro  | Tipo    | Padrão | Descrição                            |
| ---------- | ------- | ------ | ------------------------------------ |
| `page`     | number  | 1      | Número da página                     |
| `limit`    | number  | 20     | Itens por página (máx: 100)          |
| `tags`     | string  | -      | Filtro de tags separadas por vírgula |
| `author`   | string  | -      | Filtrar por autor                    |
| `search`   | string  | -      | Buscar em nome/descrição             |
| `of
```