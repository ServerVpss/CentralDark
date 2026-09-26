# OUTRO - real_estate_market_overview.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\real_estate_market_overview.js
**SHA:** 2adc843dbf25350e
**Timestamp:** 2026-08-28T02:52:36.418805
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run: node create_presentation.js

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Marco Island Housing Market Overview - PPTX Generator (10 slides)
 * Exact recreation from XML-parsed positions, fonts, and colors.
 *
 * npm install -g pptxgenjs react-icons react react-dom sharp
 * Images: ./images/sunset_bg.jpg, florida_map.png, florida_map_legend.png, us_rent_map_small.png
 * Run: node create_presentation.js
 */
const pptxgen = require("pptxgenjs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

const C = {darkNavy:"0C3547",teal:"17A2B8",tealDk:"0E6B7F",coral:"E8734A",white:"FFFFFF",cream:"F5EDE3",bgL:"F8F9FA",bgW:"FFFFFF",tk:"D4EFF4",mt:"5A7184",dv:"E2E8F0"};
const F = {t:"Trebuchet MS",b:"Calibri"};
const I = {bg:path.resolve(__dirname,"images/sunset_bg.jpg"),fl:path.resolve(__dirname,"images/florida_map_cropped.png"),fll:path.resolve(__dirname,"images/florida_legend_cropped.png"),us:path.resolve(__dirname,"images/us_rent_map_small.png")};

function iSvg(Co,c,s=256){return ReactDOMServer.renderToStaticMarkup(React.createElement(Co,{color:c,size:String(s)}));}
async function i2b(Co,c,s=256){return "image/png;base64,"+(await sharp(Buffer.from(iSvg(Co,c,s))).png().toBuffer()).toString("base64");}
async function circ(Co,bg,ic,s=256){const sv=iSvg(Co,ic,Math.round(s*.55)).replace(/<svg[^>]*>/,"").replace(/<\/svg>/,"");const o=Math.round(s*.225);return "image/png;base64,"+(await sharp(Buffer.from(`<svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg"><circle cx="${s/2}" cy="${s/2}" r="${s/2}" fill="#${bg}"/><g transform="translate(${o},${o})">${sv}</g></svg>`)).png().toBuffer()).toString("base64");}
async function bar(fh,th,p,w=146,h=28){return "image/png;base64,"+(await sharp(Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" rx="4" fill="#${th}"/><rect width="${Math.round(w*p)}" height="${h}" rx="4" fill="#${fh}"/></svg>`)).png().toBuffer()).toString("base64");}

function addTK(s,txt,src){
  s.addShape("rect",{x:0.5,y:4.85,w:9,h:0.5,fill:{color:C.tk}});
  s.addShape("rect",{x:0.5,y:4.85,w:0.06,h:0.5,fill:{color:C.coral}});
  s.addText([{text:"Key Takeaway: ",options:{bold:true,fontSize:12,fontFace:F.b,color:C.darkNavy}},{text:txt,options:{fontSize:12,fontFace:F.b,color:C.darkNavy}}],{x:0.6,y:4.85,w:8.85,h:0.5,valign:"middle",margin:0});
  if(src) s.addText(src,{x:0.5,y:5.3891,w:9,h:0.2,fontSize:10,fontFace:F.b,color:C.mt,italic:true,margin:0});
}
function hdr(s,t,sub,tw,sw){
  s.addText(t,{x:0.5,y:0.3,w:tw||9,h:0.5,fontSize:26,fontFace:F.t,color:C.darkNavy,bold:true,margin:0});
  if(sub) s.addText(sub,{x:0.5,y:0.8,w:sw||9,h:0.3,fontSize:12,fontFace:F.b,color:C.mt,margin:0});
}

async function main(){
  const{FaMapMarkerAlt,FaHome,FaBuilding}=require("react-icons/fa");
  const pin=await i2b(FaMapMarkerAlt,"#FFFFFF");
  const hC=await circ(FaHome,C.tealDk,"#FFFFFF");
  const bC=await circ(FaBuilding,C.coral,"#FFFFFF");
  const tB={d:await bar(C.tealDk,"B8D8D5",.46),l:await bar(C.tealDk,"B8D8D5",.47),p:await bar(C.tealDk,"B8D8D5",1),v:await bar(C.tealDk,"B8D8D5",.55)};
  const cB={d:await bar(C.coral,"F0C4B4",1),l:await bar(C.coral,"F0C4B4",1),p:await bar(C.coral,"F0C4B4",.33),v:await bar(C.coral,"F0C4B4",.85)};

  const pres=new pptxgen();pres.layout="LAYOUT_16x9";pres.author="Market Analysis Team";pres.title="Marco Island Housing Market Overview";

  // SLIDE 1 - Title
  {const s=pres.addSlide();s.background={path:I.bg};
  s.addShape("rect",{x:0,y:0,w:10,h:5.625,fill:{color:"000000",transparency:35}});
  s.addShape("rect",{x:0,y:0,w:0.12,h:5.625,fill:{color:C.teal}});
  s.addImage({data:pin,x:0.6,y:0.8,w:0.6,h:0.6});
  s.addText("MARCO ISLAND",{x:0.6,y:1.55,w:8.5,h:0.7,fontSize:44,fontFace:F.t,color:C.white,bold:true,margin:0});
  s.addText("HOUSING MARKET OVERVIEW",{x:0.6,y:2.2,w:8.5,h:0.55,fontSize:24,fontFace:F.b,color:C.teal,charSpacing:4,margin:0});
  s.addText("April 2026  |  Data sourced from Zillow.com, Redfin, and industry reports",{x:0.6,y:4.1946,w:8.5,h:0.4,fontSize:14,fontFace:F.b,color:C.cream,margin:0});
  s.addShape("rect",{x:0.6,y:4.6924,w:7.3891,h:0.04,fill:{color:C.coral}});
  s.addText("Prepared for National Team Presentation",{x:0.6,y:4.8,w:8,h:0.35,fontSize:14,fontFace:F.b,color:C.cream,italic:true,margin:0});}

  // SLIDE 2 - A Buyer's Market
  {const s=pres.addSlide();s.background={color:C.bgL};
  hdr(s,"A BUYER'S MARKET","Pricing, pace, and inventory from Zillow - as of February 28, 2026",5,5);
  s.addText("$859,460",{x:0.4803,y:1.4654,w:4,h:0.6,fontSize:36,fontFace:F.t,color:C.darkNavy,bold:true,margin:0});
  s.addText("Avg. Home Value (ZHVI)",{x:0.5064,y:2.0654,w:2.5,h:0.3,fontSize:13,fontFace:F.b,color:C.mt,margin:0});
  s.addText("Down 4.0% YoY",{x:2.8572,y:2.0654,w:1.5,h:0.3,fontSize:12,fontFace:F.b,color:C.coral,bold:true,align:"right",margin:0});
  s.addText("736",{x:0.4803,y:2.7719,w:4,h:0.6,fontSize:36,fontFace:F.t,color:C.darkNavy,bold:true,margin:0});
  s.addText("Active Listi
```