# PADRAO DE NOMENCLATURA E ARQUIVAMENTO — CENTRALDARK

> Fixed point da organizacao documental. Derivado do *Manual de Boas Praticas
> para Gestao de Pastas e Arquivos Digitais* (TCU, 2019) e da medicao viva do
> repositorio em 2026-11-04.

## 1. Causa raiz

A medicao de 2026-11-04 achou **9 pares de pastas duplicadas por caixa** em
`docs/` e **5 valvulas de arquivamento concorrentes** (`_archive/`,
`docs/_LEGADO_ROOT_DOCS_CONFLITOS/`, `docs/CONSCIENCIA/ARQUIVO-MORTO/`,
`docs/receipts/`, `_archive/skill-c-copies-*`).

A causa nao e falta de ferramenta — e ausencia de **um owner canonico** e de
**um vocabulario unico de nome**. Regra aplicavel: `REUSE_BEFORE_CREATE`.

## 2. Regra de nomenclatura (obrigatoria)

1. **kebab-case minusculo** para todo arquivo e pasta.
2. **Sem acento, sem cedilha, sem espaco.**
3. **Sem caractere especial** — `& # , ( ) ! ? : * " < > |`.
4. **Separador e hifen**, nunca underscore (o hifen nao desaparece em link).
5. **Sem abreviacao** nao padronizada.
6. **Toda pasta com mais de um item** (evitar pasta orfa).
7. **Documento datado** usa o sufixo `-AAAAMMDD` (ex.: `-20261104`).
8. **Versao de arquivo** usa `-vAAAA-MM-DD` no FIM do nome.

### Exemplos

| Errado | Certo |
|---|---|
| `Diagnostico` | `diagnostico` |
| `00 - Mapa do Sistema` | `00-mapa-do-sistema` |
| `docs/receipts/` + `docs/RECEIPTS/` | `docs/receipts/` (uma so) |
| `ecosystem.config.js.bak-20260705-133220` | `ecosystem.config.js-v2026-07-05` |
| `_PLANO_MIGRACAO_F_PARA_K.md` | `plano-migracao-f-para-k.md` |

## 3. Arquivamento — uma unica valvula

**`_archive/` e a unica valvula canonica.** Subpasta por data de arquivamento:
`_archive/vAAAA-MM-DD/`.

Valvulas legadas a absorver (nao criar novas):

- `docs/_LEGADO_ROOT_DOCS_CONFLITOS/`
- `docs/CONSCIENCIA/ARQUIVO-MORTO/`

## 4. Estado medido em 2026-11-04

| Item | Contagem |
|---|---|
| Pares duplicados por caixa em `docs/` | 9 (piso medido) |
| Valvulas de arquivamento concorrentes | 5 |
| `.ssh/` versionado com arquivos reais | 9 |

## 5. Ordem de correcao

1. Padrao declarado (este documento).
2. Merge de conteudo `docs/receipts/` -> `docs/RECEIPTS/` — **28 arquivos, 0 colisao**.
3. Merge `docs/pendencias/` -> `docs/PENDENCIAS/` — 1 arquivo.
4. Merge `docs/relatorios/` -> `docs/RELATORIOS/` — 1 arquivo.
5. Renomeacao `docs/BRAIN/00 - Mapa do Sistema` -> absorver em `00-MAPA-SISTEMA`.
6. `.ssh/` — risco vivo, PR separado, precede estetica.

## 6. Prova exigida

Nenhum move e aceito sem contracheque: contagem antes, contagem depois,
zero colisao, e leitura do caminho novo com sucesso.

`UNKNOWN != PASS` · `ACTION != PROOF` · `HISTORY != CURRENT_STATE`
