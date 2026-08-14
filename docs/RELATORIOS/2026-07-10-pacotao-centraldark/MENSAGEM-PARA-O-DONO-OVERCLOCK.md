# Mensagem pronta para o responsável pelo Overclock

> **HISTÓRICO / RASCUNHO HUMANO.** Este texto preserva a intenção comunicacional de 10/07/2026. Antes de qualquer envio futuro, revalidar fatos, custódia do pacote e estado atual do alvo.

Olá! Há cerca de um mês fiz uma investigação externa e não invasiva da performance da página pública do Overclock. Minha intenção era ajudar e aprender; não tive acesso ao repositório, infraestrutura, contas, credenciais ou dados privados.

A coleta é de **10/07/2026**, então representa uma build histórica e não uma afirmação sobre o estado atual do site.

Usei recursos públicos entregues ao navegador: Chrome DevTools Protocol, V8 CPU Profiler, trace, análise de bundles minificados e um experimento Playwright bloqueando requisições. O pacote histórico declarava relatórios, perfis, CSVs, JSONs e script de reprodução; os bytes do ZIP original precisam ser reencontrados para nova verificação de custódia.

## Achados sustentados pelo registro daquela captura

- TTFB aproximado de 716 ms e FCP próximo de 944 ms na coleta inicial;
- 59 long tasks somando cerca de 5,45 s no trace analisado;
- imagem principal de aproximadamente 2,38 MB;
- chunks públicos com sinais de Supabase/Realtime, auth, checkout, Stripe e monitoramento no caminho da home;
- no experimento A/B, o conjunto de chunks bloqueado transferiu 92.040 bytes a menos e baixou dois scripts a menos.

## Correção importante feita durante a investigação

Uma versão inicial atribuiu o gargalo ao Framer Motion. Ao baixar e examinar os chunks reais, não apareceram as assinaturas esperadas e essa conclusão foi retirada. O valor do registro está também nessa retratação: corrigir a hipótese quando a contraprova manda.

## Limitações

- o A/B bloqueou três padrões de chunks, não somente Supabase;
- as cinco execuções baseline ocorreram antes das cinco bloqueadas, sem alternância;
- a variação de TTFB não pode ser causada pelos chunks descobertos depois do HTML;
- quando se desconta o TTFB, o ganho de FCP não aparece naquele conjunto pequeno;
- o observador de long tasks entrou tarde e não mediu TBT no A/B;
- sem acesso ao código, sugestões de lazy loading eram hipóteses para validação, não patches prontos;
- o ZIP original não está hoje versionado neste diretório e precisa ser revalidado por tamanho + SHA se reaparecer.

Por isso, a leitura correta é: **há candidatos históricos de otimização e um método útil de investigação, mas não há base para transformar o snapshot em laudo atual ou promessa de ganho.**

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

Este arquivo não autoriza contato, envio, deploy ou ação externa automática.
