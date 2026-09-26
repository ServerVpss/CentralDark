import { MessageCircle } from "lucide-react";

export function NexEmptyState({
  title = "Selecione uma conversa",
  description = "Escolha um atendimento à esquerda para começar a interagir.",
}: { title?: string; description?: string }) {
  return (
    <main className="nx-empty">
      <div className="nx-empty-art">
        <MessageCircle size={64} color="var(--nx-primary)" />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </main>
  );
}
