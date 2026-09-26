---
name: external-source-analysis
description: Framework para analisar fontes externas (docs, prompts, specs) contra stack existente usando classificação em 5 classes e comparação em 4 blocos. Evita importação cega e duplicação.
version: 1.0.0
author: Pivete
---

# Análise de Fonte Externa — Framework 5 Classes + 4 Blocos

Use quando receber documento externo (OPUS-5.md, specs, RFCs, prompts de outra plataforma) e precisar extrair só o que serve pro stack CentralDark/Hermes Pivete.

## Princípio Central

> **Não importar cegamente. Classificar → Comparar → Extrair Ouro → Rejeitar Lixo.**

## Ordem permanente de consulta e impacto

Quando houver dúvida sobre o Hermes ou o ambiente da Casa:

```text
disco e artefatos locais
→ documentação/painel local (127.0.0.1:9119)
→ documentação oficial do Hermes na internet
→ fonte primária adicional, somente se necessário
```

Consultas R0 estão permanentemente autorizadas. Essa autorização **não** inclui download, instalação, carregamento de modelos grandes ou outra alteração de estado. Antes dessas ações, informar tamanho, impacto, destino e rollback, e obter autorização aplicável. Nunca deixar atendimento bloqueado por download silencioso.

---

## Passo 1 — Classificação em 5 Classes

| Classe | Código | Definição | Ação |
|---|---|---|---|
| **A** | `PRINCÍPIO_REUTILIZÁVEL` | Método durável, independente de plataforma/fornecedor | **Extrair e incorporar** nos artefatos existentes |
| **B** | `EQUIVALENTE_JÁ_EXISTENTE` | Já existe no CentralDark/Hermes com mesma função | **Confirmar e não duplicar** |
| **C** | `LACUNA_REAL` | Não existe ou existe incompleto, com evidência direta | **Fechar no artefato canônico** |
| **D** | `EXCLUSIVO_DA_PLATAFORMA` | Tools, paths, APIs, produtos, políticas específicas do fornecedor | **REJEITAR** — não roda no nosso runtime |
| **E** | `NÃO_VERIFICADO_OU_TEMPORAL` | Modelos, preços, datas, produtos, afirmações sem prova atual | **REJEITAR** — envelhece rápido ou irrelevante |

**Regra:** Só promover Classes A e C (se comprovadas). Classes D e E **nunca** entram no stack.

---

## Passo 2 — Comparação em 4 Blocos

Mapear cada item das Classes A/C contra o stack atual em 4 dimensões:

| Bloco | Domínio | Artefatos CentralDark |
|---|---|---|
| **1. Roteamento de Ferramentas** | Tool routing, discovery, fallback | `HERMES-CORE`, gateway, `validar-mapa.mjs`, skills |
| **2. Memória Versionada** | Read-before-write, if_version, conflitos, 3 temperaturas | `motor/03-memoria/`, `META LUPA`, `SOUL.md` |
| **3. Correção Sem Culpa** | Accountability, self-respect, no infinite apology | `SOUL.md` (Regra 5, Seção 18), `META LUPA` AutoLupa |
| **4. Decisão Textual-Visual** | Texto → Tabela → Fluxo → Artefato, spec triggers | `PADRAO-CARD-HERMES.md v1.2`, `MANUAL.html`, `SOUL.md` |

---

## Passo 3 — Tabela de Veredito

| Bloco | Ouro (A) | Existe (B) | Lacuna (C) | Rejeitado (D+E) | Veredito |
|---|---:|---:|---:|---:|---|
| 1. Roteamento | 5 | 3 | **3 (críticas)** | 21 | **CONDICIONAR** |
| 2. Memória | 6 | 11 | **2** | 6 | **CONDICIONAR** |
| 3. Correção | 6 | 4 | **1** | 3 | **APROVAR** |
| 4. Visual | 8 | 7 | **2** | 11 | **APROVAR** |

**Critérios de Veredito:**
- `APROVAR` = 0 lacunas críticas, stack já cobre 90%+
- `CONDICIONAR` = ≥1 lacuna crítica → fechar antes de promover
- `BLOQUEAR` = conflito arquitetural ou risco de duplicação

---

## Passo 4 — Regra de Ouro (Anti-Duplicação)

> **Antes de criar qualquer coisa nova: provar que o encaixe canônico é impossível.**

| Risco | Mitigação |
|---|---|
| Nova skill para roteamento | Estender `HERMES-CORE` / gateway existente |
| Nova estrutura de memória | Estender 3 temperaturas em `motor/03-memoria/` |
| Novo doc de correção | Adicionar frases proibidas em `SOUL.md`/`04-COMUNICACAO.md` |
| Visualizer module paralelo | Usar skill `claude-design` + `PADRAO-CARD-HERMES v1.2` |

---

## Verificação antes de afirmar — dúvida exige rastro

Pensamento interno, pesquisa, hook e ferramenta são mecanismos diferentes:

