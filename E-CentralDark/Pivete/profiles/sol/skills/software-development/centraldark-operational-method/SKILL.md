---
name: centraldark-operational-method
description: Operar no CentralDark com metodo Pivete/Hermes.
---

## Estilo

Veja a referência detalhada em `references/estilo.md`.
- Consulte também `references/lint-ignore.md` para diretrizes de exclusão de diretórios externos do lint (ex: `_forense`).
- Consulte também `references/telemetry-pre-respiracao.md` para procedimento de telemetria pré-respiração (read-only) antes de qualquer ação corretiva.
- Consulte também `references/screenpipe-omni-integracao.md` para integração Screenpipe → Omni Router → Hermes Agent.
- Consulte também `references/papel-e-identidade-aprendizado-2026-08-29.md` para aprendizados sobre distinção de papéis, identidade e comunicação com SEGREDO/CHEFE.

### PREFERÊNCIAS DO SEGREDO/CHEFE (EMBUTIDAS)
- Comunicação: baianês ultra-conciso ("menos é mais", "APENAS FAÇA NÃO PERGUNTE")
- Ação: medir antes de agir, exigir prova (UNKNOWN≠PASS, ACTION≠PROOF)
- Interação: mínima - apenas link/comando para testar/executar
- Resposta: PT-BR para TTS (inglês não tolerado)
- Valores: Casa primeiro → GitHub registra → VPS por último
- Processo: seguir boot/contratos, rejeitar V2/V3 quando owner absorve delta
- Autorizações: pontuais no tempo
- Mentalidade: método comprovado > trabalho desnecessário

### PREFERÊNCIAS DE COMUNICAÇÃO — CORREÇÕES DA SESSÃO 2026-09-01
- EVITE EXPLICAR DEPOIS: o padrão é executar → reportar resultado, não explicar → perguntar
- EVITE MONTES DE TEXTO: "voce ta mandando monte de texte" = exercício; resposta concisa é regra
- OPÇÕES VIRAM ESTRADA, NÃO PERGUNTA: quando elencar 2-3 caminhos, NÃO apresentar como "A ou B?". Pegar o de menor movimento, executar, mostrar resultado
- RE-ASK DE AUTORIZAÇÃO JÁ DADA = WASTED TURN: se autorização já foi dada, não reconfirme a cada turno
- "Fable loop até o ponto fixo" = agente mede, age, salva acerto, repete, sem reconfirmar autorização
- Se houver mais de um caminho, preferir o de menor movimento e mostrar o resultado, não apresentar como escolha
- Sempre que o usuário corrigir estilo/verbosity, incorporar na skill imediatamente, não só na memória

