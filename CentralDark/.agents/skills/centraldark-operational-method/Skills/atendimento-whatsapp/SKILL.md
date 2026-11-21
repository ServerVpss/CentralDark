---
name: atendimento-whatsapp
description: Coordena o atendimento profissional pelo WhatsApp do SegredoUnlock GSM Server, reutilizando as capacidades e os registros existentes.
---

# 💬 Atendimento pelo WhatsApp — CentralDark

**Owner operacional:** esta capacidade dentro da Skill Mãe da CentralDark.
**Owner do método profissional:** [Meu jeito de trabalhar](https://github.com/ServerVpss/Meus-Trabalhos/blob/main/04-METODO-DE-TRABALHO/README.md).
**Owner dos aprendizados de atendimento:** [Aprendizados do atendimento](https://github.com/ServerVpss/Meus-Trabalhos/blob/main/01-ATENDIMENTO-WHATSAPP/04-PLANEJAMENTO/APRENDIZADOS-ATENDIMENTO.md).

## 🎯 Missão

Orientar a automação do atendimento WhatsApp, sem criar outro agente, executor, banco de clientes ou catálogo de Skills. Reutilizar os módulos WhatsApp, OpenBot, CRM, MCP e Hermes existentes, depois de verificar quais estão efetivamente ativos. **Documentado não significa conectado ou executado.**

## 🧠 Antes de responder ou agir

1. Recuperar o contexto permitido do atendimento e identificar a intenção real; não confundir conversa pessoal com solicitação comercial.
2. Consultar o método profissional no repositório privado `ServerVpss/Meus-Trabalhos` e os aprendizados já comprovados.
3. Consultar as regras atuais da CentralDark e as capacidades especializadas existentes. A receita `copiar-imagem-de-mensagem-citada` é um owner próprio já mencionado no aprendizado A-001: localizar e reutilizar; **não reescrever nem criar cópia nesta Skill**.
4. Verificar a autorização para qualquer ação externa, orçamento, envio, alteração de dados ou operação de risco. Não enviar mensagens nem assumir compromissos sem permissão apropriada.
5. Acompanhar a tarefa no recurso de atendimento existente, conferir o resultado e devolver um comprovante proporcional ao que foi observado.

## 📂 Destinos oficiais — sem duplicação

| Informação | Onde fica |
| --- | --- |
| Instruções de automação e integração do atendimento | Esta Skill, na biblioteca da Skill Mãe |
| Método comercial e técnico de trabalho | `Meus-Trabalhos/04-METODO-DE-TRABALHO/README.md` |
| Aprendizados comprovados do atendimento | `Meus-Trabalhos/01-ATENDIMENTO-WHATSAPP/04-PLANEJAMENTO/APRENDIZADOS-ATENDIMENTO.md` |
| Tarefas e planejamento documentais | Pastas `03-TAREFAS` e `04-PLANEJAMENTO` do atendimento |
| Histórico completo, dados pessoais, contatos e credenciais | Somente serviços autorizados com controle de acesso; não publicar em Git |

## 💗 Cristalização de aprendizado

Reaproveitar o que existe; verificar resultado; acrescentar apenas o delta comprovado no arquivo de aprendizados do trabalho. Se a descoberta muda a forma como o agente age, ajustar o owner operacional correspondente da CentralDark, preservando o histórico e verificando a execução. Uma anotação no Git não prova que o agente já a carregou. Não gerar uma nova Skill para cada caso, cliente, técnica ou resposta.

## 🔍 Limites atuais

A conexão automática entre WhatsApp/OpenBot/CRM e os dois repositórios **não está comprovada** por este documento. Não alegar leitura, gravação, carregamento automático ou envio de mensagens sem comprovante do runtime. Nunca gravar telefone, nome de cliente, conversa privada, senha, token ou dado pessoal em arquivos de Skills ou aprendizados do GitHub.

**Próxima verificação:** identificar o consumidor real do atendimento e provar a sequência `consultar método → recuperar contexto autorizado → executar com permissão → conferir → registrar aprendizado` no mesmo owner.

<!-- CENTRALDARK_WHATSAPP_THREE_ROUTES_20261120 -->
## 🔌 Acesso direto aos donos oficiais — três rotas, um só resultado

Os dois agentes existentes do CentralDarkBot, **WhatsApp Orchestrator** e **Atendimento WhatsApp**, usam o próprio `AGENTS.md` do seu ambiente para descobrir esta capacidade e o repositório profissional. Não duplicar a Skill no OpenBot nem criar link simbólico ou outro servidor.

**Fontes de verdade (consultar a branch `main` e conferir SHA):**
- Instruções e novas técnicas operacionais: `ServerVpss/CentralDark@main`, nesta Skill. Provas e versões históricas dos métodos nativos do Atendimento: [receitas legadas preservadas](references/legado-openbot-preservado-2026-11-20.md). Essa referência não é outra Skill.
- Trabalho e conhecimento profissional: `ServerVpss/Meus-Trabalhos@main`, `04-METODO-DE-TRABALHO/README.md` e `01-ATENDIMENTO-WHATSAPP/04-PLANEJAMENTO/APRENDIZADOS-ATENDIMENTO.md`.
- Estado de agentes, conversas, filas, rotinas, anexos e permissões: **SQLite original do OpenBot**, não substituir por GitHub. Dados privados de clientes e autenticações permanecem no armazenamento autorizado.

**Ordem de acesso e recuperação, sem simular execução:**
1. **MCP CentralDark** cadastrado no OpenBot: testar acesso real à `main` e à ferramenta necessária, não presumir que `enabled` prova OAuth ou permissão.
2. Se indisponível ou sem a capacidade necessária, **conector GitHub original do OpenBot**: usar a conexão já autenticada, se de fato responder, e registrar caminho/commit lido.
3. Se ambas as alternativas falharem, **GitHub CLI `gh` da Casa**, pelo executor original e somente quando o agente estiver efetivamente no host autenticado. Conferir `gh auth status`, autorização e acesso ao repositório específico. Não copiar, imprimir ou transportar tokens.

Se uma ação de escrita teve resposta incerta, **verificar primeiro se o commit/registro já existe** para impedir duplicação; não disparar a mesma mutação nas três rotas. Se falharem as três, preservar a tarefa pendente e o contexto, informar o bloqueio, não inventar gravação.

**Cristalização:** recuperar a Skill e seu histórico antes de criar; aplicar apenas uma melhoria comprovada ao owner operacional existente, mediante autorização e validação; gravar aprendizados profissionais sem dados pessoais no arquivo único de `Meus-Trabalhos`; conferir commit SHA e leitura de volta. Não salvar técnicas operacionais como outra Skill na biblioteca local por padrão.

**Proteção dos métodos legados:** as cinco receitas distintas recuperadas do agente Atendimento WhatsApp e suas assinaturas originais foram preservadas na referência acima. Os arquivos locais originais e as Skills nativas gerenciadas pelo OpenBot continuam intactos até existir prova de que o agente consome esta versão canônica; então avaliar desativação da cópia legada com contraprova de não regressão. **Não apagar nem sobrepor uma receita em funcionamento por causa da troca de endereço de registro.**

**Papel de cada agente:** Orchestrator coordena e acompanha; Atendimento conversa, consulta e executa procedimentos autorizados. Ambos consultam as mesmas fontes sem competir pela escrita e preservam seus nomes, instruções de identidade e rotinas existentes.
<!-- CENTRALDARK_WHATSAPP_BROWSER_STATUS_EVIDENCE_20261121 -->
## 🔎 Estado do WhatsApp Web — verificar no navegador nativo antes de declarar desconexão

**Incidente observado em 21/11/2026:** o OpenBot classificou uma aba `web.whatsapp.com` como "desconectada" porque apareceu o texto "Protegida com a criptografia de ponta a ponta". Essa frase é informativa, não é evidência de logout. Na sequência da mesma missão o Radar leu 12 prévias de grupos e publicou o resultado no `ServerVpss/Meus-Trabalhos@main`, com commit e readback. A gravação remota está provada; o estado preciso da sessão no instante do primeiro aviso não foi medido.

**Diagnóstico obrigatório usando somente a aba e as ferramentas nativas do OpenBot:**
1. Reobservar `web.whatsapp.com` na **mesma aba e no mesmo perfil**. Verificar URL, conteúdo visível e estado do carregamento. Aguardar pelo recurso nativo `wait_for`/equivalente uma condição objetiva (lista de conversas/grupos ou login/QR) com limite de espera e repetir a leitura; não iniciar uma sessão concorrente.
2. **CONECTADO** quando a lista de grupos/conversas e prévias atuais realmente estiverem acessíveis. **LOGIN_NECESSARIO** apenas quando a tela de login ou QR for observada. **FALHA_DA_PAGINA** quando houver erro real de navegação. **CARREGANDO/INDETERMINADO** se aparecer somente a mensagem de criptografia, timeout isolado ou informação contraditória. Não transformar `INDETERMINADO` em "WhatsApp desconectado".
3. Se o resultado continuar indeterminado após a espera limitada, registrar somente o que foi observado: estado da aba, evidência, horário e motivo da pendência. Não inventar leitura de grupos, não forçar logout, limpeza de cookies, reinicialização, relogin nem QR.
4. Se a mesma missão obtiver depois leitura válida das prévias, **retificar explicitamente** qualquer aviso anterior de desconexão. Distinguir `WHATSAPP_BROWSER_STATUS`, `RADAR_DATA_READ` e `GITHUB_WRITE_PROOF`; sucesso do commit não comprova acesso ao WhatsApp e falha visual isolada não comprova desconexão.
5. Manter a regra vigente do Radar: ler somente as prévias permitidas, sem abrir conversas privadas nem enviar mensagens sem autorização. Aprendizados e atualizações documentais devem ser escritos no arquivo existente no `Meus-Trabalhos@main`, com commit SHA e readback; não criar outra biblioteca local.

**Contraprova:** cenário A (criptografia durante carregamento) → `CARREGANDO/INDETERMINADO`; B (lista acessível) → `CONECTADO`; C (QR de login confirmado) → `LOGIN_NECESSARIO`; D (erro explícito) → `FALHA_DA_PAGINA`. Essas classificações são critérios de teste, não prova de que a UI atual esteja em qualquer um desses estados.
<!-- /CENTRALDARK_WHATSAPP_BROWSER_STATUS_EVIDENCE_20261121 -->

<!-- /CENTRALDARK_WHATSAPP_THREE_ROUTES_20261120 -->
