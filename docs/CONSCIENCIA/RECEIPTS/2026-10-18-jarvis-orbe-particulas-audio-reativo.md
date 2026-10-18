# 🍒 Jarvis Particle Orb — efeito Apple-like no Hermes do cockpit

DATA=2026-10-18
FONTE_VISUAL=Vídeo fornecido pelo CHEFE (inspiração; arquivo de vídeo não copiado para o repositório)
OWNER_EXISTENTE=apps/instinto-superior/src/components/central/HermesPet.tsx
NOVO_COMPONENTE_VISUAL=apps/instinto-superior/src/components/central/JarvisParticleOrb.tsx
ENGINE=Canvas 2D + projeção de esfera 3D + movimento harmônico procedural
CARACTERÍSTICA=visualizador de áudio real (FFT via Web Audio API) quando houver stream conectado

## Intenção

Ao abrir o cockpit, o Jarvis deve surgir como uma esfera azul de pontos luminosos em movimento contínuo e suave (idle/respirando), sem depender do modelo. Ao ouvir a voz humana, ondas e pontos respondem às bandas FFT reais do microfone. Quando o motor de voz do Jarvis falar, deverá publicar o MediaStream de saída no mesmo contrato `centraldark:jarvis:audio` para que a esfera reaja ao áudio real, não à palavra `FALANDO`.

## Implementação verificada em main

- Componente autoral `JarvisParticleOrb.tsx`, sem assets proprietários da Apple, WebGL, npm extra nem motor paralelo.
- `HermesPet.tsx`: `VisualHermes` inclui `orbe`; inicialização padrão é `visual:"orbe"`. Renderiza o orbe no `PainelHermes` e no `HermesFlutuante` global, reaproveitando as demais peles e a opção de mostrar/ocultar. Orb permanece fixo no canto, com movimento interno.
- O microfone **não** é aberto automaticamente. Apenas `Ativar microfone` dispara `navigator.mediaDevices.getUserMedia`, com consentimento do navegador. AnalyserNode FFT256 fica no cliente, não envia áudio a servidor; parar solta as tracks. Respeita `prefers-reduced-motion` e pausa frames quando aba fica oculta.
- Integração futura da voz já tem uma única superfície de evento, sem fingir conclusão:
  `window.dispatchEvent(new CustomEvent("centraldark:jarvis:audio", { detail: { mode: "speaking", stream: mediaStreamReal } }))`.
  `mode:"listening"` usa fluxo do microfone; `mode:"processing"` é apenas estado, não prova de processamento do LLM; `mode:"idle"` volta ao repouso. Não há evidência nesta operação de stream TTS real do Jarvis conectado ao browser.

## Prova de build, preview e deploy

```text
MAIN_SHA_PREDEPLOY=ea0b41fd4c58598cfa5a5f3ea0e172f4dc36f2c9
JARVIS_ORB_OWNER_COMMIT=cf8b6cf1365bccce76bc055d995130291efab923
HERMES_SKIN_OWNER_COMMIT=ea0b41fd4c58598cfa5a5f3ea0e172f4dc36f2c9
STAGE=/root/.hermes/centraldark/workspaces/jarvis-particle-ea0b41fd4c58
VITE_BUILD_EXIT=0
SSR_FLATTENED_ORDER=FIXED:createServerRpc-D3M4sEhC.mjs
PREVIEW_LOCAL_COCKPIT_HTTP=200
PREVIEW_ROOT_HTTP=200
PREVIEW_AUTH_HTTP=200
PREVIEW_SSR_TYPE_ERRORS=0
PRODUCTION_RELEASE=/var/opt/centraldark/instinto-releases/ea0b41fd4c58598cfa5a5f3ea0e172f4dc36f2c9/.output
PREVIOUS_RELEASE=4ff4508e7d0920b51d2fbb82e22025314ebb64b1 (preservada)
SERVICE=centraldark-instinto-superior-web.service ACTIVE
MCP=centraldark-native-mcp-http.service ACTIVE
HTTP_LOCAL_ROOT=200
HTTP_LOCAL_COCKPIT=200
HTTP_LOCAL_AUTH=200
HTTP_LOCAL_SALA_CONTROLE=200
HTTP_PUBLIC_HTTPS_COCKPIT=200 (curl na VPS)
BUNDLE_WITH_EVENT_ORB=1
MAIN_DIRTY_TRACKED_FILES_PRESERVED=5 (pré-existentes)
TSC_GLOBAL_EXIT=2 / 42_erros de TypeScript no app; nenhum diagnóstico apontou JarvisParticleOrb.tsx. Ocorrências em HermesPet.tsx relacionadas ao `rotulo?: string` pré-existente.
```

## Contraprova / limites

1. **Não é o componente original da Apple.** Vídeo mostra um padrão de partículas de configuração/emparelhamento, não prova de FFT. Nosso orb implementa visual próprio, semelhante em estilo.
2. O navegador real **não foi inspecionado visualmente quadro a quadro nesta operação**; testes executados: Vite/Nitro, SSR preview, assets da UI, HTTP local e HTTP público, estado do systemd. A animação de fato no dispositivo do CHEFE exige readback visual (especialmente iPhone Safari).
3. Microfone: a API existe, mas o teste do consentimento e da amplitude real depende de clique do usuário no navegador; `MIC_LIVE_E2E=UNKNOWN`.
4. Saída TTS do Jarvis: o evento está preparado, porém nenhum emissor de MediaStream real foi encontrado no front-end `apps/instinto-superior/src`. `JARVIS_TTS_STREAM_E2E=NOT_CONNECTED`, não promover a verde.
5. Respeitar LGPD/privacidade: sem ativação do microfone em background, sem persistência do conteúdo do áudio; é análise visual local.
6. Não usar este efeito para indicar sucesso de API, execução, ação do Hermes ou checkpoint; a esfera é uma representação da presença/voz, distinta do Reality Judge.

## Próximo cursor

```text
NEXT_CURSOR=PROVAR_MIC_FFT_NO_SAFARI_E_LIGAR_MEDIASTREAM_DA_VOZ_REAL_DO_JARVIS_NO_CONTRATO_EXISTENTE
OWNER=JarvisParticleOrb.tsx + owner de reprodução de áudio quando for identificado na superfície física
CRITERIO=stream real reproduzido/ouvido, FFT varia com sinal, permanece calmo sem sinal, volume não é divulgado
```
