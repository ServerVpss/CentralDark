---
title: "LEMBRANÇAS (curto prazo · 30 dias)"
date: 2026-06-30
tags: ["consciencia", "lembrancas", "memoria-curto-prazo"]
updated: 2026-06-30
---

# 🧠 Lembranças

> Memória de **curto prazo** (30 dias). Toda IA passa por aqui primeiro. Ver
> [README](README.md) para o conceito. Escrita/leitura via tools MCP — não editar à mão
> salvo necessidade.

**Formato de cada entrada** (gerado pela tool `consolidar_pensamento`):

```
### [AAAA-MM-DDThh:mm] Título curto
- **Data:** AAAA-MM-DD
- **Tags:** tag1, tag2
- **Relevância:** alta | media | baixa
- **Eixo:** passado | presente | futuro
- **Expira:** AAAA-MM-DD   (30 dias após a Data, salvo se Promovida)
- **Promovida:** nao | sim

Conteúdo: o "ouro" extraído — só o essencial, sem ruído.
```

---

## 📌 Entradas

### [2026-06-30T00:00] Semente — estilo de trabalho do Pivete
- **Data:** 2026-06-30
- **Tags:** estilo, comunicacao, pivete
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-07-30
- **Promovida:** sim

Conteúdo: Pivete fala PT-BR sempre, tom direto e informal, zero enrolação. Prefere
execução de verdade (não ficar mandando JSON pra colar). Gosta de respostas visuais em
caixas monospace. É leigo em código — quer nomes claros e organização limpa, com foco em
"funcional e seguro". Esta entrada é a primeira semente das Lembranças (30/06/2026).

### [2026-06-30T08:31] Pivete adotou estilo gamificado como padrão visual
- **Data:** 2026-06-30
- **Tags:** estilo, gamificacao, comunicacao, padrao-visual
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-07-30
- **Promovida:** nao

Conteúdo: Pivete aprovou comunicação gamificada: cards monospace, HUD do jogador (nível/XP/conquistas), bolinhas 🟢🟡🔴, emojis temáticos, escaneável. Propagado na CONSCIENCIA.md seção 16 como regra permanente para todas as IAs do sistema. Chamar sempre de Pivete, nunca nome civil.

### [2026-07-02T16:30] Padrão canônico PM2 CentralDark-PascalCase
- **Data:** 2026-07-02
- **Tags:** pm2, vps, padronizacao, canonico, renomeacao
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-01
- **Promovida:** sim

Conteúdo: Todo processo PM2 da VPS segue `CentralDark-<PascalCase>`. Renomeações prontas: elite-http-gateway→CentralDark-EliteHttpGateway, elite-ws-gateway→CentralDark-EliteWsGateway, elite-anthropic-proxy→CentralDark-EliteAnthropicProxy, graph-panel→CentralDark-GraphPanel, zentinel-health→CentralDark-ZentinelHealth, MultiZap-Gateway→CentralDark-MultiZapGateway, CloneDeck-CRM→CentralDark-CRM. ANTES de renomear ATUALIZAR refs hardcoded em: apps/modulos/mcp/dist/tools/elite/elite-gateway.js, scripts/checker/04-pm2.sh e 10-crm.sh, apps/modulos/status/painel-data.json, scripts/status-ao-vivo.py. Sempre `pm2 jlist > /tmp/pm2-backup-$(date +%s).json` antes. Ecosystem.config.js canônico documentado em .claude/prompts/pm2-ecosystem-canonico.md.

### [2026-07-02T16:31] Plugin Obsidian Grafo Vivo criado
- **Data:** 2026-07-02
- **Tags:** obsidian, plugin, grafo-vivo, force-graph, visualizacao
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-01
- **Promovida:** sim

