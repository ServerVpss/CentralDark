---
name: error-correction
description: >-
  Auto-healing transversal para qualquer modelo/agente/grupo do CentralDark.
  Descobrir e usar automaticamente quando houver ERROR, FAIL, DRIFT, REGRESSION,
  CONFLICT, UNKNOWN material, check vermelho, contrato divergente, teste quebrado,
  hash drift, memória/estado obsoleto, autoridade ambígua ou tool failure. O gatilho
  abre diagnóstico; nunca concede autoridade de escrita nem permite bypass.
---

# ERROR CORRECTION — AUTO-HEALING TRANSVERSAL

Responsabilidade única: **detectar desvio, localizar causa, coordenar a menor correção comprovável e devolver a execução ao mesmo fio da missão**.

Esta skill não substitui mecanismos existentes. Ela os compõe:

- `REUSE_BEFORE_CREATE` e contratos canônicos definem onde corrigir;
- `cot-react-loop` governa execução iterativa complexa durante a correção;
- `meta-lupa` falsifica hipótese, prova e a própria skill;
- Writer único executa a mutação autorizada;
- Judge independente sela promoção quando a missão exigir essa prova.

```text
ERROR_CORRECTION=AUTO_DISCOVERABLE
ALL_MODEL=true
ALL_AGENTS=true
ALL_GROUPS=true
ALL_REPO=true
SELF_HEALING=true
SELF_JUSTIFYING=false
REUSE_BEFORE_CREATE=true
META_LUPA=true
MENOS_E_MAIS=true
RETURN_TO_MISSION_THREAD=true
ZERO_DEPLOY=true
```

## 1. Autoridade e identidade

```text
SEGREDO/CHEFE = autoridade humana final
SOL = coordenação/convergência
PIVETE/HERMES = execução/continuidade; nunca autoridade humana
```

Regras:

- um Writer por escopo;
- Writer != Judge;
- perfil, memória, contexto, histórico, comentário, modelo e ferramenta não criam autoridade;
- `UNKNOWN|SKIPPED|QUEUED|PENDING != PASS`;
- auto-trigger inicia **DIAGNÓSTICO**, não escrita;
- outro Writer no mesmo escopo => `READ_ONLY + DELTA_MESSAGE`; não disputar caneta;
- ferramenta/corpo/modelo pode mudar; `MISSION_ID` e fio permanecem.

## 2. Auto-trigger

Aplicar automaticamente quando surgir qualquer condição material:

```text
ERROR
FAIL
DRIFT
REGRESSION
CONFLICT
UNKNOWN material
CHECK vermelho
CONTRATO divergente
TESTE quebrado
HASH drift
MEMÓRIA/ESTADO obsoleto
AUTORIDADE ambígua
TOOL failure
```

Não exige SEGREDO/CHEFE dizer “use Error Correction”.

```text
TRIGGER
→ CAPTURAR MISSION_ID/FIO
→ MEDIR ESTADO VIVO
→ CLASSIFICAR WRITER/ESCOPO
→ DIAGNOSTICAR
```

Se o evento não for material ou não alterar hipótese/risco/resultado, não abrir ciclo ornamental.

## 3. Loop canônico

```text
TRABALHAR
→ ERRAR
→ DETECTAR
→ LOCALIZAR CAUSA
→ REUSE_BEFORE_CREATE
→ CORRIGIR O MÍNIMO
→ PROVAR
→ CONTRAPROVA
→ JUDGE
→ EXTRAIR OURO
→ ENSINAR A SI MESMO
→ VOLTAR AO MESMO FIO
→ TRABALHAR MELHOR
↺
```

O loop nunca transforma erro em desculpa para reiniciar missão, duplicar arquitetura ou afrouxar gate.

## 4. Estado mínimo preservado

Antes de qualquer correção registrar:

