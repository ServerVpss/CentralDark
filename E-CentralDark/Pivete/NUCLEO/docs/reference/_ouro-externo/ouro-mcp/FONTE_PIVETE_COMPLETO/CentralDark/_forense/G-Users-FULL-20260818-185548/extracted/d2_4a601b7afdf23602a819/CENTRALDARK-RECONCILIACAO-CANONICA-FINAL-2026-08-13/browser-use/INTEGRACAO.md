# Integração Browser-Use no CentralDark

## O que é

[browser-use](https://github.com/browser-use/browser-use) — biblioteca open-source que permite a um agente de IA controlar um navegador real (Playwright/Chromium).

## Por que entra no pacote

Permite visualizar:
- Agente local trabalhando
- Agentes conversando entre si
- Tarefas web sendo executadas com transparência

## Instalação (referência — não executada aqui)

```bash
pip install uv
uv venv --python 3.12
source .venv/bin/activate
uv pip install browser-use
uvx browser-use install
```

## Exemplo mínimo (Python)

```python
import asyncio
from browser_use import Agent, ChatBrowserUse
from dotenv import load_dotenv

load_dotenv()

async def main():
    llm = ChatBrowserUse()
    task = "Abra a página e descreva o que vê"
    agent = Agent(task=task, llm=llm)
    await agent.run()

if __name__ == "__main__":
    asyncio.run(main())
```

## Posição na cadeia Zero Trust

```
ESPECIFICAÇÃO (usuário)
      ↓
VALIDAÇÃO ZT
      ↓
AGENTE (browser-use) ← executa apenas o que foi especificado
      ↓
VALIDAÇÃO DE SAÍDA
      ↓
REGISTRO NO LEDGER / MEMÓRIA
```

O browser-use **não** autoriza a si mesmo.  
Toda ação de browser passa pela cadeia Zero Trust + contrato de memória.
