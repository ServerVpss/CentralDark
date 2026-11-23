# 🪬 CENTRALDARK — LEIA-ME | Contrato de entrada e handoff
**Criado/atualizado:** `2026-11-23T06:31:20-03:00` · **Fuso:** America/Bahia (UTC-03:00)
**Escopo único:** `C:\CentralDark-Harnes-projeto\CentralDark-RemoteDesktop-Comander`

> Este arquivo ensina **como trabalhar**. O `CHECKPOINT.md` registra **onde paramos**. Os dois ficam juntos na raiz. Não criar versões paralelas, outro HUD, novo checkpoint ou outro mecanismo só para documentar a missão.

## 0. Entrada obrigatória para qualquer IA que receba acesso a este projeto
1. **Ler integralmente este `LEIA-ME.md`**.
2. **Ler integralmente `CHECKPOINT.md`** antes de editar ou anunciar conclusões.
3. Conferir, em leitura, **o código e os processos vivos** relevantes, porque o checkpoint pode estar desatualizado. Validar data/hora da Bahia; identificar o owner, o alvo e a autorização.
4. **Mostrar no topo da primeira resposta operacional o `!HUD` atual**: data/hora, estado, últimos deltas de hoje, pendências de ontem ainda abertas, evidências, bloqueios e **Próximo passo**. Usar o HUD do checkpoint, corrigindo divergências comprovadas; não inventar funcionamento.
5. Nova mensagem do CHEFE = **DELTA** da missão vigente, salvo mudança explícita de escopo. Trabalhar com o menor delta autorizado.

**Regra de apresentação:** `!HUD` mostra o placar atual; `!RASTRO` mostra a sequência de alterações com caminho, hora, teste e prova. Se solicitado `!CENTRALDARK`, respeitar também o contrato canônico de boot do repositório principal, sem substituí-lo por estes dois arquivos.

## 1. Mapa da pasta (não renomear nem mover sem autorização)
- `source_remote_bridge/`: Remote Bridge, integração Electron e interface React.
  - `ui/src/native-os/NativeShell.jsx`: barra lateral, CENTRALDARK AGENTE, submenus, luz da Biblioteca, arraste e recolhimento.
  - `ui/src/native-os/NativePages.jsx`: Novo chat, Visão geral, registros, biblioteca e outras páginas.
  - `ui/src/native-os/native-shell.css`: aparência, layout e animações.
  - `ui/src/native-os/native-data.json`: dados locais de navegação e histórico; **não presumir que são dados vivos**.
  - `ui/src/App.jsx`: painel operacional do Bridge, acesso e navegação.
  - `ui/electron/main.cjs` e `ui/electron/preload.cjs`: janela Electron, IPC, sessão e autorização.
  - `installer/Build-Remote-Bridge.ps1`: inicialização DEV existente.
- `centraldark-halo-main/`: projeto Halo em Tauri; owner separado de interface/processo.
- `CentralDark-Halo-Windows-x64-v0.1.8/`: distribuição preexistente.
- `CentralDark-DesktopCommanderMCP-main/`: implementação MCP anterior; **não substituir sem contraprova**.
- Arquivos `.zip` na raiz: históricos; não extrair nem apagar por rotina.

**Limite:** esta raiz e os subprojetos foram encontrados **sem `.git` local** na auditoria inicial. Não declarar commit, push, alinhamento com `main` ou SHA Git sem prova independente. O código do `F:\CentralDark` não é este checkout.

## 2. Método operacional mínimo — um organismo
**CHEFE (intenção) → SOL (coordena) → owner existente (executa) → realidade (contraprova) → rastro (registra) → Kaizen.**

- Reutilizar antes de criar; um owner e um escritor por escopo; preservar CENTRALDARK AGENTE, login, pareamento, cofre e Core.
- Observar em leitura antes de agir. Para interfaces, preferir **PID → HWND → GUI/UIA ou DOM → AÇÃO → READBACK**. Screenshot só quando aparência/pixels, ausência de seletor ou contraprova visual exigirem.
- Alteração autorizada → teste objetivo → contraprova independente → atualização do checkpoint → resposta com estado.
- **UNKNOWN != PASS · ACTION != PROOF · DOCUMENTED != EXECUTED · EXISTS != RUNNING · MERGED != DEPLOYED.**
- Nunca escrever tokens, senhas, sessões ou segredos nos dois Markdown; registrar apenas caminhos públicos, SHA-256 de arquivos não secretos e status.
- Não ativar permissões reais por causa de seletores visuais. Distinguir chat local, Bridge operacional e conexão real do motor MCP.

## 3. Contrato do !HUD (sempre derivado do CHECKPOINT)
```text
👑🪬 CENTRALDARK — !HUD  |  AAAA-MM-DD HH:MM:SS UTC-03
🎯 MISSÃO: <uma frase>
📍 LOCAL: <pasta>  |  OWNER: <arquivo/componente>
🟢 APROVADO: <o que passou com prova>
🟡 PENDENTE: <abertas hoje + herdadas com data original>
🔴 FALHOU: <teste com evidência negativa, se houver>
⚪ NÃO VERIFICADO: <sem leitura/prova atual>
🕒 HOJE: <deltas com hora, teste, caminho>
👣 !RASTRO: <prova/recibo e última alteração>
➡️ Próximo passo: <uma ação mínima verificável>
```
**Não pintar uma falha de verde.** HTTP 200 de `/health` não significa `engine_connected=true`. Código alterado não significa runtime carregado. Um botão visual não significa uma permissão efetiva.

