# Aplicativo MultiZap — Android, iPhone e Desktop

Documento único sobre como o MultiZap é entregue como aplicativo instalável
e como gerar o APK Android no futuro.

## Resumo (em linguagem simples)

| Plataforma | Como o cliente instala hoje | Status |
|---|---|---|
| **Android** | Pelo Chrome → menu → "Instalar app" ou "Adicionar à Tela Inicial". Se o master publicar um APK, aparece também botão "Baixar APK" direto. | ✅ Pronto |
| **iPhone / iPad** | Pelo Safari → Compartilhar → "Adicionar à Tela de Início". O empty state do chat mostra o passo-a-passo. | ✅ Pronto |
| **Desktop (Windows/macOS/Linux)** | Pelo Chrome ou Edge → ícone de instalar na barra de endereço. Abre em janela própria. | ✅ Pronto |

## O que já existia antes desta entrega

- `public/manifest.webmanifest` básico (nome MultiZap, verde/dark, standalone).
- Meta tags iOS/PWA no `src/routes/__root.tsx`.
- Componente `src/components/install-app-banner.tsx` (banner flutuante de instalação dentro do `/app`).
- `OneSignalSDKWorker.js` (apenas para push notifications, não cacheia o app).
- Campos `android_apk_download_url` e `android_apk_version` no `master_settings`.
- RPC pública `get_android_apk_info` para ler o link do APK.

## O que foi criado/melhorado nesta entrega

### 1. Ícones reais profissionais
Geramos um ícone verde MultiZap (M dentro de balão de chat) em todos os tamanhos:
- `public/icons/icon-192.png` (Android home)
- `public/icons/icon-512.png` (splash/store)
- `public/icons/icon-maskable-512.png` (formato adaptativo Android)
- `public/icons/apple-touch-icon.png` (180×180, iPhone)
- `public/icons/favicon-32.png` (aba do navegador)
- `public/icons/icon-source.png` (1024×1024, fonte original — substitua aqui pra trocar todos)

Pra trocar pelo logo definitivo:
1. Sobe o novo PNG quadrado 1024×1024 em `public/icons/icon-source.png`.
2. Regera as variantes com qualquer ferramenta de redimensionar (ou pede pra IA refazer).

### 2. Manifest PWA profissional (`public/manifest.webmanifest`)
- Nome longo, descrição, idioma `pt-BR`, categorias.
- `id` e `start_url` = `/app`, scope global.
- Ícones múltiplos + `maskable` (essencial pra Android moderno).
- 3 `shortcuts` (atalhos do app): Inbox, Canais, Contatos.
- `display_override` com `window-controls-overlay` (visual premium no desktop).

### 3. Meta tags no `__root.tsx`
- `apple-touch-icon` agora aponta pros ícones reais.
- Adicionado `application-name`, `mobile-web-app-capable`, `color-scheme`,
  `format-detection`.
- iOS já reconhece e mostra o ícone certo ao adicionar à Tela de Início.

### 4. Painel master `/admin/sistema/apps`
Nova rota. Apenas super_admin acessa (o guard global do `/admin` já cuida).

Funcionalidades:
- Status visual das 4 plataformas (PWA, Android, iPhone, Desktop).
- Editor de **link do APK** e **versão** — salva em `master_settings`, com
  validação (HTTPS obrigatório, versão alfanumérica).
- **Data de publicação** registrada automaticamente toda vez que o link/versão muda.
- Botão "Copiar link" + "Abrir link".
- Botão "Verificar manifest e ícones" — testa em tempo real no navegador
  se tudo carrega corretamente.
- Toda alteração loga em `audit_log` (ação `app_settings_updated`).

### 5. Empty state do chat (`/app/chat` no desktop sem conversa)
Texto principal **mantido** ("Baixe o aplicativo MultiZap").
Os botões agora são inteligentes:
- **Android com APK configurado** → botão "Baixar APK".
- **Android sem APK** → botão "Instalar como app" (usa `beforeinstallprompt`).
- **iPhone** → botão "Como instalar no iPhone" abre passo-a-passo visual (Safari → Compartilhar → Adicionar à Tela).
- **Desktop** → botão "Instalar como app" (`beforeinstallprompt` no Chrome/Edge).
- **App já instalado** → botão vira "Abrir inbox".

## Como gerar o APK Android (futuro)

> **Importante:** gerar APK exige Android Studio (ou linha de comando do
> Android SDK) e a sua chave de assinatura. Não é gerado dentro do Lovable.
> Aqui está o caminho recomendado.

### Opção A — Bubblewrap (TWA, mais simples)
Empacota o PWA dentro de um app Android que abre o site em tela cheia.
Atualiza automaticamente quando você publica nova versão do site.

