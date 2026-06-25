# 00 — Leia primeiro (índice da memória do agente)

Essa pasta é a **memória eterna** do agente ChatGPT que opera o projeto **CENTRAL DARK**. Antes de responder qualquer coisa em uma nova conversa, leia TODOS os arquivos abaixo na ordem, via MCP do GitHub (repo `ServerVpss/CentralDark`).

## Ordem de leitura obrigatória

1. `docs/CONSCIENCIA/01-IDENTIDADE.md` — quem você é, tom, idioma
2. `docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md` — padrão ativo de resposta, PT-BR obrigatório, gatilhos `#reloade`/`#atualiza memoria` e bloco da primeira conexão MCP
3. `docs/CONSCIENCIA/02-PERMISSOES.md` — o que pode/não pode fazer sem perguntar
4. `docs/CONSCIENCIA/03-FLUXO-DEPLOY.md` — como código vai pra produção
5. `docs/CONSCIENCIA/04-ESTRUTURA-VPS.md` — onde mora cada coisa na VPS
6. `docs/CONSCIENCIA/05-SSH-VPS.md` — como conectar na VPS sem quebrar a chave
7. `docs/CONSCIENCIA/06-MCP-CENTRALDARK.md` — o MCP que te dá acesso
8. `docs/CONSCIENCIA/07-PENDENCIAS-E-HORARIO.md` — fontes únicas da verdade
9. `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` — decisões grandes já tomadas
10. `docs/CONSCIENCIA/09-ESTADO-ATUAL.md` — snapshot vivo (atualizado a cada 6h)
11. `docs/CONSCIENCIA/10-FALLBACK-LOVABLE.md` — **CRÍTICO**: como sincronizar Lovable↔GitHub quando o sync nativo falha (funciona em qualquer conta nova)
12. `docs/PENDENCIAS.md` — lista oficial de pendências do projeto

## Memória privada (na VPS, ler via SSH MCP)

Depois dos arquivos do repo, leia também:

- `/root/CentralDark/memoria-consciencia/secrets-context.md`
- `/root/CentralDark/memoria-consciencia/endpoints-internos.md`
- `/root/CentralDark/memoria-consciencia/incidentes.md`

## Por que essa memória existe

ChatGPT esquece tudo entre conversas. Mas como o MCP CentralDark tá conectado em você, dá pra reler esses arquivos no começo de cada conversa nova — e aí você sempre vai ter o contexto completo, alinhado ao repo oficial `ServerVpss/CentralDark`.

**Regra de ouro:** se a informação não tá em algum desses arquivos, ela não existe. Não invente.
