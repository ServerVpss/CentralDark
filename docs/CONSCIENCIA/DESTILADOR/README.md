# Setor de Destilação CentralDark

**Owner de método:** `.agents/skills/knowledge-compiler/`
**Owner de autoridade:** `docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md`
**Owner de orquestração:** `docs/CONSCIENCIA/PROTOCOLO-ORQUESTRACAO-PIVETE.md`

Este setor é uma **área de entrada e revisão**, não um segundo cérebro, scheduler,
watcher, dispatcher ou writer paralelo.

## Fluxo único

```text
MATERIAL RECEBIDO
→ ENTRADA/
→ INVENTARIAR
→ LER MAIN / PR / COMMITS / DOCS / APRENDIZADOS / LEMBRANÇAS / RECEIPTS
→ EXTRAIR DELTA
→ DEDUPLICAR
→ CONTRAPROVAR
→ CLASSIFICAR
   PROVEN | CANDIDATE | UNKNOWN | DROP
→ ESCOLHER OWNER EXISTENTE
→ TESTAR / GATE
→ APLICAR SOMENTE O MENOR DELTA AUTORIZADO
→ READBACK
→ CRISTALIZAR NO OWNER CANÔNICO
```

## Regras

```text
ONE_DISTILLATION_METHOD=true
ONE_CANONICAL_OWNER_PER_CAPABILITY=true
REUSE_BEFORE_CREATE=true
PLAN_ONLY != EXECUTION
COMPILED_ROUTE != AUTHORIZATION
HISTORY != CURRENT
DOCUMENTED != EXECUTED
UNKNOWN != PASS
```

- Coloque arquivos recebidos em `ENTRADA/`; não misture a entrada com `docs/` canônicos.
- Não copie logs inteiros para aprendizados. Preserve o arquivo bruto em quarentena e
  destile somente o delta reutilizável com proveniência.
- Não instalar uma skill, criar um agente ou iniciar um processo automaticamente por
  causa de um arquivo recebido.
- Não criar um novo HUD, cérebro, scheduler ou rota para acomodar material externo.
- Falha de uma fonte gera placa/localização/`UNKNOWN`; não bloqueia o restante da Casa.
- Toda promoção exige owner, teste, contraprova e readback.

## Saída mínima de cada lote

```text
LOTE_ID=
FONTES=
MAIN_SHA=
OWNER_ESCOLHIDO=
DELTA_DESTILADO=
CLASSIFICACAO=PROVEN|CANDIDATE|UNKNOWN|DROP
CONTRAPROVA=
TESTE=
READBACK=
APLICADO=SIM|NAO
RECEIPT=
NEXT_CURSOR=
```

A execução continua sendo feita pelo `knowledge-compiler` e pelos owners existentes;
esta pasta apenas organiza o material de entrada e torna o trilho visível.
