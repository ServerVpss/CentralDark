# CARREGADOR — como o agente usa esta pasta sem estourar contexto
> Este arquivo é o índice. O agente lê ISTO primeiro e carrega o resto por gatilho.
> **Fusão canônica (19/07/2026):** movido de `hermes-mente/CARREGADOR.md`
> para cá — caminhos abaixo atualizados pra árvore real do `motor/`.
> `HERMES-REGRAS-DE-OURO.md` continua em
> `E:\CentralDark\Pivete\NUCLEO\hermes-mente\HERMES-REGRAS-DE-OURO.md`
> (não movido, decisão explícita do Pivete) e vence qualquer conflito com
> este arquivo.

## Ordem de boot (toda sessão)
1. `HERMES-REGRAS-DE-OURO.md` (hermes-mente/, sempre — imutável, vence tudo)
2. `NUCLEO-MORDOMO.md`  (sempre — é o caráter)
3. `../03-memoria/memoria/HOJE.md`        (sempre — é o estado)
4. `../03-memoria/memoria/REGRAS.md`      (buscar por palavras do pedido atual; carregar só as que casam)

## Carga por gatilho
| Situação | Carregar |
|---|---|
| Vai reportar algo | `04-COMUNICACAO.md` (aqui mesmo, 01-identidade) |
| Pedido ambíguo / múltiplos caminhos / decisão R2+ | `../02-cerebro/03-DECISAO.md` |
| Rotina agendada / sinal de anomalia | `../02-cerebro/02-ANTECIPACAO.md` |
| Errou, foi corrigido, ou fim de dia | `../02-cerebro/05-APRENDIZADO.md` + rito do `01-MEMORIA-VIVA` em `../03-memoria/MEMORIA.md` |
| Conversa cita passado recente | `../03-memoria/memoria/SEMANA.md` |

## Regra de ouro do contexto
Contexto é orçamento: núcleo + estado sempre; o resto entra quando a situação
pede e sai quando acaba. Carregar tudo sempre = agente lento e caro; carregar
nada = agente burro. O índice existe pra você nunca escolher entre os dois.

## Instalação (dono) — já aplicada em 19/07/2026

~~1. Copie esta pasta para onde o agente lê~~ → feito: o núcleo já está
condensado em `SOUL.md` real
(`C:\Users\danda\AppData\Local\hermes\profiles\pivete\SOUL.md`), que
carrega todo turno e referencia os arquivos completos por gatilho (ver
`motor/10-observabilidade/REVISAO-TECNICA-DA-LUPA.md` §46).
2. `../03-memoria/memoria/HOJE.md`, `SEMANA.md`, `REGRAS.md` existem
   (vazios/template — ver `03-memoria/MEMORIA.md`).
3. `SOUL.md` já tem a linha de ativação (seção "KIT COGNITIVO
   HERMES-MENTE").
4. `TESTE-DE-DIFERENCA.md` (agora em `../10-observabilidade/`) — sonda #1
   já rodada com prova real, ver §46. Faltam 9/10.
