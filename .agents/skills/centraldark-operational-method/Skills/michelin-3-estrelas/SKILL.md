---
name: michelin-3-estrelas
description: Método Michelin 3 Estrelas CentralDark. Ative com !michelin ou pedido de execução deliberada passo a passo, reuso, testes, contraprova e prova real. Trabalha junto da receita operacional existente e não a substitui.
canonical_owner: .agents/skills/centraldark-operational-method/SKILL.md
source: docs/LEMBRANCAS/metodo-chefe-conformidade-michelin-20261019.md
trigger: '!michelin'
---

# Skill — Michelin 3 Estrelas ⭐️⭐️⭐️

## Identidade, autoridade e fonte

Conversão operacional do **método existente** preservado em `docs/LEMBRANCAS/metodo-chefe-conformidade-michelin-20261019.md`. Esta skill **não substitui** a Lembrança histórica nem a hierarquia CentralDark.

Ordem: intenção do CHEFE → SOUL → RULES → AGENTS → `centraldark-operational-method` → Michelin → executor existente. Para doutrina técnica consultar `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` (item M, Michelin).

Complemento operacional: `../../../references/MICHELIN-3-ESTRELAS-PROTOCOLO.md`.
Se delegar para Hermes, carregar também `../../../references/HERMES-KANBAN-RECEITA-UNIVERSAL.md`.

## Quando disparar

- Comando `!michelin` (qualquer combinação de maiúsculas/minúsculas).
- Pedidos de Michelin 3 estrelas ou de execução deliberada, cuidadosa, sequencial e comprovada.
- Ativar **junto** do método da tarefa. Não criar segundo motor, segundo Kanban, segundo comando de criação ou exclusão.

## Entrada obrigatória: resolver somente pela intenção atual

| Campo | Como decidir |
|---|---|
| `INTENCAO` | Ação e resultado explicitamente pedidos agora. |
| `AMBIENTE` | Casa Windows ou VPS Linux onde o efeito tem de existir. |
| `WORKSPACE` | Diretório escolhido agora pelo CHEFE; nunca herdar o do teste anterior. |
| `ALVO` | Arquivo, sistema, componente ou caminho exato. |
| `EXECUTOR` | Owner e mecanismo já funcionando no ambiente-alvo. |
| `ACEITE` | Prova real do resultado e contraprova pertinente. |
| `LIMITES` | Tudo que não foi autorizado deve permanecer intacto. |

## Procedimento do método original

**INTENT_FIRST:** seguir as palavras do CHEFE e owners existentes; não inventar arquitetura, PR ou painel.
**SCRIPT_BEFORE_MODEL / REUSE_BEFORE_CREATE:** descobrir receita comprovada, menor delta e último verde antes de introduzir dependências novas.
**AUTONOMIA_NO_ESCOPO:** medir → executar → testar → corrigir → testar novamente → registrar, sem pedir permissão para microcorreções dentro do que já foi autorizado.
**CASA_MAIN_BIDIRECIONAL:** quando sincronização foi solicitada e os gates permitirem, preservar os dois lados com readback; documentar skill não implica push.
**FORJA_DISCOS:** K patrimônio; F temporários; C Windows e exceções reais, mas a intenção define o workspace da missão.
**AGENTES:** reutilizar Hermes original, não recriar agentes. **REALIDADE_JUIZ:** UNKNOWN não é PASS, e a aparência não prova resultado.

## 🎯 Target Lock transversal — coordenadas lógica, relativa e absoluta

Antes das três estrelas, resolver o alvo pelo contrato da Skill Mãe:

`TARGET_ID → OWNER_RELATIVE_PATH → ENVIRONMENT_ROOT → RESOLVED_ABSOLUTE_PATH/RUNTIME_TARGET_ID → TARGET_MATCH`.

- Persistência usa `TARGET_ID` e caminho relativo do owner.
- Caminho absoluto, PID, handle e RuntimeId são resolvidos no host/sessão atual e não viram constantes canônicas.
- ⭐ Construir só passa o preflight com `TARGET_MATCH=PASS`.
- ⭐⭐ Integrar deve agir no mesmo `TARGET_ID`; trocar host/path/PID silenciosamente invalida a continuidade.
- ⭐⭐⭐ Provar remede o alvo e contraprova vizinhos; `ACTION_SENT != EFFECT_PROVED`.
- Em arquivos: provar que path relativo + raiz atual resolvem o absoluto esperado.
- Em UI: provar janela/processo/controle atual; PID é efêmero e deve ser redescoberto após mudança de sessão.

## ⭐ Primeira estrela: CONSTRUIR

1. Extrair intenção, alvo, workspace variável, ambiente, limitações e critério de aceite.
2. Localizar o método e o executor que já funcionaram. Conferir disponibilidade material, não presumir.
3. Planejar a menor alteração ou delegação possível, preservar o último estado válido.
4. Registrar prova de preflight. Planejamento ou cartão preparado não constitui execução.

## ⭐⭐ Segunda estrela: INTEGRAR

1. Executar com o mecanismo existente e perfil/modelo disponível naquele host.
2. Para Hermes da Casa, manter **o mesmo `hermes kanban create`** com `--assignee`, `--workspace` da intenção, `--body-file -`, `--goal`, idempotência, modelo/provedor e título. Verbo de criar, excluir, editar, copiar etc. pertence ao corpo da missão.
3. Ler ID do cartão, `kanban show`, `kanban runs` e logs. `READY`, `RUNNING` e `DONE` são estados diferentes.
4. Se falhar, investigar causa, corrigir menor componente e retestar o **mesmo escopo**; não criar mecanismo paralelo.
5. Para software, adicionar testes e integração apropriados; para arquivos simples, prova do efeito no disco é a integração proporcional.

