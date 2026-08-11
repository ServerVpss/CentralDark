# 📊 Relatório de Consistência — Git ↔ Notion

- **Gerado:** 2026-08-11T09:59:57.878Z
- **Commit:** `667603fbe1a2577e2845fbec847ee523756dacb4`
- **Disparado por:** segredounlock

> Git é fonte da verdade. Notion é painel humano. Divergências aqui = ação necessária.

## Resumo

| Database | Git | Notion | 🟩 OK | 🟥 Falta Notion | 🟧 Órfão |
|---|---:|---:|---:|---:|---:|
| regras | 4 | 5 | 4 | 0 | 1 |
| pendencias | 1 | 1 | 1 | 0 | 0 |
| decisoes | 39 | 39 | 39 | 0 | 0 |
| aprendizados | 15 | 0 | 0 | 15 | 0 |

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
- 🟥 Faltando no Notion: **15**
- 🟧 Órfãos no Notion (não existem no Git): **0**

<details><summary>🟥 Itens a espelhar</summary>

- 1. Gate de CI bloqueia qualquer caminho .env.* pelo NOME, antes de olhar o conteúdo
- 2. git status limpo pode esconder pasta vazia: gitlink órfão entregava o Bolt vazio em todo clone
- 3. Auditoria do gatilho de XP da META LUPA: motor correto, defeito era de exposição na saída
- 4. Auditoria não vale sem HEAD_SHA declarado: 4 escopos, 3 lacunas falsas no PR #410
- 5. Workflow promovido sem o script que ele executa: o bot autônomo nunca rodou
- 6. A porta de entrada nunca existiu: por que nenhuma IA lia as regras da casa
- 7. github_commit (MCP) não deleta arquivo; duplicatas CONSCIENCIA/BRAIN nasceram do mesmo commit de bot
- 8. Nunca gerar -v2/-v3: refinar o arquivo que já existe
- 9. Escritor único: auditar e comentar na PR alheia em vez de abrir PR concorrente
- 10. Reconferir o blob na hora de publicar, não só na hora de auditar
- 11. Hash validado por regex não prova que o artefato existe
- 12. Modo novo não alcança problema empilhado antes da ramificação de modo
- 13. Recuo preventivo não é obediência
- 14. Mutante equivalente sai do denominador mas aponta a invariante sem teste
- 15. Achado repetido é ruído, não reforço
</details>
