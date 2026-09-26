# Padrão: imagem referenciada não disponível no disco

Trigger: na sessão, o CHEFE refere `image_N.jpg` (ou outro arquivo de imagem) como base do diagnóstico, mas o arquivo não existe no caminho esperado nem nos caminhos alternativos de busca.

## O que NÃO fazer

- **Não inventar** o conteúdo da imagem a partir do relato.
- **Não declarar** diagnóstico que dependeria da imagem como se a imagem fosse lida.
- **Não repetir** `vision_analyze` no mesmo caminho que já falhou sem antes confirmar onde o arquivo tá.
- **Não travar** a sessão perguntando "onde tá a imagem?" como primeiro movimento — cruzar com o chão primeiro.

## O que fazer

1. Medir o que está no chão que é *independente* da imagem: processos, arquivos de estado, portas, logs, arquivos de configuração que a imagem mencionou.
2. Cruzar o relato do CHEFE com o que fora medido. Se o relato bater com evidência local, tratar como relato + evidência local, sem a imagem.
3. Se o fluxo puder prosseguir sem a imagem, prosseguir — não parar por falta dela.
4. Se a imagem for *essencial* (não há como decidir sem ela), dizer onde ela não tá e pedir o path ou a entrega, de forma direta. Uma pergunta, não um texto.

## Por que isso é um padrão e não um erro de ferramenta

- `vision_analyze` reportando *media file not found* é a ferramenta dizendo "esse arquivo não tá aqui". É um fato, não uma falha do modelo.
- Imagem que não tá no disco não é *prova*. Relato + evidência cruzada é o que resta.
- Este padrão não deve produzir um skill de "imagem quebrada"; deve produzir disciplina de **não depender de uma prova que não existe**.

## Quandos registrar no SOUL/nota

- Se a mesma imagem reaparecer em sessões futuras e sempre não estiver no disco, registrar o path exato que o CHEFE entrega (se der) e o que foi decidido sem ela.
- Não registrar "imagem sempre unavailable" como regra — registrar o fato concreto de sessão, se houver.

## Exemplo do que foi feito nesta sessão

- Referência: `image_2.jpg` com diagnóstico de RAM 88%, Chrome 44 instâncias, VS Code 21, Node 1.4 GB, uptime 1d22h.
- Medido independente: `omni_router_state.json` (PID 26476, health_checks:5, proved:true), portas Hermes 8787 respondendo (`/api/health` OK, `/api/status` Hermes 0.20.0).
- Imagem não localizada em `E:\CentralDark\Pivete\images\`, `TEMP`, nem no clone CentralDark.
- Resultado: fretei para o CHEFE com três opções (A: entregar a imagem / B: autorização sem imagem / C: varredura de processos).
- Sem fabricar o diagnóstico da imagem.
