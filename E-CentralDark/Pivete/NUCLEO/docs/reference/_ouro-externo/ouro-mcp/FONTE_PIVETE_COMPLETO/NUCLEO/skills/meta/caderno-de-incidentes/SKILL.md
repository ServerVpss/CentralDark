---
name: caderno-de-incidentes
description: Registra incidentes. Pergunta simples tem resposta simples.
---

# CADERNO DE INCIDENTES — Aprendizado Contínuo

## QUANDO USAR
- Toda vez que um gatilho da zona-burra disparar e o Pivete corrigir
- Quando o Pivete disser "REGISTRA ISSO" ou "ISSO NÃO PODE ACONTECER"
- Antes de responder qualquer pergunta simples

## REGISTRO DE INCIDENTE (formato fixo)

```text
DATA=[data/hora]
GATILHO=[# do gatilho da anti-zona-burra]
PERGUNTA_ORIGINAL=[o que foi perguntado]
MEU_ERRO=[o que fiz de errado]
CORRECAO=[o que o Pivete mandou]
REGRA_NOVA=[padrão aprendido]
REINCIDENCIA=[SIM/NÃO até o momento]
```

## INCIDENTES DESTA SESSÃO (06/08/2026)

| # | Data | Gatilho | Erro | Correção |
|---|---|---|---|---|
| 1 | 06/08 | 🔴8 | Pergunta "SIM ou NÃO + data?" → fui fazer git pull | PERGUNTA SIMPLES → RESPOSTA SIMPLES |
| 2 | 06/08 | 🔴1 | Loop no `skill_manage` (descrição >60 chars, 4 tentativas) | Encurtar descrição, contar caracteres antes de submeter |
| 3 | 06/08 | 🔴7 | Tentei adivinhar URLs GitHub (404) em vez de usar botão View on GitHub | skillsllm tem botão, usar o navegador |
| 4 | 06/08 | 🔴8 | Duas mensagens seguidas (resposta + card separado) | Card na MESMA bolha da resposta |
| 5 | 06/08 | 🔴8 | Afirmei que "não posso instalar plugin X/Twitter" como limitação fixa, sem verificar — era erro meu | NÃO afirmar incapacidade/limitação sem prova; checar antes de dizer "não posso" |

## PERGUNTA SIMPLES → RESPOSTA SIMPLES (REGRA DURA)

Quando a pergunta for:
- SIM ou NÃO → responde SIM ou NÃO + fato relevante (1 linha)
- Qual data? → responde a data
- Qual arquivo/caminho? → responde o caminho exato
- Onde fica? → responde localização exata

NUNCA adicionar ação extra (git pull, busca, investigação) a menos que a resposta dependa dela E a pergunta explicitamente peça.

## NÃO AFIRMAR LIMITAÇÃO SEM PROVA (REGRA DURA — Incidente #5)

Quando for tentar dizer "não posso", "não funciona", "não tenho acesso", "plugin X não instala":
- VERIFICAR primeiro (skill_view, terminal, docs oficiais, browser)
- Se não achou prova de que NÃO pode → dizer "NÃO_VERIFICADO" ou tentar o caminho
- NUNCA afirmar incapacidade como fato fixo sem ter testado/confirmado

Erro de autoridade = afirmar limitação que não existe. Isso confunde o Pivete e trava trabalho real.

## BINÁRIOS DA SESSÃO

| CHECK | ESTADO |
|---|---|
| `CADERNO_LIMPO` | SIM (4 incidentes, todos corrigidos) |
| `PERGUNTA_DESVIADA` | NÃO (regra aplicada após incidente #1) |
| `CARD_DUPLICADO` | NÃO (regra aplicada após incidente #4) |
| `REINCIDENCIA` | NÃO (nenhum repetido) |

## DESCOBERTAS DA SESSÃO

### Pacotes de Defesa Canônica
`C:\Users\danda\Downloads\Compressed\Nova pasta\CADEADO TRANCADO  SO COM PERMITO SEGREDO\`

| Pacote | Data | Função |
|---|---|---|
| `CENTRALDARK-MANDATO-CELESTIAL-CORRIGIDO` | 27/07 | Agente contra si mesmo em caixa preta selada. 5 estados, Docker + seccomp |
| `CentralDark-Runtime-Closed-Loop-01` | 31/07 | Circuito fechado: 8 fases (A→H), modelo local, Judge independente |
| `self-learning-skills-main` | 01/07 | Meta-skill: captura golden paths, 3 travas, 6 passos de colheita |
| `centraldark-hardening-pack` | 31/07 | VPS cirúrgico: UFW, bind localhost, secrets fora do Git |

### Red Teaming e Classes de Ameaça
5 classes de ameaça identificadas (red team real, não benchmark):
→ `references/red-team-threat-classes.md`
- Falta de autoridade, Bypass de gate, Herança de contexto, Recibo falso, Loop de autoaprovação
- Fonte: Red Teaming and Adversarial Testing Strategies for GPT-Class AI Systems (George Micheal, 2026)

### Claude Code
- Instalado v2.1.220, autenticado, Sonnet 5 funcional

### Modelos testados
- DeepSeek v4-pro (Telegram), Grok 4.5 (Terminal), ChatGPT (navegador SOL)

## PROIBIDO
- Reincidir no mesmo incidente (perde ponto)
- Responder pergunta simples com inventário
- Sair do rumo da pergunta para fazer ação extra

## Support files
- `references/material-externo-absorcao.md` — padrão de absorção de PDF/gist/vídeo/artigo, com yt-dlp e conexão Casa