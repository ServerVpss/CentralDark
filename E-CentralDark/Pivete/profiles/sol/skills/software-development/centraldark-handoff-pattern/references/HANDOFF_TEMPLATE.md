# HANDOFF_TEMPLATE.md — Padrão de handoff para ChatGPT

Status: CANÔNICO (padrão de sessão, não projeto)
Atualizado: 2026-09-01
Owner: Casa (Hermes-Casa + SEGREDO/CHEFE)
Consumidor final: conversa ChatGPT do CHEFE

---

## Como usar

Preencha os campos com o que tem. Se falta material, é OPEN_GAPS, não inventado.
Se não conseguiu verificar zero regressão ou aplicar Meta Lupa, deixa como pendente
ou UNKNOWN, não afirma "provado".

Nada de inventar tab por tab, conteúdo de Drive/Figma/Slack, ou triagem de conteúdo
que não se tem acesso. Só o que se tem de fato + lacunas explícitas.

---

## Template

```
=== HANDOFF CHATGPT ===

MEASURED_AT: <data/hora da medição atual, UTC>

CENTRALDARK_BRANCH: <branch da sessão>
CENTRALDARK_HEAD: <HEAD da sessão>

ACTIVE_PR:
  - <PR 1: título, branch, state, owner_vivo_declarado_pelo_chefe, writer_unico,
      head_informado_pelo_chefe, head_remoto_medido, ci, travas_declaradas>
  - <PR 2: ...>

WRITER_SCOPE: <escopo de escrita; se não declarado, NÃO_DECLARADO>

NOTEPAD:
  - WINDOWS_FOUND: <existe/does_not_exist/não_medido>
  - TABS_FOUND: <número de tabs mineradas ou não_medido>
  - UNSAVED_TABS: <detectado/não_medido>
  - FILE_BACKED_TABS: <detectado/não_medido>
  - mineracao_declarada: <120 arquivos .bin, 42 tabs, 4.641 linhas, 3 sensíveis
    (declarado pelo chefe; a agente não tem acesso ao conteúdo para filtrar)>
  - OBS: <a mineração é declarada pelo chefe; a triagem útil vs lixo não foi feita
    por mim (sem acesso ao conteúdo)>

DEDUPED_ITEMS: <não_medido_agora/número>
SENSITIVE_QUARANTINED: <número declarado pelo chefe ou não_medido>
HISTORICAL_ITEMS: <não_medido_agora/número>
CURRENT_CANDIDATES: <não_filtrado_agora/número>
FORMAT_VERIFIED: <não/sim/não_medido>

CURRENT_FACTS:
  - repo local: <caminho>
  - branch atual: <branch>
  - HEAD local: <sha>
  - dirty: <M arquivo, ?? untracked ou limpo>
  - remote main HEAD: <sha>
  - local main HEAD: <sha>
  - gatilhos fixos mapeados: <#ACORDAR, !CALIBRAR, !MULTIBUSSOLA, #CRISTALIZAR, #FABLE_LOOP>
  - protocolo_declarado_pelo_chefe: <5 frentes, Figma+Slack como apoio, consumidor
    final ChatGPT do chefe, Hermes prepara inteligência, chefe decide quando entrega,
    Meta Lupa antes de concluir>
  - owners_confirmados_pelo_chefe: <session-intelligence-harvester, knowledge-compiler,
    meta-lupa, PR #1381>
  - regras_declaradas_pelo_chefe: <REUSE_BEFORE_CREATE, ONE_SYSTEM_ONLY,
    PARALELIZE_PERCEPCAO, SERIALIZE_MUTACAO, LOCAL_REALITY = JUDGE,
    HISTORICAL != CURRENT, UNKNOWN != PASS, DOCUMENTED != EXECUTED,
    NÃO INVENTAR NOVA ARQUITETURA, ZERO REGRESSÃO NO QUE JÁ EXISTE,
    PEGA TUDO ÚTIL, NÃO DEIXA LIXO, NÃO COPIA BESTEIRA,
    PR_1381_MENSAGEM: "agreguei o útil...">

OBSERVED_EVIDENCE:
  - serviços medidos agora: <Screenpipe :3030 HTTP 200, outros sem resposta no
    probe curto — status pontual, não permanente>
  - python funcional: <caminho do venv do Hermes>
  - classificacao_rastro_anterior (execução anterior, sem reprocessar agora):
    <14.252 itens, 8.790 SHAs únicos, 2.875 grupos duplicados, 8.337 linhas
    DUPLICATE, 62 SENSITIVE_QUARANTINE, 5.877 HISTORICAL_REFERENCE,
    CURRENT_CANDIDATE=0; hash SHA256: 514d4ce7ae4cd2a07c26fe910f1efa52122f6000da181d07c464e48716da2483>
    OBS: esse número é proveniência de execução anterior; se usado, registrado como
    HISTORICAL ou revalidado, não CURRENT_LIVE

SUPERSEDED_HISTORY:
  - <CENTRALDARK_HANDOFF.md (2026-08-28): afirmações de Notepad LocalState (2 janelas,
    30 abas) — INVALIDADAS porque LocalState não existe mais nesse ambiente (mudança
    real de ambiente)>
  - <"NENHUMA CONTRADIÇÃO ENCONTRADA" (handoff anterior) — INVALIDADO>
  - <Screenpipe :3030: registros intermediários citavam 403; medição agora 200 →
    mudança de runtime (pontual, não permanente)>
  - <classificação_rastro: números são proveniência de execução anterior; não
    reprocessado agora → se usado, deve ser HISTORICAL ou revalidado, não CURRENT_LIVE>

OPEN_GAPS:
  - <Notepad content: não tenho acesso ao conteúdo das 42 tabs / 4.641 linhas para
    filtrar útil vs lixo>
  - <HEAD da89bb30: NÃO CONFIRMADO localmente neste ciclo (timeouts); tratado como
    declaração do chefe, não igualado a prova local>
  - <CI para PR #1381: UNKNOWN (sem workflow runs associados ao HEAD informado)>
  - <Drive content: sem material agora; sem skill carregado/aplicado neste ciclo →
    UNKNOWN>
  - <Figma/Slack content: URLs registradas pelo chefe; sem acesso/browser tool;
    apenas referência de coordenação>
  - <Outras arquiteturas/owners nomeados pelo chefe: sem leitura real de todos agora>
  - <Filtro útil vs lixo: não feito por mim>
  - <Zero regressão: não testado contra o que já existia antes>
  - <Meta Lupa contraprova: não aplicada por mim agora>

CONTRADICTIONS:
  - <Notepad LocalState: handoff anterior afirma existia; medição agora NAO_EXISTE →
    SUPERSEDED_HISTORY>
  - <Screenpipe :3030: registros intermediários citavam 403; medição agora 200 →
    mudança de runtime (pontual)>
  - <CRÍTICA (a agente): "estado recebido e compreendido" + pergunta = PLANO; o modo
    exige HANDOFF_COMPLETO, BLOCKER_REAL ou DECISAO_HUMANA_MATERIAL>

IPNAMES_DELTA: <VAZIO se sem correlação observável útil comprovada>

UNKNOWN:
  - <conteúdo real das 42 tabs / 4.641 linhas mineradas>
  - <critério de "útil" vs "lixo">
  - <HEAD da89bb30 (informado pelo chefe) — NÃO CONFIRMADO localmente>
  - <CI para PR #1381>
  - <Drive content>
  - <Figma/Slack content>
  - <outras arquiteturas/owners nomeados pelo chefe (sem leitura real de todos agora)>
  - <Meta Lupa contraprova aplicada (não aplicada por mim agora)>
  - <Writer declarado para escopo de escrita final (não declarado nesta sessão)>

NEXT_SAFE_ACTION:
  - <O que falta para não repetir o erro de "plano": entregar handoff completo,
    blocker real ou decisão humana material — não devolver "estado + pergunta">
  - <Para filtrar útil vs lixo: precisa do critério + acesso ao conteúdo das 42 tabs /
    4.641 linhas — sem inventar o que minhei ou o que é útil>
  - <Para zero regressão real: testar com o que já existe antes de afirmar — sem
    inventar "provado">
  - <Para contraprova real (Meta Lupa): derrubar cada claim antes de fechar — sem
    inventar que fiz>
  - <Escrita somente com Writer declarado + escopo autorizado + sem colisão>
  - <Se faltar material: blocker real, não inventar>

=== END HANDOFF ===

NOTA_DE_TRANSMISSAO: <Este handoff é o observável REAL agora (medido) + declarações
do chefe marcadas como declarado_pelo_chefe + lacunas explícitas como
OPEN_GAPS/UNKNOWN para o que a agente NÃO TEM ACESSO. Nada foi inventado. Se falta
conteúdo específico (Notepad, critério de filtro, etc.), o que falta é real — não
inventado.>
```

---

## Regras do template (hard rules)

1. Nada inventado. Se falta material, é OPEN_GAPS.
2. Lacunas explícitas: UNKNOWN, OPEN_GAPS, SUPERSEDED_HISTORY.
3. Handoff completo, BLOCKER REAL ou DECISÃO HUMANA MATERIAL — nunca plano.
4. Filtro útil vs lixo: só entra o útil; lixo fica fora.
5. Zero regressão: verificar que nada que já funcionava quebrou. Se não verificado,
   registrar como pendente/UNKNOWN.
6. Meta Lupa / contraprova antes de fechar. Se não aplicada, registrar como pendente.
7. Consumidor final = ChatGPT do CHEFE. Figma/Slack = só apoio, não destino.
8. Writer único por escopo. PR #1381 é owner vivo do escopo de reconciliação
   fixed point.
9. Gatilhos fixos mapeados e carregados, não inventados.
10. Escrever direto, sem montar, sem emoji inventado, sem papagaio.
