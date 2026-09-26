# Extração de Artifacts — Missão META LUPA (Bolt + VPS)

**Origem**: Sessão R4 — turno-10 — parallel-readers (2026-08-02)  
**Missão**: meta-lupa-mission (branch `test/desafio-omega-autolupa-2026-07-22`, HEAD `eb1bb7f6`)

---

## Localização dos Artefatos da Missão

| Tipo | Caminho | Descrição |
|------|---------|-----------|
| **Artifacts da missão** | `.artifacts/meta-lupa-mission/` | 13 arquivos estruturados (JSON, MD, TXT) |
| **Backup skill (pós-sync)** | `BACKUPS/hermes-pivete/checkpoint_zero/meta-lupa-sync-20260728-557ec0a5/` | Skill `meta-lupa` sincronizada no perfil |
| **Backup skill (pré-sync)** | `BACKUPS/hermes-pivete/checkpoint_zero/meta-lupa-pre-sync-25f85787/` | Skill `lupa-bayesiana` antes da migração |
| **Output consolidado** | `EVIDENCE_ROOT/turno-10/parallel-readers/R4_backups_artifacts.md` | Relatório estruturado (15KB, 325 linhas) |

---

## Arquivos da Missão (`.artifacts/meta-lupa-mission/`)

| Arquivo | Formato | Conteúdo Relevante para Bolt/VPS |
|---------|---------|----------------------------------|
| `00-hashes-iniciais.json` | JSON | HEAD SHA `eb1bb7f6`, config SHA256, 9 arquivos skill com SHA256 |
| `00-estado-inicial.txt` | TXT | Repo, branch, profile `pivete`, gateway PID 60004, provider `openai-codex/gpt-5.6-sol` |
| `10-baseline-atual.json` | JSON | Baseline `BASELINE_PROVADO_COM_FALHA_REAL`, 40/40 testes, 5 gaps, risco residual |
| `20-comparacao-antes-depois.json` | JSON | lupa-bayesiana (APROVADA, falso verde NÃO bloqueado) → meta-lupa (INSUFICIENTE, BLOQUEADO) |
| `20-regressoes.txt` | TXT | 72/72 PASS, `OPEN_REGRESSION=NONE`, `FALSE_GREEN_RUNTIME=BLOCKED_AS_INSUFFICIENT` |
| `20-risco-residual.md` | MD | 4 riscos: literal veredito, provider fallback 404, escopo branch, PR #377 instável |
| `30-migracao-meta-lupa.md` | MD | Migração canônica `lupa-bayesiana` → `meta-lupa`, git rename, symlink, rollback path |
| `40-transicao-casa-bolt.md` | MD | **Inventário VPS completo**, contrato Bolt canônico vs legado, veredito `CORRIGIR`, 8 passos |
| `05-jobs-final.md` | MD | 4/4 jobs reparados, provider global inalterado, wrappers explícitos Git Bash |

---

## Conteúdo Crítico do `40-transicao-casa-bolt.md` (Para Esta Skill)

### Contrato Canônico Bolt
- **Caminho**: `apps/modulos/Bolt/`
- **Gitlink/Submódulo**: `c0c0f8c6bf06b34747cf5a4b4c27aa2e57c8fe36`
- **Compose**: `apps/modulos/Bolt/docker-compose.yml`
- **Serviço**: `builder` | **Container**: `CentralDark-Builder`
- **Preview**: `127.0.0.1:5174 → 5173` | **HMR**: `127.0.0.1:5175 → 5175`
- **Domínio**: `https://builder.centralldark.com`
- **Estado VPS**: Container `Exited (1)` há ~2 semanas; portas 5174/5175 ausentes

### Contrato Legado Incompatível (NÃO EXECUTAR)
- Scripts: `scripts/deploy/install-builder-bolt.sh`, `scripts/deploy/ativar-builder-bolt-caddy.sh`, `scripts/validate/builder-bolt-static-checks.sh`
- Caminho: `apps/builder-bolt/` | Serviço: `builder-bolt` | Container: `centraldark-builder-bolt`
- **Validador estático**: `FALHA` — exige arquivos/caminhos removidos + snippet Caddy ausente
- ⚠️ Pode criar segunda instalação em vez de reparar o Bolt canônico

### Runtime VPS (Inventário)
| Componente | Classificação | Processo/Container | Porta/Rota | Estado |
|------------|---------------|-------------------|------------|--------|
| Bolt canônico | `EXISTE_E_QUEBRADO` | Docker `CentralDark-Builder` | 5174/5175 | `Exited (1)`; sem listeners |
| Artifacts Builder | `EXISTE_E_FUNCIONA` | PM2 `CentralDark-ArtifactsBuilder` | `0.0.0.0:3090` | Online; responsabilidade diferente |
| Builder público | `EXISTE_E_NAO_LIGADO_AO_BOLT` | Caddy → Artifacts Builder | `builder.centralldark.com → localhost:3090` | 404 público; não aponta ao Bolt |
| Caddy | `EXISTE_E_FUNCIONA` | systemd/Caddy | 80/443 | Ativo; sem alterações |
| HUB | `EXISTE_E_FUNCIONA_PARCIALMENTE` | Estático + rota dinâmica | dist + 8098 | Estrutura ativa; 8098 = OAuthBroker |
| WebUI | `EXISTE_E_DESLIGADO` | Docker `CentralDark-WebUI` | 3000 | `Exited (137)` há ~2 semanas |
| Hermes Thinker | `EXISTE_E_FUNCIONA` | Docker | 127.0.0.1:7801 | Ativo |

