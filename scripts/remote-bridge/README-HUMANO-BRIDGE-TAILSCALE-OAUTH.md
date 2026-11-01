# CentralDark Remote Bridge — entrada unica, LOCAL-FIRST

**Um produto, uma base de codigo, varios ambientes de execucao.** O Bridge da Casa e o ponto de controle local. Notebook = no de agentes; openKylin no Kingston = Forja (boot nativo OU VMware rawDisk com acesso exclusivo); VPS = runtime 24/7 do MESMO produto promovido por Git/CI/receipts. A VPS nao substitui a Forja e nao e um segundo projeto.

## Diagnostico da rede local (SEM mutacao)

Executar o **mesmo arquivo ja existente** na Casa:

```powershell
powershell.exe -NoProfile -File K:\scripts\remote-bridge\CentralDark-Remote-Bridge.ps1 -LocalStatus -Json
```

Retorna um JSON tipado `centraldark.local-first.readonly.v1`, com portas locais e rotas ao notebook. Ordem: **LAN fisica (se IP conhecido)** -> **Radmin VPN privada** -> **Tailscale autorizado** -> **SSH Casa/VPS existente apenas como fallback**. Nunca instala serviço, altera firewall/VPN, modifica disco ou executa comandos remotos neste modo.

O IP LAN do notebook foi medido pelo proprio Windows como `192.168.100.2` (Wi-Fi); a Casa usa `192.168.100.5/24` (Ethernet). Notebook -> Casa ping PASS (2-3 ms). **Casa -> notebook pela LAN ainda falhou**: ICMP sem resposta e TCP 5985/445/22/3389 com timeout. Esse IP e apenas um candidato observado, nao uma identidade validada nem uma rota autenticada. O Bridge o testa primeiro; se nao responde, passa ao Radmin. O endereco candidato pode ser atualizado pela variavel de sessao `CENTRALDARK_NOTEBOOK_LAN_IP`, sem mudar o JSON. O diagnostico rejeita enderecos fora da LAN ou apontando para a propria Casa.

A ultima medicao do notebook `NOTEBOOK-AGENTES-FULL-ADMIN` teve Radmin `26.251.127.144:5985` acessivel, mas **porta aberta NAO prova identidade, login, autorizacao ou terminal**. O IP Tailscale `100.102.99.102` veio de outra conta/tailnet e nao apareceu como peer na Casa. Nao misturar esses estados. O modo `-LocalStatus` nunca chama WinRM remoto, SSH remoto ou SMB para executar.

**Reuso de owners (nao criar/instalar nada):** `K:\scripts\remote-bridge\CentralDark-Remote-Bridge.ps1` e o script real do Bridge; `canonical\CENTRALDARK-REMOTE-BRIDGE.config.json` e o JSON real. Em alguns checkouts Windows, o alias de configuracao na raiz e um arquivo-texto que aponta para o JSON, nao um symlink funcional; o Bridge ja prioriza o JSON canônico. A receita `K:\scripts\casa\CentralDark-VPS-Casa-PID-OneShot.ps1` permanece INALTERADA e prova apenas a consulta de PIDs VPS->Casa.

**Regra:** codigo validado na Forja -> PR/CI -> VPS 24/7. Mesmo repositorio/produto, runtimes separados; nunca assumir que processo da VPS ou do Linux esta ativo so porque o codigo existe. VMware rawDisk so pode usar o Kingston quando nao houver outro sistema gravando no mesmo disco.

## O que ele faz

1. Reutiliza o Bridge e os canais existentes; Desktop Commander Remote legado fica DESLIGADO por padrao.
   - Se o modo remoto legado for explicitamente habilitado, o dispositivo `SEGREDO` pode ser visto pela conta conectada.
   - Processo presente nao prova dispositivo autorizado; exigir `Device ready` e acesso real.

2. Mantém contexto local do Screenpipe.
   - Serve para deixar um resumo recente da tela em `GARIMPO-CHEFE/context/screenpipe-latest.json`.
   - Isso fica na Casa; não joga token no repo.

3. Usa GitHub pelo `gh` local/keyring.
   - Fluxo correto: `gh auth login` no próprio host, depois `gh auth status`.
   - Não copiar refresh token para `.env`, log ou arquivo.

4. Abre túneis Tailscale pelo próprio bridge.
   - MCP local: `tailnet:9100 -> 127.0.0.1:9100`.
   - Hermes dashboard: `https tailnet -> 127.0.0.1:8787`.
   - VSCode temporário: só quando `CENTRALDARK_VSCODE_TAILSCALE_PORT` e `CENTRALDARK_VSCODE_LOCAL_TARGET` estiverem definidos.

## Como rodar na Casa

