## Missão

Auditar VPS (`/root/CentralDark/`) + repositório `ServerVpss/CentralDark` aplicando a Lupa Bayesiana, cruzar com o conteúdo do `MARKDOWN.zip` (que descreve o cockpit/overclock antigo e a estrutura que a gente pode reaproveitar), listar inconsistências, ouro, lixo e melhorias — e SÓ ENTÃO propor o plano de fusão Overclock + Sala de Controle. Fase 1 é 100% read-only: nenhum arquivo do cockpit vai ser mexido antes de você aprovar a fusão.

## Como vou aplicar a Lupa (Fase 1 — só investigação)

### Passo 1 — Fixar a fonte da verdade
Ler o HEAD atual do `ServerVpss/CentralDark` (branch `pivete/dev` e `main`), registrar o SHA, confirmar que bate com o que a VPS tem em `/root/CentralDark/`. Se divergir, isso já é a primeira inconsistência.

### Passo 2 — Ler o que o zip realmente traz
Já extraí o `MARKDOWN.zip` no sandbox. Ele contém:

```text
MARKDOWN/
├── 01-humano/    → visão, árvore, negócio, fluxos
├── 02-ia/        → AI-CONTEXT-MASTER, AI-SCHEMA.json, AI-SWARM-PROMPT
├── 03-central-dark/ → mapa das 5 páginas + roadmap Sonnet + MVP mínimo
└── Screenshot_1..32.png (referências visuais do overclock antigo)
```

Vou ler integralmente: `10-mapa-paginas-site.md`, `12-MVP-MINIMO-VIABLE.md`, `11-ROADMAP-COMPLETO-PARA-SONNET.md`, `AI-CONTEXT-MASTER.md` e conferir cada Screenshot pra identificar quais blocos visuais do overclock a gente ainda não trouxe pra `SalaControle`.

### Passo 3 — Mapear o cockpit atual (SalaControle)
- `src/paginas/admin-cockpit/SalaControle.tsx` (183 linhas)
- `sala-controle.css` (278 linhas)
- `MatrixRain.tsx`, `HermesMascote.tsx`, `hooks/useCockpitLive.ts`
- Rota: `/admin/cockpit`
- Abas atuais: MAPA · MCP · HUB · INFRA · IAs · GROK · LOGS

Registrar o que existe hoje pra saber o que falta.

### Passo 4 — Ledger de inconsistências (Lupa)
Pra cada item, registro: `OBSERVAÇÃO · PROVENIÊNCIA · FAVORECE OURO/LIXO/PENDÊNCIA · LIMITAÇÃO`. Alvos que já sei que precisam entrar no ledger:

- Headers coloridos por pane (referência `image-974.png`) — ausente na SalaControle atual.
- Badges de custo `$` em tempo real — ausente.
- Densidade de logs (feed alto, monoespaçado) — parcial.
- `HERMES-CORE/missions/` vazio na VPS — barramento não escreve.
- Screenshots do zip vs SalaControle real — diff visual.
- Roadmap 5 páginas (DASHBOARD · PLANOS · BAIXAR · DIREÇÃO · AJUDA) vs rotas do repo — o que existe, o que falta.
- Duplicação: `apps/modulos/status/` (painel vivo) vs `SalaControle` — quem é canônico?
- Skill workspace: `lupa-bayesiana` ativa localmente, ausente no repo — versionar ou não?

### Passo 5 — Falsificação e AutoLupa
Antes de fechar o relatório, pergunto: que evidência derruba a fusão? O que eu tô contando duas vezes (ex.: painel vivo + cockpit)? A promoção de algum bloco cria módulo paralelo (viola Mapa Único)?

## Entregável da Fase 1

Um único relatório curto (não vou implementar nada), no formato:

```text
🟢 OURO (manter/reaproveitar)
🟡 PENDÊNCIA (falta fazer)
🔴 LIXO (remover/consolidar)
🛠️ MELHORIAS (evoluções propostas)
```

Cada linha com: caminho canônico · evidência · próximo passo único.

## Fase 2 (só depois da sua aprovação)

Com o relatório na mão, monto o **plano de fusão Overclock + SalaControle**, respeitando:

- Mapa Único: extensão dentro de `src/paginas/admin-cockpit/`, sem criar rota/pasta paralela.
- Trava das áreas 🔒 do `CLAUDE.md`.
- Nada de deploy, nada de mexer em VPS/PM2 sem "PERMITO PIVETE".
- Registro em `docs/ENTREGAS-LOVABLE.md` no fim.

## O que eu NÃO vou fazer nesta fase

- Não vou editar `SalaControle.tsx`, CSS, componentes ou skill.
- Não vou renomear pasta nenhuma.
- Não vou tocar em VPS, PM2, HUB, Supabase.
- Não vou abrir PR nem commit.

Aprova essa Fase 1 (auditoria com Lupa + leitura completa do zip + relatório organizado) pra eu seguir?
