Uso: /root/CentralDark/install.sh <modo>

Modos:
  sem argumento         Abre wizard interativo
  --check               Verifica ambiente (rápido) — abre painel automático se OK
  --no-menu             Combina com --check: não abre o painel no fim
  --check-final         Roda o checker END-TO-END (12 blocos + relatório)
  --install             Instala base CentralDark + checker no final
  --wildcard            Wizard DNS wildcard (@, www, *) — caminho oficial
  --wildcard-check      Só valida DNS wildcard (não toca Caddy)
  --online-check        Testa se subdomínios oficiais estão online
  --cloudflare          Atalho: cria @, www, * via API Cloudflare
  --cloudflare-check    Só valida token + lista registros
  --cloudflare-apply    Aplica DNS sem interação (CI / re-run)
  --dns-check           Checker DNS+Caddy+HTTPS (read-only)
  --domains             Atalho: --wildcard + --dns-check
  --mcp                 Prepara base MCP
  --connect             Conectar Cloudflare pelo celular (QR no terminal)
  --deps                Instala só as dependências do instalador (curl, jq, qrencode, dig, ...)
  --menu                Instala menu colorido da VPS (cdmenu / cdstatus / menu)
  --update              Atualiza install.sh + repo local (git pull main)
  --no-update           Pula o auto-update desta execução
  --link                Cria atalho global (centraldark / clonedeck em /usr/local/bin)
  --where               Mostra onde o repo foi localizado
  --restore             Futuro
  --help                Esta tela
