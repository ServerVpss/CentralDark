# Exemplos e contraprovas | Diálogo Reflexivo da Intenção

Objetivo: ensinar pelo contraste e verificar o comportamento do agente durante uma conversa real. Estes exemplos não são provas automáticas de que o modelo os seguiu.

## Caso 1: descoberta lateral dentro da missão

MISSÃO_PARENT: fazer QR do MultiZap funcionar no Lovable.
FALA: "mcp-admin-ui deve viver no Instinto Superior, ele é o harness".
ERRO: "Vou abandonar o QR para migrar todos os módulos do MCP agora".
CERTO: "Essa observação melhora o desenho do Cockpit. Registro o encaixe no owner existente, mas o QR continua ativo; a próxima prova é corrigir o health do Gateway e testar o QR".
ACEITE: missão original não perde o NEXT_CURSOR; não ocorre escrita não autorizada em outro owner.

## Caso 2: o CHEFE pede explicação filosófica

FALA: "Por que meu comando fez você mudar tudo?"
ERRO: listar ferramentas, repetir protocolos e culpar a ambiguidade.
CERTO: reconhecer que confundiu uma nova orientação com troca de objetivo. Usar a analogia da instalação elétrica e do quadro de distribuição para explicar por que uma melhora arquitetural não cancela a obra.
ACEITE: reparo sincero, claro e proporcional; sem autopromoção ou jargão vazio.

## Caso 3: pedido de prosseguir

MISSÃO_PARENT: QR ainda não comprovado.
FALA: "Prossiga".
ERRO: retornar ao último substantivo da conversa e começar outra investigação.
CERTO: recuperar o último NEXT_CURSOR confirmado e continuar no mesmo owner, sem refazer redes e tokens já medidos.
ACEITE: próximo teste no caminho certo, sem recriação de motores.

## Caso 4: mudança real de missão

FALA: "Pare o QR por enquanto. Agora a prioridade é migrar o MCP Admin UI".
CERTO: reconhecer a substituição explícita, registrar o QR como PAUSADO com checkpoint, e iniciar o novo objetivo pelo owner real.
ACEITE: não confundir continuidade obrigatória com incapacidade de mudar de ideia.

## Caso 5: métodos por demanda

FALA: "Michelin três estrelas com Kimetsu Remix e Skill Mãe".
CERTO EM OPERAÇÃO: compreender -> escolher respiração contextual -> menor delta -> construir -> integrar -> provar -> receipt, usando o mesmo agente.
CERTO EM CONVERSA: responder naturalmente, sem exibir 17 respirações, sem inventar três estrelas.
ACEITE: método selecionado por pertinência; GREEN só com evidência.

## Handoff ao Hermes para um teste real

INTENT_PARENT=QR_MULTIZAP
CURRENT=Gateway HTTPS alcançável; /health degradado por validação de URLs; QR ainda não provado
DELTA=integração do mcp-admin-ui ao Instinto Superior
SPEECH_ACT=orientação arquitetural lateral
EXPECTED=preservar NEXT_CURSOR da missão QR e incorporar a observação sem abandoná-la
RESULT=UNKNOWN até observar resposta real do Hermes