## ⭐⭐⭐ Terceira estrela: PROVAR

1. Conferir no host certo o efeito exato: criar = existe+conteúdo; excluir = alvo ausente; editar = delta correto; formato novo = arquivo válido; deploy = runtime correto e provas exigidas.
2. Testar contraprova proporcional: checar que alvos vizinhos e conteúdos fora do escopo não foram alterados.
3. Registrar ID, comando/rota, estado do worker, readback e resultado PASS/PARCIAL/FAIL/BLOCKED/UNKNOWN.
4. Só conceder três estrelas **ao escopo medido**; não promover um teste simples a Fixed Point global.
5. Para aplicação ou deploy, manter o critério da SOUL: fonte/build/auth → CI+integração → deploy+visual autenticado+Casa/VPS+logs, mesmo SHA. Um HTTP 200 isolado não basta.

## Teste real Michelin — Hermes Windows Casa

- A delegação existente funcionou sem novo Kanban: `ChatGPT → Desktop Commander Casa → Hermes CLI Casa → perfil default → provedor NVIDIA`.
- CLI: `C:\Users\Administrador\AppData\Local\hermes\bin\hermes.exe`. O caminho identifica o executor medido da Casa, **não o workspace padrão**.
- `t_2805243c`: criar TXT, `DONE` com conteúdo comprovado no Windows.
- `t_26e02a16`: excluir o mesmo TXT, `DONE` com ausência comprovada no Windows.
- Modelo usado: `nvidia/nemotron-3-ultra-550b-a55b` (`--provider nvidia`). Outros modelos podem funcionar após medição; o provedor custom `jann` falhou por conexão naquele teste.
- Não trocar o método que deu PASS; para outros arquivos e intenções alterar somente descrição, alvo, workspace, título, chave e critério de aceite. A operação futura só vira PASS após prova própria.

## Contrato de micro-passos — 50/50 como meta, nunca placar inventado (26/10/2026)

O CHEFE definiu **50 micro-passos comprovados como objetivo**, não como contador já concluído. Para cada micro-passo autorizado, preservar no mesmo `TASK_ID/GOAL_ID`:
- **⭐ CONSTRUIR:** mudança real no owner existente + readback do alvo.
- **⭐⭐ INTEGRAR:** mesmo delta conectado à intenção, ao código, à Skill Mãe/receita pertinente e ao runtime quando aplicável.
- **⭐⭐⭐ PROVAR:** teste/contraprova independentes e receipt real do resultado. Só promover o escopo observado, não o sistema inteiro.
- **Checkpoint verde** exige `3_ESTRELAS + RECEIPT_VALIDO` no passo específico. `UNKNOWN/BLOCKED` não recebe estrela de prova e não vira `COMPLETED`.
- Placar `N/50` só conta passos com `TASK_ID + OWNER + EFEITO + CONTRAPROVA + RECEIPT` únicos. Sem denominador auditável, `NOT_MEASURED`, jamais `100%`.

**Casa primeiro, VPS indisponível:** a Casa pode desenvolver e testar o **mesmo código, scripts e configuração Linux portáveis** que serão aplicados posteriormente na VPS. Se a VPS estiver fora do ar, o teste nela fica `UNKNOWN/BLOCKED_VPS`; a frente local prossegue sem pânico e sem bloquear escopos independentes. `LOCAL_PASS != VPS_PASS`. Divergências de boot, kernel, driver, rede, discos e recursos exigem contraprova na VPS quando voltar. Não clonar uma segunda arquitetura ou mudar o serviço por causa da indisponibilidade.

**Figma → Excalidraw:** usar somente o projeto Figma real com ID verificado e sua estrutura/artefatos autorizados. Primeiro localizar owner Figma/Excalidraw existente; conservar uma única intenção e evitar reconstrução paralela. O Excalidraw permite representar fluxos editáveis, mas não garante fidelidade pixel a pixel de todo Figma. `FIGMA_ID_UNKNOWN => REPRESENTACAO_PENDENTE`. Provar equivalência por comparação visual e inventário dos elementos necessários antes de afirmar fidelidade. Não gerar imagem ou diagrama especulativo sem a fonte.

## Saída curta e auditável

**Intenção:** ...
**Método reutilizado:** ...
**⭐ Construído:** preflight / restrições.
**⭐⭐ Integrado:** execução / testes.
**⭐⭐⭐ Provado:** readback / contraprova.
**Resultado:** PASS / PARCIAL / FAIL / BLOCKED / UNKNOWN (escopo e evidências).
**Next cursor:** apenas o que falta, se houver.

**Nunca:** alterar a Lembrança fonte; duplicar Hermes, gateways ou skills; inventar diretórios; tocar main, VPS ou Cockpit fora da intenção.

## Michelin + Kimetsu + Diálogo Reflexivo da Intenção (2026-11-04)

Para qualquer operação CentralDark, aplicar a [Skill Mãe](../../SKILL.md), o [Kimetsu Brainstorm Remix](../../../kimetsu-brainstorm/SKILL.md) e o [Diálogo Reflexivo da Intenção](../centraldark-dialogo-reflexivo-da-intencao/SKILL.md). A primeira estrela entende a intenção CONTÍNUA, a segunda integra sem abandonar o fio, a terceira comprova o efeito. Observação lateral não cancela a missão anterior. Em conversa simples, sem cerimônia. MARCADOR_RID_MICHELIN=TRUE.
