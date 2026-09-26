import { createFileRoute } from "@tanstack/react-router";
import { ChatbotFlowEditor } from "@/components/chatbot/ChatbotFlowEditor";

export const Route = createFileRoute("/app/chatbot/$flowId/editor")({
  component: () => {
    const { flowId } = Route.useParams();
    return <ChatbotFlowEditor flowId={flowId} scope="workspace" />;
  },
});
