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

❌ Errado: `SUPABASE_SECRET_KEY=valor_real_aqui`

---

### 📐 Regra sobre Caddy

Caddy é **produção**. Antes de alterar Caddy:
1. criar backup do Caddyfile
2. salvar estado atual em revisão
3. validar config com `caddy validate`
4. só recarregar se a validação passar
5. salvar resultado em logs

**Nunca alterar Caddy sem backup.**

### 📐 Regra sobre PM2

Antes de alterar PM2:
1. salvar `pm2 list`
2. salvar `pm2 describe`
3. salvar logs relevantes
4. não deletar processo antigo sem confirmar função
5. não criar processo duplicado sem justificativa

### 📐 Regra sobre WuzAPI/WhatsApp

O WuzAPI contém sessão ativa WhatsApp.

**É proibido sem confirmação:**
- parar WuzAPI
- reiniciar container WuzAPI
- apagar banco/sessão WuzAPI
- fazer logout
- resetar QR
- trocar webhook atual antes de testar novo fluxo

A sessão WhatsApp ativa deve ser **preservada**.

---

### 🎯 Conclusões permitidas

Após executar qualquer tarefa, o agente deve concluir com evidência:

- ✅ `testado e passou`
- ❌ `testado e falhou`
- ⏭️ `não testado, motivo: ...`
- ⏳ `pendente, motivo: ...`

**Conclusões proibidas (sem evidência):**
- ❌ `parece certo`
- ❌ `deve funcionar`
- ❌ `provavelmente resolveu`
- ❌ `tenta aí`
- ❌ `roda esse comando`

---

## Regras absolutas

- Não expor secrets.
- Não commitar `.env`.
- Não pedir SSH, database password ou `service_role`.
- Não copiar chave privada da VPS.
- Não usar `pm2 restart all`.
- Não mexer em `/root/whatsapp-server`.
- Não mexer em Recargas, porta 3000, webhook 9001 ou webhook 9002 sem autorização.
- Não colocar token no frontend.
- Toda mudança deve usar branch + PR.
- **Sempre consultar `security/START_HERE.md`** antes de qualquer alteração de segurança.
- Webhook/run-once é o caminho oficial para o agente trabalhar na VPS.
- O usuário não deve ser usado como terminal humano.
- O agente deve executar, salvar logs, validar e voltar com evidência.

## Próximo passo ao iniciar sessão

Rode somente verificações seguras:

```bash
git status --short --branch
curl -fsS https://hook.multizap.dev/health
```

Depois leia:
1. `conexao-ia/CHECKLIST.md`
2. **`security/START_HERE.md`** — auditoria de segurança