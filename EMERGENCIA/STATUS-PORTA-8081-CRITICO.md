# 🔴 ALERTA CRÍTICO — Porta 8081 Desligada

## ⚠️ Status Atual

```
Timestamp: 2026-10-19 16:35 UTC
Serviço: sala-controle (porta 8081)
Estado: ❌ DOWN / RECUSANDO CONEXÃO
Causa: DESCONHECIDA (investigação necessária)
Gravidade: 🔴 CRÍTICA
```

---

## 🔍 Diagnóstico

### Teste 1: Conectividade TCP

```bash
curl -v http://100.123.93.25:8081/health
```

**Resultado:** ❌ Connection refused (Port 8081)

### Teste 2: Verificação de Porta Listening

```bash
lsof -i :8081
```

**Resultado:** ❌ Nenhum processo listening em 8081

### Teste 3: SSH para VPS

```bash
ssh root@100.123.93.25 "pm2 list"
```

**Resultado:** ❌ Connection refused (Port 22 SSH também desligado)

### Teste 4: Tailscale Status

```bash
Tailscale IP: 100.123.93.25
Conectividade: ❌ Sem resposta
```

**Resultado:** ❌ VPS não respondendo via Tailscale

---

## 🚨 Possíveis Causas

1. **Serviço PM2 não está rodando**
   - O processo Node.js de sala-controle morreu
   - PM2 não reiniciou automaticamente
   - PM2 daemon está down

2. **VPS Offline**
   - Máquina desligada ou travada
   - Kernel panic
   - Problema de rede de infraestrutura

3. **Firewall Bloqueando**
   - Iptables/ufw bloqueando porta 8081
   - Configuração de rede alterada

4. **Permissões/Credenciais**
   - SSH key expirou
   - Tailscale revogado

---

## 🔧 Ações Imediatas

### Opção 1: SSH Manual (se conseguir)

```bash
ssh -i ~/.ssh/id_rsa root@100.123.93.25

# Dentro da VPS:
cd /root/CentralDark
pm2 list
pm2 start sala-controle --port 8081
```

### Opção 2: Executar Script de Recuperação

```bash
# Na Casa (Windows):
bash K:\EMERGENCIA\LIGAR-PORTA-8081.sh

# Ou copiar para VPS e executar lá:
scp K:\EMERGENCIA\LIGAR-PORTA-8081.sh root@100.123.93.25:/tmp/
ssh root@100.123.93.25 "bash /tmp/LIGAR-PORTA-8081.sh"
```

### Opção 3: Painel de Controle VPS

Se SSH também está down:
1. Acessar painel da VPS (Linode/DigitalOcean/AWS)
2. Conectar via console remoto
3. Executar: `pm2 restart sala-controle` ou `pm2 start sala-controle --port 8081`

### Opção 4: Restart Completo da VPS

```bash
# Se nada funcionar, reiniciar máquina (última opção)
# Via painel: Request Reboot
# Depois de reboot:
pm2 start all
```

---

## 📋 Checklist de Recuperação

- [ ] **Verificar VPS está online** (ping 100.123.93.25)
- [ ] **SSH conectando** (ssh root@100.123.93.25)
- [ ] **PM2 daemon running** (pm2 status)
- [ ] **Processo sala-controle existe** (pm2 list | grep sala)
- [ ] **Porta 8081 listening** (lsof -i :8081)
- [ ] **Curl health check** (curl http://100.123.93.25:8081/health)
- [ ] **Sala-controle respondendo** (curl http://100.123.93.25:8081/sala-controle)
- [ ] **Registrar prova no log** (documentar timestamp + ação tomada)

---

## 📊 Histórico de Status

```
2026-10-19 16:30 UTC → ✅ Sala-controle ONLINE (prova reboot)
2026-10-19 16:35 UTC → 🔴 Sala-controle DOWN (porta 8081 recusando)
2026-10-19 16:XX UTC → ⏳ AÇÃO TOMADA (executar script acima)
2026-10-19 16:YY UTC → ⏳ VERIFICAÇÃO (curl health check)
```

---

## 📞 Próximas Ações

1. **Imediato:** Executar script ou SSH manual
2. **Validação:** Curl health check
3. **Documentação:** Registrar causa + tempo de recuperação
4. **Prevenção:** Configurar alertas de downtime (Prometheus/UptimeRobot)

---

## 🔗 Documentos Relacionados

- `K:\EMERGENCIA\LIGAR-PORTA-8081.sh` (script de recuperação)
- `K:\docs\PROVAS\PROVA-REINICIALIZACAO-WINDOWS-20261019.md` (prova pré-downtime)
- `K:\docs\ARQUITETURA\INFRA-MONITORAMENTO.md` (monitoramento)

---

## ✅ Sinais de Sucesso

```
✅ Port 8081 listening
✅ HTTP 200 em /health
✅ Sala-controle renderiza
✅ Prova registrada em área de noticias
✅ Timestamp de recuperação documentado
```

