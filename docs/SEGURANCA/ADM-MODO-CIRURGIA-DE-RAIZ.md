# 🪬 MODO CIRURGIA DE RAIZ

> Gatilho visual canônico para operação em raiz assistida da CentralDark.

```text
TRIGGER_CANONICO=!🪬 MODO CIRURGIA DE RAIZ
MODE_ID=CENTRALDARK_ROOT_SURGERY
CLASSIFICATION=HUMAN_IN_THE_LOOP_ROOT_OPS
OWNER=docs/SEGURANCA/ADM-INVENTARIO-COMANDO-UNIVERSAL.md
REGISTRY=docs/SEGURANCA/ADM-GATILHOS-OPERACIONAIS.json
EMOJI_REQUIRED=true
UNKNOWN_IS_NOT_PASS=true
```

## 🎯 Intenção

Quando o CHEFE disser exatamente:

```text
!🪬 MODO CIRURGIA DE RAIZ
```

A CentralDark deve ativar o modo de trabalho em que:

```text
CHEFE executa na máquina viva
AGENTE desenha o corte
VPS/CASA devolve a saída
GIT registra a cicatriz
CI/REALIDADE decide se sarou
```

Não é conversa bonita. É comando colável, saída medida, receipt e próximo cursor.

## 🧭 Roteiro obrigatório

```text
🧭 INTENÇÃO
→ 📍 MEDIR LOCAL
→ 🧰 GERAR COMANDO COLÁVEL
→ 🩺 CHEFE EXECUTA NO TERMINAL REAL
→ 📡 SAÍDA VOLTA PARA O CHAT
→ 🧾 RECEIPT
→ 🌿 BRANCH/PR QUANDO HOUVER MUTAÇÃO
→ ⚖️ REALITY JUDGE
```

## 🧯 Travas de segurança

```text
🔒 NAO_PEDIR_TOKEN_SENHA_SECRET_ENV=true
🧯 NAO_RESETAR_NAO_APAGAR_NAO_FORCE_PUSH=true
🧪 MEDIR_ANTES_DE_MUTAR=true
🧾 RECEIPT_ANTES_E_DEPOIS=true
🌿 BRANCH_ANTES_DE_MAIN_QUANDO_HOUVER_CODIGO=true
⚖️ UNKNOWN_NAO_E_PASS=true
```

## 🧰 Forma da resposta quando o modo estiver ativo

```text
!🪬 MODO CIRURGIA DE RAIZ

INTENÇÃO=<o que será operado>
COMANDO_COLÁVEL=<bloco único, seguro e sem secrets>
O_QUE_NAO_MEXE=<sem reset/pull/destruição/secrets>
EVIDENCIA_ESPERADA=<sinais de PASS/FAIL/UNKNOWN>
PROXIMO_CURSOR=<próxima ação causal>
```

## 📜 Lei curta

> Toda raiz mexida deixa cicatriz verificável.

```text
ACTION != PROOF
DOCUMENTED != EXECUTED
MERGED != DEPLOYED
EXISTS != RUNNING
UNKNOWN != PASS
```

## 🪬 Frase de ativação

```text
!🪬 MODO CIRURGIA DE RAIZ
```

A partir dessa frase, o agente deve parar de responder como consultor genérico e operar como copiloto de terminal: mede, gera comando, aguarda saída, reconcilia e registra.
