---
name: timing
description: Interpolation and timing in Remotion—prefer interpolate with Bézier easing; springs as a specialized option
metadata:
  tags: easing, bezier, interpolation, spring, timing
---

Drive motion with `interpolate()` over explicit frame range. To customize timing, use **`Easing.bezier`**. The four parameters are the same as CSS `cubic-bezier(x1, y1, x2, y2)`.

A simple linear interpolation is done using the `interpolate` function.

```ts title="Going from 0 to 1 over 100 frames"
import { interpolate } from "remotion";

const opacity = interpolate(frame, [0, 100], [0, 1]);
```

By default, the values are not clamped, so the value can go outside the range [0, 1].  
Here is how they can be clamped:

```ts title="Going from 0 to 1 over 100 frames with extrapolation"
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: "clamp",
  extrapolateLeft: "clamp",
});
```

## Bézier easing

Use `Easing.bezier(x1, y1, x2, y2)` inside the `interpolate` options object. The curve is identical in spirit to CSS animations and transitions, which helps when you are stealing timing from the web or from a designer’s spec.

```ts
import { interpolate, Easing } from "remotion";

const opacity = interpolate(frame, [0, 60], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### Examples (copy-paste curves)

**1. Crisp UI entrance (strong ease-out, no overshoot)** — slows nicely into the rest value; similar to many system “deceleration” curves.

```tsx
const enter = interpolate(frame, [0, 45], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**2. Editorial / slow fade (balanced ease-in-out)** — symmetric acceleration and deceleration over a hold-friendly move.

```tsx
const progress = interpolate(frame, [0, 90], [0, 1], {
  easing: Easing.bezier(0.45, 0, 0.55, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**3. Playful overshoot (control point y > 1)** — a little past the target then settles; use sparingly for emphasis.

```tsx
const pop = interpolate(frame, [0, 30], [0, 1], {
  easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

## Preset easings (`Easing.in` / `Easing.out` / named curves)

Easing can be added to the `interpolate` function without a custom cubic:

```ts
import { interpolate, Easing } from "remotion";

const value1 = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.cubic),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

The default easing is `Easing.linear`.  
Convexities:

- `Easing.in` — starting slow and accelerating
- `Easing.out` — starting fast and slowing down
- `Easing.inOut`

Named curves (from most linear to most curved):

- `Easing.quad`
- `Easing.cubic` (good default when you do not need a custom cubic)
- `Easing.sin`
- `Easing.exp`
- `Easing.circle`

### Easing direction for enter/exit animations

Use `Easing.out` for enter animations (starts fast, decelerates into place) and `Easing.in` for exit animations (starts slow, accelerates away). This feels natural because elements arrive with momentum and leave with gravity. When you need a specific curve from design, prefer a single `Easing.bezier(...)` instead of stacking presets.

## Composing interpolations

When multiple properties share the same timing (e.g. a slide-in panel and a video shift), avoid duplicating the full interpolation for each property. Instead, create a single normalized progress value (0 to 1) and derive each property from it:

```tsx
const slideIn = interpolate(
  frame,
  [slideInStart, slideInStart + slideInDuration],
  [0, 1],
  {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  },
);
const slideOut = interpolate(
  frame,
  [slideOutStart, slideOutStart + slideOutDuration],
  [0, 1],
  { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
const progress = slideIn - slideOut;

// Derive multiple properties from the same progress
const overlayX = interpolate(progress, [0, 1], [100, 0]);
const videoX = interpolate(progress, [0, 1], [0, -20]);
const opacity = interpolate(progress, [0, 1], [0, 1]);
```

The key idea: separate **timing** (when and how fast) from **mapping** (what values to animate between).


---

# OUTRO - timing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\hono\dist\cjs\middleware\timing\timing.js
**SHA:** bf983794fdf57218
**Timestamp:** 2026-08-26T19:32:09.878834
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- metrics.timers.set(name, { description, start: getTime() });

### Ouro Bruto (primeiros 5000 chars)
```
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var timing_exports = {};
__export(timing_exports, {
  endTime: () => endTime,
  setMetric: () => setMetric,
  startTime: () => startTime,
  timing: () => timing,
  wrapTime: () => wrapTime
});
module.exports = __toCommonJS(timing_exports);
var import_context = require("../../context");
const getTime = () => {
  try {
    return performance.now();
  } catch {
  }
  return Date.now();
};
const timing = (config) => {
  const options = {
    total: true,
    enabled: true,
    totalDescription: "Total Response Time",
    autoEnd: true,
    crossOrigin: false,
    ...config
  };
  return async function timing2(c, next) {
    const headers = [];
    const timers = /* @__PURE__ */ new Map();
    if (c.get("metric")) {
      return await next();
    }
    c.set("metric", { headers, timers });
    if (options.total) {
      startTime(c, "total", options.totalDescription);
    }
    await next();
    if (options.total) {
      endTime(c, "total");
    }
    if (options.autoEnd) {
      timers.forEach((_, key) => endTime(c, key));
    }
    const enabled = typeof options.enabled === "function" ? options.enabled(c) : options.enabled;
    if (enabled) {
      c.res.headers.append("Server-Timing", headers.join(","));
      const crossOrigin = typeof options.crossOrigin === "function" ? options.crossOrigin(c) : options.crossOrigin;
      if (crossOrigin) {
        c.res.headers.append(
          "Timing-Allow-Origin",
          typeof crossOrigin === "string" ? crossOrigin : "*"
        );
      }
    }
  };
};
const setMetric = (c, name, valueDescription, description, precision) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  if (typeof valueDescription === "number") {
    const dur = valueDescription.toFixed(precision || 1);
    const metric = description ? `${name};dur=${dur};desc="${description}"` : `${name};dur=${dur}`;
    metrics.headers.push(metric);
  } else {
    const metric = valueDescription ? `${name};desc="${valueDescription}"` : `${name}`;
    metrics.headers.push(metric);
  }
};
const startTime = (c, name, description) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  metrics.timers.set(name, { description, start: getTime() });
};
const endTime = (c, name, precision) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  const timer = metrics.timers.get(name);
  if (!timer) {
    console.warn(`Timer "${name}" does not exist!`);
    return;
  }
  const { description, start } = timer;
  const duration = getTime() - start;
  setMetric(c, name, duration, description, precision);
  metrics.timers.delete(name);
};
async function wrapTime(c, name, callable, description, precision) {
  startTime(c, name, description);
  try {
    return await callable;
  } finally {
    endTime(c, name, precision);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  endTime,
  setMetric,
  startTime,
  timing,
  wrapTime
});

```

---

# OUTRO - timing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\hono\dist\middleware\timing\timing.js
**SHA:** 75664ce3099704b5
**Timestamp:** 2026-08-26T19:32:11.473670
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- metrics.timers.set(name, { description, start: getTime() });

### Ouro Bruto (primeiros 5000 chars)
```
// src/middleware/timing/timing.ts
import "../../context.js";
var getTime = () => {
  try {
    return performance.now();
  } catch {
  }
  return Date.now();
};
var timing = (config) => {
  const options = {
    total: true,
    enabled: true,
    totalDescription: "Total Response Time",
    autoEnd: true,
    crossOrigin: false,
    ...config
  };
  return async function timing2(c, next) {
    const headers = [];
    const timers = /* @__PURE__ */ new Map();
    if (c.get("metric")) {
      return await next();
    }
    c.set("metric", { headers, timers });
    if (options.total) {
      startTime(c, "total", options.totalDescription);
    }
    await next();
    if (options.total) {
      endTime(c, "total");
    }
    if (options.autoEnd) {
      timers.forEach((_, key) => endTime(c, key));
    }
    const enabled = typeof options.enabled === "function" ? options.enabled(c) : options.enabled;
    if (enabled) {
      c.res.headers.append("Server-Timing", headers.join(","));
      const crossOrigin = typeof options.crossOrigin === "function" ? options.crossOrigin(c) : options.crossOrigin;
      if (crossOrigin) {
        c.res.headers.append(
          "Timing-Allow-Origin",
          typeof crossOrigin === "string" ? crossOrigin : "*"
        );
      }
    }
  };
};
var setMetric = (c, name, valueDescription, description, precision) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  if (typeof valueDescription === "number") {
    const dur = valueDescription.toFixed(precision || 1);
    const metric = description ? `${name};dur=${dur};desc="${description}"` : `${name};dur=${dur}`;
    metrics.headers.push(metric);
  } else {
    const metric = valueDescription ? `${name};desc="${valueDescription}"` : `${name}`;
    metrics.headers.push(metric);
  }
};
var startTime = (c, name, description) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  metrics.timers.set(name, { description, start: getTime() });
};
var endTime = (c, name, precision) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  const timer = metrics.timers.get(name);
  if (!timer) {
    console.warn(`Timer "${name}" does not exist!`);
    return;
  }
  const { description, start } = timer;
  const duration = getTime() - start;
  setMetric(c, name, duration, description, precision);
  metrics.timers.delete(name);
};
async function wrapTime(c, name, callable, description, precision) {
  startTime(c, name, description);
  try {
    return await callable;
  } finally {
    endTime(c, name, precision);
  }
}
export {
  endTime,
  setMetric,
  startTime,
  timing,
  wrapTime
};