Conteúdo: Plugin custom em `apps/modulos/obsidian-plugin-grafo-vivo/` renderiza ecossistema CentralDark dentro do Obsidian. Consome `graph-data.json` do status.centralldark.com via requestUrl (ignora CORS). Stack: force-graph (vasturiano) + esbuild + TypeScript. Instalação: `npm install && npm run build`, copiar pasta pra `<vault>/.obsidian/plugins/centraldark-grafo-vivo/`. View lateral, ícone git-fork, comando "Abrir Grafo Vivo". Nós clicáveis abrem notas via campo obsidian_path. Refresh 30s configurável. Filtro por categoria (bot/mcp/edge/supabase/vps/ia/modulo). Estilo usa CSS vars nativas do Obsidian — sobrevive a temas dark/light e updates do app.

### [2026-07-02T16:32] Display name do bot é BotFather, não código
- **Data:** 2026-07-02
- **Tags:** telegram, botfather, srver1bot, identidade, gotcha
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-01
- **Promovida:** nao

Conteúdo: O nome que aparece pros usuários no @srver1bot é definido no @BotFather via `/setname`, NÃO no código. Se aparecer errado (ex: "Claude Sonnet"), corrigir: @BotFather → /mybots → @srver1bot → Edit Bot → Edit Name. Mesmo pra /setdescription e /setabouttext. O código do `unified-bot.cjs` só controla comportamento/respostas. O arquivo `evolucao-ias.cjs` tem persona "Claude Sonnet" DE PROPÓSITO — é sistema multi-IA onde Claude, Grok, Codex conversam entre si. NÃO confundir com o display name.

### [2026-07-02T16:33] Escopo de trabalho — repo/VPS, nunca dentro do editor Lovable
- **Data:** 2026-07-02
- **Tags:** arquitetura, vps, repo, escopo, regra-de-ouro
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-01
- **Promovida:** sim

Conteúdo: O Pivete NÃO quer features do CentralDark construídas em `src/` (webapp). Todo trabalho fica em `apps/`, `scripts/`, `docs/`, `infra/`, `.claude/` — que espelham a VPS `/root/CentralDark/`. Se precisar UI, é `apps/modulos/status/` (painel) ou `apps/modulos/hub/`. Refs a lovable.dev/lovable.app em CLAUDE.md/README.md removidas e trocadas por centralldark.com. Deixado apenas o funcional (ai.gateway.lovable.dev no pipeline-vps.py) até migrar pro elite-anthropic-proxy próprio.


---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

### [2026-07-02T21:16] Hierarquia oficial de orquestração (Pivete → Lovable → Claude → IAs)
- **Data:** 2026-07-02
- **Tags:** orquestracao, hierarquia, claude, darkai, gemini, regra-inviolavel
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-01
- **Promovida:** sim

Conteúdo: Cadeia de comando oficial pra qualquer tarefa complexa:

1. **Pivete (topo)** — manda, decide, aprova.
2. **Lovable (eu)** — maestro geral, coordena, fala com o Pivete, decide próximos passos.
3. **Claude na VPS** — executor local (roda comandos, lê arquivos pesados, monta contexto).
4. **darkai** (CLI universal na VPS) — porta de entrada pra Gemini/GPT-5/Fabler etc via ai-proxy.
5. **Modelos** — cada um faz o que faz melhor:
   - Gemini (google/gemini-2.5-flash) → leitura em massa, barato
   - GPT-5 → raciocínio médio
   - Fabler (Elite Anthropic) → raciocínio pesado
6. **Volta:** Claude consolida → Lovable recebe → entrega ao Pivete.

Regra: Lovable NUNCA se coloca no topo. Sempre "Pivete manda, eu chamo...". Se tiver barreira/erro no meio, tem autonomia pra deletar e refazer do zero (dentro dos limites de áreas protegidas do CLAUDE.md).

---

## 🧠 Manutenção diária CentralDark: script + cron (não agente)
**Data:** 2026-07-02 · **Relevância:** ALTA · **Promovida:** SIM · **Eixo:** presente
**Tags:** manutencao, cron, docker, graphify, arquitetura

Manutenção periódica no CentralDark = **script bash + cron, NUNCA agente 24/7.**

