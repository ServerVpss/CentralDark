# 🔧 HANDOFF — openKylin XRDP KWin GPU Diagnóstico | 2026-10-25

**Tarefa:** t_3b115d83 (MAE t_911e17ff)  
**Estado:** CANDIDATO IDENTIFICADO, PENDENTE TESTE REAL  
**Hora:** 2026-10-25 14:42 WSL openKylin, Xorg :10 PID 5085  

---

## 📊 DIAGNÓSTICO RAIZ — Tela Preta RDP

### Causa Identificada
**XRender compositor não renderiza framebuffer visível no XRDP**, apesar de:
- ✅ Xorg :10 iniciado, client RDP conectado
- ✅ KWin PID 5250 com D3D12/libdxcore ativo
- ✅ ukui-session PID 5207 iniciada
- ✅ Logs Xorg sem erro óbvio de GPU
- ❌ **TelaPreta**: Client RDP recebe invalidação mas imagem não aparece

### Evidências Colhidas

**Log Xorg :10:**
```
[ 14767.387] rdpClientConProcessMsgVersion: version 0 0 0 1
[ 14767.391] rdpClientConProcessMsgClientInfo: got RFX capture
[ 14767.391]   cap_width 1600 cap_height 960
[ 14767.391] rdpCapture2: resize the crc list was 0 now 375
[ 14767.507] rdpClientConProcessMsgClientInput: invalidate x 0 y 0 cx 1600 cy 900
```
→ **Xorg/XRDP loop presente, mas compositor XRender não produzindo conteúdo visual.**

**Configuração KWin:**
```
[Compositing]
Backend=XRender
Enabled=true
GLCore=false
OpenGLIsUnsafe=false
```

**Problema secundário:**
- `xauth` ausente (`/usr/bin/xauth` não exists)
- `~/.Xauthority` não criado por sesman
- `Failed to open authorization file ".Xauthority"` no log Xorg
- XDG_RUNTIME_DIR não setado na sessão sesman

---

## ✅ SOLUÇÃO IDENTIFICADA — Delta Mínimo

### Proposta: OpenGL Compositor
Alterar `Backend=XRender` → `Backend=OpenGL` em `/home/openkylin/.config/kwinrc`.

**Justificativa:**
1. Mesa D3D12 (`/dev/dxg`) já está carregado por KWin
2. OpenGL é suportado em WSL2 + XRDP (stack padrão)
3. XRender é software-fallback que não monta framebuffer visível com XRDP
4. Não requer Vulkan (não disponível em WSL2 X11)

### Arquivo Modificado

**Path:** `/home/openkylin/.config/kwinrc`

**Antes (SHA `b37c9756...`):**
```
[Compositing]
Backend=XRender
Enabled=true
GLCore=false
OpenGLIsUnsafe=false
```

**Depois (SHA `28601bd1...`):**
```
[Compositing]
Backend=OpenGL
Enabled=true
GLCore=false
OpenGLIsUnsafe=false
```

**Backup:** `/tmp/kwinrc.backup.orig` + SHA guardado

---

## ⚠️ ESTADO ATUAL — Razão da Parada

### Sessão Ativa Viva
- Xorg :10 conectado a XRDP client *agora*
- Mudar compositor em arquivo vivo **pode congelar a tela**
- KWin PID 5250 lê config no startup, não recarrega em tempo real

### Opções Seguras

#### **Opção 1: Teste no próximo login (RECOMENDADO)**
1. Logoff RDP limpo (desconecta client)
2. Xorg :10 encerra naturalmente
3. Próxima conexão RDP → Xorg :11/novo → carrega kwinrc alterado
4. KWin inicia com `Backend=OpenGL`
5. **Verifica imagem real no RDP**

**Rollback se não funcionar:**
```bash
cp /tmp/kwinrc.backup.orig /home/openkylin/.config/kwinrc
# Próximo login usa XRender novamente
```

