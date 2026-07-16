# Auditoria de rastro GitHub — sessão Grok 2026-07-16

> **Objetivo:** garantir que o ouro da sessão ficou no GitHub (Fonte da Verdade), com fluxo limpo, sem destruir o que já existia no `origin/main`.  
> **Agente:** Grok 4.5 CLI · VPS CentralDark  
> **PR:** #228 · branch `chore/auto-registro-castelo-20260716`

---

## 1. Escopo da sessão (o que deveria deixar rastro)

| Item | Tipo | Precisa GitHub? |
|------|------|-----------------|
| Apresentação sessão MAIÚSCULAS | regra Grok | sim |
| Cards estudo Telegram | preferência | sim |
| Auto-registro castelo | regra + script | sim |
| PR para crítica | meta-regra | sim |
| Pivete determina aprendizado | regra ouro | sim |
| APRENDIZADOS 326–328 (VPS) | lições | sim (renumerar) |
| Decisão auto-registro | histórico | sim |
| Cards Telegram enviados | ephemeral | não |
| Transcript do chat | ephemeral | não |
| `~/.grok/rules` global (home) | espelho local | opcional (repo tem `.grok/rules`) |
| Working tree suja (bot/Hermes/.env) | dívida prévia | **não** no PR desta sessão |
| Merge main / force-push | proibido sem ordem | não feito |

---

## 2. O que já estava no PR (antes da correção)

- Regras `.grok/rules/00`–`04`
- `scripts/agents/auto-registrar-castelo.mjs`
- `mem/preferences/cards-estudo-telegram.md`
- Entradas de aprendizado (conteúdo da sessão)
- Decisão de auto-registro no histórico

---

## 3. Crítica — o que estava ERRADO

### 🔴 Crítico: APRENDIZADOS sobrescrito com numeração da VPS

- `origin/main` já tinha **#326–#329** (overclock / domínios / 502).
- A VPS `main` local (divergente) tinha **#326–#328** com **outro conteúdo** (cards / auto-registro / aprendizado).
- O PR trouxe o arquivo da VPS e **apagou do diff** os títulos 326–329 do origin (4 entradas de ouro do remote sumiriam no merge).

**Causa raiz:** `git checkout` de arquivos de commit local divergente em cima de branch baseada em `origin/main`, sem merge append-only.

### 🟡 Médio: HISTORICO inchado com blocos só da VPS

- PR trouxe histórico com decisões **#30–#32** estilo VPS, enquanto `origin/main` max era **#27**.
- Risco de ruído/conflito em merge, não necessariamente perda de 28–29 do origin (origin não tinha 28+).

### 🟢 OK

- Regras e script são **arquivos novos** (A) — sem colisão.
- Nenhum secret no PR.
- Nenhum force-push, nenhum merge automático, sem mexer em 🔒 de runtime nesta entrega.
- Ephemeral (Telegram) corretamente fora do Git.

---

## 4. Correção aplicada (esta auditoria)

1. **Rebaseline** `APRENDIZADOS.md` a partir de `origin/main`.
2. **Append-only** das lições da sessão como **#330–#333** (sem roubar 326–329 do remote).
3. **Rebaseline** `08-HISTORICO-DECISOES.md` a partir de `origin/main`.
4. **Append-only** decisões **#28–#30** (auto-registro, meta-PR, esta auditoria).
5. Relatório de auditoria versionado neste arquivo.
6. Manter regras 00–04 + script + preferência.

---

## 5. Checklist pós-correção (revisores)

- [ ] `origin/main` entradas 326–329 (overclock/domínios) **ainda presentes** no APRENDIZADOS do PR
- [ ] Entradas 330–333 da sessão Grok **presentes**
- [ ] HISTORICO origin até 27 **preservado**; 28–30 **só append**
- [ ] Script não toca `.env` / secrets / áreas 🔒 de código
- [ ] Zero V3; estende processo de memória existente
- [ ] Merge só com ordem do Pivete após crítica

---

## 6. Fluxo limpo daqui pra frente (anti-falha)

```text
1. Ouro da sessão → append em APRENDIZADOS/HISTÓRICO a partir do origin
2. Branch limpa de origin/main (ou rebase cuidadoso)
3. PR para o sistema criticar
4. Sem copiar arquivo monólito da VPS divergente por cima do GitHub
5. Ephemeral (Telegram) ≠ substituto de rastro Git
```

---

## 7. Veredito

| Pergunta | Resposta |
|----------|----------|
| Sessão deixou rastro no GitHub? | **Sim**, via PR #228 (com correção) |
| Havia risco de destruir ouro remoto? | **Sim** — corrigido nesta auditoria |
| Pronto para merge cego? | **Não** — aguarda crítica do Pivete/revisores |
| Castelo runtime alterado por este PR? | **Não** (docs/regras/script allowlist) |

