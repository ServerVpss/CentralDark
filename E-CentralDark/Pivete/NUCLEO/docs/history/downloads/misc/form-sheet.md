# OUTRO - form-sheet.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\expo\skills\building-native-ui\references\form-sheet.md
**SHA:** 947de9cf35a15aac
**Timestamp:** 2026-08-26T18:31:25.067468
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 12,

### Ouro Bruto (primeiros 5000 chars)
```
# Form Sheets in Expo Router

This skill covers implementing form sheets with footers using Expo Router's Stack navigator and react-native-screens.

## Overview

Form sheets are modal presentations that appear as a card sliding up from the bottom of the screen. They're ideal for:

- Quick actions and confirmations
- Settings panels
- Login/signup flows
- Action sheets with custom content

**Requirements:**

- Expo Router Stack navigator

## Basic Usage

### Form Sheet with Footer

Configure the Stack.Screen with transparent backgrounds and sheet presentation:

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="about"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.25],
          headerTransparent: true,
          contentStyle: { backgroundColor: "transparent" },
          sheetGrabberVisible: true,
        }}
      >
        <Stack.Header style={{ backgroundColor: "transparent" }}></Stack.Header>
      </Stack.Screen>
    </Stack>
  );
}
```

### Form Sheet Screen Content

> Requires Expo SDK 55 or later.

Use `flex: 1` to allow the content to fill available space, enabling footer positioning:

```tsx
// app/about.tsx
import { View, Text, StyleSheet } from "react-native";

export default function AboutSheet() {
  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.content}>
        <Text>Sheet Content</Text>
      </View>

      {/* Footer - stays at bottom */}
      <View style={styles.footer}>
        <Text>Footer Content</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
  },
});
```

### Formsheet with interactive content below

Use `sheetLargestUndimmedDetentIndex` (zero-indexed) to keep content behind the form sheet interactive — e.g. letting users pan a map beneath it. Setting it to `1` allows interaction at the first two detents but dims on the third.

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="info-sheet"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.2, 0.5, 1.0],
          sheetLargestUndimmedDetentIndex: 1,
          /* other options */
        }}
      />
    </Stack>
  )
}
```

## Key Options

| Option                | Type       | Description                                                 |
| --------------------- | ---------- | ----------------------------------------------------------- |
| `presentation`        | `string`   | Set to `'formSheet'` for sheet presentation                 |
| `sheetGrabberVisible` | `boolean`  | Shows the drag handle at the top of the sheet               |
| `sheetAllowedDetents` | `number[]` | Array of detent heights (0-1 range, e.g., `[0.25]` for 25%) |
| `headerTransparent`   | `boolean`  | Makes header background transparent                         |
| `contentStyle`        | `object`   | Style object for the screen content container               |
| `title`               | `string`   | Screen title (set to `''` for no title)                     |

## Common Detent Values

- `[0.25]` - Quarter sheet (compact actions)
- `[0.5]` - Half sheet (medium content)
- `[0.75]` - Three-quarter sheet (detailed forms)
- `[0.25, 0.5, 1]` - Multiple stops (expandable sheet)

## Complete Example

```tsx
// _layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen
        name="confirm"
        options={{
          contentStyle: { backgroundColor: "transparent" },
          presentation: "formSheet",
          title: "",
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.25],
          headerTransparent: true,
        }}
      >
        <Stack.Header style={{ backgroundColor: "transparent" }}>
          <Stack.Header.Right />
        </Stack.Header>
      </Stack.Screen>
    </Stack>
  );
}
```

```tsx
// app/confirm.tsx
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function ConfirmSheet() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Action</Text>
        <Text style={styles.description}>
          Are you sure you want to proceed?
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.co
```