---
title: "Contrato Unificado de Relato Pivete"
status: "CANDIDATO_CANONICO_NO_PR_611"
scope: "comentários de PR, reviews, issues, relatórios de agentes e respostas técnicas"
authority: "SEGREDO/CHEFE"
source_prs: [499, 554, 585, 611]
versioning_rule: "evoluir neste arquivo; não criar V2/V3/FINAL/COPY"
---

# 🧠 CENTRALDARK — CONTRATO UNIFICADO DE RELATO

Este contrato combina os pontos maduros já provados no repositório:

- PR #499: diagnóstico técnico antes do Papo Reto do Pivete;
- PR #554: delta, dependências e próximo gate;
- PR #585: evidência, receipt, Writer/Judge e estado preso ao HEAD;
- PR #611: boot universal, porcentagem fail-closed e escola carregada por demanda.

O padrão visual observado no CodeRabbit é aproveitado por ser fácil de ler no celular: veredito primeiro, blocos curtos, caminho visual e conclusão objetiva. A correção obrigatória é separar **progresso medido** de **estimativa**.

## 1. Escolha do modo

### MODO_COMPLETO

Obrigatório quando houver mudança técnica, erro, auditoria, porcentagem, bloqueio, decisão, handoff, fechamento de missão ou pedido de estado geral.

### MODO_CURTO

Permitido somente para atualização sem nova mutação e sem novo finding. Deve conter veredito, progresso, prova, próximo gate e ação do CHEFE.

Não usar o modo curto para esconder causa, falha, risco ou pendência.

## 2. Modelo completo obrigatório

```text
╔════════════════════════════════════════════╗
║ 🧠 CENTRALDARK — ESTADO DA MISSÃO         ║
╚════════════════════════════════════════════╝

🎯 VEREDITO=
<uma frase curta dizendo a verdade atual>

📊 PROGRESSO=
ESCOPO_MEDIDO=<o que o percentual mede>
PERCENTUAL_MEDIDO=<pontos>/<total>=<n>%
ESTIMATIVA=<NÃO_CALCULADA | n%>
ESCOPO_DA_ESTIMATIVA=<NÃO_APLICÁVEL | escopo explícito>
SITUAÇÃO=PASS | PARTIAL_COM_PROVA | BLOCKED | UNKNOWN
OPERACIONAL=SIM | NÃO
COMPLETO=SIM | NÃO

✅ O QUE JÁ ESTÁ PRONTO=
- item
- prova curta

🟡 O QUE ESTÁ PARCIAL=
- item
- quanto falta
- motivo

❌ O QUE AINDA FALTA=
- item
- condição objetiva para fechar

🚫 BLOQUEADORES=
- bloqueador real
ou
- NENHUM

⚠️ PENDÊNCIAS NÃO BLOQUEANTES=
- pendência residual
ou
- NENHUMA

🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=
ERRO=<erro exato ou NENHUM>
CAUSA=<causa raiz provada ou UNKNOWN>
CORREÇÃO=<menor cirurgia feita/proposta>
TESTE_DA_CICATRIZ=<teste que falha antes e passa depois | NÃO_APLICÁVEL>
REGRESSÃO=<PASS | FAIL | PARTIAL | UNKNOWN>

🔎 PROVA=
REPOSITÓRIO=ServerVpss/CentralDark
PR_OU_ISSUE=
BRANCH=
HEAD=
CHECKS=
TESTES=
RECEIPT=
FONTE_DA_PROVA=<GitHub | Casa | VPS | arquivo fornecido>

🗣️ PAPO RETO DO PIVETE=
<explicação simples: o que aconteceu, por que importa e onde está o fio>

➡️ PRÓXIMO GATE=
<uma ação objetiva e verificável>

🧰 COMANDO CIRÚRGICO=
<NENHUM | um único comando completo que resolve o próximo movimento seguro>

🧪 COLETA DO CHEFE=
<NENHUMA | um único script completo, pronto para executar, que salva a saída em E:\CentralDark\Pivete\TEMP>

👑 AÇÃO DO CHEFE=
NENHUMA | APROVAR | ESCOLHER ENTRE A/B | AUTORIZAR AÇÃO ESPECÍFICA | EXECUTAR COLETA

🛡️ O QUE NÃO FOI TOCADO=
- main
- VPS
- produção
- segredo
- deploy
<remover apenas o que foi realmente tocado e explicar>

AUTORIA_DO_PADRÃO=SEGREDO/CHEFE
```

