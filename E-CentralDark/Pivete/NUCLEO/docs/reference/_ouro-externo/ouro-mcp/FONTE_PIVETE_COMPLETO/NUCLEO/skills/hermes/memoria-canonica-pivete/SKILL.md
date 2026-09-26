---
name: memoria-canonica-pivete
description: "Gestão da memória do Pivete — perfil (MEMORY.md 8k) vs NUCLEO canônico (E:\\CentralDark\\Pivete\\NUCLEO\\motor\\03-memoria\\memoria\\). Quando cortar duplicata, como tratar pacote de skill vindo de chat externo (Candidato), e o ritmo CALMA/REVISAR do Pivete. Usar antes de gravar/remover memória ou processar skill de fonte externa."
version: 1.0.0
platforms: [windows]
metadata:
  hermes:
    tags: [memoria, canonico, nucleo, profile-pivete, 3-temperaturas, skill-candidato]
    related_skills: [visao-perfil-pivete, daily-ops, meta-lupa]
---

# Memória Canônica — Pivete (CASA)

Como equilibrar o `MEMORY.md` do perfil (pequeno, lido todo turno) com o NUCLEO (grande, fonte da verdade) — e como tratar skill vinda de chat externo.

## Quando usar
- Vai gravar aprendizado novo e o `MEMORY.md` do perfil está perto do limite (8.000 chars).
- Pivete manda "salva no canônico" / "tira o que já virou canônico".
- Chega pacote de skill de ChatGPT/Claude/Gemini ou qualquer chat.
- Pivete manda "CALMA", "fica calmo", "revisa até ter certeza".

