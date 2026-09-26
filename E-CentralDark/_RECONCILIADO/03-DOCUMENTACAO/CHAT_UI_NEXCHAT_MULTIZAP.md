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
- Sem painel de Settings lateral Nex (MultiZap tem `/app/configuracoes`).
- Card PIX e modal QR são **adições MultiZap** com mesma linguagem visual (glassmorphism, raios, sombras Nex).
- Badges de canal (Meta / MultiZap QR / WuzAPI) são **adições MultiZap**.

## Segurança (não regressar)
- Nenhum dado mockado do template em produção.
- Nenhum import de `@google/genai`.
- Nenhuma chamada client-side adicional a Supabase com service_role.
- Todos os mutations continuam via `createServerFn` existentes.
- `admin:inbox_intervention*` continua disparando nos mesmos pontos.

## Riscos
- SCSS global vazando para resto do app → mitigado com escopo `.nexchat-*` em todo seletor raiz.
- Tailwind v3 (NexChat) vs v4 (MultiZap): classes utilitárias específicas (`bg-surface-dark`, etc.) precisam virar tokens v4 no `styles.css` ou ser substituídas por classes equivalentes.
- `ChatWindow.tsx` é monolítico (736 linhas) — quebrar em 6 componentes Nex* para integrar com nosso fluxo.

## Próximas fases
- Fase 2: criar 20 componentes em `src/components/nexchat/` (visual fiel, props reais MultiZap)
- Fase 3: portar SCSS isolado + tokens
- Fase 4: aplicar em `/app/inbox`
- Fase 5: aplicar em `/app/chat`
- Fase 6: aplicar em `/admin/inbox` preservando modos read-only/intervenção + audit

---

## Fase 2 + 3 — Concluído

### Biblioteca isolada
- `src/components/nexchat/` — componentes Nex (15 arquivos)
- `src/components/nexchat/styles/nexchat.css` — tokens + estilos escopados em `.nexchat-root` (~600 linhas)
- Nada vaza pro resto do app; nada importa de `design-references/`.

### Controlador de tema
- Migration: `master_settings.nexchat_theme_enabled` + `ui_theme_mode` (`current` | `nexchat`).
- Server fns: `getActiveTheme` (pública), `setActiveTheme` (super_admin + audit_log).
- Provider/hook: `MultiZapThemeProvider`, `useActiveTheme`, `useNexChatRootClass`.

### Rotas master
- `/admin/aparencia` — toggle ON/OFF do tema.
- `/admin/aparencia/nexchat-preview` — preview interativo com dados FICTÍCIOS (não toca em workspace real).

### Dependências
- `sass` (instalado, ainda não usado em build — preview usa CSS puro).
- Nenhuma alteração em React, Router, Tailwind ou Zustand.

### Próximo passo
- Fase 4: ler `useActiveTheme()` em `/app/inbox` e renderizar Nex* quando `mode === "nexchat"`, mantendo `InboxLayout` atual como fallback.

---

## Mapa de Cobertura NexChat (Auditoria Fase 2+3)

### Componentes

| Original (NexChat) | Adaptado (MultiZap) | Status | Fidelidade | Observação |
|---|---|---|---|---|
| Messenger.tsx | NexChatShell.tsx | portado | alto | Layout flex shell |
| NavigationRail.tsx | NexNavigationRail.tsx | portado | alto | Rail 72px + avatar |
| ChatList.tsx | NexConversationList + NexConversationItem | portado | alto | Inclui unread, canal, status |
| ChatWindow.tsx | NexChatHeader + NexMessageList + NexChatComposer | portado | alto | Dividido em 3 unidades |
| MessageReadHUD.tsx | NexMessageBubble (status ticks) | portado | médio | Sent/Delivered/Read/Failed embutidos no bubble |
| EmptyState.tsx | NexEmptyState.tsx | portado | alto | — |
| ChatSettings.tsx | NexContactPanel.tsx | portado | alto | Painel lateral fiel ao template |
| ProfileSettings.tsx | — | não aplicável | — | Substituído pelo perfil MultiZap existente |
| SettingsSidebar.tsx | — | não aplicável | — | Settings global do MultiZap permanece |
| NotificationSettings.tsx | — | não aplicável | — | Reusar settings MultiZap |
| PrivacySettings.tsx | — | não aplicável | — | Idem |
| StorageSettings.tsx | — | não aplicável | — | Idem |
| HelpSettings.tsx | — | não aplicável | — | Idem |
| StatusPage.tsx | — | pendente (fora de escopo) | — | Recurso de "Status/Stories" não faz parte do MultiZap |
| CallScreen.tsx | — | pendente (fora de escopo) | — | Sem chamadas no MultiZap por ora |
| CallHistory.tsx | — | pendente (fora de escopo) | — | Idem |
| Login.tsx | — | não aplicável | — | Auth do MultiZap permanece |
| LandingPage.tsx | — | não aplicável | — | Landing é gerenciada pelo master |
| Documentation.tsx | — | não aplicável | — | Docs separadas |
| — (extra MultiZap) | NexPaymentCard.tsx | criado | — | Sem equivalente no template (PIX) |
| — (extra MultiZap) | NexPixQrModal.tsx | criado | — | Modal QR PIX |
| — (extra MultiZap) | NexImageModal.tsx | criado | — | Visualizador de imagem |
| — (extra MultiZap) | NexConversationSkeleton.tsx | criado | — | Loading list |
| — (extra MultiZap) | NexChannelBadge / NexConnectionStatusBadge | criado | — | Meta/QR/WuzAPI + status conexão |

