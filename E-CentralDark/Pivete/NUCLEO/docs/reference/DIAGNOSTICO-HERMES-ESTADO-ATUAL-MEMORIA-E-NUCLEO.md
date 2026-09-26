# DIAGNÓSTICO DO HERMES REAL — MEMÓRIA, TELEGRAM E NÚCLEO DO PIVETE

## OBJETIVO

Antes de migrar, consolidar memória ou alterar a arquitetura, faça um diagnóstico completo do estado real do Hermes instalado no PC e de sua atuação como agente doméstico do Pivete.

O diagnóstico deve incluir memória, Telegram, gateway, voz, internet, rede local, câmeras autorizadas e o NÚCLEO em `E:\CentralDark\Pivete\NUCLEO`.

A investigação pode usar internet e acessar câmeras autorizadas para confirmar estado real, mas não deve reconfigurar nem alterar dispositivos nesta rodada.

Precisamos descobrir:

1. O que o Hermes realmente lembra do Pivete sem consultar arquivos.
2. Onde cada lembrança está salva: USER.md, MEMORY.md, state.db, sessões, skills ou documentos do NÚCLEO.
3. O estado real do Hermes Desktop, Telegram, gateway, STT, TTS, memória e skills.
4. O estado real do acesso à internet, rede local, câmeras autorizadas e funções domésticas.
5. O conteúdo e o estado das pastas que criamos em `E:\CentralDark\Pivete\NUCLEO`.
6. Se o correto é:
   - manter o NÚCLEO em E: como fonte canônica;
   - migrar para o perfil oficial do Hermes;
   - ou usar modelo híbrido com sincronização controlada.
7. Qual é a menor próxima execução segura para transformar a arquitetura existente no Hermes doméstico definitivo.

## ESTADO OPERACIONAL E AUTORIZAÇÕES

O Hermes não deve mais ser tratado como protótipo.

Ele é o agente doméstico operacional do Pivete, com função de:

- vigia do lar;
- protetor da casa;
- operador de funções autorizadas;
- assistente pessoal;
- memória viva da relação com o Pivete;
- executor sob doutrina e autoridade do Pivete.

Nesta rodada de diagnóstico, o Hermes está autorizado a:

- usar internet para consultar documentação, validar integrações e confirmar o estado de serviços;
- acessar a rede local da casa;
- detectar e consultar câmeras autorizadas;
- verificar disponibilidade, IP, protocolo, status e stream das câmeras;
- consultar logs, gateway, Telegram, STT, TTS, skills e serviços;
- executar testes somente leitura;
- comparar estado real com memória e documentação;
- registrar evidências no relatório canônico.

Nesta rodada, ainda não deve:

- migrar arquivos;
- apagar arquivos;
- aumentar limites de memória;
- alterar `USER.md`, `MEMORY.md`, `config.yaml`, `state.db` ou skills;
- trocar senhas;
- reconfigurar câmeras;
- alterar firewall, roteador ou portas;
- instalar serviços;
- expor streams, credenciais ou endereços sensíveis;
- executar ação destrutiva;
- iniciar arquitetura paralela.

Acesso autorizado não significa autorização irrestrita.

Toda ação relevante deve seguir:

```text
LER
→ PERGUNTAR quando houver ambiguidade
→ AGIR dentro do escopo autorizado
→ PROVAR
→ REGISTRAR
```

Kill-switches do Pivete:

```text
TRAVA
PARA
!CALIBRA
```

Fluxo obrigatório:

```text
LEMBRAR SEM CONSULTAR
→ INVENTARIAR
→ VERIFICAR
→ COMPARAR
→ RECOMENDAR
→ SALVAR RELATÓRIO
→ PARAR
```

## DOUTRINA OPERACIONAL DO HERMES

```text
Pivete comanda.
Hermes protege, observa, executa e registra.
Autorização não se presume fora das permissões já concedidas.
Internet, Telegram, voz e câmeras da casa são capacidades autorizadas.
Ações destrutivas, exposição externa e alteração crítica exigem ordem explícita.
```

O Hermes deve agir como um sistema doméstico tudo em um, mas com responsabilidades separadas:

