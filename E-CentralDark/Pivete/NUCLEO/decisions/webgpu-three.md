# DECISAO - webgpu-three.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\expo\skills\building-native-ui\references\webgpu-three.md
**SHA:** 3a247a7740e4bab4
**Timestamp:** 2026-08-26T18:31:13.951677
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- npx expo run:ios

### Ouro Bruto (primeiros 5000 chars)
```
# WebGPU & Three.js for Expo

**Use this skill for ANY 3D graphics, games, GPU compute, or Three.js features in React Native.**

## Locked Versions (Tested & Working)

```json
{
  "react-native-wgpu": "^0.4.1",
  "three": "0.172.0",
  "@react-three/fiber": "^9.4.0",
  "wgpu-matrix": "^3.0.2",
  "@types/three": "0.172.0"
}
```

**Critical:** These versions are tested together. Mismatched versions cause type errors and runtime issues.

## Installation

```bash
npm install react-native-wgpu@^0.4.1 three@0.172.0 @react-three/fiber@^9.4.0 wgpu-matrix@^3.0.2 @types/three@0.172.0 --legacy-peer-deps
```

**Note:** `--legacy-peer-deps` may be required due to peer dependency conflicts with canary Expo versions.

## Metro Configuration

Create `metro.config.js` in project root:

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force 'three' to webgpu build
  if (moduleName.startsWith("three")) {
    moduleName = "three/webgpu";
  }

  // Use standard react-three/fiber instead of React Native version
  if (platform !== "web" && moduleName.startsWith("@react-three/fiber")) {
    return context.resolveRequest(
      {
        ...context,
        unstable_conditionNames: ["module"],
        mainFields: ["module"],
      },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
```

## Required Lib Files

Create these files in `src/lib/`:

### 1. make-webgpu-renderer.ts

```ts
import type { NativeCanvas } from "react-native-wgpu";
import * as THREE from "three/webgpu";

export class ReactNativeCanvas {
  constructor(private canvas: NativeCanvas) {}

  get width() {
    return this.canvas.width;
  }
  get height() {
    return this.canvas.height;
  }
  set width(width: number) {
    this.canvas.width = width;
  }
  set height(height: number) {
    this.canvas.height = height;
  }
  get clientWidth() {
    return this.canvas.width;
  }
  get clientHeight() {
    return this.canvas.height;
  }
  set clientWidth(width: number) {
    this.canvas.width = width;
  }
  set clientHeight(height: number) {
    this.canvas.height = height;
  }

  addEventListener(_type: string, _listener: EventListener) {}
  removeEventListener(_type: string, _listener: EventListener) {}
  dispatchEvent(_event: Event) {}
  setPointerCapture() {}
  releasePointerCapture() {}
}

export const makeWebGPURenderer = (
  context: GPUCanvasContext,
  { antialias = true }: { antialias?: boolean } = {}
) =>
  new THREE.WebGPURenderer({
    antialias,
    // @ts-expect-error
    canvas: new ReactNativeCanvas(context.canvas),
    context,
  });
```

### 2. fiber-canvas.tsx

```tsx
import * as THREE from "three/webgpu";
import React, { useEffect, useRef } from "react";
import type { ReconcilerRoot, RootState } from "@react-three/fiber";
import {
  extend,
  createRoot,
  unmountComponentAtNode,
  events,
} from "@react-three/fiber";
import type { ViewProps } from "react-native";
import { PixelRatio } from "react-native";
import { Canvas, type CanvasRef } from "react-native-wgpu";

import {
  makeWebGPURenderer,
  ReactNativeCanvas,
} from "@/lib/make-webgpu-renderer";

// Extend THREE namespace for R3F - add all components you use
extend({
  AmbientLight: THREE.AmbientLight,
  DirectionalLight: THREE.DirectionalLight,
  PointLight: THREE.PointLight,
  SpotLight: THREE.SpotLight,
  Mesh: THREE.Mesh,
  Group: THREE.Group,
  Points: THREE.Points,
  BoxGeometry: THREE.BoxGeometry,
  SphereGeometry: THREE.SphereGeometry,
  CylinderGeometry: THREE.CylinderGeometry,
  ConeGeometry: THREE.ConeGeometry,
  DodecahedronGeometry: THREE.DodecahedronGeometry,
  BufferGeometry: THREE.BufferGeometry,
  BufferAttribute: THREE.BufferAttribute,
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  MeshBasicMaterial: THREE.MeshBasicMaterial,
  PointsMaterial: THREE.PointsMaterial,
  PerspectiveCamera: THREE.PerspectiveCamera,
  Scene: THREE.Scene,
});

interface FiberCanvasProps {
  children: React.ReactNode;
  style?: ViewProps["style"];
  camera?: THREE.PerspectiveCamera;
  scene?: THREE.Scene;
}

export const FiberCanvas = ({
  children,
  style,
  scene,
  camera,
}: FiberCanvasProps) => {
  const root = useRef<ReconcilerRoot<OffscreenCanvas>>(null!);
  const canvasRef = useRef<CanvasRef>(null);

  useEffect(() => {
    const context = canvasRef.current!.getContext("webgpu")!;
    const renderer = makeWebGPURenderer(context);

    // @ts-expect-error - ReactNativeCanvas wraps native canvas
    const canvas = new ReactNativeCanvas(context.canvas) as HTMLCanvasElement;
    canvas.width = canvas.clientWidth * PixelRatio.get();
    canvas.height = canvas.clientHeight * PixelRatio.get();
    const size = {
      top: 0,
      left: 0,
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    };

    if (!root.current) {
      root.current = createRoot(canv
```