# Auto-Destilador → Kanban Hook Pattern

## Visão Geral
Integração automática entre o Auto-Destilador (watchdog de cristalização) e o Kanban Board via Hermes WebUI BFF API. Cada cristal gerado pelo Auto-Destilador cria automaticamente um card no board Kanban.

## Arquitetura

```
Auto-Destilador (watchdog)
        ↓
emitir_carve() + criar_card_kanban()
        ↓
POST /api/kanban/tasks (BFF :8787)
        ↓
Card criado no board default
```

## Implementação

### Método `criar_card_kanban()` no Auto-Destilador

```python
def criar_card_kanban(self, cristal, destino):
    """Cria card no Kanban via BFF API"""
    import urllib.request
    import json as json_lib
    try:
        titulo = f"[{cristal['tipo']}] {os.path.basename(cristal['origem'])}"
        corpo = f"**SHA:** {cristal['sha']}\n**Destino:** {destino}\n**Origem:** {cristal['origem']}\n**Timestamp:** {cristal['timestamp']}\n\n**Ouro Extraído:**\n"
        ouro = cristal.get('conteudo', {})
        for key, items in ouro.items():
            if isinstance(items, list) and items:
                corpo += f"\n**{key.title()}:**\n"
                for item in items[:3]:
                    corpo += f"- {item}\n"
        
        data = json_lib.dumps({
            "title": titulo,
            "body": corpo,
            "priority": 1,
            "status": "todo",
            "workspace_path": cristal.get('workspace_path')
        }).encode('utf-8')
        
        req = urllib.request.Request(
            "http://127.0.0.1:8787/api/kanban/tasks",
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            result = json_lib.loads(resp.read().decode('utf-8'))
            print(f"[DESTILADOR] Card Kanban criado: {result.get('id', 'N/A')} - {titulo}")
            return result
    except Exception as e:
        print(f"[DESTILADOR] Erro criando card Kanban: {e}")
        return None
```

### Integração no `emitir_carve()`

```python
def emitir_carve(self, filepath, cristais, destino):
    # ... emite CARVE no rastro.jsonl ...
    
    # CRIA CARD KANBAN AUTOMATICAMENTE
    self.criar_card_kanban(cristal, destino)
```

## Formato do Card Criado

| Campo | Valor |
|-------|-------|
| **Title** | `[TIPO] nome_arquivo.ext` (ex: `[COMANDO] TESTE_HOOK_KANBAN.txt`) |
| **Body** | SHA, Destino, Origem, Timestamp, Ouro Extraído (resumido) |
| **Priority** | 1 |
| **Status** | `todo` (inicial) |
| **Workspace Path** | Do cristal (se houver) |

## Transições de Estado Kanban (Obrigatórias)

**Ordem testada e confirmada:** `todo → ready → done`

```bash
# Create
POST /api/kanban/tasks {"title":"...", "status":"todo"}

# Move (sequencial!)
PATCH /api/kanban/tasks/{id}?board=default {"status":"ready"}
PATCH /api/kanban/tasks/{id}?board=default {"status":"done"}
```

**⚠️ `todo → done` direto retorna erro.**

## Validação Real (Teste 2026-08-23)

| Item | Resultado |
|------|-----------|
| Arquivo teste | `TESTE_HOOK_KANBAN.txt` |
| Classificação | `commands` |
| Card criado | `t_93972522` |
| Status inicial | `todo` |
| Board | `default` |
| Tempo total | < 10s (detecção + processamento + card) |

## Endpoints Kanban BFF (hermes-webui :8787)

| Operação | Endpoint | Método |
|----------|----------|--------|
| Listar board | `/api/kanban/board?board=default` | GET |
| Criar task | `/api/kanban/tasks` | POST |
| Mover task | `/api/kanban/tasks/{id}?board=default` | PATCH |
| Buscar task | `/api/kanban/tasks/{id}?board=default` | GET |

## Pré-requisitos

1. **hermes-webui rodando** na porta 8787 (`server.py` com venv do Hermes Agent)
2. **Kanban Bridge ativo** (`kanban_bridge.py` carregado)
3. **Board `default` existente** (criado automaticamente na primeira execução)

## Troubleshooting

| Erro | Causa | Solução |
|------|-------|---------|
| `Connection refused` | BFF não rodando | Subir `server.py` com venv Hermes |
| `404 Not Found` | Endpoint errado | Verificar `/api/kanban/tasks` |
| `500 Internal Error` | Board não existe | Criar board via UI ou API |
| `timeout` | BFF sobrecarregado | Aumentar timeout ou retry |

## Integração com TRILHO

O hook Kanban é uma **lâmina do TRILHO**:
- Emite CARVE no rastro (chassi T1-T3)
- Respeita FREIO (T7) — se 3 passadas sem ganho, para
- Gera cristal (portão da forja) → card Kanban = evidência visual

## Referências Relacionadas

- `references/auto-destilador-pattern.md` — Pipeline completo do Auto-Destilador
- `references/kanban-state-transitions.md` — Transições de estado validadas
- `references/hermes-webui-bootstrap-serverpy.md` — Bootstrap do BFF
- `references/trilho-framework.md` — Framework TRILHO (Chassi + Lâmina)