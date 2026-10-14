# Arsenal Proxy (porta 8083)

6 superpoderes rodando em cima do proxy Elite existente (porta 8082).

| # | Módulo | Endpoint |
|---|---|---|
| 1 | Neural Router | `POST /arsenal/neural` |
| 2 | Auto-Healing Swarm | `POST /arsenal/swarm` |
| 3 | Chain Reaction 4 IAs | `POST /arsenal/chain` |
| 4 | Dark Intel | `GET /arsenal/intel` |
| 5 | Synthetic Data Forge | `POST /arsenal/synthetic` |
| 6 | Self-Evolution Engine | `POST /arsenal/evolve` · `GET /arsenal/stats` |

Painel: `https://status.centralldark.com/arsenal.html` (Basic Auth).

## 🪬 Self-Evolution — pontuação conservadora, XP com prova

O `self_evolve.py` existente calcula **saúde observada do transporte**, sem dizer que HTTP 200 prova qualidade de raciocínio. O endpoint `/arsenal/evolve` preserva o formato de ranking usado pelo `main.py`, acrescentando sinais de contraprova:

- Janela das últimas **10.000** linhas lidas de forma limitada em memória; entradas inválidas são descartadas.
- Um modelo só entra na classificação confiável com **10 observações válidas** e cobertura de latência de **80%** ou mais.
- Pontuação: limite inferior de Wilson da taxa de sucesso combinado com a latência p90; uma única resposta rápida não ganha prioridade automática.
- Snapshot JSON gravado atomicamente. O arquivo de aprendizados só recebe uma nota quando a liderança com evidência muda, sem gerar linhas idênticas a cada consulta.
- **XP real é exclusivo da MetaLupa** e de seu ledger append-only; ranking, contagem de chamadas e texto de autopromoção não geram XP.

O roteador `neural_router.py` mantém escolhas por classe de tarefa. **Ainda não existe prova de qualidade por classe de prompt suficiente para promover automaticamente modelos em produção.** Ganho por reflexão (GEPA/DSPy), memória episódica (Reflexion) e evolução de workflows (EvoAgentX) só entra como feedback testado e aprovado pela MetaLupa, reutilizando os owners; não cria outro orquestrador.

**Readback técnico em 2026-10-14:** teste isolado Python verificou descarte de linha malformada, bloqueio de pontuação por amostra insuficiente/latência ausente, ganho conservador, cauda de 10.000 linhas, snapshot válido e ausência de notas duplicadas. A instalação operacional do proxy, a execução na VPS e qualquer pontuação XP acumulada permanecem dependentes de prova própria.
