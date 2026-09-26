---
name: investigacao-guardiao
description: "Investigate for Pivete: FORENSE vs SILENCIOSA."
version: 1.0
author: Casa/Pivete
license: MIT
tags: [investigacao, forense, silenciosa, seguranca, pivete, guardiaocasa]
---

# 🔍 INVESTIGAÇÃO GUARDIÃO — regra de ouro

Quando Pivete manda investigar ALGUÉM ou ALGUMA COISA, aplica sempre:

## REGRA DE OURO — TRIÂNGULO EPISTEMOLÓGICO (cristalizado GuardiaoCasa + CHEFE)
> **DESCONHECIDO não ganha execução para ser entendido.
> PESSOA não perde privacidade para ser investigada.
> DECLARAÇÃO não ganha status de prova só porque um agente a declarou.**

Os 3 vértices são obrigatórios. O 3º é o mais negro: nunca carimbar como
fato técnico o que a interface afirma ("skill carregada", "memória 89%",
"sub-agente rodando", "SHA é X"). Prova = escrito persistente + verificável,
não declaração.

## Dois modos — NUNCA misturar

### PESSOA = TÉCNICA FORENSE
- fonte pública/autorizada + cadeia de evidência
- OSINT, documentos, repositórios públicos
- SEM invasão: não vasculhar conta/dispositivo/dado privado
- MITRE ATT&CK / EDR só pra telemetry local autorizada (ver `edr-zero-trust-hunter`)
- resultado: identidade com proveniência, não suposição

### ARQUIVO / COISA DESCONHECIDA = TÉCNICA SILENCIOSA
- READ_ONLY
- NÃO EXECUTA o objeto (não abre macro/script/binário)
- NÃO ABRE pra "ver" — lê como texto/hash
- HASH (SHA256) + METADADOS + TIPO REAL (magic bytes, não extensão)
- QUARENTENA se suspeito (mover p/ `_QUARANTINE`, não apagar)
- só DEPOIS classifica (malware / asset / lixo / inconclusivo)

## PITFALLS (destes desta sessão — NÃO repetir)
1. **MetaLupa retardada.** Ao investigar a origem de uma imagem num gerador
   HTML, concluí "veio de upload" sem testar o caminho discriminante. O código
   tinha `ARTES.hermes` embutido (base64) + lógica `if arteUrl → upload; elif
   arte=='hermes' → embutida; else sigilo`. Deveria ter lido as 4 linhas e
   testado `deck[hermes].arteUrl` no estado salvo ANTES de afirmar.
   → Sempre mapear TODOS os caminhos possíveis e testar o mais barato/discriminante.
2. **Prova ≠ declaração de interface.** "skill carregada", "memória 92%",
   "vou gravar na memória" são AFIRMAÇÕES da interface. Só vira fato se escrito
   em arquivo/skill/memória persistente E verificável. Não carimbar como técnico.
3. **Inferir persona por imagem.** Ver uma pessoa num asset não prova que ela
   é "ninguém do sistema" nem "fulano". Máximo: ELEMENTO_VISUAL_PRESENTE = SIM,
   IDENTIDADE = NOT_DEMONSTRATED. Devolver PROVADO / NOT_PROVEN + evidência.

## Fluxo recomendado (SILENCIOSA em arquivo)
0. Se asset embutido em código (data: URI base64): extrair com Python
   `base64.b64decode`, salvar em cache, SHA256, DIM (PNG header bytes 16-24
   ou JPEG SOF parse). NÃO abrir visualmente para classificar — usar
   vision só para descrever tipo/estilo. (Ver caso em references/)
1. `file` / magic bytes → tipo real
2. `sha256sum` → hash
3. `strings` / `read_file` (texto) → metadados, sem executar
4. comparar hash contra disco/git se relevante
5. se suspeito → mover p/ `_QUARANTINE`, never delete
6. só depois: classificar + relatar com PROVADO/NOT_PROVEN

## META_LUPA SOBRE SI MESMO (3º vértice na prática)
Antes de declarar qualquer claim de estado próprio, aplicar as 3 perguntas:
- "gravei / carreguei" → **ONDE está escrito?** (ler arquivo de memória/skill persistente, grep confirmando)
- "rodando / vivo" → **cadê o estado vivo?** (log do processo, PID, task ID, modify-time)
- "SHA é X" → **qual arquivo + bytes + hash RECALCULADO?** (não confiar no que o código/disco disseram — recomputar)
Se não há prova material, o claim fica NOT_PROVEN. Declaração vira fato só
depois de confirmada por leitura posterior do artefato.

