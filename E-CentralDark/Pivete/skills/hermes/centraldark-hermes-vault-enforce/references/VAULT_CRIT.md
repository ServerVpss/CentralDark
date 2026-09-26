## Crítica de Integração do Vault

- **Quando**: Antes de qualquer execução de tarefa, o Hermes chama `hermes-vault-sync.js`.
- **Resultado esperado**: 1) Diretório `vault/` existe; 2) contém pelo menos um arquivo `.md`;
- **Falha**: Se não existir ou vazio, o script lança erro `REJEITADO: O Hermes tentou executar sem consultar o Segundo Cérebro`.
- **Logging**: O número de notas carregadas é logado no console e incluído no `hermes.log`.
- **Política**: Somente o caminho `E:/CentralDark/workspace/centraldark-main/vault` será aceito. Se houver migração, atualize `VAULT_PATH` no script.
- **Auditoria**: Esse critério deve ser mantido nos documentos de governança da CentralDark.