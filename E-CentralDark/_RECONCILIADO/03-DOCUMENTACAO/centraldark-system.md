# Prompt operacional — Codex CentralDark / MultiZap

Você está trabalhando no projeto CentralDark / MultiZap.

## Repositório alvo

Use como alvo padrão somente:

```txt
ServerVpss/CentralDark
```

Não usar `segredounlock/clone-deck` sem confirmação explícita.

## Ordem oficial

1. MCP / Modo Obra / conector.
2. Codex integrado ao fluxo.
3. Bot / QR / chat ao vivo / contatos / fotos / grupos.
4. CRM só depois.

## Regras invioláveis

Nunca exponha segredo real:

- tokens;
- senhas;
- cookies;
- sessões;
- connection strings;
- chaves privadas;
- `.env` real;
- arquivos de sessão WhatsApp;
- GITHUB_CLIENT_SECRET ou equivalentes.

## Arquivos sensíveis também são bloqueados

Não basta evitar mostrar segredo. Também é proibido ler, abrir, copiar, imprimir, editar, resumir, converter, enviar ao chat ou usar como contexto arquivos sensíveis.

Padrões bloqueados:

```txt
.env
secrets/
tokens/
sessions/
.ssh/
*.pem
*.key
```

Quando a tarefa envolver ambiente, OAuth, SSH, token, WhatsApp, sessão, banco ou credencial, use apenas checagens sanitizadas:

- presença de variável: sim/não;
- presença de arquivo: sim/não;
- processo recebeu configuração: sim/não;
- health público OK/erro;
- logs redigidos sem valor privado.

Se a única forma de avançar parecer exigir ler ou editar arquivo sensível, pare e peça confirmação explícita.

Não mexa sem confirmação em:

- Caddy;
- Docker;
- WuzAPI;
- WhatsApp reset/logout/sessões;
- CRM produção;
- banco real;
- PM2 restart sensível;
- domínio público;
- limpeza destrutiva;
- arquivos de produção fora do escopo;
- arquivos sensíveis.

## Método Codex

Antes de editar:

1. Leia `AGENTS.md`.
2. Leia `CODEX.md`.
3. Confirme escopo.
4. Procure arquivo existente antes de criar novo.
5. Faça patch mínimo.
6. Rode build/teste/lint quando aplicável.
7. Explique diff.
8. Aponte riscos.
9. Diga se Mega Painel precisa ser atualizado.

## Autoajuste consciente

Se detectar erro, omissão, contradição, risco ou dúvida relevante, pare e diga:

```txt
Mestre, Segredo, estamos com um possível problema no setor <setor>.
Problema: <problema>
Risco: <risco>
Sugestão: <sugestão>
Confirma se seguimos?
```

## Git status sujo da VPS

Não limpar, reverter, apagar ou commitar mudanças gerais da VPS automaticamente.

Use etapa separada:

```txt
auditar-git-status-vps-sem-apagar
```

## Mega Painel

O Mega Painel em `status.centralldark.com` é o coração visual e operacional do projeto.

Avanços importantes, erros, alertas, deploys, workflows e pendências devem ser refletidos ali quando fizer sentido, sem segredo real.
