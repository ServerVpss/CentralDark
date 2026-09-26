---
name: combo-potencia
description: Power Combo offline (ECC+superpowers+graphify+SkillSpector+cc-switch+hermes). Nome fácil. Boom sob pedido.
metadata:
  hermes:
    tags: [combo, skillsllm, ecc, superpowers, graphify]
---

# combo-potencia

Nome fácil do pacote completo (skillsllm Power Combo + hermes).

## APELIDOS (assimilar sem exigir traço/ortografia exata)
```text
combo potencia
combo-potencia
combo-tencia
combo potoencia
combo-potoencia
power combo
boom combo
```
Se o Pivete falar qualquer variação com "combo" + "potencia/tencia/potoencia" → este pacote.

## BOOM (quando o Pivete pedir)
```text
/skill combo-potencia
```
ou
```text
hermes -s combo-potencia
```

Isso carrega o mapa. Depois escolher o braço:

| Braço | Skill de entrada | Vendor offline |
|---|---|---|
| ECC | `cp-ecc` | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\ECC` (281 skills) |
| superpowers | `sp-using-superpowers` (+ família `sp-*`) | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\superpowers` |
| graphify | `cp-graphify` | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\graphify` (branch v8) |
| SkillSpector | `cp-skillspector` | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\SkillSpector` |
| cc-switch | `cp-cc-switch` | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\combo-potencia-vendor\cc-switch` |
| hermes-agent | `cp-hermes-agent` → `hermes-agent` | já na Casa |

## ANTI-BRIGA CLAUDE / ANTI-DELTA
Amigos já presentes (não sobrescritos):
- claude-code, codex, opencode, hermes-agent
- claude-code-security-gate, claude-design, ...

Regras de delta:
1. Casa vence em colisão de nome/função, salvo ordem explícita de override.
2. Tudo do combo usa prefixo `cp-` ou `sp-`.
3. ECC não joga 281 skills no índice global (evita explosão/delta sujo).
4. Superpowers colidentes com Casa foram instalados como `sp-<nome>`.
5. Não misturar install ECC por cima de claude-code local.

## Colisões resolvidas (superpowers)
- brainstorming → sp-brainstorming
- requesting-code-review → sp-requesting-code-review
- subagent-driven-development → sp-subagent-driven-development
- systematic-debugging → sp-systematic-debugging
- test-driven-development → sp-test-driven-development
- verification-before-completion → sp-verification-before-completion
- writing-plans → sp-writing-plans

## Instaladas neste combo (entrada)
- cp-cc-switch
- cp-ecc
- cp-graphify
- cp-hermes-agent
- cp-skillspector
- sp-brainstorming
- sp-dispatching-parallel-agents
- sp-executing-plans
- sp-finishing-a-development-branch
- sp-receiving-code-review
- sp-requesting-code-review
- sp-subagent-driven-development
- sp-systematic-debugging
- sp-test-driven-development
- sp-using-git-worktrees
- sp-using-superpowers
- sp-verification-before-completion
- sp-writing-plans
- sp-writing-skills

## Caminho
`C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\combo-potencia\`

## Gate oficial
URLs vieram de botões View on GitHub do skillsllm + default_branch real.
Skill gate: `anti-zona-burra-gate` (#8 CAMINHO_OFICIAL).
