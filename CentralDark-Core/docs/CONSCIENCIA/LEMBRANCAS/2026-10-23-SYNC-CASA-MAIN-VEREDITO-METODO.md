---
title: "Veredito: relatórios de sync Casa ↔ Main (19 e 23/10/2026)"
date: 2026-10-23
tags: ["lembrancas", "sync", "casa", "main", "historico", "veredito"]
status: "HISTORICO_COM_CORRECAO"
---

# Veredito: os relatórios de sync não seguem o mesmo método

## Relatórios registrados aqui (histórico, não método)

- `2026-10-19-SYNC-REPORT-FINAL-HISTORICO.md`: usou `git reset --hard origin/main` + `git stash pop`. Destrutivo. Não preserva os dois lados no histórico.
- `2026-10-23-SYNC-CASA-MAIN-SINCRONIZACAO-COMPLETA-HISTORICO.md`: afirma 21 conflitos resolvidos com estratégia `theirs = main` em cockpit, skills, docs e scripts. Isso substitui o lado local, contraria "preservando ambos os lados". Também afirma push de `e0d6f81e9f` que não é verificável neste registro.
- `2026-10-23-SYNC-CASA-MAIN-VALIDACAO-FINAL-HISTORICO.md`: validação estrutural de papéis (SOUL, RULES, AGENTS, TRIGGER-FABRIC). Não registra merge com commit verificável.
- `2026-10-23-SYNC-CASA-MAIN-PLANO-EM-PROGRESSO.md`: plano com status EM PROGRESSO e checklist incompleto. Não é resultado.

## Método vigente (2026-10-23)

```text
backup da branch (ref nomeada)
→ git fetch origin
→ git merge --no-commit --no-ff origin/main  (teste; sem resolver por escolha de lado)
→ se sem conflito: commit de merge comum (sem reset, sem stash pop, sem theirs/ours global)
→ push fast-forward (sem force)
→ readback: HEAD local == remoto; rev-list --left-right --count
```

Resultado medido do merge de 23/10: branch `casa/cockpit-marca-cta-20261021` em `ac8aaf669a`, igual ao remoto, 21 à frente e 0 atrás de `origin/main`.

## Lacuna declarada

O mandato exigia ler o conteúdo canônico (SOUL, CONTRACT, TRIGGERS) antes de modificar. Nesta rodada só o estado Git foi medido antes do merge. A auditoria de conteúdo ficou pendente.

## Regra de precedência

Estes arquivos são histórico e proveniência. Não são método vigente. O método vigente é o descrito acima e nas regras do owner (`LEIA-ME-IA.md`, `AGENTS.md`).

NEXT_CURSOR=auditar_conteudo_canonico_antes_de_abrir_PR_casa_main
