# 🐘 Supabase CLI Setup — FRENTE 1 EXECUTORA

## Status: ✅ PRONTO PRA USO

Guia passo-a-passo para instalar, configurar e usar Supabase CLI na VPS para consolidar credenciais.

---

## 📋 Pré-Requisitos

- ✅ Node.js v16+ (geralmente já instalado na VPS)
- ✅ npm (vem com Node.js)
- ✅ Acesso como root na VPS
- ✅ Access Token do Supabase (obtido em https://app.supabase.com/account/tokens)

---

## 🚀 INSTALAÇÃO RÁPIDA (3 passos)

### Passo 1: Baixar scripts do repo

```bash
cd /root/CentralDark
git pull origin main

# Tornar executáveis
chmod +x scripts/install-supabase-cli.sh
chmod +x scripts/extract-supabase-credentials.sh
chmod +x scripts/setup-secrets-structure.sh
```

### Passo 2: Instalar Supabase CLI

```bash
sudo ./scripts/install-supabase-cli.sh

# Output esperado:
# ✅ Node.js v18.x.x encontrado
# ✅ Supabase CLI instalado
# Versão: supabase-cli 1.x.x
```

### Passo 3: Extrair credenciais + Popular .env

```bash
# Obter Access Token em: https://app.supabase.com/account/tokens
export SUPABASE_ACCESS_TOKEN="sbp_your_access_token_here"

# Executar extração
sudo -E ./scripts/extract-supabase-credentials.sh

# Output esperado:
# ✅ Supabase CLI autenticado
# ✅ Credenciais extraídas
# ✅ /root/CentralDark/secrets/supabase/ populado
# ✅ /root/.env gerado
```

---

## ✅ Validação

### 1. Verificar estrutura de secrets

```bash
ls -la /root/CentralDark/secrets/supabase/

# Esperado:
# -rw------- SUPABASE_URL
# -rw------- SUPABASE_ANON_KEY
# -rw------- SUPABASE_KEY (service_role)
# -rw------- DATABASE_URL
```

### 2. Validar .env

```bash
cat /root/.env

# Esperado:
# SUPABASE_URL="https://kagejpghnwdfymddwxuf.supabase.co"
# SUPABASE_ANON_KEY="eyJ..."
# SUPABASE_KEY="eyJ..."
# DATABASE_URL="postgresql://postgres:...@db.kagejpghnwdfymddwxuf.supabase.co:5432/postgres"
```

### 3. Testar conectividade PostgreSQL

```bash
source /root/.env
psql "$DATABASE_URL" -c "SELECT version();"

# Esperado:
# PostgreSQL 15.x (Supabase) on ...
```

### 4. Testar conectividade Supabase

```bash
curl -s -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$SUPABASE_URL/rest/v1/" \
  -H "Content-Type: application/json" | head -20

# Esperado: JSON válido (sem erro 401)
```

---

## 🔄 Uso Prático do Supabase CLI

Depois de autenticado, você pode:

### Listar projetos

```bash
supabase projects list

# Output:
# kagejpghnwdfymddwxuf  | https://kagejpghnwdfymddwxuf.supabase.co | Personal
```

### Descrever projeto (detalhes)

```bash
supabase projects describe kagejpghnwdfymddwxuf --json | jq .

# Mostra: API keys, database info, URLs, etc
```

### Listar secrets do projeto (se configurados)

```bash
supabase secrets list

# Output:
# TELEGRAM_BOT_TOKEN        | ***OCULTO***
# MCP_ADMIN_KEY             | ***OCULTO***
# (valores são ocultos por segurança)
```

### Sincronizar schema local → Supabase

```bash
supabase db pull  # Pull schema do remote
supabase db push  # Push schema local (se houver supabase/ local)
```

### Acessar PostgreSQL via CLI

```bash
source /root/.env
psql "$DATABASE_URL"

# Agora em psql:
postgres=> \dt  # Listar tabelas
postgres=> SELECT * FROM users;  # Consultar
```

---

## 🔐 Integração com PM2

Depois de popular `/root/.env`, restart PM2:

```bash
pm2 restart all

# Monitorar logs
pm2 logs unified-bot  # Ver se conecta ao Supabase
```

Esperado: `sync-connections.sh` para de hard-exit e começa a sincronizar.

---

## 🔄 Sincronização Bidimensional

### GitHub → VPS

```bash
# Scripts de setup já estão no GitHub
cd /root/CentralDark && git pull origin main

# Instalação ocorre localmente na VPS
sudo ./scripts/install-supabase-cli.sh
```

### VPS → GitHub (Secrets)

Se você adicionar novos secrets em `/root/CentralDark/secrets/`, sincronize com GitHub:

```bash
# (Será feito via script sync-secrets-github.sh em próximo passo)
./scripts/sync-secrets-github.sh $GITHUB_TOKEN
```

---

## 🛠️ Troubleshooting

### "supabase: command not found"

```bash
# Verificar instalação
which supabase
npm list -g supabase

# Reinstalar
sudo npm install -g supabase@latest
```

### "Autenticação falhou"

```bash
# Verificar token
echo $SUPABASE_ACCESS_TOKEN

# Gerar novo em: https://app.supabase.com/account/tokens
# Tokens expiram, às vezes precisa regenerar

# Testar login
supabase login  # Interface interativa
```

### "PostgreSQL não conectado"

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conectividade
nc -zv db.kagejpghnwdfymddwxuf.supabase.co 5432

# Se falhar: firewall ou Supabase em manutenção
```

### "Project not found"

```bash
# Validar PROJECT_ID
supabase projects list --json | jq .[] | head -1

# Se nada retornar: token sem permissão ou projeto deletado
```

---

## 📊 Estrutura Final

```
/root/
├── .env                                    # Consolidated secrets (chmod 600)
├── .supabase/
│   └── cli-config.sh                      # Config shell do CLI
└── secrets/
    ├── github/
    ├── supabase/                          # ← Populated by extract script
    │   ├── SUPABASE_URL
    │   ├── SUPABASE_ANON_KEY
    │   ├── SUPABASE_KEY
    │   └── DATABASE_URL
    ├── telegram/
    ├── mcp/
    ├── cloudflare/
    ├── wuzapi/
    ├── vps/
    └── .backup/                           # Backups automáticos

GitHub (ServerVpss/CentralDark):
├── scripts/
│   ├── install-supabase-cli.sh            # Instalação CLI
│   ├── extract-supabase-credentials.sh    # Extração de credenciais
│   └── setup-secrets-structure.sh         # Setup de dirs
└── docs/SECRETS-CONSOLIDATION/
    ├── README.md                          # Overview
    ├── SUPABASE-CLI-SETUP.md              # ← Este arquivo
    └── ROTATION-SCHEDULE.md               # Rotação de secrets
```

---

## ⏱️ Tempo Total

- Instalação: 2 mins
- Autenticação: 1 min
- Extração: 1 min
- Validação: 2 mins
- **Total: ~6 minutos**

---

## 📞 Próximos Passos

Após validação bem-sucedida:

1. ✅ **FRENTE 1 CONCLUÍDA**: owner canônico em `/root/CentralDark/secrets/`; `/root/.env` permanece apenas compatibilidade para consumidores legados
2. 🟡 **FRENTE 2**: Google Drive OAuth + Hub Integration
3. 🟡 **FRENTE 3**: Builder Audit + Contract Review

---

**Gerado**: 2026-09-20  
**Status**: ✅ PRONTO PRA USAR  

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>  
Claude-Session: https://claude.ai/code/session_0133AjFLRV4v6EMRKDvMk9SJ
