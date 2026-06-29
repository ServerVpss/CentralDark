---
title: "GUARDIAO DA CONSCIENCIA"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 🛡️ Guardião da Consciência

> Agente de integridade e vigilância da pasta `docs/CONSCIENCIA/`.
> Criado em 25/06/2026. Modo inicial: `propor` (travado até **08/07/2026**).

---

## O que faz

Vigia em tempo real toda a árvore de `docs/CONSCIENCIA/` e, quando detecta
um arquivo `.md` fora da pasta certa, **propõe** o local correto via:

1. **Telegram** — mensagem no canal de status
2. **Mega Painel** — evento e heartbeat de status
3. **Logs estruturados** — `infra/guardiao/logs/guardiao.log`

Nesta versão **não move nada**. Só propõe.

---

## Localização

```
/root/CentralDark/infra/guardiao/
├── guardiao.py              # daemon principal
├── classificador.py         # regras de pontuação
├── notifier.py              # Telegram (edge function notify-telegram)
├── heartbeat.py             # Mega Painel via MCP CentralDark
├── guardiao_rules.yaml      # regras editáveis
├── requirements.txt
├── ecosystem.config.js      # PM2
├── run.sh                   # instalação
├── logs/                    # logs com rotação
└── tests/
    └── test_classificador.py
```

---

## Como funciona por dentro

### 3 threads de background

| Thread | Função | Frequência |
|---|---|---|
| `debounce` | Avalia eventos do inotify após 200ms de silêncio | contínuo |
| `reconciliacao` | Scan completo da árvore (pega o que inotify perdeu) | a cada 5 min |
| `heartbeat` | Pulso pro Mega Painel | a cada 60s |

### Classificação

Cada arquivo `.md` recebe uma pontuação por pasta candidata:
- `nome_regex` casa → +2 pontos
- `palavras_chave` no nome → +1 ponto cada

Confiança = `min(pontos / 5, 1.0)`. Abaixo de **0.4**, descarta silenciosamente.
Se já está na pasta certa, ignora.

### Trava de segurança do modo `auto`

```python
DATA_LIBERACAO_AUTO = datetime(2026, 7, 8, tzinfo=timezone.utc)
```

Mesmo se alguém setar `GUARDIAO_MODO=auto` no ambiente, o código força
`propor` e loga `WARNING`. A lógica de mover arquivos **não existe**
nesta versão — precisa ser implementada e revisada antes de liberar.

---

## Sistema de logs

`logging.RotatingFileHandler` — 10MB × 5 arquivos = 50MB máximo.
Formato: `[timestamp] [nível] [módulo] mensagem`.

Eventos registrados:
- `INFO` — boot, propostas, telegram OK, painel atualizado, reconciliação
- `DEBUG` — cada arquivo avaliado
- `WARNING` — modo auto bloqueado, falhas de POST com retry
- `ERROR` — falhas finais (telegram após 3 tentativas, secrets ausentes)

---

## Comandos úteis

```bash
# Status
pm2 status guardiao-consciencia

# Logs ao vivo
pm2 logs guardiao-consciencia
tail -f /root/CentralDark/infra/guardiao/logs/guardiao.log

# Reiniciar (recarrega regras do YAML)
pm2 restart guardiao-consciencia

# Rodar só os testes
cd /root/CentralDark/infra/guardiao
source .venv/bin/activate
pytest tests/ -v
```

---

## Como editar regras

Mexe no `guardiao_rules.yaml` e reinicia:

```yaml
pastas:
  docs/CONSCIENCIA/MINHA-PASTA-NOVA:
    nome_regex: ["padrao1", "padrao2"]
    palavras_chave: ["palavra1", "palavra2"]
```

```bash
pm2 restart guardiao-consciencia
```

---

## Mega Painel

Aparece como agente vivo:
- **Nome:** Guardião da Consciência
- **Emoji:** 🛡️
- **Status:** Online
- **Power:** 100
- Pulso a cada 60s atualiza `arquivos_vigiados` e `ultimo_scan`.

---

## Próximos passos

- **08/07/2026** — data **mínima** para considerar liberar o modo `auto`.
  ⚠️ **Regra de observação real**: a data no calendário sozinha não basta.
  Só liberar `auto` após acompanhar 7~10 dias úteis de propostas reais do
  Guardião, validando se a maioria faz sentido. Se as propostas estiverem
  ruins, estender o período de `propor` até calibrar as regras do YAML.
- Modo `auto` precisa ser **implementado** antes (não existe no código hoje).
- Adicionar análise de conteúdo (não só nome) se as regras de nome
  começarem a errar muito.
- Estender vigilância para outras pastas além de `CONSCIENCIA/`.
