# CENTRALDARK — REVISÃO FIEL READ-ONLY

**Fonte auditada:** `Untitled-2.txt`  
**SHA-256 da fonte:** `4694ed7e23473db3fc6f20571891961c68af1c9c5797d19c971a3feb0b8926d3`  
**Modo:** `READ_ONLY_REVIEW`  
**Execução do código:** **NÃO**  
**Mutação do repositório:** **NÃO**  
**Objetivo:** preservar a intenção já existente, separar proposta de implementação real e apontar apenas correções materiais.

---

## 1. Veredito curto

O material **não contém uma implementação completa da CentralDark**. Ele contém histórico, regras operacionais, pseudo-código e uma proposta pequena de integração com VS Code.

A proposta de uma fachada única `centraldark(intent)` **é coerente como conceito**, mas **não está autorizada pela evidência do próprio arquivo como novo entrypoint real**. O texto termina reconhecendo que antes seria necessário localizar o owner/entrypoint existente e estendê-lo.

Portanto, a correção fiel é:

> **NÃO criar `centraldark.run` nem `centraldark(intent)` como sistema paralelo enquanto o entrypoint vivo existente não estiver provado.**

Se o owner atual já faz esse papel, ele deve ser **estendido**. Se não faz, só então existe gap material para uma fachada nova.

---

## 2. Intenção canônica extraída do próprio material

A intenção que sobrevive às correções do CHEFE não é simplesmente “menos linhas”, “menos API” ou “compressão”. Esses são efeitos possíveis, não o objetivo principal.

O núcleo é:

```text
PRESERVAR O QUE JÁ EXISTE
→ UMA CASA
→ INTENÇÃO HUMANA COMO AUTORIDADE
→ MÁQUINA DESCOBRE O COMO
→ REUSE_BEFORE_CREATE
→ ONE_OWNER_PER_CAPABILITY
→ ONE_WRITER_PER_SCOPE
→ PARALLELIZE_PERCEPTION
→ SERIALIZE_MUTATION
→ ACTION != PROOF
→ REALITY = JUDGE
→ CONTRAPROVA
→ LAST_GOOD_STATE
→ APRENDIZADO QUE MUDA A PRÓXIMA EXECUÇÃO
```

E o fechamento mais forte do material é:

```text
ONE_SHOT = 1 INTENÇÃO
1 INTENÇÃO = 1 DESTINO OPERACIONAL
DESTINO = REALIDADE PROVADA
```

O texto literalmente termina corrigindo o enquadramento de “menos é mais” para **preservar o existente enquanto as máquinas assumem a decomposição operacional**.

---

## 3. O que está alinhado com a intenção

### 3.1 Uma interface humana pequena pode ser correta

Trecho conceitual proposto:

```ts
await centraldark(intent)
```

Isso é compatível com:

```text
CHEFE → intenção curta
CASA → descobre contexto/owner/trabalho/risco
CASA → executa e prova
CHEFE ← resultado
```

**Mas somente como fachada do sistema já existente**, não como substituição automática dele.

### 3.2 Separar percepção de mutação está correto

O material preserva explicitamente:

```text
PARALLELIZE_PERCEPTION
SERIALIZE_MUTATION
ONE_WRITER_PER_SCOPE
```

Isso é consistente e deve permanecer invariável.

### 3.3 `ACTION != PROOF` e `REALITY = JUDGE` continuam centrais

O fluxo proposto de observar, julgar, contraprovar e só então promover `LAST_GOOD_STATE` está alinhado com a intenção.

### 3.4 O filtro `isMaterialChange()` é necessário

A proposta percebe corretamente que eventos do VS Code não podem disparar a usina inteira a cada `Ctrl+S`.

```text
EVENT
→ material?
   ├─ não → ignore
   └─ sim → missão
```

Esse filtro não é otimização estética; ele é proteção contra ruído, loops e multiplicação artificial de missões.

---

## 4. Onde a proposta sai da intenção

### 🔴 4.1 “Uma função pública nova” foi promovida cedo demais

Foi proposta:

```ts
vscode.commands.registerCommand(
  "centraldark.run",
  () => centraldark(getCurrentIntent())
)
```

O problema não é a função em si. O problema é **criar sem provar se ela já existe semanticamente em outro owner**.

O próprio material reconhece isso no final:

```text
LOCATE_EXISTING_VSCODE_OWNER
→ EXTEND
→ só então avaliar centraldark.run
```

Logo, qualquer implementação que criasse agora `centraldark.run` seria **SPEC adiantando REALITY**.

