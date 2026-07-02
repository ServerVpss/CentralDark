---
title: "CONSOLIDACAO CENTRALDARK"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# CONSOLIDAÇÃO — CentralDark VPS × Painel Lovable
**Gerado em:** 2026-06-24  
**Repo VPS:** `ServerVpss/CentralDark`  
**Repo Lovable (local):** `segredounlock/clone-deck` (Lovable / dev-server)

---

## 1. Resumo Executivo

O repositório da VPS (`ServerVpss/CentralDark`) é um **monorepo gigante** com **4.855 itens** (756 pastas + 4.099 arquivos), organizado em torno da plataforma de automação CentralDark rodando em servidor Linux. Ele contém o bot Telegram em produção (PM2), um servidor MCP com 91 ferramentas, scripts de deploy/instalação (468 arquivos `.sh`), 169 scripts Node, 20+ subprojetos em `apps/` e documentação extensa. O painel Lovable é o **frontend React** (painel web visual) que se comunica com o Supabase via 39 edge functions. Os dois repos são **complementares**, não substitutos: a VPS é o motor/backend; o Lovable é a interface visual. O principal risco de conflito está em arquivos com **o mesmo nome mas conteúdo diferente** (`install.sh`, `package.json`, `bootstrap.sh`, pastas `docs/`, `infra/`, `scripts/`, `.lovable/`, `.github/`).

---

## 2. Estatísticas

| Métrica | VPS (ServerVpss/CentralDark) | Lovable (local) |
|---|---|---|
| Total de itens no repo | 4.855 | ~350 (excl. node_modules) |
| Pastas raiz | 28 | 14 |
| Arquivos `.sh` (bash) | **468** | 5 |
| Scripts Node (.cjs/.mjs) | **169** | 2 |
| Edge Functions Supabase | 1 (`mcp-proxy`) | **39** |
| Apps em `apps/` | 14 subprojetos | 4 módulos (`telepainel`, `crm`, `financeiro`, `bot-whatsapp`) |
| Pasta `CentralDark/` (sub-repo) | 2.043 arquivos | ❌ não existe |
| Arquivos de docs `.md` | 232+ | ~15 |
| Workflows GitHub Actions | 60+ | 1 |
| Migrations Supabase | 1 (contatos) | múltiplas (não listadas) |

---

## 3. Mapa de Pastas do Repo VPS (Árvore Comentada)

