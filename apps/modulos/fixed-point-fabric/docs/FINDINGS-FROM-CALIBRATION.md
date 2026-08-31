# Calibração — realidade observada

As imagens e o vídeo fornecidos mostram um Fable Loop real, múltiplos agentes, cron jobs, Casa, VPS,
Screenpipe e checkpoints. Também mostram a contraprova que define este pacote:

- houve uma declaração `FIXED_POINT ALCANÇADO` enquanto `SCREENPIPE_STATUS` estava bloqueado;
- uma rodada posterior registrou `REALITY CONTRADICTION`: serviços antes considerados vivos caíram;
- existiam rotas e portas diferentes (`8788`, `8099`, `9119`, `3030`) sem um receipt comum;
- o Screenpipe preserva texto e imagem, mas uma captura isolada não prova o estado global.

Conclusão: o sistema precisa de um ledger comum e de pelo menos duas amostras materialmente iguais,
separadas no tempo. Screenpipe é testemunha; GitHub `main` é a fonte canônica; o runtime Casa/VPS é a
realidade operacional; o Fixed Point Fabric apenas reconcilia e prova.

