# CentralDark — boot universal obrigatório

Esta regra é automática para qualquer modelo executado pelo Claude Code neste repositório.

Antes de responder ou agir:

1. Leia `LEIA-ME-IA.md` integralmente.
2. Leia `AGENTS.md`.
3. Leia `docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json`.
4. Leia `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md`.
5. Carregue `.agents/skills/meta-lupa/SKILL.md` quando a tarefa for crítica.
6. Resolva a identidade vigente por `.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA`; não copie SHA para este adaptador.
7. Confirme estado atual, branch, HEAD, escopo, Writer-Role, Writer-Scope, Writer-Instance e próxima prova.
8. Emita uma vez o recibo `CENTRALDARK_AI_BOOT` definido na porta universal.

`REUSE_BEFORE_CREATE_REQUIRED`

Antes de criar ou propor código, arquitetura, skill, workflow, plugin ou serviço:

- procure capacidades existentes;
- abra os arquivos principais da implementação;
- cruze as capacidades com o pedido atual;
- classifique autoridade e runtime;
- reutilize ou estenda minimamente;
- crie somente com gap real provado.

Encontrar um arquivo e não reconhecê-lo como solução aplicável é `FALHA_DE_RECONCILIACAO_DE_CONTEXTO`.
PR aberto, Draft, plano ou prova formal é contexto, não autoridade operacional automática.
Tarefa simples não vira swarm, missão, matriz formal ou parede de texto sem necessidade.

Regras permanentes:

- SEGREDO/CHEFE é a autoridade final.
- Qualquer modelo é especialista subordinado ao mesmo contrato.
- Nome de modelo **não é ownership**: `WRITER_ROLE` e `WRITER_SCOPE` governam a lane; `WRITER_INSTANCE` é substituível.
- `MODEL_IS_REPLACEABLE=true`; GPT, Claude, Codex, Gemini, Grok ou outro modelo não ganha reserva permanente de arquivo por ter produzido o delta anterior.
- Leitores trabalham em paralelo somente quando houver ganho real; existe um único escritor por escopo **e por vez**.
- Se outro Writer está vivo e tem delta não entregue, permaneça `READ_ONLY/JUDGE`.
- Se o Writer terminou, caiu, perdeu sessão, quota, recebeu 429/402/timeout ou ficou indisponível, capture HEAD/dirty/uncommitted, preserve o delta e faça `WRITER_HANDOFF` para instância capaz. Não espere um modelo específico voltar.
- Ordem atual de SEGREDO/CHEFE pode disparar handoff; isso não autoriza Writers simultâneos.
- Em uso de IA: determinístico primeiro; selecione por capacidade/saúde/custo. GPT-5.5 pode ser preferência em tarefa crítica quando disponível, com fallback para outra rota capaz.
- `UNKNOWN`, `429`, `402`, timeout, offline, skipped ou cancelled nunca equivalem a PASS.
- Mensagem atrasada não reinicia missão.
- Evidência atual vence contexto antigo.
- Use deltas curtos; não repita histórico já comprovado.
- Nenhum executor aprova o próprio trabalho.
- Não crie memória, versão, workflow ou doutrina paralela.
- Não exponha a governança interna como burocracia para o usuário.

Esta regra é apenas um adaptador de autoload. A fonte canônica continua sendo `LEIA-ME-IA.md`.
