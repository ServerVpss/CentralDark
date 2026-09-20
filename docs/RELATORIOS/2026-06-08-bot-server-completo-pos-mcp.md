# BOT Server — validação após ajuste MCP

## Data

2026-06-08

## Objetivo

Validar a estrutura do `apps/bot-server` após ajuste da política MCP e criação dos diretórios restantes.

## Resultado

O esqueleto do `apps/bot-server` foi completado e versionado no caminho operacional do repo:

```txt
CentralDark/apps/bot-server
```

O deploy `#FASE deploy` aplicou o commit mais recente na VPS e retornou sucesso.

## Estrutura geral validada

```txt
apps/bot-server/
├── README.md
├── package.json
├── scripts/run-once/
├── src/index.ts
├── src/api/
├── src/config/
├── src/gateways/
├── src/gateways/telegram/
├── src/services/
├── src/shared/
├── src/webhooks/
├── src/workers/
└── tests/
```

## Gateway principal

O gateway principal de mensagens também foi confirmado no GitHub main em:

```txt
CentralDark/apps/bot-server/src/gateways/whatsapp/README.md
```

Observação: a ferramenta de árvore ainda bloqueia inspeção direta desse path específico por proteção própria. O arquivo existe no GitHub main e o deploy está sincronizado.

## Política MCP

Após build/restart do MCP, a política pública em runtime foi atualizada para permitir esqueleto seguro e manter bloqueio de risco real.

## Não alterado

- Nenhum processo novo foi ligado.
- Caddy não foi alterado.
- CRM não foi alterado.
- Banco real não foi consultado ou alterado.
- Produção existente não foi movida.

## Próximo passo

Mapear os services/endpoints internos do `bot-server` antes de qualquer processo novo.
