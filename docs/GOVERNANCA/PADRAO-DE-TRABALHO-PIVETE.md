# 🛠️ PADRÃO DE TRABALHO — CENTRALDARK / PIVETE

**STATUS:** 🟢 PADRÃO ATUAL OFICIAL  
**DATA:** 2026-07-09  
**REPOSITÓRIO:** `ServerVpss/CentralDark`  
**GATEWAY OFICIAL:** `https://api.centralldark.com/`  
**ARQUITETURA:** `docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md`

---

## 1. MODO OPERACIONAL

```txt
PIVETE COMANDA.
IA ORGANIZA.
AÇÕES PROVAM.
GITHUB REGISTRA.
VPS PRESERVA.
NADA NO ESCURO.
```

Este é o modo principal de operação da CentralDark.

O Pivete decide o rumo. As IAs organizam, explicam, validam e ajudam a executar. Toda ação precisa deixar evidência. O GitHub registra a história. A VPS precisa ser preservada, porque pode ter trabalho local ainda não enviado ao repositório.

---

## 2. ORDEM OBRIGATÓRIA

```txt
1. EVIDÊNCIA PRIMEIRO
2. ENTENDER
3. MAPEAR
4. COMPARAR
5. PROTEGER BACKUP
6. FAZER CORREÇÃO MÍNIMA
7. VALIDAR
8. REGISTRAR NO REPOSITÓRIO
9. RETOMAR O FIO
10. REGISTRAR O OURO
```

Nada deve ser feito no escuro.

Antes de corrigir, precisa entender. Antes de remover, precisa mapear. Antes de alterar algo importante, precisa backup. Depois de agir, precisa validar e registrar.

---

## 3. QUANDO FOR ALGO FÁCIL PARA O PIVETE EDITAR

A IA deve entregar de forma prática:

```txt
DIZER O LOCAL EXATO
MANDAR LINK DIRETO
MANDAR BLOCO PRONTO
PIVETE COLA/SALVA
A GENTE VALIDA
```

Exemplo:

```txt
Arquivo: docs/RELATORIOS/INVENTARIO-LABELS.md
Ação: substituir conteúdo pelo bloco pronto
Link: enviar link direto quando for GitHub
```

---

## 4. QUANDO A IA TIVER ACESSO DIRETO

A IA deve:

```txt
EDITAR DIRETO
MOSTRAR EVIDÊNCIA
DIZER O QUE MUDOU
DIZER COMO REFLETIR NA VPS, SE PRECISAR
NÃO FAZER AÇÃO DESTRUTIVA SEM OK
```

A IA pode resolver rápido quando tiver ferramenta correta, mas sempre precisa informar o que foi feito e qual evidência foi usada.

---

## 5. QUANDO FALTAR FERRAMENTA OU ACESSO

A IA deve informar exatamente:

```txt
🔴 FERRAMENTA QUE FALTOU
🛠️ PERMISSÃO NECESSÁRIA
✅ O QUE ELA PRECISA PERMITIR
🚀 COMO CORRIGIR
```

Exemplo:

```txt
🔴 FERRAMENTA QUE FALTOU:
GitHub Repository Labels CRUD

🛠️ PERMISSÃO NECESSÁRIA:
Issues: Read/Write + Metadata: Read

✅ O QUE ELA PRECISA PERMITIR:
listar, criar, editar e deletar labels do repositório

🚀 COMO CORRIGIR:
habilitar endpoint/ferramenta de labels ou usar GitHub CLI na VPS
```

---

## 6. REGRA DE VELOCIDADE

Sempre que a IA puder ajudar mais rápido, ela deve avisar:

```txt
🟢 POSSO RESOLVER MAIS RÁPIDO ASSIM:
rode este comando único / me mande este arquivo / abra este link.
```

Objetivo: evitar trabalho manual desnecessário do Pivete.

Se a IA conseguir editar no GitHub, ela edita. Se depender da VPS e não tiver terminal, ela manda comando seguro. Se for simples para o Pivete, ela manda bloco pronto para colar.

---

## 7. PADRÃO DE SCRIPTS

```txt
NÃO CRIAR v1/v2/v3 SEM NECESSIDADE.
SE FOR A MESMA FUNÇÃO, ATUALIZAR O SCRIPT ATUAL.
EVITAR ACÚMULO.
EVITAR DUPLICATA.
MANTER SÓ O ATUAL.
```

Exemplo correto:

```txt
scripts/padronizar-labels-pivete.sh
```

Se o script for da mesma função, ele deve ser atualizado no mesmo caminho.

Depois, quando autorizado, deve ser feita uma varredura para remover scripts antigos, duplicados ou desnecessários.

---

## 8. PADRÃO DE LABELS

As labels do repositório devem seguir o padrão Pivete:

```txt
NOME EM MAIÚSCULO
EMOJI VISUAL
COR BONITA
DESCRIÇÃO LEIGA
FUNÇÃO CLARA
```

### 8.1 Duas camadas de labels para IA

A CentralDark trabalha com várias IAs e agentes. Por isso, as labels precisam separar função e responsável.

```txt
🤖 IA-REVISAR       = O QUE PRECISA SER FEITO
🧠 AGENTE-CODEX    = QUEM FEZ, ASSUMIU OU ANALISOU
```

Exemplo de leitura:

```txt
🤖 IA-REVISAR
🧠 AGENTE-CODEX
🔴 RISCO-SERVIDOR
🔄 GIT-DIVERGÊNCIA
```

