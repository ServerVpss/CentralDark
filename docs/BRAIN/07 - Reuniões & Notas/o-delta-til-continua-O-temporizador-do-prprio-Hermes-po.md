---
title: "o delta útil  continua
O temporizador do próprio Hermes po"
date: 2026-09-24
tags: ["reuniões-&-notas"]
---

o delta útil → continua.
O temporizador do próprio Hermes pode simplesmente disparar novas rodadas. Então o motor continua sendo a interface normal do ChatGPT; o Hermes funciona como operador dessa interface.
Para isso ficar estável por horas, eu deixaria só quatro regras:
• CURSOR: cada resposta termina dizendo exatamente onde continuar.
• DELTA ONLY: não reinserir o que já existe.
• RETRIEVE FIRST: consulta a biblioteca [[CentralDark]] antes de pesquisar novamente.
• BLOQUEIO LOCAL: se uma ação exigir confirmação/permissão, marca aquele ponto e continua tudo que for independente — não mata o loop inteiro.
Fica assim:
Hermes → biblioteca interna → faltou informação? → ChatGPT → resposta refinada → Hermes → valida/aplica → biblioteca recebe delta → próximo ciclo.
E sim: se dentro dessa janela você consegue selecionar o modelo disponível na interface, o Hermes pode trabalhar com o modelo selecionado ali. É mais lento que integração direta, mas para pesquisa contínua, síntese, revisão e geração de comandos, o desenho faz sentido.
O ponto importante é só não confundir:
NAVEGADOR AUTOMATIZADO = interface operada pelo Hermes
API = integração direta de máquina para modelo
No desenho que você está descrevendo, é a primeira opção.