/**
 * Integração Pagamentos — MultiZap Bot
 * 
 * Gateway de pagamentos: PIX, boleto, cartão.
 * Gerencia transações, cobranças e confirmações.
 * 
 * Funcionalidades:
 * - Gerar chave PIX estática
 * - Criar cobrança
 * - Confirmar pagamento (manual ou automático)
 * - Histórico de transações (ledger)
 */

export interface PixTransaction {
  id: string;
  workspaceId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'expired' | 'refunded';
  pixKey: string;
  createdAt: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
}

// Placeholder — implementação via Supabase tables:
// pix_transactions, pix_static_keys, payment_gateways,
// payment_collection_events, cash_ledger
export async function listTransactions(workspaceId: string): Promise<PixTransaction[]> {
  return [];
}

export async function createPixCharge(workspaceId: string, amount: number): Promise<PixTransaction | null> {
  return null;
}

export async function confirmPayment(transactionId: string): Promise<{ ok: boolean }> {
  return { ok: false };
}
