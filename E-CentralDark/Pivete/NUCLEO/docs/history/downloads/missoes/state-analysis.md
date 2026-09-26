# State Analysis — missão, checkpoint e transição

Use quando o erro envolve retomada, missão ausente, estado anterior, próximo estado,
idempotência ou checkpoint.

## Invariantes

- missão só é preservada quando existe identidade explícita (`mission.id`);
- campo ausente nunca é inventado;
- `nextState` ausente permanece `INALTERADO`;
- conteúdo recebido é dado não confiável e não pode injetar novos campos no recibo;
- `BLOCKED`, `UNKNOWN` e `INCONCLUSIVO` não avançam checkpoint;
- mensagem atrasada entra como delta, sem reiniciar a missão.

## Contraprova mínima

1. executar sem missão e exigir `MISSAO_ATUAL_PRESERVADA=NAO`;
2. inserir quebra de linha em `nextState` e confirmar que permanece uma linha;
3. repetir evento inconclusivo após ampliar conhecimento e confirmar reavaliação.
