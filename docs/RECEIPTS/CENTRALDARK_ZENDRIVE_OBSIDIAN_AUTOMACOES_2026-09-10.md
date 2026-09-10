# 👑🪬 CENTRALDARK — ZENDRIVE / OBSIDIAN / AUTOMAÇÕES

Data: 2026-09-10
Repo: ServerVpss/CentralDark
Branch: main

## 🧠 Ideia do Chefe

A Casa deve seguir a cabeça do Chefe:

- GitHub é a fonte oficial do código e dos recibos.
- Google Drive é espelho humano e arquivo sincronizado.
- Obsidian/Screenpipe pode guardar memória viva para consulta e planejamento.
- Zendrive é a ponte local que usa Chrome autenticado para enviar/capturar mensagens.
- Automação deve ajudar a saber o que fazer, o que já foi feito e o que ainda falta, sem criar governo paralelo.

## 🏠 Zendrive local — prova atual

Resultado enviado pelo Chefe mostra avanço real na Casa:

- Ambiente local: `E:\CentralDark\Pivete\CentralDark\apps\modulos\elite-gateway\test-local`.
- Perfil local usado: `segredo` apontando para `Profile 15`.
- Dependências Python corrigidas até `IMPORTS_OK`.
- Primeiro erro: porta `9222` recusava conexão.
- Depois de abrir Chrome com `--remote-debugging-port=9222`, o script registrou:
  - `ATTACH mode to existing session on port 9222`
  - `Prompt sent via CDP to existing authenticated session`
- A porta `9222` respondeu `/json/version` com Chrome e `webSocketDebuggerUrl`.

Conclusão simples:

- Chrome local com CDP 9222 = janela preparada.
- Zendrive = conjunto que usa essa janela, perfil, porta, script e captura.
- Prova atual: Zendrive conseguiu falar com a aba autenticada.
- Próxima prova: confirmar nascimento de `logs/last_messages.json` com conteúdo do probe.

## 👁️ Obsidian / Screenpipe

Pelos prints do Chefe:

- Obsidian está conectado como app na malha visual do ambiente.
- Existe cofre/vault conectado e memória do Screenpipe sincronizando para nota Markdown.
- Isso é bom para memória e planejamento.
- Isso não substitui GitHub como fonte oficial.

Regra da Casa:

- Obsidian guarda lembrança e contexto.
- GitHub guarda decisão oficial e recibo.
- Drive espelha para leitura humana.
- Screenpipe observa tela quando autorizado pelo Chefe.
- Automação consulta e resume, mas não vira juiz.

## 🔁 Automação com Obsidian

A ideia é boa se operar assim:

1. Screenpipe observa e registra memória.
2. Obsidian recebe a nota/memória para busca e grafo.
3. Automação usa isso para montar resumo/next step.
4. GitHub recebe recibo quando houver decisão oficial.
5. Drive recebe espelho quando o destino estiver claro.

Não usar assim:

- Obsidian decidindo sozinho.
- Drive sobrescrevendo GitHub.
- Automação apagando Fonte sem hash byte-a-byte.
- Chat confundindo lembrança com prova.

## 📚 Fontes / Drive / GitHub

Estado já registrado anteriormente:

- Inventário total de Fontes: 9.908 arquivos.
- Páginas processadas: 50.
- `more_pages=false`.
- Total catalogado: 17.393.174.903 bytes.
- Duplicatas byte-a-byte removidas: 25.
- Espaço ativo removido do índice: 303.757.201 bytes.
- Liberação física de quota: UNKNOWN até recibo da plataforma.

Regra:

- Apagar só duplicata byte-a-byte comprovada.
- Mesmo nome/tamanho sem hash não basta.
- Lixeira não prova quota liberada.

## ⚖️ Veredito

CASA_ZENDRIVE=AVANÇOU
ZENDRIVE_FALOU_COM_ABA=PROVADO_PELO_LOG_DO_CHEFE
LAST_MESSAGES_JSON=PROVA_FINAL_PENDENTE
OBSIDIAN_SCREENPIPE=BOA_CAMADA_DE_MEMÓRIA
OBSIDIAN_COMO_FONTE_OFICIAL=NÃO
GITHUB_COMO_FONTE_OFICIAL=SIM
DRIVE_COMO_ESPELHO=SIM
AUTOMAÇÃO_COM_OBSIDIAN=BOA_SE_FOR_MEMÓRIA_E_PLANEJAMENTO
UNKNOWN_NAO_E_PASS=ATIVO

## 🧭 Próximo passo

1. Confirmar `logs/last_messages.json` na Casa.
2. Se existir, registrar o conteúdo mínimo do probe.
3. Espelhar este recibo no Drive em `CentralDark/ESPELHOS-DO-GITHUB/docs/RECEIPTS`.
4. Manter Obsidian como memória pesquisável, não como juiz.
