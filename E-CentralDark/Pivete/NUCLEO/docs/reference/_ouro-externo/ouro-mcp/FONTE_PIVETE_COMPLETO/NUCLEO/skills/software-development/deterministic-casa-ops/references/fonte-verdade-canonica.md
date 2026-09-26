# Fonte da Verdade Canônica — Não Esquecer (Correção 07/08/2026)

## Erro Cometido
Construí Painel 747 em `C:/Users/danda/aiox-core/ui/` — repo **clonado externo** (`SynkraAI/aiox-core`), **FORA do canônico**.

## Onde Está a Fonte da Verdade (Canônico)

| Caminho | O que é | Status |
|---------|---------|--------|
| `E:\CentralDark\Pivete\NUCLEO\` | Núcleo: regras, memória, SOUL, motor, skills | **Canônico** |
| `C:\Users\danda\AppData\Local\hermes\profiles\pivete\` | Profile Hermes ativo (config, skills, cron, memórias nativas) | **Runtime ativo** |
| `ServerVpss/CentralDark/` | Repo CentralDark oficial (GitHub ↔ VPS sync bidirecional) | **Canônico** |

## Módulos Protegidos no CentralDark (`apps/modulos/`)
```
apps/modulos/
├── status/              ← Página oficial status.centralldark.com 🔒
├── Bolt/                ← Construtor de site 🔒
├── WebUI/               ← Web UI próprio 🔒
├── graph-panel/         ← Graph panel 🔒
├── HERMES-CORE/         ← Núcleo Hermes 🔒
├── Monitoramento24h/    ← Monitoramento 24h 🔒
├── mapeamento/          ← Mapeamento ecossistema 🔒
├── memoria-api/         ← API memória 🔒
├── telepainel/          ← Módulo TelePainel 🔒
├── hub/                 ← HUB Supabase 🔒
├── clone-deck/          ← Baralho de clonagem 🔒
├── obsidian-plugin-grafo-vivo/  ← Plugin Obsidian 🔒
├── pivete-sync/         ← Sincronizador do Pivete 🔒
├── arsenal-openai-adapter/      ← Arsenal Adapter 🔒
├── elite-gateway/       ← Elite Gateway HTTP 🔒
├── artifacts-builder/   ← Artifacts Builder + Crafter 🔒
├── proxy/ + lovable-proxy/        ← Proxies roteamento IA 🔒
├── oauth-broker/        ← OAuth Broker 🔒
├── elite-anthropic-proxy/         ← Proxy Anthropic 🔒
└── ... (outros 10+ módulos protegidos)
```

**NÃO existe `dashboard/` ou `painel747/` na lista de módulos protegidos.**

## Repositórios e Identidades
| Identidade | Caminho/Repo | Papel |
|------------|--------------|-------|
| `aiox-core` | `C:/Users/danda/aiox-core/` | **EXTERNO** — clonado para recuperar branch `painel747` do PR #540 |
| `ServerVpss/CentralDark` | GitHub + VPS `/root/CentralDark/` | **Canônico** — 4-point sync (Lovable ↔ GitHub ↔ VPS ↔ Cérebro Vivo) |
| `CentralDark1VPS` | VPS `/root/CentralDark1VPS/` | **Legado** — operação ativa, não alterar sem "Migração de Automação" |

## Regra de Ouro
> **Nunca construir fora do canônico achando que está dentro.**

Se Painel 747 virar oficial:
1. Criar `apps/modulos/painel747/` no `ServerVpss/CentralDark`
2. Mover código do `aiox-core/ui` para lá
3. Integrar no PM2/Caddy da VPS (porta, domain, health check)
4. Registrar no Card-Mestre + REGRAS se virar padrão

## Gatilho de Verificação (Boot)
Toda sessão: confirmar `PROFILE=pivete` + ler `REGRAS.md` + `HOJE.md` + `SEMANA.md` do NÚCLEO antes de agir.