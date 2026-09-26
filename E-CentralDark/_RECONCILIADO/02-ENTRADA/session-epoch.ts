// Contador global de "época" de sessão.
// Incrementa toda vez que o usuário logado muda (login, logout, troca).
// Hooks de dados sensíveis ao usuário capturam o valor no início da request
// e descartam a resposta se a época já avançou — assim respostas atrasadas
// de um usuário anterior nunca pintam a tela do novo usuário.

let epoch = 0;
const listeners = new Set<() => void>();

export function getSessionEpoch(): number {
  return epoch;
}

export function bumpSessionEpoch(): number {
  epoch += 1;
  listeners.forEach((fn) => {
    try { fn(); } catch { /* ignora handler quebrado */ }
  });
  return epoch;
}

export function subscribeSessionEpoch(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Erro lançado quando a resposta chegou tarde demais e deve ser ignorada.
export class StaleSessionError extends Error {
  constructor() {
    super("Resposta descartada: sessão mudou durante a requisição.");
    this.name = "StaleSessionError";
  }
}

// Helper pra usar dentro de queryFn / handler async.
// Chame depois de cada await: se a época mudou, lança StaleSessionError.
export function assertSameEpoch(startEpoch: number): void {
  if (startEpoch !== epoch) throw new StaleSessionError();
}
