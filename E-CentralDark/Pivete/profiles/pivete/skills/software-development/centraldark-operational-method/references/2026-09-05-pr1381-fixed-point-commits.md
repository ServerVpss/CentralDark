# PR #1381 Fixed Point — Commits e Estado (2026-09-05)

## Commits no Branch do PR #1381

| Commit SHA | Mensagem | Arquivos Principais |
|------------|----------|---------------------|
| `1ee31ea24eeb76b842f5b963ab1bb9e4fe5d122f` | implementa MASTER_INGRESS_ALIASES + master_funnel + !CENTRALUTIL + anti-recursão/reentry guard + negação fail-closed | trigger-fabric, master_funnel |
| `5ce6e667ec02818f18ed7dca84fc18b53ed59477` | adiciona contraprovas/testes do funil | testes do funil |

## Estado Atual do PR

- **HEAD**: `5ce6e667ec02818f18ed7dca84fc18b53ed59477`
- **BASE**: `0542cee586e55be5334ba1e8d369d3b040ee1178` (main)
- **STATE**: OPEN
- **MERGEABLE**: false
- **CI Remoto**: `statuses=[]` (ainda não rodou/provado)

## Arquitetura do Funil (Master Ingress)

```
#ACORDAR
!CALIBRAR
!MULTIBUSSOLA
!META_LUPA
!RECONCILIAR
!CENTRALUTIL / !DELTAUTIL
!CONTRAPROVA
!REMEDICAO
!FIXED_POINT
!REGISTRA
!BOOT
!FABLE_LOOP
     ↓
  !CENTRALDARK
     ↓
mesmo MASTER CYCLE
```

## Proteções Implementadas

1. **Anti-recursão/reentry guard**: Gatilho interno durante sessão ativa não reentra no master (evita loop `!CENTRALDARK → #ACORDAR → !CENTRALDARK`)
2. **Negação fail-closed**: Se não autorizado, bloqueia
3. **Contraprovas/testes**: Validam o funil
4. **Porteira única**: Todos os gatilhos humanos explícitos operacionais entram pelo mesmo funil

## Distinção: Gatilhos Humanos vs Eventos Automáticos

- **Gatilhos humanos explícitos** (entram no funil): `#ACORDAR`, `!CALIBRAR`, `!MULTIBUSSOLA`, `!META_LUPA`, `!RECONCILIAR`, `!CENTRALUTIL`, `!DELTAUTIL`, `!CONTRAPROVA`, `!REMEDICAO`, `!FIXED_POINT`, `!REGISTRA`, `!BOOT`, `!FABLE_LOOP`, `!CENTRALDARK`
- **Eventos automáticos** (internos ao Trigger Fabric, NÃO viram comandos humanos): `STATE_CHANGED`, `TEST_FAILURE`, `MODEL_UNAVAILABLE`, etc.

## Testes Locais

- Testes anteriores: **10/10 PASS**
- Novos falsificadores do funil: incluídos
- CI remoto ainda não retornou status

## Próximos Passos Para Merge

1. Aguardar CI remoto verde
2. Verificar se mergeable vira true
3. Se autorizado pelo SEGREDO/CHEFE → squash merge na main