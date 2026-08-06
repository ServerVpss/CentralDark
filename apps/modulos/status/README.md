# Painel do Projeto CentralDark

Painel estático para acompanhar a evolução do CentralDark / MultiZap de forma visual, simples e em tempo quase real.

## Objetivo

Mostrar para o usuário, em uma página única:

- estado geral do projeto;
- progresso por área;
- papel de cada IA/ferramenta;
- status público do MCP e serviços relacionados;
- próximos passos;
- pendências principais;
- histórico visual do que já foi concluído.

## Como funciona

Arquivos principais:

- `index.html` — estrutura da página.
- `styles.css` — tema visual Netflix/CentralDark.
- `app.js` — lógica de carregamento, cards, progresso e polling.
- `painel-data.json` — dados editáveis do painel.

O painel carrega `painel-data.json` localmente e tenta consultar endpoints públicos como:

- `https://mcp.centralldark.com/health`
- `https://mcp.centralldark.com/status.json`
- `https://install.centralldark.com/status.json`

Se algum endpoint falhar, o painel continua funcionando com os dados locais.

## Cápsula Observável

A rota `capsula.html` estende o mesmo Mega Painel para acompanhar o ciclo de mutação e aprendizado do Hermes sem criar outro painel ou outra fonte de verdade.

Arquivos:

- `capsula.html` — visualização read-only da cápsula;
- `capsula-data.json` — snapshot derivado, nunca fonte primária;
- `capsula-event.schema.json` — contrato de cada evento;
- `capsula-observavel.mjs` — valida, agrega, grava ledger local de forma atômica e gera o snapshot;
- `capsula-observavel.test.mjs` — testes discriminativos contra falso verde;
- `.github/workflows/capsula-observavel.yml` — prova o contrato no GitHub Actions.

Fluxo operacional:

```text
Hermes/Writer emite evento JSON sanitizado
→ evento entra num ledger JSONL fora da main
→ capsula-observavel.mjs valida e agrega
→ capsula-data.json é gerado
→ capsula.html mostra numerador, denominador, candidato e evidência
```

Exemplo local, sem produção:

```bash
node apps/modulos/status/capsula-observavel.mjs \
  --ledger /caminho/operacional/capsula-events.jsonl \
  --append-event /caminho/temporario/evento.json \
  --output apps/modulos/status/capsula-data.json
```

Regras:

- sem eventos: `BLOCKED/NO_EVENTS`;
- sem denominador: percentual `null`, nunca `0%` inventado;
- teste pulado não conta como PASS;
- Writer não pode ser o Judge do PASS final;
- identidade do candidato não muda dentro do mesmo `run_id`;
- o snapshot nunca autoriza produção, merge, deploy ou restart;
- telemetria viva deve usar artifact, storage operacional ou ledger local; não fazer push repetitivo na `main`.

## Atualização pelo chat

Quando uma fase avançar, a IA deve atualizar `painel-data.json` no GitHub. Depois do deploy/sync, a página passa a refletir a nova informação.

## Deploy futuro

Este painel pode ser servido estaticamente pelo Caddy depois, sem PM2:

```txt
Caddy -> CentralDark/apps/modulos/status
```

Não alterar Caddy sem confirmação explícita do usuário.

## Segurança

Este painel não deve conter segredo real, token, senha, cookie, sessão, chave privada, connection string ou `.env` real.

Apenas status público, resumo operacional e progresso do projeto.
