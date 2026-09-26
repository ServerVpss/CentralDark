# 🧠 AUDITORIA ADVERSARIAL META LUPA VS CLAUDE FABLE 5
## Padrão fixo do laboratório — XP/Ledger real da skill (não inventado)

Fonte: `.agents/skills/meta-lupa/SKILL.md` (canônico, blob `f165f949`), seção
"Camada XP Consolidada", executado via `scripts/meta_lupa.py` (mesmo script
já baixado do repo canônico nesta sessão, hash `cb74ab68`).

Este é o padrão único usado em toda esta auditoria. Nada de gamificação
paralela, nada de v2 — é a mecânica real que já existe no repositório.

---

## 1. XP só é concedido por prova, nunca por afirmação

```
erro_reproduzido        = 5   (exige --error-found)
causa_raiz_provada       = 10  (exige --root-cause)
prova_contraria_encontrada = 10  (exige --counter-evidence)
falso_verde_bloqueado    = 20  (exige --false-green-blocked)
teste_negativo_criado    = 15  (exige --test-created)
regressao_criada         = 20  (exige --regression-created)
guardrail_novo           = 20  (exige --guardrail-added)
rollback_provado         = 20  (exige --rollback-proven)
risco_critico_evitado    = 30  (exige --risk)
duplicacao_real_removida = 15  (exige --improvements)
ponto_fixo_atingido      = 25  (exige --point-fixed sim)
```

Cada achievement pedido tem que vir junto com o flag de evidência
correspondente — o script recusa (`XP_REQUIREMENT_MISSING:<nome>`) se a
prova não estiver anexada. Sem `--evidence`, nenhum achievement é aceito
(`XP_REQUIRES_EVIDENCE`).

## 2. Penalidade real se eu inflar ou pular prova

```
falso_verde_declarado    = -25
evidencia_inventada      = -50
ledger_orfao             = -15
sucesso_sem_teste        = -10
alteracao_sem_autorizacao = -30
```

Total nunca fica negativo (trava em zero).

## 3. Nível e tier

```
custo_proximo_nivel = ceil(100 * 1.15^(nivel - 1))
```

| Nível | Tier |
|---|---|
| 1–9 | OPACA |
| 10–29 | MONÓCULO |
| 30–49 | PRISMÁTICA |
| 50+ | OMNIVISOR |

## 4. Deduplicação (não dá pra repetir o mesmo achado pra farmar XP)

`fingerprint = SHA256(MISSION_ID + causa_raiz + teste + evidencia + HEAD_SHA)`.
Se o fingerprint já existe num `FINAL` anterior do ledger, `XP_GAINED=0` e
`NO_XP_REASON=EVENTO_JA_REGISTRADO`. Painel verde, HTTP 200, tempo ligado ou
repetição de texto NUNCA geram XP.

## 5. Fluxo obrigatório por rodada de teste

```bash
python3 meta_lupa.py begin-use \
  --repo ServerVpss/CentralDark \
  --mission-id <id-da-rodada> \
  --skill-path .agents/skills/meta-lupa/SKILL.md \
  --skill-ref main --skill-commit-sha <sha> \
  --workspace-head <sha-local> --mode read-only

# ... executa o teste real, coleta prova ...

python3 meta_lupa.py finish-use \
  --mission-id <id-da-rodada> \
  --verdict <APROVAR|CONDICIONAR|CORRIGIR|BLOQUEAR> \
  --autolupa sim --point-fixed <sim|nao> \
  --evidence <caminho-ou-hash-da-prova> \
  --achievement <nome> --error-found "<descrição>" \
  ...
```

Cada rodada abre `BEGIN` e fecha `FINAL` no ledger canônico
`references/uso-ledger.jsonl`. Registro sanitizado automaticamente (secrets,
paths de usuário) antes de gravar.

## 6. Regra de ouro desta auditoria (pedido explícito do Chefe)

- **Sem falso verde.** Se `check_config.py`/teste passar sem eu ter rodado e
  visto com meus olhos, não conta.
- **Aplicação bruta.** Sem atalho, sem economizar rodada, sem pular passo do
  fluxo BEGIN→teste→FINAL.
- **Todo ganho registrado no commit.** Cada commit desta auditoria cita:
  achievement batido, XP ganho, nível/tier resultante, e onde exatamente a
  META LUPA melhorou ou falhou — no formato leigo da seção 14 do
  `PROJECT-KNOWLEDGE-CENTRALDARK-V2.md`:
  ```
  O que aconteceu:
  Por que importa:
  O que vou verificar:
  O que nao vou mexer:
  Proximo passo:
  ```

---

**Status:** padrão fixado, aguardando o prompt da missão adversarial
(Claude Fable 5 real, `--model claude-fable-5 --effort medium`, vs META LUPA)
para começar a rodar.
