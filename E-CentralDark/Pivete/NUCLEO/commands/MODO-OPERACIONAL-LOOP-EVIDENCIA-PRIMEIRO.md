# COMANDO - MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\ARQUITETURA\MODO-OPERACIONAL-LOOP-EVIDENCIA-PRIMEIRO.md
**SHA:** a46cf5e16264a8e0
**Timestamp:** 2026-08-28T02:56:44.443448
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- - falhou qualquer gate: rollback automático quando seguro e status `BLOCKED`;

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "Modo Operacional — LOOP com evidência primeiro"
status: "CANDIDATO_CANONICO"
date: "2026-07-31"
source_of_truth: "ServerVpss/CentralDark"
observed_target_evidence: "Estado observado do alvo (VPS, runtime, serviços). É insumo operacional, NÃO fonte canônica: nunca promove estado divergente ou não aprovado a cânone."
scope: "Operações críticas, segurança, VPS, GitHub, deploy, automação e evolução do CentralDark/Hermes"
---

# Modo Operacional — LOOP com evidência primeiro

Este documento registra o modo de operação **proposto para avaliação por SEGREDO/CHEFE**, elaborado durante a captura defensiva da VPS em 2026-07-31. Permanece `CANDIDATO_CANONICO`: sem um `OPERATION_RECEIPT` terminal com `chief_decision: APPROVED` preso ao mesmo HEAD, nenhuma seção abaixo prova aprovação — apenas descreve a proposta.

Ele não autoriza mutação por si só. Ele define a ordem, os papéis, os gates e a forma de aprender sem depender do chat.

## 1. Autoridade e papéis

```text
SEGREDO/CHEFE = autoridade humana final; define intenção, autoriza promoção e encerra o LOOP
SOL           = coordenador; preserva o fio, organiza papéis, confronta hipóteses e exige prova
PIVETE/HERMES = mente treinada e executora; preserva aprendizado e continuidade operacional
SCOUT/REVIEWER= leitor adversarial e somente leitura; procura lacunas e ruído
WRITER        = único executor autorizado a alterar o escopo atual
JUDGE         = validador independente; tenta falsificar a entrega e não aprova o próprio trabalho
```

Nome comercial de modelo não altera autoridade. GPT, Grok, Claude, Codex, Gemini ou qualquer modelo futuro recebem apenas um papel operacional.

## 2. Circuito canônico

```text
INTENÇÃO DO CHEFE
  → CAPTURE
  → SANITIZE + HASH
  → DECIDE
  → APPLY
  → JUDGE
  → CHEFE
  → RECEIPT + LEARNING
  → LOOP até fechar a conta
```

O LOOP só encerra quando o resultado, a contraprova, o estado final e o rollback estiverem registrados.

## 3. CAPTURE — medir antes de interpretar

A captura é determinística, read-only e produz um pacote reproduzível.

Deve medir, quando aplicável:

- host, timestamp UTC, branch, HEAD e origem (normalizada: somente `scheme://host/path`; nunca `userinfo`, `query`, `fragment` ou credenciais embutidas na URL);
- sistema, listeners, PID, binário, CWD e cgroup;
- UFW, nftables, iptables e regras Docker;
- SSH e Fail2ban;
- systemd, Docker, Compose, PM2 e Caddy;
- estado Git e referências de bind/porta no código;
- logs recentes sanitizados;
- nomes de possíveis credenciais, nunca os valores;
- manifesto de arquivos e SHA-256 do pacote.

Durante CAPTURE:

```text
NINGUÉM ESCREVE
NINGUÉM FECHA PORTA
NINGUÉM REINICIA SERVIÇO
NINGUÉM PROMOVE
```

A captura pode escrever somente sua própria evidência em diretório restrito. Ela não altera PM2, Docker, UFW, systemd, aplicação ou repositório.

## 4. Baseline experimental não é cânone

Uma captura nova permanece `BASELINE_EXPERIMENTAL` até provar os quatro gates:

1. tarball revisado contra vazamento de segredo;
2. falha crítica gera `status: BLOCKED` com `reason: CAPTURE_DEGRADED`, nunca falso PASS;
3. duas execuções produzem estrutura equivalente e explicam diferenças voláteis;
4. zero mutação em PM2, Docker, UFW, systemd e Git.

Somente depois ela pode ser promovida a coletor canônico versionado.

## 5. SANITIZE + HASH — pacote seguro antes de IA

Nenhum tarball cru entra em prompt.

Regras:

- `umask 077`;
- **a sanitização é obrigatória ANTES de gravar em disco e ANTES de enviar a qualquer agente** — não existe "quando possível";
- **se a sanitização falhar ou não puder ser garantida: não persistir, não enviar, interromper a captura e retornar `status: BLOCKED` com `reason: SANITIZE_FAILED`**;
- PM2 filtrado por allowlist de campos; proibido despejar ambiente completo;
- tokens, headers, cookies, chaves, connection strings e certificados nunca são registrados;
- manifesto por arquivo + SHA-256 do pacote;
- **se um segredo suspeito for encontrado, mesmo após a sanitização: não persistir, não enviar, interromper a captura e retornar `status: BLOCKED` com `reason: SECRET_EXPOSURE`** — a mesma regra fail-closed da sanitização, aplicada de novo aqui porque a detecção de segredo pode ocorrer depois que um artefato já foi criado.

Sanitização reduz risco, mas não é assumida como prova matemática: o pacote passa por verificação antes de ser entregue a outro agente.

## 6. DECIDE — código primeiro, modelo no residual

```text
CÓDIGO MEDE
REGRAS CLASSIFICAM O CONHECIDO
MODELO INTERPRETA UNKNOWN OU ANOMALY
```

Porta, PID, bind, hash, diff, regra de firewall e estado de serviço não devem consumir modelo para serem descobertos.

Estados permitidos:

- `PASS` — prova positiva e reproduzível;
- `FAIL` — violação comprovada;
- `UNKNOWN` — informação insuficiente;
- `ANOMALY` — divergência fora do padrão esperado;
- `ACHADO_PENDENTE` — suspeita ainda sem arquivo, linha, commit e evidência sanitizada;
- `BLOCKED` — gate falhou, autorização ausente, execução pulada ou exposição de
```