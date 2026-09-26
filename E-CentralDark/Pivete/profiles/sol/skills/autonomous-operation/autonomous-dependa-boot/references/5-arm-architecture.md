# 5-Braço Architecture — Autonomous Operation

## Descrição

Os 5 braços de operação autônoma descritos no paste #1 (2026-08-28):

```
BRAÇO 1: Omni/Hermes
→ verifica processo/configuração
→ corrige rota/env
→ mantém motor vivo

BRAÇO 2: PR / commits
→ observa mudanças
→ compara estado
→ só reage se houver delta

BRAÇO 3: telemetria/heartbeat
→ grava loop periódico
→ confirma que o processo continua vivo

BRAÇO 4: autonomia temporal
→ mantém intenção até horário limite
→ espera evento / mudança

BRAÇO 5: revisão/contraprova
→ lê estado produzido pelos outros
→ tenta pegar inconsistência
```

## Convergência via Estado Compartilhado

Os braços não conversam diretamente. Convergem via:

| Estado | Exemplo | Acesso |
|--------|---------|--------|
| Git | commits, branches, HEAD, PRs | gh CLI, git commands |
| Filesystem | logs, receipts, arquivos de estado | leitura/escrita em pasta compartilhada |
| Logs | heartbeats, 상태 registros | escrita em arquivo de log |
| Mission state | objetivo, prazo, progresso | arquivo JSON/YAML |

Exemplo de convergência:

```
AGENTE A altera Git
        ↓
AGENTE B detecta commit
        ↓
AGENTE C vê novo estado/runtime
        ↓
AGENTE D encontra divergência
        ↓
todos acabam convergindo
para a mesma realidade observável
```

## Observação

NÃO criar mecanismo de comunicação entre braços. Use o que já existe. A convergência happen via estado observável, não via mensagens.

Fonte: `paste_1_131820.txt` (2026-08-28)
