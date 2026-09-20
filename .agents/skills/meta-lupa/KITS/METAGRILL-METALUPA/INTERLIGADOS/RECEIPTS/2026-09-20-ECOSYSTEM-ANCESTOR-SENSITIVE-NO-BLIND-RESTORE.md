# MICRO-HANDOFF — ecosystem antigo não pode ser restaurado cegamente

Data: 2026-09-20

Inspeção sanitizada do ancestral amplo `06d6fe52...` encontrou **143 linhas** relacionadas a tokens/secrets/keys/Supabase. Valores não foram exibidos.

```text
OLD_ECOSYSTEM_HAS_SENSITIVE_BINDINGS=true
SECRET_VALUES_EXPOSED=false
BLIND_RESTORE_ALLOWED=false
```

Decisão Meta-Grill/TLC23:

- não copiar os 95 KB antigos para a main;
- preservar runtime vivo via PM2 dump atual;
- reconstruir manifesto source usando metadados de processos e referências a ambiente, nunca valores;
- ScreenPipe deve ser absorvido no corpo, não substituir o corpo.

`NO_BLIND_OVERWRITE=true`
`NO_SECRET_REINTRODUCTION=true`

Próximo cursor: destravar runner/deploy atual; reconstrução do ecosystem fica no mesmo funil, sem impedir health/runtime que já está online.
