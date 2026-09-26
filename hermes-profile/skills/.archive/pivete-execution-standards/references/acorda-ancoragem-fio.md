# #ACORDA + ancoragem de fio (Casa pivete)

## Separação de protocolos
| Prefixo | Função |
|---|---|
| `!CALIBRAR` | Protocolo oficial: parar novas ações e depositar checkpoint |
| `!RELOAD` | Protocolo oficial: reler fontes e retomar read-only |
| `#ACORDA` / `#ACORDAR` | **Local** Hermes profile pivete: LEMBRAR→DESCONFIAR→RECALIBRAR→âncora→continuar dali |

Fonte SOUL: `profiles/pivete/SOUL.md` §34.  
RUNTIME_MODE observado: `SOUL_BEHAVIORAL_TRIGGER` (hook de prefixo UNAVAILABLE). Sessão nova para carregar SOUL.

## Onde depositar o fio (canônico 3T)
```
E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\HOJE.md
E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\CARTAO-MESTRE.md
```
Mínimo no depósito:
- MISSÃO_FECHADA + VEREDITO
- PRÓXIMA_MISSÃO + STATUS=DEPOSITADA_NÃO_INICIADA (se houver)
- ressalvas que não podem sumir
- paths de evidência
- travas (o que NÃO fazer sem ordem)

## Falha real (04/08/2026)
`#ACORDA` em sessão nova: PASS em reconhecer/medir/bloquear R2+.  
PARCIAL: ancorou em checkpoint geral de disco 04/08 em vez do fio  
`ATUALIZAR_E_SINCRONIZAR_METALUPA_LOCAL`.  
Causa: recibo de !CALIBRAR ficou na tela; fio não estava em HOJE/CARD legível no boot.

## Goal (não misturar)
- `/goal` slash: chat CLI, Desktop, gateway/Telegram
- `hermes goal`: **ausente** neste install
- `hermes kanban create --goal`: goal loop **do cartão** apenas

## Kanban / OpenRouter (contexto Casa)
- DB: `%LOCALAPPDATA%\hermes\kanban.db` — CLI e `9119/kanban?profile=pivete` = mesma lousa
- Dispatcher gateway pode claimar card `ready` em paralelo com claim CLI
- OpenRouter no pivete: chave no `profiles/pivete/.env`; `model.provider` pivete costuma ser `nous`+Grok

## Ao fechar missão local
1. Atualizar HOJE + CARD com FIO_ATUAL  
2. Não iniciar próxima missão só porque depositou  
3. Provar com `#ACORDA` em sessão nova se o fio veio certo  
