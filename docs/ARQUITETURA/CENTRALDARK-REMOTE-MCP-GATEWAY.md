# CENTRALDARK REMOTE MCP GATEWAY
status: ATIVO_2026-09-08
owner: CENTRALDARK

## Rota operacional

- MCP da Casa: `https://mcp.centralldark.com/mcp`
- Remote Desktop Commander: `https://mcp.desktopcommander.app/mcp`
- Screenpipe local: `http://127.0.0.1:3030`
- Device: `SEGREDO`

## Regra

Desktop Commander e transporte/capacidade local. CentralDark continua owner/control plane.
Nao expor token do Screenpipe, shell irrestrito ou secrets no repo.

## Contexto local pelo MCP remoto

`CentralDark-Context-Sidecar.ps1` consulta o Screenpipe autenticado e grava um snapshot enxuto em
`GARIMPO-CHEFE/context/screenpipe-latest.json`. O Desktop Commander remoto pode ler esse arquivo
quando o agente precisar de contexto recente de tela/navegador, mantendo o dado na Casa.

`CentralDark-Remote-Bridge.ps1` sobe o sidecar e deve manter o pin provado
`@wonderwhy-er/desktop-commander@0.2.48 remote` até nova versão ser remensurada.
O pacote da Casa `CentralDark-Remote-Tray-NPX-ATUAL-FIX-20260909` preserva o mesmo owner,
login URL e parser de device code, mas `latest` ali é evidência histórica/operacional,
não substitui automaticamente o pin canônico.

Para mais de uma conta, o modelo canônico é `MULTI_ACCOUNT_ISOLATED_HOME`: cada conta
usa um `HOME` próprio, um `device.json` próprio e um serviço/watchdog próprio, todos
passando pelo mesmo corredor Remote MCP/Desktop Commander.

Config canônica: `scripts/remote-bridge/CENTRALDARK-REMOTE-BRIDGE.config.json`.

## Padrão de idioma da CLI CentralDark

Toda mensagem destinada ao humano na CLI, instalador, bridge, painel de terminal e menus próprios da CentralDark deve aparecer em **português do Brasil**, de forma curta, legível e consistente.

```text
CLI_HUMANA_PADRAO=PT-BR
DETALHE_TECNICO_PODE_PRESERVAR_CHAVE_ESTAVEL=true
OUTPUT_EXTERNO_PODE_PERMANECER_NO_IDIOMA_ORIGINAL=true
OUTPUT_EXTERNO_DEVE_SER_MARCADO_COMO_DETALHE_EXTERNO=true
NAO_TRADUZIR_TOKEN_PROTOCOLO_ENDPOINT_SHA_OU_NOME_DE_FERRAMENTA=true
```

Padrão visual recomendado para superfícies próprias:

```text
[OK]       = operação concluída e provada no escopo
[INFO]     = informação observada
[AGUARDE]  = operação em andamento
[AVISO]    = atenção sem falha comprovada
[ERRO]     = falha observada
[PARADO]   = serviço/componente não ativo
[DESCONHECIDO] = estado ainda não provado
```

Títulos próprios também devem preferir português:

```text
BOOT / PRE-FLIGHT      -> INICIALIZAÇÃO / PRÉ-VOO
REMOTE MCP             -> MCP REMOTO
CONNECTING             -> CONECTANDO
CONNECTED              -> CONECTADO
RETRY                   -> NOVA TENTATIVA
DETAILS                 -> DETALHES
STATUS                  -> ESTADO
```

Exceção importante: texto emitido diretamente por ferramenta externa, por exemplo `Hermes Agent`, `npx`, PowerShell, Git ou Desktop Commander, não deve ser adulterado como se fosse saída nativa da CentralDark. A camada CentralDark deve enquadrar esse texto com um rótulo humano em PT-BR, por exemplo `DETALHE EXTERNO`, preservando a mensagem original para diagnóstico.

```text
CENTRALDARK_OUTPUT -> PT-BR
UPSTREAM_OUTPUT -> ORIGINAL + ROTULO_PTBR
MACHINE_LOG_KEYS -> ESTAVEIS
HUMAN_SUMMARY -> PT-BR
```

## Receipt da correção

OBSERVED_AT=2026-09-08
SOURCE=imagem da CLI/instalador e Remote Bridge fornecida pelo CHEFE
SCOPE=UX_CLI_IDIOMA
DELTA=padronizar superfícies humanas da CentralDark em PT-BR sem quebrar logs/protocolos externos
OWNER_REUSED=this_document
NEW_ENGINE=false
NEW_ROUTER=false
RUNTIME_LOCAL_PATCH=NOT_PROVEN
REPO_CONTRACT=PERSISTED
NEXT_CURSOR=localizar cada wrapper/launcher que imprime texto humano -> aplicar mapa PT-BR -> testar renderização -> contraprova -> receipt

`DOCUMENTED != EXECUTED`: este contrato fixa o padrão do repositório. Scripts locais ainda não presentes no GitHub ou wrappers gerados fora do repo precisam ser medidos antes de declarar a tradução aplicada fisicamente.
