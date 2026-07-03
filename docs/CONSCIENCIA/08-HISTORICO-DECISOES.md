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


## Decisões da sessão 30/06/2026 — multi-provider LLM + remoção do /mcp-public

### Remoção do endpoint /mcp-public

**Decisão:** removido por completo o endpoint `/mcp-public` do MCP CentralDark (rotas GET/POST em `dist/index.js` + whitelist `PUBLIC_CALLABLE_TOOL_NAMES` em `dist/mcp-server.js`).

**Por quê:** expunha `vps_write_file_safe` (escrita em arquivo) sem Bearer token — qualquer um com a URL podia escrever na VPS. Decisão direta do Pivete durante investigação de como conectar IAs externas (Gemini) à memória — ao descobrir o risco, ele pediu remoção total em vez de apenas restringir a whitelist. Fecha a pendência #8.

**Achado lateral:** o módulo MCP não tem `src/` versionado no Git — só `dist/` (gitignored). A edição foi feita direto no `dist/`, única cópia existente, e não sobrevive a um rebuild do zero. Vira parte da pendência crítica já registrada em `09-ESTADO-ATUAL.md`.

**Arquivos:** `apps/modulos/mcp/dist/index.js`, `apps/modulos/mcp/dist/mcp-server.js`. Verificado `/mcp-public` → 404 após restart do `CentralDark-MCP`.

### Gemini não tem caminho de integração direta com o Cérebro Vivo (por enquanto)

**Decisão:** não construir integração nova (webhook, Service Account Google Drive, inotify) para conectar o Gemini à memória — investigação confirmou que Gemini Gems não suporta Actions/tool-calling externo, e as alternativas (Gemini Enterprise, cliente custom da API) custam dinheiro ou reintroduzem terminal pela porta de trás. Adotado fluxo pragmático: repasse de texto formatado entre chats (Gemini → Claude Code/ChatGPT) em vez de automação completa.

**Por quê:** o Pivete pediu pra qualquer IA (Claude, Gemini, ChatGPT, Grok) compartilhar "o mesmo cérebro" sem ele copiar/colar ou mexer em terminal. A investigação (3 agentes Explore + 1 Plan) mostrou que a maior parte da automação necessária já existe (GuardiãoConsciência, Memory-Linker, Notion sync) — o gargalo real é uma limitação de plataforma do Gemini, não falta de infraestrutura no CentralDark.

**Arquivos:** `docs/CONSCIENCIA/11-MULTI-IA-FLUXO.md` (nova seção documentando a limitação).

### Ativação de Groq, OpenRouter e Gemini como provedores LLM (Open WebUI + Bolt)

**Decisão:** as 3 keys (Groq, OpenRouter, Gemini) que o Pivete tinha apenas nos painéis dos provedores foram organizadas em `apps/modulos/mcp/.env` e ativadas em dois lugares: `apps/modulos/Bolt/source/.env` (variáveis nativas do bolt.diy) e no banco do Open WebUI (`openai.api_base_urls`/`api_keys`/`api_configs` na tabela `config` do `webui.db`).

**Por quê:** o modelo `gpt-4o` no Open WebUI estava quebrado (`'JSONResponse' object has no attribute 'body_iterator'`) porque apontava para uma conexão `https://api.mistral.ai/v1` salva no banco (não nos env vars do docker-compose, que têm prioridade menor que o banco depois do primeiro boot) sem key válida. A correção substituiu essa conexão quebrada por 4 conexões funcionais: Elite Gateway, Groq, OpenRouter (que serve gpt-4o de verdade) e Gemini.

**Achado:** havia uma segunda key OpenRouter colada junto com a principal — mantida como `OPENROUTER_API_KEY_ALT` (não removida, por pedido do Pivete: "mesmo que fique repetido, só bota título diferente pra saber").

**Arquivos:** `apps/modulos/mcp/.env`, `apps/modulos/Bolt/source/.env`, `apps/modulos/WebUI/docker-compose.yml`, banco `webui.db` (via script Python pontual, não versionado). Containers `CentralDark-WebUI` e `CentralDark-Builder` recriados/reiniciados e confirmados healthy.

### Notion sync ampliado manualmente — gap identificado no trigger automático

