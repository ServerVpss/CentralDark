# No-Messaging Logging — Reference Examples

## Princípio

Durante operação autônoma, NÃO enviar mensagens ao usuário. Registrar em logs only. Comunicação após fixed point ou pedido explícito.

## Exemplos de Registry em Log

### Exemplo 1: Status de PR

```bash
LOG="E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/prs-open-commits-cycle.log"
echo "$(date -u '+%Y-%m-%d %H:%M:%S UTC') | BR: $(TZ=Brazil/East date '+%Y-%m-%d %H:%M:%S') | PR #1360 | estado: MERGED | commits: 23 | autor: segredounlock" >> "$LOG"
```

### Exemplo 2: Heartbeat Periódico

```bash
LOG="E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/heartbeat.log"
echo "$(date -u '+%Y-%m-%d %H:%M:%S UTC') | HEARTBEAT | braço 3 ativo | processo vivo" >> "$LOG"
```

### Exemplo 3: Mudança de Estado

```bash
LOG="E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/mission-state.log"
echo "$(date -u '+%Y-%m-%d %H:%M:%S UTC') | MISSION_STATE | PR #1360 | MERGED | CI: passando" >> "$LOG"
```

### Exemplo 4: Erro com Ação

```bash
LOG="E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/errors.log"
echo "$(date -u '+%Y-%m-%d %H:%M:%S UTC') | ERROR | braço 1 | rota inválida | ação: corrigindo rota/env" >> "$LOG"
```

## Format Sugerido

```
TIMESTAMP_UTC | BR_HORA | CATEGORIA | DETALHE
```

Categorias:
- `PR` — status de PRs
- `HEARTBEAT` — heartbeat periódico
- `MISSION_STATE` — estado da missão
- `ERROR` — erro com ação
- `FIXED_POINT` — fechamento de ponto fixo
- `ARM` — status de braço específico

## Regra

NÃO enviar mensagem durante autonomia. Se quiser comunicar algo, perguntar ao usuário após fixed point ou quando ele retornar.
