# Instalação do `multizap-autopull` na VPS

Esse script roda **na VPS**, não no repositório do app. Copie e cole no SSH como root.

---

## 1. Instalar o script

```bash
# Baixar do repo (após o commit deste arquivo chegar no main via multizap-gh-pull)
cp /root/Multizap-repo/scripts/vps/multizap-autopull.sh /usr/local/bin/multizap-autopull
chmod +x /usr/local/bin/multizap-autopull

# Preparar diretórios/arquivos
mkdir -p /var/lib/multizap-autopull
touch /var/log/multizap-autopull.log
chmod 640 /var/log/multizap-autopull.log
```

## 2. DRY-RUN obrigatório antes do cron

```bash
multizap-autopull --dry-run
```

Saída esperada — confira:
- `Hash local:` e `Hash remoto:` aparecem
- Se está sincronizado: "SEM mudança"
- Se há novo commit: lista de arquivos + se afeta `multizap-gateway-deploy/`

**Se a saída estiver estranha (erro de fetch, repo não encontrado, etc), PARE aqui.**

## 3. Instalar logrotate

```bash
cat > /etc/logrotate.d/multizap-autopull <<'EOF'
/var/log/multizap-autopull.log /var/log/multizap-autopull-cron.log {
    weekly
    rotate 4
    compress
    missingok
    notifempty
    copytruncate
}
EOF
```

## 4. Instalar o cron (1 minuto)

```bash
( crontab -l 2>/dev/null | grep -v multizap-autopull ; \
  echo "* * * * * /usr/local/bin/multizap-autopull >> /var/log/multizap-autopull-cron.log 2>&1" \
) | crontab -

crontab -l | grep multizap-autopull
```

## 5. Validar funcionamento

```bash
# Estado atual
cat /var/lib/multizap-autopull/state.json

# Log em tempo real
tail -f /var/log/multizap-autopull.log

# Processo PM2 alvo
pm2 status MultiZap-Gateway

# Healthcheck manual
curl -i http://127.0.0.1:3100/health
```

## 6. Teste end-to-end

1. Fazer commit trivial em `multizap-gateway-deploy/` (ex: comentário)
2. Aguardar até 1 min
3. Conferir `state.json` — `last_hash` deve ser o novo, `health_ok: true`, `rolled_back: false`
4. `pm2 status MultiZap-Gateway` — uptime deve ter reiniciado

## 7. Teste de rollback (opcional, em janela controlada)

1. Fazer commit que quebra `/health` propositalmente
2. Aguardar até 1 min
3. Conferir log: deve mostrar "ROLLBACK OK"
4. `state.json` deve ter `rolled_back: true` e `last_hash` = hash anterior (não o ruim)
5. Reverter o commit ruim no GitHub

---

## Desinstalar (se precisar)

```bash
crontab -l | grep -v multizap-autopull | crontab -
rm /usr/local/bin/multizap-autopull
rm -rf /var/lib/multizap-autopull
rm /etc/logrotate.d/multizap-autopull
```

---

## Regras travadas no script (não mexer sem aprovação)

- Processo PM2: `MultiZap-Gateway` (apenas esse)
- Repo: `/root/Multizap-repo`
- Deploy script: `/usr/local/bin/multizap-gh-pull`
- Healthcheck: `http://127.0.0.1:3100/health`
- Watch path: `multizap-gateway-deploy/`
- **Nunca toca**: `/root/whatsapp-server`, porta 3000, webhook 9001, Recargas, PIX, Meta Cloud, WuzAPI separado
