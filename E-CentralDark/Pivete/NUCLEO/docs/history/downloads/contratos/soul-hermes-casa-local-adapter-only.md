# SOUL HERMES-CASA/pivete — Existe Só Como Adaptador Local, Não No GitHub Canônico

## Descoberta (2026-08-24)

**Contexto:** Usuário perguntou "qual perfil tamo oprando aque3" e "tem perfil canonico atual da soul aque".

**Investigação:**
1. Verificado profile Hermes ativo: `default` (não `pivete`)
2. Verificado SOUL local em `/c/Users/danda/AppData/Local/hermes/profiles/pivete/SOUL.md` — existe, define papel `HERMES_CASA` / `PROFILE_LOGICO=pivete`
3. Verificado GitHub remoto `ServerVpss/CentralDark` (branch `main`, HEAD `3a24bd4ac68edf92ce74d88a73ba91dc02ba8998`)
4. **Resultado:** NÃO existe arquivo `SOUL-HERMES-CASA.md`, `SOUL-pivete.md` ou similar no repositório canônico
5. O que existe no canônico: `docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md` (SHA `6c26ae1f50cc973594b5c87b75e79be46bebde9c`) — define SOL como coordenadora, cita `PIVETE/HERMES` como *executor + preservação + continuidade*, mas **não define** o SOUL do HERMES-CASA

**Snapshot referenciado no SOUL local:** `6f5e83d8a4ef2ec095f5a65f6be484fddd9000c5`
**HEAD atual do main:** `3a24bd4ac68edf92ce74d88a73ba91dc02ba8998`
→ **Diferentes.** O SOUL local referencia commit antigo.

---

## Padrão Identificado

| Camada | Arquivo | Autoridade |
|--------|---------|------------|
| **Canônico (GitHub)** | `SOUL-SOL.md` | Define SOL, cita HERMES-CASA como papel |
| **Adaptador Local (Profile)** | `profiles/pivete/SOUL.md` | Define HERMES-CASA operacionalmente, subordinado ao canônico |
| **Runtime Ativo** | Profile `default` (Hermes Agent) | Executa papel HERMES-CASA via SOUL local carregado |

**Regra:** O SOUL do HERMES-CASA/pivete **não é versionado no GitHub** — é um adaptador local que cada profile/hermes carrega. O canônico é a SOUL-SOL.

---

## Implicações Operacionais

1. **No boot:** O SOUL local diz "medir o remoto atual novamente" — mas o remoto não tem SOUL do HERMES-CASA, só tem SOUL-SOL
2. **Divergência esperada:** Não é erro, é arquitetura — o adaptador local **sempre** vai divergir do canônico porque o canônico não define esse papel em detalhe
3. **Validação:** Ao carregar SOUL local, verificar se `SOUL-SOL.md` do remoto mudou (HEAD diferente do snapshot referenciado)
4. **Atualização:** Se SOUL-SOL mudou materialmente, o adaptador local pode precisar de ajuste — mas não deve ser commitado no GitHub

---

## Diferença vs. `soul-config-divergence-runtime-block.md`

| Aspecto | `soul-config-divergence-runtime-block.md` | Este Arquivo |
|---------|-------------------------------------------|--------------|
| **Cenário** | Mesmo arquivo (SOUL.md/config.yaml) em dois caminhos: canônico (E:\) vs runtime ativo (AppData\) | Arquivo **só existe localmente** (adaptador), não tem contraparte no GitHub |
| **Classificação** | `DOCUMENTED_DIVERGENCE` (runtime lê ativamente do AppData) | `LOCAL_ADAPTER_ONLY` (não versionado, subordinado à SOUL-SOL) |
| **Ação** | Não mover, documentar divergência | Não commitacar, validar contra SOUL-SOL no boot |

---

## Checklist de Boot Atualizado

Adicionar ao recibo `CENTRALDARK_AI_BOOT`:

```yaml
soul_hermes_casa:
  canonical_exists: false
  canonical_reference: "SOUL-SOL.md (define SOL, cita HERMES-CASA como executor)"
  local_adapter: "profiles/pivete/SOUL.md"
  local_adapter_snapshot_ref: "6f5e83d8a4ef2ec095f5a65f6be484fddd9000c5"
  remote_head_current: "3a24bd4ac68edf92ce74d88a73ba91dc02ba8998"
  snapshot_matches_remote: false
  action: "VALIDATE_SOUL_SOL_CHANGES_ONLY"
```

---

## Lição Geral

> **Nem todo papel operacional tem SOUL no GitHub.** A SOUL-SOL é a única SOUL canônica versionada. Papéis subordinados (HERMES-CASA, especialistas futuros) vivem como adaptadores locais nos profiles que os executam. O contrato é: adaptador local ≤ SOUL-SOL canônica.