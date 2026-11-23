# 👑🪬 CENTRALDARK — REPLAY FIEL DAS DUAS FRENTES

**MISSÃO:** `CENTRALDARK_DUAS_FRENTES_20261012` · **INTENÇÃO:** uma intenção, dois owners existentes, execução verificável e sem arquiteturas paralelas.

**Autoridade:** `ServerVpss/CentralDark@main` para código; **VPS** para runtime; **Casa/SEGREDO** para a ponte já autorizada. Documento não é execução, commit não é deploy, rota documentada não é rota ativa, UNKNOWN não é PASS.

## Começar sem micro-passos

> 🧿 **Prova ao vivo — 13/10/2026:** este README foi editado diretamente na Casa pelo ChatGPT através do Remote Desktop Commander, no mesmo arquivo aberto pelo VS Code. **Somente esta documentação local mudou; nenhum script foi executado, e nem VPS nem GitHub receberam alterações nesta prova.**
>
> 📦 **Atenção à receita histórica:** os comandos abaixo citam o ZIP original de 12/10. O pacote organizado atualmente é `CENTRALDARK-EXECUCAO-INTEGRAL-20261012-CONSOLIDADO.zip`, com a receita V4 e os originais preservados. Verifique a estrutura e o caminho antes de executar; não substitua nomes cegamente.

Na VPS (checkout existente, de preferência `/root/CentralDark`):

```bash
unzip CENTRALDARK-EXECUCAO-INTEGRAL-20261012.zip -d /tmp/centraldark-replay
cd /tmp/centraldark-replay/CENTRALDARK_EXECUCAO_INTEGRAL_20261012
bash ./executar-tudo.sh --audit
```

Na Casa Windows PowerShell 7, com o alias OpenSSH **já existente** `Segredo-VPS`:

```powershell
pwsh -NoProfile -File .\executar-casa.ps1 -ZipPath .\CENTRALDARK-EXECUCAO-INTEGRAL-20261012.zip -Mode audit
```

Para executar a mesma varredura que foi medida e atualizar **somente o JSON canônico já existente** (pode levar 30–60 segundos):

```bash
bash ./executar-tudo.sh --scan
```

Para reaplicar **somente** o reconciliador da `main` caso a cópia atual seja exatamente a versão original conhecida (backup antes, readback SHA, rollback em erro):

```bash
bash ./executar-tudo.sh --apply-reconciler
```

Se a versão atual já coincide com a `main` fixada, retorna NOOP. Se divergir inesperadamente, **BLOCKED**. Não aplica código mais novo por engano. `--hakai-check` só inspeciona dependências; **não deleta** o pulso legado.

## O que está no pacote

- `executar-tudo.sh`: orquestrador de uma intenção; preflight, duas frentes, auditoria, scan opcional, aplicação idempotente, rollback local, HAKAI apenas inspecionado.
- `executar-casa.ps1`: reutiliza SSH `Segredo-VPS` com verificação de host key, sem imprimir segredo, e executa o pacote na VPS por caminho temporário.
- `tools/verificar-integridade.py`: mede provas e fronteiras, SHA dos arquivos, main, sintaxe, JSON, parcialidade, backups e chamados.
- `tools/exportar-codigo-fixado.sh`: materializa **o código integral** dos owners originais diretamente dos objetos Git identificados por commit; nenhum código é reconstruído por adivinhação.
- `tools/testar-pacote.py`: testes offline de integridade/contrato do pacote.
- `EVIDENCIAS/RECEIPTS-20261012.json`: fatos medidos, limites e caminhos existentes, sem segredos.
- `EVIDENCIAS/ROTAS-20261012.json`: catálogo de rotas documentadas e provas por esta sessão.
- `EVIDENCIAS/EXECUCAO-PASSO-A-PASSO.md`: fluxo fiel do painel fornecido, resultado real versus intenção e as correções realizadas.
- `EVIDENCIAS/10-MELHORIAS-MCP.md`: aprendizagem consolidada e fronteira externa de segurança.
- `EVIDENCIAS/PLANO-HAKAI-E-REBUILDER.md`: lacunas e gates necessários antes de aposentar o pulso ou promover o MCP.

## Fonte integral dos códigos

Os arquivos do MCP, guard, testes, pulso e reconciliador **já existem no Git da `main`**. Para evitar carregar cópias divergentes/obsoletas no sistema, o comando `tools/exportar-codigo-fixado.sh DESTINO` recupera **cada byte** de commits fixados, compara os blobs e exporta à pasta solicitada. O ZIP é uma *receita reexecutável e conferível*, não um novo runtime nem outro motor.

