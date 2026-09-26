# Forensic Attribution — Session Notes, 2026-08-28

## Background

Nesta sessão, foi executado hardening de deploy do CentralDark com três componentes:
- Política de deploy (`docs/GOVERNANCA/deploy-policy.md`)
- Script de forense de atribuição (`scripts/vps/forensics-attribution.sh`)
- Patch no workflow canônico (`.github/workflows/vps-exec-selfhosted.yml`) com chattr preflight

## O que foi criado

### `docs/GOVERNANCA/deploy-policy.md`
Política de deploy com:
- Princípios: segurança antes de mutação, prova com rastreabilidade, forense antes de diagnóstico, health como corpo não apenas HTTP 200, estabilidade como janela não instante
- Preflight de segurança: chattr, dirty state, validação de ambiente
- Preflight de build: build isolado, npm ci, typecheck, testes, build
- Validação de dist: dist existe, hash registrado, promoção atômica
- Runtime validation: health check com corpo, janela de estabilidade 20s/5 amostras, verificação de processo efêmero, proveniência (VPS HEAD == main SHA)
- Forensics protocol: T0 → worker/PID → código → runtime → causa
- Rollback protocol: hotfix → restaurar dist → restart → validar → documentar
- Registro de deploy: SHA, hash do dist, PID, timestamp, resultado, logs
- Revisão de segurança: diff de segurança, revisão humana, registro de aprovação
- Aprendizado: incidentes geram documento, regras atualizadas com falhas reais, padrões de forense refinados

### `scripts/vps/forensics-attribution.sh`
Script de forense de atribuição que captura:
- Timestamp do evento
- Atribuição de worker/PID (se identificável via pgrep)
- Git HEAD no momento da forense
- Mtime e hash do dist
- Status de escuta de porta (9100 para MCP)

O script é robusto a ferramentas ausentes — registra UNKNOWN para campos não capturáveis.

### Patch no workflow canônico
Stage de chattr preflight adicionado ao `vps-exec-selfhosted.yml`:
- Verifica chattr +i em arquivos rastreados do MCP (dist, src)
- Bloqueia deploy se chattr detectado, com causa explícita
- Não substitui owner canônico — estende com delta mínimo

## Verificação

- Bash syntax: `bash -n` passou (exit 0)
- Shellcheck: indisponível neste ambiente (limitação, não falha)
- Execução local: executado em /tmp com evento de teste, sem side effects, completou limpo
- Script executável: chmod +x aplicado

## Limitações conhecidas

- Script requer pgrep, ss, git, sha256sum, stat no ambiente alvo
- Essas ferramentas podem não estar disponíveis em todos os ambientes
- Script lida graciosamente com ferramentas ausentes registrando UNKNOWN
- Teste local não pode verificar comportamento real na VPS sem acesso SSH

## Prova

- Arquivo `docs/GOVERNANCA/deploy-policy.md` criado e verificado (write_file com verified: true)
- Arquivo `scripts/vps/forensics-attribution.sh` criado e verificado (write_file com verified: true)
- Script tornavel executável (chmod +x aplicado)
- Sintaxe bash verificada (bash -n exit 0)
- Execução sem side effects verificada (bash -x em /tmp)
- Patch no workflow canônico com delta mínimo (não criou paralelo)

## Raw learnings

- O owner canônico do deploy MCP é `vps-exec-selfhosted.yml`, não um script isolado
- Criar `mcp-deploy-pipeline.yml` novo seria duplicata não revisada
- Delta real: absorver guard chattr/lsattr dentro do workflow existente como stage preflight
- Provar que nenhum segundo deploy path nasceu é parte do fechamento
- Forense precede diagnóstico: event → worker/PID → código → runtime → causa
- Health é corpo, não apenas HTTP 200 — verificar `.ok == true` e `.service == "mcp-centraldark"`
- Estabilidade é janela, não instante — 5 amostras em 20s, não sleep 6 + health
- UNKNOWN em atribuição não é causa — não converter em causa
