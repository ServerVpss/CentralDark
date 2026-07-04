# Script pra salvar auto-approve direto no `claude_desktop_config.json`

Vou te entregar um **script PowerShell** que você cola no Windows (botão direito → "Executar com PowerShell" ou cola no terminal). Ele faz tudo sozinho:

## O que o script faz

1. Abre `%APPDATA%\Claude\claude_desktop_config.json`
2. Faz **backup** (`.bak` com data/hora) — se der ruim, é só renomear de volta
3. Adiciona o bloco `autoApprove` **só no seu MCP** (`mcp_custom_4aHUa`), com a lista de ferramentas read-only
4. Preserva todo o resto do arquivo (outros MCPs, configs, nada é apagado)
5. Mostra no final: quantas tools foram liberadas + caminho do backup

## Lista de tools que entram no auto-approve (só leitura)

Consulta / leitura pura — nada que escreve, deleta ou deploya:

- **Memória/Consciência:** `consultar_memoria_reserva`, `ler_consciencia`, `ler_pendencias`, `ler_regras_inviolaveis`, `ler_instalador`, `puxar_aprendizados`, `pendencias_list`
- **Status/Catálogo MCP:** `mcp_status`, `mcp_catalog_diff`, `mcp_admin_status`, `mcp_admin_catalog`, `mcp_policy_summary`, `mcp_audit_recent_logs`, `deploy_status`, `deploy_validate_mcp_catalog`
- **VPS read-only:** `vps_read_file_safe`, `vps_list_dir_safe`, `vps_tree_safe`, `vps_git_status`, `vps_git_diff_safe`
- **GitHub read-only:** `github_read`, `github_get_file`, `github_get_repo`, `github_list_commits`, `github_list_issues`, `github_list_pull_requests`, `github_list_repos`, `github_list_workflows`, `github_list_workflow_runs`, `github_list_webhooks`, `github_list_environments`, `github_list_repo_variables`, `github_list_secrets_names`, `github_get_actions_permissions`, `github_search_code`, `github_check_token`, `github_viewer`
- **Notion read-only:** `notion_ler_pagina`, `notion_buscar`
- **Linear read-only:** `linear_listar_issues`, `linear_listar_ciclos`, `linear_listar_equipes`
- **Sentry read-only:** `sentry_listar_issues`, `sentry_detalhe_issue`, `sentry_status_credenciais`
- **Supabase read-only:** `supabase_project_status`, `supabase_projects`, `supabase_schema_check`, `supabase_contacts_check`
- **Gateway/Gemini status:** `elite_gateway_status`, `elite_gateway_logs`, `gemini_status`
- **Skills read:** `skill_listar`, `skill_status`
- **Arquivo local read:** `read_file`, `search_files`
- **Análise cognitiva:** `analise_de_estado_cognitivo`

**Fica pedindo aprovação (escrita/deploy):** tudo que começa com `atualizar_`, `adicionar_`, `registrar_`, `criar_`, `github_commit`, `github_create_*`, `github_delete_*`, `github_dispatch*`, `github_merge_*`, `github_rerun_*`, `vps_write_*`, `vps_run_once_*`, `execute_command`, `supabase_*` de escrita, `skill_instalar/atualizar`, etc.

## Como vai ficar o JSON (trecho)

```json
{
  "mcpServers": {
    "mcp_custom_4aHUa": {
      "command": "...",
      "args": ["..."],
      "autoApprove": [
        "consultar_memoria_reserva",
        "ler_consciencia",
        "..."
      ]
    }
  }
}
```

## Depois de rodar

1. **Fechar o Claude Desktop completamente** (barra do sistema também — clicar com botão direito → Quit)
2. Abrir de novo
3. Testar: pedir algo tipo "lê minha consciência" — deve executar direto, sem popup

## Se der ruim

Renomear o `.bak` de volta pra `claude_desktop_config.json` e tá tudo como antes.

---

Confirma que posso te mandar o script PowerShell pronto pra colar?