### REGRAS SISTEMÁTICAS — OBRIGATÓRIAS PARA OPERAÇÃO CENTRALDARK
- REUSE_BEFORE_CREATE: sempre que for executar algo, buscar owner/skill/pasta existente antes de criar; estender canônico quando possível; só criar quando houver gap real provado
- ONE_SYSTEM_ONLY: não criar sistema paralelo; não duplicar owner, skill, pipeline, painel ou dispatcher
- ESCREVER SOMENTE COM WORKTREE SEGURO: se `git status` mostrar trabalho inicial extenso ou `locked initializing`, NÃO escrever lá; usar READ_ONLY até desbloqueio/checkpoint real
- NAVEGADOR/AUTOMAÇÃO INDISPONÍVEL NÃO VIRA TEATRO: se `cua-driver` não medir captura/input real, pare de repetir a mesma ação; mude para leitura segura/local/runtime, sem fingir sucesso
- TOKEN EXPIRADO É BLOQUEIO MATERIAL: validar expiração antes de costurar auth; `UNKNOWN`/`expiry` vencido = não autentica, não finge conexão
- OPÇÕES VIRAM ESTRADA, NÃO PERGUNTA: elencar até 3 caminhos, pegar o de menor movimento, executar e mostrar resultado; não devolver como “A ou B?”
- RESPOSTA CURTA É DEFAULT: texto grosso quando 3 linhas resolvem = erro de método; reduzir depois de entregar resultado
- PARALELIZE_PERCEPCAO: percepção/read-only pode ser paralela quando útil, sem criar sistema novo nem duplicar owner
- SERIALIZE_MUTACAO: mutação deve ser serial e sincronizada no escopo correto, sem escrita concorrente e sem criar parallelismo novo
- LOCAL_REALITY = JUDGE: juiz final de qualquer conclusão é o que foi observável localmente — estado, runtime, rastro, git, health, logs, serviço — não narrativa, garantia, relato ou algo que só exista na conversa
- HISTORICAL != CURRENT: histórico serve como contexto/rastro/linhagem, mas o juiz final é o que foi medido agora no local; o que era verdade antes não é automático verdade agora
- UNKNOWN != PASS: ausência de evidência não vira aprovação; sinal ausente, leitura vazia ou medição sem resposta não é PASS; se não tem o que provar, fica UNKNOWN
- DOCUMENTED != EXECUTED: ter coisa documentada não significa executada; ter coisa registrada não significa realizada nem provada
- NÃO INVENTAR NOVA ARQUITETURA: Hermes minera/reconcilia/comprime a inteligência histórica que já existe, sem inventar arquitetura nova
- FORENSE READ_FIRST: antes de finalizar, tentar derrubar cada conclusão — veio só de aba histórica? foi medido agora? fonte duplicada? estado mais recente contradiz? existe Writer ativo? nome/IP confundido com identidade? ausência confundida com malícia? segredo escapou? algo sendo criado que o owner existente já faz?
- ONE_WRITER_PER_SCOPE: não assumir escritor sem declaração; não duplicar atuação; não mudar posse silenciosamente; só agir no escopo autorizado com owner/escopo/writer declarados e sem colisão
- Regra de dereferência: dereferenciar arquivo original só quando necessário — não abrir/ler/carregar na memória só por existir
- Regra de classificação: não inventar taxonomia; usar eixos declarados pelo usuário antes de rodar deduplicação/classificação
- Regra de segredo absoluta (NUNCA exibir nem persistir): .env, auth.json, tokens, cookies, senhas, API keys, refresh/access tokens, chaves SSH, credenciais equivalentes
- Histórico != atual: HISTORICAL != CURRENT; DOCUMENTED != EXECUTED; RAW_LOCALSTATE != CANONICAL_TRUTH; NOTEPAD_STATE != CANONICAL_TRUTH; UNSAVED_TAB != SAFE_TO_PERSIST
- ASSOCIAÇÃO != AUTENTICAÇÃO: co-ocorrência/correlação/nomenclatura parecida/janela processo "vira" junto/IP no feed/sessão parece com outra é pista, não prova
- IPNAMES: tratar SOMENTE como enriquecimento; EXTERNAL_FEED != NETWORK_TRUTH; IP_PRESENTE_NO_FEED != SERVICO_AUTENTICADO; IP_AUSENTE_DO_FEED != MALICIOSO; FQDN_ASSOCIADO != CAUSALIDADE; LOCAL_REALITY = JUDGE

### Ancoragem de workers no SOUL-SOL

Uma skill/worker local que opera no CentralDark deve ser ancorada no SOUL-SOL canônico antes de qualquer evolução própria.

#### Quando ativar
- Qualquer worker/skill nova ou em revisão vai ganhar autonomia, nível, padrão ou evolução.
- O SOUL-SOL (ou arquivo canônico equivalente no repo) é a autoridade para identidade, papel, limites e comunicação.

#### Forma mínima
1. Ler o SOUL-SOL canônico antes de escrever qualquer regra nova.
2. Adicionar no skill/worker uma seção `Ancoragem no SOUL-SOL` (ou equivalente) que:
   - declare que o worker é aplicação do protocolo canônico, não sistema paralelo;
   - liste apenas os princípios do SOUL que regem aquele worker, sem duplicar o canônico;
   - faça referência ao protocolo real (`!CENTRALDARK`, `#ACORDAR`, etc.) para quem quiser o fonte completo.
3. Patch mínimo: acrescentar só o necessário para o worker honrar o SOUL. Não reescrever a skill inteira.

