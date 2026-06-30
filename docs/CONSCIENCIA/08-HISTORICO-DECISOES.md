---
title: "08 HISTORICO DECISOES"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 08 — Histórico de decisões grandes

## Regra: sempre registrar desencontros entre plano e execução (2026-06-29)

**Decisão:** qualquer desvio entre o plano escrito e o que foi executado deve ser registrado aqui E atualizado no arquivo onde o erro pode causar impacto real.

**Por quê:** durante a Fase 1 da reorganização do Cérebro Vivo, a tabela de roteamento referenciou a pasta `07 - Reuniões & Notas` que não existia — o bot tentaria gravar lá e falharia silenciosamente. O Pivete cobrou que esses desencontros fossem identificados, registrados e corrigidos.

**Regra derivada:** quando salvar em um lugar, verificar se os outros pontos da Sincronia 4-Point também foram atualizados (BRAIN ↔ CONSCIENCIA ↔ GitHub ↔ Painel).

---

## Reorganização Cérebro Vivo — Fase 1 (2026-06-29)

**Executado:** remoção BRAIN.md.bak, tabela de roteamento em 00-LEIA-PRIMEIRO.md, ponte BRAIN↔CONSCIENCIA, frontmatter no PLANO.md.

**Desencontros encontrados:**
1. Pasta `07 - Reuniões & Notas` não existia — criada em seguida
2. `06-DECISOES.md` ainda não renomeado para `03-DECISOES.md` — segurado para Fase 2 (risco de quebrar wikilinks)
3. Tabela usa nomes atuais, não os da Fase 2 — será atualizada após Fase 2 dividir APRENDIZADOS.md

---


## Decisões da sessão 29/06/2026 — tarde (CLI)

### Elite Proxy: adotar conversão bidirecional OpenAI↔Anthropic (v1.6.0)

**Decisão:** O proxy agora converte em AMBOS os lados: request (OpenAI→Anthropic) e response (Anthropic→OpenAI). Inclui streaming SSE com conversão chunk a chunk.

**Por quê:** Sem a conversão da response, clientes que esperavam formato OpenAI recebiam o formato Anthropic raw (campo `content` em vez de `choices`). O bug impedia Open WebUI, Builder e qualquer cliente OpenAI-compat de funcionar com o alias `bear`.

**Arquivos:** `apps/modulos/elite-anthropic-proxy/proxy.py` — commit `dea30823b`

---

### MCP: adicionar /openapi.json para compatibilidade com Open WebUI Tool Servers

**Decisão:** Adicionado endpoint `/openapi.json` que gera spec OpenAPI 3.1 dinamicamente a partir do catálogo de 96 ferramentas.

**Por quê:** Open WebUI Tool Server não lê `/tools.json` (formato interno). Precisa de spec OpenAPI 3.1 com `paths`.

**Estado atual:** Fix está apenas em `dist/index.js` (gitignored). **Pendência: portar para TypeScript source** antes do próximo `npm run build`.

---

### Caddy mcp.Caddyfile: adicionar CORS para ui e builder

**Decisão:** Adicionados blocos CORS para `ui.centralldark.com` e `builder.centralldark.com` no `mcp.Caddyfile`.

**Por quê:** Browser bloqueava chamadas do WebUI e Builder ao MCP por ausência do header `Access-Control-Allow-Origin`.

**Arquivo:** `infra/caddy/mcp.Caddyfile` — sincronizado para repo no mesmo commit.

---

### Settings: liberar ferramentas Notion no permissions.allow global

**Decisão:** Ferramentas Notion (`notion-search`, `notion-fetch`, `notion-update-page`, `notion-create-pages`) e CentralDark Notion (`notion_buscar`, `notion_anexar_paragrafo`, `notion_criar_pagina`, `notion_ler_pagina`) adicionadas à lista `allow` de `~/.claude/settings.json`.

**Por quê:** Sem estar na lista allow, Claude Code pede aprovação interativa a cada chamada — que em sessão CLI sem janela resulta em "Permission denied by hook".

---

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

## Gerenciador de pacotes — npm (raiz)

