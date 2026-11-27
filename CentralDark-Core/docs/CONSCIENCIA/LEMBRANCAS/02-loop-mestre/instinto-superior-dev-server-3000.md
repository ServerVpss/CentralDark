---
data_criacao: '2026-10-27'
ultima_atualizacao: '2026-10-27T00:13:58.762720'
ultima_modificacao: '2026-10-27T00:13:58.762720'
ultima_verificacao: '2026-10-27T00:13:58.762720'
fuso_horario: America/Sao_Paulo
hash_conteudo: 4c7a4324f2964fc59623f792be105390fa843261e943f1502f92ad2a2b2c46ec
rastro:
- acao: criacao_com_metadados_vivos
  timestamp: '2026-10-27T00:13:58.762720'
  autor: kimetsu_remix_autonomo
  detalhe: Adicionadas 10 propriedades obrigatorias da regra Atualizacao Viva
grupo_notas: 02-loop-mestre
relacionado_a: []
estado_evidencia: PENDING
---
# Instinto Superior - Cockpit Casa, porta fixa 8080

Atualizado em 2026-10-19. Owner: `apps/instinto-superior`.
`3000` era a porta pretendida historicamente, mas pertence ao `tailscaled.exe` na medicao de 19/10/2026. `8081` era uma porta de fallback historica, **nao fixa**. A porta do Cockpit Casa fica **8080 (strictPort)**. A referencia historica permanece neste arquivo para nao quebrar links antigos.

## Enderecos
- Casa: `http://127.0.0.1:8080/sala-controle`.
- Tailnet Casa: `http://100.123.93.25:8080/sala-controle` (somente se IP Tailscale atual e firewall permitirem).
- DNS Tailscale: usar DNS do dispositivo apenas depois de confirmar resolucao e acesso; nao presumir porta 3000.
- Tela instalada em `CentralDark.exe` e separada do servidor Vite de desenvolvimento; instalador/deploy exige provas proprias.

## Inicializacao persistente do Windows
- Task Scheduler: `\CentralDark-Cockpit-8080` - gatilhos boot + logon + rechecagem a cada 5 minutos (janela de repeticao 3650 dias, renovar ate 2036), conta SYSTEM, sem abrir janela.
- Script owner reutilizavel: `K:\scripts\casa\instinto-cockpit-autostart.ps1`.
- Atalho manual existente: `K:\apps\instinto-superior\INICIAR-COCKPIT-LOCAL.bat`, que usa o **mesmo script**.
- Guard: se Vite do Instinto ja escuta em 8080 e responde HTTP 200, sai sem duplicar; se ha outro processo ou porta saudavel nao comprovada, bloqueia sem matar.
- Dependencias instaladas sao requeridas; nao executa `npm ci`, `taskkill`, git reset, deploy nem novo executor Hermes.
- Logs de stdout/stderr: `F:\temp\centraldark-cockpit-8080-stdout.log` e `F:\temp\centraldark-cockpit-8080-stderr.log`; sem gravar credenciais intencionalmente.
- Quando Windows desliga o servidor local para; ao boot ou logon, a tarefa tenta recuperar. Falha se o disco K: ou Node ainda nao estiver disponivel; checar historico do agendador/port health.

## Readback e aceitaÃ§Ã£o
```powershell
Get-ScheduledTask -TaskName 'CentralDark-Cockpit-8080'
Get-NetTCPConnection -State Listen -LocalPort 8080
(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8080/sala-controle).StatusCode
```
Esperado: task habilitada, PID Node/Vite owner Instinto, HTTP 200. `HTTP_200 != UI_E2E`.
Nao marcar BOOT_RESTART_PASS sem reiniciar fisicamente e medir depois do boot.
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
