
# 📌 Consolidação no PR #316 — Supermemory + Embeddings Locais

> **Regra herdada:** tudo que você entrega vira **extensão** do plano vivo no PR #316 (`feat/lupa-conformance-tests-2026-07-22-2130`). Nada de PR novo, nada de duplicata. Melhora o que já existe.
> **Escopo:** só GitHub (repo `ServerVpss/CentralDark`). Zero toque no app Lovable, VPS, HUB, Hermes-Core ou áreas 🔒.
> **Status:** planejamento — decisor final = Pivete ou Sol.

---

## 1. O que entra no mesmo PR #316

**Um único commit atômico** anexando a análise Supermemory ao documento mestre já existente (`docs/RELATORIOS/2026-07-23-arquitetura-cascata-freetier-sol-decisor.md`) + expansão do `rotas.json` com camada de embeddings.

### 1.1. Extensão do documento mestre (append, não sobrescrita)
Adicionar seção nova ao final:

```
## 6. Camada de Memória Semântica (Embeddings + RAG)
### 6.1. Comparativo modelos open-source (fonte: supermemory.ai/blog, 23/07/2026)
### 6.2. Análise do app.supermemory.ai vs CentralDark
### 6.3. Decisão arquitetural: BGE/Nomic local + pgvector no HUB
### 6.4. Integração com a cascata Luna→Terra→Nemotron
### 6.5. Checklist [ ] refinamento
```

Conteúdo: tabelas de latência/acurácia (MiniLM 68ms/78% → Nomic 110ms/86%), preços do app Supermemory ($0/$19/$100/$399), veredito Lupa e razão de rejeitar a assinatura ($0 local vs $19+/mês recorrente com lock-in).

### 1.2. Expansão do `scripts/router/rotas.json`
Adicionar bloco `embeddings` ao lado das rotas de chat existentes:

```json
"embeddings": {
  "primario": "nomic-embed-text-v1",
  "leve": "all-MiniLM-L6-v2",
  "producao": "bge-base-en-v1.5",
  "provider": "local-vps",
  "custo_por_1m_tokens_usd": 0,
  "storage": "pgvector@hub-supabase"
}
```

### 1.3. Aprendizado #344 em `docs/CONSCIENCIA/APRENDIZADOS.md`
Bloco sequencial documentando: "Supermemory app avaliado e rejeitado — CentralDark já cobre o caso de uso com embeddings locais + pgvector, com custo $0 e soberania total dos dados."

### 1.4. Checklist atualizado no PR #316
Adicionar caixinhas `[ ]`:
- [ ] Confirmar ativação do `pgvector` no HUB Supabase
- [ ] Escolher modelo de embedding padrão (BGE vs Nomic vs Gemini via Gateway Lovable)
- [ ] Definir tabela `documents_hermes` no HUB (schema + RLS)
- [ ] Integrar embeddings no fluxo de memória do Hermes-Core (só depois da aprovação)

---

## 2. Regras de execução (herdadas)

- ✅ **Um commit único** na branch `feat/lupa-conformance-tests-2026-07-22-2130`
- ✅ **Append, nunca overwrite** — preservar todo conteúdo anterior do relatório mestre e do APRENDIZADOS.md (recuperar via API GitHub antes de escrever)
- ✅ **Nada de v2, v3, paralelo** — mesma pasta, mesmo arquivo, extensão contínua
- ✅ **AutoLupa canônica** (skill do repo, blob `4d0c4e8f`) aplicada antes do commit
- ❌ **Zero** mudança em Hermes-Core, Bot Central, Elite Gateway (áreas 🔒)
- ❌ **Zero** implementação real — só documentação e config declarativa (`rotas.json`)

---

## 3. Entregável no fim

- 1 commit novo no PR #316 (SHA a informar)
- Link atualizado do PR
- Placar padrão: 🟢 anexado / 🟡 aguarda revisão Sol/Pivete / 🔴 nenhum
- Fio da missão: "Supermemory pesquisado, embeddings open-source integrados ao plano cascata, decisão de não assinar SaaS externo registrada — tudo no mesmo PR vivo."

---

## 4. Próximo passo (aguardando seu OK)

Confirma que eu executo os 4 itens acima **no mesmo PR #316**, em **um commit único**, preservando tudo que já está lá?

Se sim → saio do plan mode e commito.
Se quiser refinar antes → me diz o que ajustar (ex: trocar modelo padrão, adicionar/remover checkbox, mudar tom).