### Estilos

| SCSS original | Destino | Status |
|---|---|---|
| _variables.scss, _mixins.scss | tokens `--nx-*` em nexchat.css | portado |
| _reset.scss, _typography.scss | escopado em `.nexchat-root` | portado (parcial — só o necessário) |
| _messenger.scss | `.nx-shell` | portado |
| _navigation.scss | `.nx-rail` | portado |
| _sidebar.scss | `.nx-list` / `.nx-item` | portado |
| _chat.scss | `.nx-chat`, `.nx-header`, `.nx-messages`, `.nx-composer` | portado |
| _messages.scss | `.nx-row`, `.nx-bubble` | portado |
| _buttons.scss | `.nx-btn` | portado |
| _inputs.scss | `.nx-input` | portado |
| _modals.scss | `.nx-modal` | portado |
| _status.scss | — | pendente (fora de escopo — recurso Status/Stories não migrado) |
| _calls.scss | — | pendente (fora de escopo — chamadas) |
| _ai.scss | — | pendente (avaliar quando integrar IA no inbox) |
| _auth.scss, _landing.scss, _documentation.scss | — | não aplicável |

### Cenários cobertos na preview (`/admin/aparencia/nexchat-preview`)

1. Conversa normal ✅
2. Mensagem com imagem ✅
3. Mensagem com áudio (placeholder) ✅
4. Mensagem com documento ✅
5. Mensagem recebida ✅
6. Mensagem enviada (com ticks de status) ✅
7. Mensagem system ✅
8. Card PIX pendente ✅
9. Card PIX pago ✅
10. Card PIX expirado ✅
11. QR Code em modal ✅
12. Modal de imagem ✅
13. Painel de contato fiel ao NexChat ✅
14. Badges Meta / MultiZap QR / WuzAPI ✅
15. Status conectado/desconectado/erro ✅
16. Skeleton de lista ✅
17. Toggle Desktop/Mobile (390px com lista colapsável) ✅
18. Dark/Light mode (segue o tema do app via `:root:not(.dark)`) ✅

### Diferenças inevitáveis vs template

- Sem páginas Status, Calls, Auth, Landing, Documentation (fora de escopo deste produto).
- Settings unificadas com as do MultiZap (não duplicamos Notification/Privacy/Storage).
- PIX/QR/Comprovante são extensões MultiZap (não existem no template original).
- Tipografia: usamos "Plus Jakarta Sans" via fallback do sistema (sem importar webfonts externos para evitar custo de rede).

### Critérios para Fase 4 — todos OK

- [x] Cobertura visual completa
- [x] Preview fiel ao NexChat
- [x] CSS 100% escopado em `.nexchat-root`
- [x] Sem vazamento para o restante do app
- [x] Sem tokens/segredos no frontend
- [x] Toggle master + auditoria já implementados
- [x] Rollback visual garantido pelo toggle (`ui_theme_mode`)

---

## Fase 4 — Aplicação no /app/inbox

### Como o toggle decide o layout
`src/routes/app.inbox.tsx`:
```ts
const { mode, enabled, isLoading } = useActiveTheme();
if (isLoading) return <InboxLayout scope="workspace" />;
if (enabled && mode === "nexchat") return <NexInboxLayout />;
return <InboxLayout scope="workspace" />;
```
Qualquer erro de renderização (try/catch) também cai pro layout antigo.