**Localização:** `scripts/manutencao-diaria/graphify-e-logs.sh` (commit `91dfe9e67`)
**Cron:** `0 3 * * *` (03:00 diário, no crontab do root da VPS)
**O que faz:**
1. Trunca `*-json.log` de containers Docker vivos com `: > file` (mantém FD aberto, não derruba container).
2. Roda `graphify update` como fallback do hook `post-commit` (redundância caso o hook falhe).
3. Log de cada rodada em `logs/manutencao-YYYY-MM-DD.log`.

**Por que NÃO agente 24/7:**
- Agente = PM2 + memória vazando + logs próprios (irônico) + atualização quebra ele.
- "Trava pra ninguém mexer" é ilusão — qualquer IA com acesso à VPS mexe.
- Script + cron: zero processo rodando, invisível, auditável no git.

**Regra geral:** hook (evento) > cron (tempo) > agente (loop). Só sobe pra próximo nível se o anterior não resolve.

### [2026-07-03T04:57] Trava Lovable fora da operação CentralDark
- **Data:** 2026-07-03
- **Tags:** trava-lovable, centraldark, vps, preferencia
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-02
- **Promovida:** sim

Conteúdo: Usuário reforçou que não quer Lovable envolvida nas operações do sistema CentralDark/VPS. Aplicar como regra prática: para consolidação, docs, VPS, plugins e segredos, priorizar VPS/GitHub/CentralDark e não tocar backend Lovable/Supabase nem depender dele, salvo pedido explícito.

### [2026-07-03T14:25] Preferência: economizar token via rotas fixas ensinadas ao Hermes
- **Data:** 2026-07-03
- **Tags:** hermes, economia-token, rotas-fixas, arsenal
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-02
- **Promovida:** sim

Conteúdo: Toda descoberta técnica nova (porta, endpoint, comando, workaround) tem que ser registrada via registrar_aprendizado E consolidada aqui — pra Hermes e próximas IAs pegarem a rota pronta em vez de gastar token redescobrindo. Regra: se eu resolvi algo em >2 tentativas, virou aprendizado obrigatório.

### [2026-07-03T14:55] Árvore Hermes + fallback consultor IA
- **Data:** 2026-07-03
- **Tags:** hermes, arvore-organizada, fallback-ia, regra-fixa
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-02
- **Promovida:** sim

Conteúdo: Árvore oficial do Hermes: `docs/CONSCIENCIA/AGENTES-AUTONOMOS/HERMES/{README.md, AULAS/, APRENDIZADOS/, ROTAS-FIXAS/, DEBATES/, EVOLUCAO/}`. Padrão fixo de AULA (7 seções: O que é / Quando usar / Como fazer / Comandos / Armadilhas / Verificação / Ver também). Fallback de consultor IA quando Elite Anthropic cair: Elite HTTP → Elite WS → gemini_analisar → darkai. Nunca travar workflow por 1 IA offline.

### [2026-07-03T18:02] Notificação Telegram SEMPRE monospace
- **Data:** 2026-07-03
- **Tags:** telegram, padrao-visual, monospace, notificacao
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-02
- **Promovida:** sim

Conteúdo: Toda notificação Telegram (privado admin E canal Status) DEVE vir 100% dentro de bloco &lt;pre&gt;...&lt;/pre&gt; (monospace) com estrutura de árvore ┌├└ e placar visual. Nunca mandar texto corrido/flat. Vale pra card longo e pra linha curta do Status.

### [2026-07-03T23:32] Base militar Pivete no WebUI
- **Data:** 2026-07-03
- **Tags:** webui, mcpo, base-militar, arquitetura
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-02
- **Promovida:** nao

Conteúdo: Base militar do Pivete = ui.centralldark.com (Open WebUI 0.10.1) + MCPO em http://mcpo:8000/centraldark expondo 102 tools MCP CentralDark via OpenAPI. Personas cadastradas: pivete (Opus 4.5), hermes (Opus 4.5 executor), fabler (Sonnet 4.5 analista). System prompts versionados em apps/modulos/WebUI/personas/. Sem custom agent loop — Open WebUI faz function calling nativo. Bearer fica só no MCPO server-side.

