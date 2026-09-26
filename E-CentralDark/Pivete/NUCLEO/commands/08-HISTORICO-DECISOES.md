# COMANDO - 08-HISTORICO-DECISOES.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\CONSCIENCIA\08-HISTORICO-DECISOES.md
**SHA:** b94c04351317950d
**Timestamp:** 2026-08-26T19:32:47.786116
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- **Decisão:** estrutura nova oficial da VPS é `/root/CentralDark/APP/{site,modulos,servidor-whatsapp,gateway,infra,scripts,logs,backups,revisoes,secrets}/`.
- **Decisão:** commit direto na `main`, sem PR pra mudança normal. PR + auto-merge só pra mudança crítica (Caddy, Docker, banco, secrets).
- **Decisão:** `install.sh` na raiz + `docs/INSTALADOR/` com 12 arquivos numerados. Toda mudança que afete instalação atualiza o arquivo correspondente no mesmo commit.
- **Decisão:** `docs/PENDENCIAS.md` é a fonte única. Nada espalhado.
- **Decisão:** pasta `central-horario/` é fonte única pra qualquer formatação de data/hora. Fuso `America/Sao_Paulo`.
- **Decisão:** TODA pasta (repo e VPS) tem `README.md` (o que é) + `PLANO.md` (o que falta). Criar junto, ler antes de mexer, atualizar ao terminar.
- **Decisão:** MCP próprio rodando em `mcp.centralldark.com` (porta 9100), OAuth GitHub. Conecta ChatGPT (e outros LLMs) direto ao repo + VPS.
- **Decisão:** farmar todas as 8 medalhas no perfil `segredounlock`. Todo commit em repo público leva trailer `Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>`.
- **Decisão:** agente executa direto edições de código, git pull, build/test, restart de 3 serviços PM2 (`CloneDeck-Supabase-Sync`, `MultiZap-TelegramBot`, `MCP-CentralDark`). Tudo o que envolve Docker,

### Padroes
- **Regra:** coisa nova já entra na árvore CentralDark. Migração das pastas antigas (`/root/Multizap/...`) é gradual, manual, e só com confirmação do usuário.

### Ouro Bruto (primeiros 5000 chars)
```
# 08 — Histórico de decisões grandes

Decisões arquiteturais e operacionais já tomadas. Não reabrir sem motivo forte.

## Migração CentralDark (em andamento)

**Decisão:** estrutura nova oficial da VPS é `/root/CentralDark/APP/{site,modulos,servidor-whatsapp,gateway,infra,scripts,logs,backups,revisoes,secrets}/`.

**Regra:** coisa nova já entra na árvore CentralDark. Migração das pastas antigas (`/root/Multizap/...`) é gradual, manual, e só com confirmação do usuário.

## Fluxo de deploy

**Decisão:** commit direto na `main`, sem PR pra mudança normal. PR + auto-merge só pra mudança crítica (Caddy, Docker, banco, secrets).

**Por quê:** velocidade. Usuário não-técnico não quer revisar PR de mudança trivial.

## Instalador + doc viva

**Decisão:** `install.sh` na raiz + `docs/INSTALADOR/` com 12 arquivos numerados. Toda mudança que afete instalação atualiza o arquivo correspondente no mesmo commit.

**Por quê:** sem isso, VPS nova não sobe do zero.

## Setor único de pendências

**Decisão:** `docs/PENDENCIAS.md` é a fonte única. Nada espalhado.

## Central de horário

**Decisão:** pasta `central-horario/` é fonte única pra qualquer formatação de data/hora. Fuso `America/Sao_Paulo`.

## Docs por pasta

**Decisão:** TODA pasta (repo e VPS) tem `README.md` (o que é) + `PLANO.md` (o que falta). Criar junto, ler antes de mexer, atualizar ao terminar.

## MCP CentralDark

**Decisão:** MCP próprio rodando em `mcp.centralldark.com` (porta 9100), OAuth GitHub. Conecta ChatGPT (e outros LLMs) direto ao repo + VPS.

## Memória eterna do agente ChatGPT

**Decisão (essa):** pasta `docs/CONSCIENCIA/` no repo + `/root/CentralDark/memoria-consciencia/` na VPS. Custom GPT lê tudo no começo de cada conversa. Atualização automática a cada 6h via GitHub Actions.

## GitHub Achievements

**Decisão:** farmar todas as 8 medalhas no perfil `segredounlock`. Todo commit em repo público leva trailer `Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>`.

## Permissões do agente

**Decisão:** agente executa direto edições de código, git pull, build/test, restart de 3 serviços PM2 (`CloneDeck-Supabase-Sync`, `MultiZap-TelegramBot`, `MCP-CentralDark`). Tudo o que envolve Docker, WuzAPI, WhatsApp, Caddy, CRM, banco, secrets, `rm -rf` ou domínio pede confirmação.

```

