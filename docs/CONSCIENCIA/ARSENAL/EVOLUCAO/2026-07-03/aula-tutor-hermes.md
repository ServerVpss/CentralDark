```
┌──────────────────────────────────────────────────────────────┐
│  🎓 AULA DO TUTOR — HERMES · 03/07/2026                      │
│  Diagnóstico do aluno + 6 técnicas novas + 3 erros virados   │
│  em lição. Ledger: ARSENAL/APRENDIZADOS.md · Índice:         │
│  APRENDIZADOS-INDEX.json · Cérebro vivo (injetado no prompt):│
│  AGENTES-AUTONOMOS/hermes/aprendizados.json                  │
└──────────────────────────────────────────────────────────────┘
```

# 🎓 Aula do Tutor — Hermes (03/07/2026)

## 📋 Diagnóstico do aluno

**O que ele já domina:**
- Ciclo ler→corrigir→validar com `tsc` como bússola (zerou o typecheck do hub v2 sozinho)
- Criar/editar arquivos, rodar shell, notificar progresso no Telegram
- Persistência de estado (state.json) — sobrevive a restart com retomada automática

**O que ele NÃO sabia (e foi ensinado hoje):**
- Git cirúrgico (o `add -A` dele varria `.env` e arquivos alheios; rebase virava beco)
- Fechamento de stdin em subprocessos (a causa dos falsos timeouts de 15/30/45s)
- Parar de reler o mesmo arquivo (loop de releitura — 6× no mesmo arquivo alternando ferramentas)
- Validar depois de escrever (entregou `.tsx` com `}` faltando)
- curl com timeout, PM2 com `--nostream`, sed em massa com `.bak`

**Infra de aprendizado (como o conhecimento chega nele):**
1. `hermes/aprendizados.json` — o decisor injeta as categorias relevantes (por gatilho) no prompt de CADA decisão. Detectores de loop e de releitura escalam pro gemini-2.5-pro e proíbem repetição.
2. Ferramenta `aprender` — ele mesmo grava lição nova no meio da missão.
3. `ARSENAL/APRENDIZADOS.md` — ledger no formato do `cerebro.mjs` (`DATA | TIPO | CONTEXTO | CAUSA | ACAO_CORRETIVA | CONFIRMADO_POR`).
4. ⚠️ Gap conhecido: `cerebro.mjs` existe mas o daemon NÃO o importa — o canal vivo hoje é o aprendizados.json. Integração fica como pendência.

---

## 🧠 Técnica 1: curl robusto
**Contexto:** healthcheck, API, qualquer HTTP dentro de missão.
**Anti-padrão:** curl sem `--max-time` em daemon (pendura a etapa até o timeout matar); parsear JSON com grep.

**Explicação:** todo curl de missão precisa de timeout explícito e saída limpa. Pra decidir, quase sempre basta o status HTTP ou um campo do JSON — extraia só o que precisa.

```bash
# resposta completa com timeout e retry
curl -sS --max-time 10 --retry 2 --retry-delay 2 https://mcp.centralldark.com/health
# só o status HTTP (pra decidir 🟢/🔴)
curl -s -o /dev/null -w '%{http_code}' --max-time 5 https://mcp.centralldark.com/health
# um campo do JSON
curl -sS --max-time 10 https://mcp.centralldark.com/health | jq -r '.status'
```

## 🧠 Técnica 2: Git cirúrgico
**Contexto:** commit/push no fim de missão, com automations pushando na main o tempo todo.
**Anti-padrão:** `git add -A` (varre `.env`, painel, arquivos alheios); insistir num rebase conflitado.

```bash
git add apps/modulos/hub                      # SÓ o path da missão
git commit -m "feat(hub): descricao"
git push origin main \
  || { git pull --rebase --autostash origin main && git push origin main; } \
  || { git rebase --abort; echo "PUSH PENDENTE — relatar"; }
git log --oneline -3                          # commit local existe? não re-commitar à toa
```

## 🧠 Técnica 3: PM2 diagnóstico
**Contexto:** ver saúde/logs de processo, aplicar mudança de estado.
**Anti-padrão:** `pm2 logs` sem `--nostream` (trava a etapa); `restart all`; esquecer `pm2 save`.

```bash
pm2 logs CentralDark-MCP --lines 30 --nostream
pm2 describe CentralDark-MCP | grep -E 'status|restarts|uptime'
pm2 restart CentralDark-MCP --update-env && pm2 save   # save é OBRIGATÓRIO após mudança
```

## 🧠 Técnica 4: Escreveu → valida → rollback
**Contexto:** sobrescrever qualquer arquivo que já funciona.
**Anti-padrão:** escrever e ir embora sem validar (foi assim que saiu `.tsx` sem `}`).

```bash
cp arquivo.mjs arquivo.mjs.bak                 # ANTES
# ... escrever_arquivo ...
node --check arquivo.mjs || cp arquivo.mjs.bak arquivo.mjs          # .mjs/.js
python3 -c "import json;json.load(open('x.json'))"                  # .json
cd /root/CentralDark/apps/modulos/hub && npx tsc --noEmit -p tsconfig.app.json | head -5  # .ts/.tsx
```
Dica: comando que dá certo sem imprimir nada → `&& echo OK` pra ter confirmação visível.

## 🧠 Técnica 5: grep + sed + xargs em massa (com rede de proteção)
**Contexto:** trocar um padrão em vários arquivos de uma vez.
**Anti-padrão:** `sed -i` cego no diretório inteiro sem listar os alvos antes.

```bash
grep -rln "padraoVelho" src/ --include='*.ts'                  # 1. quem tem?
grep -rln "padraoVelho" src/ | xargs -r sed -i.bak 's/padraoVelho/padraoNovo/g'  # 2. troca com backup
grep -rn "padraoVelho" src/ | head                             # 3. sobrou algum?
find src/ -name '*.bak' -delete                                # 4. SÓ depois da validação passar
```

## 🧠 Técnica 6: Lock de arquivo (anti-corrida)
**Contexto:** arquivo disputado por vários processos (ex.: painel-data.json tem automation em cima).
**Anti-padrão:** usar lock pra arquivo que só você toca (burocracia inútil); tocar em arquivo de automation sem necessidade.

```bash
exec 9>/tmp/lock-meuarquivo
flock -n 9 || { echo "ocupado, desisto"; exit 1; }
# ... escreve no arquivo com segurança ...
flock -u 9
```
Regra de ouro: se o arquivo é de outra automation, a melhor jogada é NÃO tocar.

---

## 📌 Erros de hoje virados em lição (já no ledger)
1. `git add -A` varreu `.env` + rebase conflitado em painel-data.json → git cirúrgico.
2. Falso timeout do darkai (stdin aberto no `$(cat)`) → fechar stdin em subprocesso.
3. Releitura 6× do mesmo arquivo alternando ferramentas → 2 leituras bastam, a 3ª ação é escrever (agora MECÂNICO: detector no decisor escala pro 2.5-pro e proíbe reler).
