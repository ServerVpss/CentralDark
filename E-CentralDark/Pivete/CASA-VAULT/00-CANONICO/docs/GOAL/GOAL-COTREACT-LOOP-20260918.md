# GOAL / COTREACT LOOP — cristal operacional

Data local: 2026-09-18 19:28 BRT
Origem: captura enviada pelo CHEFE mostrando `/goal` avaliando uma execução Hermes/COTREACT.

## Status

`CRYSTAL_TYPE=OPERATIONAL_METHOD`
`AUTHORITY=CHEFE_INTENT + REALITY_JUDGE`
`SCOPE=CentralDark Casa/Hermes/Meta-Lupa/PDF_GATE`

## Delta útil extraído

A tela mostra que o agente iniciou `BEGIN PHASE COTREACT`, definiu missão, escopo, objetivo, alvo, rollback, failure modes e autorização.

Mas o próprio `/goal` classificou a execução como insatisfatória porque a resposta era preâmbulo/plano/boot sem evidência concreta dos deliverables exigidos.
## Regra cristalizada

`BOOT_OR_PLAN != DELIVERABLE`
`PREAMBLE != PROOF`
`SCOPE_LOCK != EXECUTION`
`CANDIDATE_SHA256=UNPROVEN != PASS`
`CONTINUE != COMPLETED`

O agente pode iniciar com COTREACT, escopo bloqueado, track, plano e missão.
Isso ajuda a organizar o trabalho, mas não satisfaz `/goal`.

Para satisfazer `/goal`, precisa existir pelo menos uma prova material compatível com o objetivo:

- arquivo realmente criado/alterado;
- conteúdo do arquivo lido depois da escrita;
- saída de comando;
- receipt com caminho exato;
- confirmação de anexo/artefato;
- HEAD/commit/teste quando o objetivo exigir Git.
## Ciclo obrigatório quando `/goal` reclamar

1. Ler a falha literal do `/goal`.
2. Extrair somente o delta útil.
3. Identificar o deliverable ausente.
4. Não abrir frente paralela se o ponto vivo ainda está claro.
5. Executar o menor passo que produz prova.
6. Reexecutar ou reavaliar o `/goal`.
7. Só promover quando a evidência satisfizer o denominador definido.

## Aplicação imediata ao PDF_GATE

O `PDF_GATE` continua vermelho enquanto a cadeia completa não passar.

Cadeia exigida:

`identity -> policy -> self-test -> node:test -> tamper counterproof -> runner -> receipt`

Se qualquer etapa falhar, o estado correto é `BLOCKED/UNKNOWN`, não `PASS`.