```
ServerVpss/CentralDark/
│
├── .agents/                    ← Skills de IA (canvas-design, claude-api, docx, etc.)
│                                  372 arquivos, maioria de recursos para agentes
│
├── .github/                    ← 60+ workflows GitHub Actions: CI, deploy, monitor,
│                                  heartbeat, sync, PR templates, Dependabot
│
├── .lovable/                   ← Memória do agente Lovable: aprendizados, arquitetura,
│                                  features (auth, OAuth, live-status)
│
├── .pr_agent.toml              ← Config do PR Agent (revisão automática de PRs)
├── .coderabbit.yaml            ← Config do CodeRabbit (análise de código)
├── .deploy-heartbeat           ← Arquivo de heartbeat de deploy
│
├── AGENTS.md                   ← Regras operacionais para TODOS os agentes de IA
├── CLAUDE.md                   ← Regras específicas para Claude Code CLI
├── CODEX.md                    ← Regras operacionais para Codex/OpenAI
├── LEIA-ME-IA.md               ← Guia de onboarding para IAs novas no projeto
├── README.md                   ← Documentação principal (estrutura, links, PM2, domínios)
│
├── CentralDark/                ← ⚠️ SUB-REPO COMPLETO (2.043 arquivos)
│   │                              Cópia/snapshot do projeto completo dentro do mono-repo
│   ├── apps/                   ← Mesmos apps do nível raiz (espelho/histórico)
│   │   ├── api-docs/           ← Documentação da API
│   │   ├── bot-server/         ← Servidor HTTP do bot
│   │   ├── bot-telegram/       ← Bot Telegram (PM2: CentralDark-TelegramBot)
│   │   ├── bot/                ← Painel React WhatsApp/IA (bot.multizap.dev — NÃO MEXER)
│   │   ├── central-logs/       ← Centralizador de logs
│   │   ├── central-notificacoes/ ← Sistema de notificações
│   │   ├── clone-deck/         ← Espelho do repo clone-deck/Lovable dentro da VPS
│   │   ├── consciencia/        ← Módulo de consciência/memória da IA
│   │   ├── install-callback/   ← Callback pós-instalação
│   │   ├── mcp/                ← Servidor MCP v0.4.0 (91 tools, PM2: MCP-CentralDark)
│   │   ├── modulos/            ← Módulos do sistema (consultas, pagamentos, etc.)
│   │   ├── notificacoes/       ← Serviço de notificações push
│   │   ├── portal/             ← Portal web (centralldark.com)
│   │   ├── projeto-dashboard/  ← Dashboard de projetos
│   │   ├── supabase-bot/       ← Integração Supabase-Bot
│   │   └── web/                ← Frontend web geral
│   └── scripts/                ← Scripts installer, deploy, monitor (nested)
│
├── apps/                       ← Apps ativos na VPS (nível raiz)
│   ├── Bolt/                   ← Instância Bolt (docker-compose)
│   ├── bot-telegram/           ← Bot principal (bot.cjs, panel.cjs, ecosystem.config.cjs)
│   │   ├── skills/             ← Habilidades do bot (core/, externas/)
│   │   ├── handlers/           ← Handlers de mensagens
│   │   ├── menus/              ← Menus interativos
│   │   └── services/           ← Serviços auxiliares
│   ├── bot/                    ← Painel WhatsApp React (NÃO MEXER — produção separada)
│   ├── builder-bolt/           ← Builder de artefatos Bolt
│   ├── central-logs/           ← Logs centralizados
│   ├── central-notificacoes/   ← Notificações centrais
│   ├── consciencia/            ← Memória/consciência da IA
│   ├── crm/                    ← CRM com gateway WhatsApp (WuzAPI, Docker)
│   ├── mcp/                    ← MCP Server (src/index.ts, tools/, 91 ferramentas)
│   ├── modulos/                ← Módulos de consulta (CPF, CNPJ, veículos, etc.)
│   ├── notificacoes/           ← Sistema de alertas e notificações
│   ├── portal/                 ← Portal principal (centralldark.com)
│   ├── projeto-dashboard/      ← Dashboard de projetos
│   └── web/                    ← Frontends web
│
├── bootstrap.sh                ← Script de 1 linha: clona repo + abre instalador
│                                  (baixado via curl | bash, verifica SO/RAM/disco)
│
├── install.sh                  ← Instalador principal (~49KB, ~1200+ linhas bash)
│                                  Wizard interativo, idempotente, opções:
│                                  --install, --cloudflare, --mcp, --dns-check, etc.
│
├── central-horario/            ← Serviço de fuso horário (frontend.ts, node.cjs)
│
├── docs/                       ← 232+ arquivos de documentação
│   ├── ARQUITETURA/            ← Diagramas, BOT-SERVER, serviços, endpoints
│   ├── AUDITORIAS/             ← Auditorias de segurança e banco
│   ├── PENDENCIAS.md           ← Backlog de tarefas abertas
│   └── tarefas/                ← Tarefas específicas por data
│
├── guarda/                     ← Placeholder de trigger de revisão (#067)
│
├── infra/                      ← Infraestrutura de produção
│   ├── caddy/                  ← Caddyfiles: api., builder., deploy., gateway., mcp.
│   ├── mcp/                    ← Config MCP na VPS
│   └── notify/                 ← Infra de notificações (py, sh)
│
├── package.json                ← Monorepo root (scripts: dev, build, farm-pr)
│
├── revisoes/                   ← Histórico de revisões automáticas (run.sh por data)
│                                  7 revisões recentes (diagnóstico, journald, cron, etc.)
│
├── run-068-emulation.sh        ← Script de emulação de revisão #068
│
├── scripts/                    ← 165 arquivos, 20 subpastas
│   ├── bots/                   ← Healthcheck VPS, monitor WuzAPI, sessions
│   ├── checker/                ← Verificadores de produção
│   ├── ci/                     ← Scripts de CI/CD
│   ├── cloudflare/             ← Automação Cloudflare DNS
│   ├── deploy/                 ← Libs de deploy (_lib-github-api.sh, lovable-sync, etc.)
│   ├── dev/                    ← Scripts de desenvolvimento
│   ├── guarda/                 ← Watchdog/guarda processos
│   ├── ia/                     ← Scripts de IA (farm-pr, build-lovable)
│   ├── installer/              ← Libs do instalador (caddy-auto, cloudflare, dns-check, ui)
│   ├── lib/                    ← Bibliotecas compartilhadas
│   ├── lovable-agent/          ← Agente Lovable (scripts específicos)
│   ├── menu/                   ← Menus interativos bash
│   ├── run-once/               ← Scripts de execução única (inventory, setup)
│   ├── sentinela/              ← Monitoramento sentinela
│   ├── sync/                   ← Sincronização entre repos/VPS
│   ├── validate/               ← Validadores
│   ├── vigia/                  ← Vigilância de processos PM2
│   ├── vps-organizacao/        ← Scripts de organização VPS
│   ├── webhook/                ← Handlers de webhook
│   └── workflows/              ← Scripts de workflow manual
│
├── security/                   ← 24 arquivos: planos de segurança, backlog,
│                                  realtime security, VPS orchestrator, auditoria RLS
│
├── skills/                     ← Skills customizadas do CentralDark
│   ├── centraldark-consciencia/ ← Skill de consciência/memória
│   └── (outras skills)
│
├── supabase/                   ← Apenas 3 arquivos:
│   ├── config.toml             ← Config do projeto Supabase
│   ├── functions/mcp-proxy/    ← 1 edge function: proxy para MCP VPS
│   └── migrations/             ← 1 migration: create_contatos
│
├── tools/                      ← 51 ferramentas legadas de fix/manutenção
│   └── legacy-fixes/           ← Correções históricas (fix-app.cjs, fix-bot-bridge.cjs, etc.)
│
└── update-chats.cjs            ← Script Node de atualização de chats
```

