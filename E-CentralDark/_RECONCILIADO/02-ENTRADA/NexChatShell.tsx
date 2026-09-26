import { ReactNode } from "react";
import "./styles/nexchat.css";

/**
 * Shell raiz do tema NexChat. Aplica a classe de escopo `.nexchat-root` que
 * isola todos os estilos do tema do resto do app MultiZap.
 *
 * Quando `chatOpen=true` (mobile com conversa aberta), adiciona
 * `nx-shell-chat-open`: o bottom nav some e o chat fica fullscreen, igual ao
 * print verde do template NexChat.
 */
export function NexChatShell({
  children,
  chatOpen = false,
}: {
  children: ReactNode;
  chatOpen?: boolean;
}) {
  return (
    <div className="nexchat-root h-full w-full">
      <div className={`nx-shell${chatOpen ? " nx-shell-chat-open" : ""}`}>{children}</div>
    </div>
  );
}
