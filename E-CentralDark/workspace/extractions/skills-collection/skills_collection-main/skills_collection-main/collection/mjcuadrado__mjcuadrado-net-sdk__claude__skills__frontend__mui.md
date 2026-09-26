---
name: mui
description: Material UI v6 component library and theming for React applications
version: 0.1.0
tags: [frontend, mui, material-ui, components, theming, design-system]
---

# Material UI v6

Material UI es una biblioteca de componentes React que implementa Material Design de Google.

## 🎯 Overview

**Por qué MUI en mj2:**
- **Component Library:** 100+ componentes listos para usar
- **Material Design:** Diseño consistente y profesional
- **Customization:** Theming completo y personalizable
- **Accessibility:** ARIA compliant por defecto
- **TypeScript:** Soporte completo para TypeScript
- **Responsive:** Mobile-first y responsive

---

## 📦 Installation

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material  # Icons
```

---

## 🎨 Basic Setup

**App.tsx:**
```typescript
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Button variant="contained">Hello World</Button>
    </ThemeProvider>
  );
}
```

---

## 🧩 Common Components

### Button

```typescript
import Button from '@mui/material/Button';

<Button variant="contained">Contained</Button>
<Button variant="outlined">Outlined</Button>
<Button variant="text">Text</Button>

<Button color="primary">Primary</Button>
<Button color="secondary">Secondary</Button>
<Button color="error">Error</Button>

<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

<Button startIcon={<SaveIcon />}>Save</Button>
<Button disabled>Disabled</Button>
```

### TextField

```typescript
import TextField from '@mui/material/TextField';

<TextField label="Email" variant="outlined" />
<TextField label="Password" type="password" />
<TextField label="Name" required error helperText="Required field" />
<TextField label="Multiline" multiline rows={4} />
```

### Card

```typescript
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

<Card>
  <CardContent>
    <Typography variant="h5">Title</Typography>
    <Typography variant="body2">Content</Typography>
  </CardContent>
  <CardActions>
    <Button size="small">Action</Button>
  </CardActions>
</Card>
```

### Grid Layout

```typescript
import Grid from '@mui/material/Grid';

<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Item 1</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Item 2</Card>
  </Grid>
</Grid>
```

---

## 🎨 Theming

```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // 'light' | 'dark'
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
  },
  spacing: 8, // 1 unit = 8px
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});
```

---

## 📱 Responsive Design

```typescript
import { useTheme, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '50%', md: '33%' },
        padding: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </Box>
  );
}
```

---

## 🎭 sx Prop (Styling)

```typescript
import Box from '@mui/material/Box';

<Box
  sx={{
    bgcolor: 'primary.main',
    color: 'white',
    p: 2,           // padding: theme.spacing(2)
    m: 1,           // margin: theme.spacing(1)
    borderRadius: 1,
    '&:hover': {
      bgcolor: 'primary.dark',
    },
  }}
>
  Styled Box
</Box>
```

---

## 📋 Forms with React Hook Form

```typescript
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface FormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        rules={{ required: 'Email is required' }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />
      <Button type="submit" variant="contained">Submit</Button>
    </form>
  );
}
```

---

## ✅ Best Practices

### DO ✅
1. **Use ThemeProvider** - Theming consistente
2. **sx prop** - Styling inline con theme access
3. **Responsive breakpoints** - xs, sm, md, lg, xl
4. **Icons from @mui/icons-material**
5. **CssBaseline** - Reset CSS consistente

### DON'T ❌
1. ❌ NO mezclar inline styles con sx
2. ❌ NO importar todo MUI: import '@mui/material'
3. ❌ NO ignorar a11y warnings

---

**Used by:** frontend-builder, component-designer
**Related skills:** frontend/react.md, frontend/typescript.md, frontend/vite.md
