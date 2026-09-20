# Pendência: Secret Vault Centralizado MultiZap

Status: FUTURO (não implementar antes da estabilização do sistema)

## Objetivo

Consolidar todos os secrets atualmente espalhados em:

- /root/Multizap/wuzapi/.env
- /root/Multizap/gateway/.env
- /root/Multizap/secrets/wabot.env

para um único Vault centralizado.

## Arquitetura Planejada

Supabase
└── secrets_vault
    ├── TELEGRAM_BOT_TOKEN
    ├── SUPABASE_SERVICE_ROLE_KEY
    ├── DATABASE_URL
    ├── GITHUB_KEYS
    ├── WUZAPI_KEYS
    └── WEBHOOK_SECRETS

Edge Function
└── get-secret()

VPS
└── MASTER_SECRET
      ↓
   consulta Edge Function
      ↓
   recebe apenas o secret solicitado

## Requisitos de Segurança

- Secrets criptografados
- Edge Functions privadas
- JWT obrigatório
- IP Allowlist VPS
- Auditoria de acesso
- Logs sem exposição de credenciais
- Rotação automática de tokens
- Detecção de brute force
- Alertas Telegram Guarda
- Monitoramento de acessos suspeitos

## Ordem de Prioridade

Antes implementar:

1. Chat ao vivo estável
2. Contatos aparecendo
3. Fotos de perfil aparecendo
4. Grupos sincronizados
5. WhatsApp estável
6. Guarda estável

Depois implementar:

FASE SEGURANÇA ENTERPRISE
- Secret Vault
- Edge Functions
- Hardening VPS
- IDS/IPS
- Auditoria
- Rotação automática
