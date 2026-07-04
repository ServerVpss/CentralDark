Padronizar o caminho do Hermes em 3 lugares e adicionar log de boot mostrando o que o MCP carregou.

## 1. Criar arquivo único de config

Novo arquivo `apps/modulos/mcp/config/hermes.json` (fonte da verdade):

```json
{
  "hermes_core_path": "apps/modulos/HERMES-CORE",
  "modules_expected": ["agents", "core", "knowledge", "missions", "prompts", "skills", "utils"]
}
```

## 2. Log de boot no MCP (VPS)

Editar `apps/modulos/mcp/dist/index.js` pra ler o `hermes.json` no startup e imprimir:

```
[HERMES-BOOT] caminho: /root/CentralDark/apps/modulos/HERMES-CORE
[HERMES-BOOT] módulos encontrados: agents ✅ | core ✅ | knowledge ✅ | missions ✅ | prompts ✅ | skills ✅ | utils ✅
[HERMES-BOOT] agentes: Auto-Diagnostico, Critic, Deploy-Watcher, Executor, GraphRAG-Master, Knowledge-Collector, Universal-Handler
```

Aparece em `pm2 logs 33` e num arquivo `logs/hermes-boot.json` pro painel consumir.

## 3. Config cliente (`.claude/settings.json`)

Adicionar bloco:

```json
"hermes": {
  "core_path": "/root/CentralDark/apps/modulos/HERMES-CORE",
  "config": "apps/modulos/mcp/config/hermes.json"
}
```

## 4. Painel Mega (status.centralldark.com)

Adicionar bloco `hermes_boot` no `painel-data.json` via tool `atualizar_painel`:
- caminho carregado
- módulos ✅/❌
- timestamp do último boot
- lista de agentes

## 5. Painel Hermes (WebUI aba Auditoria)

Adicionar card "Boot Info" no topo lendo `logs/hermes-boot.json` (arquivo do passo 2).

## 6. Restart

`pm2 restart 33 && pm2 save` pra pegar o novo boot. Commit com msg `feat(hermes): padroniza caminho HERMES-CORE + log de boot nos 3 painéis`.

## Detalhes técnicos

- Edito arquivos no repo → git push → webhook VPS puxa → PM2 restart.
- `dist/index.js` é o entrypoint atual (12k) — patcho no bloco de startup existente, sem quebrar oauth/painel/sessions.
- Backup `.bak-hermes-boot-<timestamp>` antes de mexer.
- Notificação Telegram final via Card Hermes v1.3 (bot @srver1bot).