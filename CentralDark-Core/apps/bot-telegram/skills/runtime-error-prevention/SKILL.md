# Skill: Runtime Error Prevention

### Quando usar
Em todas as tarefas de desenvolvimento de UI e refatoração de código.

### Objetivo
Eliminar falhas básicas que causam a "tela branca" ou erros fatais de execução.

### Passos obrigatórios
1. Validar a existência de imports para todos os hooks (useState, useEffect, etc.).
2. Verificar se todas as variáveis utilizadas foram declaradas corretamente.
3. Confirmar se o build do projeto (`npm run build`) termina com sucesso.
4. Testar o carregamento da página alvo no preview.

### O que é proibido
- Entregar código com `ReferenceError`, `TypeError` ou imports ausentes.
- Deixar a aplicação inacessível no preview.

### Como validar
Execução bem-sucedida do build e ausência de erros no console do navegador.

### Critério para considerar concluído
A interface carrega perfeitamente e as interações básicas funcionam sem crash.
