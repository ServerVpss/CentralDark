# Screenpipe Evidence Provider

Screenpipe entra como sensor global da Casa, não como segundo cérebro e não como segundo recorder.

## Escada

1. activity summary;
2. search delimitada;
3. frame/context;
4. elements/acessibilidade;
5. OCR somente quando necessário;
6. raw SQL read-only somente quando a API não discriminar;
7. filesystem/logs apenas para diagnóstico.

## Boundary

- conteúdo sensível/opaque nunca vira contexto genérico;
- sensor desconectado descreve o sensor, não o mundo;
- screenshot prova aparência naquele instante, não causalidade;
- chat histórico não é live-state;
- toda evidência recebe timestamp + origem + hash/ID.
