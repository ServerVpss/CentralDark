```
┌──────────────────────────────────────────────────────────────────┐
│  🎓 AULAS AVANÇADAS — HERMES ESPECIALISTA EM GATEWAY · 03/07/2026 │
│  4 aulas: criar conta · manter · corrigir multi-conta · zentinel  │
│  Base: aula-elite-gateway.md · Ferramenta: gateway_admin.py       │
└──────────────────────────────────────────────────────────────────┘
```

# 🎓 Hermes Especialista em Gateway — 4 aulas avançadas

> Pré-requisito: ler `aula-elite-gateway.md` (arquitetura). Estas 4 aulas são o campo de batalha.

---

## 🧠 AULA 1: Criar conta do zero (login via Zendriver)

**Contexto:** adicionar uma conta ChatGPT nova ao gateway pra ganhar capacidade/paralelismo.
**Anti-padrão:** tentar automatizar o login inteiro — o ChatGPT exige senha + 2FA + às vezes captcha; a parte de digitar credencial é SEMPRE humana (Pivete). O Hermes faz tudo em volta.

**Explicação:** o login não é o gateway rodando; é um Chrome **visível** (via tela virtual Xvfb + noVNC) apontado pra `chatgpt.com/auth/login`, usando o `profile_dir` da conta nova. Quando o Pivete loga, os cookies gravam no perfil e o gateway passa a usar aquela sessão headless nas próximas requests.

**Comandos práticos:**
```bash
cd /root/CentralDark/apps/modulos/elite-gateway
# 1) Hermes: cria o slot (perfil próprio + token + accounts.json com backup)
python3 scripts/gateway_admin.py add conta_02        # → imprime o token 1x; entregar ao Pivete
# 2) Hermes: sobe o ambiente de login e ENTREGA o link ao Pivete
python3 scripts/gateway_admin.py login conta_02      # → http://SEU_IP:6080/vnc.html
#    (Pivete loga no ChatGPT na tela noVNC, resolve 2FA, fecha o Chrome)
# 3) Hermes: encerra o ambiente e ativa
python3 scripts/gateway_admin.py login-stop
python3 scripts/gateway_admin.py health              # ocupado=false antes de reiniciar
pm2 restart CentralDark-EliteHTTP && pm2 save
# 4) Hermes: prova que a conta responde
python3 scripts/gateway_admin.py test conta_02       # espera 🟢 pong
```
**Checklist de sucesso:** `doctor` mostra a conta com "🟢 perfil com sessão" + `test` responde pong. Se `test` der Cloudflare/deslogado → Aula 2.

---

## 🧠 AULA 2: Manter contas vivas (re-login sem perder o resto)

**Contexto:** uma conta parou de responder (Cloudflare, deslogou, cookie expirou).
**Anti-padrão:** reiniciar o gateway inteiro achando que resolve login — restart NÃO faz re-login; se o cookie expirou, só o `login <id>` resolve. E nunca apagar o `profile_dir` de uma conta boa (perde a sessão de todas que usam ele).

**Explicação:** diagnostique ANTES de agir. O `doctor` diz se o perfil tem sessão (arquivo Cookies presente e recente). Se sim e mesmo assim falha, é Cloudflare passageiro (espere/zentinel cuida). Se não tem Cookies ou está velho, é re-login daquela conta específica — sem tocar nas outras.

**Comandos práticos:**
```bash
python3 scripts/gateway_admin.py doctor                     # quem está 🟢 / 🟡 / 🔴
pm2 logs CentralDark-EliteHTTP --lines 40 --nostream | grep -E 'cloudflare_block|input_not_found|generation'
# perfil 🟡 sem sessão OU log com input_not_found persistente → re-login SÓ daquela conta:
python3 scripts/gateway_admin.py login conta_02  &&  # Pivete re-loga
python3 scripts/gateway_admin.py login-stop      &&  python3 scripts/gateway_admin.py test conta_02
```
**Tabela de decisão:**
| doctor / log diz | Significa | Ação |
|---|---|---|
| 🟢 sessão + `test` pong | tudo certo | nada |
| 🟢 sessão + Cloudflare no log | bloqueio passageiro | esperar; zentinel reinicia se latência subir |
| 🟡 sem Cookies / cookie velho | deslogou | `login <id>` (só essa conta) |
| 🔴 perfil não existe | slot quebrado | `add <id>` de novo |
| gateway não responde (health 🔴) | processo caiu | `pm2 restart CentralDark-EliteHTTP && pm2 save` |

---

## 🧠 AULA 3: Corrigir o bug de multi-conta (ids/perfis colados)

**Contexto:** hoje o `accounts.json` tem 2 tokens com `id=conta_padrao` no MESMO perfil — não é multi-conta, é 1 login com 2 chaves.
**Anti-padrão:** renomear id ou trocar profile_dir de um token que já está EM USO por algum cliente — quebra a integração dele na hora. Toda mudança em `accounts.json` é coordenada com o Pivete e com backup.

**Explicação:** multi-conta real = cada token com `id` único E `profile_dir` próprio E login próprio. A migração é incremental e não-destrutiva: mantém o token atual funcionando, cria a conta NOVA separada (Aula 1), e só depois — se o Pivete quiser — aposenta o token duplicado.

**Comandos práticos:**
```bash
python3 scripts/gateway_admin.py fix-duplicates      # aponta os duplicados (não muda nada sozinho)
python3 scripts/gateway_admin.py list                # confere estado atual
# caminho seguro: NÃO renomear o existente; criar a conta nova separada:
python3 scripts/gateway_admin.py add conta_02        # perfil e token próprios
# (login pela Aula 1) — agora existem 2 contas REAIS, sem tocar na antiga
```
**Regra de ouro:** adicionar é seguro (não mexe no que existe); renomear/remover é cirúrgico e precisa de "PERMITO PIVETE".

---

## 🧠 AULA 4: Zentinel — o vigia (ler alertas e agir certo)

**Contexto:** entender o que o Zentinel faz sozinho e quando o Hermes precisa entrar.
**Anti-padrão:** reiniciar o gateway na mão toda vez que a latência sobe — o Zentinel já faz isso com cooldown; restart manual durante o cooldown ou com request em andamento (`ocupado=true`) só atrapalha.

**Explicação:** o Zentinel (`zentinel_health.py`, PM2 `CentralDark-Zentinel`) mede a latência do `chatgpt.com` a cada 45s. Se passar de 15s, faz **restart cirúrgico só do gateway** (`pm2 restart elite-http-gateway`), com **cooldown de 5min** pra não entrar em loop de restart durante uma degradação longa. Ele cuida de latência; ele NÃO cuida de login expirado nem de Cloudflare — isso é o Hermes (Aula 2).

**Comandos práticos:**
```bash
pm2 logs CentralDark-Zentinel --lines 20 --nostream       # ver as checagens de latência
# "Latencia critica detectada" seguido de restart = normal, ele se curou
# "Cooldown ativo, faltam Ns" = ele quer reiniciar mas está no intervalo de segurança
pm2 describe CentralDark-Zentinel | grep -E 'status|restarts'   # o vigia está vivo?
```
**Divisão de trabalho:**
| Problema | Quem resolve |
|---|---|
| Latência alta do ChatGPT | 🤖 Zentinel (automático) |
| Login expirado / Cloudflare | 🧠 Hermes (re-login, Aula 2) |
| Conta nova | 🧠 Hermes + 👤 Pivete (login, Aula 1) |
| Gateway morto (processo) | 🧠 Hermes (`pm2 restart` + `save`) |
| Zentinel morto | 🧠 Hermes (`pm2 restart CentralDark-Zentinel`) |
```
