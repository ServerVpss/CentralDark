# PADRÃO HUD STATUS UNIVERSAL

**Estado:** CRISTAL CANDIDATO
**Owner:** CentralDark / SOL
**Escopo:** comunicação operacional, HUD, PRs, CI, deploy, runtime e receipts.

## Intenção

Todo status técnico deve ser exibido em duas camadas:

> termo humano universal primeiro + termo técnico entre parênteses.

Isso preserva precisão para engenharia sem deixar o CHEFE, usuário leigo ou operador de sistema perdido.

## Regra principal

- A palavra humana comunica o que fazer.
- O termo técnico preserva rastreabilidade.
- O emoji comunica estado visual, mas não vira prova.
- `UNKNOWN != PASS` continua obrigatório.
- `MERGED != DEPLOYED` continua obrigatório.
## Mapa universal

| Humano / universal | Técnico preservado | Uso no HUD |
| --- | --- | --- |
| 🔄 Na fila para rodar | `queued` | workflow aguardando runner |
| ⏳ Rodando / aguardando resultado | `pending` / `in_progress` | teste ainda sem conclusão |
| 🟢 Pronto para juntar | `OPEN / MERGEABLE` | PR sem conflito técnico |
| 🟡 Aberto, mas ainda não pronto | `OPEN / checks pending` | PR depende de prova |
| 🔴 Não pode juntar agora | `CONFLICTING` / `BLOCKED` | conflito ou gate quebrado |
| ✅ Concluído com sucesso | `completed / success` | execução fechou verde |
| ❌ Terminou com erro | `completed / failure` | execução fechou vermelho |
| ⛔ Execução cancelada | `cancelled` | execução interrompida |
| 🧬 Versão exata sendo testada | `HEAD` | commit alvo da prova |
| 🌳 Versão principal de destino | `BASE / main` | ramo que receberá o delta |
| 🧪 Testes da mesma versão atual | `SAME_HEAD_CI` | CI do commit certo |
| 🔀 Pedido de entrada na principal | `Pull Request / PR` | proposta rastreável |
| 📦 Alteração salva no histórico | `commit` | snapshot versionado |
| 🚀 Alteração enviada ao GitHub | `push` | branch remota atualizada |
| 🔗 Alteração incorporada | `merged` | entrou na `main` |
| 🌍 Alteração realmente em uso | `deployed` | runtime recebeu o delta |
| ⚖️ Comprovação no mundo real | `runtime proof / Reality Judge` | prova observada |

## Forma obrigatória no HUD

Exemplo correto:

`PR #1543: 🟢 Pronto para juntar (OPEN / MERGEABLE)`

Exemplo incorreto:

`PR #1543: OPEN / MERGEABLE`

## Gate de clareza

Um status operacional só está no padrão quando contém:

1. estado humano claro;
2. termo técnico rastreável;
3. consequência operacional;
4. nenhuma promoção de `unknown` para verde.
## Aplicação imediata

A partir deste contrato, respostas e painéis devem preferir:

`🟢 Pronto para juntar (OPEN / MERGEABLE)`

em vez de apenas:

`OPEN / MERGEABLE`

E devem preferir:

`🔄 Na fila para rodar (queued)`

em vez de apenas:

`queued`

## Julgamento

`CLAREZA_HUMANA + PRECISAO_TECNICA + CONSEQUENCIA_OPERACIONAL -> STATUS_COMPREENSIVEL`

`STATUS_COMPREENSIVEL + PROVA_DA_MESMA_VERSAO -> HUD_APROVADO`
