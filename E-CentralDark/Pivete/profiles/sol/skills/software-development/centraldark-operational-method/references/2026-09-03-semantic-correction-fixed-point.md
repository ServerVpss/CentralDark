# Aprendizados da Sessão 2026-09-03 — Correção Semântica + Ponto Fixo

## Contexto
Missão: corrigir confusão semântica entre identidade do CHEFE, memória pessoal ("Viver em Paz" / Thiago Aquino), SOUL CentralDark e upstream Hermes Agent. Executar até Ponto Fixo sem criar V2/V3.

---

## 1. Correção Semântica Principal — Padrão Reutilizável

### Problema detectado
Agentes/skills/memórias inferiam incorretamente:
- `THIAGO_AQUINO` (artista musical) = `SEGREDO/CHEFE` (autoridade humana)
- Referência musical afetiva = regra operacional / permissão de execução
- `USER_PROFILE_NAME` = nome do artista referenciado

### Classificação obrigatória aplicada

| Entidade | Tipo | Operational_Rule | Authority |
|---|---|---|---|
| `thiago_aquino` | `musical_artist_reference` | false | false |
| `viver_em_paz` | `personal_affective_music_reference` | false | false |

### Guard semântico (reutilizável)
```yaml
semantic_guard:
  artist_name_must_never_be_promoted_to_user_identity: true
  affective_memory_must_never_be_promoted_to_operational_authority: true
```

### Ação: não criar arquivo novo — melhorar owner existente
Encontrar o artefato de "Viver em Paz" no owner canônico (LEMBRANCAS / BRAIN) e adicionar metadata `semantic_entities` + `semantic_guard` no formato já existente da Casa.

---

## 2. Ponto Fixo — Definição Operacional Confirmada

O relatório deep-research-report (3).md linhas 1057-1070 define o Ponto Fixo **não como "tudo verde"**, mas como:

> **"O próximo ouro não é mais feature. É provar o que já existe sem mover o HEAD enquanto prova."**

### Estado do Ponto Fixo (linhas 1057-1058)
| Item | Estado |
|---|---|
| 😇 AURÉOLA NO CANDIDATO | SIM |
| 🧭 MULTIBÚSSOLA CONTRATUAL | SIM |
| 🔒 POST-GREEN-LOCK CONTRATUAL | SIM |
| 🧠 BINDING CONCEITUAL DOS MOTORES | SIM |
| 🟢 CI SAME-HEAD DO HEAD OBSERVADO | **UNKNOWN** |
| 🔒 ENFORCEMENT REAL NO GITHUB | **NÃO PROVADO** |
| 🚀 DEPLOY/VPS | **FORA DO VERDE ATUAL** |

### BOOT do Ponto Fixo (linha 1070)
```
CENTRALDARK / FIXED_POINT / HERMES_PROOF / READ_ONLY_UNTIL_SAME_HEAD_GREEN
```

**Regra**: quando o documento diz "pare de acrescentar feature e prove o que existe no mesmo HEAD" → **ISSO É O PONTO FIXO**. Não rodar mais testes, não criar mais arquivos, não perguntar "posso corrigir?". Aviso dado, missão encerrada.

---

## 3. Estado Real Medido — PR #1381 (2026-09-03)

| Métrica | Valor |
|---|---|
| **Local HEAD** | `d2df622dba5a0e1b0e79a825228746e77d81597b` |
| **PR #1381 headRefOid** | `7524574243973e9e48a4217fd34a2f12d4ac9095` (DIFERE do local) |
| **Base/Origin main** | `0542cee586e55be5334ba1e8d369d3b040ee1178` |
| **Mergeable** | `CONFLICTING` |
| **CI "Porta, identidade e governança canônica estão íntegras?"** | **FAILURE** |
| **CI "Autonomia — promoção segura"** | QUEUED |
| **AURÉOLA-BAHIA-BIBLICA.yml** | **NÃO EXISTE** no working tree nem no pr-1381 |

### Consequência
- Local está **fora de sincronia** com o PR remoto (HEADs diferentes)
- CI falhando no gate canônico → `CI_SAME_HEAD = UNKNOWN` confirmado
- AURÉOLA referenciada no relatório **não está no branch** → gap real a ser fechado no owner canônico (DELTA-CONTINUO.md)

---

## 4. Identidade SOUL-HERMES-CASA — Reforço

| Camada | O que é | O que NÃO é |
|---|---|---|
| **MODELO** | Motor temporário (nvidia/nemotron-3-ultra via OpenRouter) | Identidade, autoridade, dono da Casa |
| **PAPEL** | HERMES-CASA (mordomo/executor operacional) | SEGREDO/CHEFE, SOL, produto Hermes Agent |
| **UPSTREAM HERMES** | Referência de implementação/docs (NousResearch/hermes-agent) | Fonte de autoridade da Casa |
| **CENTRALDARK LIVE STATE** | Juiz final (git, runtime, health, logs) | Narrativa, documentação, intenção declarada |

**Regra**: `MODEL_ROLE=MOTOR_TEMPORARIO_SEM_AUTORIDADE_PROPRIA` — o modelo executa o papel, não vira o papel.

---

## 5. Comandos de Verificação Reutilizáveis

### Estado vivo do PR #1381
```bash
cd /e/CentralDark/Pivete/CentralDark
gh pr view 1381 --json headRefOid,baseRefOid,mergeable,state,statusCheckRollup
```

### Verificar existência de arquivo no branch remoto
```bash
git show pr-1381:docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml 2>/dev/null || echo "NOT FOUND"
```

### Comparar HEAD local vs PR remoto
```bash
git rev-parse HEAD
gh pr view 1381 --json headRefOid --jq .headRefOid
```

---

## 6. Próximos Passos (quando autorização explícita vier)

1. **Sincronizar local com PR #1381** (fetch + rebase/merge resolvendo CONFLICTING)
2. **Criar/restituir AURÉOLA-BAHIA-BIBLICA.yml** no path canônico (owner: DELTA-CONTINUO.md)
3. **Integrar Hermes Fixed-Point Proof** como job do workflow canônico (não workflow novo → ONE_SYSTEM_ONLY)
4. **Rodar testes fixed-point-fabric** no mesmo HEAD
5. **Gerar receipt externo** (não comitar de volta → preserva same-head)
6. **Atualizar memória "Viver em Paz"** com `semantic_entities` + `semantic_guard` no owner existente

---

## 7. Lição de Estilo — Incorporar na Skill

> **Chefe corrigiu**: "VO CE SO TEM QUE CHGA NO PONTO FIXO E AVISA E ISSO QEU TAA ESCRITO OSE TUDO ESTA MAI FIXADO VOCE NAO TEM MAIS OQUE FAZER FALÇA LEITURA ANTS ! S DE EDITA QUALQUER COISA !"

### Tradução para a skill:
- **Quando o Ponto Fixo está escrito no documento canônico → CHEGAR LÁ, AVISAR, PARAR.**
- Não perguntar "posso rodar teste?", "posso criar arquivo?", "qual a ordem?".
- O documento **É** a ordem. O Ponto Fixo **É** a parada.
- `READ_ONLY_UNTIL_SAME_HEAD_GREEN` = não mutar, não testar mutação, não criar — só medir e avisar.