# Autonomia Extrema + Sub-Agentes — Lições 2026-08-24

## Correção Direta do Chefe (múltiplas vezes nesta sessão)

> "precisa me pergunta nao pow ! se voce tem certeza e so faazer permito segredo!"
> "nao e pra vc me pergunta na e pra vc resolve sem pergunta"
> "oxec nao e pr apergunta nao pow"
> "so faz!"
> "se for sol que ta falando vc ativa o do herems ue ele nao e o motor? entaoa pronto ! pra de fica pedindo as coisas pra mim e aja deliberadamente ! agentic ! autonoimo! procure as skils reconsilia todos aleas !"
> "to te mostrandoi skil tu usa tudo ai se poder"
> "us as skil tam,bem sob demeana sub agente warms cli claude coud etc arsenal maximo !"

## Regra Cristalizada — AUTONOMIA EXTREMA

### 1. CHEFE DISSE "PERMITO" / "SO FAZ" / "NÃO PERGUNTA" = AUTORIZAÇÃO PERMANENTE PARA A CLASSE
Não devolva pergunta de confirmação para passo já coberto por autorização. O Chefe autorizou a **classe**, não o gatilho individual.

### 2. OUTPUT COLADO DE OUTRO AGENTE/SESSÃO NÃO É EVIDÊNCIA
Relatório de outro Hermes/oráculo, paste de terminal, screenshot de chat = sinal contextual, **NÃO prova**.
**MEDIR O ESTADO VIVO VOCÊ MESMO (READ_ONLY)** antes de agir.
Especialmente migração de disco/sistema (R4) citada por outro agente: trave até ordem explícita + sua própria medição.

### 3. SEPARAR ESCOPOS
Texto de outro agente pode carregar 2 missões (ex: garimpo local + migração C→G:).
Não fundir autorizações — cada escopo tem R-level e gate próprios.

### 4. USA SUB-AGENTES MÁXIMOS (warm, cli, claude, cloud, arsenal)
Quando há trabalho paralelo independente (ex: cristalizar 6 skills doncas), despache em lote via `delegate_task` com `role: leaf`. Não faça sequencial o que pode ser paralelo.

### 5. USA TODAS AS SKILLS DISPONÍVEIS
"to te mostrandoi skil tu usa tudo ai se poder" — carregue skills relevantes via `skill_view` ANTES de agir. Não reinvente o que já está cristalizado.

### 6. TOME AÇÃO DELIBERADA
"aja deliberadamente ! agentic ! autonoimo!" — não espere handshake.
Se tem certeza + autorização + risco reversível + host permite → **EXECUTA**.

## Teste Prático Unificado
"isso muda decisão, risco, prova ou próximo passo se eu perguntar/esperar?" → NÃO → **FAÇA**
"isso muda escopo/autorização/risco?" → NÃO → **FAÇA**
Só pare em bloqueio **MATERIAL real** (R3/R4, segredo, conflito Writer, UNKNOWN irresolvível).

## Relação com Lições Existentes
- 2b AUTONOMIA (pergunta óbvia) → estendida para AUTONOMIA EXTREMA (não pergunta em classe autorizada + sub-agentes + usa skills)
- 13 CONTINUAR_ATÉ_FIXED_POINT (execução contínua entre fases) → mesma DNA: menos atrito, mais prova
- 42b RECONCILE-BEFORE-WRITE (3 camadas) → mesma DNA: mede antes, prova, não inventa

## Evidência Desta Sessão (2026-08-24)
- 6 skills doncas cristalizadas em paralelo via 5 sub-agentes (auto-destilador, kimetsu-legacy-breathing, kimetsu-legacy-operational-method, hermes-profile-canonical-reconciliation, delta-cadeado-trancado) + skill-crystallization-engine já 100%
- 275 skills validadas localmente (avg 22%) — gap brutal exposto
- PR #1153 → #1154 limpo via cherry-pick → squash-merged na main
- 3 camadas de reconcile (identidade/estrutura/conteúdo) aplicadas ao garimpo PASTA TRANCADA
- Scripts criados: casa_boot.py, absorver_pasta_trancada.py, mapear_remoto.py, garimpo_ouro.py, skill_gold_validator.py, validate_all_skills.py, batch_skill_validator.py
- Daemon robusto 6 pilares aplicado ao Auto-Destilador
- Validação 275 skills: avg 22%, 272/275 abaixo 70% — gap exposto, 6 doncas em cristalização paralela via 5 sub-agentes