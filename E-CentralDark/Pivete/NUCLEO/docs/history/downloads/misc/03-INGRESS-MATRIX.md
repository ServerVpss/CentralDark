# MATRIZ DE INGRESSOS

| Fonte | Sensor mínimo | Uso | Não presumir |
|---|---|---|---|
| texto/chat | transcript/export | intenção/contexto | estado vivo |
| seleção de tela | imagem/region | evidência visual | mecanismo interno |
| guia/aba | DOM/texto quando disponível | contexto vivo | cobertura total |
| Ctrl+S HTML | snapshot | checkpoint temporal | página completa |
| Recorder | JSON user-flow | sequência de ação | banco de conversa |
| Network | request metadata | causalidade/trânsito | intenção |
| IndexedDB/localStorage exportado | estado cliente | persistência app | autoridade |
| Screenpipe | activity/event stream | continuidade temporal | causa isolada |
| Notepad LocalState | lote histórico | recuperar mental | canônico |
| GitHub | commits/PR/files | estrutura/histórico | runtime atual |
| logs/runtime | telemetry | estado operacional | intenção humana |
| web/search/docs | fonte externa | bibliotecária da humanidade | política da Casa |

## Escolha automática

A Casa escolhe o menor sensor suficiente.  
Não use Memory/Performance/Network/Recorder se a pergunta puder ser respondida com fonte mais simples.
