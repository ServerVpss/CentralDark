# COMANDO - preprocess.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\src\v4\classic\tests\preprocess.test.ts
**SHA:** 8b8b4ac142419034
**Timestamp:** 2026-08-28T02:28:35.432125
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing: z.string().refine(() => false),

### Ouro Bruto (primeiros 5000 chars)
```
import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

test("preprocess", () => {
  const schema = z.preprocess((data) => [data], z.string().array());
  const value = schema.parse("asdf");
  expect(value).toEqual(["asdf"]);
  expectTypeOf<(typeof schema)["_input"]>().toEqualTypeOf<unknown>();
});

test("async preprocess", async () => {
  const schema = z.preprocess(async (data) => {
    return [data];
  }, z.string().array());
  const value = await schema.safeParseAsync("asdf");
  expect(value.data).toEqual(["asdf"]);
  expect(value).toMatchInlineSnapshot(`
    {
      "data": [
        "asdf",
      ],
      "success": true,
    }
  `);
});

test("ctx.addIssue accepts string", () => {
  const schema = z.preprocess((_, ctx) => {
    ctx.addIssue("bad stuff");
  }, z.string());
  const result = schema.safeParse("asdf");
  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "message": "bad stuff",
        "code": "custom",
        "path": []
      }
    ]],
      "success": false,
    }
  `);
});

test("preprocess ctx.addIssue with parse", () => {
  const a = z.preprocess((data, ctx) => {
    ctx.addIssue({
      input: data,
      code: "custom",
      message: `${data} is not one of our allowed strings`,
    });
    return data;
  }, z.string());

  const result = a.safeParse("asdf");

  // expect(result.error!.toJSON()).toContain("not one of our allowed strings");

  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "message": "asdf is not one of our allowed strings",
        "path": []
      }
    ]],
      "success": false,
    }
  `);
});

test("preprocess ctx.addIssue fatal by default", () => {
  const schema = z.preprocess((data, ctx) => {
    ctx.addIssue({
      code: "custom",
      message: `custom error`,
    });

    return data;
  }, z.string());
  const result = schema.safeParse(1234);

  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "message": "custom error",
        "path": []
      }
    ]],
      "success": false,
    }
  `);
});

test("preprocess ctx.addIssue fatal true", () => {
  const schema = z.preprocess((data, ctx) => {
    ctx.addIssue({
      input: data,
      code: "custom",
      origin: "custom",
      message: `custom error`,
      fatal: true,
    });
    return data;
  }, z.string());

  const result = schema.safeParse(1234);

  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "origin": "custom",
        "message": "custom error",
        "fatal": true,
        "path": []
      }
    ]],
      "success": false,
    }
  `);
});

test("async preprocess ctx.addIssue with parseAsync", async () => {
  const schema = z.preprocess(async (data, ctx) => {
    ctx.addIssue({
      input: data,
      code: "custom",
      message: `${data} is not one of our allowed strings`,
    });
    return data;
  }, z.string());

  const result = await schema.safeParseAsync("asdf");

  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "message": "asdf is not one of our allowed strings",
        "path": []
      }
    ]],
      "success": false,
    }
  `);
});

test("z.NEVER in preprocess", () => {
  const foo = z.preprocess((val, ctx) => {
    if (!val) {
      ctx.addIssue({ input: val, code: "custom", message: "bad" });
      return z.NEVER;
    }
    return val;
  }, z.number());

  type foo = z.infer<typeof foo>;
  expectTypeOf<foo>().toEqualTypeOf<number>();
  const result = foo.safeParse(undefined);

  expect(result.error!.issues).toHaveLength(1);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "message": "bad",
        "path": []
      }
    ]],
      "success": false,
    }
  `);
});

test("preprocess as the second property of object", () => {
  const schema = z.object({
    nonEmptyStr: z.string().min(1),
    positiveNum: z.preprocess((v) => Number(v), z.number().positive()),
  });
  const result = schema.safeParse({
    nonEmptyStr: "",
    positiveNum: "",
  });

  expect(result.error!.issues).toHaveLength(2);
  expect(result).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "origin": "string",
        "code": "too_small",
        "minimum": 1,
        "inclusive": true,
        "path": [
          "nonEmptyStr"
        ],
        "message": "Too small: expected string to have >=1 characters"
      },
      {
        "origin": "number",
        "code": "too_small",
        "minimum": 0,
        "inclusive": false,
        "path": [
 
```