# 2026-10-04 — Hermes Self-Evolution × CentralDark — inventário lote 02

## Baselines

- Donor oficial separado: `NousResearch/hermes-agent-self-evolution`
- Donor CURRENT medido: `0a929e3aa20e15cf04dc7c28492a7d41a5139125`
- Hermes runtime local: `v0.21.5+6778.g81e1ce7`, commit `81e1ce78`
- CentralDark main no início da frente: `b5b72529be90b6649debce63ef80d9b90922fb21`
- Donor é referência de capacidade; não é autoridade para editar Hermes/CentralDark.

## Capacidade medida no donor

| Capability | Donor upstream | CentralDark equivalente | Owner/consumer atual | Classificação |
|---|---|---|---|---|
| Evolução de `SKILL.md` | `evolution/skills/evolve_skill.py` com DSPy + GEPA | skills em `.agents/skills`, receipts, método Kimetsu/COT/Fable | skill owner + Hermes carregamento | `REUSE_NATIVE` como motor candidato; `CENTRALDARK_EXTENSION` como gate |
| Dataset sintético | `SyntheticDatasetBuilder` | fixtures/testes/receipts existentes | skill/test owners | `REUSE_NATIVE` |
| Dataset de sessões | importers Claude/Copilot/Hermes; `~/.hermes/sessions/*.json` | `state.db`, sessões e receipts CentralDark | memória canônica + receipts | `REUSE_NATIVE` com redaction/escopo CentralDark |
| Train/validation/holdout | split 50/25/25 | Target split + adversarial second split + Reality Judge | COT-ReAct/Meta-Lupa/Fixed Point | `CENTRALDARK_EXTENSION` |
| Constraints | tamanho, crescimento, não vazio, semantic preservation, testes | UNKNOWN!=PASS, ACTION!=PROOF, one writer, rollback, green state | owners Trigger Fabric | `CENTRALDARK_EXTENSION` |
| Baseline × variante | fitness comparativa em holdout | prova/contraprova e fixed point | Reality Judge + receipts | `GOLD_KEEP` + adapter |
| Promoção | README declara PR/human review | CentralDark pode executar dentro de escopo já autorizado, sem falso verde | owner de promoção/PR-mãe | `CENTRALDARK_EXTENSION`; não remover upstream guardrail |
| Evolução de tool descriptions | planejada | sem consumer provado neste lote | UNKNOWN | `UNKNOWN` |
| Evolução de system prompt | planejada | SOUL/prompt/contratos são owners protegidos | UNKNOWN | `UNKNOWN` |
| Evolução de código | planejada | nenhum runtime donor comprovado | UNKNOWN | `UNKNOWN` |
| Loop contínuo | planejado no donor | scheduler/cron/event loop já existentes | Hermes nativo + CentralDark receipts | `CENTRALDARK_EXTENSION` |
| Criação automática de PR | descrita no README/PLAN | fluxo Git/PR existente | não provado no `evolve_skill.py` atual | `UNKNOWN` |

## Prova do fluxo atual

O `evolution/skills/evolve_skill.py` atual:

1. carrega uma skill do `HERMES_AGENT_REPO`;
2. cria/carrega dataset;
3. valida baseline;
4. executa GEPA/MIPROv2;
5. valida constraints da variante;
6. mede baseline contra variante em holdout;
7. salva `evolved_skill.md`, `baseline_skill.md` e `metrics.json`.

O fluxo atual observado não cria PR nem faz commit automaticamente. A frase do README sobre PR é desenho/guardrail do projeto, não prova do caminho atual de execução.

## Política CentralDark para o donor

```text
SENTINEL = detecta
SELF_EVOLUTION = propõe variante
HERMES = executa dentro do escopo autorizado
REALITY_JUDGE = mede/seleciona
RECEIPT = preserva prova
```

Não conectar o donor diretamente a commit, push, runtime ou auto-mutação do Sentinel.

## Decisão do lote

- `hermes-agent-self-evolution` é `DONOR_NATIVE_OFFICIAL` para evolução de skills.
- Não criar um motor CentralDark de GEPA/DSPy paralelo.
- Não promover variante apenas por score do modelo.
- Adicionar, quando houver consumer real, um adapter CentralDark que exija:
  - owner e escopo resolvidos;
  - baseline SHA e variante SHA;
  - dataset identificado;
  - holdout/second split;
  - constraints passadas;
  - ganho mensurável;
  - contraprova;
  - aprovação/policy de promoção;
  - receipt e rollback.
- Não executar otimização agora: este lote é inventário/classificação, sem skill candidata e sem dataset escolhido.

## Progresso persistente

- Lote 02 concluído: donor oficial de self-evolution medido.
- Ouro preservado: baseline → dataset → variante → constraints → holdout → ganho.
- Lacuna comprovada: PR automático e loop contínuo não estão provados no executor atual.
- Sem mutação de runtime e sem alteração de skills neste lote.

## Next cursor

`lote 03 → localizar skill CentralDark candidata de baixo risco → construir dataset/fixture mínimo → dry-run donor → não promover → Reality Judge/contraprova → decidir adapter ou apenas receipt`
