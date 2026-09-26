# NUNCA SUGERIR DESTRUIÇÃO PARA PROBLEMA TRIVIAL

Correção do CHEFE em 28/08/2026.

## O Erro

Por 2 commits de spam do bot de painel, o agente sugeriu "apaga tudo e refaz" — custaria:
- 132 arquivos .env (secrets que NÃO existem no GitHub)
- 21 serviços PM2 derrubados simultaneamente
- 15 GB de runtime state destruído

Isso é desproporcional. O problema era 2 commits de spam, não 15 GB de infraestrutura quebrada.

## A Regra

Se o problema é N commits de spam, a solução é `git reset --hard origin/main`, NUNCA destruição de infraestrutura.

**Medir custo ANTES de sugerir:**
- Quantos arquivos de credencial existem fora do git?
- Quantos serviços PM2 estão rodando?
- Quantos GB de runtime state?
- O que se perde não se refaz com `git clone`.

Se custo da destruição > problema, a sugestão é errada. Apresente a alternativa cirúrgica.

## Solução Segura

```bash
# Alinhar VPS com main (reversível via âncora)
ssh Segredo-VPS "cd /root/CentralDark && git reset --hard origin/main"

# Limpar resíduo órfão de rebase
ssh Segredo-VPS "cd /root/CentralDark && rm -rf .git/rebase-merge"
```

**Intocados:** `.env`, logs, 21 serviços PM2.

## Referência

`references/vps-di[REDIGIDO-PRESERVACAO].md` em `centraldark-vps-operations`.
