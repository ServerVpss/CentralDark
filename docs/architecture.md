<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# Arquitetura — MultiZap Monorepo

## Visão Geral

```
┌─────────────────────────────────────────────┐
│                 MONOREPO                     │
├─────────────┬──────────────┬────────────────┤
│   apps/bot  │   apps/crm   │   apps/web     │
│  WhatsApp   │    CRM       │   Landing      │
│  Automation │  Multicanal  │    Page        │
├─────────────┴──────────────┴────────────────┤
│              packages/ (shared)              │
├──────────────────────────────────────────────┤
│              infra/ (deploy, DB)             │
└──────────────────────────────────────────────┘
```

## Fluxo de Dados

```
WhatsApp → WuzAPI (Docker) → Gateway (:3100)
  ├── CRM (apps/crm) — tickets, atendimento
  └── Bot (apps/bot) — automação, skills
      → Supabase → Realtime → Frontend
```

## Regras

- Cada app roda isolado
- Shared code vai em packages/
- Infra centralizada
- Deploy automático via webhook
- Secrets nunca no código
