# Arquitetura

```mermaid
flowchart TD
  A["!CENTRALDARK + #ACORDAR"] --> B["Coletor Casa"]
  A --> C["Heartbeat VPS"]
  A --> D["GitHub main/issues/PRs"]
  A --> E["Screenpipe read-only"]
  B --> F["Ledger SQLite + hash chain"]
  C --> F
  D --> F
  E --> F
  F --> G["Policy + contraprova"]
  G -->|"2 amostras estáveis"| H["Fixed Point Receipt"]
  G -->|"FAIL/BLOCKED/STALE"| I["Reconciliar e medir de novo"]
```

O Fabric não cria outro cérebro. Ele estende os contratos do Trigger Fabric já presentes no
CentralDark e fornece a peça executável que faltava: um denominador temporal único.

## Invariantes

1. Um escritor por escopo, com lease.
2. Nenhum `UNKNOWN`, `BLOCKED` ou `STALE` vira verde.
3. Screenpipe é sensor, nunca autoridade de merge.
4. Segredos entram por ambiente e são redigidos antes do ledger.
5. Main só muda por PR provado no mesmo HEAD.
6. Duas amostras iguais são o mínimo; aumente para três em ambientes instáveis.

