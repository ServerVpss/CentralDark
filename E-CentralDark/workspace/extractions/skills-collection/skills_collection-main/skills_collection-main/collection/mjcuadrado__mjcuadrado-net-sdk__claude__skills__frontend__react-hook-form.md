---
name: react-hook-form
description: Performant form state management with uncontrolled components and validation
version: 0.1.0
tags: [frontend, react, forms, validation, react-hook-form]
---

# React Hook Form

React Hook Form es una biblioteca para gestión de formularios en React con validación performante y mínimos re-renders.

## 🎯 Overview

**Por qué React Hook Form en mj2:**
- **Performance:** Uncontrolled components, mínimos re-renders
- **Developer experience:** API simple e intuitiva
- **Validation:** Integración nativa con Zod, Yup, Joi
- **TypeScript:** Soporte completo de tipos
- **Small bundle:** ~9KB (minified + gzipped)
- **No dependencies:** Excepto React
- **Built-in features:** Errores, touched, dirty, validation modes

---

## 📦 Setup Básico

```bash
npm install react-hook-form
npm install @hookform/resolvers zod  # Para validación con Zod
```

**package.json:**
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0"
  }
}
```

---

## 🚀 Basic Usage

### Simple Form

```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

export function BasicForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} placeholder="First name" />

      <input {...register("lastName")} placeholder="Last name" />

      <input {...register("email")} type="email" placeholder="Email" />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### With Built-in Validation

```typescript
export function FormWithValidation() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register("firstName", {
            required: "First name is required",
            minLength: {
              value: 2,
              message: "First name must be at least 2 characters",
            },
          })}
          placeholder="First name"
        />
        {errors.firstName && <span>{errors.firstName.message}</span>}
      </div>

      <div>
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          type="email"
          placeholder="Email"
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## ✨ Integration with Zod

### Basic Zod Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register("email")} type="email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <input {...register("password")} type="password" />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### Complex Zod Schema

```typescript
const registrationSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),

  email: z.string().email("Invalid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  confirmPassword: z.string(),

  age: z.number()
    .int("Age must be an integer")
    .min(18, "Must be at least 18 years old")
    .max(120, "Invalid age"),

  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} />
      {errors.username && <span>{errors.username.message}</span>}

      <input {...register("email")} type="email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register("password")} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <input {...register("confirmPassword")} type="password" />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <input {...register("age", { valueAsNumber: true })} type="number" />
      {errors.age && <span>{errors.age.message}</span>}

      <label>
        <input {...register("terms")} type="checkbox" />
        I accept the terms and conditions
      </label>
      {errors.terms && <span>{errors.terms.message}</span>}

      <button type="submit">Register</button>
    </form>
  );
}
```

---

## 🎛️ Form State Management

### Default Values

```typescript
const {
  register,
  handleSubmit,
} = useForm<FormData>({
  defaultValues: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  },
});

