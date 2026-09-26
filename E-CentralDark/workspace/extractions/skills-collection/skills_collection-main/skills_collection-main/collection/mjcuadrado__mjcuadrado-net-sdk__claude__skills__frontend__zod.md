---
name: zod
description: TypeScript-first schema validation with type inference and runtime safety
version: 0.1.0
tags: [frontend, typescript, validation, zod, schema]
---

# Zod Schema Validation

Zod es una biblioteca TypeScript-first para declaración y validación de esquemas con inferencia de tipos automática.

## 🎯 Overview

**Por qué Zod en mj2:**
- **TypeScript-first:** Diseñado específicamente para TypeScript
- **Type inference:** Los tipos se infieren automáticamente desde los schemas
- **Zero dependencies:** Sin dependencias externas
- **Runtime validation:** Validación en tiempo de ejecución con tipos estáticos
- **Composable:** Schemas reutilizables y componibles
- **Developer experience:** Mensajes de error claros y personalizables

---

## 📦 Setup Básico

```bash
npm install zod
```

**package.json:**
```json
{
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

**tsconfig.json (recomendado):**
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

---

## 🔧 Basic Schemas

### Primitive Types

```typescript
import { z } from 'zod';

// String
const nameSchema = z.string();
nameSchema.parse("John"); // ✅ "John"
nameSchema.parse(123); // ❌ ZodError

// Number
const ageSchema = z.number();
ageSchema.parse(25); // ✅ 25
ageSchema.parse("25"); // ❌ ZodError

// Boolean
const isActiveSchema = z.boolean();
isActiveSchema.parse(true); // ✅ true

// Date
const birthdateSchema = z.date();
birthdateSchema.parse(new Date()); // ✅ Date

// Undefined / Null
const undefinedSchema = z.undefined();
const nullSchema = z.null();
```

### String Validations

```typescript
// String constraints
const emailSchema = z.string().email();
const urlSchema = z.string().url();
const uuidSchema = z.string().uuid();

// Length constraints
const usernameSchema = z.string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters");

// Regex
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);

// Transformations
const trimmedSchema = z.string().trim();
const lowercaseSchema = z.string().toLowerCase();

// Custom validation
const strongPasswordSchema = z.string()
  .min(8)
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");
```

### Number Validations

```typescript
// Number constraints
const positiveSchema = z.number().positive();
const negativeSchema = z.number().negative();
const nonNegativeSchema = z.number().nonnegative(); // >= 0
const nonPositiveSchema = z.number().nonpositive(); // <= 0

// Min/Max
const ageSchema = z.number()
  .int("Age must be an integer")
  .min(0, "Age cannot be negative")
  .max(120, "Age seems unrealistic");

// Finite
const finiteSchema = z.number().finite(); // No Infinity or NaN

// Multiple of
const evenSchema = z.number().multipleOf(2);
const priceSchema = z.number().multipleOf(0.01); // Cents precision
```

---

## 📋 Object Schemas

### Basic Objects

```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

// Infer TypeScript type
type User = z.infer<typeof userSchema>;
// type User = {
//   id: number;
//   name: string;
//   email: string;
//   age?: number | undefined;
// }

// Parse data
const user = userSchema.parse({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  age: 30
});
```

### Optional & Nullable Fields

```typescript
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),

  // Optional (can be undefined or omitted)
  age: z.number().optional(),

  // Nullable (can be null)
  middleName: z.string().nullable(),

  // Nullable AND optional
  bio: z.string().nullable().optional(),

  // With default value
  role: z.string().default("user"),
});

type User = z.infer<typeof userSchema>;
// type User = {
//   id: number;
//   name: string;
//   email: string;
//   age?: number | undefined;
//   middleName: string | null;
//   bio?: string | null | undefined;
//   role: string;
// }
```

### Nested Objects

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string(),
  country: z.string(),
});

const userWithAddressSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  address: addressSchema, // Nested object
  billingAddress: addressSchema.optional(), // Optional nested
});

type UserWithAddress = z.infer<typeof userWithAddressSchema>;
```

---

## 📚 Arrays & Records

### Arrays

```typescript
// Array of strings
const tagsSchema = z.array(z.string());
type Tags = z.infer<typeof tagsSchema>; // string[]

// Array with constraints
const nonEmptyTagsSchema = z.array(z.string())
  .nonempty("At least one tag is required");

const limitedTagsSchema = z.array(z.string())
  .min(1, "At least one tag")
  .max(5, "Maximum 5 tags");

// Array of objects
const usersSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
  })
);
```

### Records (Dictionaries)

```typescript
// Record with string values
const configSchema = z.record(z.string());
type Config = z.infer<typeof configSchema>; // { [key: string]: string }

// Record with specific value type
const scoresSchema = z.record(z.number());
type Scores = z.infer<typeof scoresSchema>; // { [key: string]: number }

// Record with object values
const usersByIdSchema = z.record(
  z.object({
    name: z.string(),
    email: z.string().email(),
  })
);
```

---

## 🔀 Unions & Enums

### Unions

```typescript
// String literal union
const roleSchema = z.union([
  z.literal("admin"),
  z.literal("user"),
  z.literal("guest"),
]);

// Or use z.enum (simpler for string literals)
const roleSchema2 = z.enum(["admin", "user", "guest"]);
type Role = z.infer<typeof roleSchema2>; // "admin" | "user" | "guest"

// Discriminated unions
const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("click"),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal("keypress"),
    key: z.string(),
  }),
]);

type Event = z.infer<typeof eventSchema>;
// type Event =
//   | { type: "click"; x: number; y: number }
//   | { type: "keypress"; key: string }
```

