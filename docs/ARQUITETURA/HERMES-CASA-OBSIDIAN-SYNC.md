# Hermes Casa + Obsidian — memória viva sem expor a Casa

## Decisão

A memória visual da Casa usa um cofre separado em:

```text
E:\CentralDark\Pivete\CASA-VAULT
```

O repositório continua sendo a fonte da verdade do projeto. O Obsidian deixa de abrir a raiz inteira do repositório como cofre principal.

## Estrutura do cofre

```text
CASA-VAULT/
├── 00-CANONICO/          ↔ CentralDark/docs/BRAIN
├── 10-MEMORIA-PRIVADA/   somente Casa
├── 20-INBOX-HERMES/      aprendizados candidatos
├── 30-ANEXOS/            somente Casa por padrão
├── 90-CONFLITOS/         cópias preservadas quando os dois lados mudam
├── .hermes-sync/         manifesto local de hashes
└── .obsidian/            configuração local do Obsidian
```

## O que muda a trajetória do Hermes

Editar uma nota no Obsidian não concede permissão nem executa ação imediatamente.

```text
edição em 00-CANONICO
→ sincronização para docs/BRAIN
→ commit/PR/merge
→ Hermes recarrega a fonte da verdade
→ contexto e direção atualizados
```

As regras comportamentais continuam vindo dos arquivos canônicos já existentes:

- `LEIA-ME-IA.md`;
- `AGENTS.md`;
- `docs/CONSCIENCIA/APRENDIZADOS.md`;
- `docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md`;
- `.agents/skills/`.

`docs/BRAIN` fornece memória, mapa, decisões e contexto. Mudanças críticas de comportamento devem atualizar o artefato canônico existente, e não criar uma segunda regra dentro do BRAIN.

## Aprendizado vivo

O Hermes aprende primeiro na Casa:

```text
20-INBOX-HERMES
→ descoberta candidata
→ remoção de dados privados
→ prova e teste
→ atualização do arquivo canônico já existente
→ PR automático
→ merge após validação
→ pull e recarga na Casa
```

Conteúdo pessoal, conversa, endereço, rotina, token, sessão, credencial e anexos privados permanecem em `10-MEMORIA-PRIVADA` ou `30-ANEXOS` e nunca entram no Git.

## Sincronização

O script `scripts/casa/sync-hermes-obsidian.ps1` usa hashes e um estado local para distinguir:

- alteração somente no GitHub: copia para o Obsidian;
- alteração somente no Obsidian: copia para `docs/BRAIN`;
- alteração igual nos dois lados: registra como sincronizada;
- alteração diferente nos dois lados: preserva ambas em `90-CONFLITOS` e para;
- exclusão: nunca é propagada automaticamente.

Isso permite edição bidirecional sem sobrescrever silenciosamente nenhum lado.

## Obsidian atual

O conteúdo existente em `docs/BRAIN` não é descartado. Na primeira inicialização ele é copiado para `CASA-VAULT/00-CANONICO` e passa a aparecer no mesmo grafo das memórias locais, sem colocar as memórias locais dentro do repositório.


## Cartazes, anexos canônicos e projeções

`docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/` pertence à camada
canônica e, portanto, entra em `CASA-VAULT/00-CANONICO` pelo mesmo contrato de
sync. O manifesto preserva o hash do PNG entregue e o hash da cópia WebP leve
guardada no Git. Grafo, GraphRAG e memória vetorial podem indexar esses itens,
mas são projeções reconstruíveis: não escrevem de volta sobre os owners.

Imagem privada continua em `30-ANEXOS`; só entra no canônico mediante
classificação, proveniência, hash e autorização explícita. Arquivo presente no
Git não prova que site, `.exe` ou VPS foi atualizado.

## Resultado esperado

```text
CHEFE edita ao vivo no Obsidian
→ Hermes percebe a mudança
→ sincroniza o canônico
→ GitHub registra e valida
→ Hermes recarrega
→ o sistema segue a direção nova
```

Sem duplicar cérebro, sem transformar o repositório inteiro em cofre e sem publicar a memória privada da Casa.

## Check-list diário (fechamento)