Leitura leiga:

```txt
Essa tarefa precisa revisão de IA, está com Codex, tem risco de servidor e envolve divergência Git.
```

---

## 9. LABELS ANTIGAS E AUTOMAÇÕES

Labels antigas como `assign:*` não devem ser apagadas nem renomeadas sem mapear automações.

```txt
assign:codex
assign:claude
assign:chatgpt
assign:grok
assign:supabase-bot
assign:lovable
```

Motivo: bots, workflows ou sentinelas podem depender desses nomes.

A limpeza só deve acontecer depois de:

```txt
1. backup das labels
2. snapshot final
3. mapa de uso nas issues
4. mapa de uso em scripts/workflows
5. aprovação do Pivete
```

---

## 10. SEGURANÇA

```txt
NÃO PEDIR SECRETS.
NÃO MOSTRAR TOKEN.
NÃO FORCE-PUSH.
NÃO RESETAR MAIN SUJA.
NÃO RESTARTAR SEM OK.
NÃO DELETAR SEM BACKUP.
NÃO PUXAR/PUSHAR SEM MAPEAR DIVERGÊNCIA.
NÃO REMOVER VARIÁVEL SEM SABER QUEM USA.
NÃO TROCAR ENDPOINT OFICIAL SEM AUTORIZAÇÃO DO PIVETE.
```

Se envolver VPS, produção, GitHub, deploy, PM2, systemd, Docker, secrets, tokens ou Gateway CentralDark, o modo é sempre:

```txt
MAPEAR PRIMEIRO.
AGIR DEPOIS.
```

---

## 11. FOCO ATUAL

```txt
🟢 LABELS PADRONIZADAS — FASE 1 CONCLUÍDA
🟢 GATEWAY OFICIAL REGISTRADO: https://api.centralldark.com/
🟡 FALTA SNAPSHOT FINAL DAS LABELS
🟡 FALTA MAPEAR DUPLICATAS ANTIGAS
🟡 FALTA DECIDIR O QUE MANTER / UNIFICAR / REMOVER
🟡 FALTA CONTINUAR MISSÃO VPS ↔ GITHUB
🔴 PRINCIPAL FUTURO: MAPEAR ENDPOINTS/VARIÁVEIS ANTIGAS E CONSOLIDAR O GATEWAY OFICIAL
```

---

## 12. MISSÃO VPS ↔ GITHUB

Objetivo:

```txt
ORGANIZAR A BAGUNÇA
MAPEAR DIVERGÊNCIAS
VER O QUE ESTÁ NA VPS E NÃO ESTÁ NO GITHUB
COMPARAR ANTES DE PUXAR OU ENVIAR
PRESERVAR O QUE FOI FEITO LOCALMENTE
NÃO DESALINHAR O GITHUB
```

A VPS pode conter trabalho local importante. Por isso, antes de qualquer sincronização:

```txt
git status
git branch --show-current
git log --oneline --decorate -n 20
git remote -v
git diff --stat
git diff --name-only
```

Esses comandos são leitura e ajudam a montar o mapa.

---

## 13. MISSÃO API CENTRALDARK / ANTHROPIC_BASE_URL

Endpoint oficial da arquitetura CentralDark:

```txt
https://api.centralldark.com/
```

Objetivo futuro:

```txt
MAPEAR TODO USO DE ENDPOINTS ANTIGOS NA VPS
MAPEAR TODO USO DE ANTHROPIC_BASE_URL NA VPS
DESCOBRIR QUEM DEPENDE DISSO
PROPOR SUBSTITUIÇÃO SEGURA PARA O GATEWAY OFICIAL
REMOVER OU TROCAR SOMENTE DEPOIS DE VALIDAR
```

Entendimento atual:

```txt
PC DO PIVETE = PODE TER CONFIGURAÇÃO PESSOAL DE FERRAMENTA LOCAL
VPS = SÓ DEVE TER VARIÁVEL SE ALGUM SERVIÇO REALMENTE PRECISAR
REPOSITÓRIO = NÃO DEVE TER TOKEN NEM CONFIG SENSÍVEL
GATEWAY OFICIAL = https://api.centralldark.com/
```

Nada deve ser removido antes de saber se Jarvis, Hermes, MCP, bots, PM2, cron, Docker, systemd, scripts, Nginx, Supabase Hub ou Edge Functions dependem disso.

Documento de arquitetura oficial:

```txt
docs/GOVERNANCA/FLUXO-DE-OURO-GATEWAY-CENTRALDARK.md
```

---

## 14. FECHAMENTO OPERACIONAL

Ao concluir uma etapa, responder sempre com:

```txt
1. O QUE FOI FEITO
2. EVIDÊNCIA USADA
3. O QUE FICOU PENDENTE
4. PRÓXIMO PASSO
5. QUAL BOOT USAR NA PRÓXIMA CONVERSA
6. FIO DA MISSÃO
```

---

## 15. BOOT RECOMENDADO

```txt
BOOT CENTRALDARK PADRÃO PIVETE
```

---

## 16. FIO DA MISSÃO

```txt
Organizar CentralDark sem perder nada:
GitHub alinhado.
VPS preservada.
Scripts únicos.
Labels bonitas.
Gateway oficial em https://api.centralldark.com/.
Ações com evidência.
Correção mínima.
Sem secrets.
Sem destruição.
Sem bagunça duplicada.
```