---

## 4. Sobreposições — O que existe nos DOIS lugares (risco de conflito)

> ⚠️ Estes itens têm o **mesmo nome** em ambos os repos mas podem ter **conteúdo diferente**.

| Arquivo/Pasta | Na VPS | No Lovable | Risco |
|---|---|---|---|
| `install.sh` | Instalador VPS completo (~49KB, Bash) | Instalador Lovable/painel (~49KB, Bash) | 🔴 ALTO — mesmo nome, mesmo tamanho, propósitos diferentes |
| `package.json` | Monorepo root (dev=bot, build=lovable) | Vite/React (dev, build, test) | 🟡 MÉDIO — estrutura diferente mas mesmo nome |
| `bootstrap.sh` | Bootstrap VPS (curl \| bash, clona repo) | Não existe no Lovable | 🟢 BAIXO |
| `docs/` | 232+ arquivos de documentação VPS | 12 arquivos de docs Lovable | 🟡 MÉDIO — conflito de nomes em alguns subpastas |
| `infra/` | Caddyfiles produção (api, mcp, gateway) | Caddy + notify (locais) | 🟡 MÉDIO — mesmo nome de pasta, configs diferentes |
| `scripts/` | 165 arquivos VPS (deploy, sync, ci) | 5 scripts Lovable (sync, setup, cron) | 🟡 MÉDIO — mesma pasta, scripts adicionais na VPS |
| `.lovable/` | Memória VPS do agente Lovable | Memória local do agente Lovable | 🔴 ALTO — memórias podem divergir |
| `.github/` | 60+ workflows VPS | 1 workflow Lovable | 🟡 MÉDIO — muitos workflows adicionais na VPS |
| `AGENTS.md` | Regras para todos os agentes (VPS) | Não existe localmente | 🟢 BAIXO |
| `supabase/` | 1 edge function (mcp-proxy) + 1 migration | 39 edge functions + migrations | 🔴 ALTO — a VPS tem versão diferente/incompleta do Supabase |
| `src/apps/modulos/` | `apps/modulos/` na VPS (motor) | `src/apps/modulos/` (UI React) | 🟡 MÉDIO — UI vs lógica de backend |

---

