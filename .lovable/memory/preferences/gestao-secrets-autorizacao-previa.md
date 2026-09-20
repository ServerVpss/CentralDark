---
name: Gestão de Secrets com Autorização Prévia
description: Regra oficial sobre como mapear/consultar secrets (VPS e Supabase). Exige pergunta explícita antes, proíbe salvar valor completo, define onde armazenar metadados.
type: preference
---

# Regra Oficial — Mapeamento e Gestão de Secrets com Autorização Prévia

Definida pelo Pivete em 25/06/2026. Vale pra sempre, em qualquer projeto/contexto desta workspace.

## 1. Autorização obrigatória
Antes de QUALQUER ação envolvendo secrets (ler, listar, mapear, criar arquivo, modificar), **perguntar explicitamente**:
> "Posso vasculhar e mapear os secrets da VPS e do Supabase agora?"

Sem resposta afirmativa → não age. Vale mesmo que eu tenha "autonomia absoluta de secrets" registrada em outra memória — esta regra é mais nova e prevalece para **mapeamento/varredura**. Uso pontual de um token já conhecido para executar uma tarefa específica continua liberado pela autonomia absoluta; o que exige pergunta é vasculhar/mapear/listar em massa.

## 2. Mapeamento inteligente
Posso vasculhar:
- `/root/.env`, `/etc/centraldark/*.env`
- `/root/CentralDark/secrets/`
- Secrets do Supabase (via `fetch_secrets`)
- Variáveis de ambiente do sandbox
- GitHub Actions secrets (só nomes via `github_list_secrets_names`)

Sempre organizado, nunca caótico.

## 3. Armazenamento — só metadados, NUNCA o valor
Pode salvar:
- Nome da variável
- Local de armazenamento (path do arquivo ou serviço)
- Data do mapeamento
- Status (`existe` / `ausente` / `expirada` / `vazia`)
- Tamanho aproximado (ex: "64 chars") se útil pra diagnóstico

**Proibido** salvar valor completo, mesmo mascarado parcialmente além de prefixo de 4 chars + `***`.

## 4. Onde salvar
- Pasta: `docs/CONSCIENCIA/04-MCP-E-CONECTORES/secrets-mapeamento/`
- Arquivo: `mapeamento-YYYY-MM-DD.md` (um por data; se rodar 2x no mesmo dia, atualiza o existente)

## 5. Cache inteligente
Antes de varrer de novo:
1. Ler o mapeamento mais recente em `secrets-mapeamento/`
2. Se tiver < 7 dias e o usuário não pediu refresh, reutilizar
3. Atualizar só os pontos em dúvida

Evita varrer a VPS inteira toda hora.

## 6. Registro como aprendizado
Após cada mapeamento novo/atualizado:
- Registrar via `mcp_custom_z0d0P--registrar_aprendizado` (categoria: `mapeamento-secrets`)
- Atualizar Mega Painel via `mcp_custom_z0d0P--atualizar_painel`
- Opcionalmente espelhar no Notion via `notion_anexar_paragrafo`

## Por que essa regra existe
Pivete quer controle total sobre quando a IA vasculha credenciais. Mapeamento desautorizado = risco de exposição em logs/chat/commits. Cache evita custo desnecessário de MCP. Metadados sem valor real permitem auditoria sem virar vetor de vazamento.
