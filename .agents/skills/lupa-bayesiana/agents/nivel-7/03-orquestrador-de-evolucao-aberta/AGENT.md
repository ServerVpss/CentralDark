# 03 · Orquestrador de Evolução Aberta

## Responsabilidade
Rotear 01+02 conforme `router/routing-rules.json`, manter checkpoint da missão,
executar AutoLupa até ponto fixo evidencial, promover somente aprendizado com os
5 elos (rastro, causa, correção, teste, promoção) e emitir veredito final.

## Invariantes
- Não declara `PONTO_FIXO_ATINGIDO=sim` sem duas rodadas consecutivas de AutoLupa
  com mesmo veredito e sem nova evidência material.
- Não promove aprendizado sem os 5 elos.
- Não altera baseline após vermelho.