```

---

# OUTRO - timing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\hono@4.13.4@@@1\dist\cjs\middleware\timing\timing.js
**SHA:** a6cabc74a9d7641c
**Timestamp:** 2026-08-28T02:24:25.394915
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- metrics.timers.set(name, { description, start: getTime() });

### Ouro Bruto (primeiros 5000 chars)
```
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var timing_exports = {};
__export(timing_exports, {
  endTime: () => endTime,
  setMetric: () => setMetric,
  startTime: () => startTime,
  timing: () => timing,
  wrapTime: () => wrapTime
});
module.exports = __toCommonJS(timing_exports);
var import_context = require("../../context");
const getTime = () => {
  try {
    return performance.now();
  } catch {
  }
  return Date.now();
};
const timing = (config) => {
  const options = {
    total: true,
    enabled: true,
    totalDescription: "Total Response Time",
    autoEnd: true,
    crossOrigin: false,
    ...config
  };
  return async function timing2(c, next) {
    const headers = [];
    const timers = /* @__PURE__ */ new Map();
    if (c.get("metric")) {
      return await next();
    }
    c.set("metric", { headers, timers });
    if (options.total) {
      startTime(c, "total", options.totalDescription);
    }
    await next();
    if (options.total) {
      endTime(c, "total");
    }
    if (options.autoEnd) {
      timers.forEach((_, key) => {
        endTime(c, key);
      });
    }
    const enabled = typeof options.enabled === "function" ? options.enabled(c) : options.enabled;
    if (enabled) {
      c.res.headers.append("Server-Timing", headers.join(","));
      const crossOrigin = typeof options.crossOrigin === "function" ? options.crossOrigin(c) : options.crossOrigin;
      if (crossOrigin) {
        c.res.headers.append(
          "Timing-Allow-Origin",
          typeof crossOrigin === "string" ? crossOrigin : "*"
        );
      }
    }
  };
};
const setMetric = (c, name, valueDescription, description, precision) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  if (typeof valueDescription === "number") {
    const dur = valueDescription.toFixed(precision || 1);
    const metric = description ? `${name};dur=${dur};desc="${description}"` : `${name};dur=${dur}`;
    metrics.headers.push(metric);
  } else {
    const metric = valueDescription ? `${name};desc="${valueDescription}"` : `${name}`;
    metrics.headers.push(metric);
  }
};
const startTime = (c, name, description) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  metrics.timers.set(name, { description, start: getTime() });
};
const endTime = (c, name, precision) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  const timer = metrics.timers.get(name);
  if (!timer) {
    console.warn(`Timer "${name}" does not exist!`);
    return;
  }
  const { description, start } = timer;
  const duration = getTime() - start;
  setMetric(c, name, duration, description, precision);
  metrics.timers.delete(name);
};
async function wrapTime(c, name, callable, description, precision) {
  startTime(c, name, description);
  try {
    return await callable;
  } finally {
    endTime(c, name, precision);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  endTime,
  setMetric,
  startTime,
  timing,
  wrapTime
});

