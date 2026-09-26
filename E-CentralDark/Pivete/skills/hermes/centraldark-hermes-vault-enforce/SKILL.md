---
name: CentralDark Hermes Vault Enforce
author: CentralDark
description: Garantir que Hermes carregue Vault no boot.
keywords:
  - hermes
  - vault
  - bootstrap
---

# CentralDark Hermes Vault Enforce

**Objetivo** – Garantir que qualquer inicialização do Hermes **obrigatoriamente** consulte o **Second Brain** (Vault) antes de executar.

## Funcionamento
1. O launcher (`centraldark.cmd`) invoca `node scripts/hermes-vault-sync.js`.
2. O script verifica a existência e se o diretório `vault/` contém arquivos `.md`.
3. Se falhar, a inicialização falha com erro *REJEITADO: O Hermes tentou executar sem consultar o Segundo Cérebro*.
4. Se bem-sucedido, imprime a quantidade de notas carregadas.

## Regras de Atualização
- Se o local do Vault mudar, edite `VAULT_PATH` no script `hermes-vault-sync.js`.
- Permissões de leitura devem existir para o usuário que roda o Hermes.

## Próximos Passos
- Incluir o script `hermes-vault-sync.js` no projeto, sub referenciando `scripts/`.
- Atualizar `centraldark.cmd` para chamá‑lo antes de `hermes.exe`.
- Documentar a política em `references/VAULT_CRIT.md`.
