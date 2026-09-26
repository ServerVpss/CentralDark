# NÚCLEO — Hermes / Amigo em Casa

Pasta local e pessoal do experimento **Rather Very Intelligent System**: um amigo-assistente em casa, com memória persistente, voz opcional, módulos especializados e evolução controlada pelo Pivete.

> **Não é site. Não é VPS. Não depende de GitHub. Não executa ações destrutivas.**

## Casa prevista

```text
E:\CentralDark\Pivete\NUCLEO\
```

O nome `CentralDark` aqui é apenas a pasta-base local escolhida. Este pacote é independente de monorepo, produção e infraestrutura remota.

## Começo seguro

1. Extraia este ZIP em `E:\CentralDark\Pivete\`.
2. A pasta resultante pode ser renomeada para `NUCLEO`.
3. Abra o PowerShell dentro dela.
4. Execute:

```powershell
python scripts\validar_pacote.py
python -m unittest discover -s tests -v
python -m hermes.main
```

Para falar a resposta usando a voz nativa do Windows:

```powershell
python -m hermes.main --voz
```

Para testar uma frase sem abrir conversa contínua:

```powershell
python -m hermes.main --uma-vez "lembre que meu projeto pessoal se chama Hermes"
python -m hermes.main --uma-vez "o que você lembra de mim?"
```

## O que já funciona neste pacote

- terminal local;
- memória persistente em SQLite;
- lembrança explícita com `lembre que ...`;
- recuperação simples de memórias;
- triagem de intenção;
- seleção limitada de especialistas;
- execução paralela local dos especialistas selecionados;
- síntese de resposta;
- bloqueio de pedidos destrutivos;
- feedback explícito com `/feedback bom` ou `/feedback ruim`;
- ajuste limitado de confiança dos especialistas;
- log de auditoria sanitizado;
- som curto de inicialização;
- voz de saída no Windows, sem biblioteca externa;
- testes automatizados e validação do pacote.

## O que não está fingindo estar pronto

- inteligência geral ou consciência real;
- milhares de agentes em execução;
- aprendizado autônomo de código;
- microfone contínuo;
- controle de luz, portão, câmera ou sistema operacional;
- conexão com Grok, OpenRouter ou qualquer API externa;
- vetorização/RAG semântico;
- Docker, celular ou ponte remota.

Esses itens estão organizados no plano por fases e só devem entrar quando a fase anterior estiver comprovada.

## Arquivos principais

| Arquivo | Função |
|---|---|
| `01-VISAO-AMIGO-CASA-E-ORIGEM.md` | Visão original preservada |
| `SKILL.md` | Técnica da Lupa canônica e obrigatória |
| `docs/00-COMECE-AQUI.md` | Guia leigo e operacional |
| `docs/02-ARQUITETURA-VALIDADA.md` | Arquitetura corrigida pela Lupa |
| `docs/03-PLANO-IDEAL-POR-FASES.md` | Ordem segura de evolução |
| `docs/07-REVISAO-TECNICA-DA-LUPA.md` | Dupla revisão aplicada ao próprio pacote |
| `hermes/main.py` | Entrada do runtime local |
| `scripts/validar_pacote.py` | Verificação de estrutura, JSON, código e manifestos |
| `tests/` | Provas automatizadas do MVP |

## Regra local

Ler antes de alterar. Preservar o que funciona. Corrigir o mínimo. Provar. Registrar somente o aprendizado útil. Nenhuma ação externa ou destrutiva sem autorização explícita.
