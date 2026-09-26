import { NexChannelKind, NexConnectionStatus } from "./types";

const CHANNEL_LABEL: Record<NexChannelKind, string> = {
  meta: "Meta",
  multizap_qr: "QR",
  wuzapi: "QR",
  webchat: "Web",
};

/** Mapeia o canal pra "família" usada na coloração do card / badge. */
export function channelFamily(channel?: NexChannelKind): "meta" | "qr" | "web" | undefined {
  if (!channel) return undefined;
  if (channel === "meta") return "meta";
  if (channel === "webchat") return "web";
  return "qr";
}

export function NexChannelBadge({
  channel,
  status: _status,
  className,
}: {
  channel: NexChannelKind;
  status?: NexConnectionStatus;
  className?: string;
}) {
  const fam = channelFamily(channel) ?? "qr";
  return (
    <span
      className={`nx-channel-pill${className ? ` ${className}` : ""}`}
      data-channel={fam}
      title={`Canal: ${CHANNEL_LABEL[channel]}`}
    >
      {CHANNEL_LABEL[channel]}
    </span>
  );
}
