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
