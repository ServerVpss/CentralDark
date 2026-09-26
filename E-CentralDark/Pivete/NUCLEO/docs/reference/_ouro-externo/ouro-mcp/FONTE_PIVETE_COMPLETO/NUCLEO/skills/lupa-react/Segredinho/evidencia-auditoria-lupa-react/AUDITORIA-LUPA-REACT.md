# Auditoria integral — Técnica da Lupa + `lupa-react`

Data: 19/07/2026  
Escopo: leitura integral, integridade, testes, probes adversariais, coerência
documental e checagem de fontes primárias.

## Veredito

```text
VEREDITO: BLOQUEAR como gate integral ou uso em produção.
USO CONDICIONADO: protótipo educacional e base para correção mínima.
RISCO: R2 isolado; R3 ao controlar agentes/ferramentas reais.
NOTA DIDÁTICA: 82/100.
NOTA COMO IMPLEMENTAÇÃO INTEGRAL DA LUPA: 56/100.
```

Os 11 e 22 testes declarados passam. Eles comprovam somente os cenários escritos
na suíte. Probes externos reproduzem falsos verdes que contradizem garantias mais
amplas do README.

## Fonte da verdade observada

- Técnica originalmente anexada: 1.426 linhas, SHA-256 `7eebe3ad...`;
- Técnica dentro dos dois pacotes: 1.506 linhas, SHA-256 `ab214504...`;
- diferença: 91 inserções e 11 remoções;
- código comum do pacote original preservado byte a byte no refatorado;
- código do pacote não está ligado a repositório/branch/PR/`HEAD_SHA` comprovado.

Logo, “Técnica original intocada” só é verdadeiro na comparação entre os dois
pacotes internos. Não é verdadeiro contra o arquivo original anexado usado nesta
auditoria.

## Evidência positiva

- pacote original: 11/11 testes e compilação aprovados;
- pacote refatorado: 22/22 testes e compilação aprovados;
- hashes originais declarados conferem;
- zero dependências externas de runtime;
- módulos originais foram preservados no pacote refatorado;
- números +34 pontos no ALFWorld e +10 no WebShop pertencem ao paper ReAct;
- fatos centrais do GDPval (44 ocupações, 9 setores, média de 14 anos, 220 tarefas
  abertas e melhora com raciocínio/contexto/scaffolding) foram confirmados.

## Achados

### A-001 — Crítico — ancoragem aprova contradição

`resposta_ancorada("sistema esta seguro", "sistema nao esta seguro")` retorna
`True`. O tokenizador ignora palavras com menos de quatro caracteres, incluindo
“não”. Sobreposição lexical não prova sustentação factual.

**Correção mínima:** representar afirmação, polaridade e evidência de forma
estruturada; adicionar teste explícito de contradição.

### A-002 — Alto — estado cruza missões

`historico` e `observacoes` não são reiniciados em `run()`. Ao reutilizar a
instância, uma segunda tarefa pode citar observação da primeira e ser aprovada.

**Correção mínima:** estado por missão ou reset explícito no início de `run()`.

### S-001 — Crítico — erro pode expor segredo

O texto de `Exception` é anexado integralmente à observação. Um Bearer fictício
foi devolvido sem redação. `seguranca_privada.py` é opcional e não está conectado
obrigatoriamente ao limite de erro do agente.

**Correção mínima:** sanitização obrigatória antes de qualquer observação, log ou
retorno externo; nunca confiar que cada ferramenta fará isso individualmente.

### S-002 — Alto — detectores possuem falsos negativos

O redator não reconheceu Bearer genérico e uma instrução reformulada não acionou
o detector de injeção. O módulo declara ser heurístico, mas o README usa linguagem
mais ampla do que a garantia real.

**Correção mínima:** alinhar documentação ao limite e ampliar testes de evasão.

### V-001 — Alto — `valor_gate` mede aparência

Uma entrega formatada, com texto suficiente e uma string de “evidência” não
verificada recebeu 96/100 e `PROFISSIONAL`. O código testa presença, palavras e
formatação; não autenticidade, correção nem valor econômico.

**Correção mínima:** exigir objetos de evidência verificáveis e não chamar o
resultado de padrão profissional sem julgamento especializado.

### I-001 — Alto — cadeia de hashes é recalculável

Todos os eventos foram alterados, os hashes recalculados e `verificar()` retornou
`True`. A cadeia detecta alteração ingênua, não adulteração por alguém capaz de
recalcular o arquivo.

**Correção mínima:** HMAC com chave fora do log, assinatura ou âncora externa
imutável.

### D-001 — Alto — hash documental incorreto

No pacote refatorado, `EVIDENCIAS.md` declara para si o hash antigo
`f2a85091...`; o arquivo real possui `edc815c9...`.

**Correção mínima:** manifesto externo que não inclua o próprio hash.

### D-002 — Médio — referências incompletas

A Técnica cita `REVISAO-TECNICA-DA-LUPA.md §28`, 64 testes e rollback, mas esse
arquivo não existe no pacote. Duas referências de frequência de hooks apontam
para 2.13 quando a regra correspondente está em 2.3.

### P-001 — Alto — fonte canônica ambígua

O arquivo externo contém documento “(1)” intitulado “v2” e dois ZIPs, original e
refatorado. Sem rótulo formal de snapshot histórico, há mais de uma fonte
candidata.

**Correção mínima:** manter somente o código canônico no Git; preservar versões
anteriores pelo histórico do próprio Git, não por arquivos concorrentes.

### G-001 — Bloqueio absoluto — ausência de `HEAD_SHA` do código

O commit `569e2a8...` registra um aprendizado, não o pacote completo. Testes e
hashes locais não estão ligados ao mesmo commit do código.

**Correção mínima:** aplicar `GIT-HEAD-SHA.md` no repositório canônico.

## Checagem de afirmações externas

- ReAct +34 ALFWorld/+10 WebShop: confirmado na fonte primária;
- GDPval e três alavancas: confirmado;
- `valor_gate` “igual à métrica GDPval”: incorreto; GDPval usa comparação cega
  por especialistas, enquanto o código usa pontuação heurística;
- Tree of Thoughts: NeurIPS 2023, não 2024;
- McKinsey entre os empregadores citados: não confirmado na fonte primária;
- números exatos de leaderboards 2026: não ficam provados apenas pelas URLs e
  agregadores listados no documento.

## Feynman

Em linguagem simples: o pacote hoje verifica se palavras da resposta também
aparecem numa observação. Isso não verifica se a resposta é verdadeira, se nega a
observação, se a evidência pertence à tarefa atual ou se a autorização veio da
pessoa certa.

## Próximo passo

Corrigir o pacote existente sem criar V2, adicionar os probes deste bundle à
suíte canônica, gerar manifesto final e commitá-lo junto com o código no mesmo
`HEAD_SHA`. Só então repetir a revisão.
