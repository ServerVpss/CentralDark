# Prova de Motor — Técnica de Demonstração

Quando for provar que um motor/script funciona, seguir esta técnica:

## Padrão

1. Criar cenário de teste (conflito artificial, bump fake, etc.)
2. Abrir PR de teste
3. Rodar motor contra o PR
4. Mostrar resultado (NO_CONFLICT / resolve / auto-merge)
5. Fechar PR e deletar branch

## Exemplo desta sessão (28/08)

```bash
# Criar branch com bump fake
git checkout -b test/dependabot-zod origin/main
sed -i 's/"zod": "[^"]*"/"zod": "^99.99.99"/' apps/modulos/Bolt/source/package.json
git add . && git commit -m "test: bump zod"
git push origin test/dependabot-zod

# Abrir PR
gh pr create --head test/dependabot-zod --base main --title "test: bump zod"

# Rodar motor (na VPS)
ssh Segredo-VPS "cd /root/CentralDark && bash scripts/dependabot/resolve-conflicts.sh <PR>"

# Verificar
gh pr view <PR> --json mergeable
```

## Cuidados

- **Limpar sempre**: fechar PR + deletar branch
- **Não sujar a Casa**: PRs de teste são演示 only
- **Ser honesto**: provar o que é provável agora, não o que não dá pra provar

## O que NÃO dá pra provar

- Gatilho automático (workflow `pull_request`) → precisa de PR real do ator esperado
- Actor check (`github.actor == 'dependabot[bot]'`) → não bypassa com PR fake
