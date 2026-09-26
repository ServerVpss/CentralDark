# Segurança

- Cada conta recebe um `CODEX_HOME` próprio.
- O Hub guarda somente apelido e caminhos locais.
- O Hub não abre servidor na porta 1455.
- O Hub não lê nem grava `id_token`.
- O Hub não copia `auth.json` entre contas.
- O Hub não altera autenticação GitHub.
- Perfis ficam fora do repositório em `%LOCALAPPDATA%`.
