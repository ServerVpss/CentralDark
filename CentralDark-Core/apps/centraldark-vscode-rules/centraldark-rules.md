# 🛑 CentralDark — Regras Invioláveis

Estas são as regras fundamentais que governam todo o sistema CentralDark. Qualquer violação resulta em comportamento indefinido.

## 🔴 REGRAS CRÍTICAS (Nunca Quebrar)

### Rule #1: Nunca Expor Secrets ou Tokens
- **Violação:** Exibir service_role_key, API tokens, JWT secrets, ou qualquer credencial em logs, UI ou console
- **Consequência:** Comprometimento imediato de segurança
- **Validação:** Lint verifica variáveis de ambiente e arquivos de config

### Rule #2: Nunca Executar `pm2 restart all`
- **Violação:** Reiniciar todo o cluster PM2 simultaneamente
- **Consequência:** Downtime total do serviço; WhatsApp (id 1) fica travado
- **Validação:** Lint bloqueia comando em scripts de deploy

### Rule #3: Nunca Alterar `/root/whatsapp-server`
- **Violação:** Modificar arquivos do servidor WhatsApp
- **Consequência:** Perda de integração WhatsApp e id 1 fica STOPPED indefinidamente
- **Validação:** Lint detecta paths proibidos

### Rule #4: Nunca Ignorar Sincronia 4-Point
- **Violação:** Editar código direto na VPS em `/root/CentralDark/` sem passar por Lovable → GitHub
- **Consequência:** Perda de sincronização entre ambientes; conflitos irreversíveis
- **Fluxo Obrigatório:** Lovable → GitHub → VPS (Cérebro Vivo sempre por último)
- **Exceção:** Apenas emergência documentada com "PERMITO PIVETE" explícito
- **Validação:** Lint verifica sequência de commits e pushes

### Rule #5: Nunca Misturar Bots Telegram
- **Violação:** Enviar mensagens destinadas a @SEGREDOPUXADASBOT (TelePainel) via @srver1bot (Hub)
- **Consequência:** Mensagens privadas expostas; perda de isolamento de permissões
- **Mapeamento:**
  - **@srver1bot** = CENTRAL Hub (Supabase `lyoigsqluyktoclwdaft`) + VPS PM2 id 27
  - **@SEGREDOPUXADASBOT** = FISCAL (TelePainel Lovable Cloud `kagejpghnwdfymddwxuf`)
- **Validação:** Lint verifica routing de webhooks

### Rule #6: Nunca Alterar Áreas 🔒 Sem Permissão Explícita
- **Violação:** Modificar código marcado com 🔒 sem "PERMITO PIVETE" na mensagem
- **Consequência:** Corrupção de invariantes críticos
- **Validação:** Lint detecta símbolos 🔒 e bloqueia edição

### Rule #7: Nunca Deixar Variáveis Não-Documentadas
- **Violação:** Adicionar nova variável de ambiente ou config sem doc
- **Consequência:** Configuração perdida em redeploy; sistema quebrado
- **Validação:** Lint exige comments explicativos

### Rule #8: Nunca Quebrar a Sequência Lovable → GitHub
- **Violação:** Pushear para GitHub mudanças que não vieram de Lovable
- **Consequência:** Código não pode ser editado em Lovable depois; sincronização unidirecional
- **Validação:** Lint verifica origem de commits

## 🟡 REGRAS CRÍTICAS (Avisar se Violar)

### Rule #9: Preferir Create Sobre Update
- **Regra:** Para mudanças, prefira `create_task` a reusar task antiga
- **Razão:** Histórico claro; rastreamento de trabalho granular
- **Aviso:** Se reusando task >24h, pedir confirmação

### Rule #10: Documentar Decisões de Arquitetura
- **Regra:** Toda mudança no fluxo 4-point deve ser documentada em `docs/CONSCIENCIA/`
- **Validação:** Lint verifica se há comentários de razão em código crítico

### Rule #11: Never Commit Directly to Main Sem PR
- **Violação:** Pushear para main sem review
- **Consequência:** Código não rastreado; revert impossível
- **Validação:** GitHub branch protection + lint local

### Rule #12: Respeitar Status de Agentes
- **Violação:** Iniciar novo trabalho sem `set_terminal_status(working)`
- **Validação:** Lint avisa se status==clear quando há trabalho em andamento

## 🟢 REGRAS DE MELHOR PRÁTICA (Lint Avisa)

### Rule #13: Usar Nomenclatura Consistente
- Commands: `centraldark.*` (ex: `centraldarkGit.status`)
- Variables: `CENTRALDARK_*` (ex: `CENTRALDARK_HUB_URL`)
- Commits: PT-BR com emoji (ex: 🟢 sucesso, 🔴 erro)

### Rule #14: Logar Decisões Importantes
- **Aviso:** Toda decisão arquitetural = comentário de código + PR comment
- **Lint:** Detecta blocos sensíveis sem comentários

### Rule #15: Testar Localmente Antes de Deploy
- **Regra:** Nunca deploy direto para VPS sem test local
- **Lint:** Avisa se mudança afeta PM2 sem evidence de test

---

## 🚀 Como Usar Este Arquivo

1. **Extensão VS Code:** Carregue via `CentralDark: Load Rules` command palette
2. **Linter:** Valida automático ao salvar; bloqueia violações de 🛑
3. **Syntax Highlight:** Grupos de regras destacados por nível (🛑 crítico, 🟡 aviso, 🟢 info)
4. **Status Bar:** 🟢 rules loaded quando validação passar

---

**Última atualização:** 2026-10-15  
**Responsável:** CentralDark Pivete System  
**Versão:** 1.0