Owner Git: `docs/BRAIN/02-ENTRADA/CHECK-LIST-DIARIO.md`  
Note Casa: `E:\CentralDark\Pivete\CASA-VAULT\🧾CHECK-LIST DIARIO🤖.md`  
URI: `obsidian://open?vault=CASA-VAULT&file=%F0%9F%A7%BECHECK-LIST%20DIARIO%F0%9F%A4%96`

Hermes job existente `ec512c0295e2` (Daily Receipt) fecha o dia ~23:00, atualiza o owner Git e notifica o CHEFE. Sessão cristalizada = commit+push main do ouro; não deixar a VPS suja. O vault Windows recebe o delta pelo sync `00-CANONICO` — não criar segundo checklist.

## Regra CURRENT — HUD local e BAT em copia (08/10/2026)

Intencao explicitamente reafirmada pelo CHEFE: **Casa e bancada mutavel**, GitHub `main` e registro canonico. Melhorar o **mesmo** `HUD.html` fisico do vault `C:\Users\Administrador\Documents\Obsidian Vault\🪬Centraldark -HUD🪬\HUD.html`, usando uma rota nativa autenticada pela tailnet quando provada, e promover o delta verificado ao **mesmo** owner `docs/HUD/HUD.html`. Sem criar novo HUD ou novo artefato a cada atualizacao; **nao usar Downloads como destino de entrega** para esse fluxo.

### Dois escritores, alvos distintos

- **HUD.html (Casa e main):** um unico writer por arquivo, reconciliacao por hash/base, menor delta, leitura de volta nos dois lados, preservacao de alteracoes divergentes. A captura de um print nao prova o hash/conteudo local.
- **`CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat` original:** manter aberto, operante e INTACTO enquanto a copia evolui.
- **`CENTRALDARK-CORPO-UNICO-HUD-LOGS - Copia.bat`:** unica area de edicao do BAT para experimentos. Confirmar nome/extensao e bytes reais na Casa antes de escrever. Testar em escopo isolado; nao executar simultaneamente original e copia sobre o mesmo recurso/porta/log sem prova de isolamento.
- **Promocao da copia ao nome original:** somente apos validacao aplicavel e troca coordenada pelo CHEFE; na sequencia preservar nova copia de trabalho. Nunca substituir o BAT original automaticamente.
- **Hermes/Oraculo:** podem ler e testar em paralelo; writes no mesmo caminho requerem ownership unico para evitar conflitos, cherry-picks redundantes e perda de mudancas locais.

### Ciclo pretendido e portabilidade

```text
CASA_HUD_EXISTENTE → HASH/BASE + DELTA MINIMO → TESTE LOCAL
→ MAIN_OWNER_EXISTENTE → READBACK GITHUB
→ READBACK CASA → RECEIPT/FINGERPRINT → FIXED_POINT_POR_ESCOPO
BAT_ORIGINAL=RUNNING_UNCHANGED
BAT_COPIA=EDIT_AND_TEST_WITHOUT_SHARED_WRITER_COLLISION
TAILSCALE=PRIVATE_TRANSPORT_PRIORITY
MCP=CANONICAL_CONTROL_PLANE
REMOTE_WINDOWS_WRITE=REQUIRES_PROVEN_AUTHORIZED_EXECUTOR
DOWNLOADS_STAGING=DISABLED_FOR_THIS_WORKFLOW
NO_PARALLEL_HUD=true
NO_BLIND_OVERWRITE=true
```

O script existente `scripts/casa/sync-hermes-obsidian.ps1` ja protege `docs/BRAIN` com hashes e conflitos; ele **nao deve ser declarado responsavel pelo HUD.html ou BAT** sem medir e ampliar o owner existente conforme necessario. Tailscale conectado nao comprova execucao Windows/SMB/SSH autenticada. Quando a rota autorizada de escrita estiver indisponivel, nao falsificar sincronizacao: anotar o bloqueio especifico e preservar arquivos, incluindo o original ativo.

**Status da decisao:** `INTENT_REGISTERED`. **Status de Casa→main automatico:** `NOT_PROVEN` ate leitura de hash local + escrita + readback; promover selo so apos esses testes. Nenhum arquivo Windows e alterado pela declaracao documental.


