# Skill: Systematic Debugging

### Quando usar
Para bugs, comportamentos inesperados, falhas de API, problemas de banco de dados, erros de deploy ou instabilidade em webhooks/tokens.

### Objetivo
Eliminar a causa raiz de forma lógica e científica, abandonando a tentativa e erro.

### Passos obrigatórios
1. Analisar logs e mensagens de erro na íntegra.
2. Formular uma hipótese técnica: "O erro ocorre por causa de [fator X]".
3. Isolar o problema e testar a hipótese no código.
4. Aplicar a correção cirúrgica baseada na evidência.
5. Validar a resolução com evidência real.

### O que é proibido
- Modificar código aleatoriamente "para ver se funciona".
- Ignorar avisos de console ou warnings de build.

### Como validar
Apresentar logs de sucesso ou status HTTP comprovando que a falha sumiu.

### Critério para considerar concluído
A causa raiz foi extirpada e a correção foi documentada.
