# OUTRO - perf_hooks.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\perf_hooks.d.ts
**SHA:** 928af3d90454bf65
**Timestamp:** 2026-08-26T19:32:04.486417
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- readonly loopStart: number;
- readonly nodeStart: number;
- readonly v8Start: number;
- readonly workerStart: number;
- readonly redirectStart: number;
- readonly fetchStart: number;
- readonly domainLookupStart: number;
- readonly connectStart: number;
- readonly secureConnectionStart: number;
- readonly requestStart: number;

### Gaps
- // TODO: PerformanceNodeEntry is missing

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * This module provides an implementation of a subset of the W3C [Web Performance APIs](https://w3c.github.io/perf-timing-primer/) as well as additional APIs for
 * Node.js-specific performance measurements.
 *
 * Node.js supports the following [Web Performance APIs](https://w3c.github.io/perf-timing-primer/):
 *
 * * [High Resolution Time](https://www.w3.org/TR/hr-time-2)
 * * [Performance Timeline](https://w3c.github.io/performance-timeline/)
 * * [User Timing](https://www.w3.org/TR/user-timing/)
 * * [Resource Timing](https://www.w3.org/TR/resource-timing-2/)
 *
 * ```js
 * import { PerformanceObserver, performance } from 'node:perf_hooks';
 *
 * const obs = new PerformanceObserver((items) => {
 *   console.log(items.getEntries()[0].duration);
 *   performance.clearMarks();
 * });
 * obs.observe({ type: 'measure' });
 * performance.measure('Start to Now');
 *
 * performance.mark('A');
 * doSomeLongRunningProcess(() => {
 *   performance.measure('A to Now', 'A');
 *
 *   performance.mark('B');
 *   performance.measure('A to B', 'A', 'B');
 * });
 * ```
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/perf_hooks.js)
 */
declare module "perf_hooks" {
    import { AsyncResource } from "node:async_hooks";
    type EntryType =
        | "dns" // Node.js only
        | "function" // Node.js only
        | "gc" // Node.js only
        | "http2" // Node.js only
        | "http" // Node.js only
        | "mark" // available on the Web
        | "measure" // available on the Web
        | "net" // Node.js only
        | "node" // Node.js only
        | "resource"; // available on the Web
    interface NodeGCPerformanceDetail {
        /**
         * When `performanceEntry.entryType` is equal to 'gc', the `performance.kind` property identifies
         * the type of garbage collection operation that occurred.
         * See perf_hooks.constants for valid values.
         */
        readonly kind: number;
        /**
         * When `performanceEntry.entryType` is equal to 'gc', the `performance.flags`
         * property contains additional information about garbage collection operation.
         * See perf_hooks.constants for valid values.
         */
        readonly flags: number;
    }
    /**
     * The constructor of this class is not exposed to users directly.
     * @since v8.5.0
     */
    class PerformanceEntry {
        protected constructor();
        /**
         * The total number of milliseconds elapsed for this entry. This value will not
         * be meaningful for all Performance Entry types.
         * @since v8.5.0
         */
        readonly duration: number;
        /**
         * The name of the performance entry.
         * @since v8.5.0
         */
        readonly name: string;
        /**
         * The high resolution millisecond timestamp marking the starting time of the
         * Performance Entry.
         * @since v8.5.0
         */
        readonly startTime: number;
        /**
         * The type of the performance entry. It may be one of:
         *
         * * `'node'` (Node.js only)
         * * `'mark'` (available on the Web)
         * * `'measure'` (available on the Web)
         * * `'gc'` (Node.js only)
         * * `'function'` (Node.js only)
         * * `'http2'` (Node.js only)
         * * `'http'` (Node.js only)
         * @since v8.5.0
         */
        readonly entryType: EntryType;
        toJSON(): any;
    }
    /**
     * Exposes marks created via the `Performance.mark()` method.
     * @since v18.2.0, v16.17.0
     */
    class PerformanceMark extends PerformanceEntry {
        readonly detail: any;
        readonly duration: 0;
        readonly entryType: "mark";
    }
    /**
     * Exposes measures created via the `Performance.measure()` method.
     *
     * The constructor of this class is not exposed to users directly.
     * @since v18.2.0, v16.17.0
     */
    class PerformanceMeasure extends PerformanceEntry {
        readonly detail: any;
        readonly entryType: "measure";
    }
    interface UVMetrics {
        /**
         * Number of event loop iterations.
         */
        readonly loopCount: number;
        /**
         * Number of events that have been processed by the event handler.
         */
        readonly events: number;
        /**
         * Number of events that were waiting to be processed when the event provider was called.
         */
        readonly eventsWaiting: number;
    }
    // TODO: PerformanceNodeEntry is missing
    /**
     * _This property is an extension by Node.js. It is not available in Web browsers._
     *
     * Provides timing details for Node.js itself. The constructor of this class
     * is not exposed to users.
     * @since v8.5.0
     */
    class PerformanceNodeTiming extends PerformanceEntry {
        readonly entryType: "node";
        /**
         * The high resolution millisecond timestamp at which the Node.js process
         * completed bootstrapping. If bootstrapping ha
```