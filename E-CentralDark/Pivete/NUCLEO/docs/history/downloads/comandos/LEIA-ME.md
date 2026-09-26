# CentralDark Cleanup Auto

Um único comando executa o fluxo inteiro e só para em erro, UNKNOWN, divergência de prova ou consumidor real.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\CentralDark-Cleanup-Auto-20260824.ps1" -Mode Auto
```

Fluxo interno:

`PREVIEW → DELETE_SAFE → REMEDIÇÃO → CONSUMER_SCAN → QUARANTINE → CONSUMER_SCAN → ROLLBACK_TEST → FINALIZE → REMEDIÇÃO FINAL`

Travas:
- audit ZIP preso ao SHA esperado;
- SHA vivo fonte = SHA audit;
- cópia viva idêntica em E:\CentralDark;
- Git, OneDrive, AppData/runtime, secrets e reparse protegidos;
- consumidor/UNKNOWN bloqueia;
- rollback de amostra precisa passar antes do delete final;
- Finalize reprova cada arquivo da quarentena contra E: antes de apagar;
- remedição final exige origem antiga ausente e zero payload residual.

Audit esperado:
`SEND-CENTRALDARK-AUDIT-20260824-114754.zip`

SHA-256:
`7bbc7d0a6f96ccad6696894c5420e7a8ba511de2f34b679ca8204711c2192b2d`
