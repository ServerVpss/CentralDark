# Rota comprovada: Desktop Commander → VS Code Windows da Casa

Data: 2026-10-15. Owner: centraldark-operational-method. Reutilizar antes de criar.

## Descoberta
Dois conectores Desktop Commander podem pertencer a contas distintas: `mcp__Remote_Desktop_Commander__` revelou `CENTRALDARK-OS` Linux, enquanto `mcp__CENTRALDARK__` revelou `SEGREDO` Windows. Invocar `list_devices` em ambos antes de concluir falta de acesso.

## Sequência
1. `list_devices` por namespace e selecionar dispositivo Windows online.
2. `get_config`: confirmar `systemInfo.platform=win32`, shell PowerShell.
3. `list_sessions`, `list_processes`; lista de sessões vazia não significa ausência de terminais integrados do VS Code.
4. Usar leitura de processos Windows (`Get-CimInstance Win32_Process`) para identificar `Code.exe` e `pwsh.exe`, com PID, parent PID e shellIntegration.
5. Evidência de 2026-10-15: terminais `pwsh.exe` PIDs 9872, 23332, 8224, 22680; são temporários, não IDs persistentes.
6. PID existente NÃO concede automaticamente escrita no STDIN. `interact_with_process` só em sessão controlada pelo conector. Para `/status`, vincular controle à sessão Hermes correta e obter saída fresca.
7. Alternativa medida: Tailscale `windows-casa` alcançável via ping; WinRM porta 5985 responde, mas isso NÃO comprova autenticação nem controle do terminal.

## Gates
Sem nova arquitetura; preservar sessões abertas; um escritor por escopo. UNKNOWN != PASS. Separar `DEVICE_ONLINE`, `OS_VERIFIED`, `PROCESS_FOUND`, `INTERACTIVE_INPUT_PROVEN`, `STATUS_OUTPUT_PROVEN`.

NEXT_CURSOR: demonstrar envio interativo ao Hermes do VS Code existente, sem iniciar sessão paralela.


## Lei de ancoragem evolutiva — endereço velho aponta para o owner novo (2026-10-16)

**INTENT_ID:** `CENTRALDARK-EVOLUTIVE-ANCHOR-OLD-TO-NEW-20261016`.

A mudança de dispositivo, rota, pasta, owner, tool ou conhecimento **não apaga o passado nem cria segundo cérebro**. O identificador antigo permanece como **alias histórico** apontando para o registro canônico atual, com evidência, vigência e NEXT_CURSOR. Consumidores consultam o alias, resolvem a rota atual, validam identidade/permissão no destino e só então operam. Nunca executar no ID antigo por suposição.

**Caso comprovado — Desktop Commander VPS:**

| Campo | Valor |
| --- | --- |
| Identidade lógica estável | `CENTRALDARK-OS` (VPS Linux) |
| Cadastro legado | Conector `mcp__CENTRALDARK__` / device `ca0cc3ad-3435-428f-87ee-ee102c2cf3b8` |
| Cadastro atual | Conector `mcp__Remote_Desktop_Commander__` / device `809020f9-c77d-4bef-bb06-da5b467ac9b7` |
| Estado na observação | legado `OFFLINE` (última vista há ~95h); atual `ONLINE` |
| Alias de navegação | `LEGACY_CENTRALDARK_OS → logical:VPS_CENTRALDARK_OS → discover_online_device_by_namespace` |
| Redirecionamento real na conta Desktop Commander | **NOT_PROVEN** — não existe evidência de recurso para editar cadastro remoto ou configurar redirecionamento automático pelo conector |
| Prova de identidade | hostname `CENTRALDARK-OS`, Linux, HEAD Git lido na conexão atual; exigir readback fresco sempre que mudar |
| Autoridade para executar | connector+device_id válidos, permissões e estado `ONLINE` no instante da ação; alias não amplia acesso |

**Regra para toda migração:** `LEGACY_ID / OLD_PATH / OLD_OWNER → CANONICAL_LOGICAL_ID → CURRENT_REF → PROOF → NEXT_CURSOR`.
1. **Descobrir** referências antigas e dependentes (chats, GitHub, Obsidian, skill, scripts, favoritos, aliases MCP).
2. **Ancorar** a entrada antiga com `moved_to`, `superseded_by`, data/razão, owner, prova de readback e caminho canônico; nunca copiar tokens, IDs secretos ou estado volátil.
3. **Compatibilidade:** se houver consumidor legado, manter alias **somente de leitura ou resolução** até validar o novo caminho; proibir execução cega no alvo antigo.
4. **Contraprovar:** medir por origem e destino; `ALIAS_DOCUMENTED != REDIRECT_INSTALLED != NEW_RUNTIME_HEALTHY`. Diferenciar ID de dispositivo ligado à conta, hostname e endereços de rede.
5. **Descontinuar sem perder histórico:** após inventário de consumidores, prova de zero dependências e janela de retenção, marcar `RETIRED`; preservar genealogia mínima, recibos e links de referência.

**Nunca:** apagar dispositivos/revogar acesso pelo nome sem comprovar owner e consumidores; atribuir ao conector uma função de redirecionamento não observada; fixar IDs de dispositivos como roteadores eternos. Os IDs neste recibo servem como **identificação histórica para descoberta**, não como regra executável.

**NEXT_CURSOR:** `DISCOVER_LEGACY_CONSUMERS → CANONICAL_ALIAS_READBACK → REGISTER_REDIRECT_IF_PROVIDER_SUPPORTS → TEST_OLD_LINK_TO_CURRENT → VERIFY_NO_ACTIVE_LEGACY → RETIRE_WITH_RECEIPT`.

