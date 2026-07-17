# ALLOWLIST — Ouro VPS ↔ GitHub (não perder o que funciona)

> **Criado:** 2026-07-17 · Grok · ordem do Pivete: liquidar, limpar não-ouro, salvar ouro, puxar #218  
> **Regra:** ouro versiona no GitHub; lixo não polui; secrets nunca no Git.

---

## 🥇 OURO — preservar e versionar

| Path / item | Por quê | Onde no Git |
|-------------|---------|-------------|
| `apps/modulos/arsenal-openai-adapter/server.mjs` | Gateway live: `/providers/*` + fallback abacus→tokenrouter | PR **#234** branch `chore/gateway-providers-routes` (ainda **não** na `main`) |
| `apps/modulos/arsenal-openai-adapter/PROVIDERS-ROUTES.md` | Mapa de rotas por provedor | PR #234 |
| `apps/modulos/arsenal-openai-adapter/telegram-grupo.mjs` | Post do Council no grupo (ajuste formatação) | working tree → commit no #234 |
| `docs/CONSCIENCIA/ARSENAL/regras.json` | Modelos do Council (router/juiz/vozes) | já na `main` |
| `docs/CONSCIENCIA/ARSENAL/ARQUITETURA-GITHUB-VPS-8-AGENTES.md` | Governança 8 agentes GitHub↔VPS (Pivete) | versionar no #234 |
| `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/REGRA-OFICIAL-MULTI-AGENTE-SEMANTICO.md` | Regra-mãe multi-agente (ciclo 5 passos) | **main** via PR **#218** — puxar p/ VPS |
| `docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md` | Porta de entrada (atualizado no #218) | main via #218 |
| `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` | Decisões (entrada do #218) | main via #218 |
| `docs/CONSCIENCIA/APRENDIZADOS.md` | Aprendizados #330–#332+ | allowlist de registro |
| `docs/CONSCIENCIA/ALLOWLIST-OURO-VPS-GITHUB.md` | Este arquivo | versionar |

### Runtime ouro (VPS — não commitar valores)

| Item | Nota |
|------|------|
| `secrets/.env` + `TOKENROUTER_*` | Keys; **nunca** Git |
| PM2 `CentralDark-ArsenalAdapter` (id 28) | Executor do gateway |
| `apps/modulos/arsenal-openai-adapter/ecosystem.config.cjs` | Config PM2 (sem commitar secrets embutidos novos) |

### Ouro pendente de versionar (não apagar)

| Item | Ação |
|------|------|
| `apps/modulos/proxy-unlimi/` | Funcional no PM2, **0% no Git** — PR futuro dedicado |
| `apps/modulos/HERMES-CORE/` (núcleo tracked) | 🔒 — só diff consciente |
| `HERMES-THINKER/` untracked | Quarentena — **não apagar** sem auditoria |

---

## 🗑️ NÃO-OURO — pode limpar (não é motor)

| Path | Motivo |
|------|--------|
| `docs/CONSCIENCIA/ARSENAL/DEBATES/*.md` (testes “diga oi”, FALLBACK_OK) | Log de teste do WebUI, não código |
| `docs/CONSCIENCIA/ARSENAL/EVOLUCAO/2026-07-*` soltos untracked | Rastro experimental diário |
| `apps/modulos/grupo-evolucao/missions/drift-*.json` | Estado de missão, polui tree |
| `apps/modulos/arsenal-openai-adapter/server.mjs.bak-*` | Backup local |
| `apps/modulos/arsenal-openai-adapter/grock2.txt` | Lixo de teste |
| `chore(painel): IA atualiza painel` commits em massa | Ruído de automação (não apagar histórico git em massa; só não priorizar) |
| `apps/modulos/status/*-vivo.json` / painel timestamps | Estado vivo → Supabase, não main |

---

## 📋 Checklist operacional (esta liquidação)

1. [x] Salvar ouro gateway no branch do PR #234  
2. [x] Puxar arquivos do PR #218 (`origin/main`) para working tree  
3. [x] Limpar não-ouro listado acima  
4. [x] Allowlist versionada  
5. [ ] Merge PR #234 na main (só com OK Pivete + revisores)  
6. [ ] Versionar `proxy-unlimi` (PR futuro)  

---

## ⚠️ Nunca nesta limpeza

- `rm -rf` em `secrets/`, `HERMES-CORE` núcleo, `hub`, bots 🔒  
- `git reset --hard` / force-push na `main`  
- Apagar `server.mjs` live ou reiniciar PM2 em massa  
- Comitar `.env` / keys  

---

## Prova de ouro vivo (smoke)

```bash
curl -s http://127.0.0.1:8090/providers | jq '.fallback, [.providers[].id]'
# esperado: fallback.enabled=true, providers: arsenal, abacus, tokenrouter
```