// Async default values
const {
  register,
  handleSubmit,
} = useForm<FormData>({
  defaultValues: async () => {
    const response = await fetch('/api/user/profile');
    return response.json();
  },
});
```

### Watch Values

```typescript
export function FormWithWatch() {
  const { register, watch } = useForm<FormData>();

  // Watch single field
  const email = watch("email");

  // Watch multiple fields
  const [firstName, lastName] = watch(["firstName", "lastName"]);

  // Watch all fields
  const allValues = watch();

  return (
    <div>
      <input {...register("firstName")} />
      <input {...register("lastName")} />
      <input {...register("email")} />

      <p>Email: {email}</p>
      <p>Full name: {firstName} {lastName}</p>
    </div>
  );
}
```

### Reset Form

```typescript
export function FormWithReset() {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Reset to default values
    reset();

    // Reset to specific values
    reset({
      firstName: "",
      lastName: "",
      email: "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
      <button type="submit">Submit</button>
      <button type="button" onClick={() => reset()}>Reset</button>
    </form>
  );
}
```

---

## 🎯 Field Arrays

### Dynamic Fields

```typescript
import { useForm, useFieldArray } from 'react-hook-form';

interface FormData {
  users: {
    name: string;
    email: string;
  }[];
}

export function FieldArrayForm() {
  const { register, control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      users: [{ name: "", email: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...register(`users.${index}.name` as const)}
            placeholder="Name"
          />

          <input
            {...register(`users.${index}.email` as const)}
            type="email"
            placeholder="Email"
          />

          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ name: "", email: "" })}
      >
        Add User
      </button>

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 🎨 Integration with Material UI

```typescript
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof schema>;

export function MuiForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="First Name"
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      <Button type="submit" variant="contained">
        Submit
      </Button>
    </form>
  );
}
```

---

## 🔄 Validation Modes

```typescript
const { register } = useForm<FormData>({
  mode: "onSubmit", // Default - validate on submit

  mode: "onBlur", // Validate on blur

  mode: "onChange", // Validate on every change

  mode: "onTouched", // Validate after blur, then on change

  mode: "all", // Validate on both blur and change
});
```

---

## 🎭 Custom Validation

### Custom Async Validation

```typescript
const schema = z.object({
  username: z.string()
    .min(3)
    .refine(async (username) => {
      // Check if username is available
      const response = await fetch(`/api/check-username?username=${username}`);
      const { available } = await response.json();
      return available;
    }, {
      message: "Username is already taken",
    }),
});
```

### Custom Field Validation

```typescript
export function FormWithCustomValidation() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("age", {
          validate: {
            positive: (value) => value > 0 || "Age must be positive",
            lessThan120: (value) => value < 120 || "Invalid age",
            integer: (value) => Number.isInteger(value) || "Age must be an integer",
          },
        })}
        type="number"
      />
      {errors.age && <span>{errors.age.message}</span>}
    </form>
  );
}
```

---

## 📊 Form State

```typescript
export function FormWithState() {
  const {
    register,
    handleSubmit,
    formState: {
      errors,           // Validation errors
      isDirty,          // Form has been modified
      isValid,          // Form is valid
      isSubmitting,     // Form is being submitted
      isSubmitted,      // Form has been submitted
      isSubmitSuccessful, // Last submit was successful
      touchedFields,    // Fields that have been touched
      dirtyFields,      // Fields that have been modified
      submitCount,      // Number of times form was submitted
    },
  } = useForm<FormData>({
    mode: "onChange", // Required for isDirty and isValid
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />

      <button
        type="submit"
        disabled={!isDirty || !isValid || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>

      {isSubmitSuccessful && <p>Form submitted successfully!</p>}
    </form>
  );
}
```

---

## 🎯 Error Handling

### Display Errors

```typescript
export function FormWithErrors() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Set custom error
      setError("email", {
        type: "manual",
        message: "Email is already registered",
      });

      // Set root error
      setError("root", {
        type: "manual",
        message: "Server error, please try again",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      {errors.root && (
        <div style={{ color: "red" }}>
          {errors.root.message}
        </div>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## ✅ Best Practices

### DO ✅

1. **Use Zod for validation** - Type-safe schemas with React Hook Form
   ```typescript
   const { register } = useForm({
     resolver: zodResolver(schema),
   });
   ```

2. **Use TypeScript** - Type your form data
   ```typescript
   type FormData = z.infer<typeof schema>;
   const { register } = useForm<FormData>();
   ```

3. **Use Controller for MUI/custom components**
   ```typescript
   <Controller name="field" control={control} render={...} />
   ```

4. **Use mode for UX** - Choose appropriate validation mode
   ```typescript
   useForm({ mode: "onTouched" })
   ```

5. **Handle async errors** - Use setError for server errors

6. **Use defaultValues** - Initialize form with data

7. **Disable submit when invalid**
   ```typescript
   <button disabled={!isValid || isSubmitting}>
   ```

### DON'T ❌

1. ❌ **NO** use controlled components for simple inputs - Use uncontrolled with register
2. ❌ **NO** forget error messages - Always display validation errors
3. ❌ **NO** validate on every keystroke - Use onTouched or onBlur for better UX
4. ❌ **NO** ignore isSubmitting - Disable button during submission
5. ❌ **NO** use inline validation logic - Use Zod schemas
6. ❌ **NO** forget to reset form after submit
7. ❌ **NO** mix controlled and uncontrolled - Be consistent

---

## 📚 Referencias

- **React Hook Form Docs:** https://react-hook-form.com/
- **Zod Integration:** https://react-hook-form.com/get-started#SchemaValidation
- **MUI Integration:** https://react-hook-form.com/get-started#IntegratingwithUIlibraries
- **TypeScript:** https://react-hook-form.com/ts

---

**Used by:** frontend-builder, component-designer
**Related skills:** frontend/zod.md, frontend/react.md, frontend/mui.md, frontend/typescript.md
