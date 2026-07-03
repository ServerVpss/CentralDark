# 13 - MCP CentralDark

## Secrets e Cofre

**Cofre oficial:** `/root/CentralDark/secrets/`

- `supabase-mcp.env` é o arquivo preferencial para o MCP
- O código em `supabase.ts` carrega primeiro deste cofre
- Fallbacks legados em `/root/Multizap/` e `/root/whatsapp-server/` ainda existem temporariamente
- Monitore logs por mensagens de "cofre oficial usado" vs "fallback legado usado"

## Como preparar o cofre

Use o script run-once:
```bash
bash scripts/run-once/migrate-supabase-cofre.sh
```

Ou manualmente:
```bash
mkdir -p /root/CentralDark/secrets
chmod 700 /root/CentralDark/secrets
install -m 600 -o root -g root /dev/null /root/CentralDark/secrets/supabase-mcp.env
```

Preencha o arquivo com as chaves necessárias.

## Validação
Após restart do MCP:
- `/health` OK
- `supabase_projects` retorna projetos reais
- `supabase_schema_check` funciona
