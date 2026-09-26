# COMANDO - plan.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\.lovable\plan.md
**SHA:** 2ce1d198161f948c
**Timestamp:** 2026-08-26T19:30:49.941454
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- - Padrão: `.env`, `.env.*`, `*.env`.

### Ouro Bruto (primeiros 5000 chars)
```
# Plano v3 — Script de quarentena de .env na VPS

Criar e commitar o script único `CentralDark/scripts/run-once/quarentenar-todos-envs-vps.sh` (executável), na branch `main`.

## Comportamento

Dois modos: `dry-run` (padrão) e `apply`.

### Pré-flight (ambos os modos)
- Confirmar que `/root/CentralDark/secrets/` existe.
- Confirmar que `/root/CentralDark/secrets/mcp.env` existe e contém todas as chaves obrigatórias (presença booleana, sem imprimir valor): token MCP, tokens GitHub, owner, repo, path da VPS, comando de restart PM2.
- Se faltar qualquer item → abortar com mensagem clara, sem mover nada.

### Varredura
- Caminho base: `/root`.
- Padrão: `.env`, `.env.*`, `*.env`.
- Ignorar: `/root/CentralDark/secrets/`, `quarantine/`, `revisoes/`, `node_modules/`, `.git/`, `dist/`, `build/`, `cache/`, `.cache/`.
- Para cada arquivo encontrado: registrar **somente** caminho, tamanho e mtime. Nunca abrir conteúdo, nunca calcular hash de conteúdo.

### Relatório
- Salvar em `/root/CentralDark/revisoes/<timestamp>/RELATORIO.md`.
- Tabela: `path | size | mtime`.
- Mostrar também no terminal o caminho da pasta de quarentena que seria/será usada.

### dry-run
- **Não cria** a pasta de quarentena.
- **Não move** nada.
- Só gera o relatório e imprime o caminho previsto.

### apply
- Cria `/root/CentralDark/quarantine/envs-<timestamp>/`.
- Move cada `.env*` preservando a árvore relativa (`cp -a` + `rm`), nunca `rm -rf` definitivo.
- Cria `ENV-README.md` em cada pasta original avisando que o `.env` foi movido pra quarentena e apontando o cofre oficial em `/root/CentralDark/secrets/`.
- Cria `docs/CONSCIENCIA/13-COFRE-SECRETS-CENTRALIZADO.md` documentando a política.
- Atualiza `docs/PENDENCIAS.md` e `docs/CONSCIENCIA/APRENDIZADOS.md`.

### Validação pós-apply (MCP)
- `GET https://mcp.centralldark.com/health` → esperar 200.
- `POST https://mcp.centralldark.com/mcp` com `tools/list` → parsear linhas `data:` do SSE → exigir `toolsCount > 0`.
- Se qualquer validação falhar → registrar no relatório como ALERTA (não reverte automaticamente; usuário decide).

## Segurança (inquebrável)
- Nunca lê conteúdo de `.env`.
- Nunca imprime token, secret ou valor.
- Nunca toca em: Caddy, Docker, WuzAPI, WhatsApp, CRM, banco real, PM2 sensível, `/root/CentralDark/secrets/`.
- Nunca apaga definitivo — só move pra quarentena.

## Entrega
- 1 arquivo novo: `CentralDark/scripts/run-once/quarentenar-todos-envs-vps.sh` (chmod +x).
- Commit direto na `main` com trailer `Co-authored-by: SegredoiDev`.
- Webhook + cron puxam pra VPS em ~5s.

Depois é só rodar `dry-run` e, se a lista bater, `apply`.

```