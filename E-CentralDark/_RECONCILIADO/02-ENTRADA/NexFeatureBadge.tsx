import type { NexFeatureStatus } from "./feature-matrix";
import { STATUS_LABEL } from "./feature-matrix";

const TONE: Record<NexFeatureStatus, string> = {
  supported: "success",
  limited: "warn",
  meta_only: "info",
  qr_only: "info",
  coming_soon: "warn",
  unsupported: "danger",
};

export function NexFeatureBadge({
  status,
  label,
}: {
  status: NexFeatureStatus;
  label?: string;
}) {
  return (
    <span className="nx-badge" data-tone={TONE[status]} title={STATUS_LABEL[status]}>
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}
