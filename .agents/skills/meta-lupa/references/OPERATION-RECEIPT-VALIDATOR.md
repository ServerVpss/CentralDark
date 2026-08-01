# Validador do OPERATION_RECEIPT (LOOP)

> Este arquivo fica em `references/` (não hash-pinned) de propósito: `SKILL.md`
> tem identidade canônica travada em `AUTOLUPA_CANONICAL_SHA` e só pode mudar
> com `PERMITO_PIVETE=1` explícito (`scripts/lupa/validar_autolupa_hash.py --update`).
> Documentar aqui evita mexer nesse hash sem autorização do Chefe.

O contrato `OPERATION_RECEIPT` definido em
`docs/ARQUITETURA/MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md` (seção 10) tem
validador reutilizável no mesmo motor (`scripts/meta_lupa.py`), sem criar
engine concorrente:

```bash
python .agents/skills/meta-lupa/scripts/meta_lupa.py validate-operation-receipt \
  --input <receipt>.json --repo-root .
```

Rejeita enum inválido, `BLOCKED` sem `reason`, `target`/`writer` em branco,
`head_sha`/`evidence_sha256` mal formados, autoaprovação (`writer == judge`) e
conteúdo com padrão de segredo.

`approved_for_promotion` só fica `true` quando **todas** as condições valem no
mesmo receipt:

- `status: PASS`
- `chief_decision: APPROVED`
- `judge` presente e diferente de `writer`
- `evidence_sha256` presente e válido (hex64)
- `head_sha` verificado contra o Git real via `--repo-root` (sem
  `--repo-root`, o `head_sha` só passa por checagem de formato — nunca de
  existência — e `approved_for_promotion` nunca fica `true`)

Testes: `.agents/skills/meta-lupa/testes/test_operation_receipt_validator.py`.

Antes de promover qualquer receipt terminal do LOOP, rodar este validador e
tratar `STATUS=BLOCKED` como gate falho, nunca como aviso.

## Pendência aberta

Ainda não há hook automático que force esta validação antes de um `!REGISTRA`
ou de uma promoção do documento LOOP a canônico — é chamada manual por quem
fecha o ciclo. Automatizar isso (e decidir se `SKILL.md` deve referenciar este
validador, o que exigiria `PERMITO_PIVETE=1`) fica para SEGREDO/CHEFE decidir.
