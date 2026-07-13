Plano seguro para destravar essa tela preta e continuar a Fase 3 sem bagunçar mais nada:

1. Corrigir o alias quebrado do import novo
   - O app importa `@/compartilhado/lib/hostRouting`, mas o arquivo real está em `src/compartilhado/utilitarios/hostRouting.ts`.
   - Vou ajustar só esse import para o caminho certo em português.

2. Tratar `/index` como rota válida de entrada
   - A tela do celular mostra que a prévia abriu em `/index`, mas o app hoje só tem `/`, `/auth`, `/telepainel`, `/dashboard` e rotas internas.
   - Vou adicionar uma rota simples `/index` redirecionando para `/`, para não cair em tela preta/404 quando o Lovable ou o navegador abrir nesse caminho.

3. Melhorar a tela de rota não encontrada
   - Hoje o 404 ainda está em inglês e muito cru.
   - Vou deixar em PT-BR, com botão claro para voltar ao início, sem mudar design geral.

4. Verificar sem mexer em backend, VPS, banco ou design pesado
   - Só frontend/roteamento.
   - Depois valido a prévia em `/index` e `/` para confirmar que voltou a renderizar.

Resultado esperado:
```text
/index → redireciona para /
/      → abre a tela inicial correta
rotas inexistentes → mostram 404 amigável em PT-BR
```