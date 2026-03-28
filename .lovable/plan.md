

# Documentação do Sistema de Broadcast — Bot Telegram

## Objetivo
Gerar um documento completo e reutilizável com toda a implementação do sistema de broadcast do bot Telegram, incluindo banco de dados, helpers, fluxo de estados e a função principal. O documento será salvo como arquivo Markdown em `/mnt/documents/`.

## Conteúdo da Documentação

O documento cobrirá:

### 1. Visão Geral do Fluxo
```text
Admin clica "📢 Broadcast" → Seleciona audiência (todos/ativos/expirados)
→ Bot salva estado "broadcast" com filtro → Admin envia mídia ou texto
→ Bot detecta estado broadcast → executeBroadcast() → Progresso em tempo real
→ Resumo final com estatísticas
```

### 2. Tabelas Necessárias (SQL)
- `bot_conversation_states` — armazena estado temporário da conversa (broadcast, query, admin)
- `telegram_subscriptions` — lista de assinantes com filtro por `expires_at`

### 3. Funções Helper (TypeScript/Deno)
- `telegramRequest()` — wrapper para chamadas à API do Telegram
- `sendMessage()` / `editMessage()` — atalhos para envio/edição
- `btn()` / `keyboard()` — construtores de inline keyboard
- `getConversationState()` / `setConversationState()` / `clearConversationState()` — gerenciamento de estado

### 4. Fluxo de Callback (seleção de audiência)
- `admin:broadcast` → mostra menu com 3 opções
- `broadcast:all|active|expired` → salva estado e pede mídia
- `broadcast:cancel` → limpa estado e volta

### 5. Handler de Mensagem (detecção do estado)
- Antes do menu principal, verifica se existe estado "broadcast"
- Se sim + isOwner → executa broadcast com a mensagem recebida

### 6. Função `executeBroadcast()` Completa
- Busca assinantes por filtro
- Detecta tipo de mídia (foto, vídeo, áudio, voz, GIF, documento, sticker, vídeo circular, texto)
- Envia mensagem inicial de progresso com barra visual
- Loop de envio com `copyMessage` (mídia) ou `sendMessage` (texto)
- Rate limiting (pausa a cada 25 envios)
- Atualização periódica do progresso em tempo real
- Resumo final com taxa de sucesso, tempo e contadores

### 7. Tipos de Mídia Suportados
Tabela com todos os tipos e como são enviados

## Entrega
- Arquivo: `/mnt/documents/BROADCAST_DOCUMENTATION.md`
- Formato: Markdown completo com blocos de código SQL e TypeScript prontos para copiar e colar

