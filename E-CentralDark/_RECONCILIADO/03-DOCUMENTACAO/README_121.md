# apps/modulos/multizap

Produto atual do projeto (hoje chamado `clone-deck` no repo).

- Destino final na VPS: `/root/CentralDark/apps/modulos/multizap/`
- Origem atual: repo `segredounlock/clone-deck` + pasta legado `/root/Multizap/apps/clone-deck`

## Fluxo do produto

```
login → portal interno → central de módulos → bot WhatsApp/Telegram → CRM Multicanal
```

## Regras

- Nome final do módulo: `multizap` (não `crm-chatbot`, não `clone-deck`).
- A pasta antiga `/root/Multizap/apps/clone-deck` é legado — não será o destino final.
- Migração é gradual: primeiro repo organizado, depois VPS, depois limpeza.
