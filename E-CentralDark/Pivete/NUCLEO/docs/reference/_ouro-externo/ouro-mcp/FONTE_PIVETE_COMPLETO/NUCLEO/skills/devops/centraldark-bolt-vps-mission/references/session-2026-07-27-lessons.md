# Lições da Sessão 2026-07-27 — Missão CentralDark Bolt + VPS

## Contexto
- Missão: Inventariar Bolt na VPS, ativar preview, integrar com Casa
- Autorização: PIVETE_AUTORIZA_EXECUCAO=SIM
- Stack: Bolt (Remix + Vite + AI SDK) + VPS (Docker) + Casa (Hermes Desktop)
- Autoridade: Pivete (decisão final)

## Lições Críticas (Pitfalls)

### 1. VPS Inacessível ≠ Bloqueio Total
- **Sintoma**: SSH timeout para 89.117.78.124, builder.centralldark.com 404, api.centralldark.com/v1 401
- **Causa raiz**: SSH timeout, Caddy não sobe, DNS não aponta, Gateway key morta (SEGREDO_ELITE_123 revogada)
- **Lição**: VPS inacessível NÃO bloqueia inventário local, leitura de código, extração de fórmulas, documentação de lacunas. Separar "reconhecimento read-only" (offline) de "execução na VPS" (precisa conectividade).

### 2. Gateway Key Morta = Rota de Modelo Quebrada
- **Sintoma**: `api.centralldark.com/v1` = 401, Anthropic via gateway morta
- **Causa**: `SEGREDO_ELITE_123` revogada/expirada
- **Fallback real**: Modelo local via OpenRouter (`qwen3-coder-480b` via OpenRouter) — funciona se API key válida no cookie
- **Ação**: Renovar gateway key OU configurar rota direta OpenRouter no cookie

### 3. Preview 404 ≠ Container Parado
- **Sintoma**: `https://builder.centralldark.com` = 404
- **Realidade**: Container `CentralDark-Builder` Up, porta 5174 exposta, HTTP 200 local
- **Causa**: Caddy não sobe como reverse proxy, DNS não aponta, gateway quebrado
- **Lição**: Preview 404 ≠ container parado. Verificar cadeia: Container → Porta → Caddy/Proxy → DNS → Gateway → Modelo.

### 4. Docker no Windows Host (MSYS/Git Bash)
- **Sintoma**: `docker: command not found`
- **Causa**: Docker Desktop não rodando ou não exposto no PATH
- **Fix**: Verificar `docker.exe` em `C:\Program Files\Docker\Docker\resources\bin\docker.exe` e adicionar ao PATH do Windows

### 4. Opção 1 "Subir Container Local" = Casa, NÃO VPS
- `docker compose up -d` roda no PC do Pivete (Casa)
- VPS só entra na Fase 3 do plano
- Não confundir ambiente local com VPS

### 5. Gateway Key Morta = Rota de Modelo Quebrada
- `SEGREDO_ELITE_123` morta = `api.centralldark.com/v1` 401 = Anthropic via gateway morto
- Fallback real: modelo local via OpenRouter (`qwen3-coder-480b` via OpenRouter) — funciona se API key válida no cookie

### 5. Preview 404 ≠ Container Parado
- Container `CentralDark-Builder` Up, porta 5174 exposta, HTTP 200 local
- 404 no domínio = Caddy/DNS/gateway, não container

### 6. Docker no Windows Host
- `docker` command not found no MSYS/Git Bash = Docker Desktop não rodando ou não exposto no PATH
- Verificar `docker.exe` em `C:\Program Files\Docker\Docker\resources\bin\docker.exe` e adicionar ao PATH do Windows

### 6. Opção 1 "Subir Container Local" = Casa, Não VPS
- `docker compose up -d` roda no PC do Pivete (Casa)
- VPS só entra na Fase 3 do plano
- Não confundir ambiente local com VPS

### 7. Gateway Key Morta = Rota de Modelo Quebrada
- `SEGREDO_ELITE_123` morta = `api.centralldark.com/v1` 401 = Anthropic via gateway morto
- Fallback real: modelo local via OpenRouter (`qwen3-coder-480b` via OpenRouter) — funciona se API key válida no cookie

### 7. Preview 404 ≠ Container Parado
- Container `CentralDark-Builder` Up, porta 5174 exposta, HTTP 200 local
- 404 no domínio = Caddy/DNS/gateway, não container

### 8. Docker no Windows Host
- `docker` command not found no MSYS/Git Bash = Docker Desktop não rodando ou não exposto no PATH
- Verificar `docker.exe` em `C:\Program Files\Docker\Docker\resources\bin\docker.exe` e adicionar ao PATH do Windows

### 8. Opção 1 "Subir Container Local" = Casa, Não VPS
- `docker compose up -d` roda no PC do Pivete (Casa)
- VPS só entra na Fase 3 do plano
- Não confundir ambiente local com VPS

### 9. META LUPA Formal Funcionou
- BEGIN/FINAL registrados no ledger canônico (`usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d`)
- 140 itens classificados em 5 classes (A=19, B=28, C=16, D=40, E=36)
- 3 lacunas críticas, 13 menores, 76 itens D+E rejeitados
- Veredito: CONDICIONAR (fechar 3 lacunas críticas, documentar 13 no backlog, rejeitar 100% D/E)

### 10. PR #385 Mergeado (meta-lupa)
- Branch `feat/bolt-lovable-bridge-2026-07-26` merged into `main`
- Commit `507dc621f666bce463f2bf7aeebf46b5227a88cc76`
- 63/63 testes verdes, ledger íntegro

### 11. Manual da Casa Atualizado
- Seção `#opus-5-formulas` adicionada com 10 fórmulas extraídas (76 itens D+E → 10 fórmulas)
- Seção `#opus-5-analise` atualizada com veredito CONDICIONAR
- TOC atualizado com link "Fórmulas Extraídas"

### 12. Nova Skill Criada
- `centraldark-bolt-vps-mission` (devops) — missão canônica com META LUPA formal

---

## Próximos Passos (Pivete Decide)

| Opção | Ação |
|---|---|
| **Fechar 3 lacunas críticas** | 1. Árvore tool routing no gateway/HERMES-CORE<br>2. `if_version` + auto-merge nas 3 temperaturas<br>3. Frases proibidas em `SOUL.md`/`04-COMUNICACAO.md` |
| **Documentar 13 lacunas no backlog** | Issues/tarefas META LUPA para futura sprint |
| **Nada** | Stack já 80-95% coberto |

---

## Comandos de Referência Rápida

```bash
# Subir builder na VPS
ssh Segredo-VPS "cd /root/CentralDark && docker compose -f apps/modulos/Bolt/docker-compose.yml up -d"

# Ver logs builder
ssh Segredo-VPS "docker logs CentralDark-Builder --tail 100"

# Verificar Caddy
ssh Segredo-VPS "docker ps -a --filter name=caddy"

# Testar preview local
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5174

# Verificar DNS
dig builder.centralldark.com +short
```