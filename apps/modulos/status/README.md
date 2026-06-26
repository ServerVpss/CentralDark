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

## Atualização pelo chat

Quando uma fase avançar, a IA deve atualizar `painel-data.json` no GitHub. Depois do deploy/sync, a página passa a refletir a nova informação.

## Deploy futuro

Este painel pode ser servido estaticamente pelo Caddy depois, sem PM2:

```txt
Caddy -> CentralDark/apps/projeto-dashboard
```

Não alterar Caddy sem confirmação explícita do usuário.

## Segurança

Este painel não deve conter segredo real, token, senha, cookie, sessão, chave privada, connection string ou `.env` real.

Apenas status público, resumo operacional e progresso do projeto.
