# Reconciliation Gate — Revisão de PR na Casa

Técnica cristalizada da sessão 2026-08-27. Aplica em qualquer repo da Casa com
contrato de reconciliação (`docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`)
ou mother-issue de convergência (#722 classe).

## Regra de ouro

> `mergeable: true` prova SÓ que o diff de texto não colide linha a linha.
> NÃO prova que o PR seguiu a intenção, o contrato ou ONE_OWNER_PER_SCOPE.

Nunca confundir:
- `mergeable` / CI verde / REVIEW aprovado  =  estado de merge
- seguir intenção do CHEFE / contrato       =  estado de arquitetura

São independentes. Um PR pode mergear limpo e ainda violar a Casa.

## Checklist antes de aprovar PR

1. `gh pr diff N --name-only` → lista arquivos tocados
2. Para CADA arquivo: já existe OWNER canônico?
   - Se sim e o PR criou ARQUIVO-IRMÃO (nome diferente, mesma pasta) →
     FALHA 2/3: duplicação de owner. Request changes.
3. `gh pr list --search "<arquivo-núcleo>"` → quantos PRs tocam o mesmo core?
   - TRIGGERS.yml / ENGINE_BINDING.yml / GraphRAG-Master/agent.mjs são núcleos
   - Se 3+ PRs no mesmo núcleo sem ONE_WRITER_PER_SCOPE → PR é Nº competidor, não reconciliação
4. Mother-issue (#722): PR cria segundo router / segundo cérebro / segundo vault? → bloquear
5. Sempre re-medir estado antes de afirmar: `gh pr view N --json state,mergedAt` +
   `git log origin/main --grep=N`. Não aceitar "tá open" verbal como fato (UI pode cachear).

## Caso real (PR #1172, sessão 2026-08-27)

PR #1172 "🔐 !CENTRALDARK — CICLO MESTRE RECONCILIADO PASSADO → FUTURO":
- `gh pr view` → state=MERGED (não OPEN). merge commit `6ecdb3d0c` no origin/main.
- Tocou: TRIGGERS.yml, ENGINE_BINDING.yml, GraphRAG-Master/agent.mjs
  (mesmos alvos dos PRs #1166-#1170 → 6º competidor, FALHA 1)
- Criou MASTER-CYCLE.yml + scripts/trigger-fabric/centraldark_master_cycle.py
  (irmãos do trigger-fabric existente → FALHA 2: mecanismo novo em vez de reusar)
- Criou pasta docs/CONSCIENCIA/APRENDIZADOS/ (plural) ao lado de
  docs/CONSCIENCIA/APRENDIZADOS.md (arquivo, singular, 41KB do CHEFE)
  → FALHA 3: segundo cérebro de memória, viola #722
- centraldark_master_cycle.py nasceu quebrado (hotfix #1218 no main depois)

Raiz: `mandatory_pre_solution_sequence` do contrato (passos 3 search_existing /
5 cross_reference / 9 arbitrate / 10 reuse_or_extend) não rodou.
Ter a lei na main ≠ PR obedecer. Só consumer gate (CI) obriga.

## Comando rápido de verificação

```bash
PR=1172
gh pr view $PR --json number,state,mergedAt,baseRefName,headRefName -q '"state=\(.state) merged=\(.mergedAt)"'
git fetch origin --quiet 2>/dev/null
git log origin/main --oneline --grep="$PR" | head
gh pr diff $PR --name-only
gh pr list --search "TRIGGERS.yml" --json number,title -q '.[] | "\(.number)\t\(.title)"'
```
