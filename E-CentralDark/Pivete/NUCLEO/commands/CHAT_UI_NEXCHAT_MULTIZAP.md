# COMANDO - CHAT_UI_NEXCHAT_MULTIZAP.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\docs\CHAT_UI_NEXCHAT_MULTIZAP.md
**SHA:** 82a5b90b5dc6691e
**Timestamp:** 2026-08-26T19:31:29.642486
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Regra: **somente leitura**. Não editar, não apagar, não importar componentes direto em produção.

### Ouro Bruto (primeiros 5000 chars)
```
# Chat UI — Integração NexChat → MultiZap

## Fonte oficial de referência
- Pasta: `design-references/nexchat-original/` (ZIP original + extração `code/`)
- Regra: **somente leitura**. Não editar, não apagar, não importar componentes direto em produção.
- Licença: ThemeForest Regular License adquirida pelo cliente — uso permitido como camada visual do produto final MultiZap.

## Stack do template
- React 19 + Vite 6 + TypeScript 5.8
- Tailwind 3.4 (`darkMode: "class"`) com `@tailwindcss/forms` e `@tailwindcss/container-queries`
- SCSS modular (`src/assets/scss/{abstracts,base,components,layout,pages}`)
- Zustand 5 (`store/themeStore.ts`)
- React Router DOM 7
- `@google/genai` (IA — **não será portado**, MultiZap usa Lovable AI Gateway / fluxo próprio)
- Fonte: Plus Jakarta Sans

## Conflitos vs stack atual MultiZap
| Item | NexChat | MultiZap | Decisão |
|---|---|---|---|
| Router | react-router-dom 7 | TanStack Router | manter TanStack — adaptar `<Link>`, `useNavigate` |
| Tailwind | v3.4 + plugins | v4 via `@import "tailwindcss"` no `styles.css` | manter v4 — re-expressar tokens NexChat como `--*` no styles.css; plugins `forms`/`container-queries` portados manualmente apenas se necessários |
| Estilos | SCSS | CSS puro + tokens oklch | **instalar `sass`** e isolar SCSS Nex em `src/components/nexchat/styles/` (scopes próprios, sem global leak) |
| Dark mode | classe `dark` | classe `dark` (já compatível) | OK |
| Cores | `rgb(var(--color-*) / <alpha>)` | `oklch(...)` semântico | mapear tokens NexChat → vars adicionais coexistindo com os atuais |
| State | Zustand 5 | já presente no projeto | OK |
| IA `@google/genai` | usada em chat AI | Lovable AI Gateway | **não instalar** |

## Mapa de componentes originais (20 arquivos, ~3.230 linhas TSX)
| Arquivo | Linhas | Adaptar para MultiZap? | Componente Nex equivalente |
|---|---:|---|---|
| `Messenger.tsx` | 356 | sim | `NexChatShell` |
| `NavigationRail.tsx` | 48 | sim | `NexNavigationRail` |
| `ChatList.tsx` | 147 | sim | `NexConversationList` + `NexConversationItem` |
| `ChatWindow.tsx` | 736 | sim (núcleo) | `NexChatHeader` + `NexMessageList` + `NexMessageBubble` + `NexChatComposer` + `NexMessageActionsMenu` + `NexMediaPreview` |
| `ChatSettings.tsx` | 159 | sim | `NexContactPanel` |
| `EmptyState.tsx` | 61 | sim | `NexEmptyState` |
| `MessageReadHUD.tsx` | 68 | sim | `NexTypingIndicator` / read receipts |
| `StatusPage.tsx` | 195 | parcial (somente visual de canais/badges) | `NexChannelBadge`, `NexStatusViewer` |
| `SettingsSidebar.tsx` | 69 | opcional | — (MultiZap já tem `/app/configuracoes`) |
| `ProfileSettings.tsx` | 272 | não (MultiZap tem o seu) | — |
| `NotificationSettings.tsx` | 103 | não | — |
| `PrivacySettings.tsx` | 97 | não | — |
| `StorageSettings.tsx` | 83 | não | — |
| `HelpSettings.tsx` | 80 | não | — |
| `CallScreen.tsx` / `CallHistory.tsx` | 181 | **não** (MultiZap não faz chamadas WA voz/vídeo) | — |
| `Login.tsx` / `LogoutPage.tsx` / `LandingPage.tsx` / `Documentation.tsx` | 524 | **não** (MultiZap já tem `/auth` e landing master-editável) | — |

**Novos componentes específicos MultiZap (sem equivalente no NexChat — visual no estilo Nex):**
`NexConnectionStatusBadge`, `NexPaymentCard`, `NexPixQrModal`, `NexChatSkeleton`.

## Mapa de estilos (~3.500 linhas SCSS)
| Origem | Será portado? | Destino |
|---|---|---|
| `abstracts/_variables.scss` | sim (como CSS vars) | `src/components/nexchat/styles/_tokens.css` |
| `abstracts/_mixins.scss` | parcial (vira utilities Tailwind v4 / @layer) | — |
| `base/_reset.scss` + `_typography.scss` | **não** (já temos reset Tailwind v4) | — |
| `components/_messages.scss` (219) | sim | `_messages.scss` |
| `components/_inputs.scss` + `_buttons.scss` + `_modals.scss` + `_status.scss` + `_ai.scss` | sim | `_components.scss` |
| `components/_calls.scss` (626) | **não** | — |
| `layout/_chat.scss` (573) | sim | `_chat.scss` |
| `layout/_messenger.scss` + `_navigation.scss` + `_sidebar.scss` | sim | `_layout.scss` |
| `pages/_auth.scss` + `_documentation.scss` + `_landing.scss` | **não** | — |

Volume final estimado a portar: ~1.800 linhas SCSS, dentro de escopos `.nexchat-*` para não vazar no resto do app.

## Plano de integração por rota
1. **`/app/inbox`** — substitui `InboxLayout` (lista + chat + painel) por composição `<NexChatShell>`. Mantém todos os mutations/queries atuais, comandos do robô, card PIX, audit, scope=workspace.
2. **`/app/chat`** — verificar se compartilha `InboxLayout` (provavelmente sim) — beneficia automaticamente.
3. **`/admin/inbox`** — mesma composição com `scope="admin"`, `readOnly`, `workspaceOverride`. Barra master amarela permanece no topo (acima do shell Nex).
4. Mobile: drawer para painel de contato, lista→chat full-screen, composer fixo, modal interno para QR PIX.

## Diferenças inevitáveis vs NexChat puro
- Sem chamadas de voz/vídeo (MultiZap não suporta).
- Sem `StatusPage` estilo "stories" (não faz sentido para inbox de atendimento) — só badges visuais inspirados.
- Se
```