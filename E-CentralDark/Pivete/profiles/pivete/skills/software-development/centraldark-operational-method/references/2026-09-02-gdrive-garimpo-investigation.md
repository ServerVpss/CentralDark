# Investigação Google Drive + Garimpo-Chefe — 2026-09-02

## Google Drive — Estado Real Medido

| Componente | Status | Evidência |
|------------|--------|-----------|
| Código no repo CentralDark | ❌ ZERO | `search_files` para `drive`, `google`, `gdrive` → 0 resultados |
| Cron jobs perfil Pivete | ❌ VAZIO | `E:\CentralDark\Pivete\profiles\pivete\cron\` só tem `output/` vazia |
| OneDrive local (`E:\CentralDark\OneDrive\`) | ❌ NÃO É GOOGLE DRIVE | OneDrive pessoal Windows (Documentos, Imagens, Desktop, etc.) |
| Integração real | 🟡 SÓ VIA CHAT | Agente usou tool nativa `Google Drive` do Hermes para escrever `DELTAUNIFICADOCENTRALDARK.md` — **manual, pontual, não automático** |

## Cognição/Aprendizado Fixado — Onde Fica

| Camada | Local | Função |
|--------|-------|--------|
| Memória Hermes (perfil pivete) | `E:\CentralDark\Pivete\profiles\pivete\memories/` + `state.db` | Persistente, local, **não sai da Casa** |
| GitHub (PR #1381) | Commits RANDOLF | Rastro auditável, genealógico, versionado |
| Google Drive | Backup/espelho opcional | **Não é fonte primária** — só redundância/leitura humana |

**Regra canônica:** `CASA PRIMEIRO → GITHUB REGISTRA → VPS POR ÚLTIMO`
- Google Drive **não está nessa cadeia** como camada obrigatória
- Drive = opcional, só para redundância/leitura humana

## Garimpo-Chefe — Investigação Completa

| Item | Status |
|------|--------|
| Pasta existe | ✅ `E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE\` |
| É perfil Hermes completo | ✅ Tem `.agents/skills/`, `.env`, `.claude/`, `.codex/`, `.cursor/`, `.cache.zip` (1.5GB) |
| Ligado ao CentralDark canônico | ❌ **NÃO** — instalação isolada/paralela |
| Ligado ao perfil Pivete ativo | ❌ **NÃO** — perfil ativo: `C:\Users\danda\AppData\Local\hermes\profiles\pivete` |
| Tem skills do repo | ⚠️ Parcial — só 3 skills genéricas (`debugging-code`, `owasp-security`, `skill-creator`) |

### Perfil Canônico Real
```
C:\Users\danda\AppData\Local\hermes\profiles\pivete\
```
- Validado por `casa_boot.py` (canonical_sha256=`a7785bc...`, status=OK)
- Tem SOUL.md correto
- É o que o Hermes Desktop usa de verdade

### Ação Recomendada para Garimpo-Chefe
**Arquivar** (recomendado): Mover para `_forense/garimpo-chefe-backup-20260902/` — preserva histórico, remove da ativa

## Se Quiser Integração Drive Real (Automação)

Criar no repo (owner único, PR #1381):
```
apps/modulos/gdrive-sync/
├── sync.py           # push/pull seletivo (só artifacts consolidados)
├── filters.py        # SECRET_SCRUB + só FIXED_POINT promovidos
├── cronjob.yaml      # agendado, readonly por default
└── tests/
```

**Critérios do usuário ("sem tirar atenção da CentralDark"):**
- ✅ Read-only por default — nunca escreve no Drive sem autorização explícita
- ✅ Só promove CONSOLIDATED_BASELINE — nada de rascunho, chat, UNKNOWN
- ✅ Filtra segredos — `SECRET_SCRUB_BEFORE_EMBEDDING=true`
- ✅ One-way (Casa → Drive) — Drive nunca vira Writer de volta
- ✅ Gate de promoção — `PROMOTION_WITHOUT_PROOF=false`