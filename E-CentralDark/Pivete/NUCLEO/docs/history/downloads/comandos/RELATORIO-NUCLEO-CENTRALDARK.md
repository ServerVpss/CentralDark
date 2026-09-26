# CENTRALDARK — RELATORIO NUCLEO PRODUCAO

Gerado para organizar o estado atual do centralldark.com.

## 1. Estado geral

Pasta principal operacional:

/root/CentralDark

Estado atual:

- Producao online.
- GitHub e VPS sincronizados.
- PM2 com servicos principais online.
- Caddy ativo nas portas 80 e 443.
- Open WebUI ativo separado na porta 3000.
- Arvore ainda poluida com legado, copias e historico de testes.

## 2. Pastas principais

apps/web — site publico principal.

apps/bot — frontend/painel visual do bot e MultiZap.

apps/bot-server — backend central dos bots e API read-only.

apps/mcp — servidor MCP CentralDark.

apps/install-callback — backend do instalador.

apps/projeto-dashboard — Mega Painel.

apps/api-docs — documentacao publica da API.

apps/bot-telegram — bot Telegram atual.

apps/portal — portal interno planejado.

apps/modulos — modulos futuros e produto MultiZap.

infra/caddy — configuracoes de proxy.

infra/pm2 — configuracoes de processos.

docs — memoria viva, pendencias, relatorios e continuidade.

scripts — deploy, auditoria, instalador e run-once.

revisoes — relatorios e historico operacional.

quarantine — area de isolamento. Nao limpar sem revisar.

## 3. Producao real hoje

Nao apagar:

- apps/web
- apps/bot
- apps/bot-server
- apps/mcp
- apps/install-callback
- apps/projeto-dashboard
- apps/api-docs
- apps/bot-telegram
- infra/caddy
- infra/pm2
- scripts
- docs
- central-horario

## 4. Candidatos a limpeza futura

Nao apagar agora. Primeiro auditar.

- apps/clone-deck
- CentralDark/apps/web dentro de outra pasta CentralDark
- _backups
- arquivos .bak e .save
- logs soltos na raiz
- provas de conceito soltas
- revisoes muito antigas ou duplicadas
- quarantine antiga

Regra: primeiro relatorio, depois dry-run, depois quarentena, e so por ultimo limpeza com confirmacao.

## 5. Servicos PM2 vistos online

- whatsapp-server
- Install-Callback
- MultiZap-Gateway
- monitor_tarefas
- CloneDeck-Supabase-Sync
- MCP-CentralDark
- CentralDark-BotServer
- CentralDark-WebhookDeploy
- CloneDeck-CRM
- MultiZap-BOT

## 6. Portas importantes

80 e 443 — Caddy publico.

3000 — Open WebUI.

3100 — MultiZap-Gateway.

9100 — MCP CentralDark.

9200 — Install-Callback.

9210 — CentralDark-BotServer.

9300 — CentralDark-WebhookDeploy.

9000 — webhook antigo.

3010 e 8081 — precisam de mapa final.

## 7. Caddy e dominios

Caddy esta ativo.

Arquivos versionados importantes:

- infra/caddy/root-centraldark.Caddyfile
- infra/caddy/bot.Caddyfile
- infra/caddy/install.Caddyfile
- infra/caddy/mcp.Caddyfile
- infra/caddy/status-centraldark.Caddyfile
- infra/caddy/gateway-centraldark.Caddyfile
- infra/caddy/deploy-centraldark.Caddyfile
- infra/caddy/www-multizap.Caddyfile

Caddy e sensivel. Nao alterar no lote de limpeza sem confirmacao.

## 8. Memoria viva

Fontes principais:

- docs/CONSCIENCIA/CONSCIENCIA.md
- docs/CONSCIENCIA/APRENDIZADOS.md
- docs/CONTINUIDADE/proxima-ia.md
- docs/PENDENCIAS.md
- docs/RELATORIOS
- docs/MEGA-PAINEL-STATUS.md
- ABRIR-CONTEXTO-MCP.md

A memoria esta rica, mas espalhada. O padrao deve continuar sendo docs/CONSCIENCIA, docs/PENDENCIAS, docs/RELATORIOS e Mega Painel.

## 9. Front-end

Frentes visuais principais:

apps/web — site publico.

apps/bot — painel do bot/MultiZap.

apps/projeto-dashboard — Mega Painel.

apps/api-docs — docs da API.

Open WebUI — painel de chat com IA no navegador.

O que falta:

- Consolidar fonte unica do frontend.
- Eliminar duplicacoes antigas.
- Confirmar qual build cada dominio serve.
- Conectar melhor os modulos.
- Refinar visual final de plataforma.

## 10. Problemas reais

1. GitHub Actions com falhas recentes.
2. Algumas tools de PM2 ainda mostram status incompleto.
3. Arvore com legado e duplicacao.
4. Portas e dominios precisam de mapa final.
5. Frontend precisa consolidacao.

## 11. Ordem correta agora

1. Criar mapa oficial de dominios, portas e servicos.
2. Confirmar qual pasta cada dominio serve.
3. Marcar apps oficiais.
4. Marcar legados.
5. Gerar plano de quarentena.
6. So depois limpar.
7. Refinar interface principal.
8. Transformar o CentralDark em plataforma com modulos.

## 12. Veredito

O CentralDark nao esta vazio e nao esta quebrado.

Ele esta em fase de plataforma real, com base funcionando e muita sujeira acumulada de construcao rapida.

A estrategia certa:

- Nao reconstruir.
- Nao trocar tudo.
- Nao apagar no impulso.
- Refinar o que ja esta no ar.
- Usar VSCode com agente para acelerar.
- Limpar a casa com auditoria controlada.

## 13. Caminho deste relatorio

/root/CentralDark/revisoes/20260615-relatorio-nucleo-centraldark/RELATORIO-NUCLEO-CENTRALDARK.md