```yaml
ERROR_CORRECTION_STATE:
  mission_id: ""
  thread: ""
  observed_state_sha: ""
  target: ""
  scope: ""
  writer: "NONE|nome"
  writer_collision: false
  trigger: ""
  symptom: ""
  cause: "UNKNOWN"
  evidence: []
  hypothesis: ""
  rejected_hypotheses: []
  minimal_fix: ""
  proof_expected: []
  return_to_mission_thread: true
```

Campo não provado permanece `UNKNOWN`.

## 5. Causa antes de sintoma — MENOS É MAIS

```text
SINTOMAS_MUITOS
→ localizar primeiro ponto causal compartilhado
→ corrigir fonte
→ retestar consumidores
```

É proibido corrigir 43 sintomas se uma fonte causal explicá-los.

Classificar causa:

```text
CONFIRMED | CANDIDATE | REFUTED | UNKNOWN
```

Só escrever correção quando a causa for `CONFIRMED` ou quando houver experimento mínimo, reversível e explicitamente identificado para distinguir hipóteses.

## 6. REUSE_BEFORE_CREATE

Antes de criar arquivo, regra, teste, helper, rota, skill ou mecanismo:

```text
buscar equivalente existente
→ abrir implementação primária
→ cruzar capacidade com erro
→ REUSE | EXTEND_MINIMALLY | GAP_REAL
```

```text
GAP_REAL=false → criação proibida
GAP_REAL=true  → criar apenas no caminho canônico autorizado
```

Nunca criar V2/V3, cópia, backup versionado, workflow paralelo, segundo orquestrador ou segunda fonte de verdade para contornar uma falha.

## 7. Writer collision e DELTA_MESSAGE

Se outro Writer estiver no mesmo escopo:

```text
MODE=READ_ONLY
WRITE=NAO
REWIND=NAO
```

Emitir somente:

```yaml
DELTA_MESSAGE:
  mission_id: ""
  from: "error-correction"
  mode: READ_ONLY
  observed_state_sha: ""
  delta_type: "ERROR|FAIL|DRIFT|REGRESSION|CONFLICT|UNKNOWN|TOOL_FAILURE"
  severity: "P0|P1|P2|P3"
  do_not_rewind: true
  cause: ""
  minimal_fix: ""
  evidence: []
  apply_if: ""
  reject_if: ""
  proof_expected: []
```

Handoff real é necessário antes de escrever no mesmo escopo.

## 8. Escrita segura

Quando não há colisão e a escrita está autorizada:

1. fixar HEAD/alvo;
2. preservar missão e fio;
3. alterar somente a fonte causal mínima;
4. não editar teste apenas para agradar implementação;
5. não rebaixar canônico para deixar gate verde;
6. não tocar secret, `.env`, token ou dado sensível;
7. não usar bypass, force-push, reset destrutivo, deploy ou restart;
8. retestar no **HEAD novo**.

Mudou a própria `error-correction/SKILL.md`? Revalidar selo/hash, testes e qualquer prova anterior ligada ao conteúdo antigo.

## 9. Prova e contraprova

Uma correção só sobrevive quando:

```text
FAIL_ANTES=PROVADO
CAUSA=PROVADA
FIX_MINIMO=APLICADO
TESTE_DEPOIS=PASS_NO_HEAD_NOVO
CONTRAPROVA=NAO_QUEBROU_HIPOTESE
REGRESSAO_MATERIAL=NAO
UNKNOWN_PROMOCAO=ZERO
```

Provas não contáveis como PASS:

- `UNKNOWN`, `SKIPPED`, `QUEUED`, `PENDING`, timeout;
- painel verde sem comportamento;
- teste de outro HEAD;
- ausência de erro sem teste discriminativo;
- teste enfraquecido/removido;
- explicação do Writer sem observação independente quando Judge for exigido.

## 10. Judge independente

Para promoção desta missão, ou quando o contrato ativo exigir Judge:

```text
JUDGE_WRITER=NAO
JUDGE_CAN_EDIT_PATCH=NAO
JUDGE_CAN_EDIT_PROTECTED_TESTS=NAO
JUDGE_REVIEWS_EXACT_HEAD=SIM
```

