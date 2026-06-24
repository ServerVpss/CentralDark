
# Plano — Painel Mestre do Admin + Roteamento de Notificações

Tudo dentro deste mesmo projeto Lovable, reaproveitando o design Esmeralda. Sem mexer na sua conta pessoal do Telegram agora (userbot/QR fica como fase futura). Foco: você ter um lugar só pra mandar em tudo.

---

## 1. Painel Mestre (admin only, rota disfarçada)

- Nova rota: **`/cofre`** dentro do projeto (nome neutro pra não entregar que é admin). Subdomínio `admin.centralldark.com` aponta pra essa rota via Cloudflare (orange cloud já ligado).
- Protegida 3x:
  1. Login obrigatório
  2. `AdminRoute` (só seu user_id)
  3. Camada extra de confirmação por código no Telegram pra ações sensíveis (rotacionar token, restaurar backup, etc.)
- Layout: sidebar interna com 6 abas
  - **Visão Geral** — status VPS, Mega Painel resumido, alertas críticos
  - **Bots Telegram** — lista, qual é o principal, qual recebe o quê
  - **Notificações** — regras de roteamento por tipo de evento
  - **Cofre de Contas** — central de login OAuth (GitHub, Google, futuramente Telegram userbot)
  - **Módulos & Vendas** — controle de planos, preços, on/off de módulos
  - **Instalador** — gera/atualiza pacote de instalação da VPS

---

## 2. Roteamento de notificações POR TIPO DE EVENTO

Hoje a edge function `notify-telegram` pega o primeiro bot ativo. Vou trocar isso por uma tabela de regras que VOCÊ controla no painel.

Nova tabela `notification_routes`:
- `tipo` (info / sucesso / aviso / erro / critico / venda / pagamento / sistema)
- `bot_id` (qual bot do `telegram_bots` envia)
- `chat_id` (pode ser você, um grupo, ou um canal)
- `ativo` (on/off)

Permite múltiplas linhas pro mesmo tipo (redundância). Exemplo da sua cabeça:
- `critico` → @srver1bot pro seu DM
- `venda` → @bot-vendas pro grupo de vendas
- `info` → @bot-logs pro canal de logs

Aba **Notificações** mostra uma matriz visual: linhas = tipos, colunas = bots, com toggles. Botão "Testar rota" dispara mensagem de exemplo.

A `notify-telegram` passa a ler essa tabela. Se nenhuma regra casar, cai no fallback `@srver1bot` (configurável).

---

## 3. Cofre de Bots Telegram (gerencia tokens)

Aba **Bots Telegram** vira o centro de tudo:
- Lista todos os bots (já tem `telegram_bots`)
- Botão "Adicionar bot" → cola token do @BotFather
- Botão "Trocar token" → você cola o novo, o sistema valida via `getMe`, atualiza no banco. Se trocar o token de um bot, tudo continua funcionando porque o roteamento referencia `bot_id` (interno), não o token.
- Marca 1 como **Principal** (default das notificações sem regra)
- Health check ao vivo (já existe)
- Foto, username, status — tudo visível

Tokens ficam no banco com RLS service-role only — nunca expostos pro frontend (frontend só vê os 4 últimos dígitos mascarados).

---

## 4. Central de Login OAuth (Cofre de Contas)

Aba **Cofre de Contas** — um lugar só pra plugar todas as suas contas:
- GitHub (já tem OAuth no projeto, só puxar pra cá)
- Google
- Espaço reservado pra **Telegram userbot (MTProto)** — vem na fase futura com QR Code na VPS, captura sessão da sua conta pessoal (lib GramJS rodando na VPS, link temporário pra você escanear). Hoje fica como card "Em breve" com aviso de risco bem claro.

Tudo OAuth, nada de senha digitada. Tokens cifrados no banco.

---

## 5. Módulos & Vendas

Aba **Módulos & Vendas** consolida o que hoje tá espalhado:
- Liga/desliga módulo (`query_modules`)
- Preços e planos (`subscription_plans`)
- Lista de vendas recentes
- Botão "Forçar refresh do cache de módulos"

Sem reinventar — só reúne na mesma tela o que já existe.

---

## 6. Instalador (atualizar o que já existe)

Você já tem `install.sh` na raiz e `scripts/setup-centraldark-portal.sh`. Plano:
- **Auditar** os scripts atuais e a `docs/INSTALADOR/`
- **Atualizar** pra refletir tudo que foi construído até agora (Mega Painel, notify, novo cofre, roteamento)
- Aba **Instalador** no painel mostra:
  - Versão atual do instalador
  - Diff do que mudou desde a última geração
  - Botão "Gerar pacote atualizado" → produz `install.sh` + `.env.example` + lista de secrets necessárias
  - Botão "Baixar ZIP" pra você guardar
- Toda vez que adicionarmos uma feature nova, o instalador é atualizado no mesmo PR (regra fixa)

Sem backup automático agora — você pediu pra focar só no instalador. Backup fica num próximo plano.

---

## Ordem de execução

1. Migration: tabela `notification_routes` + RLS + GRANTs
2. Edge function `notify-telegram` lê regras e roteia
3. Rota `/cofre` com layout base e proteção tripla
4. Aba **Bots Telegram** (gerenciar tokens, marcar principal)
5. Aba **Notificações** (matriz visual de roteamento + teste)
6. Aba **Cofre de Contas** (GitHub/Google já, Telegram userbot como placeholder)
7. Aba **Módulos & Vendas** (consolidação)
8. Aba **Instalador** (auditoria + UI de geração)
9. Cloudflare: apontar `admin.centralldark.com` → rota `/cofre`
10. Notificar via Telegram cada passo concluído (Mega Painel vai mostrando ao vivo)

---

## Detalhes técnicos (pode pular se quiser)

- Tabela: `notification_routes(id, tipo, bot_id, chat_id, ativo, prioridade, created_at)`
- RLS: admin-only via `has_role(auth.uid(), 'admin')`
- Edge function: query `WHERE tipo = $1 AND ativo = true ORDER BY prioridade`, dispara em paralelo, registra cada envio no `notifications_log`
- Frontend usa hook novo `useNotificationRoutes` (não duplica `useTelegramBots`)
- Subdomínio: regra Cloudflare Worker ou DNS CNAME → mesmo origin, com path rewrite `/` → `/cofre`
- Telegram userbot futuro: GramJS rodando em PM2 na VPS, endpoint `/login-telegram` temporário com QR, sessão cifrada em `vault`

---

## O que NÃO faço sem te avisar

- Mexer na sua conta pessoal do Telegram (userbot fica pra depois)
- Apagar/sobrescrever `install.sh` atual sem te mostrar o diff
- Mudar design — segue Esmeralda
- Tocar em DNS sem confirmação explícita

Confirma que tá de acordo e eu começo pela migration + roteamento?
