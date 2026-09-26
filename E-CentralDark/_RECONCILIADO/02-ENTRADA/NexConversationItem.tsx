import { motion } from "framer-motion";
import { NexConversation } from "./types";
import { NexChannelBadge, channelFamily } from "./NexChannelBadge";

export function NexConversationItem({
  conv,
  active,
  onSelect,
}: {
  conv: NexConversation;
  active?: boolean;
  onSelect?: (id: string) => void;
}) {
  const initials = conv.contact.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const fam = channelFamily(conv.channel);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.985 }}
      className="nx-item"
      data-active={active}
      data-channel={fam}
      data-waiting={conv.waitingResponse ? "true" : undefined}
      onClick={() => onSelect?.(conv.id)}
      role="button"
    >
      <div className="nx-avatar">
        {conv.contact.avatarUrl ? (
          <img src={conv.contact.avatarUrl} alt={conv.contact.name} />
        ) : (
          initials
        )}
        {conv.contact.isOnline && <span className="nx-avatar-dot" />}
      </div>
      <div className="nx-item-info">
        <div className="nx-item-row">
          <div className="nx-item-name">{conv.contact.name}</div>
          <div className="nx-item-rowright">
            {conv.channel && <NexChannelBadge channel={conv.channel} status={conv.connectionStatus} />}
            <span className="nx-item-time">{conv.lastTime ?? ""}</span>
          </div>
        </div>
        <div className="nx-item-msg">
          <p>{conv.lastMessage ?? "—"}</p>
          {conv.unread && conv.unread > 0 ? (
            <motion.span
              className="nx-unread"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {conv.unread}
            </motion.span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
