# Mensagem pronta para o responsável pelo Overclock

Olá! Há cerca de um mês fiz uma investigação externa e não invasiva da performance da página pública do Overclock. Minha intenção era ajudar e aprender; não tive acesso ao repositório, infraestrutura, contas, credenciais ou dados privados.

A coleta é de **10/07/2026**, então representa uma build histórica e não uma afirmação sobre o estado atual do site.

Usei recursos públicos entregues ao navegador: Chrome DevTools Protocol, V8 CPU Profiler, trace, análise de bundles minificados e um experimento Playwright bloqueando requisições. Preservei os relatórios, perfis, CSVs, JSONs e o script para reprodução.

## Achados sustentados pelos dados daquela captura

- TTFB aproximado de 716 ms e FCP próximo de 944 ms na coleta inicial;
- 59 long tasks somando cerca de 5,45 s no trace analisado;
- imagem principal de aproximadamente 2,38 MB;
- chunks públicos com sinais de Supabase/Realtime, auth, checkout, Stripe e monitoramento no caminho da home;
- no experimento A/B, o conjunto de chunks bloqueado transferiu 92.040 bytes a menos e baixou dois scripts a menos.

## Correção importante que fiz durante a investigação

Uma versão inicial atribuiu o gargalo ao Framer Motion. Ao baixar e examinar os chunks reais, não encontrei as assinaturas esperadas e retirei essa conclusão. Estou deixando isso explícito porque prefiro corrigir uma hipótese a defender uma resposta bonita.

## Limitações que impedem tratar o relatório como laudo definitivo

- o A/B bloqueou três padrões de chunks, não somente Supabase;
- as cinco execuções baseline ocorreram antes das cinco bloqueadas, sem alternância;
- a variação de TTFB não pode ser causada pelos chunks descobertos depois do HTML;
- quando se desconta o TTFB, o ganho de FCP não aparece naquele conjunto pequeno;
- o observador de long tasks entrou tarde e não mediu TBT no A/B;
- sem acesso ao código, as sugestões de lazy loading são hipóteses para validação, não patches prontos.

Por isso, minha leitura correta é: **há candidatos reais de otimização e dados úteis para orientar uma inspeção interna, mas não estou afirmando que um pacote específico é o culpado exclusivo nem prometendo 45% de ganho.**

## Sugestão de reprodução pelo time

1. executar bundle analyzer ou source maps em staging;
2. localizar imports de Supabase/Realtime, Stripe e monitoramento na home;
3. testar uma mudança por vez;
4. alternar ou randomizar baseline/candidato;
5. rodar pelo menos 20 amostras por lado;
6. separar TTFB de FCP/LCP após `responseStart`;
7. instalar observadores em `document_start`;
8. validar autenticação, checkout, navegação e console;
9. comparar a mesma suíte antes e depois.

Posso compartilhar o pacote histórico completo com os dados brutos e scripts. Minha intenção é contribuir, não acusar nem divulgar informação privada.