### Reuso de backend
`NexInboxLayout` chama exatamente as mesmas server functions do `InboxLayout`:
`listTickets`, `listMessages`, `sendMessage`, `claimTicket`, `updateTicketStatus`,
`markRead`, `updateContactName`. Nenhuma rota nova, nenhuma mudança de schema.

### Não aplicado nesta fase
- `/app/chat`
- `/admin/inbox`
- dashboard
- app shell

### Rollback
Desligar o toggle em `/admin/aparencia` → próximo render do `/app/inbox`
volta para `InboxLayout` antigo automaticamente (sem deploy).

---

## Fase 7 — Tema NexChat no App Shell / Sistema Inteiro (21/05/2026)

**Estratégia**: em vez de reescrever cada rota/componente, o tema é aplicado por **override de design tokens** quando o toggle Master está ligado.

### Como funciona
1. `MultiZapThemeProvider` (montado em `src/routes/__root.tsx`) carrega o estado do toggle via serverFn `getActiveTheme`.
2. `NexThemeWrapper` (`src/components/nexchat/NexThemeWrapper.tsx`) escuta `useActiveTheme()` e, quando `enabled && mode==="nexchat"`, adiciona a classe `nexchat-theme-active` no `<body>`.
3. `src/components/nexchat/styles/nexchat.css` (bloco "Fase 7") redefine os CSS custom properties shadcn (`--background`, `--card`, `--primary`, `--sidebar*`, `--border`, `--input`, `--ring`, `--radius`) sob `body.nexchat-theme-active` (light) e `body.nexchat-theme-active.dark` (dark).
4. Todo componente shadcn (cards, botões, inputs, modais, popovers, dropdowns, tabs, badges, sidebar, topbar) já consome esses tokens → re-skin automático.

