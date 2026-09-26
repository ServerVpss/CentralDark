# External File Reconciliation — Padrão para Arquivos Externos vs Canônico

**Cenário:** Um arquivo chega de fora (Telegram, email, download, paste de outro agente/IA) alegando ser "o padrão da Casa" ou "o contrato atual". Precisamos verificar se **melhora** ou **conflita** com o canônico.

---

## Gatilho
- Usuário cola/entrega arquivo: "verifica se isso melhora ao padrão da casa"
- Paste de contrato/SOUL/config de outra sessão/agente
- Download de arquivo alegando ser canônico

---

## Metodologia (3 Camadas — DNA REUSE_BEFORE_CREATE)

| Camada | Fonte Canônica | Ferramenta | O que medir |
|--------|----------------|------------|-------------|
| **1. IDENTIDADE** | `LEIA-ME-IA.md` + `SOUL-SOL.md` + `CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` (local Casa) | `read_file` + parse JSON | Autoridade, status, schema_version, contract_id, regras núcleo |
| **2. ESTRUTURA** | `origin/main` (GitHub remoto) | `git ls-remote`, `git show origin/main:<path>`, `gh api` | HEAD remoto, arquivo no HEAD, branches/PRs relacionados |
| **3. CONTEÚDO** | Clone local limpo (`main` sincronizado) | `diff`, `json.loads` deep compare | Diff semântico (conceito), não só linha-a-linha |

> **Regra:** Medir **Casa → GitHub → VPS** nessa ordem. VPS só se a claim for "rodando na VPS".

---

## Passos Obrigatórios

```text
1. LER ARQUIVO EXTERNO (parse real — JSON string escapada precisa json.loads 2x)
2. CARREGAR CANÔNICO LOCAL (Casa) — read_file direto
3. MEDIR REMOTO (GitHub) — gh pr view / git ls-remote / git show origin/main:<path>
   - NÃO usar curl anônimo (repo privado = 404)
   - Repo ServerVpss/CentralDark = PRIVADO
4. MEDIR VPS (se claim envolver runtime VPS) — ssh Segredo-VPS + git status
5. COMPARAR SEMANTICAMENTE (deep compare com mapa de variantes aceitáveis)
   - PITFALL: diff literal = falso DRIFT (ex: SINGLE_WRITER_PER_SCOPE=ENFORCED vs ONE_WRITER_PER_SCOPE=true)
   - CORRETO: checar CONCEITO (mapa de variantes)
6. CLASSIFICAR: IDÊNTICO | MELHORA (gap real) | DIVERGÊNCIA (extra/falta/conflito) | CANDIDATO (feature branch)
7. REPORTAR COM EVIDÊNCIA: SHA medido, diff exato, classificação, decisão
```

---

## Classificações de Resultado

| Classificação | Significado | Ação |
|---------------|-------------|------|
| `IDENTICO` | Byte-a-byte ou semanticamente igual ao canônico | Usar canônico; ignorar externo |
| `MELHORA` | Adição de gap real provado (ex: regra nova testada + promovida) | Abrir PR canônico se autorizado |
| `DIVERGENCIA` | Extra key, falta regra, conflito material | **Não usar como base**; reportar |
| `CANDIDATO` | Vem de feature branch (ex: `feat/copy-paste-exact-output-20260826`) | Aguardar promoção canônica |
| `STALE` | Baseado em commit/HEAD antigo | Atualizar contra HEAD atual |

---

## Evidência Obrigatória no Relatório

```yaml
EXTERNAL_FILE_RECONCILIATION:
  file: "<nome/origem>"
  canonical_local: "LOADED|PATH"
  canonical_remote: "HEAD=<sha>|BRANCH=main|PR=<num>"
  vps_state: "MEASURED|NOT_APPLICABLE|BLOCKED"
  comparison: "IDENTICO|MELHORA|DIVERGENCIA|CANDIDATO|STALE"
  diff_semantic: "<descrição curta do delta conceitual>"
  diff_keys: ["chave.extra", "chave.faltando"]
  decision: "IGNORAR|PR_CANONICO|AGUARDAR_PROMOCAO|BLOQUEAR"
  evidence: "SHA + diff output + classification"
```

---

## Pitfalls Conhecidos

### 1. JSON Duplamente Escapado
Arquivos vindos do Telegram/Download muitas vezes são **string JSON dentro de arquivo texto** (uma string JSON escapada). Precisa:
```python
with open(path) as f:
    outer = json.load(f)      # primeira camada: string
    inner = json.loads(outer) # segunda camada: objeto real
```

### 2. Diff Literal = Falso DRIFT
Perfis/adaptadores reescrevem invariantes com linguagem própria:
- `SINGLE_WRITER_PER_SCOPE=ENFORCED` ≠ `ONE_WRITER_PER_SCOPE=true` (mesmo conceito)
- `MENOS_E_MAIS=true` pode faltar no perfil mas estar no canônico
- **Correção:** Mapa de variantes aceitáveis por conceito, não `diff -u` linha-a-linha

### 3. Curl Anônimo em Repo Privado
`curl https://api.github.com/repos/ServerVpss/CentralDark/...` → **404** (não autenticado).
- **Correto:** `gh` CLI autenticado (`segredounlock` no keyring) OU `git ls-remote` / `git show origin/main:<path>` com remote configurado.

### 4. VPS em Estado Sujo ≠ Canônico
VPS pode estar em:
- Rebase interativo ativo (4655 commits pendentes)
- Detached HEAD
- Arquivos com `chattr +i` (immutable)
- Processos Git ativos
- **Não promover verde só porque SSH entrou.** Reconciliar Git da VPS antes de confiar no runtime.

### 5. Paste de Outro Agente ≠ Evidência
Relatório de outro Hermes/oráculo, screenshot, paste de terminal = **sinal contextual**, não prova.
- **Regra:** MEDIR o estado vivo você mesmo (READ_ONLY) antes de agir.
- Especialmente migração de disco/sistema (R4) citada por outro agente: travar até ordem explícita + sua própria medição.

---

## Exemplo Desta Sessão (2026-08-26)

**Arquivo externo:** `Novo(a) Documento de Texto.txt` (Telegram Download)
**Claim do usuário:** "verifica se isso melhora ao padrão da casa"

**Medição:**
| Fonte | HEAD/Estado | Arquivo |
|-------|-------------|---------|
| Casa (local) | `2abc6f3ae` (main sincronizado) | `CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json` ✅ CANONICAL v3 |
| GitHub (remoto) | `origin/main` = `2abc6f3ae` | Mesmo SHA ✅ sincronizado |
| VPS | Rebase ativo, detached HEAD, arquivos modificados | ⚠️ SUJO — não confiável para verdade |

**Diff semântico:** 1 chave extra no externo: `language_policy.copy_paste_exact_mode` (feature branch `feat/copy-paste-exact-output-20260826`)

**Classificação:** `CANDIDATO` (feature branch não promovida)
**Decisão:** `IGNORAR` como base; canônico continua sendo `main`

---

## Referências Relacionadas
- `profile-soul-local-reconcile.md` — perfil ↔ SOUL (camada 1)
- `reconcile-3camadas-recipe.md` — receita geral 3 camadas
- `mapear_remoto.py` — script de mapeamento remoto (camada 2)
- `vps-housekeeping-lixo-ouro.md` — varredura VPS (camada 3 runtime)