### Veredito e Próxima Correção Mínima
```
VEREDITO=CORRIGIR
READY_FOR_BOLT_PREVIEW=NAO
```

**Sequência recomendada (8 passos)**:
1. Branch a partir de `origin/main`
2. Fixar gitlink/submódulo canônico + provar SHA da fonte do Bolt
3. Adaptar 3 scripts existentes a `apps/modulos/Bolt` (um serviço/container, remover contrato concorrente)
4. Remover credenciais do compose **junto com** rotação/revogação + mecanismo seguro
5. Fazer validador estático passar no caminho canônico
6. VPS: capturar logs sanitizados do `Exited (1)` e corrigir uma variável por vez
7. Subir preview loopback 5174/5175, provar: processo, HTTP, assets, WebSocket/HMR, workspace isolado, logs estáveis
8. Só depois decidir rota do domínio `builder.centralldark.com` (Artifacts Builder vs Bolt), com backup/rollback do Caddy

---

## Padrão de Extração (Reutilizável para Missões Futuras)

```bash
# 1. Localizar artifacts (NÃO estão em BACKUPS/)
find .artifacts -name "*meta-lupa-mission*" -type d

# 2. Ler todos os arquivos estruturados da missão
read_file .artifacts/meta-lupa-mission/00-hashes-iniciais.json
read_file .artifacts/meta-lupa-mission/00-estado-inicial.txt
read_file .artifacts/meta-lupa-mission/10-baseline-atual.json
read_file .artifacts/meta-lupa-mission/20-comparacao-antes-depois.json
read_file .artifacts/meta-lupa-mission/20-regressoes.txt
read_file .artifacts/meta-lupa-mission/20-risco-residual.md
read_file .artifacts/meta-lupa-mission/30-migracao-meta-lupa.md
read_file .artifacts/meta-lupa-mission/40-transicao-casa-bolt.md   # ← CRÍTICO para Bolt/VPS
read_file .artifacts/meta-lupa-mission/05-jobs-final.md

# 3. Localizar backups de skill associados
find BACKUPS/hermes-pivete/checkpoint_zero -name "*meta-lupa*" -type d

# 4. Produzir output consolidado em EVIDENCE_ROOT
mkdir -p EVIDENCE_ROOT/turno-XX/parallel-readers
write_file EVIDENCE_ROOT/turno-XX/parallel-readers/R4_backups_artifacts.md
```

---

## Estrutura do Output Consolidado (Padrão)

1. **Hashes Iniciais** — integridade dos arquivos da skill
2. **Estado Inicial** — contexto repo/profile/gateway/provider
3. **Baseline** — status, testes, gaps, risco residual
4. **Comparação Antes/Depois** — delta skill antiga → nova
5. **Regressões** — contagem PASS/FAIL, regressões abertas
6. **Risco Residual** — itens monitorados
7. **Migração** — renomeação, git rename, symlink, rollback
8. **Transição Casa→Bolt** — inventário VPS, contratos, veredito, passos
9. **Jobs Final** — métricas, arquivos alterados, backup
10. **Síntese Consolidada** — tabela de status por dimensão
11. **Arquivos Fonte Lidos** — rastreabilidade completa
12. **Backups de Referência** — caminhos para rollback

---

## Lições Aprendidas (Para Missões Bolt/VPS Futuras)

1. **Artifacts ≠ Backups**: Mission artifacts em `.artifacts/<mission>/`, skill backups em `BACKUPS/hermes-pivete/checkpoint_zero/`.

2. **Transição Casa→Bolt está nos artifacts**: O arquivo `40-transicao-casa-bolt.md` contém o inventário VPS completo, contratos canônico vs legado, e veredito — é a fonte primária para retomada da missão Bolt.

3. **Contrato legado é armadilha**: Os scripts em `scripts/deploy/*builder-bolt*` apontam para `apps/builder-bolt/` (removido) e serviço `builder-bolt` (inexistente). **Não executar** — validador falha e pode criar instalação concorrente.

4. **Caddy ativo ≠ Bolt servido**: Caddy roda e serve Artifacts Builder na porta 3090. Domínio `builder.centralldark.com` aponta para Artifacts Builder, NÃO para Bolt. 404 no domínio = Caddy/DNS/gateway, não container Bolt.

5. **Credenciais versionadas**: Detectadas em composes protegidos. Exigem rotação/revogação coordenada + armazenamento seguro. Apagar texto não corrige exposição prévia.

6. **Rollback preservado**: Caminho `C:\tmp\meta-lupa-mission-20260726-123037\` referenciado nos artifacts para rollback de skill e jobs.

7. **EVIDENCE_ROOT**: Padrão de output para extrações paralelas — `EVIDENCE_ROOT/turno-XX/parallel-readers/`.

---

## Aplicação na Retomada da Missão Bolt/VPS

Quando retomar a missão `centraldark-bolt-vps-mission`:

1. **Ler `.artifacts/meta-lupa-mission/40-transicao-casa-bolt.md`** — inventário completo já feito
2. **Consultar backups em `BACKUPS/hermes-pivete/checkpoint_zero/`** — estado da skill meta-lupa
3. **Seguir os 8 passos mínimos** do veredito `CORRIGIR`
4. **Registrar no ledger** `references/uso-ledger.jsonl` via `scripts/ledger_check.py`
5. **Produzir novo artifact** em `.artifacts/bolt-vps-mission-<timestamp>/`

---

*Registrado por R4 — turno-10 — parallel-readers*  
*SHA da missão: `eb1bb7f6d5be401775a49a8b07ad8a9d13cafa38`*  
*Skill relacionada: `meta-lupa` (user-owned, não editável pelo curador)*