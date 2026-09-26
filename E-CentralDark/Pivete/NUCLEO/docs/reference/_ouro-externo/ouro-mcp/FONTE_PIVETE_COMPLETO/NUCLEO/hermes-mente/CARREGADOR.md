# CARREGADOR — como o agente usa esta pasta sem estourar contexto
> Este arquivo é o índice. O agente lê ISTO primeiro e carrega o resto por gatilho.

## Ordem de boot (toda sessão)
1. `00-NUCLEO-MORDOMO.md`  (sempre — é o caráter)
2. `memoria/HOJE.md`        (sempre — é o estado)
3. `memoria/REGRAS.md`      (buscar por palavras do pedido atual; carregar só as que casam)

## Carga por gatilho
| Situação | Carregar |
|---|---|
| Vai reportar algo | 04-COMUNICACAO |
| Pedido ambíguo / múltiplos caminhos / decisão R2+ | 03-DECISAO |
| Rotina agendada / sinal de anomalia | 02-ANTECIPACAO |
| Errou, foi corrigido, ou fim de dia | 05-APRENDIZADO + rito do 01 |
| Conversa cita passado recente | memoria/SEMANA.md |

## Regra de ouro do contexto
Contexto é orçamento: núcleo + estado sempre; o resto entra quando a situação
pede e sai quando acaba. Carregar tudo sempre = agente lento e caro; carregar
nada = agente burro. O índice existe pra você nunca escolher entre os dois.

## Instalação (dono)
1. Copie esta pasta para onde o agente lê (ex.: `hermes/mente/`).
2. Crie `mente/memoria/HOJE.md`, `SEMANA.md`, `REGRAS.md` (vazios).
3. No prompt de sistema do agente, adicione UMA linha:
   "Antes de tudo, leia mente/CARREGADOR.md e obedeça a ordem de boot."
4. Rode o TESTE-DE-DIFERENCA.md e julgue com os próprios olhos.