Se os commits fixados não estiverem materializados no checkout, a exportação falha explicitamente. Recuperar com `git fetch origin main` é operação separada e consciente; nunca `git reset --hard`, `git clean`, `git push --force` ou `git pull` às cegas.

## 2 frentes, uma intenção

**F1 (MCP + Rebuilder):** diagnóstico `MCP_BLOCK_RECONCILIATION`, resposta `diagnostico`, lei `clientSafetyGateIsOutsideMcp`; alteração na main **PROVADA COMO CÓDIGO**, runtime novo ainda **UNKNOWN**, pois o microdeploy original recusou o fileset. O Rebuilder deve reutilizar owner comprovado; **não foi encontrado um owner 'rebuilder' no levantamento limitado a `apps/modulos/mcp` e `scripts`**, então não presumir instalado.

**F2 (reconciliador):** `.sh` canônico copiado com readback SHA correto; `--pulse --plan` read-only comprovado; `--scan` teve `exitCode=0`, JSON único ativo; **varredura parcial**; `--pulse` real **não comprovado**; script legado permanece.

## Proteções fixas

- `--audit` **não altera** arquivo de produção; lê repo/JSON e testa sintaxe (sem fetch automático).
- `--scan` roda ferramenta existente e modifica apenas seu recibo canônico, não deleta duplicatas.
- `--apply-reconciler` só atualiza se a versão atual tem SHA original exato; cria backup com timestamp e reverte no erro; não altera MCP.
- `--hakai-check` é somente leitura. HAKAI automático **proibido** até prova da execução real do pulso e de ausência de consumidores. Candidatos heurísticos nunca são deleções automáticas.
- Nenhuma variável secreta, token, chave, IP ou credencial é incluída.
- Toda falha com status `BLOCKED` mantém histórico de prova e sugere o próximo cursor; não é promovida a verde.

---

## 🦜 Evolução v2 — Máquina de estados de replay seguro (mesmo orquestrador)

**Por que evoluiu:** no teste REAL que o CHEFE executou na Casa (PowerShell → Segredo-VPS), `audit` mostrou 21 verificações, Git/SSH/código/JSON/`bash -n`/`--pulse --plan` passando, porém `tracked_dirty=29`, scanner `partial=true` (`4224` arquivos/`bounded_scan:6`), MCP novo e pulso real `UNKNOWN`, HAKAI corretamente `BLOCKED`. Esses **não são 21 resultados verdes**; `GLOBAL_PASS=false`. O objetivo agora é não perder informação enquanto o replay progride.

**Correção causal nova:** o script de inventário original reconstruía o JSON e descartava campos adicionais. Um replay que gravasse checkpoints **ANTES** do `--scan` perderia seu próprio histórico. O MESMO owner `scripts/centraldark-inventory-reconcile.sh` recebeu patch mínimo na `main` (`eaab55ffdf6cd928947a2967b8fd449c89bf7910`) para preservar `replay` no JSON ativo. Não foi criado outro motor nem segundo JSON. Enquanto o runtime não tiver esse patch, `--replay` recusa a varredura em vez de apagar checkpoints.

**Estados do replay, com eventos e `next_cursor` no JSON canônico:**

```text
INTENT → RECOVER → OBSERVE → RECONCILE → VERIFY → EXECUTE → VERIFY
                                                     ├─ PASS / PARTIAL
                                                     └─ FAIL → DIAGNOSE → [REPAIR_KNOWN] → RETEST
→ DIAGNOSE → LEARN (documentado, sem fingir treinamento do modelo)
→ HALT (BLOCKED enquanto MCP/pulso não forem comprovados)
```

**Comandos pela Casa** (PowerShell 7, na pasta descompactada):

