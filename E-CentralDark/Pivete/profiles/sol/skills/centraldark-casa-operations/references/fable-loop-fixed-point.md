# Fable Loop + Fixed Point Pattern (Sessão 31/08/2026)

## Contexto
CHEFE mandou: "fable loop até o ponto fixo ser completado, não se perde no loop, prossiga, salva seus acertos e repete"

## Princípios Extraídos

### 1. OPÇÕES VIRAM ESTRADA, NÃO PERGUNTA
- Quando elencar 2-3 caminhos, NÃO apresentar como "A ou B?".
- Tratar como roteiro interno. Pegar o de menor movimento eficaz, executar, mostrar resultado.
- Pivete: "essas opções 1 2 3 4 5 já é pra vc mesmo usar, continua, não pra fazer pergunta".

### 2. CADA RODADA SALVA ACERTOS + CHECKPOINT FIXED_POINT
- Bloco curto: o que ficou provado, o que mudou, NEXT_CURSOR.
- Repetir o bloco salvo nas rodadas seguintes pra não re-derivar.
- Formato: `## FIXED_POINT <ISO_TIMESTAMP>` + itens R1-R6 + `### Próximo: ...`

### 3. CRIAR TAREFAS PASSO A PASSO (TODO LIST)
- Marcar `in_progress` → `completed` por rodada.
- Evita "se perder no loop": o todo é a âncora.

### 4. KIMETSU 17 RESPIRAÇÕES ANTES DE AGIR EM FRENTE CRÍTICA
- INSPIRA(mede) → SEGURA(reconcilia) → EXPIRA(solta temp) → REPOUSA → CONTINUA → CPU_LEVE → MEMORIA → CACHE → IO → FANOUT(K=1) → WRITER → OCIOSO → CREDITO → PRESSAO → AUTO_BREATH → RENDEZVOUS → FIXED_POINT.

### 5. FABLE LOOP NÃO INVENTA TRABALHO
- Se escopo tá completo e pendência é do CHEFE → loop DORME (watchdog acorda se cair).
- Não fabricar ação pra parecer ocupado (viola LESS_IS_MORE).

### 6. REALITY CONTRADICTION = GATILHO DE AÇÃO
- Se medir mostra serviço vivo virou MORTO → forçar recuperação (watchdog ou start direto) mesmo sem pergunta.
- Caso 31/08: 8788/8099/9119 caíram entre rodadas → forcei watchdog + subi dashboard 9119, re-medi, FIXED_POINT.

### 7. PADRÃO APLICADO NESTA SESSÃO
- R1 mede → contradição → recupera → R2 re-medir → salva acerto → R3 seguir pendências.
- MEDIR no fim de cada rodada, não assumir que tá igual (Omni Router PID muda entre rodadas).

## Template de Checkpoint FIXED_POINT
```markdown
## FIXED_POINT <ISO_TIMESTAMP>

### R1-Rn Concluídos
- R1: ...
- R2: ...
- Rn: ...

### Próximo: <próxima ação>
```