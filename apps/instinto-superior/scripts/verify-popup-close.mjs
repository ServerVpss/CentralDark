// Same owner: UI popup close contract. Read-only regression checks.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "src", "components");
const source = (name) => readFileSync(join(root, name), "utf8");

test("a single reusable red X controls popup visuals", () => {
  const button = source("ui/popup-close-button.tsx");
  assert.match(button, /text-red-400/);
  assert.match(button, /absolute right-3 top-3/);
  assert.match(button, /data-cd-control="popup-close"/);
  assert.match(button, /aria-label/);
  assert.match(button, /focus-visible:ring-2/);
});

test("Dialog, Sheet and Drawer reuse the red X through their native Close primitive", () => {
  for (const [file, primitive] of [
    ["ui/dialog.tsx", "DialogPrimitive.Close"],
    ["ui/sheet.tsx", "SheetPrimitive.Close"],
    ["ui/drawer.tsx", "DrawerPrimitive.Close"],
  ]) {
    const content = source(file);
    assert.match(content, /import \{ PopupCloseButton \}/);
    assert.ok(content.includes("<" + primitive + " asChild>"), file);
    assert.match(content, /<PopupCloseButton/);
  }
});

test("Jarvis uses identical close button, not a duplicated button style", () => {
  const player = source("central/PlayerLocalJarvis.tsx");
  assert.match(player, /<PopupCloseButton aria-label="Fechar painel Ouvir PC" onClick=\{onClose\}/);
  assert.doesNotMatch(player, /<X aria-hidden="true"/);
  const cockpit = source("central/CockpitShell.tsx");
  assert.match(cockpit, /\[&>button\]:hidden/);
  assert.match(cockpit, /bg-transparent/);
});

test("Jarvis audio sends and receives independently without changing role", () => {
  const player = source("central/PlayerLocalJarvis.tsx");
  assert.match(player, /useState\(\(\) => crypto\.randomUUID\(\)\)/);
  assert.match(player, /const listeningRef = useRef\(false\)/);
  assert.match(player, /const sendingRef = useRef\(false\)/);
  assert.match(player, /if \(!listeningRef\.current\) return/);
  assert.match(player, /if \(!sendingRef\.current \|\| !stream/);
  assert.match(player, /\}, \[peerId\]\)/);
  assert.match(player, /Parar de ouvir/);
  assert.match(player, /Parar de enviar/);
  assert.match(player, /audio\.srcObject = stream/);
  assert.match(player, /getDisplayMedia\(\{ video: true, audio: true \}\)/);
  assert.match(player, /echoCancellation: !isLoopback/);
  assert.doesNotMatch(player, /setRole\(/);
  assert.doesNotMatch(player, /shared\.getVideoTracks\(\)\.forEach\(\(track\) => track\.stop\(\)\)/);
});

test("confirmation dialogs keep explicit cancellation semantics", () => {
  const confirmation = source("ui/alert-dialog.tsx");
  assert.doesNotMatch(confirmation, /PopupCloseButton/);
  assert.match(confirmation, /AlertDialogCancel/);
});
