# Hermes passeando nas três telas oficiais

## Objetivo
Levar o mesmo Hermes animado para a entrada pública, a entrada do cockpit e o cockpit após login, sem criar outro mascote nem alterar sua aparência aprovada.

## Execução
- Trabalhar em uma branch própria do repositório oficial, preservando a `main`.
- Consolidar o Hermes existente em um único componente compartilhado pelas três telas.
- Reaproveitar a folha atual de 144 quadros e os estados `running-left`, `running-right`, `idle` e `waiting`.
- Ativar direção, velocidade e inversão suave nas bordas em todas as telas.
- Criar áreas de segurança para ele não cobrir menus, botões, textos principais nem campos de uso.
- Manter “Esconder o Hermes”, respeitar redução de movimento e usar tamanho menor no celular.
- Preservar as reações do cockpit aos eventos sem duplicar a lógica visual.

## Prova
- Conferir entrada pública, entrada do cockpit e cockpit autenticado em computador e celular.
- Registrar uma captura de cada uma das três telas com o Hermes em posições diferentes.
- Validar que ele anda nos dois sentidos, para, retoma e inverte nas bordas sem saltos.
- Verificar erros visuais, carregamento dos quadros e mensagens do navegador antes de finalizar.

## Limite confirmado
A publicação atual ainda não expõe o cockpit nessas páginas; a prova final dependerá da prévia gerada pela branch oficial e de uma sessão administrativa válida para a terceira captura.
