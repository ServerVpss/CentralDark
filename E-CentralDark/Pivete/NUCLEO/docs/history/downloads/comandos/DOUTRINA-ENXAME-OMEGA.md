# 🌪️ Doutrina Enxame Ômega — CentralDark
> Selada por Pivete · aceita grafias: enxame ômega, Enxame Omega, ENXAME OMEGA

## Princípio
Nenhuma IA sozinha acerta tudo. 20 discutindo convergem no ouro.

## Protocolo 3 rodadas
1. **Diagnóstico paralelo** — N modelos respondem crus (diversidade máxima)
2. **Debate cruzado** — cada modelo lê os outros e critica (refino adversarial)
3. **Juiz consolidador** — modelo forte (Claude Opus / GPT-5) fecha veredito único

## Regras
- Sempre PT-BR
- Sempre paralelo (`xargs -P` ou `&+wait`)
- Sempre salvar bruto (`/tmp/enxame-<ts>/`)
- Juiz nunca é da mesma família dos debatedores dominantes
- Se >30% dos modelos falharem, aborta e mostra parciais

## Quando usar
- Problema com múltiplas soluções válidas (arquitetura, refactor)
- Diagnóstico onde IA única costuma alucinar (perf, security)
- Decisão estratégica com trade-offs pesados
