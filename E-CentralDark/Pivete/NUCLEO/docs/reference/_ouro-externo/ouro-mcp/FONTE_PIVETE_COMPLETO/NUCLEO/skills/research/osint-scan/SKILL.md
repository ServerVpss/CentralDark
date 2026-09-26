---
name: osint-scan
description: Varredura OSINT local e seletiva a partir de um alvo (username, domínio, email, telefone, imagem). Usa os tools nativos do Hermes (web_search, web_extract, x_search, terminal/curl) guiado por um índice de operadores do catálogo cipher387/Coordinate-Cat. NÃO instala dependências externas, NÃO toca VPS/nuvem. Use quando o Pivete pedir investigação de superfície, busca de pessoas, domínios ou vazamentos públicos.
category: research
---

# OSINT-Scan (local, nativo)

Índice operacional derivado do catálogo `cipher387/osint_stuff_tool_collection` (espelhado em `Coordinate-Cat/OSINT-JAPAN/dataset.md`). O catálogo tem 1000+ links; aqui só o que é executável com tools do Hermes sem instalar nada.

## Princípio
- NUNCA inventar resultado. Se a ferramenta não responder, declarar lacuna.
- Busca é read-only. Não login, não POST em alvo, não scrape autenticado.
- Respeitar robots/termos quando sensível; parar se houver risco legal.

## Alvo: USERNAME / NICKNAME
1. `web_search` → `"<nick>" site:linktr.ee OR site:github.com OR site:twitter.com OR site:instagram.com`
2. `web_search` → `inurl:<nick> | intitle:<nick>`
3. `x_search` → `@<nick>` (precisa xAI credencial; se não, pular e declarar)
4. Sherlock-style: se quiser varredura em massa, usar `curl -s https://raw.githubusercontent.com/sherlock-project/sherlock/main/sherlock.py` + lista de sites do repo (requer python+requests) — opcional, confirmar antes.

## Alvo: DOMÍNIO / IP
1. `web_search` → `site:<domínio>`
2. `web_extract` em `https://crt.sh/?q=<domínio>` → certs (subdomínios)
3. `web_extract` em `https://securitytrails.com/` ou `https://urlscan.io/result/#/<domínio>` (sem chave, limitado)
4. Dorks: `site:<domínio> filetype:pdf | filetype:env | filetype:sql`
5. terminal: `nslookup <domínio>` / `curl -s https://ipinfo.io/<ip>/json`

## Alvo: EMAIL
1. `web_search` → `"<email>"`
2. `web_extract` em `https://breachdirectory.org` / `https://haveibeenpwned.com` (HIBP exige key p/ API; web UI ok)
3. `web_search` → `<email> site:linkedin.com OR site:github.com`

## Alvo: TELEFONE
1. `web_search` → `"<telefone>"`
2. `web_extract` em `https://numverify.com` / `https://freecarrierlookup.com` (sem chave, limitado)

## Alvo: IMAGEM
- Eu NÃO leio imagem local (limitação do app: só anexo Telegram ou URL direta). Para reverse search:
  1. Se URL direta: `web_search` → `img:<url>` ou `web_extract` em `https://lens.google.com/upload` (não suportado via curl simples — usar browser se necessário)
  2. Se anexo Telegram: eu vejo nativo e descrevo.
  3. Yandex Images / TinEye: `web_search` com a URL.

## Saída
Relatório curto:
- ALVO=
- FONTES_CONSULTADAS=
- ACHADOS (fact + url)
- LACUNAS (o que não consegui por limite de tool/chave)
- PRÓXIMO_PASSO (se houver)

## Pitfalls
- `x_search` exige xAI OAuth ativo (no perfil pivete: xai LOGGED OUT → declarar, não quebrar).
- Muitas ferramentas do catálogo estão obsoletas (autor avisa). Validar URL antes de usar.
- Não misturar com GATE-0 / VPS / Lupa canônica — skill é isolated, só pesquisa de superfície.
