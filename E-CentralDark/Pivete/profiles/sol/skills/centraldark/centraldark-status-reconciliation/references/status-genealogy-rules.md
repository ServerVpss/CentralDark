# Regras Detalhadas de Reconciliação de Status — CentralDark

## Visão geral
Indicadores visuais de status (semáforos, screenshots, painéis) em CentralDark são evidência observacional com genealogia. Eles NÃO são:
- Verdades eternas (verde não é "verdade para sempre")
- Dívidas eternas (vermelho antigo não é dívida atual se resolvido)
- Prova de estado Git/runtime (cor não prova SHA ou processo)

## STATUS_VISUAL — Processo completo

### Passo 1: Identificar origem
- De onde veio o indicador? (painel, screenshot, log, CI?)
- Qual o source? (Copilot, dashboard, terminal, webhook?)

### Passo 2: Identificar PR/commit/execução
- Qual commit ou PR produziu esse status?
- Qual execução gerou esse indicador?
- Qual o HEAD/SHA associado?

### Passo 3: Registrar metadados
```
timestamp: <quando apareceu>
HEAD/SHA: <commit associado>
source: <origem do indicador>
scope: <escopo de aplicação>
artifact: <artefato afetado>
cause_signature: <assinatura da causa>
```

### Passo 4: Verificar estado posterior
- O status mudou depois?
- Houve commit que resolvedor a causa?
- A execução posterior provou PASS?

### Passo 5: Reconciliar com estado atual
- O status atual bate com o visual?
- Se não bate → `STATUS_RECONCILIATION_REQUIRED=true`
- Se bate → considerar reconciliado

## STATUS_KEY
Chave única para deduplicação:
```
source + scope + artifact + HEAD/SHA + timestamp + cause_signature
```

## Classificações de status histórico

### historical_resolved
Status de execução passada que foi resolvido por commit/ação posterior. Não é dívida atual.
Exemplo: ❌ Failed em commit abc123, depois commit def456 resolve e execução posterior provou PASS.

### current_residual
Status que ainda se reproduz no presente. É dívida atual.
Exemplo: ❌ Failed em commit atual, ainda reprova ao testar agora.

### UNKNOWN
Estado não pode ser ligado ao HEAD atual ou não há evidência para decidir.
Exemplo: screenshot sem timestamp, sem SHA, sem contexto de execução.

## GREEN_WITHOUT_DENOMINATOR → NOT_PROVEN
Quando verde aparece mas não há denominador (commit, execução, SHA, tempo) que prove o estado:
- Não tratar como PASS
- Não tratar como falso positivo automaticamente
- Marcar como `NOT_PROVEN` e investigar

## Quando fotos contam
Fotos e screenshots são evidência observacional válida — útil para:
- Detectar sinais de trabalho
- Identificar falhas visuais
- Descobrir frentes concorrentes
- Encontrar lacunas de interface

Mas NÃO provam:
- Estado atual do Git (SHA, branch, HEAD)
- Estado do runtime (processo vivo, serviço rodando)
- Contagem real de checks/receipts ("128 checks, 52 receipts" não é provado por painel desenhado)

## ARCHITECTURE_VISUAL vs STATUS_PROOF
Dois painéis bonitos da CentralDark são arquitetura visual desejada — mostram a cadeia e ajudam a descobrir lacunas de interface. Mas não podem provar "Sistema estável, 128 checks, 52 receipts" etc. existam realmente só porque aparecem desenhados.

## Pitfalls comuns

### Tratar vermelho passado como dívida atual
**Erro:** Ver ❌ emScreenshot antigo e tratar como problema atual sem verificar se resolveu.
**Correção:** Verificar estado posterior — se commit posterior resolveu e execução provou PASS → `historical_resolved`.

### Tratar verde como eterno
**Erro:** Ver ✅ e assumir que o estado é verdade para sempre.
**Correção:** Quando HEAD muda, revalidar. `PASS antigo + HEAD mudou` → `PASS precisa ser revalidado`.

### Achar que cor = prova
**Erro:** Achar que screenshot vermelho = prova de falha atual, ou verde = prova de sucesso atual.
**Correção:** Cor é observação, não prova. Precisa de HEAD/SHA, timestamp, causa, estado posterior.

### Repetir indicador reconciliado como problema novo
**Erro:** Ver status já reconciliado e tratá-lo como problema novo.
**Correção:** Deduplicar pela causa. Se já está `historical_resolved`, não recriar problema.

## Template de genealogia de status

```
STATUS_GENEALOGY:
  indicator: <vermelho/amarelo/verde>
  source: <origem do indicador>
  scope: <escopo>
  artifact: <artefato>
  timestamp: <quando apareceu>
  HEAD/SHA: <commit associado>
  cause_signature: <assinatura da causa>
  posterior_state: <estado após ação>
  resolution: <historical_resolved | current_residual | UNKNOWN | NOT_PROVEN>
  STATUS_RECONCILIATION_REQUIRED: <true/false>
```

## Exemplos práticos

### Exemplo 1: Vermelho resolvido
```
STATUS_GENEALOGY:
  indicator: ❌
  source: CI panel
  scope: porta-de-entrada
  artifact: verify_repo_contract.py
  timestamp: 2026-08-27 14:30
  HEAD/SHA: abc123
  cause_signature: python: command not found
  posterior_state: commit def456 corrigiu, execução depois provou PASS
  resolution: historical_resolved
  STATUS_RECONCILIATION_REQUIRED: false
```

### Exemplo 2: Verde sem denominador
```
STATUS_GENEALOGY:
  indicator: ✅
  source: Dashboard visual
  scope: sistema
  artifact: painel desenhado
  timestamp: desconhecido
  HEAD/SHA: não informado
  cause_signature: não aplicável
  posterior_state: sem execução comprovada
  resolution: NOT_PROVEN
  STATUS_RECONCILIATION_REQUIRED: true
```

### Exemplo 3: Status desconhecido
```
STATUS_GENEALOGY:
  indicator: ⏳
  source: Screenshot sem metadados
  scope: desconhecido
  artifact: desconhecido
  timestamp: não tem
  HEAD/SHA: não tem
  cause_signature: não tem
  posterior_state: não se sabe
  resolution: UNKNOWN
  STATUS_RECONCILIATION_REQUIRED: true
```

## Integração com MetaLupa
Status visual também precisa da MetaLupa:
- PASS antigo + HEAD mudou → revalidar
- GREEN_WITHOUT_DENOMINATOR → NOT_PROVEN
- Vermelho com causa conhecida → verificar se causa ainda existe
- Amarillo com execução pendente → verificar se concluiu
