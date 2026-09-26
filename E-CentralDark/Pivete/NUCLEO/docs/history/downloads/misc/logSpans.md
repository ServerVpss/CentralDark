# OUTRO - logSpans.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\cjs\tracing\logSpans.js
**SHA:** 438312386408bc32
**Timestamp:** 2026-08-28T02:21:50.477075
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- exports.logSpanStart = logSpanStart;

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const debugBuild = require('../debug-build.js');
const debugLogger = require('../utils/debug-logger.js');
const spanUtils = require('../utils/spanUtils.js');

function logSpanStart(span) {
  if (!debugBuild.DEBUG_BUILD) return;
  const { description = "< unknown name >", op = "< unknown op >", parent_span_id: parentSpanId } = spanUtils.spanToJSON(span);
  const { spanId } = span.spanContext();
  const sampled = spanUtils.spanIsSampled(span);
  const rootSpan = spanUtils.getRootSpan(span);
  const isRootSpan = rootSpan === span;
  const header = `[Tracing] Starting ${sampled ? "sampled" : "unsampled"} ${isRootSpan ? "root " : ""}span`;
  const infoParts = [`op: ${op}`, `name: ${description}`, `ID: ${spanId}`];
  if (parentSpanId) {
    infoParts.push(`parent ID: ${parentSpanId}`);
  }
  if (!isRootSpan) {
    const { op: op2, description: description2 } = spanUtils.spanToJSON(rootSpan);
    infoParts.push(`root ID: ${rootSpan.spanContext().spanId}`);
    if (op2) {
      infoParts.push(`root op: ${op2}`);
    }
    if (description2) {
      infoParts.push(`root description: ${description2}`);
    }
  }
  debugLogger.debug.log(`${header}
  ${infoParts.join("\n  ")}`);
}
function logSpanEnd(span) {
  if (!debugBuild.DEBUG_BUILD) return;
  const { description = "< unknown name >", op = "< unknown op >" } = spanUtils.spanToJSON(span);
  const { spanId } = span.spanContext();
  const rootSpan = spanUtils.getRootSpan(span);
  const isRootSpan = rootSpan === span;
  const msg = `[Tracing] Finishing "${op}" ${isRootSpan ? "root " : ""}span "${description}" with ID ${spanId}`;
  debugLogger.debug.log(msg);
}

exports.logSpanEnd = logSpanEnd;
exports.logSpanStart = logSpanStart;
//# sourceMappingURL=logSpans.js.map

```