import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NexMessage, NexContact } from "./types";
import { NexMessageBubble } from "./NexMessageBubble";

export function NexMessageList({
  messages,
  contact,
  onCopyPix,
  onOpenQr,
  onOpenImage,
}: {
  messages: NexMessage[];
  contact?: NexContact;
  onCopyPix?: (code: string) => void;
  onOpenQr?: (msgId: string) => void;
  onOpenImage?: (url: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);
  return (
    <div ref={ref} className="nx-messages">
      <AnimatePresence initial={false}>
        {messages.map((m, i) => {
          const isContactMsg = m.author === "them";
          const next = messages[i + 1];
          const showAvatar = isContactMsg && (!next || next.author !== "them");
          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <NexMessageBubble
                msg={m}
                contact={contact}
                showAvatar={showAvatar}
                onCopyPix={onCopyPix}
                onOpenQr={onOpenQr}
                onOpenImage={onOpenImage}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
