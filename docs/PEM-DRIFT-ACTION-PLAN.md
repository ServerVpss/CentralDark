# PEM-DRIFT-ACTION-PLAN

**Derivado de:** `docs/PEM-DRIFT-ROOTCAUSE.md`  
**Data:** 2026-09-01  
**Owner:** Agent PEM-DRIFT-INVESTIGATION  

---

## FASE 1: RESTAURAÇÃO IMEDIATA (HOJE)

### 1.1 Executar auditoria completa de launch scripts
```bash
bash scripts/pem-drift/audit-pem-launch.sh > /tmp/pem-launch-audit-$(date +%Y%m%d).txt 2>&1
```
Revisar saída para identificar TODOS os mecanismos de reinicialização automática.

### 1.2 Verificar drift de configuração do Calisto
```bash
bash scripts/pem-drift/check-calisto-drift.sh
```
Se drift detectado:
- restaurar state.json de backup mais recente, OU
- re-sincronizar com fonte confiável

### 1.3 Restaurar capacidade de reinicialização via rede
```bash
bash scripts/pem-drift/restore-pem-network-reboot.sh
bash scripts/pem-drift/pem-network-reboot.sh
```
Validar que serviços estão online após reboot.

---

## FASE 2: PREVENÇÃO (SEMANAL)

### 2.1 Cron job de verificação de drift
Adicionar ao crontab do usuário:
```
0 6 * * * /caminho/para/scripts/pem-drift/check-calisto-drift.sh --save-baseline
```
Este job roda diariamente às 6h, salva baseline se não existir, detecta drift.

### 2.2 Monitoramento de integridade
Adicionar ao checker diário:
```bash
# Em scripts/checker/ ou scripts/run-once/
bash scripts/pem-drift/check-calisto-drift.sh
if [ $? -ne 0 ]; then
    echo "ALERTA: Drift de Calisto detectado" | tee -a /var/log/centraldark-alerts.log
    # Acionar notificação (telegram, email, etc.)
fi
```

### 2.3 Versionamento do state.json
Criar snapshot diário de ~/.calisto/state.json:
```bash
#!/usr/bin/env bash
# scripts/pem-drift/snapshot-calisto-state.sh
BACKUP_DIR="${HOME}/.calisto-backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp ~/.calisto/state.json "${BACKUP_DIR}/state-${TIMESTAMP}.json"
# Manter apenas últimos 7 dias
find "$BACKUP_DIR" -name 'state-*.json' -mtime +7 -delete
```

---

## FASE 3: RESILIÊNCIA (MENSAL)

### 3.1 Circuit breaker para reinicialização automática
Implementar lógica de circuit breaker nos scripts de recuperação:
- Se restart falha 3 vezes em sequência → parar de tentar
- Acionar alerta humano
- Resetar circuito apenas após verificação manual de que causa foi corrigida

### 3.2 Healthcheck ativo
Criar healthcheck que valida não apenas se serviço está "online" no PM2, mas se:
- state.json é JSON válido
- Credenciais de rede são acessíveis
- Serviço responde a heartbeat requests

### 3.3 Runbook de recuperação manual
Documentar procedimento passo-a-passo para restauração manual quando automático falha:
1. Identificar serviço afetado
2. Verificar estado de credenciais
3. Verificar drift de configuração
4. Restaurar configuração se necessário
5. Reiniciar serviço
6. Validar recuperação

---

## FASE 4: GOVERNANÇA

### 4.1 Auditoria mensal de scripts de inicialização
```bash
bash scripts/pem-drift/audit-pem-launch.sh
```
Revisar todos os mecanismos de reinicialização e confirmar que:
- Não há scripts órfãos
- Scripts têm acesso adequado a credenciais
- Não há loops de reinicialização

### 4.2 Separação de escopos
Garantir que scripts de recuperação tenham acesso ONLY às credenciais que precisam, seguindo princípio do menor privilégio.

### 4.3 Registro de mudanças
Todo acesso a ~/.calisto/ deve ser logado:
- Quem acessou
- Quando
- O que modificou
- Por quê

---

## RESPONSABILIDADES

| Ação | Responsável | Prazo |
|------|-------------|-------|
| Executar fase 1 (restauração) | Agent de operação | Imediato |
| Configurar cron de verificação | Administrador sistema | 7 dias |
| Implementar healthcheck ativo | Desenvolvedor | 30 dias |
| Escrever runbook de recuperação | Documentador | 30 dias |
| Auditoria mensal | Agent de forense | Mensal |

---

**Última atualização:** 2026-09-01  
**Próxima revisão:** 2026-10-01
