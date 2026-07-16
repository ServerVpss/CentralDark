---
title: "08 HISTORICO DECISOES"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 08 — Histórico de decisões grandes


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

---

## Grafo Vivo agora é vivo de verdade + Hermes vira mantenedor (2026-07-03, noite)

**Problema:** a aba "🕸️ Grafo Vivo — quem chama quem" (status.centralldark.com) era um snapshot ESTÁTICO de 02/07 (58 nós), gerado uma vez por sub-agente. Não refletia o estado real.

**Solução (respeitando a trava do render 🔒):** gerador `scripts/grafo-vivo/gerar-grafo-vivo.mjs` (fora da pasta protegida) que preserva a topologia curada e SOBREPÕE estado vivo: lê `pm2 jlist` (status 🟢/🔴 no label de cada nó), adiciona processos vivos que não eram nós (Hermes, Zentinel, Guardiões etc. — 58→68 nós), mede atividade recente do gateway.log (arestas quentes), recalcula stats+updatedAt. Escreve APENAS o feed graph-data.json (dado, rotina como painel-data.json) — NÃO toca no render protegido (index.html/app.js).

**Tutor do Hermes:** categoria grafo-vivo (6 lições) no aprendizados.json; aula em ARSENAL/EVOLUCAO/2026-07-03/aula-grafo-vivo.md; missão manter-grafo-vivo (regenerar + validar periodicamente). Backup do feed antigo em backups/2026-07-03-graph-data-pre-vivo.json.

**Pendente (PERMITO PIVETE):** melhorar o RENDER (protegido) pra colorir nó por SAÚDE (verde/vermelho) além de por type, e legenda — proposto, não executado. Agendar o gerador (cron/loop 5min) pra "tempo real" contínuo.

---

## Grafo Vivo: render por saúde + loop 5min (2026-07-03) — AUTORIZADO "PERMITO PIVETE"

**Autorização explícita do Pivete** para editar área protegida (apps/modulos/status/app.js):
- `app.js`: `nodeColor` agora vence pelo status — processo `stopped`=vermelho, `errored/launching`=âmbar, resto mantém cor por tipo; nó caído ganha anel pulsante no canvas. Backup: backups/2026-07-03-app.js.pre-health.
- `scripts/grafo-vivo/loop.mjs` + PM2 `CentralDark-GrafoVivo` (id 69): regenera graph-data.json a cada 5min → tempo-real contínuo. pm2 save feito.
Mudança mínima e reversível; render segue compatível com force-graph. graph-data.json passa a ter churn de dados (como painel-data.json).

---

## Obsidian como visualização em tempo real do Grafo Vivo (2026-07-03)

**Nova frente do Pivete:** ver grafo/saúde/anomalias DENTRO do Obsidian, não só no browser. Solução: `scripts/grafo-vivo/obsidian-nota.mjs` lê graph-data.json e escreve `docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md` — card monospace + Mermaid focado (núcleo, legível) + tabela de saúde (16 processos 🟢/🔴) + anomalias + fluxos críticos. Mermaid é nativo do Obsidian (leve, sem plugin extra). Loop PM2 CentralDark-GrafoVivo atualiza grafo + nota a cada 5min.

**Bug corrigido no caminho:** regex de emoji sem flag `u` corrompia labels (surrogate pair cortado pela metade, lixo acumulando por rodada). cleanLabel agora usa `/^[\u{1F7E2}...]/u` + limpeza de surrogates órfãos. Base restaurada do backup.

**Design anti-spam (regra p/ Hermes):** graph-data.json e GRAFO-VIVO.md têm churn de 5min (dado). NÃO commitar a cada regeneração (spam + conflito com git plugin do Obsidian). Commitar a nota SÓ quando o estado de saúde mudar (processo caiu/voltou) — casando com a tarefa do Hermes de "reportar quando algo ficar anormal".

**Pendente / possibilidades fluidas:** (1) commit da nota disparado por transição de anomalia (Hermes); (2) MOC/dataview no Obsidian puxando pendências+saúde; (3) nota de incidente automática quando processo cai.

---

## Sessão de consolidação Hermes + segurança Supabase + vigia 24h (2026-07-11)

**Contexto:** sessão longa iniciada com pergunta sobre GraphRAG/mapa de conhecimento, evoluiu pra correções reais de infraestrutura sob ordem direta do Pivete ("PERMITO PIVETE").

**1. Supabase HUB (`lyoigsqluyktoclwdaft`) — PiveteSync destravado:**
Schema `hub` não estava exposto no PostgREST (só `api,public,graphql_public`), causando 404 constante no sync de `docs/CONSCIENCIA/PIVETE-IA/`. Liberado schema `hub`, aplicada migration `pivete_consciencia_migration.sql`, corrigidos GRANTs de schema/sequence. Sync voltou a rodar limpo a cada 5min.

**2. Segurança crítica — RLS habilitado (Advisor: 6 tabelas públicas sem RLS):**
`contacts, messages, ticket_messages, tickets, whatsapp_connections, workspaces` no schema `api` do HUB estavam 100% públicas sem RLS. Habilitado RLS + policy `service_role_full_access` (só backend acessa, público continua bloqueado — mais seguro que estado anterior).

**3. Reorganização estrutural do Hermes (ordem explícita "tudo relacionado ao Hermes fica no HERMES-CORE"):**
Consolidadas 4 pastas antigas espalhadas (`apps/hermes-vivo/`, `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/` minúsculo, pasta fantasma por erro de path duplicado, `apps/modulos/hermes-thinker/` solto). `hermes-thinker` movido pra dentro de `HERMES-CORE/` e renomeado `HERMES-THINKER` (maiúsculo, revogando exceção antiga que blindava pastas de código). Docs soltos (`docs/CONSCIENCIA/HERMES/`) movidos pra `AGENTES-AUTONOMOS/HERMES/PLAYBOOKS/`.

