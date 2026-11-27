# Relatorio Builder Bolt - P2

Data: 2026-06-16
Status: preparado no repositorio; ativacao real depende de validacao local e confirmacao humana explicita.

## Objetivo

Registrar a etapa P2 do Builder Bolt para manter rastreabilidade entre o PR, o instalador, o validador estatico e o deploy futuro na VPS.

## Alvo planejado

- App: apps/builder-bolt
- Container: centraldark-builder-bolt
- Porta local: 127.0.0.1:5174
- Porta interna: 5173
- Dominio planejado: builder.centralldark.com
- Snippet isolado: infra/caddy/builder.centralldark.com.Caddyfile

## Arquivos principais

- apps/builder-bolt/README.md
- apps/builder-bolt/PLANO.md
- apps/builder-bolt/docker-compose.yml
- apps/builder-bolt/.env.example
- scripts/deploy/install-builder-bolt.sh
- scripts/validate/builder-bolt-static-checks.sh
- infra/caddy/builder.centralldark.com.Caddyfile

## Hardening P2 registrado

- O instalador exige confirmacao operacional por CD_CONFIRM_BUILDER_BOLT=1.
- O bind planejado permanece local em 127.0.0.1:5174.
- A porta 3000 permanece bloqueada para proteger o servico ja existente.
- Falhas de config, build ou subida do servico devem gerar relatorio.
- Reexecucao e permitida somente quando a porta local pertence ao container alvo centraldark-builder-bolt.
- O snippet planejado inclui isolamento COOP e COEP.
- Aplicacao real de infraestrutura continua dependendo de confirmacao humana explicita.

## Validacao esperada

Antes de qualquer ativacao real na VPS:

```bash
bash scripts/validate/builder-bolt-static-checks.sh
bash -n scripts/deploy/install-builder-bolt.sh
```

Depois das validacoes passarem, a ativacao real so deve acontecer com confirmacao humana explicita.

## Observacao

Este relatorio fecha a lacuna documental exigida pelo validador estatico. Ele nao autoriza ativacao real, alteracao de infraestrutura ou exposicao publica.