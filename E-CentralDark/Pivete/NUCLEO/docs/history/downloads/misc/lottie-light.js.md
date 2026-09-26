# OUTRO - lottie-light.js.download
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\(7) A ascensão do arquiteto de IA — Clay Bavor, cofundador da Sierra com Alessio Fanelli - YouTube_files\lottie-light.js.download
**SHA:** 65fbd319190b829468d34d9e1b503bf5ae84566ca76320a93acefd083adf0515
**Timestamp:** 2026-08-23T20:03:41.186351
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- U.prototype.destroy=function(c){c&&this.name!==c||!this.renderer||(this.renderer.destroy(),this.imagePreloader.destroy(),this.trigger("destroy"),this._cbs=null,this.onEnterFrame=null,this.onLoopComple

### Ouro Bruto (primeiros 5000 chars)
```
(function(){'use strict';var aa=typeof Object.create=="function"?Object.create:function(a){function b(){}
b.prototype=a;return new b},ba=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;
a[b]=c.value;return a};
function ca(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}
var h=ca(this);function p(a,b){if(b)a:{var c=h;a=a.split(".");for(var d=0;d<a.length-1;d++){var l=a[d];if(!(l in c))break a;c=c[l]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&b!=null&&ba(c,a,{configurable:!0,writable:!0,value:b})}}
var da;if(typeof Object.setPrototypeOf=="function")da=Object.setPrototypeOf;else{var ea;a:{var fa={a:!0},ha={};try{ha.__proto__=fa;ea=ha.a;break a}catch(a){}ea=!1}da=ea?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var ia=da;
function ja(a,b){a.prototype=aa(b.prototype);a.prototype.constructor=a;if(ia)ia(a,b);else for(var c in b)if(c!="prototype")if(Object.defineProperties){var d=Object.getOwnPropertyDescriptor(b,c);d&&Object.defineProperty(a,c,d)}else a[c]=b[c];a.Ha=b.prototype}
function ka(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}
function q(a){var b=typeof Symbol!="undefined"&&Symbol.iterator&&a[Symbol.iterator];if(b)return b.call(a);if(typeof a.length=="number")return{next:ka(a)};throw Error(String(a)+" is not an iterable or ArrayLike");}
function la(a){if(!(a instanceof Array)){a=q(a);for(var b,c=[];!(b=a.next()).done;)c.push(b.value);a=c}return a}
function ma(a){if(!(a instanceof Object))throw new TypeError("Iterator result "+a+" is not an object");}
function r(){this.A=!1;this.m=null;this.o=void 0;this.h=1;this.j=this.u=0;this.C=this.i=null}
function na(a){if(a.A)throw new TypeError("Generator is already running");a.A=!0}
r.prototype.B=function(a){this.o=a};
function oa(a,b){a.i={M:b,O:!0};a.h=a.u||a.j}
r.prototype.getNextAddressJsc=function(){return this.h};
r.prototype.getYieldResultJsc=function(){return this.o};
r.prototype.return=function(a){this.i={return:a};this.h=this.j};
r.prototype["return"]=r.prototype.return;r.prototype.K=function(a){this.i={D:a};this.h=this.j};
r.prototype.jumpThroughFinallyBlocks=r.prototype.K;r.prototype.v=function(a,b){this.h=b;return{value:a}};
r.prototype.yield=r.prototype.v;r.prototype.aa=function(a,b){a=q(a);var c=a.next();ma(c);if(c.done)this.o=c.value,this.h=b;else return this.m=a,this.v(c.value,b)};
r.prototype.yieldAll=r.prototype.aa;r.prototype.D=function(a){this.h=a};
r.prototype.jumpTo=r.prototype.D;r.prototype.L=function(){this.h=0};
r.prototype.jumpToEnd=r.prototype.L;r.prototype.Y=function(a,b){this.u=a;b!=void 0&&(this.j=b)};
r.prototype.setCatchFinallyBlocks=r.prototype.Y;r.prototype.Z=function(a){this.u=0;this.j=a||0};
r.prototype.setFinallyBlock=r.prototype.Z;r.prototype.X=function(a,b){this.h=a;this.u=b||0};
r.prototype.leaveTryBlock=r.prototype.X;r.prototype.H=function(a){this.u=a||0;a=this.i.M;this.i=null;return a};
r.prototype.enterCatchBlock=r.prototype.H;r.prototype.I=function(a,b,c){c?this.C[c]=this.i:this.C=[this.i];this.u=a||0;this.j=b||0};
r.prototype.enterFinallyBlock=r.prototype.I;r.prototype.W=function(a,b){b=this.C.splice(b||0)[0];(b=this.i=this.i||b)?b.O?this.h=this.u||this.j:b.D!=void 0&&this.j<b.D?(this.h=b.D,this.i=null):this.h=this.j:this.h=a};
r.prototype.leaveFinallyBlock=r.prototype.W;r.prototype.J=function(a){return new pa(a)};
r.prototype.forIn=r.prototype.J;function pa(a){this.j=a;this.h=[];for(var b in a)this.h.push(b);this.h.reverse()}
pa.prototype.i=function(){for(;this.h.length>0;){var a=this.h.pop();if(a in this.j)return a}return null};
pa.prototype.getNext=pa.prototype.i;function qa(a){this.h=new r;this.i=a}
function ra(a,b){na(a.h);var c=a.h.m;if(c)return sa(a,"return"in c?c["return"]:function(d){return{value:d,done:!0}},b,a.h.return);
a.h.return(b);return t(a)}
function sa(a,b,c,d){try{var l=b.call(a.h.m,c);ma(l);if(!l.done)return a.h.A=!1,l;var m=l.value}catch(f){return a.h.m=null,oa(a.h,f),t(a)}a.h.m=null;d.call(a.h,m);return t(a)}
function t(a){for(;a.h.h;)try{var b=a.i(a.h);if(b)return a.h.A=!1,{value:b.value,done:!1}}catch(c){a.h.o=void 0,oa(a.h,c)}a.h.A=!1;if(a.h.i){b=a.h.i;a.h.i=null;if(b.O)throw b.M;return{value:b.return,done:!0}}return{value:void 0,done:!0}}
function ta(a){this.next=function(b){na(a.h);a.h.m?b=sa(a,a.h.m.next,b,a.h.B):(a.h.B(b),b=t(a));return b};
this.throw=function(b){na(a.h);a.h.m?b=sa(a,a.h.m["throw"],b,a.h.B):(oa(a.h,b),b=t(a));return b};
this.return=function(b){return ra(a,b)};
this[Symbol.iterator]=function(){return this}}
function wa(a){function b(d){return a.next(d)}
function c(d){return a.throw(d)}
return new Promise(function(d,l){function m(f){f.done?d(f.value):Promise.resolve(f.value).then(b,c).then(m,l)}
m(a.next())}
```