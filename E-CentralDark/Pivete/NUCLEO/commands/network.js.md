# COMANDO - network.js.download
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\(7) A ascensão do arquiteto de IA — Clay Bavor, cofundador da Sierra com Alessio Fanelli - YouTube_files\network.js.download
**SHA:** 83113873f79fb43083db59ba15b5131c8d1d3e989ab1c6c5620fbbaad8134518
**Timestamp:** 2026-08-23T20:03:40.516149
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- var ua=/\x3clink([\s\S]*?)\x3e/ig,qa=/\x3c(script|style)([\s\S]*?)\x3e([\s\S]*?)\x3c\/\1\x3e/ig,sa=/(?:\s|^)async(?:\s|=|$)/i,wa=/(?:\s|^)href\s*=\s*["']?([^\s"']+)/i,X=/(?:\s|^)name\s*=\s*["']?([^\s"
- "json"&&(g.responseType="json");d.withCredentials&&(g.withCredentials=d.withCredentials);e="FormData"in window&&c instanceof FormData;a=a=="POST"&&!e;if(d.headers)for(var t in d.headers)g.setRequestHe
- function Ca(a,b,c,e,d){if(d.timing)for(var f in d.timing)c[f]=d.timing[f];if(d.resourceTiming)if(b.type=="load")for(var h in d.resourceTiming)c[h]=d.resourceTiming[h];else if(window.performance&&windo
- 0)==0)if(K(c,"/"))e="index"+e;else{var g=c.lastIndexOf(".");g>-1&&(c=c.substring(0,g))}else K(c,"/")&&e.lastIndexOf("/",0)==0&&(e=e.substring(1));c+=e}c=c+h+f+k+d}e=ia(c);c={};c.spfUrl=e;c.startTime=y

### Ouro Bruto (primeiros 5000 chars)
```
(function(){var l=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a};function aa(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof n&&n];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}var ba=aa(this);
function p(a,b){if(b)a:{var c=ba;a=a.split(".");for(var e=0;e<a.length-1;e++){var d=a[e];if(!(d in c))break a;c=c[d]}a=a[a.length-1];e=c[a];b=b(e);b!=e&&b!=null&&l(c,a,{configurable:!0,writable:!0,value:b})}}function ca(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}
p("Symbol",function(a){function b(f){if(this instanceof b)throw new TypeError("Symbol is not a constructor");return new c(e+(f||"")+"_"+d++,f)}function c(f,h){this.i=f;l(this,"description",{configurable:!0,writable:!0,value:h})}if(a)return a;c.prototype.toString=function(){return this.i};var e="jscomp_symbol_"+(Math.random()*1E9>>>0)+"_",d=0;return b});
p("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");l(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return da(ca(this))}});return a});function da(a){a={next:a};a[Symbol.iterator]=function(){return this};return a}function ea(a,b){a instanceof String&&(a+="");var c=0,e=!1,d={next:function(){if(!e&&c<a.length){var f=c++;return{value:b(f,a[f]),done:!1}}e=!0;return{done:!0,value:void 0}}};d[Symbol.iterator]=function(){return d};return d}
p("Array.prototype.keys",function(a){return a?a:function(){return ea(this,function(b){return b})}});/*

 Copyright Google LLC
 SPDX-License-Identifier: Apache-2.0
*/
var r={};function u(a){if(r!==r)throw Error("Bad secret");this.i=a}u.prototype.toString=function(){return this.i};new u("about:blank");new u("about:invalid#zClosurez");var v=[];function w(a){console.warn("A URL with content '"+a+"' was sanitized away.")}v.indexOf(w)===-1&&v.push(w);function x(a,b,c){var e=Array.prototype.slice.call(arguments,2);return function(){var d=e.slice();d.push.apply(d,arguments);return a.apply(b,d)}}function fa(a,b){if(a){var c=Array.prototype.slice.call(arguments,1);try{return a.apply(null,c)}catch(e){return e}}}var y=window.performance&&window.performance.timing&&window.performance.now?function(){return window.performance.timing.navigationStart+window.performance.now()}:function(){return(new Date).getTime()};function z(a,b){if(a.forEach)a.forEach(b,void 0);else for(var c=0,e=a.length;c<e;c++)c in a&&b.call(void 0,a[c],c,a)}function A(a,b){if(a.some)return a.some(b,void 0);for(var c=0,e=a.length;c<e;c++)if(c in a&&b.call(void 0,a[c],c,a))return!0;return!1}function C(a){return Object.prototype.toString.call(a)=="[object Array]"?a:[a]};function D(a,b){return E[a]=b}var E=window._spf_state||{};window._spf_state=E;var F={};"config"in E||D("config",F);F=E.config;function G(a){var b=H();a in b&&delete b[a]}function ha(){var a=H();for(b in a)I(a[b])||delete a[b];a=H();var b=parseInt(F["cache-max"],10);b=isNaN(b)?Infinity:b;b=Object.keys(a).length-b;if(!(b<=0))for(var c=0;c<b;c++){var e=Infinity,d;for(d in a)if(a[d].count<e){var f=d;e=a[d].count}delete a[f]}}function I(a){if(!(a&&"data"in a))return!1;var b=a.life;b=isNaN(b)?Infinity:b;a=a.time;return y()-a<b}function J(a){var b=parseInt(E["cache-counter"],10)||0;b++;D("cache-counter",b);a.count=b}
function H(){return"cache-storage"in E?E["cache-storage"]:D("cache-storage",{})};function K(a,b){var c=a.length-b.length;return c>=0&&a.indexOf(b,c)==c}var L=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^\s+|\s+$/g,"")};function M(a,b){a=a.split(b);var c=a.length==1;return[a[0],c?"":b,c?"":a.slice(1).join(b)]};function N(a){a.data&&Object.prototype.toString.call(a.data)=="[object String]"&&a.data.lastIndexOf("spf:",0)==0&&O(a.data.substring(4))}function O(a){var b=P[a];b&&(delete P[a],b())}function Q(a){window.addEventListener?window.addEventListener("message",a,!1):window.attachEvent&&window.attachEvent("onmessage",a)}function R(a){window.removeEventListener?window.removeEventListener("message",a,!1):window.detachEvent&&window.detachEvent("onmessage",a)}
var S=function(){function a(){b=!1}if(!window.postMessage)return!1;var b=!0;Q(a);window.postMessage("","*");R(a);return b}(),P={};"async-defers"in E||D("async-defers",P);P=E["async-defers"];S&&("async-listener"in E&&R(E["async-listener"]),Q(N),D("async-listener",N));var T={};"ps-s"in E||D("ps-s",T);T=E["ps-s"];function U(a){var b=document.createElement("a");b.href=a;b.href=b.href;a={href:b.href,protocol:b.protocol,host:b.host,hostname:b.hostname,port:b.port,pathname:b.pathname,search:b.search,hash:b.hash,username:b.username,password:b.password};a.origin=a.protocol+"//"+a.host;a.pathname&&a.pathname[0]=="/"||(a.pathname="/"+a.pathname);return a}function ia(a){a=U(a);return M(a.href,"#")[0]};/*

 SPF
 (c) 2012-2017 Google Inc.
 https://ajax.googleapis.
```