### 🔴 4.2 “MENOS SUPERFÍCIE” virou objetivo e deslocou a intenção

Em vários pontos a conversa empurra:

```text
MENOS API + MAIS CAPACIDADE = MAIS CENTRALDARK
```

Mas o CHEFE corrige o enquadramento no fim: **não se trata de reduzir por reduzir**.

A regra fiel é:

```text
PRESERVA_CAPACIDADE_EXISTENTE primeiro
REDUZ só se a redução não remover autoridade, prova, owner, memória ou fluxo existente
```

Compressão é consequência de domínio e reuso. Não é missão autônoma.

### 🔴 4.3 Eventos automáticos podem quebrar `ONE_SHOT = 1 INTENÇÃO`

A lista de eventos sugerida inclui salvar, criar, renomear, config, task, Git e alertas.

Se cada evento puder virar uma missão independente, uma única intenção humana pode gerar múltiplas execuções/commits concorrentes.

Isso contradiz o fechamento do material.

A correção mínima é **agrupar/coalescer eventos materiais na missão já ativa da mesma intenção**, em vez de criar uma missão nova por evento.

### 🟡 4.4 O pseudo-pipeline tem nomes demais para algo ainda não provado no runtime

Exemplo:

```text
acordar()
calibrar()
multibussola()
metaLupa()
reconcile()
resolveOwner()
discoverWork()
planMinimalDelta()
acquireWriter()
execute()
observe()
realityJudge()
counterproof()
...
```

Como modelo mental, é aceitável.

Como implementação, **não há evidência no anexo de que cada nome corresponda a função/módulo real**. Criar todas essas funções só para fazer o desenho bater seria transformar linguagem doutrinária em boilerplate.

A regra correta é:

```text
CONCEITO != OBRIGAÇÃO DE TER UMA FUNÇÃO COM O MESMO NOME
```

Reusar funções reais existentes que já cumpram esses contratos.

### 🟡 4.5 `emitVisualPack()` não deve entrar no caminho universal da missão

`IMAGE → MARKDOWN → MERMAID → ZIP` aparece como regra de handoff visual.

Isso não significa que toda missão de código deva gerar um pacote visual.

O comportamento fiel é:

```text
SE missão/handoff visual exige artefato
→ usar família IMAGE → MARKDOWN → MERMAID → ZIP
SENÃO
→ não adicionar custo/artefato sem consumidor real
```

---

## 5. Correção mínima da arquitetura proposta

Sem criar sistema novo, o contrato deveria ser entendido assim:

```text
ENTRADA EXISTENTE DA CASA
        ↓
NORMALIZA INTENÇÃO / EVENTO
        ↓
EVENTO PERTENCE A MISSÃO ATIVA?
        ├─ SIM → agrega/coalesce; NÃO abre missão paralela
        └─ NÃO
             ↓
        É MATERIAL?
        ├─ NÃO → NO_CHANGE
        └─ SIM
             ↓
        RECUPERA ESTADO VIVO
             ↓
        LOCALIZA OWNER EXISTENTE
             ↓
        REUSA CAPACIDADE EXISTENTE
             ↓
        ADQUIRE 1 WRITER POR ESCOPO
             ↓
        PERCEPÇÃO PODE PARALELIZAR
             ↓
        MUTAÇÃO SERIAL
             ↓
        EVIDÊNCIA
             ↓
        CONTRAPROVA
             ↓
        REALITY JUDGE
             ↓
        PASS? ── NÃO → REMEDIA DENTRO DA MESMA INTENÇÃO
          │
         SIM
          ↓
        PROMOVE LAST_GOOD_STATE
          ↓
        1 RECEIPT DA INTENÇÃO
```

### Regra operacional importante

```text
EVENTO != NOVA INTENÇÃO
ARQUIVO SALVO != NOVA MISSÃO
TESTE FALHOU != SEGUNDA CASA
MODELO != OWNER
COMANDO VS CODE != AUTORIDADE
```

O owner continua sendo a capacidade canônica existente. O comando/evento é só uma entrada/adaptador.

---

## 6. Pseudo-código revisado — NÃO executável / NÃO patch

Este bloco não cria API nova; representa o comportamento que o owner existente deveria preservar.

