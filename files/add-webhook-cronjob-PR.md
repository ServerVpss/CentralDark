Proposta de PR: adicionar cronjob de saúde para webhooks (CentralDark)

Objetivo
- Adicionar um cronjob que periodicamente envia um POST de teste a URLs de webhook configuradas e registra status.
- Permitir detecção precoce de falhas e gerar logs para análise.

O que o PR inclui (template)
- scripts/github-webhook-cron.sh  (script executável)
- docs/WEBHOOKS.md (instruções de uso e como adicionar URLs)
- .github/workflows/webhook-healthcheck.yml (opcional: job que valida configuração em CI)

Instruções rápidas para aplicar (mantendo segurança)
1. Adicionar URLs reais em /root/centraldark/webhooks.list no VPS ou em config equivalente.
2. Instalar o script em /root/scripts/github-webhook-cron.sh e dar chmod +x.
3. Adicionar crontab: */15 * * * * /root/scripts/github-webhook-cron.sh >> /root/logs/webhook-cron.log 2>&1
4. Monitorar /root/logs/webhook-health-YYYYMMDD.log e /root/logs/webhook-cron.log

Segurança
- O script envia payloads de teste simples (JSON não contém segredos).
- Não gravar chaves em repositório; usar webhooks.list no VPS com permissões restritas.

Notas para o reviewer
- Confirme política de frequência antes de aprovar (aqui uso 15min por padrão).
- Opcional: integrar com guardião/alertas para 5xx persistentes.

Patch pronto em files/ para revisão e PR.
