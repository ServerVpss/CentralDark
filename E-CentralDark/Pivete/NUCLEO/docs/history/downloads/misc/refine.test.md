# OUTRO - refine.test.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\src\v4\classic\tests\refine.test.ts
**SHA:** 6e420a6712788d94
**Timestamp:** 2026-08-28T02:28:37.199181
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Implement type narrowing for superRefine

### Ouro Bruto (primeiros 5000 chars)
```
import { describe, expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

describe("basic refinement functionality", () => {
  test("should create a new schema instance when refining", () => {
    const obj1 = z.object({
      first: z.string(),
      second: z.string(),
    });
    const obj2 = obj1.partial().strict();
    const obj3 = obj2.refine((data) => data.first || data.second, "Either first or second should be filled in.");

    expect(obj1 === (obj2 as any)).toEqual(false);
    expect(obj2 === (obj3 as any)).toEqual(false);
  });

  test("should validate according to refinement logic", () => {
    const schema = z
      .object({
        first: z.string(),
        second: z.string(),
      })
      .partial()
      .strict()
      .refine((data) => data.first || data.second, "Either first or second should be filled in.");

    // Should fail on empty object
    expect(() => schema.parse({})).toThrow();

    // Should pass with first property
    expect(schema.parse({ first: "a" })).toEqual({ first: "a" });

    // Should pass with second property
    expect(schema.parse({ second: "a" })).toEqual({ second: "a" });

    // Should pass with both properties
    expect(schema.parse({ first: "a", second: "a" })).toEqual({ first: "a", second: "a" });
  });

  test("should validate strict mode correctly", () => {
    const schema = z
      .object({
        first: z.string(),
        second: z.string(),
      })
      .partial()
      .strict();

    // Should throw on extra properties
    expect(() => schema.parse({ third: "adsf" })).toThrow();
  });
});

describe("refinement with custom error messages", () => {
  test("should use custom error message when validation fails", () => {
    const validationSchema = z
      .object({
        email: z.string().email(),
        password: z.string(),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, "Both password and confirmation must match");

    const result = validationSchema.safeParse({
      email: "aaaa@gmail.com",
      password: "aaaaaaaa",
      confirmPassword: "bbbbbbbb",
    });

    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toEqual("Both password and confirmation must match");
    }
  });
});

describe("async refinements", () => {
  test("should support async refinement functions", async () => {
    const validationSchema = z
      .object({
        email: z.string().email(),
        password: z.string(),
        confirmPassword: z.string(),
      })
      .refine(
        (data) => Promise.resolve().then(() => data.password === data.confirmPassword),
        "Both password and confirmation must match"
      );

    // Should pass with matching passwords
    const validData = {
      email: "aaaa@gmail.com",
      password: "password",
      confirmPassword: "password",
    };

    await expect(validationSchema.parseAsync(validData)).resolves.toEqual(validData);

    // Should fail with non-matching passwords
    await expect(
      validationSchema.parseAsync({
        email: "aaaa@gmail.com",
        password: "password",
        confirmPassword: "different",
      })
    ).rejects.toThrow();
  });
});

describe("early termination options", () => {
  test("should abort early with continue: false", () => {
    const schema = z
      .string()
      .superRefine((val, ctx) => {
        if (val.length < 2) {
          ctx.addIssue({
            code: "custom",
            message: "BAD",
            continue: false,
          });
        }
      })
      .refine((_) => false);

    const result = schema.safeParse("");
    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error.issues.length).toEqual(1);
      expect(result.error.issues[0].message).toEqual("BAD");
    }
  });

  test("should abort early with fatal: true", () => {
    const schema = z
      .string()
      .superRefine((val, ctx) => {
        if (val.length < 2) {
          ctx.addIssue({
            code: "custom",
            fatal: true,
            message: "BAD",
          });
        }
      })
      .refine((_) => false);

    const result = schema.safeParse("");
    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error.issues.length).toEqual(1);
      expect(result.error.issues[0].message).toEqual("BAD");
    }
  });

  test("should abort early with abort flag", () => {
    const schema = z
      .string()
      .refine((_) => false, { abort: true })
      .refine((_) => false);

    const result = schema.safeParse("");
    expect(result.success).toEqual(false);
    if (!result.success) {
      expect(result.error.issues.length).toEqual(1);
    }
  });
});

describe("custom error paths", () => {
  test("should use custom path in error message", () => {
    const result = z
      .object({ password: z.string(), confirm: z.string() })
      .refine((data) => da
```