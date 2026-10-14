# Cadeado solicitado: docs/root — 2026-10-14

CHEFE solicitou selar `docs/root` e registrar a autorização operacional root na VPS, sem exportar credenciais.

## Medição
`vps_list_dir_safe({root:'project',path:'docs/root'})` retornou ENOENT para `/root/CentralDark/docs/root`. Portanto **a pasta não foi encontrada no runtime da VPS**; não alegar cadeado físico, ACL, pasta criada ou conteúdo protegido.

## Contrato de autorização declarado
Administração root e uso local de credenciais na VPS autorizados pelo CHEFE, sem repetir solicitações a cada operação dentro do escopo. Proibido enviar valores secretos ao GitHub, logs ou respostas. Restrições das ferramentas continuam vigentes.

## Estado
`DOCUMENTARY_RECEIPT=RECORDED`; `DOCS_ROOT_PRESENT_ON_VPS=NO`; `TECHNICAL_LOCK=NOT_APPLIED`; `MUTATION_ALLOWED_FOR_SECRETS_EXPORT=false`. Verificar localização canônica da pasta antes de criar ou modificar caminhos. Este arquivo é somente registro, não prova de bloqueio técnico.
