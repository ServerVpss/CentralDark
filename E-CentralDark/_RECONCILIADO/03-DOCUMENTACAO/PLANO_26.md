# PLANO — skills/

## Pronto
- [x] Estrutura `skills/centraldark-consciencia/` com SKILL.md + README + scripts
- [x] Tools `skill_*` no MCP CentralDark (listar, instalar, status, atualizar)
- [x] Workflow `consciencia-sync.yml` regenera `pendencias-ativas.md` quando `docs/PENDENCIAS.md` muda
- [x] Doc `docs/INSTALADOR/30-skill-consciencia.md` com os 3 caminhos
- [x] Doc `docs/CONSCIENCIA/11-SKIL-SH.md` explicando o protocolo
- [x] Script `scripts/instalar-consciencia.sh` (auxiliar pra terminal)
- [x] **Rotas públicas no cérebro** — `mcp.centralldark.com/skills/*` e `install.centralldark.com/skills/*` servem direto via `curl`, sem auth, sem mirror externo. Substitui o `skil.sh`.

## Dispensado
- ~~Criar repo público `segredounlock/centraldark-consciencia` (mirror)~~ — não é mais necessário, o cérebro serve direto
- ~~Workflow `consciencia-mirror.yml`~~ — idem

## Próximo (quando confirmar)
- [ ] Testar `curl -sL https://mcp.centralldark.com/skills/centraldark-consciencia/install.sh | bash` em Claude Code real
- [ ] Adicionar mais skills: `deploy-3-camadas`, `ssh-vps-rapido`, `github-farm-medalhas`
