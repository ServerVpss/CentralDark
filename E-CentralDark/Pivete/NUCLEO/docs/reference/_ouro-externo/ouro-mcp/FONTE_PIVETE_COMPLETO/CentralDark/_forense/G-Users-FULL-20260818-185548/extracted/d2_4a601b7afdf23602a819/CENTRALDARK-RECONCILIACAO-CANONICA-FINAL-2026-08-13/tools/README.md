---
title: Memory Tools — RSI Loop
tags: [tools, memoria, rsi]
---

# Memory Tools

Tools oficiais para o RSI Loop interagir com a memória de longo prazo.

## Arquivo principal

`memory-tools.js`

## Tools disponíveis

| Tool                  | Descrição                                              |
|-----------------------|--------------------------------------------------------|
| `check_fingerprint`   | Verifica se fingerprint já existe (anti-duplicação XP) |
| `read_memory`         | Lê padrões, causas raiz, guardrails, lições, ciclos    |
| `write_memory`        | Escreve nova nota (append-only + frontmatter)          |
| `update_ledger`       | Atualiza ledger local + global + calcula level/tier    |
| `emit_xp_receipt`     | Emite recibo de XP                                     |
| `run_memory_sync`     | Fluxo completo seguro (check → write → ledger → recibo)|

## Exemplo de uso no Executor

```js
const memory = require('./memory-tools');

// 1. Verificar se já registrou
const check = memory.check_fingerprint('sha256:abc123...');

// 2. Ler padrões similares
const padroes = memory.read_memory({
  tipo: 'padroes',
  query: 'falso verde',
  limit: 5
});

// 3. Fluxo completo após um ciclo RSI bem-sucedido
const result = memory.run_memory_sync({
  tipoMemoria: 'causa-raiz',
  titulo: 'Token WuzAPI inválido no header',
  conteudo: '## Contexto\n...\n## Evidência\n...',
  skill: 'cot-react-loop',
  event: 'causa_raiz_provada',
  xp: 10,
  missionId: 'mission-2026-08-13-001',
  causaRaiz: 'header Authorization em vez de Token',
  teste: 'curl com Token correto retornou 200',
  evidencia: 'log 401 + doc oficial WuzAPI',
  headSha: 'abc123'
});
```

## Regras (resumo)

- Sempre gerar fingerprint antes de conceder XP
- Nunca editar arquivos existentes (só criar novos)
- XP nunca fica negativo
- Circuit Breaker: 3 falhas em 10 ciclos → para escrita semântica
