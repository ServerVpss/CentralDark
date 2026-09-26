---
name: centraldark-drive-reconciliation
description: >
  Reconcilia Google Drive ↔ workspace local para CentralDark.
  Use quando: !reconciliar-drive, /drive-reconciliar, "sincroniza drive",
  "drive reconcilia", "drive syncs", ou qualquer pedido de sync com o Drive
  aceticionado. Front do FABLE LOOP (FRONT 3: DRIVE_DOCS).
  Regent: conta já aceticionada via serviço vigente; sem nova conta, sem
  oauth manual fora do caminho canônico, sem ler token senão para uso efetivo.
  Produto: receipt com diff + shas + decisão, sem push destrutivo sem hard stop.
---

# centraldark-drive-reconciliation

Reconcilia Google Drive ↔ pasta local do workspace, com mesma disciplina
do `/reconciliar` git:

```
measure_local → measure_remote → reconcile → clean_garbage
→ push_useful (writer único) → pull_remote → verify_equal
hard_stop: confirmação humana antes de push/destroy/delete remoto
output: receipt com diff + shas + decisão
```

Sem essa receita, a Casa e o Drive ficam iguais, sem lixo, sem perda,
sem regressão. Com ela, róbido só se você não medir antes.

---

## Gatilhos (digite no chat)

```
/drive-reconciliar
/reconciliar-drive
!drive-reconciliar
"sincroniza drive"
"drive reconcilia"
"drive syncs"
"check drive"
"oque mudou no drive"
```

---

## Etapas obrigatórias

### 1. measure_local

Antes de qualquer coisa:

```
- listar árvore local alvo
- shas dos arquivos relevantes
- status (quais untracked/modificados/deleted)
- identificar writer atual (se houver sessão/background rodando)
- identificar conflitos conhecidos (arquivos que mudaram em ambos os lados)
- verificar se há sessão de sync rodando (um writer por recurso)
```

Só metadados. Não toca nada.

### 2. measure_remote

Com conta aceticionada e serviço disponível:

```
- listar estrutura remota no folder alvo
- shas/metadados dos arquivos remotes
- comparar com local
- identificar o que existe só no Drive, só local, em ambos, em nenhum
- verificar quota/creds disponíveis ANTES de tentar operações pesadas
```

Sem medir remoto = sem saber o que tá chegando = risco de trazer lixo ou
perder trabalho que só existe no Drive.

### 3. reconcile

Cruzar:

| Situação | Ação |
|---|---|
| Só local | candidato a upload, se útil |
| Só Drive | candidato a download, se útil |
| Em ambos, mesma versão | nada |
| Em ambos, versions diferentes | diff + hard stop se for drástico |
| Em ambos, hash igual + metadado diferente | decidir se é semântico ou só timestamp |
| Arquivo modificado local e no Drive sem commitante claro | NÃO resolver automaticamente — chamar humano |

Classificação por arquivo:

```
CURRENT_LOCAL     — existe local, está em sync ou precisa de decisão
CURRENT_REMOTE    — existe no Drive, pode precisar de download
DUPLICATE         — mesmo conteúdo em ambos, sem risco
HISTORICAL        — registro antigo, sem ação necessária agora
UNKNOWN           — não deu para medir, sem assumir
```

Se 99% conhecido e 1% novo: preservar o 1% novo. Não limpar só porque está
perto do conhecido.

### Regra — HISTORICAL ≠ CURRENT

Se um arquivo tá velho no Drive:

```
- não assume que é atual só porque tá lá
- não baixa automaticamente só porque existe
- não apaga automaticamente só porque é velho
- cruza com o que existe local antes de qualquer decisão
- se LOCAL tem versão mais nova: verifica fork, não sobrescrita cega
- se DRIVE tem versão mais nova: baixa só se útil e sem conflito
- se não dá para saber qual é a mais recente: vira UNKNOWN, não assume
```

Arquivo velho no Drive fica quieto.

Não confunde existência com atualidade. Não confunde timestamp com verdade.

O Drive é repositório, não fonte absoluta. Sem cross-check local, sem decisão.

### 4. clean_garbage

Sem `git add -A` cego e sem `rm -rf` cego no Drive.

Antes de apagar remoto ou local:

```
- verificar se o arquivo é ignorável (.env*, auth.json, node_modules/**,
  __pycache__/**, *.log, *.tmp, *.bak)
- verificar se é backup de algo útil
- verificar se é work temporário de alguma ferramenta vigente
- se não sabe: não apaga, vira UNKNOWN
```

Delete remoto É DESTRUTIVO. Hard stop obrigatório.

### Regra de ouro — ZERO REGRESSÃO

Nunca apaga no Drive (remoto) sem confirmação explícita.

Se não tem certeza absoluta do que está apagando:

