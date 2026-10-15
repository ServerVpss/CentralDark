# Cadeado solicitado: docs/root — 2026-10-14

CHEFE solicitou selar `docs/root` e registrar a autorização operacional root na VPS, sem exportar credenciais.

## Medição
`vps_list_dir_safe({root:'project',path:'docs/root'})` retornou ENOENT para `/root/CentralDark/docs/root`. Portanto **a pasta não foi encontrada no runtime da VPS**; não alegar cadeado físico, ACL, pasta criada ou conteúdo protegido.

## Contrato de autorização declarado
Administração root e uso local de credenciais na VPS autorizados pelo CHEFE, sem repetir solicitações a cada operação dentro do escopo. Proibido enviar valores secretos ao GitHub, logs ou respostas. Restrições das ferramentas continuam vigentes.

## Estado
`DOCUMENTARY_RECEIPT=RECORDED`; `DOCS_ROOT_PRESENT_ON_VPS=NO`; `TECHNICAL_LOCK=NOT_APPLIED`; `MUTATION_ALLOWED_FOR_SECRETS_EXPORT=false`. Verificar localização canônica da pasta antes de criar ou modificar caminhos. Este arquivo é somente registro, não prova de bloqueio técnico.


## Correção canônica do CHEFE — 15/10/2026

**IMPORTANTE:** o objeto do HUD mencionado posteriormente pelo CHEFE é **`docs/HUD/HUD.html`**, NÃO `docs/root`, `docs/root.html` ou `root.html`. Esta seção corrige a desambiguação do caminho sem apagar o recibo histórico anterior, que se refere a outra solicitação e permanece válido somente como histórico de ausência daquela pasta.

**Leitura confirmada na `main`:** `docs/HUD/HUD.html` (~4.030 linhas), com `#cadeados-count`, manifesto `ENTROU_TEM_QUE_SELAR` e `#cd-genesis-replay`. Gênesis percorre a cadeia documental com `L000`, replay, passo, pausa e reset; `169 elos` não são contador de novos selos. Há ponte da seleção UID para o Hermes Gateway com confirmação de tarefa distinta da prova de execução. `MAIN_SOURCE_PRESENT != COCKPIT_MIGRATED`.

**Destino declarado:** migrar **todas as capacidades** para o **zone existente** do Instinto Superior; preservar identidade, histórico, dados e receipts; evitar outro cockpit, outros cartões/cadeados redundantes ou runtime concorrente. `docs/HUD/HUD.html` pode permanecer como manifesto/template/histórico, não como segunda implementação a manter indefinidamente. O owner ativo do cockpit deve mapear componente por componente, validar paridade e somente depois decidir por remoção de código duplicado.

**NEXT_CURSOR:** censo integral HTML/JS/CSS → correspondência com componentes/rotas existentes do Instinto Superior → testes de paridade dos selos, Gênesis, Hermes tipado, fallback sem IA e estado persistido → readback de UI real → recibo de migração. **Não há autorização implícita para substituir o checkout local sujo do cockpit.**
