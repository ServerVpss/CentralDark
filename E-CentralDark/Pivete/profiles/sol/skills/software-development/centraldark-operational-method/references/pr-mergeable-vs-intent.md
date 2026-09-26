# PR mergeable ≠ Intenção Reconciliada (CentralDark)

Cristalizado 2026-08-27 da sessão de investigação do CHEFE.

## Fatos medidos

- PR #1172 (`🔐 !CENTRALDARK — CICLO MESTRE RECONCILIADO`) = MERGED em
  `2026-08-26T15:11:05Z` (gh api + `git log origin/main --grep=1172` →
  commit `6ecdb3d0c`). Author: segredounlock.
- O #1172 mexeu em `TRIGGERS.yml`, `ENGINE_BINDING.yml`,
  `GraphRAG-Master/agent.mjs` — MESMOS arquivos dos PRs #1166/#1167/#1168/#1169/#1170
  (família trigger-fabric / GraphRAG / banda).
- O #1172 criou `docs/CONSCIENCIA/APRENDIZADOS/` (PASTA) sendo que já existe
  `docs/CONSCIENCIA/APRENDIZADOS.md` (ARQUIVO ÚNICO) usado a sessão inteira.
  Isso é segundo cérebro / V2 solto — proibido pelo CONTRATO.
- O #1172 criou `scripts/trigger-fabric/centraldark_master_cycle.py` que já
  nasceu quebrado (hotfix #1218 "reparar centraldark_master_cycle.py quebrado").

## Veredito

`mergeable: true` do GitHub só prova AUSÊNCIA DE CONFLITO DE TEXTO no git.
NÃO prova que o PR reconciliou com a intenção real do CHEFE
(REUSE_BEFORE_CREATE, ONE_WRITER_PER_SCOPE, não duplicar memória).

```
FALHA 1 — Colide sem reconciliar:
  #1172 = 6º competidor no MESMO território (TRIGGERS/ENGINE_BINDING/GraphRAG)
  sem ter feito a RECONCILIAÇÃO dos outros 5 (#1166-#1170) primeiro.
  O git passou (mergeable) porque os diffs não colidiam linha a linha,
  mas arquiteturalmente empilhou em cima de família já fragmentada.
```

## Regra cristalizada

ANTES de aprovar/mergear PR no CentralDark:
1. `gh pr view <n> --json files` → lista os arquivos tocados.
2. Cruzar contra PRs da MESMA família semântica já abertos/merged.
3. Se >1 PR toca o mesmo dono canônico sem UNIFY → é colisão silenciosa,
   não "mergeable".
4. Checar se cria PASTA duplicando ARQUIVO existente (padrão segundo cérebro).
5. `mergeable: true` NUNCA substitui checagem de intenção contra o CONTRATO.

## Comando de checagem

```bash
gh pr view 1172 --json files -q '.files[].path'
# cruzar com grep nos PRs da família
gh pr list --state all --search "TRIGGERS" --json number,title
```

NUNCA declarar "segue intenção" só porque o PR mergeou. Medir o diff contra
o contrato. UNKNOWN != PASS.
