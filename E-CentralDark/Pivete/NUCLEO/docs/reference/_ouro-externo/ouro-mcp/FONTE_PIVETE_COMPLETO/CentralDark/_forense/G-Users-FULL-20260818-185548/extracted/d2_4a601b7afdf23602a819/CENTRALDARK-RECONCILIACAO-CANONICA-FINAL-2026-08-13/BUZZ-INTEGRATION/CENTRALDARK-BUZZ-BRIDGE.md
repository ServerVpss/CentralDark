# CENTRALDARK-BUZZ-BRIDGE

STATUS=BLUEPRINT  

## Direção dos dados

1. **Observação (READ_ONLY):** VPS/GitHub/Cloudflare/Contabo → Guard → evento estruturado  
2. **Publicação:** Bridge publica no canal Buzz correspondente (assinado, sem secret)  
3. **Correlação:** SOL / Auditor lê thread; não executa  
4. **Execução:** só via autoridade CentralDark (CHEFE/SOL → Hermes), nunca via mensagem Buzz  

## Contrato mínimo de evento publicado

```
WHO= ROLE= MODEL= MISSION_ID= TRACE_ID= EVENT_ID=
SOURCE= TARGET= TIMESTAMP= EVIDENCE_REF= RISK= STATUS=
```

## Fail-closed

Se identidade incompleta → não publica.  
Se RISK exige bloqueio → status BLOCKED no canal; execução continua proibida sem spec.