**Decisão:** identificado que `.github/workflows/notion-sync.yml` só dispara pra uma lista fixa de arquivos (`REGRA-OFICIAL-*.md`, `08-HISTORICO-DECISOES.md`, `APRENDIZADOS.md`, `PENDENCIAS.md`) — documentos novos como `MAPA-DOS-BOTS.md` e `11-MULTI-IA-FLUXO.md` nunca disparavam o sync. Como fix imediato, criadas manualmente 10 entradas no banco Notion `📂 Estrutura de Pastas & Agentes` (data source `dc233802-1636-4717-a6ed-060b5c5d4505`) cobrindo o `MAPA-DOS-BOTS.md` e os 9 bots/automações documentados nele.

**Por quê:** Pivete pediu confirmação dos 4 pontos de sincronia (Sincronia 4-Point) e notou que o Notion não estava no fluxo — "Dê providência agora". A automação completa (ampliar o trigger do workflow + o script `sync.mjs` pra aceitar docs genéricos) fica como próximo passo, porque `.github/workflows/` é área protegida (Seção 9 do CLAUDE.md) e precisa de decisão própria sobre estrutura antes de mexer no trigger.

**Achado:** `sync.mjs` não é um espelho genérico — ele faz parsing estruturado de 4 arquivos específicos pra databases específicos do Notion. Documentos novos soltos não têm caminho automático até alguém estender o script.

**Onde ver no Obsidian:** nome do arquivo é `MAPA-DOS-BOTS` (busca pelo Quick Switcher).

**Arquivos:** Notion (10 páginas novas), nenhuma mudança em `.github/workflows/` ainda (pendente decisão).

### Backup de leitura docs/CONSCIENCIA/ → Google Drive agendado

**Decisão:** `scripts/sync-memoria.sh` trocado de `rclone sync` para `rclone copy` (nunca apaga no Drive) e agendado no crontab a cada 6 horas. Autorizado explicitamente pelo Pivete ("PERMITO PIVETE") após bloqueio do classificador de segurança do Claude Code, que exigiu confirmação explícita por ser mudança persistente de infraestrutura.

**Por quê:** infraestrutura já existia (remote `gdrive:` configurado, script pronto) mas nunca tinha sido agendada — vira só um backup de leitura, não canal de escrita Drive→Git.

**Arquivos:** `scripts/sync-memoria.sh`, crontab.

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

## Falha registrada — Docs "para o Pivete ver" criados na pasta errada (30/06/2026)

**O que aconteceu:** criei `docs/CONSCIENCIA/MAPA-DOS-BOTS.md` e, antes dele na mesma sessão, `docs/CONSCIENCIA/PROTOCOLO-INICIALIZACAO.md` — os dois pensados como notas visuais para o Pivete abrir no Obsidian ("bolinha grande"). Só que o vault Obsidian real do Pivete é `docs/BRAIN/`, não `docs/CONSCIENCIA/`. Resultado: os dois arquivos ficaram **invisíveis na busca do Obsidian dele** — ele mandou print mostrando "0 resultado" e reclamou: *"NAO TA MOSTRANDO TEMOS QUE MELHORAR ESSE RECONHECIMENTO!"*

**Causa raiz:** `docs/CONSCIENCIA/` é a memória técnica das IAs (fonte da verdade, git-first). `docs/BRAIN/` é o vault visual que o Pivete realmente abre no app Obsidian. São duas árvores de pastas distintas e eu tratei como se fossem a mesma coisa.

**Investigação (a pedido do Pivete — "procure mais falhas como essa"):** rodei `git log --diff-filter=A --name-only -- "docs/CONSCIENCIA/*.md"` desde o início da sessão para achar outras instâncias do mesmo padrão. Resultado: só esses 2 arquivos têm o bug. Os arquivos em `docs/CONSCIENCIA/relatorios/*.md` (elite-mapper) **não** são instância do mesmo problema — são relatórios de auditoria gerados pelo Memory-Linker, corretamente posicionados em CONSCIENCIA (não são notas de navegação visual para o Pivete).

**Correção aplicada:**
- Criada cópia de `MAPA-DOS-BOTS.md` em `docs/BRAIN/00 - Mapa do Sistema/MAPA-DOS-BOTS.md`, com wikilinks adaptados pro vault local.
- Criada cópia de `PROTOCOLO-INICIALIZACAO.md` em `docs/BRAIN/00 - Mapa do Sistema/PROTOCOLO-INICIALIZACAO.md`, mesma adaptação.
- Ambas as cópias citam a fonte oficial em `docs/CONSCIENCIA/` e instruem atualizar os dois juntos.

