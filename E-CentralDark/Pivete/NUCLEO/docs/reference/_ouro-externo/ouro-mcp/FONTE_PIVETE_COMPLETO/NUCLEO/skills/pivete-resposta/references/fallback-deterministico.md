# Fallback determinístico — roteamento sem V2 (aula SOL 05–06/08)

Fonte: aula do Pivete à SOL (navegador paralelo). Aplicável quando qualquer
IA/API/runner falha por timeout, limite, indisponibilidade, billing ou sem acesso.

## Princípio
Não inventar orquestrador novo, V2 ou sistema paralelo. Reutilizar o motor
existente e ligar a rota JÁ desenhada nos pontos que ficaram sem saída.

## Tabela de roteamento (uma rota só, executada uma vez)
CODEX_SEM_ACESSO        -> GPT/HERMES/HUMANO_AUTORIZADO
RUNNER_GITHUB_BLOQUEADO -> SELF_HOSTED
SOL_SEM_API             -> SCRIPT_LOCAL_OU_VPS
NENHUMA_ROTA_DISPONIVEL -> BLOQUEIA + NOTIFICA

## Passos (máquina de estados mínima)
1. classifique a falha (timeout / limite / indisponível / billing / sem acesso)
2. selecione EXATAMENTE UMA rota autorizada já cadastrada
3. execute a rota somente uma vez
4. não improvise e não altere escopo
5. registre tentativa, resultado e prova
6. atualize UMA mensagem no Telegram e informe a SOL
7. se SOL offline/sem API, continue pelo código local/VPS autorizado
8. se nenhuma rota existir -> falhe fechado e peça ao Chefe SÓ a ação exata

## Template de mensagem única no Telegram
FALLBACK ATIVADO
MISSAO=
FALHA_PRIMARIA=
ROTA_QUE_ASSUMIU=
ACAO_EXECUTADA=
PROVA=
ACAO_DO_CHEFE=nenhuma | botao/linha exata

## Desenho de governança
SEGREDO DA A INTENCAO
SOL COORDENA QUANDO ESTA DISPONIVEL
IA RACIOCINA QUANDO CONSEGUE
CODIGO GARANTE CONTINUIDADE
TELEGRAM MOSTRA O ESTADO
ACOES PROVAM

## Estado conhecido (prova dos prints)
- PR #677 consolidou o CONTRATO do fallback (regra documentada).
- O RUNTIME AINDA NAO espalhou o fallback para todas as entradas.
  Ex.: GitHub Actions / Codex sem acesso — o código de fallback nem roda
  porque o runner hospedado nem inicia (billing). Precisa cair p/ self-hosted.
- PR #637 comprova limite do Codex (sem cota/acesso).
- Veredito: intenção correta; falta ligar a rota já desenhada nos pontos
  sem saída. Não reinventar.

## O que NÃO fazer
- Não tratar falha de billing como "precisa implementar outro sistema".
- Não trocar de conta para resolver billing de Actions (cobre a conta dona
  do repo: ServerVpss). Para cobrar outra conta, transferir o repo.
- Não disparar nova mensagem de recibo em separado (ver regra de Card Único).