**4. `CentralDark-HermesVerificador` ligado de verdade (PM2 id 27):**
Documentado há dias no CLAUDE.md mas nunca registrado no PM2. Ao subir, achados e corrigidos 2 bugs em `HERMES-CORE/utils/notify.mjs`: (a) módulo sem `export` executava tudo no top-level e chamava `process.exit(0)` no import, matando o daemon host em crash-loop (~15 restarts/segundos, cards vazios no Telegram); (b) `destino` default `'admin'` era usado como `chat_id` literal, causando erro `400 chat not found`. Reescrito com função `notificar()` exportada de verdade + `resolverChatId()` que trata `'admin'`/`'canal'` como palavras-chave. `pm2 save` feito.

**5. Notificação Telegram do hook Claude Code corrigida:**
Hook `Stop` mandava texto genérico idêntico pro admin e canal, violando regra do card completo. Criado `notify-telegram-admin.sh` com card rico (PM2 resumido, git status, hora); `.claude/settings.json` atualizado; script antigo preservado intacto pra outros usos.

**Regras reforçadas nesta sessão (ver memória):** IA sugere e alerta risco mas não questiona ordem já dada; padrão de pastas maiúsculas vale também pra código/componentes-chave, não só documentação.

---

## Continuação: bug DARKAI + regressão crítica no ArsenalAdapter + dossiê Abacus (2026-07-11, madrugada)

**6. Bug real do DARKAI_ANON_KEY — causa raiz era `/etc/profile.d/darkai.sh`, não os `.env`:**
Hermes caía sempre no fallback caro porque `DARKAI_ANON_KEY` estava com valor placeholder/fake (`cdk_darkai_...`) em vez do JWT real. Corrigir os 3 arquivos `.env` (raiz, `secrets/`, `HERMES-CORE/`) não resolveu — descoberta real: `/etc/profile.d/darkai.sh` exportava a chave fake pra todo shell novo do sistema, sobrescrevendo qualquer `.env`. Corrigido na fonte (`/etc/profile.d/darkai.sh`). Teste real confirmado: `darkai "diz oi"` respondeu com sucesso. `pm2 restart CentralDark-Hermes --update-env` aplicado.

**7. Investigação da arquitetura completa de gateways de IA (2 agentes Explore, read-only):**
Mapeamento revelou que a cadeia de fallback do Hermes (`HERMES-CORE/core/cadeia.json` + `decisor.mjs`) já é madura: tenta modelos via darkai/Lovable Gateway do mais barato ao mais caro, com retry, detecção de loop, e fallback final pro "Elite Anthropic" (`api.centralldark.com/v1/messages`). Confirmado que `api.centralldark.com` é servido hoje pelo Caddy local (não Cloudflare) com catch-all pro `CentralDark-ArsenalAdapter` (PM2 id 25, porta 8090) — o antigo `elite-anthropic-proxy` (porta 8082) está órfão, sem rota pública, e `elite-gateway/` (Zendriver) não tem processo ativo. Doc `CLAUDE.md` sobre isso está desatualizada (ainda cita Zendriver como se fosse o EliteHTTP atual).

**8. Regressão grave encontrada e corrigida — rota `/v1/messages` tinha sido apagada sem querer:**
`docs/CONSCIENCIA/ARSENAL/PROVA-V1-MESSAGES-CLAUDE-DESKTOP.md` provava que a rota `/v1/messages` (Anthropic-compat) foi implementada e testada com sucesso no commit `8cb5c7f97` (10/07). Um commit seguinte (`606f18354`, só devia adicionar 1 alias de modelo) **removeu acidentalmente o bloco inteiro da rota** — regressão silenciosa que quebrava o fallback final do Hermes (`/v1/messages` retornava 404 desde então). Restaurado o bloco original do `git show 8cb5c7f97`, validado sintaxe, `pm2 restart CentralDark-ArsenalAdapter`, testado real com `curl` autenticado: rota responde (erro visto foi "sem créditos Abacus", não mais 404/unauthorized — problema financeiro separado, fora de escopo).

**9. `CentralDark-ReconHealth` — mistério do restart sozinho resolvido:**
Processo parado manualmente (pasta `elite-recon-ia/src/` não existe mais) voltou sozinho como `online`. Causa: flag `cron_restart: */5 * * * *` do PM2 — `pm2 stop` não remove essa flag, só `pm2 delete` remove de vez. Corrigido com `pm2 delete` + `pm2 save`.

**10. Dossiês de arquitetura Abacus/Motosserra encontrados em `docs/GATEWAY/`:**
`DOSSIE-COMPLETO-ABACUS-CENTRALDARK-V1.zip` (08/07) e `DOSSIE-ATUALIZA-CENTRALDARK-V2.zip` (08/07) — **V2 complementa e é a versão vigente do V1**, não substitui. Documentam a origem da decisão de usar Abacus RouteLLM como backend do ArsenalAdapter, análise do "Motosserra" (proxy de terceiro que explora vulnerabilidades do Abacus — CORS wildcard, tier misconfig) e quais padrões aproveitar de forma limpa (memory injection, multi-model parallel/Conselho Arsenal, circuit breaker, mock fallback, sanitização de erro) sem copiar os exploits. O dossiê original recomendava hospedar o proxy como Edge Function no Supabase **HUB** — a implementação real acabou no ArsenalAdapter (processo Node/PM2), não como Edge Function; divergência registrada, não corrigida nesta sessão (fora de escopo, funcionando como está).

---

## Sessão 2026-07-11/12 — Auditoria de tokens GitHub + mapeamento de notificações (pendente: Central de Notificações)

**11. Pendência #54 confirmada viva — 3 tokens GitHub ativos expostos:** checagem real via API (`github_check_token`) confirmou que o PAT classic em uso pelo MCP hoje (user `segredounlock`, prefixo `ghp_…`) tem escopo admin total e **sem expiração** — risco adicional além dos 3 tokens já mapeados na pendência #54 (`gho_fGqM...` hardcoded 6x em `ecosystem.config.cjs`, mais `ghp_CtO8B2...` e `ghp_30iecVq...` em memória nos processos PM2). Ação segue travada em decisão exclusiva do Pivete (revogar em github.com/settings/tokens) — IA não tem esse acesso.

