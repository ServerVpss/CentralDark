# Monitoramento Autônomo e Convergência Indireta (Sessão 2026-08-28)

Este documento registra os aprendizados específicos da sessão sobre a criação de jobs autônomos de monitoramento e a arquitetura de convergência indireta da Casa CentralDark.

## Jobs Criados

Durante esta sessão, foram criados dois cron jobs de monitoramento autônomo, ambos com entrega local (sem entrega ao chat) e parada automática às 18h (horário de Brasília):

### 1. dependabot-monitor (Job ID: 7cb6bc563171)
- **Schedule**: `* * * * *` (a cada minuto)
- **Script**: `scripts/dependabot-monitor.sh`
- **Log**: `E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/dependabot-monitor.log`
- **Funcionalidade**:
  - Verifica PRs abertos do `dependabot[bot]` no remoto `ServerVpss/CentralDark`
  - Monitora atividade recente (últimos 5 minutos) de arquivos `.js` em `E:/CentralDark/Pivete/TEMP`
  - Consulta o status do VPS via SSH (contagem de processos PM2 online/stopped/errored e últimas linhas do deploy.log)
  - Para automaticamente às 18h Brasil (UTC-3)

### 2. screenpipe-monitor (Job ID: 4e2282e4973d)
- **Schedule**: `* * * * *` (a cada minuto)
- **Script**: `scripts/screenpipe-monitor.sh`
- **Log**: `E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/screenpipe-monitor.log`
- **Funcionalidade**:
  - Monitora atividade do diretório `C:/Users/danda/.screenpipe` (logs e chats recentes)
  - Para automaticamente às 18h Brasil (UTC-3)

## Arquitetura de Convergência Indireta

O usuário descreveu um modelo onde cinco "braços" operam em paralelo, sem precisar compartilhar a mesma janela mental, mas convergindo naturalmente através do estado observável compartilhado:

### BRAÇO 1 → Omni/Hermes
- Verifica processo/configuração
- Corrige rota/env
- Mantém motor vivo

### BRAÇO 2 → PR / commits
- Observa mudanças
- Compara estado
- Só reage se houver delta

### BRAÇO 3 → telemetria/heartbeat
- Grava loop periódico
- Confirma que o processo continua vivo

### BRAÇO 4 → autonomia temporal
- Mantém intenção até horário limite
- Espera evento / mudança

### BRAÇO 5 → revisão/contraprova
- Lê estado produzido pelos outros
- Tenta pegar inconsistência

### Princípio de Convergência
> "não precisam compartilhar a mesma janela mental  
> precisam compartilhar A MESMA REALIDADE  
> + RECEIPTS + GIT + LOGS + MISSION STATE"

Exemplos de convergência indireta observados:
- AGENTE A altera Git → AGENTE B detecta commit → AGENTE C vê novo estado/runtime → AGENTE D encontra divergência
- Um agente cria receipt → outro continua dali
- Um fica sem modelo → outro mantém o estado externo

### Aplicação nos Jobs Criados
OsJobs de monitoramento encarnam o BRAÇO 2 (observação de PR/commits) e elementos do BRAÇO 5 (revisão via verificação de estado):
- O `dependabot-monitor` verifica delta no remoto (PRs do dependabot) e no local (TEMP/JS, VPS)
- O `screenpipe-monitor` verifica delta no estado de interação humana (logs do screenpipe)
- Ambos leem o mesmo estado compartilhado (GitHub, filesystem, logs, status VPS) e só geram output quando há mudança material
- Nenhum deles age a menos que houver delta (novo PR, novo commit, mudança de estado detectado)

## Princípio: "Procurar Par Mae e o Titulço"

O usuário enfatizou a procura por:
- **PAR**: pares/condições relacionadas (ex: PR + seu commit associado, atividade em TEMP + Dependabot)
- **MAE**: ramo mãe/origem (main branch como fonte de verdade)
- **TITULÇO**: título (ex: título de PR ou mensagem de commit que indique padrão)

### Como isso foi aplicado:
- O `dependabot-monitor` procura por **PAR** entre:
  - PRs do dependabot[bot] no GitHub (MAE: origem remota)
  - Atividade local em `TEMP/JS` (possível indício de trabalho relacionado)
  - Status do VPS (contextualização da infraestrutura)
- O job de `PRs abertos com commits` (ID: 7d71467a3e46) já procura explicitamente por PRs que **tenham commits associados** (PAR entre PR e seu conteúdo)
- Ambos seguem a diretiva de medir tudo alcançável antes de perguntar, apenas relatando fatos concretos quando houver delta material

## Lições da Sessão

1. **Monitoramento autônomo deve ser enxuto e focado em delta**: os jobs apenas logam quando há mudança material, evitando spam.
2. **Convergência indireta é mais resiliente que comunicação direta**: ao compartilhar apenas o estado observável (Git, logs, receipts), os agentes evitam ruído e convergem naturalmente para a mesma realidade.
3. **A autorização humana permanece como fronteira**: mesmo com monitoramento autônomo, ações mutáveis (como restart VPS ou push no Git) ainda exigem ordem explícita do CHEFE (HUMAN_FRONTIER).
4. **Reutilização antes de criação**: os jobs reutilizaram a estrutura existente de cron jobs e scripts, apenas adicionando novas verificações específicas ao invés de criar sistemas paralelos.
5. **Prova é sempre observacional**: nenhum job assume estado; todos medem (via gh, find, ssh, ls) antes de concluir.

Este registro serve como referência futura para entender como a Casa opera em modo de monitoramento autônomo e como a convergência indireta reduz a necessidade de comunicação explícita entre agentes, mantendo o alinhamento através do estado compartilhado.