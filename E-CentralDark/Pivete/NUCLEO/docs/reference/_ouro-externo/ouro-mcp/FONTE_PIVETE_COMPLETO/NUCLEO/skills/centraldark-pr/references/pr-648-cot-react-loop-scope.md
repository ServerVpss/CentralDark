# PR #648 — régua de escopo para skill `cot-react-loop`

Caso de referência para PR simples de skill em `ServerVpss/CentralDark`.

## Contrato medido

```text
PR=648
HEAD=11a287188711ea9dcec635bbbb3e8ae4586acffb
COMMITS=1
FILES_CHANGED=1
FILE=.agents/skills/cot-react-loop/SKILL.md
ADDITIONS=411
MERGED=NAO
EXECUTOR_PROGRAMATICO=NAO
META_LUPA_CHANGED=NAO
```

## Separação correta

```text
ANTES   = raciocinio-deliberado
DURANTE = cot-react-loop
DEPOIS  = meta-lupa
```

A `cot-react-loop` governa a fase DURANTE: `PLAN → ACT → OBSERVE → CRITIQUE → REFINE → DECIDE`.
Ela não substitui a MetaLupa, não incorpora o pós-gate e não cria executor programático.

## O que não pode ser confundido com o PR

Fora do escopo canônico do PR #648:

```text
XP automático
tiers e níveis
RSI autônomo
auto-guardrails
ledger global
merge_edits automático
run_autolupa dentro do executor
run_promotion_gate
alteração da MetaLupa
executor Python fingindo controlar tools oficiais
24 horas se reescrevendo
```

## Regra operacional

Quando houver expansão local ou comentário de IA sugerindo esses itens, tratar como hipótese/protótipo separado, não como conteúdo do PR. A auditoria do PR deve voltar ao diff e ao corpo do PR.

## Checks e próximo passo honesto

Se o PR está aberto e `PRONTO_PARA_MERGE=NAO`, não inferir autorização de merge. Próximo alvo correto:

```text
abrir logs dos failures
→ localizar causa exata
→ propor correção mínima
→ só então patch/label/merge com autorização aplicável
```

No caso observado, os failures eram `codex-validate` e `porta-de-entrada`; ambos exigem investigação read-only antes de qualquer escrita.
