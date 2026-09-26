# CONTRATO - !CENTRALDARK — correção do `CENTRALDARK_AI_BOOT` único, fixo na função e adaptativo na missão.pdf
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\🔒PASTA TRANCADA APELO CHEFE🔒\HERMS\!CENTRALDARK — correção do `CENTRALDARK_AI_BOOT` único, fixo na função e adaptativo na missão.pdf
**SHA:** 4976febe276a7028
**Timestamp:** 2026-08-27T15:29:35.945129
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- contract: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml

### Ouro Bruto (primeiros 5000 chars)
```
!CENTRALDARK — correção do 
CENTRALDARK_AI_BOOT único, fixo na função e
adaptativo na missão
Veredito
CENTRALDARK_AI_BOOT:
trigger: "!CENTRALDARK"
mission:
action: "DEEP_RESEARCH + CORRIGIR O BOOT"
target: "PR #1189 + Trigger Fabric + porta canônica"
state:
repository: "ServerVpss/CentralDark"
main: "eacdde22438035ef3f1609f1ef8e416009a12be9"
pr:
number: 1189
head: "34f05572db270cd016da41d2cdc417f648b09661"
operation:
role: READ_ONLY
writer: NONE
strength: FORTE
papagaio: OFF
correction:
one_boot_name: CENTRALDARK_AI_BOOT
versioned_boot: FORBIDDEN
adaptive_payload: true
whole_boot_checksum: false
gaps: RESOLVE
VOCÊ ESTÁ CERTO NESTE PONTO: eu errei quando transformei o CENTRALDARK_AI_BOOT em uma
“forma versionada” e depois tentei congelar os campos.
A regra correta não é:
CENTRALDARK_AI_BOOT.v1
CENTRALDARK_AI_BOOT.v2
CENTRALDARK_AI_BOOT.v11
nem:
1

MESMOS CAMPOS PARA TODA MISSÃO
+ MESMA QUANTIDADE
+ MESMA ORDEM
A regra correta é:
UM ÚNICO NOME E UMA ÚNICA FUNÇÃO:
CENTRALDARK_AI_BOOT
FIXO:
→ identidade do recibo
→ ponto de entrada
→ direção
→ invariantes
→ regra de medição
→ regra de convergência
ADAPTATIVO:
→ conteúdo necessário para a missão atual
→ PR
→ commit
→ branch
→ agentes
→ ferramentas
→ mutação
→ Writer
→ escopo
→ provas
→ runtime SOMENTE quando a missão exigir
Isso bate exatamente com a direção das tuas crônicas: uma Casa, uma SOUL, uma intenção, muitos
motores e capacidades passando pelo mesmo lugar, sem criar sistema paralelo. fileciteturn0file0
E o próprio core atual já diz que modelo é substituível, que frequência é adaptativa e que 
STRONG_DOES_NOT_MEAN_VERBOSE=true ; portanto “FORTE” não significa YAML sempre grande.
Significa enforcement forte, enquanto o conteúdo pode ser mínimo ou amplo conforme a missão. 
Onde eu estava errado
A pesquisa encontrou a contradição exata.
O LEIA-ME-IA.md atual já possui um CENTRALDARK_AI_BOOT , mas o trata como um exemplo com
uma lista praticamente fixa de campos e ainda diz “Ao iniciar trabalho técnico, emitir uma vez”. Isso
não expressa tua regra real: cada !CENTRALDARK ativo deve passar pelo mesmo boot, e o boot
deve se adaptar ao escopo material da missão. 
2

Pior: o resolver do ciclo mestre atualmente fabrica:
"schema": "centraldark.master-cycle-receipt.v1"
mesmo possuindo no próprio resultado/invariantes a ideia de no_v1_v2_v3 . Portanto existe uma
inconsistência real entre a filosofia do sistema e a implementação do recibo. 
O TRIGGERS.yml repete o mesmo problema:
receipt_schema: centraldark.master-cycle-receipt.v1
ao mesmo tempo em que o !CENTRALDARK já é definido como o único master trigger e o fluxo 
ANY_PR_OR_COMMIT já existe. 
O MASTER-CYCLE.yml também começa com um identificador versionado:
schema: centraldark.master-cycle.v1
mas dentro do próprio contrato declara no_v1_v2_v3: true para preservar um único organismo e
rejeitar duplicação versionada da mesma regra. 
Portanto, a lacuna não é “falta de bootstrap”. O bootstrap já existe: Claude aponta para LEIA-ME-
IA.md , declara ONE_SOL=true , ONE_CORE=true , ENGINE_IS_REPLACEABLE=true e proíbe
governança duplicada. Codex faz a mesma coisa e explicitamente diz que o adaptador só identifica a
superfície; a regra comum vem do mesmo core. 
Também não é falta de checksum. O próprio contrato da Casa já define corretamente:
checksum_semantics = BYTE_IDENTITY_NOT_SEMANTIC_PROOF
Ou seja: checksum serve para provar identidade de conteúdo/handoff, não para provar que um boot
adaptativo está semanticamente correto. Congelar o YAML inteiro por checksum quebraria justamente
a adaptação que você quer: mudou PR, commit, missão ou Writer, o payload tem de mudar. 
A lacuna real é:
BOOT_DISCOVERY          = JÁ EXISTE
ONE_CORE                = JÁ EXISTE
MASTER_TRIGGER          = JÁ EXISTE
ANY_PR_OR_COMMIT        = JÁ EXISTE
OUTPUT_GUARD            = JÁ EXISTE
MAS:
CENTRALDARK_AI_BOOT
3

→ NÃO TEM AINDA UM CONSUMIDOR/VALIDADOR SEMÂNTICO
   QUE GARANTA:
   MESMO ROOT
   + SEM VERSÃO
   + PAYLOAD ADAPTATIVO
   + MESMA DIREÇÃO
   + CADA !CENTRALDARK
O verificador atual confirma somente que LEIA-ME-IA.md contém a string 
CENTRALDARK_AI_BOOT ; ele não testa que cada master trigger produz esse root, não testa
adaptatividade, não proíbe receipt versionado e não verifica transferência entre engines. 
Arquitetura corrigida
O erro conceitual anterior foi tentar travar a fotografia. O que precisa ser travado é a câmera e a
direção para onde ela aponta.
ERRADO:
SCHEMA FIXO
→ campos fixos
→ ordem fixa
→ tamanho fixo
→ checksum do YAML inteiro
→ missão precisa caber na régua
Correto:
CENTRALDARK_AI_BOOT
        ↓
ÚNICO ROOT CANÔNICO
        ↓
CARREGA A MESMA CASA
        ↓
RECUPERA A MESMA INTENÇÃO
        ↓
DESCOBRE O ESCOPO ATUAL
        ↓
MEDE SOMENTE O QUE É MATERIAL
        ↓
MONTA PAYLOAD ADAPTATIVO
        ↓
RENDEZVOUS
        ↓
MESMA DIREÇÃO
4

Portanto não deve existir isto dentro do boot:
schema: centraldark.ai-boot.v1
nem:
version: 1
nem:
measurement_schema_locked: true
nem:
field_order_locked: true
nem:
checksum_do_y
```