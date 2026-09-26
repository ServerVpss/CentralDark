export function NexConversationSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "var(--nx-surface-hover)",
              animation: "nxPulse 1.4s ease-in-out infinite",
            }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                width: "60%",
                height: 10,
                borderRadius: 4,
                background: "var(--nx-surface-hover)",
                animation: "nxPulse 1.4s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: "85%",
                height: 8,
                borderRadius: 4,
                background: "var(--nx-surface-hover)",
                animation: "nxPulse 1.4s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      ))}
      <style>{`@keyframes nxPulse { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }`}</style>
    </div>
  );
}
