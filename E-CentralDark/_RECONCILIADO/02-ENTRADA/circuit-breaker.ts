// Circuit Breaker em memória, padrão closed → open → half-open.
// Útil pra proteger chamadas a APIs externas (Meta Cloud, IA, etc.) — quando
// muitas falhas acontecem em sequência, o breaker abre e respostas são
// curto-circuitadas até passar o cooldown, voltando como half-open pra testar
// recuperação.
//
// IMPORTANTE: em ambiente serverless edge (Cloudflare Workers), o estado vive
// apenas dentro da instância atual do worker. Pra estado compartilhado entre
// invocações, use o cooldown persistido em `whatsapp_rate_state` (já existente).
// Esse utilitário é útil dentro de uma única request (várias chamadas em loop)
// ou em workers de longa duração (campanhas em lote).

export type CircuitState = "closed" | "open" | "half-open";

export type CircuitBreakerOptions = {
  failureThreshold: number;       // qtd de falhas seguidas pra abrir
  cooldownMs: number;             // tempo aberto antes de testar half-open
  halfOpenSuccessThreshold: number; // sucessos em half-open pra fechar
};

export class CircuitBreaker {
  private failures = 0;
  private successes = 0;
  private state: CircuitState = "closed";
  private openedAt = 0;

  constructor(private readonly options: CircuitBreakerOptions) {}

  canProceed(): boolean {
    if (this.state === "closed") return true;
    if (this.state === "open") {
      const cooledDown = Date.now() - this.openedAt >= this.options.cooldownMs;
      if (cooledDown) {
        this.state = "half-open";
        this.successes = 0;
        return true;
      }
      return false;
    }
    return true; // half-open: deixa passar pra testar
  }

  recordSuccess(): void {
    this.failures = 0;
    if (this.state === "half-open") {
      this.successes += 1;
      if (this.successes >= this.options.halfOpenSuccessThreshold) {
        this.state = "closed";
        this.successes = 0;
      }
    }
  }

  recordFailure(): void {
    this.failures += 1;
    if (this.state === "half-open" || this.failures >= this.options.failureThreshold) {
      this.state = "open";
      this.openedAt = Date.now();
      this.successes = 0;
    }
  }

  snapshot() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      openedAt: this.openedAt,
    };
  }
}

// Breaker default pra Meta Cloud API (compartilhado dentro da instância worker).
// 5 falhas seguidas → abre por 60s; 2 sucessos em half-open → fecha.
export const metaCloudBreaker = new CircuitBreaker({
  failureThreshold: 5,
  cooldownMs: 60_000,
  halfOpenSuccessThreshold: 2,
});