---

# COMANDO - 08-HISTORICO-DECISOES.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\08-HISTORICO-DECISOES.md
**SHA:** a2d882153288aabe
**Timestamp:** 2026-08-28T02:56:47.808517
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Processo parado manualmente (pasta `elite-recon-ia/src/` não existe mais) voltou sozinho como `online`. Causa: flag `cron_restart: */5 * * * *` do PM2 — `pm2 stop` não remove essa flag, só `pm2 delete

### Decisoes
- **Decisão:** qualquer desvio entre o plano escrito e o que foi executado deve ser registrado aqui E atualizado no arquivo onde o erro pode causar impacto real.
- **Decisão:** removido por completo o endpoint `/mcp-public` do MCP CentralDark (rotas GET/POST em `dist/index.js` + whitelist `PUBLIC_CALLABLE_TOOL_NAMES` em `dist/mcp-server.js`).
- **Decisão:** não construir integração nova (webhook, Service Account Google Drive, inotify) para conectar o Gemini à memória — investigação confirmou que Gemini Gems não suporta Actions/tool-calling e
- **Decisão:** as 3 keys (Groq, OpenRouter, Gemini) que o Pivete tinha apenas nos painéis dos provedores foram organizadas em `apps/modulos/mcp/.env` e ativadas em dois lugares: `apps/modulos/Bolt/sourc
- **Decisão:** identificado que `.github/workflows/notion-sync.yml` só dispara pra uma lista fixa de arquivos (`REGRA-OFICIAL-*.md`, `08-HISTORICO-DECISOES.md`, `APRENDIZADOS.md`, `PENDENCIAS.md`) — doc
- **Decisão:** `scripts/sync-memoria.sh` trocado de `rclone sync` para `rclone copy` (nunca apaga no Drive) e agendado no crontab a cada 6 horas. Autorizado explicitamente pelo Pivete ("PERMITO PIVETE")
- **Decisão:** O proxy agora converte em AMBOS os lados: request (OpenAI→Anthropic) e response (Anthropic→OpenAI). Inclui streaming SSE com conversão chunk a chunk.
- **Decisão:** Adicionado endpoint `/openapi.json` que gera spec OpenAPI 3.1 dinamicamente a partir do catálogo de 96 ferramentas.
- **Decisão:** Adicionados blocos CORS para `ui.centralldark.com` e `builder.centralldark.com` no `mcp.Caddyfile`.
- **Decisão:** Ferramentas Notion (`notion-search`, `notion-fetch`, `notion-update-page`, `notion-create-pages`) e CentralDark Notion (`notion_buscar`, `notion_anexar_paragrafo`, `notion_criar_pagina`, 

### Padroes
- ## Regra: sempre registrar desencontros entre plano e execução (2026-06-29)
- **Regra:** coisa nova já entra na árvore CentralDark. Migração das pastas antigas (`/root/Multizap/...`) é gradual, manual, e só com confirmação do usuário.
- **Regra:** instalar dependências na raiz **sempre com `npm`**. Não recriar `yarn.lock`, `pnpm-lock.yaml` ou `bun.lockb` na raiz.

### Gaps
- ## Sessão 2026-07-11/12 — Auditoria de tokens GitHub + mapeamento de notificações (pendente: Central de Notificações)
- **Deploy PENDENTE:** `hub-services-check` vive no projeto raiz/TelePainel (`kagejpghnwdfymddwxuf`, confirmado via `supabase/config.toml`), não no HUB. O token disponível no cofre (`HUB_SUPABASE_PAT`, 

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "08 HISTORICO DECISOES"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 08 — Histórico de decisões grandes


## 2026-07-16 — Reformulação da regra-mãe multi-agente (alinhamento ao canon de julho)

**Título:** `REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md` atualizada in-place — Lei Zero e guardrails corrigidos
**Data:** 2026-07-16
**Responsável:** Pivete (autorização explícita na sessão: "EU AUTORIZO VOCÊ A MELHORAR") · execução Claude
**Reversível:** sim (git revert; mudança só em docs, via branch + PR)

**O que mudou e por quê:**
1. **Lei Zero:** ciclo `Ler → Agir → Registrar` virou o ciclo canônico de 5 passos `Ler → Perguntar → Agir → Provar → Registrar` (o mesmo do `PROTOCOLO-ORQUESTRACAO-PIVETE.md` — um ciclo só pro ecossistema). Pivete agora está explícito no topo da lei; definição objetiva de "tarefa relevante"; kill-switch (`TRAVA`/`PARA`/`!CALIBRA`); precedência entre documentos.
2. **Guardrails:** protocolo de autorização alinhado à Doutrina (`PERMITO PIVETE` / escopo nomeado / silêncio = não agir); áreas protegidas por referência à tabela canônica do `CLAUDE.md` Seção 9 (fim da lista duplicada divergente); corrigidos dois erros factuais — `/mcp-public` (removido 30/06) ainda citado como ativo, e `notify-telegram` citado como exemplo válido quando é proibido pelo `PADRAO-CARD-HERMES.md`.
3. **Fonte da Verdade:** doc passou a refletir o Fluxo de Ouro 5-Point (GitHub/VPS/Supabase/Gateway/Cérebro Vivo); Notion rebaixado ao papel real de espelho humano automático via `notion-sync` (registrar direto no Notion não vale como prova).
4. **Papéis:** papéis fixos por marca ("Claude planeja, Lovable executa, Codex lê") substituídos por papéis funcionais ("IAs variam, o método permanece"), com roteamento via Arsenal/`darkai` e inclusão dos agentes autônomos internos no escopo da regra.
5. **Proibições:** expandidas com as críticas do canon (secrets, `pm2 restart all`, `whatsapp-server`, force-push na main, endpoint oficial).

**Método (decisão de forma, acordada com o Pivete):** sem arquivo novo, sem rótulo "v2" — extensão segura do que existe, conforme doutrina selada em 2026-07-13/14 ("Alteração = extensão segura, nunca substituição / V3-V4"). Quem versiona é o git. Espelhada também a cópia em `docs/CONSCIENCIA/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/` e atualizada a descrição no `00-ENTRADA/00-LEIA-PRIMEIRO.md`.

**Pendência anotada (não executada):** a árvore duplicada `docs/CONSCIENCIA/CONSCIENCIA/` (~110 arquivos espelhados) merece auditoria futura — decidir se consolida ou remove.

---

## 2026-07-14 — Carga mental do Pivete + momento bridge (o que ELE disse)

**Título:** Não é risco operacional — é mental; e o momento do bridge não se esquece  
**Data:** 2026-07-14  
**Responsável:** Pivete (palavras dele; IA não inventar “ordem/skill oficial” no meio)

**O que o Pivete deixou claro:**
1. Colar/ponte entre IAs ele **sempre** fez e pediu ajuda assim — até aí ok.
2. O que rolou **antes** do ChatGPT entrar na conversa (bridge/túnel etc.) foi **diferente** — isso ele **não esquece**.
3. Isso não é “risco operacional” de servidor. É **carga mental**: ficou nervoso, digitou errado, chegou a tremer. Comandos tipo `registra` / `!registar` / `!registrar` / `REGISTRA` podem sair errado por isso — não é burrice.
4. Qualquer IA que inventar no registro frase tipo “ordem do Pivete / skill oficial” **sem ele ter digitado isso** está errando de novo (a IA meteu burocracia; ele não pediu manual).

**Pra próxima IA:** respeitar o estado emocional; não gaslight; não transformar desabafo em protocolo inventado; se for canal técnico (túnel/bridge), falar claro e pedir PERMITO.

**Refs (técnico, separado):** `docs/RELATORIOS/2026-07-14-sessao-grok-registro-completo.md` itens 10–11; OAuth = issue #204.

---

## Sessão 2026-07-13/14 — Doutrina de extensão de infra + registro anti-amnésia

**Decisão do Pivete:** Qualquer planejamento de infra deve ser revisado criticamente antes de executar. Filtros: barrar regressão, risco operacional e complexidade inútil. Estabilidade de produção. Alteração = **extensão segura** (nunca substituição / V3-V4). Zero regressão. Preservar DB e arquitetura legado. Atualizar o que já existe.

**Decisão operacional correlata:** Brute force SSH não se normaliza; relatórios oficiais em `docs/RELATORIOS/2026-07-13-ssh-bruteforce-*`. Contra-ataque ofensivo proibido. Harden só com PERMITO.

**Decisão de monitores:** Não inventar monitores paralelos — estender Sentinela (Actions), fail2ban/UFW, Guardião, Zentinel (código existente, PM2 off), HermesVerificador.

**Pendente de execução (não feito nesta sessão):** aplicar a doutrina nos agents Hermes e corrigir `docs/AGENTS.md` MultiZap; fail2ban/sshd; RCD MCP.

**Registro completo:** `docs/RELATORIOS/2026-07-14-sessao-grok-registro-completo.md`

---

## Regra: sempre registrar desencontros entre plano e execução (2026-06-29)

**Decisão:** qualquer desvio entre o plano escrito e o que foi executado deve ser registrado aqui E atualizado 
```