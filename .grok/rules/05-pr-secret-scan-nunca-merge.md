# REGRA — Alerta de segredo no diff = freio absoluto (Pivete · 2026-07-17)

**Origem:** incidente PR #234 (branch VPS divergente arrastou `.env` + keys em ecosystem) + alerta automático de segurança.  
**Status:** obrigatória · selada por aprendizado

## Alerta canônico (não ignorar)

```text
🚨 Alerta de segurança automático
⛔ Padrão de segredo detectado no diff — revisar antes do merge.
Verificar: .env, secrets/, tokens/, sessions/, *.pem, *.key, -----BEGIN PRIVATE KEY.
```

Qualquer mensagem equivalente (secret scan, gitleaks, “credential in diff”) = **mesma lei**.

## Lei

1. **NUNCA mergear** PR com esse alerta ativo — mesmo que o resto seja “ouro”.
2. **NUNCA** dizer “é falso positivo, mergea assim mesmo” sem o Pivete ver o path.
3. **NUNCA** colar o valor do secret no chat, no PR ou no commit “pra provar”.
4. **SEMPRE** isolar o ouro em **branch nova a partir de `origin/main` limpa** (1 commit, poucos arquivos) — **não** reabrir monstro tipo #234.
5. **SEMPRE** tratar key que entrou no histórico Git como **potencialmente queimada** → pedir/rotacionar (sem ler o valor no log).

## Antes de `git push` / abrir PR (checklist Grok)

- [ ] Branch criada de `origin/main` (não da VPS divergente com 7k commits)
- [ ] `git status` / `git diff --name-only` — zero: `.env`, `secrets/`, `*.pem`, `*.key`, `tokens/`, `sessions/`
- [ ] Nenhum literal: `cdk_live_…`, `sk-…`, `gsk_…`, `BEGIN PRIVATE KEY`, connection string com senha
- [ ] Ecosystem/PM2: keys só via `process.env` / arquivo **fora** do Git — nunca string fixa no commit
- [ ] Se o scan gritar → **parar**, listar **só paths**, abrir PR limpo, comentar DO NOT MERGE no sujo

## O que fazer quando o alerta aparecer

| Passo | Ação |
|-------|------|
| 1 | Parar merge / não “forçar verde” |
| 2 | Confirmar stats: commits, arquivos, `mergeable` |
| 3 | Identificar **paths** (nunca valores) |
| 4 | Draft + comentário 🛑 DO NOT MERGE no PR sujo |
| 5 | PR limpo só ouro (ex.: #235 vs #234) |
| 6 | Registrar em APRENDIZADOS + avisar Pivete (card se útil) |
| 7 | Rotação de secret (Pivete / processo oficial) |

## Exemplo que deu errado → certo

| Errado | Certo |
|--------|--------|
| Branch da VPS com painel + `.env` → PR #234 monstro | `git worktree` / branch de `origin/main` + copiar só ouro → PR #235 |
| “Mergea que o gateway funciona na VPS” | VPS live ≠ PR mergeável; secret no Git é incidente à parte |
| Discutir o valor do token | Só: “há literal em `ecosystem.config.cjs` / `.env` — rotacionar” |

## Relação com outras regras

- Auto-registro castelo: incidente de secret **sempre** registra (proteção)
- PR pra crítica: corpo do PR pede relevância + sem destruir legado; **secret bloqueia merge**
- Fluxo de Ouro: GitHub = Fonte da Verdade **sem** secrets; secrets = VPS/`secrets/` fora do Git

## Nunca

- `git add .` / `git add -A` na VPS sem olhar
- Commitar `.env` “só um pouquinho”
- Force-push pra apagar secret do histórico sem plano (histórico já vazou — rotação > teatro)
- Reabrir PR monstro depois do limpo existir