**Decisão (25/06/2026):** o gerenciador de pacotes oficial da raiz do repositório é **npm**. Lockfile único e versionado: `package-lock.json`.

**Contexto:** a raiz tinha dois lockfiles versionados — `package-lock.json` (npm, ativo, atualizado em 02/2026) e `bun.lockb` (resquício do template `vite_react_shadcn_ts`, de 01/2025). O VS Code alertava "multiple lockfiles" e não conseguia decidir o package manager automaticamente.

**Ações:** `bun.lockb` removido do git; campo `"packageManager": "npm@10.9.7"` adicionado ao `package.json` (padrão corepack — declaração única lida por todas as ferramentas, supera um `.vscode/settings.json` que o `.gitignore` bloquearia); `package-lock.json` revalidado com `npm install --package-lock-only` (resultado: up to date).

**Por quê npm:** lockfile mais recente e ativamente mantido, é o que o VS Code prefere por padrão, e o mais estável para um projeto Vite/React simples. Não havia motivo para manter o Bun do template.

**Regra:** instalar dependências na raiz **sempre com `npm`**. Não recriar `yarn.lock`, `pnpm-lock.yaml` ou `bun.lockb` na raiz.

---

## Elite Anthropic Proxy — Operacional (29/06/2026)

**Decisão:** O pilar "ELITE GATEWAY" do Cérebro de Aço saiu de "a criar" para **produção**.

**Stack técnico:**
- Python 3 + FastAPI + uvicorn, rodando na **porta 8082**
- PM2 id 37: `CentralDark-EliteAnthropicProxy` (script: `apps/modulos/elite-anthropic-proxy/start.sh`)
- Rotação de keys: `asyncio.Lock` + `itertools.cycle` → `keys.json` (nunca versionado)
- Upstream: `claude.ap7.site` → Anthropic API (camouflage)
- Log rotativo: `/var/log/centralldark/elite-anthropic.log` (5MB × 3)
- Streaming nativo: detecta `"stream": true` no body e retorna `text/event-stream`

**Integrações ativadas:**
- **Builder Bolt** (`apps/modulos/Bolt/`): variável `VITE_ANTHROPIC_API_BASE` apontando para proxy
- **Open WebUI** (`apps/modulos/WebUI/`): provider custom configurado via Admin → Connections

**Regra derivada:** qualquer adição de key nova vai em `keys.json` (não commitar). Para rodar sem reiniciar o serviço, fazer reload com `pm2 restart 37`.

**Próximo passo:** expor via Caddy em `api.centralldark.com/v1` (hoje está interno).

---

## Cérebro de Aço — Unificação arquitetural (29/06/2026)

**Decisão:** os quatro pilares do sistema operacional CentralDark foram formalizados sob a categoria **"CÉREBRO DE AÇO (Núcleo de Operação)"** no `docs/BRAIN/00-MAPA.md`.

**Os quatro pilares:**

| Pilar | Nome | Local | URL |
|-------|------|-------|-----|
| 🧠 NEXUS COGNITIVO | Open WebUI | `apps/modulos/WebUI/` | `ui.centralldark.com` |
| 🛠️ FÁBRICA DE ARTEFATOS | Builder Bolt | `apps/modulos/Bolt/` | `builder.centralldark.com` |
| 🌐 ELITE GATEWAY | Proxy Anthropic | `apps/modulos/elite-anthropic-proxy/` *(a criar)* | `api.centralldark.com/v1` |
| 🚀 INTERFACE | TelePainel | `apps/TelePainel/` | `telepainel.centralldark.com` |

**Regra derivada:** alteração estrutural em qualquer pilar exige:
1. Reflexo nos outros três (config, env, compose)
2. Registro neste arquivo
3. Commit com prefixo `feat(cerebro-de-aco)` ou `fix(cerebro-de-aco)`

**Próximo passo autorizado:** construir `elite-anthropic-proxy` — serviço HTTP puro que recebe requisição OpenAI-compatible, rotaciona keys Anthropic e repassa via `claude.ap7.site`.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
- [[00-MAPA]] — Cérebro de Aço e Motores Gêmeos
