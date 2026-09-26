// Matriz de suporte de recursos por provider/canal.
// Visual NexChat permanece igual — esta matriz controla apenas o que
// pode rodar de verdade em cada canal. Use NexFeatureBadge para mostrar.

import type { NexChannelKind } from "./types";

export type NexFeatureStatus =
  | "supported"        // Suportado
  | "limited"          // Limitado
  | "meta_only"        // Apenas Meta
  | "qr_only"          // Apenas QR/WuzAPI
  | "coming_soon"      // Em breve
  | "unsupported";     // Não suportado neste canal

export type NexFeatureKey =
  | "text"
  | "media"
  | "templates"
  | "buttons"
  | "delivery_status"
  | "stories"
  | "groups"
  | "channels"
  | "calls"
  | "presence";

export const FEATURE_LABEL: Record<NexFeatureKey, string> = {
  text: "Mensagens de texto",
  media: "Mídia (imagem, áudio, doc)",
  templates: "Templates aprovados",
  buttons: "Botões interativos",
  delivery_status: "Status de mensagem",
  stories: "Stories / Status do WhatsApp",
  groups: "Grupos",
  channels: "Canais do WhatsApp",
  calls: "Chamadas de voz/vídeo",
  presence: "Presença / digitando",
};

export const STATUS_LABEL: Record<NexFeatureStatus, string> = {
  supported: "Suportado",
  limited: "Limitado",
  meta_only: "Apenas Meta",
  qr_only: "Apenas QR/WuzAPI",
  coming_soon: "Em breve",
  unsupported: "Não suportado neste canal",
};

const META: Record<NexFeatureKey, NexFeatureStatus> = {
  text: "supported",
  media: "supported",
  templates: "supported",
  buttons: "supported",
  delivery_status: "supported",
  stories: "unsupported",
  groups: "unsupported",
  channels: "unsupported",
  // Só se WhatsApp Business Calling API estiver configurada.
  calls: "coming_soon",
  presence: "limited",
};

const QR: Record<NexFeatureKey, NexFeatureStatus> = {
  text: "supported",
  media: "supported",
  templates: "meta_only",
  buttons: "meta_only",
  delivery_status: "limited",
  // Os itens abaixo dependem do que o WuzAPI realmente entrega.
  // Mantemos "coming_soon" até estar implementado e validado.
  stories: "coming_soon",
  groups: "coming_soon",
  channels: "coming_soon",
  calls: "coming_soon",
  presence: "limited",
};

const WEBCHAT: Record<NexFeatureKey, NexFeatureStatus> = {
  text: "supported",
  media: "supported",
  templates: "unsupported",
  buttons: "limited",
  delivery_status: "limited",
  stories: "unsupported",
  groups: "unsupported",
  channels: "unsupported",
  calls: "unsupported",
  presence: "limited",
};

const MATRIX: Record<NexChannelKind, Record<NexFeatureKey, NexFeatureStatus>> = {
  meta: META,
  multizap_qr: QR,
  wuzapi: QR,
  webchat: WEBCHAT,
};

export function getFeatureStatus(
  channel: NexChannelKind | undefined | null,
  feature: NexFeatureKey,
): NexFeatureStatus {
  if (!channel) return "coming_soon";
  return MATRIX[channel][feature];
}

export function isFeatureUsable(status: NexFeatureStatus): boolean {
  return status === "supported" || status === "limited";
}