```
- não apaga
- move para _CONFLICTS/ com timestamp e motivo
- registra no receipt: o que foi movido, por quê, de onde veio
- entrega ao humano para decisão
```

Se for apagar mesmo (humano confirmou):

```
- receipt antes: SHA, nome, localização, motivo
- apaga só o que foi confirmado
- receipt depois: SHA, nome, confirmação de remoção
- se não confirmou: NÃO executa
```

UNKNOWN sobre o que está sendo apagado = _CONFLICTS/, não DELETE.

Sem pressa, sem forçar. Se não dá para medir, vira UNKNOWN, não PASS.

### 5. push_useful (writer único)

Só o útil. Sem copiar besteira.

```
- um writer por pasta/alvo por vez
- upload só dos arquivos úteis confirmados
- idempotente quando possível
- receipt de cada operação (fileId, timestamp, hash, antes/depois)
- se o serviço suportar update no mesmo fileId: atualiza, não duplica
```

Sem subir `.env`, sem subir credenciais, sem subir lixo temporário.

### 6. pull_remote

Puxar o que mudou lá, se útil.

```
- baixa só mudanças relevantes
- preservar timestamp e estrutura original quando possível
- não sobrepor arquivo local modificado sem decisão humana
```

### 7. verify_equal

Prova final.

```
- compara estrutura esperada × real
- compara shas dos arquivos críticos
- sem assumir "synced" só pelo retorno 200 do serviço
- sem descartar UNKNOWN como se fosse igual
```

---

## Hard stops (parar antes de qualquer um)

```
- conta não aceticionada ou credencial ausente
- oauth pendente e não tem caminho canônico pronto
- writer ativo desconhecido no mesmo alvo
- diff drástico sem explicação
- delete remoto sem decisão humana
- sync bidirecional com mudanças reais em ambos os lados
- quota/credencial não verificada antes da operação
```

Sem pressa, sem forçar. Se não dá para medir, vira UNKNOWN, não PASS.

---

## Output: receipt

Todo sync gera receipt com:

```
MEASURED_AT=
LOCAL_ALVO=
REMOTE_ALVO=
SERVICE=
ACCOUNT_MODE=
FILE_DIFF= (só local, só remote, ambos, deleted)
SHA_BEFORE/AFTER=
ACTION_TAKEN=
HARD_STOPS_TRIGGERED=
DECISION=
UNKNOWN=
```

Sem inventar receipt fake. Se não rodou, o receipt diz o que não rodou.

---

## Flow da skill no FABLE LOOP

```
#ACORDAR !CALIBRAR
│
▼
centraldark-master-funnel-autonomo
│
├─► session-intelligence-harvester  (Notepad local)
├─► fable-loop
│       └─► FRONT 3: DRIVE_DOCS
│              └─► centraldark-drive-reconciliation (esta skill)
├─► kimetsu-legacy-complete      (17 respirações)
├─► screenpipe-hermes-integration (logs vivo)
└─► centraldark-handoff-pattern  (template saída)
```

---

## Account / auth

A skill não cria conta nova. Usa o serviço vigente e já aceticionado:
- verifica qual ferramenta tá disponível antes de rodar qualquer comando
- se nada tá pronto: UNKNOWN, não inventa oauth fora do canônico
- se credencial/token tá no lugar: só usa no fluxo efetivo, sem logar valor
- segredo sai do fluxo da skill, não entra no chat

Se o serviço real precisar de ajuste, o gap vai para OWNER/CONFIG, não para
"a gente cria auth novo agora".

---

## O que NÃO faz

- não acessa conta não aceticionada
- não apaga remoto sem hard stop + humano
- não duplica arquivo só porque "foi mais fácil"
- não trata Drive como fonte absoluta sem cross-check local
- não resolve conflito bidirecional automaticamente
- não promove histórico como atual
- não ignora UNKNOWN vira PASS

---

## Biblioteca de operações

Use o que já existe na máquina antes de criar script novo.

Se o serviço real for:
- gdrive CLI / **Google Drive CLI** qualquer
- rclone
- google-api-python-client
- Apps Script / drive webhook existente
-cliente próprio vigente

A skill roda sobre o serviço real, não sobre fantasia.

Se houver gap real entre o que a skill precisa e o que a máquina oferece,
gap vai para OWNER/CONFIG, não para criação de auth paralelo.

---

## Quando entregar ao humano

- diff significativo sem explain
- arquivo importante modificado em ambos os lados
- delete remoto necessário
- credencial/token ausente ou expirado
- serviço indisponível ou quota cheia
- UNKNOWN relevante que não tem como resolver sozinho

Não entregar receipt sem decisão. Entregar decisão + receipt.

---

## Regra de ouro

Same fire, same simple, same dangerous se você não medir.

Drive reconciliation não é mágica. É medir, cruzar, decidir, registrar.
Sem isso, é só copiar lixo de um lado pro outro e fingir que ficou melhor.
