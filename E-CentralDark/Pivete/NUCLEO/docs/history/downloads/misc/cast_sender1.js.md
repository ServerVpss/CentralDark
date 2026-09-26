# OUTRO - cast_sender(1).js.download
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\(7) A ascensão do arquiteto de IA — Clay Bavor, cofundador da Sierra com Alessio Fanelli - YouTube_files\cast_sender(1).js.download
**SHA:** b99daad4bcc22cce872711e33cdc32636826346e715553645395f8a16ee79d55
**Timestamp:** 2026-08-23T20:03:40.958037
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- chrome.cast.media.lb={PLAYBACK_START:"PLAYBACK_START",PLAYBACK_PAUSE:"PLAYBACK_PAUSE"};w("chrome.cast.media.ResumeState",chrome.cast.media.lb);chrome.cast.media.za={BUFFERED:"BUFFERED",LIVE:"LIVE",OTH
- chrome.cast.media.Bb=function(){this.adsResponse=this.adTagUrl=void 0};w("chrome.cast.media.VastAdsRequest",chrome.cast.media.Bb);chrome.cast.media.La=function(){this.whenSkippable=this.breakClipId=th
- f.Mb=function(){if(this.liveSeekableRange&&this.liveSeekableRange.start!==void 0&&this.liveSeekableRange.end!==void 0){if(this.playerState==chrome.cast.media.B.PLAYING&&this.g>=0){var a=(Date.now()-th

### Gaps
- w("chrome.cast.Capability",chrome.cast.Ma);chrome.cast.A={CANCEL:"cancel",TIMEOUT:"timeout",API_NOT_INITIALIZED:"api_not_initialized",INVALID_PARAMETER:"invalid_parameter",EXTENSION_NOT_COMPATIBLE:"ex

### Ouro Bruto (primeiros 5000 chars)
```
(function(){'use strict';var f,aa=typeof Object.create=="function"?Object.create:function(a){var b=function(){};b.prototype=a;return new b},g;if(typeof Object.setPrototypeOf=="function")g=Object.setPrototypeOf;else{var k;a:{var ba={a:!0},ca={};try{ca.__proto__=ba;k=ca.a;break a}catch(a){}k=!1}g=k?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}
var da=g,n=function(a,b){a.prototype=aa(b.prototype);a.prototype.constructor=a;if(da)da(a,b);else for(var c in b)if(c!="prototype")if(Object.defineProperties){var d=Object.getOwnPropertyDescriptor(b,c);d&&Object.defineProperty(a,c,d)}else a[c]=b[c];a.sc=b.prototype},ea=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}},fa=function(a){var b=typeof Symbol!="undefined"&&Symbol.iterator&&a[Symbol.iterator];if(b)return b.call(a);if(typeof a.length=="number")return{next:ea(a)};
throw Error(String(a)+" is not an iterable or ArrayLike");};/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var q=this||self,r=function(a){var b=typeof a;b=b!="object"?b:a?Array.isArray(a)?"array":b:"null";return b=="array"||b=="object"&&typeof a.length=="number"},u="closure_uid_"+(Math.random()*1E9>>>0),ha=0,ia=function(a,b,c){return a.call.apply(a.bind,arguments)},ja=function(a,b,c){if(!a)throw Error();if(arguments.length>2){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,
arguments)}},v=function(a,b,c){v=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?ia:ja;return v.apply(null,arguments)},w=function(a,b){a=a.split(".");for(var c=q,d;a.length&&(d=a.shift());)a.length||b===void 0?c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={}:c[d]=b};var chrome=chrome||window.chrome||{};chrome.cast=chrome.cast||{};chrome.cast.media=chrome.cast.media||{};chrome.cast.ReceiverActionListener={};chrome.cast.VERSION=[1,2];w("chrome.cast.VERSION",chrome.cast.VERSION);chrome.cast.rc=!0;w("chrome.cast.usingPresentationApi",chrome.cast.rc);chrome.cast.Na=function(a,b){this.credentials=a;this.credentialsType=b===void 0?"web":b};w("chrome.cast.CredentialsData",chrome.cast.Na);chrome.cast.Error=function(a,b,c){this.code=a;this.description=b||null;this.details=c||null};w("chrome.cast.Error",chrome.cast.Error);
chrome.cast.nb=function(a){this.platform=a;this.packageId=this.url=null};w("chrome.cast.SenderApplication",chrome.cast.nb);chrome.cast.Image=function(a){this.url=a;this.width=this.height=null};w("chrome.cast.Image",chrome.cast.Image);chrome.cast.Volume=function(a,b){this.level=a===void 0?null:a;this.muted=b===void 0?null:b};w("chrome.cast.Volume",chrome.cast.Volume);chrome.cast.ha={CUSTOM_CONTROLLER_SCOPED:"custom_controller_scoped",TAB_AND_ORIGIN_SCOPED:"tab_and_origin_scoped",ORIGIN_SCOPED:"origin_scoped",PAGE_SCOPED:"page_scoped"};w("chrome.cast.AutoJoinPolicy",chrome.cast.ha);chrome.cast.ja={CREATE_SESSION:"create_session",CAST_THIS_TAB:"cast_this_tab"};w("chrome.cast.DefaultActionPolicy",chrome.cast.ja);chrome.cast.Ma={VIDEO_OUT:"video_out",AUDIO_OUT:"audio_out",VIDEO_IN:"video_in",AUDIO_IN:"audio_in",MULTIZONE_GROUP:"multizone_group"};
w("chrome.cast.Capability",chrome.cast.Ma);chrome.cast.A={CANCEL:"cancel",TIMEOUT:"timeout",API_NOT_INITIALIZED:"api_not_initialized",INVALID_PARAMETER:"invalid_parameter",EXTENSION_NOT_COMPATIBLE:"extension_not_compatible",EXTENSION_MISSING:"extension_missing",RECEIVER_UNAVAILABLE:"receiver_unavailable",SESSION_ERROR:"session_error",CHANNEL_ERROR:"channel_error",LOAD_MEDIA_FAILED:"load_media_failed"};w("chrome.cast.ErrorCode",chrome.cast.A);chrome.cast.N={AVAILABLE:"available",UNAVAILABLE:"unavailable"};
w("chrome.cast.ReceiverAvailability",chrome.cast.N);chrome.cast.ob={CHROME:"chrome",IOS:"ios",ANDROID:"android"};w("chrome.cast.SenderPlatform",chrome.cast.ob);chrome.cast.xa={CAST:"cast",DIAL:"dial",HANGOUT:"hangout",CUSTOM:"custom"};w("chrome.cast.ReceiverType",chrome.cast.xa);chrome.cast.Qa={RUNNING:"running",STOPPED:"stopped",ERROR:"error"};w("chrome.cast.DialAppState",chrome.cast.Qa);chrome.cast.jb={CAST:"cast",STOP:"stop"};w("chrome.cast.ReceiverAction",chrome.cast.jb);
chrome.cast.K={CONNECTED:"connected",DISCONNECTED:"disconnected",STOPPED:"stopped"};w("chrome.cast.SessionStatus",chrome.cast.K);chrome.cast.Db={ATTENUATION:"attenuation",FIXED:"fixed",MASTER:"master"};w("chrome.cast.VolumeControlType",chrome.cast.Db);var ka=/&/g,la=/</g,ma=/>/g,na=/"/g,oa=/'/g,pa=/\x00/g,qa=/[\x00&<>"']/;/*

 Copyright Google LLC
 SPDX-License-Identifier: Apache-2.0
*/
var ra={};function sa(){if(ra!==ra)throw Error("Bad secret");};var ta=globalThis.trustedTypes,x;function ua(){var a=null;if(!ta)return a;try{var b=function(c){return c};a=ta.createPolicy("goog#html",{createHTML:b,createScript:b,createScriptURL:b})}catch(c){throw c;}return a};var y=function(a){sa();this.g=a};y.
```