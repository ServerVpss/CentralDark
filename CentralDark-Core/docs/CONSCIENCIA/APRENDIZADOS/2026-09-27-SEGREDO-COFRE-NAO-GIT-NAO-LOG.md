---
title: "Segredo fica no cofre; Git e log só recebem rastro sem valor"
date: 2026-09-27
status: CANONICO_OPERACIONAL
owner: "docs/CONSCIENCIA/APRENDIZADOS/2026-09-27-SEGREDO-COFRE-NAO-GIT-NAO-LOG.md"
tags: [centraldark, seguranca, cofre, segredo, rastro, git, logs, chefe]
---

# Segredo fica no cofre; Git e log só recebem rastro sem valor

## Intenção do CHEFE

O CHEFE não quer que a máquina trave missão por paranoia de segredo. A obrigação do agente é mais precisa:

```text
NAO_LEVAR_SEGREDO_PARA_GIT=true
NAO_LEVAR_SEGREDO_PARA_LOG=true
NAO_LEVAR_SEGREDO_PARA_RECEIPT=true
NAO_LEVAR_SEGREDO_PARA_COMENTARIO=true
NAO_TRANSFORMAR_SEGREDO_TEMPORARIO_EM_MEMORIA=true
COFRE_E_DONO_DO_VALOR=true
DELTA_UTIL_CONTINUA=true
```

Senha, token, device code, sessão, cookie, chave ou credencial temporária são trânsito operacional quando o CHEFE autoriza. O valor pode existir no fluxo/cofre/origem segura, mas não vira artefato permanente.

## Regra operacional

Se um pacote, arquivo, print, log, dump ou pasta contiver segredo:

```text
SEGREDO_DETECTADO=true
VALOR_EXIBIDO=false
VALOR_COMMITADO=false
VALOR_LOGADO=false
VALOR_PERSISTIDO_EM_RECEIPT=false
ACAO=SINALIZAR_TIPO_CAMINHO_FUNCAO_E_CONTINUAR_DELTA_UTIL
```

O agente pode registrar:

- tipo do segredo;
- nome da variável ou provedor;
- caminho onde mora;
- função operacional;
- owner/cofre responsável;
- se precisa recriar, rotacionar, descartar ou manter local.

O agente não registra:

- valor integral;
- token cru;
- senha;
- cookie;
- chave privada;
- session file;
- bearer header;
- device code vivo em artefato permanente;
- segredo em commit, log, receipt, comentário ou memória.

## Cofre ≠ Git ≠ log

```text
COFRE=VALOR_PROTEGIDO
GIT=PROVA_E_RECEITA_SEM_VALOR
LOG=RASTRO_OPERACIONAL_SEM_VALOR
CHAT=PASSAGEM_HUMANA_QUANDO_NECESSARIO
```

Se o CHEFE entregar pacote com segredo, o agente não abandona a missão. Ele sinaliza o risco, preserva o cofre, remove/redige valor dos artefatos permanentes e continua o que for delta útil.

## Falsificador

A regra foi quebrada se qualquer valor secreto aparecer em:

- Git;
- PR;
- issue;
- comentário;
- receipt;
- log versionado;
- arquivo de aprendizado;
- memória canônica;
- print permanente não redigido.

## Resumo de bolso

```text
COFRE_PROTEGE=true
GIT_PROVA=true
LOG_RASTREIA=true
SEGREDO_NAO_MORA_EM_GIT_NEM_LOG=true
SEGREDO_NO_PACOTE_NAO_BLOQUEIA_DELTA_UTIL=true
```
