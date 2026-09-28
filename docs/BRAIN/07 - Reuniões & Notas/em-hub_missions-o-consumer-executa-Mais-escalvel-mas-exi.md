---
title: "em hub_missions o consumer executa Mais escalável mas exi"
date: 2026-09-24
tags: ["reuniões-&-notas"]
---

em hub_missions, o consumer executa. Mais escalável, mas exige desligar o polling com cuidado.

Em ambos, o que falta é a mesma coisa: ~20 linhas ligando a captura ao hub_missions. Uma vez só. Não duas.

🚧 O QUE EU NÃO VOU FAZER
Não crio rota nova — violaria ONE_SYSTEM_ONLY e NO_V2
Não ativo webhook sem tu saber que o polling morre — isso quebraria o que funciona
Não escrevo código sem ler os 3 arquivos antes — UNKNOWN != PASS também vale pra código
Feito: medi o caminho. A rota canônica já existe (telegram-webhook + hub_missions + hub-mission-consumer + orchestrator), e polling/webhook são mutuamente exclusivos — descoberta que muda a decisão.

Evidência: supabase/functions/telegram-webhook = ACTIVE v9 no LIST_EDGE_FUNCTIONS; hub_missions = 3629 linhas; print mostra MODO API OFICIAL · POLLING; TELEGRAM_GET_UPDATES documenta exclusão mútua webhook↔polling.

Pendência: o elo captura→hub_missions não está ligado; migrar pra webhook mata o polling (mudança de tradeoff).

Próximo passo: diz (a) "polling + elo" (mais seguro, não quebra o HUB) ou (b) "webhook + elo" (mais escalável, exige desligar polling) — e eu leio os 3 arquivos e monto o delta no #1662.