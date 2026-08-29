# Triagem Fabler — Backlog de Pendências

**Data:** 2026-08-29 · **Método:** Fabler Loop (ler → medir → veredito → 3 mudanças)
**Escopo:** `docs/PENDENCIAS.md` · **Postura:** não-destrutiva, evidência antes de afirmação

---

## 1. Medição (não alegação)

| Métrica | Valor |
|---|---|
| Itens operacionais totais | 53 |
| Realmente abertos | 46 (28 🔴 · 13 🟡 · 6 🟢) |
| Itens temáticos abertos | 6 (`#1`, `#3`, `#4`, `#5`+11 sub, `#14`, `#15`) |
| Data do item mais recente | 09/07/2026 |
| **Decantação do backlog** | **~7 a 11 semanas** |

Regra Fabler: item que descreve sistema em execução e não é tocado há 7+ semanas
é **presumido obsoleto até ser re-medido**. Metade deste backlog nunca foi re-medida.

## 2. Achado estrutural — o backlog está inflado ~6×

46 itens não são 46 problemas. São ~8 frentes fragmentadas em tickets:

| Frente | Itens | Real |
|---|---|---|
| Auditoria WebUI | `#40`–`#50` (11) | 1 auditoria — `#40` é literalmente o placar dos outros 10 |
| Migração docs legado | `#5.1`–`#5.11` (11) | 1 migração |
| Hermes quebrado | `#20 #21 #25 #26 #29 #30 #32 #33` (8) | 1 causa-raiz |
| Grafo / Painel | `#22 #23 #34 #35 #36` (5) | 1 workstream |
| MCP Catalog | `#15 #16` | 1 |
| Telegram / HUB | `#18 #19` | 1 (ambos travados no mesmo pré-requisito) |

**Consequência:** o número 46 induz paralisia. O número real é 8.

## 3. Cluster Hermes — causa-raiz única

`#26` (ERR_MODULE_NOT_FOUND no executor) e `#29` (ReferenceError trava executor)
são a **causa**. O resto é sintoma do executor morto:

- `#25` não notifica no Telegram → executor caiu
- `#32` 5 IAs paradas, debate nunca rodou → executor caiu
- `#33` Grupo da Evolução não ativa → depende de `#32`
- `#30` Hermes potente + web search → depende de executor vivo

**Veredito:** consertar `#26`+`#29` fecha 6 itens de graça. Atacar os sintomas
individualmente é desperdício puro.

## 4. DREAD — cluster de segredos (recalculado)

| # | Achado | DREAD | Correção do Fabler |
|---|---|---|---|
| `#43` | Bearer token real commitado em `apps/modulos/WebUI/mcpo-config/config.json` | **9** | Mantém 🔴 |
| `#41` | `ANTHROPIC_API_KEY` + `OPENAI_API_KEYS` no `docker-compose.yml`; `WEBUI_SECRET_KEY` vazia; imagem `:main` sem pin | **8.5** | Mantém 🔴 |
| `#47` | 11× `innerHTML` com dado de API em `hermes-panel.js` | 6 | Mantém 🔴 |
| `#42` | `emerald.css` (38 linhas/19 `!important`) × `esmeralda.css` (562/133) | 4 | Rebaixar 🟡 |
| `#50` | README cobre 4 de 8 arquivos | 3 | Rebaixar 🟢 |
| `#45` | "chaves hardcoded" em `tune-config.py` | **2** | **Rebaixar 🟢 — falso positivo** |

**Correção material em `#45`:** o valor tratado como chave vazada é o literal
`SEGREDO_ELITE_123` — placeholder, não credencial. Está classificado 🔴 sem motivo.

**Ponto crítico em `#43` e `#41`:** os segredos **já estão no histórico do git**.
Editar o arquivo não corrige nada — a credencial permanece recuperável em qualquer
clone. **Rotação é obrigatória e precede qualquer edição.**

## 5. Verificações que corrigem o registro

| # | Alegação registrada | Realidade medida | Ação |
|---|---|---|---|
| `#10` | 🟡 ABERTO | Cabeçalho já dizia "✅ CONCLUÍDO 2026-07-06" + nota final | Fechado (escrituração) |
| `#24` | 🟢 ABERTO | É registro de decisão, não tarefa — critério "nunca reabrir" nunca poderia ser cumprido | Fechado (reclassificação) |
| `#38` | 🔴 ABERTO (87 commits divergentes) | Divergência colapsada; main realinhada em 29/08 sem force-push (`911776a28..0cea96a2e`) | **Parcial** — falta só corrigir a automação do painel |
| `#49` | "`ui.centralldark.com` NÃO existe em `infra/caddy/`" | Existe em `mcp.Caddyfile`, **mas só como CORS Origin** — não há bloco de site | **Continua aberta** (alegação imprecisa, substância válida) |
| `#52` | PR #142 aberto | Commit `1a537ffbf` existe apenas em `origin/fix/gateway-tool-call-id-sanitize`, ausente da `main` | **Continua aberta** |

## 6. Pendência não registrada (descoberta nesta auditoria)

**`PENDENCIAS.md` tem duas fontes da verdade.** A ferramenta MCP `pendencias_close`
grava na cópia da VPS; o clone local e o GitHub não recebem a escrita.
Verificado: após fechar `#24`, a cópia MCP foi de 767 → 730 linhas, enquanto
`git status docs/PENDENCIAS.md` permaneceu limpo.

Isso viola a Sincronia 4-Point e é a **razão mecânica de o backlog apodrecer**:
fechamentos não propagam, então itens mortos parecem vivos indefinidamente.

Sintoma secundário: o arquivo usa **duas numerações concorrentes** — `## #N` (temas)
e `### N.` (operacionais). Existem um `#15` temático e um `#15` operacional,
diferentes. Toda referência a "pendência 15" é ambígua.

---

## Veredito

**REFINAR** — não aprovar o backlog como está, não rejeitar o conteúdo.

O conteúdo técnico é legítimo e as auditorias de segurança encontraram defeitos reais
e confirmados. O que está quebrado é a **contabilidade**: fragmentação 6×, numeração
dupla, fechamentos que não propagam e severidades não calibradas.

### 3 mudanças concretas

1. **Rotacionar os 2 segredos queimados antes de qualquer outra coisa.**
   O token em `mcpo-config/config.json` e as chaves em `docker-compose.yml` estão no
   histórico do git. Rotacionar primeiro, parametrizar via env depois. Só o Pivete
   pode rotacionar — nenhuma edição de arquivo substitui isso.

2. **Colapsar 46 → 8.** Fundir `#41`–`#50` sob `#40`, `#5.1`–`#5.11` sob `#5`, e o
   cluster Hermes sob um item raiz único. Adotar numeração única e matar a colisão
   `#15`/`#15`.

3. **Consertar o executor do Hermes (`#26` + `#29`) antes dos sintomas.** Destrava
   `#25`, `#30`, `#32`, `#33` sem trabalho adicional. Maior ROI do backlog inteiro.

### Fora de escopo, mas material

O remote reporta **45 vulnerabilidades** na branch default (2 críticas, 17 altas).
Não existe pendência registrada para isso — o maior risco do repositório está
literalmente fora do backlog.
