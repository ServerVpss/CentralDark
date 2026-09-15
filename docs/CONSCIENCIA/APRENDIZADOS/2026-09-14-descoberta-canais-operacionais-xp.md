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
