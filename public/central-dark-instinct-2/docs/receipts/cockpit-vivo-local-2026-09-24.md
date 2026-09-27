# Recibo local — cockpit vivo e Hermes

Medido em 2026-09-24 às 06:39 UTC.

## Materializado

- Um único motor `HermesFlutuante` é reutilizado pelas superfícies.
- Passeio ligado por padrão, direção e velocidade controláveis, inversão nas bordas e pausa em `waiting`.
- Tamanho reduzido no celular, movimento reduzido respeitado e preferência de esconder persistida localmente.
- Entrada pública em `/cockpit`, autenticação em `/auth` e sala protegida em `/sala-controle`.
- HUD lê o commit atual do GitHub pelo conector existente; Gmail permanece `AUTH_REQUIRED`.
- Pacotão único inclui Instinto Superior desktop/móvel, 144 quadros, GIFs, Forja, Celestial, Ascensão, manifesto e instaladores com backup.

## Prova executada

- `/`, `/cockpit`, `/auth`, `/sala-controle` e `/repositorio`: responderam no servidor local.
- `/sala-controle` sem sessão redirecionou para `/auth`.
- Hermes encontrado e deslocamento observado em `/`, `/cockpit`, `/auth` e `/repositorio`, sem erros de console.
- ZIP validado por `unzip -t`, 22 MB externalizado como asset, SHA-256 local `79c5f9b5c869b3179ebcf24783e56fe5b5968bcbeb6ebd2417ffd6a497410dee`.

## Fronteiras honestas

- Gmail: `AUTH_REQUIRED`; não bloqueia o restante.
- Sala autenticada: `UNKNOWN` visualmente porque o projeto não possui usuário de autenticação para gerar uma sessão de prova.
- Hermes Desktop físico: `UNKNOWN`; ponte disponível não equivale a execução provada.
- Writer oficial: `agent/centraldark-cockpit-vivo` em `f685436`, acima da main `6fce185`, com os receipts auxiliares absorvidos.
- Deploy oficial: `ERRO`; VPS em `ec52fad`, um commit atrás da main, três workflows em execução e leitura PM2 inválida por JSON malformado.

UNKNOWN != PASS · ACTION != PROOF · CURRENT > HISTORY.