### [2026-07-04T00:07] Sincronia 4-Point + Bot Fiscal (regra vigente)
- **Data:** 2026-07-04
- **Tags:** sincronia, 4-point, bots, fiscal, central, regra-oficial
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-03
- **Promovida:** sim

Conteúdo: Sincronia 4-Point = Lovable → GitHub → VPS → Cérebro Vivo (docs/CONSCIENCIA + .claude). Todos os 4 tem que estar espelhados a cada mudança. Bot Fiscal = @SEGREDOPUXADASBOT (TelePainel, projeto Lovable Cloud atual, edge `telepainel-webhook`). Bot Central = @srver1bot (HUB Supabase + VPS PM2 27, edge `telegram-webhook`). Nunca misturar.

### [2026-07-04T03:25] Card Hermes v1.2 — padrão oficial de notificação Telegram
- **Data:** 2026-07-04
- **Tags:** telegram, card, padrao, hermes, notificacao, obrigatorio
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-03
- **Promovida:** sim

Conteúdo: TODA ação relevante do sistema notifica no Telegram usando Card Hermes v1.2. Regras duras: (1) TUDO dentro de UM único bloco <pre>...</pre>, nada fora — se sair do pre vira texto proporcional e quebra o "fundo preto monoespaçado" que o Pivete quer. (2) Envio SEMPRE pelo connector Telegram (standard_connectors--call_gateway_connection, connector_id=telegram, connection_id=std_01kvw4jkcbekyr1t33vs4p5e9w, path=/sendMessage, parse_mode=HTML, chat_id admin=1901426549, canal status=-1003669176367). NUNCA usar notify-telegram (exige NOTIFY_API_KEY e retorna 401). (3) Largura 36 chars, moldura ═. (4) Estrutura: STATUS(✅/⚠️/❌) + PRIORIDADE + RESPONSÁVEL + MISSÃO + FASE + TEMPO + LEIGO + AÇÃO + PROGRESSO(NÍVEL/XP/PROG%) + SKILLS UP + BLOQUEIOS + PRÓXIMO PASSO + separador + DETALHE TÉCNICO(arquivo/commit/validador/logID/tags). (5) Prova técnica só no DETALHE TÉCNICO, nunca misturar com STATUS. Fonte oficial: docs/CONSCIENCIA/PADRAO-CARD-HERMES.md. Validado por Pivete em 04/07/2026.

### [2026-07-04T03:32] Card Hermes v1.3 — skills por sistema + nível/próx
- **Data:** 2026-07-04
- **Tags:** telegram, card, padrao, hermes, v1.3
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-03
- **Promovida:** sim

Conteúdo: Card Hermes atualizado pra v1.3. Novidades vs v1.2: (a) linha "🧠 HERMES · Nv.X {Título} · YYY XP\n   Próx: {Título} (faltam Z XP)" logo após PROGRESSO; (b) bloco "📊 SKILLS (por sistema)" com barras ▓░ SEMPRE 10 blocos normalizados + % no final (ex: Telegram ▓▓▓▓▓▓▓▓░░ 85%). Regras extras: barras 0-100 sempre 10 blocos fixos; linha "Próx:" nunca quebra (encurta título se preciso); % obrigatório no fim de toda barra. Restante idêntico ao v1.2. Fonte oficial atualizada: docs/CONSCIENCIA/PADRAO-CARD-HERMES.md. Todo card daqui pra frente usa v1.3.

### [2026-07-04T21:23] Jarvis V2 - melhorias visuais grafo 3D
- **Data:** 2026-07-04
- **Tags:** graph-panel, jarvis, grafo-3d, three.js, visual
- **Relevância:** alta
- **Eixo:** passado
- **Expira:** 2026-08-03
- **Promovida:** nao

