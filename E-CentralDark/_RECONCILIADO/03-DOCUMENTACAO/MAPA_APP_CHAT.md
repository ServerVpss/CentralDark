# Mapa do /app/chat — onde cada coisa aparece

Documento gerado para o usuário entender visualmente onde cada tipo de mensagem cai, e qual menu está pendente.

## 1) Arquitetura geral

| Camada | Arquivo | Função |
|---|---|---|
| Rota | `src/routes/app.chat.tsx` | Monta `<NexInboxLayout />` |
| Layout principal | `src/components/nexchat/NexInboxLayout.tsx` (1172 linhas) | Tudo da tela (rail, filtros, lista, chat) |
| Rail vertical (esquerda) | `NexNavigationRail.tsx` | 5 botões: **Chats / Grupos / Chamadas / Status / Config** |
| Filtros topo (pílulas) | `NexConversationList.tsx` linha 154 | **Todas / Não Lidas / Grupos / Canais** |
| Filtros ícone (acima das pílulas) | `NexInboxLayout.tsx` linha 191 (`TABS`) | **Sem atendente / Todos / Em Atendimento / Meus / Aguardando / ChatBot** |
| Item da lista | `NexConversationItem.tsx` | Card de cada conversa |
| Painel direito | `NexFeaturePanel` | Aparece quando rail≠chat |

## 2) Onde cada tipo de mensagem aparece

| Tipo de mensagem | Cai em qual filtro | Fonte (chat_id) |
|---|---|---|
| **Privada Meta** (janela 24h) | `channels` (não grupo) | número sem `@g.us` |
| **Privada QR/WuzAPI** | `channels` | número sem `@g.us` |
| **Grupo** (WuzAPI) | `groups` | `…@g.us` |
| **Não lida** (qualquer canal) | `unread` | flag `unread_count>0` |
| **Tudo junto** | `all` | sem filtro |

Lógica de separação está em `NexConversationList.tsx` linhas 88-92:
- `groups` → só `channelType === "group"`
- `channels` → exclui grupo (privado/DM)
- `unread` → só `unread > 0`

## 3) Filtros ícone (topo, `TABS`)

Linha 191 do `NexInboxLayout.tsx`. São filtros de **status de atendimento**, NÃO de canal:

| Aba | Status interno | O que filtra |
|---|---|---|
| Sem atendente | `critical` | priority high/urgent OU sem assignee + status open |
| Todos | `all` | tudo |
| Em Atendimento | `in_progress` | ticket.status = in_progress |
| Meus | `mine` | assignee = usuário logado |
| Aguardando | `open` | ticket.status = open |
| ChatBot | `bot` | sem assignee + last_author = bot/ai |

## 4) Rail vertical (5 botões)

Definido em `NexNavigationRail.tsx`:

| Botão | Estado atual | Observação |
|---|---|---|
| **Chats** | ✅ funcional | tela padrão |
| **Grupos** | ⚠️ **PENDENTE** | abre `NexFeaturePanel` com status `coming_soon` (QR) ou `unsupported` (Meta) |
| **Chamadas** | ⚠️ **PENDENTE** | mesmo: painel "em breve" |
| **Status** | ⚠️ **PENDENTE** | mesmo: painel "em breve" |
| **Config** | ✅ funcional | abre settings |

> **Esse é o "menu pendente" que você viu no print.** Quando o usuário clica em Grupos/Chamadas/Status, a tela troca o painel direito por um aviso de "Em breve" baseado na matriz `feature-matrix.ts`.

## 5) Recomendação para o pendente

Cada um tem uma decisão diferente:

| Item | Recomendação | Motivo |
|---|---|---|
| **Grupos** (rail) | **Esconder o botão** ou redirecionar pro filtro "Grupos" das pílulas (que já funciona) | Hoje o usuário já vê grupos clicando em `Grupos` na pílula superior. O botão do rail só confunde. |
| **Chamadas** | **Esconder até WhatsApp Business Calling API estar habilitada** | Matriz diz `coming_soon` pra Meta e QR. Sem provider real não dá. |
| **Status** (stories) | **Esconder** | WuzAPI marca `coming_soon`, Meta marca `unsupported`. Botão "Meu status" da lista já cobre o que dá pra fazer hoje. |

**Sugestão prática (não vou aplicar sem você mandar):** ocultar os 3 botões do rail por padrão, deixando só **Chats** e **Config**. Quando cada feature for implementada de verdade, ligo o botão correspondente.

## 6) Resumo do "+ Novo" e "Pergunte à IA"

- **+ Novo** (linha 686-697 do `NexInboxLayout.tsx`) — abre `setNewTicketOpen(true)` → modal de novo atendimento. Funcional.
- **Pergunte à IA** (cartão verde dentro da lista) — componente da própria lista, integrado com Lovable AI.
- **Meu status** (círculo tracejado no topo da lista) — placeholder visual, hoje não posta status real (depende do "Status" do rail estar implementado).

## 7) Onde a mensagem é renderizada no chat aberto

`NexMessageBubble.tsx` (cada bolha) + `NexMessageList.tsx` (lista). É nesse ponto que vou pendurar o marcador `chat_rendered` da Parte 1 (rastreamento de webhook) — uma chamada idempotente quando a mensagem aparece pela primeira vez na tela.
