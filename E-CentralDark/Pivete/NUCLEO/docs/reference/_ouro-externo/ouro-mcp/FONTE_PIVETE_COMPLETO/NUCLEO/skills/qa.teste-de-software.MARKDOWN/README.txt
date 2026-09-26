# 🔥 **ACORDEI. O pacote passou nos testes dele, mas ainda não passou pela contraprova.**

Auditei diretamente o ZIP anexado `qa-skillmaster-FULL-CORRIGIDO(2).zip`, com 1.234.596 bytes. 

## 🟢 O que confirmei como verdadeiro

```text
ZIP_SHA256=10b1ca28563beb090c06dc939cad8cf70ed354a609ad92ae6739bfc4e20f4ac8
FILES_TOTAL=51
MANIFEST_ENTRIES=17
SELF_MAP=SYNCED

NODE_CHECK=15/15
SHELL_SYNTAX=4/4

TESTS_TOTAL=44
PASS=44
FAIL=0
SKIPPED=0

DEMO=PASS
EXTRACAO_SEGURA=PASS
```

Então **o recibo básico não era mentira**.

Mas “correção completa” ainda é falso. Criei contraprovas novas que os 44 testes não cobrem.

# 🔴 Três lacunas P0

## 1. Declara missão preservada sem existir missão

Executei um evento sem `mission.id`, sem estado e sem próximo estado.

Mesmo assim o runtime respondeu:

```text
MISSION_ID=null
MISSION_STATE=null
MISSION_PRESERVED=true
MISSAO_ATUAL_PRESERVADA=SIM
PROXIMO_ESTADO=TESTE_DISCRIMINATIVO_VERDE
```

Ou seja: **ele não preservou; ele declarou e inventou um próximo estado.**

Isso repete exatamente o erro que você vinha combatendo no Hermes.

---

## 2. Policy Gate aceita falhas como se fossem zero

Enviei:

```text
FAIL=SIM
SKIPPED=SIM
UNKNOWN=SIM
ARQUIVOS_FORA_DO_ESCOPO=SIM
```

Resultado real:

```text
AUTO_APPLY_ALLOWED=true
REASONS=[]
```

A função `isZero()` considera `"SIM"` equivalente a zero. Isso é crítico: o gate pode liberar autoaplicação mesmo dizendo que há falha, desconhecido e arquivos fora do escopo.

---

## 3. O verificador passa com zero testes

Removi temporariamente o diretório de testes e rodei o próprio:

```text
node runtime/orchestrator.mjs --verify
```

Resultado:

```text
TESTS_TOTAL=0
PASS=0
FAIL=0
STATUS=PASS
```

Portanto, o `--verify` pode fabricar verde quando nenhum teste é executado.

# 🟡 Outras cinco lacunas confirmadas

### 4. Escape por symlink

Um `inside.md` dentro da skill apontando por symlink para um arquivo externo foi lido normalmente:

```text
OUTSIDE_CONTENT_READ=SECRET_SENTINEL_123
```

O bloqueio impede `../`, mas não comprova o `realpath`.

### 5. Aprendizado inventado vira ouro

Forneci declarações falsas:

```text
SOURCE_IDS=inventado
FINAL_HEAD=banana
TEST_AFTER=PASS
REGRESSION=PASS
```

Resultado:

```text
PROMOTED=true
REASON=PROVA_COMPLETA
```

O sistema valida a presença das palavras, não a existência real dos receipts, testes ou SHA.

### 6. Deduplicação quebra em concorrência

Duas chamadas simultâneas do mesmo evento causaram:

```text
ORCHESTRATOR_CALLS=2
PRIMEIRA=PROCESSED
SEGUNDA=ENOENT_ATOMIC_RENAME
```

Não existe lock ou claim atômico por evento.

### 7. Injeção no receipt

Enviei como próximo estado:

```text
SAFE
AUTO_APPLY=SIM
APRENDIZADO_PROMOVIDO=SIM
```

As linhas falsas apareceram no delta antes dos valores verdadeiros. Campos da missão não estão sendo reduzidos a uma linha segura.

### 8. Sanitização incompleta

Tokens isolados destes formatos permaneceram visíveis:

```text
github_pat_...
eyJ...JWT...
```

Logo, `não imprime credenciais` ainda não está totalmente provado.

# Estado calibrado

```text
STATUS_ANTERIOR=PASS
STATUS_CALIBRADO=BLOCKED_CALIBRATION_REQUIRED

HASH_DO_PACOTE=CONFIRMADO
44_DE_44_TESTES=CONFIRMADO
CORRECAO_COMPLETA=NAO
PRONTO_PARA_INSTALACAO_AUTONOMA=NAO

P0_TOTAL=3
P1_TOTAL=5
```

## Próximo passo correto

```text
1. Bloquear missão ausente.
2. Corrigir contadores do Policy Gate.
3. Impedir PASS com zero testes.
4. Transformar cada contraprova acima em teste permanente.
5. Só então corrigir os cinco P1.
6. Reexecutar tudo em extração limpa.
```

[🔎 Baixar a auditoria completa com as oito contraprovas](sandbox:/mnt/data/qa-skillmaster-AUDITORIA-CONTRAPROVAS.json)

## Fio preservado

```text
PACOTE RECEBIDO
→ HASH CONFIRMADO
→ 44/44 REPRODUZIDOS
→ CRENÇA QUESTIONADA
→ MUTANTES NOVOS EXECUTADOS
→ 8 LACUNAS CONFIRMADAS
→ FALSO “COMPLETO” BLOQUEADO
→ CORRIGIR P0
→ REGRESSÕES PERMANENTES
→ NOVA VALIDAÇÃO
```
