# Arsenal máximo — painel, mídia e Hermes em movimento

## Classificação antes da escrita

- **PROVADO:** o site e o pacote usam a mesma folha administrativa com 9 ações, 16 quadros por ação, 144 quadros totais e 60 fps. O ZIP está íntegro e o hash da folha confere.
- **IMPLEMENTÁVEL AGORA:** painel de pele/ação/quadro, reprodução ao vivo, passeio controlável dentro do site, GIF completo e versão compacta para celular.
- **BLOQUEADO NO WINDOWS:** a folha contém corrida para os dois lados, mas o pacote não contém o motor que move a janela pela área de trabalho. Não vou declarar isso pronto sem o aplicativo Desktop real.
- **HABILIDADES:** nenhuma habilidade ativa foi encontrada neste espaço. A análise foi dividida deliberadamente entre três especialistas: estado real, mídia e experiência do painel.

## O que será construído

### 1. Painel do Hermes no site

Criar um painel único na seção atual, sem página ou sistema paralelo:
- estado visual: Instinto Superior administrativo, Forja, Celestial ou Ascensão;
- ação: as nove ações reconhecidas;
- quadro: controle de 1 até 16 no administrativo e até o limite real de cada pele antiga;
- reproduzir/pausar;
- prévia ao vivo usando a mesma folha do site e do pacote;
- controles acessíveis e versão compacta na parte inferior do celular.

O estado administrativo continuará separado da “Memória das Três Peles”; escolhê-lo no painel não apagará a pele antiga salva.

### 2. Hermes flutuante controlável no site

O Hermes flutuante passará a obedecer ao painel:
- ação escolhida ou modo automático;
- direção esquerda/direita;
- velocidade controlável;
- caminhada dentro dos limites visíveis da página, invertendo a direção nas bordas;
- modo parado mantém a flutuação atual;
- “reduzir movimento” mantém uma pose estável.

### 3. GIF familiar com os 144 quadros

Gerar um GIF transparente que percorra as nove ações em ordem e use cada um dos 144 quadros uma vez por ciclo. Validar:
- quantidade real de quadros;
- ordem das nove ações;
- transparência;
- ausência de cortes;
- inspeção visual de começo, meio e fim.

### 4. Hermes compacto para celular

Gerar uma folha e uma animação WebP em 96 × 104 por quadro, mantendo os 144 quadros e a suavidade. O site carregará essa versão apenas em telas pequenas, reduzindo memória e transferência sem mudar o desenho.

Meta: até 500 KB quando a qualidade visual permitir. Se passar disso, o relatório mostrará o tamanho real em vez de esconder a diferença.

### 5. Pacote atualizado, sem promessa falsa

Substituir a folha pelo material de 144 quadros já validado e acrescentar:
- GIF completo;
- versão compacta para celular;
- manifesto e relatório com dimensões, quadros, fps, tamanho e hashes;
- instalador com backup preservado.

O pacote continuará marcando o deslocamento da janela do Windows como **BLOQUEADO** até o motor Hermes Desktop ser fornecido ou localizado. Direção e velocidade funcionarão no site; não será criado um segundo aplicativo para fingir essa capacidade.

## Validação final

- conferir cada ação sem pulo abrupto entre os 16 quadros;
- testar pele, ação, quadro, pausa, direção e velocidade no computador e no celular;
- provar que o flutuante não sai da tela nem cobre os controles;
- conferir GIF e WebP quadro a quadro;
- validar o ZIP e o site sem erros.
