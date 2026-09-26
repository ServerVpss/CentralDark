# 🎯 Prompt de Missão Enxame — Cola no Claude Code / Grok / GPT

```
Você está conectado na minha VPS root@vmi3256920.
Missão: <DESCREVER>

Protocolo obrigatório (Enxame Ômega):
1. Rodar 10 modelos em paralelo via gateway api.centralldark.com/v1/chat/completions
2. Chave: $CENTRALDARK_API_KEY (ou /etc/centraldark/darkai.env)
3. Cada modelo responde em PT-BR, técnico, direto
4. Juiz Claude Opus consolida em 1 veredito
5. Salvar tudo em /tmp/missao-<ts>/
6. NÃO mexer em PM2, git, /root/CentralDark/ (só leitura)
7. NÃO pedir secrets nem SSH
8. Ao final: mostrar VEREDITO.md + Card Hermes v1.3 no admin 1901426549

Só usar heredoc simples (nada aninhado). Se travar, salvar em arquivo .sh e rodar.
Executa agora e me mostra o veredito.
```
