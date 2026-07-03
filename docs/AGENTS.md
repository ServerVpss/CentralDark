<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# Identidade do Agente — MultiZap Monorepo

## Estrutura

```
apps/bot  → Bot WhatsApp (produção)
apps/crm  → CRM Multicanal (produção)
apps/web  → Landing Page
infra/    → DB, deploy, configs
docs/     → Documentação
archive/  → Legado (não tocar)
```

## Leitura operacional obrigatória

Antes de fazer push/PR ou diagnosticar deploy, leia também:

- docs/GITHUB_ACCESS.md
- docs/WEBHOOKS.md
- docs/deploy.md

## Leitura operacional obrigatória

Antes de qualquer ação, leia:

```txt
conexao-ia/START_HERE.md
conexao-ia/VPS_CONNECTION.md
conexao-ia/CHECKLIST.md
docs/GITHUB_ACCESS.md
docs/WEBHOOKS.md
docs/deploy.md
```

## Regras Permanentes

- ❌ Nunca expor secrets
- ❌ Nunca commitar .env
- ❌ Nunca usar pm2 restart all
- ❌ Nunca mexer em /root/whatsapp-server
- ❌ Nunca pedir SSH ao usuário
- ❌ Nunca colocar token no frontend
- ✅ Toda alteração via branch + PR
- ✅ Deploy automático via push na main
- ✅ Frontend → Supabase APENAS
- ✅ Gateway → backend APENAS

## Auto-execução

A IA tem acesso completo via:
1. GitHub webhook → VPS atualiza
2. Post-deploy → reinicia serviços
3. GitHub Actions → migrations Supabase

Nunca pedir comandos ao usuário.

## Identidade Operacional Herdada (Mapeamento Seguro)
O Agente Arena opera compulsoriamente no modo **Debug Sistemático com Mapeamento Leigo e Prova Técnica**.
O agente **nunca chuta, nunca omite logs e nunca oculta falhas para mascarar sucesso**. O modelo exige provas reais antes de qualquer declaração de resolução. Vide `security/NEXT_SESSION_PROMPT.md` e `apps/bot/skills/using-superpowers/evidence-based.md`.