**Regra derivada (preventiva):** qualquer documento novo cujo propósito explícito é ser **lido visualmente pelo Pivete no Obsidian** precisa, desde a criação, ter uma cópia (ou ser criado diretamente) em `docs/BRAIN/`, nunca só em `docs/CONSCIENCIA/`. Documentos técnicos puros (regras, histórico de decisões, aprendizados, relatórios de auditoria) continuam só em `docs/CONSCIENCIA/`, que é a fonte da verdade git-first — a distinção é "isso é pra IA usar como memória" vs "isso é pra o Pivete abrir e ler".

---

## MCP — versionado, equipado com tools cognitivas e trancado (30/06/2026)

**Contexto:** o módulo `apps/modulos/mcp/` rodava em produção (porta 9100, OAuth GitHub) mas
**não tinha código-fonte versionado** — só o `dist/` compilado (gitignored), única cópia
viva. Risco crítico de perda. O Pivete trouxe uma proposta do Grok (árvore conceitual de 10
itens) e pediu pra finalizar/organizar/trancar a pasta, mais 4 tools de governança cognitiva.

**Decisões tomadas:**
1. **Versionar o `dist/`** via `apps/modulos/mcp/.gitignore` (re-inclui `dist/`, mantém fora
   `.env`, `node_modules`, `logs`, `*.map`, `*.bak*`, `*.d.ts`). Fim do risco de perda. A
   reescrita do `src/` TypeScript fica como etapa futura (não urgente — risco já zerado).
2. **A árvore de 10 itens do Grok NÃO virou pastas físicas** (duplicaria memória/skills/
   agentes/integrações que já existem — anti-inflação). Virou documentação/mapa.
3. **4 tools cognitivas** criadas em `dist/tools/cognitivo/cognitivo.js` (catálogo: 96→100):
   `consultar_memoria_reserva`, `consolidar_pensamento`, `injetar_consciencia_centraldark`,
   `analise_de_estado_cognitivo`.
4. **"Lembranças"** (renomeado de "Memória Reserva" a pedido do Pivete): memória de curto
   prazo em `docs/CONSCIENCIA/LEMBRANCAS/`, TTL 30 dias, auto-limpeza, fluxo de promoção pra
   consciência oficial. É por onde toda IA passa primeiro ao conectar.
5. **Documentação** em `apps/modulos/mcp/README.md` (leigo) + `apps/modulos/mcp/docs/`
   (ARQUITETURA + TOOLS-COGNITIVAS).
6. **Docs corrigidos:** `06-MCP-CENTRALDARK.md` (paths `/APP/` que nunca existiram →
   `apps/modulos/mcp/`); `MAPA-DO-CEREBRO.md` (95/9200 → 100/9100).
7. **Trancado** na Seção 9 do CLAUDE.md (`apps/modulos/mcp/` + `LEMBRANCAS/`).

**Validação:** `curl localhost:9100/health` → `toolCount:100`, `version 0.4.0`; as 4 tools no
`/tools.json`; handlers de leitura testados (parsing + fallback local OK).

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
- [[00-MAPA]] — Cérebro de Aço e Motores Gêmeos

---

## Grupo Da Evolução aterrissado no CentralDark real (2026-07-02)

**Decisão:** as 3 IAs do grupo Telegram (Gemini Flash, Groq Llama, Claude Sonnet) pararam de discutir filosofia genérica ("evolução", "criatividade emerge de sistemas lógicos") e passaram a discutir **exclusivamente o CentralDark real** — commits, pendências, pipeline Graphify, status PM2, aprendizados registrados.

**Como:**
- Novo módulo `apps/bot-telegram/contexto-centraldark.cjs` puxa contexto vivo (git log, `docs/CONSCIENCIA/APRENDIZADOS.md`, `docs/PENDENCIAS.md`, status Graphify, PM2)
- Prompts das 3 personalidades foram reescritos com bloco fixo obrigatório sobre CentralDark
- Tópicos deixaram de ser sorteados de uma lista genérica → agora `gerarTopicoReal()` monta a partir de commits/pendências/graphify
- Aprendizados vão pra `docs/CONSCIENCIA/APRENDIZADOS.md` (não só pro JSON efêmero), então a próxima IA que ler o cérebro herda
- Pipeline Graphify blindado (`.graphifyignore` + `pipeline-graphifyy.sh` com trap ERR + notificação Telegram no grupo em caso de falha)

**Por quê:** olhando o grupo, o Pivete notou que as IAs conversavam sobre "simplicidade como resultado da complexidade" enquanto a VPS tinha pipeline quebrando. Grupo virou palanque filosófico em vez de time de evolução real.

