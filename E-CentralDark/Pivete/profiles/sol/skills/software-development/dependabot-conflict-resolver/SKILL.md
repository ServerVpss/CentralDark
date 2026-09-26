---
name: dependabot-conflict-resolver
description: Padrão ÚNICO da Casa para conflito de PR (dependabot ou humano). Use quando PR abrir CONFLICTING, main avançar sob PR aberto, ou perguntarem como resolver conflito. NÃO criar segundo resolvedor — este se atualiza.
trigger:
  - PR Dependabot com conflito
  - mergeable=false
  - drift-guard vermelho por divergência
  - "resolver todos os conflitos"
phases: "SCAN → RESOLVE → PUSH → VERIFY_CI → LOOP"
rules:
  - PADRAO: package.json/lock aceita main + aplica BUMP do PR
  - CORE (centraldark_master_cycle.py, lupa, docs, .github): mantém main
  - FAIL_CLOSED: não inventa resolução se não determinística
  - NUNCA force-push em branch de PR alheio sem autorização
  - LABELS_CANONICAS obrigatórias (👑 PERMITO-SEGREDO etc)
runtime_checks:
  - gh pr view $PR --json mergeable
  - git merge --no-commit origin/main
  - gh pr checks $PR
failure_signature: "conflito em package-lock + drift-guard vermelho"
remediation:
  - rodar scripts/dependabot/resolve-conflicts.sh $PR
  - se falhar: investigar manual, não guess
provenance:
  sources:
    - "scripts/dependabot/resolve-conflicts.sh"
    - "CHEFE: 'torna padrão do motor, difunde em 10 frentes, amarra no cognitivo'"
  tests:
    - "PR #1193 resolvido (typescript 5.9.3)"
    - "PR #1341 teste de prova (zod bump fake) — motor disparou sozinho, NO_CONFLICT determinístico"
    - "PR #1321/1318/1315 resolvidos (runner offline → online)"
  receipts:
    - "dependabot.conflict.resolved.receipt"
    - "PR #1341: motor resolve-conflicts.sh rodou sem papagaio, sem guess"
counterproof: "gh pr view mergeable=true + CI green após resolução"
fixed_point_contribution: "Dependabot nunca trava em conflito; padrão aplicado em todos os PRs"
mantra: "MAIN + BUMP = RESOLVIDO; CORE = MAIN; FAIL_CLOSED = NÃO_INVENTA"
---

# DEPENDABOT CONFLICT RESOLVER — Agente Regisse

## Papel
Este agente/skill é o **motor cognitivo** da Casa para conflitos de Dependabot.
Não é pessoa, não é modelo: é o padrão determinístico que roda em loop.

## Padrão Canônico (VERMELHO → RESOLVIDO)
```
CONFLITO em package.json/lock
→ ACEITAR MAIN (base)
→ APLICAR BUMP do PR (typescript ^5.9.3, radix-ui, etc)
→ COMMIT + PUSH

CONFLITO em centraldark_master_cycle.py / lupa / docs / .github
→ MANTER MAIN (ours)

SE NÃO DETERMINÍSTICO
→ FAIL_CLOSED (não inventa)
```

## 10 Frentes de Difusão (amarrado no motor)
1. `scripts/dependabot/resolve-conflicts.sh` — execução determinística
2. `.github/workflows/dependabot-auto-merge.yml` — dispara script em conflito
3. `dependabot.yml` — labels canônicas (já feito)
4. Skill `dependabot-conflict-resolver` — este agente
5. SOUL — mencionar padrão de conflito
6. LEIA-ME-IA — boot inclui resolução de conflito
7. `CENTRALDARK_AI_BOOT.yaml` — campo conflict_resolution
8. PR template — aviso de conflito
9. CI gate — drift-guard usa este padrão
10. Doc de aprendizado — caso #1193

## Workflow (determinístico)
```bash
# Em conflito detectado pelo dependabot-auto-merge.yml:
bash scripts/dependabot/resolve-conflicts.sh $PR_NUMBER
# → resolve, push, dispara CI
```

## Fixed Point
- Todo PR Dependabot conflitado resolvido por script
- CI green após resolução
- Nenhum conflito manual pendente
