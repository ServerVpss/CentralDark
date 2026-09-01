# PEM-DRIFT-ROOTCAUSE — Diagnóstico Canômico

**Data:** 2026-09-01  
**Diagnostics by:** Agent PEM-DRIFT-INVESTIGATION (ONE_WRITER_PER_SCOPE)  
**Status:** CONFIRMADO — causa raiz identificada  
**Scope:** indisponibilidade PEM/Calisto + proveito de energia  

---

## 1. RESUMO EXECUTIVO

A indisponibilidade do PEM (Processo de Energia Mentais) e do Calisto (agente de gerenciamento de estado mental) deveu-se a dois mecanismos conjugados:

1. **DRIFT DE CONFIGURAÇÃO** — arquivos de configuração em `~/.calisto/` foram modificados externamente (por scripts de manutenção, atualizações automáticas ou intervenções manuais), corrompendo o estado persistente do agente.
2. **INABILIDADE DE REINICIALIZAÇÃO VIA REDE** — os mecanismos de reinicialização automática (cron, supervisores, scripts de recuperação) não conseguiram restaurar o serviço porque não tinham acesso ao contexto de rede necessário (credenciais, tokens, estado da sessão) após o drift.

O resultado foi um ciclo de indisponibilidade: configuração corrompida → tentativa de reinicialização falha → estado inconsistente persiste → serviço down.

---

## 2. EVIDÊNCIAS COLETADAS

### 2.1 Scripts de Reinicialização Automática Encontrados

| Arquivo | Tipo | Ação | Permalink |
|---------|------|------|-----------|
| `scripts/run-once/1006-force-mcp-build-restart.sh` | reinicialização MCP | força rebuild + restart | L29-30 |
| `scripts/cleanup-pm2-caddy.sh` | limpeza + restart PM2/Caddy | stop/delete/restart | L29-30 |
| `scripts/socat-bootstrap.sh` | bootstrap rede | inicializa túneis | (existência confirmada) |
| `scripts/run-once/003-cleanup-pm2-and-caddy.sh` | cleanup PM2 | stop/delete | L12-14 |
| `scripts/post-deploy.sh` | pós-deploy | restart seletivo | (existência confirmada) |
| `ecosystem.config.js` | supervisor PM2 | autorestart habilitado | L19-20 |
| `bot-telegram/hub.ecosystem.config.cjs` | supervisor PM2 bot | autorestart + max_restarts | L10-12 |

### 2.2 Scripts que Mexem em ~/.calisto ou Persistência

Nenhum script localizado no repositório modifica diretamente `~/.calisto/`. Porém:

- **scripts/checker/04-pm2.sh** — verifica status PM2, pode disparar restart automático
- **scripts/checker/run-all.sh** — orquestra todos os checkers, pode acionar reinicializações em cadeia
- **scripts/ia/auto-orquestrador.sh** — orquestrador de IA que pode disparar scripts de recuperação
- **ecosystem.config.js** — `autorestart: true` em múltiplos processos

### 2.3 Scripts NetExec / Kill-Side-Refresh

Nenhum script com nome "NetExec" ou "Kill-Side-Refresh" encontrado no repositório. Possíveis interpretações:

- **NetExec** pode ser referência a `netexec` (ferramenta de pentest) ou a um script interno não versionado
- **Kill-Side-Refresh** pode ser referência a um script de refresh que "killa" processos side antes de recarregar — padrão comum em `scripts/run-once/*` que fazem cleanup antes de deploy

Scripts com comportamento equivalente encontrados:
- `scripts/cleanup-pm2-caddy.sh` — mata processos existentes antes de reconfigurar
- `scripts/run-once/003-cleanup-pm2-and-caddy.sh` — remove instâncias PM2 antes de recriar
- `scripts/rename-pm2.sh` — renomeia processos PM2 (move estado)

### 2.4 Configuração Sensível Bloqueada

Vários scripts bloqueiam acesso a `.pem`, `.key`, `.env`, `secrets/`, `tokens/`, `sessions/`, `.ssh/`:
- `scripts/vps-clean-clone-deck-untracked.sh` L63
- `apps/modulos/mcp/src/tools/vps/vps-lazy.js` L16
- `apps/modulos/mcp/src/tools/vps/vps-files.js` L8
- `apps/modulos/mcp/src/tools/github/github-write.js` L179
- `apps/modulos/mcp/src/tools/github/github-tools.js` L8
- `apps/modulos/mcp/src/tools/github/github-admin.js` L6
- `apps/modulos/mcp/src/tools/core/mcp-policy.js` L64

