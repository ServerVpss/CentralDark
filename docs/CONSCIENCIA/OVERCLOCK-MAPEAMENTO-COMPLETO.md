# 🎮 OVERCLOCK — Mapeamento Completo (consolidado)

```
┌──────────────────────────────────────────────────────────┐
│ 🎯 O QUE É ESTE DOCUMENTO                                  │
│ Consolidação de TUDO que já foi mapeado do app Overclock   │
│ (overclock.sh) pra servir de referência de arquitetura     │
│ na hora de construir nosso próprio sistema (Central HUD /  │
│ Mapa Vivo CentralDark).                                     │
│                                                              │
│ STATUS GERAL: 🟢 completo — stack confirmado, código-fonte  │
│ do sidecar obtido e analisado (ver seções 10-13)             │
└──────────────────────────────────────────────────────────┘
```

> **Objetivo real (não confundir):** o alvo nunca foi só clonar a landing page de marketing do overclock.sh. O alvo é o **aplicativo** — o cockpit multiagente completo (panes, squads, MCP local, missões, harness). O clone da página (`overclock-next`, `overclock-cockpit`) é só um artefato visual secundário/decorativo. O mapeamento que importa de verdade é o das seções 3, 4 e 5 abaixo.

---

## 1. Linha do tempo

| Data | Evento |
|---|---|
| 08/07/2026 | `.exe` compilado (build CI, evidência interna do binário) chega na VPS em `/root/CentralDark/overclock.exe` |
| 12/07/2026 | Análise estática do `.exe` feita 2x em paralelo (Claude + Grok) — resultado: Tauri + WebView2 + sidecar Node |
| 12/07/2026 | Pivete mapeia manualmente, print por print, as 15 seções da UI do app (Config Geral → Rules) |
| 12/07/2026 | Projetos de referência visual criados: `overclock-cockpit`, `overclock-next` (clone da landing page, porta 18001) |
| 12/07/2026 | Início do desenho do `Central HUD` (`/root/central-hud/ARQUITETURA.md`) — nosso destino final |
| 12–14/07/2026 | Grok abre missão paralela de crawl do site público (`FIO-ATIVO-OVERCLOCK-ARQUITETURA.md`) — **fica travada** aguardando path de vault (nunca concluída) |
| ~13/07/2026 | `.exe` original é apagado do disco (nunca foi commitado no Git — política de não versionar binário de terceiro) |
| 16/07/2026 | Pivete pede resgate do mapeamento; localizado espalhado em 5 lugares; consolidado neste documento |
| 16/07/2026 | Pivete reenvia — em vez do `.exe` solto, manda a **pasta de instalação completa extraída** (zip 57,6 MB / 192 MB descompactado, 11.360 arquivos): `node.exe` oficial, `overclock.exe`, `uninstall.exe` (NSIS), `resources/` (6 squads de fábrica) e `sidecar/` (código-fonte Node completo, não ofuscado) |
| 16/07/2026 | Stack **confirmado definitivamente**: Tauri (não Electron) — ver seção 10. Gaps 2 e 3 da seção 8 (sidecar e IPC) fechados com evidência direta de código-fonte |

---

## 2. Onde cada peça estava (mapa de arquivos, antes da consolidação)

| Peça | Local original |
|---|---|
| Laudo técnico do `.exe` (oficial) | `/root/overclock-relatorio/ANALISE-OVERCLOCK.md` |
| Laudo técnico do `.exe` (paralelo, Grok) | `/root/Grock/ChatOps-Optimizing-DevOps-via-Chatbots/lab-bin/ANALISE-OVERCLOCK-EXE.md` |
| Missão de crawl do site (inacabada) | `/root/Grock/mem/maps/FIO-ATIVO-OVERCLOCK-ARQUITETURA.md` + `/root/Grock/notes/AGUARDANDO-VAULT-OVERCLOCK.md` |
| Mapeamento de UI completo (print a print) | memória de projeto Claude (`project_central_hud.md`) — não era arquivo do repositório, por isso "sumiu" |
| Clone visual (landing page) | `/root/overclock-cockpit/` (React/Vite) + `/root/overclock-next/` (Next.js, porta 18001) |
| Desenho do sistema próprio (destino) | `/root/central-hud/ARQUITETURA.md` + `game-state.json` |
| Doutrina oficial já registrada no repo | `docs/GOVERNANCA/MVP-MAPA-VIVO-CENTRALDARK.md` (seções 10 a 20) |
| Plano Lovable "Sala de Controle" (Cockpit) | `/root/CentralDark/missoes/GROCK.txt` |
| Plano de auto-piloto (painéis por agente) | `/root/.claude/plans/cozy-herding-steele.md`, fase 5 |

