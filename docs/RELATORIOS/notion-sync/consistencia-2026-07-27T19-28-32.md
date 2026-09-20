# 📊 Relatório de Consistência — Git ↔ Notion

- **Gerado:** 2026-07-27T19:28:32.999Z
- **Commit:** `87d03951ca34d5f231f38329a05d30c85d4f66ee`
- **Disparado por:** segredounlock

> Git é fonte da verdade. Notion é painel humano. Divergências aqui = ação necessária.

## Resumo

| Database | Git | Notion | 🟩 OK | 🟥 Falta Notion | 🟧 Órfão |
|---|---:|---:|---:|---:|---:|
| regras | 4 | 5 | 4 | 0 | 1 |
| pendencias | 1 | 1 | 1 | 0 | 0 |
| decisoes | 39 | 39 | 39 | 0 | 0 |
| aprendizados | 4 | 0 | 0 | 4 | 0 |

## Detalhes

### regras

- 🟩 OK: **4**
- 🟥 Faltando no Notion: **0**
- 🟧 Órfãos no Notion (não existem no Git): **1**

<details><summary>🟧 Itens órfãos</summary>

- Processos legados de WhatsApp/Automação ficam STOPPED por design — não subir, não reportar como erro
</details>

### pendencias

- 🟩 OK: **1**
- 🟥 Faltando no Notion: **0**
- 🟧 Órfãos no Notion (não existem no Git): **0**

### decisoes

- 🟩 OK: **39**
- 🟥 Faltando no Notion: **0**
- 🟧 Órfãos no Notion (não existem no Git): **0**

### aprendizados

- 🟩 OK: **0**
- 🟥 Faltando no Notion: **4**
- 🟧 Órfãos no Notion (não existem no Git): **0**

<details><summary>🟥 Itens a espelhar</summary>

- 1. Gate de CI bloqueia qualquer caminho .env.* pelo NOME, antes de olhar o conteúdo
- 2. git status limpo pode esconder pasta vazia: gitlink órfão entregava o Bolt vazio em todo clone
- 3. Auditoria do gatilho de XP da META LUPA: motor correto, defeito era de exposição na saída
- 4. Auditoria não vale sem HEAD_SHA declarado: 4 escopos, 3 lacunas falsas no PR #410
</details>
