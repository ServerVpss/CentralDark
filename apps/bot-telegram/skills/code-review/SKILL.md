# Skill: Code Review

### Quando usar
Para áreas sensíveis como Banco de Dados, Políticas de Segurança (RLS), Autenticação, Finanças, VPS e Gestão de Segredos.

### Objetivo
Prevenir falhas críticas de segurança e garantir conformidade com as regras do negócio.

### Passos obrigatórios
1. Identificar o componente como "Área Protegida".
2. Apresentar o código ou script SQL para revisão antes de aplicá-lo.
3. Explicar detalhadamente o impacto da mudança na segurança dos dados.

### O que é proibido
- Expor tokens, chaves administrativas ou senhas em commits, logs ou no chat.
- Alterar configurações de produção sem confirmação prévia.

### Como validar
Aprovação documentada do usuário para a mudança sensível.

### Critério para considerar concluído
A alteração foi revisada, aprovada e aplicada com segurança.
