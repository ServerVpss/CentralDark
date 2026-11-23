---
data_criacao: '2026-10-27'
ultima_atualizacao: '2026-10-27T00:13:58.762720'
ultima_modificacao: '2026-10-27T00:13:58.762720'
ultima_verificacao: '2026-10-27T00:13:58.762720'
fuso_horario: America/Sao_Paulo
hash_conteudo: 50da59b722223328866d2dcf2793baa82878271d7e60a22dc21162adc28a5430
rastro:
- acao: criacao_com_metadados_vivos
  timestamp: '2026-10-27T00:13:58.762720'
  autor: kimetsu_remix_autonomo
  detalhe: Adicionadas 10 propriedades obrigatorias da regra Atualizacao Viva
grupo_notas: 03-evidencias-contraprovas
relacionado_a: []
estado_evidencia: PENDING
---
# 🔍 Diagnóstico — Porta 8080 Ocupada

**Data:** 2026-10-19 13:45 UTC  
**Status:** 🟡 DIAGNOSTICO PENDENTE  
**Objetivo:** Identificar processo ocupando porta 8080

---

## 📊 Estado Observado

```
Porta 8080 listening: SIM
PID: 36480 (histórico)
Proprietário: DESCONHECIDO
Motivo: ?
Razão: ?
```

---

## 🔧 Como Diagnosticar (Execute um dos comandos)

### PowerShell

```powershell
# Encontrar processo na porta 8080
netstat -ano | findstr :8080

# Depois identificar o PID (coluna à direita)
tasklist /FI "PID eq 36480"

# Ou detalhes do processo
Get-Process -Id 36480 | Select-Object Name, Path, StartTime, Id
```

### Cmd

```cmd
netstat -ano | findstr :8080
tasklist | findstr 36480
```

---

## 📋 Possíveis Ocupantes

| Serviço | Porta | Descrição | Como Parar |
|---------|-------|-----------|-----------|
| Nginx | 8080 | Reverse proxy | `Stop-Service nginx` ou `sc stop nginx` |
| Apache | 8080 | Web server | `Stop-Service Apache2.4` ou `net stop Apache2.4` |
| PM2 app (não identificado) | 8080 | Microsserviço | `pm2 list` → identificar por porta |
| Docker | 8080 | Container mapping | `docker ps` → `docker stop <id>` |
| VMware | 8080 | Management UI | `Restart-Service vmware` (cuidado!) |
| Teste/desenvolvimento anterior | 8080 | Janela aberta | Fechar terminal/VSCode |

---

## 🚀 Próximos Passos

1. **Executar diagnóstico** com comando acima
2. **Identificar proprietário** (nome do processo)
3. **Documentar aqui** o resultado
4. **Decidir:** parar ou deixar rodando?
5. **Registrar** decisão final

---

## ✅ Ação Tomada

```
DATA:
ACAO:
RESULTADO:
NOVO_STATUS:
```

---

**Criado:** 2026-10-19  
**Próxima revisão:** Após diagnóstico