- **Pensar** analisa contexto; não prova consulta externa.
- **Skill/CLAUDE.md** orienta; não prova cumprimento.
- **WebSearch/WebFetch** produzem o evento objetivo de pesquisa.
- **PreToolUse** permite, bloqueia e registra a chamada; não observa “o modelo não sabia”.

### Protocolo de investigação segura

```text
1. ler contexto, disco, Git, runtime e logs disponíveis;
2. classificar a afirmação = LOCAL | ESTÁVEL | ATUAL/INSTÁVEL | INCERTA | DESCONHECIDA;
3. pesquisar somente ATUAL/INSTÁVEL, INCERTA ou DESCONHECIDA;
4. remover segredos, dados pessoais e código privado da consulta;
5. priorizar documentação oficial, código-fonte e fonte primária;
6. registrar URL, data, versão, trecho sustentador e relação com a conclusão;
7. procurar contraprova e registrar fontes discordantes sem escolher silenciosamente a preferida;
8. se não houver confirmação suficiente, declarar NÃO_VERIFICADO;
9. resultado vazio prova somente vazio; nunca prova inexistência;
10. não usar pesquisa externa para substituir leitura local;
11. aplicar a mesma exigência de prova contra e a favor da conclusão.
```

Quando a conclusão depender de verificação externa, registrar:

```text
KNOWLEDGE_STATUS=PRESENTE|INCERTO|AUSENTE
TEMPORALLY_UNSTABLE=SIM|NAO
WEB_VERIFICATION_REQUIRED=SIM|NAO
WEB_SEARCH_EXECUTED=SIM|NAO
SOURCE_URL=
SOURCE_DATE=
SOURCE_VERSION=
SUPPORTING_EXCERPT=
COUNTEREVIDENCE_SEARCHED=SIM|NAO
CONFLICTING_SOURCES=
UNVERIFIED_CLAIMS=
PRIVATE_DATA_EXPOSED=SIM|NAO
```

Gate fail-closed:

```text
WEB_VERIFICATION_REQUIRED=SIM + WEB_SEARCH_EXECUTED=NAO → BLOQUEAR APROVAR
PRIVATE_DATA_EXPOSED=SIM → BLOQUEAR
SEM FONTE PRIMÁRIA QUANDO ELA EXISTE → CONDICIONAR
PESQUISA FALHOU → NÃO_VERIFICADO; nunca completar pela memória
```

### Protocolo de aprendizado comprovado

“Entendi”, “absorvi” e “consolidei” são alegações, não prova. Antes de declarar aprendizado:

```text
1. localizar o artefato canônico e inventariar equivalentes;
2. mostrar caminho exato e diff da regra gravada;
3. calcular SHA-256 do arquivo antes e depois;
4. executar teste positivo, negativo, limite e rollback quando aplicável;
5. testar em sessão nova ou contexto limpo, sem memória herdada;
6. procurar maneira de refutar o próprio resultado;
7. executar AutoLupa sobre a própria AutoLupa;
8. declarar pendente qualquer item sem rastro.
```

Registro mínimo:

```text
REGRA_GRAVADA_EM=
FILE_SHA256_ANTES=
FILE_SHA256_DEPOIS=
TESTE_POSITIVO=SIM|NAO
TESTE_NEGATIVO=SIM|NAO
TESTE_LIMITE=SIM|NAO|NAO_APLICAVEL
WRITE_OCCURRED=SIM|NAO
ROLLBACK_PROVADO=SIM|NAO|NAO_APLICAVEL
SESSAO_NOVA=SIM|NAO
GATE_AUTO_INVOKED=SIM|NAO
FONTE_PRIMARIA=SIM|NAO|NAO_APLICAVEL
PROVA_CONTRARIA_PROCURADA=SIM|NAO
DADOS_PRIVADOS_EXPOSTOS=SIM|NAO
DUPLICATA_ENCONTRADA=SIM|NAO
VEREDITO=APROVAR|CONDICIONAR|BLOQUEAR
```

O gate executável é `scripts/verify_learning_gate.py`. Ele deve bloquear `APROVAR` se faltar caminho, hash diferente, testes positivo/negativo, sessão nova, contraprova, privacidade ou inventário de duplicatas.

---

## Gatilho — Catálogo semântico para links e fontes extensas

Quando o Pivete enviar links grandes, vários repositórios, documentação extensa ou uma família de ferramentas, a saída persistente padrão é um **catálogo semântico** — não um resumo solto e não uma adoção silenciosa.

Encaixe obrigatório:

```text
fonte extensa recebida
→ localizar skill/artefato canônico existente
→ criar ou atualizar arquivo em references/
→ classificar candidatos por mecanismo, não por marca
→ registrar estado temporal, fonte, permissões, riscos e evidência
→ manter caminho normativo/executável separado
→ pesquisar e testar somente quando a missão exigir seleção
```

Regras:

