# Arquitetura de Convergência Indireta e Monitoramento Autônomo
# Sessão 2026-08-28 - Aprendizados da Casa CentralDark

Este documento registra os aprendizados específicos sobre a arquitetura de operação da Casa observada nesta sessão, focando em:
1. Monitoramento autônomo via cron jobs
2. Arquitetura de convergência indireta entre agentes/processos
3. Princípio de "executa, não fica propondo"
4. Aplicação do filtro "menos é mais" na comunicação e ação

## 1. Jobs Autônomos Criados

Durante esta sessão, foram estabelecidos dois cron jobs de monitoramento autônomo, ambos configurados para:
- Executar a cada minuto (`* * * * *`)
- Entregar output apenas localmente (sem entrega ao chat)
- Parar automaticamente às 18h horário de Brasília (UTC-3)
- Apenas logar quando houver delta material (evitando spam)

### 1.1 dependabot-monitor (Job ID: 7cb6bc563171)
- **Script**: `scripts/dependabot-monitor.sh`
- **Log**: `E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/dependabot-monitor.log`
- **Funcionalidade**:
  - Verifica PRs abertos do usuário `dependabot[bot]` no remoto `ServerVpss/CentralDark`
  - Monitora atividade recente (últimos 5 minutos) de arquivos `.js` em `E:/CentralDark/Pivete/TEMP`
  - Consulta o status do VPS via SSH:
    - Contagem de processos PM2 online/stopped/errored
    - Últimas linhas do deploy.log (se disponível)
  - Para automaticamente às 18h Brasil (UTC-3)

### 1.2 screenpipe-monitor (Job ID: 4e2282e4973d)
- **Script**: `scripts/screenpipe-monitor.sh`
- **Log**: `E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/screenpipe-monitor.log`
- **Funcionalidade**:
  - Monitora atividade do diretório `C:/Users/danda/.screenpipe`:
    - Verifica se o log principal (`screenpipe-app.*.log`) foi atualizado nos últimos 5 minutos
    - Conta arquivos de chat recentes (últimos 5 minutos) em `/chats`
  - Para automaticamente às 18h Brasil (UTC-3)

## 2. Arquitetura de Convergência Indireta

O usuário descreveu um modelo onde múltiplos "braços" operam em paralelo, sem necessidade de compartilhar a mesma janela mental ou comunicar diretamente, mas convergindo naturalmente através do estado observável compartilhado.

### 2.1 Os Cinco Braços Descritos
> "BRAÇO 1 → Omni/Hermes
> → verifica processo/configuração
> → corrige rota/env
> → mantém motor vivo
> 
> BRAÇO 2 → PR / commits
> → observa mudanças
> → compara estado
> → só reage se houver delta
> 
> BRAÇO 3 → telemetria/heartbeat
> → grava loop periódico
> → confirma que o processo continua vivo
> 
> BRAÇO 4 → autonomia temporal
> → mantém intenção até horário limite
> → espera evento / mudança
> 
> BRAÇO 5 → revisão/contraprova
> → lê estado produzido pelos outros
> → tenta pegar inconsistência"

### 2.2 Princípio de Convergência
> "não precisam compartilhar a mesma janela mental
> precisam compartilhar A MESMA REALIDADE
> + RECEIPTS + GIT + LOGS + MISSION STATE"

### 2.3 Exemplos de Convergência Indireta Observados
- AGENTE A altera Git → AGENTE B detecta commit → AGENTE C vê novo estado/runtime → AGENTE D encontra divergência
- Um agente cria receipt → outro continua dali
- Um fica sem modelo → outro mantém o estado externo
- Múltiplos agentes leem o mesmo PR no GitHub e chegam a conclusões semelhantes independentemente

### 2.4 Aplicação nos Jobs Criados
Os jobs de monitoramento encarnam:
- **BRAÇO 2** (observação de PR/commits): `dependabot-monitor` verifica PRs do dependabot[bot] + atividade local TEMP/JS + status VPS
- **BRAÇO 5** (revisão/contraprova): mesmo job verifica inconsistências entre fontes (ex: TEMP/JS ativo sem PR correspondente, ou atividade VPS sem mudanças no GitHub)
- **BRAÇO 4** (autonomia temporal): ambos param automaticamente às 18h
- **BRAÇO 1 e 3**: implícitos na verificação de que os processos estão vivos e respondendo

A convergência ocorre quando múltiplos agentes (ou jobs) leem o mesmo estado compartilhado (ex: GitHub remoto, filesystem local, logs de serviços) e reagem ao mesmo delta material (novo PR, nova atividade, mudança de estado).

## 3. Princípio: "Executa, Não Fica Propondo"

Uma correção explícita do usuário nesta sessão foi: "executa, não fica propondo" e "não pergunta de novo o que já foi dado".

