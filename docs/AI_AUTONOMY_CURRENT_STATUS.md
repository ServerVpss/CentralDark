<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-06-01 — CI/CD ativo</samp>
</p>

# AI Autonomy / Status Operacional Atual

Este documento registra o estado atual do projeto para qualquer IA/agente que abrir o repositório depois desta sessão.

## Status atual

O projeto `segredounlock/clone-deck` está com deploy automático ativo para produção.

Fluxo atual:

```txt
IA/usuário altera arquivos no GitHub ou na VPS
  -> commit + push na main
  -> GitHub Actions: Deploy Clone Deck
  -> SSH na VPS via secrets
  -> cd /root/Multizap/apps/clone-deck
  -> git fetch origin main
  -> git reset --hard origin/main
  -> npm install somente se existir package.json na raiz
  -> restart seguro dos processos PM2 por nome
  -> pm2 save
```

## Repositório e produção

- Repositório: `segredounlock/clone-deck`
- Branch de produção: `main`
- VPS path oficial: `/root/Multizap/apps/clone-deck`
- Remote correto na VPS: `github-clone-deck-write:segredounlock/clone-deck.git`
- Workflow principal: `.github/workflows/deploy.yml`
- Status do workflow principal em 2026-06-01: ✅ funcionando

## Deploy automático

O deploy principal já foi corrigido e validado.

Problemas resolvidos:

1. Chave SSH read-only sendo usada para push.
2. Remote errado apontando para `redeunlock/clone-deck`.
3. GitHub Actions falhando por `npm install` na raiz sem `package.json`.
4. `pm2 restart all` falhando por processo antigo/inexistente.
5. Deploy ajustado para restart seguro de PM2.

Resultado atual:

```txt
Deploy Clone Deck -> success
VPS atualizada automaticamente
PM2 reiniciado sem quebrar por ID antigo
```

## Secrets GitHub Actions configurados

Os secrets existem no repositório em `Settings -> Secrets and variables -> Actions`:

- `VPS_HOST`
- `VPS_USER`
- `VPS_PATH`
- `VPS_SSH_KEY`

Nunca pedir ao usuário para colar a chave privada no chat. A chave privada fica apenas no GitHub Secrets.

## Chaves SSH / Deploy Keys

No GitHub existem duas deploy keys importantes:

- `clone-deck-vps-deploy-readonly` — read-only
- `arena-clone-deck-write` — read/write

Na VPS foi configurado alias SSH para escrita:

```sshconfig
Host github-clone-deck-write
  HostName github.com
  User git
  IdentityFile /root/.ssh/arena_clone_deck_write
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
```

Push correto da VPS:

```bash
git push origin main
```

com o `origin` apontando para:

```txt
github-clone-deck-write:segredounlock/clone-deck.git
```

## Automação local criada na VPS

Foi criado na VPS o comando:

```bash
salvar-deploy
```

Uso:

```bash
salvar-deploy "mensagem do commit"
```

O comando faz:

```txt
git add .
git commit -m "mensagem"
git push origin main
```

Depois do push, o GitHub Actions atualiza a VPS automaticamente.

## Regra para IA trabalhar daqui para frente

A IA pode alterar arquivos via GitHub e fazer commit no repositório. O deploy automático atualiza a VPS.

A IA deve evitar pedir ao usuário para entrar na VPS quando a tarefa puder ser resolvida por:

1. alteração de código/documentação no GitHub;
2. workflow existente de deploy;
3. script run-once seguro;
4. leitura de logs de GitHub Actions;
5. arquivos de documentação e estado.

## Limites reais da IA

A IA não tem shell SSH interativo direto na VPS dentro do chat. O caminho operacional é:

```txt
GitHub edit/commit -> GitHub Actions -> VPS
```

Para diagnósticos na VPS, usar run-once ou workflow seguro que gere logs. Não afirmar que executou comando direto na VPS se a evidência veio apenas do GitHub Actions.

## O que pode fazer sem pedir confirmação

- Editar documentação.
- Corrigir código não destrutivo.
- Criar scripts de diagnóstico run-once.
- Criar/ajustar workflows do GitHub Actions.
- Ler logs do GitHub Actions.
- Corrigir deploy quando a falha estiver clara.
- Atualizar docs/memória depois de cada mudança.

## O que exige confirmação explícita

- Apagar arquivos/pastas.
- Remover processo PM2.
- Parar ou recriar WuzAPI/Docker.
- Resetar sessão WhatsApp.
- Alterar `.env` ou secrets reais.
- Alterar Caddy em produção.
- Dropar tabela ou mudar dados reais críticos.
- Force push.

## Regra permanente de documentação

Depois de toda correção relevante, atualizar ao menos um destes arquivos:

- `START_HERE.md`
- `docs/STATE.md`
- `docs/AI_AUTONOMY_CURRENT_STATUS.md`
- `conexao-ia/START_HERE.md`
- `conexao-ia/CHECKLIST.md`
- documentação específica do módulo alterado

A documentação deve registrar:

- o que foi feito;
- o que mudou no status;
- como testar;
- pendências;
- riscos ou limites.

## Como validar um deploy

1. Abrir GitHub Actions.
2. Verificar workflow `Deploy Clone Deck`.
3. Confirmar status verde.
4. Se falhar, abrir o job `deploy` e ler a etapa `Deploy to VPS`.
5. Corrigir o erro no repositório e commitar.
6. O próximo push testa novamente.

## Status final desta sessão

- ✅ CI/CD principal funcionando.
- ✅ Push para `main` atualiza a VPS.
- ✅ PM2 reinicia via deploy seguro.
- ✅ Comando `salvar-deploy` criado na VPS.
- ✅ Documentação de autonomia criada.
- ⏳ Integração visual do status CI/CD no painel ainda pode ser refinada em próxima etapa.
