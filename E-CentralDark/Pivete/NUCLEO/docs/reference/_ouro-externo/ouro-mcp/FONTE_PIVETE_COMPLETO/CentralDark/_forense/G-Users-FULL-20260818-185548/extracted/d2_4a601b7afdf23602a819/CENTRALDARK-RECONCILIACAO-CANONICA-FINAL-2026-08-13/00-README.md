# CENTRALDARK — Reconciliação Canônica Final
**Data:** 2026-08-13  
**CANONICAL_REPO:** ServerVpss/CentralDark  
**CLONE_DECK_IN_SCOPE:** NO  
**MODE:** FORENSICS_READ_ONLY → RECONCILIATION  

## Declarações

```
CANONICAL_REPO=ServerVpss/CentralDark
CLONE_DECK_IN_SCOPE=NO
SOURCE_ZIP_PRESERVED=SIM
RECONCILIATION_COMPLETE=SIM
```

## Fio preservado

```
FORENSICS → INVENTÁRIO → AUTONOMIA READ_ONLY → CRUZAMENTO
→ PLANO BRUTO → DELTA REAL → SEGURANÇA → PAINEL ÚNICO
```

## Conteúdo

| Pasta | Função | Status típico |
|-------|--------|----------------|
| FORENSICS/ | Leitura e reconciliação | PRESERVED + REFINED |
| INVENTARIO/ | O que existe / não existe | GENERATED |
| AUTONOMIA-READ-ONLY/ | Limites de leitura | GENERATED |
| CRUZAMENTO/ | Plano × evidência | GENERATED |
| PLANO-BRUTO/ | Plano recuperado | CONSOLIDATED |
| DELTA-REAL/ | Lacunas mínimas | GENERATED |
| SEGURANCA/ | Planejamento (não implantado) | BLUEPRINT |
| PAINEL-UNICO/ | Planejamento (não implantado) | BLUEPRINT |
| EVIDENCIAS/ | Provas e receipts | PRESERVED |
| MAPAS/ | Mapas de relação | GENERATED |
| FONTES/ | Links e origens | PRESERVED |
| zero-trust/ | Protocolo consolidado | PRESERVED |
| memoria/ | Memória longo prazo | PRESERVED |
| tools/ | memory-tools.js (único) | REFINED |
| browser-use/ | Integração documentada | PRESERVED |
| BUZZ-INTEGRATION/ | Ponte Buzz (comunicação) | BLUEPRINT |

## Regras

- Sem especificação → sem intenção → sem autorização → sem ação
- Nenhuma implementação futura apresentada como ativa
- clone-deck fora de escopo
- mae/deny-delete permanece referência de writer canônico (evidência GitHub)
- ServerVpss/CentralDark = filesystem VPS + paths locais (fonte canônica declarada)

## Arquivos de controle

- `00-README.md` (este)
- `00-MANIFEST.json`
- `00-RECEIPT-FINAL.json`


## Buzz (incorporado neste organismo)

- Fonte lida: https://github.com/block/buzz
- Papel: communication plane apenas
- Não é fonte da verdade
- Documentação em `BUZZ-INTEGRATION/`
- Mapas mermaid atualizados em `MAPAS/`
- SEGURANCA e PAINEL-UNICO permanecem BLUEPRINT
