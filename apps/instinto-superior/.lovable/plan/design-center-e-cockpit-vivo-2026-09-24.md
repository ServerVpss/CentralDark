# Design Center e cockpit vivo

## Direção
Estender o `CockpitShell` e o motor Hermes existentes. Não criar nova aplicação, rota paralela, mascote, paleta ou armazenamento.

A exigência de **9 ações / 144 quadros** será tratada como núcleo canônico aprovado. As sete posturas adicionais já existentes não serão apagadas: ficarão claramente marcadas como **EM TESTE**, preservando o trabalho atual e evitando regressão. O atlas, as cores e o desenho do Instinto Superior não serão alterados neste delta; a melhoria de pixels dos 16 quadros será registrada e comparável, com rollback, sem recoloração ou redesenho.

## Entregas
- Adicionar ao cockpit uma navegação interna entre **Visão geral**, **Sync Center**, **Design Center**, **Hermes** e **Downloads**.
- Extrair e exibir os tokens reais já usados: paleta, tipografia, espaçamento, raios, sombras, brilhos e estados.
- Montar biblioteca visual com os componentes atuais e os seis estados: `PASS`, `RUNNING`, `BLOCKED`, `AUTH_REQUIRED`, `UNKNOWN` e `FAIL`.
- Mostrar previews das três superfícies existentes em tamanhos computador e celular, sem iframe duplicado nem novo app.
- Reusar o `PainelHermes` para pele, ação, quadro, reprodução, direção e velocidade, conectado ao mesmo estado do Hermes flutuante.
- Mostrar comparação **antes/depois**, classificação **CANÔNICO / EM TESTE / PUBLICADO** e ação de rollback local para os controles visuais reversíveis.
- Preencher o Sync Center com a main real `6fce185…`, commits recentes, delta contra o servidor e data de medição, usando o canal CentralDark disponível como fonte independente de OAuth.
- Atualizar o HUD com main, servidor, build local, publicação, Gmail e Desktop, sem converter ausência de prova em sucesso.
- Ligar o Download Center ao ZIP real e explicar o instalador Windows, backup e rollback já incluídos no pacote.
- Manter Gmail como `AUTH_REQUIRED`; GitHub separado também será `AUTH_REQUIRED` se faltar autorização, sem bloquear a fonte CentralDark.

## Verificação
- Conferir consistência dos tokens e contraste dos textos/estados.
- Testar computador e celular, sobreposição do Hermes, navegação por teclado e `prefers-reduced-motion`.
- Verificar painel e Hermes flutuante usando o mesmo estado, sem duplicação.
- Validar ZIP, manifesto, instalador, backup e rollback.
- Rodar checagem de tipos, testes disponíveis e build automático.
- Capturar as superfícies públicas e o cockpit autenticado quando houver sessão; sem sessão, registrar a área protegida como `UNKNOWN`, não `PASS`.
- Registrar receipt final separando `PASS`, `RUNNING`, `AUTH_REQUIRED`, `BLOCKED`, `UNKNOWN` e `FAIL`.
