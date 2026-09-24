# Missão Cockpit Vivo — estado atual

- Autoridade: CHEFE
- Fonte canônica: `ServerVpss/CentralDark@CURRENT`
- Main medida no encerramento local: `6fce1850bce9889955b6a1a803815730a1d18ef0`.
- Writer único material: `agent/centraldark-cockpit-vivo`.
- Receipts das branches auxiliares foram absorvidos neste writer; nenhuma branch equivalente nova foi criada.
- Invariantes: REUSE_BEFORE_CREATE, ONE_SYSTEM_ONLY, REALITY_IS_JUDGE, UNKNOWN != PASS, ACTION != PROOF, NO_V1_V2_V3.

## Materializado na superfície Lovable

- Um único `HermesFlutuante` reutilizado pela landing, entrada do cockpit, autenticação, sala protegida e repositório.
- Passeio ligado por padrão, direção e velocidade controláveis, inversão nas bordas, parada em waiting, tamanho móvel e preferência de esconder persistida.
- Painel autenticado preserva 144 quadros, 9 ações e as peles existentes.
- HUD vivo mostra GitHub, Gmail e Hermes Desktop sem promover ausência de prova para PASS.
- Gmail permanece `AUTH_REQUIRED`; o GitHub usa o conector já existente.
- Supabase existente reutilizado para e-mail/senha e Google; nenhum backend paralelo foi provisionado.
- Pacote único externalizado contém desktop, mobile, GIFs, três peles, manifesto e instaladores com backup.

## Contraprova local

- Playwright encontrou o Hermes e observou deslocamento em `/`, `/cockpit`, `/auth` e `/repositorio`.
- As quatro superfícies não emitiram erros de console na repetição final.
- `/sala-controle` sem sessão redirecionou corretamente para `/auth`.
- Typecheck concluiu sem erro.
- Não existem testes unitários no checkout, portanto a tentativa de Vitest terminou como `NO_TEST_FILES`, não PASS.

## Fronteiras atuais

- Sala autenticada: `UNKNOWN` visualmente; o projeto não possui usuário para cunhar sessão de contraprova.
- Hermes Desktop físico: `BUILT_NOT_RUNTIME_PROVEN`; bridge ativo não prova execução no computador.
- Deploy oficial: `ERRO`; VPS em `ec52fad88be`, atrás da main, workflows ainda em execução e inventário PM2 inválido por JSON malformado.
- Gmail: `AUTH_REQUIRED`, sem bloquear as demais frentes.
