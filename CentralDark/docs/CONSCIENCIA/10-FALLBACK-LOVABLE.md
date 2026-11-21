---
title: "10 FALLBACK LOVABLE"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# 10 — Fallback Lovable ↔ GitHub (LER SEMPRE EM CONTA NOVA)

> **Por que esse arquivo existe:** se o usuário plugar este projeto em uma **conta Lovable diferente** (clone, conta nova, fork, outro workspace), o sync nativo Lovable↔GitHub pode falhar, demorar, ou nem estar conectado ainda. Este fallback **funciona em qualquer conta** porque depende só do PAT do usuário no GitHub — não da integração da Lovable.
>
> **Foi testado e validado em 2026-06-04** com PR #144 (`segredounlock/clone-deck`) — abriu, conteúdo correto, log sem secrets.

## TL;DR pra agente em conta nova

1. Confere se existe o secret `<nome-de-segredo>` no projeto (`secrets--fetch_secrets`).
2. Se existe → fallback está pronto, é só rodar quando o sync nativo falhar.
3. Se NÃO existe → pede ao usuário pra cadastrar via Lovable Cloud → Secrets, com escopo `repo` no PAT.

## Quando usar o fallback

- Editei arquivo aqui, o usuário pede pra conferir no GitHub e a mudança não aparece em ~30s.
- Webhook `hook.multizap.dev/health` não responde 200.
- Lovable trava em "aguardando webhook" / "syncing".
- Usuário pediu **explicitamente** pra forçar o push.

## Como rodar (3 comandos)

```bash
# 1. Diagnóstico (não modifica nada)
GITHUB_TOKEN=<variavel-segredo> bash CentralDark/scripts/deploy/lovable-check.sh

# 2. Sincronizar (abre PR por padrão)
GITHUB_TOKEN=<variavel-segredo> bash CentralDark/scripts/deploy/lovable-sync-fallback.sh

# 3. Ver último relatório
bash CentralDark/scripts/deploy/lovable-report.sh
```

Na VPS, após `install.sh`, viram atalhos globais:

```bash
centraldark-lovable-check
centraldark-lovable-sync
centraldark-lovable-report
```

## Camadas de fallback (na ordem que o script tenta)

1. **PAT** via API do GitHub (`<nome-de-segredo>`) — funciona no sandbox da Lovable. **Testada ✅**.
2. **SSH** na VPS + `git push` (precisa `<nome-de-segredo>` + `setup-vps-ssh.sh`) — gancho implementado, push completo é fase 2.
3. **MCP CentralDark** — fase 2, quando MCP estabilizar.

## Variáveis (todas opcionais — defaults seguros)

| Variável | Default | Função |
|---|---|---|
| `FALLBACK_DIRECT_MAIN` | `false` | `true` permite push direto na `main` sem PR (use só pra emergência) |
| `FALLBACK_DRY_RUN` | `false` | `true` simula sem abrir PR |
| `FALLBACK_MAX_FILES` | `50` | Aborta se divergência > N (proteção) |
| `FALLBACK_LAYER` | `auto` | `auto` / `pat` / `ssh` (força camada) |

## Segurança (NÃO violar)

- **Allowlist negativa**: o fallback **recusa** mexer em `apps/crm/`, `infra/caddy/`, `infra/docker/`, `wuzapi/`, `whatsapp-server/`. Esses pedem PR humano de qualquer jeito.
- **Sanitização**: toda saída passa por `sanitize` antes de gravar/imprimir. Filtra `token|password|authorization|apikey|secret|bearer` etc.
- **Lock** `flock` em `/tmp/lovable-sync-fallback.lock` — duas execuções simultâneas não acontecem.
- **Sem** `rm`, **sem** `pm2 restart`, **sem** `docker`, **sem** `sudo`.

## Onde fica cada coisa

```
CentralDark/scripts/deploy/
├── lovable-check.sh          ← diagnóstico (não modifica)
├── lovable-sync-fallback.sh  ← orquestrador (faz o PR)
├── lovable-report.sh         ← mostra último relatório
├── _lib-sanitize.sh          ← função sanitize compartilhada
└── _lib-github-api.sh        ← wrappers da API do GitHub
```

Relatório de cada execução:

```
<caminho-vps>
├── resumo.md              ← humano-legível em PT-BR
├── logs-sanitizados.txt   ← log completo sem secrets
├── checks.json            ← estado detectado
└── acoes-executadas.md    ← cada chamada + exit
```

No sandbox da Lovable (sem `<caminho-vps>`) cai em `/tmp/centraldark-revisoes/`.

## Checklist pra agente em conta Lovable nova

- [ ] `secrets--fetch_secrets` mostra `<nome-de-segredo>`? Se sim, segue.
- [ ] Arquivos `CentralDark/scripts/deploy/lovable-*.sh` existem no repo? Se sim, segue.
- [ ] Roda `lovable-check.sh` — confere se `sha_remoto_main` vem preenchido (prova que o PAT tem acesso).
- [ ] Quando o sync travar, dispara `lovable-sync-fallback.sh` — abre PR automaticamente.
- [ ] Não tenta `FALLBACK_DIRECT_MAIN=true` sem pedir confirmação ao usuário.
- [ ] Anexa o link do PR criado na resposta final.

## Se faltar o PAT na conta nova

Explica em PT-BR simples:

> "Pra esse fallback funcionar nessa conta, preciso de um token pessoal do GitHub guardado nos secrets do Lovable Cloud com o nome `<nome-de-segredo>`. Gera em github.com → Settings → Developer settings → Personal access tokens (escopo `repo`). Eu cadastro pra você quando confirmar."

Aí usa `secrets--add_secret(["<nome-de-segredo>"])` pra abrir o formulário seguro.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre

## Fluxo GitHub-first sem runner obrigatório (2026-10-24)

Para tarefas de construção e edição de código, GitHub Actions runner não é pré-requisito. Reutilize a conexão GitHub autenticada da CentralDark para ler arquivos, escrever em branch, registrar commits e abrir PR pela API.

### Caminho padrão

1. Leia o estado atual e identifique o owner/documento existente antes de criar arquivos ou integrações.
2. Faça a menor alteração em branch isolada; não grave diretamente em `main` para mudanças normais.
3. Confira o arquivo e o commit no GitHub após a escrita; registre SHA e link do PR como evidência.
4. Use CI/runner apenas quando a validação exigir execução remota ou workflow específico — não para editar arquivos e registrar commits.
5. Use SSH/VPS somente quando a tarefa precisar executar ou inspecionar o runtime da VPS. Antes de conectar, valide a identidade do host com chave conhecida; não desabilite a verificação de host (`StrictHostKeyChecking=no`).
6. Nunca coloque tokens, chaves privadas ou valores de secrets em arquivos, commits, logs ou respostas.

### Fronteira de prova

- Branch/commit criado != testes aprovados.
- PR aberto != mergeado.
- Mergeado != deploy concluído.
- Ação solicitada != prova de execução.
- Se o conector bloquear uma operação, registre o erro exato e tente uma rota autorizada existente; não declare sucesso nem altere `main` como atalho.
