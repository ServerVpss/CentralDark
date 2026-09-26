# Filtro de Infra + Caddy — Lições 28/08/2026

## Filtro do CHEFE (infraestrutura)

Toda alteração de infra deve passar pelo filtro:

1. **Extensão segura** — atualiza e melhora o que já existe. Pode fazer.
2. **Substituição** — troca arquitetura, cria V2/V3/V4. NUNCA sem ordem.
3. **Remoção pura** — apagar coisa que funciona (mesmo "morto"). NÃO fazer sem ordem.

**Benefício funcional zero = reprovado.** Rota morta não consome recurso, não degrada nada. Só incomoda a vista.

**Exemplo real (revertido):** Agente removeu 7 declarações mortas do Caddy. `caddy validate` passou, reload funcionou. CHEFE reverteu: "apagar declaração é remoção. Benefício funcional zero. Reprovado."

**`permito` = PONTUAL, NÃO massa.** Nunca interprete "permito segredo" como autorização pra mutação em massa.

**NUNCA sugira "apagar tudo" sem medir custo** (132 .env + 21 PM2 + meses de trabalho).

## Caddy — Backup + Validate + Reload

```bash
# 1. Backup
cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak-$(date +%Y%m%d-%H%M%S)

# 2. Editar
sed -i 's/127.0.0.1:8080/127.0.0.1:8082/g' /etc/caddy/<config>.Caddyfile

# 3. Validar
caddy validate --config /etc/caddy/Caddyfile

# 4. Recarregar só se validar
caddy reload --config /etc/caddy/Caddyfile
```

## Caddy — Teste de Rotas

```bash
# Backend direto
curl -s -o /dev/null -w '%{http_code}' http://localhost:<port>/health

# Caddy sabe o domínio (308 = redirect HTTPS)
curl -s -o /dev/null -w '%{http_code}' -H 'Host: <domain>' http://localhost:80/
```

**308 = redirect** (normal). **401 = backend vivo pedindo credencial** (não é erro). **502 = backend morto**.

## Domínios Mortos por Natureza

Serviços que NUNCA vão abrir porta HTTP:
- `bot.centralldark.com` → GuardiaoBot (bot Telegram)
- `bridge.centralldark.com` → GuardiaoBridge (bridge)

## Builder é Site Estático

`apps/web/dist/` contém HTML/assets, sem package.json, sem vite.config. Não tem backend de produção. :5174 é Vite dev-server (só existe com `npm run dev`). **NÃO inventar backend.**

## Elite 8080 → 8082

O elite-anthropic-proxy (uvicorn) escuta :8082. O Caddy apontava pra :8080 (morto). Correção cirúrgica: `sed -i 's/127.0.0.1:8080/127.0.0.1:8082/g'`.

## chattr +i — Filtro Correto

```bash
git ls-files -z | xargs -0 lsattr 2>/dev/null | awk '$1 ~ /^.*i-/' | wc -l
```

**Bug conhecido:** `grep 'i'` conta a letra "i" em qualquer lugar do path. Resulta em falso positivo de milhares.

## 22k Imutáveis = Falso Positivo

Na sessão 28/08, o número real era **9 arquivos** em `apps/modulos/HERMES-CORE/` (trava cirúrgica de rebase antigo). O "22k" era bug de filtro.

## Rebase-Merge Travado

VPS amanheceu com `.git/rebase-merge/` de sessão anterior. Ação correta: `git rebase --abort` ANTES de qualquer push/pull/merge.

## Deploy Script (centraldark-deploy.sh)

- `--apply` executa, `--apply --aceitar-divergencia` força quando VPS está divergente
- Cria tag âncora `vps-pre-deploy-<timestamp>` antes de mexer (rollback)
- Reinicia SÓ o MCP, não os outros 18 processos

## Mapa de Rotas (2026-08-28)

| Domínio | Porta | Backend | Status |
|---|---|---|---|
| api.centralldark.com | :8090 | ArsenalAdapter | ✓ |
| grafo.centralldark.com | :3030 | GraphPanel | ✓ |
| hub.centralldark.com | :8098 | OAuthBroker | ✓ |
| centralldark.com | :3000 | UI | ✓ |
| mcp.centralldark.com | :9100 | MCP | ✓ |
| elite.centralldark.com | :8082 | EliteHTTP | ✓ |
