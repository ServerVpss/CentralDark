# 👑🪬 BUSCA — padrão operacional / owners existentes

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Objetivo

Extrair o método usado na sessão e torná-lo reutilizável por qualquer agente sem criar arquitetura paralela.

## Owners encontrados

- CENTRALDARK_AI_BOOT.yaml
  boot único da Casa.

- docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/
  contém ARCHITECTURE, CONTRACT, MASTER-CYCLE, TRIGGERS, MEGAZORD, PERSISTENT-AUTONOMOUS-ZORDS, PERSISTENT-SWEEP-CONTRACT e UNIVERSAL-ENGINE-METHOD.

- scripts/lupa/validar-continuidade-global.mjs
  já exige invariantes como:
  REUSE_BEFORE_CREATE,
  CONTINUE_BEFORE_RESTART,
  ONE_OWNER_PER_CAPABILITY,
  ONE_WRITER_PER_SCOPE,
  PARALLELIZE_PERCEPTION,
  SERIALIZE_MUTATION,
  REALITY_IS_JUDGE.

- docs/CONSCIENCIA/REGRA-COMITE-DELTA-CONTINUO.md
- docs/CONSCIENCIA/COMITE-OFICIAL-SEGREDO-CHEFE.md
  owners de comitê/conselho.

- .agents/skills/centraldark-operational-method/
  método operacional existente.

- docs/SEGURANCA/ADM-INVENTARIO-COMANDO-UNIVERSAL.md
  writer lease + multi-reader + percepção paralela/escrita serializada.

- apps/modulos/HERMES-CORE/
  executor canônico.

- apps/modulos/elite-gateway/RELATORIO-ECOSSISTEMA.txt
  documenta grupo-evolucao com 5 agentes debatedores e endpoint de health MCP na VPS.

## Veredito

NEW_OPERATIONAL_FRAMEWORK=false.
EXTEND_EXISTING_OWNERS=true.
ONE_SYSTEM_ONLY=true.

O padrão desta sessão deve ser costurado no Boot + Trigger Fabric + Operational Method + Committee + HERMES, e não nascer como outro motor.

## Padrão extraído da sessão

HUD_FIRST
→ CURRENT_STATE
→ PARALLEL_READ_ONLY_MEASUREMENTS
→ CLASSIFY FACT/HYPOTHESIS/UNKNOWN
→ REUSE_OWNER
→ CRYSTALLIZE_BEFORE_NEXT_MATERIAL_SEARCH
→ ONE_WRITER
→ MINIMAL_MUTATION
→ COUNTERPROOF
→ PDF_HORN_GATE
→ RUNTIME_T1
→ REALITY_JUDGE
→ RECEIPT
→ FIXED_POINT_OR_NEXT_CURSOR.

Erros observados viram regra apenas quando existe evidência concreta e owner apropriado.

## NEXT_CURSOR

Ler owners canônicos acima + localizar implementação atual PDF/Horn e Council/Telegram antes de mutar.
