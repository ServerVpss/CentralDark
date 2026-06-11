# Backup — Instalador CentralDark (Gold Master)

Esta pasta guarda a versão **oficial e intocada** do `install.sh` da raiz do repositório.
Serve como rede de segurança caso alguém (humano ou IA) sobrescreva o arquivo principal
por engano.

## Arquivos

- `install.sh.GOLD-MASTER` — cópia idêntica do `install.sh` aprovado e rodando em produção
  na VPS (`/root/Multizap/apps/clone-deck/install.sh`).
- `README.md` — este arquivo.

## Como verificar se o `install.sh` da raiz está íntegro

```bash
sha256sum install.sh docs/INSTALADOR/backup/install.sh.GOLD-MASTER
```

Se os dois hashes baterem, o instalador está saudável.
Se diferirem, alguém alterou o `install.sh` — comparar com `diff`:

```bash
diff -u docs/INSTALADOR/backup/install.sh.GOLD-MASTER install.sh
```

## Como restaurar a partir do backup

```bash
cp docs/INSTALADOR/backup/install.sh.GOLD-MASTER install.sh
chmod +x install.sh
git add install.sh
# commit normalmente
```

## Como atualizar o Gold Master (quando o instalador oficial mudar de verdade)

Só atualizar depois que a nova versão estiver **validada em produção** na VPS:

```bash
cp install.sh docs/INSTALADOR/backup/install.sh.GOLD-MASTER
sha256sum install.sh docs/INSTALADOR/backup/install.sh.GOLD-MASTER  # confirmar
```

Commit com mensagem clara: `chore(installer): atualiza Gold Master para vX.Y`.

## Regra de ouro

- **Nunca** sobrescrever o `install.sh` com um stub ou esqueleto.
- Funções novas vão em arquivos separados em `scripts/` (ex.:
  `scripts/setup-centraldark-portal.sh`) e o instalador principal só recebe
  uma chamada/link se realmente precisar integrar.
