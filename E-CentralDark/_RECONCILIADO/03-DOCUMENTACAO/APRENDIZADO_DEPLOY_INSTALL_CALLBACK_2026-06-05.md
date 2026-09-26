# Aprendizado — Deploy Install-Callback validado

Data: 2026-06-05

## Status final confirmado

Cadeia inteira validada pelo usuário:

```txt
ServerVpss/clone-deck
-> Sync to segredounlock
-> segredounlock/clone-deck
-> deploy/fallback
-> VPS
-> PM2 Install-Callback
-> install.centralldark.com
```

Resultado:

- SSH funcionando em sandbox/GitHub Actions para entrar na VPS.
- `git pull` trazendo código novo para a VPS.
- HEAD validado na VPS: `3e7fb091 Adicionou intro de voz e countdown`.
- PM2 `Install-Callback` online na porta `9200`.
- `/voice/intro.mp3` servindo aproximadamente 360 KB.
- `/voice/success.mp3` servindo aproximadamente 235 KB.
- `/connect/<sid>` entregando a tela nova com:
  - modal de áudio;
  - botão `Aguarda 10s…`;
  - áudio de intro;
  - indicador `🎙️` da assistente.

## Falhas encontradas e correções

### 1. PM2 apontava para start inexistente

Sintoma:

```txt
Install-Callback subia como errored porque o PM2 apontava para um start.sh inexistente.
```

Correção aplicada:

```txt
Criado wrapper de start para o Install-Callback.
```

Regra nova:

```txt
Antes de culpar código Node, verificar se o PM2 está apontando para script existente.
```

### 2. Git remote da VPS estava quebrado

Sintoma:

```txt
ssh: Could not resolve hostname github-clone-deck-write
fatal: Could not read from remote repository.
```

Causa:

```txt
`origin` da VPS apontava para alias SSH `github-clone-deck-write`, mas a VPS não tinha `/root/.ssh` nem configuração desse host.
```

Correção aplicada:

```txt
Trocar remote para HTTPS+PAT apontando para o repo real do Lovable: ServerVpss/clone-deck.
```

Regra nova:

```txt
Na VPS, o remote do clone-deck deve apontar para o repo real de edição (`ServerVpss/clone-deck`), não para alias SSH quebrado nem para o espelho quando a origem oficial for ServerVpss.
```

### 3. Secrets SSH faltavam no repo origem

Sintoma:

```txt
Deploy/fallback não conseguia entrar na VPS ou caía em Permission denied.
```

Correção aplicada:

```txt
Os 3 secrets de SSH foram configurados também em ServerVpss/clone-deck para o Deploy fallback funcionar.
```

Regra nova:

```txt
Quando o fluxo muda para ServerVpss/clone-deck como origem, os secrets necessários aos workflows também precisam existir no ServerVpss/clone-deck.
```

## Regra operacional consolidada

Para próximas validações de deploy do Install-Callback:

1. Confirmar que o commit existe em `ServerVpss/clone-deck`.
2. Confirmar sync para `segredounlock/clone-deck` quando aplicável.
3. Confirmar que a VPS está no HEAD esperado.
4. Confirmar PM2 `Install-Callback` online.
5. Confirmar porta `9200` local/atrás do Caddy.
6. Validar:
   - `/health`
   - `/connect/<sid>`
   - `/voice/intro.mp3`
   - `/voice/success.mp3`
7. Se PM2 estiver `errored`, verificar primeiro o caminho do script/start wrapper.
8. Se `git pull` falhar com `github-clone-deck-write`, verificar remote da VPS e não assumir problema no código.

## Não expor

- Nunca registrar PAT real.
- Nunca registrar chave SSH privada.
- Nunca registrar secrets reais.
- Logs e relatórios devem mascarar tokens, senhas e chaves.
