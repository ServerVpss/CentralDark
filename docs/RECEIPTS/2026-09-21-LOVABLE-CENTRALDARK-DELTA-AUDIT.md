# 🧿 Lovable → CentralDark · Delta Audit · 2026-09-21

```text
PR_MOTHER=#1562
PR_ROLE=CHILD_PROMOTION_PR
BOT_ENTRY=!CENTRALDARK
BOOT_CHAIN=#ACORDAR → !CALIBRAR
Intent-Authorized: SEGREDO/CHEFE
Writer: ChatGPT/SOL
Writer-Scope: Lovable source audit / delta reconciliation
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
UNKNOWN != PASS
DOCUMENTED != EXECUTED
```

## Objetivo

Usar o MCP do Lovable como fonte viva para comparar projetos CentralDark antigos/evolutivos contra a `main` atual, sem copiar projeto inteiro e sem criar arquitetura paralela.

Regra:

```text
PROJETO_ANTIGO
→ MEDIR
→ COMPARAR_COM_MAIN
→ IGUAL/DUPLICADO = DESCARTAR
→ DELTA_MATERIAL = CANDIDATO
→ ENCAIXAR_NO_OWNER_EXISTENTE
→ TESTE
→ CONTRAPROVA
→ PROMOÇÃO PELO PR-FILHO
```

## Snapshot observado

### GitHub

- repo: `ServerVpss/CentralDark`
- main observada ao abrir esta auditoria: `1606e38d3d0e68845578590e6c13148bb7e4a19d`
- PR-mãe: `#1562` · rendezvous ledger · DO_NOT_MERGE

### Lovable · CentralDark Ascending

- project_id: `b80234c5-df19-4834-a19c-99b8fddcbc98`
- latest_commit_sha: `6191e382feccc0668bcd62adf3e703f56bb58ee8`
- published: `true`
- delta observado:
  - `src/lib/pack-export.ts`
  - geração browser-only de pacote ZIP;
  - SHA-256 por arquivo;
  - `manifest.json`;
  - provenance;
  - README/docs/data/assets gerados;
  - `JSZip`;
  - UI de auditoria exibindo arquivo/tamanho/hash.

Busca na `main` por `pack-export.ts`, `central-dark-ascending` e cluster `JSZip + manifest + SHA-256 + provenance` não retornou correspondência equivalente.

**Estado:** `CANDIDATE_DELTA`

**Importante:** ausência em busca != prova absoluta de inexistência repo-wide. Antes de portar código, o owner atual deve ser localizado e o delta discriminado contra capacidades equivalentes.

### Lovable · Central Dark Instinct

- project_id: `49f92031-3d87-4d3b-9c94-38149b9f4f65`
- latest_commit_sha: `a55bc8b546727b787661698843351d274651fbc1`
- published: `true`

A `main` já contém a família em:

- `public/central-dark-instinct-2/src/lib/export-pdf.ts`
- `public/central-dark-instinct-2/src/routes/index.tsx`
- `public/central-dark-instinct-2/src/lib/i18n.tsx`

O conteúdo observado inclui exportação PDF local-first, timeline, Fable Loop / Meta Lupa e Instinto Superior.

**Estado:** `ALREADY_ABSORBED_OR_SUPERSEDED_BY_MAIN`

Não copiar o projeto inteiro.

## Primeiro veredito

```text
INSTINCT
→ NÃO TRANSPLANTAR
→ main já carrega família equivalente

ASCENDING
→ NÃO TRANSPLANTAR INTEIRO
→ garimpar somente o cluster de exportação auditável
→ localizar owner existente
→ provar que é delta material
```

## Fronteira

Ainda NÃO está provado nesta auditoria:

- qual owner exato deve receber o cluster de Pacotão;
- se existe implementação equivalente com outro nome/caminho;
- se o código Lovable compila sem adaptação dentro do owner atual;
- runtime/deploy;
- zero regressão.

```text
SEARCHED != VERIFIED_COMPLETE
CANDIDATE != MERGEABLE_DELTA
PR_OPEN != PASS
MERGED != DEPLOYED
```

## Próximo cursor

1. localizar owner atual de pacote/export/manifest/hash/provenance na main;
2. comparar comportamento, não nomes de arquivo;
3. se o delta sobreviver, portar somente a menor peça útil;
4. validar no mesmo branch;
5. contraprovar;
6. registrar receipt;
7. promover pelo PR-filho e devolver receipt ao #1562;
8. depois autenticar a outra conta Lovable e repetir o mesmo funil para o restante do corpo.