**Para diagnosticar a rede, use somente `-LocalStatus`** (nao inicia processos). Para iniciar o Bridge existente com seus recursos e tunelamentos previamente configurados, use o owner sem essa flag:

```powershell
powershell.exe -NoProfile -File K:\scripts\remote-bridge\CentralDark-Remote-Bridge.ps1
```

Nao iniciar outro `npx ... remote` manual ou `@latest` em paralelo ao supervisor existente. Desktop Commander legado requer decisao explicita e mantem o pacote fixado na configuracao.

Para compilar o exe canônico no Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\remote-bridge\Build-Remote-Bridge.ps1 -OpenAfterBuild
```

## Como ler o estado

- 🟢 `Device ready` = ponte remota conectada.
- 🔴 `Failed to reload config: Unexpected end of JSON input` = JSON local do Desktop Commander quebrado/vazio. A ponte pode estar online e ainda assim o config local estar doente.
- 🟢 `gh auth status` PASS = GitHub deve usar keyring local.
- 🟢 porta Tailscale aberta = túnel vivo; autenticação do app ainda é separada.

## Contraprova rápida

```powershell
gh auth status
gh repo view ServerVpss/CentralDark
gh pr list --repo ServerVpss/CentralDark --state open --limit 30
```

Sem `gh auth status` verde, não declare GitHub integrado.

## Recibo local-first — 26/10/2026 (Casa SEGREDO)

**OWNER:** `scripts/remote-bridge/CentralDark-Remote-Bridge.ps1` + unico JSON de `canonical/`. **Sem nova pasta, app, daemon, chave, usuario, firewall ou servico.** Este delta alterou apenas o codigo do Bridge, sua configuracao real e dois documentos existentes.

```text
LOCAL_STATUS_CLI_EXIT=0
PS_PARSER_ERRORS=0
CONFIG_JSON_PARSE=PASS
LAN_NOTEBOOK_IP=192.168.100.2 (observado Wi-Fi notebook, 26/10/2026)
CASA_LAN=192.168.100.5/24 (Ethernet)
NOTEBOOK_TO_CASA_LAN_PING=PASS (2-3 ms, comprovado no notebook)
CASA_TO_NOTEBOOK_LAN_ICMP=NO_REPLY
CASA_TO_NOTEBOOK_LAN_TCP_5985_445_22_3389=TIMEOUT
LOCAL_ROUTE_LAN_CANDIDATE=TIMEOUT
LOCAL_ROUTE_FALLBACK=RADMIN_PRIVATE_OVERLAY
LAN_SELF_AND_PUBLIC_NEGATIVE_TESTS=PASS
RADMIN_NOTEBOOK_26.251.127.144:5985=OPEN_UNAUTHENTICATED
TAILSCALE_NOTEBOOK_100.102.99.102=NOT_VERIFIED_IN_CASA_TAILNET
SELECTED_CONNECTIVITY=RADMIN_PRIVATE_OVERLAY
REMOTE_LOGIN=NOT_PROVEN
REMOTE_EXECUTION=NOT_TESTED
CASA_COMMANDER_127.0.0.1:9101_HEALTH=HTTP_200
CASA_COMMANDER_ENGINE_CONNECTED=false
MCP_9100_BIND=TAILSCALE_ONLY (sem bind loopback na medicao)
HERMES_DASHBOARD_9119=NOT_LISTENING
GIT_DIFF_CHECK=PASS
SSH_VPS_CASA_PROVEN_RECIPE=UNCHANGED
```

A arquitetura e LOCAL-FIRST mas **nao esta autorizada para executar comandos no notebook** apenas por 5985 aberta. `engine_connected=false` ainda requer remediacao no owner atual do Casa Commander, sem segundo gateway. O Bridge foi testado somente em `-LocalStatus`; a partida normal com configuracao de tuneis nao foi repetida neste delta. O Linux fisico do K: ainda nao foi instalado por este trabalho, e a VPS nao foi modificada. NEXT_CURSOR: medir IP LAN do notebook e autenticar via canal explicitamente autorizado; provar handshake do motor local 9101; so entao A2A/executor com recibo tipado e promocao de codigo para VPS 24/7.

## Recibo da Forja openKylin em disco físico — 31/10/2026 (Casa/VMware)

<!-- #OBSERVACOES#
@owner: scripts/remote-bridge/README-HUMANO-BRIDGE-TAILSCALE-OAUTH.md
@doc_ref: docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md; AGENTS.md; RULES.md
@last_updated: 2026-11-01T01:22:32.669Z
@escopo: registro de instalação e acesso da Forja local, não VPS nem WSL
@estado: instalado e acessível via VMware rawDisk + SSH; boot bare-metal independente ainda não testado
@next_cursor: operar preferencialmente por SSH, com VMware como console existente; conferir boot direto fora do VMware somente quando pertinente
-->

**Decisão explícita do CHEFE:** a **Forja oficial local** passa a ser o openKylin instalado no disco físico antes identificado por `K:` no Windows. Para operar essa Forja, **reutilizar SSH ou o VMware Workstation já existente**, sem depender do Desktop Commander, sem criar VM/forja/executor paralelo e sem regressar ao WSL como instalação-alvo. O Bridge, Hermes, GitHub e VPS mantêm seus papéis existentes. Esta decisão não significa que a VPS foi alterada nem que o SSH está disponível em todo futuro boot.

### Evidência observada nas capturas do CHEFE (31/10/2026, Bahia)

| Critério | Evidência e alcance |
| --- | --- |
| Disco instalado | VMware `Hard Disk (SCSI)` configurado para `\\\\.\\PhysicalDrive1`, disco físico completo de ~447,1 GB (antigo K:); não é VMDK virtual de dados. |
| Particionamento | Instalação completa confirmada sobre `/dev/sda`: boot `vfat` (`sda1`), estendida (`sda2`), raiz `ext4` (`sda5`), backup `ext4` (`sda6`), data `ext4` (`sda7`), swap (`sda8`). Partições distintas continuam num **único disco físico**. |
| Boot pela Forja no VMware | O CD/DVD virtual ficou configurado para drive físico em vez da ISO; a VM exibiu splash, configuração e desktop openKylin com o rawDisk. `BOOT_DISCO_FISICO_VIA_VMWARE=OBSERVADO`. |
| Linux operacional | Desktop openKylin e terminal `CentralDark-OS@CentralDark-OS` visíveis. |
| Rede na VM | `ens33` em estado `UP`, IPv4 `192.168.35.128/24` na NAT do VMware. `hostname -i` respondeu `127.0.1.1`, que não substitui o IP em `ip addr`. IP DHCP não é endereço estático garantido. |
| Serviço SSH | `ssh.service` em `active (running)`, `sshd` escutando na porta 22; `sudo systemctl enable ssh` mostrou criação dos symlinks do systemd. |
| SSH Windows → openKylin | Terminal Windows exibiu sessão remota autenticada e prompt `CentralDark-OS@CentralDark-OS:~$`. O alerta anterior de `known_hosts` por troca de chave foi resolvido na sessão observada; não presumir validade global da chave em outros clientes. |
| Boot diretamente pela BIOS/UEFI, sem VMware | `NOT_TESTED` nas capturas. Não confundir rawDisk funcionando dentro do VMware com prova de boot bare-metal. |
| Identidade da VPS / integração de código / deploy | `NOT_TESTED` neste delta; não promover `DOCUMENTED` a `DEPLOYED`. |

**Rota operacional definida:** `CHEFE/CASA → SSH (porta 22, usuário CentralDark-OS, IP descoberto em ip addr) → openKylin/Forja`; para console, manutenção de inicialização ou sessão gráfica, reutilizar `VMware Workstation → mesmo PhysicalDrive1`. Não redescobrir WSL ou abrir um segundo instalador. **Acesso exclusivo ao disco físico:** não iniciar o boot nativo e a VM rawDisk ao mesmo tempo nem montar/escrever esse disco no Windows enquanto estiver em uso pelo Linux.

**Contraprova mínima:** a ausência da ISO foi observada na configuração do CD/DVD, e a autenticação SSH foi observada em terminal diferente do desktop da VM. Essas duas observações confirmam o caminho de boot na VM e o acesso remoto; não confirmam boot independente sem hypervisor. Evidência primária: capturas enviadas pelo CHEFE nesta conversa; não são arquivos de log do host nem teste automatizado deste commit.

**Aprendizado Kaizen:** a instalação nativa via `VMware rawDisk → instalador openKylin → disco físico → boot sem ISO → SSH` resolveu o objetivo local com menos passos que as tentativas anteriores. Preservar esta receita e **não repetir detecção de HWND, reconfiguração de SSH, instalador ou investigação sem mudança material**. `PROMPT_SELF_CACHE_P15=APLICÁVEL` ao reuso desta receita (HIT não medido); `KV_CACHE_P16=UNKNOWN` (sem telemetria de atenção).

**NEXT_CURSOR:** `FORJA_OPENKYLIN_RAWDISK_BOOT_OBSERVADO → SSH_INTERATIVO_PROVADO → OPERAR_SSH_OU_VMWARE → BOOT_BARE_METAL_SOMENTE_SE_SOLICITADO → INTEGRAR_CENTRALDARK_NO_OWNER_EXISTENTE`. Este commit registra estado e rota; não executa mudanças no host.