## 5. Únicos da VPS — O que SÓ existe lá (candidatos a importar)

| Item | Descrição | Prioridade para importar |
|---|---|---|
| `apps/bot-telegram/` | Bot Telegram completo em produção (PM2), com skills, handlers, menus | 🔴 Alta — motor principal |
| `apps/mcp/` | Servidor MCP v0.4.0 com 91 ferramentas | 🔴 Alta — infraestrutura crítica |
| `apps/crm/` | CRM com WuzAPI/WhatsApp Gateway (Docker) | 🟡 Média |
| `scripts/deploy/` | Libs robustas de deploy (lovable-sync, github-api) | 🔴 Alta — sincronização |
| `scripts/sync/` | Scripts de sync VPS ↔ GitHub | 🔴 Alta |
| `scripts/installer/` | Libs reutilizáveis do instalador (caddy-auto, dns-check, cloudflare) | 🟡 Média |
| `scripts/sentinela/` + `scripts/vigia/` | Monitoramento e watchdog de processos | 🟡 Média |
| `infra/caddy/*.Caddyfile` | Configs de produção: api, mcp, gateway, builder | 🔴 Alta — deploy produção |
| `security/` | Planos de segurança, backlog, auditoria RLS, VPS orchestrator | 🟡 Média |
| `AGENTS.md` | Regras operacionais para todos os agentes | 🟡 Média — padronização |
| `CLAUDE.md` | Regras específicas Claude Code (commits, formato) | 🟡 Média |
| `CODEX.md` | Regras operacionais Codex | 🟡 Média |
| `LEIA-ME-IA.md` | Onboarding de IAs novas no projeto | 🟡 Média |
| `supabase/functions/mcp-proxy/` | Edge function de proxy para o MCP VPS | 🟡 Média — já existe `mcp-call` local |
| `supabase/migrations/20260606040000_create_contatos.sql` | Migration de contatos | 🟡 Média — verificar se já existe |
| `central-horario/` | Serviço de fuso horário | 🟢 Baixa |
| `tools/legacy-fixes/` | 51 scripts de correção histórica | 🟢 Baixa — só referência |
| `.github/workflows/` | 55+ workflows adicionais (ativar-monitor, heartbeat, etc.) | 🟡 Média |
| `apps/consciencia/` | Módulo de memória/consciência da IA | 🟢 Baixa |
| `revisoes/` | Histórico de revisões automáticas | 🟢 Baixa — apenas referência |

---

## 6. Únicos do Painel Lovable — O que SÓ existe aqui

| Item | Descrição |
|---|---|
| `src/` (React/TypeScript completo) | Interface visual inteira: dashboard, telepainel, CRM, financeiro, WhatsApp |
| `supabase/functions/` (38 funções) | admin-users, api-query, efi-*, misticpay-*, telegram-*, notify-telegram, vps-exec, ponte-mcp, etc. |
| `vite.config.ts`, `tailwind.config.ts` | Build toolchain do frontend |
| `components.json` | Config do shadcn/ui |
| `src/apps/modulos/telepainel/` | Painel de gerenciamento de bots Telegram (UI completa) |
| `src/apps/modulos/crm/` | Landing CRM (UI) |
| `src/apps/modulos/financeiro/` | Landing Financeiro (UI) |
| `src/apps/modulos/bot-whatsapp/` | Landing WhatsApp (UI) |
| `docs/EDGE_FUNCTIONS.md` | Documentação local das edge functions |
| `docs/CRON_JOBS_SETUP.md` | Setup de cron jobs |
| `docs/BOT_COMMANDS.md` | Comandos do bot documentados |
| `infra/notify/notify.py` + `notify.sh` | Scripts Python/Bash de notificação local |
| `INSTALACAO.md` | Guia de instalação específico do painel |

---

## 7. Plano de Importação Sugerido em Fases

> **Regra de ouro:** nunca importar arquivos de mesmo nome sem revisar manualmente o diff. Nunca sobrescrever `supabase/` sem backup.