```

---

# OUTRO - timing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\hono@4.13.4@@@1\dist\middleware\timing\timing.js
**SHA:** 151056fe0c01a380
**Timestamp:** 2026-08-28T02:24:29.984817
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- metrics.timers.set(name, { description, start: getTime() });

### Ouro Bruto (primeiros 5000 chars)
```
// src/middleware/timing/timing.ts
import "../../context.js";
var getTime = () => {
  try {
    return performance.now();
  } catch {
  }
  return Date.now();
};
var timing = (config) => {
  const options = {
    total: true,
    enabled: true,
    totalDescription: "Total Response Time",
    autoEnd: true,
    crossOrigin: false,
    ...config
  };
  return async function timing2(c, next) {
    const headers = [];
    const timers = /* @__PURE__ */ new Map();
    if (c.get("metric")) {
      return await next();
    }
    c.set("metric", { headers, timers });
    if (options.total) {
      startTime(c, "total", options.totalDescription);
    }
    await next();
    if (options.total) {
      endTime(c, "total");
    }
    if (options.autoEnd) {
      timers.forEach((_, key) => {
        endTime(c, key);
      });
    }
    const enabled = typeof options.enabled === "function" ? options.enabled(c) : options.enabled;
    if (enabled) {
      c.res.headers.append("Server-Timing", headers.join(","));
      const crossOrigin = typeof options.crossOrigin === "function" ? options.crossOrigin(c) : options.crossOrigin;
      if (crossOrigin) {
        c.res.headers.append(
          "Timing-Allow-Origin",
          typeof crossOrigin === "string" ? crossOrigin : "*"
        );
      }
    }
  };
};
var setMetric = (c, name, valueDescription, description, precision) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  if (typeof valueDescription === "number") {
    const dur = valueDescription.toFixed(precision || 1);
    const metric = description ? `${name};dur=${dur};desc="${description}"` : `${name};dur=${dur}`;
    metrics.headers.push(metric);
  } else {
    const metric = valueDescription ? `${name};desc="${valueDescription}"` : `${name}`;
    metrics.headers.push(metric);
  }
};
var startTime = (c, name, description) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  metrics.timers.set(name, { description, start: getTime() });
};
var endTime = (c, name, precision) => {
  const metrics = c.get("metric");
  if (!metrics) {
    console.warn("Metrics not initialized! Please add the `timing()` middleware to this route!");
    return;
  }
  const timer = metrics.timers.get(name);
  if (!timer) {
    console.warn(`Timer "${name}" does not exist!`);
    return;
  }
  const { description, start } = timer;
  const duration = getTime() - start;
  setMetric(c, name, duration, description, precision);
  metrics.timers.delete(name);
};
async function wrapTime(c, name, callable, description, precision) {
  startTime(c, name, description);
  try {
    return await callable;
  } finally {
    endTime(c, name, precision);
  }
}
export {
  endTime,
  setMetric,
  startTime,
  timing,
  wrapTime
};

```