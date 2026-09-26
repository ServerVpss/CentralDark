# COMANDO - START_HERE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\conexao-ia\START_HERE.md
**SHA:** b85381a14dec6299
**Timestamp:** 2026-08-26T19:32:47.193628
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Nome padrão:**

### Riscos
- O agente precisa pedir confirmação antes de qualquer ação destrutiva ou de alto risco:

### Ouro Bruto (primeiros 5000 chars)
```
<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# START HERE — MultiZap / clone-deck

> Leia este arquivo primeiro em qualquer nova sessão de IA/Arena.

## Objetivo

Este arquivo é a memória permanente de conexão do projeto. Ele explica como o repo, GitHub, VPS e deploy se conectam sem expor secrets.

## Ordem obrigatória de leitura

1. `conexao-ia/START_HERE.md` — ponto de entrada
2. `conexao-ia/VPS_CONNECTION.md` — conexão GitHub/VPS/webhook
3. `conexao-ia/CHECKLIST.md` — checklist operacional
4. `docs/AGENTS.md` — regras do agente
5. `docs/STATE.md` — estado atual
6. `docs/GITHUB_ACCESS.md` — aliases SSH e regras de acesso GitHub
7. `docs/WEBHOOKS.md` — mapa de webhooks
8. `docs/deploy.md` — fluxo de deploy
9. `docs/SUPABASE_WORKFLOW.md` — migrations via GitHub Actions
10. **`security/START_HERE.md`** — 🛡️ **Start Here da Segurança** (obrigatório antes de alterar RLS, auth, secrets, Caddy, PM2, WuzAPI)
11. `security/README.md` — documento completo de auditoria de segurança

## Fluxo oficial

```txt
Arena/IA -> GitHub branch/PR -> merge na main
  -> GitHub webhook -> VPS atualiza codigo
  -> post-deploy seguro
  -> GitHub Actions aplica migrations Supabase quando houver SQL
```

## Conexão principal

- Repo: `segredounlock/clone-deck`
- VPS repo path: `/root/Multizap/apps/clone-deck`
- Webhook público: `https://hook.multizap.dev/webhook`
- Health público: `https://hook.multizap.dev/health`
- PM2 webhook: `CloneDeck-GitHub-Webhook`
- Porta webhook clone-deck: `9003`
- Pull script: `/usr/local/bin/clone-deck-gh-pull`

## ⚙️ Regra permanente: webhook/run-once é o controle operacional da VPS

Este projeto usa **GitHub webhook + run-once** para executar tarefas na VPS.

### Fluxo completo

```
Agente/IA altera código no repositório
  → commit/push na main
  → GitHub webhook chama https://hook.multizap.dev/webhook
  → listener na VPS recebe
  → VPS faz pull do repositório
  → post-deploy/run-once executa scripts permitidos
  → logs são salvos
  → PM2/Caddy/Docker/builds/testes são validados
```

### O agente não deve usar o usuário como terminal

Se a tarefa for comum, o agente deve executar **via run-once/webhook**.

**Exemplos de tarefas comuns:**
- diagnóstico
- build
- `npm install`
- `npm run build`
- leitura de logs
- `curl`
- `pm2 status`
- `pm2 logs`
- `docker ps`
- `systemctl status caddy`
- `caddy validate`
- verificação de portas
- teste de rotas
- validação de backup
- criação de relatório

O agente **não deve responder apenas com "rode este comando na VPS"** se ele pode criar um script run-once e executar.

---

### Como criar tarefas run-once

Todo script operacional deve ficar em:

```
scripts/run-once/
```

**Nome padrão:**

```
NNN-descricao-da-tarefa.sh
```

**Exemplos:**
- `006-configure-supabase-auth.sh`
- `007-validate-whatsapp-backup.sh`
- `008-build-bot.sh`
- `009-test-crm-routes.sh`
- `010-check-caddy-pm2.sh`

**Cada script deve:**
- usar caminhos absolutos
- salvar logs organizados
- não imprimir secrets
- validar erros
- gerar resumo simples
- registrar comandos executados
- criar pasta de revisão

**Pasta padrão de revisão:**

```
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/NOME-DA-TAREFA/
```

**Arquivos recomendados:**
- `resumo.md`
- `comandos-executados.log`
- `erros.log`
- `pm2-status.log`
- `caddy-status.log`
- `docker-status.log`
- `portas.log`
- `curl-tests.log`
- `build.log`
- `pendencias.md`

---

### Ações que o agente pode executar sem pedir confirmação

O agente pode executar sozinho, via run-once:
- build
- install
- diagnóstico
- leitura de logs
- teste HTTP
- validação de porta
- validação de PM2
- validação de Docker
- validação de Caddy
- criação de arquivos novos não destrutivos
- criação de relatórios
- auditoria de segurança
- validação de Supabase sem mostrar secrets

### Ações que exigem confirmação antes

O agente precisa pedir confirmação antes de qualquer ação destrutiva ou de alto risco:
- apagar arquivos ou pastas
- remover processos PM2 antigos
- parar WuzAPI
- reiniciar Docker com sessão WhatsApp ativa
- resetar sessão WhatsApp
- fazer logout do WhatsApp
- alterar webhook ativo do WuzAPI
- trocar domínio público
- alterar Caddy em produção
- remover legado definitivamente
- dropar tabela
- alterar dados reais críticos
- mexer em `.env`
- expor, mover ou alterar secrets
- trocar keys de produção
- mexer em banco real sem backup

