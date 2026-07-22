# Trocar skill `tecnica-da-lupa` pela MetaLupa Bayesiana

## Objetivo
Sobrescrever o conteúdo da skill ativa `tecnica-da-lupa` com o texto integral do arquivo `METALUPA-BAYESIANA-CANONICA.md` que o Pivete forneceu. Mesmo nome canônico, sem paralelo, sem duplicata.

## Regra de Ouro respeitada
Evolução do artefato existente. Nenhuma skill nova, nenhuma pasta `v2`, nenhuma cópia lateral.

## Passos
1. Criar draft em `.agents/skills/tecnica-da-lupa/SKILL.md` com:
   - Frontmatter mantendo `name: tecnica-da-lupa` (nome canônico ativo hoje, evita quebrar referências espalhadas).
   - Description atualizada refletindo MetaLupa Bayesiana (Bayes + entropia + VOI + mapa único + consolidação + AutoLupa).
   - Corpo = conteúdo integral das 274 linhas do arquivo `METALUPA-BAYESIANA-CANONICA.md` fornecido, preservado sem edição de conteúdo.
2. Aplicar o draft via `skills--apply_draft` apontando para `.agents/skills/tecnica-da-lupa`. Isso substitui a skill ativa no lugar.
3. Confirmar ao Pivete que a skill foi atualizada com o mesmo nome.

## Detalhes técnicos
- Nome mantido: `tecnica-da-lupa` (não renomeio pra `lupa-bayesiana` pra não quebrar referências no CLAUDE.md, workspace-knowledge, e histórico de conversas).
- O arquivo canônico declara `name: lupa-bayesiana` internamente — vou ajustar essa linha do frontmatter pra `tecnica-da-lupa` mantendo TODO o resto do conteúdo (princípios, gates, fluxo, saída obrigatória, recursos) intacto.
- Não vou criar `references/` nem `scripts/` mencionados no final do arquivo (Recursos) porque esses arquivos não me foram fornecidos — deixo a menção no texto mas sem materializar arquivos inexistentes.

## Rollback
Skill anterior fica no histórico do workspace; se der ruim, aplico draft com a versão antiga.

## Fora de escopo
Sem mexer em código do app, sem tocar em `mem://`, sem PR, sem VPS, sem Supabase.
