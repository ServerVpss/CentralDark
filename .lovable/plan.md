# Dossiê Arsenal Máximo — Estado atual CentralDark

Vou montar UM único markdown grandão em `/mnt/documents/perfdiag/DOSSIE-ARSENAL-2026-07-10.md` (mais um `.zip` opcional com os anexos brutos), pronto pra você abrir aqui ou baixar.

## O que vai ter dentro (seções fixas)

1. **Sumário executivo** — o que tá vivo, o que tá quebrado, o que tá pendente. Placar 🟢🟡🔴.
2. **Mapa do HUB Supabase** (`lyoigsqluyktoclwdaft`)
   - schema `api` vs `hub` vs `public`
   - tabelas críticas (`api_keys`, `audit_log_api`, `oauth_connections`, `user_roles`, `ai_requests`, `path_query_keys`)
   - edge functions ativas (`abacus-router`, `proxy`, `super-admin-status`, `telegram-webhook`, etc.) — status de cada uma
   - migrations aplicadas nas últimas 2 semanas
3. **Mapa de pastas do repo** (`ServerVpss/CentralDark`)
   - árvore anotada de `apps/modulos/` com 🔒 nas áreas travadas
   - onde vive o HUB frontend (`apps/modulos/hub/`) vs TelePainel (`src/apps/modulos/telepainel/`)
4. **Gateway `api.centralldark.com` — os 162 modelos**
   - fonte: `fetchAbacusCatalog()` do ArsenalAdapter (PM2)
   - contagem real por provedor (OpenAI / Anthropic / Google / Meta / xAI / DeepSeek / Mistral / outros)
   - **tabela de aliases** com duplicidades marcadas em 🟡/🔴
   - modelos "fantasma" (adicionados manualmente pro Claude Desktop) vs modelos reais do Abacus
5. **Cadeia Ativa da API** (fluxo request → resposta)
   - Caddy → ArsenalAdapter (127.0.0.1:8090) → Abacus RouteLLM
   - rotas `/v1/models`, `/v1/chat/completions`, `/v1/messages`
   - autenticação suportada: `Authorization: Bearer`, `x-api-key`, `api-key`
6. **O que foi feito nesta jornada** (changelog cronológico dos últimos ~15 dias)
   - PRs #147, #148, #149, #150, #155, #156 com status (merged/aberto)
   - commits marcantes (b020598, b77c58a, 846e0720, 32fd0b97, baff34c)
   - deploys de edge functions e migrations
7. **🔴 Erros que ainda não caíram**
   - aliases duplicados detectados (lista concreta)
   - modelos que respondem 404 no gateway
   - `oauth_connections` ausente causando warning na UI dev
   - long-tasks do TelePainel (referência ao Staff v3.1)
   - qualquer 4xx/5xx recorrente nos logs `audit_log_api` das últimas 24h
8. **🟡 Pendências abertas** (leitura de `docs/PENDENCIAS/`)
9. **Próximos passos sugeridos** (3-5 ações objetivas, sem executar)
10. **Anexos brutos** (opcional em ZIP): `catalogo-abacus.json`, `aliases-diff.csv`, `audit-24h.csv`, `edge-functions-status.json`

## Como vou coletar

Só leitura, nada destrutivo:
- `mcp_custom--vps_read_file_safe` + `vps_list_dir_safe` na VPS pra pegar `regras.json`, `ecosystem.config.cjs`, catálogo cacheado do adapter
- `github_read` no repo pra confirmar código atual das edges e migrations
- `supabase--read_query` no HUB pra contar linhas de `api_keys`, `audit_log_api`, ver últimas migrations
- HTTP GET direto em `https://api.centralldark.com/v1/models` pra bater a lista viva vs regras
- Cruzo tudo em Python pra gerar a tabela de aliases duplicados

## Entrega

- `/mnt/documents/perfdiag/DOSSIE-ARSENAL-2026-07-10.md` (markdown único, ~1500-2500 linhas)
- `/mnt/documents/perfdiag/DOSSIE-ARSENAL-2026-07-10.zip` com o md + anexos brutos
- Ambos aparecem na aba de artefatos pra você ler/baixar na hora

## Fora do escopo (não vou fazer sem ordem)

- Não vou corrigir alias duplicado nem dar deploy — só relatar
- Não vou mexer em edge function, PM2, Caddy
- Não vou tocar em `apps/modulos/**` protegidos
- Não vou notificar no Telegram (sem PERMITO explícito pra ação)

Confirma que pode partir pra coleta e montar o dossiê?
