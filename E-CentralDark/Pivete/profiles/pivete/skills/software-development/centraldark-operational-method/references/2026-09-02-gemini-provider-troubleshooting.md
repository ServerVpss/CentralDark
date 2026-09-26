# Gemini Provider Troubleshooting — 2026-09-02

## Contexto da Sessão
Usuário reportou erro `Gemini HTTP 400 (INVALID_ARGUMENT): API key not valid` ao tentar usar `gemini-3.1-pro-preview` via provider Google AI Studio.

## Diagnóstico Realizado

### Estado dos Providers no Perfil `pivete`

| Provider | Status | Credencial | Observação |
|----------|--------|------------|------------|
| **NVIDIA NIM** | ✅ Ativo (sessão atual) | Model: `nvidia/nemotron-3-ultra-550b-a55b` | Funcionando sem key extra |
| **Nous Portal** | ✅ OAuth válido | `auth.json` → `credential_pool.nous[0]` | Expira 2026-08-30T09:49:23Z |
| **OpenRouter** | ⚠️ Exhausted (402) | `auth.json` → `credential_pool.openrouter[0]` | Sem créditos, precisa recarregar |
| **CentralDark Router** | ✅ Configurado | `config.yaml` → `centraldark-router` (local-no-auth) | `http://127.0.0.1:8099/v1` |
| **Google AI Studio (Gemini)** | ❌ Sem API key | **Ausente no ambiente e no auth.json** | Erro 400 INVALID_ARGUMENT |

### Onde Procurar GEMINI_API_KEY

1. **Variável de ambiente** → `env | grep -i gemini` → **ausente**
2. **auth.json do perfil** → `credential_pool` → **não existe entrada google/gemini**
3. **config.yaml** → `providers` / `fallback_model` → **não configurado**
4. **Secrets externos (Bitwarden/1Password)** → `hermes secrets` → não configurado
5. **Arquivos .env locais** → busca em `E:\CentralDark\Pivete` e `~` → **não encontrado**

### Comandos Úteis para Diagnóstico

```bash
# Ver providers configurados no Hermes
hermes model

# Ver fallback chain
hermes fallback list

# Ver secrets configurados
hermes secrets bitwarden status
hermes secrets onepassword status

# Ver auth.json do perfil atual
cat ~/.hermes/profiles/pivete/auth.json | jq '.credential_pool'

# Ver config.yaml ativo
cat ~/.hermes/config.yaml

# Testar key Gemini se existir
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
```

## Resolução Aplicada

**Não houve resolução final** — o usuário tem as seguintes opções (apresentadas como caminhos, não perguntas):

| Opção | Ação Necessária | Status |
|-------|-----------------|--------|
| **a) Nous Portal** | `hermes model` → escolher 1 | OAuth já válido, 300+ modelos |
| **b) CentralDark Router (local)** | Usar `provider: centraldark-router` no config | Já configurado, sem auth |
| **c) Adicionar GEMINI_API_KEY** | Colocar no ambiente ou `hermes secrets` | Requer key válida do Google AI Studio |
| **d) Recarregar OpenRouter** | Adicionar créditos em openrouter.ai | Key existe mas sem saldo |
| **e) Continuar NVIDIA NIM** | Nenhuma ação | Já é o modelo ativo |

## Lições para Próximas Sessões

1. **Sempre verificar `auth.json` do perfil ativo** antes de assumir que um provider está configurado — o Hermes armazena credenciais lá, não em `.env`
2. **`hermes model` mostra o provider ativo** — se estiver em OpenRouter mas sem créditos, falha silenciosamente até tentar usar
3. **Fallback providers não configurados** — `hermes fallback list` retorna vazio; configurar evita falha dura quando primary exaure
4. **Google AI Studio = provider nativo Gemini** — diferente de Vertex AI; precisa de `GEMINI_API_KEY` direta (formato `AIza...`)
5. **Erro 400 INVALID_ARGUMENT na Gemini API = key inválida/ausente** — não é rate limit, não é quota, é credencial

## Referências Rápidas

- Google AI Studio API Key: https://aistudio.google.com/apikey
- Hermes Fallback Providers: https://hermes-agent.nousresearch.com/docs/user-guide/features/fallback-providers
- Hermes Secrets (Bitwarden/1Password): https://hermes-agent.nousresearch.com/docs/user-guide/secrets/