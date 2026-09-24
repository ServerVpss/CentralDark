---
title: "BRAIN ARTIFACT CAPTURE — Captura Universal de Conhecimento"
date: 2026-09-24
status: "CANONICAL_RUNTIME_CONTRACT"
pr_mother: 1562
child_pr: 1662
authority: "SEGREDO/CHEFE"
canonical_rule: "REGRA-ZERO-CENTRALDARK"
truth_rule: "REALIDADE_IS_JUDGE"
owners:
  - "apps/bot-telegram/skills/externas/artifact-ingest.cjs"
  - "apps/bot-telegram/skills/core/consciousness.cjs"
  - "apps/bot-telegram/unified-bot.cjs"
  - "apps/modulos/hub"
  - "docs/BRAIN/08-ARTEFATOS-VISUAIS"
  - "docs/BRAIN/09-ARTEFATOS"
---

# 🧠 BRAIN ARTIFACT CAPTURE — Captura Universal de Conhecimento

> Guardar, indexar, provar e linkar — não executar automaticamente.

## 1. Propósito

`BRAIN_ARTIFACT_CAPTURE` é o contrato para transformar qualquer arquivo recebido por bot, Hub, API, Google Drive ou outro conector autorizado em artefato de conhecimento vivo.

A CentralDark deve preservar o artefato, registrar origem, calcular hash, criar sidecar `.md`, atualizar manifest e ligar o conteúdo ao BRAIN/HUB sem executar o arquivo automaticamente.

```text
ARTEFATO_RECEBIDO
→ CLASSIFICAR
→ SALVAR_BYTES
→ SHA256
→ SIDECAR_MD
→ MANIFEST
→ LINKS
→ HUB_INDEX
→ CI/CD
→ VPS_KNOWLEDGE_RUNTIME
```

## 2. Regra de segurança

```text
GUARDAR != EXECUTAR
ARQUIVO_GUARDADO != ARQUIVO_SEGURO
EXE_STORED != EXE_ALLOWED_TO_RUN
HTML_STORED != HTML_TRUSTED
JS_STORED != JS_ALLOWED_TO_RUN
UNKNOWN != PASS
REALIDADE_IS_JUDGE=true
```

`.exe`, `.js`, `.html`, `.css`, `.zip` e qualquer binário são armazenados como conhecimento, com hash e sidecar, mas não são executados pelo runtime.

## 3. Tipos aceitos

```text
TEXT: .txt .md .markdown .json .csv .log .yaml .yml .css .html .js .ts
IMAGE: .png .jpg .jpeg .webp .gif .svg
DOC: .pdf .docx .xlsx .pptx
ARCHIVE: .zip .tar .gz .7z
BINARY: .exe .dll .bin .msi .apk .deb .rpm
UNKNOWN: qualquer extensão não mapeada
```

## 4. Destino canônico

```text
docs/BRAIN/09-ARTEFATOS/YYYY-MM-DD/<slug>/<arquivo-original>
docs/BRAIN/09-ARTEFATOS/YYYY-MM-DD/<slug>/artifact.md
docs/BRAIN/09-ARTEFATOS/YYYY-MM-DD/<slug>/manifest.json
```

## 5. Sidecar obrigatório

Cada artefato deve ter uma nota lateral `artifact.md` com:

```text
# Artefato: <nome>

Tipo: <mime/extensão>
Tamanho: <bytes>
SHA256: <hash>
Origem: <telegram|hub|api|google-drive|manual>
Canal: <quando aplicável>
Data: <ISO timestamp>
Status: STORED_NOT_EXECUTED
Execução: NÃO
Preview: <safe preview quando texto/imagem>
Links: [[CentralDark]], [[BRAIN]], [[Artifact Ingest]]
```

## 6. Manifest obrigatório

`manifest.json` deve preservar:

```json
{
  "schema": "centraldark.brain.artifact.v1",
  "status": "STORED_NOT_EXECUTED",
  "execution_allowed": false,
  "sha256": "...",
  "source": "...",
  "created_at": "...",
  "files": []
}
```

## 7. Integrações

- Telegram: documentos, fotos, vídeos, textos e arquivos devem cair no mesmo pipeline.
- Hub/API: upload e ingestão devem chamar o mesmo owner, sem rota paralela.
- Google Drive: arquivos vindos do Drive entram como `source=google-drive` quando o conector autorizado fornecer bytes/metadata.
- CI/CD: artefatos promovidos viram conhecimento versionado apenas depois de gates.
- VPS: mantém a cópia viva, indexável e consultável.

## 8. Critério de aceite

```text
SHA256_REQUIRED=true
SIDECAR_MD_REQUIRED=true
MANIFEST_REQUIRED=true
NO_AUTO_EXECUTION=true
HUB_ROUTE_REUSES_ARTIFACT_INGEST=true
BOT_ROUTE_REUSES_ARTIFACT_INGEST=true
GOOGLE_DRIVE_ROUTE_REUSES_ARTIFACT_INGEST=true
CI_CD_DECIDES_PROMOTION=true
```

## 9. Frase canônica

> O que a humanidade aprende não pode morrer na janela de uma IA.

> Tudo que entra é preservado, indexado, provado e ligado. Nada executa sem autorização. Nada vira verdade sem prova.