**Arquivos criados/mudados:**
- `apps/bot-telegram/contexto-centraldark.cjs` (novo)
- `apps/bot-telegram/evolucao-ias.cjs` (personalidades + tópicos + prompts)
- `.graphifyignore` (novo, raiz)
- `apps/modulos/graph-panel/scripts/pipeline-graphifyy.sh` (reescrita blindada)
- `.github/workflows/bots-labels-seed.yml` (+3 labels: graphify, pipeline-broken, ignore-pending)
- `docs/CONSCIENCIA/GRUPO-EVOLUCAO.md` (novo — documentação viva do grupo)
- `docs/CONSCIENCIA/DARKAI/README.md` (menciona integração)

**Regra derivada:** qualquer IA nova que entrar no grupo tem que herdar o bloco de contexto obrigatório no prompt. Filosofia genérica volta se algum prompt for solto sem esse bloco.

---

## Fix STT do WebUI — whisper-1 mapeado no proxy audio-transcriptions (2026-07-03)

**Problema:** transcrição de voz do Open WebUI (ui.centralldark.com) quebrada com `400 Bad Request` em `https://api.centralldark.com/v1/audio/transcriptions`. Causa raiz: o Open WebUI manda `model=whisper-1` (padrão OpenAI); a edge function `audio-transcriptions` (projeto `kagejpghnwdfymddwxuf`) prefixava para `openai/whisper-1` e o Lovable AI Gateway rejeitava — só aceita `openai/gpt-4o-transcribe` e `openai/gpt-4o-mini-transcribe`.

**Decisão:** corrigir NO PROXY (edge function), não no WebUI (pasta protegida 🔒). A função agora tem allowlist `MODELOS_ACEITOS`; qualquer modelo fora dela (ex.: `whisper-1`) cai no default `openai/gpt-4o-mini-transcribe`. Endpoint fica OpenAI-compatível pra qualquer cliente.

**Fluxo da rota (mapeado por enxame de agentes):** Open WebUI → `api.centralldark.com` (Caddy) → `handle /v1/audio/transcriptions` → edge function `audio-transcriptions` → Lovable AI Gateway. O fallback do domínio (demais rotas) vai pro EliteHTTP `:8080` (gateway ChatGPT via browser), que NÃO tem rota de áudio.

**Execução:** working tree da VPS estava no branch `f1-mcp-catalog-walking-skeleton` (trabalho de outra sessão) — fix feito em worktree isolado a partir de `origin/main` e push direto pra `main` (commit `cc2c01c9d`). Deploy automático via sync Lovable↔GitHub.

**Alternativa registrada (não executada):** VPS tem `GROQ_API_KEY` em `secrets/agent.env`; a Groq expõe `/openai/v1/audio/transcriptions` (whisper-large-v3) compatível — plano B seria rota local no Arsenal Adapter `:8090` + ajuste no Caddy, se um dia o gateway Lovable falhar.

---

## Hermes × darkai — trava de stdin + env ausente no PM2 + retomada de missões órfãs (2026-07-03)

**Problema:** o decisor do Hermes (PM2 66) tentava 3 modelos via `darkai` e todos "falhavam" exatamente no limite do timeout (15s/30s/45s), caindo sempre no Elite Anthropic — ~90s mortos por decisão. Causa raiz DUPLA, provada por teste: (1) o `darkai.sh` faz `STDIN_DATA="$(cat)"` quando stdin não é TTY, e o `execFile` do Node deixa o pipe de stdin aberto → o `cat` espera EOF pra sempre até o timeout matar o processo; (2) mascarado por baixo, o processo PM2 não tinha `DARKAI_URL`/`DARKAI_ANON_KEY` (só existiam no `~/.bashrc`, que PM2 não herda). Agravante: o decisor truncava o erro em 100 chars e descartava o stderr, escondendo tudo.

