import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, act, screen, waitFor } from "@testing-library/react";
import React from "react";
import { PageSplash, playSplash } from "@/components/transitions/PageSplash";

describe("PageSplash — disparo via playSplash", () => {
  beforeEach(() => {
    sessionStorage.setItem("__splash_shown_v9__", "1"); // pula splash inicial
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it("não renderiza nada quando ninguém disparou", () => {
    render(<PageSplash />);
    expect(screen.queryByTestId("page-splash")).toBeNull();
  });

  it("dispara o splash quando playSplash() é chamado (simula troca de menu)", async () => {
    render(<PageSplash />);

    act(() => {
      playSplash({ style: "fade", duration: 500, key: "test:menu-click" });
    });

    // Debounce 40ms antes de mostrar
    act(() => {
      vi.advanceTimersByTime(60);
    });

    const el = screen.getByTestId("page-splash");
    expect(el).toBeTruthy();
    expect(el.getAttribute("data-splash-style")).toBe("fade");
  });

  it("coalesce: múltiplos cliques rápidos não cortam a animação pela metade", async () => {
    render(<PageSplash />);

    // 5 cliques em sequência
    act(() => {
      playSplash({ style: "flash", duration: 600 });
      playSplash({ style: "fade", duration: 600 });
      playSplash({ style: "pulse", duration: 600 });
      playSplash({ style: "wipe", duration: 600 });
      playSplash({ style: "flash", duration: 600 });
    });

    act(() => {
      vi.advanceTimersByTime(60);
    });

    // Só uma instância visível (o último estilo, por coalesce do debounce)
    const splashes = screen.getAllByTestId("page-splash");
    expect(splashes).toHaveLength(1);
    expect(splashes[0].getAttribute("data-splash-style")).toBe("flash");
  });
});