```powershell
# Auditoria: igual à que tu testou, NÃO altera o runtime.
& .\executar-casa.ps1 -ZipPath .\CENTRALDARK-EXECUCAO-INTEGRAL-20261012-V2.zip -Mode audit

# Replay: recupera receita, mede, verifica, executa SOMENTE scan/recibo.
# Se o owner precisar do patch, vai bloquear SEM apagar memória.
& .\executar-casa.ps1 -ZipPath .\CENTRALDARK-EXECUCAO-INTEGRAL-20261012-V2.zip -Mode replay

# Correção controlada: atualiza somente o script canônico se o SHA instalado
# for uma das versões históricas exatas, faz backup e rollback em falha.
& .\executar-casa.ps1 -ZipPath .\CENTRALDARK-EXECUCAO-INTEGRAL-20261012-V2.zip -Mode replay -RepairKnown

# Retoma checkpoints; revalida SHA/sintaxe/plan sem repetir varredura limitada.
& .\executar-casa.ps1 -ZipPath .\CENTRALDARK-EXECUCAO-INTEGRAL-20261012-V2.zip -Mode resume

# Confere localmente o PAPAGAIO; não manda TXT pessoal para a VPS.
& .\executar-casa.ps1 -Mode papagaio-check
```

**OU DIRETO NA VPS**, depois de descompactar o pacote: `bash ./executar-tudo.sh --replay [--repair-known]`, `--resume`, `--audit` ou `--papagaio-check ORIGINAL DERIVADO`. A execução pendente retorna código **3** com `HALT/BLOCKED` propositalmente; significa **contraprova incompleta**, não que as verificações verdes regrediram. O audit continua leitura apenas.

**A prova do PAPAGAIO IRMÃO que o CHEFE mostrou:** 

```text
ORIGINAL (👑🧠 COMPOUNDING ENGINEERING.txt) = 49.226 bytes
SHA256 = 43a9c12a2e4e288b596d555672f91980e8aa8d4c736a9488a70e2455c70fb219
PAPAGAIO IRMAO.txt = 36.755 bytes (mais curto, logo não preserva o original)
```

A verificação nova exige que `DERIVADO[:len(ORIGINAL)] == ORIGINAL` **byte a byte**. Se reduziu, reescreveu ou mudou um byte, `PAPAGAIO_INTEGRAL=FAIL`. Se preservou prefixo, aceita o delta acrescentado e confere os hashes. Preserva o arquivo sem editá-lo.

**Regras preservadas:** nada de reset/clean/force push do checkout, nada de forçar autorização MCP, nada de mover/apagar script legado, nada de declarar pulso real ou MCP runtime pass. `--repair-known` não significa reparação universal: apenas substituição de versão exata previamente reconhecida com backup, conferência do blob/pin e rollback; se houver alterações desconhecidas, `BLOCKED`. 

**Critério de vitória:** um checkpoint persistido/recuperado no JSON após 2 varreduras sucessivas, prova de que nada foi perdido e runtime MCP/pulso real validados **em testes separados**. Não confundir `CODE_PUBLISHED` com `RUNTIME_PROVEN`.


---

## 🦜 Correção V3 — exibição original preservada + falso BLOCKED eliminado

**Teste REAL do CHEFE:** `-Mode replay` concluiu `INTENT`, `RECOVER`, `OBSERVE`, `RECONCILE` e `VERIFY`, mas declarou `REPLAY_EVENT=EXECUTE STATUS=BLOCKED EVENTS=6` ANTES do `--scan`. O marcador de preservação já existia no reconciliador instalado. O erro foi **a expressão regular do executor V2**, que exigia `^v['replay']` no início da linha; o Python válido possui **um espaço de indentação**: ` v['replay']=old['replay']`.

**Correção mínima:** mesmo `executar-tudo.sh`, mesma pasta, mesmas 12 entradas. `scanner_preserves_replay` verifica tanto a guarda `if isinstance(old.get('replay'), dict):` como a atribuição Python com indentação. Esta proteção continua BLOQUEANDO scanners que não preservem o replay.

**Mesmos status e bolinhas:** `🟢 [PASS]`, `🟡 [PARTIAL]`, `🟡 [UNKNOWN]`, `🔴 [BLOCKED]`, `🟡 [NOT_ACTIVE]`. Não renomear `PASS`, `PARTIAL`, `UNKNOWN`, `BLOCKED`, `NOT_ACTIVE`, `DIRTY` ou os códigos originais do auditor; o painel usa a mesma nomenclatura em todas as etapas. Outros estados que já existiam (`NOOP`, `DOCUMENTED`) também são mantidos.

**Outra falha antecipada:** `--resume` do V2 dispensava a varredura mesmo sem evidência de um `--scan` concluído. Na V3, só reaproveita o scan anterior quando o JSON contém evento `EXECUTE PASS` com fingerprint idêntico, SHA do script e `origin/main` equivalentes. Sem prova: executa a varredura atual, se o owner for seguro, em vez de fingir um PASS anterior. Se uma falha de EXECUTE aconteceu depois do PASS, não reutiliza aquele checkpoint.