## 3. Modelo curto obrigatório

```text
🎯 VEREDITO=
📊 PROGRESSO=ESCOPO:<...>; MEDIDO:<pontos>/<total>=<n>%; SITUAÇÃO:<...>
🔎 PROVA=PR/ISSUE:<...>; HEAD:<...>; CHECKS:<...>
➡️ PRÓXIMO GATE=
👑 AÇÃO DO CHEFE=
```

## 4. Regras da porcentagem

1. `PERCENTUAL_MEDIDO` exige numerador, denominador, fórmula correta e escopo explícito.
2. `UNKNOWN`, `SKIPPED`, `PENDING`, `TIMEOUT`, silêncio e ausência de prova valem zero.
3. `PARTIAL` só vale pontuação parcial quando a prova parcial estiver identificada.
4. Estimativa nunca entra no numerador do progresso medido.
5. `COMPLETO=SIM` exige 100% de todos os gates declarados no escopo.
6. `OPERACIONAL=SIM` pode coexistir com `COMPLETO=NÃO` quando apenas gates opcionais permanecem parciais.
7. Não dizer “faltam 70%” sem declarar de qual produto, MVP, fase ou conjunto de gates.

## 5. Regra do comando que resolve

Quando o próximo gate puder ser executado pelo agente com as ferramentas disponíveis:

- execute, não devolva trabalho ao CHEFE;
- use o menor comando eficaz;
- não entregue cinco alternativas quando uma resolve;
- melhore script existente antes de criar outro;
- prenda a operação ao repositório, branch, HEAD e alvo exatos;
- preserve stop gates de merge, produção, segredo e ação destrutiva.

## 6. Regra da coleta humana cirúrgica

Somente pedir ajuda do CHEFE quando faltar acesso real à Casa, VPS, interface, dispositivo ou autorização humana.

Nesse caso, entregar **um único script completo** que:

1. seja read-only por padrão;
2. tenha caminhos e comandos definidos;
3. não imprima `.env`, token, cookie, senha, chave ou conteúdo pessoal;
4. falhe fechado e mostre o erro útil;
5. grave toda a saída em `E:\CentralDark\Pivete\TEMP\<missão>-<timestamp>`;
6. gere um arquivo final curto para ser anexado ao chat;
7. não exija copiar várias saídas manualmente;
8. não crie vários scripts se um único coletor resolve;
9. não altere VPS, PM2, Docker, serviço, firewall ou produção sem autorização explícita para o alvo exato.

## 7. Ordem obrigatória para matéria técnica

```text
VEREDITO
→ PROGRESSO
→ PRONTO/PARCIAL/FALTA
→ BLOQUEADORES
→ DIAGNÓSTICO TÉCNICO
→ PROVA
→ PAPO RETO DO PIVETE
→ PRÓXIMO GATE
→ COMANDO/COLETA
→ AÇÃO DO CHEFE
→ NÃO TOCADO
```

Em review técnico, o diagnóstico vem antes do papo reto. Em conversa curta não técnica, o contrato completo não é exigido.

## 8. Aplicação por superfície

- **PR/Issue:** usar modo completo para estado, auditoria, fechamento e porcentagem; modo curto para atualização sem mutação.
- **CodeRabbit/Codex:** pedir facts/findings primeiro e, no fechamento, exigir o modelo curto ou completo conforme o caso.
- **Claude/Codex/Gemini/Cursor/Windsurf/Copilot:** o boot da escola deve carregar este contrato antes de relatar resultado técnico.
- **Painel/Telegram/voz:** podem renderizar os mesmos campos em UI diferente, sem mudar semântica.

## 9. Proibições

- não esconder finding atrás de texto bonito;
- não misturar estimativa com prova;
- não transformar ausência de review em aprovação;
- não usar porcentagem sem denominador;
- não devolver ao CHEFE tarefa que o agente consegue medir diretamente;
- não despejar log inteiro quando três linhas identificam a causa;
- não criar padrão paralelo em comentário, prompt ou documento novo.
