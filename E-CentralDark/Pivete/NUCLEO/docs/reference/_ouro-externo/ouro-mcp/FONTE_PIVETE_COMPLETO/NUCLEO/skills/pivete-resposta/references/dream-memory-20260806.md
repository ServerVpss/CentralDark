# Dream Memory (Karpathy/Anthropic) — Consolidação Noturna

**Fonte:** Henri8 MAESTR[IA] Patreon, vídeo `dwD_IcbgSAE` (Code with Claude 2026)
**Data:** 06/08/2026
**PDF extraído:** `memories/FIPS-180-4-SHA256-REF.md` (ver abaixo)

---

## Resumo do Conceito

**Dreaming = rotina noturna autônoma** que:
1. Lê sessões recentes (24-48h) via `session_search`
2. Compara com memória atual (HOJE/SEMANA/REGRAS)
3. Acha correções, duplicatas, obsoletos
4. Aplica só baixo-risco (typo, índice, fusão) — automático
5. Resto → revisão humana (PERMITO SEGREDO)

> "Qualquer agente com sessão + memória pode receber o mesmo tratamento" → **HERMES INCLUSO**

---

## 4 Fases do Dream (mapeadas ao nosso fluxo)

| Fase | Dream | Nosso organize-memory |
|------|-------|----------------------|
| 1. Orientação | Ler 3 camadas | Passo 1: ler HOJE/SEMANA/REGRAS |
| 2. Comparação | Divergência | Promover/rebaixar |
| 3. Proposta | Citação + numerada | Evidence gate (3 travas) + citação da sessão |
| 4. Aplicação | Baixo-risco auto | PERMITO SEGREDO gate |

---

## Segurança (Nota Oficial do Paper)

> **Memória automática = SUPERFÍCIE DE ATAQUE**
> Fonte externa = contaminação de memória
> → Revisão humana OBRIGATÓRIA para fonte não confiável

**Fable Loop entra AQUI:**
> "instrução maliciosa que passa a valer indefinidamente" = exato o Fable Loop!

---

## Implementação na Casa

- **Job cron:** `bf2cdc093562` — todo dia 03:00
- **Skills:** organize-memory + meta-lupa
- **Diff log:** `cron/output/dream-YYYYMMDD.md` (auditoria obrigatória)
- **Fontes confiáveis:** session_search (seu log) + HOJE/SEMANA/REGRAS
- **Fontes NÃO confiáveis:** web, e-mail, scrape → NUNCA aplicar auto

---

## O que mais dá pra fazer (extensões)

1. **Skill de integridade:** validar qualquer arquivo contra SHA-256 FIPS 180-4
2. **Gate de hash no Dream:** sono noturno checa SHA antes de aplicar
3. **Manifest viewer:** ler SHA256SUMS.txt e confirmar integridade
4. **Documentar:** nosso padrão de evidência = nível federal US (FIPS 180-4)