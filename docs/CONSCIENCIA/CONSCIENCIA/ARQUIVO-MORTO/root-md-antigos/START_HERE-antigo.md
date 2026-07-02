<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# START HERE — MultiZap / clone-deck

> **LEIA ESTE ARQUIVO ANTES DE QUALQUER AÇÃO.**

---

## Ponto de Entrada Obrigatório

Ao iniciar qualquer sessão de IA/Arena neste projeto, leia nesta ordem:

1. `START_HERE.md` ← ESTE ARQUIVO
2. `conexao-ia/START_HERE.md` — conexão GitHub/VPS/webhook
3. `conexao-ia/VPS_CONNECTION.md` — detalhes da VPS
4. `conexao-ia/CHECKLIST.md` — checklist operacional
5. `docs/AGENTS.md` — regras do agente
6. `docs/STATE.md` — estado atual do projeto
7. `docs/WHATSAPP_CONNECTION_MAP.md` — mapa da conexão WhatsApp ativa
8. `docs/deploy.md` — fluxo de deploy
9. `docs/SUPABASE_WORKFLOW.md` — migrations via GitHub Actions
10. `apps/bot/skills/config/skills.json` — skills disponíveis
11. **`security/START_HERE.md`** — 🛡️ **Start Here da Segurança** (obrigatório antes de alterar RLS, auth, secrets)
12. `security/README.md` — documento completo de auditoria

---

## Regra Permanente: Organização, Limpeza e Revisão

> **Todo agente que trabalhar neste projeto deve seguir estas regras SEMPRE.**

### 1. Trabalhar com consciência e organização

- Antes de alterar qualquer coisa, entenda onde está mexendo.
- Nunca criar arquivos soltos sem necessidade.
- Nunca espalhar scripts, logs, backups ou relatórios em lugares aleatórios.
- Sempre manter a estrutura limpa, clara e fácil de entender.
- O projeto precisa ser organizado para uma pessoa leiga conseguir entender o estado geral sem precisar ler código complexo.

### 2. Toda ação precisa deixar rastro revisável

Sempre que executar diagnóstico, build, deploy, correção ou teste, salvar os resultados em pasta própria de revisão:

```
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/
```

Dentro dela, salvar quando aplicável:

| Arquivo | Conteúdo |
|---------|----------|
| `resumo.md` | O que foi feito em linguagem simples |
| `comandos-executados.log` | Comandos rodados |
| `erros-encontrados.log` | Erros encontrados |
| `correcoes-feitas.md` | Correções aplicadas |
| `arquivos-alterados.txt` | Lista de arquivos modificados |
| `pm2-status.log` | Estado do PM2 |
| `caddy-status.log` | Estado do Caddy |
| `docker-status.log` | Estado do Docker |
| `portas.log` | Portas em uso |
| `build.log` | Resultado do build |
| `testes-http.log` | Testes de URLs |
| `pendencias.md` | O que ficou pendente |

- Nunca misturar logs antigos com logs novos.
- Cada rodada precisa ter sua própria pasta.

### 3. Relatório simples para leigos

Sempre gerar um `resumo.md` com linguagem simples explicando:

- O que foi feito
- O que estava errado
- O que foi corrigido
- O que ainda está pendente
- Quais serviços estão funcionando
- Quais serviços estão com problema
- O que precisa ser feito depois

Evitar excesso de termos técnicos no resumo principal. Se precisar de detalhes técnicos, colocar em arquivos separados.

### 4. Limpeza obrigatória

Depois de qualquer correção, o agente deve:

- ✅ Remover arquivos temporários inúteis
- ✅ Organizar scripts criados
- ✅ Mover logs para a pasta de revisão
- ❌ Não deixar comandos soltos
- ❌ Não deixar arquivos duplicados sem explicação
- ❌ Não deixar processo PM2 duplicado
- ❌ Não deixar porta ocupada por processo fantasma
- ❌ Não deixar backup sem identificação
- ❌ Não deixar `test.js`, `temp.js`, `debug.js` ou similares espalhados

Se algum arquivo temporário precisar ficar, explicar no relatório o motivo.

### 5. Código com erro deve ser tratado

Se encontrar erro no código:

1. Identificar o arquivo
2. Explicar o erro
3. Corrigir se for seguro
4. Testar depois da correção
5. Registrar no relatório

- ❌ Não pode ignorar erro repetido em log
- ❌ Não pode esconder erro
- ❌ Não pode dizer que está tudo certo se ainda existe erro crítico

### 6. Backup antes de alteração com risco

Antes de alterar arquivos importantes, criar backup:

