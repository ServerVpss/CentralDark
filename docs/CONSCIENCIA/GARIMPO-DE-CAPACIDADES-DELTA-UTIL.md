# 🪬 GARIMPO DE CAPACIDADES → DELTA ÚTIL

```text
STATUS=CRYSTALLIZED
PR_MOTHER=#1562
PR_CHILD=#1625
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
READ_ONLY_FIRST=true
UNKNOWN != PASS
SEARCHED != VERIFIED
```

## Intenção

Usar projeto, link, PR, branch, chat, app, pacote ou fonte externa como **mina de capacidades**, não como sistema para transplante cego.

O objetivo é descobrir se alguma capacidade sobrevive à comparação com a CentralDark atual.

## Fluxo

```text
FONTE
→ LEITURA FORENSE
→ INVENTÁRIO DE CAPACIDADES
→ CRUZAR COM MAIN / OWNER / PRs / CHATS / RECEIPTS / RUNTIME
→ DESCARTAR:
   - duplicado
   - já absorvido
   - pior
   - histórico stale
→ SOBREVIVENTE = DELTA ÚTIL / MATERIAL
→ ENCAIXAR NO OWNER EXISTENTE
→ MENOR PATCH
→ TESTE
→ CONTRAPROVA
→ SAME_HEAD
→ PR-FILHO
→ PROMOÇÃO NORMAL
→ RECEIPT NO PR-MÃE #1562
```

## Classificação mínima

- `ALREADY_PROVEN`
- `ALREADY_CRYSTALLIZED`
- `SAME_FINDING_DUPLICATE`
- `ALREADY_ABSORBED`
- `SUPERSEDED`
- `STALE_HISTORY`
- `CONTRADICTION`
- `UNKNOWN`
- `USEFUL_DELTA`

## Regra central

```text
PROJETO_ANTIGO != NOVO SISTEMA
LINK_PUBLICO != OWNER
CAPABILITY_FOUND != CAPABILITY_ADOPTED
SEARCHED != VERIFIED
USEFUL_DELTA != PASS
```

A fonte pode ser pública ou privada. A origem não ganha autoridade por existir.

O que entra na CentralDark é apenas a menor peça que:
1. não existe ou é comprovadamente melhor;
2. cabe no owner atual;
3. passa por teste e contraprova;
4. preserva rollback;
5. não cria V1/V2/V3 paralelos.

## Exemplo atual · Lovable

No garimpo do PR #1625:
- **Central Dark Instinct** → família equivalente já absorvida na `main`; não transplantar inteiro.
- **CentralDark Ascending** → candidato sobrevivente: exportação auditável do Pacotão (`manifest + SHA-256 + provenance + ZIP + UI de hashes`).

Esse candidato permanece `CANDIDATE_DELTA` até prova comportamental no owner existente.

## Nome operacional

`GARIMPO_DE_CAPACIDADES → DELTA_ÚTIL`

Apelido do CHEFE: **comprar capacidade sem comprar o projeto**.

A CentralDark usa a fonte como mina; só a joia sobrevivente entra.
