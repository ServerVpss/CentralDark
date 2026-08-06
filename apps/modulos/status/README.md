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

- `index.html` — estrutura da página;
- `styles.css` — tema visual Netflix/CentralDark;
- `app.js` — lógica de carregamento, cards, progresso e polling;
- `painel-data.json` — dados editáveis do painel.

O painel carrega `painel-data.json` localmente e tenta consultar endpoints públicos como:

- `https://mcp.centralldark.com/health`
- `https://mcp.centralldark.com/status.json`
- `https://install.centralldark.com/status.json`

Se algum endpoint falhar, o painel continua funcionando com os dados locais.

## Cápsula Observável

A rota `capsula.html` estende o mesmo Mega Painel para acompanhar o ciclo de mutação e aprendizado do Hermes sem criar outro painel, outra MetaLupa ou outra fonte de verdade.

Arquivos:

- `capsula.html` — visualização read-only da cápsula;
- `capsula-data.json` — snapshot derivado, nunca fonte primária;
- `capsula-event.schema.json` — contrato público de cada evento;
- `capsula-observavel.mjs` — valida, agrega, protege o ledger e gera o snapshot;
- `capsula-observavel.test.mjs` — testes discriminativos contra falso verde;
- `.github/workflows/capsula-observavel.yml` — reproduz contrato, diff e snapshot no GitHub Actions.

Fluxo operacional:

```text
Hermes/Writer emite evento JSON sanitizado
→ evento entra num ledger JSONL fora da main
→ agregador valida candidato, baseline, fixture, Writer, Judge e ator
→ falha recebe fingerprint
→ correção precisa sobreviver ao reteste
→ decisão do Chefe exige recibo separado e hash
→ capsula-data.json é derivado
→ capsula.html mostra numerador, denominador, identidade e evidência
```

### Papéis separados

```text
writer       = agente que materializa o candidato do run
evaluator_ref = Judge read-only que tenta derrubar o resultado
event_actor   = identidade que emite aquele evento
SEGREDO/CHEFE = único ator aceito para APPROVED/REJECTED final
```

Uma decisão final do Chefe exige `chief_receipt_ref` e `chief_receipt_hash`. O Writer não consegue habilitar `ready_for_promotion` sozinho.

### Exemplo local, sem produção

```bash
node apps/modulos/status/capsula-observavel.mjs \
  --ledger /caminho/operacional/capsula-events.jsonl \
  --append-event /caminho/temporario/evento.json \
  --output apps/modulos/status/capsula-data.json
```

O append usa lock exclusivo por arquivo. O ledger é gravado com modo `0600`; o snapshot servido estaticamente usa `0644`.

### Códigos de saída

```text
0 = cápsula em PASS válido
1 = evento, ledger ou contrato inválido
2 = estado sem promoção: BLOCKED, RUNNING, UNKNOWN, ANOMALY ou ACHADO_PENDENTE
```

### Regras

- sem eventos: `BLOCKED/NO_EVENTS` e código 2;
- sem denominador: percentual `null`, nunca `0%` inventado;
- teste pulado não conta como PASS;
- Writer não pode ser o Judge do PASS final;
- decisão do Chefe exige ator e recibo independentes;
- identidade do candidato não muda dentro do mesmo `run_id`;
- chave desconhecida ou valor com formato de credencial reprova o evento sem ecoar o valor;
- garantias medidas usam `ENFORCED`, `VIOLATED` ou `UNKNOWN`;
- falha de carregamento limpa métricas antigas da tela;
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