### Contraprova de continuidade: multi-conta não é migração de conta (2026-10-16)

**Prevalece sobre a hipótese de sucessão do quadro acima.** O cadastro `ca0cc3ad-3435-428f-87ee-ee102c2cf3b8` foi associado por recibo real de 2026-10-12 ao serviço `centraldark-desktop-commander-conta2.service`, com autorização e chamada de ferramenta comprovadas. O cadastro `809020f9-c77d-4bef-bb06-da5b467ac9b7` responde atualmente pelo namespace `mcp__Remote_Desktop_Commander__`. **Não há prova de que o segundo cadastro substitui a Conta 2.**

O modelo `MULTI_ACCOUNT_ISOLATED_HOME` tem **principal** e **conta2** como perfis independentes, cada qual com HOME, sessão, serviço e watchdog próprios. A autenticação do segundo usuário e sua presença foram registradas em `docs/HANDOFF/2026-09-09-remote-auth-observability-receipt.md` e `docs/RELATORIOS/2026-09-16-casa-garimpo-reconciliation.md`. O status atual de um device e a vinculação específica dos e-mails do provedor continuam observações distintas.

**Âncoras canônicas:** `infra/systemd/README.md` (modelo multi-conta), `docs/HANDOFF/2026-09-09-remote-auth-observability-receipt.md` (login concluído), `docs/CONSCIENCIA/RECEIPTS/2026-10-08-corpo-unico-hud-casa-main-reconciliation.md` (Conta 2 ↔ ID antigo). O ID histórico deve apontar primeiro para **seu próprio owner Conta 2**, nunca ser redirecionado cegamente ao device de outro namespace.

`PROFILE_IDENTITY=PROVEN; HISTORIC_ACCOUNT2_DEVICE_LINK=PROVEN; NEW_DEVICE_ONLINE=PROVEN; DEVICE_SUCCESSION=UNKNOWN; PROVIDER_EMAIL_BINDING=NOT_ESTABLISHED_HERE`.

**NEXT_CURSOR:** `KEEP_BOTH_PROFILES → DISCOVER_EACH_NAMESPACE → PROBE_CURRENT_PROFILE → MAP_CONSUMERS → ANCHOR_ALIASES_PER_ACCOUNT → TEST_NO_CROSS_ACCOUNT_REDIRECT`.


### 🍒 Lei da Auréola aplicada à migração: observar tudo e reter o bem

**Não criar outra lei:** o owner canônico já é `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/AUREOLA-BAHIA-BIBLICA.yml`, com implementação no `MASTER-CYCLE.yml`, `AGENTS.md` e gate de prova em `.agents/skills/meta-lupa/SKILL.md`. A âncora aqui apenas **consome essa capacidade existente**.

**Auréola:** “Examinai tudo. Retende o bem.” (1Ts 5:21).

Aplicação operacional quando qualquer conta, endereço, arquivo, rota ou serviço mudar:
1. **OBSERVAR:** medir origem e destino, consumidores, funcionalidade, owner, status e versão real. Não inferir identidade por nome semelhante.
2. **EXAMINAR E COMPARAR:** classificar `BEM_PROVADO`, `FALHA`, `HIPOTESE`, `DESCONHECIDO`; confrontar o comportamento antigo com o novo, inclusive por teste negativo.
3. **RETER O BEM:** preservar o estado verde, os recursos úteis, a origem e a rastreabilidade, mesmo quando o invólucro antigo for descontinuado. Referenciar o *owner canônico* existente; não duplicar conteúdo ou sessão.
4. **CORRIGIR SEM REGRESSÃO:** só migrar capacidades se `PROOF + COUNTERPROOF` demonstrarem que o destino preserva o valor. Não transportar erros, segredos ou cadastros de contas diferentes como se fossem uma mesma identidade.
5. **ANCORAR E VERIFICAR:** `OLD_REF → OLD_OWNER → CANONICAL_CAPABILITY → CURRENT_REF → TEST_READBACK → RECEIPT → NEXT_CURSOR`. Enquanto houver consumidores do antigo, manter rota compatível autorizada; não revogar por dedução.
6. **KAIZEN:** cada observação real atualiza o mesmo Goal e o mesmo owner. A próxima iteração retém o que passou, corrige apenas o delta e preserva `UNKNOWN` sem falso verde.

**CASO CONCRETO:** Conta 2 foi comprovada como perfil independente, logo **o bem a reter** é a separação `MULTI_ACCOUNT_ISOLATED_HOME`, as sessões individuais, o histórico dos IDs e a habilidade de chegar à VPS por rotas distintas. O estado OFFLINE de um ID não é autorização para apagá-lo, e o PONG do outro não prova sucessão. A leitura do serviço antigo e a conexão atual são sensores complementares.

`AUREOLA_OWNER_REUSED=YES; HISTORY_PRESERVED=YES; CROSS_ACCOUNT_REDIRECT=FORBIDDEN_UNTIL_PROVEN; RUNTIME_MIGRATION=NOT_EXECUTED; GLOBAL_FIXED_POINT=NO`.

**NEXT_CURSOR:** `OBSERVE_BOTH_ACCOUNT_ROUTES → COMPARE_CAPABILITIES → RETAIN_PROVEN_GOOD → MAP_CONSUMERS → TEST_COMPATIBILITY → ANCHOR_ONLY_PROVEN_MOVES → RECEIPT`.