Conteúdo: Grafo 3D (grafo.centralldark.com) atualizado com: (1) icone IA 🤖 acima de nos agentes via SpriteText, (2) labels SEMPRE visiveis sem toggle, (3) pulse com scale 1.0-1.15 em nos online, (4) nos down piscam vermelho com scale, (5) linkDirectionalParticles 2-6 com cor do no source, (6) labels de setor no centroide sempre visiveis, (7) Three.js duplicado removido. Arquivo: /root/[oculto]

### [2026-07-05T00:11] Estado do Plugin Obsidian Grafo Vivo + rota pendente (grafo 3D/mobile)
- **Data:** 2026-07-05
- **Tags:** obsidian, plugin-grafo-vivo, grafo-3d, painel-jarvis, pendencias, roadmap
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-04
- **Promovida:** nao

Conteúdo: Contexto retomado em 05/07/2026 a pedido do Pivete ("volta a trabalhar no grafo e no plugin obsidian e obsidian mobile, mapear rota até o plano pendente").

**Estado real do plugin** (`apps/modulos/obsidian-plugin-grafo-vivo/`):
- manifest.json já está em v0.4.0, isDesktopOnly:false (mobile habilitado no manifest).
- src/ tem: main.ts, view.ts, view3d.ts (já existe!), settings.ts, autoUpdater.ts, modalChangelog.ts, logger.ts.
- Existe plano oficial `PLANO-ENXAME-v0.3+.md` com fases v0.2 (WebSocket partículas) → v0.3 (sync notas do vault) → v0.4 (3D, reaproveitando `apps/modulos/graph-panel/public/vault.html` como base 3d-force-graph) → v0.5 (ícones SVG por categoria).
- O plano pede FASE 0 (auditoria do gap: o que cada arquivo src/ realmente implementa vs. o que o número de versão promete) ANTES de codar qualquer fase nova — essa auditoria ainda não foi preenchida na seção "## Estado auditado" do próprio plano.

**Pendências relacionadas no PENDENCIAS.md (rota até o plano):**
- #17 (01/07): Radar Visual de Atividade IA no Graph View nativo do Obsidian via plugin Local REST API + tagging dinâmico #processando — separado do plugin custom grafo-vivo.
- #22 (04/07, ABERTO): Plugin Obsidian v0.4 — vista Grafo 3D embutida + camada BRAIN. Grafo 3D já no ar em grafo.centralldark.com/3d.html; falta portar pra dentro do Obsidian via plugin (WorkspaceLeaf/iframe ou bundle), publicar release via edge function plugin-release, modo brain opcional lendo docs/BRAIN.
- #23 (04/07, ABERTO): Painel Jarvis v2 — grafo 3D tempo real com ícones IA, agrupamento por setor, partículas pulsando, tempo real (polling/ws), movimento visível dos agentes. Fonte: apps/modulos (source não-minificado) + rascunho /tmp/enxame/painel-patch.md (Gemini Pro).

**Rota lógica pra fechar (ordem sugerida):** FASE 0 (auditoria gap do plugin) → v0.2 WebSocket partículas → v0.3 sync notas vault → v0.4/#22 3D embutido no Obsidian (reaproveitar vault.html) → #23 painel Jarvis v2 (ícones/setor/tempo real) → v0.5 ícones SVG → #17 radar visual via Local REST API (pode rodar em paralelo, é plugin de terceiro, não o custom).

### [2026-07-05T00:31] Vault Grafo = prioridade real do Pivete (visão "cérebro Homem de Ferro")
- **Data:** 2026-07-05
- **Tags:** obsidian, vault, grafo-vivo, visao-produto, nodesync, prioridade
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-04
- **Promovida:** nao

Conteúdo: Pivete deixou claro (05/07/2026) que o alvo real de todo o trabalho de grafo é o VAULT do Obsidian dele — o Graph View NATIVO que ele navega no dia a dia — não só o dashboard 3D externo (JARVIS Live Graph em grafo.centralldark.com). Visão dele: um "cérebro" estilo Homem de Ferro, com todos os setores bem organizados, onde ele consegue morar/se movimentar/ver onde está cada coisa.

