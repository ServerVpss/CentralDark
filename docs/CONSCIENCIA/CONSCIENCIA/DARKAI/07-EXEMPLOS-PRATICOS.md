---
title: "07 EXEMPLOS PRATICOS"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# 🛠️ Exemplos Práticos

> **📖 Pra quem é:** quem aprende fazendo. 15+ casos reais.
> **⏱️ Tempo:** 10 minutos (ou o tempo de testar cada um).

---

## 1. Resumir um log gigante

```bash
tail -500 /var/log/nginx/error.log | darkai "resuma os 5 principais erros em português"
```

## 2. Classificar severidade de um erro

```bash
darkai --system "você classifica erros em: leve, médio, grave, crítico. Responda só a palavra." \
  "Erro: timeout no banco de dados durante backup noturno"
```

## 3. Gerar script bash

```bash
darkai "gere um script bash que faz backup do /var/www e sobe pro S3" > backup.sh
chmod +x backup.sh
```

## 4. Traduzir arquivo inteiro

```bash
cat README.md | darkai "traduza este README para inglês, mantendo markdown" > README.en.md
```

## 5. Explicar código legado

```bash
cat script_antigo.pl | darkai --model openai/gpt-5.4 "explica linha por linha o que este código Perl faz"
```

## 6. Gerar mensagem de commit

```bash
git diff --cached | darkai "escreva uma mensagem de commit convencional (conventional commits) em português para este diff"
```

## 7. Revisar código antes de commitar

```bash
git diff | darkai --model openai/gpt-5.4 --system "você é um revisor sênior, seja crítico" "revise este diff apontando bugs, code smells e melhorias"
```

## 8. Análise de segurança

```bash
cat suspeito.php | darkai --model openai/gpt-5.4 "analise este código PHP em busca de vulnerabilidades (SQL injection, XSS, RCE)"
```

## 9. Gerar dados fake pra teste

```bash
darkai "gere 10 registros JSON de usuários fictícios brasileiros com nome, email, cpf, telefone" > fake_users.json
```

## 10. Regex do inferno

```bash
darkai "gere uma regex que valida CPF brasileiro no formato XXX.XXX.XXX-XX ou 11 dígitos, com explicação"
```

## 11. Bot Telegram usando darkai

No handler do bot:

```python
import subprocess

def responder_com_ia(pergunta):
    result = subprocess.run(
        ["darkai", pergunta],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout.strip()

# No handler:
bot.reply(update.message.chat_id, responder_com_ia(update.message.text))
```

## 12. Cron job de resumo diário

```bash
# /etc/cron.d/resumo-diario
0 9 * * * root tail -1000 /var/log/app.log | darkai "resuma o dia anterior em 3 bullets" | mail -s "Resumo diário" voce@email.com
```

## 13. Auto-classificar issues do GitHub

```bash
gh issue list --json title,body --limit 20 | \
  darkai "classifique cada issue como: bug, feature, docs ou question. Responda em JSON."
```

## 14. Explicar erro do stacktrace

```bash
darkai "explica em português leigo o que este erro significa e como resolver: $(cat stack.txt)"
```

## 15. Gerar documentação a partir do código

```bash
cat src/api.ts | darkai --model openai/gpt-5.4 "gere documentação markdown completa desta API, com exemplos de uso"
```

## 16. Fallback quando outra IA falhar

```bash
# No seu script principal:
resposta=$(alguma_ia_qualquer "$pergunta" 2>/dev/null) || resposta=$(darkai "$pergunta")
```

## 17. Chat interativo simples

```bash
while true; do
  read -p "você: " msg
  [[ -z "$msg" ]] && break
  darkai "$msg"
  echo
done
```

## 18. Assistente de commits em Python

```python
# ~/.local/bin/commit-ai
import subprocess

diff = subprocess.check_output(["git", "diff", "--cached"]).decode()
if not diff:
    print("Nada staged."); exit()

msg = subprocess.check_output(
    ["darkai", "escreva mensagem de commit convencional em PT-BR"],
    input=diff.encode()
).decode().strip()

print(f"Sugestão: {msg}")
if input("Aceitar? [y/N] ").lower() == "y":
    subprocess.run(["git", "commit", "-m", msg])
```

## 19. Análise SEO de página

```bash
curl -s https://seusite.com | darkai --model openai/gpt-5 "analise o SEO desta página HTML e liste 5 melhorias concretas"
```

## 20. Debug de output esquisito

```bash
programa_bugado 2>&1 | darkai "olhe este output e me diga o que provavelmente tá errado"
```

---

## Exemplos que já estão prontos na pasta

- [`exemplos/resumir-log.sh`](exemplos/resumir-log.sh)
- [`exemplos/classificar-erro.sh`](exemplos/classificar-erro.sh)

Copia, adapta, usa.

---

Próximo: [`08-TECNICAS-QUE-USO.md`](08-TECNICAS-QUE-USO.md)

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
