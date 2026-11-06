# Receipt — Sentinel de erro de página do Cockpit

```text
INTENT=INVESTIGAR_SENTINEL_E_CRISTALIZAR_RECEITA_OPERACIONAL
OWNER=K:\.agents\skills\centraldark-operational-method\SKILL.md
SENTINEL_OWNER=K:\apps\instinto-superior\public\centraldark-erros-visiveis.js
INJECTOR=K:\apps\instinto-superior\src\routes\__root.tsx
SURFACE=http://127.0.0.1:8080/sala-controle
MEASURED_AT=2026-10-30 America/Sao_Paulo
SOURCE=source_readback
LIVE_UI_READBACK=UNKNOWN
TRANSPORT=UNKNOWN
STATUS=PASS_BOUNDED_RECIPE_ADDED_LIVE_SENTINEL_NOT_READ
NEXT_CURSOR=SENTINEL_LIVE_MESSAGE_READBACK_AND_ERROR_CORRELATION
```

## CURRENT

- Existe um único Sentinel no owner do Instinto Superior.
- O script captura erro de código, promessa rejeitada, `console.error`, recurso não carregado, fetch e XHR com falha.
- A entrada preserva resumo humano, mensagem técnica, origem, stack sanitizada, horário, quantidade e botão relacionado.
- O controle usa `data-cd-flow`, `evento_id` e o evento local `centraldark:sentinela` para correlação.
- O script remove query/fragmento e redige `Bearer`, `password`, `token`, `secret` e `api_key`.
- `cfg.coracao` não é uma prova de transporte. Sem endpoint same-origin autenticado e configurado, o transporte fica `UNKNOWN`.

## PROVA DE CÓDIGO

- `registrar()` cria a entrada real e deduplica ocorrências.
- `relato()` compõe a mensagem com página, horário, classificação, mensagem técnica, origem, controle, stack e intenção.
- `Copiar pro Instinto` usa o relato existente.
- O Sentinel não guarda os eventos em disco.

## LIMITAÇÃO DESTA RODADA

A leitura direta do Sentinel aberto no Edge não foi concluída porque o controle de segurança do navegador não confirmou a URL atual com confiança suficiente. Portanto, não foi inventada uma mensagem de erro, stack ou horário da tela. A capacidade do owner foi confirmada por leitura do código e documentação; a mensagem viva da página continua `UNKNOWN` até novo readback da UI.

## DELTA

- Atualizada a Skill-Mãe com a receita de leitura, correlação, sanitização, veredito e receipt.
- Nenhum Sentinel, backend, endpoint, token, serviço ou agente adicional foi criado.
- Nenhum deploy foi executado.

## CONTRAPROVA

- A fonte primária do runtime continua sendo o Sentinel existente.
- `CLICK_SEEN` foi definido como observação de clique, não como prova de execução.
- `HTTP_ACK` foi definido como ACK de transporte, não como prova de efeito.
- Entrada incompleta ou sem fonte primária permanece `UNKNOWN`.

## ROLLBACK

Remover somente o bloco `CENTRALDARK_PAGE_ERROR_SENTINEL_RECIPE_20261030` da Skill-Mãe e este receipt. Não reverter arquivos locais sujos de outros escopos.

