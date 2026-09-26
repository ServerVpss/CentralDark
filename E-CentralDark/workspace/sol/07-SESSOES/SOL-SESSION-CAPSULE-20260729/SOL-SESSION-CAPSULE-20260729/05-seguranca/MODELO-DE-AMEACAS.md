# Modelo de ameaças da cooperação

| Ameaça | Falha possível | Controle |
|---|---|---|
| perda de contexto | missão muda sem perceber | cápsula + NONCE + próximo gate |
| balão transportado | autoria confundida | `HERMES_TO` / `SOL_TO` |
| resposta cortada | conclusão incompleta | scroll com sobreposição + action bar |
| falso verde | aprovação sem contrato | contraexemplo + mutação + oráculo distinto |
| instrumento quebrado | culpa atribuída ao alvo | fase pré-execução + segundo canal |
| dois escritores | corrida e corrupção | single-writer invariant |
| busca sem limite | timeout e invasão de escopo | limite, profundidade e monotonic timeout |
| nome reservado | API interpreta dispositivo | reutilizar objeto enumerado; não recompor |
| script inline | quoting/tokenização muda código | arquivo visível + parser antes de executar |
| credencial exposta | perda de segurança | existência sem conteúdo; sanitização |
| aba errada | mensagem em conversa indevida | HWND/URL/marcador/NONCE |
| perfil dividido | estado incoerente | profile boundary e consumidores antes de link |
| limpeza prematura | rollback perdido | DEPRECATED preservado até autorização |
| métrica teatral | otimização falsa | baseline comparável e amostra declarada |

## Regra de severidade

Bloqueios de autorização, segredo, destruição, alvo e escritor único têm
precedência sobre velocidade, probabilidade ou conveniência.

