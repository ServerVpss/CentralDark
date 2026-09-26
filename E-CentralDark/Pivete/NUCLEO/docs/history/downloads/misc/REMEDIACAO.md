# Remediação

## Loop

`RECUPERAR → ALINHAR → CONTRAPROVAR → REMEDIAR → REMEDIR → FIXED_POINT`

Classificação mínima:

- `ACTIVE`
- `COMPATIBILITY`
- `HISTORICAL`
- `BACKUP`
- `CANDIDATE`
- `UNKNOWN`

`UNKNOWN` nunca vira `PASS` por silêncio.

## Resíduos/duplicatas

Nunca apagar por nome.

Antes:
1. comparar conteúdo/hash;
2. verificar owner;
3. verificar referências/consumidores;
4. absorver ouro;
5. só então decidir preservação, quarentena ou remoção.
