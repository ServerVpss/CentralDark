# Profile ↔ SOUL Canônica

```text
PROFILE_SOUL=@CENTRALDARK_SOUL(docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md) | REMEASURE_LIVE_FIRST | LOCAL_CLONE_ALLOWED | GITHUB_MAIN_FALLBACK | SHA_REQUIRED | ZERO_TRUST | META_LUPA | UNKNOWN!=PASS | NO_COPY | NO_SECOND_SOL | MAIN_ONLY_AFTER_GREEN
```

O profile não replica SOUL, governança, memória, Writer, MetaLupa, Fixed Point ou aprendizados. Ele apenas aponta para a SOUL canônica e pode acrescentar preferências locais de UI/voz/modelo.

O `casa_boot.py` existente é verificador/adaptador dessa referência; não é segunda SOUL nem segunda governança.

Fluxo único:

```text
#ACORDAR → !CENTRALDARK → REMEASURE → SOUL CANÔNICA → ZERO TRUST → META LUPA → TESTE → CI DO MESMO HEAD → MAIN SÓ VERDE → CADEADO
```

Se local e remoto divergirem: `DRIFT/CANDIDATE`, nunca PASS automático. Só o que sobreviver aos gates existentes pode ser promovido. Na próxima execução, o profile resolve novamente a SOUL canônica atual.
