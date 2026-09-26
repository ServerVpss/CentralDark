# MISSAO - MISSAO-LUPA-ARSENAL-TOTAL-AUTO-REGISTRO.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.hermes\desktop-attachments\MISSAO-LUPA-ARSENAL-TOTAL-AUTO-REGISTRO.md
**SHA:** fa749f891d713f4e
**Timestamp:** 2026-08-28T02:57:50.979321
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- RESTART=0

### Decisoes
- Decisão:

### Riscos
- RESIDUAL_RISK:

### Ouro Bruto (primeiros 5000 chars)
```
# MISSÃO — LUPA AUTO-REGISTRO · ARSENAL TOTAL PARALELIZADO

## COMANDO ÚNICO DO PIVETE

```text
Leia integralmente este arquivo e execute como contrato operacional.

RESOLVE. VÁ ATÉ O FIM.
PERMITO PIVETE SEM AÇÃO DESTRUTIVA. 🔒🚀
```

## ESCOPO CONGELADO DESTA AUTORIZAÇÃO

Esta autorização vale **somente para esta missão**:

> Implementar, provar e publicar em branch/PR o auto-registro obrigatório de cada uso da `lupa-bayesiana` na fonte da verdade `ServerVpss/CentralDark`.

Permitido nesta missão:

```text
inventário read-only de recursos
leitura integral dos manuais
uso de CLI e modelos autenticados
delegação paralela
Git fetch/search/log/show/diff
inspeção read-only da VPS
inspeção read-only de Supabase e Edge Functions
criar branch de missão
editar somente os artefatos canônicos necessários
testar, corrigir e retestar
commit, push e PR draft
acompanhar e corrigir gates
```

Proibido nesta missão:

```text
merge
deploy
restart
PM2
alterar produção
alterar DNS/firewall/Caddy
force-push
reset destrutivo
apagar histórico
ler ou imprimir valores de .env
expor tokens, chaves, cookies ou headers
executar missão diferente
```

A autorização expira quando o PR estiver pronto para revisão do Pivete.

---

# REGRA SUPREMA DE EXECUÇÃO

Usar a `lupa-bayesiana`:

```text
antes da missão
durante cada decisão
sobre cada agente delegado
sobre a consolidação
sobre o próprio orquestrador
no encerramento
```

A AutoLupa não promete infalibilidade. Ela obriga:

```text
erro
→ detectar
→ classificar
→ corrigir
→ testar
→ reabrir o candidato
→ repetir até ponto fixo evidencial
```

Bloqueio temporário não encerra a missão:

```text
provider falhou
→ fallback

consent gate
→ traduzir a autorização nominal existente

non-fast-forward
→ fetch + inspeção + integração sem force

teste falhou
→ corrigir + retestar

agente travou
→ preservar checkpoint + substituir agente

rota indisponível
→ procurar rota já existente no território
```

Não declarar sucesso por entusiasmo. Declarar somente por evidência reproduzível.

---

# ORQUESTRAÇÃO HIERÁRQUICA DE CIMA PARA BAIXO

## Nível 0 — Pivete

```text
autoridade final
intenção
escopo
permissão
decisão de merge/deploy
```

## Nível 1 — Hermes Orquestrador

Hermes:

```text
mantém o fio
congela missão/ref/SHA
descobre recursos
distribui trabalho
impede duplicação
recebe evidências
consolida
aplica AutoLupa em si mesmo
```

Hermes não executa sozinho tudo que pode ser delegado.

## Nível 2 — Chefes de frente

Disparar em paralelo, conforme disponibilidade:

### Frente A — Descoberta territorial

Mapear:

```text
repo local
refs remotas
branches
commits
PRs
Actions
skills
manuais
scripts
testes
VPS read-only
Supabase read-only
Edge Functions
CLIs
providers
modelos
agentes existentes
```

### Frente B — Arquitetura do auto-registro

Responsável por:

```text
ledger
schema
usage_id
BEGIN/FINAL
idempotência
anti-recursão
recuperação
trailers de commit
promoção de aprendizado
```

### Frente C — Implementação

Responsável por alterar o motor e arquivos canônicos, sem criar V2.

### Frente D — Testes determinísticos e propriedades

Responsável por:

```text
testes existentes
novos testes
falsos verdes históricos
sanitização
concorrência
replay
interrupção
Windows/Linux
```

### Frente E — Segurança adversarial

Responsável por procurar:

```text
secrets
paths sensíveis
injeção
corrida de escrita
registro divergente
falsificação de recibo
elevação de permissão
vazamento em logs
```

### Frente F — Kit Boas-Vindas e propagação

Responsável por localizar e atualizar somente os pontos reais de entrada:

```text
00-COMECE-AQUI-IA.md
CLAUDE.md
AGENTS.md
README.md
docs/GOVERNANCA/BOOT-IA.md
.claude/BOOT-PIVETE.md
.github/copilot-instructions.md
GEMINI.md
GROK.md
```

Não criar substituto para arquivo ausente. Encontrar a ref correta que o contém.

### Frente G — Crítico independente

Recebe o mesmo candidato congelado sem conhecer o veredito do implementador.

### Frente H — Consolidação e AutoLupa final

Agrupa evidências correlacionadas, remove XP duplicado, confronta resultados e tenta falsificar o ponto fixo.

---

# USO DE TODOS OS AGENTES E MODELOS DISPONÍVEIS

## Inventário obrigatório

Antes de delegar, produzir inventário sanitizado:

```text
PROVIDER
MODELO
STATUS
ROTA/CLI
CAPACIDADE
LIMITE ATUAL
PAPEL ATRIBUÍDO
```

Procurar recursos existentes por:

```text
Hermes model inventory
darkai --help
darkai model list ou equivalente
CLIs instaladas
providers configurados
gateway existente
Supabase ai-proxy
rotas documentadas no repositório
```

Não ler nem imprimir o valor de `WEBUI_LOVABLE_KEY` ou qualquer secret.

Rota conhecida pode ser usada somente por cliente já autenticado:

```text
Supabase Edge Function ai-proxy
modelo por payload
DarkAI CLI
```

Preferir:

```text
darkai --model <modelo> "<contrato da frente>"
```

ou o cliente oficial já configurado.

Não montar manualmente headers contendo secrets em saída ou relatório.

## Distribuição recomendada

```text
modelo forte de arquitetura
→
```