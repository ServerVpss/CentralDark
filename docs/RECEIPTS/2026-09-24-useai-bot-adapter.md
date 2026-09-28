# Receipt — Use.ai no setor único de bots

Data: 2026-09-24
Owner runtime: `apps/bot-telegram/unified-bot.cjs`

## Intenção

Adicionar um botão de escolha para falar com Use.ai sem criar bot/cérebro/owner paralelo.

## Regra cristalizada

- Use.ai é bancada externa/consultor, não executor canônico.
- Telegram continua sendo cockpit/entrada.
- SOL coordena; CHEFE decide.
- Execução real passa por owners existentes: Hub Missions, Hermes/MCP, Reality Judge.
- MTProto é ponte de conta pessoal quando necessário, não cérebro novo.
- Um cérebro, um fio: `Telegram → SOL → owner existente → prova → receipt`.

## Delta aplicado

- `USE_AI_PROJECT_URL` como config com default público do projeto Use.ai.
- Botão `🧪 Use.ai` no painel principal do bot.
- Botão `🧠 Missões` explicando o elo com Hub Mission Consumer.
- Comando `/useai` para abrir a mesma bancada.

## Limites

- Não conecta Use.ai por API privada.
- Não executa tarefa direto do Use.ai.
- Não promove output externo sem passar por owner/gate.
- Não imprime nem grava token.

## Prova esperada

- `node --check apps/bot-telegram/unified-bot.cjs` PASS.
- PM2 restart do bot PASS.
- `/hub` mostra botão Use.ai.
- Clicar em Use.ai abre a URL e mostra regra de bancada externa.