---

### 🔒 Segurança obrigatória

**Nunca colocar no repositório:**
- senhas
- tokens
- API keys
- Supabase service role key
- Supabase secret key
- SMTP password
- JWT
- cookies
- connection strings
- credenciais de WhatsApp
- arquivos de sessão
- chaves privadas

**Secrets devem ficar fora do repo:**

```
/root/Multizap/secrets/
```

**Permissões obrigatórias:**

```bash
chmod 700 /root/Multizap/secrets
chmod 600 /root/Multizap/secrets/*.env
```

O agente pode verificar **apenas se as variáveis existem**.

✅ Correto: `SUPABASE_SECRET_KEY=EXISTE`

❌ Errado: `SUPABASE_SECRET_KEY=val
```

---

# COMANDO - START_HERE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\security\START_HERE.md
**SHA:** 71df104327269f8b
**Timestamp:** 2026-08-26T19:32:53.246185
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > **Regra:** Atualize este arquivo ao final de CADA alteração de segurança.

### Ouro Bruto (primeiros 5000 chars)
```
<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# 🛡️ START HERE — Segurança MultiZap

> **Ponto de entrada obrigatório para auditoria de segurança.**
> Leia este arquivo **antes** de qualquer alteração em:
> - RLS / policies do Supabase
> - Autenticação / login / reset de senha
> - Secrets / vault / tokens
> - Caddy / PM2 / WuzAPI / Infraestrutura
>

---

## 📋 Ordem de leitura dentro desta pasta

1. **`security/START_HERE.md`** ← você está aqui (resumo + pendências)
2. `security/README.md` — documento completo com detalhes técnicos

---

## ✅ O que já foi aplicado (resumo)

| # | Medida | Status |
|---|--------|--------|
| 1 | **RLS** — 28 policies em 17 tabelas | ✅ Completo |
| 2 | **Redirect landing page** — Whitelist + hash validation | ✅ Aplicado |
| 3 | **Reset password** — Session validation + OTP 2h | ✅ Aplicado |
| 4 | **Secrets Vault** — pgcrypto no Supabase | ✅ Aplicado |
| 5 | **Email templates** — Português, sem imagem externa | ✅ Aplicado |
| 6 | **Caddy** — Backup + validate obrigatório | ✅ Regra permanente |
| 7 | **PM2** — Sem restart all | ✅ Regra permanente |
| 8 | **WuzAPI** — Sessão preservada | ✅ Regra permanente |
| 9 | **Supabase Auth** — URL, OTP, redirect configurados | ✅ Configurado |
| 10 | **Webhook run-once** — Controle VPS | ✅ Regra permanente |

---

## 🚨 Pendências

| Item | Prioridade | Onde |
|------|------------|------|
| 🔴 **CRM sem "Esqueceu a senha"** | **ALTA** | `apps/crm/src/routes/auth.tsx` |
| 🔴 Validar redirect recovery no CRM | MÉDIA | `apps/crm/src/routes/auth.tsx` |
| 🔴 Testar fluxo recovery completo | MÉDIA | Após merge PR #98 |
| 🔴 Rate limiting email | BAIXA | Supabase config |
| 🔴 MFA para admins | BAIXA | Supabase config |
| 🔴 Rotacionar chaves temporárias | QUANDO FINALIZAR | `ghp_*`, `sbp_*`, `sb_secret_*` |

---

## 🔁 Segurança Contínua — Regra Permanente

A segurança **nunca está "pronta"** — sempre há espaço para melhorar.

### Princípios

| Princípio | Descrição |
|-----------|-----------|
| **Melhorar sempre** | Toda alteração no sistema é uma oportunidade de rever e fortalecer a segurança |
| **Padrão único** | Bot, CRM, Landing, Gateway, VPS — todos devem seguir o **mesmo padrão** de segurança |
| **Consistência** | Se uma proteção existe no Bot, ela deve existir no CRM e vice-versa |
| **Documentar** | Toda melhoria de segurança deve ser registrada em `security/README.md` |
| **Revisão** | Antes de mergear qualquer PR, verificar o checklist de segurança |

### Checklist de segurança contínua

- [ ] **Essa alteração afeta a segurança?** (autenticação, dados, infra, secrets)
- [ ] **O padrão é consistente?** (Bot e CRM têm a mesma proteção?)
- [ ] **RLS está correto?** (toda tabela nova precisa de policy)
- [ ] **Secrets estão seguros?** (nunca no repo, sempre criptografados no vault)
- [ ] **Redirect está seguro?** (whitelist + hash validation)
- [ ] **Documentação foi atualizada?** (`security/README.md`, `security/START_HERE.md`)

---

## 🔗 Links rápidos

- 📄 **Documento completo:** `security/README.md`
- 📋 **Checklist operacional:** `conexao-ia/CHECKLIST.md`
- 🔐 **Regras de acesso GitHub:** `docs/GITHUB_ACCESS.md`
- 🗺️ **Estado do projeto:** `docs/STATE.md`
- 🔌 **Conexão VPS:** `conexao-ia/VPS_CONNECTION.md`

---

> **Regra:** Atualize este arquivo ao final de CADA alteração de segurança.
> **Lembrete:** Sempre melhore a segurança. Sempre mantenha o padrão.
```