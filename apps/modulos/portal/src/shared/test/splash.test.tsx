import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { PageSplash, playSplash } from "@/shared/transitions/PageSplash";

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
    const { container } = render(<PageSplash />);
    expect(container.querySelector('[data-testid="page-splash"]')).toBeNull();
  });

  it("dispara o splash quando playSplash() é chamado (simula troca de menu)", () => {
    const { container } = render(<PageSplash />);

    act(() => {
      playSplash({ style: "fade", duration: 500, key: "test:menu-click" });
    });
    act(() => {
      vi.advanceTimersByTime(60); // passa o debounce de 40ms
    });

    const el = container.querySelector('[data-testid="page-splash"]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute("data-splash-style")).toBe("fade");
  });

  it("coalesce: cliques rápidos não acumulam splashes nem cortam pela metade", () => {
    const { container } = render(<PageSplash />);

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

    const splashes = container.querySelectorAll('[data-testid="page-splash"]');
    expect(splashes).toHaveLength(1);
    // Por coalesce, vence o último dispatch dentro do debounce.
    expect(splashes[0].getAttribute("data-splash-style")).toBe("flash");
  });
});
