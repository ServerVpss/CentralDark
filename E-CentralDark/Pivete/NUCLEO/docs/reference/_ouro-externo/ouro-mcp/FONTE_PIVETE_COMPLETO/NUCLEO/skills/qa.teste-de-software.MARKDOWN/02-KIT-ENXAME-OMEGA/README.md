# 🌪️ Kit Enxame Ômega — Multi-Agent Debate Pratico

Nome técnico acadêmico: **Multi-Agent Debate with Judge Aggregator** (Microsoft/Google Research 2023-2024).
Nome Pivete: **Enxame Ômega**.

## Ideia central
N modelos → resposta paralela → debate cruzado → juiz consolida → 1 veredito.

## Scripts (do mais leve pro mais brutal)

| Script | Modelos | Rodadas | Tempo | Uso |
|---|---|---|---|---|
| `enxame-econo-5.sh` | 5 | 1 | ~30s | teste rápido |
| `enxame-padrao-10.sh` | 10 | 1 + juiz | ~60s | debug médio |
| `enxame-titanico-20.sh` | 20 | 2 + juiz | ~3min | problema difícil |
| `hypernova-50.sh` | 20 base + 20 debate + 10 juízes setoriais + 1 final | 4 fases | ~5min | apocalipse |

## Requisitos
- `curl`, `jq`, `xargs` (Linux padrão)
- `CENTRALDARK_API_KEY` em `/etc/centraldark/darkai.env` ou `/root/CentralDark/.env`
- Gateway ativo: `https://api.centralldark.com/v1/chat/completions`

## Como usar
```bash
bash enxame-padrao-10.sh "meu problema aqui"
less /tmp/enxame-*/final/VEREDITO.md
```