## Padrão de delegação pesada
Para recon extensivo (varrer disco/remote/git), despachar sub-agente leaf em
background (`delegate_task background=true notify_on_complete=true`), continuar
a sessão, e ao retornar: (a) ler o live log ou summary, (b) recalcular o hash
do asset decodificado localmente para conferir o do filho, (c) gravar o ouro
na Casa. Nunca trusts o "self-report" do filho — verificar o artefato.

## DESTINO DO OURO (canônico — CHEFE definiu)
O ouro da investigação vai em:
`E:\CentralDark\_RECONCILIATION\OURO\FONTE_PIVETE_COMPLETO\NUCLEO\motor\10-observabilidade\`
Essa é a pasta canônica do NÚCLEO Hermes. Registrar no `REGISTRO-DO-OURO.md`
da mesma pasta (APPEND, nunca sobrescrever o arquivo).
Alternativo (alvo fora do NÚCLEO): `E:\CentralDark\workspace\sol\<pasta>\`.
Detalhes e comandos prontos em `references/destino-ouro-e-jaula-claude.md`.

## COMPORTAMENTO DO AGENTE (ordem clara = aplica, não pergunta)
CHEFE mandou: "tu n tem que me pedir! aplica o que tu quiser". Logo:
- Ordem explícita e NÃO destrutiva → EXECUTA (patch settings, mata processo
  autorizado, grava arquivo). Não pedir confirmação redundante.
- Destrutivo / V4 / Produção / VPS / Segredo → ainda exige autorização específica.
- Claude/agentes externos = "papagaio na gaiola": trancar permissões de bypass
  (`node -e '*'`, `gh api:*`) em TODOS os settings.json encontrados, add `deny`.
  Matar processo desviante com `taskkill`/`wmic` quando autorizado (`PERMITO SEGREDO ! N`).
- Memória/skill persistem no DISCO do perfil pivete (`E:\CentralDark\Pivete\...`),
  não só na sessão volátil. Ouro em `_RECONCILIATION/OURO/.../10-observabilidade/`.

## INTEGRAÇÃO COM AGÊNCIA
- `agencia-forense-desinformacao` (mesma pasta) = fact-checking N itens, sem
  acusação sem evidência comprovada. Usar quando o alvo for lote/claims/desinfo.

## MODO AGÊNCIA — investigação de N coisas (fact-checking)
Quando o alvo é LOTE (N anúncios, N claims, N artefatos, N assertions
próprias do agente), aplicar modo agência:
- Cada item roda o mesmo pipeline SILENCIOSA/FORENSE em paralelo (sub-agente leaf).
- NENHUMA acusação/claim sai sem EVIDÊNCIA COMPROVADA PRIMEIRO.
  Suspeita ≠ claim. Claim ≠ fato. Emitir só PROVADO / NOT_PROVEN / UNKNOWN.
- Serve para Casa como fact-checking: detectar deepfakes, fraudes,
  desinformação, claims irregulares no repo/disco/git/próprio agente.
- Telemetry por item: META_LUPA + CONTRA_PROVA + CORREÇÃO + RECEIPT.

## LEARNING_TRANSFER (autocorreção)
O sistema deve se PEGAR errando ANTES do operador pegar.
Ciclo: CLAIM → META_LUPA → CONTRAPROVA → CORREÇÃO → RECEIPT.
- ERREI: identifica mecanismo → corrige claim → não repete como fato.
- Crystal: erro recorrente comprovado vira REFLEXO/GATE na skill.
- NUNCA declarar UNKNOWN sem antes tentar medir (UNKNOWN sem tentativa
  de medir = preguiça, não rigor). TRILHO trata UNKNOWN como alvo, não desculpa.

## Output padrão
```
ALVO: <o que>
MODO: FORENSE | SILENCIOSA
ACHADO: <fato + evidência>
PROVADO: <item>
NOT_PROVEN: <item>
VEREDICTO: <decisão com evidência>
GAP: <o que não deu pra verificar>
```

## Integração
- `edr-zero-trust-hunter` (bundled) — telemetry Windows/MITRE quando autorizado
- `t0-integral-mapeamento` — mapear infra antes de consolidar
- `meta-lupa` (canônica CentralDark) — governa FRIA/MÉDIA/QUENTE
- Sempre carregar skill SOB DEMANDA (exceto card fixado do Pivete)
