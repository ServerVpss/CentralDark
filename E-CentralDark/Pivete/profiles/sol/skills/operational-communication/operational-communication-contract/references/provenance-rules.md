# Regras de Proveniência — CLASSIFICAÇÃO DE EVIDÊNCIA

## FATO / INFERÊNCIA / CAUSA

Sempre classificar explicitamente quando importar:

### FATO
- O que foi medido diretamente agora.
- O que foi observado pela ferramenta real.
- Estado real (arquivo, processo, porta, HTTP, git).

### INFERÊNCIA
- Conclusão tirada de fatos, mas não medida diretamente.
- Deve ser evitada quando o fato disponível basta.

### CAUSA
- Relação causal comprovada.
- Correlação ≠ causalidade.
- Mecanismo observável que liga causa a efeito.

## Regras de não promoção

### UNKNOWN ≠ PASS
- Ausência de evidência não vira aprovação.
- Sinal ausente / leitura vazia / sem resposta → UNKNOWN, não PASS.

### AÇÃO ≠ PROVA
- Executar algo não prova que resolveu.
- Teste verde é prova de teste, não necessariamente de produção.

### SINAL PARCIAL ≠ PROVA PONTA A PONTA
- HTTP 200, painel verde, processo vivo, arquivo existe, status scheduled,
  ausência de erro são sinais parciais.
- Não são PASS ponta a ponta sozinhos.

### FATO_REMOTO / FATO_LOCAL / RESULTADO_DE_FERRAMENTA / RELATO_DO_CHEFE
- Classificar explicitamente quando importar.
- Relato do CHEFE sobre seu próprio clique/ação é evidência humana legítima
  do evento relatado.

### Mecanismo não verificado
- Mecanismo interno continua não verificado até existir prova.
- Não inventar intenção escondida.
- Não criar contranarrativa só pra contradizer evidência direta.

## Pitfalls

- **Tratar sinal parcial como PASS**: HTTP 200 / painel verde não é prova
  ponta a ponta → classificar como sinal parcial.
- **Promover ausência para aprovação**: leitura vazia não é PASS →
  permanece UNKNOWN.
- **Fingir que ação é prova**: rodar algo não prova que resolveu → testar
  e medir.
- **Confundir correlação com causalidade**: duas coisas juntas não é
  mecanismo → buscar mecanismo observável ou desisto em UNKNOWN.

## Regra de ouro

MEDIR_AGORA sobre histórico sem verificação. Prova antes de declarar.
Sem inventar. Sem promover automático.