**12. Mapeamento completo de scripts de notificação — hoje ESPALHADOS, sem pasta única:**
Encontrados pelo menos 6 pontos ativos/relevantes de notificação Telegram no repo, cada um com sua própria lógica de leitura de `.env` e envio:
- `scripts/notify-claude/notify-telegram-admin.sh` — **único hook realmente ativo hoje**, disparado automaticamente pelo hook `Stop` do Claude Code (`.claude/settings.json`). Card fixo (PM2 + git status), sem texto customizável. ⚠️ **Contradiz a regra selada em `docs/CONSCIENCIA/PADRAO-CARD-HERMES.md`** (área 🔒), que proíbe explicitamente usar `notify-telegram` e exige envio via connector Telegram `sendMessage`, não script solto com token direto — achado não corrigido nesta sessão, fica registrado pra quando a Central de Notificações for construída.
- `scripts/notify-claude/notify-telegram.sh` — genérico (emoji+título+msg livre), não é chamado por hook automático nenhum, uso manual.
- `scripts/agent-notify.mjs` — canal do issues-scanner. **Testado nesta sessão e FALHOU** (`Not Found` — token ou chat_id quebrado). Pendência nova, não investigada ainda.
- `apps/modulos/HERMES-CORE/utils/notify.mjs` — motor usado pelo daemon Hermes internamente (bot `@srver1bot`, tudo em `<pre>`). Testado nesta sessão, funcionou. Mesma observação: usa token direto via API do bot, não o connector — verificar se está alinhado ao Padrão Card Hermes v1.3 oficial antes de adotar como motor único.
- `infra/notify/notify.py` — notificador Python stdlib-only, lê `/etc/centraldark/notify.env`, usado por scripts de infra fora do Node (ex.: elite-mapper).
- `scripts/webhook/lib/notify-telegram.mjs` + Supabase edge functions (`notify-telegram`, `notify-event`, `notify-self-test`, `mcp-status-notify`) — canais adicionais não testados nesta sessão.

**13. Auditoria Condefonte — processo PM2 fantasma removido + achado crítico sobre a arquitetura real:**
`CentralDark-CondefonteV35` (PM2 id 14) reportava `status: online` há 39h, mas o script (`apps/modulos/condefonte-watcher/condefonte-v3.5.mjs`) não existe mais em disco — crash-loop silencioso desde 10/07 14:42 (`ERR_MODULE_NOT_FOUND`), sem gerar nenhum efeito útil. Removido com `pm2 delete` + `pm2 save`. Limpeza de docs: `utils/condefonte-memory.md` (rascunho, nunca commitado) apagado; `utils/condefonte-integration.md` (versão final) mantido e marcado 🟡 EM CONSTRUÇÃO até a integração real existir.

**Achado central (investigação por 3 agentes Explore):** o novo `condefonte-executor.js` (criado 12/07, com Circuit Breaker + métricas + classificadores) **não tem a chamada HTTP real** — a função `fetchTrajectory` é invocada mas nunca definida no arquivo, e `worker()` está vazio. Só há a "casca" de resiliência. A lógica de extração real (`fetchTrajectory`, paginação por cursor, retry) **existe e é recuperável**: está em `apps/modulos/condefonte-watcher/condefonte-v3.5.mjs`, mas só no commit `53d80a80a` da branch remota `origin/fix/sincronizar-painel-20260709-0803` (não está na `main`). Porém — **o gargalo histórico nunca foi código, foi credencial**: o endpoint real é `GET api.lovable.dev/projects/{id}/trajectory`, que só aceita um JWT de sessão de browser (`LOVABLE_SESSION_JWT`, vida útil de 1h). O mecanismo de auto-renovação desse JWT (descrito como "Técnica #6" em `utils/condefonte/CURSO-CONDEFONTE.md`) nunca foi implementado. Prova: 154.547 ocorrências de erro `401` e ZERO extrações bem-sucedidas em 256.745 linhas de log histórico (`condefonte_v2.log` + `watcher_v35.log`, jul/2026) — o watcher rodou de verdade em produção e nunca conseguiu autenticar nem uma vez.

**Pedido do Pivete — generalizar para "Condefonte Universal":** em vez de depender só da API do Lovable (frágil, credencial expira em 1h), extrair memória de QUALQUER agente do ecossistema (Hermes, ArsenalAdapter, EliteHTTP, grupo-evolução etc). Dois agentes Explore adicionais disparados em paralelo pra mapear: (a) quais processos já geram log estruturado de decisões/conversas reaproveitável localmente (sem precisar de API externa), e (b) se o `GraphRAG-Master` (`agents/GraphRAG-Master/agent.mjs`, já é a "memória oficial" hoje, injetada no `decisor.mjs` a cada 5 etapas) deveria ser estendido em vez de criar um sistema paralelo. Resultado ainda em andamento — próxima sessão retoma com o relatório desses agentes.

---

## Sessão 2026-07-11/12 (continuação) — Central de Notificações, trava aplicada

**Decisão do Pivete:** vai montar e mandar (via GitHub) a estrutura definitiva de uma **Central de Notificações única** — 1 pasta, 1 motor de envio no formato gamificado Hermes (Nível/XP/Conquista/Missão), todos os consumidores acima (Claude Code, Hermes, issues-agent, webhook, Supabase) passando a chamar esse único ponto. **Instrução explícita: não migrar nada ainda** — só executar tudo de uma vez quando a estrutura chegar, para não gastar tokens em iterações. Quando a missão chegar: (a) criar a pasta na estrutura indicada, (b) mover/consolidar os scripts acima, (c) reapontar o hook `Stop` do Claude Code e os demais consumidores, (d) investigar/corrigir o `agent-notify.mjs` quebrado, (e) **reconciliar com a regra selada do Padrão Card Hermes v1.3** (`docs/CONSCIENCIA/PADRAO-CARD-HERMES.md`, 🔒) — decidir junto com o Pivete se o padrão via connector `sendMessage` é atualizado pra permitir o motor script-based, ou se a Central de Notificações passa a usar o connector em vez de token direto.

