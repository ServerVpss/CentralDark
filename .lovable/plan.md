## Plano: Documentar por que `mem://` não é fonte oficial de memória

### O que vou fazer

1. **Abrir e ler** `docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md` para garantir que vou preservar o conteúdo existente.
2. **Inserir uma nova seção técnica** nesse arquivo, explicando:
   - o que é `mem://` (memória/cache interna de sessão do Lovable);
   - por que ele não serve como fonte oficial (volátil entre workspaces, invisível para outras IAs/Hubs, com limite de tamanho);
   - que regras e aprendizados importantes devem ser gravados primeiro em `docs/CONSCIENCIA/`;
   - que `mem://` só pode ser usado como espelho/cache opcional, nunca como origem.
3. **Abrir e ler** `docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md`.
4. **Adicionar uma referência curta** nesse arquivo de entrada, apontando para a nova seção do `REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`.
5. **Validar** os dois arquivos após a edição, lendo-os novamente para confirmar que a seção nova e a referência estão no lugar certo.

### O que NÃO vou fazer

- Não vou mexer em código, Caddy, DNS, secrets, banco, PM2, Docker ou qualquer coisa sensível.
- Não vou incluir exemplo prático do Caddy/MCP (você pediu só explicação geral).
- Não vou criar arquivo novo separado: a explicação fica na regra oficial já existente.

### Arquivos alterados

- `docs/CONSCIENCIA/REGRA-OFICIAL-HIERARQUIA-MEMORIA.md`
- `docs/CONSCIENCIA/00-ENTRADA/00-LEIA-PRIMEIRO.md`