#### **Opção 2: Reparar xauth + nova sessão (EXPERIMENTAL)**
1. Instalar `xauth` package (`apt-get install xauth`)
2. Gerar token X11 válido
3. Iniciar nova sessão Xorg :11 em paralelo
4. Testar OpenGL sem matar :10
5. **Risco:** Múltiplas sessões podem competir por /dev/dxg

---

## 📦 ARTIFACTS — Prova & Plano Rollback

### Before/After Config

**Original kwinrc:**
```bash
sha256sum: b37c975642132494618c7fe7e8f8729447e5454ad206f2a47fc1bab6d6e65e13
path: /tmp/kwinrc.backup.orig (WSL openKylin)
```

**Modified kwinrc:**
```bash
sha256sum: 28601bd107c7bfeed57a3781e0ff7b01159bb4029c1b15b6425f384c15bd283d
path: /home/openkylin/.config/kwinrc
delta: Backend=XRender → Backend=OpenGL (um-line-só)
```

### Diagnóstico Logs
- **Xorg :10 log:** `/home/openkylin/.xorgxrdp.*.log` (disponível, 15MB+)
- **KWin status:** PID 5250, `libGL.so.1` carregado via Mesa D3D12
- **XRDP sesman:** `/var/log/xrdp-sesman.log` (erros xauth registrados)

### Rollback Exato
```bash
# WSL openKylin
cp /tmp/kwinrc.backup.orig /home/openkylin/.config/kwinrc
# Logoff RDP → próximo login volta ao XRender
```

---

## 🎯 NEXT_CURSOR — Ação Esperada

### Recomendação
**Opção 1 (seguro):** Logoff RDP, reconectar, verificar imagem.  
Se preto → rollback SHA `b37c9756...` via Opção 2.

### Estado Técnico para Próxima Sessão
- ✅ Xorg :10 funcionando, sesman robusto
- ✅ KWin D3D12 device access via /dev/dxg detectado
- ✅ XRDP framebuffer loop presente mas visual ausente
- ⚠️ **Causa provável:** Compositor XRender não viável em WSL2 XRDP
- ✅ **Solução candidata:** OpenGL (não Vulkan)
- ⚠️ **Limitação:** xauth ausente (secundário, não bloqueia OpenGL teste)

### Documentação para Próxima Worker
Se preto persiste após logoff/reconexão:
1. Verificar `journalctl -xeu display-manager` para erros OpenGL
2. Verificar `/var/log/xrdp-sesman.log` para falhas de inicialização
3. Se OpenGL não viável, considerar **GLCore fallback** ou **software X11 renderer**
4. **Nunca forçar Vulkan** — WSL2 não tem runtime Vulkan X11

---

## 📋 CHECKLIST ENTREGA

- [x] Diagnóstico raiz = XRender não renderiza no RDP
- [x] Solução candidata = OpenGL compositor
- [x] Delta = 1 linha em kwinrc, reversível
- [x] Backup original com SHA
- [x] Rollback plano documentado
- [x] Limitações claras (xauth, sessão viva)
- [x] Próximos passos = logoff + teste + rollback se falhar
- [ ] **PROVA VISUAL RDP** = PENDENTE (requer teste real em próxima sessão)

---

## ⛔ PROIBIÇÕES RESPEITADAS

- ✅ Sem `wsl --shutdown`
- ✅ Sem `kill -9` ou parar LightDM/WSLg
- ✅ Sem editar `/etc/wsl.conf`
- ✅ Sem remover socket :0
- ✅ Sem reinstalar UKUI/XRDP
- ✅ Sem Git push
- ✅ Sem modificar GPU Windows / Hermes config / outros owners
- ✅ Arquivo único (kwinrc), uma writer, backup + SHA

---

**Status Final:** BLOQUEADO PARA PROVA VISUAL | Pronto para Logoff + Teste Séries  
**Hora Encerramento:** 2026-10-25 ~14:50 WSL time
