# OUTRO - from-json-schema.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\src\v4\classic\tests\from-json-schema.test.ts
**SHA:** 21c067addb40013d
**Timestamp:** 2026-08-28T02:28:13.796685
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "^[a-z]+$",
- pattern: "foo",
- // type: string AND (type:string,minLength:5 OR type:string,pattern:^a)
- { type: "string", pattern: "^a" },
- // Should pass: string AND (minLength:5 OR pattern:^a) - matches minLength
- // Should pass: string AND (minLength:5 OR pattern:^a) - matches pattern
- // type: string AND (exactly one of: type:string,minLength:5 OR type:string,pattern:^a)
- { type: "string", pattern: "^a" },
- // Should pass: string AND pattern:^a (exactly one match - "abc" starts with 'a', length 3 < 5)

### Ouro Bruto (primeiros 5000 chars)
```
import { expect, test } from "vitest";
import { fromJSONSchema } from "../from-json-schema.js";
import * as z from "../index.js";

test("basic string schema", () => {
  const schema = fromJSONSchema({ type: "string" });
  expect(schema.parse("hello")).toBe("hello");
  expect(() => schema.parse(123)).toThrow();
});

test("string with constraints", () => {
  const schema = fromJSONSchema({
    type: "string",
    minLength: 3,
    maxLength: 10,
    pattern: "^[a-z]+$",
  });
  expect(schema.parse("hello")).toBe("hello");
  expect(schema.parse("helloworld")).toBe("helloworld"); // exactly 10 chars - valid
  expect(() => schema.parse("hi")).toThrow(); // too short
  expect(() => schema.parse("helloworld1")).toThrow(); // too long (11 chars)
  expect(() => schema.parse("Hello")).toThrow(); // pattern mismatch
});

test("pattern is not implicitly anchored", () => {
  // JSON Schema patterns match anywhere in the string, not just the full string
  const schema = fromJSONSchema({
    type: "string",
    pattern: "foo",
  });
  expect(schema.parse("foo")).toBe("foo");
  expect(schema.parse("foobar")).toBe("foobar"); // matches at start
  expect(schema.parse("barfoo")).toBe("barfoo"); // matches at end
  expect(schema.parse("barfoobar")).toBe("barfoobar"); // matches in middle
  expect(() => schema.parse("bar")).toThrow(); // no match
});

test("number schema", () => {
  const schema = fromJSONSchema({ type: "number" });
  expect(schema.parse(42)).toBe(42);
  expect(() => schema.parse("42")).toThrow();
});

test("number with constraints", () => {
  const schema = fromJSONSchema({
    type: "number",
    minimum: 0,
    maximum: 100,
    multipleOf: 5,
  });
  expect(schema.parse(50)).toBe(50);
  expect(() => schema.parse(-1)).toThrow();
  expect(() => schema.parse(101)).toThrow();
  expect(() => schema.parse(47)).toThrow(); // not multiple of 5
});

test("integer schema", () => {
  const schema = fromJSONSchema({ type: "integer" });
  expect(schema.parse(42)).toBe(42);
  expect(() => schema.parse(42.5)).toThrow();
});

test("boolean schema", () => {
  const schema = fromJSONSchema({ type: "boolean" });
  expect(schema.parse(true)).toBe(true);
  expect(schema.parse(false)).toBe(false);
  expect(() => schema.parse("true")).toThrow();
});

test("null schema", () => {
  const schema = fromJSONSchema({ type: "null" });
  expect(schema.parse(null)).toBe(null);
  expect(() => schema.parse(undefined)).toThrow();
});

test("object schema", () => {
  const schema = fromJSONSchema({
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number" },
    },
    required: ["name"],
  });
  expect(schema.parse({ name: "John", age: 30 })).toEqual({ name: "John", age: 30 });
  expect(schema.parse({ name: "John" })).toEqual({ name: "John" });
  expect(() => schema.parse({ age: 30 })).toThrow(); // missing required
});

test("object with additionalProperties false", () => {
  const schema = fromJSONSchema({
    type: "object",
    properties: {
      name: { type: "string" },
    },
    additionalProperties: false,
  });
  expect(schema.parse({ name: "John" })).toEqual({ name: "John" });
  expect(() => schema.parse({ name: "John", extra: "field" })).toThrow();
});

test("array schema", () => {
  const schema = fromJSONSchema({
    type: "array",
    items: { type: "string" },
  });
  expect(schema.parse(["a", "b", "c"])).toEqual(["a", "b", "c"]);
  expect(() => schema.parse([1, 2, 3])).toThrow();
});

test("array with constraints", () => {
  const schema = fromJSONSchema({
    type: "array",
    items: { type: "number" },
    minItems: 2,
    maxItems: 4,
  });
  expect(schema.parse([1, 2])).toEqual([1, 2]);
  expect(schema.parse([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  expect(() => schema.parse([1])).toThrow();
  expect(() => schema.parse([1, 2, 3, 4, 5])).toThrow();
});

test("tuple with prefixItems (draft-2020-12)", () => {
  const schema = fromJSONSchema({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "array",
    prefixItems: [{ type: "string" }, { type: "number" }],
  });
  expect(schema.parse(["hello", 42])).toEqual(["hello", 42]);
  expect(() => schema.parse(["hello"])).toThrow();
  expect(() => schema.parse(["hello", "world"])).toThrow();
});

test("tuple with items array (draft-7)", () => {
  const schema = fromJSONSchema({
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    items: [{ type: "string" }, { type: "number" }],
    additionalItems: false,
  });
  expect(schema.parse(["hello", 42])).toEqual(["hello", 42]);
  expect(() => schema.parse(["hello", 42, "extra"])).toThrow();
});

test("enum schema", () => {
  const schema = fromJSONSchema({
    enum: ["red", "green", "blue"],
  });
  expect(schema.parse("red")).toBe("red");
  expect(() => schema.parse("yellow")).toThrow();
});

test("const schema", () => {
  const schema = fromJSONSchema({
    const: "hello",
  });
  expect(schema.parse("hello")).toBe("hello");
  expect(() => schema.par
```