O Judge tenta encontrar:

```text
duplicação | bypass | autoridade errada | falso verde | teste adaptado
causa não provada | regressão | segredo | colisão de Writer | perda do fio
```

Judge não cria uma segunda missão. Achado retorna ao mesmo `MISSION_ID` como delta causal.

## 11. Autoaprendizado sem lixo

```text
CONFRONTO
→ INFORMAÇÃO NOVA
→ DELTA DE CRENÇA
→ REGRA|TESTE|GUARDRAIL
→ OURO
```

Promover ouro somente se:

```text
EVIDENCIA_NOVA=SIM
DELTA_DE_CRENCA=SIM
REUTILIZAVEL=SIM
```

Regras:

- hipótese derrotada sai do estado de verdade; pode permanecer apenas como histórico refutado;
- ouro novo refina/substitui ouro anterior no mesmo artefato;
- não criar “memória da memória”;
- Git preserva histórico;
- `MESMO_ERRO + ZERO_INFORMACAO_NOVA + ZERO_MUDANCA = DESPERDICIO`.

## 12. SELF_HEALING != SELF_JUSTIFYING

A skill deve conseguir concluir contra si mesma.

```text
EVIDENCIA_MATA_HIPOTESE → HIPOTESE_MUDA_OU_MORRE
EVIDENCIA_MATA_REGRA    → REGRA_MUDA_OU_MORRE
EVIDENCIA_MATA_SKILL    → SKILL_REFINA_OU_E_REMOVIDA
```

É proibido reinterpretar resultado, baixar critério, culpar instrumento sem prova ou editar teste para preservar a skill.

## 13. Papéis dinâmicos

Conforme a causa, usar papel já existente e apenas pelo tempo necessário:

```text
REVIEWER | WRITER | JUDGE | TESTER | RESEARCHER
REBUTTAL | DEBUGGER | SECURITY | equivalente existente
```

Papel temporário não vira identidade, nova autoridade ou novo sistema. Terminou a função => devolver caneta e convergir.

## 14. Testes determinísticos obrigatórios da skill

A implementação deve provar:

1. detecta erro e preserva/retorna ao mesmo fio;
2. não rouba caneta de Writer ativo;
3. não transforma UNKNOWN em PASS;
4. rejeita bypass;
5. escolhe causa em vez de sintomas quando a causa comum é provada;
6. erro na própria skill permite refiná-la;
7. hipótese derrotada não fica como verdade ativa;
8. aprendizado válido produz delta canônico;
9. repetição sem informação nova não gera ouro;
10. contrato é independente do nome do modelo/agente.

Os testes ficam em `.agents/skills/error-correction/tests/` e validam contrato, não comportamento de um provider específico.

## 15. MetaLupa sobre a própria skill

Antes de promover qualquer mudança nesta skill, responder e testar:

```text
DUPLICACAO?             → NAO
ARQUITETURA_PARALELA?   → NAO
AUTORIDADE_ERRADA?      → NAO
FALSO_VERDE?            → NAO
TESTE_ADAPTADO?         → NAO
DELTA_ORNAMENTAL?       → NAO
SEGREDO?                → NAO
DEPLOY?                 → NAO
COLISAO_DE_WRITER?      → NAO
SEM_VOLTA_AO_FIO?       → NAO
```

Qualquer `SIM|UNKNOWN` material => corrigir e repetir.

## 16. Condição de encerramento

```text
HEAD_FIXADO=SIM
TESTES_APLICAVEIS=PASS
JUDGE_INDEPENDENTE=PASS
P0_P1_MATERIAL=0
UNKNOWN_PROMOCAO=0
RECEIPT_COERENTE=SIM
WRITER_COLLISION=NAO
RETURN_TO_MISSION_THREAD=SIM
ZERO_DEPLOY=SIM
```

Se não fechar, continuar no mesmo fio ou declarar bloqueio real. Nunca forçar PASS.
