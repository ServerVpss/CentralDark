# PIVETE-02 · ÍNDICE MESTRE

Mapa completo dos 16 arquivos. Leia nesta ordem quando invocar o pivete.

| # | Arquivo | O que tem | Quando ler |
|---|---------|-----------|------------|
| 00 | `PIVETE-00-INVOCACAO.md` | Como acordar, palavras-chave | Sempre primeiro |
| 01 | `PIVETE-01-IDENTIDADE.md` | Quem sou, tom, autoridades, palavras-mágicas | Sempre |
| 02 | `PIVETE-02-INDICE-MESTRE.md` | Este arquivo | Sempre |
| 03 | `PIVETE-03-REGRAS-VIVAS.md` | Memórias `mem://`, workspace, project, security | Antes de qualquer ação |
| 04 | `PIVETE-04-HISTORICO-JANELA.md` | Timeline turno a turno da janela Lovable | Pra contexto histórico |
| 05 | `PIVETE-05-DECISOES.md` | Decisões do Pivete com contexto e data | Pra saber "por que fizemos assim" |
| 06 | `PIVETE-06-ARQUIVOS-TOCADOS.md` | Catálogo path por path do que foi criado/editado | Antes de mexer em arquivo dessa lista |
| 07 | `PIVETE-07-HERMES-CADEIA.md` | Agente autônomo Hermes (decisor/executor/validador) | Quando falar de Hermes |
| 08 | `PIVETE-08-MCP-LIBERACAO.md` | O que foi destrancado no MCP e por quê | Antes de propor bloqueio novo |
| 09 | `PIVETE-09-AUDITORIA-SISTEMA.md` | audit.js, rotas do gateway, aba do painel | Quando falar de logs/auditoria |
| 10 | `PIVETE-10-INFRA-VPS.md` | PM2, portas, caminhos, subdomínios | Antes de deploy/restart |
| 11 | `PIVETE-11-APRENDIZADOS.md` | Aprendizados #280, #281, #282 e demais | Pra herdar experiência |
| 12 | `PIVETE-12-BASE-MILITAR-ABERTA.md` | Decisão de manter `/root/` acessível | Antes de propor trava |
| 13 | `PIVETE-13-CITACOES-LITERAIS.md` | Frases-chave do Pivete (jeito de falar) | Pra calibrar tom |
| 14 | `PIVETE-14-ESTADO-ATUAL.md` | Snapshot do "onde paramos" | Ao acordar em nova sessão |
| 15 | `PIVETE-15-CHANGELOG.md` | Toda atualização desta pasta | Consulta rápida |
| 16 | `PIVETE-16-SECRETS-CONNECTORS.md` | Nomes dos 58 secrets + 3 connectors | Antes de chamar API externa |

## Regra de tamanho
Cada arquivo ≤ 40KB. Se estourar, quebro em `-a`, `-b`, `-c`. Sem truncar.

## Regra de atualização
Novos aprendizados, decisões ou arquivos tocados = append no arquivo certo + entrada em `PIVETE-15-CHANGELOG.md`.
