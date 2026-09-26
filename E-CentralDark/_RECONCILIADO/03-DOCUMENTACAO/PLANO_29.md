# PLANO - Migração do Cofre Supabase (atualizado)

## Status: Concluído (parcial)

### O que foi feito:
- Atualizado `supabase.ts` com prioridade para cofre oficial `/root/CentralDark/secrets/`
- Adicionado logs sanitizados (cofre oficial vs fallback legado)
- Adicionado validação de chaves críticas
- Criado script run-once: `scripts/run-once/migrate-supabase-cofre.sh`

### Pendência restante:
- Executar o run-once na VPS
- Build + restart do MCP
- Validação completa com supabase_projects
- Remover fallbacks legados após 30 dias (abrir pendência)

### Ordem correta implementada no supabase.ts:
1. /root/CentralDark/secrets/supabase-mcp.env
2. /root/CentralDark/secrets/supabase.env
3. /root/CentralDark/secrets/mcp.env
4. Fallbacks legados (temporários)
5. process.env

## Regras de Segurança Aplicadas
- Logs sanitizados
- Validação de formato da SERVICE_ROLE_KEY
- Nunca expor valores
- Fallback mantido apenas como rede de segurança

## Próximo passo manual
Rodar na VPS:
```bash
bash /root/CentralDark/scripts/run-once/migrate-supabase-cofre.sh   # ou o path correto após deploy
```

Depois: build + restart MCP + smoke test.