### Native Enums

```typescript
enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
}

const colorSchema = z.nativeEnum(Color);
type ColorType = z.infer<typeof colorSchema>; // Color
```

---

## ✨ Transformations & Refinements

### Transform

```typescript
// String to number
const stringToNumberSchema = z.string().transform((val) => parseInt(val, 10));

// Date string to Date object
const dateStringSchema = z.string().transform((str) => new Date(str));

// Trim and lowercase
const normalizedEmailSchema = z.string()
  .transform((val) => val.trim().toLowerCase())
  .email();

// Complex transformation
const userInputSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  email: z.string().transform((val) => val.trim().toLowerCase()).email(),
  age: z.string().transform((val) => parseInt(val, 10)),
});

const result = userInputSchema.parse({
  name: "  John Doe  ",
  email: "  JOHN@EXAMPLE.COM  ",
  age: "30",
});
// result = {
//   name: "John Doe",
//   email: "john@example.com",
//   age: 30
// }
```

### Refine (Custom Validation)

```typescript
// Simple refinement
const evenNumberSchema = z.number().refine((n) => n % 2 === 0, {
  message: "Number must be even",
});

// Multiple refinements
const passwordSchema = z.string()
  .min(8)
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  });

// Refinement with multiple fields
const registrationSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Error path
});
```

---

## 🔄 Schema Methods

### Parse vs SafeParse

```typescript
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// parse() - Throws on error
try {
  const user = userSchema.parse({ name: "John", age: "30" });
} catch (error) {
  // ZodError
  console.error(error);
}

// safeParse() - Returns result object (recommended)
const result = userSchema.safeParse({ name: "John", age: "30" });

if (result.success) {
  console.log(result.data); // Typed data
} else {
  console.log(result.error.errors); // Validation errors
}
```

### Partial, Pick, Omit

```typescript
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
});

// Partial - All fields optional
const partialUserSchema = userSchema.partial();
type PartialUser = z.infer<typeof partialUserSchema>;
// { id?: number; name?: string; email?: string; age?: number }

// Pick - Select specific fields
const userNameEmailSchema = userSchema.pick({ name: true, email: true });
type UserNameEmail = z.infer<typeof userNameEmailSchema>;
// { name: string; email: string }

// Omit - Exclude specific fields
const userWithoutIdSchema = userSchema.omit({ id: true });
type UserWithoutId = z.infer<typeof userWithoutIdSchema>;
// { name: string; email: string; age: number }

// Extend - Add new fields
const userWithRoleSchema = userSchema.extend({
  role: z.enum(["admin", "user"]),
});
```

---

## 🎨 Integration with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log(data); // Type-safe and validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} type="email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("password")} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 🌐 API Response Validation

```typescript
import { z } from 'zod';

// Define API response schema
const userApiSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().transform((str) => new Date(str)),
});

const usersApiSchema = z.array(userApiSchema);

// Validate API response
async function fetchUsers() {
  const response = await fetch('/api/users');
  const data = await response.json();

  // Validate and transform
  const users = usersApiSchema.parse(data);
  return users; // Type-safe with Date objects
}

// With error handling
async function fetchUsersSafe() {
  const response = await fetch('/api/users');
  const data = await response.json();

  const result = usersApiSchema.safeParse(data);

  if (!result.success) {
    console.error("API validation failed:", result.error);
    throw new Error("Invalid API response");
  }

  return result.data;
}
```

---

## ✅ Best Practices

### DO ✅

1. **Use type inference** - Let Zod infer TypeScript types
   ```typescript
   const schema = z.object({ name: z.string() });
   type Data = z.infer<typeof schema>; // ✅
   ```

2. **Use safeParse() for user input** - Better error handling
   ```typescript
   const result = schema.safeParse(input);
   if (!result.success) {
     // Handle errors
   }
   ```

3. **Compose schemas** - Reuse common patterns
   ```typescript
   const emailSchema = z.string().email();
   const userSchema = z.object({ email: emailSchema });
   ```

4. **Validate at boundaries** - API responses, user input, external data

5. **Custom error messages** - Provide clear feedback
   ```typescript
   z.string().min(8, "Password must be at least 8 characters")
   ```

6. **Use transform for data normalization**
   ```typescript
   z.string().transform((val) => val.trim().toLowerCase())
   ```

7. **Use refine for complex validation**
   ```typescript
   schema.refine((data) => data.password === data.confirm, {
     message: "Passwords don't match",
     path: ["confirm"],
   })
   ```

### DON'T ❌

1. ❌ **NO** validate everything - Only at boundaries
2. ❌ **NO** use parse() for user input - Use safeParse()
3. ❌ **NO** ignore validation errors - Always handle them
4. ❌ **NO** create duplicate schemas - Compose and reuse
5. ❌ **NO** use any/unknown without validation
6. ❌ **NO** forget to handle async validation errors
7. ❌ **NO** overcomplicate schemas - Keep them simple and focused

---

## 📚 Referencias

- **Zod Docs:** https://zod.dev/
- **Zod GitHub:** https://github.com/colinhacks/zod
- **React Hook Form + Zod:** https://react-hook-form.com/get-started#SchemaValidation
- **TypeScript:** https://www.typescriptlang.org/

---

**Used by:** frontend-builder, component-designer
**Related skills:** frontend/react-hook-form.md, frontend/typescript.md, frontend/react-query.md