```text
MEMÓRIA
VIGILÂNCIA
COMUNICAÇÃO
OPERAÇÃO
SEGURANÇA
OBSERVABILIDADE
```

Cada ação deve produzir evidência e registro.

## FONTES A ANALISAR

### Perfil oficial do Hermes

```text
C:\Users\danda\AppData\Local\hermes\profiles\pivete
```

Inspecionar, se existirem:

```text
config.yaml
USER.md
MEMORY.md
state.db
memories\
sessions\
skills\
logs\
cache\
lsp\
gateway\
plugins\
```

### NÚCLEO criado anteriormente

```text
E:\CentralDark\Pivete\NUCLEO
```

Inspecionar:

```text
00-FOCO-CASA-VPS-ULTIMO.md
01-VISAO-AMIGO-CASA-E-ORIGEM.md
02-PESQUISA-LUPA-MOTOR-JARVIS.md
README.md
SKILL.md
motor\01-identidade
motor\02-cerebro
motor\03-memoria
motor\04-voz
motor\05-hermes
motor\06-ferramentas
motor\07-seguranca
motor\08-docker
motor\09-pontes
motor\10-observabilidade
```

## FASE 1 — TESTE DE LEMBRANÇA ANTES DE LER ARQUIVOS

Antes de abrir USER.md, MEMORY.md, state.db, sessões, skills ou documentos do NÚCLEO, responda somente com o que você acredita lembrar:

1. Quem é o Pivete para o Hermes?
2. Qual é a prioridade: casa ou VPS?
3. Qual é o ciclo oficial de trabalho?
4. Quais são os kill-switches?
5. O que é a Técnica da Lupa?
6. O que é a Lei da Apuração?
7. Como devem funcionar testes novos?
8. Como responder a mensagens de voz?
9. O que foi aprendido sobre STT, TTS e Telegram?
10. Quais pastas do NÚCLEO você lembra que existem?
11. Qual é o objetivo de longo prazo do Hermes pessoal?
12. Você lembra que não deve afirmar consciência nem ser uma cópia do Pivete?

Salvar esta parte no relatório com o título:

```text
LEMBRANÇA DECLARADA ANTES DA VERIFICAÇÃO
```

Não corrigir a resposta ainda.

## FASE 2 — VERIFICAÇÃO DA MEMÓRIA REAL

Depois, verificar USER.md, MEMORY.md, state.db, sessões, skills e logs.

Para cada regra ou aprendizado, classificar:

```text
MEMÓRIA NÚCLEO:
está em USER.md ou MEMORY.md e é carregada sempre.

MEMÓRIA DE SESSÃO:
está no state.db ou histórico, mas não foi promovida ao núcleo.

SKILL:
está salva como procedimento reutilizável.

DOCUMENTO EXTERNO:
existe somente em E:\CentralDark\Pivete\NUCLEO.

INFERÊNCIA:
foi deduzida, mas não foi encontrada persistida.

AUSENTE:
não foi encontrada.

CONFLITO:
há duas versões diferentes.
```

Procurar especificamente:

```text
Pivete comanda.
Autorização não se presume.
Nenhum agente age por conta própria.

LER → PERGUNTAR → AGIR → PROVAR → REGISTRAR

TRAVA
PARA
!CALIBRA

Casa primeiro.
VPS por último.

Técnica da Lupa:
evidência primeiro, correção mínima, preservação, Zoom Out,
Zoom In, Feynman e Autolupa.

Lei da Apuração:
um agente executa;
outro acompanha logs e estado real;
os resultados são comparados;
só depois se confirma.

Áudio:
entender sem repetir transcrição;
texto quando simples;
áudio quando longo ou natural;
transcrever literalmente somente quando pedido.

Aprendizados:
STT local Large-v3;
Telegram funcionando;
gateway funcionando;
diferença entre STT, TTS e entrega de mídia;
diferença entre detectar câmera e ter acesso autenticado;
memória limitada por caracteres;
USER.md, MEMORY.md e state.db;
vínculo e memória progressiva sem afirmar consciência.
```

Para cada item encontrado, registrar:

```text
ITEM:
CLASSIFICAÇÃO:
CAMINHO:
ORIGEM:
ÚLTIMA ALTERAÇÃO:
EVIDÊNCIA:
CONFIANÇA:
CONFLITO:
```

