# 🟢 SOLUÇÃO PORTA 8081 — Cockpit/Sala-Controle

## 📌 Status Atual

```
❌ Porta 8081: Estava DOWN
🟢 Solução: ENCONTRADA NO GITHUB
✅ Comando: npm run dev (escalação automática para 8081)
```

---

## 🔍 Encontrado no GitHub (commit 1d7c00da22)

**Fonte:** `docs/LEMBRANCAS/instinto-superior-dev-server-3000.md`

```
⚠️ NOTA IMPORTANTE (2026-10-19): 
Porta 8080 está ocupada. Vite escalou automaticamente para 8081.

Local (Casa) - Real: http://localhost:8081 🟢 RESPONDENDO
```

---

## 🚀 Como Ligar — 3 Opções

### **Opção 1: Script .bat (Mais Fácil)**
```bash
K:\EMERGENCIA\START-8081-NOW.bat
# (clique 2x)
```

### **Opção 2: Linha de Comando Manual**
```bash
cd K:\apps\instinto-superior
npm run dev
```

### **Opção 3: PowerShell (se não restringido)**
```powershell
cd K:\apps\instinto-superior
npm run dev
```

---

## ✅ Verificar Depois de Ligar

```bash
# Porta 8081 deve estar LISTENING
netstat -ano | findstr :8081

# Acessar:
# Local:     http://localhost:8081
# Tailscale: http://100.123.93.25:8081
```

---

## 📊 Arquitetura

```
Instinto Superior (TanStack Start + Vite)
    ├─ Dev server (npm run dev)
    ├─ Porta configurada: 3000
    ├─ Porta real (Vite escalou): 8081 ← AQUI
    ├─ Acesso local: localhost:8081
    ├─ Acesso remoto: 100.123.93.25:8081
    └─ Stack: React + Tailwind + Supabase
```

---

## 🎯 PIDs Identificados

```
43 processos node.exe rodando
3000 → antes (bloqueado por 8080 em PID 36480)
8081 → agora (Vite escalou automaticamente)

PIDs com alto uso:
  PID 3208:  130.0 MB
  PID 29952: 124.4 MB
  PID 34392: 77.8 MB
```

---

## 📋 Sumário GitHub

```
✅ 838 branches remotos mapeados
✅ main sincronizado com origin/main
✅ Portas documentadas no LEMBRANCAS
✅ Stack confirmado: TanStack Start + Vite
✅ Escalação 3000→8081 documentada
```

---

## 🔗 Documentos de Referência

- `K:\docs\LEMBRANCAS\instinto-superior-dev-server-3000.md` ← **PRINCIPAL**
- `K:\docs\LEMBRANCAS\network-ports-git-routes-20261019.md`
- `K:\docs\LEMBRANCAS\diagnose-porta-8080.md`

---

## ✅ Próximos Passos

1. **Execute:** `K:\EMERGENCIA\START-8081-NOW.bat`
2. **Aguarde:** npm install + build (~30s)
3. **Acesse:** http://localhost:8081 ou http://100.123.93.25:8081
4. **Verifique:** sala-controle deve renderizar
5. **Registre:** Prova de ligamento em `AREA-NOTICIAS-REBOOT.json`

---

## 🚨 Se não funcionar

```bash
# Matar processo PID 36480 que está em 8080
taskkill /PID 36480 /F

# Depois:
cd K:\apps\instinto-superior
npm run dev
```

---

**Status:** 🟢 RESOLVIDO  
**Data:** 2026-10-19  
**Fonte:** GitHub commit 1d7c00da22