## Arquivos
- Perfil (lido todo turno, teto 8k): `C:\Users\danda\AppData\Local\hermes\profiles\pivete\memories\MEMORY.md`
- Canônico (fonte da verdade, espaço livre): `E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\` → `HOJE.md` (quente), `SEMANA.md` (morna), `REGRAS.md` (fria)
- Manual espelho: `E:\CentralDark\Pivete\NUCLEO\MANUAL-SESSAO-19-07-2026\MANUAL.html`

## Regra 1 — canônico é prioridade
Se o `MEMORY.md` estourar (ex: 8.624/8.000), NÃO force gravar lá. Salve no NUCLEO (`HOJE.md`/`REGRAS.md`). Perda = zero; o canônico tem espaço.

## Regra 2 — cortar duplicata (liberar espaço no perfil)
Só remover do `MEMORY.md` o que JÁ virou canônico E é estável:
1. Ler `MEMORY.md` + `MEMORIA.md`/`HOJE.md`/`REGRAS.md` do NUCLEO.
2. Cruzar: entrada do perfil que tenha destino canônico idêntico → candidata a corte.
3. MANTENHA no perfil (não cortar): identidade, TTS, Card Hermes canônico, darkai, modelos ativos, OpenRouter, Chrome DPAPI, regras de CALMA. São lidas todo turno e/ou não têm destino canônico ainda.
4. NÃO cortar lixo duvidoso nem nada sem destino seguro.
5. Mostrar o plano de corte ANTES de escrever (Pivete mandou "cuidado total"). Só executa com "PERMITO PIVETE".

## Regra 3 — pacote de skill de chat externo = CANDIDATO
- ChatGPT/Claude/Gemini podem gerar pacote de skill (SKILL.md + scripts + tests + ZIP com SHA256).
- Tratar como **CANDIDATO**, nunca instalar por conta própria.
- Fazer **patch no artefato canônico existente** (ex: `meta-lupa`), NUNCA criar V2 paralelo.
- Só instalar/comitar com autorização literal do Pivete.
- Loop infinito de refinamento em container = visão futura; só entra em VPS/browser com autorização explícita. Casa primeiro, VPS por último.

## Regra 4 — ritmo CALMA / REVISAR (estilo do Pivete)
- "CALMA", "fica calmo relaxa" = pausar, não ruscar, mostrar diff antes de gravar.
- "revisa até ter certeza" = entregar resultado no padrão dele pra revisar, não adoção silenciosa.
- Em dúvida de escrita no perfil: parar no plano, esperar OK. Não executor solto.
- Nunca fechar veredito ("pendência: nenhuma") sem nomear o delta de estado do runtime.

## Regra 5 — "morar no NUCLEO" (amarração automática)
O Pivete construiu a árvore `E:\CentralDark\Pivete\NUCLEO\motor\` (01-identidade, 02-cerebro,
03-memoria, 10-observabilidade) e reclamou que eu NÃO a lia por padrão — só quando mandado.
Isso é o risco de **dessincronia**: perfil e NUCLEO viram 2 verdades.
- Fix proposto (R2, precisa PERMITO): `SOUL.md` do perfil ganha bloco fixo apontando pro NUCLEO
  e mandando ler `motor/03-memoria/memoria/HOJE.md` + `REGRAS.md` + `motor/01-identidade` toda sessão.
  O perfil vira índice enxuto; o NUCLEO é fonte.
- NÃO usar symlink de `hermes-mente` → `motor` (quebra fácil, risco de path sumir).
- Destilar o `hermes-mente/HERMES-REGRAS-DE-OURO.md` (velho, travado) pro `motor/01-identidade`;
  o velho vira histórico, não ativo.
- Opção de automação: cron job "manter-casa" (varre duplicata perfil↔NUCLEO + vasculha doc local/
  net) — só Casa, sem VPS.

## Regra 8 — 3 temperaturas = hot/warm/cold (evolução 02/08)
Mapear explicitamente (REGRAS #26 + SOUL §32): `HOJE(hot)` = RAM/missão do dia, `SEMANA(warm)` = padrões em maturação, `REGRAS(cold)` = verdades estáveis. Consenso da indústria (MemGPT/Letta, OpenClaw, greennode.ai) — copiar o padrão, não o pacote externo. Skill `organize-memory` (criada 02/08, curator-managed, em `skills/pivete/organize-memory/`) redistribui HOJE→SEMANA→REGRAS após compaction e tem **evidence gate** (só promove a skill com check+failpattern+dead-end — fórmula extraída de Kulaxyz/self-learning-skills, não o repo instalado).

## Regra 9 — Card-Mestre + fluxo fixo + % (estilo do Pivete 02/08)
- **Card-Mestre** (`CARTAO-MESTRE.md` em `motor/03-memoria/memoria/`): única superfície de estado; atalhos `card`/`quadro`/`pendencias`/`ancoras`/`regras`/`fio`/`soul`. REGRAS #22.
- **Fluxo fixo** (REGRAS #23): toda ação concluída → exibir Card-Mestre atualizado. Ciclo, não exceção.
- **% por entrada** (REGRAS #26): DATA+HORA+%, % só do provedor. Ver skill `pivete-resposta`.
- **Estouro de memória fixa:** ao bater ~98% (ex: 7.876/8.000), consolidar REMOVENDO redundantes + substituindo por versão que aponta para REGRAS/SOUL. Feito autonomamente (REGRAS #21). Não perguntar.

## Regra 6 — estado real das 3 temperaturas (26/07/2026)
Até 19/07 estavam a 0 byte / ausentes (🔴 no MANUAL.html). Nesta sessão foram CRIADAS e populadas:
`HOJE.md`, `SEMANA.md`, `REGRAS.md` em `motor/03-memoria/memoria/`. Agora são a fonte ativa.
Não recriar; apenas acrescentar. `MEMORY.md` do perfil deve permanecer índice (2.5k leve após cortes).

## Integração com MetaLupa
Memória que não é lida não existe. Canônico + 3 temperaturas + ledger = recuperação, não armazenamento. Falso verde = achar que "salvei" sem destino confirmado. Outro falso verde: achar que "tô usando o NUCLEO" sem ter gatilho de leitura (Regra 5). Vision = `VISION=<modelo>` no painel não prova funcionamento (ver skill `visao-perfil-pivete`).

## Regra 7 — registrar rota externa nos DOIS lugares (perfil + NUCLEO)
Quando uma CLI/rota nova for comprovada (ex: Claude Code CLI `claude` v2.1.220 autenticada,
modelos sonnet-4-5/opus-4-5/sonnet-4-6/opus-4-7 OK; sonnet-4/opus-4 aposentados), gravar EM DOIS
LUGARES: (1) `MEMORY.md` do perfil (índice, lido todo turno) e (2) `REGRAS.md` do NUCLEO como regra
estável. Assim a rota "morra" no NUCLEO também e não se perde se o perfil estourar. Detalhe
operacional de invocação: ver skill `hermes-pivete-local-ops` §8.