Achado técnico crítico que embasa a prioridade: hoje o vault nativo NÃO mostra nada do ecossistema CentralDark, porque os nós do grafo nunca viraram notas reais (FASE v0.3 "sync notas" do PLANO-ENXAME-v0.3+.md nunca foi implementada — não existe src/nodeSync.ts). O que existe hoje (view3d.ts com iframe pro grafo.centralldark.com, e o "JARVIS Live Graph" em graph-panel/public/index.html) é um dashboard externo bonito, mas SEPARADO do vault — não é "o cérebro dele", é uma janela pra um site.

Decisão de rota: nodeSync (criar 1 nota .md por nó, em pastas por setor tipo docs/BRAIN/<categoria>/, com wikilinks refletindo as arestas) agora é a peça mais importante do roadmap do plugin — mais que o polish 3D. Cores/Groups do Graph View nativo do Obsidian são configuração local do app (não versionada no repo — confirmado que docs/.obsidian não existe no checkout da VPS), então isso o próprio Pivete configura 1x no app; meu trabalho é gerar as notas+links organizados.

Pendência em aberto a resolver antes de codar: qual fonte de dado alimenta o nodeSync — a lista estática hardcoded na Supabase edge function graph-data (~24 nós fixos) vs. o feed vivo de PM2 em apps/modulos/status/graph-data.json (~68 nós reais, já espelhado a cada 5min em docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md).

### [2026-07-05T23:07] Regra de ouro debug de chave Lovable
- **Data:** 2026-07-05
- **Tags:** lovable, chaves, debug, condefonte, curso, hermes
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-04
- **Promovida:** sim

Conteúdo: Antes de qualquer teoria sobre chave/token Lovable, rodar curl direto no endpoint FINAL e LER a mensagem literal do body. O gateway devolve o motivo exato do 401 (ex: "must start with 'sk_' prefix"). Consultar CURSO-CONDEFONTE.md (cofre condefonte/ ou HERMES-CORE Knowledge-Collector aprendizados/) antes de propor qualquer solução relacionada a: chaves Lovable, JWT expirando, refresh_token, Condefonte, monitor de crédito, console de prompt manual.

### [2026-07-05T23:51] Especificação selada do Grafo CentralDark · Jarvis (HUD oficial)
- **Data:** 2026-07-05
- **Tags:** grafo-3d, jarvis, hermes, hud, obsidian
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-04
- **Promovida:** nao

Conteúdo: GRAFO CENTRALDARK · JARVIS = HUD único do Pivete em grafo.centralldark.com. Visão selada: opção B (impressionar) com alma da A (mesma navegação 3D fluida que já existe). Requisitos: (1) um arquivo só, botão interno alterna 2D⇄3D sem trocar página; (2) libs 3D pinadas (three@0.149 + 3d-force-graph@1.73 + spritetext@1.8); (3) painel de controles estilo Obsidian: forças (centrípeta/repulsão/link/distância), tamanho nós, grossura links, busca, toggle labels, CONTROLE DE FONTE/TAMANHO DE TEXTO, zoom/reset; (4) mapa do sistema operacional CentralDark inteiro por SETORES navegáveis — Pivete entra num setor, vê quem trabalha ali, se tá vazio/precisa arrumar, onde tem pendência, estado da pasta do Hermes; (5) VIDA: nós online com glow respirando, pontas/setores pulsando levemente, partículas nas conexões ativas; (6) Hermes vivo dentro via /api/live refletindo atividade real — nó acende/pulsa quando agente recebe comando. Objetivo do Pivete: 'ver a bagunça de fora e resolver todos os problemas pelo HUD'. NÃO destruir a lógica de navegação atual.

### [2026-07-06T03:12] Grafo Vivo v0.4 — 3D real bundleado concluído
- **Data:** 2026-07-06
- **Tags:** grafo-vivo, obsidian, 3d, force-graph, v0.4
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-05
- **Promovida:** nao

