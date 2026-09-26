# COMANDO - START_HERE-antigo.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\CONSCIENCIA\ARQUIVO-MORTO\root-md-antigos\START_HERE-antigo.md
**SHA:** c1931b8aeffd0e8f
**Timestamp:** 2026-08-26T19:32:48.164238
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- - **Risco:** [baixo/médio/alto]

### Ouro Bruto (primeiros 5000 chars)
```
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

O agente só pode diz
```