- preferir `references/` da skill existente; criar skill nova somente se não houver encaixe canônico;
- o catálogo é memória de investigação, não instrução executável;
- todo candidato nasce `NAO_VERIFICADO`;
- README, marketing, estrelas e popularidade servem para descoberta, não promoção;
- documentação oficial + teste reproduzível são necessários para `VERIFICADO_COM_LIMITES`;
- `NAO_VERIFICADO` nunca é selecionado automaticamente;
- duplicatas são consolidadas pelo mecanismo transferível, não pelo nome comercial;
- versão, data e evidência podem expirar e exigem revalidação;
- descoberta não autoriza instalação, login, credencial, escrita, deploy ou execução.

Schema-base ajustável ao domínio:

```text
CANDIDATE_ID
MECHANISM
STATUS=NAO_VERIFICADO|VERIFICADO_COM_LIMITES|REJEITADO|OBSOLETO
PRIMARY_SOURCE_URL
VERIFIED_AT
PRODUCT_VERSION
PLATFORM_OR_SCOPE
PERMISSIONS_OR_AUTHORITY
DATA_OR_CREDENTIAL_ACCESS
REVOCATION_OR_ROLLBACK
AUDITABILITY
KNOWN_RISKS
EVIDENCE_HASH
```

Fluxo:

```text
DESCOBERTO
→ NÃO_VERIFICADO
→ PESQUISA PRIMÁRIA
→ TESTE ISOLADO
→ VERIFICADO_COM_LIMITES ou REJEITADO
→ REVALIDAÇÃO TEMPORAL
```

## Passo 5 — META LUPA Formal (Obrigatório)

Toda análise de fonte externa **deve** registrar no ledger canônico:

```bash
# BEGIN
python .agents/skills/meta-lupa/scripts/meta_lupa.py begin-use \
  --repo ServerVpss/CentralDark \
  --mission-id "EXTERNAL-<SOURCE>-<DATE>" \
  --skill-path .agents/skills/meta-lupa \
  --skill-ref origin/main \
  --skill-commit-sha <CANONICAL_SHA> \
  --workspace-branch <branch> \
  --workspace-head <HEAD_SHA> \
  --mode ULTRA

# ... análise, classificação, comparação ...

# FINAL
python .agents/skills/meta-lupa/scripts/meta_lupa.py finish-use \
  --mission-id "EXTERNAL-<SOURCE>-<DATE>" \
  --usage-id <USAGE_ID> \
  --verdict "APROVAR|CONDICIONAR|CORRIGIR|BLOQUEAR" \
  --autolupa true --point-fixed true \
  --evidence "Classificação 5 classes; 4 blocos comparados; X lacunas; Y rejeitados" \
  --files-changed <analysis_files> \
  --residual-risk "platform contamination if D/E promoted" \
  --result "X lacunas críticas; Y para backlog; Z rejected" \
  --mode-used "ULTRA + META LUPA" \
  --triggers "external source analysis" \
  --risk "platform-specific contamination" \
  --false-green-blocked --guardrail-added "external source classification gates" \
  --rollback-proven --improvements "classification framework; comparison methodology" \
  --achievements external_source_classified gaps_documented no_false_green
```

**Saída obrigatória do FINAL:** `usage_id`, `evidence_hash`, `evolution_fingerprint`, XP (se houver achievement genuíno).

---

## Exemplo Real (OPUS-5.md — 27/07/2026)

| Métrica | Valor |
|---|---|
| Fonte | `OPUS-5.md` (202.7 KB, SHA256 `f8bc6dee5b23b926d3cb87a5b2dfc197feea6bfd82119f4a796b767a8da2ec41`) |
| Itens classificados | 140 em 5 classes |
| A (Ouro) | 19 |
| B (Já existe) | 28 |
| C (Lacunas) | 16 |
| D (Plataforma) | 40 |
| E (Temporal) | 36 |
| **Rejeitados (D+E)** | **76 (54%)** |

**3 Lacunas Críticas:**
1. Árvore Tool Routing (Step 0-3) → `HERMES-CORE`/gateway
2. `if_version` + auto-merge staleness → 3 Temperaturas
2. Frases proibidas memória explícitas → `SOUL.md`/`04-COMUNICACAO.md`

**Veredito Final:** `CONDICIONAR` — fechar 3 críticas, backlog 13, rejeitar 76.

---

## Integração com MANUAL.html

Resultado da análise → nova seção no `MANUAL.html`:
- Anchor no TOC: `#opus-5-analise`
- Seção com: veredito, tabela classes, veredito por bloco, 3 lacunas críticas, rejeitados, próximos passos
- Evidência META LUPA (usage_id, BEGIN/FINAL, ledger, AutoLupa)

---

## Checklist Rápido (antes de dizer "pronto")

- [ ] Fonte lida integral + SHA256 + tamanho
- [ ] 140+ itens classificados em A/B/C/D/E
- [ ] 4 blocos comparados com stack real (ler arquivos, não assumir)
- [ ] Tabela veredito preenchida
- [ ] 3 lacunas críticas identificadas (se houver)
- [ ] Classes D+E 100% rejeitadas com justificativa
- [ ] META LUPA BEGIN/FINAL no ledger canônico
- [ ] AutoLupa = ponto fixo atingido
- [ ] Resultado no MANUAL.html com anchor no TOC
- [ ] Zero escrita fora dos artefatos canônicos