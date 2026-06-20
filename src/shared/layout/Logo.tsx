import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * TelePanel logo — emerald gradient lightning bolt with glow.
 * Uses CSS HSL tokens so it adapts to theme changes automatically.
 */
export function Logo({ className, size = 36 }: LogoProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Glow halo - reduzido */}
      <div
        className="absolute inset-0 rounded-2xl blur-sm opacity-20"
        style={{ background: "var(--gradient-gold)" }}
      />

      {/* Logo container */}
      <div
        className="relative flex items-center justify-center rounded-2xl shadow-sm"
        style={{
          width: size,
          height: size,
          background: "var(--gradient-gold)",
          boxShadow: "0 2px 8px hsl(var(--primary) / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.15)",
        }}
      >
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-bolt" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(0 0% 100%)" />
              <stop offset="100%" stopColor="hsl(0 0% 100% / 0.85)" />
            </linearGradient>
          </defs>
          {/* Lightning bolt — symbol of speed + money */}
          <path
            d="M13.5 2L4 14h7l-1.5 8L19 10h-7l1.5-8z"
            fill="url(#logo-bolt)"
            stroke="hsl(0 0% 100%)"
            strokeWidth="0.5"
            strokeLinejoin="round"
            filter="drop-shadow(0 1px 2px hsl(165 30% 4% / 0.3))"
          />
        </svg>
      </div>
    </div>
  );
}
