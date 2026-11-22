# HUB / Biblioteca — persistência do ciclo e superfícies conectadas

Owner de memória: `docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/README.md`.
Owner de comportamento: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml`.
Contrato desta passagem: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PERSISTENT-SWEEP-CONTRACT.yml`.

## Regra

O HUB continua único. Google Drive, GitHub, VPC/MCP, Zendrive, Codex, CodeRabbit e demais conectores são superfícies do mesmo organismo; falha de uma superfície não cria um segundo HUB.

Cada superfície precisa de `source_ref`, `owner`, `health`, `timestamp`, `receipt` e `NEXT_CURSOR` quando material.

## Biblioteca

Material observado entra como referência/proveniência ou candidato, nunca como autoridade automática. Claim selado não volta ao ciclo sem `REOPEN_CAUSE_REF`. Finding refutado não é descartado: vira `REFUTED_MINERAL`; finding unresolved vira `UNRESOLVED_MINERAL`; finding provado e reutilizável pode virar `CRYSTAL_GOLD`.

## Revisão de código

`Codex -> Zendrive fallback -> Rabbit/Signal Watcher -> Hermes -> teste/contraprova -> Reality Judge`.

Codex e Zendrive são revisores consultivos. Hermes reproduz e testa. Merge/promoção não pertence ao Zendrive/Rabbit.

## Varredura persistente

A regra não é de turno único. O motor deve continuar procurando residuals materiais até fixed point ou fronteira comprovada, usando `VERTEX_INVERSO` nos residuals e `META_LUPA` em novo delta causal, sem repetir claim já selado e sem declarar exaustão sem rastro.

## Estado desta passagem

- Documento original do Drive foi lido pela referência exata e estava atualizado no momento da leitura.
- A tentativa de atualizar o Google Doc original foi bloqueada pelas configurações de segurança da integração; portanto o original NÃO foi alterado nesta passagem.
- O GitHub ativo permaneceu como superfície persistível disponível.
- A existência deste arquivo/contrato no PR é `SOURCE_PERSISTED`, não `RUNTIME_BOUND` até prova de consumo pelo Master Cycle no mesmo HEAD.
