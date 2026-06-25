# CHECKPOINT — CentralDark / MultiZap

**Última atualização:** 2026-06-07 BRT  
**Repo principal operacional:** `ServerVpss/CentralDark`  
**Regra de trabalho:** GitHub primeiro; VPS só por workflow, run-once, leitura segura ou ação explicitamente autorizada; nunca expor segredos.

---

## Estado atual

### MCP CentralDark

- O arquivo `CentralDark/apps/mcp/src/status.ts` foi atualizado na `main` do repo `ServerVpss/CentralDark`.
- Commit aplicado: `69771fd`.
- A nova página pública `/status` agora tem visual escuro, resumo, catálogo publicado, diff de catálogo e bloco de deploy/commit em modo seguro.
- Ainda falta sincronizar a VPS, buildar o MCP e reiniciar somente `MCP-CentralDark` para a página pública carregar a versão nova.

### VPS / deploy

- Antes do commit novo, a VPS estava no commit `3c1687d`.
- Depois do commit `69771fd`, é esperado que a VPS precise de pull/build/restart do MCP.
- Não mexer em CRM, Caddy, Docker/WuzAPI, banco real, WhatsApp logout/reset, domínio público ou arquivos sensíveis sem confirmação explícita.

### Workflows

Foram detectadas falhas recentes em workflows antigos de manutenção/run-once:

- `.github/workflows/ativar-monitor-tarefas.yml`
- `.github/workflows/run-once-add-mcp-icon.yml`
- `.github/workflows/run-once-instalar-grok-safe.yml`

Ação correta pendente: ajustar esses workflows para não rodarem em push comum, ou adicionar guardas claras para evitar failures falsos no histórico do Actions.

### Referência antiga `clone-deck`

- `deploy_status` sem `owner/repo` explícito ainda pode cair no nome antigo `segredounlock/clone-deck`.
- Para evitar confusão, sempre chamar com:

```txt
owner: ServerVpss
repo: CentralDark
branch: main
```

- Existe pendência para ajustar o origin/default operacional da VPS para `ServerVpss/CentralDark`, mas isso só deve ser feito com confirmação explícita.

---

## Pendências novas registradas

- `#31` — Deploy do novo `/status` do MCP na VPS.
- `#32` — Corrigir workflows run-once disparando em push.
- `#33` — Ajustar referência antiga `clone-deck` no status/deploy da VPS.

---

## Método validado para escrita de arquivos

Quando `github_create_or_update_file` bloquear arquivo grande, TypeScript ou HTML:

1. Não insistir várias vezes no mesmo método.
2. Converter o conteúdo completo para base64.
3. Usar `github_upload_base64_file`.
4. Informar explicitamente `owner`, `repo`, `branch` e `path`.
5. Validar depois com commit/arquivo.

Esse método funcionou para atualizar:

```txt
CentralDark/apps/mcp/src/status.ts
```

---

## Próximo passo recomendado

1. Fazer pull seguro da `main` na VPS.
2. Buildar `CentralDark/apps/mcp`.
3. Reiniciar apenas `MCP-CentralDark`.
4. Validar:
   - `https://mcp.centralldark.com/health`
   - `https://mcp.centralldark.com/tools.json`
   - `https://mcp.centralldark.com/status`
   - `https://mcp.centralldark.com/status.json`
5. Depois corrigir os workflows run-once para parar os failures no Actions.
6. Depois, com confirmação explícita, corrigir a referência antiga `clone-deck` no default/origin operacional da VPS.

---

## Restrições importantes

- Não expor tokens, chaves, cookies, connection strings, sessão WhatsApp, arquivos `.env` ou caminhos internos reais.
- Não reiniciar Docker/WuzAPI, mexer em Caddy, banco real, CRM, domínio público ou reset/logout do WhatsApp sem confirmação explícita.
- Logs completos devem ir para relatório/revisão; no chat, mostrar apenas resumo limpo.
