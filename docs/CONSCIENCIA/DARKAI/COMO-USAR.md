---
title: "COMO USAR"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# Como usar o darkai

## Básico
```bash
darkai "resume esse log em 3 linhas"
```

## Com prompt de sistema (define o papel)
```bash
darkai --system "você é um auditor de segurança" "revisa esse código"
```

## Escolhendo modelo (opcional, padrão é gemini-3-flash-preview)
```bash
darkai --model openai/gpt-5-mini "explica esse erro"
darkai --model google/gemini-2.5-pro "análise profunda desse arquivo"
```

## Via pipe (jogar arquivo/log dentro)
```bash
cat /var/log/nginx/error.log | darkai "classifica cada erro por gravidade"
tail -n 200 app.log | darkai --system "você é SRE" "o que quebrou?"
pm2 logs --lines 100 --nostream | darkai "resume o que aconteceu"
```

## Dentro de script Python
```python
import subprocess
r = subprocess.run(["darkai", "classifica esse CPF: 12345678900"],
                   capture_output=True, text=True)
print(r.stdout)
```

## Dentro de outra IA (Claude Code na VPS)
Prompt pra ela:
> "Quando precisar de análise rápida/barata, chame `darkai \"sua pergunta\"` em vez de gastar seus tokens."

## Modelos disponíveis (mais usados)
- `google/gemini-3-flash-preview` — padrão, rápido e barato
- `google/gemini-2.5-flash-lite` — ainda mais barato pra classificação
- `google/gemini-2.5-pro` — quando precisa raciocinar forte
- `openai/gpt-5-mini` — bom pra código
- `openai/gpt-5` — top de linha (caro)

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
