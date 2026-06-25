# Regra Oficial — Decisor

- **Título:** Decisor — camada de decisão dentro do Analista do Guardião
- **Data:** 25/06/2026
- **Responsável pela decisão:** Pivete
- **Onde foi registrado:** este arquivo + espelho em `mem://features/decisor`
- **Prioridade:** ALTA — define como o Analista decide o destino de cada evento

---

## 1. Por que o Decisor existe

O Analista hoje só deduplica, agrupa e respeita rate-limit. Isso reduz spam, mas continua reativo: tudo que sobrevive ao dedup vai pro Telegram. O Decisor entra como **cérebro de decisão** antes do despacho — calcula um score, escolhe uma ação e evita ruído sem perder o que importa.

## 2. Arquitetura

```text
GUARDIÃO ──► events.jsonl ──► ANALISTA ──► [Decisor] ──► Telegram
 detecta                       dedup/        score+ação    (ou silencia,
                               agrupa                       agrupa, eleva)
```

- **Mesmo processo PM2** do Analista (`guardiao-analista`). Sem novo processo.
- **Sem fila nova.** O Decisor é uma função pura chamada pelo `analista.py` antes do `notificar_telegram`.
- **Flag de segurança:** env `DECISOR_ENABLED` (default `true`). `false` faz o Analista voltar ao comportamento anterior.

## 3. Score (0–100)

3 sub-scores (0–1), pesos editáveis em `guardiao_rules.yaml` → seção `decisor:`.

| Sub-score | O que mede | Cálculo |
|---|---|---|
| **C** confiança | severidade do evento | `critico=1.0`, `erro=0.8`, `aviso=0.5`, `info=0.3` |
| **I** impacto | quanto afeta o sistema | tabela `source.key → peso (0–1)` no YAML; default `0.5` |
| **F** frequência | recorrência recente | `min(1, repeticoes_10min / 10)` |

Fórmula default:
```text
score = 100 * (0.4*C + 0.4*I + 0.2*F)
```

## 4. Faixas → ação

| Score | Ação | O que faz |
|---|---|---|
| ≥ 70 | `propor` | Manda pro Telegram via Analista, prefixo `[D:NN]` |
| 40–69 | `agrupar` | Buffer interno; solta 1 resumo por `event.key` a cada 5min |
| 20–39 | `ignorar` | Só loga em `logs/analista.log` |
| < 20 | `elevar` | Append em `docs/PENDENCIAS.md` pra revisão humana |

**Bypass de segurança:** `severity=critico` sempre vira `propor`, independente do score.

## 5. Controle de notificação (v1)

Em cima do rate-limit que já existe (5/60s, cooldown 90s, jitter 5–15s):

- **Orçamento diário:** máx 80 mensagens/24h. Estourou → só `critico` passa.
- **Modo pânico:** ≥5 `critico` em 60s → manda 1 mensagem `🚨 incidente múltiplo em andamento` e silencia os demais por 5min.

Silêncio noturno, anti-flapping e resumos programados ficam pra v2.

## 6. Registro de decisões (fonte da verdade)

Regra inviolável: `docs/CONSCIENCIA/` é a única fonte oficial.

1. **Regra operacional do Decisor:** este arquivo. Qualquer mudança de peso, faixa ou política passa por aqui antes do código/YAML.
2. **Decisões relevantes** (score ≥ 70 OU ação `elevar`): vão pra `docs/CONSCIENCIA/APRENDIZADOS.md` como aprendizado numerado, **não** em arquivo diário.
3. **Decisões rotineiras** (`agrupar`/`ignorar`): só `logs/analista.log`. Nunca poluir `CONSCIENCIA/`.
4. `mem://features/decisor` é espelho/cache, nunca fonte.
5. Notion e Mega Painel atualizam **depois**, refletindo o que já está aqui.

## 7. Trava de segurança mantida

O Decisor **não executa ações destrutivas**. Nunca reinicia processo, nunca mata container, nunca move arquivo. A trava do modo `auto` do Guardião continua válida até 08/07/2026 (ver `REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md`).

## 8. Arquivos envolvidos

**Criar:**
- `docs/CONSCIENCIA/REGRA-OFICIAL-DECISOR.md` (este)
- `infra/guardiao/analista/decisor.py`
- `infra/guardiao/tests/test_decisor.py`
- `.lovable/memory/features/decisor.md` (espelho)

**Modificar:**
- `infra/guardiao/analista/analista.py` (1 chamada antes do despacho, 4 ramos)
- `infra/guardiao/guardiao_rules.yaml` (nova seção `decisor:`)

## 9. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Engolir alerta crítico | `critico` tem bypass — sempre `propor` |
| Buffer de `agrupar` crescer demais | Limite 50 itens/key; estourou → solta resumo na hora |
| `CONSCIENCIA/` virar lixão | Só `score ≥ 70` ou `elevar` viram aprendizado |
| Quebrar o Analista | Flag `DECISOR_ENABLED=false` reverte em 1 restart |

## 10. Referências cruzadas

- [Hierarquia de Memória](./REGRA-OFICIAL-HIERARQUIA-MEMORIA.md)
- [Guardião v2 + Analista](./REGRA-OFICIAL-GUARDIAO-V2-ANALISTA.md)
- [Guardião — modo propor](./REGRA-OFICIAL-GUARDIAO-MODO-PROPOR.md)
- [APRENDIZADOS.md](./APRENDIZADOS.md) — destino dos registros relevantes do Decisor
