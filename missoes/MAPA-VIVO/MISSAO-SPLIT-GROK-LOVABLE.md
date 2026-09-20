# Split Grok × Lovable — Admin + Visão infra

```text
┌─────────────────────────────────────────────────────────────┐
│                     PIVETE (aprova ouro/key)                │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
     ┌──────────▼──────────┐       ┌──────────▼──────────┐
     │  GROK (VPS)         │       │  LOVABLE + SONNET   │
     │  Trilhas A B C      │       │  Trilha D (Admin UI)│
     │  status, tele       │       │  mcp-admin-ui       │
     │  movimento, mapa    │       │  pivete/dev         │
     └──────────┬──────────┘       └──────────┬──────────┘
                │                             │
                └──────────► ENCAIXE ◄────────┘
                         API real + Caddy
```

## Entregáveis Grok (antes / paralelo)

1. MAPA-VIVO (este diretório) — **feito 2026-07-14**  
2. Monitor simples estado VPS (sem loop tele)  
3. Doc inventário notifiers (GitHub)  
4. fail2ban — **feito**  

## Entregáveis Lovable

1. Admin UI usável e limpo  
2. Abas existentes melhores  
3. Placeholders tipados se API de “estado VPS” ainda não existir  
4. Commit + nota no Status do fio  

## Anti-padrões

- Dois painéis “oficiais” sem papel claro  
- Admin que lista secrets  
- Telegram loop  
- Rebuild Hermes/Guardião “V2” em vez de hub depois  
