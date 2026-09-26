# COMANDO - 20260607-0038-proposta-simples-estrutura-multizap.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\docs\tarefas\resultados\20260607-0038-proposta-simples-estrutura-multizap.md
**SHA:** 129f4bcc86661750
**Timestamp:** 2026-08-26T19:31:58.907884
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- risco: baixo

### Ouro Bruto (primeiros 5000 chars)
```
---
id: 20260607-0038-proposta-simples-estrutura-multizap
executor: grok
status: recebido
finalizado_em: 2026-06-07 00:58:39
---

# Resultado

**============================================================**
**[GROK] PROPOSTA SIMPLES DE ESTRUTURA FINALIZADA**
**============================================================**
**Status:** Concluído
**Resumo executivo:**
Revisei a estrutura atual em `/root/Multizap` (14 pastas diretas + subárvores), `/root/CentralDark` (fonte oficial do repo https://github.com/ServerVpss/CentralDark), duplicações em `/root/apps`, `/root/clone-deck-webhook`, `/root/Multizap/apps/clone-deck` (espelho histórico completo), loose files em `/root` (conexao-ia, central-horario, scripts, docs, guarda etc.) e os documentos de auditoria anterior (ORGANIZACAO_VPS.md, structure.md, 04-ESTRUTURA-VPS.md, 04-estrutura-pastas.md, MAPA_LEIGO etc.).
A árvore anterior (CentralDark com `apps/modulos/multizap`, `apps/portal`, `apps/mcp` + Multizap com `api/`, `apps/clone-deck` + subníveis) foi rejeitada por aninhamento excessivo.
Proposta nova: **máx. 3 níveis**, 6 categorias claras exigidas, fácil para leigo, root VPS continua `/root/Multizap`, clone-deck tratado só como alias/espelho/histórico (sem apagar nem renomear), CentralDark/MCP/gateway/CRM/bots/tarefas/ia mapeados explicitamente. Apenas análise (0 writes, 0 moves, 0 restarts, 0 touch em serviços reais).
**Árvore simples sugerida:**
```
/root/Multizap/
├── apps/                 # o que o cliente usa (UIs)
│   ├── web/
│   ├── portal/
│   ├── crm/
│   └── bot/              # UI chat (bot.multizap.dev)
├── bots/                 # automação e canais
│   ├── wuzapi/           # motor WhatsApp (preservar volume/docker)
│   ├── gateway/          # bridge webhook + envio (atual gateway/ + api/gateway + webhooks)
│   ├── telegram/         # bot-telegram
│   └── qr/               # qrcode temporário (antigo api/whatsapp/qrcode)
├── ia/                   # IA, tarefas, consciência, comunicação entre IAs
│   ├── consciencia/      # atual (memoria/ + analises/ + ia/)
│   ├── notificacoes/     # central-notificacoes (eventos/filas/telegram/logs)
│   ├── mcp/              # CentralDark MCP (tools/IA-comm)
│   └── tarefas/          # ia-tarefas + central-horario + conexao-ia (quando migrar)
├── docs/
│   └── tarefas/          # abertas/ em_andamento/ concluidas/ logs/ (atual docs/tarefas)
├── scripts/
│   ├── deploy/
│   ├── installer/
│   ├── monitor/
│   ├── run-once/
│   └── deploy-hooks/     # atual deploy-hooks/ (github/ post-deploy/ rollback/)
├── logs/
├── backups/              # diarios/ semanais/ manuais/
├── revisoes/             # 40k+ itens — NUNCA mexer
├── secrets/              # + credenciais/ (migrar gradualmente)
├── guarda/               # auth/ incidentes/ scans/ status/ (operacional)
└── quarantine/           # isolamento (manter)
```
**CentralDark (projeto / fonte da verdade) — espelho simples (sem modulos/ profundo):**
```
CentralDark/
├── apps/                 # fontes das UIs cliente (web/portal/crm/bot)
├── bots/                 # fontes gateway + telegram + configs wuzapi
├── ia/                   # mcp/ + tarefas/ + skills/
├── docs/
├── scripts/              # installer/ deploy/ monitor/ run-once/
├── infra/                # caddy/ pm2/ docker/ cloudflare/ (exceção justificada, 2 níveis)
├── security/
├── {logs,backups,revisoes,secrets,quarantine}.example/
└── README.md + PLANO.md atualizados
```
clone-deck: só em docs como “alias legado / espelho operacional do produto (antigo nome do multizap)”. Caminhos antigos como `/root/Multizap/apps/clone-deck` e `/root/clone-deck-webhook` permanecem referenciados como histórico.
**Onde fica cada coisa:**
- CRM + web + portal + bot (UI cliente): `apps/`
- gateway + wuzapi + bot-telegram + webhooks/qr: `bots/`
- CentralDark/MCP + consciencia + central-notificacoes + tarefas IAs + aprendizados/memoria + conexao-ia: `ia/`
- scripts + deploy-hooks + run-once: `scripts/`
- logs/revisoes/backups/secrets/guarda/quarantine/credenciais: ficam como categorias de operação (top-level ou sub)
- clone-deck: `/root/Multizap/apps/clone-deck` (espelho/histórico) + `/root/clone-deck-webhook` (alias) + menção em docs/README
**O que preservar sem mexer agora (regras de segurança seguidas):**
- wuzapi/ (docker/volume)
- gateway/ atual rodando + server.js + data/connections.json
- apps/crm/, portal/, web/, bot/ (UIs em produção)
- secrets/ (qualquer .env), credenciais/
- toda /revisoes/ (histórico completo)
- Caddy, Docker, PM2, WuzAPI, WhatsApp sessions, CRM real, banco, domínio
- /root/clone-deck-webhook, /root/apps (duplicados), loose top-level /root/ (conexao-ia etc.)
- /root/CentralDark como está (fonte)
- nada em /root/Multizap/api (redirecionar conceitualmente depois)
- 0 git add, 0 commit, 0 restart, 0 alteracao de serviço
**O que migrar primeiro (só depois de aprovação + por revisao controlada):**
1. Documentação solta de /root/docs e /root/CentralDark/docs → /root/Multizap/docs/
2. Scripts soltos (/
```

