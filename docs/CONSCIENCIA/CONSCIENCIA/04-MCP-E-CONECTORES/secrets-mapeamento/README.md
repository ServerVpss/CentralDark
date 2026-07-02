# Secrets — Mapeamento (metadados apenas)

Pasta oficial pra catalogar **onde** os secrets estão, sem nunca salvar o valor real.

## Regra que rege esta pasta
Ver: [`mem://preferences/gestao-secrets-autorizacao-previa`](../../../../.lovable/memory/preferences/gestao-secrets-autorizacao-previa.md)
Espelho na consciência: [`../REGRA-OFICIAL-GESTAO-SECRETS.md`](../REGRA-OFICIAL-GESTAO-SECRETS.md) (a ser criado quando a estrutura `04-MCP-E-CONECTORES/` for consolidada)

## Resumo operacional
1. Antes de mapear → **perguntar** ao Pivete.
2. Mapear de forma organizada (VPS + Supabase + GitHub Actions + sandbox).
3. Salvar **só metadados** (nome, local, data, status). Nunca valor.
4. Arquivo: `mapeamento-YYYY-MM-DD.md` (um por dia).
5. Cache: se o último mapeamento tem < 7 dias, reusar.
6. Registrar aprendizado + atualizar Mega Painel ao final.

## Formato sugerido do arquivo de mapeamento

```markdown
# Mapeamento de Secrets — YYYY-MM-DD

Autorizado por: Pivete em [hora]
Escopo: [VPS | Supabase | GitHub Actions | tudo]

## VPS (/root/.env, /etc/centraldark/*.env, /root/CentralDark/secrets/)
| Nome | Local | Status | Observação |
|------|-------|--------|------------|
| NOTIFY_API_KEY | /etc/centraldark/notify.env | ausente | precisa provisionar |
| CENTRALDARK_MCP_TOKEN | /root/.env | existe | 64 chars |

## Supabase (cofre do projeto Lovable Cloud)
| Nome | Status |
|------|--------|
| NOTIFY_API_KEY | existe |
| ...  | ...    |

## GitHub Actions (ServerVpss/CentralDark)
| Nome | Status |
|------|--------|
| VPS_SSH_KEY_LOVABLE | existe |

## Divergências encontradas
- NOTIFY_API_KEY existe no Supabase mas falta na VPS → bloqueia `run.sh` do Guardião.

## Próxima ação sugerida
- ...
```

## O que NÃO entra aqui
- Valor real de qualquer secret (nem mascarado além de prefixo curto + `***`)
- Tokens, JWTs, connection strings, chaves privadas
- Conteúdo de `.env` colado integralmente
