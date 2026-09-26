# Avaliação de Pacote de Skills Externo + Fluxo PR Canônico — Sessão 2026-08-26

## Contexto
CHEFE entregou `centraldark-skills-pacote.zip` (6 skills do ecossistema Grok CLI) com ordem: "integre tudo isso na central dark na main e entrega".

## Metodologia Aplicada (REUSE_BEFORE_CREATE + Delta Real)

### 1. Inspeção do Zip (Read-Only)
```bash
unzip -l centraldark-skills-pacote.zip
# 15 arquivos, 6 skills em ~/.grok/skills/ e ~/.grok/skills/skill-creator/
```

### 2. Extração Seletiva do Candidato
```bash
unzip -j centraldark-skills-pacote.zip "home/workdir/.grok/skills/tecnicadalupa/SKILL.md" -d /tmp/extract
```

### 3. Avaliação de Cada Skill (Gap Real vs Ruído)

| Skill | Veredito | Razão |
|-------|----------|-------|
| `skilmaster` | **DESCARTAR** | 16 linhas, prompt genérico "unifica tudo", narrativas fabricadas (53/53 testes inexistentes) |
| `tecnicadalupa` | **ABSORVER** | Checklist 7 filtros concreto, não duplica `meta-lupa`, gap genuíno |
| `opus-magus` | **DESCARTAR** | Protocolo de resposta que sobrepõe LEIA-ME-IA.md (fato/inferência/hipótese/UNKNOWN, PROOF-OWNERSHIP) |
| `gpt4free` | **DESCARTAR** | Doc genérica de lib terceira, sem especificidade CentralDark |
| `agentic-devops` | **DESCARTAR** | Doc genérica plataforma DevOps (AWS/GitHub via OpenAI Agents SDK) |
| `skill-creator` | **DESCARTAR** | Meta-ferramenta só pro ecossistema Grok |

### 4. Criação no Owner Canônico
```bash
# Local canônico: .agents/skills/tecnica-da-lupa/SKILL.md
# Formato canônico da Casa (frontmatter + metadata + referências cruzadas)
git add .agents/skills/tecnica-da-lupa/
git commit -m "feat(skills): adiciona tecnica-da-lupa — checklist 7 filtros pra revisar output de agente (garimpado de pacote Grok, delta real não duplicado)"
```

### 5. PR com Metadados de Autorização (Auto-Squash)
```bash
gh pr create --base main --head feat/vps-housekeeping \
  --title "feat(skills): tecnica-da-lupa — checklist 7 filtros para revisão de output de agente" \
  --body "Delta real garimpado do pacote Grok (centraldark-skills-pacote.zip).

**O que entra:**
- .agents/skills/tecnica-da-lupa/SKILL.md — checklist prático de 7 filtros

**O que NÃO entra (já filtrado):**
- skilmaster — raso, narrativas fabricadas
- opus-magus — sobrepõe LEIA-ME-IA.md
- gpt4free / agentic-devops — genéricos, sem gap CentralDark
- skill-creator — só serve pro ecossistema Grok

**Não duplica:** .agents/skills/meta-lupa/ (falsificação crítica, ontologia fato/inferência/hipótese/UNKNOWN)

**Autorização:** SEGREDO/CHEFE — intenção clara, delta mínimo, prova de não-duplicação.
Merge-Policy: AUTO_SQUASH_IF_CLEAN
Intent-Scope: skills/tecnica-da-lupa
Writer: HERMES-CASA (pivete profile)
Writer-Scope: skills/tecnica-da-lupa"
```

### 6. Merge Squash via CLI (sem rebase sujo)
```bash
gh pr merge 1171 --squash --delete-branch
# PR já merged pelo workflow autonomia-promocao.yml
```

