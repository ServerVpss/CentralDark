// Provedores globais do app, agrupados em um único lugar.
// Ordem importa: cada provedor mais interno depende dos externos.
import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/compartilhado/ui/toaster";
import { Toaster as Sonner } from "@/compartilhado/ui/sonner";
import { TooltipProvider } from "@/compartilhado/ui/tooltip";
import { AuthProvider } from "@/compartilhado/auth/AuthProvider";
import { ThemeProvider } from "@/compartilhado/theme/ThemeProvider";
import { ApprovalProvider } from "@/compartilhado/aprovacao/ApprovalProvider";
import { GlobalSearch } from "@/funcionalidades/telepainel/components/search/GlobalSearch";
import { ViewAsBanner } from "@/compartilhado/auth/ViewAsBanner";
import { PageSplash } from "@/compartilhado/transitions/PageSplash";
import { SplashController } from "@/compartilhado/transitions/SplashController";
import { queryClient, CHAVE_STORAGE_TEMA } from "./configuracao";

export function ProvedoresApp({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey={CHAVE_STORAGE_TEMA}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ApprovalProvider>
                <GlobalSearch />
                <ViewAsBanner />
                <PageSplash />
                <SplashController />
                {children}
              </ApprovalProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