- `.env`
- `Caddyfile`
- `package.json`
- lockfiles
- `ecosystem.config.js`
- scripts de deploy
- configurações de Docker
- arquivos de sessão WhatsApp
- migrations SQL
- configurações do Supabase

Nunca imprimir valores secretos no log. Pode listar nomes de variáveis, nunca valores.

### 7. Logs organizados por módulo

Sempre separar logs por área:

```
/root/Multizap/revisoes/YYYYMMDD-HHMMSS/logs/
├── crm/
├── web/
├── bot/
├── consciencia/
├── notificacoes/
├── wuzapi/
├── supabase/
├── caddy/
├── pm2/
├── docker/
├── gateway/
└── whatsapp/
```

### 8. Organização dos módulos

Nomes de pasta sempre sem acento:

- `apps/consciencia` (visual: "Consciência")
- `apps/notificacoes` (visual: "Notificações")
- `apps/crm`
- `apps/bot`
- `apps/web`
- `apps/portal` (se necessário)

### 9. Nada de gambiarra escondida

Se fizer solução temporária, marcar claramente:

```markdown
## Soluções Temporárias
- **O quê:** [descrição]
- **Onde:** [arquivo/pasta]
- **Por quê:** [motivo]
- **Risco:** [baixo/médio/alto]
- **Substituir por:** [solução definitiva]
```

### 10. Critério para dizer "finalizado"

O agente só pode dizer que finalizou quando entregar:

- ✅ Pasta de revisão criada
- ✅ Resumo simples criado
- ✅ Logs salvos
- ✅ Erros críticos tratados ou documentados
- ✅ Build/teste executado quando aplicável
- ✅ PM2/Caddy/Docker conferidos quando aplicável
- ✅ Pendências listadas
- ✅ Próximos passos claros

**Frases proibidas:**
- ❌ "parece estar certo"
- ❌ "deve funcionar"
- ❌ "provavelmente resolveu"
- ❌ "zero risco"

**Frases corretas:**
- ✅ "testado e passou"
- ✅ "testado e falhou"
- ✅ "não testado, motivo: ..."
- ✅ "pendente, motivo: ..."

### 11. Regra principal

**Sempre deixar o projeto mais limpo do que encontrou.**

Se uma ação bagunçou a estrutura, o agente deve organizar antes de encerrar.

---

## Execução Remota na VPS (Run-Once)

### Como rodar comandos na VPS sem SSH:

```
1. Crie um script em: scripts/run-once/XXX-descricao.sh
2. Commit + push na main
3. O post-deploy na VPS executa automaticamente
4. Script move para scripts/run-once/done/ após execução
5. Log em /var/log/clone-deck-run-once.log
```

### Exemplo:
```bash
cat > scripts/run-once/002-check-docker.sh << 'EOF'
#!/bin/bash
echo "=== DOCKER STATUS ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "=== PM2 ==="
pm2 status
echo "=== PORTAS ==="
ss -tulpn | grep LISTEN
EOF
```

### Regras:
- Scripts rodam 1x e são movidos para `done/`
- NÃO colocar secrets nos scripts (vão pro Git)
- Para usar secrets: `source /root/Multizap/secrets/wabot.env`
- Timeout: 5 minutos por script
- Log completo em `/var/log/clone-deck-run-once.log`
- Use numeração: `001-`, `002-`, etc. (executa em ordem)

### Quando usar:
- Diagnóstico da VPS
- Backup de sessão
- Verificar containers Docker
- Verificar PM2
- Verificar portas
- Verificar logs
- Qualquer comando que precisaria de SSH

---

## Skills Ativadas

### Metodologia (leitura obrigatória):
| Skill | Arquivo |
|-------|---------|
| Code Review | `apps/bot/skills/code-review/SKILL.md` |
| Documentation Memory | `apps/bot/skills/documentation-memory/SKILL.md` |
| Runtime Error Prevention | `apps/bot/skills/runtime-error-prevention/SKILL.md` |
| Systematic Debugging | `apps/bot/skills/systematic-debugging/SKILL.md` |
| Using Superpowers | `apps/bot/skills/using-superpowers/SKILL.md` |
| Verification Before Completion | `apps/bot/skills/verification-before-completion/SKILL.md` |
| Writing Plans | `apps/bot/skills/writing-plans/SKILL.md` |

### Executáveis:
| Skill | Arquivo | Função |
|-------|---------|--------|
| Find Skills | `apps/bot/skills/externas/find-skills.cjs` | Buscar skills no marketplace |
| Brainstorming | `apps/bot/skills/externas/brainstorming.cjs` | Geração de ideias |

---

## Fluxo Oficial

