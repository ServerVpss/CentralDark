# DOCUMENTACAO CENTRALDARK - INDICE CONSULTAVEL

## O que este painel resolve

Você não precisa lembrar de cabeça o que cada nome, porta, gatilho, serviço, PR ou provider faz. O sistema mantém uma superfície única de estudo e consulta.

### Master Cycle

É o funil obrigatório que recebe os gatilhos e garante: acordar contexto -> medir realidade -> reconciliar histórico -> testar -> tentar falsificar -> julgar -> documentar -> registrar.

### `C:/CDPR1389`

É tratado como worktree/clone isolado do PR #1389 quando HEAD/branch forem comprovados. Serve para testar e corrigir o PR sem sujar a `main`. Não é uma segunda fonte de verdade.

### Porta 1420

No status visual fornecido em 2026-08-31 apareceu `1420 none`. Isso prova apenas que o listener não estava observado naquele momento. Como ainda não existe contrato encontrado dizendo se 1420 deve estar OPEN, o estado correto é:

`EXPECTED=UNKNOWN | OBSERVED=NONE | ACTION=MAP_OWNER_AND_CONTRACT`.

## Seções obrigatórias

- Gatilhos
- Portas e serviços
- APIs/rotas
- Providers e contas
- Biblioteca multimídia
- PRs/worktrees
- Diagramas Mermaid
- Receipts/provas
- Glossário
- Busca global

## Biblioteca

Ordem canônica dentro de `CentralDark/DOCUMENTACAO/BIBLIOTECA`:

`AUDIO -> CODIGO -> DADOS -> DESIGN-E-ARTES -> DOCS -> IMAGENS -> PDF -> TEXTO -> VIDEO`.

Cada item deve ser indexado por origem, conta/provider, título, tipo, revisão/hash quando possível e tags. Arquivo bruto continua no provider; o HUB guarda índice e contexto seguro consultável.

## Regra de documentação

Mudança material sem documentação mínima = `DOCUMENTATION_GATE=FAIL`.

Campos mínimos: nome humano, propósito, owner, interface, dependências, prova, testes, rollback, links, receipt, NEXT_CURSOR.

## Media / Legendas / Debug

`PLAYER_DEBUG_JSON` é locator/receipt. Não é legenda completa. Para YouTube, `debug_videoId|docid` identifica a mídia; a faixa de legenda deve vir de metadata observada da track, request `timedtext` observada ou fonte autorizada equivalente. `captions.js` não é contrato estável.

Ferramenta do pacote: `scripts/youtube_debug_locator.py`. Ela extrai locators; não faz scraping nem declara transcript completo.

## Handoff denso de skills

Formato obrigatório para sucessor: `[SKILL][TRIG][OWNER][IN][PRE][EXEC][OUT][PROOF][FAIL][NEXT][REV]`. Gramática pode ser comprimida; campos e prova não. Skill pedida e não encontrada deve ser resolvida por capability/owner existente, nunca inventada.

## Regra de colheita

Busca útil não termina em “achei”. Material encontrado em chat, Drive, código, debug, agente paralelo ou histórico deve receber disposição: absorver no owner existente, virar teste/falsificador, provenance, quarantine, NEXT_CURSOR ou irrelevante justificado.


## 🧩 Padrão obrigatório de documentação de código

Todo código material possui duas vistas sincronizadas:

- **Vista técnica:** assinatura, owner, entrada, saída, efeitos colaterais, limites, erros, segurança, dependências, chamadores, testes, prova e revisão.
- **Mapa mental:** resumo em uma linha + emoji semântico + fluxo visual para recuperação rápida.

A auditoria integral usa `arquivo:linha-início..linha-fim -> símbolo/bloco -> owner -> documentação -> teste -> prova`. Não se exige comentário em cada linha; isso preserva o código bruto limpo.

`CODE_DOCUMENTATION_GATE` falha fechado quando uma alteração material não atualiza a documentação exigida ou quando o parser/owner é desconhecido.

## 🔁 Hermes Upstream Bridge

A CLI CentralDark permanece controlada pela Casa. Hermes oficial é tratado como upstream de capabilities. Atualizações entram por `check -> diff -> inventário -> owner -> sandbox -> testes -> adapter/overlay -> contraprova -> receipt`. Pull cego sobre a carcaça customizada é proibido.

## 💬 Modos de comunicação

- `TRABALHO` é padrão: PT-BR técnico, conciso, sem repetição do pedido.
- `RESENHA` exige intenção explícita do operador; pode usar baianês/humor/contexto bíblico sem alterar fatos, gates ou autoridade.
