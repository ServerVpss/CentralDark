# OUTRO - ressuscitar-pm2.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\agents\Auto-Diagnostico\skills\ressuscitar-pm2.md
**SHA:** d37c88fbe6117191
**Timestamp:** 2026-08-28T02:56:26.307993
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- **Referência do método:** ver PLAYBOOK-RESSUSCITACAO-PM2.md.

### Ouro Bruto (primeiros 5000 chars)
```
# Skill: ressuscitar-pm2

**Quando acionar:** Log-Verificador detectar >= 3 processos PM2 offline/errored simultâneos, OU `dump.pm2` com contagem menor que a esperada (mínimo 12 daemons oficiais).

**Ação:**
1. NÃO rodar `pm2 save` sob nenhuma hipótese antes de diagnosticar.
2. Executar `/root/CentralDark/scripts/socorro-pm2.sh` (não-destrutivo: só sobe o que falta).
3. Aguardar exit code. Se 0 = sucesso, Card Hermes v1.3 verde. Se > 0 = falhas, Card vermelho com lista + link do registro em `docs/CONSCIENCIA/APRENDIZADOS/`.
4. Consultar `docs/CONSCIENCIA/HERMES/PLAYBOOK-RESSUSCITACAO-PM2.md` antes de qualquer fix manual adicional.

**Não tocar:** `apps/bot-telegram/` (bot vivo), whatsapp-server (stopped by design).

**Referência do método:** ver PLAYBOOK-RESSUSCITACAO-PM2.md.

```