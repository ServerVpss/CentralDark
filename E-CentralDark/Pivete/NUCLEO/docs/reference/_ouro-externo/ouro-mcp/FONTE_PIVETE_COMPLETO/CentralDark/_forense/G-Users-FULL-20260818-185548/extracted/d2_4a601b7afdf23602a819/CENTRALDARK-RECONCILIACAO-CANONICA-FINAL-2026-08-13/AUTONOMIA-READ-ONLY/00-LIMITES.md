# AUTONOMIA READ_ONLY — Limites

```
FORENSICS_READ_ONLY=true
ZERO_MUTATION=true
ZERO_DEPLOY=true
ZERO_COMMIT=true
ZERO_PR=true
ZERO_PUSH=true
ZERO_SECRET_USE=true
```

## Permitido nesta fase

- Ler evidências
- Comparar plano × evidência
- Consolidar pacote local
- Gerar manifesto e receipt
- Declarar UNPROVEN quando não houver prova

## Proibido

- Escrever no GitHub
- Executar scripts na VPS
- Ativar SECURITY_PLAN
- Tratar BLUEPRINT como implantado
- Incluir secrets literais
- Usar clone-deck como canônico

## Autoridade

CHEFE/SEGREDO = humana  
SOL = coordenação  
Hermes/Pivete = executor somente quando autorizado  
AGENTE_NAO_APROVA_AGENTE = SIM