**Prova V3:** regressões offline para versão indentada, scanner defeituoso, `--resume` sem prova, com prova, com fingerprint diferente, bloqueio posterior e indicadores visuais. Testes locais passam; **runtime VPS precisa de replay real para promover estado**. `SCAN_PARTIAL` e `MCP_RUNTIME/PULSE_LIVE=UNKNOWN` permanecem até medições apropriadas, sem HAKAI.

Executar o ZIP corrigido na **mesma rota autorizada** (PowerShell 7, Casa):

```powershell
$zip = "$env:USERPROFILE\Downloads\CENTRALDARK-EXECUCAO-INTEGRAL-20261012-V3.zip"
$destino = "$env:TEMP\centraldark-replay-v3"
Expand-Archive -LiteralPath $zip -DestinationPath $destino -Force
& "$destino\CENTRALDARK_EXECUCAO_INTEGRAL_20261012\executar-casa.ps1" -ZipPath $zip -Mode replay
```

Se retornar `[PARTIAL]`, o scanner é limitado; se `[UNKNOWN]`, falta medição; se `[BLOCKED]`, uma proteção permanece. O nome do estado **não deve ser alterado** só para deixar a tela verde. O comando `-Mode resume` só reutiliza scan com prova vinculada.


## 🧾 Evolução V4 — um único log, saída idêntica no terminal

**Definição do CHEFE:** todas as execuções iniciadas pelo `executar-tudo.sh` na VPS
(`--audit`, `--replay`, `--resume`, `--scan` etc.) escrevem a saída integral,
com as **bolinhas e os rótulos originais intactos**, em **um único arquivo**:

```text
/var/log/centraldark/centraldark-inventory-reconcile.log
```

O log é **sobrescrito** ao iniciar uma nova execução bem formada (`tee`, sem
`-a`). Não cria log com data ou por tentativa. A pasta é privativa (`0700`)
e o arquivo é criado com `umask 077` (`0600`). O log contém saída de console,
não materializa segredos, nem substitui o registro de auditoria. O arquivo
`/run/lock/centraldark-inventory-reconcile-log.lock` é somente um *lock
volátil* para impedir duas execuções concorrentes de escreverem no mesmo log.

O recibo **fica separado e durável**, sem truncar eventos históricos:

```text
/var/lib/centraldark/inventory-reconcile/centraldark-inventory-reconcile.json
```

**Cuidado REAL do diagnóstico de 2026-10-13:** na medição da VPS, a raiz
`/dev/sda3` estava **100% ocupada, 0 disponível**. Nesse caso a V4
interrompe com `🔴 [BLOCKED] LOG_DISK_FULL` **ANTES** de truncar log,
abrir novo log ou atualizar o recibo. A proteção só deixa iniciar quando
houver pelo menos 16 MiB livres. Não executa limpeza automática de disco;
nenhum arquivo de outro setor será apagado. Não promove MCP/PULSE_LIVE/HAKAI.

A execução seguinte pode ler o arquivo, quando houver espaço:

```bash
sudo tail -n 100 /var/log/centraldark/centraldark-inventory-reconcile.log
```

**Uma pasta para os logs CentralDark não é o mesmo que colocar todos os logs
do Linux em um arquivo.** `/var/log` é a localização padrão dos logs do
sistema, e `/var/log/centraldark` é o setor recomendado para logs do projeto.
Arquivos de `events`/`replay` e checkpoints continuam no único JSON em
`/var/lib/centraldark`, sem perder histórico com uma nova execução.

**Sobre `SECTOR=gmail STATUS=SEM_ACESSO`:** é um valor explícito do scanner
existente, pois Gmail depende de conector externo autorizado; **não implica**
que `MCP_RUNTIME=UNKNOWN` ou `PULSE_LIVE=UNKNOWN` sejam falhas do Gmail.
Este pacote não busca credenciais nem tenta conectar Gmail automaticamente.

**Preflight de mudança de ambiente:** em testes locais, o diretório pode ser
sobrescrito somente com `CENTRALDARK_LOG_DIR=/tmp/test-log-dir` para um
cenário controlado; a configuração padrão na VPS permanece `/var/log/centraldark`.
O modo `--help` apenas imprime ajuda e não altera o log. O PowerShell Casa
continua usando a rota SSH existente; nem `scp` nem `ssh` criam log persistente
adicional nesta receita.