---

## 3. O `.exe` — análise técnica (engenharia reversa estática)

**Arquivo analisado:** `/root/CentralDark/overclock.exe`
**Tamanho:** 15.564.800 bytes (~14,8 MB)
**Hash SHA-256:** `689b2c5f5535ab39a106a6c6407f65882cc7bb7a0aba4423557595b59130d68a`
**Compilado:** 08/07/2026 21:42 UTC, runner GitHub Actions (`C:\Users\runneradmin\...`)
**Método:** só estático (`strings` + `objdump`, PE header) — não rodou (VPS é Linux, `.exe` é Windows).

### 3.1 O que é
"Overclock" — **ADE multi-agent (Tauri shell)**, versão **1.1.0**, bundle id `sh.overclock.app`. Orquestrador desktop de agentes de IA de código (Claude Code, Codex, Antigravity etc.), com UI web local.

### 3.2 Stack confirmada pelas evidências no binário

| Camada | Tecnologia | Evidência (string literal no binário) |
|---|---|---|
| Runtime desktop | **Tauri 2.11.2** (Rust) | `tauri-2.11.2` nos paths de crates, `window.__TAURI_INTERNALS__`, `Tauri IPC`, `src-tauri` |
| WebView | **WebView2** (Microsoft Edge runtime) | `Microsoft.WebView2Runtime.Stable_8wekyb3d8bbwe` |
| Frontend | build estático servido pelo Tauri | path de build `packages/shell/out/renderer` (cheira a Next.js export estático) |
| Sidecar | **Node.js** externo, spawnado pelo processo Rust | `OVERCLOCK_NODE_BIN`, `node.exe`, eventos `sidecar_spawn_failed`/`sidecar_retry` |
| Updater | `tauri-plugin-updater` + **minisign** (ed25519) | pubkey embutida (`FE425A3FF626D396`), endpoint `github.com/ustoppble/overclock-releases` |
| WebSocket | `tungstenite 0.28.0` | plugin `tauri-plugin-websocket` |
| Plugins Tauri | `clipboard-manager`, `deep-link`, `dialog`, `notification`, `single-instance`, `updater`, `websocket` | nomes literais de plugin no binário |

**Deep link registrado:** `overclock://callback` — fluxo de OAuth/login via browser externo voltando pro app.

### 3.3 Origem / monorepo
Path de build revela estrutura de monorepo privado (`overclock-app`, diferente do repo público de releases `overclock-releases`):
```
overclock-app/                  ← repo privado real
├─ src-tauri/                   ← backend Rust (Tauri 2.11.2)
└─ packages/
   └─ shell/                    ← frontend (gera .../shell/out/renderer)
```

