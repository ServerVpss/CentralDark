export function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export async function installPushToTalkShortcut(onToggle: () => void): Promise<() => Promise<void>> {
  if (!isTauri()) return async () => undefined;
  const { register, unregister } = await import("@tauri-apps/plugin-global-shortcut");
  const shortcut = "CommandOrControl+Shift+Space";
  await register(shortcut, (event) => {
    if (event.state === "Pressed") onToggle();
  });
  return () => unregister(shortcut);
}
