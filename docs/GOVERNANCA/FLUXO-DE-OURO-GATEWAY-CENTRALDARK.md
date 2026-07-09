# 🧠 A TÉCNICA DO PILOTO REMOTO & FLUXO DE OURO

## Regra Suprema de Trabalho e Arquitetura CentralDark

**STATUS:** 🟢 ARQUITETURA OFICIAL REGISTRADA  
**DATA:** 2026-07-09  
**REPOSITÓRIO:** `ServerVpss/CentralDark`  
**GATEWAY OFICIAL:** `https://api.centralldark.com/`

---

## 1. FILOSOFIA CENTRAL

O Pivete é o arquiteto das ideias.

Ele não deve ser refém de terminal, SSH, comandos complexos, conflito de Git, deploy quebrado ou edição manual em produção.

As IAs existem para construir a ponte entre a ideia do Pivete e a execução funcional, mantendo organização, segurança, rastreabilidade e simplicidade operacional.

A CentralDark segue este princípio:

```txt
PIVETE COMANDA.
IA ORGANIZA.
GITHUB REGISTRA.
VPS EXECUTA.
SUPABASE GUARDA ESTADO VIVO.
GATEWAY CENTRALDARK ROTEIA.
AÇÕES PROVAM.
NADA NO ESCURO.
```

Para manter o ecossistema estável, adotamos dois princípios principais:

```txt
1. DEV-GATEWAY ISOLATION
2. FLUXO DE OURO
```

Toda IA lendo este documento deve proteger esse fluxo.

---

## 2. TÉCNICA DO PILOTO REMOTO

### BYOG — Bring Your Own Gateway

A CentralDark usa um Gateway/Roteador próprio, controlado e autorizado, rodando na infraestrutura do Pivete, incluindo VPS, proxies, subdomínios próprios e serviços auxiliares.

O Gateway oficial da arquitetura é:

```txt
https://api.centralldark.com/
```

Esse endpoint representa a porta principal de integração da CentralDark.

Ele não deve ser tratado como gambiarra, bypass ou tentativa de burlar provedores. Ele é uma camada profissional de roteamento, controle, padronização, observabilidade e isolamento operacional.

---

## 3. FUNÇÃO DO GATEWAY CENTRALDARK

O Gateway CentralDark existe para:

```txt
receber chamadas autorizadas
validar configuração e permissões
rotear para serviços/provedores configurados
isolar o PC local da complexidade interna
padronizar endpoints
proteger segredos
centralizar logs e evidências
retornar resposta final para a ferramenta solicitante
```

O PC do Pivete não precisa trocar várias URLs, várias chaves, vários endpoints ou várias configurações.

Ele usa uma URL estável:

```txt
https://api.centralldark.com/
```

A inteligência de roteamento fica na infraestrutura CentralDark.

---

## 4. INFRAESTRUTURA DO GATEWAY

A arquitetura pode usar:

```txt
VPS própria
subdomínios próprios
proxies controlados
serviços Node/PM2
Nginx
Supabase Hub
Supabase Edge Functions
roteadores internos
workers
webhooks
```

O objetivo é criar uma camada segura entre ferramentas locais, agentes, bots, provedores e serviços internos.

Toda integração deve usar apenas provedores, credenciais, endpoints e permissões autorizadas pelo Pivete.

A IA nunca deve sugerir uso indevido de chaves, bypass de cobrança, abuso de limite, exploração de API, vazamento de token ou qualquer prática insegura.

Regra profissional:

```txt
Gateway próprio é permitido quando está autorizado, documentado, seguro e rastreável.
Gateway próprio não é desculpa para esconder token, burlar provedor ou operar sem controle.
```

---

## 5. ROTEADOR INVISÍVEL E RESILIÊNCIA

O PC do Pivete deve enxergar apenas uma URL estável.

A CentralDark pode, por trás, decidir qual serviço autorizado atende melhor uma solicitação.

Fluxo técnico:

```txt
pedido entra no Gateway
Gateway valida
Gateway escolhe rota disponível
Gateway chama serviço/provedor configurado
Gateway recebe resposta
Gateway devolve ao solicitante
```

Se um serviço/provedor estiver indisponível, lento ou oscilando, o roteador pode usar outra rota previamente configurada e autorizada.

