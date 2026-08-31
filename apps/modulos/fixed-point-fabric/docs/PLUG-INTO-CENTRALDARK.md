# Plug no CentralDark

Estrutura no repositório:

```text
apps/modulos/fixed-point-fabric/        # este pacote inteiro
.github/workflows/centraldark-fixed-point-fabric.yml
```

O workflow fornecido fica em `github-workflow/` apenas para transporte no ZIP. Ao integrar no
CentralDark, mova-o para `.github/workflows/`.

## Registro

O contrato `contracts/FIXED-POINT-FABRIC.yml` referencia os contratos já canônicos. Registre-o no
mapa do Trigger Fabric como `EXTENSION`, não como nova autoridade. O Screenpipe permanece
`READ_ONLY_SENSOR`.

## Fluxo

1. `!CENTRALDARK` carrega o MEGAZORD.
2. `#ACORDAR` fixa `START_HEAD` e inicia a rodada.
3. Casa, VPS, GitHub e Screenpipe emitem receipts.
4. A policy compara o estado material e reinicia o contador quando houver mudança.
5. Duas amostras iguais, recentes e sem bloqueios emitem `FIXED_POINT_REACHED`.
6. O receipt local é anexado ao PR; os gates do GitHub ainda precisam estar verdes no mesmo HEAD.
7. Só então a rota de promoção pode atualizar a `main`.

