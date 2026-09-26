# Teste Real — Multi-Source Read-Only + Google Drive Export (2026-09-02)

## Contexto
Sessão de validação do método **Multi-Source Read-Only** com pipeline cognitivo nativo (`#ACORDAR → !CALIBRAR → !RECONCILIAR → !DELTAUTIL → !CONTRAPROVA → !FIXED_POINT`) e integração Google Drive via skill `google-drive-document-handling`.

## Missão
- **ID**: `msr-20260902-001` (teste) + `drive-test-001` (Drive export)
- **Intenção**: `absorver delta do Drive DELTAUNIFICADOCENTRALDARK.md`
- **Destino canônico**: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md`

## Pipeline Executado (test-001)

| Fase | Status | Evidência |
|------|--------|-----------|
| #ACORDAR | ✅ | SOUL.md não encontrado — prosseguiu; writer_scope: `general` |
| !CALIBRAR | ✅ | 4 fontes `CURRENT_PROVEN`: Git (SHA `0542cee`), GH (PRs #1393, #1381), Runtime (porta 3030 UP), Local (3 arquivos) |
| !RECONCILIAR | ✅ | Cross-check OK; classificados: `CURRENT_PROVEN: 4` |
| !DELTAUTIL | ✅ | Owner `DELTA-CONTINUO.md` existe no `origin/main` (verificado via `git ls-tree`) |
| !CONTRAPROVA | ⚠️ FAIL | `node --test` skipped (no test script); Reality Judge: portas 8099/8788/9119 DOWN |
| !FIXED_POINT | ✅ | Receipt salvo READ_ONLY: `runtime/receipts/test-001.json` |

## Google Drive Export (drive-test-001)

| Item | Detalhe |
|------|---------|
| **URL** | `https://docs.google.com/document/d/1ZFhlcoPclDuNPXtD4FSfq4_Zfyb4L0vwBAcselkyC_E` |
| **Arquivo** | `DELTAUNIFICADOCENTRALDARK.md` |
| **Auth** | ❌ 401 Unauthorized (documento privado) |
| **Soluções** | 1) `gdrive download --format pdf <file_id>` (OAuth) 2) Browser: File → Download → PDF 3) Compartilhar "Anyone with link can view" |
| **Script** | `scripts/drive_readonly_export.py` — usa `pymupdf` + `python-docx` + normalização UTF-8 + SHA256 + comparação com `origin/main` |

## Conteúdo Extraído do Drive (via HTML do painel)
```
🔁 Loop de Auto-Ingestão + gates de provenance
REGISTRA / CRISTALIZA / GUARDA ESSA PEÇA
Visual Naming Registry
🔥 !BOOT-FORJA-TOTAL + Fixed-Point Runner
🔥 Forja Viva / temperatura / respirações
😈 identidade visual "Capetinha da Forja"
Dependabot → mesmo runner, sem segundo cérebro
regras rígidas de teste, contraprova e Fixed Point
```

## Delta Esperado no DELTA-CONTINUO.md
- `auto_ingestion_loop` — gates de proveniência obrigatórios
- `boot_forja_total` — comando único inicia forja + fixed-point runner
- `forja_viva` — estado com temperatura + respirações (Kimetsu)
- `visual_identity` — "Capetinha da Forja"
- `dependabot_same_runner` — sem segundo cérebro (regra Casa)
- `test_contraprova_fixed_point` — regras rígidas obrigatórias

## Regras Reforçadas
1. **Owner canônico = DELTA-CONTINUO.md** — NÃO criar `DELTAUNIFICADOCENTRALDARK.md` (não existe em git/disco)
2. **READ_ONLY FIRST** — pipeline completo sem mutação
3. **Contraprova real exige runtime UP** — portas 8099/8788/9119 são gate
4. **Drive privado = 401** — precisa auth antes de processar
5. **Single panel HTML** — painel status atualizado em `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\😈CentralDark Status😈.html`

## Scripts Criados
- `skills/centraldark/centraldark-multi-source-readonly/scripts/centraldark_multi_source_readonly.py` — pipeline cognitivo completo
- `skills/centraldark/centraldark-multi-source-readonly/scripts/drive_readonly_export.py` — export Drive read-only

## Próximos Passos (Pendentes)
1. Baixar PDF do Drive manualmente (browser/gdrive OAuth)
2. Rodar `drive_readonly_export.py --local-file <pdf> --destino DELTA-CONTINUO.md`
3. Comparar hash com `origin/main:DELTA-CONTINUO.md`
4. Se delta útil → preparar PR com writer único
5. Subir runtime (8099, 8788, 9119) → contraprova PASS → FIXED_POINT real
6. Quando GitHub voltar: localizar owner real do bot/Hermes → PATCH IN PLACE → PR existente