### 3.1 Aplicação nos Jobs de Monitoramento
- Os jobs **não perguntam** se há trabalho a fazer - eles **medem diretamente** o estado
- Eles **não propõem** ações - eles **registram fatos observados** quando há delta
- Após criar o job (execução única de setup), ele **opera autonomamente** sem necessidade de re-pergunta ou re-autorização a cada ciclo
- Isso encarna exatamente o princípio: depois de estabelecer a intenção e o setup, PARTE PRO EXECUÇÃO

### 3.2 Contraste com Abordagem Ingênua
Uma abordagem "propondo" teria:
- Perguntado a cada minuto: "devo verificar Dependabot?" 
- Esperado autorização a cada ciclo
- Gerado output constantemente mesmo sem mudança
- Criado dependência contínua de interação humana

A abordagem autônoma estabelece:
- Uma intenção clara de monitoramento
- Um setup único (criação do job)
- Execução contínua sem re-intervenção
- Output apenas quando houver delta material

## 4. Princípio: "Menos é Mais" e Filtro de Delta Útil

O usuário repetiu inúmeras vezes variações de:
- "menos é mais"
- "pega só o delta útil"
- "não explica demais"
- "corta narrativa, entrega o parafuso"
- "repetição da mesma correção pelo Pivete = sinal de que a lição não fixou"

### 4.1 Aplicação nos Jobs de Monitoramento
- **Delta material apenas**: os jobs apenas logam quando há:
  - Novo PR do dependabot[bot]
  - Novos arquivos .js modificados em TEMP (últimos 5 min)
  - Mudança no status PM2 do VPS
  - Atividade recente no screenpipe
- **Sem repetição inútil**: se não houver mudança, nenhum log é produzido
- **Output enxuto**: cada entrada contém apenas os fatos essenciais (contagem, timestamps, estado essencial)
- **Nenhuma narrativa desnecessária**: não há explicações, apenas dados observáveis

### 4.2 Filtro de Informação antes de Responder
Aplicando a regra do usuário: toda resposta (ou neste caso, cada log) deve passar por:
1. O que mudou? (delta material)
2. O que foi provado? (evidência concreta: gh output, find output, ssh output)
3. O que ainda falta? (próximos bloqueios observados)
4. Qual parte acrescenta informação? (remove tudo que não serve a 1,2,3)

Isso resulta em logs que são:
- Apenas o essencial para detectar mudança
- Fáceis de escanear em busca de anomalias
- Livres de ruido informacional
- Prontos para serem consumidos por outros processos ou humanos

## 5. Lições da Sessão para Operação Futura

### 5.1 Monitoramento Autônomo
- Jobs devem ser **enxutos e focados em delta** - apenas logar quando houver mudança material
- Devem ter **limite temporal claro** (ex: parar às 18h) a menos que haja ordem explícita para continuar
- Devem **medir antes de concluir** - nunca assumir estado, sempre verificar via comando real
- Devem ser **autossuficientes** após setup único - não requerer re-intervenção a cada ciclo

### 5.2 Convergência Indireta como Padrão de Operação
- Compartilhar **estado observável** (Git, filesystem, logs, receipts) é suficiente para alinhamento
- Não é necessária comunicação direta entre agentes/processos
- A convergência ocorre naturalmente através de reação ao mesmo delta material
- Reduz ruído, aumenta resiliência e elimina pontos de falha de comunicação

### 5.3 Aplicação do "Executa, Não Fica Propondo"
- Após estabelecer intenção e realizar setup único, PARTE PRO EXECUÇÃO
- Não re-perguntar após aprovação explícita
- Não criar dependência contínua de interação humana para operações rotineiras
- Output apenas quando houver delta material observável

### 5.4 Filtro de Informação como Disciplina
- Antes de qualquer ação ou output, perguntar: "isso acrescenta informação?"
- Remover tudo que não responda a "o que mudou?", "o que foi provado?", "o que ainda falta?"
- Aplicar o mesmo filtro a comunicação humana e a logs de sistema
- Repetição pura = lixo; apenas delta útil vale

Este registro serve como referência para entender como a Casa opera em modo de monitoramento autônomo e como a convergência indireta reduz a necessidade de comunicação explícita entre agentes, mantendo o alinhamento através do estado compartilhado.

Caminhos de referência no ambiente:
- Job de PRs/commits (30m): `7d71467a3e46` 
- Job de dependabot-monitor (1m): `7cb6bc563171`
- Job de screenpipe-monitor (1m): `4e2282e4973d`
- Scripts: `E:/CentralDark/Pivete/scripts/dependabot-monitor.sh` e `E:/CentralDark/Pivete/scripts/screenpipe-monitor.sh`
- Logs: `E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/dependabot-monitor.log` e `E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/screenpipe-monitor.log`