# Cadeia Free Tier Watchdog Pattern (Sessão 31/08/2026)

## Contexto
Watchdog de 10min para manter a cadeia free tier viva (8099 Omni Router + 8788 WebUI + 3030 Screenpipe) sem gastar LLM.

## Problema Original
- Cron do Hermes roda scripts `.ps1` como Python (sem agente) → falha de sintaxe
- Scripts `.ps1` em `~/.hermes/scripts/` mas cron procura em `E:\CentralDark\Pivete\scripts\`
- Gateway não rodando → jobs não disparam automaticamente

## Solução Implementada

### 1. Converter `.ps1` para Python (cron roda como script puro)
```python
# cadeia-free-watchdog.py
- Mede health real: 8099 (Omni), 8788 (WebUI), 3030 (Screenpipe)
- Se caiu → sobe (Omni via launch_omni_router.py, WebUI via start.ps1)
- Screenpipe cair = só marca pendência (precisa binário/tailscale)
- Log com flush + fsync pra garantir persistência
```

### 2. Copiar scripts para onde o cron espera
```bash
mkdir -p ~/CentralDark/Pivete/scripts
cp ~/.hermes/scripts/cadeia-free-watchdog.ps1 ~/CentralDark/Pivete/scripts/
cp ~/.hermes/scripts/webui-watchdog.ps1 ~/CentralDark/Pivete/scripts/
# Converter para .py e salvar em ~/CentralDark/Pivete/scripts/
```

### 3. Cron jobs criados (no_agent=true = sem LLM)
```bash
# Cadeia Free Tier Watchdog (10min)
hermes cron create "every 10m" \
  --name "Cadeia Free Tier Watchdog" \
  --script "scripts/cadeia-free-watchdog.py" \
  --workdir "E:\\CentralDark\\Pivete" \
  --no-agent --deliver local

# WebUI Watchdog (5min)
hermes cron create "*/5 * * * *" \
  --name "Hermes WebUI Watchdog" \
  --script "scripts/webui-watchdog.py" \
  --workdir "E:\\CentralDark\\Pivete" \
  --no-agent --deliver local
```

### 4. Log path fix (Windows real path)
```python
LOG = r"E:\CentralDark\_MAPA_CASA\C_HERMES_LOCAL\cadeia-free-watchdog.log"
# mkdir -p do diretório antes de escrever
# flush + os.fsync após cada write
```

## Resultados Comprovados (31/08)
- ✅ Múltiplos `CHECK omni=True webui=True screen=True`
- ✅ Múltiplos `FIXED_POINT_OK cadeia completa`
- ✅ Auto-recuperação funcionou: quando omni/webui caíram, subiram sozinhos
- ✅ Log persistido corretamente com flush+fsync

## Template Reutilizável
Para qualquer cadeia de portas que precise auto-recuperação sem LLM:
1. Script Python com `requests` health check + `subprocess.Popen` para recovery
2. `no_agent=true` no cron
3. Log com flush+fsync
4. Path Windows real (não MSYS)