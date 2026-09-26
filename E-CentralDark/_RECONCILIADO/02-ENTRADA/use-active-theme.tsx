import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getActiveTheme } from "@/lib/master-theme.functions";

type ThemeMode = "current" | "nexchat";
type ThemeState = { mode: ThemeMode; enabled: boolean; isLoading: boolean };

const Ctx = createContext<ThemeState>({ mode: "current", enabled: false, isLoading: false });

export function MultiZapThemeProvider({ children }: { children: ReactNode }) {
  const fn = useServerFn(getActiveTheme);
  const q = useQuery({
    queryKey: ["active-theme"],
    queryFn: () => fn(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const value: ThemeState = {
    mode: q.data?.mode ?? "current",
    enabled: q.data?.enabled ?? false,
    isLoading: q.isLoading,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActiveTheme() {
  return useContext(Ctx);
}

/** Helper: aplica classe raiz quando o tema Nex está ativo */
export function useNexChatRootClass() {
  const { mode } = useActiveTheme();
  return mode === "nexchat" ? "nexchat-root" : "";
}
