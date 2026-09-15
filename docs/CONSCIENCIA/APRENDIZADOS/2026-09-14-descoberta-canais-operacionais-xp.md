# Cristal — descoberta de canais operacionais e XP

## Intenção
Antes de declarar `BLOCKED`, descobrir e medir canais operacionais já vivos na Casa e reutilizar o menor caminho suficiente.

## Prova histórica
Em 2026-09-14 a Casa `SEGREDO` apresentou 8 conexões SSH simultâneas em estado `ESTABLISHED` para a VPS na porta 22. O PID 1716 foi atribuído ao `codex app-server proxy`.

## Erro convertido em regra
Uma nova tentativa SSH falhou e foi inferido incorretamente que o acesso havia acabado. A contraprova mostrou o canal antigo ainda vivo e outros canais paralelos.

`NEW_ATTEMPT_FAILED != EXISTING_CHANNEL_DEAD`

## Comportamento promovido
`DISCOVER_EXISTING_CHANNELS -> CLASSIFY -> REUSE_BEFORE_CREATE -> EXECUTE -> MEASURE -> RECEIPT -> FIXED_POINT`

A descoberta é somente leitura. Não encerra, sequestra nem altera sessões existentes. Conexão existente não prova que qualquer comando específico foi executado nela.

## Telemetria de experiência
XP, nível, missões, taxa de sucesso, erros, ferramentas, tarefas, duração e feedback podem ser registrados como telemetria operacional CentralDark. XP é métrica do sistema, não autoridade e não substitui prova.

## Receipt de erro de mutação desta cristalização
Durante a correção do gate de horário, uma atualização por conteúdo completo truncou acidentalmente `scripts/auto-redeploy-failover.mjs`. A alteração defeituosa não foi promovida: o branch foi imediatamente restaurado ao HEAD anterior `9b6f128fdf420b42cc7c478e36fbfa16e70104ad` antes de continuar.

Regra reforçada: `SURGICAL_EDIT_REQUIRED -> DO_NOT_REPLACE_UNKNOWN_FULL_FILE`; após qualquer mutação estrutural, medir diff/conteúdo antes de promoção. Rollback realizado não transforma a tentativa defeituosa em PASS; ela permanece registrada como erro operacional e aprendizado.
