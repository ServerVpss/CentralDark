# ENSINE O AGENTE DO PR #1388

Não diagnostique eternamente. Resolva pela cadeia:

```text
!CENTRALDARK
→ medir PR/head/base
→ preservar deltas antigos já corretos
→ sincronizar main
→ nunca normalizar stale state como baseline
→ corrigir o owner
→ regenerar identidade derivada
→ testar
→ contraprovar
→ commitar
→ testar de novo no commit exato
→ push normal
→ provar que remoto == commit testado
```

## Caso `parallel_existing=12`

Isso é sintoma de uma branch que ainda contém paralelos removidos/consolidados pela base atual.

**NÃO:**
`expected = 12`

**SIM:**
`sync main -> rerun -> expected canônico continua intacto`.

## Caso Meta Lupa identity

`AUTOLUPA_CANONICAL_SHA` é derivado do conteúdo atual de `SKILL.md`.

```bash
git hash-object .agents/skills/meta-lupa/SKILL.md
```

O arquivo de identidade deve registrar esse blob id e o path canônico. Depois, validar novamente.

## Caso CORE markers

Não faça o teste "tolerar" core incompleto.

Corrija o owner `LEIA-ME-IA.md` com os markers canônicos faltantes, idempotentemente:

```text
REUSE_BEFORE_CREATE_REQUIRED=true
ARCHITECTURE_LOCK=true
UNKNOWN_IS_NOT_PASS=true
EXECUTOR_CANNOT_SELF_APPROVE=true
JUDGE_DOES_NOT_MUTATE=true
GRAPH_IS_DERIVED_NOT_AUTHORITY=true
```

## Gate final

Local PASS em HEAD diferente não vale.

```text
TESTED_HEAD == COMMITTED_HEAD == PUSHED_PR_HEAD
```

Senão: `UNKNOWN`.