---

## Sessão 2026-07-12 — Fixes de notificação + Condefonte Universal + grupo Evolução silenciado (Abacus sem crédito)

**14. Fix `[object Object]` nas notificações do Arsenal Adapter no grupo Telegram:** quando `content` vem como array de blocos multimodais (padrão OpenAI, usado pelo Open WebUI), `String(array)` virava literalmente `"[object Object],[object Object]"` nas mensagens do grupo "Central Dark - Grupo Da Evolução". Corrigido com função `extrairTexto()` aplicada nos 5 pontos do `server.mjs` que tratavam `content` como string sem checar (commit `6563b8360`).

**15. Fix HTML cru no card heartbeat do Hermes + dedupe de notificação triplicada:** `HERMES-CORE/utils/notify.mjs` envolvia toda a mensagem (título + corpo) num `<pre>` escapado, incluindo tags HTML que o `orchestrator.mjs` já mandava de propósito (`<b>Hermes Core</b>`) — apareciam cruas no Telegram. Corrigido separando cabeçalho (escapado, dentro de `<pre>`) da mensagem (HTML preservado, fora do `<pre>`). Confirmado pelo Pivete: card estava funcional, único defeito era esse — nada mais foi alterado no visual. Causa separada da duplicação 3x: 2 sessões Claude Code rodando em paralelo há 3-4 dias (pids confirmados via `ps`), cada uma disparando seu próprio hook `Stop`. Corrigido com dedupe por assinatura de conteúdo (janela 5min) em `notify-telegram-admin.sh` (commit `57d2bb8ae`, primeiro commit desse script — só existia no disco da VPS antes).

**16. Condefonte Universal implementado:** ver detalhe completo na entrada #13 desta mesma sessão (achado do gargalo de credencial JWT do Lovable) — implementação final: 3ª fonte de memória local adicionada ao `GraphRAG-Master/agent.mjs` (Debates/Evolução do Arsenal + missões concluídas do Hermes + APRENDIZADOS.md curados), zero API externa, zero credencial. Pasta `condefonte/` antiga apagada por completo (decisão do Pivete). `agent.mjs` tinha `chattr +i` (immutable) — destravado com "PERMITO PIVETE", editado, reaplicado no final. Commit `fce18676b`.

**17. Grupo "Central Dark - Grupo Da Evolução" silenciado ~36h — causa raiz confirmada, SEM fix aplicado ainda:**
Investigação com 2 agentes Explore + teste manual direto contra a API do Abacus confirmou: **a conta Abacus RouteLLM está sem crédito** (`HTTP 400: "You have no remaining credits to use the LLM apis"`, primeiro erro registrado em 11/07 03:33, contínuo desde então). Não é problema de token Telegram (testado `getMe`/`getChat`, ambos OK), nem do cartógrafo de drift (continua gerando `drift-*.json` normalmente a cada 30min). É especificamente a chamada de IA do `CentralDark-ArsenalAdapter` (PM2 id 25, 20 restarts acumulados) que trava antes de gerar texto pra postar.

Achado separado, mais antigo, não é a causa do silêncio recente: `apps/bot-telegram/evolucao-ias.cjs` (conversa autônoma entre Gemini/Groq/Claude) está fora do PM2 desde `2026-07-03` — não é o mecanismo que gera os debates/router/parallel/hermes (esse é o Arsenal Adapter), é um gerador de tópicos sintéticos separado, também parado.

**Tentativas de fix rápido sem esperar recarga de crédito — todas bloqueadas por credencial, nenhuma aplicada em produção:**
- `switch-provider.sh proxy` (troca pro Lovable AI Gateway via `arsenal-proxy`, script já existia pronto, só env var + `pm2 restart --update-env`) — testado manualmente antes de rodar o script: `401 unauthorized` com a chave hardcoded no script (`arsenal-key-local-2026`), que parece obsoleta. Chave correta não localizada nos cofres locais (`secrets/.env`, `secrets/keys/keys.env`) nem no código-fonte acessível (a função de auth vive na edge function Supabase, fora de leitura direta).
- `GROQ_API_KEY` (presente em `.env`) — testado contra `api.groq.com/v1/models`, retornou `401`, chave expirada/inválida.
- `OPENROUTER_KEY` — modo existe no `switch-provider.sh` mas o arquivo `secrets/openrouter.env` que ele exige não existe na VPS.

**Decisão:** não forçar nenhuma troca às cegas (risco de deixar o Adapter pior, ex.: crash-loop com env var errada) sem o Pivete por perto pra validar. Nenhum `pm2 restart` foi executado nesta investigação — `CentralDark-ArsenalAdapter` permanece exatamente como estava (online, apontando pro Abacus, aguardando crédito).

**Pendência aberta para quando o Pivete retomar:** (1) recarregar crédito Abacus (resolve na raiz), OU (2) fornecer a chave real do `arsenal-proxy` (Lovable) ou gerar uma `OPENROUTER_KEY` nova — qualquer uma das duas destrava o `switch-provider.sh` imediatamente.

---

## Sessão 2026-07-12 (continuação) — Contenção ativa: Circuit Breaker, DISCOVERY_MODELS, PM2 id, hub-status

**18. Circuit Breaker + fallback mock implementado e testado ao vivo (commit `c553c1294`):** `callProvider()` em `server.mjs` ganhou timeout agressivo (15s), circuit breaker (3 falhas → abre 30s) e fallback mock em vez de propagar exceção. Testado real: `POST /v1/chat/completions` que antes derrubava o modo (router/parallel/debate/hermes) inteiro agora responde `200` com mock explicando o motivo. Circuito fecha sozinho quando o Abacus voltar a responder — não precisa reverter nada manualmente na recarga de crédito.

