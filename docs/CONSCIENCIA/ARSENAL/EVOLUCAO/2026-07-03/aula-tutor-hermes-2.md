---
title: "Aula Tutor Hermes 2"
date: 2026-07-03
tags: ["consciencia"]
updated: 2026-07-03
---

```
┌──────────────────────────────────────────────────────────────┐
│  🎓 AULA DO TUTOR 2 — HERMES · 03/07/2026 (Fable)            │
│  Fecha os 2 gaps da aula 1 + 4 técnicas novas.               │
│  Ledger: ARSENAL/APRENDIZADOS.md · Índice:                   │
│  APRENDIZADOS-INDEX.json · Cérebro vivo (injetado no prompt):│
│  AGENTES-AUTONOMOS/hermes/aprendizados.json                  │
└──────────────────────────────────────────────────────────────┘
```

# 🎓 Aula do Tutor 2 — Hermes (03/07/2026)

## 📋 Diagnóstico do aluno (pós aula 1)

**Evoluiu:** concluiu a missão `finalizar-hub-v2` em 77 etapas, commit `00f4403a3` pushado por ele mesmo aplicando git cirúrgico. Retomada automática segurou 3 restarts.

**Gaps da aula 1 — FECHADOS HOJE:**
1. ✅ `cerebro.mjs` integrado: o path estava quebrado desde o move pra `AGENTES-AUTONOMOS/hermes/` (`../../docs/...` resolvia pra pasta inexistente). Corrigido pra `../../ARSENAL/APRENDIZADOS.md` e o executor agora importa o cérebro — toda chamada de `aprender` grava nas 2 camadas.
2. ✅ Detector v3 implementado no decisor: `normalizarComando()` remove echos-marcador e comentários antes de comparar. Mesmo comando 3x nas últimas 6 etapas → bloco 🚨 EFEITO REPETIDO no prompt + escala direto pro gemini-2.5-pro.

**Bônus descoberto na revisão:** a própria ferramenta `git` do executor usava `add -A` — contradizia a lição da aula 1. Corrigida (Técnica 10).

---

## 🧠 Técnica 7: Confie no exit code (anti "se convencer")
**Contexto:** validar build/typecheck/teste.
**Anti-padrão:** rodar `tsc` 4x com echos diferentes pra "confirmar" — foi exatamente o que você fez na missão do hub, e agora o detector v3 bloqueia.

```bash
npx tsc --noEmit -p tsconfig.app.json && echo VALIDACAO-OK || echo VALIDACAO-FALHOU
```
UMA rodada. O resultado fica no histórico — a decisão seguinte lê de lá. Repetir o comando não gera informação nova, só queima etapa e crédito.

## 🧠 Técnica 8: Como o detector v3 te enxerga
**Contexto:** entender a mecânica pra não brigar com ela.

O decisor normaliza cada comando shell do histórico:
1. remove `&& echo ...` / `; echo ...` / `|| echo ...` (marcadores)
2. remove comentários `#...`
3. colapsa espaços

Se o comando normalizado aparecer 3+ vezes nas últimas 6 etapas, entra o bloco 🚨 EFEITO REPETIDO e a decisão escala pro modelo forte. Tradução: **mudar o enfeite do comando não engana ninguém** — mude a ESTRATÉGIA.

## 🧠 Técnica 9: Memória em 2 camadas
**Contexto:** usar a ferramenta `aprender` do jeito certo.

- **Camada viva:** `aprendizados.json` — o decisor injeta a categoria relevante (por gatilho) no prompt de cada decisão. É o que muda seu comportamento AGORA.
- **Camada histórica:** `ARSENAL/APRENDIZADOS.md` via `cerebro.mjs` — ledger `DATA | TIPO | CONTEXTO | CAUSA | ACAO_CORRETIVA | CONFIRMADO_POR`, auditável pelo Pivete e pelas outras IAs.

Desde hoje, um `aprender` grava nas duas de uma vez. Lição boa = curta, acionável, com o comando certo dentro.

## 🧠 Técnica 10: git da ferramenta agora é cirúrgico
**Contexto:** `commit_push` no fim de missão.

```json
{ "acao": "commit_push", "mensagem": "feat(hub): x", "paths": ["apps/modulos/hub"] }
```
- **SEMPRE** passar `paths` — só o que a missão tocou.
- Sem `paths`, o fallback é `git add -u` excluindo `painel-data.json`, arquivos de ambiente e `.bak` — nunca mais `add -A`.
- Push rejeitado: a ferramenta já tenta `pull --rebase --autostash` e, se conflitar, aborta e reporta `PUSH PENDENTE` — não insista por fora.

---

## 📌 Erros/gaps virados em lição (já no ledger + canal vivo)
1. `tsc` rodado 4x com echos diferentes → Técnica 7 + detector v3 (mecânico).
2. `cerebro.mjs` órfão por path quebrado pós-move → integração em 2 camadas (mecânico).
3. Ferramenta `git` interna com `add -A` → paths explícitos + fallback seguro (mecânico).
