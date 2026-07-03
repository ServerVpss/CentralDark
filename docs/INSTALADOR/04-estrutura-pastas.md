# 04 — Estrutura de pastas na VPS

```
/root/Multizap/
├─ apps/
│  ├─ clone-deck/     # Frontend (este repo Lovable)
│  ├─ bot/            # Bot WhatsApp
│  ├─ crm/            # CRM (NÃO MOVER)
│  ├─ portal/
│  └─ web/
├─ api/
│  ├─ gateway/
│  ├─ whatsapp/qrcode/
│  ├─ webhooks/
│  └─ integrations/
├─ guarda/            # Monitoramento e auditoria
│  ├─ scripts/
│  ├─ scans/
│  ├─ status/
│  └─ incidentes/
├─ quarantine/        # Arquivos suspeitos isolados
├─ revisoes/          # Relatórios de operações (YYYYMMDD-HHMMSS/nome/)
├─ logs/              # Logs centralizados
├─ backups/           # Backups (BD, sessões WhatsApp)
├─ secrets/           # NUNCA versionado, nunca exposto em log
└─ credenciais/       # idem
```

## Regras
- O instalador **cria** todas as pastas vazias se não existirem.
- O instalador **nunca apaga** `secrets/`, `credenciais/`, `backups/`, `apps/crm/`, `wuzapi/`.
- Relatórios sempre em `revisoes/YYYYMMDD-HHMMSS/<nome-da-tarefa>/`.