---

# COMANDO - 20260607-0038-proposta-simples-estrutura-multizap.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\tarefas\concluidas\20260607-0038-proposta-simples-estrutura-multizap.md
**SHA:** 30808c696f5a93fc
**Timestamp:** 2026-08-26T19:32:49.462009
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- risco: baixo

### Ouro Bruto (primeiros 5000 chars)
```
---
id: 20260607-0038-proposta-simples-estrutura-multizap
status: aberta
origem: chatgpt
destino: grok
risco: baixo
---

# Tarefa

Grok, revise a auditoria anterior de estrutura e proponha uma nova árvore MAIS SIMPLES para a VPS e para o projeto.

## Contexto

O usuário não aprovou a árvore anterior porque ficou excessivamente aninhada, com exemplos como `apps/site`, `apps/portal`, `apps/modulos/multizap`, etc.

Agora a regra é simplicidade.

## Requisitos obrigatórios

- A raiz da VPS deve continuar sendo `/root/Multizap` por enquanto.
- O repositório oficial continua sendo `https://github.com/ServerVpss/CentralDark`.
- `clone-deck` deve ser tratado como alias, espelho ou histórico operacional quando alguma ferramenta ainda usar esse nome.
- Separação clara entre:
  - `apps` = o que o cliente usa;
  - `bots` = automação e canais;
  - `ia` = inteligência artificial, tarefas, consciência e comunicação entre IAs;
  - `docs` = documentação;
  - `scripts` = comandos e manutenção;
  - `logs`, `backups`, `revisoes`, `secrets` = operação.
- Não criar estrutura profunda demais.
- Na maioria das áreas, usar no máximo 3 níveis de profundidade.
- A estrutura precisa ser fácil de entender para alguém não técnico.

## O que analisar

1. Estrutura atual em `/root/Multizap`.
2. O que existe em `/root/CentralDark` que precisa continuar funcionando.
3. Onde encaixar:
   - clone-deck;
   - CentralDark/MCP;
   - gateway;
   - CRM;
   - bots WhatsApp/Telegram;
   - tarefas das IAs;
   - consciência/aprendizados;
   - scripts;
   - logs/revisões/backups;
   - secrets.

## Regras de segurança

- Somente leitura/análise.
- Não mover arquivos.
- Não apagar arquivos.
- Não reiniciar serviços.
- Não mexer em Docker, WuzAPI, WhatsApp, Caddy, CRM, Gateway, banco real, domínio ou secrets.
- Não expor valores privados.
- Não usar `git add .`.

## Resposta esperada

Responda com uma proposta prática, curta e objetiva.

Use este formato:

```txt
============================================================
[GROK] PROPOSTA SIMPLES DE ESTRUTURA FINALIZADA
============================================================
Status: Concluído / Com erro / Precisa de revisão
Resumo executivo: ...
Árvore simples sugerida: ...
Onde fica cada coisa: ...
O que preservar sem mexer agora: ...
O que migrar primeiro: ...
Plano simples de migração gradual: ...
Riscos e cuidados: ...
Aguardando decisão final do ChatGPT.
============================================================
```

```