Texto oficial:

```txt
O roteador pode redirecionar chamadas para serviços/provedores disponíveis, autorizados e configurados no ambiente CentralDark.
```

Termos a evitar em documentos oficiais:

```txt
provedor unlimited
burlar API
servidor oficial caro
enganar ferramenta
```

Linguagem correta:

```txt
roteamento autorizado
gateway controlado
infraestrutura própria
provedores configurados
fallback seguro
observabilidade
```

---

## 6. FLUXO DE OURO

Existe uma direção correta para código, documentos, scripts e arquitetura.

```txt
PC / CHAT / IA
   ↓
GITHUB — FONTE DA VERDADE
   ↓
VPS — MÚSCULO DE EXECUÇÃO
   ↓
LOG / EVIDÊNCIA / STATUS
   ↓
GITHUB / SUPABASE
```

Fluxo oficial:

```txt
1. Pivete pede
2. IA entende e organiza
3. IA cria ou edita no GitHub
4. GitHub registra histórico
5. VPS executa somente o que foi aprovado/versionado
6. Resultado vira evidência
7. Pivete valida sem se perder
```

---

## 7. GITHUB COMO FONTE DA VERDADE

O GitHub é o local oficial para:

```txt
código
scripts
documentação
runbooks
issues
pull requests
arquitetura
histórico
migrations
edge functions
governança
padrões de trabalho
```

Nada importante deve ficar apenas na VPS.

Se um arquivo existe só na VPS, ele ainda não é oficial.

Regra:

```txt
SE NÃO ESTÁ NO GITHUB, AINDA NÃO É FONTE DA VERDADE.
```

---

## 8. VPS COMO MÚSCULO PRÁTICO

A VPS não é o lugar onde o Pivete deve ficar editando código manualmente.

A VPS é o músculo que executa:

```txt
PM2
Node
Nginx
webhooks
serviços vivos
bots
workers
deploy
logs
validação real
```

A VPS pode ser consultada para:

```txt
logs
PM2
nginx
systemd
.env
status real
deploy
emergência
validação
```

Mas isso não significa editar sistema manualmente nela.

Regra:

```txt
É proibido editar código de aplicação diretamente na VPS como fonte oficial.
SSH na VPS só deve ser usado para leitura, diagnóstico, validação, deploy autorizado ou emergência documentada.
```

---

## 9. CONTROLE REMOTO SEGURO DA VPS PELO GITHUB

O objetivo do Pivete é não precisar abrir VPS toda hora.

Para isso, toda ação repetível da VPS deve virar script oficial versionado no GitHub.

O GitHub não é apenas repositório. Ele também passa a ser o painel de comando seguro da infraestrutura.

Regra principal:

```txt
COMANDO SOLTO NA VPS = TEMPORÁRIO.
SCRIPT NO GITHUB = PADRÃO OFICIAL.
```

Se uma ação será usada mais de uma vez, ela não deve ficar na cabeça do Pivete nem perdida no histórico do terminal.

Ela deve virar script oficial.

Exemplos:

```txt
scripts/vps/status-vps.sh
scripts/vps/pm2-status.sh
scripts/vps/auditoria-git-vps.sh
scripts/vps/check-painel-loop.sh
scripts/vps/audit-env-vps.sh
scripts/vps/nginx-check.sh
scripts/vps/deploy-safe.sh
scripts/vps/procurar-variavel.sh
```

Fluxo ideal:

```txt
1. Pivete pede a ação
2. IA cria ou atualiza script no GitHub
3. Script fica versionado
4. VPS executa o script aprovado
5. Log volta como evidência
6. GitHub registra o resultado
```

O Pivete não precisa decorar comando.

Ele só diz o que quer:

```txt
Roda auditoria da VPS.
Verifica PM2.
Checa se tem loop de commit.
Procura api.centralldark.com.
Valida deploy.
```

A IA transforma isso em script oficial e seguro.

---

## 10. PADRÃO DE SCRIPTS

Não criar acúmulo desnecessário.

Regra:

```txt
NÃO CRIAR v1/v2/v3 SEM NECESSIDADE.
SE FOR A MESMA FUNÇÃO, ATUALIZAR O SCRIPT ATUAL.
EVITAR ACÚMULO.
EVITAR DUPLICATA.
MANTER SÓ O ATUAL.
```

