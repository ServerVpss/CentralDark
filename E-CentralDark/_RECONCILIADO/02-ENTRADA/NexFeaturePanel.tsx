import { Activity, Users, Phone, Radio, type LucideIcon } from "lucide-react";
import { NexFeatureBadge } from "./NexFeatureBadge";
import {
  FEATURE_LABEL, STATUS_LABEL,
  type NexFeatureKey, type NexFeatureStatus,
} from "./feature-matrix";
import type { NexChannelKind } from "./types";

const ICONS: Record<NexFeatureKey, LucideIcon> = {
  text: Users, media: Users, templates: Users, buttons: Users,
  delivery_status: Activity,
  stories: Activity,
  groups: Users,
  channels: Radio,
  calls: Phone,
  presence: Activity,
};

const CHANNEL_LABEL: Record<NexChannelKind, string> = {
  meta: "Meta Cloud API",
  multizap_qr: "MultiZap QR",
  wuzapi: "WuzAPI",
  webchat: "Webchat",
};

const EXPLAIN: Record<NexFeatureStatus, string> = {
  supported: "Este recurso está disponível e funcionando neste canal.",
  limited: "Funciona parcialmente neste canal. Alguns detalhes podem variar.",
  meta_only: "Disponível apenas em conexões Meta Cloud API.",
  qr_only: "Disponível apenas em conexões QR / WuzAPI.",
  coming_soon: "Em breve. Ainda não foi implementado para este canal.",
  unsupported: "Não suportado neste canal pelo provider.",
};

export function NexFeaturePanel({
  feature,
  status,
  channel,
}: {
  feature: NexFeatureKey;
  status: NexFeatureStatus;
  channel?: NexChannelKind | null;
}) {
  const Icon = ICONS[feature];
  return (
    <div
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 460, textAlign: "center", display: "flex",
          flexDirection: "column", alignItems: "center", gap: 14,
          padding: 28, borderRadius: 16,
          background: "var(--nx-surface, transparent)",
          border: "1px solid var(--nx-border, transparent)",
        }}
      >
        <div
          style={{
            width: 64, height: 64, borderRadius: 16,
            background: "var(--nx-surface-hover)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--nx-text-muted)",
          }}
        >
          <Icon size={28} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          <NexFeatureBadge status={status} />
          {channel && (
            <span className="nx-badge" data-tone="info">
              {CHANNEL_LABEL[channel]}
            </span>
          )}
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {FEATURE_LABEL[feature]}
        </h3>
        <p style={{ margin: 0, color: "var(--nx-text-muted)", fontSize: 14, lineHeight: 1.5 }}>
          {EXPLAIN[status]}
        </p>
        <p style={{ margin: 0, color: "var(--nx-text-muted)", fontSize: 12, opacity: 0.8 }}>
          {STATUS_LABEL[status]}
        </p>
      </div>
    </div>
  );
}
