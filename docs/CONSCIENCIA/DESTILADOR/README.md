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


## ⛏️ GARIMPEIRO_INCREMENTAL_VAULT_20261009 — pacotão da usina existente

**Intenção:** recuperar conhecimento antigo do Hermes/Claude e preservar somente
deltas úteis **que ainda não estão no owner da main nem comprovados no runtime
da VPS**. Usar `.agents/skills/knowledge-compiler/`; este README organiza
a entrada, não cria segundo Destilador, MCP, HUD, cron, watcher ou agente.

### Minério já localizado e identidade de origem

- `ENTRADA/2026-10-09-hermes-centraldark-pastes.md`: `pastes.zip` com 30
  entradas; potencial conhecimento, NÃO importar tokens de `centraldark.json`.
- `ENTRADA/2026-10-09-hermes-achievements-profiles.md`:
  `hermes-achievements.zip` com 4 arquivos, 60 conquistas; metadados
  `CANDIDATE`. `profiles.zip` com 2.884 itens: **QUARENTENA SENSÍVEL**,
  vedado usar auth, sessões, logs privados ou instalar perfis.
- Backup `Vault-Cofre-CentralDark-20260930T105330Z.tar.gz`:
  pasta **Vault** existente no Drive; backup e sidecar `.sha256` listados.
  `/root/Vault-Cofre-CentralDark-20260930T105330Z.tar.gz` também está
  presente na VPS. `SIZE=752981967`; SHA-256 da VPS conferido:
  `383eb16f6ccd8b61585d7589aa88d0c21b10ad09a44cfc34b70bfed60946e8e4`.
  É exatamente o fingerprint do receipt histórico
  `artifacts/centraldark-os/vault-offhost-20260930T105330Z.receipt`
  (`gdrive:CentralDark/Vault/`). **Backup verificado não é conhecimento
  liberado para extração nem restore autorizado**. Não baixar, copiar,
  descompactar, restaurar ou versionar o cofre bruto por esta rotina.
- O mapa de onde buscar o ouro inclui `main`, PRs, receitas, Lembranças,
  aprendizados, `docs/` e receipts, sempre com leitura antes de criar.

### Algoritmo executável pelo revisor já existente — delta primeiro

```text
FONTE NOVA → inventário sem conteúdo sensível → SHA/tamanho/proveniência
→ CLASSIFICAR SEGREDO? SIM → QUARENTENA / SKIP
→ T0: medir main/HEAD, docs, owners, aprendizagem e receipts
→ T0: medir VPS/HEAD e consumidor real (se inacessível → UNKNOWN)
→ IGUALDADE EXATA POR HASH? SIM → DROP_DUPLICATE
→ DEDUPE SEMÂNTICO (intenção, capacidade, efeito, owner, teste)
→ CAPACIDADE JÁ EXISTE NO OWNER/RUNTIME? SIM → REUSE / DROP
→ NOVIDADE NÃO COMPROVADA? → CANDIDATE, não promover
→ PEPTITA NOVA? → escolher owner existente → menor delta
→ TESTE + CONTRAPROVA + READBACK
→ CLASSIFICAR:
   DROP = pedra, duplicata, segredo, legado superado
   CANDIDATE = hipótese útil ainda não testada
   PROVEN = efeito reproduzido no escopo medido
→ CRISTAL = SOURCE_FINGERPRINT + OWNER + CONSUMIDOR + TESTE + RECEIPT
→ REGISTRAR só o delta material no owner/HUD único/PR existente
→ PRESERVAR FIO VERDE / NEXT_CURSOR → continuar os outros lotes
```

A categoria de **ouro** é novidade útil candidata; **diamante** exige
teste e contraprova positivos no consumidor real. `AUTO_GENERATED_OUTPUT !=
TRUTH`; `REPEATED_OUTPUT != LEARNING`; `RAG != TRAINING`;
`MEMORY != MODEL_WEIGHT_UPDATE`. Não inventar nota numérica ou threshold
universal: registrar qualitativamente novidade, aplicabilidade, proveniência,
evidência, risco e reuso. Ausência de prova na VPS = `UNKNOWN`, não
`MISSING_CONFIRMED`. Se a fonte não mudou, **não recompilar o museu**:
reutilizar último cristal com fingerprint válido.

### Autosync, seis rondas por dia e limpeza

A medição T0 comprovou `VPS_HEAD=origin/main`, **não a causa dessa
igualdade**. Um cron associado ao filtro sync/destilação traz expressão
`*/5 * * * *`; o comando/owner dessa entrada ainda não foi confirmado.
`DESTILACAO_6X_DIA=UNKNOWN`, `AUTOSYNC_T1=UNKNOWN` até encontrar
identidade, configuração, seis execuções (ou janela observada) e receipts
reais no scheduler já existente. **Não abrir cron/job paralelo**.
Limpeza somente de scratch descartável com owner conhecido e receipt;
nunca apagar cofre, backup, entradas originais, logs protegidos, missões,
contexto recuperado ou last-good-state. Erro → PLACA `VER PENDÊNCIA` no
mesmo `HUD.html` com rota, owner, causa, prova e receita; outros fluxos
continuam. Nenhuma credencial de anexo ganha autorização.

### Recibo obrigatório por pepita

```text
LOTE_ID= | SOURCE_SHA256= | SOURCE_SENSITIVITY=
BASE_MAIN_SHA= | BASE_VPS_SHA= | OWNER_EXISTENTE=
ALREADY_IN_MAIN=YES|NO|UNKNOWN | ALREADY_IN_VPS=YES|NO|UNKNOWN
DUPLICATE=YES|NO|UNKNOWN | CLASS=DROP|CANDIDATE|PROVEN|UNKNOWN
NOVIDADE= | PROVENIENCIA= | RISCO= | CONSUMIDOR=
TESTE= | CONTRAPROVA= | READBACK= | CRYSTAL_FINGERPRINT=
APLICADO=SIM|NAO | RECEIPT= | HUD_PLACA= | NEXT_CURSOR=
```

Idempotência: mesmo fingerprint e mesma capacidade sem diferença provada
→ `REUSE_PROOF`, sem commit/rodada repetida. Evoluir o owner já existente
apenas quando T1 encontra delta material. `NO_SECRET_INGEST=true`;
`ONE_WRITER_PER_SCOPE=true`; `NO_NEW_SCHEDULER=true`.

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
