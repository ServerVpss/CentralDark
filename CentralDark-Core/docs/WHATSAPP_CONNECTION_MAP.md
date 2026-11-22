<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:09 BRT</samp>
</p>

# Mapeamento da Conexão WhatsApp Atual — MultiZap

> **Status:** Conexão ATIVA — NÃO MEXER sem backup validado

---

## Arquitetura Atual (2026-05-31)

```
WhatsApp (nuvem Meta)
      ↕ WebSocket (protocolo whatsmeow)
WuzAPI (Docker container, porta 127.0.0.1:8081)
      ↕ REST API local
      │
      ├── Gateway (:3100) → CRM Atendimento
      │     └── Webhook configurado → /webhooks/wuzapi
      │         ├── NormalizeService processa eventos
      │         ├── SupabaseService salva em tempo real
      │         │   ├── messages (mensagens)
      │         │   ├── contacts (auto-upsert)
      │         │   └── system_logs (eventos)
      │         └── Atendimento Webhook (forward)
      │
      └── Supabase Sync Bridge (wabot-bridge)
            └── Sincroniza status/QR das instâncias
```

### Eventos Mapeados (WuzAPI → Gateway → Supabase)

| Evento WuzAPI | Evento Normalizado | Ação no Supabase |
|---------------|-------------------|------------------|
| `Message` | `message.received` | ✅ Salva em `messages` + upsert `contacts` |
| `ChatPresence` | `presence.updated` | ✅ Logado, preparado para futuro |
| `ReadReceipt` | `message.receipt` | ✅ Logado, preparado para futuro |
| `HistorySync` | `history.sync` | ✅ Logado, preparado para lote |
| `QR` | `connection.qr` | ✅ Atualiza `instances.status` |
| `Connected` | `connection.connected` | ✅ Atualiza `instances.status` |
| `Disconnected` | `connection.disconnected` | ✅ Atualiza `instances.status` |
| `Error` | `connection.error` | ✅ Registra em `system_logs` |

---

## Endpoints de Sincronização (Gateway)

| Endpoint | Função | Método |
|----------|--------|--------|
| `/sync/contacts/:id` | Puxa contatos do WhatsApp → Supabase | GET |
| `/sync/messages/:id` | Puxa mensagens recentes → Supabase | GET |
| `/sync/full/:id` | Sincronização completa (contatos + mensagens) | POST |
| `/sync/webhook/configure/:id` | Configura webhook do WuzAPI | POST |

---

## Serviços Ativos

| Processo | Porta | Status | Função |
|----------|-------|--------|--------|
| `whatsapp-server` | 3000 | ONLINE | **Recargas Brasil — NÃO TOCAR** |
| `MultiZap-Gateway` | 3100 | ONLINE | Gateway + Supabase Sync |
| `wabot-bridge` | 9010 | ONLINE | Sincroniza WuzAPI → Supabase |
| `CloneDeck-GitHub-Webhook` | 9003 | ONLINE | Webhook listener do deploy |

---

## Instância Conectada

- **ID:** `590abb7e-...`
- **Nome:** `88072752-...`
- **Status:** `connected`
- **Último seen:** 2026-05-31 05:49
- **Contatos no Supabase:** 0 (aguardando sync)
- **Mensagens no Supabase:** 0 (aguardando webhook)

---

## Próximos Passos (pós-merge)

1. Fazer merge do **PR #98** na `main`
2. Webhook dispara na VPS → post-deploy atualiza Gateway
3. **Run-once 011** executa → configura webhook WuzAPI
4. **Run-once 012** executa → puxa contatos + mensagens
5. Verificar dados no Supabase
6. Ativar chat com dados reais no frontend

---

## Regras Absolutas

- ❌ NUNCA parar Docker WuzAPI sem backup validado
- ❌ NUNCA apagar sessão/banco do WuzAPI
- ❌ NUNCA mexer no whatsapp-server (Recargas)
- ❌ NUNCA expor tokens/secrets no código ou logs
- ✅ SEMPRE verificar webhook configurado
- ✅ SEMPRE testar em paralelo antes de substituir