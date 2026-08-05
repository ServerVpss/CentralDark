# PRODUCTION GUARDRAILS CONTRACT — CentralDark

**MISSÃO:** Fechar o contrato determinístico da proteção de produção sem transformar a VPS atual em fonte da verdade e sem devolver operação rotineira ao Pivete.

**BASE_SHA observado na abertura:** `26d92270da4d5707dd378b942a36b07d4ef097c8`

**DATA:** 2026-08-05

**STATUS DO DOCUMENTO:** `CONTRATO_REVISADO_PARA_IMPLEMENTAÇÃO`

> Este documento fecha o contrato. Ele não prova que a autonomia de produção já foi implementada.

---

## 1. Autoridade e significado de autonomia

A autonomia vale somente dentro de uma missão previamente autorizada e presa a escopo verificável.

```text
PIVETE DEFINE INTENÇÃO + ESCOPO + CLASSE DE AÇÃO UMA VEZ
→ CÓDIGO VALIDA O CONTRATO
→ AGENTES PRODUZEM E CORRIGEM
→ GATES PROVAM
→ PROMOTOR EXECUTA O AUTORIZADO
→ MONITORAMENTO CONFIRMA
→ GUARDRAILS CONGELAM OU REVERTEM
```

O Pivete não deve:

- aplicar label rotineira;
- reexecutar workflow;
- vigiar créditos de provider;
- apertar merge já autorizado e comprovado;
- decidir novamente o que já está determinado no contrato da missão.

A automação deve bloquear e notificar somente quando ocorrer:

- expansão de escopo;
- risco de segurança;
- evidência contraditória;
- `UNKNOWN` não solucionável por código;
- ação destrutiva não autorizada;
- ausência de artefato anterior comprovado.

---

## 2. Fonte da verdade e limites do runtime

```text
GITHUB_REPOSITORY=FONTE_DA_VERDADE
ARTEFATO_COM_HASH=UNIDADE_DE_DEPLOY
VPS=EXECUTOR_RUNTIME
VPS_ATUAL=EVIDÊNCIA_HISTÓRICA, NÃO AUTORIDADE ARQUITETURAL
```

A implantação futura deve substituir o estado divergente da VPS por um artefato reproduzível gerado a partir do repositório. O contrato não exige preservar nomes, snapshots ou processos antigos somente porque existem no runtime legado.

---

## 3. Evidência observada no repositório

| Componente | Estado comprovado | Limite real |
|---|---|---|
| Juiz e promotor | Existem em `scripts/github-autonomia-promocao.mjs` e no workflow de autonomia | Promoção ponta a ponta ainda precisa de prova no mesmo HEAD |
| Health pós-deploy | `scripts/postdeploy-healthcheck.sh` valida MCP de forma pontual | Não valida SHA do artefato; o E2E público é não bloqueante |
| Rollback MCP | `scripts/rollback-mcp.sh` possui snapshot e restauração manual | Snapshot não possui receipt/hash de artefato e usa estado local da VPS |
| Health VPS | `.github/workflows/vps-healthcheck.yml` roda a cada 6 horas | Coleta estado e notifica; não fecha STOP_WRITE/rollback |
| Notificação | Existem caminhos de notificação | Falta contrato de eventos, deduplicação e recibo `NOT_SENT` no fluxo de produção |
| Provider health | Existe classificador sanitizado | Deve ser reutilizado; indisponibilidade de IA não pode paralisar gates determinísticos |

### Lacunas correlatas confirmadas

1. `.github/workflows/autonomia-promocao.yml` ainda usa fallback de `PROMOTION_TOKEN` para `github.token`. Isso é uma lacuna de separação de poderes, mas não deve ser escondido dentro do motor de produção.
2. `.env` está rastreado na raiz apesar de `.gitignore` proibir `.env`. O conteúdo não deve ser lido nem reproduzido; remoção do tracking, scanner e rotação pertencem a uma trilha de segurança P0 separada.
3. O PR documental não pode declarar autonomia concluída sem código, testes, deploy seguro e prova de rollback.

---

## 4. Definição precisa de STOP_WRITE

`STOP_WRITE` não significa interromper gravações dos clientes ou corromper tráfego de aplicação.

Neste contrato:

```text
STOP_WRITE_SCOPE=CI_PROMOTION_AND_DEPLOY
```

Ao ativar:

- bloquear novos merges promovidos pela autonomia;
- bloquear novos deploys;
- congelar o candidato atual;
- preservar logs e receipts;
- impedir que outro agente altere o mesmo alvo;
- manter o serviço estável atual enquanto a causa é classificada.

Bloqueio de escrita funcional da aplicação somente pode existir em contrato específico do produto, nunca como efeito implícito deste guardrail.

---

## 5. Máquina de estados determinística

```text
OBSERVING
→ EVALUATING
→ HEALTHY

EVALUATING
→ DEPLOY_FROZEN
→ CAUSE_CLASSIFIED
→ ROLLBACK_ELIGIBLE
→ ROLLBACK_RUNNING
→ VERIFYING_RECOVERY
→ RECOVERED

QUALQUER ESTADO
→ SECURITY_BLOCKED
→ PRODUCTION_BLOCKED
→ UNKNOWN
```

