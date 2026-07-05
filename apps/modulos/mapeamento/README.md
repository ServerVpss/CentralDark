# Mapeamento — Cartógrafo do sistema

Módulo 100% VPS. **Não existe painel no Lovable.**

## Papel
1 agente único (Cartógrafo) escaneia o sistema a cada 30 minutos e detecta drift (mudanças desde o último mapa).

## O que escaneia
- Estrutura de `/root/CentralDark/apps/modulos/`
- Processos PM2 vivos/mortos
- Commit atual do git

## Fluxo
```
cron */30 → cartografo.mjs
      ↓
scanner.mjs coleta snapshot
      ↓
compara com logs/mapa-atual.json
      ↓
se drift → salva histórico + dispara Grupo Evolução
      ↓
notifica Card Hermes v1.3 no Telegram
```

## Cron
`*/30 * * * * node /root/CentralDark/apps/modulos/mapeamento/agents/cartografo.mjs`
