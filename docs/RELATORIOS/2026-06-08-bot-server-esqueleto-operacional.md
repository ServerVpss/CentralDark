# BOT Server — esqueleto operacional validado

## Data

2026-06-08

## Objetivo

Criar e validar o esqueleto inicial de `apps/bot-server` no caminho operacional correto do projeto.

## Resultado

O caminho operacional foi validado em:

```txt
/root/CentralDark/apps/bot-server
```

No repo, o caminho correspondente é:

```txt
CentralDark/apps/bot-server
```

## Estrutura validada

```txt
apps/bot-server/
├── README.md
├── package.json
└── src/
    ├── index.ts
    ├── api/
    │   └── .gitkeep
    ├── config/
    │   └── .gitkeep
    └── gateways/
        ├── .gitkeep
        └── telegram/
            └── .gitkeep
```

## Confirmações

- GitHub `main` sincronizado com VPS.
- Workflow `#FASE deploy` concluiu com sucesso.
- `apps/bot-server` existe no caminho operacional.
- O esqueleto ainda não está ligado em PM2.
- Nenhum serviço novo foi iniciado.
- Nenhum serviço foi reiniciado.
- O frontend `apps/bot` continua separado.

## Bloqueios encontrados

Alguns paths planejados foram bloqueados pela camada de segurança da ferramenta durante criação direta, mesmo sendo esqueleto vazio.

Por isso ainda faltam criar, em etapa própria e controlada:

```txt
src/services/
src/shared/
src/webhooks/
src/workers/
src/gateways/whatsapp/
scripts/run-once/
tests/
```

## Não alterado

- CRM.
- Caddy.
- PM2.
- Docker/WuzAPI.
- Banco real.
- WhatsApp, QR ou sessões.
- Produção existente.

## Próximo passo

Criar os diretórios restantes por método seguro e registrar relatório complementar.

Depois disso, mapear os services/endpoints internos do `bot-server` antes de qualquer processo PM2.
