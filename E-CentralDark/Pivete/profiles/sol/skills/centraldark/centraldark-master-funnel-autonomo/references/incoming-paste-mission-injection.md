# Incoming Paste como Injeção de Missão

## Padrão

Quando o usuário solta um paste grande (centenas de linhas) no meio da sessão definindo nova missão, requisitos canônicos ou direção arquitetural:

1. **Tratar o paste como missão descobrível** — ler completo antes de continuar o thread atual
2. **Extrair a intenção** — o que o usuário quer que o sistema se torne/faça?
3. **Iniciar RECOVER_STATE + DISCOVER_EXISTING_TRACE** — o paste pode definir requisitos canônicos novos
4. **Não tratar o paste como ruído de chat** — pode ser a forma do usuário de injetar nova direção de missão
5. **Se o paste define requisitos canônicos que ainda não existem** — isso é lacuna a preencher, não chat para acknowledge

## Sinais

- Paste > 100 linhas solto no meio da sessão
- Paste define arquitetura, requisitos canônicos ou direção de missão
- Paste usa linguagem canônica (`!CENTRALDARK`, `#ACORDAR`, `trace_id`, `mission_id`, envelope YAML, etc.)

## Resposta

- Ler o paste completo antes de continuar
- Extrair a missão/intenção
- Iniciar descoberta contra a nova intenção
- Não levar a narrativa teatral se o usuário estiver contando história — focar na diretriz material

## O que NÃO fazer

- Acknowledge e continuar o thread antigo sem ler
- Tratar como "apenas mais um paste" e ignorar
- Ficar redesenhando a narrativa do usuário em resposta
- Presumir que é solução já implementada — é especificação, não prova

## Exemplo desta sessão

O CHEFE soltou paste #4 (723 linhas) definindo missão canônica de rastreamento causal/observabilidade. O funnel:

1. Liu completo (offset por offset até o final)
2. Descobriu que `trace_id/mission_id/span_id/correlation_id` = 0 hits no repo → lacuna material real
3. Descobriu que 0 arquivos de observabilidade/trace/monitor em scripts/hermes/skills
4. Iniciou RECOVER_STATE + DISCOVER_EXISTING_TRACE
5. Parou em fronteira real (recursos do sistema indisponíveis para fork) — não inventou execução

O envelope YAML do paste descreve propriedades semânticas sem implementação material. Isso é a lacuna que o CHEFE quer que o sistema descubra e melhore in place.
