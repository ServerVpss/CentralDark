# Pacote Nível 7 — 3 agentes adversariais

Pacote **interno** da skill canônica `lupa-bayesiana`. Não é skill nova. Não renomeia
a Lupa. Não substitui `SKILL.md`.

## Agentes

| ID | Papel | Contrato |
|---|---|---|
| `01-observador-de-padroes` | detecta mudança de narrativa/tom/regra; separa `fato > resultado > inferência > hipótese`; não corrige por conta própria. | `01-observador-de-padroes/contract.json` |
| `02-conversor-de-erro-em-teste` | transforma erro comprovado em causa + correção mínima + teste permanente; preserva observação bruta append-only. | `02-conversor-de-erro-em-teste/contract.json` |
| `03-orquestrador-de-evolucao-aberta` | roteia 01+02, mantém checkpoint, executa AutoLupa, promove apenas aprendizado validado, emite veredito. | `03-orquestrador-de-evolucao-aberta/contract.json` |

## Fluxo

```
entrada  →  01 Observador  →  ledger append-only
              │
              ▼ (se erro comprovado)
           02 Conversor  →  teste permanente + causa + correção mínima
              │
              ▼
        03 Orquestrador  →  AutoLupa até ponto fixo  →  veredito
```

## Regra de imutabilidade Omega

Entre commit BASELINE e commit SOLUÇÃO, os arquivos sob `contracts/`, `**/tests/` e
`evidence/ledger.jsonl` devem permanecer byte-a-byte. Check em
`03-orquestrador-de-evolucao-aberta/tests/test_baseline_imutavel.py`.

## Fonte canônica externa

`docs/CONSCIENCIA/DESAFIO-NIVEL-7-AGENTES-ERRO-ABERTO.md`.