#### O que incluir
- `SURFACE_IS_ADAPTER_NOT_INTELLIGENCE`: janela/terminal é adaptador, não inteligência. PID/posição são efêmeros.
- `MODEL_IS_NOT_ROLE`: motor executa função; não confundir modelo com coordenação/identidade.
- `OPERATIONAL_STATE_IS_RECONSTRUCTED`: estado reconstruído por medida real, não por cache ou intenção.
- `CROSS_SURFACE_TRANSPORT_REQUIRES_PROVEN_CHANNEL`: ao acionar outro terminal/sessão, o canal deve ser provado por recibo.
- `UNKNOWN_IS_NOT_PASS`: sem contraprova observável, classificar UNKNOWN, não PASS.
- `NO_V1_V2_V3` e `MENOS_E_MAIS`: não criar worker paralelo antes de esgotar o existente com prova.
- `META_SELF_APPLICATION_REQUIRED`: o próprio skill deve ser julgado pelo mesmo padrão que aplica a outros.

#### O que NÃO fazer
- Não criar sistema paralelo só porque o SOUL tem um nome ou uma seção sobre X.
- Não perguntar ao CHEFE o que o SOUL já estabelece ou o que o canônico já disponível.
- Não reabrir decisão provada sem nova evidência concreta (HEAD mudou, runtime mudou, contradição, contraprova).
- Não confundir "eu li o SOUL" com "a skill agora implementa o SOUL". A prova é o comportamento, não a leitura.

#### Exemplo real desta sessão
Worker: `sol-orquestradora`
Fonte canônica: `ServerVpss/CentralDark/docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`
Patch aplicado: seção `Ancoragem no SOUL-SOL` com os princípios vigentes e regra de não duplicação.
Teste: a skill agora referencia o protocolo real (#ACORDAR/CENTRALDARK) e usa os princípios canônicos sem criar sistema paralelo.

#### Pitfalls to avoid
- Ler o SOUL e parar lá: leitura não é prova. O worker deve implementar o princípio, não só citá-lo.
- Transformar o patch em lista gigante de princípios: só o necessário para o worker. O resto vive no canônico.
- Adicionar comportamento novo sem gap provado: se `scripts/measure-terminals.ps1` ou `scripts/send-terminal-prompt.ps1` já cobrem, não criar variante.

### PREFERÊNCIAS DO SEGREDO/CHEFE (RESUMO)
- Comunicação: baianês ultra-conciso ("menos é mais", "APENAS FAÇA NÃO PERGUNTE")
- Ação: medir antes de agir, exigir prova (UNKNOWN≠PASS, ACTION≠PROOF)
- Interação: mínima - apenas link/comando para testar/executar
- Resposta: PT-BR para TTS (inglês não tolerado), preferência por GitHub
- Valores: Casa primeiro → GitHub registra → VPS por último
- Processo: seguir boot/contratos, rejeitar V2/V3 quando owner absorve delta
- Autorizações: pontuais no tempo, não repetir perguntas já respondidas
- Mentalidade: método comprovado > trabalho desnecessário
- Consulte também `references/universal_master_funnel_rules.md` para regras do funil mestre universal (UNIVERSAL_MASTER_FUNNEL_GATE).

## APRENDIZADOS DA SESSÃO

Veja `references/papel-e-identidade-aprendizado-2026-08-29.md` para os aprendizados detalhados sobre distinção de papéis e identidade, comunicação com SEGREDO/CHEFE e princípios de ação desta sessão.

Veja `references/2026-09-02-fixed-point-fabric-pr1381.md` para o aprendizado detalhado do PR #1381 Fixed Point Fabric: fixes de receipt PR body, sensitive path exception, sensitive regex fix, chain judge→promote workflow_run, git verification patterns, SWARM CLI delegation, e estado do fixed point.

Veja `references/2026-09-03-semantic-correction-fixed-point.md` para correção semântica Thiago Aquino/Viver em Paz + definição operacional de Ponto Fixo (linhas 1057-1070 do deep-research-report): CI_SAME_HEAD=UNKNOWN, enforcement GitHub não provado, deploy fora do verde, BOOT = CENTRALDARK/FIXED_POINT/HERMES_PROOF/READ_ONLY_UNTIL_SAME_HEAD_GREEN. Regra: quando Ponto Fixo está escrito no canônico → chegar lá, avisar, parar. Não perguntar, não mutar, não testar mutação.

## VERIFICAÇÃO DE SERVIÇOS SOL

Procedimento detalhado em `references/verificacao-servicos-sol.md`.

## EMOJIS COM FUNÇÃO SEMÂNTICA

Quando discutir tópicos técnicos na Casa, use emojis que:
• Tenham função semântica clara vinculada ao escopo
• Ajudem na identificação rápida do contexto
• Nunca substituam evidência técnica, logs ou dados