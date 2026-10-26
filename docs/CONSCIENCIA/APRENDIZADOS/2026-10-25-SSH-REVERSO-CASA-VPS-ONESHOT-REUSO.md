# Aprendizado — circuito SSH reverso Casa ↔ VPS por identidade existente (25/10/2026)

**CLASSIFICACAO:** BOUNDED (cristalização documental e gatilho aditivo, sem infraestrutura nova).
**INTENT:** tornar recuperável e acionável a prova do acesso VPS → Casa → PIDs sem depender do Desktop Commander na rota SSH.
**BREATH_ID/NAME:** 1 / Concentração Total (estado medido) → 10 / Inseto (menor correção: selecionar identidade) → 3 / Lua (contraprova) → 16 / Regeneração Monotônica (guardar sem regredir).
**Condição observada:** Casa SEGREDO e VPS CENTRALDARK-OS já tinham OpenSSH e Tailscale; a chave pública da VPS estava autorizada na Casa, mas a escolha automática de identidade falhava.

## Descoberta causal e sequência reproduzível

1. **CASA → VPS:** o alias protegido `segredo-vpss` já autenticava. Tailscale Casa `100.123.93.25`, VPS `100.90.199.124`; ambos online. O SSH da Casa estava em execução, porta 22 ouvindo e regra privada existente.
2. **Falha inicial de identidade de host:** `Host key verification failed` na VPS. A chave ED25519 pública da Casa foi medida localmente: `SHA256:LilWrZIAF+ugJ+mSbMaX9FuMSLIbgBkMIUXBuLnfUEA`. A entrada no `known_hosts` foi adicionada após confronto de fingerprint, mantendo `StrictHostKeyChecking=yes`. **Não desativar a verificação de host.**
3. **Falha seguinte de autenticação:** `Permission denied (publickey,password,keyboard-interactive)`, mesmo com a chave pública ED25519 `segredo-vps-windows` autorizada no `C:\ProgramData\ssh\administrators_authorized_keys`. A configuração efetiva `Match Group administrators` usa essa localização. As ACLs do arquivo eram restritas a SYSTEM/Administradores, fonte limitada ao IP Tailscale da VPS.
4. **Causa raiz, não senha errada:** a VPS não escolhia automaticamente a chave privada já existente `/root/.ssh/segredo_vps_ed25519`. O fingerprint da pública correspondente era `SHA256:UYVhuwigeIYOgnezudoEURf6BCXYz9CNajgmOO9MKEk`. Ao chamar SSH com `-i .../segredo_vps_ed25519 -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes`, o comando `whoami` na Casa respondeu `segredo\administrador` com saída 0.
5. **Efeito real:** a VPS executou `Get-Process` no Windows via essa conexão SSH; o retorno continha `Id` e `ProcessName` de processos reais. O one-shot consolidado foi executado novamente em `K:` e retornou `VPS_TO_CASA_PID=PASS COUNT=545` e `EXIT=0`. Os PIDs variam no tempo; não transformá-los em fixture permanente.

**One-shot canônico existente:** [CentralDark-VPS-Casa-PID-OneShot.ps1](../../../scripts/casa/CentralDark-VPS-Casa-PID-OneShot.ps1).
**Receipt de execução:** [CENTRALDARK-SSH-VPS-CASA-PIDS-ONESHOT-20261025.md](../../RECEIPTS/CENTRALDARK-SSH-VPS-CASA-PIDS-ONESHOT-20261025.md).
**Livro histórico de cadeado:** [SSH-CASA-VPS-LOCK-20261014.md](../../receipts/SSH-CASA-VPS-LOCK-20261014.md).
**Commit canônico:** [7cc7c93c95b40b8c0dcbefbe24a9aa22fa22dee5](https://github.com/ServerVpss/CentralDark/commit/7cc7c93c95b40b8c0dcbefbe24a9aa22fa22dee5).

## Contrato de diagnóstico e consulta sob demanda

| Gatilho | Hipótese que deve ser testada | Próxima prova mínima |
|---|---|---|
| `Host key verification failed` | Não há pin verificado ou a host key mudou | Identificar host na Casa, comparar fingerprint fora do canal SSH e só então corrigir `known_hosts`. |
| `Permission denied` com host verificado | Identidade errada/não oferecida; depois arquivo de autorização e ACL | Conferir `ssh -i`, `IdentitiesOnly=yes`, fingerprint da pública, e só depois ACL/sshd logs. |
| Pedido de listar PID da Casa | SSH reverso deve autenticar e retornar material | Executar one-shot e exigir `VPS_TO_CASA_PID=PASS`, `EXIT=0` e linhas com Id/ProcessName. |
| Shell mistura `Get-Process | A origem Linux interpretou parte do pipeline PowerShell | Preferir comando remoto simples validado, sem pipes atravessando duas shells; não confundir erro de quoting com falha SSH. |
| Aviso `post-quantum key exchange` | Compatibilidade de KEX do OpenSSH remoto | Registrar limitação, avaliar atualização por owner e aprovação; aviso não equivale a falha do teste realizado. |
| Porta disponível mas falha de senha | Transporte não garante autorização | Separar `TAILNET_PASS`, `TCP_PASS`, `HOST_PIN_PASS`, `AUTH_PASS` e `PID_READBACK_PASS`. |

**POR_QUE_FAZER:** evitar retrabalho e testes errados em cada troca de agente/sessão; passar de conhecimento tácito a receita auditável.
**POR_QUE_NAO_CRIAR_OUTRA_COISA:** o SSH, a rede Tailscale, a identidade, o writer, o one-shot e o livro de receipts já existem.
**POR_QUE_USAR:** prova obtida por cadeia de comandos reais, sem modelo, novo daemon, nova chave nem senha nova.
**POR_QUE_MODIFICAR:** a skill-mãe deve selecionar esta receita quando surgir pedido de processos remotos, sem repetir a investigação desde zero.
**O_QUE_MUDOU:** dois registros de conhecimento vinculados à skill-mãe; nenhum ajuste de serviço, cron, firewall, SSH ou credencial durante esta cristalização.

## Prova e limites

- `CASA_TO_VPS_SSH=PASS`; `VPS_TO_CASA_SSH_AUTH=PASS`; `VPS_TO_CASA_PID_READBACK=PASS` no cenário observado.
- `ONE_SHOT_EXIT=0`; `PID_COUNT=545` na última contraprova; valor **snapshot**, não limiar universal.
- `MAIN_SCRIPT_BLOB == CASA_SCRIPT_BLOB` e `MAIN_RECEIPT_BLOB == CASA_RECEIPT_BLOB` foram confirmados após a publicação.
- `PROCESS_MUTATION=NOT_TESTED`, `GUI_CONTROL=NOT_TESTED`, `OBSIDIAN_BIDIRECTIONAL_SYNC=NOT_TESTED`, `VPS_RUNTIME_DEPLOY=NOT_TESTED`. Não transformar leitura em permissão de escrita.
- O estado vivo pode mudar; se `Tailscale IP`, `fingerprint`, `alias` ou `authorized_keys` mudarem, **falhar fechado** e medir antes de editar. Proibir `StrictHostKeyChecking=no` e `ssh -A` automático.
- Conservar locks, checksums, aceite humano, `ONE_WRITER_PER_SCOPE` e `UNKNOWN != PASS`. A leitura reversa não instala uma ponte geral de execução nem legitima acesso irrestrito.

**NEXT_BREATH:** ao receber intenção específica futura, reexecutar o one-shot, ler recibo, escolher a menor ação e provar o resultado no destino.
