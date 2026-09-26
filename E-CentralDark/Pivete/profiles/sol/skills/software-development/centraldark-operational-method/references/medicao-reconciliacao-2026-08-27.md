# Medição e Reconciliação — Padrão Pivete (2026-08-27)

Anotado de sessão real onde o CHEFE corrigiu o método repetidas vezes. Regra não é
sugestão: é como a Casa opera.

## 1. MEDIR ANTES DE PERGUNTAR

> "Antes de perguntar ao CHEFE, descobrir tudo que as ferramentas disponíveis conseguem medir."

- Ao receber intenção, rodar TODAS as ferramentas alcançáveis (terminal, gh, curl, find,
  read_file) ANTES de devolver qualquer pergunta.
- O que não alcança (ex: VPS sem SSH/MCP) = UNKNOWN, não palpite, não pergunta "tem como".
- Nunca misturar estado antigo com estado atual: `HISTORY != CURRENT_STATE`. Re-medir.

## 2. PALPITE NÃO É MEDIÇÃO

> "acho", "parece", "provavelmente", "já estava", "foi feito" não substituem medição.

- Toda claim precisa de evidência observável: `git rev-parse`, `gh api`, `curl -w %{http_code}`,
  `ls`, `grep` no dono real.
- Screenshot/painel/cor = evidência observacional, NÃO runtime proof.
- UNKNOWN != PASS. ACTION != PROOF. DOCUMENTED != EXECUTED. SPEC != IMPLEMENTATION.

## 3. NÃO CRIAR SEGUNDO CÉREBRO / V2 / OUTRO ROUTER

- `REUSE_BEFORE_CREATE`, `ONE_OWNER_PER_CAPABILITY`, `ABSORB_BEFORE_DUPLICATE`.
- Issue #722 (CONVERGÊNCIA OMNIROUTE) proíbe: outro painel, outro router, outro desktop,
  outro grafo, outro vault, outro produto. Tudo vira rota do MESMO produto.
- PR #1172 violou isso (medido): criou `MASTER-CYCLE.yml` + `centraldark_master_cycle.py`
  ao lado do `trigger-fabric` existente, e pasta `APRENDIZADOS/` ao lado do `APRENDIZADOS.md`.
- `mergeable: true` do GitHub NÃO prova reconciliação com a intenção. Git só vê conflito de
  texto; arquitetura (segundo dono) passa limpo. Quem bloqueia era o contrato
  (CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json → `mandatory_pre_solution_sequence` passos
  3/5/9/10), mas não havia gate de CI consumindo ele.

## 4. FALHAS TÍPICAS DE PR (padrão #1172)

- FALHA 1: colisão sem reconciliação — N PRs no mesmo núcleo (TRIGGERS.yml,
  ENGINE_BINDING.yml, GraphRAG-Master/agent.mjs), zero Writer único.
- FALHA 2: mecanismo novo em vez de reusar owner existente (MASTER-CYCLE vs trigger-fabric).
- FALHA 3: dono duplicado que JÁ EXISTIA e funcionava (APRENDIZADOS/ pasta vs APRENDIZADOS.md
  arquivo) — PR reforçou o duplo, não consertou.

## 5. HUMAN FRONTIER REAL (parar e perguntar)

> "CHEFE, existe autorização para remover uma proteção deliberada?"

É fronteira humana, não "qual ferramenta usar":
- `chattr -i` (remover imutável de arquivo do Hermes) — parar.
- `git rebase --abort` em VPS com produção ao vivo — medir, snapshot, esperar ordem.
- Deploy / restart / reset / force-push / rm -rf — só com ordem literal do CHEFE.
- `SEGREDO/CHEFE` = autoridade final. ANTECIPACAO != AUTORIZACAO.

## 6. ESTILO DE RESPOSTA (correções do CHEFE)

- Baianês direto, não tabela corporativa (a não ser que peça).
- SEMPRE caminho clicável (`E:\CentralDark\...\arquivo.md`) quando citar arquivo/pasta.
- Sem opinião quando a intenção é medir — entregar só o que as ferramentas provaram.
- SOUL travado em disco (profile pivete, locked) sobrevive troca de modelo; motor é
  substituível, papel não muda.
- Metáfora (Moisés/Josué, tábuas, rio) é crônica baianê+bíblica AUTORIZADA, mas claim
  técnica tem que sobreviver fora dela (invariante do contrato).
