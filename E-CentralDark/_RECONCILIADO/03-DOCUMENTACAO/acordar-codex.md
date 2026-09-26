---
name: Acordar o Codex em PRs parados
description: Como destravar PRs com label needs-codex-review quando o Codex Connector não revisou sozinho.
type: feature
---

# Acordar o Codex em PRs parados

## Quando aplicar
- PR aberto há horas no `ServerVpss/CentralDark` com label `needs-codex-review` (ou sem label mas no escopo do Codex).
- Usuário diz "acorda o codex", "codex tá dormindo", "ninguém revisou".

## Receita (testada 2026-06-10 nos PRs #21, #23, #24)
1. Identificar PRs parados:
   ```bash
   curl -s -H "Authorization: Bearer $GITHUB_PAT_PERFIL" \
     "https://api.github.com/repos/ServerVpss/CentralDark/pulls?state=open"
   ```
2. Garantir label `needs-codex-review` em todos:
   ```bash
   curl -X POST -H "Authorization: Bearer $GITHUB_PAT_PERFIL" \
     -H "Accept: application/vnd.github+json" -H "Content-Type: application/json" \
     "https://api.github.com/repos/ServerVpss/CentralDark/issues/<N>/labels" \
     -d '{"labels":["needs-codex-review"]}'
   ```
3. Postar comentário com a **mention oficial** que dispara o connector:
   ```
   @chatgpt-codex-connector please review this PR.
   ```
   Via API:
   ```bash
   curl -X POST -H "Authorization: Bearer $GITHUB_PAT_PERFIL" \
     -H "Accept: application/vnd.github+json" -H "Content-Type: application/json" \
     "https://api.github.com/repos/ServerVpss/CentralDark/issues/<N>/comments" \
     -d '{"body":"@chatgpt-codex-connector please review this PR."}'
   ```
4. Reagir ❤️ no próprio comentário (medalha Heart On Your Sleeve + sinal pro humano):
   ```bash
   curl -X POST -H "Authorization: Bearer $GITHUB_PAT_PERFIL" \
     -H "Accept: application/vnd.github+json" -H "Content-Type: application/json" \
     "https://api.github.com/repos/ServerVpss/CentralDark/issues/comments/<COMMENT_ID>/reactions" \
     -d '{"content":"heart"}'
   ```
5. Esperar ~2-5 min. Se não vier review, abrir Issue de investigação (o connector pode estar fora) — ver `docs/CONSCIENCIA/CODEX-REVISAO-PRS.md` e Issue #9 (gatilho real do Codex).

## Atenção
- Header HTTP correto: `Authorization: Bearer $GITHUB_PAT_PERFIL` + `Accept: application/vnd.github+json` + `Content-Type: application/json`.
- Sempre incluir trailer `Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>` no commit (não no comentário) — comentário não conta pra Pair Extraordinaire.
- Não fazer merge sem review do Codex em PR que tem essa label — princípio "Codex como agente principal".
