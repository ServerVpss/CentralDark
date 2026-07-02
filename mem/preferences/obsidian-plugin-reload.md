---
name: Obsidian plugin exige reiniciar após instalação manual
description: Após copiar main.js/manifest.json novos no vault, o Obsidian precisa ser fechado e reaberto — disable/enable no painel não recarrega os bytes do disco de forma confiável.
type: preference
---
Quando o pivete instalar/atualizar o plugin CentralDark Grafo Vivo manualmente (zip), sempre lembrar: **fechar o Obsidian por completo e abrir de novo**. Só desativar e reativar o plugin no painel não basta — os arquivos novos não são relidos.

Isso vale só pra instalação manual. O auto-updater (v0.2.1+) já força reload internamente, então não precisa fechar nada quando a atualização vem pelo endpoint Supabase.

**Como aplicar:** ao entregar um zip de instalação manual, incluir no passo-a-passo "feche o Obsidian e abra de novo" — nunca só "reative o plugin".
