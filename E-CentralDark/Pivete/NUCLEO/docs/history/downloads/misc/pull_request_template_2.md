# Pull Request — CentralDark

## Objetivo

Descreva em uma frase o que esta mudança resolve no repositório oficial `ServerVpss/CentralDark`.

## Capacidades da IA autora

Declare honestamente o que a IA que abriu ou escreveu este PR consegue interpretar.  
`UNKNOWN` é válido. O bot gera fallback em texto simples e pede suporte automaticamente quando necessário.

```yaml
AI_CAPABILITIES:
  mermaid: UNKNOWN
  canvas_html: UNKNOWN
  structured_yaml: UNKNOWN
```

## Artefato de aprendizado

O workflow `PR — artefato de aprendizado automático` deve gerar no mesmo HEAD:

- comentário Mermaid;
- fallback universal em texto;
- cartão YAML;
- Canvas HTML como artifact;
- receipt;
- pedido de suporte por labels quando alguma capacidade for `NAO` ou `UNKNOWN`.

O artefato organiza o contexto. Ele não aprova código, não autoriza merge e não substitui testes.

## Escopo

- [ ] Alteração limitada ao necessário.
- [ ] Não cria versões duplicadas `v1`, `v2` ou `v3`.
- [ ] Arquivos afetados foram listados.
- [ ] Áreas protegidas foram respeitadas.

## Arquivos sensíveis

- [ ] Não li, abri, copiei, editei ou usei como contexto arquivos sensíveis.
- [ ] Não há `.env`, token, cookie, sessão, chave privada, certificado ou credencial no diff.
- [ ] Valores sensíveis foram substituídos por placeholders seguros.

## Testes

Liste os testes realizados e seus resultados.

## Ações sensíveis

- [ ] Não houve deploy, migration, reinício de serviço ou alteração na VPS.
- [ ] Se houver ação sensível futura, ela aguarda autorização explícita do Pivete.
- [ ] Nenhuma ação destrutiva foi executada.

## Revisão

- [ ] Verifiquei comentários de agentes no PR antes do merge.
- [ ] Revisei o diff completo.
- [ ] Confirmei que os logs não expõem valores sensíveis.
- [ ] O handoff final informa arquivos, testes, riscos e próximo passo.

## Prova

Inclua commit SHA, resultado do pipeline e evidências relevantes.
