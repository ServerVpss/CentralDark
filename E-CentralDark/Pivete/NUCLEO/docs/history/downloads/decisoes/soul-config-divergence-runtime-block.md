# SOUL/CONFIG DIVERGENCE — RUNTIME BLOCK PATTERN
*Sessão 2026-08-22 — Padrão validado quando runtime ativo lê de caminho divergente do canônico*

---

## Contexto
Durante reconciliação tri-root, detectado que **dois arquivos de identidade/config** existem em caminhos diferentes com versões divergentes:
- **Canônico (E:\CentralDark\Pivete\)** — versão atual, autorizada pelo CHEFE
- **Runtime Ativo (C:\Users\danda\AppData\Local\hermes\profiles\pivete\)** — versão antiga, lida pelo Hermes TUI em execução

| Arquivo | Canônico | Runtime | Diferença Crítica |
|---------|----------|---------|-------------------|
| `SOUL.md` | HERMES-CASA, `PIVETE_COMO_IDENTIDADE_DO_HUMANO=NAO`, 09/08 | HERMES legacy, `PIVETE_E_O_USUARIO_REAL=SIM`, 05/08 | Identidade, autoridade, papel |
| `config.yaml` | `z-ai/glm-5.2`, provider `nous` | `gpt-5.5`, provider `openai-codex` | Modelo, provider, auth |

---

## Regra de Ouro: CONTRA PROVA DE DEPENDÊNCIA ATIVA BLOQUEIA MOVIMENTO

```text
SE runtime Hermes LÊ ATIVAMENTE do caminho UserProfile (AppData\Local\hermes\profiles\pivete):
  → NÃO MOVER (quebraria o runtime atual)
  → NÃO QUARENTENAR (mesmo efeito)
  → DOCUMENTAR DIVERGÊNCIA em MANIFEST.jsonl + NUCLEO decisions
  → CLASSIFICAR: DOCUMENTED_DIVERGENCE (não QUARANTINE)
  → RESOLUÇÃO FUTURA: Migração unificada quando CHEFE autorizar Hermes Desktop + SOL_SOUL
```

---

## Por que isso acontece
O Hermes Agent armazena configuração e SOUL do profile em:
```
%LOCALAPPDATA%\hermes\profiles\<profile_name>\
  ├── SOUL.md
  ├── config.yaml
  ├── state.db (memória persistente)
  ├── memory_store.db
  └── ...
```

Enquanto o **repositório canônico** (GitHub + E:\CentralDark\Pivete) mantém a versão **fonte da verdade** que é sincronizada via workflows/manual.

A divergência surge quando:
1. CHEFE atualiza SOUL/config no canônico (ex: nova versão HERMES-CASA)
2. Hermes runtime **não recarrega automaticamente** — continua lendo do AppData
3. Próxima sessão carrega SOUL do canônico, mas runtime usa AppData

---

## Detecção Automatizada (Checklist)

```bash
# 1. Comparar hashes
sha256sum /e/CentralDark/Pivete/SOUL.md
sha256sum "/c/Users/danda/AppData/Local/hermes/profiles/pivete/SOUL.md"

# 2. Verificar qual o runtime usa (logs de boot mostram path)
grep -r "SOUL" /c/Users/danda/AppData/Local/hermes/profiles/pivete/logs/

# 3. Confirmar dependência ativa
# Se Hermes estiver rodando → AppData é caminho ativo
```

---

## Documentação Obrigatória (MANIFEST.jsonl)

```jsonl
{"timestamp":"2026-08-22T22:21:00-03:00","source":"E:/CentralDark/Pivete/SOUL.md (canonical) vs C:/Users/danda/AppData/Local/hermes/profiles/pivete/SOUL.md (runtime)","destination":"DOCUMENTED_DIVERGENCE","classification":"DUPLICATE_DIVERGED","reason":"Runtime uses UserProfile SOUL (older, PIVETE_E_O_USUARIO_REAL=SIM), Canonical is E: (newer, HERMES-CASA, PIVETE_COMO_IDENTIDADE_DO_HUMANO=NAO)","canonical_counterpart":"E:/CentralDark/Pivete/SOUL.md","dependency_check":"BLOCKED - Hermes runtime reads from UserProfile path","rollback_path":"N/A - no move, divergence documented only"}
```

---

## Resolução Futura (Quando Autorizado)

Quando CHEFE autorizar **Hermes Desktop + SOL_SOUL**:

1. **Unificar SOUL** → versão canônica única (HERMES-CASA evoluído para SOL_SOUL)
2. **Migração de profile** → Hermes Desktop usa novo local de config (ex: `E:\CentralDark\Pivete\.hermes\profiles\sol\`)
3. **Depreciar AppData\Local\hermes\profiles\pivete** → backup + remover
4. **Validar** → nova instância carrega SOUL unificado, zero divergência

---

## Lição de Ouro
**Nunca assuma que "arquivo mais novo = arquivo usado".** O runtime dita a autoridade de leitura. Contraprova de dependência ativa (processo rodando, lendo o caminho) **sempre vence** intenção de limpeza/organização.

> "PATH != AUTHORITY, NAME != AUTHORITY, LAST_MODIFIED != AUTHORITY" — mas **RUNTIME_READ_PATH == AUTHORITY_EFETIVA**

---

## Padrões Relacionados
- `references/tri-root-inventory-legacy-freeze.md` — metodologia tri-root completa
- `references/mcp-local-bootstrap.md` — bootstrap de serviços locais
- `references/centraldark-soul-identity.md` — identidade HERMES-CASA vs SOUL da SOL