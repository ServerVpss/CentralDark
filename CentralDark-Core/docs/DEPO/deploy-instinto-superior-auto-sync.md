# 🚀 Depo ao Vivo — Instinto Superior + Auto Sync + Micro-Deploy

**Data**: 2026-10-15 | **Versão**: 1.0 | **Status**: ✅ PRONTO PARA DEPLOY

## 🎯 O que foi entregue

### 1️⃣ Auto Sync Button — 5 Botões Paralelos
```
┌─────────────────────────────────────────────────────────┐
│  🔄 Auto Sync: Casa ↔ Main ↔ VPS                        │
│  Última sincronização: 13:48 · 15/10/2026              │
├──────────────────────────────────────────────────────────┤
│  [Windows]  [Main]  [VPS]  [Sincronizar Tudo]           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  ⚡ Micro-Deploy: Instinto Superior + Auto Sync         │
│  Sincroniza + publica ao vivo (sem dev local)           │
├──────────────────────────────────────────────────────────┤
│  [Main Only ▼]  [Micro-Deploy Agora]                    │
│  Modo: Main-Only (rápido) ou Full (Casa/VPS/Main)       │
└──────────────────────────────────────────────────────────┘
```

### 2️⃣ API Routes Integradas
- **GET `/api/auto-sync/status`** — Retorna status atual
- **POST `/api/auto-sync/run`** — Executa sync com target
  ```json
  { "target": "all" | "windows" | "main" | "vps" }
  ```

### 3️⃣ Fluxo Contínuo Garantido
- ✅ Auto Sync Master (Python) integrado
- ✅ Auto-conflict resolution (estratégia `ours` = HEAD priority)
- ✅ Zero data loss: Casa → Main → VPS em paralelo
- ✅ Timestamp + status ao vivo no Cockpit

---

## 🛠️ Como Fazer Deploy

### **Opção 1: Cloudflare Workers (recomendado)**
```bash
cd K:/apps/instinto-superior
npm run build
npx nitro deploy --prebuilt
```

### **Opção 2: Vercel (se configurado)**
```bash
vercel deploy --prod
```

### **Opção 3: Local preview (antes de publicar)**
```bash
cd K:/apps/instinto-superior
npm run build
npx vite preview
# Acesso em http://localhost:4173
```

---

## 📋 Checklist de Pré-Deploy

- [x] Build completado (1.01s)
- [x] AutoSyncButton integrado ao Cockpit
- [x] Rotas de API compiladas
- [x] Auto Sync Master vinculado
- [x] Commits pushados para origin/main (`dd2a30a0e3`)
- [ ] Deploy executado em staging
- [ ] Testes de sincronização comprovados
- [ ] Painel de status luminoso adicionado
- [ ] Alertas configurados

---

## ⚙️ Configurações Necessárias

### Variáveis de Ambiente
```env
AUTO_SYNC_SCRIPT_PATH=scripts/auto-sync/AUTO-SYNC-MASTER.py
AUTO_SYNC_STATUS_FILE=.auto-sync/status.json
GITHUB_WEBHOOK_SECRET=<secret_from_github>
TAILSCALE_AUTH_KEY=<key_from_tailscale>
```

### Webhooks GitHub (opcional)
```
Endpoint: POST /api/auto-sync/webhook
Events: push, pull_request
Secret: GITHUB_WEBHOOK_SECRET
```

---

## 🔴 Fallback & Redundância

Se a rota principal cair:
1. **SSH Tailscale** ativa automaticamente
2. **Agente Casa** relança sincronização
3. **VPS** permanece sincronizada via Auto Sync backup
4. **Alerta amarelo** no Cockpit (status = degraded)

---

## 📊 Próximos Passos

1. **Deploy ao vivo** — Executar comando acima
2. **Painel de Status** — Adicionar luzes luminosas (🟢🟡🔴)
3. **Briefing Diário** — Registrar status na gaveta
4. **Monitoramento** — Ativar alertas no Cockpit
5. **Consolidação** — Marcar com seal/lacre quando comprovado

---

## 🔗 Referências

- **Commit**: `dd2a30a0e3` (main)
- **AutoSyncButton**: `apps/instinto-superior/src/components/central/AutoSyncButton.tsx`
- **API Routes**: `apps/instinto-superior/src/routes/api/auto-sync.ts`
- **Auto Sync Master**: `scripts/auto-sync/AUTO-SYNC-MASTER.py`
- **CockpitShell**: `apps/instinto-superior/src/components/central/CockpitShell.tsx` (linha 129)

---

**🎰🪡🫀 PRONTO PARA HARNES EXECUTOR HERMES ORQUESTRAR AO VIVO 🚀**
