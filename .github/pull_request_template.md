╔════════════════════════════════════════════╗
║ 🧠 CENTRALDARK — ESTADO DA MISSÃO         ║
╚════════════════════════════════════════════╝

🎯 VEREDITO=
PR recém-aberto; preencher a verdade atual em uma frase.

📊 PROGRESSO=
ESCOPO_MEDIDO=1 gate inicial do corpo do PR
PERCENTUAL_MEDIDO=0/100=0%
ESTIMATIVA=NÃO_CALCULADA
ESCOPO_DA_ESTIMATIVA=NÃO_APLICÁVEL
SITUAÇÃO=UNKNOWN
OPERACIONAL=NÃO
COMPLETO=NÃO

✅ O QUE JÁ ESTÁ PRONTO=
- branch e PR criados

🟡 O QUE ESTÁ PARCIAL=
- descrição técnica ainda precisa ser atualizada pelo Writer

❌ O QUE AINDA FALTA=
- preencher provas, testes, fluxo e próximo gate do HEAD atual

🚫 BLOQUEADORES=
- UNKNOWN até a primeira medição

⚠️ PENDÊNCIAS NÃO BLOQUEANTES=
- NENHUMA

🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=
ERRO=UNKNOWN
CAUSA=UNKNOWN
CORREÇÃO=descrever a menor cirurgia deste PR
TESTE_DA_CICATRIZ=informar o teste que falha antes e passa depois ou NÃO_APLICÁVEL
REGRESSÃO=UNKNOWN

🔎 PROVA=
REPOSITÓRIO=ServerVpss/CentralDark
PR_OU_ISSUE=PR A DEFINIR
BRANCH=BRANCH A DEFINIR
HEAD=0000000000000000000000000000000000000000
CHECKS=UNKNOWN
TESTES=UNKNOWN
RECEIPT=UNKNOWN
FONTE_DA_PROVA=GitHub

🧭 FLUXO VISUAL=
DIAGRAMA_OBRIGATÓRIO=NÃO
MOTIVO=PR recém-aberto; substituir por Mermaid em português quando houver fluxo multi-etapa
NÃO_APLICÁVEL

🗣️ PAPO RETO DO PIVETE=
Diga o que mudou, por que importa e onde está o fio, sem esconder pendência.

➡️ PRÓXIMO GATE=
Medir o HEAD, executar os testes e atualizar este corpo.

🧰 COMANDO CIRÚRGICO=
NENHUM

🧪 COLETA DO CHEFE=
NENHUMA

👑 AÇÃO DO CHEFE=
NENHUMA

🛡️ O QUE NÃO FOI TOCADO=
- main
- VPS
- produção
- segredo
- deploy

AUTORIA_DO_PADRÃO=SEGREDO/CHEFE

---

## Arquivos sensíveis

- [ ] Não li, abri, copiei, editei ou usei como contexto arquivos sensíveis.
- [ ] Não há `.env`, token, cookie, sessão, chave privada, certificado ou credencial no diff.
- [ ] Valores sensíveis foram substituídos por placeholders seguros.

## Testes

Liste os testes frescos e o resultado preso ao HEAD atual.

## Ações sensíveis

- [ ] Não houve merge, deploy, restart, exclusão, force-push, alteração de VPS ou mudança em produção.
- [ ] Qualquer ação sensível futura aguarda autorização explícita do SEGREDO/CHEFE para o alvo exato.

## Revisão

- [ ] Verifiquei comentários de agentes no PR antes do merge.
- [ ] Revisei o diff completo e os checks do HEAD atual.
- [ ] Confirmei que logs e diagramas não expõem valores sensíveis.

## Regras rápidas

- Todo texto operacional em português.
- Fluxo com três ou mais participantes: use `sequenceDiagram` Mermaid.
- Atualize o HEAD, testes e checks depois de cada mudança relevante.
- `UNKNOWN`, `SKIPPED`, `PENDING` e silêncio nunca são `PASS`.
- Não apague este contrato; evolua os campos com a prova real.
