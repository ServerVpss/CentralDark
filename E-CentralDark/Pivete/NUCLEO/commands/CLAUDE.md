# COMANDO - CLAUDE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\CLAUDE.md
**SHA:** 8f2a6299639286b5
**Timestamp:** 2026-08-26T19:20:32.041810
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** tudo relacionado a orquestração de IAs, delegação, ensino de outras IAs, e o comando `darkai` mora AQUI. Não espalhar em outras pastas.
- > Regra: nenhuma alteração estrutural é considerada concluída enquanto os 4 pontos não refletirem o mesmo estado.

### Gaps
- Método: Zoom Out → Zoom In → Feynman → cenários → prova → veredito (APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR). Nunca criar "Lupa V2" — toda evolução do método é correção mínima no próprio arquivo c

### Ouro Bruto (primeiros 5000 chars)
```
# CLAUDE.md

> Dump de Estado do Projeto — leitura obrigatória para qualquer IA/Hub que abrir este repositório.
> Última atualização: 19/07/2026

---

## 🧠 CÉREBRO COMPARTILHADO DAS IAs — `docs/CONSCIENCIA/DARKAI/`

**Qualquer IA que abrir este repo deve ler PRIMEIRO:** [`docs/CONSCIENCIA/DARKAI/README.md`](docs/CONSCIENCIA/DARKAI/README.md)

Essa pasta concentra TUDO sobre o comando `darkai` (CLI que dá acesso a Gemini/GPT-5/etc via edge function `ai-proxy` com uma única chave protegida na Lovable Cloud):
- `README.md` — índice geral (comece aqui)
- `QUICKSTART.md` — instalar e usar em 5 minutos
- `PROMPT-UNIVERSAL.md` — prompt pronto pra colar em qualquer IA (Claude, GPT, Gemini, Cursor) e ensinar ela a usar `darkai`
- `00-COMECE-AQUI.md` até `10-TROUBLESHOOTING.md` — curso completo
- `darkai.sh` + `instalar-local.sh` + `instalar-windows.ps1` — scripts
- `exemplos/` — receitas prontas

**Regra:** tudo relacionado a orquestração de IAs, delegação, ensino de outras IAs, e o comando `darkai` mora AQUI. Não espalhar em outras pastas.

### 🔫 Arsenal Council — `docs/CONSCIENCIA/ARSENAL/`

Sistema de Conselho de IAs (`/router`, `/refinar`, `/debate` + Hermes autônomo). Tudo mora numa pasta só: relatórios por fase, debates, evolução, `regras.json` e scripts. Índice: [`docs/CONSCIENCIA/ARSENAL/README.md`](docs/CONSCIENCIA/ARSENAL/README.md).

### 🔎 Técnica da Lupa Premium — `E:\CentralDark\Pivete\NUCLEO\`

**Qualquer IA que for revisar, planejar, integrar ou aprovar mudança de risco médio/alto (R2+: fluxo interno, gateway, autenticação, dados, produção, orquestração de agentes) deve aplicar primeiro:** `E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\TECNICA-DA-LUPA-PREMIUM.md` (fonte única — não redefinir em outro lugar).

Skill de entrada (ponteiro, não a técnica em si): `E:\CentralDark\Pivete\NUCLEO\skills\tecnica-da-lupa-premium\SKILL.md` — também espelhada em `C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\tecnica-da-lupa-premium\SKILL.md` para o Hermes descobrir sozinho (`hermes --profile pivete skills list` já lista como `enabled`).

Método: Zoom Out → Zoom In → Feynman → cenários → prova → veredito (APROVAR | CONDICIONAR | CORRIGIR | BLOQUEAR). Nunca criar "Lupa V2" — toda evolução do método é correção mínima no próprio arquivo canônico, registrada em "Histórico de Evolução" dentro dele mesmo. Aplicações reais ficam documentadas em `E:\CentralDark\Pivete\NUCLEO\motor\10-observabilidade\REVISAO-TECNICA-DA-LUPA.md`.

---

## 1. Identidade do Projeto

- **Nome:** TelePanel (frontend) + CentralDark (infra/microsserviços)
- **Stack:** React 18 + Vite 5 + Tailwind v3 + TypeScript 5
- **Backend:** Supabase gerenciado — projeto ref `kagejpghnwdfymddwxuf`
- **Domínio oficial:** https://centralldark.com
- **Painel de status:** https://status.centralldark.com
- **Repositório GitHub:** sincronizado bidirecionalmente com a VPS (`/root/CentralDark/`) via webhook próprio

---

## 1.1. Arquitetura de Bots do Telegram (mapa oficial)

Dois bots, dois mundos completamente separados. **Nunca misturar.**

| Bot | Papel | Onde vive | Edge function | Banco |
|---|---|---|---|---|
| `@srver1bot` | **Central** — controle geral CentralDark | HUB Supabase (`lyoigsqluyktoclwdaft`) + VPS PM2 id 27 (`CentralDark-HubBot`) | `telegram-webhook` (Lovable Cloud atual, consulta o HUB) | HUB |
| `@SEGREDOPUXADASBOT` (🩸FISCAL🩸) | **Módulo TelePainel** — puxadas/consultas | Lovable Cloud atual (`kagejpghnwdfymddwxuf`) | `telepainel-webhook` (dedicada, consulta o projeto local) | projeto atual |

Regras:
- Cada bot novo do TelePainel entra em `telegram_bots` deste projeto e usa `telepainel-webhook?botId=<uuid>`.
- Bots do ecossistema Central (Hub) usam `telegram-webhook` e vivem no HUB.
- Não colocar fallback cruzado entre as duas funções — separação limpa.

---


## 2. Sincronia 4-Point (regra operacional vigente)

Estamos operando sob o modelo **Sincronia 4-Point**. Os quatro pontos que devem permanecer espelhados/consistentes a cada alteração:

1. **Lovable (editor / preview)** — fonte de mudanças assistidas por IA.
2. **GitHub (repositório)** — sync bidirecional automática com Lovable.
3. **VPS (`/root/CentralDark/`)** — microsserviços, scripts utilitários e PM2 (rodar `pm2 save` após qualquer mudança de estado).
4. **Cérebro Vivo (`docs/CONSCIENCIA/` + `.claude/`)** — contexto persistente, regras e memória de projeto consumida por qualquer IA/Hub.

> Regra: nenhuma alteração estrutural é considerada concluída enquanto os 4 pontos não refletirem o mesmo estado.

---

## 3. Diretórios do Cérebro Vivo

- **`.claude/`** — instruções, regras de execução defensiva, agentes especializados e prompts persistentes para IAs/Hub externas.
- **`docs/CONSCIENCIA/`** — base de conhecimento viva (decisões, aprendizados, regras, runbooks). É o "estado de longo prazo" que sobrevive entre sessões. Git é a fonte da verdade; Notion é espelho humano (sync automático via workflow).

> Nota: a pasta `docs/` será futuramente renomeada para `.consc
```