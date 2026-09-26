# WhatsApp Provider Capabilities (MultiZap)

Mapeia o que cada provider/canal **realmente** suporta vs o que o template visual NexChat sugere.
A UI permanece fiel ao template — esta matriz governa o que pode rodar de verdade.

Fonte de verdade: `src/components/nexchat/feature-matrix.ts`

## Matriz

| Recurso | Meta Cloud API | MultiZap QR / WuzAPI | Webchat |
|---|---|---|---|
| Mensagens de texto | Suportado | Suportado | Suportado |
| Mídia (imagem, áudio, doc) | Suportado | Suportado | Suportado |
| Templates aprovados | Suportado | Apenas Meta | Não suportado |
| Botões interativos | Suportado | Apenas Meta | Limitado |
| Status de mensagem | Suportado | Limitado | Limitado |
| Stories / Status do WhatsApp | Não suportado | Em breve | Não suportado |
| Grupos | Não suportado | Em breve | Não suportado |
| Canais do WhatsApp | Não suportado | Em breve | Não suportado |
| Chamadas de voz/vídeo | Em breve (Business Calling API) | Em breve | Não suportado |
| Presença / digitando | Limitado | Limitado | Limitado |

## Onde a matriz é aplicada na UI

| Local | Comportamento |
|---|---|
| `/app/chat` — header do chat (botões `Phone` e `Video`) | Se `calls` ≠ `supported`/`limited`, botão fica `data-disabled` e tooltip mostra o motivo via `STATUS_LABEL[status]`. |
| `/app/inbox` — rail (Grupos, Chamadas, Status) | Quando o usuário clica e o canal não suporta, renderiza `NexFeaturePanel` com estado bonito ("Indisponível neste canal"). |
| `/app/chat` — rail (mesma lógica do inbox) | Mesmo `NexFeaturePanel`. |
| Cabeçalho de conversa | `NexChannelBadge` mostra o provider; `NexConnectionStatusBadge` o status atual da conexão. |

## Regra de ouro

**Visual fiel ao NexChat.** Funcionalidade real só quando o provider suportar.
Se não suportar → estado bonito com motivo, nunca botão quebrado.