```ts
async function existingCentralDarkEntry(input: Input) {
  const signal = normalize(input)

  if (signal.kind === "event") {
    const active = findActiveMissionFor(signal)
    if (active) return coalesceInto(active, signal)
    if (!isMaterialChange(signal)) return noChangeReceipt(signal)
  }

  const mission = resolveOrCreateMissionFromIntent(signal)
  const state = await readLiveState(mission)
  const owner = await resolveExistingOwner(state, mission)

  return withSingleWriter(owner.scope, async () => {
    const perception = await parallelPerceptionWhereSafe(state, mission)
    const delta = await minimalDelta(perception, owner)

    if (!delta.material) return noChangeReceipt(mission)

    const action = await serializeMutation(delta)
    const evidence = await observeReality(action)
    const verdict = await counterprove(evidence, mission)

    if (!verdict.pass) {
      return remediateSameMission({ mission, verdict, owner })
    }

    await promoteLastGoodState(verdict)
    return oneReceiptFor(mission, verdict)
  })
}
```

### O que este pseudo-código corrige

- não inventa `centraldark.run` como owner;
- evento não vira automaticamente nova missão;
- uma intenção permanece uma unidade operacional;
- percepção pode paralelizar;
- mutação permanece serializada;
- ação não encerra missão sem prova;
- falha remedia **na mesma intenção**;
- `LAST_GOOD_STATE` só sobe depois do julgamento.

---

## 7. O que eu NÃO afirmo a partir deste arquivo

O anexo **não prova**:

- qual é o entrypoint real atual do repositório;
- quais funções acima já existem em TypeScript/JS/Python/etc.;
- se há extensão VS Code instalada/registrada;
- se existe listener real para save/create/rename/task/Git;
- se `Reality Judge`, writer lease ou mission coalescing já estão implementados;
- se existe hoje automação de `1 intenção = 1 commit`;
- se o sistema já fecha `FULL_DESTINATION=REALIDADE` no runtime.

Esses itens ficam `UNKNOWN`, não `PASS`.

---

## 8. Decisão da revisão

### 🟢 PRESERVAR

```text
CHEFE DEFINE O QUÊ
CASA DESCOBRE O COMO
REUSE_BEFORE_CREATE
ONE_SYSTEM_ONLY
ONE_OWNER_PER_CAPABILITY
ONE_WRITER_PER_SCOPE
PARALLELIZE_PERCEPTION
SERIALIZE_MUTATION
ACTION != PROOF
REALITY = JUDGE
COUNTERPROOF
LAST_GOOD_STATE
```

### 🟡 AJUSTAR

```text
centraldark(intent)
```

Pode existir **como fachada/alias do owner já existente**, mas não deve ser criada antes da medição do entrypoint vivo.

### 🔴 NÃO FAZER COM BASE NESTE ARQUIVO

```text
criar novo control-plane
criar outro cérebro
criar V2/V3
criar funções só para espelhar nomes doutrinários
fazer cada evento do VS Code virar missão
fazer compressão virar objetivo maior que preservação
tratar pseudo-código como implementação comprovada
```

---

## 9. Fixed point desta revisão

```text
INTENÇÃO DO CHEFE
→ PRESERVAR CASA EXISTENTE
→ MEDIR OWNER REAL ANTES DE CRIAR
→ EVENTOS ALIMENTAM A INTENÇÃO, NÃO A FRAGMENTAM
→ UMA CANETA POR ESCOPO
→ MUTAÇÃO MÍNIMA
→ REALIDADE JULGA
→ FALHA REMEDIA NA MESMA MISSÃO
→ PROVA FECHA
→ PRÓXIMA EXECUÇÃO COMEÇA MAIS ALTA
```

**Resumo em uma linha:**

> A função única não é a arquitetura; a arquitetura é a Casa existente conseguir receber uma intenção sem fragmentá-la, reaproveitar seus owners, agir com um writer por escopo e só encerrar quando a realidade provar o destino.

---

## 10. Estado desta entrega

**Feito:** revisão completa do arquivo anexado em modo somente leitura.  
**Evidência:** 1.851 linhas lidas pelo mecanismo de arquivos; fonte local preservada com SHA-256 acima.  
**Pendência:** implementação real do repositório não foi fornecida neste anexo; portanto aderência do runtime permanece `UNKNOWN`.  
**Próximo passo técnico correto:** quando houver código/repo como fonte, comparar o entrypoint vivo contra este contrato sem criar nada antes de provar o gap.  
**BOOT indicado para essa revisão:** `HOUSE_FIRST → INTENT → EXISTING_OWNER → MINIMAL_DELTA → REALITY`.  
**Fio da missão:** `intenção → preservação → owner real → delta mínimo → prova → continuidade`.
