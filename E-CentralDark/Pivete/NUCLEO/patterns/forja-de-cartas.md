# PADRAO - forja-de-cartas.html
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\forja-de-cartas.html
**SHA:** e8f4016dcf8b2b6f
**Timestamp:** 2026-08-26T19:39:31.949379
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- ressalva:'DECIDIDO: sem subdomínio, o grafo vira rota dentro do sistema. Falta a execução — o Caddyfile no repo ainda declara grafo e hub como blocos separados. A decisão está fechada; a migração, não

### Riscos
- .perigo:hover{border-color:var(--sangue);color:#E8907F;}

### Gaps
- display:flex;align-items:center;gap:14px;flex-wrap:wrap;
- gap:0;
- gap:22px;padding:38px 24px 30px;
- display:flex;flex-direction:column;gap:9px;
- .carta-topo{position:relative;z-index:3;display:flex;align-items:flex-start;gap:10px;}
- position:relative;z-index:3;display:flex;gap:7px;font-family:var(--mono);font-size:9px;letter-spacing:.07em;
- .filtros{display:flex;gap:1px;background:var(--linha);}
- .ferramentas{display:flex;gap:9px;flex-wrap:wrap;justify-content:center;z-index:1;}
- .deck{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--linha);}
- display:flex;align-items:center;gap:9px;padding:10px 12px;

### Ouro Bruto (primeiros 5000 chars)
```
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CentralDark — Forja de Cartas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=IM+Fell+English:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<style>
/* ============================================================
   TOKENS
   [REDIGIDO-PRESERVACAO]= */
:root{
  --breu:#0A0906;
  --carvao:#15120C;
  --carvao-alto:#1E1A11;
  --linha:#3A3220;
  --pergaminho:#EFE2C6;
  --pergaminho-med:#DCC9A2;
  --pergaminho-fundo:#C9B085;
  --tinta:#2A2013;
  --tinta-fraca:#5B4A32;
  --ouro:#C0902B;
  --ouro-claro:#F4DA95;
  --ouro-escuro:#7A5A15;
  --sangue:#7C1F12;
  --ciano:#57D9EA;
  --verde:#7BC96F;
  --ambar:#E9B44C;

  --disp:'Cinzel','Palatino Linotype','Book Antiqua',Palatino,Georgia,serif;
  --corpo:'EB Garamond',Georgia,'Times New Roman',serif;
  --antigo:'IM Fell English','EB Garamond',Georgia,serif;
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;

  --carta-l:480px;
  --carta-a:672px;
}

*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{
  background:
    radial-gradient(1200px 700px at 22% -10%, #1B160D 0%, transparent 60%),
    radial-gradient(900px 600px at 100% 110%, #12181A 0%, transparent 60%),
    var(--breu);
  color:var(--pergaminho-med);
  font-family:var(--mono);
  min-height:100vh;
}
::selection{background:var(--ouro);color:#100D06;}
:focus-visible{outline:2px solid var(--ambar);outline-offset:2px;}

/* ============================================================
   CHROME — barra e grade
   ============================================================ */
.barra{
  border-bottom:1px solid var(--linha);
  background:linear-gradient(180deg,#171309,#100D07);
  padding:12px 18px;
  display:flex;align-items:center;gap:14px;flex-wrap:wrap;
}
.barra-titulo{
  font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.14em;
  color:var(--ouro-claro);
  border:1px solid var(--linha);border-left:3px solid var(--ouro);
  padding:7px 12px;background:#0E0B06;white-space:nowrap;
}
.barra-nota{font-size:11px;color:#7C6C4C;letter-spacing:.06em;}
.barra-nota b{color:var(--verde);font-weight:500;}

.grade{
  display:grid;
  grid-template-columns:minmax(0,1fr) 400px;
  gap:0;
  align-items:stretch;
  min-height:calc(100vh - 52px);
}

/* ============================================================
   PALCO
   ============================================================ */
.palco{
  position:relative;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:22px;padding:38px 24px 30px;
  background:
    radial-gradient(680px 520px at 50% 42%, rgba(192,144,43,.11), transparent 72%),
    repeating-linear-gradient(0deg, rgba(255,255,255,.014) 0 1px, transparent 1px 46px),
    repeating-linear-gradient(90deg, rgba(255,255,255,.014) 0 1px, transparent 1px 46px);
  overflow:hidden;
}
.palco::after{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(120% 100% at 50% 50%, transparent 45%, rgba(0,0,0,.72) 100%);
}
.suporte{position:relative;perspective:1400px;z-index:1;}

/* ============================================================
   A CARTA
   ============================================================ */
.carta{
  position:relative;
  width:var(--carta-l);height:var(--carta-a);
  border-radius:20px;
  transform-style:preserve-3d;
  transition:transform .18s cubic-bezier(.2,.7,.3,1);
  box-shadow:0 34px 70px -20px rgba(0,0,0,.9), 0 0 0 1px rgba(0,0,0,.6);
}
.carta-borda{
  position:absolute;inset:0;border-radius:20px;overflow:hidden;
  padding:11px;
  background:
    linear-gradient(150deg,#F6E1A4 0%,#B7862A 16%,#6A4B12 34%,#E4C874 52%,#8A6519 70%,#F2DB98 86%,#8B6620 100%);
}
.carta[data-raridade="RARA"] .carta-borda{
  background:linear-gradient(150deg,#CFE9F2 0%,#4E93A6 18%,#1E4550 36%,#9FD8E6 54%,#2C6272 72%,#BFE6F2 88%,#2E5F6E 100%);
}
.carta[data-raridade="COMUM"] .carta-borda{
  background:linear-gradient(150deg,#C9C4B4 0%,#7C7565 18%,#3B372D 36%,#B0A992 54%,#575142 72%,#C4BEAB 88%,#4A4536 100%);
}
.carta-interior{
  position:relative;height:100%;border-radius:11px;overflow:hidden;
  padding:14px 15px 12px;
  display:flex;flex-direction:column;gap:9px;
  color:var(--tinta);
  border:1px solid rgba(122,90,21,.55);
  background:
    radial-gradient(circle at 50% 50%, transparent 50%, rgba(122,74,20,.3) 100%),
    radial-gradient(circle at 18% 2%, #F9EFD9 0%, transparent 56%),
    radial-gradient(circle at 92% 98%, #D5BB8C 0%, transparent 58%),
    linear-gradient(178deg,#F2E5C8 0
```