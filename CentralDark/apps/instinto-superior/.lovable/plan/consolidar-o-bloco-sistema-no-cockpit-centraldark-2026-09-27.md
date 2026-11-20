# Consolidar o bloco Sistema no Cockpit CentralDark

## Objetivo
Levar integralmente **Mega Painel**, **Hub Segurança**, **Cofre (ADM)** e **Status** para o Cockpit CentralDark existente, sem criar outro portal, cockpit ou sistema paralelo. O TelePainel só perde os quatro atalhos após as novas áreas funcionarem e serem comprovadas.

## Estado calibrado
- Fonte oficial: `ServerVpss/CentralDark@main` no SHA `d5cc45905a985259500b9ec468ac1d39d97397f7`.
- O Cockpit CentralDark atual já possui autenticação administrativa real e bloqueio para não administradores.
- Os quatro recursos ainda vivem na árvore do TelePainel e dependem de telas, leituras e controles próprios.
- Existem árvores antiga e consolidada no repositório oficial; a consolidada em `src/apps/modulos/telepainel/` será preservada como referência mais avançada.

## Execução
1. **Inventariar o conjunto completo**
   - Ler as quatro telas atuais e todas as dependências diretas: notificações, bots, rotas, contas, módulos, instalador, saúde, deploys, MCP e histórico.
   - Classificar cada capacidade como reutilizável, específica do TelePainel, dependente de fonte externa ou ainda sem prova.

2. **Integrar ao Cockpit existente**
   - Criar as quatro áreas dentro da Sala de Controle administrativa já existente.
   - Reaproveitar os controles e estados atuais da CentralDark; não duplicar autenticação, HUD, roteador, Hermes, consumo ou navegação.
   - Manter dados sem fonte verificável como `UNKNOWN` ou `AUTH_REQUIRED`, nunca como sucesso.

3. **Preservar segurança e acessos**
   - Manter `/sala-controle` protegido por papel administrativo validado no servidor.
   - Não expor contas, comandos, instaladores ou dados operacionais no cockpit público.
   - Ações materiais ficam bloqueadas quando não houver integração autorizada; nenhuma credencial será copiada.

4. **Provar antes de retirar**
   - Validar anônimo, usuário sem permissão e administrador.
   - Abrir e testar os quatro botões em computador e celular.
   - Rodar lint e build, conferir erros de execução e verificar que as telas existentes continuam funcionando.

5. **Convergir no repositório oficial**
   - Recomparar a `main` antes da escrita e aplicar apenas o menor delta no owner `public/central-dark-instinct-2/`.
   - Após a prova do novo Cockpit, remover somente os quatro itens do menu do TelePainel, preservando suas demais funções.
   - Registrar evidência, arquivos alterados, SHA final, pendências reais e ausência de segredos copiados.

## Resultado esperado
```text
Cockpit CentralDark administrativo
├── Mega Painel
├── Hub Segurança
├── Cofre (ADM)
└── Status

TelePainel
└── mantém apenas suas funções próprias
```

## Travas
- Sem publicação ou deploy sem ordem explícita.
- Sem remoção antecipada do TelePainel.
- Sem segunda arquitetura ou cópia funcional permanente.
- Se uma dependência externa não puder ser medida, a área permanece visível com estado real `UNKNOWN`/`AUTH_REQUIRED`.
