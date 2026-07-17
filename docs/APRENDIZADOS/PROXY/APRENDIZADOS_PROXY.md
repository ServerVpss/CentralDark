> **OBSOLETO:** o proxy antigo foi removido. Use somente o Gateway CentralDark em `https://api.centralldark.com/v1` com `CENTRALDARK_GATEWAY_KEY`.\n\n# 🧠 Aprendizados: Conexão e Autenticação Proxy

### 🎯 Objetivo
Resolver o erro de autenticação (401 Unauthorized) e configurar o Cline com o proxy api.centralldark.com.

### 🛠️ O Diagnóstico
* **Identificação do Erro**: O uso do header Authorization: Bearer não era suportado pelo proxy; o sistema exige estritamente o header x-api-key.
* **Limpeza de Infra**: Identificamos "ratos" (chaves antigas/vazadas) no histórico do terminal (.bash_history) que estavam poluindo a configuração e causando testes falsos negativos.
* **Validação**: Criamos um script de stress test que provou que o servidor aceita a chave sk-lab-xl... quando os cabeçalhos corretos (x-api-key + anthropic-version) são aplicados.

### 🚀 A Solução Final
1. **Chave Válida**: A chave sk-lab-***[KEY-EXPOSTA-PRECISA-ROTACIONAR]*** foi validada.
2. **Configuração no Cline**:
    * **API Provider**: Anthropic
    * **Base URL**: https://api.centralldark.com
    * **API Key**: sk-lab-***[KEY-EXPOSTA-PRECISA-ROTACIONAR]***
    * **Model ID**: sonnet-4.6 (ou opus-4.8)
3. **Fluxo de Debug**: Estabelecemos o uso de scripts de auditoria que:
    * Não poluem a tela (Silent Mode).
    * Mascaram chaves para segurança.
    * Utilizam grep -rnI para evitar a leitura de binários.

---
### 📜 Manual de Operação Rápida
> 💡 Regra de Ouro: Se der erro de autenticação, rode o ./varredura_prod.sh antes de qualquer coisa para verificar a integridade da chave.