## 4. Contrato do CHECKPOINT (atualizar o mesmo arquivo)
Após cada **delta material** realmente concluído ou bloqueado, registrar:
1. **Data/hora BRT**, responsável, objetivo, owner, escopo e situação atual.
2. **Hoje:** o que mudou, arquivo, teste realmente executado e resultado.
3. **Pendências:** ID estável, origem `AAAA-MM-DD`, impedimento, contraprova necessária e Próximo passo; não apagar pendência sem prova de encerramento.
4. **!RASTRO:** evento, caminho exato, SHA-256/commit real (ou `NÃO APLICÁVEL`), leitura posterior e limite da prova.
5. **Último bom:** último estado testado e instrução de recuperação se houver falha.

**Virada do dia:** ao iniciar novo dia da Bahia, mover para “Pendências herdadas” todos os itens abertos, mantendo seu **ID, data de origem e contexto**. Abrir “Atualizações de hoje” sem apagar o passado; resumir dias anteriores em “Histórico curto” dentro do mesmo `CHECKPOINT.md`. Sem arquivos diários extras.

**Atualização obrigatória:** gravar `CHECKPOINT.md` **depois do teste** e fazer readback do arquivo. Só afirmar “gravado” com caminho, hora, hash e leitura de confirmação. Sem acesso de escrita, deixar `PENDENTE` e informar o motivo; não simular.

## 5. 🏛️ Publicação obrigatória no mesmo PR — ambos atualizados
**PR da missão:** [CENTRALDARK · OS #2119](https://github.com/ServerVpss/CentralDark/pull/2119) · **branch:** `feat/centraldark-os-rov-ui-20261117` · **base:** `main`.

**Espelho dos únicos dois documentos de continuidade (nomes iguais, locais diferentes):**
- **Casa:** `C:\CentralDark-Harnes-projeto\CentralDark-RemoteDesktop-Comander\LEIA-ME.md` e `CHECKPOINT.md`.
- **PR #2119:** `apps/instinto-superior/docs/CENTRALDARK-OS/LEIA-ME.md` e `apps/instinto-superior/docs/CENTRALDARK-OS/CHECKPOINT.md`.
- **HTML original do PR:** `apps/instinto-superior/docs/CENTRALDARK-OS.html`; não alterar somente para registrar status.

**REGRA OBRIGATÓRIA A CADA DELTA MATERIAL:** (1) ler os dois arquivos atuais na Casa e na branch do PR; (2) verificar o estado real e executar/testar o menor delta autorizado; (3) **atualizar os DOIS Markdown** com data/hora Bahia, orientações e `!HUD`/`!RASTRO`; se o LEIA-ME não tiver mudança de regra, atualizar ao menos o registro de revisão/versão do contrato; (4) validar integridade, sem segredos e sem apagar pendências; (5) publicar **ambos no mesmo commit** da **branch do PR #2119**, sem commit direto em `main`; (6) conferir SHA da branch, os dois arquivos no GitHub e o diff; (7) atualizar o corpo do **mesmo PR #2119** com horário, recibo do commit, últimas mudanças, pendências, links e próximo passo; (8) comparar o conteúdo dos espelhos e registrar divergências.

**Critério de conclusão:** `CASA_2_ARQUIVOS = PR_2_ARQUIVOS` (conteúdo correspondente) **e** `COMMIT_NO_PR` confirmado **e** `READBACK` dos dois lados. **Se GitHub ou Casa estiver inacessível, não declarar concluído; marcar PENDENTE e manter o estado comprovado**, sem inventar SHA. Comentário no PR sem commit dos dois arquivos não satisfaz a regra. Não empurrar arquivos de runtime para o PR só por documentação: o React nativo vive atualmente na Casa e o HTML do PR é referência documental, até uma promoção explícita do código.

**Escopo de autorização:** esta missão autoriza publicar os dois documentos no PR #2119; mudanças futuras seguem a autorização específica do CHEFE e os gates do repositório. Nunca fazer merge, deploy ou force-push por causa do checkpoint.

## 6. Operação DEV e limites de segurança
- Conferir `source_remote_bridge/ui/package.json` antes dos comandos. Receita encontrada: `npm run dev:live` a partir de `source_remote_bridge/ui`; a rota existente usa `../installer/Build-Remote-Bridge.ps1 -Dev`.
- Verificar Vite/Electron sem iniciar duplicatas. Testar `npm run check` e `npm run build` quando alterar React/Electron; readback de janela e menus para GUI.
- O DEV pode permitir entrada sem senha de teste; **não transportar o bypass para produção** e não alterar os textos do login sem pedido.
- Se o comando `Ctrl+Shift+S` ou a conexão MCP não passar, registrar como pendente, mesmo que o build tenha passado.
- Não criar commits nem realizar push ou deploy sem escopo e autorização próprios. `F:\CentralDark\CentralDark-Core` permanece fora desta documentação.

## 7. Resposta padrão ao CHEFE
**Resultado primeiro**, PT-BR simples, emoji e título por assunto. Depois evidência, estado `APROVADO / PENDENTE / FALHOU` e **Próximo passo**. Se não houver teste, escrever `NÃO VERIFICADO`.

**Próxima leitura:** `CHECKPOINT.md`. Ele é o HUD vivo do projeto e o handoff do dia.
