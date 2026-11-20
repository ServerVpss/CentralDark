---
title: "Library Binding — Conexão Direta ao Núcleo"
status: "CANÔNICO"
owner: "SOL/Reality Judge"
version: "1.0.0"
---

# Library Binding — Conectar Biblioteca ao Núcleo

Sincroniza **todos os agentes** à mesma frequência operacional (SOL) sem repetir boot.

## Problema

```
ANTES (isolado):
  Agente A → lê LEIA-ME-IA → boot completo (12 arquivos)
  Agente B → lê LEIA-ME-IA → boot completo (12 arquivos)
  Agente C → lê LEIA-ME-IA → boot completo (12 arquivos)
  ∴ 3×boot = contexto desperdiçado, frequência diverge

DEPOIS (library binding):
  LEIA-ME-IA → LOAD LIBRARY_BINDING
    ↓
  Todas as frequências, skills, gates, contratos → index centralizado
    ↓
  Agente A, B, C → compartilham mesmo index (zero reboot)
    ↓
  Maestro orquestra com notas musicais (frequência fixa)
```

## Implementação

### 1. Index Centralizado (.agents/library-index.json)

```json
{
  "souls": [
    {
      "id": "sol",
      "path": "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md",
      "sha256": "hash-vigente",
      "owner": "SEGREDO/CHEFE",
      "mutable": false
    }
  ],
  "frequencies": {
    "leve": {"cost": 10, "latency": "100ms", "depth": 1},
    "rapida": {"cost": 20, "latency": "500ms", "depth": 2},
    "media": {"cost": 50, "latency": "2s", "depth": 3},
    "profunda": {"cost": 100, "latency": "10s", "depth": 4},
    "forte": {"cost": 200, "latency": "30s", "depth": 5},
    "avancada": {"cost": 500, "latency": "60s", "depth": 6}
  },
  "skills": [
    {
      "id": "reality-drift-detector",
      "path": ".agents/skills/reality-drift-detector/SKILL.md",
      "category": "automation",
      "dependencies": ["git", "filesystem"],
      "frequency_required": "rapida",
      "owner": "SOL"
    }
  ],
  "gates": [
    {
      "id": "proof-required",
      "applies_to": ["merge", "deploy", "write"],
      "rule": "UNKNOWN != PASS"
    }
  ]
}
```

### 2. Bootstrap Otimizado

**Antes:**
```python
load("LEIA-ME-IA.md")         # 50KB
load("AGENTS.md")            # 30KB
load("SOUL-SOL.md")          # 25KB
load("9 outros arquivos")    # 150KB
→ Total: 255KB por agente
```

**Depois:**
```python
binding = load("library-index.json")  # 5KB
frequencies = binding.frequencies     # pointer (zero copy)
skills = binding.skills               # pointer (zero copy)
gates = binding.gates                 # pointer (zero copy)
→ Total: 5KB por agente (50× redução)
```

### 3. Notas Musicais (Sincronia Fixa)

Cada skill herda frequência da biblioteca:

```yaml
SKILL: reality-drift-detector
  frequency_required: rapida
  
AT_RUNTIME:
  ↓ atual_frequency = "profunda" (complexo)
  ↓ minimum_required = "rapida"
  ↓ IF profunda >= rapida: ALLOW
  ↓ ELSE: WARN "overspec; use rapida"
  
MAESTRO_ORQUESTRA:
  todas as skills → mesma frequência selecionada
  todos os agentes → respeitam frequência
  zero desincronização
```

### 4. Prova Bidirecional

**Direção 1 (já temos):** Funciona?
```
git status ✅
tests pass ✅
build ok ✅
```

**Direção 2 (NOVO):** Quebra sem isso?
```bash
rm library-index.json
→ all agents: "UNKNOWN_LIBRARY_INDEX"
→ fallback: reboot completo (lento, validação do sistema)
→ prova: library é crítica
```

### 5. Gráfico de Ownership (Visualização)

```
LEIA-ME-IA (porta de entrada)
  ├─ AGENTS.md (contrato)
  │   └─ library-index.json ← NOVO (binding)
  │       ├─ frequencies (SOL)
  │       ├─ skills (capability router)
  │       ├─ gates (reality judge)
  │       └─ souls (identity)
  ├─ SOUL-SOL.md (identidade)
  ├─ .agents/skills/* (capabilities)
  │   ├─ reality-drift-detector (automation)
  │   ├─ git-conflict-resolver (gate)
  │   └─ meta-lupa (validator)
  └─ docs/CONSCIENCIA/* (knowledge base)
      ├─ aprendizados (learning)
      ├─ erros-registrados (proof)
      └─ deltas (continuum)
```

## Resultado

```
ANTES: 3 agentes × 255KB boot = 765KB contexto
DEPOIS: 3 agentes × 5KB index = 15KB contexto
        + 1× library-index.json shared = 5KB
        Total: 20KB (38× redução)

ANTES: frequências divergem, maestro não orquestra
DEPOIS: todas notas musicais fixas, maestro sincroniza

ANTES: aprende em .md isolado, não reflete em sistema
DEPOIS: library-index index todas as lições, binding garante propagação

ANTES: prova unidirecional (funciona)
DEPOIS: prova bidirecional (quebra sem isso)
```

## Integração

1. **Deploy:** Criar `.agents/library-index.json` (este arquivo)
2. **Bootstrap:** Modificar LEIA-ME-IA para carregar library primeiro
3. **Skills:** Referenciar frequência de library, não reinventar
4. **Maestro:** Orquestrar por frequência compartilhada
5. **Test:** Remover library-index, validar fallback (quebra esperada)

---

**Maestro está esperando. Sincronia tem que ser fixa.** 🎼