Regras:

- cada transição possui entrada, regra, evidência e saída;
- `SKIPPED`, ausência de medição e parse inválido nunca viram `HEALTHY`;
- mudança de artefato ou SHA invalida evidência anterior;
- execução concorrente usa lock atômico e idempotency key;
- nenhum rollback começa sem alvo anterior comprovado.

---

## 6. Política de sinais: congelar não significa sempre reverter

O erro central do contrato anterior era usar `combine=ANY` seguido de rollback obrigatório. Nem toda falha é causada pelo deploy. Reverter durante falha externa pode piorar o incidente.

### Classe A — crítica e diretamente ligada ao artefato

Ativa `DEPLOY_FROZEN` e torna rollback elegível imediatamente:

- runtime SHA diferente do SHA promovido;
- artefato sem checksum/receipt válido;
- health profundo com schema inválido após o deploy;
- processo crítico do artefato recém-implantado parado;
- scanner de segurança crítico ligado ao artefato;
- canário falhou enquanto o artefato anterior estava saudável.

### Classe B — degradação sustentada e correlacionada

Ativa `DEPLOY_FROZEN`. Rollback somente após correlação com o deploy:

- taxa de 5xx acima do limite com volume mínimo;
- p99 acima do limite junto com queda do health profundo;
- restart storm calculado por delta na janela, nunca por contador vitalício;
- falhas consecutivas de endpoints críticos;
- regressão de métrica contra baseline versionado.

### Classe C — dependência ou provider externo

Ativa congelamento, failover e notificação. Não autoriza rollback por padrão:

- banco, Redis ou API externa indisponível;
- provider de IA sem crédito, limitado ou offline;
- falha de DNS/rede externa;
- indisponibilidade do canal de notificação.

### Classe D — evidência insuficiente

```text
MEDIÇÃO_AUSENTE
PARSE_INVÁLIDO
BASELINE_AUSENTE
ARTEFATO_ANTERIOR_NÃO_PROVADO
CAUSA_CONTRADITÓRIA
→ UNKNOWN
→ DEPLOY_FROZEN
→ SEM ROLLBACK AUTOMÁTICO
```

---

## 7. Correlação obrigatória antes do rollback

Rollback automático é permitido somente quando pelo menos uma condição for verdadeira:

1. existe divergência direta entre SHA esperado e runtime;
2. o incidente começou dentro da janela pós-deploy e o artefato anterior possui prova de saúde;
3. o canário do novo artefato falhou antes da promoção completa;
4. teste determinístico reproduz a regressão no novo artefato e não no anterior.

Fora dessas condições:

```text
DEPLOY_FROZEN=true
ROLLBACK_ELIGIBLE=false
```

---

## 8. Política versionada

A política deve ser versionada e validada por schema. Limites não podem nascer como números decorativos; devem vir de baseline, contrato do serviço ou teste de carga reproduzível.

Estrutura mínima:

```json
{
  "schema": "centraldark.production-guardrails.v1",
  "mode": "SHADOW|ENFORCE",
  "observation_window_seconds": 300,
  "cooldown_seconds": 300,
  "max_rollback_attempts": 1,
  "rollback_target": "PREVIOUS_PROVEN_ARTIFACT",
  "critical_processes_ref": "CANONICAL_RUNTIME_MANIFEST",
  "thresholds_ref": "VERSIONED_BASELINE",
  "actions": {
    "freeze": true,
    "rollback_requires_correlation": true,
    "notify": true,
    "emit_receipt": true
  }
}
```

A ativação deve começar em `SHADOW`, produzir evidência e somente depois migrar para `ENFORCE` no mesmo contrato canônico.

---

## 9. Artefato anterior comprovado

`PREVIOUS_PROVEN_ARTIFACT` exige:

- commit SHA;
- hash do artefato;
- origem do workflow;
- resultado de build;
- resultado de health/canário;
- timestamp;
- ambiente;
- receipt íntegro;
- localização recuperável;
- compatibilidade de migração/rollback.

Um diretório local criado por `cp` sem receipt e hash não é prova suficiente para rollback autônomo.

---

## 10. Implementação mínima, melhorando o que existe

1. Evoluir `scripts/postdeploy-healthcheck.sh`:
   - validar JSON por parser real;
   - validar schema;
   - comparar SHA esperado com runtime;
   - tornar todos os checks declaradamente bloqueantes ou não bloqueantes;
   - emitir saída estruturada sanitizada.

2. Evoluir `scripts/rollback-mcp.sh` ou substituí-lo internamente pelo executor canônico:
   - aceitar somente artifact receipt válido;
   - usar lock e idempotency key;
   - não escolher snapshot apenas por data;
   - validar compatibilidade antes da restauração;
   - verificar saúde e SHA após rollback;
   - executar no máximo uma tentativa automática.

3. Evoluir `.github/workflows/vps-healthcheck.yml`:
   - separar coleta de decisão;
   - não publicar `pm2 jlist` bruto;
   - calcular deltas de restart;
   - produzir evento sanitizado;
   - reduzir a dependência exclusiva do cron de 6 horas;
   - manter execução periódica como fallback, não como único detector.

