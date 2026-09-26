# Computer Use: terminal único

## Finalidade

Enviar uma missão completa ao Hermes pelo terminal visível sem operar outras superfícies.

## Descoberta

- Resolver a janela pelo título atual.
- Falhar se nenhuma janela ou mais de uma janela corresponder.
- Obter o retângulo real da janela antes de calcular qualquer clique.
- Tratar PID, posição e tamanho como dados efêmeros.
- Preferir a árvore de acessibilidade do Screenpipe para contar abas, sem captura de tela.
- Contar cada `TabItem` real; botões de fechar, arquivos e processos filhos não contam.

## Ação

- Focar a aba `MINGW64`.
- Focar o prompt do terminal.
- Colar o texto integral.
- Pressionar Enter uma vez.

## Contraprova

O recibo do automatizador prova somente foco, coordenadas e quantidade de caracteres enviados. O envio ao Hermes só passa quando a releitura do terminal mostra:

- o cabeçalho do prompt;
- o restante do texto recebido ou indicação de texto colado;
- mudança do terminal para estado de execução.

Sem esses sinais, classificar como `UNKNOWN`.

## Ancoragem de sessão

Na rodada, `T1..TN` identifica abas acionáveis e `S1..SN` identifica sessões raiz. A relação entre eles é temporária e só deve ser considerada confirmada quando a aba e o PID forem observados no mesmo estado.
