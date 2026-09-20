# Relatório — Builder Bolt PR #61 conflitos/P2

- **Data:** 2026-06-16
- **Categoria:** correção P2 / PR #61 / validação estática
- **Status:** patch publicado via MCP em branch limpa; PR novo deve substituir o PR #61 conflitado.

## Status

Foram aplicadas correções para os comentários P2 do PR #61 sem tocar VPS, Docker real, Caddy real, Open WebUI, WuzAPI, WhatsApp, CRM, Supabase, banco real, secrets ou containers antigos.

## Correções aplicadas

1. `scripts/deploy/install-builder-bolt.sh` agora envolve `docker compose up -d --build builder-bolt` em bloco explícito `if ! ...; then fail ...; fi`, garantindo que falha de build/up passe por `fail` e grave relatório sanitizado em `revisoes/.../relatorio.md` antes de sair.
2. `docker compose config` também passa por `fail` se falhar, evitando aborto cru por `set -e` sem relatório.
3. `infra/caddy/builder.centralldark.com.Caddyfile` recebeu os headers de cross-origin isolation necessários para WebContainers:
   - `Cross-Origin-Opener-Policy same-origin`
   - `Cross-Origin-Embedder-Policy require-corp`
4. Foi preservado o escopo isolado do Builder Bolt: `127.0.0.1:5174`, sem porta `3000`, sem Open WebUI, sem WuzAPI/WhatsApp/CRM/Supabase/banco/secrets.

## Validações esperadas

- `bash -n scripts/deploy/install-builder-bolt.sh`
- validação YAML do `apps/builder-bolt/docker-compose.yml`
- validação estática do Caddyfile isolado
- scan de secrets nas linhas adicionadas
- busca por marcadores `<<<<<<<`, `=======`, `>>>>>>>`

## Bloqueio original

O ambiente Codex/sandbox não possuía remoto Git configurado nem `gh`, então não conseguiu publicar o patch. O MCP CentralDark/GitHub Connector foi usado como fallback seguro.

## Próximo passo

Revisar o PR novo aberto contra `main`. Só após merge confirmado na `main`, seguir para VPS com `git pull --ff-only origin main`. Docker real continua exigindo confirmação humana explícita com `CD_CONFIRM_BUILDER_BOLT=1`.

## Rollback sugerido

Se este patch precisar ser revertido, fechar o PR novo sem merge ou reverter o commit após merge. Não executar Docker/Caddy real como rollback sem confirmação humana explícita.
