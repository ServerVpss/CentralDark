# COMANDO - DEMO-CANVAS-PR-APRENDIZADO.html
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\01-ARQUIVOS-DA-CONVERSA\DEMO-CANVAS-PR-APRENDIZADO.html
**SHA:** 7f5cd7c26a3dc305
**Timestamp:** 2026-08-26T19:43:15.561583
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- .bar{display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap}
- const margin=34, gap=18;

### Ouro Bruto (primeiros 5000 chars)
```
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Canvas — Aprendizado de PR</title>
<style>
  body{margin:0;background:#0b0d10;color:#f3f4f6;font-family:Arial,Helvetica,sans-serif}
  main{max-width:1100px;margin:24px auto;padding:0 16px}
  h1{font-size:24px;margin-bottom:8px}
  p{color:#b8c0cc}
  canvas{width:100%;height:auto;background:#11151a;border:1px solid #2a313b;border-radius:16px}
  .bar{display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap}
  button{background:#f4f4f5;color:#111;border:0;border-radius:10px;padding:10px 16px;font-weight:700;cursor:pointer}
  code{background:#171b21;padding:8px 10px;border-radius:8px}
</style>
</head>
<body>
<main>
  <h1>Canvas: erro → prova → correção → aprendizado</h1>
  <p>Clique para avançar. A IA vê o mesmo fluxo que humanos veem no PR.</p>
  <canvas id="board" width="1100" height="420"></canvas>
  <div class="bar">
    <button id="next">Próximo estado</button>
    <button id="reset">Reiniciar</button>
    <code id="receipt">STATE=ERRO_DETECTADO</code>
  </div>
</main>
<script>
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const receipt = document.getElementById('receipt');

const states = [
  {id:'ERRO_DETECTADO', title:'1. Erro detectado', sub:'Alegação não bate com a evidência'},
  {id:'PROVA_COLETADA', title:'2. Prova coletada', sub:'arquivo + commit + teste + receipt'},
  {id:'CORRECAO_MINIMA', title:'3. Correção mínima', sub:'uma invariável por vez'},
  {id:'TESTE_PASSOU', title:'4. Teste passou', sub:'antes FAIL, depois PASS'},
  {id:'APRENDIZADO_ATIVO', title:'5. Aprendizado ativo', sub:'regra + detector + gate'}
];

let active = 0;

function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,r);
}

function drawArrow(x1,y1,x2,y2){
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2-10,y2-6);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x2-10,y2+6);
  ctx.stroke();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#11151a';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const margin=34, gap=18;
  const w=(canvas.width-margin*2-gap*4)/5;
  const y=120, h=150;

  ctx.lineWidth=3;
  ctx.font='700 19px Arial';
  ctx.textAlign='center';

  states.forEach((s,i)=>{
    const x=margin+i*(w+gap);
    ctx.fillStyle=i===active ? '#f4f4f5' : '#1b222b';
    ctx.strokeStyle=i===active ? '#f4f4f5' : '#3a4654';
    roundRect(x,y,w,h,16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle=i===active ? '#101317' : '#f3f4f6';
    ctx.fillText(s.title,x+w/2,y+48);

    ctx.font='15px Arial';
    const words=s.sub.split(' ');
    let line='', lines=[];
    words.forEach(word=>{
      const test=line+word+' ';
      if(ctx.measureText(test).width>w-24){lines.push(line);line=word+' ';}
      else line=test;
    });
    lines.push(line);
    lines.forEach((ln,idx)=>ctx.fillText(ln.trim(),x+w/2,y+82+idx*21));
    ctx.font='700 19px Arial';

    if(i<states.length-1){
      ctx.strokeStyle='#6b7280';
      drawArrow(x+w+4,y+h/2,x+w+gap-4,y+h/2);
    }
  });

  ctx.textAlign='left';
  ctx.fillStyle='#d1d5db';
  ctx.font='16px monospace';
  ctx.fillText('INVARIANTE: REGISTRADO exige prova permanente.',34,340);
  ctx.fillText('SAÍDA: nenhum texto bonito altera o estado sem receipt.',34,370);
  receipt.textContent='STATE='+states[active].id;
}

document.getElementById('next').onclick=()=>{active=Math.min(active+1,states.length-1);draw();};
document.getElementById('reset').onclick=()=>{active=0;draw();};
draw();
</script>
</body>
</html>

```