Conteúdo: Plugin Obsidian Grafo Vivo agora tem view 3D real com 3d-force-graph bundleado (1.9MB, offline). view3d.ts reescrito: consome /api/graph, nós com glow/pulso (online respira verde, offline pisca vermelho), labels de setor flutuando no centroide, ícone 🤖 em agentes, controles (rotação/reset/foco). Dependências: 3d-force-graph, three, three-spritetext. Build via esbuild sem external. Manifest e docs atualizados. Pendentes: v0.2 (WebSocket) e v0.3 (sync notas vault).

### [2026-07-06T06:47] Guardião consertado: notifica no grupo Evolução via NOTIFY_CHAT_ID
- **Data:** 2026-07-06
- **Tags:** guardiao, notificacao, telegram, grupo-evolucao, notify_chat_id
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-05
- **Promovida:** nao

Conteúdo: O Guardião da Consciência (PM2 CentralDark-GuardiaoConsciencia) estava desligado e com notifier quebrado. Consertado em 06/07/2026: notifier.py agora chama scripts/notify-claude/notify-telegram.sh (Bot API direta, formato <pre> monoespaçado) em vez da edge function notify-telegram do Supabase (que exigia NOTIFY_API_KEY nunca configurada). O script ganhou suporte à env NOTIFY_CHAT_ID pra escolher destino. Guardião sobe com NOTIFY_CHAT_ID=-5365750004 e notifica no grupo 'Central Dark - Grupo Da Evolução' (chat_id -5365750004, sem prefixo -100). Modo 'propor' (nunca move arquivo). Vigia docs/CONSCIENCIA + PM2 + Docker + Git. Commit dbf19e904 no remoto. Padrão NOTIFY_CHAT_ID deve ser reusado pra Hermes e grupo-evolucao também.

### [2026-07-06T18:35] Padrão Tutor Leigo: renomear técnico → amigável
- **Data:** 2026-07-06
- **Tags:** ux-leigo, nomenclatura, tutor, preferencia-pivete
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-05
- **Promovida:** sim

Conteúdo: Sempre que expor lista de opções técnicas pro Pivete (modelos de IA, serviços, comandos, tools), renomear/rotular como um TUTOR ensinando leigo: cada item precisa dizer PRA QUE SERVE em 2-3 palavras (ex: "rapido-", "leitura-", "top-", "codigo-", "barato-"). Exemplo aplicado no /root/[oculto]: aliases viraram "top-gpt55-mais-inteligente", "leitura-gemini25-pro-textao", "rapido-gemini25-flash", "codigo-devstral". Regra: nome técnico puro (gpt-5.5, gemini-2.5-pro) NUNCA sozinho — sempre com prefixo de uso. Vale pra qualquer picker/menu/lista que ele vá ler.

### [2026-07-07T00:07] SELO: Elite Gateway e Python na porta 8082
- **Data:** 2026-07-07
- **Tags:** elite, python, gateway, 8082, selado
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-06
- **Promovida:** sim

Conteúdo: O sistema de gateway de IA (CentralDark-EliteHTTP) e um proxy Python (nao Node) escutando na porta 8082 com uvicorn. A ferramenta diagnostico do mcp avisa 'fetch failed' porque procura na 8080 (isso e um falso alarme / ping cego). Em hipotese nenhuma devemos configurar node ou tentar alterar essa estrutura estavel e funcional de porta.

### [2026-07-07T00:10] Regra Visual: Empilhado e Código em Markdown
- **Data:** 2026-07-07
- **Tags:** visual, formato, markdown, ux
- **Relevância:** alta
- **Eixo:** presente
- **Expira:** 2026-08-06
- **Promovida:** sim

Conteúdo: Padrão de resposta obrigatório: textos sempre bem formatados com HUD e blocos visuais. Itens informativos devem vir sempre empilhados (um debaixo do outro, com respiro visual) para leitura rápida. Blocos de código, logs e comandos devem vir impreterivelmente dentro de blocos Markdown (```).