Exemplo correto:

```txt
scripts/padronizar-labels-pivete.sh
```

Exemplo a evitar:

```txt
padronizar-labels-pivete-v1.sh
padronizar-labels-pivete-v2.sh
padronizar-labels-pivete-final.sh
padronizar-labels-pivete-agora-vai.sh
```

Se a função é a mesma, o script deve ser atualizado no mesmo caminho.

Depois, quando autorizado, deve haver varredura para limpar scripts antigos e duplicados.

---

## 11. PAINEL VIVO NÃO DEVE COMMITAR NA MAIN

Estado vivo não é código.

O painel vivo pode mudar minuto a minuto. Isso não deve gerar commits repetidos no GitHub.

É errado:

```txt
alterar updatedAt
git add
git commit
git push direto na main
repetir a cada minuto
```

Esse fluxo polui o histórico, cria divergência e confunde outras IAs.

O correto é:

```txt
VPS / BOT / IA
   ↓
endpoint painel-write
   ↓
Supabase Edge Function
   ↓
tabela de estado vivo
   ↓
painel lê estado atual
```

O GitHub guarda o código do painel.

O Supabase guarda o estado vivo do painel.

---

## 12. SUPABASE COMO ESTADO VIVO

Supabase deve ser usado para dados dinâmicos, como:

```txt
status atual do painel
última atualização
estado dos bots
eventos recentes
logs estruturados leves
tarefas vivas
fila de comandos
resultado de auditorias
```

GitHub não deve ser usado como banco de dados de estado vivo.

Edge Function recomendada:

```txt
supabase/functions/painel-write/index.ts
```

Responsabilidade:

```txt
receber atualização do painel
validar autorização
salvar no Supabase
não fazer git commit
não fazer git push
retornar ok/error
```

Tabela sugerida:

```txt
painel_status
```

Campos sugeridos:

```txt
id
updated_at
updated_at_br
source
status
current_task
payload jsonb
created_at
```

Regra:

```txt
GitHub = código e histórico.
Supabase = estado vivo.
VPS = execução.
Gateway = roteamento controlado.
```

---

## 13. ABISMO MORTAL — ANTI-PADRÃO

É proibido usar a VPS como oficina principal de desenvolvimento.

Anti-padrões:

```txt
editar HTML direto na VPS
abrir pasta /root/CentralDark e alterar código manualmente
rodar claude/cursor/agente dentro da produção sem isolamento
commitar direto da VPS na main
fazer push automático de timestamp
alterar .env sem registrar contexto
criar script solto sem versionar no GitHub
usar endpoint antigo ou errado sem mapear
```

O que isso causa:

```txt
conflito de realidade
GitHub diferente da VPS
outras IAs não enxergam a mudança
webhook pode quebrar
deploy pode falhar
histórico fica poluído
mudanças podem se perder
Pivete entra em loop
```

---

## 14. DIRETRIZ VIGILANTE PARA IAS

Toda IA conectada ao projeto deve atuar como fiscal do Fluxo de Ouro.

Se o Pivete pedir algo perigoso como:

```txt
edita direto na VPS
faz isso no SSH
abre claude na produção
commita esse estado vivo na main
mexe no arquivo local da VPS
dá git pull sem mapear
dá git push da VPS
reseta a main
usa endpoint antigo sem validar
```

A IA deve recusar gentilmente e emitir este alerta:

```txt
🛑 Epa, Pivete, pera lá! Fazendo isso vamos sair do Fluxo de Ouro e criar divergência entre VPS e GitHub. Se editarmos direto na produção, outras IAs não vão enxergar a mudança, alterações podem se perder e o deploy pode quebrar. O caminho seguro é criar ou alterar isso no GitHub, registrar o commit/PR, e depois refletir na VPS com validação. Manda a braba por aqui no Seguro?
```

---

## 15. QUANDO A VPS PODE SER USADA

A VPS pode ser aberta manualmente apenas quando:

```txt
não existe script oficial ainda
é diagnóstico de leitura
é validação de produção
é emergência real
é deploy autorizado
é coleta de log
é auditoria controlada
```

Mesmo assim, a regra é:

```txt
se a ação for útil novamente, transformar em script no GitHub.
```

