# CentralDark Casa Commander — MCP único + Tailscale privado

## Arquitetura instalada no repositório
- **MCP CentralDark** continua o único control plane e expõe 4 tools de Casa.
- **Casa Windows:** CentralDark-Casa-Agent.mjs escuta somente em 127.0.0.1:9101.
- **Tailscale Serve:** expõe SEGREDO:9100 -> 127.0.0.1:9101, sem exposição pública.
- **Engine local:** software aberto MIT wonderwhy-er/DesktopCommanderMCP, pacote imutável @wonderwhy-er/desktop-commander@0.2.48 rodando via stdio. O serviço remoto do fornecedor NÃO participa. Código-fonte e licença: https://github.com/wonderwhy-er/DesktopCommanderMCP.
- **Tray One Shot:** scripts/remote-bridge/canonical/ABRIR-MENU-TRAY.cmd inicia e registra a tarefa automática CentralDark-Casa-Commander; o menu alternativo é MENU-OPERACIONAL-TRAY.ps1.

## Pré-requisitos
1. Node.js/npx, PowerShell, Tailscale autenticado na Casa e arquivo CentralDark-Casa-Agent.mjs instalado na pasta do projeto.
2. Mesmo segredo aleatório (>=24 caracteres) configurado com o nome CENTRALDARK_CASA_BRIDGE_TOKEN nos ambientes seguros da Casa e do MCP VPS. NÃO escreva o segredo no GitHub, no chat, em scripts, na URL ou em logs.
3. Na VPS, CENTRALDARK_CASA_TAILSCALE_HOST=segredo, se necessário (MagicDNS); não apontar para endereço público.
4. Para operações que modificam arquivos/processos, o opt-in local CENTRALDARK_CASA_WRITE_ENABLED=true é exigido, além de OAuth admin, auditoria de startup e confirmação PERMITO SEGREDO. O padrão é somente leitura.

## Execução única na Casa
No diretório do repositório atualizado:
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\remote-bridge\CentralDark-Remote-Bridge.ps1 -InstallAutoStart

Ou duplo clique no ABRIR-MENU-TRAY.cmd existente. A tarefa no Agendador inicia ao logon e reconcilia a cada 5 minutos. Não é garantia com PC desligado, conta deslogada, internet/VM fora do ar ou segredo ausente.

## Prova E2E
1. No Windows: http://127.0.0.1:9101/health -> ok:true.
2. Na VPS/MCP: centraldark_casa_status.
3. No MCP: centraldark_casa_list_directory com path=F:\_worktrees.
4. Somente o retorno atual da pasta comprova leitura. Branch, processo e saúde não bastam.

## Limites
- A mudança está inicialmente em branch/PR: não significa merge, instalação, deploy, login nem readback da Casa.
- Não ativa permanentemente o PC desligado e não burlar controles da plataforma.
- Os scripts históricos do Remote Desktop Commander permanecem no Git para auditoria; não são chamados pelo novo One Shot.