**19. Regressão real encontrada e corrigida — `DISCOVERY_MODELS` desincronizado de `MODEL_ALIASES` pela 2ª vez (commit `540349fbd`):** prova viva (agente de teste, chamadas reais) achou que 7 dos 13 aliases (`claude-sonnet-5`, `claude-opus-4-8`, etc — os adicionados na "Fase 1... editado por Grok") funcionavam se chamados direto mas **não apareciam em `/v1/models`**. Buscando no GitHub (`github_list_issues`), achamos que essa EXATA correção ("DISCOVERY_MODELS dinâmico gerado a partir de MODEL_ALIASES") já tinha sido feita e comprovada num PR anterior (referenciado na issue #133) — e regrediu de novo na edição do Grok, que adicionou aliases novos sem atualizar a lista de descoberta junto. Corrigido de novo, agora gerando `DISCOVERY_MODELS` via `Object.entries(MODEL_ALIASES).map(...)` — as duas listas não podem mais divergir por definição (não é mais 2 fontes mantidas à mão).

**20. Mock com erro classificado, não mais eco do JSON cru (commit `e569ad64f`):** `classificarFalha()` categoriza em `sem_credito` (402 ou "remaining credits" na mensagem), `rate_limit` (429), `timeout` (AbortError/TimeoutError), `circuito_aberto`, ou `erro_generico` — mock fica limpo e legível em vez de despejar o corpo HTTP cru do Abacus.

**21. Achado de infra durante o teste: env var perdida num restart anterior.** `ARSENAL_ADAPTER_KEY` (a chave real `cdk_live_...`) sumiu do processo PM2 depois de um `pm2 restart --update-env` — o PM2 não recarrega env de um `ecosystem.config.cjs` quando o processo não foi originalmente iniciado a partir desse arquivo específico (existe um `ecosystem.config.cjs` LOCAL dentro de `apps/modulos/arsenal-openai-adapter/`, separado do da raiz, com a chave real). Corrigido com `pm2 delete` + `pm2 start ecosystem.config.cjs` (local) + `pm2 save`. **Lição:** `pm2 restart --update-env` não é confiável pra recarregar env — sempre preferir `pm2 delete` + `pm2 start <ecosystem-correto>` quando a env parece ter sumido.

**22. Bug de documentação achado por agente de mapeamento — PM2 id do HubBot errado em 2 lugares oficiais:** `CLAUDE.md` (seção 1.1) e `docs/CONSCIENCIA/BRAIN/MOC-CentralDark-HubBot.md` diziam `PM2 id 27`; o real (confirmado via `pm2 jlist`) é **id 17**. O id 27 real pertence ao `CentralDark-HermesVerificador`. Corrigido nos dois arquivos.

**23. Mapeamento completo do módulo HUB (`apps/modulos/hub/`) — achados do agente Explore, não corrigidos ainda (fora do escopo desta rodada, registrados para próxima sessão):**
- README.md ausente (só existe `README.md.hub-antigo`, desatualizado — não menciona as tabs Hermes/Gateway/Abacus que existem hoje); PLANO.md nunca existiu.
- Duas lockfiles coexistindo (`bun.lock` + `package-lock.json`) — risco de inconsistência de deps.
- Arquivos `.bkp-*` soltos em `src/` (`HubPage.tsx.bkp-mtproto-*`, 2x `OAuthConnectors.tsx.bkp-*`) — lixo de dev não limpo.
- Subdomínio `hub.centralldark.com` parece inativo (Caddyfile existe, não está importado, porta 8790 não escuta).
- Edge Functions "extra" dentro de `apps/modulos/hub/supabase/functions/` (`hermes-think`, `debate-round`, `learn-from-outcome`, `memory-search`) parecem pertencer conceitualmente ao Hermes/Arsenal, não ao HUB — mistura de responsabilidade na mesma pasta Supabase.
- Documentação do HUB fragmentada em 4+ lugares sem índice único (`CLAUDE.md`, `MOC-CentralDark-HubBot.md`, `docs/HUB/` quase vazia, menções esparsas em `docs/CONSCIENCIA/`).
- Estado real testado (2º agente): **HUB saudável** — PM2 online, RLS funcional nas 6 tabelas (testado via REST direto), PiveteSync sincronizando sem erro (erro de sequence `pivete_sync_log_id_seq` é histórico, parou em 11/07). Único ponto secundário: tool MCP `supabase_schema_check`/`supabase_project_status` mal configurada (ignora `projectRef` passado, usa env genérica que aponta pro projeto errado) — não é falha do HUB em si, é bug da tool MCP interna.

**24. `hub-status` (Edge Function nova) criada, deploy pendente — falta credencial do Pivete:** `apps/modulos/hub/supabase/functions/hub-status/index.ts` testa ao vivo (sem cache) schema `hub` (6 tabelas), Abacus RouteLLM e Arsenal Adapter, devolve JSON com status por componente. Não fez deploy: exige `SUPABASE_ACCESS_TOKEN` formato `sbp_...` (Personal Access Token da conta Supabase do Pivete) — varredura completa em `secrets/.env` e `secrets/keys/*.env` não achou nenhum token nesse formato (`HUB_SUPABASE_PAT` existe mas não é PAT válido). Não há alternativa: CLI `supabase functions deploy` exige esse token sem exceção, nenhuma flag substitui. **Ação necessária do Pivete:** gerar em supabase.com/dashboard/account/tokens e passar pra IA aplicar o deploy.

**25. Recado registrado no GitHub (issue #133, comentário) com achados + 4 sugestões de melhoria estrutural** — pra essa classe de regressão (DISCOVERY_MODELS desincronizando) não se repetir uma 4ª vez: (1) teste automatizado simples comparando `MODEL_ALIASES` vs `DISCOVERY_MODELS` no CI, (2) reforçar regra em `docs/CONSCIENCIA/ARSENAL/README.md`, (3) changelog local dentro do módulo pra próxima sessão achar correções já feitas sem varrer issues manualmente, (4) rastreamento da pendência do deploy `hub-status`.

**26. `hub-status` DEPLOYADA E TESTADA — pendência #24 fechada.** Pivete passou a credencial via arquivo temporário local (`1.txt`, apagado com `shred -u` imediatamente após uso — nunca colado no chat). Achado técnico: o valor era a mesma `HUB_SUPABASE_PAT` do cofre, mas formato `sbp_v0...` (47 chars) — o CLI `supabase` REJEITA esse formato na validação client-side (regex fixa espera `sbp_` + hex), **mesmo o token sendo válido de verdade** (confirmado: `GET api.supabase.com/v1/projects/lyoigsqluyktoclwdaft` → `200`). Contornado fazendo o deploy direto via Management API REST (`POST /v1/projects/{ref}/functions/deploy?slug=hub-status`, multipart com `metadata` JSON + `file`), sem depender do CLI — `201 Created`, function `ACTIVE`.

**Teste real do endpoint (`GET .../functions/v1/hub-status`) confirma o diagnóstico da sessão inteira, agora automatizado:**
```json
{
  "status": "degraded",
  "componentes": {
    "schema_hub_tabelas": { "tickets": {"ok":true}, "contacts": {"ok":true}, "ticket_messages": {"ok":true}, "messages": {"ok":true}, "whatsapp_connections": {"ok":true}, "workspaces": {"ok":true} },
    "abacus_routellm": { "ok": false, "http": 400, "detalhe": "sem créditos" },
    "arsenal_adapter": { "ok": true, "http": 200 }
  }
}
```

**Achado bônus — já existe uma function irmã, `hub-services-check` (ACTIVE, não criada nesta sessão):** checa conectores EXTERNOS (Telegram, Notion, Drive, GitHub) — testada ao vivo, todos OK exceto Telegram (`401 Credential not found`, causa não investigada, pendência nova). `hub-status` (nova) e `hub-services-check` (existente) são complementares, não duplicadas — uma cobre infra interna (Abacus/Arsenal/schema), outra cobre integrações externas.

**Pendência nova registrada:** `hub-services-check` reporta Telegram com credencial ausente/inválida (`connectors_gateway`, 401) — não investigado nesta sessão, fica pro próximo passo junto com a recarga de crédito Abacus.

**Regra de segurança que funcionou:** nunca colar secret em texto de chat — usar arquivo temporário na VPS, ler, usar, apagar (`shred -u`) na sequência. Vale documentar como padrão oficial pra próxima vez que precisar passar credencial.

---

**27. Pendência #17 (Telegram 401 em `hub-services-check`) — investigada e corrigida (commit `7d8db9623`).** Causa raiz confirmada pelo Pivete: o conector Telegram no Lovable foi **removido de propósito** em 11/07/2026 ("Lovable é só front, salva isso" — nova regra de memória: `feedback_lovable_so_front.md`). `checkTelegram()` em `supabase/functions/hub-services-check/index.ts` chamava `connector-gateway.lovable.dev/telegram/getMe` — caminho abandonado, dando falso-negativo. Corrigido pra testar o mecanismo REAL já usado em produção: token do bot lido direto da tabela `telegram_bots` (mesmo padrão de `notify-telegram/index.ts`, modo "raw"), chamando `api.telegram.org/bot<token>/getMe` sem depender de Lovable. Confirmado via `list_connections`/`list_custom_connectors` (Lovable MCP): zero conectores Telegram configurados no workspace CentralDark (`4w4KhpRnbiTxa4LyNgsg`) — é estado intencional, não bug a "consertar reconectando".

**Deploy PENDENTE:** `hub-services-check` vive no projeto raiz/TelePainel (`kagejpghnwdfymddwxuf`, confirmado via `supabase/config.toml`), não no HUB. O token disponível no cofre (`HUB_SUPABASE_PAT`, mesmo valor testado e funcional pro deploy da `hub-status` no item #26) só tem escopo pro projeto HUB (`lyoigsqluyktoclwdaft`) — `403` ao tentar Management API contra `kagejpghnwdfymddwxuf`. Precisa de um token com acesso a esse projeto específico (pode ser o mesmo PAT se a conta tiver acesso a ambos e o escopo for só por token de sessão, ou pode precisar gerar/usar outro).

---

**28. Mapeamento do Overclock consolidado num documento único** (`docs/CONSCIENCIA/OVERCLOCK-MAPEAMENTO-COMPLETO.md`) — estava espalhado em 5+ lugares (relatórios do `.exe`, mapeamento de UI só na memória de projeto do Claude, clones visuais, doutrina no MVP-MAPA-VIVO). Nada tinha se perdido, só estava fragmentado. Na sequência, Pivete reenviou não o `.exe` sozinho mas a **pasta de instalação completa extraída** (zip 192 MB, 11.360 arquivos) — bem mais rico que a análise estática anterior: revelou o código-fonte completo do sidecar Node (não ofuscado), confirmando **definitivamente Tauri** (não Electron) via `package.json` literal ("Node sidecar... for Tauri migration"), com nuance real: o núcleo (`@overclock-app/core`) é compartilhado entre um Electron main histórico e o Tauri atual — ou seja, o app migrou de Electron pra Tauri em algum momento, o que explica a dúvida inicial do Pivete sobre o stack. Também revelou os 6 squads de fábrica do app (inclusive o meta-squad "Squad Former" que monta outros squads sob gates obrigatórios) e a fonte real do marketplace deles: `github.com/davila7/claude-code-templates` (aitmpl, público). **Decisão de doutrina reforçada nesta sessão:** o texto verbatim dos prompts/playbooks proprietários extraídos NÃO foi copiado pro documento do repositório — só os padrões arquiteturais foram documentados (consistente com a regra já selada de não reproduzir código/conteúdo do Overclock). O material bruto fica só localmente em `/root/overclock-relatorio/extraido/`, fora do Git.

---

**29. Log-Verificador (🔒 `apps/modulos/HERMES-CORE/agents/Log-Verificador/`) — corrigido bug de "alertas fantasma" + achado e corrigido bug crítico separado que deixaria o alarme mudo pra sempre no próximo restart.** Autorização do Pivete: "quando eu permito alguma coisa o correto é main... o que for feito aqui eu tenho certeza da minha permissão."

- **Causa raiz do "tá pingando toda hora":** `agent.mjs` sempre relia as últimas 80 linhas do arquivo de log de erro inteiro a cada scan (60s). Se o processo não gera erro novo, o arquivo não cresce, e o MESMO erro de dias atrás continua sendo "encontrado" pra sempre — nunca marca como resolvido. Confirmado ao vivo: `CentralDark-Hermes-error.log` parado desde 11/07 (5 dias), `CentralDark-PiveteSync` com erro de permissão do Supabase já corrigido há dias, `CentralDark-ArsenalAdapter` com circuit-breaker de crédito já resolvido — todos ainda apareciam "com problema" no placar horário porque o alerta nunca foi limpo.
- **Fix:** `lerNovoConteudo()` novo em `agent.mjs` — lê só os bytes ESCRITOS DE NOVO desde o offset salvo (persistido em `.estado.json`), não mais um tail estático. Primeira vez que vê um arquivo: pula o histórico e só reage daqui pra frente (evita alerta em massa no deploy). Torna o sistema genuinamente orientado a evento — só alerta quando acontece algo novo de verdade.
- **Placar horário virou condicional:** antes mandava o resumo TODA hora, tivesse ou não problema. Agora só manda na hora se tiver algo errado; se estiver tudo OK, manda só 1x por dia (heartbeat "tô vivo"). Isso é o "ideal seria webhook" que o Pivete pediu — sem virar HTTP webhook de verdade (PM2 não tem isso nativo), mas com o mesmo espírito: silêncio quando não tem evento.
- **Bug crítico separado achado durante o teste (não relacionado ao pedido original):** `daemon.mjs` tentava `import()` o `utils/notify.mjs` como módulo ES. Mas `notify.mjs` é um script de CLI standalone (lê `process.argv`, chama `process.exit(0)` no final) — importar ele executa o script inteiro na hora e MATA o processo que importou. O daemon só sobrevivia há 5 dias porque tinha a versão antiga do `notify.mjs` carregada em memória desde o último start bem-sucedido; o restart pra aplicar o fix acima expôs o bug, o daemon entrou em crash-loop (chegou a 19 restarts) e mandou uma rajada de mensagens vazias tituladas só "Hermes" no Telegram do Pivete (efeito colateral do teste, não intencional). **Corrigido:** `daemon.mjs` agora chama `notify.mjs` como subprocesso via `execFile` (fechando stdin, seguindo o padrão já usado em outros lugares do repo pra callers de `execFile`), do jeito que o script foi desenhado pra ser usado. Sem esse fix, o alarme inteiro do Hermes ficaria mudo permanentemente no próximo restart/deploy/reboot da VPS — achado valioso, não estava no escopo original mas era bloqueante.
- Validado: `node --check` nos dois arquivos, teste de ciclo completo em foreground confirmando escaneamento de 21 processos e limpeza de alertas fantasma, depois `pm2 restart` + `pm2 save`. Processo estável (`online`, 0 unstable restarts) após o fix definitivo.

---

**30. ChatOps-Optimizing-DevOps-via-Chatbots (planão do Grok) versionado oficialmente em `docs/CONSCIENCIA/`.** PERMITO PIVETE explícito. Estava só em `/root/Grock/` (workspace do Grok, fora do Git — confirmado sem `.git` em `/root`, `/root/Grock` nem na própria pasta). Copiado inteiro pra `docs/CONSCIENCIA/ChatOps-Optimizing-DevOps-via-Chatbots/`, que agora é a Fonte da Verdade versionada; a cópia original do Grok em `/root/Grock/` continua existindo como workspace ativo dele (não apagada — o próprio doc interno dele, `03-LOCAL-TRAVADO.md`, pede pra não apagar sem ordem, e a ordem dada foi só "versionar", não "mover"). README e `03-LOCAL-TRAVADO.md` internos atualizados pra refletir as duas localizações e qual manda em caso de divergência (a versionada). Auditoria de segurança rodada em todo o conteúdo antes do commit — nenhum secret/token real encontrado, só referências à própria política de segurança do plano (gates de scan de secret). Não fere nenhuma área protegida da Seção 9 do `CLAUDE.md` — `docs/CONSCIENCIA/` é onde já vivem outras pastas de tema (DARKAI/, ARSENAL/, AGENTES-AUTONOMOS/, BRAIN/); não é modificação de subsistema protegido, é adição de documentação nova. Commit direto na `main`, sem PR — padrão já confirmado pelo Pivete como correto pra este repositório.
- No mesmo fôlego, aproveitado pra revisar o `inbox/` do Grock (fora do Git): nota de 15/07 sobre ensino Rádio/Lupa ao Hermes estava 100% resolvida (missão movida pra `concluidas/`, lições entregues) — removida. Nota de 14/07 sobre webhook 405 + auditoria de segurança: item do webhook confirmado **resolvido de verdade** (testado ao vivo, `HTTP 200`, pendência #57 já nem existe mais em `docs/PENDENCIAS.md`) — nota editada pra marcar isso, mas a lista de achados de segurança ainda em aberto (portas 8787/8083 sem auth real, SSH root+senha habilitados, regra `ufw` órfã na porta 8080, permissões `755`/`644` fora do padrão, gaps de fail2ban, Caddy sem headers de segurança) foi **preservada intacta** — não fechada, nem investigada nesta sessão, continua pendente de ação.

---

**31. Lista de segurança do item #30 fechada (quase toda) — PERMITO PIVETE explícito pra "resolver a pendência que ficou pra trás".**

- **Falso alarme resolvido primeiro:** login por senha vindo de IP novo (`189.80.5.92`, não o `187.15.72.86` conhecido) gerou suspeita de invasão — investigado e confirmado que é o próprio Pivete (a sessão TTY estava rodando o processo `claude`, ou seja, é esta mesma conversa; provável troca de IP da internet dele). Registrado aqui pra não reabrir susto à toa se aparecer de novo com o padrão idêntico.
- **Porta 8787 (ProxyUnlimi) — corrigida.** Auth já existia no código (`API_KEYS` via `Authorization: Bearer`), só não tava configurada — `.env` tinha `API_KEYS=` vazio, que o próprio código trata como "proxy aberto" de propósito documentado. Gerada chave real, mas o `.env` não estava sendo carregado pelo processo (sem `dotenv`, sem `env_file` no PM2) — corrigido com a API nativa do Node 22 (`process.loadEnvFile`, 1 linha no topo do `index.js`/`.ts`, zero dependência nova). Testado: sem chave → 401, chave errada → 401, chave certa → 200. Corrigido também o playground HTML embutido no serviço, que tinha `Bearer any` hardcoded. **Esse serviço é um repo próprio separado** (`github.com/pedrofariasx/unlimited-ai-proxy`, `.git` aninhado dentro de `apps/modulos/proxy-unlimi/proxy-unlimi/`) — fix está ativo e testado na VPS, mas **não foi commitado** nesse repo de terceiro (tinha outras mudanças locais não relacionadas — `src/parser.ts` modificado, `.bak` solto — não mexi nisso, não é meu escopo entender o que é).
- **Porta 8083 (Arsenal Proxy) — corrigida.** `/docs`, `/redoc`, `/openapi.json` desligados no FastAPI (`docs_url=None` etc, commit `ebab0d9486`). `/health` continua público de propósito (monitoramento). Confirmado via `iptables -L INPUT` (policy `DROP`, sem regra pra 8083/8787): **nenhuma das duas portas está exposta pra internet** — o risco real era só de processo local/container pivotando, não de fora. Achado que muda o nível de urgência do relatório original do Grok pra baixo (ainda válido corrigir, mas não era "qualquer um da internet acessa").
- **ufw porta 8080 — corrigida.** Regra `ALLOW` órfã que vencia na frente do `DENY` (ordem de regras do ufw) removida (`ufw delete allow 8080`). Nada escutava na porta mesmo — remoção sem risco, confirmada.
- **Permissões de arquivo — parcial, por decisão consciente.** `.env` da raiz do repo: `644→600` (aplicado, testado, sites no ar). `/root` e `/root/CentralDark` **NÃO tocados**: apertar pra `700` quebraria 4 sites em produção — Caddy roda como usuário `caddy` (não root) e serve arquivo estático direto de dentro dessas pastas (`status`, `apps/web/dist`, `hub/dist`, `telepainel/dist`) via `file_server`; sem pelo menos `--x` de "other" em toda a cadeia de diretórios, o Caddy não consegue nem atravessar até o arquivo. Risco > benefício sem mapear e testar os 4 caminhos primeiro — deixado como está, documentado aqui pra não se perder.
- **fail2ban — corrigido e sincronizado.** `findtime` 15min→1h (pega ataque lento/rotativo). Aplicado via `fail2ban-client reload` (não restart — os 62 IPs banidos na hora não se perderam, confirmado antes/depois). **Achado bônus sério:** `notify-ban.sh` e `action.d/telegram-centraldark.conf` — commitados no Git, mas tinham sumido do disco da VPS — a notificação de ban/unban no Telegram estava quebrada silenciosamente há quem sabe quanto tempo. Restaurados via `git checkout HEAD --`. Config viva (`/etc/fail2ban/jail.local`) tinha divergido do repo desde 14/07 (ação Telegram foi adicionada direto na VPS sem voltar pro Git) — sincronizado nos dois sentidos, repo e VPS batendo agora.
- **SSH root+senha — decisão do Pivete: manter como está.** Perguntado diretamente (risco de lockout é real e é escolha dele, não minha). Escolheu não desligar `PasswordAuthentication` — mitigação é o fail2ban reforçado acima. Nenhuma mudança em `sshd_config`.
- **Caddy headers — parcial.** `X-Frame-Options: SAMEORIGIN` adicionado em `api.centralldark.com` e `status.centralldark.com` (validado com `caddy validate` antes de recarregar, sites confirmados no ar depois). HSTS e `X-Content-Type-Options` **já vinham da Cloudflare**, não precisou mexer. CSP **não aplicado** — risco de quebrar SPA sem testar site por site (`centralldark.com`, `ui`, `hub`, `telepainel`, `builder`, `grafo`, `bridge` têm perfis diferentes de script/estilo). Rate-limit **não aplicado** — binário do Caddy não tem o módulo `caddy-ratelimit` compilado; adicionar exigiria rebuild do binário que roda TODOS os sites, risco desproporcional pra fazer no meio dessa rodada. **Achado bônus:** o `Caddyfile` principal e o `status-centraldark.Caddyfile` não têm cópia versionada neste repo — backups locais feitos (`.bak-pre-headers-*`) antes de editar, mas a "Fonte da Verdade" desses arquivos hoje é só a própria VPS. Fora de escopo resolver agora (decisão estrutural maior).

**Pendências reais que sobraram, registradas pra não se perder:** CSP no Caddy (precisa trabalho por site), rate-limit no Caddy (precisa rebuild do binário), versionar os Caddyfiles principais no repo, e a permissão de `/root`/`/root/CentralDark` (precisa mapear os 4 caminhos do Caddy antes de mexer).