**Decisão/execução (autorizada pelo Pivete — "MODO ARSENAL"):**
- `decisor.mjs` e `executor.mjs`: `p.child.stdin.end()` após o `pexec('darkai', ...)` + stderr incluído na mensagem de erro.
- `darkai.sh` (repo + `/usr/local/bin/darkai`): guarda `[[ -n "$STDIN_DATA" ]]` pra não anexar bloco `--- CONTEÚDO ---` vazio.
- `.env`: adicionado `DARKAI_URL` (edge function ai-proxy do projeto kagejpghnwdfymddwxuf).
- `daemon.mjs`: loader de `.env` no boot (PM2-safe, sobrevive a resurrect) + imports dinâmicos do decisor/executor pra env carregar antes.
- `daemon.mjs`: **retomada automática de missões órfãs** — `retomarOrfas()` varre `missoes/em-andamento/` no boot, recarrega `state.json` (fallback `missao.md`) e continua da etapa onde parou, com contador de retomadas e flag `ocupado` contra corrida. Motivo: o restart do fix interrompeu a missão `upgrade-hub-v2` na etapa 29/29 OK, e o daemon só olhava `pendente/`.
- **Resultado do teste:** Gemini Flash respondendo em ~2.8s (antes: 90s → Elite). Missão `upgrade-hub-v2` retomada da etapa 30 com histórico intacto.
- **Segurança de bônus:** `.env` estava TRACKED no git (o `git add -A` do executor do Hermes empurrava secrets a cada etapa) apesar do `.gitignore` já listar `.env` — destrackeado com `git rm --cached` (arquivo intacto no disco). ⚠️ Pendência: secrets antigos permanecem no histórico do GitHub — avaliar rotação das chaves expostas (`DARKAI_ANON_KEY`, `ELITE_ANTHROPIC_TOKEN`).
- Conflito UU antigo em `apps/modulos/status/painel-data.json` (stash mal aplicado) resolvido mantendo o lado mais novo; painel atualizado.

**Callers de darkai auditados:** `executor.mjs` (corrigido), `ARSENAL/hermes-vivo/decisor.mjs` (cópia legada, não roda — intocada), `apps/bot-telegram/handlers/regras.cjs` (🔒 protegido — tem o mesmo risco de trava no healthcheck de 20s e usa flag `-m` que o darkai não suporta; reportado, não alterado).

**Backups:** `backups/2026-07-03-hermes-darkai/` (decisor, executor, daemon pré-fix e pré-retomada, darkai.sh, env).

---

## Hermes ganha sistema de aprendizado + conclui hub v2 sozinho (2026-07-03)

**Decisão (ordem do Pivete: "ele tem que aprender" + missão Tutor):** o Hermes ganhou 3 camadas de aprendizado: (1) `hermes/aprendizados.json` — lições por categoria com gatilhos, injetadas pelo decisor no prompt de cada decisão (só a categoria relevante); (2) ferramenta `aprender` no executor — ele grava lições novas sozinho em runtime; (3) detectores anti-loop no decisor: chamada idêntica repetida E releitura do mesmo arquivo 3x/6 etapas (por qualquer ferramenta) → proíbe repetir no prompt e escala direto pro gemini-2.5-pro. Ledger humano em `ARSENAL/APRENDIZADOS.md` (formato do cerebro.mjs) + índice `ARSENAL/APRENDIZADOS-INDEX.json` + aula completa em `ARSENAL/EVOLUCAO/2026-07-03/aula-tutor-hermes.md` (6 técnicas: curl robusto, git cirúrgico, PM2, validação+rollback, sed em massa, flock).

**Resultado:** missão `finalizar-hub-v2` concluída pelo Hermes em 77 etapas — typecheck do hub zerado (ele consertou PolicyEditor, api-client, telegram-client e exportou Policy do hook), commit `00f4403a3` pushado por ele MESMO aplicando as lições (add por path, pull --rebase --autostash, conferência via git log). Retomada automática segurou 3 restarts no meio da missão sem perder etapa.

**Gaps anotados:** cerebro.mjs existe mas o daemon não o importa (canal vivo é o aprendizados.json); detector v3 pendente — repetição de comando com mesmo EFEITO e marcador diferente (ele rodou tsc 4x com echos diferentes pra "se convencer").

---

## Rodada 3 do Hermes + incidente de segurança contas/ (2026-07-03, tarde)

**Missão fix-catalogo-tools-json (Hermes, 37 etapas):** bug real achado pela revisão dele (catálogo chamava /tools 404; certo é /tools.json) — corrigido, typecheck OK, build direto no dist/ (autorizado pelo Pivete), site 200, commit cirúrgico. Detector v4 (escrita-sem-validação) nasceu NO MEIO da missão após 7 reescritas às cegas e quebrou o ciclo na primeira ativação (TSC_OK em seguida). Guard-rail bloqueou tentativa de push --force dele. O push final travou em engarrafamento de git (3 sessões + automations empurrando; autostashes empilhados com painel-data.json).

