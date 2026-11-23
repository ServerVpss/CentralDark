# Skill: Verification Before Completion

### Quando usar
Obrigatória antes de finalizar QUALQUER tarefa.

### Objetivo
Provar tecnicamente que a entrega está funcional e não introduziu novos erros.

### Passos obrigatórios
1. Rodar `npm run build` (para frontend).
2. Verificar se o preview ou a porta proposta (ex: 3200) respondem corretamente.
3. Checar o console do navegador em busca de erros críticos.
4. Validar o status HTTP das integrações afetadas.

### O que é proibido
- Afirmar que está resolvido baseando-se apenas em "eu escrevi o código".
- Ignorar falhas de build ou erros de lint.

### Como validar
Anexar evidência real (logs, screenshots de terminal ou status codes).

### Critério para considerar concluído
O sistema prova que o objetivo foi atingido com 100% de sucesso.
