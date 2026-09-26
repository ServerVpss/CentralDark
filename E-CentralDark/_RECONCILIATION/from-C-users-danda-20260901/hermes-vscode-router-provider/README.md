# Hermes Router for Copilot

Esta extensão regista o router OpenAI-compatible do Hermes como um provider de
modelos do VS Code. Os modelos aparecem no seletor de modelos do Chat/Agent
quando o harness Local ou o Copilot Chat consulta providers externos.

## Configuração ativa detetada

- Endpoint predefinido: `http://127.0.0.1:8099/v1`
- Provider Hermes importado: `centraldark-router`
- Configuração: descoberta através de `hermes config path`
- Modelos: união de `/v1/models` com `providers.centraldark-router.models`

Não é necessário guardar uma chave para o router local. Se for necessária, a
extensão aceita a variável `CENTRALDARK_ROUTER_KEY` ou o comando **Hermes
Router: Set API Key**, que usa o Secret Storage encriptado do VS Code.

## Utilização

1. Recarrega a janela do VS Code (`Developer: Reload Window`).
2. Abre Chat e escolhe o harness **Local** ou o Chat com provider externo.
3. Abre o seletor de modelos e escolhe **Hermes Router**.
4. Para atualizar manualmente: `Ctrl+Shift+P` → `Hermes Router: Refresh Models`.

## Limitação importante

O endpoint só pode executar modelos que o router realmente publique e suporte.
Modelos presentes no `config.yaml` mas ausentes de `/v1/models` são mostrados
para permitir a configuração completa, mas podem responder com erro até o
backend/router os disponibilizar.