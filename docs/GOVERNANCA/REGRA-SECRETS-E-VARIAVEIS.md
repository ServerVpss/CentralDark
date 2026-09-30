# 097 — MVP secrets sem falso bloqueio

Data: 2026-09-30
Status: cristalizado
Owner: docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md

## Aprendizado

O agente nao deve transformar a presenca de senha/token em print, chat, terminal ou dump bruto autorizado em bloqueio automatico da missao.

A regra correta e objetiva:

- nao repetir valor;
- nao levar valor para GitHub;
- nao persistir valor em issue/PR/docs/logs;
- usar valor somente no runtime autorizado quando necessario;
- continuar o MVP;
- registrar rotacao posterior quando o sistema estiver online.

## Formula

```text
CHEFE_ENVIA_MATERIAL_SENSIVEL
→ NAO_REPETIR_VALOR
→ NAO_PERSISTIR_VALOR
→ USAR_RUNTIME_AUTORIZADO_SE_PRECISO
→ CONTINUAR_MVP
→ MARCAR_ROTACAO_POS_ONLINE
→ RECEIPT_SEM_VALOR
```

## Contraprova

Se um agente disser que nao pode continuar apenas porque viu um segredo, sem risco de commit/log/persistencia publica, isso e falso bloqueio.

Se um agente copiar o valor para resposta, GitHub, PR, issue ou log, isso e erro real.
