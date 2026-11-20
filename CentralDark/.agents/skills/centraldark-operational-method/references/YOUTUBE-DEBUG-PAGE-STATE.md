# YouTube debug — página viva antes de provar transcript

Status: `OPERATIONAL_REFERENCE`
Owner: `.agents/skills/centraldark-operational-method/SKILL.md`

## Falha observada

Uma rota/teste isolado de transcript pode parecer correta e ainda falhar no cenário real quando depende do estado de uma página do YouTube já aberta.

Metadados observados em material de diagnóstico incluíram campos de `yt/detailpage`, como `cpn` e `el`. Esses valores pertencem ao contexto da página/sessão e não devem ser copiados para documentação, logs ou fixtures como se fossem constantes.

## Regra

```text
TESTE_ISOLADO_PASS
!=
FLUXO_REAL_YOUTUBE_PASS

YOUTUBE_TRANSCRIPT_DEBUG
→ usar o cenário real que o usuário está executando
→ localizar produtor → estado da página → consumidor
→ verificar dependência de metadata/page-state
→ não fixar cpn/el/tokens de contexto
→ corrigir o primeiro ponto causal
→ repetir o mesmo fluxo real
→ só então declarar PASS
```

## Fronteira de segurança

```text
PAGE_METADATA = EVIDENCIA_TRANSITORIA
PAGE_METADATA != CONFIG_CANONICA
SESSION_CONTEXT != DOCUMENTACAO_PUBLICAVEL
TRANSCRIPT_TEXT = PROCESSAVEL_QUANDO_FORNECIDO/OBTIDO_POR_CAPACIDADE_AUTORIZADA
ASSISTENTE_NAO_DECLARA_QUE_VIU_OU_OUVIU_VIDEO_SE_SO_RECEBEU_TEXTO
```

Se o material trouxer identificadores de sessão/contexto, preservar somente a existência e a função do campo necessárias ao diagnóstico; não persistir os valores.

## Critério de reincidência

Se o transcript funcionar em chamada manual mas falhar com a página real aberta, investigar primeiro a ligação com o estado vivo da página antes de criar nova rota, novo provider ou workaround paralelo.