## Cristal CURRENT — source canônica do HUD Corpo Único (08/10/2026)

O artefato entregue pelo CHEFE foi reconciliado contra `main` e a árvore VPS `scripts/casa`. Nenhum dos dois continha o launcher versionado; a arquitetura já referenciava o BAT como superfície da Casa. O menor delta canônico é versionar **o mesmo launcher read-only**, sem criar segundo HUD, bridge ou Screenpipe.

```text
CANONICAL_SOURCE=scripts/casa/CENTRALDARK-CORPO-UNICO-HUD-LOGS.bat
CASA_ORIGINAL_RUNTIME=DO_NOT_BLIND_OVERWRITE
HUD_MODE=READ_ONLY_MONITOR
SINGLE_INSTANCE_MUTEX=true
SCREENPIPE_AUTOSTART=false
SSH_PROBE=READ_ONLY
SSH_ALIAS=Segredo-VPS
UNKNOWN_IS_NOT_PASS=true
MAIN_IS_CANONICAL_SOURCE=true
WINDOWS_RUNTIME_E2E=UNKNOWN_UNTIL_CASA_READBACK
```

O arquivo `CENTRALDARK-CORPO-UNICO-HUD-BRIDGE(2).ps1` fornecido na mesma rodada foi preservado apenas como evidência de comparação nesta receipt, **não promovido como owner executável**, porque contém `Start-ScreenpipeHidden` / `npx screenpipe record` e portanto pode abrir um segundo writer do Screenpipe. A funcionalidade útil continua candidata a absorção no owner existente somente após teste discriminante.

Promoção física ao BAT original da Casa continua exigindo hash/readback do arquivo ativo e writer único; commit na main não substitui esse readback.


## CURRENT Casa — cópia de worktrees para Kingston (2026-10-09)

Por ordem do CHEFE, a árvore `E:\CentralDark\_worktrees` foi **copiada** para `K:\CentralDark\_worktrees` (Kingston SSD) na Casa `SEGREDO`, sem apagar nem alterar a origem. Operação `robocopy /E /COPY:DAT /DCOPY:DAT /R:1 /W:1 /XJ`: 131 diretórios, 664 arquivos, 10,98 MB, 0 falhas. Conferência após a cópia: 664 arquivos em cada lado e **0 divergências SHA-256** arquivo a arquivo. Destino é a cópia de trabalho escolhida pelo CHEFE; troca de processos ativos, vínculos Git e execução do cockpit a partir de K: **ainda não foram comprovadas** por esta cópia. O Hitachi (E:/F:/J:) permanece disponível para arquivos brutos sob demanda. Não criar segundo sistema nem confundir arquivo copiado com runtime validado.


## CURRENT Casa — transferência da árvore raiz para Kingston (2026-10-09)

Após o recorte solicitado pelo CHEFE e executado na Casa, leitura remota de primeiro nível constatou a **árvore principal em `K:\CentralDark`**: `CentralDark/`, `OneDrive/`, `w-skills/`, `_IMPORTS/`, `_MAPA_CASA/`, `_QUARANTINE/`, `_cache/`, `_worktrees/` e arquivos de auditoria/receipts. Em `E:\CentralDark`, restaram apenas `_cache/` e `_worktrees/` no primeiro nível. Este é o CURRENT **observado**, não prova de integridade total dos conteúdos, de runtime já redirecionado ou de origem vazia. O registro anterior da cópia inicial de `_worktrees` permanece como histórico, sem ser reescrito. O Kingston foi escolhido como bancada mutável; a origem Hitachi fica para material bruto sob demanda. Não apagar os remanescentes sem confirmação de equivalência e uso. A migração física da árvore não equivale a renomear caminhos canônicos da aplicação no Git; atualizar referências somente com medição de cada consumidor afetado.


### Receipt de conclusão do recorte — 2026-10-09 (captura PowerShell do CHEFE)

