# 🌐 Instinto Superior — Dev Server Porta 3000

**Data:** 2026-10-19  
**App:** TanStack Start + Vite + React  
**Porta Local:** 3000  
**Tailscale:** `windows-casa.tail6d7aa4.ts.net:3000`

---

## 🚀 Como iniciar

### Opção 1: PowerShell (Recomendado)
```powershell
K:\scripts\start-instinto-3000.ps1
```

### Opção 2: Cmd
```cmd
K:\scripts\start-instinto-3000.cmd
```

### Opção 3: Manual
```bash
cd K:\apps\instinto-superior
npm run dev
```

---

## 🌐 Acessar

⚠️ **NOTA IMPORTANTE (2026-10-19):** Porta 8080 está ocupada. Vite escalou automaticamente para **8081**.

| Contexto | URL | Status |
|----------|-----|--------|
| **Local (Casa) - Esperado** | http://localhost:3000 | 🟡 Vite usa 8081 |
| **Local (Casa) - Real** | http://localhost:8081 | 🟢 RESPONDENDO |
| **Tailscale (Remoto)** | http://100.123.93.25:8081 | 🟢 RESPONDENDO |
| **Tailscale DNS** | http://windows-casa.tail6d7aa4.ts.net:8081 | 🟢 RESPONDENDO |
| **Porta Vite interna** | 5173 (proxy → 8081 via Nitro) | - |

---

## 📊 Stack

- **Framework:** TanStack Start (React SSR)
- **Build:** Vite
- **Backend:** Nitro (Node.js servidor)
- **Styling:** Tailwind + Radix UI
- **Database:** Supabase
- **Auth:** Lovable Cloud Auth

---

## 🔧 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Dev server com HMR |
| `npm run build` | Build produção |
| `npm run build:vps` | Build para VPS (Nitro preset) |
| `npm run preview` | Preview build local |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

---

## ⚙️ Configuração Vite

**Arquivo:** `vite.config.ts`

```typescript
vite: {
  server: {
    allowedHosts: ["windows-casa.tail6d7aa4.ts.net"],
  },
},
```

- ✅ Acesso seguro via Tailscale
- ✅ Sem `allowedHosts: true` (específico)
- ✅ Admin requer login + permissões backend

---

## 📁 Estrutura

```
apps/instinto-superior/
├── src/
│   ├── components/  (React components)
│   ├── pages/       (TanStack Start routes)
│   ├── server.ts    (SSR entry, error wrapper)
│   └── client.ts
├── package.json
├── vite.config.ts
└── ...
```

---

## 🐛 Troubleshooting

### Porta 3000 já em uso
```bash
# Encontrar processo na porta
netstat -ano | findstr :3000

# Matar processo (PID)
taskkill /PID <PID> /F
```

### Erro de dependências
```bash
rm -r node_modules package-lock.json
npm install
```

### Tailscale não conecta
- Verificar: `tailscale status`
- Reconectar: `tailscale up`
- Teste local primeiro: `http://localhost:3000`

---

## 🔐 Segurança

- ✅ Admin exige login (backend valida)
- ✅ Tailscale privado (não exposto publicamente)
- ✅ Supabase conecta via auth do Lovable
- ⚠️ Não expor porta 3000 na internet sem proteção

---

## 📝 Logs do server

```bash
# Ver logs em tempo real
npm run dev

# Ou em background + monitor
npm run dev > logs.txt 2>&1 &
tail -f logs.txt
```

---

**Criado:** 2026-10-19  
**Atualizado:** 2026-10-19
