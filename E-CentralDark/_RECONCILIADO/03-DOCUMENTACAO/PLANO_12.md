# Plano — infra/pm2

## Para que serve
Arquivos de configuração do PM2 (gerenciador de processos Node) para os serviços da CentralDark.

## ✅ Feito
- `mcp.pm2.json` pronto para subir o MCP CentralDark

## 🟡 Em andamento
- Subir o MCP via PM2 na VPS

## 🔴 A fazer
- Centralizar aqui os PM2 de todos os serviços (hoje espalhados)
- Documentar allowlist de restart automático

## 🛡️ Regras de segurança
- Restart automático pelo MCP só para: `CloneDeck-Supabase-Sync`, `MultiZap-TelegramBot`
- Qualquer outro restart precisa confirmação humana
- `env_file` sempre aponta para `/root/CentralDark/secrets/`

## 🚀 Próximo passo
Rodar `pm2 start /root/CentralDark/infra/pm2/mcp.pm2.json` quando o código estiver instalado.