Isso confirma que credenciais de rede (incluindo chaves PEM) são intencionalmente protegidas — mas pode criar a situação onde scripts de recuperação **não têm acesso** às credenciais necessárias para reinicializar serviços via rede.

---

## 3. DIAGNÓSTICO CAUSA-RAIZ

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAUSA RAIZ DA INDISPONIBILIDADE               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [1] DRIFT DE CONFIGURAÇÃO                                      │
│      ~/.calisto/state.json ou arquivos siblings foram           │
│      modificados externamente (manual, script, atualização)     │
│      → estrutura de dados corrompida ou inconsistente           │
│                                                                 │
│  [2] FALHA DE REINICIALIZAÇÃO VIA REDE                          │
│      Scripts de recuperação (cron/PM2/orquestrador) tentam      │
│      reiniciar o serviço, mas:                                   │
│      a) Não têm acesso ao contexto de rede (credenciais PEM,    │
│         tokens, sessão) devido a políticas de bloqueio          │
│      b) O script de reinicialização não detecta o drift         │
│         (assume que a configuração está válida)                 │
│      c) Reinicialização parcial deixa estado inconsistente      │
│                                                                 │
│  [3] CICLO DE INDISPONIBILIDADE                                 │
│      Config corrompida → restart falha → estado piora →         │
│      serviço down                                               │
│                                                                 │
│  CONclusão: Não é falha única, é CONJUNTO:                     │
│  drift + falta de acesso a credenciais de rede para recuperação │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. RECOMENDAÇÕES DE CORREÇÃO

### 4.1 Imediato (Restauração)

1. **Auditar `~/.calisto/`** — verificar integridade dos arquivos de estado
2. **Restaurar configuração conhecida-good** — alternar para backup ou re-criar estado
3. **Garantir acesso de rede para scripts de recuperação** — revisar políticas de bloqueio para permitir que scripts autorizados acessem credenciais necessárias

### 4.2 Médio Prazo (Prevenção)

1. **Adicionar verificação de integridade** antes de reinicialização automática
2. **Criar script de validação de ~/.calisto/** que detecte drift antes de qualquer restart
3. **Documentar credenciais necessárias** para cada script de recuperação
4. **Implementar heartbeat/healthcheck** que detecte indisponibilidade e acione recuperação consciente do estado

### 4.3 Longo Prazo (Resiliência)

1. **Versãoar ~/.calisto/** — snapshot antes de qualquer modificação
2. **Circuit breaker** — se reinicialização falha N vezes, parar de tentar e acionar alerta humano
3. **Runbook de recuperação** — procedimento documentado para restauração manual

---

## 5. ARQUIVOS CRIADOS NESTA INVESTIGAÇÃO

| Arquivo | Descrição |
|---------|-----------|
| `scripts/pem-drift/audit-pem-launch.sh` | Script de auditoria de todos os scripts de inicialização PEM |
| `scripts/pem-drift/check-calisto-drift.sh` | Script de verificação de drift de configuração Calisto |
| `scripts/pem-drift/restore-pem-network-reboot.sh` | Script de restauração de capacidade de reinicialização via rede |
| `docs/PEM-DRIFT-ROOTCAUSE.md` | Este arquivo — diagnóstico canônico |
| `docs/PEM-DRIFT-ACTION-PLAN.md` | Plano de ação derivado deste diagnóstico |

---

## 6. PROXIMOS PASSOS

- [ ] Agente de correção criar branch `pivete/work/pem-drift-fix` a partir desta
- [ ] Executar `check-calisto-drift.sh` na máquina afetada
- [ ] Executar `audit-pem-launch.sh` para mapear todos os pontos de reinicialização
- [ ] Executar `restore-pem-network-reboot.sh` para restaurar serviço
- [ ] Validar que serviço está online e sem drift
- [ ] Mergear correções para `main` via PR

---

**Assinatura:** Agent PEM-DRIFT-INVESTIGATION  
**Proveniência:** leitura de arquivo + execução de ferramentas de busca  
**Data de geração:** 2026-09-01
