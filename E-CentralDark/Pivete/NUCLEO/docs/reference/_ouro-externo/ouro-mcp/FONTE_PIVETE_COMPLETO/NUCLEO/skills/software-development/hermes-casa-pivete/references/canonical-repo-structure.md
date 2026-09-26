# Canonical Repo Structure — CentralDark (Fonte da Verdade)

## Regra de Ouro
**NÃO construir em repos clonados externos.** O Painel 747 foi construído em `/c/Users/danda/aiox-core/ui/` (clone do SynkraAI/aiox-core) — **fora do canônico**.

## Estrutura Canônica (ServerVpss/CentralDark)

```
ServerVpss/CentralDark/
├── apps/
│   └── modulos/
│       ├── status/              🔒 Página oficial status.centralldark.com
│       ├── Bolt/                🔒 Construtor de site próprio
│       ├── WebUI/               🔒 Web UI próprio
│       ├── graph-panel/         🔒 Graph panel (indexação por grafo)
│       ├── HERMES-CORE/         🔒 Núcleo Hermes (agents, missions, logs)
│       ├── Monitoramento24h/    🔒 Monitoramento 24h
│       ├── mapeamento/          🔒 Mapeamento ecossistema
│       ├── memoria-api/         🔒 API memória (PM2 CentralDark-Memoria)
│       ├── telepainel/          🔒 Módulo TelePainel (bot @SEGREDOPUXADASBOT)
│       ├── hub/                 🔒 HUB Supabase (lyoigsqluyktoclwdaft)
│       ├── clone-deck/          🔒 Clone-deck (baralho de clonagem)
│       ├── pivete-sync/         🔒 Sincronizador do Pivete
│       ├── obsidian-plugin-grafo-vivo/  🔒 Plugin Obsidian
│       ├── elite-anthropic-proxy/       🔒 Proxy Anthropic ap7
│       ├── artifacts-builder/   🔒 Artifacts Builder + Crafter
│       ├── proxy/ + lovable-proxy/      🔒 Proxies roteamento IA
│       ├── oauth-broker/        🔒 OAuth Broker
│       ├── arsenal-openai-adapter/      🔒 Arsenal Adapter
│       └── elite-gateway/       🔒 Elite Gateway HTTP
├── scripts/
│   ├── webhook/                 🔒 Deploy webhook + notificação Telegram
│   └── contas-admin/            🔒 OAuth admin panel
├── infra/caddy/                 🔒 Subdomínios
├── .github/workflows/           🔒 CI/CD (pr-agent.yml etc)
├── secrets/                     🔒 NUNCA commitar
└── docs/CONSCIENCIA/            🔒 Cérebro Vivo (git = fonte da verdade)
```

## Módulos Protegidos (CLAUDE.md §9)
Qualquer área marcada com 🔒 **não pode ser modificada sem autorização explícita do Pivete** ("PERMITO PIVETE").

## Lição Aprendida (07/08/2026)
- Clonei `SynkraAI/aiox-core` → branch `painel747` (PR #540)
- Construí Painel 747 completo em `aiox-core/ui/` (Next.js 15 + Tailwind v3)
- **Erro:** isso está FORA do canônico. Não integra com PM2/Caddy/VPS do CentralDark.
- **Correção:** se Painel 747 virar oficial → novo módulo `apps/modulos/painel747/` OU estender `apps/modulos/status/`
- **Princípio:** Casa primeiro = código no repo canônico. VPS por último = deploy só depois de canônico.

## Checklist Antes de Construir UI Nova
- [ ] Confirmar se já existe módulo protegido que cobre (`status/`, `WebUI/`, `Bolt/`)
- [ ] Se novo → criar em `ServerVpss/CentralDark/apps/modulos/<nome>/`
- [ ] Integrar no PM2 (ecosystem.config.cjs) + Caddy (infra/caddy/)
- [ ] Health check `/health` ou `/status.json`
- [ ] Registrar no Card-Mestre + REGRAS se virar padrão
- [ ] **NÃO** construir em repo clonado externo (`aiox-core`, `synkra`, etc)

## Próximo Passo Real (se Painel 747 for oficial)
1. `mkdir -p ServerVpss/CentralDark/apps/modulos/painel747/`
2. Mover código de `aiox-core/ui/` → lá
3. `pm2 start ecosystem.config.cjs --env production` (porta interna)
4. Caddy reverse proxy `painel747.centralldark.com` ou subpath
3. `pm2 save`
4. Card-Mestre: novo módulo + rota + status