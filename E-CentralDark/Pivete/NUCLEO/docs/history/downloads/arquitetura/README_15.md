# CentralDark — Pacotão das Duas Artes Visuais

Este pacote entrega **as duas artes PNG** como payload principal e inclui o padrão de integridade solicitado:

- `MANIFEST.json`
- `SHA256SUMS.txt`
- `ARQUITETURA.md`
- `RECEIPT.json`

## Payload

1. `assets/01_CENTRALDARK_AMADURECIMENTO_TATICO_DA_CASA.png`
2. `assets/02_CENTRALDARK_OURO_SENDO_COLETADO.png`

## Regra de evidência

As imagens são **arte visual / representação narrativa**.

`VISUAL_CLAIM != RUNTIME_PROOF`  
`IMAGE_GENERATED != VERIFIED_STATE`  
`CHECKSUM = BYTE_IDENTITY_ONLY`

Os checksums provam a identidade dos bytes entregues neste pacote. Eles não provam estado vivo de GitHub, VPS, Hermes, CI ou runtime.

## Verificação

Compare cada arquivo com `SHA256SUMS.txt` usando SHA-256.
