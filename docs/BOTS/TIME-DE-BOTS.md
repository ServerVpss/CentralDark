# 🤖 Time de Bots CentralDark — Mapa Oficial

> Documento vivo. Atualizar sempre que um bot novo entrar/sair do time.
> Espelho de memória: `mem://time-de-bots`.

## Regra de ouro (INQUEBRÁVEL)

```text
┌────────────────────────────────────────────────────────────────┐
│  NENHUM bot do time pode:                                      │
│    ❌ apagar arquivo                                            │
│    ❌ fazer merge em `main`                                     │
│    ❌ reiniciar serviço de produção                             │
│    ❌ ler/editar `.env`, `secrets/`, `sessions/`, `.ssh/`       │
│                                                                │
│  Todo bot SEMPRE:                                              │
│    ✅ detecta → documenta → abre Issue OU PR                    │
│    ✅ aplica a label `revisao-humana` no que ele gerar          │
│    ✅ aplica `assign:<bot>` pro Dispatcher rotear               │
│    ✅ grava relatório em `docs/RELATORIOS/<bot>/<data>.md`      │
│                                                                │
│  Quem aprova: humano (Mestre Segredo) + pente fino do ChatGPT  │
└────────────────────────────────────────────────────────────────┘
```

**Exceção controlada:** bots que produzem só dado (ex: `painel-vivo` atualizando `painel-data.json`, vigia atualizando Issue própria) podem commitar direto na branch deles, **nunca em main**, e sempre dentro do escopo de dado/relatório.

## O time (foto atual + planejado)

```text
JÁ EXISTEM
├── 🚨 vigia-actions-vermelhos   workflows vermelhos viram Issue
├── 🛰️  sentinela-divergencias    divergência endpoint/CORS/PM2 → Issue
├── 🎯 dispatcher-bots           cola briefing pro bot dono da label
├── 📦 dependabot                deps + auto-merge só patch (#118)
├── 🔐 codeql                    SAST nativo JS/TS
├── 📊 painel-vivo               atualiza status.centralldark.com
└── 🤝 supabase-bot              schema/RLS read-only

PLANEJADOS (lotes 2-8)
├── 📚 doc-guardiao              cobra README.md + PLANO.md por pasta
├── 🧹 faxineiro-repo            órfãos/ZIPs/dangling (modo RELATÓRIO)
├── 🔍 auditor-divergencia       repo vs origin/main vs VPS (RELATÓRIO)
├── 🛡️  guarda-seguranca-rapido   só Gitleaks por enquanto
├── 🛡️  guarda-seguranca-full     Semgrep+OSV+Trivy (depois de validar)
└── 🩺 vps-healthcheck           SSH READ-ONLY, sem restart, sem reload
```

## Ordem oficial de implementação (decidida 2026-06-09)

```text
Lote 0  ✅ consertar vigia-actions-vermelhos (Node ESM URL bug)
Lote 1  ✅ labels oficiais (bots-labels-seed.yml) + PROTOCOLO-REVISAO-HUMANA.md
Lote 2  ⏳ doc-guardiao
Lote 3  ⏳ faxineiro-repo (MODO RELATÓRIO — não apaga nada)
Lote 4  ⏳ auditor-divergencia (MODO RELATÓRIO)
Lote 5  ⏳ guarda-seguranca-rapido (só Gitleaks, com allowlist)
Lote 6  ⏳ guarda-seguranca-full (Semgrep + OSV + Trivy)
Lote 7  ⏳ vps-healthcheck (SSH read-only, saída sanitizada)
Lote 8  ⏳ painel-vivo com contadores por bot
```

**Por que essa ordem:** o usuário identificou que jogar 7 workflows novos de uma vez vira ruído. Cada lote é validado isolado antes do próximo.

## Labels padrão do time

| Label              | Quem aplica         | Significado                            |
| ------------------ | ------------------- | -------------------------------------- |
| `revisao-humana`   | TODO bot do time    | Humano precisa olhar antes de merge    |
| `assign:codex`     | vigia/sentinela     | Codex revisa código                    |
| `assign:lovable`   | vigia/sentinela     | Lovable mexe em frontend/painel        |
| `assign:grok`      | vigia/sentinela     | Grok investiga VPS/PM2                 |
| `assign:supabase-bot` | vigia/sentinela  | Bot de schema/RLS                      |
| `assign:chatgpt`   | manual              | Pente fino final                       |
| `auto`             | qualquer bot        | Não foi criada à mão                   |
| `assign:doc-guardiao` | vigia/sentinela  | Doc-guardião cobra README/PLANO        |
| `assign:faxineiro-repo` | vigia/sentinela | Faxineiro-repo em modo relatório       |
| `assign:auditor-divergencia` | vigia/sentinela | Auditor de divergência em modo relatório |
| `assign:guarda-seguranca` | vigia/sentinela | Guarda-segurança em modo relatório    |
| `assign:vps-healthcheck` | vigia/sentinela | VPS-healthcheck SSH read-only          |
| `vigia`            | vigia/sentinela     | Monitoramento de workflows/divergências |
| `dependencies` / `github-actions` | Dependabot | Escopo de dependências e Actions      |
| `mcp` / `linear` / `sentry` / `notion` | bots de integração | Escopo por integração                 |
| `security` / `bot-server` / `install-callback` / `frontend` | bots/Dependabot | Escopo por área técnica              |
| `p1` / `p2` / `p3` | bot que abriu       | Severidade                             |
| `stale`            | sentinela-stale     | Sem ação em 7d                         |

Aliases antigos mantidos no seed: `assign:faxineiro`, `assign:auditor`, `assign:seguranca`, `assign:vps-health`.

## Avaliação de risco (do plano original)

| Bot                        | Risco | Mitigação aplicada                          |
| -------------------------- | ----- | ------------------------------------------- |
| doc-guardiao               | 🟢    | só comenta em PR, não escreve em main       |
| faxineiro-repo             | 🟡    | modo relatório no L3, só PR depois          |
| auditor-divergencia        | 🟡    | só lista, não corrige                       |
| guarda-seguranca (Gitleaks) | 🟢   | allowlist `.gitleaks.toml` antes de ativar  |
| guarda-seguranca (TruffleHog) | 🟠 | NÃO valida secret ativo no L5 — só no L6 e em modo relatório |
| vps-healthcheck            | 🟠    | só SSH read-only, sem `pm2 restart`, sem `caddy reload`, saída sanitizada |
| painel-vivo contadores     | 🟢    | só lê API, escreve em JSON próprio          |

## Como pedir ajuda ao time

> "Olha os vermelhos do Actions" → `gh issue list -l vigia --state open`
> "O que tá pendente de revisão?" → `gh issue list -l revisao-humana --state open`
> "Quem é o dono dessa Issue?" → olhar label `assign:<bot>`

## Próximo passo
Lote 2: `doc-guardiao`. Sem urgência — só seguir quando o usuário sinalizar.