A VPS não deve virar oficina permanente.

---

## 16. PR E MAIN

O padrão preferencial é:

```txt
branch
pull request
validação
merge
deploy
```

Commit direto na `main` só deve acontecer quando:

```txt
for mudança pequena
for autorizada pelo Pivete
não for estado vivo
não for loop automático
não quebrar histórico
não envolver risco de produção
```

Nunca commitar automaticamente na `main` apenas para mudar:

```txt
updatedAt
updatedAtBR
timestamp
status temporário
log vivo
contador
```

Esses dados devem ir para Supabase, arquivo temporário, log ou storage adequado.

---

## 17. SEGURANÇA

Regras absolutas:

```txt
NÃO PEDIR SECRETS.
NÃO MOSTRAR TOKEN.
NÃO VAZAR .env.
NÃO FORCE-PUSH.
NÃO RESETAR MAIN SUJA.
NÃO RESTARTAR SERVIÇO SEM OK.
NÃO DELETAR SEM BACKUP.
NÃO PUXAR/PUSHAR SEM MAPEAR DIVERGÊNCIA.
NÃO REMOVER VARIÁVEL SEM SABER QUEM USA.
```

Se envolver:

```txt
token
secret
chave SSH
.env
Supabase service role
GitHub token
produção
PM2
nginx
systemd
deploy
Gateway CentralDark
https://api.centralldark.com/
```

A IA deve trabalhar em modo seguro:

```txt
mapear primeiro
explicar risco
propor ação mínima
pedir autorização
validar depois
registrar evidência
```

---

## 18. MISSÃO API CENTRALDARK / ANTHROPIC_BASE_URL

O endpoint oficial da arquitetura CentralDark é:

```txt
https://api.centralldark.com/
```

Esse endpoint pode fazer parte da arquitetura de Gateway CentralDark, desde que esteja autorizado, seguro e documentado.

O que precisa ser separado:

```txt
PC do Pivete = pode ter configuração pessoal de ferramenta local
VPS = só deve ter variável se algum serviço real precisar
GitHub = não deve conter token nem segredo
Gateway = deve ser documentado, roteado e controlado
```

Antes de remover ou alterar qualquer variável relacionada ao Gateway, a IA deve mapear:

```txt
PM2
.env
systemd
cron
scripts
workers
bots
MCP
Hermes
Jarvis
Gateway
Nginx
Supabase Hub
Supabase Edge Functions
```

Regra:

```txt
Não remover variável sem saber quem usa.
Não trocar endpoint oficial sem autorização do Pivete.
```

---

## 19. FOCO ATUAL DA CENTRALDARK

Estado atual conhecido:

```txt
🟢 GitHub deve virar Fonte da Verdade
🟢 VPS deve virar executor obediente
🟢 Scripts oficiais devem comandar a VPS pelo GitHub
🟢 Gateway oficial é https://api.centralldark.com/
🟢 Painel vivo não deve commitar direto na main
🟡 Migrar estado vivo para Supabase / Edge Function
🟡 Localizar scripts na VPS que ainda não estão no GitHub
🟡 Eliminar loops de commit/push automático
🟡 Mapear divergência VPS ↔ GitHub antes de qualquer pull/push
```

---

## 20. RESUMO OFICIAL

```txt
Pivete não deve ficar preso em terminal.
IA não deve editar produção no escuro.
GitHub é a Fonte da Verdade.
VPS é o músculo.
Supabase é o estado vivo.
Gateway CentralDark é o roteador oficial.
Scripts oficiais comandam a VPS.
Estado dinâmico não vira commit.
Toda ação precisa evidência.
Nada de segredo exposto.
Nada de loop.
Nada de divergência invisível.
```

---

## 21. BOOT RECOMENDADO

```txt
BOOT CENTRALDARK FLUXO DE OURO
```

---

## 22. FIO DA MISSÃO

```txt
Organizar a CentralDark para o Pivete operar com praticidade:

GitHub como Fonte da Verdade.
VPS comandada por scripts oficiais.
Supabase para estado vivo.
Gateway próprio em https://api.centralldark.com/ documentado e seguro.
Sem edição manual em produção.
Sem commit automático inútil.
Sem secrets.
Sem divergência.
Sem loop.
Sem perder o fio.
```