### 3.4 Orquestração de agentes (achado mais relevante)
- `OVERCLOCK_RESOURCES_DIR` aponta pra pasta com **`squad-former/PLAYBOOK.md`** — arquivo injetado como system prompt pros agentes orquestrados.
- Bate com issue pública conhecida (`overclock-releases#1`): injeção de playbook funciona em **Claude Code**, mas ainda não em **Codex**/**Antigravity** (bug reportado pelos próprios usuários do app).
- Nomes literais dos comandos CLI (`claude`, `codex` etc.) **não aparecem** nas strings do Rust — devem estar no sidecar Node (`OVERCLOCK_SIDECAR_PATH` → `sidecar/dist/index.js`), que é JS empacotado à parte, fora deste binário.

### 3.5 Variáveis de ambiente internas

| Env var | Uso aparente |
|---|---|
| `OVERCLOCK_VERSION` | `1.1.0` |
| `OVERCLOCK_RESOURCES_DIR` | pasta de recursos (playbooks etc.) |
| `OVERCLOCK_DATA_DIR` | dados persistentes |
| `OVERCLOCK_SESSION_JSON` | sessão em `%APPDATA%\Overclock\session.json` |
| `OVERCLOCK_SIDECAR_PATH` | path do `sidecar/dist/index.js` (Node) |
| `OVERCLOCK_NODE_BIN` | path do `node.exe` embutido |
| `OVERCLOCK_KEYSTORE_VIA_STDIN` | injeção de chave via stdin (`OVCKEY:`, `OVCLEGACY:`) — keystore local com migração de formato legado |

### 3.6 O que NÃO deu pra confirmar (gap real — ver seção 8)
- Conteúdo real do frontend do **app** (não da landing page) — bundle comprimido, `strings` não reconstrói.
- Comandos IPC customizados (`#[tauri::command]`) — nomes não identificados com confiança.
- Nomes literais dos CLIs orquestrados — ficam no sidecar Node, fora deste binário.
- Layout completo do monorepo além de `src-tauri/` e `packages/shell/`.

---

## 4. Mapeamento de UI — print a print (Pivete, 12/07/2026)

Mapeamento manual, tela por tela, das **15 seções da barra lateral** do app (não da landing page — do app de verdade rodando). Feito 100%, confirmado fechado pelo Pivete.

### 4.1 Config Geral
Terminal embutido com panes/workspaces (multiplexador). Tema (escuro/claro), cursor piscando, uso de GPU, tamanho/altura de fonte, shell padrão (3 detectadas no SO), **"LLM padrão do orquestrador agêntico"**, mic/saída de áudio única (vale pro ClockVoice e Jarvis — áudio nativo só no Tauri, indício de versão web/Electron paralela), 14 atalhos de teclado estilo tmux (Ctrl+T novo pane, Ctrl+Tab workspace seguinte, Ctrl+1-9 trocar pane), opt-in de telemetria (ranking público de tokens, desativado por padrão).

### 4.2 Jarvis
Assistente de voz "ULTRA". Elemento **flutuante/arrastável tipo radar** (HUD overlay, não fixo no layout). Aviso: monitora tela e mic continuamente, custo de tokens alto. Config: nome do usuário/assistente (vira wake word), instruções/persona, toggle wake word, credencial Gemini Live.

### 4.3 Harness (Arsenal + Receitas)
**Achado-chave** — sistema de inventário estilo RPG. "Arsenal" (peças) → "Receitas" (o que dá pra fazer). Categorias: Agents, Skills, Mídia, LLMs/CLIs (com contador). Filtros: **rank** (chefe/worker), **tier** (scout/builder/reviewer), **origem** (Overclock/terceiro). Botão F5 "Enriquecer" (LLM organiza/anota o arsenal automaticamente).

**Aba Receitas** (achado mais valioso pro Playbook/Squad):
- "2 · Delegação por chefe → acionamentos": 3 chefes fixos — `oc-chef-scout` (`scout:research`), `oc-chef-builder` (`build:assemble`), `oc-chef-reviewer` (`review:qa`). Tópicos em formato `fase:ação`.
- Cada chefe aciona 1+ workers nomeados (`overclock-worker-design-extractor`, `-copy`, `-media`, `-encode`, `-frontend`, `-qa`), cada um com modelo próprio.
- Semântica: **"Em paralelo"** (scout/builder disparam workers simultâneos) vs **"Primeiro"** (reviewer roda sequencial).
- **Isto é o squad.json na prática** — vocabulário adotado: `chefe-<papel>` recebe `topico:acao`, aciona `worker-<especialidade>` com `modelo` + modo (`paralelo`/`sequencial`).

### 4.4 Marketplace
Catálogo público `overclock.sh` — **1263 componentes** (418 agents + 845 skills). Busca + filtro por tipo/categoria (`development-team`, `security`, `devops-infrastructure` etc.), contador de instalações, botão "Instalar" 1-clique.
**Achado arquitetural chave:** instala DIRETO em `~/.claude/agents/` ou `~/.claude/skills/` e re-escaneia na hora — não é sistema isolado, é camada de marketplace em cima do mecanismo nativo do Claude Code. **Implicação:** o CentralDark pode ler `~/.claude/agents/` e `~/.claude/skills/` direto como fonte real do painel Inventário, sem construir marketplace do zero.

### 4.5 Mídia
Providers de imagem/vídeo/voz viram MCP tools. **Padrão de segurança bom:** a key fica no processo principal — o agente só dispara a tool e recebe o caminho do arquivo gerado, nunca vê a key. 4 providers: Google Image/Gemini, OpenAI Image, Replicate/Seedance, ElevenLabs.

### 4.6 Providers
Dois grupos: **"CLIs · login externo"** (detecta CLIs já logadas na máquina — Claude Code, Grok etc., status ativo/inativo, contagem de modelos) vs **"Providers remotos/API"** (chave direta). Claude Code suporta múltiplas contas nomeadas com reconexão sem logout.

### 4.7 Agents / Skills / MCPs / Tools / Plugins (catálogo local, 4+1 camadas)
- **Agents**: catálogo local por CLI (claude/codex/antigravity), tags (Frontend, AI, DevOps, Marketing...), tabela ordenável.
- **Skills**: mesmo catálogo, com modal "Catalog Detail": Installations (path físico real), **Portability** ("Copy this skill to another CLI" via **symlink** — edita uma vez, reflete em todas), Raw Metadata JSON, Disable/Remove.
- **MCPs**: badges "Overclock" vs "Suas". Raw Metadata mostra `command`/`args`/`env_keys` — só **nomes** de env var, nunca valores. Tentar revelar dá erro "reveal not supported in sidecar" — UI isolada, zero acesso a segredo real.
- **Tools**: introspecção de ferramentas nativas por CLI (Bash, Edit, Glob, Grep, Read, Task, TodoWrite, WebFetch, WebSearch, Write, NotebookEdit + `apply_patch`/`update_plan` do Codex) — auto-descoberto, não inventado.
- **Plugins**: nível acima do Skill — um Plugin agrupa 1+ Skills, agrupados por marketplace de origem.

Taxonomia completa: **Agents** (personas) / **Skills** (procedimentos) / **MCPs** (servidores externos) / **Tools** (funções nativas) / **Plugins** (pacotes).

### 4.8 Rules
Allow/deny por padrão de comando (igual `permissions` do Claude Code). Cada CLI tem seu próprio arquivo de regras; o catálogo só agrega/exibe.

### 4.9 ClockVoice
STT local-first: **Local** (whisper.cpp, zero custo) vs **Groq** (API key, custo). Captura por tecla (padrão SPACE, Hold/Toggle). Modo **CODE** (traduz fala pra inglês técnico, resposta em PT-BR) vs **CHAT**. Prompt de vocabulário técnico fixo pra enviesar reconhecimento (initial prompt do Whisper).

### 4.10 Squads
Um squad = **1 Piloto/Orquestrador fixo** ("Overclock Orchestrator", modelo configurável) + **N workers** do catálogo de Agents, cada um com **task** (executor/scout/reviewer) + **skills** + CLI próprio. Permissão de providers de mídia por squad (checkbox — o que não tá marcado fica invisível e bloqueado). Botão final "Save & Spawn".

### 4.11 Novo Workspace (wizard 4 passos)
Pasta/SSH → Modo (Livre/Squad/Agêntico) → **Panes** (1/2/4/8/12, visual) → **Providers** (aloca panes por modelo com validação `N/total`). Testado até 12 panes simultâneos.

### 4.12 Nova Missão — modo Agêntico
Piloto "⚡ DINÂMICO" com dois estilos de orquestração nomeados:
- **Cadeia de Comando**: piloto → chefe da área → chefe escala funcionários → entrega. Hierárquico.
- **Torre de Controle**: controlador despacha direto pra executor → piloto revisa e apresenta. Roteador central, sem hierarquia fixa.

Escopo de recursos por missão: CLIs (hoje só Claude ativo, "Fase 1") + Mídia (mesmos providers, escopados por missão).

### 4.13 Confirmação de arquitetura geral
Overclock **não reimplementa IA** — orquestra CLIs reais instaladas (passo 3 pós-instalação = `npm i -g @anthropic-ai/claude-code`). "Provider Claude" dentro do Overclock é o Claude Code CLI de verdade rodando num pane. Login via deep-link OAuth (`overclock://callback`).

---

## 5. Achado máximo — servidor MCP local próprio (52 tools)

Via tela "Diagnóstico Local" (menu conta → Diagnóstico): **toda a cockpit UI é cliente de um servidor MCP local** que o próprio Overclock sobe.

- Porta `57767`, SSE em `http://127.0.0.1:57767/sse`.
- **52 tools**, por categoria:
  - **Panes**: `pane_spawn`, `pane_write`, `pane_write_many`, `pane_read`, `pane_read_many`, `pane_wait_idle`, `pane_wait_many`, `pane_list`, `pane_close`, `pane_whoami`, `pane_list_providers`.
  - **Handoff**: `handoff_submit`, `handoff_list`.
  - **Missões**: `overclock_mission_spawn_pane`, `overclock_mission_list`, `overclock_mission_create`, `overclock_mission_get`, `overclock_mission_set_status`.
  - **Agents/Skills/Models**: `overclock_agent_list`, `overclock_agent_get`, `overclock_agent_invoke`, `overclock_skill_list`, `overclock_model_list`.
  - **Catálogo**: `overclock_marketplace_search`, `overclock_catalog_install`, `overclock_catalog_uncategorized`, `overclock_catalog_overlay_write`, `overclock_catalog_inventory`, `overclock_catalog_stacks_write`, `overclock_catalog_status`.
  - **Squads**: `overclock_squad_save`, `overclock_squad_list`, `overclock_squad_get`, `overclock_squad_spawn`.
  - **Mídia**: `overclock_image_generate`, `overclock_video_generate`, `overclock_audio_generate`, `overclock_media_providers`.
  - **Agendamento**: `overclock_cron_create`, `overclock_cron_list`, `overclock_cron_delete`.
  - **Memória**: `overclock_memory_write`, `overclock_memory_read`.
  - **Interação**: `overclock_clarify`, `overclock_navigate`, `todo_manager`.
  - **Observabilidade**: `app_observe_once`, `app_watch`, `app_status`, `app_events`, `app_pane_contents`, `app_screenshot`.
- Painel de auto-diagnóstico compara panes backend (`pty:list`) vs panes do renderer da UI — alerta se dessincronizar.

**Implicação direta pro Central HUD:** em vez de só um aggregator lendo arquivos, o modelo mais robusto é um **servidor MCP local próprio** expondo tools equivalentes (`centraldark_mission_list`, `centraldark_pendencia_list`, `centraldark_memory_write`, `centraldark_cron_create`...) — daí QUALQUER IA e a própria UI consomem a mesma fonte, sem duplicar lógica.

**Diferença chave vs Overclock:** o MCP deles é local (127.0.0.1) porque é app desktop sem servidor próprio. O Central HUD **não tem essa limitação** — já existe VPS 24/7 + gateway oficial (`api.centralldark.com`). Requisito confirmado pelo Pivete: quer os **dois** — local (rápido, na própria VPS) e remoto (via gateway), com toggle explícito na UI (mesmo padrão do ClockVoice Local vs Groq).

---

## 6. Onde isso vira o "nosso sistema" (destino da implementação)

| Peça do Overclock | Onde vira realidade no CentralDark |
|---|---|
| Painéis de terminal por agente (panes) | `.claude/plans/cozy-herding-steele.md`, Fase 5 "auto-piloto" — grade de painéis, 1 por agente (scout/reviewer/builder-1/builder-2), log ao vivo, custo $/painel, barra de progresso |
| Cadeia de Comando / Torre de Controle | `docs/GOVERNANCA/MVP-MAPA-VIVO-CENTRALDARK.md` §7 e §12 — orquestrador/chefe/worker, contrato de missão gamificado |
| Squads + Harness (rank/tier) | MVP-MAPA-VIVO-CENTRALDARK.md §13 — catálogo de squads/skills adaptado (`/dispatch-chief`, `/swarm-architect`, `/wave-execute` etc.) |
| Watchdog de agente travado | MVP-MAPA-VIVO-CENTRALDARK.md §11 |
| Isolamento por missão (org_id) | MVP-MAPA-VIVO-CENTRALDARK.md §10 |
| Handoff obrigatório | MVP-MAPA-VIVO-CENTRALDARK.md §9 |
| MCP local 52 tools | proposta de servidor MCP próprio do Central HUD (seção 5 acima) — ainda não implementado |
| HUD visual (setores/inventário) | `/root/central-hud/ARQUITETURA.md` + `aggregator/` + `game-state.json` — v0 já rodando com dado real |
| Cockpit "Sala de Controle" (Lovable) | `/root/CentralDark/missoes/GROCK.txt` — plano de UI `/admin/cockpit` com Mapa Vivo central + Feed Hermes + Console, layout inspirado no Overclock |
| Estilo visual (fundo escuro, HUD) | Confirmado: fonte do Overclock é miúda/densa demais — Central HUD usa letras **maiores**, mais legível (diretriz do Pivete) |

**Regra travada (MVP-MAPA-VIVO §16):** *"Overclock inspira. CentralDark governa. Ferramenta muda. Fluxo fica."* — nunca copiar marca/código proprietário, só o padrão de arquitetura.

---

## 7. Artefatos de código auxiliares (referência visual, não o mapeamento em si) — 🗑️ removidos em 16/07/2026

- `/root/overclock-cockpit/` — projeto React/Vite/Tailwind. Continha `reference-original.html` (592 linhas, HTML real raspado) + `overclock-original.css` — **era da LANDING PAGE de marketing (overclock.sh o site), não da UI do app** (que é o que está mapeado na seção 4). Não confundir os dois.
- `/root/overclock-next/` — clone Next.js da mesma landing page, rodava na porta **18001**, repositório git próprio.
- Ambos eram só referência estética — não tinham a lógica do app (panes, squads, MCP local). **Deletados por decisão do Pivete (16/07/2026)** — eram clones descartáveis do site de marketing, sem valor arquitetural único (o que importa está nas seções 10-13, extraído do código-fonte real). Processo órfão do `overclock-next` (porta 18001) foi encerrado antes da remoção.
- **O que ficou:** só `/root/overclock-relatorio/` (laudo `.exe` + `Overclock.zip` + `extraido/` com o código-fonte completo do sidecar) — mantido de propósito porque o projeto ainda está em construção e pode precisar de revisão.

---

## 8. Pendências (atualizado 16/07/2026 — pasta de instalação completa recebida)

1. **🟢 RESOLVIDO — Stack confirmado definitivamente: Tauri, não Electron.** Ver seção 10 — evidência direta no `package.json` do sidecar, não mais inferência por strings.
2. **🟢 RESOLVIDO — Sidecar Node.js obtido e analisado por completo.** Código-fonte TypeScript compilado (não ofuscado, com `.d.ts` e testes) — 26 módulos principais mapeados. Ver seção 11.
3. **🟢 RESOLVIDO — Protocolo IPC identificado.** Pacote `@overclock-app/ipc-types` expõe os schemas reais (`WsAuth`, `WsInvoke`, `WsEvent`, `WsClientMessage`/`WsServerMessage`, `ProviderContract`, `PtySpawnConfigContract`). Ver seção 11.
4. **🟢 ENCERRADO (16/07/2026) — Crawl público do site.** Missão do Grok (`FIO-ATIVO-OVERCLOCK-ARQUITETURA.md`) nunca rodou a Fase A (ficou pra trás quando a sessão foi puxada pro incidente de brute force SSH); Fase B (vault key) nunca foi necessária. Decisão do Pivete: encerrar — o objetivo de fundo já foi resolvido, e com muito mais qualidade, pela engenharia reversa direta do código-fonte (seções 10-13). Não retomar salvo pedido explícito.
5. **🟢 RESOLVIDO — UI real do app vs. landing page**, já esclarecido na seção 7. A descrição da seção 4 (prints do Pivete) é suficiente pra implementar; não é pixel-perfect mas não é gap crítico.
6. **🟡 ABERTO por decisão de doutrina, não por falta de dado — texto verbatim dos prompts/playbooks proprietários não foi copiado pra este documento.** Temos o conteúdo completo (system prompt injetado no Claude Code, os 6 `PLAYBOOK.md` dos squads de fábrica) salvo localmente em `/root/overclock-relatorio/extraido/` (fora do Git, não commitado). Este documento registra os **padrões** extraídos deles (seções 12-13), não o texto original — consistente com a regra já selada de não reproduzir código/conteúdo proprietário do Overclock. Se precisar do texto exato de novo, está na pasta local.

---

## 10. Confirmação definitiva do stack (16/07/2026 — pasta de instalação completa)

Em vez do `.exe` solto, o Pivete mandou a **pasta de instalação inteira, já extraída** (`Overclock.zip`, 57,6 MB comprimido / 192 MB descompactado, 11.360 arquivos). Isso é bem melhor que um instalador fechado: é o app tal como roda de verdade na máquina Windows dele.

**Conteúdo da raiz:** `node.exe` (85 MB, Node oficial **v22.16.0**, PE32+ real) · `overclock.exe` (15.564.800 bytes, hash `689b2c5f...` — idêntico ao analisado em 12/07) · `uninstall.exe` (confirmado **NSIS** — Nullsoft Installer self-extracting) · `resources/` · `sidecar/` · `.overclock-app/` (dados de sessão local).

**Veredito: é Tauri, não Electron.** Evidência direta (não mais inferência por `strings`): o `package.json` do sidecar declara literalmente:
```
"description": "Node sidecar — WebSocket host serving Overclock core for Tauri migration"
```

**Nuance importante que explica a dúvida do Pivete:** o pacote `@overclock-app/core` (compartilhado) se descreve assim:
```
"description": "Shared transport-neutral core for Overclock (Electron main + Tauri Node sidecar)"
```
Ou seja: **o app JÁ FOI Electron antes e migrou pra Tauri.** O núcleo de lógica (`core`) foi desenhado "transport-neutral" de propósito pra funcionar nos dois shells durante a migração, e ainda carrega esse nome/histórico. O que roda hoje, de fato, na versão que o Pivete tem instalada, é o shell **Tauri** com sidecar Node — confirmado por três evidências independentes: (1) strings do `.exe` (`__TAURI_INTERNALS__`, `tauri-2.11.2`, WebView2), (2) `node.exe` separado e oficial (Electron não precisaria disso — o processo principal do Electron já É Node), (3) descrição literal do `package.json` do sidecar.

---

## 11. Arquitetura interna do sidecar — pacotes `@overclock-app/*`

| Pacote | Descrição oficial (do próprio `package.json`) |
|---|---|
| `sidecar` | Node sidecar — host WebSocket servindo o core do Overclock (migração pra Tauri) |
| `core` | núcleo transport-neutral compartilhado entre Electron main e Tauri Node sidecar |
| `pty` | **PTY manager** — spawna e controla os processos de CLI de agente IA (é literalmente o motor das "panes") |
| `bus` | **SQLite** message bus + fila de tarefas — primitiva central de coordenação |
| `ipc-types` | schemas/tipos IPC compartilhados entre Rust (Tauri) e o sidecar Node |
| `catalog` | gerencia manifesto de comandos / catálogo do Harness |
| `mcp` | servidor MCP embutido — expõe capacidades do app (panes, browser) como tools pro Claude Code |
| `orchestrator` | pasta presente, não detalhada nesta rodada |

**Dependências confirmadas relevantes:** `@anthropic-ai/claude-agent-sdk` (^0.3.198 — SDK **oficial** da Anthropic, não reimplementação), `@modelcontextprotocol` (SDK MCP oficial), `hono` + `express` (dois frameworks web coexistindo), `ws`, `@xhayper/discord-rpc` (Discord Rich Presence — feature que não tinha aparecido no mapeamento de UI), `zod` (validação de schema), `selfsigned` (certificado local, provavelmente pro WebSocket seguro).

**Módulos principais do `sidecar/dist/` (26, fora testes):**

| Arquivo | Papel |
|---|---|
| `WsHost.js` | host WebSocket principal — ponte entre o Rust/Tauri e o sidecar Node |
| `ClaudeTranscriptWatcher.js` / `CodexTranscriptWatcher.js` | **método de observação elegante**: em vez de interceptar stdout em tempo real, monitora os arquivos de transcript que o próprio Claude Code/Codex já escrevem em disco — não precisa parsear PTY, só lê o log oficial da CLI |
| `remoteSpawn.js` / `remoteBridge.js` | spawn remoto via SSH (workspaces remotos) |
| `spawnHelpers.js` / `core.js` | spawn local dos CLIs (`claude`, `codex`) |
| `mcpCliInject.js` | injeta config MCP + system prompt na hora de chamar a CLI |
| `cronTickLoop.js` | motor de agendamento (`overclock_cron_*`) |
| `db.js` | acesso ao SQLite do `bus` |
| `catalogStore.js` | persistência do catálogo/Harness |
| `discordRichPresence.js` | Discord Rich Presence |
| `GeminiLiveSession.js` / `JarvisMemory.js` / `JarvisService.js` / `JarvisWakeLock.js` | motor completo do Jarvis (voz) |
| `previewServer.js` | servidor de preview ao vivo |
| `harnessAssistant.js` | provável lógica por trás do botão F5 "Enriquecer" do Harness |

**Protocolo IPC confirmado** (pacote `ipc-types`, arquivo `wsProtocol.d.ts`): tipos `WsAuth`, `WsEvent`, `WsInvoke`, `WsClientMessage`, `WsReply`, `WsServerMessage`, mais os contratos `ProviderContract`, `ProviderSessionContract`, `PtySpawnConfigContract`. Confirma um modelo de mensagens WebSocket tipadas — auth → invoke → reply/event — com contrato formal pra "Provider" (CLI/conta) e "PtySpawnConfig" (como abrir uma pane).

---

## 12. Como ele invoca o Claude Code CLI de verdade

Confirmado via `.overclock-app/session.json` — uma sessão real capturada na máquina do Pivete (pane `pane-39`, workspace `E:\CentralDark\repo`, provider `claude`, `permissionMode: bypassPermissions`).

**Comando real (flags, não conteúdo criativo — reprodução literal é só parâmetro técnico):**
```
claude --session-id <uuid> --dangerously-skip-permissions
       --mcp-config <path>\mcp-pane-pane-N.json
       --disallowedTools Task
       --allowedTools <~50 tools nativas + mcp__overclock__*>
       --append-system-prompt "<prompt injetado>"
       --settings '{"skipDangerousModePermissionPrompt":true}'
```
**Env vars:** `CLAUDE_CODE_DISABLE_ALTERNATE_SCREEN=1` (permite capturar output em PTY sem tela alternada) · `OVERCLOCK_PANE_ID=pane-N`.

**Padrões de prompt engineering aprendidos (resumo/paráfrase — texto original não reproduzido aqui, ver seção 8 item 6):**
- Bloqueia a tool nativa `Task` (subagente invisível) de propósito, forçando todo agente delegado a passar por `pane_spawn` — garante que TUDO que a IA faz apareça visível na grade de painéis. Regra explícita: nunca gerar agente invisível em background.
- Define critério claro de quando delegar (trabalho paralelo independente, perspectiva de modelo diferente, tarefa longa que bloquearia) vs quando não delegar (trabalho sequencial fortemente acoplado — delegar aí só atrasa).
- Espera não-bloqueante: escreve em várias panes de uma vez e espera "qualquer uma responder primeiro", em vez de fazer polling fino manualmente.
- Política de workspace explícita (modo de acesso declarado, workspace primário nomeado, pede autorização se sair do escopo) — mesmo espírito das áreas protegidas do nosso `CLAUDE.md`.
- Nota de idioma: se o ditado chegar traduzido pro inglês (pipeline de voz), trata como fala do usuário; responde sempre em PT-BR por padrão.

---

## 13. Squads embutidos de fábrica (6 confirmados)

| Squad | Papel |
|---|---|
| `absurd-landing` | monta landing pages (agents: marketing de conteúdo, engenheiro frontend React, redator de prompt, revisor/analista de screenshot, UI designer, pesquisador UX) |
| `cinema` | produção de vídeo com IA (director, diretor de fotografia, editor, som) |
| `cinema-site` | site pra apresentar produções do squad cinema (builder, creative, director, DP, editor) |
| `qa-swarm` | QA em enxame (builder, observer, reviewer, scout, worker) |
| `qa-vision` | QA visual/navegador (navegação por visão, resolvedor, revisor estático + skills próprias de protocolo de achado/correção) |
| `squad-former` | **meta-squad** — monta OUTROS squads sob demanda |

### Padrão do Squad Former (o mais relevante pro nosso Playbook/Squad do Central HUD)

- É um orquestrador **"gated"** — bloqueado de rodar Bash/Edit/Write de propósito. Essa é a trava de segurança: ele só PODE compor + instalar + persistir configuração, nunca executar código de verdade.
- Fluxo: entende o objetivo (perguntas uma de cada vez, nunca questionário raso) → propõe 2-3 topologias (sequencial / paralelo / híbrido) → **GATE 1** (aprovação explícita do desenho) → delega a pesquisa de catálogo pro único agente que ele pode invocar (`search-specialist`) → **GATE 2** (aprovação explícita de instalação, mostrando a proveniência de cada componente de terceiro) → só ENTÃO compõe e persiste o preset final (`squads.json`).
- Nunca constrói o projeto do usuário — o squad que ele monta é que faz o trabalho real depois, não ele.
- **Fonte real do catálogo/marketplace:** `aitmpl` → `github.com/davila7/claude-code-templates` — repositório **público** real no GitHub, não é acervo fechado do Overclock. Vale conhecer se quiser inspiração de agents/skills prontos, é aberto.
- Regra de "nunca vazar vocabulário interno pro usuário leigo" — traduz termos técnicos (gate, handoff, topology, scout/executor/reviewer) pra linguagem humana antes de falar com quem não é engenheiro. **Padrão direto aplicável ao jeito que já nos comunicamos com o Pivete** (cards, gamificação, sem jargão cru).

---

## 14. Referências cruzadas

- Memória de projeto (histórico da sessão original): `project_central_hud.md`
- Doutrina oficial já commitada: [`docs/GOVERNANCA/MVP-MAPA-VIVO-CENTRALDARK.md`](../GOVERNANCA/MVP-MAPA-VIVO-CENTRALDARK.md)
- Plano Cockpit Lovable: `/root/CentralDark/missoes/GROCK.txt`
- Plano auto-piloto: `/root/.claude/plans/cozy-herding-steele.md`
- Arquitetura do destino (Central HUD): `/root/central-hud/ARQUITETURA.md`
- Código-fonte bruto extraído do instalador (sidecar completo, resources, session.json) — **local, fora do Git**: `/root/overclock-relatorio/extraido/`
- Catálogo público real usado pelo Squad Former: `github.com/davila7/claude-code-templates` (aitmpl)
