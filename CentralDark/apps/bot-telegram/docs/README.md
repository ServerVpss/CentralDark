# 📋 TelePanel — Documentação Completa

> Sistema de gerenciamento de bots Telegram com painel administrativo, pagamentos PIX, consultas de dados e controle de assinaturas.

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Banco de Dados](#banco-de-dados)
6. [Edge Functions (Backend)](#edge-functions-backend)
7. [Frontend — Páginas](#frontend--páginas)
8. [Bot Telegram — Fluxos](#bot-telegram--fluxos)
9. [Sistema de Consultas](#sistema-de-consultas)
10. [Sistema de Pagamentos PIX](#sistema-de-pagamentos-pix)
11. [Segurança](#segurança)
12. [Configuração e Deploy](#configuração-e-deploy)
13. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **TelePanel** é uma plataforma completa para operar bots do Telegram que oferecem:

- **Consultas de dados** (CPF, CNPJ, Placa, Telefone, etc.) com cache inteligente
- **Assinaturas pagas via PIX** (integração Efí/Gerencianet)
- **Fiscal de grupo** — muta membros sem assinatura ativa
- **Painel administrativo web** — dashboard, analytics, gerenciamento de planos
- **Geração de PDF/TXT** dos resultados de consulta
- **Sistema de broadcast** — envio em massa para assinantes
- **Engajamento fake** — mensagens automáticas simulando atividade

### Fluxo Principal

```
Usuário Telegram → /start → Aceita Termos → Escolhe Plano → Paga PIX
→ Assinatura Ativa → Faz Consultas → Recebe Resultados (texto/foto/PDF/TXT)
```

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                  │
│  Dashboard │ Bots │ Planos │ Consultas │ Configurações   │
└────────────────────────┬────────────────────────────────┘
                         │ Supabase Client SDK
┌────────────────────────▼────────────────────────────────┐
│                    SUPABASE CLOUD                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Auth     │  │ PostgreSQL   │  │ Edge Functions    │  │
│  │ (email)  │  │ (RLS ativo)  │  │ (Deno runtime)   │  │
│  └──────────┘  └──────────────┘  └─────────┬─────────┘  │
│                                             │            │
│  ┌──────────┐  ┌──────────────┐  ┌─────────▼─────────┐  │
│  │ Storage  │  │ Realtime     │  │ telegram-webhook  │  │
│  │          │  │ (WebSocket)  │  │ telegram-bot      │  │
│  └──────────┘  └──────────────┘  │ api-query         │  │
│                                  │ efi-generate-pix  │  │
│                                  │ generate-pdf      │  │
│                                  │ + 12 mais...      │  │
│                                  └─────────┬─────────┘  │
└────────────────────────────────────────────┬────────────┘
                                             │
              ┌──────────────────────────────▼──────────┐
              │          SERVIÇOS EXTERNOS               │
              │  • Telegram Bot API                      │
              │  • APIs de Consulta (NexFuture, TConect) │
              │  • Efí (Gerencianet) — Pagamentos PIX    │
              └──────────────────────────────────────────┘
```

---

## Stack Tecnológica

| Camada     | Tecnologia                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS      |
| UI         | shadcn/ui, Radix UI, Framer Motion, Recharts  |
| Roteamento | React Router DOM v6                           |
| State      | TanStack React Query, useState/useCallback    |
| Backend    | Supabase (Auth, DB, Storage, Edge Functions)  |
| Runtime    | Deno (Edge Functions)                         |
| Pagamento  | Efí (Gerencianet) API v2 — PIX               |
| Bot        | Telegram Bot API (webhook)                    |

---

## Estrutura de Diretórios

```
├── src/
│   ├── components/
│   │   ├── auth/          # AuthProvider, ProtectedRoute
│   │   ├── bots/          # BotConfigCard, QueryModulesManager, BroadcastDialog...
│   │   ├── consultas/     # QueryResultFormatter
│   │   ├── consultation/  # QueryInput, ResultDisplay, CacheStats...
│   │   ├── dashboard/     # StatsCard, BotsSection, ActivityFeed, SystemStatus
│   │   ├── layout/        # Sidebar, Header, DashboardLayout
│   │   ├── payments/      # EfiGatewayConfig, PixPaymentDialog, PaymentGatewaysGrid
│   │   ├── pix/           # PixCharts, PixFinancialSummary, PixTransactionsTable
│   │   ├── search/        # GlobalSearch
│   │   ├── security/      # SecurityStats, SecurityToggles, SecurityHistory
│   │   ├── theme/         # ThemeProvider, ThemeToggle
│   │   └── ui/            # shadcn/ui components (50+)
│   ├── hooks/
│   │   ├── telegram/      # useTelegramBots, useBotSecuritySettings, types
│   │   ├── useAuth.ts
│   │   ├── useAdminData.ts
│   │   ├── useBotSettings.ts
│   │   ├── usePayments.ts
│   │   ├── usePixTransactions.ts
│   │   └── ...
│   ├── pages/
│   │   ├── Index.tsx       # Dashboard principal
│   │   ├── Auth.tsx        # Login/Registro
│   │   ├── Bots.tsx        # Lista e gestão de bots
│   │   ├── BotSettings.tsx # Config detalhada do bot (4 abas)
│   │   ├── Plans.tsx       # Gerenciamento de planos
│   │   ├── Consultas.tsx   # Tester de consultas
│   │   ├── TelegramUsers.tsx
│   │   ├── QueryLogs.tsx
│   │   ├── PixTransactions.tsx
│   │   ├── Security.tsx
│   │   └── Settings.tsx
│   └── integrations/supabase/  # Client e types gerados
│
├── supabase/
│   ├── functions/
│   │   ├── telegram-webhook/   # Webhook principal do bot (4681 linhas)
│   │   ├── telegram-bot/       # CRUD de bots, sync, webhook setup
│   │   ├── api-query/          # Proxy de consultas com cache
│   │   ├── efi-generate-pix/   # Geração de cobrança PIX
│   │   ├── efi-check-status/   # Verificação de status PIX
│   │   ├── efi-webhook/        # Webhook de confirmação Efí
│   │   ├── efi-poll-pending/   # Polling de pagamentos pendentes
│   │   ├── generate-pdf/       # Geração de PDF de consultas
│   │   ├── fake-engagement/    # Mensagens automáticas de engajamento
│   │   ├── health-check/       # Verificação de saúde dos bots
│   │   ├── provider-ping/      # Ping nos provedores de API
│   │   └── ...
│   ├── migrations/             # Migrações SQL (read-only)
│   └── config.toml             # Configuração das functions
```

---

## Banco de Dados

### Tabelas Principais

| Tabela                    | Descrição                                       |
|---------------------------|-------------------------------------------------|
| `profiles`                | Perfis de usuários do painel web                |
| `telegram_bots`           | Bots cadastrados (token, webhook, status)       |
| `bot_settings`            | Configurações avançadas do bot                  |
| `bot_security_settings`   | Anti-link, anti-spam, welcome message           |
| `subscription_plans`      | Planos de assinatura (preço, dias, features)    |
| `telegram_subscriptions`  | Assinaturas ativas dos usuários Telegram        |
| `pending_payments`        | Pagamentos PIX aguardando confirmação           |
| `pix_transactions`        | Histórico de transações PIX                     |
| `query_history`           | Histórico de consultas realizadas               |
| `query_cache`             | Cache de resultados (hash → resultado)          |
| `bot_analytics`           | Métricas diárias (msgs, users, queries)         |
| `telegram_messages`       | Log de mensagens recebidas pelo bot             |
| `telegram_user_terms`     | Aceitação de termos por usuário                 |
| `paginated_results`       | Resultados paginados para botões inline         |
| `processed_updates`       | Proteção contra duplicatas de webhook           |
| `bot_conversation_states` | Estado da conversa (query, broadcast, admin)    |
| `api_usage_logs`          | Log de uso de créditos                          |
| `efi_credentials`         | Credenciais Efí (Client ID/Secret)              |

### Políticas RLS

Todas as tabelas têm **RLS ativado**. As políticas garantem que:
- Usuários autenticados só acessam dados próprios
- `service_role` tem acesso irrestrito (usado pelas Edge Functions)
- Bots só acessam dados do `user_id` que os criou

---

## Edge Functions (Backend)

### `telegram-webhook` (Principal — 4681 linhas)

O **coração do sistema**. Recebe todos os updates do Telegram via webhook.

**Responsabilidades:**
- Processar mensagens privadas e de grupo
- Gerenciar fluxo de termos → assinatura → consulta
- Executar consultas via `api-query` (com cache)
- Formatar resultados (monoespaçado, HTML)
- Gerar PDF e TXT sob demanda
- Paginação de resultados longos
- Fiscal de grupo (mute/unmute)
- Painel admin via bot (gerenciar planos, broadcast, stats)
- Auto-detecção de grupo
- Proteção contra duplicatas de webhook
- Reações e efeitos visuais nas mensagens
- Consultas múltiplas simultâneas (`/cpf X /placa Y`)

**Classe `BotHandler`:**
```
BotHandler
├── handleUpdate()          # Entry point
├── handleMessage()         # Processa mensagens
├── handleCallback()        # Processa botões inline
├── handleGroupCommand()    # Comandos em grupo (/cpf, /placa...)
├── handleQuery()           # Executa consulta e envia resultado
├── handleMultipleQueries() # Consultas paralelas
├── showMainMenu()          # Menu principal
├── showQueryMenu()         # Menu de consultas
├── showPlansMenu()         # Lista de planos
├── generatePixPayment()    # Gera cobrança PIX
├── confirmPayment()        # Confirma e ativa assinatura
├── executeBroadcast()      # Envio em massa
├── guardMessage()          # Anti-link, anti-spam
└── handleNewMember()       # Trata novos membros no grupo
```

### `telegram-bot` (CRUD)

Gerencia operações administrativas dos bots:

| Ação          | Descrição                              |
|---------------|----------------------------------------|
| `getMe`       | Verifica token e retorna info do bot   |
| `setWebhook`  | Configura webhook no Telegram          |
| `deleteWebhook` | Remove webhook                      |
| `syncBot`     | Sync completo (getMe + setWebhook)     |
| `createBot`   | Cria bot no banco + configura webhook  |
| `healthCheck` | Verifica status do bot                 |
| `sendMessage` | Envia mensagem via bot                 |
| `banChatMember` | Bane membro do grupo                 |

### `api-query` (Proxy de Consultas)

Proxy inteligente com cache para consultas de dados:

- **Cache SHA-256**: Hash do tipo + input → resultado cacheado
- **TTL configurável**: CPF 24h, Foto 7 dias, CEP 30 dias
- **Fallback**: Se DB de módulos vazio, usa config hardcoded
- **Suporte GET/POST**: `?tipo=cpf&valor=12345678900`
- **Logging**: Registra consulta no `query_history` e `api_usage_logs`

### `efi-generate-pix` / `efi-check-status` / `efi-webhook`

Integração completa com **Efí (Gerencianet)** para pagamentos PIX:

```
Usuário escolhe plano → efi-generate-pix cria cobrança
→ Retorna QR Code + copia-e-cola → Usuário paga
→ efi-webhook recebe confirmação OU efi-poll-pending verifica
→ Assinatura ativada + usuário desmutado no grupo
```

### `generate-pdf`

Gera relatórios PDF dos resultados de consulta usando a API do bot.

### `fake-engagement`

Envia mensagens automáticas simulando atividade no grupo (configurável no painel).

---

## Frontend — Páginas

### Dashboard (`/`)
- Cards de estatísticas: bots, assinantes, consultas, receita
- Lista de bots com status
- Ações rápidas
- Feed de atividades
- Status do sistema

### Bots (`/bots`)
- Lista de bots com status online/offline
- Criar novo bot (colar token)
- Editar token existente (com sync automático de webhook)
- Deletar bot
- Health check e sync manual

### Configurações do Bot (`/bots/:botId/settings`)
4 abas:
1. **Configurações**: Owners, Grupo VIP, Termos de Uso, Mute
2. **Módulos**: Ligar/desligar consultas, status das APIs
3. **Engajamento**: Typing, reações, efeitos visuais, engajamento fake
4. **Pagamentos**: Gateway PIX (Efí), configurações de pagamento

### Planos (`/plans`)
- CRUD de planos de assinatura
- Preço, dias, features, status ativo/inativo

### Consultas (`/consultas`)
- Tester de consultas (testar APIs manualmente)
- Status dos provedores

### Transações PIX (`/pix`)
- Tabela de transações com filtros
- Resumo financeiro
- Gráficos de receita

### Segurança (`/security`)
- Anti-link, anti-spam, anti-flood
- Histórico de ações de segurança
- Estatísticas de bloqueios

---

## Bot Telegram — Fluxos

### Fluxo de Primeiro Uso (Chat Privado)

```
/start
  ↓
Termos habilitados? ──Sim──→ Mostra termos → Aceita? ──Sim──→ Menu Principal
                     Não──→ Menu Principal              Não──→ "Envie /start quando pronto"
```

### Menu Principal

```
🏠 Menu Principal
├── 🔍 Fazer Consulta (se assinatura ativa)
├── 💳 Assinar / Renovar
├── 📊 Minha Assinatura
├── 💰 Pagamentos Pendentes
├── ⚙️ Painel Admin (se owner)
└── 🚪 Entrar no Grupo (se URL configurada)
```

### Fluxo de Consulta (Chat Privado)

```
Menu → Fazer Consulta → Escolhe tipo → Bot pede input
→ Usuário envia dado → Bot consulta API (com cache)
→ Formata resultado → Envia com botões [PDF] [TXT] [Apagar]
```

### Comandos em Grupo

```
/cpf 12345678900       → Consulta CPF
/placa ABC1234         → Consulta Placa
/telefone 11999998888  → Consulta Telefone
/cpf X /placa Y        → Múltiplas consultas simultâneas (max 5)
```

**Módulo desativado**: O bot **ignora silenciosamente** (não responde nada).

### Fiscal de Grupo

```
Novo membro entra ──→ Tem assinatura? ──Sim──→ Pode falar
                                        Não──→ Mute + aviso "Assine para participar"

Membro sem assinatura tenta falar ──→ Deleta mensagem + mute + aviso
```

---

## Sistema de Consultas

### Provedores de API

| Provedor       | Host                       | Porta(s)      | Consultas                              |
|----------------|----------------------------|---------------|----------------------------------------|
| NexFuture      | `nxf-2.nexfuture.com.br`   | 25589, 25594  | CPF, CNPJ, Placa, Telefone, Email, CEP, Nome, RG, CNH, PIX, Parentes, Empregos |
| TConect Score  | `node.tconect.xyz`         | 3029, 3036    | Score                                  |
| TConect Foto   | `node.tconect.xyz`         | 3030          | Foto (por estado e nacional)           |
| TConect Placa  | `node.tconect.xyz`         | 3041          | Placa Completa                         |

### Status Atual dos Módulos

> ⚠️ **Todos os módulos estão DESATIVADOS** (`enabledQueryTypes` = false).
> Os servidores dos provedores estão offline. Para reativar, altere `enabledQueryTypes` no `telegram-webhook/index.ts`.

### Sistema de Cache

```
Consulta → SHA-256 hash(tipo:input) → Busca no query_cache
  ├── Cache HIT  → Retorna resultado (não conta crédito)
  └── Cache MISS → Busca na API → Salva cache → Conta crédito
```

**TTLs:**
| Tipo | TTL |
|------|-----|
| CPF, CNPJ, Telefone, Email | 24h |
| Placa | 12h |
| Score | 6h |
| Foto | 7 dias |
| CEP | 30 dias |

---

## Sistema de Pagamentos PIX

### Fluxo Completo

```
1. Usuário escolhe plano no bot
2. telegram-webhook chama efi-generate-pix
3. efi-generate-pix cria cobrança na Efí API
4. Retorna QR Code (base64) + txid + copia-e-cola
5. Bot envia QR Code para o usuário
6. Usuário paga
7. efi-webhook recebe confirmação OU efi-poll-pending verifica
8. pending_payments → status "CONCLUIDA"
9. Cria telegram_subscriptions
10. Unmute no grupo + mensagem de boas-vindas
11. Anúncio no grupo (se habilitado)
```

### Credenciais Efí

Armazenadas na tabela `efi_credentials`:
- `client_id`
- `client_secret`
- `pix_key`
- `certificate` (base64)
- `environment` (sandbox/production)

---

## Segurança

### Autenticação
- Email/senha via Supabase Auth
- Rotas protegidas com `ProtectedRoute`
- Perfis em tabela `profiles`

### RLS (Row Level Security)
- Todas as tabelas têm RLS ativado
- Políticas por `user_id` para isolamento de dados

### Proteção Anti-Duplicatas
- Tabela `processed_updates` guarda `update_id` processados
- Evita reprocessamento de webhooks duplicados

### Bot Security Settings
- **Anti-link**: Detecta e deleta mensagens com links
- **Anti-spam**: Limita mensagens por intervalo de tempo
- **Anti-flood**: Proteção contra flood de mensagens
- **Welcome message**: Mensagem personalizada para novos membros

### Validação de Token
- Formato validado client-side: `\d{8,10}:[A-Za-z0-9_-]{35}`
- Validação server-side via `getMe` do Telegram

---

## Configuração e Deploy

### Variáveis de Ambiente (Supabase)

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (privada) |
| `SUPABASE_ANON_KEY` | Chave pública |

### Configuração do Bot

1. Crie um bot no [@BotFather](https://t.me/BotFather)
2. Copie o token
3. No painel, vá em **Bots → Adicionar Bot**
4. Cole o token → o webhook é configurado automaticamente
5. Adicione seu ID como Owner nas configurações

### Configuração do PIX (Efí)

1. Acesse [Efí (Gerencianet)](https://app.efipay.com.br)
2. Gere credenciais de API (Client ID + Secret)
3. Baixe o certificado .p12
4. Configure no painel: **Bot Settings → Pagamentos**

---

## Troubleshooting

### Bot não responde

1. Verifique o status do webhook: **Bots → Sync**
2. Verifique se o token é válido: **Bots → Health Check**
3. Verifique se os módulos estão ativos no `enabledQueryTypes`
4. Verifique os logs: Supabase Dashboard → Edge Functions → Logs

### Consultas retornando erro

1. Verifique se o provedor está online: `provider-ping`
2. Verifique o `enabledQueryTypes` — todos estão `false` atualmente
3. Verifique cache: pode ter resultado de erro cacheado

### Pagamento não confirmado

1. Verifique `pending_payments` no banco
2. Verifique se o webhook Efí está configurado
3. Execute `efi-poll-pending` manualmente
4. Verifique credenciais em `efi_credentials`

### Usuário mutado indevidamente

1. Verifique se `mute_new_members` está ativo nas settings
2. Verifique se o usuário tem assinatura ativa em `telegram_subscriptions`
3. Para desmutar: `telegram-unmute-user` ou via painel admin do bot

---

## Métricas e Analytics

O sistema rastreia automaticamente:

| Métrica | Tabela | Frequência |
|---------|--------|------------|
| Mensagens recebidas | `bot_analytics` | Incremento por mensagem |
| Mensagens enviadas | `bot_analytics` | Incremento por envio |
| Novos usuários | `bot_analytics` | Incremento por novo user |
| Consultas realizadas | `query_history` | Por consulta |
| Créditos usados | `api_usage_logs` | Por consulta não-cache |
| Links bloqueados | `bot_analytics` | Por detecção |
| Spam detectado | `bot_analytics` | Por detecção |

---

## Melhorias Futuras Recomendadas

1. **Refatorar `telegram-webhook`** — 4681 linhas em um único arquivo. Ideal: separar em módulos (handlers, formatters, queries)
2. **Tabela `query_modules`** — Migrar `enabledQueryTypes` hardcoded para o banco
3. **Rate limiting** — Adicionar proteção contra abuso no webhook
4. **Multi-idioma** — Suporte a outros idiomas além de PT-BR
5. **Dashboard de consultas em tempo real** — WebSocket para resultados
6. **Logs estruturados** — Melhorar observabilidade das Edge Functions
7. **Testes automatizados** — Cobertura de testes para hooks e functions

---

*Documentação gerada em 28/03/2026 — TelePanel v1.0*