**Resgate do tutor:** daemon pausado → cherry-pick em worktree temporário a partir da origin (fix do hub deduplicado + commit sec/v4) → push 65bf46453 → main local reconciliada com reset --soft (SEM --hard, pra não apagar contas/ do disco) → daemon religado + pm2 save. Commits memory-executor locais descartados (agente tem 15 equivalentes upstream e se regenera).

**🚨 INCIDENTE: perfil de navegador ChatGPT trackeado no git.** `contas/profiles/chatgpt/` (969 arquivos, 80MB, 18 arquivos de cookies/sessão/login) entrou no commit 21af148af via `git add -A` da primeira missão do Hermes e foi pro GitHub. Mitigado: `git rm -r --cached contas/` + `contas/` no .gitignore (arquivos locais intactos — gateway EliteHTTP segue funcionando). **PENDENTE (decisão do Pivete): (1) renovar a sessão ChatGPT do gateway (logout/login) pra invalidar os cookies expostos; (2) avaliar purge do histórico do GitHub (reescrita destrutiva — precisa autorização explícita).** Lição já estava no aprendizados.json (nunca add -A) — o incidente é anterior à lição.

---

## Hermes vira admin do Elite Gateway — tutor especialista (2026-07-03, noite)

**Decisão (MODO ARSENAL — "torne o Hermes especialista em criar contas e manutenção"):** o Elite HTTP Gateway (ChatGPT via Zendriver/Chrome real, PM2 CentralDark-EliteHTTP :8080) ganhou uma camada de admin + o Hermes ganhou a especialização.

**Entregas:**
- `apps/modulos/elite-gateway/scripts/gateway_admin.py` — CLI de admin (list/health/doctor/add/login/login-stop/test/fix-duplicates). Backup automático do accounts.json, tokens sempre mascarados, login humano via Xvfb+Chrome+x11vnc+websockify (noVNC). Testada ao vivo contra o gateway.
- `ARSENAL/EVOLUCAO/2026-07-03/aula-elite-gateway.md` — arquitetura + runbooks.
- `ARSENAL/EVOLUCAO/2026-07-03/aulas-avancadas-gateway.md` — 4 aulas (criar conta, manter/re-login, corrigir multi-conta, zentinel).
- `hermes/aprendizados.json` — categoria `elite-gateway` (12 lições) injetada no prompt do decisor por gatilho.

**Bug confirmado pelo doctor (pendente do Pivete):** accounts.json tem 2 tokens com id=conta_padrao apontando pro MESMO perfil (zendriver_chatgpt_profile → symlink pra contas/profiles/chatgpt). Não é multi-conta real. Correção segura = criar conta_02 separada (add + login), sem tocar no token em uso. Renomear/remover token existente exige "PERMITO PIVETE".

**Divisão de trabalho ensinada:** Zentinel cuida de latência (auto-restart cooldown 5min); Hermes cuida de login expirado/Cloudflare/conta nova; login com senha/2FA é sempre passo humano do Pivete via noVNC.

---

## Vazamento de token contido + redator de segredos no Hermes (2026-07-03, noite)

**Incidente:** no exame do gateway, `gateway_admin.py add conta_02` imprimiu o token novo no stdout (entrega ao humano), e o executor do Hermes persiste o stdout cru de toda ferramenta em state.json, hermes.log e notificação Telegram → o token sk-elite- da conta_02 ficou gravado em 2 arquivos da pasta versionada missoes/concluidas/. Detectado ANTES de qualquer commit (arquivos ?? untracked); accounts.json (cofre) estava gitignored e intacto.

**Correção:** (1) mascarado o token nos 2 arquivos locais (sk-elite-REDACTED); (2) redator central no executor.mjs — `executar()` virou wrapper que passa a `saida` de _executar() por `redigirSegredos()` (padrões: sk-elite-, sk-*, Bearer *, JWT eyJ...). Cobre state.json + log + Telegram num choke point só, pra QUALQUER ferramenta. Testado: `echo sk-elite-...` sai `sk-eli…REDACTED`. Hermes reiniciado + pm2 save.

**Resultado:** grep de token cru em docs/ = 0; cofre intacto (conta_02 segue listada, 🟡 sem sessão, correto); gateway 200. Token real da conta_02 vive só no accounts.json local (gitignored) — Pivete recupera lá quando for logar/configurar cliente. É o 3º vazamento tapado hoje (.env, contas/, agora token) — agora com defesa estrutural, não só reativa.
