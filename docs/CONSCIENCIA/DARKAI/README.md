# DarkAI — cérebro compartilhado da VPS

## O que é
`darkai` é um comando único na VPS que qualquer IA (Claude Code, Sonnet, Gemini, scripts Python, bash) usa pra "pensar" chamando o Lovable AI de graça (dentro dos créditos da workspace) sem nunca ver a chave.

## Fluxo
```
[qualquer IA/script na VPS]
        │
        ▼
   darkai "pergunta"       ← CLI local (bash + curl)
        │
        ▼
   ai-proxy (edge function no Lovable Cloud)
        │  usa LOVABLE_API_KEY (guardada aqui, nunca sai)
        ▼
   Lovable AI Gateway → Gemini / GPT-5 / etc
        │
        ▼
   resposta em texto ← volta pro terminal
```

## Vantagens
- **Uma chave só**, guardada num lugar só (Lovable Cloud). Se vazar VPS, chave não vaza.
- **Todas as IAs falam a mesma língua**: `darkai "..."`.
- **Economia**: Claude Code deixa de gastar crédito próprio pra tarefas simples (resumo, classificação, lint).
- **Trocar de modelo** é mudar 1 parâmetro (`--model openai/gpt-5-mini`).

## Arquivos desta pasta
- `README.md` — este arquivo.
- `COMO-USAR.md` — exemplos práticos.
- `COMO-ENSINAR-OUTRA-IA.md` — prompt pronto pra colar em outra IA.
- `INSTALAR-NA-VPS.md` — passo a passo de instalação.
- `darkai.sh` — o script do CLI (copiar pra `/usr/local/bin/darkai`).
- `CREDENCIAIS-TEMP.env` — **TEMPORÁRIO**. Apagar depois de salvar no pendrive.

## A `graph-mapper` ainda existe?
Sim. Nada foi tocado. `ai-proxy` é adicional.
