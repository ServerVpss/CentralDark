# COMANDO - 2026-08-10-incidente-escopo-menos-e-mais.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\APRENDIZADOS\2026-08-10-incidente-escopo-menos-e-mais.md
**SHA:** ffb63620d25af639
**Timestamp:** 2026-08-28T02:56:43.522168
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- RESTART=NAO

### Ouro Bruto (primeiros 5000 chars)
```
# Incidente — aplicação indevida de “menos é mais” ao CHEFE

Data: 2026-08-10
Status: CANDIDATO — aguarda revisão/merge
Base observada: `main@9673861d36ab51b9701735934b5037a1fd643958`
Origem: correção direta do SEGREDO/CHEFE durante calibração

## Incidente

Durante uma resposta de calibração, o agente aplicou a regra operacional “menos ferramentas, menos agentes e menos texto; mais precisão, resultado e prova” como se ela também restringisse a forma de exploração, comando e experimentação do SEGREDO/CHEFE.

Isso inverteu o escopo da regra. A regra disciplina a complexidade produzida, implantada e devolvida pelos agentes. Ela não limita a quantidade de contexto, hipóteses, chats, modelos, ferramentas, prints, arquivos, experiências ou provocações que o SEGREDO/CHEFE pode fornecer ou solicitar para investigação.

## Causa

Confusão entre duas camadas distintas:

1. `INPUT_DO_CHEFE`: pode ser amplo, exploratório, redundante, multimodal e experimental.
2. `OUTPUT/IMPLEMENTACAO_DO_AGENTE`: deve reconciliar, eliminar duplicação e conservar somente a complexidade que provar utilidade.

O agente transportou uma restrição da camada de execução para a camada de autoridade/intenção humana.

## Correção canônica de interpretação

```text
CHEFE PODE EXPANDIR A BUSCA.
AGENTE DEVE REDUZIR O RESULTADO AO NECESSÁRIO.

ENTRADA PODE SER GRANDE.
SAÍDA DEVE SER A MENOR SUFICIENTE.

INVESTIGAÇÃO PODE USAR VÁRIAS LENTES.
ARQUITETURA FINAL RETÉM SOMENTE O QUE PROVAR GANHO.

“MENOS É MAIS” NÃO É LIMITE COGNITIVO OU OPERACIONAL DO CHEFE.
É DISCIPLINA DE COMPLEXIDADE PARA AGENTES E PARA O ARTEFATO FINAL.
```

## Contraprova futura

Se o CHEFE pedir Meta Lupa + AutoLupa + Fable Loop, múltiplos agentes, múltiplos chats ou outra investigação paralela, o agente não deve bloquear o pedido apenas invocando “menos é mais”. Primeiro deve permitir/avaliar a exploração autorizada e medir o ganho. Somente na consolidação deve remover redundância e impedir que mecanismos sem ganho comprovado virem dependência arquitetural permanente.

## Relação com regras existentes

Este incidente não altera autoridade, segurança, Writer único, Judge independente, autorização para merge/deploy/restart nem a exigência `REUSE_BEFORE_CREATE_REQUIRED`. Ele apenas fixa o escopo correto da regra de menor movimento eficaz.

## Receipt

```text
ERRO_EXATO=restrição de complexidade dos agentes aplicada indevidamente ao CHEFE
ACUSADOR_APONTADOR=SEGREDO/CHEFE
IMPACTO=risco de limitar investigação autorizada e interpretar intenção humana como violação de governança
WRITER_RESOLUTOR=ChatGPT / sessão atual
CORRECAO_MINIMA=registrar a distinção INPUT_DO_CHEFE vs OUTPUT_DO_AGENTE sem alterar canônicos nesta rodada
CONTRAPROVA=pedido amplo do CHEFE não pode ser recusado só por “menos é mais”; consolidação continua obrigada a eliminar peso sem ganho
MERGE=NAO
DEPLOY=NAO
RESTART=NAO
MAIN_TOCADA=NAO
```

```