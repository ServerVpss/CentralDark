# COMANDO - console.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node-core@10.71.0@@@1\build\cjs\integrations\console.js
**SHA:** 7dce6609a9c1259c
**Timestamp:** 2026-08-28T02:22:38.311151
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- let delegate = nativeMethod;
- delegate = savedDelegate;
- savedDelegate = void 0;
- savedDelegate = delegate;
- delegate = newValue;

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const core = require('@sentry/core');

const consoleIntegration = core.defineIntegration((options = {}) => {
  return {
    name: "Console",
    setup(client) {
      if (process.env.LAMBDA_TASK_ROOT) {
        core.maybeInstrument("console", instrumentConsoleLambda);
      }
      const core$1 = core.consoleIntegration({
        ...options,
        filter: [
          ...options.filter || [],
          // Deprecation on Node 26 for module.require(), which is used by IITM
          "[DEP0205] DeprecationWarning"
        ]
      });
      core$1.setup?.(client);
    }
  };
});
function instrumentConsoleLambda() {
  const consoleObj = core.GLOBAL_OBJ?.console;
  if (!consoleObj) {
    return;
  }
  core.CONSOLE_LEVELS.forEach((level) => {
    if (level in consoleObj) {
      patchWithDefineProperty(consoleObj, level);
    }
  });
}
function patchWithDefineProperty(consoleObj, level) {
  const nativeMethod = consoleObj[level];
  core.originalConsoleMethods[level] = nativeMethod;
  let delegate = nativeMethod;
  let savedDelegate;
  let isExecuting = false;
  const wrapper = function(...args) {
    if (isExecuting) {
      nativeMethod.apply(consoleObj, args);
      return;
    }
    isExecuting = true;
    try {
      core.triggerHandlers("console", { args, level });
      delegate.apply(consoleObj, args);
    } finally {
      isExecuting = false;
    }
  };
  core.markFunctionWrapped(wrapper, nativeMethod);
  const sandboxBypass = nativeMethod.bind(consoleObj);
  core.originalConsoleMethods[level] = sandboxBypass;
  try {
    let current = wrapper;
    Object.defineProperty(consoleObj, level, {
      configurable: true,
      enumerable: true,
      get() {
        return current;
      },
      set(newValue) {
        if (newValue === wrapper) {
          if (savedDelegate !== void 0) {
            delegate = savedDelegate;
            savedDelegate = void 0;
          }
          current = wrapper;
        } else if (newValue === sandboxBypass) {
          savedDelegate = delegate;
          current = sandboxBypass;
        } else if (typeof newValue === "function" && !newValue.__sentry_original__) {
          delegate = newValue;
          current = wrapper;
        } else {
          current = newValue;
        }
      }
    });
  } catch {
    core.fill(consoleObj, level, function(originalConsoleMethod) {
      core.originalConsoleMethods[level] = originalConsoleMethod;
      return function(...args) {
        core.triggerHandlers("console", { args, level });
        core.originalConsoleMethods[level]?.apply(this, args);
      };
    });
  }
}

exports.consoleIntegration = consoleIntegration;
//# sourceMappingURL=console.js.map

```

---

# COMANDO - console.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node-core@10.71.0@@@1\build\esm\integrations\console.js
**SHA:** 1d82f689b7f1f700
**Timestamp:** 2026-08-28T02:22:41.422443
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- let delegate = nativeMethod;
- delegate = savedDelegate;
- savedDelegate = void 0;
- savedDelegate = delegate;
- delegate = newValue;

### Ouro Bruto (primeiros 5000 chars)
```
import { defineIntegration, maybeInstrument, consoleIntegration as consoleIntegration$1, GLOBAL_OBJ, CONSOLE_LEVELS, originalConsoleMethods, markFunctionWrapped, fill, triggerHandlers } from '@sentry/core';

const consoleIntegration = defineIntegration((options = {}) => {
  return {
    name: "Console",
    setup(client) {
      if (process.env.LAMBDA_TASK_ROOT) {
        maybeInstrument("console", instrumentConsoleLambda);
      }
      const core = consoleIntegration$1({
        ...options,
        filter: [
          ...options.filter || [],
          // Deprecation on Node 26 for module.require(), which is used by IITM
          "[DEP0205] DeprecationWarning"
        ]
      });
      core.setup?.(client);
    }
  };
});
function instrumentConsoleLambda() {
  const consoleObj = GLOBAL_OBJ?.console;
  if (!consoleObj) {
    return;
  }
  CONSOLE_LEVELS.forEach((level) => {
    if (level in consoleObj) {
      patchWithDefineProperty(consoleObj, level);
    }
  });
}
function patchWithDefineProperty(consoleObj, level) {
  const nativeMethod = consoleObj[level];
  originalConsoleMethods[level] = nativeMethod;
  let delegate = nativeMethod;
  let savedDelegate;
  let isExecuting = false;
  const wrapper = function(...args) {
    if (isExecuting) {
      nativeMethod.apply(consoleObj, args);
      return;
    }
    isExecuting = true;
    try {
      triggerHandlers("console", { args, level });
      delegate.apply(consoleObj, args);
    } finally {
      isExecuting = false;
    }
  };
  markFunctionWrapped(wrapper, nativeMethod);
  const sandboxBypass = nativeMethod.bind(consoleObj);
  originalConsoleMethods[level] = sandboxBypass;
  try {
    let current = wrapper;
    Object.defineProperty(consoleObj, level, {
      configurable: true,
      enumerable: true,
      get() {
        return current;
      },
      set(newValue) {
        if (newValue === wrapper) {
          if (savedDelegate !== void 0) {
            delegate = savedDelegate;
            savedDelegate = void 0;
          }
          current = wrapper;
        } else if (newValue === sandboxBypass) {
          savedDelegate = delegate;
          current = sandboxBypass;
        } else if (typeof newValue === "function" && !newValue.__sentry_original__) {
          delegate = newValue;
          current = wrapper;
        } else {
          current = newValue;
        }
      }
    });
  } catch {
    fill(consoleObj, level, function(originalConsoleMethod) {
      originalConsoleMethods[level] = originalConsoleMethod;
      return function(...args) {
        triggerHandlers("console", { args, level });
        originalConsoleMethods[level]?.apply(this, args);
      };
    });
  }
}

export { consoleIntegration };
//# sourceMappingURL=console.js.map

```