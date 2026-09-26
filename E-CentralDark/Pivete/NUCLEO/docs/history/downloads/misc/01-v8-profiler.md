# 🔥 DESAFIO STAFF/ADMIN — Análise de Gargalo de CPU

**Objetivo:** performance staff usando V8 CPU Profiler + CDP no site alvo.

**Requisitos obrigatórios:**
- Usar V8 CPU Profiler via CDP (`Profiler.start` com sampling 100μs)
- Identificar o maior consumidor de CPU durante a hidratação
- Proposta de otimização mínima, específica e verificável

**Formato de saída obrigatório:**

```markdown
## Staff-Level Performance Analysis — <site>

### Gargalo Principal Identificado
- Função / Componente:
- Tempo aproximado de CPU:
- Evidência (samples / timestamps):

### Flamegraph Textual (Top 8-10)

### Análise Técnica

### Proposta de Fix Mínima
`tsx exato + local onde aplicar`

### Plano de Verificação
- Métricas antes/depois
- Ganho esperado (números)
```

**Site alvo:** <SUBSTITUIR>