```bash
# 1. Instale Bubblewrap
npm i -g @bubblewrap/cli

# 2. Inicie o projeto a partir do manifest
bubblewrap init --manifest=https://multizap.dev/manifest.webmanifest

# 3. Construa
bubblewrap build

# 4. O APK assinado fica em ./app-release-signed.apk
```

Suba o APK pra `https://multizap.dev/downloads/multizap-X.Y.Z.apk` e cole
o link em `/admin/sistema/apps`.

### Opção B — Capacitor (app híbrido completo)
Use se precisar de APIs nativas (câmera, contatos, notificações nativas).
Mais pesado e exige build sempre que mudar.

```bash
bun add @capacitor/core @capacitor/cli @capacitor/android
bunx cap init MultiZap dev.multizap.app --web-dir=dist
bunx cap add android
bun run build
bunx cap sync android
bunx cap open android   # abre no Android Studio
```

Recomendação: **Bubblewrap** para o MultiZap, porque o app é 100% web e
não usa APIs nativas hoje.

## Como o cliente instala (passo-a-passo simples)

### Android
1. Abrir o site no **Chrome**.
2. Tocar nos três pontinhos → "Instalar app" (ou "Adicionar à Tela Inicial").
3. Confirmar. O ícone verde MultiZap aparece na Tela Inicial.

Alternativa (se houver APK publicado): baixar o `.apk` direto do botão na
tela inicial do chat e instalar (precisa permitir "fontes desconhecidas"
nas configurações do Android).

### iPhone / iPad
1. Abrir o site no **Safari** (não funciona no Chrome do iPhone).
2. Tocar no botão **Compartilhar** (quadrado com seta pra cima).
3. Rolar e tocar em **Adicionar à Tela de Início**.
4. Confirmar. O ícone aparece como qualquer app.

### Desktop (Windows / macOS / Linux)
1. Abrir o site no **Chrome** ou **Edge**.
2. Clicar no ícone de instalar na barra de endereço (geralmente um ⊕).
3. Confirmar. O MultiZap abre em janela própria com atalho no menu.

## Decisão técnica: por que não usamos Service Worker?

A documentação oficial do Lovable desaconselha service workers em projetos
preview por iframe (cache fica obsoleto, dificulta hot-reload, exige
configuração de "kill-switch" pra remover depois). O manifest + ícones já
garantem instalação em **todas as plataformas suportadas** sem service
worker. Não há perda funcional pro usuário; perdemos apenas modo offline,
que não é prioridade hoje.

Se no futuro precisar offline, seguir as regras do PWA Lovable (proteger
contra iframe/preview, usar NetworkFirst pra HTML, kill-switch SW).

## Rollback

Se precisar voltar:
1. **Manifest antigo:** restaurar `public/manifest.webmanifest` da entrega anterior.
2. **Meta tags antigas:** restaurar `apple-touch-icon` apontando pra `/og-image.jpg` no `__root.tsx`.
3. **Coluna nova:** `ALTER TABLE master_settings DROP COLUMN android_apk_updated_at;`
4. **Função antiga:** recriar `get_android_apk_info` retornando só `download_url, version`.
5. **Rota nova:** deletar `src/routes/admin.sistema.apps.tsx`.
6. **Componentes:** restaurar `NexChatEmptyState.tsx` da entrega anterior.
7. **Ícones:** ignorar `public/icons/*` (não quebra nada, só ocupa espaço).

## Riscos

- **Baixo.** Não tocamos em WuzAPI, Gateway, RLS, PIX, cobrança, Meta Cloud,
  webhook 9001, porta 3000.
- O OneSignal SW continua funcionando (não foi tocado).
- Nenhum token, secret ou URL interna foi exposto na rota pública.

## Arquivos alterados / criados

**Criados:**
- `public/icons/icon-source.png` (1024)
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-maskable-512.png`
- `public/icons/apple-touch-icon.png`
- `public/icons/favicon-32.png`
- `src/lib/use-platform-install.ts`
- `src/lib/admin-apps.functions.ts`
- `src/routes/admin.sistema.apps.tsx`
- `docs/APPS_MULTIZAP_ANDROID_IOS_DESKTOP.md` (este arquivo)
- Migração: `android_apk_updated_at` + recriação `get_android_apk_info`.

**Alterados:**
- `public/manifest.webmanifest` (reescrito profissional)
- `src/routes/__root.tsx` (meta tags + ícones)
- `src/components/nexchat/NexChatEmptyState.tsx` (CTAs inteligentes por plataforma)

## Próximo passo

1. Testar no navegador real: abrir `/admin/sistema/apps` e rodar "Verificar manifest e ícones".
2. Em um celular Android, instalar como PWA pelo Chrome e verificar o ícone verde.
3. Em um iPhone, abrir no Safari e confirmar que o ícone bonito aparece ao
   adicionar à Tela de Início.
4. (Opcional) Gerar o primeiro APK com Bubblewrap, hospedar em `multizap.dev/downloads/`
   e configurar o link no painel master.