### Telas cobertas
Todas as rotas, em ambos os modos (light/dark): /app/* (canais, financeiro, configurações, usuários, contatos, dashboard, kanban, mapa, planos, relatórios, personalizar, integração, utilidades, etc.) e /admin/* (aparencia, segurança, sistema, configurações, workspaces, whatsapp, templates, campanhas, chatbots, IA, auditoria, etc.).

### Polimento global
Cantos arredondados (18px cards, 12px botões/inputs, 14px tabs, pílulas em badges), glassmorphism em modais/popovers, sombras suaves, scrollbar fino, `overflow-x:hidden` no mobile, transições premium.

### Fallback / Rollback
Toggle OFF em `/admin/aparencia` → classe não é aplicada → visual antigo intacto. Sem deploy.

### Testes manuais
- `/app/canais`: QR MultiZap continua funcionando (Conectar, Reconectar, Remover não recria) — apenas re-skinnizado.
- `/app/financeiro`: PIX, cobrança automática e métricas seguem operando — visual NexChat.
- `/admin/seguranca`, `/admin/configuracoes`, `/admin/aparencia`: abrem com paleta NexChat e mantêm todas as ações.
- Mobile (390/414/768): sem overflow horizontal, drawer da sidebar funciona, modais respeitam viewport.
- DevTools → Network/Console: nenhum secret (`SUPABASE_SERVICE_ROLE_KEY`, `WUZAPI_ADMIN_TOKEN`, `MULTIZAP_GATEWAY_TOKEN`) exposto — wrapper é puramente visual.

### O que NÃO foi alterado
Nenhuma rota /app ou /admin foi editada. Nenhum componente shadcn foi editado. Nenhum backend foi tocado. Supabase, RLS, service_role, WuzAPI, MultiZap Gateway, Recargas Brasil, `/root/whatsapp-server`, PM2, porta 3000, webhook 9001, parser PIX, cobrança automática, `sendWuzapiMessage`, inbound/outbound Meta/WuzAPI, audit_log e as Fases 4.1/5/6 (/app/inbox, /app/chat, /admin/inbox NexChat) seguem 100% intactos.

---

## Fase 7.1 — Auditoria visual e correções pontuais (21/05/2026)

**Telas auditadas (toggle ligado):** /app/canais, /app/financeiro, /app/inbox, /app/chat, /admin/inbox, /admin/aparencia, /admin/seguranca, /admin/configuracoes, /admin/sistema/gateways-pagamento.

**Resultado:** as 9 rotas-alvo já consomem apenas tokens semânticos (bg-card, text-foreground, border, muted) → herdaram automaticamente a paleta NexChat da Fase 7. Hardcoded restantes vinham de componentes compartilhados (whatsapp/*, notifications, onboarding, ui/dialog, ui/sheet, ui/drawer, app-topbar, inbox legacy).

**Estratégia escolhida:** overrides defensivos no `nexchat.css` em vez de editar cada componente — evita regressão e mantém rollback instantâneo.

**Cobertura do bloco "Fase 7.1":**
- `bg-white/bg-black/bg-gray-*` → `--card / --background / --muted`
- `text-black/text-gray-*` → `--foreground / --muted-foreground`
- `border-gray-*` → `--border`
- Tabelas: header em muted, hover em accent, borders coerentes
- Drawer/Sheet: glassmorphism + radius 18px
- Alerts/Toasts/Skeletons: radius NexChat
- Switch: cor primary verde NexChat
- Mobile ≤640px: dialogs com respiro, sheets fullscreen lateral, tabelas com scroll horizontal isolado, anti-overflow no `main`

**Rollback:** toggle OFF em /admin/aparencia OU remover o bloco "Fase 7.1" do CSS. Zero risco de regressão fora do tema.

### Fase 7.2 — 2026-05-21
Overrides cirúrgicos em src/components/nexchat/styles/nexchat.css:
- CTAs verdes hardcoded mapeados pro --primary do tema.
- Banner azul claro (update-banner) → muted glass.
- Inputs/selects/popover/dropdown ganharam radius 12px e glass.
- Mobile ≤640px: container com padding lateral 12px pra evitar aperto.
Nada de Supabase/WuzAPI/Gateway/PIX/Recargas/PM2/porta 3000/9001 tocado.

## Fase 7.2 — Lapidação visual /app/inbox
- Imagem na bolha: padding 4px, max 320×380, fallback gradient + ImageOff quando indisponível.
- Painel direito: 300px desktop / 320px ≥1400px, ícones nos headings, empty state padronizado (PanelEmpty).
- Bolha "me": gradient linear primary → primary*0.85, com glow.
- Mobile 390/414px: composer respeita safe-area, bolhas até 88%, header 60px.

## Fase 7.4 — Refactor fiel ao template (/app/chat)

### Mapeamento template → MultiZap

| Arquivo template | Componente MultiZap |
|---|---|
| `NavigationRail.tsx` | `NexNavigationRail` |
| `ChatList.tsx` | Coluna esquerda do `NexChatPage` |
| `ChatWindow.tsx` (header + central + sidebar dir) | `NexChatHeader` + `NexMessageList` + `NexChatComposer` + `NexContactInfoSidebar` |
| `EmptyState.tsx` | `NexChatEmptyState` |
| `Messenger.tsx` | Orquestração no `NexChatPage` |

### Provider capabilities no header do chat
Botões `Phone` e `Video` respeitam `getFeatureStatus(channel, "calls")`. Meta Cloud retorna `coming_soon` → botão `data-disabled="true"` com `cursor: not-allowed` e tooltip `Chamada — Em breve`. Quando suportado: clique abre toast (placeholder até integração real).

### Painel direito
`NexContactInfoSidebar` substitui `NexContactPanel` no /app/chat. Mostra: header com X, profile (avatar grande gradient, nome, telefone, badge canal), bloco "Detalhes do contato" (canal + telefone), Setor, Atendente, Etiquetas, "Mídia e arquivos" (grid 3-col com até 6 thumbs derivadas das mensagens, clique abre `NexImageModal`), Notas internas. Mobile vira drawer fixed.

### Empty state
`NexChatEmptyState` reproduz a composição do `EmptyState.tsx` (radial gradient, glows TR/BL, mock window com 3 bolhas, traffic dots vermelho/amarelo/verde, ícone forum rotacionado 12° com glow primary). Texto em PT-BR: "Atendimento **MultiZap**" + "Selecione uma conversa…".

### O que ficou de fora
- Group members list (não temos grupos no MultiZap hoje — entra junto com WuzAPI groups).
- Poll creator do template (fora do escopo).
- Stories upload (placeholder visual, sem backend).

## /app/chat em modo fullscreen (NexChat)
Quando o tema NexChat está ativo (`master_settings.nexchat_theme_enabled = true` e `ui_theme_mode = 'nexchat'`), a rota `/app/chat` é renderizada **sem o AppShell**:
- Sem sidebar lateral do MultiZap
- Sem topbar
- Sem WorkspaceBanner
- Ocupa 100vh × 100vw (`fixed inset-0 z-30`)
- NexChatPage monta NavigationRail + ChatList + ChatWindow + ContactInfo
- Demais rotas (`/app/inbox`, `/app/canais`, etc.) seguem normais

Rollback: desligar o toggle em `/admin/aparencia` → cai automaticamente no `InboxPage` antigo dentro do AppShell. Sem deploy.
