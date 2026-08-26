# 📊 Relatório de Consistência — Git ↔ Notion

- **Gerado:** 2026-08-26T13:54:41.574Z
- **Commit:** `f6a90911c69a1ac47b4c111e7bd463d2cd96eae6`
- **Disparado por:** segredounlock

> Git é fonte da verdade. Notion é painel humano. Divergências aqui = ação necessária.

## Resumo

| Database | Git | Notion | 🟩 OK | 🟥 Falta Notion | 🟧 Órfão |
|---|---:|---:|---:|---:|---:|
| regras | 4 | 5 | 4 | 0 | 1 |
| pendencias | 1 | 1 | 1 | 0 | 0 |
| decisoes | 39 | 39 | 39 | 0 | 0 |
| aprendizados | 30 | 0 | 0 | 30 | 0 |

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
- 🟥 Faltando no Notion: **30**
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
- 16. Frase de agente não prova alinhamento; promessa maior que capacidade é falso compromisso
- 16. #ACORDAR é recuperação de estado real, não apenas comando de GitHub
- 17. Uma SOL, um SOUL, uma superfície; modelos e ferramentas são capacidades substituíveis
- 18. O humano decide intenção; a máquina prova o estado e não devolve investigação mensurável ao humano
- 19. Em desenvolvimento autorizado, produção observável vem antes de perfeição global
- 20. Convergência, Judge e Meta Lupa servem para tentar quebrar; não para decidir a intenção do CHEFE
- 21. Falha local pede correção local e deploy no menor blast radius possível
- 22. Painel Admin precisa ser observabilidade operacional, não só configuração
- 23. HTTP 200, PM2 online, DNS resolvendo ou painel verde não provam LIVE
- 24. API paga é capacidade, não identidade nem caminho obrigatório
- 25. “Menos é mais” significa menor movimento compatível com efeito, observabilidade e segurança
- 26. Batch .bat: 4 armadilhas que passam em revisão superficial
- 27. Grok App Builder é adapter, não cérebro — não scaffoldar app paralelo
- 28. Ponte semântica fail-closed EXIT code=2 — não é verde; stderr engolido
- 29. Dois mundos vivos: GitHub main 81bbfc7 ≠ VPS 5958d3ce27 (1252 atrás, dirty)
</details>
