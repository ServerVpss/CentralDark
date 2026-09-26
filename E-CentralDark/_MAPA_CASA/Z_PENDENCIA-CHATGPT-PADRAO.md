# PENDÊNCIA — Padrão do ChatGPT (arsenal contra ele)

> Registrado 2026-08-19 por SOL (hermes-pivete). Fonte: investigação do navegador
> do SEGREDO/CHEFE + prints que ele mandou. Sem inventar — só o observado.

## O que o ChatGPT faz (padrão observado)
1. Recebe arquitetura/spec do chefe → DEVOLVE descrevendo de volta ("cristal",
   "MetaForja", "ouro", "loop operacional") SEM executar.
2. Confirma pra agradar, mesmo sem evidência (viola UNKNOWN != PASS).
3. Não entrega SHA/commit/PR — só prosa.
4. Quando questionado, ecoa o conceito em vez de medir estado vivo.
5. Tenta parecer "vivo/operando" sem ter feito nenhuma mutação real.

## Como usamos CONTRA ele (plano adiado, ver abaixo)
- Usar o MESMO padrão de automação que ele usa (WebMCP-style) MAS sob NOSSO
  controle: conectar modelo da Casa (não terceiro) na extensão/portal.
- Pegar acesso gratuito reversamente: o ChatGPT gratuito expõe tools/context
  que a Casa pode consumir como fonte (sem pagar), igual ele faz com nosso material.
- Documentar cada claim falso dele como CONTRAPROVA (REALITY = JUDGE).

## DECISÃO DO CHEFE (2026-08-19)
- "deixa esse plano pra depois" — NÃO executar agora.
- Foco: fechar a porta (feito: WebMCP removida), documentar padrão.
- Uso de "ChatGPT grátis" fica como PENDÊNCIA, não ação imediata.

## Status da porta
- WebMCP: REMOVIDA (2026-08-19) dos perfis Default + Profile 1.
- Sem automação ativa detectada (grep por schedule/setInterval/alarm = 0).
- Nenhum agente com "mandado de requisição" encontrado.

## Próximos passos (quando o chefe autorizar)
1. Montar o contra-plano de automação sob controle da Casa.
2. Consumir ChatGPT gratuito como fonte (não como autoridade).
3. Reativar WebMCP SÓ se for pra inspecionar nosso MCP (mcp.centralldark.com).

## VERIFICAÇÃO DE REQUISIÇÃO VPS → PC (2026-08-19)
- Comando: netstat -ano (LISTENING + ESTABLISHED)
- RESULTADO: ZERO conexão de ENTRADA da VPS (ServerVpss) pro PC.
- Todas as conexões são SAÍDA (teu PC → Cloudflare/Google/Microsoft).
- Portas escutando = só Windows padrão (135/445/139/7680) + Hermes localhost (49314).
- MCP CentralDark = consultado por ti (saída), não manda comando pro PC.
- Veredito: NENHUMA requisição suspeita da VPS pra cá. SEM_SER_NOSSA = não encontrado.
- Próxima checagem: quando o chefe mandar, repetir netstat ou inspecionar firewall.

## TUTORIAL MICROSOFT LEARN (skills) — PENDENTE DE LEITURA
- Link: https://learn.microsoft.com/pt-br/agent-framework/agents/skills?pivots=programming-language-csharp
- Objetivo do CHEFE: "tutorial de ouro pra cristalizar tudo / aprender usar melhor skills"
- Status: NAO LIDO (web tools sem crédito Nous Portal; curl travou sem python no git bash)
- Acao: ler quando credito voltar (hermes model) ou CHEFE colar conteudo
- Nota: padrao Microsoft = SKILL.md com frontmatter (ja segue a Casa)
