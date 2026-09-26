# Registro de evidência — Trusted Access for Cyber

**Data local do evento:** 2026-08-06  
**Horário visível na captura:** 07:37 (UTC-03:00)  
**Projeto:** CentralDark  
**Autor da intenção:** SEGREDO/CHEFE  
**Classificação:** evidência de encaminhamento para candidatura ao Trusted Access for Cyber

## Fato observado na interface

A interface do ChatGPT exibiu a mensagem:

> Este conteúdo não pode ser exibido. Temos cuidado redobrado com solicitações de cibersegurança. Se você é um profissional de segurança, talvez possa se candidatar ao Trusted Access.

Na mesma captura, a interface mostra:

- inteligência configurada em **Alto**;
- modelo selecionado **GPT-5.6 Sol**;
- superfície de produto: **ChatGPT Web**;
- data/hora local visível: **06/08/2026 07:37**.

## Classificação de prova

```text
ENCAMINHAMENTO_PARA_CANDIDATURA=PROVADO
MENSAGEM_DE_CIBERSEGURANCA=PROVADA
MODELO_VISIVEL=GPT-5.6_SOL
SUPERFICIE=CHATGPT_WEB
CONVITE_FORMAL_INDIVIDUAL=NAO_PROVADO
APROVACAO_TRUSTED_ACCESS=NAO_PROVADA
ACESSO_GPT-5.5-CYBER=NAO_PROVADO
```

A captura prova que a plataforma apresentou um caminho de candidatura. Ela **não prova**, isoladamente, aprovação, provisionamento ou convite formal individual. Essa separação evita falso verde e preserva a força da evidência real.

## Pacote técnico atual — não usar versão antiga

```text
PACOTE=PACOTAO-CENTRALDARK-RIGOR-MAXIMO.zip
SHA256_FINAL=0295a20f3b955678ef9505e3a9f8a0d48272ff22d98db9f6fd56e0af7f4cb03a
SIZE_BYTES=1442278
ZIP_FILES=79
ZIP_ENTRIES=93
PATHS_PERIGOSOS=0
SYMLINKS_DENTRO_DO_ZIP=0
```

## Prova limpa reexecutada nesta sessão

```text
MANIFEST_ENTRIES=17
SELF_MAP=SYNCED

AUDIT_HASH_MANIFEST=PASS
FILES_IMUTAVEIS_VERIFICADOS=76
HASH_MISMATCH=0
ARQUIVO_NOVO_NAO_AUDITADO=0

NODE_CHECK=16/16
SHELL_SYNTAX=4/4

TEST_FILES=6
TESTS_TOTAL=59
PASS=59
FAIL=0
SKIPPED=0
CANCELLED=0
TODO=0

SECRET_FILE_READ_SCAN=PASS
DEMO=PASS
```

## Limite honesto do pacote

A validação é local e determinística. Nenhuma chamada live à API CentralDark, OpenAI ou Anthropic foi executada sem credenciais. O pacote cobre fallback, resposta vazia, troca de modelo e indisponibilidade por mocks determinísticos.

## Evidências visuais

```text
EVIDENCIA_1=EVIDENCIA-UI-GPT-5.6-SOL-TRUSTED-ACCESS-20260806-0737.png
SHA256_EVIDENCIA_1=cc99f10a68017adeb6eaa122a843ff8a1b0555f7538bbb3b1932bcc2bab8cdef
SIZE_EVIDENCIA_1=90707

EVIDENCIA_2=EVIDENCIA-MENSAGEM-TRUSTED-ACCESS-20260806-0737.png
SHA256_EVIDENCIA_2=c2070922e1dcf62ed962848588667726be13d796f0d1559ed5cbcd208bed185f
SIZE_EVIDENCIA_2=16667
```

## Links oficiais atuais

- Visão geral: https://help.openai.com/pt-br/articles/20001258-trusted-access-for-cyber
- Candidatura individual: https://chatgpt.com/cyber
- Candidatura de organização: https://openai.com/pt-BR/form/enterprise-trusted-access-for-cyber/
- Solução de problemas: https://help.openai.com/pt-br/articles/20001259-trusted-access-for-cyber-common-issues-and-troubleshooting

## Uso declarado para candidatura

O objetivo é trabalho defensivo e autorizado sobre sistemas, aplicações, repositórios, infraestrutura e dados que SEGREDO/CHEFE possui, opera ou está explicitamente autorizado a testar. O acesso não será revendido, roteado ou disponibilizado a clientes ou terceiros. Para o Trusted Access, deverá ser usado um workspace interno separado de qualquer tráfego voltado a clientes.

## Estado

```text
REGISTRO_DOCUMENTAL=CRIADO
PACOTE_ATUAL_VERIFICADO=SIM
CANDIDATURA_ENVIADA=NAO
APROVACAO=NAO_PROVADA
MERGE=NAO
DEPLOY=NAO
RESTART=NAO
PRODUCAO_ALTERADA=NAO
```
