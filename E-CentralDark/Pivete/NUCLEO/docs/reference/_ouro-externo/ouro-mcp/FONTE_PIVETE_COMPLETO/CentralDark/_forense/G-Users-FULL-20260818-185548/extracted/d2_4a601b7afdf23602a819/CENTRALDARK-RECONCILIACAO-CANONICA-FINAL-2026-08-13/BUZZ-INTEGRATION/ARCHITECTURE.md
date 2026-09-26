# Arquitetura da ponte CentralDark ↔ Buzz

```
                    ┌─────────────────────────┐
                    │   CHEFE / SEGREDO       │
                    └───────────┬─────────────┘
                                │ autoridade
                    ┌───────────▼─────────────┐
                    │   SOL (coordenação)     │
                    └───────────┬─────────────┘
           ┌────────────────────┼────────────────────┐
           │                    │                    │
    ┌──────▼──────┐     ┌───────▼────────┐   ┌───────▼────────┐
    │ Hermes      │     │ Guards /       │   │ Reviewers /    │
    │ (executor)  │     │ Auditors       │   │ Workers        │
    └──────┬──────┘     └───────┬────────┘   └───────┬────────┘
           │                    │                    │
           └────────────────────┼────────────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  CENTRALDARK CANÔNICO   │
                    │  (estado, política,     │
                    │   memória, ZT, prova)   │
                    └───────────┬─────────────┘
                                │ bridge (eventos já autorizados / observações)
                    ┌───────────▼─────────────┐
                    │  BUZZ RELAY (Nostr)     │
                    │  comunicação / presença │
                    │  canais / threads       │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  PAINEL ADMIN (blueprint│
                    │  mapa vivo + rooms)     │
                    └─────────────────────────┘
```

Infra observada (READ_ONLY default): GitHub · Contabo · Cloudflare · VPS · Casa  
→ eventos → Guards → Buzz channels → SOL/Painel  

STATUS=BLUEPRINT
