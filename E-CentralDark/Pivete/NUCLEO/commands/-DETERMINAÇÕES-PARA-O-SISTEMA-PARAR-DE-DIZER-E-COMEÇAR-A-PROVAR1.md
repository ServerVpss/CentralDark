# COMANDO - 🧠 DETERMINAÇÕES PARA O SISTEMA PARAR DE “DIZER” E COMEÇAR A PROVAR(1).txt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\🧠 DETERMINAÇÕES PARA O SISTEMA PARAR DE “DIZER” E COMEÇAR A PROVAR(1).txt
**SHA:** d3c44785bfd375ff
**Timestamp:** 2026-08-26T18:24:31.466485
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- RELEITURA_RECUPEROU_REGRA     = SIM

### Ouro Bruto (primeiros 5000 chars)
```
# 🧠 DETERMINAÇÕES PARA O SISTEMA PARAR DE “DIZER” E COMEÇAR A **PROVAR**

Isso aqui **não é mágica nem confiança na memória da IA**. Funciona quando cada regra vira:

```text
REGRA EXECUTÁVEL
+ TESTE AUTOMÁTICO
+ GATE BLOQUEANTE
+ RECIBO VERIFICÁVEL
```

Sem esses quatro itens, continua sendo apenas orientação escrita.

---

## 1. Vocabulário obrigatório de estado

1. **“Planejado”** significa que ainda não houve alteração.
2. **“Em execução”** significa que há processo identificado trabalhando.
3. **“Alterado localmente”** significa que o arquivo mudou, mas ainda não existe commit.
4. **“Commitado”** significa que existe commit contendo a alteração.
5. **“Enviado”** significa que o commit existe no remoto.
6. **“Em PR”** significa que o commit está ligado a um Pull Request.
7. **“Integrado”** significa que a alteração entrou na branch canônica.
8. **“Publicado”** significa que chegou ao ambiente de execução.
9. **“Validado”** significa que foi testado no alvo declarado.
10. **“Registrado permanentemente”** significa arquivo canônico + commit + remoto + leitura posterior comprovada.
11. **“Comentado” nunca pode ser usado como sinônimo de registrado.**
12. **“Documentado” nunca pode ser usado quando só existe comentário de PR.**
13. **“Resolvido” exige correção aplicada e teste contra repetição.**
14. **“Verde” exige prova atual, não ausência de erro.**
15. **“Online” exige medição real do alvo atual.**
16. **“Protegido” exige controles ativos e teste de eficácia.**
17. **“Concluído” exige todos os critérios de aceite satisfeitos.**
18. **“Bloqueado” deve informar exatamente o requisito ausente.**
19. **“Parcial” deve listar o que foi e o que não foi feito.**
20. **“Desconhecido” é um estado válido e preferível à invenção.**

---

## 2. Proibição de palavras sem prova

21. O agente não pode escrever **“feito”** sem apresentar identificador verificável.
22. O agente não pode escrever **“registrado”** sem informar o arquivo canônico.
23. O agente não pode escrever **“commitado”** sem informar o SHA.
24. O agente não pode escrever **“na main”** sem consultar a `origin/main`.
25. O agente não pode escrever **“testado”** sem informar comando e resultado.
26. O agente não pode escrever **“funcionando”** baseado somente em compilação.
27. O agente não pode escrever **“notificado”** apenas porque chamou uma função.
28. O agente não pode escrever **“Telegram recebeu”** sem receipt ou confirmação observável.
29. O agente não pode escrever **“painel atualizado”** sem consultar a fonte exibida.
30. O agente não pode escrever **“fallback funcionou”** sem provocar a falha principal.
31. O agente não pode escrever **“rollback disponível”** sem demonstrar o procedimento.
32. O agente não pode escrever **“sem regressão”** sem rodar testes anteriores relevantes.
33. O agente não pode escrever **“seguro”** sem declarar escopo e riscos residuais.
34. O agente não pode escrever **“não existe”** sem mostrar onde procurou.
35. O agente não pode escrever **“não mudou”** sem comparar referências fixadas.
36. O agente não pode escrever **“limpo”** sem verificar arquivos rastreados e não rastreados.
37. O agente não pode escrever **“consolidado”** se ainda existem fontes paralelas.
38. O agente não pode escrever **“canônico”** sem apontar a fonte da verdade.
39. O agente não pode escrever **“permanente”** se depender da memória da conversa.
40. O agente não pode fechar missão com base somente na própria narrativa.

---

## 3. Registro permanente de verdade

41. Toda regra permanente deve morar em um artefato versionado.
42. Comentário de PR é histórico auxiliar, não fonte canônica.
43. Mensagem de chat é contexto temporário, não registro permanente.
44. Memória do agente é apoio, não fonte de verdade operacional.
45. O registro deve entrar no arquivo canônico já existente.
46. Não criar um novo documento se já existe local correto.
47. Não criar `V2`, `V3`, `FINAL`, `FINAL-REAL` ou cópia paralela.
48. A alteração deve preservar o histórico Git.
49. O commit deve conter somente mudanças relacionadas à missão.
50. O registro deve estar presente no remoto.
51. O registro deve ser reencontrado por uma nova leitura.
52. O sistema deve provar que consegue carregar a regra posteriormente.
53. A regra deve ter identificador estável.
54. A regra deve informar sua origem e finalidade.
55. A regra deve informar o comportamento esperado.
56. A regra deve informar o comportamento proibido.
57. A regra deve possuir ao menos um teste de aceitação.
58. A regra deve possuir teste negativo.
59. A regra deve informar quando precisa de decisão humana.
60. A regra só pode ser chamada de permanente após o gate completo.

---

## 4. Matriz mínima para “REGISTRADO”

```text
ARQUIVO_CANÔNICO_ENCONTRADO   = SIM
ALTERAÇÃO_PRESENTE            = SIM
COMMIT_CONTÉM_ALTERAÇÃO       = SIM
COMMIT_EXISTE_NO_REMOTO       = SIM
BRANCH_CANÔNICA_CONTÉM_COMMIT = SIM
TESTE_DA_REGRA_PASSOU         = SIM
RELEITURA_RECUPEROU_REGRA     = SIM
FONTE_PARALELA_CRIADA         = NÃO
`
```