# COMANDO - squad-creator-sync-synkra.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\squad-creator-sync-synkra.md
**SHA:** 9e3cb982b6de771d
**Timestamp:** 2026-08-28T02:02:09.169172
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - dry_run: Preview sem sincronizar (--dry-run)
- │  6. If --dry-run: show preview and exit           │

### Ouro Bruto (primeiros 5000 chars)
```
---
task: Sync Squad to Synkra
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
status: active
sprint: 8
story: SQS-5
version: 1.0.0
Entrada: |
  - squad_path: Caminho do squad para sincronizar (obrigatório)
  - visibility: public | private (default: private)
  - official: Flag para marcar como oficial (--official, apenas SynkraAI)
  - dry_run: Preview sem sincronizar (--dry-run)
Saida: |
  - sync_result: Resultado do sync (created | updated | skipped)
  - squad_url: URL do squad no marketplace (quando público)
  - squad_id: ID único do squad
  - checksum: Checksum do squad sincronizado
Checklist:
  - "[x] Validar squad localmente"
  - "[x] Obter token de autenticação"
  - "[x] Calcular checksum"
  - "[x] Enviar para Synkra API"
  - "[x] Exibir URL do marketplace"
---

# *sync-squad-synkra

Sincroniza um squad local para o Synkra API marketplace.

## Uso

```bash
@squad-creator

# Sync privado (apenas workspace)
*sync-squad-synkra ./squads/meu-squad

# Sync público (visível para todos)
*sync-squad-synkra ./squads/meu-squad --public

# Preview sem sincronizar
*sync-squad-synkra ./squads/meu-squad --dry-run

# Sync com verbosidade
*sync-squad-synkra ./squads/meu-squad --verbose
```

## Autenticação

Requer autenticação com Synkra API:

```bash
export SYNKRA_API_TOKEN="seu-token"
```

Ou configure em `.env`:

```env
SYNKRA_API_URL=https://api.synkra.dev/api
SYNKRA_API_TOKEN=seu-token
```

Para obter um token:
1. Acesse https://synkra.dev/settings/api-keys
2. Crie uma nova API key com permissões de sync
3. Configure a variável de ambiente

## Output Exemplo

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *sync-squad-synkra
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Squad: ./squads/meu-squad/

Step 1: Local Validation
  ✓ Found squad.yaml
  ✓ Name: meu-squad
  ✓ Version: 1.0.0
  ✓ Schema validation: PASSED

Step 2: Calculate Checksum
  ✓ Checksum: a1b2c3d4e5f6...

Step 3: Sync to Synkra API
  ✓ Visibility: private
  ✓ API URL: https://api.synkra.dev/api

Syncing to Synkra API...

✅ Squad synced successfully!

  Status:   created
  ID:       550e8400-e29b-41d4-a716-446655440000
  Checksum: a1b2c3d4e5f6...

Next steps:
  - View squad: *describe-squad meu-squad
  - Make public: *sync-squad-synkra ./squads/meu-squad --public
```

## Flags

| Flag | Descrição | Default |
|------|-----------|---------|
| `--public` | Torna o squad visível no marketplace público | false |
| `--private` | Mantém squad privado (apenas workspace) | true |
| `--dry-run` | Preview sem enviar para API | false |
| `--verbose` | Output detalhado | false |
| `--official` | Marca como squad oficial (apenas SynkraAI team) | false |
| `--force` | Ignora warnings e força sync | false |

## Workflow

```
┌──────────────────────────────────────────────────┐
│              *sync-squad-synkra                   │
├──────────────────────────────────────────────────┤
│                                                   │
│  1. Parse Arguments                               │
│     ↓                                             │
│  2. Find squad.yaml                               │
│     ↓                                             │
│  3. Validate with squad-validator.js              │
│     ↓ (fail → abort)                              │
│  4. Calculate SHA-256 checksum                    │
│     ↓                                             │
│  5. Check SYNKRA_API_TOKEN                        │
│     ↓ (missing → abort)                           │
│  6. If --dry-run: show preview and exit           │
│     ↓                                             │
│  7. POST to /api/squads/sync                      │
│     ↓                                             │
│  8. Display result and marketplace URL            │
│                                                   │
└──────────────────────────────────────────────────┘
```

## API Integration

### Request

```javascript
POST ${SYNKRA_API_URL}/squads/sync
Authorization: Bearer ${SYNKRA_API_TOKEN}
Content-Type: application/json

{
  "squadData": {
    "name": "meu-squad",
    "version": "1.0.0",
    "description": "...",
    "author": "...",
    "license": "MIT",
    "components": {...},
    "tags": [...]
  },
  "isPublic": false,
  "isOfficial": false
}
```

### Response (Success)

```json
{
  "success": true,
  "data": {
    "action": "created",
    "squad_id": "meu-squad",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.0.0"
  },
  "duration_ms": 150
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Validation failed: Missing required field: version"
}
```

## Implementation Guide

### For Agent Execution

```javascript
// 1. Parse squad path from arguments
const squadPath = args[0] || '.';
const flags = parseFlags(args);

// 2. Find and read squad.yaml
const squadYamlPath = path.join(squadPath, 'squad.yaml');
if (!fs.existsSync(squadYamlPath)) {
  error(`squad.yaml not found in ${squadPath}`);
  return;
}

// 3. Validate with
```