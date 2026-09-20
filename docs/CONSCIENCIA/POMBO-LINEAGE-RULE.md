---
title: "POMBO LINEAGE RULE"
date: 2026-09-07
tags: ["consciencia"]
updated: 2026-09-07
---

# LEI DO POMBO EVOLUTIVO — identidade fixa, revisão monotônica

## Regra

`POMBO_ID=20260905` é a identidade desta linhagem.

Ela **não muda automaticamente por nova rodada, nova IA, novo ZIP ou nova sessão**.

A evolução ocorre por:

POMBO_ID fixo  
→ REVISION monotônica  
→ PARENT_PACKAGE_SHA256  
→ DELTA_MANIFEST_SHA256  
→ CURRENT_PACKAGE_SHA256  
→ NEXT_CURSOR

## Invariantes

- `POMBO_ID` não é versão.
- `REVISION` não apaga o pai.
- `CURRENT_PACKAGE_SHA256` muda quando os bytes mudam.
- `PARENT_PACKAGE_SHA256` torna a evolução auditável.
- `REVISION_N` deve apontar para `REVISION_N-1`.
- pacote byte-idêntico não recebe nova revisão.
- `NO_NEW_INFORMATION → NO_NEW_REVISION`.
- claim selado só reabre com `REOPEN_CAUSE_REF`.
- runtime temporal pode ser remedido sem apagar o histórico.
- `CHECKSUM != PROVA_SEMANTICA`.
- `POMBO != CEREBRO`.
- `POMBO != OWNER`.
- `POMBO != WRITER`.
- `POMBO != JUIZ`.
- `POMBO != AUTORIDADE`.

## Regra de promoção

Nova revisão só existe se:

`DELTA_MATERIAL != 0`
AND `PARENT_HASH_MATCH=true`
AND `DELTA_VERIFY=PASS`
AND `UNKNOWN_PRESERVED=true`
AND `NEXT_CURSOR_PRESERVED=true`

## Compatibilidade retroativa

O pacote anterior não possuía `REVISION` explícita.
Ele é reconhecido como:

`POMBO_ID=20260905; REVISION=01_LEGACY_SEED`

sem alterar um byte do ZIP original.

## Arte / metáfora

Alias visual preservado:
`POMBO_DE_OCULOS_ESCUROS + PACOTE_DE_DADOS_NO_BICO + CHECKSUM_NA_PATA`.

Isso é linguagem visual. Não concede autoridade nem substitui receipt.
