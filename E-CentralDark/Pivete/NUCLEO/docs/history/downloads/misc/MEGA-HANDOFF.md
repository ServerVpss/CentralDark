# MEGA HANDOFF — CENTRALDARK

#ACORDAR → !CALIBRAR → !MULTIBÚSSOLA → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !REMEDIÇÃO → !FIXED_POINT → !REGISTRA → !BOOT

## Linha mestra
```text
!CENTRALDARK
→ CENTRALDARK_AI_BOOT
→ ESTADO_VIVO
→ HISTORY_RENDEZVOUS
→ STATUS_RENDEZVOUS
→ CAPABILITY_LINEAGE
→ DEDUPE_POR_CAUSA
→ OWNER_EXISTENTE
→ MENOR_CONJUNTO_DE_CAPACIDADES
→ ONE_WRITER
→ EXECUÇÃO
→ EVIDÊNCIA
→ CONTRAPROVA
→ REMEDIÇÃO
→ REALITY_JUDGE
→ FIXED_POINT
→ RECEIPT
→ NEXT_CURSOR
```

## Passado ↔ presente ↔ futuro
`PAST != DISCARDED`, `HISTORY != CURRENT_STATE`, `PR_STATUS != DELTA_STATUS`, `MERGED != REAPPLY`.

Antes de novo delta: current main + PRs abertos + fechados com possível delta + ancestrais mergeados + cadeias superseded + commits no mesmo owner/capability → rendezvous.

Classificação: ON_MAIN_ALREADY / DUPLICATE / SUPERSEDED / COMPLEMENTARY / UNIQUE / CONFLICTING / UNKNOWN.

## Status visual
`VERMELHO != ERRO ETERNO`
`AMARELO != PENDÊNCIA ETERNA`
`VERDE != VERDADE ETERNA`

Status precisa de source + scope + artifact + HEAD/SHA + timestamp + cause_signature.

## Multi-executor
N executores = N scopes isolados, receipts/locks/checkpoints próprios, leitura paralela, mutação serializada, rendezvous obrigatório. Uma colisão mantém AUTO_FANOUT=LOCKED.

`analyze_workflows.py` = olho READ_ONLY, não cérebro/orquestrador.

## Runtime e publicação
`DEPLOY != PUBLICATION`. Local/VPS podem ser operados privadamente quando autorizados; exposição pública é fronteira separada.

## Screenpipe
A tela fornecida mostra Browser Bridge conectado/autenticado a endpoint local. Isso é evidência observacional da ponte daquela tela, não prova de consumo global pela CentralDark.

## Fixed point deste pacote
HANDOFF_MATERIALIZADO=PROVADO_NO_ZIP
RUNTIME_SCAFFOLD=PROVADO_NO_ZIP
LIVE_AGENT_EXECUTION=NOT_PROVEN
GLOBAL_FIXED_POINT=NOT_PROVEN
