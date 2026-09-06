# Handoff SOL (Jarvis do Segredo/Chefe) - CentralDark

## Missão
CENTRALDARK_PERSISTENT_ENGINE_RECONCILIATION_20260905

## Estado vivo (medido)
- MAIN SHA: f60ad71810fb9009bcc1a576d77305d61f9d1add
- PR #1444 (open, mergeable): HEAD fdc5515a1b865f0d81c665ecc66cd02d5eb0a71a
- Writer atual: Hermes Agent (sessão atual)
- Kanban Casa: ativo, 1320 cards, 1292 BLOQUEADO (commits zip)
- Hermes Desktop: v0.20.0, perfil default
- Cron jobs: listados em `hermes cron list` (morning briefing ok, scripts WSL falhando por falta de bash)
- VPS: sem acesso direto neste contexto; gates VPS travados por submodule .gitmodules ausente e .ci-housekeeping faltando
- Screenpipe: porta 3030 (presumida ativa)
- Garimpo local: pasta `_garimpo_medida/` com `inventory.json` e `chatgpt_turns.txt`
- BRAIN: notas em docs/BRAIN/07-APRENDIZADOS-MEMORIAS/ (alvos: GARIMPO-CHEFE-ONE-SITE-ONE-MCP-ONE-ADMIN.md pendente de criação)
- Skills: carregadas automaticamente per AGENTS.md e LEIA-ME-IA.md
- Contrato PR: pr-title-contract.yml exige título em maiúsculas com emoji
- Dependabot: workflow `dependabot-auto-merge.yml` (não listado aqui)
- ZORDs / MEGAZORD: não mapeados diretamente; capability router esperado em config

## Aprendizados persistidos (a cristalizar)
- ONE SITE, ONE MCP, ONE ADMIN (garimpo-chefe)
- ZERO SEGUNDO CÉREBRO
- REUSE_BEFORE_CREATE, ONE_SYSTEM_ONLY, NO_V2_V3_V4
- PAPAGAIO=OFF
- CLAIM_SEAL: prova não retorna sem causa nova
- META_LUPA: contraprova obrigatória
- FIXED_POINT: ciclo até exaustão (novos gaps=0)
- DETERMINISTIC_GATES: prova em VPS via canário read-only
- Handoff envelope: MISSION_ID, TASK_KEY, OWNER, HEAD_SHA, EXECUTION_TARGET, CAPABILITY, EVIDENCE_REFS, WRITER_LEASE, NEXT_CURSOR

## Próximos passos (cursor)
1. Corrigir .gitmodules (recuperar submodule skills/pretty-mermaid)
2. Garantir .ci-housekeeping (não criar manualmente; localizar owner existente)
3. Ajustar scripts WSL para usar git-bash nativo (C:\Program Files\Git\usr\bin\bash.exe)
4. Executar canário VPS read-only (ler HEAD, Kanban VPS, Hermes runtime)
5. Se canário PASS: transferir writer lease para VPS, colocar Casa em READ_ONLY_STANDBY
6. Após execução VPS: gerar receipts, registrar, selar claims
7. Voltar ao FIXED_POINT local, confirmar exaustão
8. Merge PR #1444 após CI verde (autonomia-promocao.yml)
9. Atualizar BRAIN com aprendizado deste handoff
10. Registrar receipt em issue-mãe #604

## Evidências coletadas
- Output de `hermes cron list`
- Output de `gh pr view 1444`
- Estado do workspace (untracked files list)
- Kanban visão (via descrição anterior)
- Lista de habilidades e config implícita

## Contradições verificadas
Nenhuma contradição material encontrada entre:
- Intenção do CHEFE (reconciliação persistente)
- Estado do PR #1444 (open, mergeable)
- Estado do main (f60ad71810fb9009bcc1a576d77305d61f9d1add)
- Requisitos de título (corrigido para emoji + maiúsculas)
- Requisitos de prova (não refazer prova já selada)

## Próximo comando sugerido
`git add HANDOFF_SOL.md && git commit -m "chore(handoff): adicionar handoff SOL para reconciliação persistente" && git push origin pr-1444`