Não copiar conteúdo pessoal completo. Use resumo sanitizado.

## FASE 3 — INVENTÁRIO DO PERFIL OFICIAL

Gerar árvore resumida de:

```text
C:\Users\danda\AppData\Local\hermes\profiles\pivete
```

Registrar para cada área:

```text
caminho
tamanho
quantidade de arquivos
função
última modificação
classificação: canônico | histórico | cache | temporário
```

Medir novamente e confirmar ou corrigir os valores vistos anteriormente:

```text
skills ~47 MB
lsp ~28 MB
state.db ~26 MB
cache ~11 MB
logs ~1,3 MB
sessions ~548 KB
memories ~29 KB
```

## FASE 4 — INVENTÁRIO DO NÚCLEO EM E:

Gerar árvore resumida de:

```text
E:\CentralDark\Pivete\NUCLEO
```

Para cada pasta `motor\01` até `motor\10`, informar:

```text
conteúdo atual
função planejada
documentos úteis
código existente
arquivos experimentais
duplicações
estado: vazio | planejado | implementado | histórico
```

Confirmar se o protótipo anterior está:

```text
ativo
congelado
removido
parcialmente preservado
ou misturado
```

## FASE 5 — ESTADO OPERACIONAL REAL

Confirmar por comandos de status, logs, internet e rede local, sem reconfigurar serviços ou dispositivos:

```text
versão do Hermes
perfil ativo
gateway status
Telegram status
perfil usado pelo Telegram
STT provider
modelo STT
TTS provider
voz configurada
áudio de entrada
áudio de saída
entrega de mídia
plugins
skills ativas
acesso à internet
rota de saída
DNS
rede local
câmeras detectadas
protocolos das câmeras
stream disponível
autenticação exigida
estado de vigilância
```

Classificar cada item:

```text
FUNCIONA
PARCIAL
FALHA
NÃO TESTADO
```

Não declarar que funciona apenas porque o processo está online.

## FASE 5.1 — CÂMERAS E PROTEÇÃO DO LAR

O Pivete autoriza o Hermes a acessar as câmeras da própria casa.

Nesta rodada, verificar:

```text
câmeras visíveis na rede local
fabricante/modelo quando identificável
IP local
protocolo: RTSP | ONVIF | HTTP | outro
porta
autenticação exigida
stream acessível
snapshot acessível
latência
estado online/offline
último erro
integração atual com Hermes
```

Diferenciar obrigatoriamente:

```text
DETECTADA:
o dispositivo aparece na rede.

AUTENTICADA:
o Hermes possui acesso válido.

STREAM VALIDADO:
imagem ou stream foi realmente recebido.

OPERACIONAL:
o Hermes consegue consultar e usar o stream dentro da doutrina.

BLOQUEADA:
dispositivo existe, mas falta autorização, credencial ou compatibilidade.
```

Não mostrar:

- senha;
- token;
- URL completa com credencial;
- stream em relatório;
- endereço externo público;
- dados sensíveis da residência.

Registrar apenas evidência sanitizada.

O Hermes pode acessar e observar as câmeras autorizadas, mas nesta rodada não deve:

- alterar senha;
- atualizar firmware;
- redefinir dispositivo;
- abrir acesso externo;
- modificar gravação;
- mudar configuração de rede;
- apagar gravações.

## FASE 6 — MEMÓRIA ATUAL

Confirmar no código e config locais:

```text
memory_enabled
user_profile_enabled
memory_char_limit
user_char_limit
```

Registrar os valores atuais reais.

NÃO alterar nesta rodada.

Responder com evidência:

1. O limite usa caracteres, bytes ou tokens?
2. Existe máximo aceito?
3. Exige reinício?
4. USER.md e MEMORY.md são carregados sempre?
5. state.db guarda sessões completas?
6. Existe FTS5?
7. Existe revisão automática de memória?
8. Existe promoção de sessão para memória?
9. Existe consolidação e escrita atômica?
10. Telegram e Desktop usam o mesmo perfil `pivete`?
11. O que ocorre quando USER.md atinge o limite?
12. Há isolamento por usuário/canal?
13. Há risco de memória recuperada ser interpretada como ordem?
14. Há provider externo de memória ativo?