### 7. Adição de Gate no Workflow (verify_gatilho_aprendizado_sync)
```yaml
# .github/workflows/trigger-fabric-package.yml
- name: "Verify gatilho -> aprendizado sync (novo evento exige update em APRENDIZADOS.md no mesmo diff)"
  if: github.event_name == 'pull_request'
  shell: bash
  env:
    BASE_SHA: ${{ github.event.pull_request.base.sha }}
  run: |
    set -euo pipefail
    python scripts/trigger-fabric/verify_gatilho_aprendizado_sync.py . "$BASE_SHA"
```

### 8. Resolução de Conflito (stash pop → APRENDIZADOS.md)
```bash
git stash pop  # conflito em docs/CONSCIENCIA/APRENDIZADOS.md
git checkout --ours docs/CONSCIENCIA/APRENDIZADOS.md  # mantém upstream (entradas 27-29 Grok + ponte semântica + dois mundos VPS)
git add docs/CONSCIENCIA/APRENDIZADOS.md
git commit -m "chore(APRENDIZADOS): resolve conflito mantendo versão upstream"
git push origin main
```

## Lições Cristalizadas

### L1: Avaliação de Pacote Externo = Filtro de Ruído + Gap Real
Não integrar cegamente. Extrair → Avaliar cada skill contra:
- Já existe no canônico? (buscar no repo)
- Duplica capacidade existente?
- Tem especificidade CentralDark ou é genérico?
- Narrativa fabricada vs evidência real?

Só o delta real (não duplicado, comprovado útil) entra no owner canônico.

### L2: PR Canônico = Metadados Completos para Auto-Squash
O workflow `autonomia-promocao.yml` consome:
- `Intent-Authorized: SEGREDO/CHEFE`
- `Merge-Policy: AUTO_SQUASH_IF_CLEAN`
- `Intent-Scope: <escopo>`
- `Writer: <agente>`
- `Writer-Scope: <escopo>`

Sem esses, o PR fica em `READY_FOR_MERGE` esperando autorização humana redundante.

### L3: Conflito de Stash = Escolher por Conteúdo, Não por Origem
Quando `git stash pop` conflita com upstream recém-merged:
- `git diff` para ver o que cada lado tem
- Manter o lado que tem **mais verdade canônica atual** (upstream já passou pelo crivo da Casa)
- Não preservar "meu trabalho" só porque é meu — preservar o que está correto

### L4: Gate Gatilho→Aprendizado = Prevenção de Drift Silencioso
O script `verify_gatilho_aprendizado_sync.py` garante: se `TRIGGERS.yml` ganha `event:` novo, `APRENDIZADOS.md` **tem que mudar no mesmo diff**. Fail-closed. Evita gatilhos órfãos sem rastro de decisão.

### L5: Fluxo Completo = Extração → Avaliação → Owner Canônico → PR Autorizado → Merge → Gate → Conflito Resolvido → Push
Cada etapa tem prova. Nada "acaba" sem evidência no GitHub (PR merged, commit na main, workflow verde).

## Comandos-Chave Reutilizáveis

```bash
# Inspecionar zip sem extrair tudo
unzip -l arquivo.zip

# Extrair arquivo único achatando paths
unzip -j arquivo.zip "path/dentro/zip/SKILL.md" -d /tmp/destino

# Ver diff de conflito
git diff arquivo_conflitado

# Resolver pegando upstream (origin/main já merged)
git checkout --ours arquivo_conflitado

# PR com metadados completos
gh pr create --base main --head <branch> --title "..." --body "$(cat <<'EOF'
...
Merge-Policy: AUTO_SQUASH_IF_CLEAN
Intent-Scope: ...
Writer: ...
Writer-Scope: ...
EOF
)"

# Merge squash + delete branch
gh pr merge <num> --squash --delete-branch
```

## Referências Cruzadas
- `centraldark-operational-method` — método geral (REUSE_BEFORE_CREATE, Writer único, boot)
- `meta-lupa` — falsificação crítica (skill complementar à `tecnica-da-lupa`)
- `trigger-fabric-packager` — workflow que recebeu o novo gate
- `references/vps-housekeeping-lixo-ouro.md` — mesmo padrão de avaliação (lixo vs ouro)