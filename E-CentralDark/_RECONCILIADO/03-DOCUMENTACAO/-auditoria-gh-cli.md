# Relatório de Diagnóstico do GitHub CLI

- **Mapeamento:** O usuário solicitou que a IA executasse o pipeline de `PR + auto-merge` de ponta a ponta.
- **Teste Técnico:** Realizada a instalação do binário `gh` dentro da sandbox local da Arena e ejetado o comando de status de sessão.
- **Evidência:** O comando retornou `You are not logged into any GitHub hosts`.
- **Análise Lógica:** Posso criar a branch, posso fazer o commit e posso fazer o push usando a *Basic Authentication (PAT)* no URI do Git (`https://<token>@github.com/...`). Entretanto, as chamadas para a API REST do GitHub via CLI (`gh pr create` e `gh pr merge --auto`) exigem autenticação Oauth gerada via `gh auth login` com escopo pleno de repo.

**Opções de Contorno Seguras:**
A IA pode utilizar `curl` nativo para bater na REST API do GitHub usando o próprio PAT de clonagem contido na URI origin (que o usuário me concedeu), evitando a dependência do comando binário `gh`.