A captura do PowerShell 7 no Kingston `K:` comprova que o Robocopy **terminou** às 16:55 com `RESULTADO: 1` (êxito com itens copiados), `FALHA=0`, `Incompatibilidade=0`. Resumo mostrado: 6.535 diretórios copiados, 73.797 arquivos copiados, 664 ignorados, 1,559 GB copiados de 1,570 GB totais, 21 segundos de tempo efetivo de cópia reportado; o resumo também exibe duração total de 1h39m42s. Estado da **transferência reportada: DONE**, conforme saída real e captura da Casa. A leitura anterior já comprovava `K:\CentralDark` com a árvore de primeiro nível; `E:\CentralDark` ainda continha `_cache` e `_worktrees` na observação anterior. **Não confundir DONE da execução Robocopy com prova de exclusão integral da origem, integridade total ou runtime validado**: esses pontos permanecem não medidos após a captura. Registro factual, sem novo sistema e sem alterar scripts.

<!-- PR1788_HUD_OBSIDIAN_DETERMINISTIC_SEAL_CONTINUITY_20261009 -->
## Manifesto de entrada e selo da Casa/Obsidian — mesmo HUD, mesma verdade (09/10/2026)

**Obrigação de quem opera a Casa:** antes de agir por plugin, Hermes, MCP, nota, comando ou painel, **consultar o mesmo HUD.html e o PR ativo que nele está indicado**, mais os owners/referências correntes. O manifesto `.hermes-sync/` continua sendo o **índice local de hashes**; o `manifest.json` de `centraldark-grafo-vivo` continua sendo metadado técnico do plugin. Nenhum dos dois se torna novo manifesto de autoridade ou executor. O pacto operacional é este owner, consumido pelo Grafo Vivo/sync existentes.

```text
ENTROU_TEM_QUE_SELAR=true
HUD_SOURCE=docs/HUD/HUD.html
OBSIDIAN_HUD=mesmo HUD.html fisico da Casa
ACTIVE_RENDEZVOUS_PR=1788 (medir CURRENT, nao hardcodar como eterno)
PROVEN_SEAL + MATCHING_FINGERPRINT_AND_BINDINGS
  -> REPLAY_EXISTING_OWNER_RECIPE_WITHOUT_LLM
  -> TARGET_EFFECT_READBACK + SAME_PROOF_KEY_RECEIPT
NO_VALID_SEAL -> VER_PENDENCIA + OWNER + ROUTE + NEXT_CURSOR
NO_SECOND_HUD=true
NO_SECOND_MANIFEST_WRITER=true
NO_BLIND_OVERWRITE=true
```

Cada selo carrega `OWNER, SCOPE, PROOF_KEY, SOURCE_SHA, RECEIPT, READBACK, OBSERVED_AT, NEXT_CURSOR`, além dos fingerprints de artefato/dependência, versão de política, binding, sequência executável, efeito esperado e invalidações. **Selado = prova por escopo e data**; só entra em replay sem IA quando o owner possui runner determinístico autorizado e os bindings/efeito foram equivalentes. Falha de acesso, stale, diferença de hashes, falta de prova ou efeito divergente vira **PLACA/VER PENDÊNCIA** sem apagar o acerto anterior. Não repetir a investigação inteira.

Se `docs/HUD/HUD.html@PR`, `@main` e arquivo físico divergirem, exibir as três versões com SHA/proveniência e preservar o arquivo local; `scripts/casa/sync-hermes-obsidian.ps1` **não cobre automaticamente o HUD.html**. A cópia aprovada requer escritor exclusivo, comparação de hashes e readback na Casa. O plugin Grafo Vivo conserva 2D/3D; **Obsidian aberto ou arquivo copiado não prova renderização nem ação MCP**. Segredos e memória privada nunca entram em receipts públicos.

Quando o PR apontado pelo HUD fechar, for concluído ou esgotar comentários, carregar **o mesmo Goal/linha causal** e somente as pendências ainda não seladas no sucessor autorizado; exibir predecessor/sucessor no **mesmo HUD**, nunca em outro painel. Se nada permanecer pendente, não criar PR por cerimônia. `CURRENT > HISTORY`, `DOCUMENTED != EXECUTED`, `ONE_WRITER_PER_EXACT_PATH=true`.
<!-- /PR1788_HUD_OBSIDIAN_DETERMINISTIC_SEAL_CONTINUITY_20261009 -->
