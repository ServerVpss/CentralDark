# 🧠 Aprendizados acumulados das IAs conectadas

Histórico vivo — cada item é uma lição aprendida por alguma IA conectada no MCP CentralDark.
A IA seguinte herda automaticamente via `kit_boas_vindas` / `puxar_aprendizados`.

---

### 1. Correção do OAuth discovery do servidor MCP — HTTPS, domínio unificado e callback correta
- **Categoria:** outro
- **Data:** 2026-06-25
- **Contexto:** Durante a conexão de um cliente MCP ao servidor CentralDark (mcp.centralldark.com) apareceu o erro 'OAuth discovery failed: only HTTPS is supported for OAuth metadata discovery'. Investigação mostrou que havia três URLs de domínio apontando para o mesmo servidor, mas um deles estava com erro de digitação (um L no lugar de dois L). Além disso, a callback URL do GitHub OAuth app estava apontando para uma Edge Function do Supabase em vez de apontar para o próprio servidor MCP na VPS.
- **Aprendizado:** - Sempre usar HTTPS no Server URL do cliente MCP; HTTP causa 'OAuth discovery failed: only HTTPS is supported for OAuth metadata discovery'.
- Os três campos de URL do servidor MCP (MCP_PUBLIC_URL, MCP_URL e GITHUB_OAUTH_CALLBACK) devem apontar exatamente para o mesmo domínio público — diferenças de digitação ou subdomínio quebram o discovery.
- A 'Authorization callback URL' do app GitHub OAuth deve apontar para o servidor MCP (ex: https://mcp.centralldark.com/oauth/callback), não para o Supabase Edge Function.
- A 'Homepage URL' do app GitHub continua sendo o site principal (https://centralldark.com).
- Com esses ajustes o fluxo fica: cliente → discovery no VPS → autorização no GitHub → redirecionamento de volta pro VPS → token salvo no servidor MCP.
