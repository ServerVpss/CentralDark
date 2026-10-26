# PowerShell — consulta oficial por gatilhos (sob demanda)

Owner: [Skill-mãe CentralDark](../SKILL.md).
Data da inclusão: 2026-10-25.
Escopo: consultoria de PowerShell **read-only por padrão**, com pesquisa contextual na fonte oficial Microsoft Learn. Não cria outra skill-mãe, serviço permanente, modelo, gateway ou mecanismo paralelo de busca.

## Contrato executável do gatilho

- **ATIVAR** apenas quando o pedido envolver PowerShell ou o retorno observado contiver um erro de PowerShell (`powershell.exe`, `pwsh`, `.ps1`, cmdlet, módulo `PS`, `ParserError`, `CommandNotFoundException`, `FullyQualifiedErrorId`, `PSScriptAnalyzer`, `DSC`, SDK, Gallery, remoting).
- **NÃO ATIVAR** em falha de bash, Python, WSL, git, UI ou rede não relacionada a PowerShell. `NO_MATCH => NO_SEARCH`.
- **BUSCAR AUTOMATICAMENTE A FONTE** após um erro PowerShell detectado: visitar primeiro [PowerShell Documentation — Microsoft Learn](https://learn.microsoft.com/en-us/powershell/), seguir o tópico oficial mais específico conforme a matriz abaixo e considerar a edição/versão observada. Se a ferramenta web do agente estiver habilitada, usá-la. Se não estiver, usar o consultor local `scripts/Consultar-PowerShellDocs.ps1` que busca somente as URLs oficiais previstas.
- **CONFRONTAR LOCALMENTE ANTES DE CORRIGIR**: `$PSVersionTable`, `$PSHOME`, `Get-Command NOME -All -ErrorAction SilentlyContinue`, `Get-Module -ListAvailable`, `Get-Help NOME -Online` quando cabível, e caminho real do executável (Windows PowerShell 5.1 vs PowerShell 7; Windows/Linux/macOS; runspace limitado). Não confundir comando reconhecido em documentação com comando disponível no host.
- **NÃO INSTALAR/ALTERAR** por leitura: sem `Install-Module`, `Install-PSResource`, `Install-Package`, `Set-ExecutionPolicy`, elevação, atualização do SO ou correção de profile sem intenção e aprovação aplicáveis.
- **DEVOLVER** `PS_TRIGGER`, `PS_ERROR_FINGERPRINT` (sanitizado), `PS_EDITION_VERSION`, `MICROSOFT_LEARN_URL`, `DOC_FETCH_STATUS`, `LOCAL_CAUSE`, `MIN_DELTA`, `PROVA` e `VEREDITO=PASS|FAIL|UNKNOWN`. Se sem acesso web, `DOC_FETCH_STATUS=UNAVAILABLE` e não alegar documentação lida.
- Uma consulta é ação de diagnóstico; correção do arquivo/sistema é **mutação separada**, sujeita ao Kimetsu e ao writer único. `DOCS_FOUND != HOST_SUPPORTED != FIX_PROVED`.

## Gatilhos de consulta oficial — matriz acionável

Todos os links apontam para fonte oficial Microsoft, documentação da equipe PowerShell ou repositório oficial; sublinks podem variar conforme a edição e a versão.

| Categoria | Sinais no erro ou na intenção | Página oficial de entrada |
|---|---|---|
| PowerShell: conceito e sintaxe | `Get-Help`, pipeline, objeto, sintaxe, `.ps1`, `ParserError`, `about_*` | [PowerShell Documentation](https://learn.microsoft.com/en-us/powershell/) → [What is PowerShell](https://learn.microsoft.com/en-us/powershell/scripting/overview) |
| Setup, download, edições e versões | `powershell.exe` vs `pwsh`, `$PSVersionTable`, comando ausente após instalar, instalação Windows/Linux/macOS | [Setup and installation](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell) e [PowerShell Documentation](https://learn.microsoft.com/en-us/powershell/) |
| How-To e sample scripts | `.ps1`, quoting, encoding, profiles, erros de parâmetros, script falhando | [PowerShell scripting](https://learn.microsoft.com/en-us/powershell/scripting/overview) → How-To Guide / Sample scripts |
| Cmdlet e módulo nativo (inclui erro real) | `Get-FileHash`, `CommandNotFoundException`, `Get-Command`, `ModuleNotFound`, `Import-Module` | [PowerShell Module Browser](https://learn.microsoft.com/en-us/powershell/module/) → [Get-FileHash](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash) |
| PowerShell Utility modules | `Crescendo`, `PlatyPS`, `PSScriptAnalyzer`, `SecretManagement`, `SecretStore` | [PowerShell Utility modules](https://learn.microsoft.com/en-us/powershell/utility-modules) |
| PSScriptAnalyzer e qualidade | `Invoke-ScriptAnalyzer`, rule violation, variáveis não inicializadas, lint/format | [PSScriptAnalyzer](https://learn.microsoft.com/en-us/powershell/utility-modules/psscriptanalyzer/overview) |
| Galeria e gerenciamento de pacotes | `Find-Module`, `Install-Module`, `Install-PSResource`, `Get-PSResource`, versões ou proveniência | [PowerShell Gallery](https://www.powershellgallery.com/) / [Package management](https://learn.microsoft.com/en-us/powershell/gallery/overview) |
| Desired State Configuration | `DSC`, `Configuration`, `Start-DscConfiguration`, `dsc`, drift/estado | [Microsoft DSC 3.0](https://learn.microsoft.com/en-us/powershell/dsc/overview) → DSC 2.0/1.1 conforme runtime |
| VS Code: edição e depuração remota | extensão PowerShell, `launch.json`, `PowerShell Integrated Console`, `Enter-PSSession` | [VS Code PowerShell](https://code.visualstudio.com/docs/languages/powershell) / [Remote editing](https://learn.microsoft.com/en-us/powershell/scripting/dev-cross-plat/vscode/using-vscode-for-remote-editing-and-debugging) |
| SDK e desenvolvimento | `System.Management.Automation`, cmdlet em C#, runspace, Windows PowerShell SDK, API reference | [Windows PowerShell SDK](https://learn.microsoft.com/en-us/powershell/scripting/developer/windows-powershell) / [.NET API Browser](https://learn.microsoft.com/en-us/dotnet/api/) |
| Azure Cloud Shell, Azure modules e runbooks | `Connect-AzAccount`, `Az.*`, `Automation runbook`, Cloud Shell | [Azure PowerShell](https://learn.microsoft.com/en-us/powershell/azure/) / [Azure Automation](https://learn.microsoft.com/en-us/azure/automation/overview) |
| Windows management modules | `Get-WmiObject`, `Get-CimInstance`, `Get-Service`, Windows-only cmdlets | [Windows PowerShell Modules](https://learn.microsoft.com/en-us/powershell/module/) |
| Blog, anúncios, incidentes upstream | regressão após update, breaking change, bug confirmado | [PowerShell Team Blog](https://devblogs.microsoft.com/powershell/) / [PowerShell GitHub Issues](https://github.com/PowerShell/PowerShell/issues) |
| Comunidade / exemplos auxiliares | ambiguidade não resolvida na Microsoft Learn | [PowerShell Tech Community](https://techcommunity.microsoft.com/category/windows-server/discussions/azure) / [PowerShell.org](https://powershell.org/) / Stack Overflow / r/PowerShell (somente fontes secundárias) |

**Atenção 2026:** a documentação oficial registra Crescendo aposentado em maio de 2026 e SecretManagement/SecretStore aposentados em junho de 2026; verificar a página antes de escolher qualquer instalação. Usar a informação atual da fonte e **não recomendar instalação automática** de módulo obsoleto.

## Contraprova histórica — `Get-FileHash` ausente

**Entrada observada (2026-10-25):** `Get-FileHash : O termo 'Get-FileHash' não é reconhecido` no ambiente de execução da Casa.

**Gatilho:** `PS_CMDLET_NOT_FOUND` ⇒ abrir a documentação oficial `Get-FileHash` no Module Browser, observar `Microsoft.PowerShell.Utility`; comparar com `Get-Command Get-FileHash`, `Get-Module Microsoft.PowerShell.Utility -ListAvailable`, edição real e runspace. A documentação mostrar `Get-FileHash` **não** significa que o comando está disponível no shell remoto específico.

**Menor delta comprovado no caso:** `git hash-object README.md` foi usado para comparar **objetos Git** entre Casa e main; `sha256sum` no openKylin para verificar SHA-256 de bytes. **Não tratar `git hash-object` como SHA-256**: esse comando normalmente calcula OID/blobs de Git com formato e algoritmo definidos pelo repositório. Não alterar a execução do PowerShell ou instalar módulos apenas para calcular checksum.

## Exemplo de acionamento sem loop

```powershell
# Chamada sob demanda pelo agente que recebeu erro real.
powershell.exe -NoProfile -File 'K:\.agents\skills\centraldark-operational-method\scripts\Consultar-PowerShellDocs.ps1' -Mensagem 'Get-FileHash : O termo Get-FileHash não é reconhecido'
# Simular roteamento sem abrir web:
powershell.exe -NoProfile -File 'K:\.agents\skills\centraldark-operational-method\scripts\Consultar-PowerShellDocs.ps1' -Mensagem 'Get-FileHash is not recognized' -SomenteRota
```

Este script é um **consultor a ser chamado no retorno do erro**; ele não prova interceptação global de toda execução de PowerShell, nem cria serviço residente. A skill-mãe instrui a chamada automática **pelos agentes que a carregarem**; sem integração com o executor central, a observação de erros de terceiros permanece `NOT_PROVEN`.

## Proveniência e disciplina

- Fonte primária verificada: https://learn.microsoft.com/en-us/powershell/
- Diagnóstico é `SPIKE`/somente leitura; mudança mínima `BOUNDED` usa Kimetsu; modificação da plataforma/arquitetura é `ARCHITECTURAL`.
- Regra: **`PS_ERROR_MATCH → OFFICIAL_LOOKUP → HOST_READBACK → DELTA MINIMO → TESTE → RECEIPT`**, respeitando a intenção e sem confundir conhecimento consultado com instalação/execução.

**Política da Casa (25/10/2026):** CurrentUser=RemoteSigned autorizado pelo CHEFE, sem modificar LocalMachine/GPO. A política permite executar o consultor local sem Bypass, mas não corrige autoload de Microsoft.PowerShell.Utility; diagnosticar módulos separadamente.