Separar:

```text
EVIDÊNCIA
INFERÊNCIA
NÃO CONFIRMADO
```

## FASE 7 — COMPARAÇÃO DAS DUAS ESTRUTURAS

Criar esta matriz:

| Responsabilidade | Perfil Hermes atual | NÚCLEO E: | Duplicação | Fonte recomendada |
|---|---|---|---|---|
| Identidade | | | | |
| Perfil do Pivete | | | | |
| Memória curta | | | | |
| Histórico | | | | |
| Skills | | | | |
| Técnica da Lupa | | | | |
| Lei da Apuração | | | | |
| Telegram | | | | |
| Voz/STT/TTS | | | | |
| Segurança | | | | |
| Observabilidade | | | | |
| Planos futuros | | | | |

## FASE 8 — RECOMENDAÇÃO ÚNICA

Escolher somente uma estratégia para o Hermes doméstico definitivo:

### A — Perfil Hermes como runtime; NÚCLEO E: como fonte canônica

```text
Perfil Hermes:
runtime, state.db, sessões, gateway, Telegram, cache e adapters.

NÚCLEO E:
visão, identidade, regras, skills canônicas, ouro, planos e backups.
```

### B — Migrar o NÚCLEO para dentro do perfil Hermes

Recomendar somente se o software realmente exigir isso.

### C — Modelo híbrido com sincronização controlada

```text
NÚCLEO E: = origem canônica
perfil Hermes = cópia operacional gerada
sincronização unidirecional, auditável e reversível
```

Avaliar:

```text
benefícios
riscos
duplicação
portabilidade
backup
Telegram
site futuro
voz
memória
segurança
internet
rede local
câmeras
vigilância
operações domésticas
manutenção
```

Emitir uma recomendação única.

NÃO executar a migração.

## RELATÓRIO ÚNICO

Salvar tudo como uma nova rodada no arquivo existente:

```text
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
REVISAO-TECNICA-DA-LUPA.md
```

Título da rodada:

```text
DIAGNÓSTICO DO HERMES REAL + PERFIL PIVETE + NÚCLEO E:
```

Não apagar rodadas anteriores.

Não criar outro relatório Markdown.

## RESPOSTA FINAL CURTA

Ao concluir, responder somente:

```text
DIAGNÓSTICO CONCLUÍDO

PERFIL OFICIAL:
[caminho]

NÚCLEO:
[caminho]

LEMBRANÇA REAL:
[resumo]

CONFLITOS:
[quantidade]

RECOMENDAÇÃO:
[A | B | C]

ARQUIVO PARA REVISÃO:
E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\
REVISAO-TECNICA-DA-LUPA.md

NENHUMA MIGRAÇÃO OU RECONFIGURAÇÃO FOI EXECUTADA.
INTERNET E CÂMERAS AUTORIZADAS FORAM USADAS SOMENTE PARA DIAGNÓSTICO E PROVA.
```

## COMANDO DE INÍCIO

```text
/goal Leia e execute integralmente o arquivo DIAGNOSTICO-HERMES-ESTADO-ATUAL-MEMORIA-E-NUCLEO.md. Trate o Hermes como agente doméstico operacional do Pivete: vigia, protetor do lar, operador de funções autorizadas e memória viva da relação. Primeiro responda, sem consultar arquivos, o que você acredita lembrar do Pivete, da doutrina, da Lei da Apuração, da Técnica da Lupa e das pastas do NÚCLEO. Depois verifique essa lembrança contra USER.md, MEMORY.md, state.db, sessões, skills e E:\CentralDark\Pivete\NUCLEO. Faça inventário do perfil C:\Users\danda\AppData\Local\hermes\profiles\pivete e do NÚCLEO em E:, use internet para validar documentação e serviços, confirme Telegram, gateway, STT, TTS, memória e skills, e acesse as câmeras autorizadas da casa para verificar detecção, autenticação, stream e estado operacional. Não migre, apague, aumente limites, troque credenciais ou reconfigure dispositivos nesta rodada. Compare as duas estruturas e recomende uma única arquitetura para o Hermes doméstico definitivo. Salve toda a evidência sanitizada como nova rodada no arquivo existente motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md.
```