```
Arena/IA → edita código → commit + push na main
  → GitHub webhook → VPS faz git pull
  → post-deploy.sh roda
  → run-once scripts executam (se houver)
  → builds rodam
  → PM2 reinicia serviços
  → Caddy recarrega
```

---

## Estrutura do Projeto

```
clone-deck/
├── apps/bot/          → Bot WhatsApp (React + Vite)
├── apps/crm/          → CRM Multicanal (TanStack Start SSR)
├── apps/web/          → Landing Page
├── apps/consciencia/  → Centro WhatsApp
├── apps/notificacoes/ → Centro de Notificações
├── apps/portal/       → Portal de Módulos
├── infra/             → Supabase migrations, deploy, webhook
├── scripts/           → Scripts de automação VPS
├── scripts/run-once/  → Scripts de execução remota (1x)
├── conexao-ia/        → Memória de conexão IA/VPS
├── docs/              → Documentação do projeto
└── START_HERE.md      → ESTE ARQUIVO
```

---

## Conexão WhatsApp Ativa

**Status:** CONECTADA — NÃO MEXER sem backup validado

Detalhes completos em: `docs/WHATSAPP_CONNECTION_MAP.md`

Resumo:
- WuzAPI rodando em Docker (porta 127.0.0.1:8081)
- Whatsmeow como runtime
- Gateway Node.js na porta 3100
- Sessão ativa com número conectado
- Dados da sessão no banco PostgreSQL do Docker

---

## Regras Absolutas

- ❌ Nunca expor secrets, tokens, passwords, JWT, API keys
- ❌ Nunca commitar `.env` com valores reais
- ❌ Nunca mexer em `/root/whatsapp-server` (Recargas Brasil)
- ❌ Nunca usar `pm2 restart all`
- ❌ Nunca derrubar Docker WuzAPI sem backup
- ❌ Nunca apagar sessão WhatsApp
- ❌ Nunca force push
- ✅ Sempre salvar memória no GitHub (commit + push)
- ✅ Sempre usar run-once para comandos na VPS
- ✅ Sempre ler skills antes de trabalhar
- ✅ Sempre verificar backup antes de reestruturar
- ✅ Sempre documentar o que fez
- ✅ Sempre deixar o projeto mais limpo do que encontrou
- ✅ Sempre criar pasta de revisão com relatório

---

## Próximo Passo Atual

1. ✅ Backup da sessão WhatsApp (via run-once)
2. 🔜 Validar backup
3. 🔜 Criar `apps/consciencia`
4. 🔜 Criar `apps/notificacoes`
5. 🔜 Integrar CRM e Bot ao novo módulo
6. 🔜 Fechar CRM SSR (allowedHosts + env vars + RPCs)

---

## Regra Permanente: Autonomia Operacional do Agente

> **O agente DEVE executar via run-once. NÃO pedir comandos ao usuário.**

### O agente EXECUTA sozinho via run-once:
- Diagnóstico, auditoria, build, teste
- Leitura de logs, PM2, Docker, Caddy
- Verificação de portas, rotas, backups
- Testes HTTP, curl, validações
- npm install, npm run build
- git pull, git status

### O agente SÓ PEDE confirmação para ações perigosas:
- Apagar arquivos/pastas
- Remover processos PM2
- Parar WuzAPI/Docker
- Alterar .env ou webhook ativo
- Derrubar serviço em produção
- Alterar Caddy sem backup
- Resetar sessão WhatsApp

### Como executar:
1. Criar script em `scripts/run-once/NNN-descricao.sh`
2. Commit + push na main
3. Post-deploy executa automaticamente
4. Validar resultado via Supabase logs ou webhook /logs

### Frases PROIBIDAS:
- ❌ "Rode na VPS..."
- ❌ "Execute este comando..."
- ❌ "Tenta aí..."
- ❌ "Confere na VPS..."

### Frases CORRETAS:
- ✅ "Vou criar um run-once para executar..."
- ✅ "Executado. Resultado: ..."
- ✅ "Testado e passou/falhou. Evidência: ..."

### O problema do run-once não executar automaticamente:
Se o post-deploy não chamar o run-once executor, o agente deve:
1. Verificar o post-deploy.sh tem a chamada do executor
2. Corrigir se necessário
3. Se urgente, incluir chamada direta no post-deploy
4. NUNCA pedir ao usuário para rodar manualmente


## Segurança (Obrigatório)

**Segurança é obrigatória em toda alteração.** Antes de qualquer implementação, ler `security/README.md` e aplicar o checklist.

Toda alteração daqui para frente deve nascer com segurança aplicada, não corrigida depois. Sempre que criar, alterar ou diagnosticar qualquer módulo, aplicar segurança desde o início.
