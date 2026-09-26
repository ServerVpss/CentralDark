# 10×10 + órfãs — BRAIN (2026-09-03)

## Regra

- `01-NOME` … `10-NOME` por nível. Teto 10, não cota.
- Recursivo só se subcategoria real **não encaixa** na gaveta existente.
- Raiz deste vault: **00–08** (00 = mapa/boot). Não renumerar pra 01–10.
- Duplicata: `00 - Mapa do Sistema/` vs `00-MAPA-SISTEMA/` — GRAFO-VIVO hashes **diferentes** (texto 6041 vs binário 5006). Não fundir.

## Demo (não aplicado no disco)

```
BRAIN/
01-MAPA-SISTEMA … 09-ARTEFATOS-VISUAIS / 10-LIVRE
02-CONCEITOS/01-ARTEFATOS … 07-OURO / 08-10 LIVRE
04-DOCUMENTACAO/01-AGENTS-LIBRARY / 02-BIBLIOTECA
02-BIBLIOTECA/ 01-README.md … 04-IPNAMES…  (camada extra só se item não couber)
```

## Scan órfãs (medir)

84 md no BRAIN (2026-09-03):

- EMPTY 0 B: `Sem título.md`, `Sem título 1.md`, `2026-08-29.md`, `2026-09-03.md`, `07-APRENDIZADOS-MEMORIAS/2026-08-19.md`
- ORPHAN 0 in/0 out (antes da amarração): `ARVORE-SEMANTICA-DA-CASA.md`, `IPNAMES-EXTERNAL-NETWORK-REFERENCE.md`, `2026-08-26-sessao-hermes-rei-deploy-ouro.md`
- Mapa mermaid HISTÓRICO ≠ disco. Tratar como STALE.

Hubs pra amarrar: `00-MAPA-SISTEMA/BRAIN.md`, `MAPA-OBSIDIAN-BRAIN.md`, `BIBLIOTECA/README.md`.

## GARIMPO HTML

Chrome 40 B `ChatGPT_ Chat, Work, Create & Code with AI.html` = stub. Ouro: `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\` mesmo nome, 1074421 B, sha256 `5c5b28c775a91c68132b6d8c07d949927e09f00637dd3223ce7531bec5ae7fb5`.
