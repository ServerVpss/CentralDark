<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# GitHub Access — MultiZap / clone-deck

Última atualização: 2026-05-30

Documento operacional para agentes/IA entenderem como o repositório deve ser acessado com segurança.

---

## Repositório oficial

https://github.com/segredounlock/clone-deck

---

## Regra de ouro

Nunca colocar credenciais no repositório.

Proibido commitar ou colar em chat/log:

- chave privada SSH;
- GitHub PAT;
- WEBHOOK_SECRET;
- .env real;
- service_role;
- database URL;
- tokens do Gateway/WuzAPI.

---

## Deploy Key da VPS — somente leitura

A VPS possui uma Deploy Key SSH somente leitura para este repositório.

Uso esperado na VPS:

Host github-clone-deck
  HostName github.com
  User git
  IdentityFile /root/.ssh/clone_deck_deploy_key
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new

Remote esperado na VPS para pull/read-only:

git remote set-url origin git@github-clone-deck:segredounlock/clone-deck.git

Essa chave deve continuar read-only.

Ela serve para:

- git clone
- git fetch
- git pull

Ela não deve ser usada para:

- git push
- criar PR
- automação de agente fora da VPS

---

## Chave separada para push/PR — write access

Quando existir uma chave separada com permissão de escrita, o alias esperado é:

Host github-clone-deck-write
  HostName github.com
  User git
  IdentityFile /root/.ssh/arena_clone_deck_write
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new

Remote para ambientes que realmente possuem essa chave e precisam fazer push:

git remote set-url origin git@github-clone-deck-write:segredounlock/clone-deck.git

Testes seguros:

ssh -T git@github-clone-deck-write
git fetch origin

Push deve ser feito somente em branch separada:

git checkout -b nome-da-branch
git push -u origin nome-da-branch

Nunca fazer push direto na main sem autorização.

---

## Importante para Arena/IA

Ao clonar o repositório em um novo ambiente, a IA deve verificar se o alias existe antes de usar:

test -f ~/.ssh/config && grep -n "github-clone-deck-write" ~/.ssh/config || true
ssh -T git@github-clone-deck-write

Se o alias/chave não existir no ambiente atual, a IA não deve tentar usar a chave da VPS.

Alternativas seguras para Arena/IA:

1. Integração nativa Arena ↔ GitHub.
2. Fine-grained PAT temporário salvo como secret seguro do ambiente.
3. Deploy key separada com write access, temporária e revogável.

Nunca copiar a chave privada da VPS para a Arena.

---

## Webhook de deploy

O deploy automático ocorre via GitHub webhook após push/merge na main:

GitHub main
  -> https://hook.multizap.dev/webhook
  -> CloneDeck-GitHub-Webhook :9003
  -> /usr/local/bin/clone-deck-gh-pull
  -> /root/Multizap/apps/clone-deck

Health público:

curl -fsS https://hook.multizap.dev/health

O webhook exige HMAC SHA-256 em POST /webhook.
Não pedir nem expor WEBHOOK_SECRET.

---

## Revogação

Se uma chave write for temporária, remover após uso:

1. GitHub -> Repository Settings -> Deploy keys -> Delete key.
2. Apagar chave privada do ambiente onde foi criada.
3. Confirmar que o remote não usa mais o alias write.

git remote -v
