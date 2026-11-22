---
title: "EDGE_FUNCTIONS"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# ⚡ Edge Functions — Referência Técnica

## Sumário

| Function | JWT | Descrição |
|----------|-----|-----------|
| `telegram-webhook` | ❌ | Webhook principal do bot Telegram |
| `telegram-bot` | ❌ | CRUD e operações de bot |
| `api-query` | ❌ | **Backend central único** — proxy de consultas com whitelist, validação e resposta padronizada |
| `api-status` | ❌ | Status do plano da API externa |
| `efi-generate-pix` | ❌ | Gera cobrança PIX via Efí |
| `efi-check-status` | ❌ | Verifica status de pagamento |
| `efi-webhook` | ❌ | Recebe confirmação de pagamento |
| `efi-poll-pending` | ❌ | Polling de pagamentos pendentes |
| `efi-register-webhook` | ❌ | Registra webhook na Efí |
| `generate-pdf` | ❌ | Gera PDF de resultados |
| `fake-engagement` | ❌ | Mensagens automáticas de engajamento |
| `health-check` | ❌ | Verificação de saúde dos bots |
| `provider-ping` | ❌ | Ping nos provedores de API |
| `pix-payment` | ❌ | Processamento de pagamento PIX |
| `telegram-format-result` | ❌ | Formatação de resultados |
| `telegram-payment-handler` | ❌ | Handler de pagamentos Telegram |
| `telegram-unmute-user` | ❌ | Desmuta usuário no grupo |
| `telegram-update-group-photo` | ❌ | Atualiza foto do grupo |
| `data-backup` | ❌ | Backup de dados |
| `scheduled-broadcasts` | ❌ | Broadcasts agendados |

> ⚠️ `telegram-api-query` foi removida. Toda consulta passa pelo `api-query`.

---

## Arquitetura Central de Consultas

```
Telegram Bot  ──┐
                 ├──► api-query (Edge Function) ──► API externa (veiculosapi.com)
Painel Admin  ──┘
```

### Princípios
- **Módulo exato**: o sistema executa EXATAMENTE o módulo solicitado, sem tradução
- **Sem cache local**: a API externa gerencia seu próprio cache
- **Sem fallback entre módulos**: se o usuário pediu `cpf`, executa `cpf` — nunca `cpffull`
- **Whitelist rigorosa**: módulos fora da lista são bloqueados
- **Resposta padronizada**: todas as respostas seguem o mesmo formato com meta

---

## api-query

**URL**: `GET/POST /functions/v1/api-query`

**GET**: `?tipo=cpf&valor=12345678900&channel=admin_panel`

**POST**:
```json
{
  "queryType": "cpf",
  "queryInput": "12345678900",
  "estado": "SP",
  "channel": "telegram"
}
```

**Resposta padronizada**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "uuid",
    "modulo": "cpf",
    "channel": "telegram",
    "duration_ms": 2140,
    "provider_duration_ms": 2050,
    "internal_duration_ms": 90,
    "status": "success"
  },
  "errors": []
}
```

**Status possíveis**: `success`, `not_found`, `error`, `blocked`, `disabled`, `validation_error`, `internal_error`

### Whitelist de Módulos

**Pessoa**: cpf, cpffull, cpf-isk, nome, nomefull, rg, titulo, parentes, mae, maefull, cnh, pis

**Contato**: telefone, telefonefull, email, emailfull, cep, cepfull, endereco

**Financeiro**: pix, score, renda, credilink, cpf-spc, poderaquisitivo

**Veículos**: placa, placa-serpro, placa-simples, placa-sesp, chassi, renavam, motor

**Empresa**: cnpj-cred

**Justiça**: processos, bnmp-lc, siel

**TSE**: tse-3

**SUS**: cpfsus

**Variantes -3**: rg-3, pis-3, cep-3, email-3, nome-3, score-3, parentes-3, telefone-3

**Foto por estado**: fotomg, fotosp, fotorj, fotoba, fotoce, fotogo, fotopr, fotors, fotope, fotoma, fotoes, fotodf, fototo, fotoms, fotoro, fotopi

**Virtuais** (compostos): foto, nacional

---

## telegram-webhook

**URL**: `POST /functions/v1/telegram-webhook?botId={uuid}`

Usa `api-query` como backend central com `channel: "telegram"`.

Comandos mapeiam diretamente para módulos exatos da API:
- `/cpf` → módulo `cpf`
- `/cpffull` → módulo `cpffull`
- `/cnpj` → módulo `cnpj-cred`
- `/placa2` → módulo `placa-serpro`
- `/bnmp` → módulo `bnmp-lc`
- `/tse` → módulo `tse-3`
- `/spc` → módulo `cpf-spc`

---

## Segurança

- Token da API NUNCA exposto no frontend ou bot
- Armazenado como secret `CONSULTAS_API_KEY`
- Whitelist bloqueia módulos não autorizados
- Validação de entrada por tipo de módulo
- Rate limiting via Telegram (anti-spam/anti-flood)
- Logs estruturados sem dados sensíveis

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
