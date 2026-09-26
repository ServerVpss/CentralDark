# OUTRO - webcomponents-sd.js.download
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\(7) A ascensão do arquiteto de IA — Clay Bavor, cofundador da Sierra com Alessio Fanelli - YouTube_files\webcomponents-sd.js.download
**SHA:** cbd1f114dfb4cc21f85f22ba81b0717fbff6a95afc48d0df9a6aac79075365af
**Timestamp:** 2026-08-23T20:03:38.925256
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- var mb={blur:!0,focus:!0,focusin:!0,focusout:!0,click:!0,dblclick:!0,mousedown:!0,mouseenter:!0,mouseleave:!0,mousemove:!0,mouseout:!0,mouseover:!0,mouseup:!0,wheel:!0,beforeinput:!0,input:!0,keydown:
- function fd(){this.end=this.start=0;this.rules=this.parent=this.previous=null;this.cssText=this.parsedCssText="";this.atRule=!1;this.type=0;this.parsedSelector=this.selector=this.keyframesName=""}
- function gd(a){var b=a=a.replace(hd,"").replace(id,""),c=new fd;c.start=0;c.end=b.length;for(var d=c,e=0,f=b.length;e<f;e++)if(b[e]==="{"){d.rules||(d.rules=[]);var g=d,h=g.rules[g.rules.length-1]||nu

### Ouro Bruto (primeiros 5000 chars)
```
(function(){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var k;function aa(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}function p(a){var b=typeof Symbol!="undefined"&&Symbol.iterator&&a[Symbol.iterator];if(b)return b.call(a);if(typeof a.length=="number")return{next:aa(a)};throw Error(String(a)+" is not an iterable or ArrayLike");}function q(a){if(!(a instanceof Array)){a=p(a);for(var b,c=[];!(b=a.next()).done;)c.push(b.value);a=c}return a}
function ba(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}var ca=ba(this);function r(){for(var a=Number(this),b=[],c=a;c<arguments.length;c++)b[c-a]=arguments[c];return b};/*

Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
function da(){}da.prototype.toJSON=function(){return{}};function u(a){a.__shady||(a.__shady=new da);return a.__shady}function v(a){return a&&a.__shady};var w=window.ShadyDOM||{};w.Sb=!(!Element.prototype.attachShadow||!Node.prototype.getRootNode);var ea=Object.getOwnPropertyDescriptor(Node.prototype,"firstChild");w.l=!!(ea&&ea.configurable&&ea.get);w.inUse=w.force||!w.Sb;w.noPatch=w.noPatch||!1;w.T=w.preferPerformance;w.ra=w.noPatch==="on-demand";var fa;var ha=w.querySelectorImplementation;fa=["native","selectorEngine"].indexOf(ha)>-1?ha:void 0;w.querySelectorImplementation=fa;var ja=navigator.userAgent.match("Trident");w.Ra=ja;
function ka(){return Document.prototype.msElementsFromPoint?"msElementsFromPoint":"elementsFromPoint"}function x(a){return(a=v(a))&&a.firstChild!==void 0}function y(a){return a instanceof ShadowRoot}function la(a){return(a=(a=v(a))&&a.root)&&a.ya()}var z=Element.prototype,ma=z.matches||z.matchesSelector||z.mozMatchesSelector||z.msMatchesSelector||z.oMatchesSelector||z.webkitMatchesSelector,na=document.createTextNode(""),oa=0,pa=[];
(new MutationObserver(function(){for(;pa.length;)try{pa.shift()()}catch(a){throw na.textContent=oa++,a;}})).observe(na,{characterData:!0});function qa(a){pa.push(a);na.textContent=oa++}var ra=document.contains?function(a,b){return a.__shady_native_contains(b)}:function(a,b){return a===b||a.documentElement&&a.documentElement.__shady_native_contains(b)};function sa(a,b){for(;b;){if(b==a)return!0;b=b.__shady_parentNode}return!1}
function ta(a){for(var b=a.length-1;b>=0;b--){var c=a[b],d=c.getAttribute("id")||c.getAttribute("name");d&&d!=="length"&&isNaN(d)&&(a[d]=c)}a.item=function(e){return a[e]};a.namedItem=function(e){if(e!=="length"&&isNaN(e)&&a[e])return a[e];for(var f=p(a),g=f.next();!g.done;g=f.next())if(g=g.value,(g.getAttribute("id")||g.getAttribute("name"))==e)return g;return null};return a}function ua(a){var b=[];for(a=a.__shady_native_firstChild;a;a=a.__shady_native_nextSibling)b.push(a);return b}
function va(a){var b=[];for(a=a.__shady_firstChild;a;a=a.__shady_nextSibling)b.push(a);return b}function wa(a,b,c){c.configurable=!0;if(c.value)a[b]=c.value;else try{Object.defineProperty(a,b,c)}catch(d){}}function B(a,b,c,d){c=c===void 0?"":c;for(var e in b)d&&d.indexOf(e)>=0||wa(a,c+e,b[e])}function xa(a,b){for(var c in b)c in a&&wa(a,c,b[c])}function C(a){var b={};Object.getOwnPropertyNames(a).forEach(function(c){b[c]=Object.getOwnPropertyDescriptor(a,c)});return b}
function ya(a,b){for(var c=Object.getOwnPropertyNames(b),d=0,e;d<c.length;d++)e=c[d],a[e]=b[e]}function za(a){return a instanceof Node?a:document.createTextNode(""+a)}function D(){var a=r.apply(0,arguments);if(a.length===1)return za(a[0]);var b=document.createDocumentFragment();a=p(a);for(var c=a.next();!c.done;c=a.next())b.appendChild(za(c.value));return b}
function Aa(a){var b;for(b=b===void 0?1:b;b>0;b--)a=a.reduce(function(c,d){Array.isArray(d)?c.push.apply(c,q(d)):c.push(d);return c},[]);return a}function Ba(a){var b=[],c=new Set;a=p(a);for(var d=a.next();!d.done;d=a.next())d=d.value,c.has(d)||(b.push(d),c.add(d));return b};var Ca=[],Da;function Ea(a){Da||(Da=!0,qa(Fa));Ca.push(a)}function Fa(){Da=!1;for(var a=!!Ca.length;Ca.length;)Ca.shift()();return a}Fa.list=Ca;function Ga(){this.Z=!1;this.addedNodes=[];this.removedNodes=[];this.da=new Set}function Ha(a){a.Z||(a.Z=!0,qa(function(){a.flush()}))}Ga.prototype.flush=function(){if(this.Z){this.Z=!1;var a=this.takeRecords();a.length&&this.da.forEach(function(b){b(a)})}};Ga.prototype.takeRecords=function(){if(this.addedNodes.length||this.removedNodes.length){var a=[
```