# PostHog no cockpit: estado e continuidade

## Objetivo

Adicionar observabilidade de produto ao cockpit existente em
`apps/modulos/Bolt/source`: eventos de uso e diagnóstico de problemas.
GitHub permanece como fonte canônica do código; o runtime é validado no
ambiente onde executa.

## Estado observado em 2026-09-16

- PostHog Wizard 2.74.1 executado no Windows por `npx @posthog/wizard@latest`.
- Alvo: `apps/modulos/Bolt/source`, pacote `centraldark-desktop`, React 18 / Remix 2.
- Detecção automática incorreta corrigida pela seleção JavaScript (Web).
- O assistente confirmou `Login complete`.
- Depois do login, a porta temporária 8239 deixou de escutar. O callback
  antigo não representa a disponibilidade do produto.
- O assistente aguarda a escolha de fontes adicionais GitHub e OpenRouter.
- Na conferência para este registro, nenhum arquivo versionado do aplicativo
  foi alterado pelo assistente; somente `.posthog-wizard-cache/` foi criado.
- Instrumentação, recebimento de eventos e deploy desta integração: NÃO VALIDADOS.

## Possibilidades e uso

PostHog pode apoiar métricas de uso, funis, investigação de erros, replays,
feature flags e observabilidade de IA conforme a instrumentação escolhida.
Essas capacidades não ficam comprovadas pela instalação do assistente.

O Wizard prepara a integração no PC; o código instrumentado executa com o
aplicativo; os dados são consultados no projeto PostHog selecionado.
Login via GitHub e conexão de GitHub como fonte de dados são operações distintas.

## Próximo passo

1. Resolver a escolha pendente de fontes adicionais.
2. Finalizar o assistente e revisar o diff no owner do cockpit.
3. Confirmar projeto/região, escopo dos eventos e tratamento dos dados coletados.
4. Testar o aplicativo e comprovar um evento de teste recebido no projeto correto.
5. Publicar somente alterações revisadas e validar o deploy aplicável.

Não versionar o cache do assistente nem URLs de callback com códigos OAuth.
Este commit registra preparação e continuidade, não integração concluída.

## Padrão operacional de comunicação

Correção do usuário: aplica-se a todos os agentes da CentralDark, não apenas
a esta sessão. A regra foi incorporada ao owner existente
`docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md`, seção
"Explicação operacional de capacidades", já referenciado pelo boot em `LEIA-ME-IA.md`.
Este relatório registra a origem da correção; o contrato permanece no owner.