### FASE 1 — Documentação e Regras de IA (seguro, sem risco)
1. Copiar `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `LEIA-ME-IA.md` para a raiz local
2. Mesclar `.lovable/` (verificar diferenças de memória antes de sobrescrever)
3. Importar docs VPS que não existem localmente → `docs/VPS/` (pasta nova para evitar conflito)

### FASE 2 — Scripts e Ferramentas de Automação (médio risco)
4. Importar `scripts/deploy/` → `scripts/deploy-vps/` (renomear para não conflitar)
5. Importar `scripts/sync/` → `scripts/sync-vps/`
6. Importar `scripts/installer/lib/` (caddy-auto, dns-check, cloudflare)
7. Importar `.github/workflows/` novos (comparar antes — não sobrescrever os existentes)

### FASE 3 — Infraestrutura (revisão obrigatória)
8. Importar `infra/caddy/*.Caddyfile` → `infra/caddy/` (mesclar, não substituir)
9. Revisar `install.sh` VPS vs local — identificar funções únicas de cada um
10. Importar `security/` para referência

### FASE 4 — Supabase (crítico — exige backup antes)
11. Comparar `supabase/functions/mcp-proxy/` com `supabase/functions/mcp-call/` local
12. Importar migration de contatos apenas se não existir localmente
13. Verificar se `supabase/config.toml` da VPS tem configs diferentes

### FASE 5 — Apps de Backend (exige infra VPS ativa)
14. Documentar estrutura de `apps/bot-telegram/` e `apps/mcp/` para referência no painel
15. Criar edge functions de proxy/ponte para os novos endpoints que forem necessários
16. Integrar `apps/consciencia/` como fonte de dados para o painel (opcional)

---

## 8. Riscos e Pontos de Atenção

| # | Risco | Gravidade | Ação Recomendada |
|---|---|---|---|
| 1 | **`install.sh` com mesmo nome e tamanho** — os dois são ~49KB mas fazem coisas diferentes | 🔴 Crítico | Nunca substituir um pelo outro. Renomear ao importar. |
| 2 | **`supabase/` divergente** — VPS tem 1 edge function; Lovable tem 39 | 🔴 Crítico | Não sobrescrever. Merge manual apenas nas migrações necessárias. |
| 3 | **`.lovable/` com memórias diferentes** — VPS aprendeu coisas que o local não sabe (e vice-versa) | 🔴 Crítico | Mesclar manualmente, priorizar a mais recente por arquivo. |
| 4 | **Sub-repo `CentralDark/` dentro de `ServerVpss/CentralDark`** — repo duplicado dentro do repo, 2.043 arquivos | 🟡 Médio | Não importar esse nível — é histórico/snapshot. Usar só `apps/` raiz. |
| 5 | **`apps/bot/` marcado como "NÃO MEXER"** — painel WhatsApp em produção separada | 🟡 Médio | Respeitar o aviso. Não importar para o Lovable sem planejamento. |
| 6 | **468 scripts bash** — muitos fazem operações destrutivas (reset, deploy, limpeza) | 🟡 Médio | Revisar cada script antes de importar. Nunca rodar sem VPS configurada. |
| 7 | **`AGENTS.md` diz que `ServerVpss/CentralDark` é o repo principal** — `clone-deck` é espelho | 🟡 Médio | Alinhar com o dono do projeto qual é o repo canônico. |
| 8 | **Workflows GitHub Actions divergentes** — VPS tem 60+, Lovable tem 1 | 🟢 Baixo | Importar os úteis para o Lovable um a um, com revisão. |
| 9 | **Migration de contatos** — pode conflitar com migrations existentes no Lovable | 🟢 Baixo | Verificar timestamp e tabela antes de rodar. |
| 10 | **Tokens e secrets** — `AGENTS.md` bloqueia explicitamente leitura de `.env`, `secrets/`, `sessions/` | 🟢 Baixo | Nunca importar esses caminhos. Já está respeitado neste relatório. |

---

## Legenda de Prioridades
- 🔴 **ALTO/Crítico** — Requer atenção imediata ou pode causar dano
- 🟡 **MÉDIO** — Importante, mas pode aguardar planejamento
- 🟢 **BAIXO** — Informativo, sem urgência

---

*Relatório gerado automaticamente pelo agente Lovable — análise read-only. Nenhum arquivo foi modificado além deste.*

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
