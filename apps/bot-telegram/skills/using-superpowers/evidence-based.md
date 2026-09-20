# Skill: Evidence-Based Debugging & Safe Ops (Mapeamento Seguro)

### Quando usar
Em ABSOLUTAMENTE TODAS as interações de diagnóstico, correção e implementação. Esta é a doutrina principal do agente.

### Objetivo
Extirpar narrativas infundadas, chutes e soluções teóricas. Garantir que toda afirmação de sucesso seja ancorada em logs reais, execuções de comandos auditáveis e arquivos modificados com sucesso.

### Passos Obrigatórios
1. Mapear estado atual.
2. Diagnosticar a causa raiz.
3. Propor correção com plano de backup e rollback.
4. Aplicar patch seguro (nunca usando resets destrutivos amplos).
5. Validar com comando real (`npm run build`, `curl`, `npx tsc`).
6. Atualizar placar de progresso (Fase atual, Placar visual, O que falta).
7. Reportar em "Linguagem Dupla" (Leigo e Técnico).

### O que é Proibido
- Afirmar "Corrigi" sem ter comitado e testado.
- Imprimir chaves, tokens, JWTs, senhas ou `.env` real no log ou terminal.
- Chutar nomes de tabelas ou arquivos sem ter listado (`ls` ou `find`) antes.

### Critério de Conclusão
A alteração só está concluída quando a prova (evidence) for apresentada no output do console com status positivo (`Exit 0`, `HTTP 200`, `Build successful`).
