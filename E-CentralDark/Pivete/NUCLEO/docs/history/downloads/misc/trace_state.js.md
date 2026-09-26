# OUTRO - trace_state.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api@1.9.1@@@1\build\esm\trace\trace_state.js.map
**SHA:** 59a12b1157cc1640
**Timestamp:** 2026-08-28T02:20:51.432742
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- {"version":3,"file":"trace_state.js","sourceRoot":"","sources":["../../../src/trace/trace_state.ts"],"names":[],"mappings":"AAAA;;;GAGG","sourcesContent":["/*\n * Copyright The OpenTelemetry Authors\n

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"trace_state.js","sourceRoot":"","sources":["../../../src/trace/trace_state.ts"],"names":[],"mappings":"AAAA;;;GAGG","sourcesContent":["/*\n * Copyright The OpenTelemetry Authors\n * SPDX-License-Identifier: Apache-2.0\n */\n\n/**\n * @since 1.0.0\n */\nexport interface TraceState {\n  /**\n   * Create a new TraceState which inherits from this TraceState and has the\n   * given key set.\n   * The new entry will always be added in the front of the list of states.\n   *\n   * @param key key of the TraceState entry.\n   * @param value value of the TraceState entry.\n   */\n  set(key: string, value: string): TraceState;\n\n  /**\n   * Return a new TraceState which inherits from this TraceState but does not\n   * contain the given key.\n   *\n   * @param key the key for the TraceState entry to be removed.\n   */\n  unset(key: string): TraceState;\n\n  /**\n   * Returns the value to which the specified key is mapped, or `undefined` if\n   * this map contains no mapping for the key.\n   *\n   * @param key with which the specified value is to be associated.\n   * @returns the value to which the specified key is mapped, or `undefined` if\n   *     this map contains no mapping for the key.\n   */\n  get(key: string): string | undefined;\n\n  // TODO: Consider to add support for merging an object as well by also\n  // accepting a single internalTraceState argument similar to the constructor.\n\n  /**\n   * Serializes the TraceState to a `list` as defined below. The `list` is a\n   * series of `list-members` separated by commas `,`, and a list-member is a\n   * key/value pair separated by an equals sign `=`. Spaces and horizontal tabs\n   * surrounding `list-members` are ignored. There can be a maximum of 32\n   * `list-members` in a `list`.\n   *\n   * @returns the serialized string.\n   */\n  serialize(): string;\n}\n"]}
```

---

# OUTRO - trace_state.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api@1.9.1@@@1\build\src\trace\trace_state.js.map
**SHA:** a5195095338a33e6
**Timestamp:** 2026-08-28T02:21:01.877400
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- {"version":3,"file":"trace_state.js","sourceRoot":"","sources":["../../../src/trace/trace_state.ts"],"names":[],"mappings":";AAAA;;;GAGG","sourcesContent":["/*\n * Copyright The OpenTelemetry Authors\

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"trace_state.js","sourceRoot":"","sources":["../../../src/trace/trace_state.ts"],"names":[],"mappings":";AAAA;;;GAGG","sourcesContent":["/*\n * Copyright The OpenTelemetry Authors\n * SPDX-License-Identifier: Apache-2.0\n */\n\n/**\n * @since 1.0.0\n */\nexport interface TraceState {\n  /**\n   * Create a new TraceState which inherits from this TraceState and has the\n   * given key set.\n   * The new entry will always be added in the front of the list of states.\n   *\n   * @param key key of the TraceState entry.\n   * @param value value of the TraceState entry.\n   */\n  set(key: string, value: string): TraceState;\n\n  /**\n   * Return a new TraceState which inherits from this TraceState but does not\n   * contain the given key.\n   *\n   * @param key the key for the TraceState entry to be removed.\n   */\n  unset(key: string): TraceState;\n\n  /**\n   * Returns the value to which the specified key is mapped, or `undefined` if\n   * this map contains no mapping for the key.\n   *\n   * @param key with which the specified value is to be associated.\n   * @returns the value to which the specified key is mapped, or `undefined` if\n   *     this map contains no mapping for the key.\n   */\n  get(key: string): string | undefined;\n\n  // TODO: Consider to add support for merging an object as well by also\n  // accepting a single internalTraceState argument similar to the constructor.\n\n  /**\n   * Serializes the TraceState to a `list` as defined below. The `list` is a\n   * series of `list-members` separated by commas `,`, and a list-member is a\n   * key/value pair separated by an equals sign `=`. Spaces and horizontal tabs\n   * surrounding `list-members` are ignored. There can be a maximum of 32\n   * `list-members` in a `list`.\n   *\n   * @returns the serialized string.\n   */\n  serialize(): string;\n}\n"]}
```