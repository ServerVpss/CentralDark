# MISSAO - lib.dom.iterable.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\typescript\lib\lib.dom.iterable.d.ts
**SHA:** 2e80ee7a49e8ac31
**Timestamp:** 2026-08-26T19:32:30.123709
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- vibrate(pattern: Iterable<number>): boolean;

### Ouro Bruto (primeiros 5000 chars)
```
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */


/// <reference no-default-lib="true"/>

/////////////////////////////
/// Window Iterable APIs
/////////////////////////////

interface AudioParam {
    /**
     * The **`setValueCurveAtTime()`** method of the following a curve defined by a list of values.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioParam/setValueCurveAtTime)
     */
    setValueCurveAtTime(values: Iterable<number>, startTime: number, duration: number): AudioParam;
}

interface AudioParamMap extends ReadonlyMap<string, AudioParam> {
}

interface BaseAudioContext {
    /**
     * The **`createIIRFilter()`** method of the BaseAudioContext interface creates an IIRFilterNode, which represents a general **infinite impulse response** (IIR) filter which can be configured to serve as various types of filter.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createIIRFilter)
     */
    createIIRFilter(feedforward: Iterable<number>, feedback: Iterable<number>): IIRFilterNode;
    /**
     * The `createPeriodicWave()` method of the BaseAudioContext interface is used to create a PeriodicWave.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/BaseAudioContext/createPeriodicWave)
     */
    createPeriodicWave(real: Iterable<number>, imag: Iterable<number>, constraints?: PeriodicWaveConstraints): PeriodicWave;
}

interface CSSKeyframesRule {
    [Symbol.iterator](): ArrayIterator<CSSKeyframeRule>;
}

interface CSSNumericArray {
    [Symbol.iterator](): ArrayIterator<CSSNumericValue>;
    entries(): ArrayIterator<[number, CSSNumericValue]>;
    keys(): ArrayIterator<number>;
    values(): ArrayIterator<CSSNumericValue>;
}

interface CSSRuleList {
    [Symbol.iterator](): ArrayIterator<CSSRule>;
}

interface CSSStyleDeclaration {
    [Symbol.iterator](): ArrayIterator<string>;
}

interface CSSTransformValue {
    [Symbol.iterator](): ArrayIterator<CSSTransformComponent>;
    entries(): ArrayIterator<[number, CSSTransformComponent]>;
    keys(): ArrayIterator<number>;
    values(): ArrayIterator<CSSTransformComponent>;
}

interface CSSUnparsedValue {
    [Symbol.iterator](): ArrayIterator<CSSUnparsedSegment>;
    entries(): ArrayIterator<[number, CSSUnparsedSegment]>;
    keys(): ArrayIterator<number>;
    values(): ArrayIterator<CSSUnparsedSegment>;
}

interface Cache {
    /**
     * The **`addAll()`** method of the Cache interface takes an array of URLs, retrieves them, and adds the resulting response objects to the given cache.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Cache/addAll)
     */
    addAll(requests: Iterable<RequestInfo>): Promise<void>;
}

interface CanvasPath {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/roundRect) */
    roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | Iterable<number | DOMPointInit>): void;
}

interface CanvasPathDrawingStyles {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash) */
    setLineDash(segments: Iterable<number>): void;
}

interface CookieStoreManager {
    /**
     * The **`subscribe()`** method of the CookieStoreManager interface subscribes a ServiceWorkerRegistration to cookie change events.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CookieStoreManager/subscribe)
     */
    subscribe(subscriptions: Iterable<CookieStoreGetOptions>): Promise<void>;
    /**
     * The **`unsubscribe()`** method of the CookieStoreManager interface stops the ServiceWorkerRegistration from receiving previously subscribed events.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/CookieStoreManager/unsubscribe)
     */
    unsubscribe(subscriptions: Iterable<CookieStoreGetOptions>): Promise<void>;
}

interface CustomStateSet extends Set<string> {
}

interface DOMRectList {
    [Symbol.iterator](): ArrayIterator<DOMRect>;
}

interface DOMStringList {
    [Symbol.iterator](): ArrayIterator<string>;
}

interface DOMTokenList {
    [Symbol.iterator](): ArrayIterator<string>;
    entries(): ArrayIterator<[number, string]>;
```