4. Reutilizar `scripts/agent-notify.mjs` e o classificador de provider:
   - eventos versionados;
   - deduplicação por missão + artefato + evento + causa;
   - `NOT_SENT` quando o canal falhar;
   - zero segredo em log.

5. Adicionar um único coordenador de guardrails somente se a busca provar que não existe equivalente canônico. Ele deve orquestrar os componentes acima, não duplicá-los.

6. Tratar separadamente, mas no mesmo programa de fechamento:
   - remover fallback silencioso do `PROMOTION_TOKEN`;
   - retirar `.env` do tracking sem reproduzir conteúdo;
   - rotacionar valores potencialmente expostos;
   - provar que scanner e `.gitignore` impedem recorrência.

---

## 11. Eventos e receipts

Eventos mínimos:

```text
PRODUCTION_SIGNAL_OBSERVED
DEPLOY_FROZEN
ROLLBACK_ELIGIBLE
ROLLBACK_NOT_ELIGIBLE
ROLLBACK_STARTED
ROLLBACK_SUCCEEDED
ROLLBACK_FAILED
RECOVERY_VERIFIED
PRODUCTION_BLOCKED
NOTIFICATION_NOT_SENT
```

Receipt mínimo:

```text
MISSION_ID=
REPOSITORY=
ENVIRONMENT=
DEPLOY_SHA=
ARTIFACT_SHA256=
PREVIOUS_ARTIFACT_SHA256=
SIGNAL_CLASS=
SIGNAL_VALUES=
BASELINE_REF=
DECISION_RULE=
ACTION=
RESULT=
TIMESTAMP_UTC=
IDEMPOTENCY_KEY=
```

---

## 12. Testes de contrato obrigatórios

1. 5xx abaixo do volume mínimo → nenhuma reversão.
2. 5xx sustentado e correlacionado ao deploy → freeze + rollback elegível.
3. p99 alto isolado → freeze/observação, sem rollback automático.
4. p99 alto + health degradado após deploy → rollback elegível.
5. SHA mismatch → freeze imediato + rollback elegível.
6. restart storm usa delta de janela, não contador acumulado.
7. dependência externa indisponível → failover/freeze, sem rollback padrão.
8. provider sem crédito → fallback + notificação; gates determinísticos continuam.
9. medição ausente ou inválida → `UNKNOWN`, nunca PASS.
10. ausência de artifact receipt anterior → rollback bloqueado.
11. duas execuções concorrentes → somente uma adquire lock.
12. repetição do mesmo evento → ação idempotente e notificação deduplicada.
13. rollback saudável → `RECOVERED` com SHA comprovado.
14. rollback falho → `PRODUCTION_BLOCKED` e sem segunda tentativa automática.
15. canal de notificação falho → `NOT_SENT`, sem falso relato.
16. modo `SHADOW` → nenhuma mutação, somente receipts.
17. modo `ENFORCE` → somente ações explicitamente autorizadas.

---

## 13. Definition of Done da autonomia de produção

A autonomia de produção somente pode ser declarada `VERIFIED` quando o mesmo conjunto de SHAs provar:

```text
POLICY_SCHEMA=PASS
SHADOW_REPLAY=PASS
CANARY_FAILURE=DETECTED
DEPLOY_FREEZE=PROVED
ROLLBACK_ELIGIBILITY=PROVED
ROLLBACK=PROVED_IN_SAFE_ENVIRONMENT
POST_ROLLBACK_SHA=PROVED
POST_ROLLBACK_HEALTH=PASS
IDEMPOTENCY=PASS
CONCURRENCY_LOCK=PASS
TELEGRAM_OR_PANEL_RECEIPT=PROVED_OR_NOT_SENT_RECORDED
ZERO_SECRET_OUTPUT=PASS
ZERO_REGRESSION=PASS
```

Este PR documental pode ser aprovado como contrato. Ele não deve receber o veredito de autonomia implementada.

---

## 14. Veredito reconciliado

```text
MISSION_ID=CENTRALDARK-AUTONOMIA-DETERMINISTICA-END-TO-END
CONTRACT_STATUS=REVIEWED_FOR_IMPLEMENTATION
PRODUCTION_AUTONOMY=NOT_IMPLEMENTED
PROMOTION_AUTONOMY_END_TO_END=UNPROVEN
VPS_LEGACY_AS_SOURCE_OF_TRUTH=REFUTED
STOP_WRITE_SCOPE=CI_PROMOTION_AND_DEPLOY
ROLLBACK_ON_ANY_SIGNAL=REFUTED
ROLLBACK_REQUIRES_CAUSAL_CORRELATION=YES
AI_IN_CRITICAL_DECISION_PATH=NO
PIVETE_ROUTINE_INTERVENTION=NO
VERDICT=VERIFIED_WITH_CAVEATS
```

**Pivete apresenta intenção e autoridade. Código carrega, executa, corrige e prova. IA trabalha no `UNKNOWN`; não substitui o gate determinístico.**
